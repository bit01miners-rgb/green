import { useState } from "react";
import { useTransactions, useBudgets, useSavingsGoals, useFinanceSummary, useCreateTransaction } from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import {
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Filter,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const CATEGORY_COLORS: Record<string, string> = {
  food: "#f97316", transport: "#3b82f6", entertainment: "#a855f7",
  shopping: "#ec4899", bills: "#ef4444", health: "#22c55e",
  education: "#6366f1", travel: "#06b6d4", income: "#10b981", other: "#6b7280",
};

const demoCategories = [
  { name: "Food", value: 850, color: "#f97316" },
  { name: "Transport", value: 320, color: "#3b82f6" },
  { name: "Entertainment", value: 180, color: "#a855f7" },
  { name: "Shopping", value: 450, color: "#ec4899" },
  { name: "Bills", value: 1200, color: "#ef4444" },
  { name: "Health", value: 200, color: "#22c55e" },
];

const demoBudgets = [
  { id: 1, category: "Food", amountLimit: 1000, spent: 850 },
  { id: 2, category: "Transport", amountLimit: 400, spent: 320 },
  { id: 3, category: "Entertainment", amountLimit: 300, spent: 180 },
  { id: 4, category: "Shopping", amountLimit: 500, spent: 450 },
  { id: 5, category: "Bills", amountLimit: 1500, spent: 1200 },
];

const demoGoals = [
  { id: 1, name: "Emergency Fund", targetAmount: 10000, currentAmount: 6500, icon: "shield", color: "#22c55e" },
  { id: 2, name: "Vacation", targetAmount: 5000, currentAmount: 2100, icon: "plane", color: "#3b82f6" },
  { id: 3, name: "New Car", targetAmount: 25000, currentAmount: 8200, icon: "car", color: "#f59e0b" },
];

const demoTransactions = [
  { id: 1, description: "Whole Foods Market", category: "food", amount: -67.50, type: "expense", date: "2026-02-07", merchant: "Whole Foods" },
  { id: 2, description: "Monthly Salary", category: "income", amount: 4600, type: "income", date: "2026-02-01", merchant: "Employer" },
  { id: 3, description: "Uber Ride", category: "transport", amount: -24.00, type: "expense", date: "2026-02-06", merchant: "Uber" },
  { id: 4, description: "Netflix Subscription", category: "entertainment", amount: -15.99, type: "expense", date: "2026-02-05", merchant: "Netflix" },
  { id: 5, description: "Electricity Bill", category: "bills", amount: -120.00, type: "expense", date: "2026-02-04", merchant: "ConEd" },
  { id: 6, description: "Freelance Project", category: "income", amount: 1200, type: "income", date: "2026-02-03", merchant: "Client" },
  { id: 7, description: "Amazon Purchase", category: "shopping", amount: -89.99, type: "expense", date: "2026-02-02", merchant: "Amazon" },
  { id: 8, description: "Gym Membership", category: "health", amount: -49.99, type: "expense", date: "2026-02-01", merchant: "Equinox" },
];

export default function PersonalFinance() {
  const [showAddTxn, setShowAddTxn] = useState(false);
  const [txnForm, setTxnForm] = useState({ description: "", amount: "", category: "food", type: "expense" });
  const { data: transactions } = useTransactions();
  const { data: budgets } = useBudgets();
  const { data: goals } = useSavingsGoals();
  const createTxn = useCreateTransaction();

  const txns = transactions && transactions.length > 0 ? transactions : demoTransactions;
  const budgetData = budgets && (budgets as any[]).length > 0 ? budgets : demoBudgets;
  const goalData = goals && (goals as any[]).length > 0 ? goals : demoGoals;

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTxn.mutateAsync({
        description: txnForm.description,
        amount: txnForm.type === "expense" ? -Math.abs(Number(txnForm.amount)) : Math.abs(Number(txnForm.amount)),
        category: txnForm.category,
        type: txnForm.type,
      });
      toast.success("Transaction added");
      setShowAddTxn(false);
      setTxnForm({ description: "", amount: "", category: "food", type: "expense" });
    } catch {
      toast.error("Failed to add transaction");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Personal Finance</h1>
          <p className="text-sm text-muted-foreground">Manage budgets, track expenses, and reach savings goals</p>
        </div>
        <button
          onClick={() => setShowAddTxn(!showAddTxn)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Transaction
        </button>
      </div>

      {/* Add Transaction Form */}
      {showAddTxn && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">New Transaction</h3>
          <form onSubmit={handleAddTransaction} className="grid gap-4 sm:grid-cols-4">
            <input value={txnForm.description} onChange={(e) => setTxnForm({ ...txnForm, description: e.target.value })} placeholder="Description" required className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            <input type="number" value={txnForm.amount} onChange={(e) => setTxnForm({ ...txnForm, amount: e.target.value })} placeholder="Amount" required step="0.01" className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            <select value={txnForm.category} onChange={(e) => setTxnForm({ ...txnForm, category: e.target.value })} className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
              {Object.keys(CATEGORY_COLORS).map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <div className="flex gap-2">
              <select value={txnForm.type} onChange={(e) => setTxnForm({ ...txnForm, type: e.target.value })} className="h-9 flex-1 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              <button type="submit" className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">Save</button>
            </div>
          </form>
        </div>
      )}

      {/* Budgets + Category Breakdown */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="col-span-2 rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">Budgets</h3>
          <div className="space-y-4">
            {(budgetData as any[]).map((b: any) => {
              const pct = Math.min((b.spent / b.amountLimit) * 100, 100);
              const isOver = b.spent > b.amountLimit;
              return (
                <div key={b.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-card-foreground capitalize">{b.category}</span>
                    <span className={isOver ? "text-red-500" : "text-muted-foreground"}>
                      {formatCurrency(b.spent)} / {formatCurrency(b.amountLimit)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className={`h-2 rounded-full transition-all ${isOver ? "bg-red-500" : "bg-primary"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">Spending by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={demoCategories} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2} dataKey="value">
                {demoCategories.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 20%)", borderRadius: "8px", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1">
            {demoCategories.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                  <span className="text-muted-foreground">{c.name}</span>
                </div>
                <span className="font-medium text-card-foreground">{formatCurrency(c.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Savings Goals */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-card-foreground">Savings Goals</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {(goalData as any[]).map((g: any) => {
            const pct = Math.round((g.currentAmount / g.targetAmount) * 100);
            return (
              <div key={g.id} className="rounded-lg border border-border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" style={{ color: g.color }} />
                  <span className="text-sm font-semibold text-card-foreground">{g.name}</span>
                </div>
                <div className="mb-2 text-2xl font-bold text-card-foreground">
                  {formatCurrency(g.currentAmount)}
                </div>
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>{pct}%</span>
                  <span>Goal: {formatCurrency(g.targetAmount)}</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: g.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction List */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-card-foreground">All Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date</th>
                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</th>
                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category</th>
                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(txns as any[]).map((txn: any) => (
                <tr key={txn.id} className="border-b border-border/50 last:border-0">
                  <td className="py-3 text-sm text-muted-foreground">{new Date(txn.date).toLocaleDateString()}</td>
                  <td className="py-3 text-sm font-medium text-card-foreground">{txn.description}</td>
                  <td className="py-3">
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize" style={{ background: `${CATEGORY_COLORS[txn.category] || "#6b7280"}20`, color: CATEGORY_COLORS[txn.category] || "#6b7280" }}>
                      {txn.category}
                    </span>
                  </td>
                  <td className={`py-3 text-right text-sm font-semibold ${txn.amount >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {txn.amount >= 0 ? "+" : ""}{formatCurrency(txn.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
