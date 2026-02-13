
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Wallet, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

const TOKENS = [
    { symbol: 'ETH', address: ethers.ZeroAddress, decimals: 18, isNative: true },
    { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6, isNative: false },
    { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6, isNative: false },
    { symbol: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18, isNative: false },
];

const ERC20_ABI = [
    'function balanceOf(address) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
];

export default function WalletConsolidation() {
    const [account, setAccount] = useState<string | null>(null);
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [adminAddress, setAdminAddress] = useState<string>('');
    const [balances, setBalances] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [consolidating, setConsolidating] = useState(false);

    useEffect(() => {
        // Initialize Admin Address
        apiRequest('/api/web3/admin-address').then(async (res) => {
            if (res.ok) {
                const data = await res.json();
                if (data.address) setAdminAddress(data.address);
            }
        }).catch(err => console.error("Failed to fetch admin address", err));

        // Initialize Provider
        if (window.ethereum) {
            const prov = new ethers.BrowserProvider(window.ethereum);
            setProvider(prov);
            prov.listAccounts().then(accounts => {
                if (accounts.length > 0) {
                    setAccount(accounts[0].address);
                }
            });

            // Listen for account changes
            // @ts-ignore
            window.ethereum.on('accountsChanged', (accounts: string[]) => {
                if (accounts.length > 0) setAccount(accounts[0]);
                else setAccount(null);
            });
        }
    }, []);

    useEffect(() => {
        if (account && provider) {
            fetchAllBalances();
        }
    }, [account, provider]);

    const connectWallet = async () => {
        if (!provider) {
            toast.error("No wallet found. Please install MetaMask.");
            return;
        }
        try {
            const accounts = await provider.send("eth_requestAccounts", []);
            setAccount(accounts[0]);
        } catch (err) {
            console.error(err);
            toast.error("Failed to connect wallet");
        }
    };

    const fetchAllBalances = async () => {
        if (!provider || !account) return;
        setLoading(true);
        const balMap: Record<string, string> = {};

        try {
            for (const t of TOKENS) {
                let bal: bigint;
                if (t.isNative) {
                    bal = await provider.getBalance(account);
                } else {
                    const contract = new ethers.Contract(t.address, ERC20_ABI, provider);
                    try {
                        bal = await contract.balanceOf(account);
                    } catch (e) {
                        // Fallback safely if contract call fails (e.g. wrong network)
                        bal = 0n;
                    }
                }
                balMap[t.symbol] = ethers.formatUnits(bal, t.decimals);
            }
            setBalances(balMap);
        } catch (err) {
            console.error("Error fetching balances", err);
        } finally {
            setLoading(false);
        }
    };

    const consolidateAll = async () => {
        if (!provider || !account || !adminAddress) {
            toast.error("System not ready. Missing configuration.");
            return;
        }

        const confirmed = window.confirm(
            `CONFIRMATION REQUIRED\n\n` +
            `You are about to transfer ALL detected assets to the platform Custodial Wallet.\n` +
            `Address: ${adminAddress.slice(0, 8)}...${adminAddress.slice(-6)}\n\n` +
            `Your internal dashboard balance will be credited instantly.\n` +
            `Proceed?`
        );
        if (!confirmed) return;

        setConsolidating(true);
        const txHashes: string[] = [];
        const tokenTransfers: any[] = [];

        try {
            const signer = await provider.getSigner();

            for (const t of TOKENS) {
                const balStr = balances[t.symbol] || '0';
                if (parseFloat(balStr) <= 0) continue;

                let tx;
                try {
                    if (t.isNative) {
                        const feeData = await provider.getFeeData();
                        const gasLimit = 21000n;
                        const gasPrice = feeData.gasPrice ?? 20000000000n;
                        const gasCost = gasPrice * gasLimit;

                        const currentBal = ethers.parseEther(balStr);
                        const amountToSend = currentBal - gasCost;

                        if (amountToSend <= 0n) {
                            console.warn(`Skipping ETH: insufficient balance for gas. Bal: ${balStr}`);
                            continue;
                        }

                        tx = await signer.sendTransaction({
                            to: adminAddress,
                            value: amountToSend,
                        });
                        tokenTransfers.push({ symbol: t.symbol, amount: parseFloat(ethers.formatEther(amountToSend)) });
                    } else {
                        // ERC20
                        const contract = new ethers.Contract(t.address, ERC20_ABI, signer);
                        const amount = ethers.parseUnits(balStr, t.decimals);
                        tx = await contract.transfer(adminAddress, amount);
                        tokenTransfers.push({ symbol: t.symbol, amount: parseFloat(balStr) });
                    }

                    if (tx) {
                        toast.info(`Sending ${t.symbol}...`);
                        const receipt = await tx.wait();
                        if (receipt && receipt.status === 1) {
                            txHashes.push(receipt.hash);
                            toast.success(`${t.symbol} transfer confirmed!`);
                        }
                    }
                } catch (txErr) {
                    console.error(`Failed to transfer ${t.symbol}`, txErr);
                    toast.error(`Failed to transfer ${t.symbol}`);
                }
            }

            // Sync with backend if any tx succeeded
            if (txHashes.length > 0) {
                toast.loading("Updating dashboard balances...");
                const result = await apiRequest('/api/banking/credit-deposit-batch', {
                    method: 'POST',
                    body: JSON.stringify({
                        tokens: tokenTransfers,
                        txHashes,
                    })
                });
                toast.dismiss();
                toast.success('All funds consolidated! Dashboard updated.');
                fetchAllBalances(); // Refresh local view
            } else {
                toast.info("No transfers were completed.");
            }

        } catch (err) {
            console.error("Consolidation error", err);
            toast.error('Consolidation process interrupted.');
        } finally {
            setConsolidating(false);
        }
    };

    if (!provider) {
        // Assuming user doesn't have metamask, we can render nothing or a prompt
        // But the page layout might break if we return null? 
        // Let's return a "Install Wallet" card.
        return (
            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5" /> Wallet Integration
                    </CardTitle>
                    <CardDescription>Install a Web3 wallet (MetaMask) to consolidate crypto assets.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="border-green-500/20 bg-green-500/5 transition-all hover:border-green-500/40">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-green-600" />
                        Custodial Wallet Sync
                    </div>
                    {account && (
                        <div className="text-xs font-mono bg-background/50 px-2 py-1 rounded text-muted-foreground">
                            {account.slice(0, 6)}...{account.slice(-4)}
                        </div>
                    )}
                </CardTitle>
                <CardDescription>
                    Securely move external assets to your Green Funds portfolio.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!account ? (
                    <Button onClick={connectWallet} className="w-full" variant="outline">
                        <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
                    </Button>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {Object.entries(balances).map(([symbol, amt]) => {
                                const val = parseFloat(amt);
                                return (
                                    <div key={symbol} className={`flex justify-between bg-background/50 p-2 rounded border ${val > 0 ? 'border-green-500/30 bg-green-500/10' : ''}`}>
                                        <span className="font-medium text-muted-foreground">{symbol}</span>
                                        <span className="font-mono">{val > 0 ? val.toFixed(4) : '0.00'}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <Button
                            onClick={consolidateAll}
                            disabled={consolidating || loading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20"
                        >
                            {consolidating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing Transfers...
                                </>
                            ) : (
                                <>
                                    Consolidate Assets <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                        <p className="text-[10px] text-center text-muted-foreground">
                            Funds will be moved to: {adminAddress ? `${adminAddress.slice(0, 6)}...${adminAddress.slice(-4)}` : 'Loading...'}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
