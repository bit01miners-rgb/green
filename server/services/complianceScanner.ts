import { storage } from "../storage";
import { db } from "../db";
import { complianceAlerts, users } from "@shared/schema";
import { eq } from "drizzle-orm";

interface ScanResult {
    riskScore: number;
    dailyVolume: number;
    alerts: {
        type: string;
        severity: "low" | "medium" | "high" | "critical";
        message: string;
    }[];
}

export async function scanUserActivity(userId: number): Promise<ScanResult> {
    const [user, transactions, accounts] = await Promise.all([
        storage.getUser(userId),
        storage.getTransactions(userId),
        storage.getAccounts(userId),
    ]);

    if (!user) return { riskScore: 0, dailyVolume: 0, alerts: [] };

    const alerts: ScanResult["alerts"] = [];
    let riskScore = 0;

    // 1. Velocity Check (High frequency trading/transfers)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const recentTx = transactions.filter((t) => new Date(t.date) > oneDayAgo);
    if (recentTx.length > 20) {
        alerts.push({
            type: "velocity_high",
            severity: "high",
            message: `Unusual transaction velocity: ${recentTx.length} transactions in 24h`,
        });
        riskScore += 20;
    } else if (recentTx.length > 10) {
        alerts.push({
            type: "velocity_medium",
            severity: "medium",
            message: `Elevated transaction velocity: ${recentTx.length} transactions in 24h`,
        });
        riskScore += 10;
    }

    // 2. Volume Check (> $10k in 24h which triggers AML reporting)
    const dailyVolume = recentTx.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    if (dailyVolume >= 10000) {
        alerts.push({
            type: "volume_aml",
            severity: "high",
            message: `Daily transaction volume $${dailyVolume.toFixed(2)} exceeds AML reporting threshold ($10k)`,
        });
        riskScore += 30;
    }

    // 3. Structuring Detection (Smurfing - multiple tx just below $10k)
    const structuringTx = recentTx.filter(
        (t) => Math.abs(t.amount) >= 9000 && Math.abs(t.amount) < 10000
    );
    if (structuringTx.length >= 1) {
        alerts.push({
            type: "structuring_suspected",
            severity: "critical",
            message: "Potential structuring detected: Transactions just below reporting threshold",
        });
        riskScore += 40;
    }

    // 4. Large Transaction (Single tx > $5k)
    const largeTx = recentTx.find((t) => Math.abs(t.amount) > 5000);
    if (largeTx) {
        alerts.push({
            type: "large_transaction",
            severity: "medium",
            message: "Large single transaction detected > $5,000",
        });
        riskScore += 15;
    }

    // 5. Round Number Detection (Often associated with money laundering)
    const roundTx = recentTx.filter((t) => Math.abs(t.amount) % 100 === 0 && Math.abs(t.amount) > 100);
    if (roundTx.length > 3) {
        alerts.push({
            type: "round_numbers",
            severity: "low",
            message: "Multiple round number transactions detected",
        });
        riskScore += 5;
    }

    // 6. Rapid Movement (In and Out quickly)
    // Check if deposits match withdrawals within short window
    const inflows = recentTx.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const outflows = recentTx.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

    if (inflows > 1000 && outflows > 1000 && Math.abs(inflows - outflows) < inflows * 0.1) {
        alerts.push({
            type: "layering_rapid_flow",
            severity: "medium",
            message: "Rapid flow-through of funds detected (Layering pattern)",
        });
        riskScore += 25;
    }

    // 7. Dormant Account Awareness
    const accountAgeMonths = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30);

    // 8. New Account High Velocity (Risk)
    if (accountAgeMonths < 1 && recentTx.length > 50) {
        alerts.push({
            type: "new_account_velocity",
            severity: "high",
            message: "New account showing excessive activity immediately",
        });
        riskScore += 25;
    }

    return { riskScore: Math.min(100, riskScore), dailyVolume, alerts };
}

export async function runComplianceJob() {
    const allUsers = await db.select().from(users);
    console.log(`Scanning ${allUsers.length} users for compliance check...`);
}
