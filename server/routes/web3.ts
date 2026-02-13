
import { Router, Request, Response } from "express";
import { getAdminAddress } from "../services/web3Service";

const router = Router();

// GET /api/web3/admin-address
router.get("/admin-address", async (req: Request, res: Response) => {
    try {
        const address = await getAdminAddress();
        if (!address) {
            return res.status(503).json({ error: "Admin wallet not configured" });
        }
        return res.json({ address });
    } catch (error) {
        console.error("Web3 admin address error:", error);
        return res.status(500).json({ error: "Failed to fetch admin address" });
    }
});

export default router;
