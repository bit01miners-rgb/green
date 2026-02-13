import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, ArrowRight } from "lucide-react";
import { formatPercent, formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface ArbitrageOpportunity {
    symbol: string;
    buyAt: string;
    sellAt: string;
    buyPrice: number;
    sellPrice: number;
    profitPct: number;
    confidence: number;
}

export default function ArbitrageScanner() {
    const { toast } = useToast();
    const { data: opportunities, isLoading, refetch } = useQuery<ArbitrageOpportunity[]>({
        queryKey: ["/api/defi/arbitrage"],
        refetchInterval: 30000, // Auto-refresh every 30s
    });

    const handleExecute = (opp: ArbitrageOpportunity) => {
        // In a real app, this would trigger a flash loan contract
        toast({
            title: "Arbitrage Execution Initiated",
            description: `Buying ${opp.symbol} on ${opp.buyAt} and selling on ${opp.sellAt}. Estimated profit: ${formatPercent(opp.profitPct)}`,
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">AI Arbitrage Scanner</h1>
                    <p className="text-muted-foreground">
                        Live cross-exchange market analysis powered by ML algorithms.
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh Scan
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {opportunities?.slice(0, 3).map((opp, i) => (
                    <Card key={i} className="border-primary/20 bg-primary/5">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <Badge variant="outline" className="bg-background">{opp.symbol}</Badge>
                                <Badge className="bg-green-600 hover:bg-green-700">
                                    {formatPercent(opp.profitPct)} Profit
                                </Badge>
                            </div>
                            <CardTitle className="text-lg mt-2 flex items-center gap-2">
                                {opp.buyAt} <ArrowRight className="h-4 w-4" /> {opp.sellAt}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm space-y-1 mb-4">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Buy Price:</span>
                                    <span className="font-mono">{formatCurrency(opp.buyPrice)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Sell Price:</span>
                                    <span className="font-mono">{formatCurrency(opp.sellPrice)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">AI Confidence:</span>
                                    <span className="font-bold text-blue-500">{(opp.confidence * 100).toFixed(0)}%</span>
                                </div>
                            </div>
                            <Button className="w-full" onClick={() => handleExecute(opp)}>
                                <TrendingUp className="mr-2 h-4 w-4" />
                                Auto-Execute Trade
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Market Opportunities</CardTitle>
                    <CardDescription>Full list of detected price discrepancies.</CardDescription>
                </CardHeader>
                <CardContent>
                    {!opportunities?.length ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Scanning markets...
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {opportunities.map((opp, i) => (
                                <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="font-bold w-12">{opp.symbol}</div>
                                        <div className="text-sm">
                                            <span className="text-green-500">Buy {opp.buyAt}</span>
                                            <span className="mx-2 text-muted-foreground">→</span>
                                            <span className="text-red-500">Sell {opp.sellAt}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="font-bold text-green-600">{formatPercent(opp.profitPct)}</div>
                                            <div className="text-xs text-muted-foreground">Spread</div>
                                        </div>
                                        <Button size="sm" variant="secondary" onClick={() => handleExecute(opp)}>Trade</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
