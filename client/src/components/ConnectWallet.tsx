

import { useAppKit, useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { useBalance } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import { useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

export function ConnectWallet() {
    const { open } = useAppKit();
    const { address, isConnected } = useAppKitAccount();
    const { chainId } = useAppKitNetwork();

    // Fetch balance only for EVM addresses currently (starts with 0x)
    const { data: balanceData } = useBalance({
        address: address as `0x${string}`,
        query: { enabled: !!address && address.startsWith('0x') }
    });

    // Sync wallet to backend when connected
    useEffect(() => {
        if (isConnected && address) {
            apiRequest("/api/defi/wallets", {
                method: "POST",
                body: JSON.stringify({
                    address,
                    chain: address.startsWith("0x") ? "ethereum" : "solana",
                    label: "Connected Wallet",
                }),
            }).catch(err => console.error("Failed to sync wallet:", err));
        }
    }, [isConnected, address]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Wallet Connection
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isConnected && address ? (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Connected Account</p>
                            <p className="text-sm font-mono break-all bg-muted p-2 rounded mt-1">{address}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Balance</p>
                                <p className="text-xl font-bold">
                                    {balanceData ? `${Number(balanceData.formatted).toFixed(4)} ${balanceData.symbol}` : (address.startsWith("0x") ? "Loading..." : "N/A")}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Chain ID</p>
                                <p className="text-xl font-bold">{chainId || "Unknown"}</p>
                            </div>
                        </div>

                        <Button variant="outline" className="w-full" onClick={() => open()}>
                            Manage Wallet
                        </Button>
                    </div>
                ) : (
                    <div className="text-center space-y-4">
                        <p className="text-sm text-muted-foreground">Connect your Web3 wallet to access DeFi features.</p>
                        <Button onClick={() => open()} className="w-full">
                            Connect Wallet
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

