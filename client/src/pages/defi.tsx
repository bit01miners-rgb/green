
import { useQuery } from "@tanstack/react-query";
import { ConnectWallet } from "@/components/ConnectWallet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Layers } from "lucide-react";
import { formatCurrency, formatPercent, getChangeColor } from "@/lib/utils";

export default function DeFi() {
    const { data: pools, isLoading: loadingPools } = useQuery<any[]>({
        queryKey: ["/api/defi/pools"],
    });

    const { data: prices } = useQuery<Record<string, any>>({
        queryKey: ["/api/defi/prices"],
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">DeFi Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                    Manage your decentralized finance assets and explore yield opportunities
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Wallet Connection */}
                <div className="lg:col-span-1">
                    <ConnectWallet />
                </div>

                {/* Market Overview */}
                <div className="lg:col-span-2 grid gap-4 grid-cols-1 sm:grid-cols-2">
                    {prices && Object.entries(prices).map(([id, data]: [string, any]) => (
                        <Card key={id}>
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground capitalize">{id}</p>
                                        <h3 className="text-2xl font-bold mt-2">{formatCurrency(data.usd)}</h3>
                                    </div>
                                    <div className={`flex items-center gap-1 text-sm font-medium ${getChangeColor(data.usd_24h_change)}`}>
                                        {data.usd_24h_change >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                                        {formatPercent(data.usd_24h_change)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Yield Opportunities */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Top Yield Opportunities
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loadingPools ? (
                        <div className="text-center py-8 text-muted-foreground">Loading pools...</div>
                    ) : (
                        <div className="space-y-4">
                            {pools?.map((pool: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Layers className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">{pool.project} - {pool.symbol}</h4>
                                            <p className="text-xs text-muted-foreground capitalize">{pool.chain}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-500">{formatPercent(pool.apy)} APY</p>
                                        <p className="text-xs text-muted-foreground">TVL: {formatCurrency(pool.tvlUsd)}</p>
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
