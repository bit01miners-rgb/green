import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Zap, TrendingUp, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface FlashLoanResult {
    success: boolean;
    profit: number;
    gasUsed: number;
    txHash: string;
    message: string;
}

export default function FlashLoanExecutor() {
    const { toast } = useToast();
    const [amount, setAmount] = useState("");
    const [asset, setAsset] = useState("ETH");
    const [direction, setDirection] = useState("Long");
    const [result, setResult] = useState<FlashLoanResult | null>(null);

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("POST", "/api/defi/flash-loan", data);
            return res.json();
        },
        onSuccess: (data: FlashLoanResult) => {
            setResult(data);
            if (data.success) {
                toast({ title: "Execution Successful", description: `Profit: ${formatCurrency(data.profit)}` });
            } else {
                toast({ variant: "destructive", title: "Execution Failed", description: data.message });
            }
        },
        onError: (error: any) => {
            toast({ variant: "destructive", title: "Error", description: error.message });
        }
    });

    const handleExecute = () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast({ variant: "destructive", title: "Invalid Amount", description: "Please enter a positive amount." });
            return;
        }
        mutation.mutate({ asset, amount: parseFloat(amount), direction, targetDex: "Uniswap V3" });
    };

    return (
        <div className="container mx-auto max-w-2xl py-10 space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-3 bg-yellow-500/10 rounded-full mb-4">
                    <Zap className="h-8 w-8 text-yellow-500" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">Flash Loan Executor</h1>
                <p className="text-muted-foreground">
                    Execute atomic arbitrage strategies without collateral. High risk, high reward.
                </p>
            </div>

            <Card className="border-yellow-500/20 shadow-lg shadow-yellow-500/5">
                <CardHeader>
                    <CardTitle>Configure Strategy</CardTitle>
                    <CardDescription>Select asset and parameters for the atomic transaction.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Asset</Label>
                            <Select value={asset} onValueChange={setAsset}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                                    <SelectItem value="WBTC">Wrapped BTC (WBTC)</SelectItem>
                                    <SelectItem value="USDC">USDC</SelectItem>
                                    <SelectItem value="DAI">DAI</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Direction</Label>
                            <Select value={direction} onValueChange={setDirection}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Long">Long / Buy</SelectItem>
                                    <SelectItem value="Short">Short / Sell</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Loan Amount</Label>
                        <div className="relative">
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="pl-8"
                            />
                            <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Max liquidity available: $10,000,000</p>
                    </div>

                    <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white" size="lg" onClick={handleExecute} disabled={mutation.isPending}>
                        {mutation.isPending ? (
                            <>
                                <Zap className="mr-2 h-4 w-4 animate-pulse" />
                                Executing Atomic Transaction...
                            </>
                        ) : (
                            <>
                                <Zap className="mr-2 h-4 w-4" />
                                Execute Flash Loan
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {result && (
                <Card className={`animate-in slide-in-from-bottom-5 duration-500 border ${result.success ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5"}`}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {result.success ? <CheckCircle2 className="text-green-500" /> : <XCircle className="text-red-500" />}
                            {result.success ? "Execution Successful" : "Execution Reverted"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Transaction Hash:</span>
                            <span className="font-mono text-xs truncate w-32">{result.txHash}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Gas Used:</span>
                            <span>{result.gasUsed.toLocaleString()} Gwei</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t pt-2 mt-4">
                            <span>Net Profit:</span>
                            <span className={result.success ? "text-green-500" : "text-gray-500"}>
                                {formatCurrency(result.profit)}
                            </span>
                        </div>
                        {!result.success && (
                            <div className="p-2 bg-red-500/10 text-red-500 text-sm rounded mt-2">
                                {result.message}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg flex gap-3 text-sm text-blue-500">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <p>
                    Flash loans are advanced DeFi tools. If the arbitrage strategy does not yield enough profit to repay the loan + fee, the entire transaction will revert.
                </p>
            </div>
        </div>
    );
}
