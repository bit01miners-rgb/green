import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ArrowDownUp, Settings, Info, RefreshCw, Wallet, ChevronDown, Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

const TOKENS = [
    { symbol: "ETH", name: "Ethereum", balance: "1.45", icon: "🔷" },
    { symbol: "BTC", name: "Bitcoin", balance: "0.12", icon: "₿" },
    { symbol: "USDC", name: "USD Coin", balance: "5,230.00", icon: "💲" },
    { symbol: "SOL", name: "Solana", balance: "145.20", icon: "◎" },
    { symbol: "GF", name: "Green Fund", balance: "10,000.00", icon: "🌱" },
];

export default function Swap() {
    const [fromToken, setFromToken] = useState("ETH");
    const [toToken, setToToken] = useState("USDC");
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [slippage, setSlippage] = useState("0.5");
    const { toast } = useToast();

    const fromTokenData = TOKENS.find(t => t.symbol === fromToken);
    const toTokenData = TOKENS.find(t => t.symbol === toToken);

    const handleSwap = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: "Swap Successful",
                description: `Swapped ${amount} ${fromToken} for ${toToken}`,
            });
            setAmount("");
        }, 1500);
    };

    const handleSwitchTokens = () => {
        setFromToken(toToken);
        setToToken(fromToken);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 space-y-8 animate-in fade-in duration-500">

            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Swap Tokens</h1>
                <p className="text-muted-foreground">Exchange assets instantly with low fees.</p>
            </div>

            <Card className="w-full max-w-md border-border shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-green-400" />

                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg">Exchange</CardTitle>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Settings className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Swap Settings</DialogTitle>
                                <DialogDescription>Configure your transaction preferences.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Slippage Tolerance</Label>
                                    <div className="flex gap-2">
                                        {["0.1", "0.5", "1.0"].map((val) => (
                                            <Button
                                                key={val}
                                                variant={slippage === val ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setSlippage(val)}
                                            >
                                                {val}%
                                            </Button>
                                        ))}
                                        <div className="relative flex-1">
                                            <Input
                                                value={slippage}
                                                onChange={(e) => setSlippage(e.target.value)}
                                                className="text-right pr-6"
                                            />
                                            <span className="absolute right-2 top-2.5 text-xs text-muted-foreground ml-1">%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* From Section */}
                    <div className="bg-muted/40 p-4 rounded-xl space-y-2 border border-border/50 hover:border-border transition-colors">
                        <div className="flex justify-between text-xs text-muted-foreground font-medium">
                            <span>You Pay</span>
                            <span>Balance: <span className="text-foreground">{fromTokenData?.balance}</span></span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Input
                                type="number"
                                placeholder="0.0"
                                className="bg-transparent border-none text-3xl font-bold p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/50"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                            <Select value={fromToken} onValueChange={setFromToken}>
                                <SelectTrigger className="w-[120px] h-10 rounded-full font-semibold bg-background border-border shadow-sm hover:bg-accent/50">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {TOKENS.map((token) => (
                                        <SelectItem key={token.symbol} value={token.symbol}>
                                            <div className="flex items-center gap-2">
                                                <span>{token.icon}</span>
                                                <span>{token.symbol}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="text-xs text-muted-foreground pl-1">
                            ≈ ${amount ? (Number(amount) * 3200).toLocaleString() : "0.00"}
                        </div>
                    </div>

                    {/* Switcher */}
                    <div className="flex justify-center -my-3 relative z-10">
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 rounded-full shadow-sm border border-border bg-background hover:bg-muted hover:scale-110 transition-transform"
                            onClick={handleSwitchTokens}
                        >
                            <ArrowDownUp className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* To Section */}
                    <div className="bg-muted/40 p-4 rounded-xl space-y-2 border border-border/50 hover:border-border transition-colors">
                        <div className="flex justify-between text-xs text-muted-foreground font-medium">
                            <span>You Receive</span>
                            <span>Balance: <span className="text-foreground">{toTokenData?.balance}</span></span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Input
                                type="number"
                                placeholder="0.0"
                                className="bg-transparent border-none text-3xl font-bold p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/50"
                                value={amount ? (Number(amount) * 3200).toString() : ""}
                                readOnly
                            />
                            <Select value={toToken} onValueChange={setToToken}>
                                <SelectTrigger className="w-[120px] h-10 rounded-full font-semibold bg-background border-border shadow-sm hover:bg-accent/50">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {TOKENS.map((token) => (
                                        <SelectItem key={token.symbol} value={token.symbol} disabled={token.symbol === fromToken}>
                                            <div className="flex items-center gap-2">
                                                <span>{token.icon}</span>
                                                <span>{token.symbol}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="text-xs text-muted-foreground pl-1 flex items-center gap-2">
                            <span>≈ ${amount ? (Number(amount) * 3200).toLocaleString() : "0.00"}</span>
                            <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">(-0.05%)</span>
                        </div>
                    </div>

                    {/* Rate */}
                    {fromToken && toToken && (
                        <div className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg bg-accent/20 text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <Info className="h-3.5 w-3.5" />
                                1 {fromToken} = {fromToken === "ETH" ? "3,250" : "1"} {toToken}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Wallet className="h-3.5 w-3.5" />
                                Gas: <span className="text-green-500 font-medium">$4.50</span>
                            </span>
                        </div>
                    )}
                </CardContent>

                <CardFooter>
                    <Button
                        className="w-full text-lg h-12 font-semibold shadow-lg shadow-primary/20"
                        size="lg"
                        onClick={handleSwap}
                        disabled={!amount || isLoading}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <RefreshCw className="h-5 w-5 animate-spin" />
                                Swapping...
                            </div>
                        ) : (
                            `Swap ${fromToken} for ${toToken}`
                        )}
                    </Button>
                </CardFooter>
            </Card>

            <div className="flex gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Network Operational
                </div>
                <div className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Audited by CertiK
                </div>
            </div>
        </div>
    );
}
