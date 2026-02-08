import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import {
  Landmark,
  CreditCard,
  PiggyBank,
  TrendingUp,
  ArrowRightLeft,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const demoAccounts = [
  { id: 1, name: "Main Checking", type: "checking", balance: 12450.80, currency: "USD", institution: "Chase", color: "#3b82f6" },
  { id: 2, name: "Savings", type: "savings", balance: 34200.00, currency: "USD", institution: "Ally Bank", color: "#22c55e" },
  { id: 3, name: "Investment", type: "investment", balance: 67800.50, currency: "USD", institution: "Fidelity", color: "#a855f7" },
  { id: 4, name: "Crypto Wallet", type: "crypto", balance: 15340.20, currency: "USD", institution: "Self-custody", color: "#f59e0b" },
];

const demoStatements = [
  { id: 1, description: "Direct Deposit - Salary", amount: 4600, type: "income", date: "2026-02-01", category: "income" },
  { id: 2, description: "Rent Payment", amount: -1800, type: "expense", date: "2026-02-01", category: "bills" },
  { id: 3, description: "Transfer to Savings", amount: -1000, type: "transfer", date: "2026-02-02", category: "transfer" },
  { id: 4, description: "Grocery - Trader Joe's", amount: -95.40, type: "expense", date: "2026-02-03", category: "food" },
  { id: 5, description: "Amazon Prime", amount: -14.99, type: "expense", date: "2026-02-04", category: "shopping" },
  { id: 6, description: "Freelance Income", amount: 1200, type: "income", date: "2026-02-05", category: "income" },
];

const iconMap: Record<string, React.ElementType> = {
  checking: CreditCard,
  savings: PiggyBank,
  investment: TrendingUp,
  crypto: Landmark,
};

export default function Banking() {
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferForm, setTransferForm] = useState({ from: "1", to: "2", amount: "", description: "" });
  const queryClient = useQueryClient();

  const { data: accounts } = useQuery({ queryKey: ["/api/banking/accounts"] });
  const accts = accounts && (accounts as any[]).length > 0 ? accounts : demoAccounts;

  const totalBalance = (accts as any[]).reduce((sum: number, a: any) => sum + a.balance, 0);

  const transferMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("/api/banking/transfers", { method: "POST", body: JSON.stringify(data) });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/banking/accounts"] });
      toast.success("Transfer completed");
      setShowTransfer(false);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Banking</h1>
          <p className="text-sm text-muted-foreground">Manage accounts and transfers</p>
        </div>
        <button onClick={() => setShowTransfer(!showTransfer)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <ArrowRightLeft className="h-4 w-4" /> Transfer
        </button>
      </div>

      {/* Total Balance */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
        <p className="text-sm text-muted-foreground">Total Balance</p>
        <p className="mt-1 text-3xl font-bold text-foreground">{formatCurrency(totalBalance)}</p>
        <p className="mt-1 text-sm text-muted-foreground">Across {(accts as any[]).length} accounts</p>
      </div>

      {/* Transfer Form */}
      {showTransfer && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold">Transfer Funds</h3>
          <form onSubmit={(e) => { e.preventDefault(); transferMutation.mutate(transferForm); }} className="grid gap-4 sm:grid-cols-4">
            <select value={transferForm.from} onChange={(e) => setTransferForm({ ...transferForm, from: e.target.value })} className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm">
              {(accts as any[]).map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <select value={transferForm.to} onChange={(e) => setTransferForm({ ...transferForm, to: e.target.value })} className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm">
              {(accts as any[]).map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <input type="number" placeholder="Amount" value={transferForm.amount} onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })} className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm" required step="0.01" />
            <button type="submit" className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">Send</button>
          </form>
        </div>
      )}

      {/* Account Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {(accts as any[]).map((acct: any) => {
          const Icon = iconMap[acct.type] || Landmark;
          return (
            <div key={acct.id} className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${acct.color}20` }}>
                    <Icon className="h-5 w-5" style={{ color: acct.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">{acct.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{acct.type} · {acct.institution}</p>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-2xl font-bold text-card-foreground">{formatCurrency(acct.balance)}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-card-foreground">Recent Activity</h3>
        <div className="space-y-3">
          {demoStatements.map((txn) => (
            <div key={txn.id} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${txn.amount >= 0 ? "bg-green-500/10" : "bg-red-500/10"}`}>
                  {txn.amount >= 0 ? <ArrowUpRight className="h-4 w-4 text-green-500" /> : <ArrowDownRight className="h-4 w-4 text-red-500" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">{txn.description}</p>
                  <p className="text-xs text-muted-foreground">{new Date(txn.date).toLocaleDateString()}</p>
                </div>
              </div>
              <span className={`text-sm font-semibold ${txn.amount >= 0 ? "text-green-500" : "text-red-500"}`}>
                {txn.amount >= 0 ? "+" : ""}{formatCurrency(txn.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
