import { useQuery } from "@tanstack/react-query";
import { useTransactions, useFinanceSummary } from "@/hooks/useTransactions";
import { usePortfolio, useTopCoins } from "@/hooks/useMarketData";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { formatCurrency, formatPercent, getChangeColor } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

// Demo data for charts when no real data exists
const demoSpendingData = [
  { month: "Sep", income: 8200, expenses: 5100 },
  { month: "Oct", income: 8500, expenses: 4800 },
  { month: "Nov", income: 9100, expenses: 5400 },
  { month: "Dec", income: 8800, expenses: 6200 },
  { month: "Jan", income: 9500, expenses: 5000 },
  { month: "Feb", income: 9200, expenses: 4700 },
];

const demoAllocationData = [
  { name: "Stocks", value: 45 },
  { name: "Crypto", value: 25 },
  { name: "Cash", value: 15 },
  { name: "DeFi", value: 10 },
  { name: "Bonds", value: 5 },
];

interface StatCardProps {
  label: string;
  value: string;
  change?: number;
  icon: React.ElementType;
  color: string;
}

function StatCard({ label, value, change, icon: Icon, color }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${getChangeColor(change)}`}>
            {change >= 0 ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {formatPercent(change)}
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-card-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: summary } = useFinanceSummary();
  const { data: transactions } = useTransactions({ limit: 5 });
  const { data: coins } = useTopCoins(5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your financial overview at a glance
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Net Worth"
          value={formatCurrency(Number(summary?.netWorth ?? 124500))}
          change={4.2}
          icon={DollarSign}
          color="bg-green-600"
        />
        <StatCard
          label="Monthly Income"
          value={formatCurrency(Number(summary?.totalIncome ?? 9200))}
          change={8.1}
          icon={TrendingUp}
          color="bg-blue-600"
        />
        <StatCard
          label="Monthly Expenses"
          value={formatCurrency(Number(summary?.totalExpenses ?? 4700))}
          change={-3.5}
          icon={TrendingDown}
          color="bg-red-500"
        />
        <StatCard
          label="Savings Rate"
          value={`${summary?.savingsRate ?? 49}%`}
          change={2.3}
          icon={PiggyBank}
          color="bg-purple-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Income vs Expenses Chart */}
        <div className="col-span-2 rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">
            Income vs Expenses
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={demoSpendingData}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 20%)" />
              <XAxis dataKey="month" stroke="hsl(0 0% 50%)" fontSize={12} />
              <YAxis stroke="hsl(0 0% 50%)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "hsl(0 0% 10%)",
                  border: "1px solid hsl(0 0% 20%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#22c55e"
                fill="url(#incomeGrad)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#ef4444"
                fill="url(#expenseGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Allocation Pie */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">
            Portfolio Allocation
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={demoAllocationData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {demoAllocationData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "hsl(0 0% 10%)",
                  border: "1px solid hsl(0 0% 20%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1.5">
            {demoAllocationData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: COLORS[i] }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium text-card-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Transactions + Top Assets */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">
            Recent Transactions
          </h3>
          <div className="space-y-3">
            {(transactions && transactions.length > 0
              ? transactions
              : [
                { id: 1, description: "Grocery Store", category: "food", amount: -82.5, type: "expense", date: new Date().toISOString() },
                { id: 2, description: "Salary Deposit", category: "income", amount: 4600, type: "income", date: new Date().toISOString() },
                { id: 3, description: "Netflix", category: "entertainment", amount: -15.99, type: "expense", date: new Date().toISOString() },
                { id: 4, description: "Electric Bill", category: "bills", amount: -120, type: "expense", date: new Date().toISOString() },
                { id: 5, description: "Freelance Payment", category: "income", amount: 1200, type: "income", date: new Date().toISOString() },
              ]
            ).map((txn: any) => (
              <div key={txn.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${txn.type === "income" ? "bg-green-500/10" : "bg-red-500/10"
                      }`}
                  >
                    {txn.type === "income" ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      {txn.description || txn.merchant}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {txn.category}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-semibold ${txn.amount >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                >
                  {txn.amount >= 0 ? "+" : ""}
                  {formatCurrency(txn.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Crypto Assets */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">
            Top Crypto Assets
          </h3>
          <div className="space-y-3">
            {(coins && coins.length > 0
              ? coins.slice(0, 5)
              : [
                { id: "bitcoin", name: "Bitcoin", symbol: "BTC", current_price: 97500, price_change_percentage_24h: 2.4, image: "" },
                { id: "ethereum", name: "Ethereum", symbol: "ETH", current_price: 3250, price_change_percentage_24h: -1.2, image: "" },
                { id: "solana", name: "Solana", symbol: "SOL", current_price: 195, price_change_percentage_24h: 5.8, image: "" },
                { id: "cardano", name: "Cardano", symbol: "ADA", current_price: 0.92, price_change_percentage_24h: -0.5, image: "" },
                { id: "polkadot", name: "Polkadot", symbol: "DOT", current_price: 7.2, price_change_percentage_24h: 1.1, image: "" },
              ]
            ).map((coin: any) => (
              <div key={coin.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold">
                    {coin.symbol?.toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      {coin.name}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase">
                      {coin.symbol}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-card-foreground">
                    {formatCurrency(coin.current_price)}
                  </p>
                  <p className={`text-xs font-medium ${getChangeColor(coin.price_change_percentage_24h)}`}>
                    {formatPercent(coin.price_change_percentage_24h)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
