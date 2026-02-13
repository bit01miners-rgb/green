import { getCoinPrice } from "../marketData";
import { storage } from "../../storage";

interface OptimizationSuggestion {
    action: "Deposit" | "Repay" | "Borrow More" | "Do Nothing";
    asset: string;
    amount: number;
    reason: string;
    projectedHealthFactor: number;
}

export async function optimizeCollateral(userId: number): Promise<{
    currentHealthFactor: number;
    totalCollateralUSD: number;
    totalDebtUSD: number;
    suggestions: OptimizationSuggestion[];
}> {
    // 1. Fetch User Data
    const accounts = await storage.getAccounts(userId);
    const loans = await storage.getLoans(userId);

    // 2. Calculate Total Collateral & Debt in USD
    let totalCollateralUSD = 0;
    let totalDebtUSD = 0;

    // Mock mapping of asset IDs for CoinGecko
    // In real app, we'd have this in DB
    const assetMap: Record<string, string> = {
        "ETH": "ethereum",
        "BTC": "bitcoin",
        "SOL": "solana",
        "USDC": "usd-coin"
    };

    // Get current prices
    // Optimized: fetch all needed prices in one go
    const assetIds = Object.values(assetMap).join(",");
    const prices = await getCoinPrice(assetIds);

    for (const acc of accounts) {
        // Determine asset type from account type/name or mock it
        // For this demo, let's assume "Savings" = USDC, "Trading" = ETH
        const assetId = acc.type === "Savings" ? "usd-coin" : "ethereum";
        const price = prices[assetId]?.usd || 1;
        totalCollateralUSD += Number(acc.balance) * price; // Simplified: Assuming 1:1 for balance unit
    }

    for (const loan of loans) {
        if (loan.status === "active") {
            totalDebtUSD += Number(loan.balance || loan.principal);
        }
    }

    // 3. Calculate Health Factor
    // Health Factor = (Collateral * LiquidationThreshold) / Debt
    // We'll assume a generic Liquidation Threshold of 0.8
    const liquidationThreshold = 0.8;
    const currentHealthFactor = totalDebtUSD > 0
        ? (totalCollateralUSD * liquidationThreshold) / totalDebtUSD
        : 999; // Infinite if no debt

    const suggestions: OptimizationSuggestion[] = [];

    // 4. Generate Suggestions
    if (currentHealthFactor < 1.0) {
        // Emergency: Liquidation imminent
        const deficit = (totalDebtUSD / liquidationThreshold) - totalCollateralUSD;
        suggestions.push({
            action: "Deposit",
            asset: "USDC",
            amount: deficit * 1.05, // Suggest 5% buffer
            reason: "Health Factor < 1.0! Liquidation Risk.",
            projectedHealthFactor: 1.1
        });
    } else if (currentHealthFactor < 1.5) {
        // Warning zone
        suggestions.push({
            action: "Repay",
            asset: "USDC",
            amount: totalDebtUSD * 0.2,
            reason: "Health Factor low. Repay 20% debt to improve safety.",
            projectedHealthFactor: currentHealthFactor * 1.25 // Estimate
        });
    } else if (currentHealthFactor > 3.0) {
        // Inefficient capital
        suggestions.push({
            action: "Borrow More",
            asset: "USDC",
            amount: totalCollateralUSD * 0.1,
            reason: "High Health Factor. You can safely borrow more capital.",
            projectedHealthFactor: 2.5
        });
    } else {
        suggestions.push({
            action: "Do Nothing",
            asset: "-",
            amount: 0,
            reason: "Portfolio is healthy and optimized.",
            projectedHealthFactor: currentHealthFactor
        });
    }

    return {
        currentHealthFactor,
        totalCollateralUSD,
        totalDebtUSD,
        suggestions
    };
}
