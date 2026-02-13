
import { EventEmitter } from 'events';

// Simulating a smart contract state in memory (or DB persistence)
interface TokenState {
    totalSupply: number;
    circulatingSupply: number;
    burned: number;
    reflectionPool: number;
    liquidityPool: number;
    holders: Map<string, number>;
}

export class HMNTToken extends EventEmitter {
    private state: TokenState;

    // Constants
    public readonly NAME = "Humanity Token";
    public readonly SYMBOL = "HMNT";
    public readonly DECIMALS = 18;
    public readonly INITIAL_SUPPLY = 1_000_000_000; // 1 Billion

    // Tax rates
    private readonly REFLECTION_TAX = 0.02; // 2%
    private readonly LIQUIDITY_TAX = 0.02;  // 2%
    private readonly BURN_TAX = 0.01;       // 1%

    constructor() {
        super();
        this.state = {
            totalSupply: this.INITIAL_SUPPLY,
            circulatingSupply: this.INITIAL_SUPPLY,
            burned: 0,
            reflectionPool: 0,
            liquidityPool: 0,
            holders: new Map<string, number>()
        };

        // Initialize with a deployer wallet
        this.state.holders.set('deployer', this.INITIAL_SUPPLY);
    }

    public mint(to: string, amount: number) {
        this.state.totalSupply += amount;
        this.state.circulatingSupply += amount;

        const currentBalance = this.getBalance(to);
        this.state.holders.set(to, currentBalance + amount);

        this.emit('transfer', { from: '0x000...000', to, amount, tax: 0 });
        return this.state.totalSupply;
    }

    public getBalance(address: string): number {
        return this.state.holders.get(address) || 0;
    }

    public transfer(from: string, to: string, amount: number): boolean {
        const senderBalance = this.getBalance(from);
        if (senderBalance < amount) return false;

        // Calculate Taxes
        const reflectionAmount = amount * this.REFLECTION_TAX;
        const liquidityAmount = amount * this.LIQUIDITY_TAX;
        const burnAmount = amount * this.BURN_TAX;
        const transferAmount = amount - (reflectionAmount + liquidityAmount + burnAmount);

        // Update Sender
        this.state.holders.set(from, senderBalance - amount);

        // Update Receiver
        const receiverBalance = this.getBalance(to);
        this.state.holders.set(to, receiverBalance + transferAmount);

        // Process Taxes
        this.state.reflectionPool += reflectionAmount;
        this.state.liquidityPool += liquidityAmount;
        this.burn(burnAmount);

        // Distribute Reflections (Simplified: directly add to a generic pool for claiming, 
        // real implementation would update all holders or use RFI method)
        // For this simulation, we'll just track the pool size.

        this.emit('transfer', { from, to, amount, transferAmount, tax: amount - transferAmount });
        return true;
    }

    private burn(amount: number) {
        this.state.burned += amount;
        this.state.circulatingSupply -= amount;
        this.emit('burn', amount);
    }

    public getStats() {
        return {
            totalSupply: this.state.totalSupply,
            circulatingSupply: this.state.circulatingSupply,
            burned: this.state.burned,
            reflectionPool: this.state.reflectionPool,
            liquidityPool: this.state.liquidityPool,
            holderCount: this.state.holders.size,
            price: this.calculateMockPrice()
        };
    }

    // Mock price based on liquidity ratio (simplified AMM logic)
    private calculateMockPrice(): number {
        const basePrice = 0.05; // $0.05 start
        // Price increases as liquidity grows and supply burns
        const liquidityMultiplier = 1 + (this.state.liquidityPool / 1_000_000);
        const scarcityMultiplier = 1 + (this.state.burned / this.INITIAL_SUPPLY);
        return basePrice * liquidityMultiplier * scarcityMultiplier;
    }
}

export const hmntToken = new HMNTToken();
