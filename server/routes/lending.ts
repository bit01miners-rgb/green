import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { calculateCreditScore } from "../services/riskScoring";

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

// POST /api/lending/apply
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

// POST /api/lending/loans/:id/payment
router.post("/loans/:id/payment", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const loanId = parseInt(req.params.id);
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid payment amount" });
    }

    // Record the payment as a transaction
    const transaction = await storage.createTransaction({
      userId,
      accountId: null as unknown as number, // Loan payments may not have a linked account
      amount: -Math.abs(Number(amount)),
      type: "expense",
      category: "Loan Payment",
      description: `Loan payment for loan #${loanId}`,
      date: new Date(),
    });

    return res.status(201).json({
      message: "Payment recorded",
      transaction,
    });
  } catch (error) {
    console.error("Loan payment error:", error);
    return res.status(500).json({ error: "Failed to process payment" });
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

export default router;
