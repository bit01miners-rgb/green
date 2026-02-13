import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { processChat } from "../services/aiAdvisor";
import { predictSpending } from "../services/spendingPredictor";
import { calculateCreditScore } from "../services/riskScoring";
import { getMarketSignals } from "../services/marketAnalysis";

const router = Router();

// POST /api/ai/chat
router.post("/chat", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Missing required field: message" });
    }

    // Save user message
    await storage.addChatMessage({
      userId,
      role: "user",
      message,
    });

    // Generate response
    const response = await processChat(message, userId);

    // Save assistant response
    await storage.addChatMessage({
      userId,
      role: "assistant",
      message: response,
    });

    return res.json({ response });
  } catch (error) {
    console.error("AI chat error:", error);
    return res.status(500).json({ error: "Failed to process chat message" });
  }
});

// GET /api/ai/chat/history
router.get("/chat/history", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const history = await storage.getChatHistory(userId);
    return res.json(history);
  } catch (error) {
    console.error("Get chat history error:", error);
    return res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

// GET /api/ai/insights
router.get("/insights", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [thisMonthTxns, lastMonthTxns, budgetList, goals] = await Promise.all([
      storage.getTransactions(userId, { startDate: startOfMonth.toISOString() }),
      storage.getTransactions(userId, {
        startDate: startOfLastMonth.toISOString(),
        endDate: startOfMonth.toISOString(),
      }),
      storage.getBudgets(userId),
      storage.getSavingsGoals(userId),
    ]);

    // Calculate spending by category
    const categorySpending: Record<string, number> = {};
    for (const tx of thisMonthTxns) {
      if (tx.type === "expense" || tx.type === "debit") {
        const cat = tx.category || "Other";
        categorySpending[cat] = (categorySpending[cat] || 0) + Math.abs(tx.amount || 0);
      }
    }

    // Compare with last month
    const lastMonthTotal = lastMonthTxns
      .filter((tx) => tx.type === "expense" || tx.type === "debit")
      .reduce((sum, tx) => sum + Math.abs(tx.amount || 0), 0);

    const thisMonthTotal = Object.values(categorySpending).reduce((a, b) => a + b, 0);
    const spendingChange = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

    // Check budget alerts
    const budgetAlerts = budgetList
      .map((b) => {
        const spent = categorySpending[b.category] || 0;
        const limit = b.amountLimit || 0;
        const utilization = limit > 0 ? (spent / limit) * 100 : 0;
        return {
          category: b.category,
          spent: spent.toFixed(2),
          limit: limit.toFixed(2),
          utilization: utilization.toFixed(1),
          status: utilization >= 100 ? "exceeded" : utilization >= 80 ? "warning" : "on_track",
        };
      })
      .filter((b) => b.status !== "on_track");

    // Savings progress
    const savingsProgress = goals.map((g) => {
      const current = g.currentAmount || 0;
      const target = g.targetAmount || 1;
      return {
        name: g.name,
        progress: ((current / target) * 100).toFixed(1),
        remaining: (target - current).toFixed(2),
      };
    });

    const insights = [];
    if (spendingChange > 10) {
      insights.push(`Your spending is up ${spendingChange.toFixed(0)}% compared to last month.`);
    } else if (spendingChange < -10) {
      insights.push(`Great job! You've reduced spending by ${Math.abs(spendingChange).toFixed(0)}% this month.`);
    }

    for (const alert of budgetAlerts) {
      if (alert.status === "exceeded") {
        insights.push(`Budget exceeded for ${alert.category}: $${alert.spent} of $${alert.limit} (${alert.utilization}%)`);
      } else {
        insights.push(`Approaching budget limit for ${alert.category}: $${alert.spent} of $${alert.limit} (${alert.utilization}%)`);
      }
    }

    return res.json({
      spendingChange: spendingChange.toFixed(1),
      categoryBreakdown: categorySpending,
      budgetAlerts,
      savingsProgress,
      insights,
    });
  } catch (error) {
    console.error("Get insights error:", error);
    return res.status(500).json({ error: "Failed to generate insights" });
  }
});

// GET /api/ai/forecast
router.get("/forecast", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const days = parseInt((req.query.days as string) || "30");
    const forecast = await predictSpending(userId, days);
    return res.json(forecast);
  } catch (error) {
    console.error("Get forecast error:", error);
    return res.status(500).json({ error: "Failed to generate forecast" });
  }
});

// GET /api/ai/risk-score
router.get("/risk-score", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const result = await calculateCreditScore(userId);
    return res.json(result);
  } catch (error) {
    console.error("Get risk score error:", error);
    return res.status(500).json({ error: "Failed to calculate risk score" });
  }
});

// GET /api/ai/market-signals
router.get("/market-signals", async (req: Request, res: Response) => {
  try {
    const symbol = (req.query.symbol as string) || "bitcoin";
    const signals = await getMarketSignals(symbol);
    return res.json(signals);
  } catch (error) {
    console.error("Get market signals error:", error);
    return res.status(500).json({ error: "Failed to generate market signals" });
  }
});

// GET /api/ai/sentiment
router.get("/sentiment", async (req: Request, res: Response) => {
  try {
    const { analyzeMarketSentiment } = await import("../services/ai/sentiment");
    const sentiment = await analyzeMarketSentiment();
    res.json(sentiment);
  } catch (error) {
    console.error("Get sentiment error:", error);
    res.status(500).json({ error: "Failed to analyze sentiment" });
  }
});

export default router;
