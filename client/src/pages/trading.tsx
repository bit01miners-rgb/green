import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTopCoins, usePortfolio, useCoinChart } from "@/hooks/useMarketData";
import { formatCurrency, formatPercent, formatCompactNumber, getChangeColor } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Star,
  Plus,
  BarChart3,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const demoHoldings = [
  { id: 1, symbol: "BTC", name: "Bitcoin", quantity: 0.5, avgCost: 45000, assetType: "crypto", currentPrice: 97500 },
  { id: 2, symbol: "ETH", name: "Ethereum", quantity: 5, avgCost: 2800, assetType: "crypto", currentPrice: 3250 },
  { id: 3, symbol: "SOL", name: "Solana", quantity: 50, avgCost: 120, assetType: "crypto", currentPrice: 195 },
  { id: 4, symbol: "AAPL", name: "Apple Inc.", quantity: 20, avgCost: 165, assetType: "stock", currentPrice: 192 },
  { id: 5, symbol: "LINK", name: "Chainlink", quantity: 200, avgCost: 12, assetType: "crypto", currentPrice: 18.5 },
];

const demoCoins = [
  { id: "bitcoin", symbol: "btc", name: "Bitcoin", image: "", current_price: 97500, market_cap: 1920000000000, price_change_percentage_24h: 2.4, total_volume: 45000000000 },
  { id: "ethereum", symbol: "eth", name: "Ethereum", image: "", current_price: 3250, market_cap: 390000000000, price_change_percentage_24h: -1.2, total_volume: 18000000000 },
  { id: "solana", symbol: "sol", name: "Solana", image: "", current_price: 195, market_cap: 92000000000, price_change_percentage_24h: 5.8, total_volume: 8500000000 },
  { id: "binancecoin", symbol: "bnb", name: "BNB", image: "", current_price: 620, market_cap: 88000000000, price_change_percentage_24h: 0.8, total_volume: 2100000000 },
  { id: "ripple", symbol: "xrp", name: "XRP", image: "", current_price: 2.45, market_cap: 141000000000, price_change_percentage_24h: -0.3, total_volume: 5200000000 },
  { id: "cardano", symbol: "ada", name: "Cardano", image: "", current_price: 0.92, market_cap: 32000000000, price_change_percentage_24h: -0.5, total_volume: 1100000000 },
  { id: "avalanche", symbol: "avax", name: "Avalanche", image: "", current_price: 38.5, market_cap: 15800000000, price_change_percentage_24h: 3.2, total_volume: 980000000 },
  { id: "polkadot", symbol: "dot", name: "Polkadot", image: "", current_price: 7.2, market_cap: 10500000000, price_change_percentage_24h: 1.1, total_volume: 420000000 },
];

export default function Trading() {
  const [selectedCoin, setSelectedCoin] = useState("bitcoin");
  const { data: coins } = useTopCoins(20);
  const { data: portfolio } = usePortfolio();
  const { data: chartData } = useCoinChart(selectedCoin, 7);

  const coinList = coins && coins.length > 0 ? coins : demoCoins;
  const holdings = portfolio && (portfolio as any[]).length > 0 ? portfolio : demoHoldings;

  const totalValue = (holdings as any[]).reduce((sum: number, h: any) => sum + h.quantity * (h.currentPrice || h.avgCost), 0);
  const totalCost = (holdings as any[]).reduce((sum: number, h: any) => sum + h.quantity * h.avgCost, 0);
  const totalPnL = totalValue - totalCost;
  const pnlPct = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  // Generate demo chart data
  const demoChart = Array.from({ length: 168 }, (_, i) => ({
    time: new Date(Date.now() - (168 - i) * 3600000).toLocaleDateString(),
    price: 95000 + Math.sin(i / 10) * 3000 + Math.random() * 1000,
  }));

  const priceChart = chartData?.prices
    ? chartData.prices.map(([t, p]: [number, number]) => ({ time: new Date(t).toLocaleDateString(), price: p }))
    : demoChart;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Trading & Investing</h1>
          <p className="text-sm text-muted-foreground">Portfolio tracking with live market data</p>
        </div>
        <Link href="/mint">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Mint New Token
          </Button>
        </Link>
      </div>

      {/* Portfolio Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Portfolio Value</p>
          <p className="mt-1 text-2xl font-bold text-card-foreground">{formatCurrency(totalValue)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Total P&L</p>
          <p className={`mt-1 text-2xl font-bold ${getChangeColor(totalPnL)}`}>
            {totalPnL >= 0 ? "+" : ""}{formatCurrency(totalPnL)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Return</p>
          <p className={`mt-1 text-2xl font-bold ${getChangeColor(pnlPct)}`}>
            {formatPercent(pnlPct)}
          </p>
        </div>
      </div>

      {/* Price Chart */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-card-foreground capitalize">{selectedCoin} — 7D Chart</h3>
          <div className="flex gap-1">
            {["1", "7", "30", "90"].map((d) => (
              <button key={d} className="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                {d}D
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={priceChart}>
            <defs>
              <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="hsl(0 0% 40%)" fontSize={10} tickLine={false} />
            <YAxis stroke="hsl(0 0% 40%)" fontSize={10} tickLine={false} domain={["auto", "auto"]} />
            <Tooltip contentStyle={{ background: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 20%)", borderRadius: "8px", fontSize: "12px" }} />
            <Area type="monotone" dataKey="price" stroke="#22c55e" fill="url(#priceGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Holdings */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">Your Holdings</h3>
          <div className="space-y-3">
            {(holdings as any[]).map((h: any) => {
              const value = h.quantity * (h.currentPrice || h.avgCost);
              const pnl = (h.currentPrice || h.avgCost) - h.avgCost;
              const pnlPct = h.avgCost > 0 ? (pnl / h.avgCost) * 100 : 0;
              return (
                <div key={h.id} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
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
            })}
          </div>
        </div>
      </div>

      {/* Bot Trading Panel */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-card-foreground">Automated Trading Bot</h3>
          <div className="flex items-center space-x-2">
            <Label htmlFor="bot-active" className="text-xs">Active</Label>
            <Switch id="bot-active" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Strategy</Label>
            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option>MACD Crossover</option>
              <option>RSI Mean Reversion</option>
              <option>Grid Trading</option>
              <option>Arbitrage (Beta)</option>
            </select>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs">Risk Level</Label>
              <span className="text-xs text-muted-foreground">Medium</span>
            </div>
            {/* Mock Slider since UI component might be missing or complex, using range input */}
            <input type="range" className="w-full accent-primary" min="1" max="10" defaultValue="5" />
          </div>
          <div className="rounded-md bg-muted p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span>24h Trades:</span>
              <span className="font-mono">12</span>
            </div>
            <div className="flex justify-between">
              <span>Win Rate:</span>
              <span className="font-mono text-green-500">68%</span>
            </div>
            <div className="flex justify-between">
              <span>Profit (24h):</span>
              <span className="font-mono text-green-500">+$124.50</span>
            </div>
          </div>
          <Button variant="outline" className="w-full text-xs" size="sm">Configure Tactics</Button>
        </div>
      </div>

      {/* Market Overview */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-card-foreground">Market Overview</h3>
        <div className="space-y-2">
          {(coinList as any[]).slice(0, 8).map((coin: any) => (
            <div
              key={coin.id}
              onClick={() => setSelectedCoin(coin.id)}
              className={`flex cursor-pointer items-center justify-between rounded-lg p-2.5 transition-colors hover:bg-accent ${selectedCoin === coin.id ? "bg-accent" : ""}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold uppercase">
                  {coin.symbol.slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">{coin.name}</p>
                  <p className="text-xs text-muted-foreground">{formatCompactNumber(coin.market_cap)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-card-foreground">{formatCurrency(coin.current_price)}</p>
                <p className={`text-xs font-medium ${getChangeColor(coin.price_change_percentage_24h)}`}>
                  {formatPercent(coin.price_change_percentage_24h)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
