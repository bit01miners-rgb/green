import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, ShieldCheck, ArrowRight, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface OptimizationSuggestion {
    action: "Deposit" | "Repay" | "Borrow More" | "Do Nothing";
    asset: string;
    amount: number;
    reason: string;
    projectedHealthFactor: number;
}

interface CollateralResult {
    currentHealthFactor: number;
    totalCollateralUSD: number;
    totalDebtUSD: number;
    suggestions: OptimizationSuggestion[];
}

export default function CollateralOptimizer() {
    const { data, isLoading } = useQuery<CollateralResult>({
        queryKey: ["/api/lending/optimization"]
    });

    if (isLoading) {
        return <div className="p-10 text-center">Loading Optimization Data...</div>;
    }

    // Safety colors
    const healthColor = (hf: number) => {
        if (hf < 1.1) return "text-red-500";
        if (hf < 1.5) return "text-yellow-500";
        return "text-green-500";
    };

    const healthBg = (hf: number) => {
        if (hf < 1.1) return "bg-red-500";
        if (hf < 1.5) return "bg-yellow-500";
        return "bg-green-500";
    };

    const hf = data?.currentHealthFactor || 999;
    const isInfinite = hf > 100;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Collateral Optimizer</h1>
                    <p className="text-muted-foreground">
                        AI-driven analysis to maximize capital efficiency and avoid liquidation.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>Health Factor</CardTitle>
                        <CardDescription>Keep above 1.0 to avoid liquidation.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-5xl font-bold mb-4 ${healthColor(hf)}`}>
                            {isInfinite ? "∞" : hf.toFixed(2)}
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Liquidation Risk</span>
                                <span>{isInfinite ? "0%" : hf < 1 ? "100%" : `${(100 / hf).toFixed(1)}%`}</span>
                            </div>
                            <Progress value={isInfinite ? 100 : Math.min(100, hf * 33)} className={`h-2 ${healthBg(hf)}`} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>Portfolio Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="flex justify-between items-center bg-secondary/20 p-3 rounded">
                            <span className="text-muted-foreground">Total Collateral</span>
                            <span className="font-bold text-lg">{formatCurrency(data?.totalCollateralUSD || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center bg-secondary/20 p-3 rounded">
                            <span className="text-muted-foreground">Total Debt</span>
                            <span className="font-bold text-lg">{formatCurrency(data?.totalDebtUSD || 0)}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <h2 className="text-xl font-semibold mt-6">Optimization Suggestions</h2>
            <div className="grid gap-4">
                {data?.suggestions.map((item, i) => (
                    <Card key={i} className="border-l-4 border-l-primary">
                        <CardContent className="flex items-center justify-between p-6">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 font-bold text-lg">
                                    {item.action === "Do Nothing" ? <ShieldCheck className="text-green-500" /> : <TrendingUp className="text-blue-500" />}
                                    {item.action} {item.asset !== "-" && item.asset}
                                </div>
                                <p className="text-muted-foreground">{item.reason}</p>
                            </div>
                            {item.action !== "Do Nothing" && (
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-sm text-muted-foreground">Projected Health</div>
                                        <div className={`font-bold ${healthColor(item.projectedHealthFactor)}`}>
                                            {item.projectedHealthFactor.toFixed(2)}
                                        </div>
                                    </div>
                                    <Button>
                                        Execute <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
