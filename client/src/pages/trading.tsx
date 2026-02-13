import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useTopCoins, usePortfolio, useCoinChart } from "@/hooks/useMarketData";
import { formatCurrency, formatPercent, formatCompactNumber, getChangeColor } from "@/lib/utils";
import {
  Plus,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Search
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const demoCoins = [
  { id: "bitcoin", symbol: "btc", name: "Bitcoin", image: "", current_price: 97500, market_cap: 1920000000000, price_change_percentage_24h: 2.4, total_volume: 45000000000 },
  { id: "ethereum", symbol: "eth", name: "Ethereum", image: "", current_price: 3250, market_cap: 390000000000, price_change_percentage_24h: -1.2, total_volume: 18000000000 },
];

export default function Trading() {
  const [selectedCoin, setSelectedCoin] = useState("bitcoin");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: coins, isLoading: isCoinsLoading } = useTopCoins(20);
  const { data: portfolio, isLoading: isPortfolioLoading } = usePortfolio();
  const { data: chartData, isLoading: isChartLoading } = useCoinChart(selectedCoin, 7);

  const coinList = coins && coins.length > 0 ? coins : demoCoins;
  const holdings = portfolio && (portfolio as any[]).length > 0 ? (portfolio as any[]) : [];

  const filteredCoins = coinList.filter((c: any) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = holdings.reduce((sum: number, h: any) => sum + h.quantity * (h.currentPrice || h.avgCost), 0);
  const totalCost = holdings.reduce((sum: number, h: any) => sum + h.quantity * h.avgCost, 0);
  const totalPnL = totalValue - totalCost;
  const pnlPct = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  // Generate demo chart data if needed or use real chart data
  const chartDataPoints = chartData?.prices
    ? chartData.prices.map((p) => ({ time: new Date(p.timestamp).toLocaleDateString(), price: p.price }))
    : Array.from({ length: 168 }, (_, i) => ({
      time: new Date(Date.now() - (168 - i) * 3600000).toLocaleDateString(),
      price: 95000 + Math.sin(i / 10) * 3000 + Math.random() * 1000, // Fallback demo
    }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Trading & Investing</h1>
          <p className="text-muted-foreground mt-1">Portfolio tracking with live market data.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/swap">
            <Button variant="outline">
              Swap Tokens
            </Button>
          </Link>
          <Link href="/mint">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Mint New Token
            </Button>
          </Link>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <span className="text-sm font-medium text-muted-foreground">Portfolio Value</span>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            {isPortfolioLoading ? <Skeleton className="h-8 w-[120px] mt-2" /> : (
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold">{formatCurrency(totalValue)}</span>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <span className="text-sm font-medium text-muted-foreground">Total P&L</span>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            {isPortfolioLoading ? <Skeleton className="h-8 w-[120px] mt-2" /> : (
              <div className={`mt-2 flex items-baseline gap-2 text-2xl font-bold ${getChangeColor(totalPnL)}`}>
                {totalPnL >= 0 ? "+" : ""}{formatCurrency(totalPnL)}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <span className="text-sm font-medium text-muted-foreground">Return</span>
              <div className={`px-2 py-0.5 rounded text-xs font-medium ${pnlPct >= 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                24h
              </div>
            </div>
            {isPortfolioLoading ? <Skeleton className="h-8 w-[120px] mt-2" /> : (
              <div className={`mt-2 flex items-baseline gap-2 text-2xl font-bold ${getChangeColor(pnlPct)}`}>
                {formatPercent(pnlPct)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Chart Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Price Chart */}
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="space-y-1">
                <CardTitle className="capitalize flex items-center gap-2">
                  {selectedCoin}
                  <Badge variant="outline" className="text-xs font-normal">7D</Badge>
                </CardTitle>
                <CardDescription>Price Performance</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                {isChartLoading ? (
                  <Skeleton className="h-full w-full rounded-md" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartDataPoints} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis
                        dataKey="time"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={30}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        domain={["auto", "auto"]}
                        tickFormatter={(val) => `$${val.toLocaleString()}`}
                        width={60}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "var(--radius)",
                          color: "hsl(var(--popover-foreground))",
                        }}
                        itemStyle={{ color: "hsl(var(--foreground))" }}
                        formatter={(value: any) => [`$${value.toLocaleString()}`, "Price"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#22c55e"
                        fill="url(#priceGrad)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Market Overview List */}
          <Card className="shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Market Overview</CardTitle>
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search coins..."
                    className="pl-8 h-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {isCoinsLoading ? (
                  [1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-14 w-full" />)
                ) : (
                  filteredCoins.map((coin: any) => (
                    <div
                      key={coin.id}
                      onClick={() => setSelectedCoin(coin.id)}
                      className={`flex cursor-pointer items-center justify-between rounded-lg p-3 transition-all hover:bg-accent/50 ${selectedCoin === coin.id ? "bg-accent shadow-sm ring-1 ring-border" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs font-bold uppercase ring-2 ring-background">
                          {coin.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-card-foreground leading-none">{coin.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 uppercase font-normal text-muted-foreground">{coin.symbol}</Badge>
                            <span className="text-xs text-muted-foreground">
                              MCap: {formatCompactNumber(coin.market_cap)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-card-foreground">{formatCurrency(coin.current_price)}</p>
                        <div className={`flex items-center justify-end gap-1 text-xs font-medium ${getChangeColor(coin.price_change_percentage_24h)}`}>
                          {coin.price_change_percentage_24h >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {formatPercent(coin.price_change_percentage_24h)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column (1/3 width) */}
        <div className="space-y-6">
          {/* Holdings */}
          <Card className="shadow-md h-fit">
            <CardHeader>
              <CardTitle>Your Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isPortfolioLoading ? (
                  [1, 2].map(i => <Skeleton key={i} className="h-16 w-full" />)
                ) : holdings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground space-y-2">
                    <div className="bg-muted h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Plus className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm">No holdings yet.</p>
                    <Button variant="link" size="sm" asChild>
                      <Link href="/swap">Buy Crypto</Link>
                    </Button>
                  </div>
                ) : (
                  holdings.map((h: any) => {
                    const value = h.quantity * (h.currentPrice || h.avgCost);
                    const pnl = (h.currentPrice || h.avgCost) - h.avgCost;
                    const pnlPct = h.avgCost > 0 ? (pnl / h.avgCost) * 100 : 0;
                    return (
                      <div key={h.id} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-accent/5 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-bold uppercase">
                            {h.symbol.slice(0, 3)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-card-foreground">{h.name}</p>
                            <p className="text-xs text-muted-foreground">{h.quantity} {h.symbol}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-card-foreground">{formatCurrency(value)}</p>
                          <p className={`text-xs font-medium ${getChangeColor(pnlPct)}`}>{formatPercent(pnlPct)}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Trading Bots Teaser */}
          <Card className="bg-gradient-to-br from-card to-accent/20 border-border shadow-md">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Trading Bots
                <Badge variant="secondary">Pro</Badge>
              </CardTitle>
              <CardDescription>Automate your strategies.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-background/50 p-3 rounded-lg border border-border/50">
                  <div className="text-[10px] uppercase text-muted-foreground font-semibold">Active</div>
                  <div className="text-xl font-bold mt-1">0</div>
                </div>
                <div className="bg-background/50 p-3 rounded-lg border border-border/50">
                  <div className="text-[10px] uppercase text-muted-foreground font-semibold">Profit</div>
                  <div className="text-xl font-bold mt-1 text-green-500">$0.00</div>
                </div>
              </div>
              <Button className="w-full" asChild>
                <Link href="/bots">Launch Bot Studio</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
