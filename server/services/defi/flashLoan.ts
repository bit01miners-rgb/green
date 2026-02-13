import { ethers } from "ethers";

interface FlashLoanParams {
    asset: string;
    amount: number;
    direction: "Long" | "Short";
    targetDex: string;
}

interface FlashLoanResult {
    success: boolean;
    profit: number;
    gasUsed: number;
    txHash: string;
    message: string;
}

// ABI for Aave V3 Pool (simplified for flashLoanSimple)
const POOL_ABI = [
    "function flashLoanSimple(address receiver, address asset, uint256 amount, bytes calldata params, uint16 referralCode) external"
];

// ABI for Generic ERC20
const ERC20_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function balanceOf(address account) external view returns (uint256)"
];

// Your deployed FlashLoanReceiver contract address
// In a real scenario, this must be deployed first.
const FL_RECEIVER_ADDRESS = process.env.FL_RECEIVER_ADDRESS || "0xYourDeployedReceiverAddress";
const AAVE_POOL_ADDRESS = "0x87870Bca3F3f638F132C14393F8C519a79a50712"; // e.g. Ethereum Mainnet

export async function executeFlashLoan(params: FlashLoanParams): Promise<FlashLoanResult> {

    // Check for Flash Loan Prerequisites
    if (!process.env.PRIVATE_KEY || !process.env.ETHEREUM_RPC) {
        throw new Error("Missing PRIVATE_KEY or ETHEREUM_RPC for Flash Loan execution.");
    }

    try {
        const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const pool = new ethers.Contract(AAVE_POOL_ADDRESS, POOL_ABI, wallet);

        // Convert amount to wei (assuming 18 decimals for simplicity, realistically need token metadata)
        const amountWei = ethers.parseUnits(params.amount.toString(), 18);
        const assetAddress = getAssetAddress(params.asset);

        // Encode params for your receiver contract (e.g. direction, targetDex)
        const paramsData = ethers.AbiCoder.defaultAbiCoder().encode(
            ["string", "string"],
            [params.direction, params.targetDex]
        );

        console.log(`Initiating Flash Loan: ${params.amount} ${params.asset}`);

        // Execute Transaction
        const tx = await pool.flashLoanSimple(
            FL_RECEIVER_ADDRESS,
            assetAddress,
            amountWei,
            paramsData,
            0 // referralCode
        );

        console.log("Tx Sent:", tx.hash);
        const receipt = await tx.wait();

        return {
            success: true,
            profit: 0, // Cannot determine profit from client-side without event parsing
            gasUsed: Number(receipt.gasUsed),
            txHash: receipt.hash,
            message: "Flash Loan Executed On-Chain. Check explorer for profit details."
        };

    } catch (error) {
        console.error("Flash Loan Failed:", error);
        return {
            success: false,
            profit: 0,
            gasUsed: 0,
            txHash: "",
            message: (error as Error).message
        };
    }
}

// --- Helper Functions ---

function getAssetAddress(symbol: string): string {
    // Mapping for mainnet assets
    const map: Record<string, string> = {
        "ETH": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
        "USDC": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        "DAI": "0x6B175474E89094C44Da98b954EedeAC495271d0F"
    };
    return map[symbol] || map["ETH"];
}
