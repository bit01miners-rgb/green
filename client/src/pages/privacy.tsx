import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, ArrowRight, Lock, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function PrivacyPool() {
    const [amount, setAmount] = useState<string>("");
    const [note, setNote] = useState<string>("");
    const [isDeposited, setIsDeposited] = useState(false);
    const [recipient, setRecipient] = useState("");
    const { toast } = useToast();

    const generateNote = () => {
        const randomKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const newNote = `green-funds-mix-${randomKey}-${Date.now()}`;
        setNote(newNote);
        return newNote;
    };

    const handleDeposit = async () => {
        if (!amount) return;
        const newNote = generateNote();

        try {
            const res = await fetch("/api/privacy/deposit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    asset: "ETH", // Default for now
                    note: newNote
                })
            });

            if (!res.ok) throw new Error("Deposit failed");

            setIsDeposited(true);
            toast({ title: "Deposit Successful", description: "Your funds are now in the pool." });
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: "Deposit failed" });
        }
    };

    const handleWithdraw = async (recipientAddress: string) => {
        try {
            const res = await fetch("/api/privacy/withdraw", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    note: note,
                    recipient: recipientAddress
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Withdrawal failed");
            }

            toast({ title: "Withdrawal Successful", description: "Funds sent to recipient." });
            setNote("");
            setRecipient("");
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: (err as Error).message });
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-4">
                    <Lock className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">Privacy Pool</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Break the on-chain link between source and destination addresses.
                    Deposit assets into the non-custodial smart contract and withdraw using a secret note.
                </p>
            </div>

            <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive-foreground">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Compliance Warning</AlertTitle>
                <AlertDescription>
                    This tool is for legitimate privacy enhancement only. Do not use for illicit activities.
                    All transactions are monitored for compliance with AML regulations.
                </AlertDescription>
            </Alert>

            <Card className="border-primary/20 shadow-lg">
                <CardHeader>
                    <Tabs defaultValue="deposit" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="deposit">Deposit</TabsTrigger>
                            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                        </TabsList>

                        <TabsContent value="deposit" className="space-y-6 pt-6">
                            {!isDeposited ? (
                                <>
                                    <div className="grid gap-4">
                                        <Label>Asset & Amount</Label>
                                        <div className="flex gap-2">
                                            <Select defaultValue="ETH">
                                                <SelectTrigger className="w-[120px]">
                                                    <SelectValue placeholder="Asset" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ETH">ETH</SelectItem>
                                                    <SelectItem value="USDT">USDT</SelectItem>
                                                    <SelectItem value="DAI">DAI</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Select onValueChange={setAmount}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select Amount" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="0.1">0.1 ETH</SelectItem>
                                                    <SelectItem value="1">1 ETH</SelectItem>
                                                    <SelectItem value="10">10 ETH</SelectItem>
                                                    <SelectItem value="100">100 ETH</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <Button size="lg" className="w-full" onClick={handleDeposit} disabled={!amount}>
                                        <EyeOff className="mr-2 h-4 w-4" /> Deposit to Pool
                                    </Button>
                                </>
                            ) : (
                                <div className="space-y-6 animate-in zoom-in-50 duration-300">
                                    <Alert className="bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400">
                                        <AlertTitle className="font-bold flex items-center gap-2">Success! Note Generated</AlertTitle>
                                        <AlertDescription>
                                            Please backup this note securely. You will need it to withdraw your funds later.
                                            If you lose this note, your funds are lost forever.
                                        </AlertDescription>
                                    </Alert>
                                    <div className="p-4 bg-muted rounded-lg break-all font-mono text-center border border-dashed border-primary/50 select-all">
                                        {note}
                                    </div>
                                    <Button variant="outline" className="w-full" onClick={() => { setIsDeposited(false); setAmount(""); }}>
                                        I have backed up the note
                                    </Button>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="withdraw" className="space-y-6 pt-6">
                            <div className="grid gap-4">
                                <Label>Secret Note</Label>
                                <Input placeholder="green-funds-mix-..." className="font-mono" value={note} onChange={(e) => setNote(e.target.value)} />
                            </div>
                            <div className="grid gap-4">
                                <Label>Recipient Address</Label>
                                <Input placeholder="0x..." value={recipient} onChange={(e) => setRecipient(e.target.value)} />
                            </div>
                            <Button size="lg" className="w-full" onClick={() => handleWithdraw(recipient)} disabled={!note || !recipient}>
                                <ArrowRight className="mr-2 h-4 w-4" /> Withdraw Funds
                            </Button>
                        </TabsContent>
                    </Tabs>
                </CardHeader>
            </Card>
            {/* Stats section omitted to save space/complexity, or can be re-added if desired */}
        </div>
    );
}
