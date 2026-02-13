import { Router } from "express";
import { scanArbitrageOpportunities } from "../services/ai/arbitrage";

const router = Router();

// GET /api/defi/arbitrage
router.get("/arbitrage", async (req, res) => {
  try {
    const opportunities = await scanArbitrageOpportunities();
    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ error: "Failed to scan for arbitrage" });
  }
});

// POST /api/defi/flash-loan
router.post("/flash-loan", async (req, res) => {
  try {
    const { executeFlashLoan } = await import("../services/defi/flashLoan");
    const result = await executeFlashLoan(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Flash loan failed" });
  }
});

export default router;
