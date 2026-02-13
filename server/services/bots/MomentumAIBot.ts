import { BaseBot, Signal, BotConfig } from "./BaseBot";
import * as ss from 'simple-statistics';

export class MomentumAIBot extends BaseBot {
    constructor(id: string, name: string, config: Partial<BotConfig> & { windowSize: number }) {
        super({
            id,
            name,
            pair: config.pair || 'WIF/USD',
            interval: config.interval || '15m',
            initialBalance: config.initialBalance || 5000,
            mode: config.mode || 'PAPER',
            exchange: config.exchange || 'mock',
            params: {
                windowSize: config.windowSize || 20
            }
        });
    }

    async analyze(marketData: { close: number[] }): Promise<Signal> {
        const { windowSize } = this.config.params;

        if (marketData.close.length < windowSize) return 'HOLD';

        const recentPrices = marketData.close.slice(-windowSize);

        // Statistical Momentum
        const mean = ss.mean(recentPrices);
        const stdev = ss.standardDeviation(recentPrices);
        const currentPrice = recentPrices[recentPrices.length - 1];

        // Z-Score calculation
        const zScore = (currentPrice - mean) / stdev;

        // AI/Statistical Signal
        if (zScore > 2) {
            // Price is 2 standard deviations above mean -> Overbought -> Revert
            return 'SELL';
        } else if (zScore < -2) {
            // Price is 2 standard deviations below mean -> Oversold -> Revert
            return 'BUY';
        }

        return 'HOLD';
    }
}
