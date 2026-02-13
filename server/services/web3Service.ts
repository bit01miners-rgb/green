
import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

// Ensure these are set in your .env
const ETHEREUM_RPC = process.env.ETHEREUM_RPC || 'https://mainnet.infura.io/v3/YOUR_KEY';
const PRIVATE_KEY = process.env.PRIVATE_KEY;

let adminWallet: ethers.Wallet | null = null;
let provider: ethers.JsonRpcProvider | null = null;

try {
    provider = new ethers.JsonRpcProvider(ETHEREUM_RPC);
    if (PRIVATE_KEY) {
        adminWallet = new ethers.Wallet(PRIVATE_KEY, provider);
        console.log(`[Web3Service] Admin Wallet loaded: ${adminWallet.address}`);
    } else {
        console.warn("[Web3Service] No PRIVATE_KEY found. Admin wallet features disabled.");
    }
} catch (error) {
    console.error("[Web3Service] Failed to initialize provider/wallet:", error);
}

export const getAdminAddress = async (): Promise<string | null> => {
    return adminWallet ? adminWallet.address : null;
};

export const getProvider = () => provider;
export const getAdminWallet = () => adminWallet;
