import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useToast } from "@/components/ui/use-toast";
import { Bot, PlayCircle, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

export function BacktestPanel() {
    const [config, setConfig] = useState({
        strategyId: "momentum",
        pair: "ETH/USDC",
        interval: "1h",
        duration: "30" // days
    });
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const runBacktest = async () => {
        setLoading(true);
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - parseInt(config.duration));

            const res = await fetch("/api/backtest/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    strategyId: config.strategyId,
                    config: { pair: config.pair, interval: config.interval },
                    range: { start: startDate.toISOString() }
                })
            });

            if (!res.ok) throw new Error("Backtest failed");
            const data = await res.json();
            setResult(data);
            toast({ title: "Backtest Complete", description: `Returns: ${data.totalPnL.toFixed(2)} (${data.trades.length} trades)` });
        } catch (err) {
            toast({ title: "Error", description: "Failed to run simulation", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Controls */}
            <div className="flex gap-4 p-4 border rounded-lg bg-card/50">
                <div className="grid grid-cols-4 gap-4 flex-1">
                    <Select value={config.strategyId} onValueChange={(v) => setConfig({ ...config, strategyId: v })}>
                        <SelectTrigger><SelectValue placeholder="Strategy" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="momentum">Momentum AI</SelectItem>
                            <SelectItem value="grid">Grid Trading</SelectItem>
                            <SelectItem value="rsi">RSI Reversal</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input
                        value={config.pair}
                        onChange={(e) => setConfig({ ...config, pair: e.target.value })}
                        placeholder="Pair (e.g. ETH/USDC)"
                    />
                    <Select value={config.duration} onValueChange={(v) => setConfig({ ...config, duration: v })}>
                        <SelectTrigger><SelectValue placeholder="Duration" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Last 7 Days</SelectItem>
                            <SelectItem value="30">Last 30 Days</SelectItem>
                            <SelectItem value="90">Last 90 Days</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={runBacktest} disabled={loading}>
                        {loading ? "Simulating..." : <><PlayCircle className="mr-2 h-4 w-4" /> Run Simulation</>}
                    </Button>
                </div>
            </div>

            {/* Results */}
            {result ? (
                <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                    {/* Metrics */}
                    <div className="grid grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="py-2"><CardTitle className="text-sm text-muted-foreground">Total PnL</CardTitle></CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${result.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    ${result.totalPnL.toFixed(2)}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="py-2"><CardTitle className="text-sm text-muted-foreground">Win Rate</CardTitle></CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{result.winRate.toFixed(1)}%</div>
                                <div className="text-xs text-muted-foreground">{result.winningTrades}W / {result.losingTrades}L</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="py-2"><CardTitle className="text-sm text-muted-foreground">Max Drawdown</CardTitle></CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-500">-{result.maxDrawdown.toFixed(2)}%</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="py-2"><CardTitle className="text-sm text-muted-foreground">Sharpe Ratio</CardTitle></CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{result.sharpeRatio.toFixed(2)}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Equity Curve */}
                    <Card className="flex-1 min-h-[300px] p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={result.equityCurve}>
                                <defs>
                                    <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="time" hide />
                                <YAxis domain={['auto', 'auto']} orientation="right" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111', borderColor: '#333' }}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#22c55e"
                                    fillOpacity={1}
                                    fill="url(#colorPnL)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                    <Bot className="h-16 w-16 mb-4 opacity-20" />
                    <p>Configure simulation parameters above and click Run.</p>
                </div>
            )}
        </div>
    );
}
