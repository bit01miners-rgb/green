import { BaseBot, Signal, BotConfig } from "./BaseBot";

export class DCABot extends BaseBot {
    constructor(id: string, name: string, config: Partial<BotConfig> & { amountPerTrade: number }) {
        super({
            id,
            name,
            pair: config.pair || 'BTC/USD',
            interval: config.interval || '1d',
            initialBalance: config.initialBalance || 5000,
            mode: config.mode || 'PAPER',
            exchange: config.exchange || 'mock',
            params: {
                amountPerTrade: config.amountPerTrade || 100
            }
        });
    }

    async analyze(marketData: { close: number[] }): Promise<Signal> {
        // DCA is time-based, not price action based. 
        // In a real implementation with a scheduler, this would execute regardless of price.
        // For this loop-based simulation, we'll just buy every time "analyze" is called 
        // (which implies the time interval has passed)

        // We can add a simple logic to not buy if price is insanely high compared to MA
        // But pure DCA buys regardless. Let's return BUY.

        return 'BUY';
    }
}
