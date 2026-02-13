import { BaseBot, Signal, BotConfig } from "../../BaseBot";

export class SMACrossoverBot extends BaseBot {
    constructor(id: string, name: string, config: Partial<BotConfig> & { fastPeriod: number, slowPeriod: number }) {
        super({
            id,
            name,
            pair: config.pair || 'ETH/USD',
            interval: config.interval || '1h',
            initialBalance: config.initialBalance || 1000,
            mode: config.mode || 'PAPER',
            exchange: config.exchange || 'mock',
            params: {
                fastPeriod: config.fastPeriod || 10,
                slowPeriod: config.slowPeriod || 20
            }
        });
    }

    async analyze(marketData: { close: number[] }): Promise<Signal> {
        const { fastPeriod, slowPeriod } = this.config.params;

        // Need enough data
        if (marketData.close.length < slowPeriod + 1) return 'HOLD';

        const fastSMA = this.calculateSMA(marketData.close, fastPeriod);
        const slowSMA = this.calculateSMA(marketData.close, slowPeriod);

        const lastFast = fastSMA[fastSMA.length - 1];
        const prevFast = fastSMA[fastSMA.length - 2];
        const lastSlow = slowSMA[slowSMA.length - 1];
        const prevSlow = slowSMA[slowSMA.length - 2];

        // Crossover Logic
        if (prevFast <= prevSlow && lastFast > lastSlow) {
            return 'BUY'; // Golden Cross
        }

        if (prevFast >= prevSlow && lastFast < lastSlow) {
            return 'SELL'; // Death Cross
        }

        return 'HOLD';
    }
}
