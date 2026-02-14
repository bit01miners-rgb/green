
import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum, optimism, polygon, bsc } from '@reown/appkit/networks'
import { WagmiProvider } from 'wagmi'
import { type ReactNode } from 'react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'

// 1. Get projectId
// Using a placeholder; user should replace with their own from cloud.reown.com
const projectId = 'b56e86d4e323d8872545561a33a38890'

// 2. Create adapters
export const wagmiAdapter = new WagmiAdapter({
    networks: [mainnet, arbitrum, optimism, polygon, bsc],
    projectId
})

const solanaWeb3JsAdapter = new SolanaAdapter({
    wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()]
})

// 3. Create modal
createAppKit({
    adapters: [wagmiAdapter, solanaWeb3JsAdapter],
    networks: [mainnet, arbitrum, optimism, polygon, bsc],
    projectId,
    metadata: {
        name: 'Green Funds',
        description: 'DeFi Fintech Platform',
        url: 'https://green-funds.vercel.app',
        icons: ['https://avatars.githubusercontent.com/u/179229932']
    },
    features: {
        analytics: true
    }
})

export function Web3ModalProvider({ children }: { children: ReactNode }) {
    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig}>
            {children}
        </WagmiProvider>
    )
}
