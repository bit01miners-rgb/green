import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Send,
    Bot,
    User,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle2,
    LineChart,
    BrainCircuit,
    ShieldCheck
} from "lucide-react";
import {
    LineChart as RechartsLineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface Message {
    role: "user" | "assistant";
    message: string;
    createdAt?: string;
}

interface SpendingPrediction {
    date: string;
    predictedAmount: string;
    categoryBreakdown: Record<string, string>;
}

interface ForecastData {
    predictions: SpendingPrediction[];
    totalPredicted: string;
    averageDaily: string;
    confidence: "high" | "medium" | "low";
}

interface InsightsData {
    spendingChange: string;
    categoryBreakdown: Record<string, number>;
    budgetAlerts: {
        category: string;
        spent: string;
        limit: string;
        utilization: string;
        status: "exceeded" | "warning";
    }[];
    savingsProgress: {
        name: string;
        progress: string;
        remaining: string;
    }[];
    insights: string[];
}

interface RiskScoreData {
    score: number;
    grade: string;
    factors: {
        factor: string;
        impact: "positive" | "negative" | "neutral";
        description: string;
    }[];
}

export default function AiAdvisor() {
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Queries
    const { data: chatHistory, isLoading: isLoadingChat } = useQuery<Message[]>({
        queryKey: ["/api/ai/chat/history"],
    });

    const { data: forecast, isLoading: isLoadingForecast } = useQuery<ForecastData>({
        queryKey: ["/api/ai/forecast", { days: 30 }],
    });

    const { data: insights, isLoading: isLoadingInsights } = useQuery<InsightsData>({
        queryKey: ["/api/ai/insights"],
    });

    const { data: riskScore, isLoading: isLoadingRisk } = useQuery<RiskScoreData>({
        queryKey: ["/api/ai/risk-score"],
    });

    // Chat Mutation
    const chatMutation = useMutation({
        mutationFn: async (message: string) => {
            const res = await apiRequest("/api/ai/chat", {
                method: "POST",
                body: JSON.stringify({ message }),
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ai/chat/history"] });
            setInput("");
        },
    });

    // Auto-scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory, chatMutation.isPending]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || chatMutation.isPending) return;
        chatMutation.mutate(input);
    };

    return (
        <div className="space-y-6 pt-4 pb-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">AI Financial Advisor</h1>
                    <p className="text-muted-foreground">
                        Your personal AI assistant for financial planning and insights
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="h-8 gap-1 pl-2 pr-3">
                        <BrainCircuit className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-medium">AI Powered</span>
                    </Badge>
                    {isLoadingRisk ? (
                        <Skeleton className="h-8 w-24" />
                    ) : riskScore ? (
                        <Badge variant={riskScore.score >= 700 ? "default" : "secondary"} className="h-8 gap-1 pl-2 pr-3">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">Score: {riskScore.score}</span>
                        </Badge>
                    ) : null}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 lg:h-[calc(100vh-12rem)]">
                {/* Chat Interface - Stretches to fill height */}
                <Card className="flex flex-col h-[600px] lg:h-auto border-muted shadow-sm">
                    <CardHeader className="border-b bg-muted/40 px-6 py-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Bot className="h-5 w-5 text-primary" />
                            AI Assistant
                        </CardTitle>
                        <CardDescription>
                            Ask about your budget, loans, or investment advice
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 flex flex-col min-h-0">
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {isLoadingChat ? (
                                    <div className="space-y-4">
                                        <div className="flex gap-3">
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-10 w-[200px]" />
                                                <Skeleton className="h-10 w-[150px]" />
                                            </div>
                                        </div>
                                    </div>
                                ) : chatHistory?.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center p-8 text-muted-foreground">
                                        <Bot className="h-12 w-12 mb-4 opacity-20" />
                                        <p>No messages yet. Start a conversation!</p>
                                        <p className="text-sm mt-2">Try asking: "How is my spending this month?"</p>
                                    </div>
                                ) : (
                                    <>
                                        {chatHistory?.map((msg, idx) => (
                                            <div
                                                key={idx}
                                                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"
                                                    }`}
                                            >
                                                {msg.role === "assistant" && (
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                        <Bot className="h-4 w-4 text-primary" />
                                                    </div>
                                                )}
                                                <div
                                                    className={`rounded-lg px-4 py-2 max-w-[80%] text-sm ${msg.role === "user"
                                                            ? "bg-primary text-primary-foreground"
                                                            : "bg-muted text-foreground"
                                                        }`}
                                                >
                                                    {msg.message}
                                                </div>
                                                {msg.role === "user" && (
                                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {chatMutation.isPending && (
                                            <div className="flex gap-3 justify-start">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                    <Bot className="h-4 w-4 text-primary" />
                                                </div>
                                                <div className="rounded-lg px-4 py-2 bg-muted text-foreground flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                                    <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                                    <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                                </div>
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </>
                                )}
                            </div>
                        </ScrollArea>
                        <div className="p-4 border-t bg-background">
                            <form onSubmit={handleSend} className="flex gap-2">
                                <Input
                                    placeholder="Type your message..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    disabled={chatMutation.isPending}
                                    className="flex-1"
                                />
                                <Button type="submit" size="icon" disabled={chatMutation.isPending || !input.trim()}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column - Insights & Charts */}
                <div className="space-y-6 overflow-y-auto pr-1">
                    {/* Smart Insights */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <BrainCircuit className="h-5 w-5 text-indigo-500" />
                                Smart Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoadingInsights ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-5/6" />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Spending Trend */}
                                    {insights && (
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            {Number(insights.spendingChange) > 0 ? (
                                                <div className="flex items-center text-red-500 gap-1 bg-red-500/10 px-2 py-1 rounded">
                                                    <TrendingUp className="h-4 w-4" />
                                                    <span>+{insights.spendingChange}% Spending</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-green-500 gap-1 bg-green-500/10 px-2 py-1 rounded">
                                                    <TrendingDown className="h-4 w-4" />
                                                    <span>{insights.spendingChange}% Spending</span>
                                                </div>
                                            )}

                                            {Number(insights.spendingChange) > 0
                                                ? <span className="text-muted-foreground">higher than last month</span>
                                                : <span className="text-muted-foreground">lower than last month</span>
                                            }
                                        </div>
                                    )}

                                    <Separator />

                                    {/* Alerts & Insights List */}
                                    <div className="space-y-3">
                                        {insights?.budgetAlerts.map((alert, i) => (
                                            <div key={`alert-${i}`} className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                                                <div className="text-sm">
                                                    <span className="font-semibold text-orange-700">{alert.category} Budget:</span>
                                                    <span className="text-orange-600/90 ml-1">
                                                        {alert.status === "exceeded" ? "Exceeded limit" : "Approaching limit"} (${alert.spent} / ${alert.limit})
                                                    </span>
                                                </div>
                                            </div>
                                        ))}

                                        {insights?.insights.slice(0, 3).map((insight, i) => (
                                            <div key={`insight-${i}`} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                                <p>{insight}</p>
                                            </div>
                                        ))}

                                        {!insights?.budgetAlerts.length && !insights?.insights.length && (
                                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                No critical alerts. You are on track!
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Spending Forecast Chart */}
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <LineChart className="h-5 w-5 text-emerald-500" />
                                30-Day Spending Forecast
                            </CardTitle>
                            <CardDescription>
                                Projected spending based on your transaction history
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px] w-full">
                                {isLoadingForecast ? (
                                    <Skeleton className="h-full w-full" />
                                ) : forecast?.predictions ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={forecast.predictions}>
                                            <defs>
                                                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                tickFormatter={(val) => `$${val}`}
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip
                                                formatter={(value: any) => [`$${Number(value).toFixed(2)}`, "Predicted Spending"]}
                                                labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                                contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="predictedAmount"
                                                stroke="#10b981"
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill="url(#colorPredicted)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-muted-foreground">
                                        Not enough data for forecast
                                    </div>
                                )}
                            </div>

                            {forecast && (
                                <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4">
                                    <div className="text-center">
                                        <p className="text-xs text-muted-foreground uppercase">Projected Total</p>
                                        <p className="font-bold text-lg">{formatCurrency(Number(forecast.totalPredicted))}</p>
                                    </div>
                                    <div className="text-center border-l border-r">
                                        <p className="text-xs text-muted-foreground uppercase">Daily Avg</p>
                                        <p className="font-bold text-lg">{formatCurrency(Number(forecast.averageDaily))}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-muted-foreground uppercase">Confidence</p>
                                        <Badge variant={forecast.confidence === "high" ? "default" : forecast.confidence === "medium" ? "secondary" : "outline"} className="mt-1">
                                            {forecast.confidence.toUpperCase()}
                                        </Badge>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
