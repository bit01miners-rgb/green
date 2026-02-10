import { Router, Request, Response } from "express";
import { storage } from "../storage";

const router = Router();

// GET /api/finance/transactions
router.get("/transactions", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const { category, startDate, endDate, accountId, limit } = req.query;

    const transactions = await storage.getTransactions(userId, {
      category: category as string | undefined,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
      accountId: accountId ? parseInt(accountId as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    return res.json(transactions);
  } catch (error) {
    console.error("Get transactions error:", error);
    return res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// POST /api/finance/transactions
router.post("/transactions", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const { accountId, amount, type, category, description, merchant, date } = req.body;

    if (!accountId || !amount || !type || !category) {
      return res.status(400).json({ error: "Missing required fields: accountId, amount, type, category" });
    }

    const transaction = await storage.createTransaction({
      userId,
      accountId,
      amount: Number(amount),
      type,
      category,
      description: description || null,
      merchant: merchant || null,
      date: date ? new Date(date) : new Date(),
    });

    return res.status(201).json(transaction);
  } catch (error) {
    console.error("Create transaction error:", error);
    return res.status(500).json({ error: "Failed to create transaction" });
  }
});

// GET /api/finance/budgets
router.get("/budgets", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const budgetList = await storage.getBudgets(userId);
    return res.json(budgetList);
  } catch (error) {
    console.error("Get budgets error:", error);
    return res.status(500).json({ error: "Failed to fetch budgets" });
  }
});

// POST /api/finance/budgets
router.post("/budgets", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const { category, amountLimit, period } = req.body;

    if (!category || !amountLimit) {
      return res.status(400).json({ error: "Missing required fields: category, amountLimit" });
    }

    const budget = await storage.createBudget({
      userId,
      category,
      amountLimit: Number(amountLimit),
      period: period || "monthly",
    });

    return res.status(201).json(budget);
  } catch (error) {
    console.error("Create budget error:", error);
    return res.status(500).json({ error: "Failed to create budget" });
  }
});

// PUT /api/finance/budgets/:id
router.put("/budgets/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;

    if (updates.amountLimit) {
      updates.amountLimit = Number(updates.amountLimit);
    }

    const budget = await storage.updateBudget(id, updates);
    if (!budget) {
      return res.status(404).json({ error: "Budget not found" });
    }

    return res.json(budget);
  } catch (error) {
    console.error("Update budget error:", error);
    return res.status(500).json({ error: "Failed to update budget" });
  }
});

// GET /api/finance/savings-goals
router.get("/savings-goals", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const goals = await storage.getSavingsGoals(userId);
    return res.json(goals);
  } catch (error) {
    console.error("Get savings goals error:", error);
    return res.status(500).json({ error: "Failed to fetch savings goals" });
  }
});

// POST /api/finance/savings-goals
router.post("/savings-goals", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const { name, targetAmount, deadline, icon, color } = req.body;

    if (!name || !targetAmount) {
      return res.status(400).json({ error: "Missing required fields: name, targetAmount" });
    }

    const goal = await storage.createSavingsGoal({
      userId,
      name,
      targetAmount: Number(targetAmount),
      currentAmount: 0,
      deadline: deadline ? new Date(deadline) : null,
      icon: icon || null,
      color: color || null,
    });

    return res.status(201).json(goal);
  } catch (error) {
    console.error("Create savings goal error:", error);
    return res.status(500).json({ error: "Failed to create savings goal" });
  }
});

// PATCH /api/finance/savings-goals/:id
router.patch("/savings-goals/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { currentAmount, ...rest } = req.body;

    const updates: Record<string, unknown> = { ...rest };
    if (currentAmount !== undefined) {
      updates.currentAmount = Number(currentAmount);
    }

    const goal = await storage.updateSavingsGoal(id, updates);
    if (!goal) {
      return res.status(404).json({ error: "Savings goal not found" });
    }

    return res.json(goal);
  } catch (error) {
    console.error("Update savings goal error:", error);
    return res.status(500).json({ error: "Failed to update savings goal" });
  }
});

// GET /api/finance/summary
router.get("/summary", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyTxns = await storage.getTransactions(userId, {
      startDate: startOfMonth.toISOString(),
    });

    const accounts = await storage.getAccounts(userId);
    const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryTotals: Record<string, number> = {};

    for (const tx of monthlyTxns) {
      const amount = tx.amount || 0;
      if (tx.type === "income" || tx.type === "credit") {
        totalIncome += amount;
      } else {
        totalExpenses += Math.abs(amount);
        const cat = tx.category || "Uncategorized";
        categoryTotals[cat] = (categoryTotals[cat] || 0) + Math.abs(amount);
      }
    }

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    const topCategories = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount: amount.toFixed(2) }));

    return res.json({
      totalIncome: totalIncome.toFixed(2),
      totalExpenses: totalExpenses.toFixed(2),
      savingsRate: savingsRate.toFixed(1),
      netWorth: totalBalance.toFixed(2),
      topCategories,
    });
  } catch (error) {
    console.error("Get summary error:", error);
    return res.status(500).json({ error: "Failed to generate summary" });
  }
});

export default router;
