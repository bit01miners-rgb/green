import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { getTopCoins, getCoinPrice, getCoinChart, getTrending } from "../services/marketData";

const router = Router();

// GET /api/trading/portfolio
router.get("/portfolio", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const holdings = await storage.getHoldings(userId);

    // Fetch current prices for all holdings
    const symbols = holdings.map((h) => h.symbol.toLowerCase());
    let prices: Record<string, { usd: number; usd_24h_change?: number }> = {};

    if (symbols.length > 0) {
      try {
        prices = await getCoinPrice(symbols.join(","));
      } catch {
        // If price fetch fails, return holdings without live prices
      }
    }

    const enrichedHoldings = holdings.map((h) => {
      const priceData = prices[h.symbol.toLowerCase()];
      const currentPrice = priceData?.usd || 0;
      const quantity = h.quantity || 0;
      const avgCost = h.avgCost || 0;

      return {
        ...h,
        currentPrice,
        currentValue: (currentPrice * quantity).toFixed(2),
        totalCost: (avgCost * quantity).toFixed(2),
        pnl: ((currentPrice - avgCost) * quantity).toFixed(2),
        pnlPercent: avgCost > 0 ? (((currentPrice - avgCost) / avgCost) * 100).toFixed(2) : "0",
        change24h: priceData?.usd_24h_change?.toFixed(2) || "0",
      };
    });

    return res.json(enrichedHoldings);
  } catch (error) {
    console.error("Get portfolio error:", error);
    return res.status(500).json({ error: "Failed to fetch portfolio" });
  }
});

// POST /api/trading/portfolio
router.post("/portfolio", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const { symbol, name, quantity, avgCost, assetType, chain } = req.body;

    if (!symbol || !quantity || !avgCost) {
      return res.status(400).json({ error: "Missing required fields: symbol, quantity, avgCost" });
    }

    const holding = await storage.createHolding({
      userId,
      symbol,
      name: name || symbol,
      quantity: Number(quantity),
      avgCost: Number(avgCost),
      assetType: assetType || "crypto",
      chain: chain || null,
    });

    return res.status(201).json(holding);
  } catch (error) {
    console.error("Create holding error:", error);
    return res.status(500).json({ error: "Failed to create holding" });
  }
});

// DELETE /api/trading/portfolio/:id
router.delete("/portfolio/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteHolding(id);
    return res.json({ message: "Holding deleted" });
  } catch (error) {
    console.error("Delete holding error:", error);
    return res.status(500).json({ error: "Failed to delete holding" });
  }
});

// GET /api/trading/watchlist
router.get("/watchlist", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const items = await storage.getWatchlist(userId);
    return res.json(items);
  } catch (error) {
    console.error("Get watchlist error:", error);
    return res.status(500).json({ error: "Failed to fetch watchlist" });
  }
});

// POST /api/trading/watchlist
router.post("/watchlist", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const { symbol, assetType } = req.body;

    if (!symbol) {
      return res.status(400).json({ error: "Missing required field: symbol" });
    }

    const item = await storage.addToWatchlist({
      userId,
      symbol,
      assetType: assetType || "crypto",
    });

    return res.status(201).json(item);
  } catch (error) {
    console.error("Add to watchlist error:", error);
    return res.status(500).json({ error: "Failed to add to watchlist" });
  }
});

// DELETE /api/trading/watchlist/:id
router.delete("/watchlist/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await storage.removeFromWatchlist(id);
    return res.json({ message: "Removed from watchlist" });
  } catch (error) {
    console.error("Remove from watchlist error:", error);
    return res.status(500).json({ error: "Failed to remove from watchlist" });
  }
});

// GET /api/trading/market/overview
router.get("/market/overview", async (_req: Request, res: Response) => {
  try {
    const [topCoins, trending] = await Promise.all([
      getTopCoins(20),
      getTrending(),
    ]);

    return res.json({ topCoins, trending });
  } catch (error) {
    console.error("Market overview error:", error);
    return res.status(500).json({ error: "Failed to fetch market overview" });
  }
});

// GET /api/trading/market/:symbol
router.get("/market/:symbol", async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const days = parseInt((req.query.days as string) || "7");

    const [price, chart] = await Promise.all([
      getCoinPrice(symbol),
      getCoinChart(symbol, days),
    ]);

    return res.json({ price: price[symbol], chart });
  } catch (error) {
    console.error("Market symbol error:", error);
    return res.status(500).json({ error: "Failed to fetch market data" });
  }
});

export default router;
