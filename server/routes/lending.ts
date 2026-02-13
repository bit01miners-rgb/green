import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { calculateCreditScore } from "../services/riskScoring";
import { getCoinPrice } from "../services/marketData";

const router = Router();

// GET /api/lending/loans
router.get("/loans", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const loanList = await storage.getLoans(userId);
    return res.json(loanList);
  } catch (error) {
    console.error("Get loans error:", error);
    return res.status(500).json({ error: "Failed to fetch loans" });
  }
});

// GET /api/lending/positions (Supplied Assets)
router.get("/positions", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const positions = await storage.getDefiPositions(userId);
    // Filter for GreenLend protocol positions
    const lendingPositions = positions.filter(p => p.protocol === "GreenLend");
    return res.json(lendingPositions);
  } catch (error) {
    console.error("Get lending positions error:", error);
    return res.status(500).json({ error: "Failed to fetch supplied assets" });
  }
});

// POST /api/lending/supply
router.post("/supply", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const { asset, amount } = req.body;

    if (!asset || !amount || Number(amount) <= 0) {
      return res.status(400).json({ error: "Invalid asset or amount" });
    }

    const numAmount = Number(amount);

    // Check for market data in DB
    let marketAsset = await storage.getMarketAsset(asset);

    // Lazy Load: If not in DB, fetch from CoinGecko and store
    if (!marketAsset) {
      try {
        const prices = await getCoinPrice(asset.toLowerCase());
        const data = prices[asset.toLowerCase()];
        const price = data?.usd || 0;

        marketAsset = await storage.createMarketAsset({
          symbol: asset,
          name: asset,
          coingeckoId: asset.toLowerCase(),
          currentPrice: price,
          currentApy: 5.0, // Default for new assets, should be updated by a cron job
        });
      } catch (e) {
        // Fallback if API fails, still better than hard crash, but log it
        console.error(`Failed to fetch initial price for ${asset}`, e);
        marketAsset = await storage.createMarketAsset({
          symbol: asset,
          name: asset,
          coingeckoId: asset.toLowerCase(),
          currentPrice: 0,
          currentApy: 0,
        });
      }
    }

    const currentPrice = marketAsset.currentPrice;
    const currentApy = marketAsset.currentApy || 0;

    let position = await storage.getDefiPositionByToken(userId, "GreenLend", asset);

    if (position) {
      position = await storage.updateDefiPosition(position.id, {
        depositedAmount: position.depositedAmount + numAmount,
        currentValue: (position.depositedAmount + numAmount) * currentPrice,
      });
    } else {
      position = await storage.createDefiPosition({
        userId,
        protocol: "GreenLend",
        poolName: `${asset} Supply Pool`,
        chain: "GreenChain",
        depositedAmount: numAmount,
        currentValue: numAmount * currentPrice,
        apy: currentApy,
        tokenA: asset,
      });
    }

    // Record Transaction
    await storage.createTransaction({
      userId,
      accountId: null as unknown as number,
      amount: -numAmount,
      type: "transfer",
      category: "Lending Supply",
      description: `Supplied ${numAmount} ${asset} to GreenLend`,
      date: new Date(),
    });

    return res.json(position);
  } catch (error) {
    console.error("Supply error:", error);
    return res.status(500).json({ error: "Failed to supply asset" });
  }
});

// POST /api/lending/withdraw
router.post("/withdraw", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const { asset, amount } = req.body;

    if (!asset || !amount || Number(amount) <= 0) {
      return res.status(400).json({ error: "Invalid asset or amount" });
    }

    const numAmount = Number(amount);
    const position = await storage.getDefiPositionByToken(userId, "GreenLend", asset);

    if (!position || position.depositedAmount < numAmount) {
      return res.status(400).json({ error: "Insufficient balance to withdraw" });
    }

    let marketAsset = await storage.getMarketAsset(asset);
    const price = marketAsset?.currentPrice || 0;

    const updatedPosition = await storage.updateDefiPosition(position.id, {
      depositedAmount: position.depositedAmount - numAmount,
      currentValue: (position.depositedAmount - numAmount) * price,
    });

    // Record Transaction
    await storage.createTransaction({
      userId,
      accountId: null as unknown as number,
      amount: numAmount,
      type: "transfer",
      category: "Lending Withdraw",
      description: `Withdrew ${numAmount} ${asset} from GreenLend`,
      date: new Date(),
    });

    return res.json(updatedPosition);
  } catch (error) {
    console.error("Withdraw error:", error);
    return res.status(500).json({ error: "Failed to withdraw asset" });
  }
});

// POST /api/lending/borrow
router.post("/borrow", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const { asset, amount } = req.body;

    if (!asset || !amount || Number(amount) <= 0) {
      return res.status(400).json({ error: "Invalid asset or amount" });
    }

    const numAmount = Number(amount);

    // Validate collateral
    const positions = await storage.getDefiPositions(userId);
    const totalCollateral = positions.reduce((sum, p) => sum + p.currentValue, 0);

    // 80% LTV ratio
    if (totalCollateral * 0.8 < numAmount) {
      return res.status(400).json({ error: `Insufficient collateral. You have $${totalCollateral.toFixed(2)} collateral, allowing for a max borrow of $${(totalCollateral * 0.8).toFixed(2)}` });
    }

    const loan = await storage.createLoan({
      userId,
      type: "DeFi Borrow",
      principal: numAmount,
      balance: numAmount,
      interestRate: 4.5,
      termMonths: 12, // Indefinite really, but schema needs it
      monthlyPayment: 0,
      status: "active",
      lender: "GreenLend Protocol",
    });

    // Record Transaction
    await storage.createTransaction({
      userId,
      accountId: null as unknown as number,
      amount: numAmount,
      type: "income",
      category: "Loan Borrow",
      description: `Borrowed ${numAmount} ${asset}`,
      date: new Date(),
    });

    return res.json(loan);
  } catch (error) {
    console.error("Borrow error:", error);
    return res.status(500).json({ error: "Failed to borrow asset" });
  }
});

// POST /api/lending/repay
router.post("/repay", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const { loanId, amount } = req.body;

    if (!loanId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ error: "Invalid loan or amount" });
    }

    const numAmount = Number(amount);

    // Fetch loan to verify ownership and update balance
    const loan = await storage.getLoan(loanId);

    if (!loan) {
      return res.status(404).json({ error: "Loan not found" });
    }

    if (loan.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized to repay this loan" });
    }

    // Check overpayment
    if (loan.balance < numAmount) {
      // Optionally allow overpayment but warn or just cap it?
      // For now, let's just proceed and set balance to 0 if it goes below.
    }

    const newBalance = Math.max(0, loan.balance - numAmount);
    const newStatus = newBalance === 0 ? "paid_off" : "active";

    await storage.updateLoan(loanId, {
      balance: newBalance,
      status: newStatus,
    });

    await storage.createTransaction({
      userId,
      accountId: null as unknown as number, // Still null as we don't have account selection
      amount: -numAmount,
      type: "expense",
      category: "Loan Repayment",
      description: `Repaid ${numAmount} for Loan #${loanId}`,
      date: new Date(),
    });

    return res.json({ success: true, message: "Repayment recorded", newBalance, status: newStatus });
  } catch (error) {
    console.error("Repay error:", error);
    return res.status(500).json({ error: "Failed to repay loan" });
  }
});


// GET /api/lending/applications
router.get("/applications", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const applications = await storage.getLoanApplications(userId);
    return res.json(applications);
  } catch (error) {
    console.error("Get loan applications error:", error);
    return res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// POST /api/lending/apply (Legacy / Traditional Loans)
router.post("/apply", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const { type, amountRequested, termMonths, purpose } = req.body;

    if (!type || !amountRequested || !termMonths) {
      return res.status(400).json({
        error: "Missing required fields: type, amountRequested, termMonths",
      });
    }

    // Calculate credit score for the application
    const creditResult = await calculateCreditScore(userId);

    const application = await storage.createLoanApplication({
      userId,
      type,
      amountRequested: Number(amountRequested),
      termMonths: Number(termMonths),
      purpose: purpose || null,
      submittedAt: new Date(),
      status: "pending",
      creditScore: creditResult.score,
    });

    return res.status(201).json(application);
  } catch (error) {
    console.error("Loan application error:", error);
    return res.status(500).json({ error: "Failed to submit application" });
  }
});

// GET /api/lending/credit-score
router.get("/credit-score", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const result = await calculateCreditScore(userId);
    return res.json(result);
  } catch (error) {
    console.error("Credit score error:", error);
    return res.status(500).json({ error: "Failed to calculate credit score" });
  }
});

// GET /api/lending/optimization
router.get("/optimization", async (req, res) => {
  try {
    if (!req.session.userId) return res.status(401).send("Unauthorized");
    const { optimizeCollateral } = await import("../services/lending/collateral");
    const result = await optimizeCollateral(req.session.userId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Optimization failed" });
  }
});

export default router;

