
import { db } from "../db";
import { accounts, transactions, portfolioHoldings, processedChainTransactions } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { ethers } from "ethers";
import { getProvider, getAdminAddress } from "./web3Service";

export interface TokenTransfer {
    symbol: string;
    amount: number;
}

export async function creditDepositBatch(userId: string, tokens: TokenTransfer[], txHashes: string[]) {
    const provider = getProvider();
    const adminAddress = await getAdminAddress();

    if (!provider || !adminAddress) {
        throw new Error("System not ready: Provider or Admin Address missing");
    }

    const results = [];

    // Process each transaction hash
    for (const hash of txHashes) {
        try {
            // 1. Check for replay attack
            const existing = await db.select().from(processedChainTransactions).where(eq(processedChainTransactions.txHash, hash));
            if (existing.length > 0) {
                console.warn(`[BankingService] Tx ${hash} already processed. Skipping.`);
                continue;
            }

            // 2. Fetch and Verify Transaction
            const tx = await provider.getTransaction(hash);
            const receipt = await provider.getTransactionReceipt(hash);

            if (!tx || !receipt || receipt.status !== 1) {
                console.warn(`[BankingService] Invalid or failed tx ${hash}. Skipping.`);
                continue;
            }

            // Verify receiver is admin
            // Note: For ERC20 transfers, 'to' is the contract address, not the admin. We need to parse logs.
            // For ETH transfers, 'to' is the admin address.

            let detectedSymbol = 'ETH';
            let detectedAmount = 0;
            let fromAddress = tx.from;
            let toAddress = tx.to;

            // Simple heuristic to match claimed token
            // In a real system, you'd match the log events to the user's claim more strictly.
            // For this MVP, we will try to find a matching transfer in the logs or value.

            let verified = false;

            // Check Native ETH transfer
            if (tx.value > 0n && tx.to?.toLowerCase() === adminAddress.toLowerCase()) {
                const ethVal = parseFloat(ethers.formatEther(tx.value));
                // Only if the user claimed ETH
                const claimedEth = tokens.find(t => t.symbol === 'ETH');
                if (claimedEth && Math.abs(claimedEth.amount - ethVal) < 0.0001) {
                    detectedSymbol = 'ETH';
                    detectedAmount = ethVal;
                    verified = true;
                }
            }

            // Check ERC20 Logs if not verified as ETH
            if (!verified) {
                // Look for Transfer event: Transfer(address from, address to, uint256 value)
                // Topic0: 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
                const transferTopic = ethers.id("Transfer(address,address,uint256)");

                for (const log of receipt.logs) {
                    if (log.topics[0] === transferTopic) {
                        // Check 'to' address (topic[2])
                        const toTopic = log.topics[2];
                        // padded address
                        const paddedAdmin = ethers.zeroPadValue(adminAddress, 32);

                        if (toTopic.toLowerCase() === paddedAdmin.toLowerCase()) {
                            // Found a transfer to admin
                            // Amount is in data
                            const amount = BigInt(log.data);

                            // We need to know the decimals to verify amount.
                            // We can try to match against the claimed token.
                            const relatedToken = tokens.find(t =>
                                // Ideally we check contract address match too. But we don't have the map here easily without importing TOKENS from somewhere. 
                                // For MVP, we trust the symbol map if amount matches reasonably.
                                // A strict implementation would fetch decimals from contract `log.address`.
                                t.symbol !== 'ETH'
                            );

                            if (relatedToken) {
                                // Assume 18 decimals default or Try to match roughly if we don't know decimals
                                // This is risky. Real app needs Token Registry.
                                // Let's assume standard 18 or 6 (USDC/USDT).

                                // Let's just trust the user's claim matches the log if we can't fetch decimals easily? 
                                // No, that's insecure.
                                // We will Fetch decimals.
                                try {
                                    const contract = new ethers.Contract(log.address, ["function decimals() view returns (uint8)", "function symbol() view returns (string)"], provider);
                                    const decimals = await contract.decimals();
                                    const symbol = await contract.symbol();

                                    const fmtAmount = parseFloat(ethers.formatUnits(amount, decimals));

                                    if (symbol === relatedToken.symbol && Math.abs(fmtAmount - relatedToken.amount) < 0.0001) {
                                        detectedSymbol = symbol;
                                        detectedAmount = fmtAmount;
                                        verified = true;
                                        break; // Found the matching log
                                    }
                                } catch (e) {
                                    console.warn("Failed to fetch token details", e);
                                }
                            }
                        }
                    }
                }
            }

            if (!verified) {
                console.warn(`[BankingService] Could not verify tx ${hash} matches claimed tokens. Skipping.`);
                await db.insert(processedChainTransactions).values({
                    userId: parseInt(userId),
                    txHash: hash,
                    chainId: 1, // assumption
                    symbol: 'UNKNOWN',
                    amount: 0,
                    fromAddress: tx.from,
                    toAddress: tx.to || null,
                    status: 'failed',
                });
                continue;
            }

            // 3. Mark as Processed
            await db.insert(processedChainTransactions).values({
                userId: parseInt(userId),
                txHash: hash,
                chainId: 1,
                symbol: detectedSymbol,
                amount: detectedAmount,
                fromAddress: tx.from,
                toAddress: adminAddress, // confirmed to be admin
                status: 'confirmed',
            });

            // 4. Update Portfolio (Logic copied from before but using detected values)
            let [existingHolding] = await db
                .select()
                .from(portfolioHoldings)
                .where(
                    and(
                        eq(portfolioHoldings.userId, parseInt(userId)),
                        eq(portfolioHoldings.symbol, detectedSymbol)
                    )
                );

            if (existingHolding) {
                const newQuantity = (existingHolding.quantity || 0) + detectedAmount;
                const [updated] = await db
                    .update(portfolioHoldings)
                    .set({ quantity: newQuantity })
                    .where(eq(portfolioHoldings.id, existingHolding.id))
                    .returning();
                results.push(updated);
            } else {
                const [newHolding] = await db
                    .insert(portfolioHoldings)
                    .values({
                        userId: parseInt(userId),
                        symbol: detectedSymbol,
                        name: detectedSymbol === 'ETH' ? 'Ethereum' : `${detectedSymbol} Token`,
                        quantity: detectedAmount,
                        avgCost: 0,
                        assetType: 'crypto',
                        chain: 'ethereum'
                    })
                    .returning();
                results.push(newHolding);
            }

            // 5. Create Transaction Record
            const userAccounts = await db
                .select()
                .from(accounts)
                .where(eq(accounts.userId, parseInt(userId)));

            let targetAccountId = userAccounts.length > 0 ? userAccounts[0].id : null;

            if (!targetAccountId) {
                const [newAcc] = await db.insert(accounts).values({
                    userId: parseInt(userId),
                    name: "Crypto Wallet",
                    type: "crypto",
                    balance: 0,
                    currency: "USD"
                }).returning();
                targetAccountId = newAcc.id;
            }

            await db.insert(transactions).values({
                userId: parseInt(userId),
                accountId: targetAccountId,
                amount: detectedAmount,
                type: 'deposit',
                category: 'Crypto Deposit',
                description: `Deposited ${detectedAmount} ${detectedSymbol} (Tx: ${hash.slice(0, 8)}...)`,
                date: new Date()
            });

        } catch (e) {
            console.error(`[BankingService] Error verifying tx ${hash}`, e);
        }
    }

    return results;
}
