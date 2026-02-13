import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, MessageSquare, Newspaper, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatPercent } from "@/lib/utils";

interface SentimentResult {
    symbol: string;
    source: string;
    text: string;
    score: number;
    comparative: number;
    timestamp: string;
}

interface CoinSentiment {
    symbol: string;
    overallScore: number;
    sentiment: "Bullish" | "Bearish" | "Neutral";
    sources: SentimentResult[];
}

export default function SentimentBot() {
    const { data: sentiments, isLoading, refetch } = useQuery<CoinSentiment[]>({
        queryKey: ["/api/ai/sentiment"],
        refetchInterval: 60000,
    });

    const getMoodIcon = (mood: string) => {
        switch (mood) {
            case "Bullish": return <TrendingUp className="h-5 w-5 text-green-500" />;
            case "Bearish": return <TrendingDown className="h-5 w-5 text-red-500" />;
            default: return <Minus className="h-5 w-5 text-yellow-500" />;
        }
    };

    const getMoodColor = (mood: string) => {
        switch (mood) {
            case "Bullish": return "bg-green-500/10 border-green-500/20";
            case "Bearish": return "bg-red-500/10 border-red-500/20";
            default: return "bg-yellow-500/10 border-yellow-500/20";
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">AI Sentiment Analysis</h1>
                    <p className="text-muted-foreground">
                        Real-time Natural Language Processing (NLP) of news and social feeds.
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh Analysis
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {sentiments?.map((item) => (
                    <Card key={item.symbol} className={`border ${getMoodColor(item.sentiment)}`}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-lg font-bold">{item.symbol}</Badge>
                                    {getMoodIcon(item.sentiment)}
                                    <span className={`font-medium ${item.sentiment === "Bullish" ? "text-green-500" :
                                            item.sentiment === "Bearish" ? "text-red-500" : "text-yellow-500"
                                        }`}>
                                        {item.sentiment}
                                    </span>
                                </div>
                                <div className="text-sm text-muted-foreground font-mono">
                                    Score: {item.overallScore.toFixed(2)}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 mt-2">
                                {item.sources.map((source, i) => (
                                    <div key={i} className="flex gap-3 items-start p-2 rounded bg-background/50 text-sm">
                                        {source.source === "News Wire" ? (
                                            <Newspaper className="h-4 w-4 mt-0.5 text-blue-400 shrink-0" />
                                        ) : (
                                            <MessageSquare className="h-4 w-4 mt-0.5 text-pink-400 shrink-0" />
                                        )}
                                        <div className="flex-1">
                                            <p>{source.text}</p>
                                            <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                                                <span>{source.source}</span>
                                                <span>•</span>
                                                <span className={source.comparative > 0 ? "text-green-500" : source.comparative < 0 ? "text-red-500" : ""}>
                                                    Intensity: {source.comparative.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
