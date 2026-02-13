import { Router } from "express";
import { db } from "../db";
import { privacyDeposits } from "../../shared/schema-extensions";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

const router = Router();

router.post("/deposit", async (req, res) => {
    // Simulate deposit to smart contract logic
    const { amount, asset, note } = req.body;

    // In a real mixer, the note would be a ZK-proof commitment.
    // Here we just store the note and amount to verify withdrawal.

    // We do NOT store userId to maintain privacy (or we might strictly for compliance logs but separate from the pool logic)
    // For this demo, we'll just insert into our mock table.
    try {
        await db.insert(privacyDeposits).values({
            amount,
            asset,
            note, // The "secret" key
            isSpent: false,
        });
        res.json({ success: true, message: "Deposit successful" });
    } catch (error) {
        res.status(500).json({ error: "Deposit failed" });
    }
});

router.post("/withdraw", async (req, res) => {
    const { note, recipient } = req.body;

    try {
        // 1. Verify note exists and is unspent
        const deposit = await db.select().from(privacyDeposits).where(eq(privacyDeposits.note, note)).limit(1);

        if (deposit.length === 0) {
            return res.status(400).json({ error: "Invalid note" });
        }

        if (deposit[0].isSpent) {
            return res.status(400).json({ error: "Note already spent (Double spend detected)" });
        }

        // 2. Mark as spent
        await db.update(privacyDeposits)
            .set({ isSpent: true })
            .where(eq(privacyDeposits.id, deposit[0].id));

        // 3. Trigger transfer to recipient (Mock)
        // In real life: call blockchain capability

        res.json({ success: true, message: `Funds (${deposit[0].amount} ${deposit[0].asset}) withdrawn to ${recipient}` });

    } catch (error) {
        res.status(500).json({ error: "Withdrawal failed" });
    }
});

export default router;
