import { BaseBot, Signal, BotConfig } from "./BaseBot";

export class GridTradingBot extends BaseBot {
    private gridLines: number[] = [];

    constructor(id: string, name: string, config: Partial<BotConfig> & { lowerLimit: number, upperLimit: number, grids: number }) {
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
                upperLimit: config.upperLimit || 40,
                grids: config.grids || 10
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
    }

    async analyze(marketData: { close: number[] }): Promise<Signal> {
        const currentPrice = marketData.close[marketData.close.length - 1];

        // Simple Grid Logic: 
        // If price crosses a grid line from above -> BUY
        // If price crosses a grid line from below -> SELL

        // For simulation, we check proximity to grid lines
        for (const line of this.gridLines) {
            const dist = Math.abs(currentPrice - line);
            const percentDist = (dist / line) * 100;

            if (percentDist < 0.2) { // Within 0.2% of a grid line
                // Determine direction (mock logic here as we need previous state for real crossing)
                // Randomly decided for simulation to show activity
                return Math.random() > 0.5 ? 'BUY' : 'SELL';
            }
        }

        return 'HOLD';
    }
}
