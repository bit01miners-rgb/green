import { Router, Request, Response } from "express";
import { storage } from "../storage";

const router = Router();

// GET /api/commercial/invoices
router.get("/invoices", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const status = req.query.status as string | undefined;
    const invoiceList = await storage.getInvoices(userId, status);
    return res.json(invoiceList);
  } catch (error) {
    console.error("Get invoices error:", error);
    return res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

// POST /api/commercial/invoices
router.post("/invoices", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const { clientName, clientEmail, amount, tax, dueDate, items, notes } = req.body;

    if (!clientName || !amount || !dueDate) {
      return res.status(400).json({
        error: "Missing required fields: clientName, amount, dueDate",
      });
    }

    const invoice = await storage.createInvoice({
      userId,
      clientName,
      invoiceNumber: `INV-${Date.now()}`,
      clientEmail: clientEmail || null,
      amount: Number(amount),
      tax: Number(tax || 0),
      dueDate: new Date(dueDate),
      items: items || null,
      notes: notes || null,
      status: "draft",
    });

    return res.status(201).json(invoice);
  } catch (error) {
    console.error("Create invoice error:", error);
    return res.status(500).json({ error: "Failed to create invoice" });
  }
});

// PATCH /api/commercial/invoices/:id/status
router.patch("/invoices/:id/status", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Missing required field: status" });
    }

    const validStatuses = ["draft", "sent", "paid", "overdue", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const invoice = await storage.updateInvoiceStatus(id, status);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    return res.json(invoice);
  } catch (error) {
    console.error("Update invoice status error:", error);
    return res.status(500).json({ error: "Failed to update invoice status" });
  }
});

// GET /api/commercial/cashflow
router.get("/cashflow", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;

    // Get all transactions for the past 12 months
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

    const allTransactions = await storage.getTransactions(userId, {
      startDate: twelveMonthsAgo.toISOString(),
    });

    // Aggregate by month
    const monthlyData: Record<string, { income: number; expenses: number }> = {};

    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyData[key] = { income: 0, expenses: 0 };
    }

    for (const tx of allTransactions) {
      const txDate = new Date(tx.date!);
      const key = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, "0")}`;

      if (monthlyData[key]) {
        const amount = tx.amount || 0;
        if (tx.type === "income" || tx.type === "credit") {
          monthlyData[key].income += amount;
        } else {
          monthlyData[key].expenses += Math.abs(amount);
        }
      }
    }

    const cashflow = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        income: data.income.toFixed(2),
        expenses: data.expenses.toFixed(2),
        net: (data.income - data.expenses).toFixed(2),
      }));

    return res.json(cashflow);
  } catch (error) {
    console.error("Get cashflow error:", error);
    return res.status(500).json({ error: "Failed to generate cashflow report" });
  }
});

// GET /api/commercial/payroll
router.get("/payroll", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const entries = await storage.getPayrollEntries(userId);
    return res.json(entries);
  } catch (error) {
    console.error("Get payroll error:", error);
    return res.status(500).json({ error: "Failed to fetch payroll entries" });
  }
});

// POST /api/commercial/payroll
router.post("/payroll", async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const { employeeName, employeeEmail, amount, payDate, type } = req.body;

    if (!employeeName || !amount || !payDate) {
      return res.status(400).json({
        error: "Missing required fields: employeeName, amount, payDate",
      });
    }

    const entry = await storage.createPayrollEntry({
      userId,
      employeeName,
      employeeEmail: employeeEmail || null,
      amount: Number(amount),
      payDate: new Date(payDate),
      type: type || "salary",
    });

    return res.status(201).json(entry);
  } catch (error) {
    console.error("Create payroll entry error:", error);
    return res.status(500).json({ error: "Failed to create payroll entry" });
  }
});

export default router;
