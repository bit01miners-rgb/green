import { Router } from "express";
import { db } from "../db";
import { p2pOffers } from "../../shared/schema-extensions";
import { eq } from "drizzle-orm";

const router = Router();

// Get all active offers
router.get("/offers", async (req, res) => {
    try {
        const offers = await db.select().from(p2pOffers).where(eq(p2pOffers.status, "active"));
        res.json(offers);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch offers" });
    }
});

// Create an offer
router.post("/offers", async (req, res) => {
    // Cast to any to bypass TS check for isAuthenticated/user which are added by passport
    if (!(req as any).isAuthenticated()) return res.status(401).send("Unauthorized");

    try {
        const newOffer = await db.insert(p2pOffers).values({
            userId: (req as any).user!.id,
            ...req.body,
            status: "active"
        }).returning();
        res.json(newOffer[0]);
    } catch (error) {
        res.status(500).json({ error: "Failed to create offer" });
    }
});

export default router;
