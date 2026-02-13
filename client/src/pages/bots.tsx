import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Pause, Activity, RefreshCw, Terminal, Cpu, Zap, Settings, BarChart as BarChartIcon, Trophy, Plus, Rocket, X, TrendingUp, Lock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { BacktestPanel } from "@/components/BacktestPanel"; // Import BacktestPanel

// --- Types ---

interface Bot {
    id: string;
    name: string;
    status: 'running' | 'stopped' | 'error';
    config: {
        mode: 'LIVE' | 'PAPER';
        pair: string;
        exchange: string;
        interval: string;
        params: any;
    };
    performance: {
        totalTrades: number;
        wins: number;
        losses: number;
        pnl: number;
        winRate: number;
    };
}

interface Strategy {
    id: string;
    name: string;
    description: string;
    category: string;
    risk: 'Low' | 'Medium' | 'High';
    minCapital: number;
}

// --- Chart Component ---

const BotChart = ({ data, activeTrade }: { data: any[], activeTrade?: any }) => {
    return (
        <div className="h-[400px] w-full bg-black/40 rounded-lg border border-white/10 p-4 backdrop-blur-sm">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis domain={['auto', 'auto']} orientation="right" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }}
                        itemStyle={{ color: '#22c55e' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#22c55e"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                        isAnimationActive={false}
                    />
                    {activeTrade && (
                        <ReferenceDot
                            x={activeTrade.time}
                            y={activeTrade.price}
                            r={6}
                            fill={activeTrade.type === 'BUY' ? '#22c55e' : '#ef4444'}
                            stroke="#fff"
                            strokeWidth={2}
                        />
                    )}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

// --- Mock Data Generator ---

const generateMockData = (startValue: number, count: number) => {
    let currentValue = startValue;
    return Array.from({ length: count }, (_, i) => {
        const change = (Math.random() - 0.5) * (startValue * 0.002);
        currentValue += change;
        return {
            time: new Date(Date.now() - (count - i) * 60000).toLocaleTimeString(),
            value: currentValue
        };
    });
};

// --- Main Page Component ---

export default function TradingBots() {
    const [bots, setBots] = useState<Bot[]>([]);
    const [strategies, setStrategies] = useState<Strategy[]>([]);
    const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
    const [chartData, setChartData] = useState<any[]>([]);

    // New Bot Config State
    const [newBotConfig, setNewBotConfig] = useState({
        name: "",
        pair: "ETH/USDC",
        interval: "1h",
        mode: "PAPER",
        amount: "100"
    });

    const { toast } = useToast();
    const logsEndRef = useRef<HTMLDivElement>(null);

    // Initial Load
    useEffect(() => {
        fetchBots();
        fetchStrategies();
        // Init chart data
        setChartData(generateMockData(2000, 50));
    }, []);

    // Auto-scroll logs
    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    // Live Data Simulation
    useEffect(() => {
        const interval = setInterval(() => {
            if (selectedBotId) {
                // Update Logs
                fetchLogs();

                // Update Chart
                setChartData(prev => {
                    const lastValue = prev[prev.length - 1].value;
                    const newValue = lastValue + (Math.random() - 0.5) * (lastValue * 0.005);
                    const newPoint = {
                        time: new Date().toLocaleTimeString(),
                        value: newValue
                    };
                    return [...prev.slice(1), newPoint];
                });
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [selectedBotId]);

    const fetchBots = async () => {
        try {
            const res = await fetch('/api/bots');
            if (res.ok) {
                const data = await res.json();
                setBots(data);
                if (!selectedBotId && data.length > 0) setSelectedBotId(data[0].id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStrategies = async () => {
        try {
            const res = await fetch('/api/bots/strategies');
            if (res.ok) {
                const data = await res.json();
                // Augment with UI-specific fields if missing
                const augmented = data.map((s: any) => ({
                    ...s,
                    risk: s.id === 'arbitrage' ? 'Low' : s.id === 'momentum' ? 'High' : 'Medium',
                    minCapital: s.id === 'arbitrage' ? 5000 : 100
                }));
                setStrategies(augmented);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchLogs = async () => {
        if (!selectedBotId) return;
        try {
            const res = await fetch(`/api/bots/${selectedBotId}/logs`);
            if (res.ok) setLogs(await res.json());
        } catch (err) {
            console.error(err);
        }
    };

    const toggleBot = async (bot: Bot) => {
        const action = bot.status === 'running' ? 'stop' : 'start';
        try {
            const res = await fetch(`/api/bots/${bot.id}/${action}`, { method: 'POST' });
            if (!res.ok) throw new Error(`Failed to ${action} bot`);
            toast({ title: `Bot ${action}ed`, description: `Successfully ${action}ed ${bot.name}` });
            fetchBots();
        } catch (err) {
            toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
        }
    };

    const handleCreateBot = async () => {
        if (!selectedStrategy) return;
        try {
            const res = await fetch('/api/bots/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: selectedStrategy.id,
                    config: {
                        name: newBotConfig.name || `${selectedStrategy.name} ${bots.length + 1}`,
                        pair: newBotConfig.pair,
                        interval: newBotConfig.interval,
                        mode: newBotConfig.mode,
                        initialBalance: Number(newBotConfig.amount),
                        exchange: 'gen-exchange',
                        params: {}
                    }
                })
            });
            if (!res.ok) throw new Error("Failed to create bot");

            toast({ title: "Studio Deployed", description: `${selectedStrategy.name} instance created successfully.` });
            setIsCreateOpen(false);
            fetchBots();
        } catch (err) {
            toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
        }
    };

    const selectedBot = bots.find(b => b.id === selectedBotId);

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col p-4 gap-4 animate-in fade-in duration-500 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Terminal className="h-6 w-6 text-primary" />
                        Bot Studio Terminal
                    </h1>
                    <p className="text-muted-foreground text-sm">Deploy and monitor algorithmic trading studios.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchBots}>
                        <RefreshCw className="mr-2 h-4 w-4" /> Sync
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="terminal" className="flex-1 flex flex-col min-h-0">
                <TabsList className="w-full justify-start border-b rounded-none h-12 bg-transparent p-0">
                    <TabsTrigger value="terminal" className="data-[state=active]:bg-primary/10 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-6">
                        <Activity className="h-4 w-4 mr-2" /> Live Terminal
                    </TabsTrigger>
                    <TabsTrigger value="studio" className="data-[state=active]:bg-primary/10 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-6">
                        <Cpu className="h-4 w-4 mr-2" /> Studio Marketplace
                    </TabsTrigger>
                    <TabsTrigger value="backtest" className="data-[state=active]:bg-primary/10 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-6">
                        <BarChartIcon className="h-4 w-4 mr-2" /> Strategy Backtest
                    </TabsTrigger>
                </TabsList>

                {/* --- TERMINAL VIEW --- */}
                <TabsContent value="terminal" className="flex-1 flex gap-4 min-h-0 mt-4 h-full">

                    {/* Left Sidebar: Bot Fleet */}
                    <Card className="w-64 flex flex-col shadow-md border-r shrink-0 h-full">
                        <CardHeader className="py-3 px-4 border-b">
                            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Active Studios</CardTitle>
                        </CardHeader>
                        <ScrollArea className="flex-1">
                            <div className="p-2 space-y-2">
                                {bots.map(bot => (
                                    <div
                                        key={bot.id}
                                        onClick={() => { setSelectedBotId(bot.id); setLogs([]); }}
                                        className={`flex flex-col gap-2 p-3 rounded-lg border cursor-pointer transition-all hover:bg-accent/50 ${selectedBotId === bot.id ? 'bg-primary/5 border-primary/50' : 'border-transparent'}`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-sm">{bot.name}</span>
                                            <div className={`h-2 w-2 rounded-full ${bot.status === 'running' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-muted-foreground"}`} />
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                                            <span>{bot.config.pair}</span>
                                            <Badge variant={bot.config.mode === 'LIVE' ? 'destructive' : 'secondary'} className="text-[10px] h-4 px-1">
                                                {bot.config.mode}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                                {bots.length === 0 && <div className="text-center text-xs text-muted-foreground py-10">No active studios.</div>}
                            </div>
                        </ScrollArea>
                    </Card>

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-y-auto">
                        {selectedBot ? (
                            <>
                                {/* Top: Stats Row */}
                                <div className="grid grid-cols-4 gap-4 shrink-0">
                                    <Card className="bg-card/50">
                                        <CardContent className="p-4 flex flex-col gap-1">
                                            <span className="text-xs text-muted-foreground uppercase">Net PnL</span>
                                            <span className={`text-xl font-bold ${selectedBot.performance.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {selectedBot.performance.pnl >= 0 ? '+' : ''}{selectedBot.performance.pnl}%
                                            </span>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-card/50">
                                        <CardContent className="p-4 flex flex-col gap-1">
                                            <span className="text-xs text-muted-foreground uppercase">Total Trades</span>
                                            <span className="text-xl font-bold">{selectedBot.performance.totalTrades}</span>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-card/50">
                                        <CardContent className="p-4 flex flex-col gap-1">
                                            <span className="text-xs text-muted-foreground uppercase">Win Rate</span>
                                            <span className="text-xl font-bold">{selectedBot.performance.winRate}%</span>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-card/50 flex items-center justify-center">
                                        <Button
                                            variant={selectedBot.status === 'running' ? "destructive" : "default"}
                                            className="w-full mx-4"
                                            onClick={() => toggleBot(selectedBot)}
                                        >
                                            {selectedBot.status === 'running' ? <><Pause className="mr-2 h-4 w-4" /> Stop Studio</> : <><Play className="mr-2 h-4 w-4" /> Run Studio</>}
                                        </Button>
                                    </Card>
                                </div>

                                {/* Middle: Chart */}
                                <div className="relative group shrink-0">
                                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                                        <Badge variant="outline" className="bg-background/80 backdrop-blur text-xs">
                                            {selectedBot.config.pair}
                                        </Badge>
                                        <Badge variant="outline" className="bg-background/80 backdrop-blur text-xs">
                                            {selectedBot.config.interval}
                                        </Badge>
                                    </div>
                                    <BotChart data={chartData} />
                                </div>

                                {/* Bottom: Logs Terminal */}
                                <Card className="flex-1 bg-black border-zinc-800 shadow-inner flex flex-col min-h-[200px]">
                                    <CardHeader className="py-2 px-4 bg-zinc-900 border-b border-zinc-800 flex flex-row items-center justify-between h-10">
                                        <div className="flex items-center gap-2">
                                            <Terminal className="h-3 w-3 text-zinc-400" />
                                            <span className="text-xs font-mono text-zinc-400">system_output.log</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1 p-0 overflow-hidden font-mono text-xs text-green-500/90 relative">
                                        <ScrollArea className="h-full p-4">
                                            {logs.length === 0 ? (
                                                <div className="text-zinc-600 italic">Waiting for execution signals...</div>
                                            ) : logs.map((log, i) => (
                                                <div key={i} className="mb-px whitespace-nowrap">{log}</div>
                                            ))}
                                            <div ref={logsEndRef} />
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                                <BarChartIcon className="h-24 w-24 opacity-10 mb-4" />
                                <h3 className="text-lg font-medium">No Studio Selected</h3>
                                <p>Select an active studio from the fleet or deploy a new one.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* --- STUDIO MARKETPLACE VIEW --- */}
                <TabsContent value="studio" className="mt-4 overflow-y-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
                        {strategies.map(strategy => (
                            <Card key={strategy.id} className="group hover:border-primary transition-all duration-300 overflow-hidden border-l-4 border-l-muted hover:border-l-primary flex flex-col">
                                <CardHeader className="pb-3 bg-gradient-to-br from-transparent to-accent/20">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge>{strategy.category}</Badge>
                                        {strategy.id === 'arbitrage' || strategy.id === 'flash-loan' ? (
                                            <Lock className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <TrendingUp className="h-4 w-4 text-green-500" />
                                        )}
                                    </div>
                                    <CardTitle className="text-xl">{strategy.name}</CardTitle>
                                    <CardDescription className="line-clamp-2 h-10">{strategy.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="py-4 space-y-4 flex-1">
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="flex flex-col">
                                            <span className="text-muted-foreground text-xs uppercase">Risk Profile</span>
                                            <span className={`font-medium ${strategy.risk === 'High' ? 'text-red-500' : 'text-blue-500'}`}>{strategy.risk}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-muted-foreground text-xs uppercase">Min. Capital</span>
                                            <span className="font-medium">${strategy.minCapital}</span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground bg-accent/50 p-2 rounded">
                                        Requires authorized access. Standard implementation uses paper trading by default.
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-0">
                                    <Button className="w-full" onClick={() => { setSelectedStrategy(strategy); setIsCreateOpen(true); }}>
                                        <Plus className="mr-2 h-4 w-4" /> Deploy Studio
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* --- BACKTEST VIEW --- */}
                <TabsContent value="backtest" className="flex-1 mt-4 overflow-hidden">
                    <BacktestPanel />
                </TabsContent>

            </Tabs>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Deploy {selectedStrategy?.name}</DialogTitle>
                        <DialogDescription>Configure the initial parameters for this trading studio.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Instance Name</Label>
                                <Input
                                    value={newBotConfig.name}
                                    onChange={(e) => setNewBotConfig({ ...newBotConfig, name: e.target.value })}
                                    placeholder="e.g. Primary Alpha Stream"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Trading Pair</Label>
                                <Input
                                    value={newBotConfig.pair}
                                    onChange={(e) => setNewBotConfig({ ...newBotConfig, pair: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Capital Allocation</Label>
                                <Input
                                    type="number"
                                    value={newBotConfig.amount}
                                    onChange={(e) => setNewBotConfig({ ...newBotConfig, amount: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Execution Mode</Label>
                                <Select
                                    value={newBotConfig.mode}
                                    onValueChange={(val) => setNewBotConfig({ ...newBotConfig, mode: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PAPER">Paper Trading (Simulation)</SelectItem>
                                        <SelectItem value="LIVE">Live Execution (Real)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="bg-yellow-500/10 p-3 rounded text-xs text-yellow-600 border border-yellow-500/20">
                            <strong>Note:</strong> Live execution requires API keys configured in server settings. Defaulting to standard safe parameters.
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateBot}>Launch Studio</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
