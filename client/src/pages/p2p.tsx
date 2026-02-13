import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { RefreshCcw, ShieldCheck, DollarSign, MessageSquare, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function P2PTrading() {
    const [filterType, setFilterType] = useState("buy");
    const [asset, setAsset] = useState("USDT");
    const [fiat, setFiat] = useState("USD");
    const [offers, setOffers] = useState<any[]>([]);
    const { toast } = useToast();

    // New Ad State
    const [adPrice, setAdPrice] = useState("");
    const [adLimitMin, setAdLimitMin] = useState("");
    const [adLimitMax, setAdLimitMax] = useState("");
    const [adType, setAdType] = useState("sell");

    const fetchOffers = async () => {
        try {
            const res = await fetch("/api/p2p/offers");
            if (res.ok) {
                setOffers(await res.json());
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchOffers();
    }, []);

    const handlePostAd = async () => {
        try {
            const res = await fetch("/api/p2p/offers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: adType,
                    asset,
                    fiat,
                    price: parseFloat(adPrice),
                    limitMin: parseFloat(adLimitMin),
                    limitMax: parseFloat(adLimitMax),
                    methods: ["Bank Transfer"], // Default for now
                    user: "Me (You)", // Mock user name since we don't have full profile fetch here yet
                    completion: "100%",
                    orders: 0
                })
            });

            if (!res.ok) throw new Error("Failed to post ad");

            toast({ title: "Ad Posted", description: "Your offer is now live." });
            setAdPrice("");
            fetchOffers();
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: "Failed to post ad" });
        }
    };

    const handleTrade = (offerId: number) => {
        // Mock trade execution
        toast({ title: "Trade Initiated", description: `You have started a trade for offer #${offerId}. Check 'My Orders'.` });
    };

    // Filter offers locally for now (API should filter ideally)
    const filteredOffers = offers.filter(o => o.asset === asset && o.fiat === fiat && o.type !== filterType);
    // If I want to BUY, I look for SELL offers (type='sell'). logic might be tricky depending on how 'type' is defined.
    // Usually: 'sell' offer means User is Selling. So if I want to Buy, I match with 'sell'.

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">P2P Trading</h1>
                    <p className="text-muted-foreground">Buy and sell crypto directly with other users. Secure escrow.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline"><MessageSquare className="mr-2 h-4 w-4" /> My Orders</Button>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90"><Plus className="mr-2 h-4 w-4" /> Post Ad</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create P2P Advertisement</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>I want to</Label>
                                        <Select onValueChange={setAdType} defaultValue="sell">
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sell">Sell {asset}</SelectItem>
                                                <SelectItem value="buy">Buy {asset}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Asset</Label>
                                        <Select value={asset} onValueChange={setAsset}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="USDT">USDT</SelectItem>
                                                <SelectItem value="BTC">BTC</SelectItem>
                                                <SelectItem value="ETH">ETH</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Price ({fiat})</Label>
                                    <Input type="number" placeholder="0.00" value={adPrice} onChange={(e) => setAdPrice(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Min Limit</Label>
                                        <Input type="number" placeholder="100" value={adLimitMin} onChange={(e) => setAdLimitMin(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Max Limit</Label>
                                        <Input type="number" placeholder="10000" value={adLimitMax} onChange={(e) => setAdLimitMax(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handlePostAd}>Post Ad</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <Tabs defaultValue="buy" onValueChange={setFilterType} className="w-[400px]">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="buy" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">Buy {asset}</TabsTrigger>
                                <TabsTrigger value="sell" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">Sell {asset}</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <div className="flex gap-2">
                            <Select value={asset} onValueChange={setAsset}>
                                <SelectTrigger className="w-[100px]"><SelectValue placeholder="Asset" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USDT">USDT</SelectItem>
                                    <SelectItem value="BTC">BTC</SelectItem>
                                    <SelectItem value="ETH">ETH</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={fiat} onValueChange={setFiat}>
                                <SelectTrigger className="w-[100px]"><SelectValue placeholder="Fiat" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USD">USD</SelectItem>
                                    <SelectItem value="EUR">EUR</SelectItem>
                                    <SelectItem value="GBP">GBP</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="ghost" size="icon" onClick={fetchOffers}><RefreshCcw className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredOffers.length === 0 && <div className="text-center py-10 text-muted-foreground">No offers found. Be the first to post!</div>}

                        {filteredOffers.map((offer) => (
                            <Card key={offer.id} className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-primary/50 transition-colors">
                                <div className="flex items-center gap-4 w-full md:w-1/4">
                                    <Avatar>
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-bold flex items-center gap-1">
                                            {offer.user || "User"} <ShieldCheck className="h-3 w-3 text-blue-500" />
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {offer.orders} orders | {offer.completion} completion
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:w-1/4">
                                    <div className="text-sm text-muted-foreground">Price</div>
                                    <div className="text-xl font-bold flex items-baseline gap-1">
                                        {Number(offer.price).toLocaleString()} <span className="text-sm font-normal text-muted-foreground">{offer.fiat}</span>
                                    </div>
                                </div>
                                <div className="w-full md:w-1/4">
                                    <div className="text-sm text-muted-foreground">Limits</div>
                                    <div className="font-medium">
                                        {offer.limitMin} - {offer.limitMax} {offer.fiat}
                                    </div>
                                    <div className="flex gap-1 mt-1">
                                        {(offer.methods || []).map((m: string) => (
                                            <Badge key={m} variant="secondary" className="text-[10px] h-5">{m}</Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="w-full md:w-auto">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button className={`w-full md:w-32 ${filterType === 'buy' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>
                                                {filterType === 'buy' ? 'Buy' : 'Sell'} {offer.asset}
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>{filterType === 'buy' ? 'Buy' : 'Sell'} {offer.asset} from {offer.user}</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div className="grid gap-2">
                                                    <Label>I want to pay</Label>
                                                    <div className="relative">
                                                        <Input type="number" placeholder="1000" />
                                                        <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">{offer.fiat}</span>
                                                    </div>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>I will receive</Label>
                                                    <div className="relative">
                                                        <Input type="number" placeholder="980.39" readOnly className="bg-muted" />
                                                        <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">{offer.asset}</span>
                                                    </div>
                                                </div>
                                                <Button className="w-full" size="lg" onClick={() => handleTrade(offer.id)}>
                                                    Confirm Trade
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
