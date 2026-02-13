import { Router, Request, Response } from "express";
import { storage } from "../storage";

const router = Router();

// GET /api/banking/accounts
router.get("/accounts", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const accountList = await storage.getAccounts(userId);
    return res.json(accountList);
  } catch (error) {
    console.error("Get accounts error:", error);
    return res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

// POST /api/banking/accounts
router.post("/accounts", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const { name, type, balance, currency, institution, color } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: "Missing required fields: name, type" });
    }

    const account = await storage.createAccount({
      userId,
      name,
      type,
      balance: Number(balance || 0),
      currency: currency || "USD",
      institution: institution || null,
      color: color || null,
    });

    return res.status(201).json(account);
  } catch (error) {
    console.error("Create account error:", error);
    return res.status(500).json({ error: "Failed to create account" });
  }
});

// PATCH /api/banking/accounts/:id
router.patch("/accounts/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { balance } = req.body;

    if (balance === undefined) {
      return res.status(400).json({ error: "Missing field: balance" });
    }

    const account = await storage.updateAccountBalance(id, Number(balance));
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    return res.json(account);
  } catch (error) {
    console.error("Update account error:", error);
    return res.status(500).json({ error: "Failed to update account" });
  }
});

// POST /api/banking/transfers
router.post("/transfers", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const { fromAccountId, toAccountId, amount, description } = req.body;

    if (!fromAccountId || !toAccountId || !amount) {
      return res.status(400).json({ error: "Missing required fields: fromAccountId, toAccountId, amount" });
    }

    if (fromAccountId === toAccountId) {
      return res.status(400).json({ error: "Cannot transfer to the same account" });
    }

    const transferAmount = Number(amount);
    if (transferAmount <= 0) {
      return res.status(400).json({ error: "Transfer amount must be positive" });
    }

    // Get source account and check balance
    const sourceAccounts = await storage.getAccounts(userId);
    const sourceAccount = sourceAccounts.find((a) => a.id === fromAccountId);
    const destAccount = sourceAccounts.find((a) => a.id === toAccountId);

    if (!sourceAccount || !destAccount) {
      return res.status(404).json({ error: "Account not found" });
    }

    const sourceBalance = sourceAccount.balance || 0;
    if (sourceBalance < transferAmount) {
      return res.status(400).json({ error: "Insufficient funds" });
    }

    // Update balances
    await storage.updateAccountBalance(
      fromAccountId,
      (sourceBalance - transferAmount)
    );
    await storage.updateAccountBalance(
      toAccountId,
      (destAccount.balance || 0) + transferAmount
    );

    // Create transaction records for both accounts
    const debitTx = await storage.createTransaction({
      userId,
      accountId: fromAccountId,
      amount: -transferAmount,
      type: "transfer",
      category: "Transfer",
      description: description || `Transfer to ${destAccount.name}`,
      date: new Date(),
    });

    await storage.createTransaction({
      userId,
      accountId: toAccountId,
      amount: transferAmount,
      type: "transfer",
      category: "Transfer",
      description: description || `Transfer from ${sourceAccount.name}`,
      date: new Date(),
    });

    return res.status(201).json({
      message: "Transfer completed",
      transaction: debitTx,
    });
  } catch (error) {
    console.error("Transfer error:", error);
    return res.status(500).json({ error: "Failed to process transfer" });
  }
});

// GET /api/banking/statements/:accountId
router.get("/statements/:accountId", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const accountId = parseInt(req.params.accountId);
    const { startDate, endDate } = req.query;

    const transactions = await storage.getTransactions(userId, {
      accountId,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
    });

    // Calculate running balance
    let runningBalance = 0;
    const statement = transactions.reverse().map((tx) => {
      const amount = tx.amount || 0;
      runningBalance += amount;
      return {
        ...tx,
        runningBalance: runningBalance.toFixed(2),
      };
    });

    return res.json({
      accountId,
      startDate: startDate || null,
      endDate: endDate || null,
      transactions: statement.reverse(),
      closingBalance: runningBalance.toFixed(2),
    });
  } catch (error) {
    console.error("Get statement error:", error);
    return res.status(500).json({ error: "Failed to generate statement" });
  }
});

// POST /credit-deposit-batch
import { creditDepositBatch } from "../services/bankingService";

router.post("/credit-deposit-batch", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const { tokens, txHashes } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({ error: "No tokens provided" });
    }

    const result = await creditDepositBatch(userId.toString(), tokens, txHashes || []);

    return res.status(201).json({
      success: true,
      message: "Deposit credited successfully",
      updatedHoldings: result // assuming result is the updated holdings
    });
  } catch (error) {
    console.error("Credit deposit error:", error);
    return res.status(500).json({ error: (error as Error).message || "Failed to process deposit credit" });
  }
});

export default router;
