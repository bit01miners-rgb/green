import { useState } from "react";
import { useTransactions, useBudgets, useSavingsGoals, useCreateTransaction } from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import {
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  CreditCard,
  DollarSign
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [isOpen, setIsOpen] = useState(false);
  const [txnForm, setTxnForm] = useState({ description: "", amount: "", category: "food", type: "expense" });
  const { toast } = useToast();

  const { data: transactions, isLoading: isTxLoading } = useTransactions();
  const { data: budgets, isLoading: isBudgetLoading } = useBudgets();
  const { data: goals, isLoading: isGoalLoading } = useSavingsGoals();
  const createTxn = useCreateTransaction();

  const hasTxns = transactions && transactions.length > 0;
  const txns = hasTxns ? transactions : demoTransactions;

  const hasBudgets = budgets && (budgets as any[]).length > 0;
  const budgetData = hasBudgets ? budgets : demoBudgets;

  const hasGoals = goals && (goals as any[]).length > 0;
  const goalData = hasGoals ? goals : demoGoals;

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTxn.mutateAsync({
        description: txnForm.description,
        amount: txnForm.type === "expense" ? -Math.abs(Number(txnForm.amount)) : Math.abs(Number(txnForm.amount)),
        category: txnForm.category,
        type: txnForm.type,
      });
      toast({ title: "Transaction added", description: "Your transaction has been recorded." });
      setIsOpen(false);
      setTxnForm({ description: "", amount: "", category: "food", type: "expense" });
    } catch {
      toast({ title: "Error", description: "Failed to add transaction", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Personal Finance</h1>
          <p className="text-muted-foreground mt-1">Manage budgets, track expenses, and reach savings goals.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Transaction</DialogTitle>
              <DialogDescription>
                Record a new income or expense.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddTransaction} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Desc
                </Label>
                <Input
                  id="description"
                  value={txnForm.description}
                  onChange={(e) => setTxnForm({ ...txnForm, description: e.target.value })}
                  className="col-span-3"
                  placeholder="Grocery Store"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={txnForm.amount}
                  onChange={(e) => setTxnForm({ ...txnForm, amount: e.target.value })}
                  className="col-span-3"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select
                  value={txnForm.type}
                  onValueChange={(val) => setTxnForm({ ...txnForm, type: val })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select
                  value={txnForm.category}
                  onValueChange={(val) => setTxnForm({ ...txnForm, category: val })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(CATEGORY_COLORS).map((cat) => (
                      <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit">Save Transaction</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Budgets + Category Breakdown */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="col-span-2 shadow-md">
          <CardHeader>
            <CardTitle>Budgets</CardTitle>
            <CardDescription>
              {!hasBudgets && <span className="text-amber-500 font-semibold mr-2">[Demo Data]</span>}
              Track your spending limits.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isBudgetLoading ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)
            ) : (
              (budgetData as any[]).map((b: any) => {
                const pct = Math.min((b.spent / b.amountLimit) * 100, 100);
                const isOver = b.spent > b.amountLimit;
                return (
                  <div key={b.id}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium capitalize flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ background: CATEGORY_COLORS[b.category.toLowerCase()] || "#ccc" }} />
                        {b.category}
                      </span>
                      <span className={isOver ? "text-red-500 font-bold" : "text-muted-foreground"}>
                        {formatCurrency(b.spent)} <span className="text-xs text-muted-foreground">of</span> {formatCurrency(b.amountLimit)}
                      </span>
                    </div>
                    <Progress value={pct} className={`h-2 ${isOver ? "bg-red-100 dark:bg-red-900/20" : ""}`} indicatorClassName={isOver ? "bg-red-500" : "bg-primary"} />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Spending Breakdown</CardTitle>
            <CardDescription>Expenses by category.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={demoCategories} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                    {demoCategories.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "var(--radius)",
                      color: "hsl(var(--popover-foreground))",
                    }}
                    itemStyle={{ color: "hsl(var(--foreground))" }}
                    formatter={(value: any) => [`$${value}`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {demoCategories.slice(0, 4).map((c) => (
                <div key={c.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                    <span className="text-muted-foreground">{c.name}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(c.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Savings Goals */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Savings Goals</CardTitle>
          <CardDescription>
            {!hasGoals && <span className="text-amber-500 font-semibold mr-2">[Demo Data]</span>}
            Progress towards your financial targets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {isGoalLoading ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)
            ) : (
              (goalData as any[]).map((g: any) => {
                const pct = Math.round((g.currentAmount / g.targetAmount) * 100);
                return (
                  <div key={g.id} className="rounded-xl border border-border p-4 hover:border-primary/50 transition-colors">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{g.name}</p>
                        <p className="text-xs text-muted-foreground">Target: {formatCurrency(g.targetAmount)}</p>
                      </div>
                    </div>

                    <div className="mb-2 flex justify-between items-end">
                      <span className="text-2xl font-bold">{formatCurrency(g.currentAmount)}</span>
                      <Badge variant="secondary">{pct}%</Badge>
                    </div>

                    <Progress value={pct} className="h-2" />
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>History of your income and expenses.</CardDescription>
        </CardHeader>
        <CardContent>
          {isTxLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(txns as any[]).map((txn: any) => (
                  <TableRow key={txn.id}>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(txn.date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{txn.description || txn.merchant}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize font-normal" style={{
                        borderColor: `${CATEGORY_COLORS[txn.category] || "#6b7280"}40`,
                        color: CATEGORY_COLORS[txn.category] || "#6b7280",
                        backgroundColor: `${CATEGORY_COLORS[txn.category] || "#6b7280"}10`
                      }}>
                        {txn.category}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${txn.amount >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {txn.amount >= 0 ? "+" : ""}{formatCurrency(txn.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
