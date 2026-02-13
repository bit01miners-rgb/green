import { BaseBot, Signal, BotConfig } from "../../BaseBot";

export class RSIReversalBot extends BaseBot {
    constructor(id: string, name: string, config: Partial<BotConfig> & { rsiPeriod: number, overbought: number, oversold: number }) {
        super({
            id,
            name,
            pair: config.pair || 'BTC/USD',
            interval: config.interval || '15m',
            initialBalance: config.initialBalance || 1000,
            mode: config.mode || 'PAPER',
            exchange: config.exchange || 'mock',
            params: {
                rsiPeriod: config.rsiPeriod || 14,
                overbought: config.overbought || 70,
                oversold: config.oversold || 30
            }
        });
    }

    async analyze(marketData: { close: number[] }): Promise<Signal> {
        const { rsiPeriod, overbought, oversold } = this.config.params;

        if (marketData.close.length < rsiPeriod + 1) return 'HOLD';

        const rsiValues = this.calculateRSI(marketData.close, rsiPeriod);
        const lastRSI = rsiValues[rsiValues.length - 1];
        const prevRSI = rsiValues[rsiValues.length - 2];

        // Mean Reversion Logic
        // Buy when RSI crosses above oversold level (recovery)
        if (prevRSI < oversold && lastRSI >= oversold) {
            return 'BUY';
        }

        // Sell when RSI crosses below overbought level (correction)
        if (prevRSI > overbought && lastRSI <= overbought) {
            return 'SELL';
        }

        return 'HOLD';
    }
}
