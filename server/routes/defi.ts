import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { getCoinPrice } from "../services/marketData";

const router = Router();

// GET /api/defi/wallets
router.get("/wallets", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const wallets = await storage.getWalletConnections(userId);
    return res.json(wallets);
  } catch (error) {
    console.error("Get wallets error:", error);
    return res.status(500).json({ error: "Failed to fetch wallets" });
  }
});

// POST /api/defi/wallets
router.post("/wallets", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const { address, chain, label } = req.body;

    if (!address || !chain) {
      return res.status(400).json({ error: "Missing required fields: address, chain" });
    }

    const wallet = await storage.createWalletConnection({
      userId,
      address,
      chain,
      label: label || null,
    });

    return res.status(201).json(wallet);
  } catch (error) {
    console.error("Create wallet error:", error);
    return res.status(500).json({ error: "Failed to connect wallet" });
  }
});

// DELETE /api/defi/wallets/:id
router.delete("/wallets/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteWalletConnection(id);
    return res.json({ message: "Wallet disconnected" });
  } catch (error) {
    console.error("Delete wallet error:", error);
    return res.status(500).json({ error: "Failed to disconnect wallet" });
  }
});

// GET /api/defi/positions
router.get("/positions", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const positions = await storage.getDefiPositions(userId);
    return res.json(positions);
  } catch (error) {
    console.error("Get positions error:", error);
    return res.status(500).json({ error: "Failed to fetch positions" });
  }
});

// POST /api/defi/positions
router.post("/positions", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const { protocol, poolName, chain, depositedAmount, currentValue, apy } = req.body;

    if (!protocol || !poolName || !chain) {
      return res.status(400).json({ error: "Missing required fields: protocol, poolName, chain" });
    }

    const position = await storage.createDefiPosition({
      userId,
      protocol,
      poolName,
      chain,
      depositedAmount: (depositedAmount || 0).toString(),
      currentValue: (currentValue || depositedAmount || 0).toString(),
      apy: (apy || 0).toString(),
    });

    return res.status(201).json(position);
  } catch (error) {
    console.error("Create position error:", error);
    return res.status(500).json({ error: "Failed to create position" });
  }
});

// GET /api/defi/pools - fetch from DeFi Llama
router.get("/pools", async (_req: Request, res: Response) => {
  try {
    const response = await fetch("https://yields.llama.fi/pools");
    if (!response.ok) {
      throw new Error(`DeFi Llama API error: ${response.status}`);
    }

    const data = await response.json();

    // Return top 50 pools by TVL
    const pools = (data.data || [])
      .sort((a: { tvlUsd: number }, b: { tvlUsd: number }) => (b.tvlUsd || 0) - (a.tvlUsd || 0))
      .slice(0, 50)
      .map((pool: Record<string, unknown>) => ({
        pool: pool.pool,
        chain: pool.chain,
        project: pool.project,
        symbol: pool.symbol,
        tvlUsd: pool.tvlUsd,
        apy: pool.apy,
        apyBase: pool.apyBase,
        apyReward: pool.apyReward,
        stablecoin: pool.stablecoin,
      }));

    return res.json(pools);
  } catch (error) {
    console.error("DeFi pools error:", error);
    return res.status(500).json({ error: "Failed to fetch DeFi pools" });
  }
});

// GET /api/defi/prices
router.get("/prices", async (req: Request, res: Response) => {
  try {
    const ids = (req.query.ids as string) || "ethereum,bitcoin";
    const prices = await getCoinPrice(ids);
    return res.json(prices);
  } catch (error) {
    console.error("Get prices error:", error);
    return res.status(500).json({ error: "Failed to fetch prices" });
  }
});

export default router;
