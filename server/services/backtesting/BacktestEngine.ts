import { EventEmitter } from 'events';
import { BaseBot, Signal } from '../bots/BaseBot';
import { botManager } from '../botEngine';

// --- Types ---
export interface BacktestConfig {
    pair: string;
    interval: string;
    startDate: Date;
    endDate: Date;
    initialCapital: number;
    feeRate: number; // e.g. 0.001 (0.1%)
    botType: string;
    botConfig: any;
}

export interface TradeResult {
    id: string;
    type: Signal;
    entryPrice: number;
    exitPrice?: number;
    amount: number;
    pnl: number;
    pnlPercent: number;
    entryTime: Date;
    exitTime?: Date;
    fees: number;
}

export interface BacktestReport {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    totalPnL: number;
    totalFees: number;
    maxDrawdown: number;
    sharpeRatio: number;
    equityCurve: { time: Date, value: number }[];
    trades: TradeResult[];
}

// --- Engine ---
export class BacktestEngine extends EventEmitter {
    private trades: TradeResult[] = [];
    private equityCurve: { time: Date, value: number }[] = [];
    private currentCapital: number;

    constructor(private config: BacktestConfig) {
        super();
        this.currentCapital = config.initialCapital;
    }

    public async run(): Promise<BacktestReport> {
        this.emit('start', this.config);

        // 1. Fetch Historical Data (Mock for now, replace with CCXT/Coingecko)
        const marketData = await this.fetchHistoricalData();

        // 2. Initialize Bot
        const bot = this.createBotInstance();
        if (!bot) throw new Error(`Unknown bot type: ${this.config.botType}`);

        // 3. Simulation Loop
        let openPosition: TradeResult | null = null;

        for (let i = 50; i < marketData.length; i++) {
            const slice = marketData.slice(0, i + 1);
            const currentCandle = marketData[i];
            const price = currentCandle.close;
            const time = currentCandle.timestamp;

            // Adding slice up to current point to simulate "live" feed
            const signal = await bot.analyze({ close: slice.map(c => c.close) });

            if (signal === 'BUY' && !openPosition) {
                // Open Long
                const amount = (this.currentCapital * 0.95) / price; // Use 95% capital
                const fees = (amount * price) * this.config.feeRate;

                openPosition = {
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'BUY',
                    entryPrice: price,
                    amount,
                    pnl: 0,
                    pnlPercent: 0,
                    entryTime: time,
                    fees
                };

                this.currentCapital -= fees;
            } else if (signal === 'SELL' && openPosition) {
                // Close Long
                const exitValue = openPosition.amount * price;
                const fees = exitValue * this.config.feeRate;
                const grossPnl = exitValue - (openPosition.amount * openPosition.entryPrice);
                const netPnl = grossPnl - openPosition.fees - fees;

                openPosition.exitPrice = price;
                openPosition.exitTime = time;
                openPosition.pnl = netPnl;
                openPosition.pnlPercent = (netPnl / (openPosition.amount * openPosition.entryPrice)) * 100;
                openPosition.fees += fees;

                this.trades.push(openPosition);
                this.currentCapital += netPnl; // Update capital
                openPosition = null;
            }

            // Track Equity
            const openPnl = openPosition ? (price - openPosition.entryPrice) * openPosition.amount : 0;
            this.equityCurve.push({
                time,
                value: this.currentCapital + openPnl
            });
        }

        return this.generateReport();
    }

    private generateReport(): BacktestReport {
        const winningTrades = this.trades.filter(t => t.pnl > 0);
        const losingTrades = this.trades.filter(t => t.pnl <= 0);

        // Calculate Max Drawdown
        let peak = -Infinity;
        let maxDrawdown = 0;

        for (const point of this.equityCurve) {
            if (point.value > peak) peak = point.value;
            const drawdown = (peak - point.value) / peak;
            if (drawdown > maxDrawdown) maxDrawdown = drawdown;
        }

        // Calculate Sharpe Ratio (daily returns)
        // Simplified: using per-trade returns variance
        const returns = this.trades.map(t => t.pnlPercent);
        const avgReturn = returns.reduce((a, b) => a + b, 0) / (returns.length || 1);
        const variance = returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / (returns.length || 1);
        const stdDev = Math.sqrt(variance);
        const sharpeLike = stdDev === 0 ? 0 : (avgReturn / stdDev); // Assuming risk-free = 0 for simplicity

        return {
            totalTrades: this.trades.length,
            winningTrades: winningTrades.length,
            losingTrades: losingTrades.length,
            winRate: (winningTrades.length / this.trades.length) * 100 || 0,
            totalPnL: this.equityCurve[this.equityCurve.length - 1].value - this.config.initialCapital,
            totalFees: this.trades.reduce((sum, t) => sum + t.fees, 0),
            maxDrawdown: maxDrawdown * 100,
            sharpeRatio: sharpeLike, // Needs proper annualization in production
            equityCurve: this.equityCurve,
            trades: this.trades
        };
    }

    // Mock Data Provider
    private async fetchHistoricalData() {
        // Generate 1000 candles (random walk)
        const data = [];
        let price = 2000;
        const start = new Date(this.config.startDate).getTime();

        for (let i = 0; i < 1000; i++) {
            price = price * (1 + (Math.random() - 0.5) * 0.02); // +/- 1% moves
            data.push({
                timestamp: new Date(start + i * 60000 * 60), // Hourly
                open: price,
                high: price * 1.01,
                low: price * 0.99,
                close: price,
                volume: Math.random() * 1000
            });
        }
        return data;
    }

    // Use BotManager to instantiate
    private createBotInstance(): any {
        const id = `backtest-v1-${Date.now()}`;
        return botManager.instantiateBot(
            this.config.botType,
            id,
            "Backtest Bot",
            { ...this.config.botConfig, mode: 'PAPER' }
        );
    }
}
