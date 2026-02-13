import { useState } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Wallet } from "lucide-react";

// ABI for the mint function. 
// Ideally this should be imported from the JSON artifact after compilation, 
// but for now we hardcode the interface we know we wrote.
const CONTRACT_ABI = [
    "function mint(address to, uint256 amount) public",
    "function balanceOf(address account) public view returns (uint256)",
    "function decimals() public view returns (uint8)",
    "function symbol() public view returns (string)"
];

// Address will be filled after deployment. 
// For now, we use a placeholder or localhost address if known.
// User will need to update this after deploying to a testnet.
const CONTRACT_ADDRESS = ""; // TO BE FILLED

export default function TokenMinting() {
    const [account, setAccount] = useState<string>("");
    const [amount, setAmount] = useState<string>("");
    const [recipient, setRecipient] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const connectWallet = async () => {
        if (typeof window.ethereum !== "undefined") {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.send("eth_requestAccounts", []);
                setAccount(accounts[0]);
                setRecipient(accounts[0]); // Default recipient is self
                toast({ title: "Wallet Connected", description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}` });
            } catch (err) {
                toast({ variant: "destructive", title: "Connection Error", description: "Failed to connect wallet." });
            }
        } else {
            toast({ variant: "destructive", title: "No Wallet Found", description: "Please install MetaMask or another Web3 wallet." });
        }
    };

    const handleMint = async () => {
        if (!account) return;
        if (!amount || parseFloat(amount) <= 0) {
            toast({ variant: "destructive", title: "Invalid Amount", description: "Please enter a positive amount." });
            return;
        }

        // Check if contract address is set (it won't be yet in this first pass)
        if (!CONTRACT_ADDRESS) {
            toast({ variant: "destructive", title: "Configuration Error", description: "Contract address not configured. Please deploy the contract first." });
            return;
        }

        setIsLoading(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            // Parse amount with 18 decimals (or whatever the token uses, usually 18)
            // We can fetch decimals dynamically but for now assuming 18 for ERC20
            const value = ethers.parseUnits(amount, 18);

            const tx = await contract.mint(recipient, value);
            await tx.wait();

            toast({ title: "Mint Successful", description: `Successfully minted ${amount} GT to ${recipient}` });
            setAmount("");
        } catch (err: any) {
            console.error(err);
            toast({ variant: "destructive", title: "Mint Failed", description: err.message || "Transaction failed" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-2xl py-10 space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">Green Token Minting</h1>
                <p className="text-muted-foreground">Mint your own GT tokens directly to your wallet using the power of AI-governed smart contracts.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Mint Tokens</CardTitle>
                    <CardDescription>Enter the amount and recipient address below.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!account ? (
                        <div className="flex justify-center py-8">
                            <Button size="lg" onClick={connectWallet} className="gap-2">
                                <Wallet className="h-5 w-5" />
                                Connect Wallet
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <Label>Connected Account</Label>
                                <div className="p-3 bg-muted rounded-md font-mono text-sm truncate">{account}</div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount to Mint</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="e.g. 1000"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="recipient">Recipient Address</Label>
                                <Input
                                    id="recipient"
                                    type="text"
                                    placeholder="0x..."
                                    value={recipient}
                                    onChange={(e) => setRecipient(e.target.value)}
                                />
                            </div>

                            <Button className="w-full" onClick={handleMint} disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Minting...
                                    </>
                                ) : (
                                    "Mint Tokens"
                                )}
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>

            <div className="text-xs text-center text-muted-foreground">
                Contract Interaction powered by Ethers.js and deployed via Hardhat.
            </div>
        </div>
    );
}
