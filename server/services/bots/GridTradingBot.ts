import { BaseBot, Signal, BotConfig } from "./BaseBot";

export class GridTradingBot extends BaseBot {
    private gridLines: number[] = [];
    private lastPrice: number = 0;

    constructor(id: string, name: string, config: any) {
        super({
            id,
            name,
            pair: config.pair || 'SOL/USD',
            interval: config.interval || '5m',
            initialBalance: config.initialBalance || 2000,
            mode: config.mode || 'PAPER',
            exchange: config.exchange || 'mock',
            params: {
                lowerLimit: config.lowerLimit || 20,
                upperLimit: config.upperLimit || 150,
                grids: config.grids || 20
            }
        });
        this.initializeGrid();
    }

    private initializeGrid() {
        const { lowerLimit, upperLimit, grids } = this.config.params;
        const step = (upperLimit - lowerLimit) / grids;
        for (let i = 0; i <= grids; i++) {
            this.gridLines.push(lowerLimit + (step * i));
        }
        this.log(`Initialized Grid: ${grids} lines between ${lowerLimit} and ${upperLimit}`);
    }

    async analyze(marketData: { close: number[] }): Promise<Signal> {
        const currentPrice = marketData.close[marketData.close.length - 1];

        // Skip first tick to establish baseline
        if (this.lastPrice === 0) {
            this.lastPrice = currentPrice;
            return 'HOLD';
        }

        let signal: Signal = 'HOLD';

        // Check for grid line crossings
        for (const line of this.gridLines) {
            // Price crossed DOWN through a line -> BUY (Buy Low)
            if (this.lastPrice > line && currentPrice <= line) {
                signal = 'BUY';
                this.log(`Grid Buy Trigger: Crossed ${line.toFixed(2)} downwards (Prev: ${this.lastPrice}, Curr: ${currentPrice})`);
                break;
            }
            // Price crossed UP through a line -> SELL (Sell High)
            else if (this.lastPrice < line && currentPrice >= line) {
                signal = 'SELL';
                this.log(`Grid Sell Trigger: Crossed ${line.toFixed(2)} upwards (Prev: ${this.lastPrice}, Curr: ${currentPrice})`);
                break;
            }
        }

        this.lastPrice = currentPrice;
        return signal;
    }
}
