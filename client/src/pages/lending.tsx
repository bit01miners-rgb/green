
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Wallet, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownLeft, ShieldCheck, Activity } from "lucide-react";
import { useLoans, useCreditScore, useSupply, useWithdraw, useBorrow, useRepay } from "@/hooks/useLending";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";

// Mock data for markets (in a real app this would come from an API/Oracle)
const supplyMarkets = [
    { asset: "USDC", apy: "5.4%", wallet: "1,200.00", supplied: "0.00" },
    { asset: "ETH", apy: "3.2%", wallet: "4.5", supplied: "1.2" },
    { asset: "BTC", apy: "1.8%", wallet: "0.45", supplied: "0.00" },
    { asset: "SOL", apy: "6.1%", wallet: "145.00", supplied: "50.00" },
];

const borrowMarkets = [
    { asset: "USDC", apy: "6.8%", liquidity: "45.2M", borrowed: "0.00" },
    { asset: "ETH", apy: "4.5%", liquidity: "12.4K", borrowed: "0.2" },
    { asset: "BTC", apy: "3.1%", liquidity: "890", borrowed: "0.00" },
    { asset: "DAI", apy: "7.2%", liquidity: "15.8M", borrowed: "500.00" },
];

export default function Lending() {
    const { data: loans, isLoading: loansLoading } = useLoans();
    const { data: creditData, isLoading: creditLoading } = useCreditScore();
    const supplyMutation = useSupply();
    const withdrawMutation = useWithdraw();
    const borrowMutation = useBorrow();
    const repayMutation = useRepay();

    const { toast } = useToast();

    // Dialog States
    const [actionType, setActionType] = useState<"supply" | "withdraw" | "borrow" | "repay" | null>(null);
    const [selectedAsset, setSelectedAsset] = useState<any>(null);
    const [amount, setAmount] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const openDialog = (type: "supply" | "withdraw" | "borrow" | "repay", asset: any) => {
        setActionType(type);
        setSelectedAsset(asset);
        setAmount("");
        setIsDialogOpen(true);
    };

    const handleAction = () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            toast({ title: "Invalid Amount", description: "Please enter a valid positive number.", variant: "destructive" });
            return;
        }

        const numAmount = Number(amount);
        const assetName = selectedAsset.asset;

        const options = {
            onSuccess: () => {
                const actionName = actionType ? actionType.charAt(0).toUpperCase() + actionType.slice(1) : 'Action';
                toast({ title: "Success", description: `${actionName} successful.` });
                setIsDialogOpen(false);
            },
            onError: (error: any) => {
                toast({ title: "Error", description: error.message || "Transaction failed.", variant: "destructive" });
            }
        };

        if (actionType === "supply") {
            supplyMutation.mutate({ asset: assetName, amount: numAmount }, options);
        } else if (actionType === "withdraw") {
            withdrawMutation.mutate({ asset: assetName, amount: numAmount }, options);
        } else if (actionType === "borrow") {
            borrowMutation.mutate({ asset: assetName, amount: numAmount }, options);
        } else if (actionType === "repay") {
            // For repay, we need a loanId. Assuming selectedAsset has loanId for simplicity or borrowing logic needs adjustment
            // Simplification: In this view, we are repaying *assets*, likely matching a loan. 
            // In a real app, we'd select a specific Loan ID. 
            // For this polish, let's assume we find the active loan for this asset or pass a dummy ID for now if not available in this view context
            toast({ title: "Feature Pending", description: "Repayment UI needs specific loan selection.", variant: "default" });
            // repayMutation.mutate({ loanId: 123, amount: numAmount }, options); 
        }
    };

    const isLoading = loansLoading || creditLoading;

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500 container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Lending Protocol</h1>
                    <p className="text-muted-foreground">Supply assets to earn interest or borrow against your collateral.</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-md border">
                        <span className="text-xs font-medium text-muted-foreground">Net APY</span>
                        <span className="text-sm font-bold text-green-500">+4.2%</span>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Your Supplies & Borrows</CardTitle>
                        <CardDescription>Overview of your positions in the protocol.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <span className="text-sm text-muted-foreground">Supplied Balance</span>
                                    <div className="text-2xl font-bold">$12,450.00</div>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-[70%]" />
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Limit used: 45%</span>
                                    <span>Max LTV: 80%</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <span className="text-sm text-muted-foreground">Borrowed Balance</span>
                                    <div className="text-2xl font-bold">$5,230.00</div>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-destructive w-[30%]" />
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Borrow Power: $7,200</span>
                                    <span>APY: -3.5%</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Health Factor</CardTitle>
                        <CardDescription>Safety of your deposited collateral.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center pt-2">
                        <div className="relative flex items-center justify-center h-32 w-32 rounded-full border-8 border-green-500/20">
                            <div className="absolute inset-0 rounded-full border-8 border-green-500 border-t-transparent border-l-transparent rotate-45" />
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-500">2.45</div>
                                <div className="text-xs text-muted-foreground">Safe</div>
                            </div>
                        </div>
                        <div className="mt-6 w-full space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Liquidation at</span>
                                <span className="font-mono text-destructive">1.00</span>
                            </div>
                            <p className="text-xs text-muted-foreground text-center">
                                If your health factor drops below 1.0, your collateral may be liquidated.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="supply" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="supply">Supply Markets</TabsTrigger>
                    <TabsTrigger value="borrow">Borrow Markets</TabsTrigger>
                </TabsList>
                <TabsContent value="supply" className="space-y-4 mt-4">
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Asset</TableHead>
                                        <TableHead>APY</TableHead>
                                        <TableHead>Wallet Balance</TableHead>
                                        <TableHead>Supplied</TableHead>
                                        <TableHead>Collateral</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {supplyMarkets.map((market) => (
                                        <TableRow key={market.asset}>
                                            <TableCell className="font-medium flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                                                    {market.asset[0]}
                                                </div>
                                                {market.asset}
                                            </TableCell>
                                            <TableCell className="text-green-500 font-bold">{market.apy}</TableCell>
                                            <TableCell>{market.wallet}</TableCell>
                                            <TableCell>{market.supplied}</TableCell>
                                            <TableCell>
                                                <Switch checked={true} />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => openDialog("withdraw", market)}>Withdraw</Button>
                                                    <Button size="sm" onClick={() => openDialog("supply", market)}>Supply</Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="borrow" className="space-y-4 mt-4">
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Asset</TableHead>
                                        <TableHead>APY</TableHead>
                                        <TableHead>Available Liquidity</TableHead>
                                        <TableHead>You Borrowed</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {borrowMarkets.map((market) => (
                                        <TableRow key={market.asset}>
                                            <TableCell className="font-medium flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                                                    {market.asset[0]}
                                                </div>
                                                {market.asset}
                                            </TableCell>
                                            <TableCell className="text-yellow-500 font-bold">{market.apy}</TableCell>
                                            <TableCell>{market.liquidity}</TableCell>
                                            <TableCell>{market.borrowed}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => openDialog("repay", market)}>Repay</Button>
                                                    <Button size="sm" onClick={() => openDialog("borrow", market)}>Borrow</Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{actionType?.charAt(0).toUpperCase() + actionType?.slice(1)!} {selectedAsset?.asset}</DialogTitle>
                        <DialogDescription>
                            Enter the amount you want to {actionType} {actionType === 'supply' || actionType === 'repay' ? 'to' : 'from'} the protocol.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <Input
                                id="amount"
                                placeholder="0.00"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                        <div className="text-xs text-muted-foreground text-right">
                            Balance: {actionType === 'supply' ? selectedAsset?.wallet : selectedAsset?.supplied} {selectedAsset?.asset}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAction} disabled={supplyMutation.isPending || withdrawMutation.isPending || borrowMutation.isPending || repayMutation.isPending}>
                            {supplyMutation.isPending || withdrawMutation.isPending || borrowMutation.isPending || repayMutation.isPending ? "Processing..." : "Confirm"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

