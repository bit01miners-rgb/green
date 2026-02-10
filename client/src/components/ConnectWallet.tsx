
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/components/ui/use-toast";
import { Wallet } from "lucide-react";

declare global {
    interface Window {
        ethereum: any;
    }
}

export function ConnectWallet() {
    const [account, setAccount] = useState<string | null>(null);
    const [balance, setBalance] = useState<string>("0");
    const [chainId, setChainId] = useState<number | null>(null);
    const { toast } = useToast();

    const connectWallet = async () => {
        if (typeof window.ethereum !== "undefined") {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.send("eth_requestAccounts", []);
                const account = accounts[0];
                setAccount(account);

                const balance = await provider.getBalance(account);
                setBalance(ethers.formatEther(balance));

                const network = await provider.getNetwork();
                setChainId(Number(network.chainId));

                // Save wallet connection to backend
                try {
                    await apiRequest("/api/defi/wallets", {
                        method: "POST",
                        body: JSON.stringify({
                            address: account,
                            chain: "ethereum",
                            label: "MetaMask",
                        }),
                    });
                } catch (e) {
                    console.error("Failed to save wallet to backend", e);
                    // Don't block UI if backend fails (e.g. already exists)
                }

                toast.success("Wallet Connected", {
                    description: `Connected to ${account.substring(0, 6)}...${account.substring(38)}`,
                });
            } catch (error) {
                console.error("Connection error:", error);
                toast.error("Connection Failed", {
                    description: "Could not connect to wallet. Please try again.",
                });
            }
        } else {
            toast.error("Wallet Not Found", {
                description: "Please install MetaMask or another Web3 wallet.",
            });
        }
    };

    useEffect(() => {
        if (typeof window.ethereum !== "undefined") {
            window.ethereum.on("accountsChanged", (accounts: string[]) => {
                setAccount(accounts[0] || null);
            });
        }
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Wallet Connection
                </CardTitle>
            </CardHeader>
            <CardContent>
                {account ? (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Connected Account</p>
                            <p className="text-sm font-mono break-all bg-muted p-2 rounded mt-1">{account}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Balance</p>
                                <p className="text-xl font-bold">{parseFloat(balance).toFixed(4)} ETH</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Network ID</p>
                                <p className="text-xl font-bold">{chainId}</p>
                            </div>
                        </div>

                        <Button variant="outline" className="w-full" onClick={() => setAccount(null)}>
                            Disconnect
                        </Button>
                    </div>
                ) : (
                    <div className="text-center space-y-4">
                        <p className="text-sm text-muted-foreground">Connect your Web3 wallet to access DeFi features.</p>
                        <Button onClick={connectWallet} className="w-full">
                            Connect MetaMask
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card >
    );
}
