import { useTransactions, useFinanceSummary } from "@/hooks/useTransactions";
import { usePortfolio, useTopCoins } from "@/hooks/useMarketData";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Activity,
  CreditCard
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
  BarChart,
  Bar
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

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
  loading?: boolean;
}

function StatCard({ label, value, change, icon: Icon, loading }: StatCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-8 w-[120px]" />
            <Skeleton className="h-3 w-[80px]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className={`text-xs flex items-center mt-1 ${getChangeColor(change)}`}>
            {change >= 0 ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownRight className="mr-1 h-3 w-3" />}
            {formatPercent(change)}
            <span className="text-muted-foreground ml-1">from last month</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Helper for aggregating transactions for chart
const processChartData = (transactions: any[]) => {
  if (!transactions || transactions.length === 0) return [];

  const monthlyData: Record<string, { income: number; expenses: number }> = {};
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  transactions.forEach(tx => {
    const date = new Date(tx.date);
    const month = months[date.getMonth()];
    if (!monthlyData[month]) monthlyData[month] = { income: 0, expenses: 0 };

    if (tx.type === 'income') {
      monthlyData[month].income += Number(tx.amount);
    } else {
      monthlyData[month].expenses += Math.abs(Number(tx.amount));
    }
  });

  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    income: data.income,
    expenses: data.expenses
  })).sort((a, b) => months.indexOf(a.month) - months.indexOf(b.month));
};

const processAllocationData = (holdings: any[]) => {
  if (!holdings || holdings.length === 0) return [];
  const allocation: Record<string, number> = {};
  let total = 0;
  holdings.forEach(h => {
    const val = Number(h.currentValue || (h.quantity * h.avgCost));
    allocation[h.assetType] = (allocation[h.assetType] || 0) + val;
    total += val;
  });

  return Object.entries(allocation).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: Math.round((value / total) * 100)
  }));
};

export default function Dashboard() {
  const { data: summary, isLoading: isSummaryLoading } = useFinanceSummary();
  const { data: transactions, isLoading: isTxLoading } = useTransactions({ limit: 100 });
  const { data: coins, isLoading: isCoinsLoading } = useTopCoins(5);
  const { data: portfolio, isLoading: isPortfolioLoading } = usePortfolio();

  const safeTransactions = (transactions as any[]) || [];
  const safePortfolio = (portfolio as any[]) || [];

  const hasRealData = safeTransactions.length > 0;
  const chartData = hasRealData ? processChartData(safeTransactions) : demoSpendingData;
  const allocationData = safePortfolio.length > 0 ? processAllocationData(safePortfolio) : demoAllocationData;

  const recentTransactions = hasRealData ? safeTransactions.slice(0, 5) : [
    { id: 1, description: "Grocery Store", category: "food", amount: -82.5, type: "expense", date: new Date().toISOString() },
    { id: 2, description: "Salary Deposit", category: "income", amount: 4600, type: "income", date: new Date().toISOString() },
    { id: 3, description: "Netflix", category: "entertainment", amount: -15.99, type: "expense", date: new Date().toISOString() },
    { id: 4, description: "Electric Bill", category: "bills", amount: -120, type: "expense", date: new Date().toISOString() },
    { id: 5, description: "Freelance Payment", category: "income", amount: 1200, type: "income", date: new Date().toISOString() },
  ];

  const topCoins = coins && coins.length > 0 ? coins.slice(0, 5) : [
    { id: "bitcoin", name: "Bitcoin", symbol: "BTC", current_price: 97500, price_change_percentage_24h: 2.4 },
    { id: "ethereum", name: "Ethereum", symbol: "ETH", current_price: 3250, price_change_percentage_24h: -1.2 },
    { id: "solana", name: "Solana", symbol: "SOL", current_price: 195, price_change_percentage_24h: 5.8 },
    { id: "cardano", name: "Cardano", symbol: "ADA", current_price: 0.92, price_change_percentage_24h: -0.5 },
    { id: "polkadot", name: "Polkadot", symbol: "DOT", current_price: 7.2, price_change_percentage_24h: 1.1 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's your financial overview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/personal-finance">
              <Wallet className="mr-2 h-4 w-4" /> Manage Wallet
            </Link>
          </Button>
          <Button asChild>
            <Link href="/trading">
              <Activity className="mr-2 h-4 w-4" /> Trade Now
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Net Worth"
          value={formatCurrency(Number(summary?.netWorth ?? 124500))}
          change={4.2}
          icon={DollarSign}
          loading={isSummaryLoading}
        />
        <StatCard
          label="Monthly Income"
          value={formatCurrency(Number(summary?.totalIncome ?? 9200))}
          change={8.1}
          icon={TrendingUp}
          loading={isSummaryLoading}
        />
        <StatCard
          label="Monthly Expenses"
          value={formatCurrency(Number(summary?.totalExpenses ?? 4700))}
          change={-3.5}
          icon={TrendingDown}
          loading={isSummaryLoading}
        />
        <StatCard
          label="Savings Rate"
          value={`${summary?.savingsRate ?? 49}%`}
          change={2.3}
          icon={PiggyBank}
          loading={isSummaryLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Income vs Expenses Chart - Takes up 4 columns */}
        <Card className="col-span-1 lg:col-span-4 shadow-md">
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
            <CardDescription>
              {!hasRealData && <span className="text-amber-500 font-semibold mr-2">[Demo Data]</span>}
              Comparison of your monthly inflow and outflow.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              {isTxLoading ? (
                <Skeleton className="h-full w-full rounded-md" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="month"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
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
                    <Area
                      type="monotone"
                      dataKey="income"
                      name="Income"
                      stroke="#22c55e"
                      fill="url(#incomeGrad)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      name="Expenses"
                      stroke="#ef4444"
                      fill="url(#expenseGrad)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Allocation Pie - Takes up 3 columns */}
        <Card className="col-span-1 lg:col-span-3 shadow-md">
          <CardHeader>
            <CardTitle>Portfolio Allocation</CardTitle>
            <CardDescription>Distribution of your assets.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full flex justify-center items-center">
              {isPortfolioLoading ? (
                <Skeleton className="h-[200px] w-[200px] rounded-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {allocationData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "var(--radius)",
                        color: "hsl(var(--popover-foreground))",
                      }}
                      itemStyle={{ color: "hsl(var(--foreground))" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {allocationData.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Recent Transactions + Top Assets */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Transactions */}
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/personal-finance">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isTxLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((txn: any) => (
                  <div key={txn.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${txn.type === "income" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                          }`}
                      >
                        {txn.type === "income" ? (
                          <ArrowUpRight className="h-5 w-5" />
                        ) : (
                          <ArrowDownRight className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none mb-1">
                          {txn.description || txn.merchant || "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {txn.category} • {new Date(txn.date).toLocaleDateString()}
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
            )}
          </CardContent>
        </Card>

        {/* Top Crypto Assets */}
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top Crypto Assets</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/trading">Trade</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isCoinsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="space-y-4">
                {topCoins.map((coin: any) => (
                  <div key={coin.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-bold ring-2 ring-background">
                        {coin.symbol?.toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none mb-1">
                          {coin.name}
                        </p>
                        <p className="text-xs text-muted-foreground uppercase">
                          {coin.symbol}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {formatCurrency(coin.current_price)}
                      </p>
                      <p className={`text-xs font-medium ${getChangeColor(coin.price_change_percentage_24h)}`}>
                        {formatPercent(coin.price_change_percentage_24h)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
