import { BaseBot, Signal, BotConfig } from "./BaseBot";

export class ArbitrageBot extends BaseBot {
    constructor(id: string, name: string, config: Partial<BotConfig> & { threshold: number }) {
        super({
            id,
            name,
            pair: config.pair || 'ETH/USD',
            interval: config.interval || '1m',
            initialBalance: config.initialBalance || 10000,
            mode: config.mode || 'PAPER',
            exchange: config.exchange || 'mock',
            params: {
                threshold: config.threshold || 1.5 // % difference
            }
        });
    }

    async analyze(marketData: { close: number[] }): Promise<Signal> {
        // In a real scenario, this would compare prices from multiple exchanges
        // For this simulation/demo, we'll simulate a price discrepancy

        // Simulate fetching price from another exchange (Exchange B)
        const currentPrice = marketData.close[marketData.close.length - 1];
        const discrepancy = (Math.random() - 0.5) * 4; // Simultaneous +/- 2% diff
        const exchangeBPrice = currentPrice * (1 + discrepancy / 100);

        const diffPercent = Math.abs((exchangeBPrice - currentPrice) / currentPrice) * 100;
        const { threshold } = this.config.params;

        if (diffPercent > threshold) {
            if (exchangeBPrice > currentPrice) {
                this.log(`Arbitrage Opp: Buy Local ($${currentPrice.toFixed(2)}), Sell Remote ($${exchangeBPrice.toFixed(2)}). Diff: ${diffPercent.toFixed(2)}%`);
                return 'BUY';
            } else {
                this.log(`Arbitrage Opp: Buy Remote ($${exchangeBPrice.toFixed(2)}), Sell Local ($${currentPrice.toFixed(2)}). Diff: ${diffPercent.toFixed(2)}%`);
                return 'SELL';
            }
        }

        return 'HOLD';
    }
}
