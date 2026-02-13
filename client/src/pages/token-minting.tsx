import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle, Coins } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const tokenSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    symbol: z.string().min(2, "Symbol must be at least 2 characters").max(10, "Symbol too long"),
    supply: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Current supply must be positive"),
    decimals: z.string().transform((val) => parseInt(val, 10)).refine((val) => val >= 0 && val <= 18, "Decimals must be 0-18"),
    chain: z.enum(["ethereum", "solana", "polygon"]),
});

type TokenFormValues = z.infer<typeof tokenSchema>;

export default function TokenMinting() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [mintedToken, setMintedToken] = useState<any>(null);

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<TokenFormValues>({
        resolver: zodResolver(tokenSchema),
        defaultValues: {
            name: "",
            symbol: "",
            supply: "1000000",
            decimals: 18,
            chain: "ethereum",
        },
    });

    const chain = watch("chain");

    const mintMutation = useMutation({
        mutationFn: async (data: TokenFormValues) => {
            // Simulate network request delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            const res = await fetch("/api/token/mint", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                throw new Error(await res.text());
            }
            return await res.json();
        },
        onSuccess: (data) => {
            setMintedToken(data);
            toast({
                title: "Token Minted Successfully",
                description: `Deployed ${data.token.symbol} on ${data.token.chain}`,
            });
            // Invalidate portfolio query to show new token
            queryClient.invalidateQueries({ queryKey: ["/api/trading/portfolio"] });
        },
        onError: (error) => {
            toast({
                title: "Minting Failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const onSubmit = (data: TokenFormValues) => {
        mintMutation.mutate(data);
    };

    return (
        <div className="container mx-auto py-10 max-w-2xl">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">Token Forge</h1>
                <p className="text-muted-foreground">Mint your own ERC-20 or SPL tokens instantly.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Token Configuration</CardTitle>
                    <CardDescription>Define the parameters for your new digital asset.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Token Name</Label>
                                <Input id="name" placeholder="e.g. Green Energy Token" {...register("name")} />
                                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="symbol">Symbol</Label>
                                <Input id="symbol" placeholder="e.g. GET" {...register("symbol")} />
                                {errors.symbol && <p className="text-xs text-red-500">{errors.symbol.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="supply">Initial Supply</Label>
                                <Input id="supply" type="number" placeholder="1000000" {...register("supply")} />
                                {errors.supply && <p className="text-xs text-red-500">{errors.supply.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="decimals">Decimals</Label>
                                <Input id="decimals" type="number" placeholder="18" {...register("decimals")} />
                                {errors.decimals && <p className="text-xs text-red-500">{errors.decimals.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="chain">Blockchain Network</Label>
                            <Select onValueChange={(val: any) => setValue("chain", val)} defaultValue={chain}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a network" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ethereum">Ethereum (ERC-20)</SelectItem>
                                    <SelectItem value="solana">Solana (SPL)</SelectItem>
                                    <SelectItem value="polygon">Polygon (ERC-20)</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.chain && <p className="text-xs text-red-500">{errors.chain.message}</p>}
                        </div>

                        <Button type="submit" className="w-full" disabled={mintMutation.isPending}>
                            {mintMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Minting Token...
                                </>
                            ) : (
                                <>
                                    <Coins className="mr-2 h-4 w-4" />
                                    Mint Token
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {mintedToken && (
                <Card className="mt-8 border-green-500 bg-green-50 dark:bg-green-900/10">
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                            <CardTitle className="text-green-700 dark:text-green-400">Mint Successful!</CardTitle>
                        </div>
                        <CardDescription>Your token has been created and added to your portfolio.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">Contract Address:</span>
                            <span className="font-mono text-muted-foreground">{mintedToken.contractAddress}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">Total Supply:</span>
                            <span>{parseInt(mintedToken.token.quantity).toLocaleString()} {mintedToken.token.symbol}</span>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
