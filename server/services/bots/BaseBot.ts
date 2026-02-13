import { EventEmitter } from 'events';
import { RSI, EMA, SMA, MACD, BollingerBands } from 'technicalindicators';
import { executionService } from '../ExecutionService';
// Using techicalindicators for robust signal calculations

export interface BotConfig {
    id: string;
    name: string;
    pair: string;
    interval: string; // e.g., '1m', '5m', '1h'
    initialBalance: number;
    mode: 'PAPER' | 'LIVE';
    exchange: 'binance' | 'uniswap' | 'mock'; // simplified
    params: Record<string, any>; // Strategy specific params (e.g., rsiPeriod: 14)
}

export type Signal = 'BUY' | 'SELL' | 'HOLD';

export abstract class BaseBot extends EventEmitter {
    public id: string;
    public name: string;
    public config: BotConfig;
    public status: 'running' | 'stopped' | 'error' = 'stopped';
    protected logs: string[] = [];
    protected performance = {
        totalTrades: 0,
        wins: 0,
        losses: 0,
        pnl: 0,
        winRate: 0
    };

    constructor(config: BotConfig) {
        super();
        this.id = config.id;
        this.name = config.name;
        this.config = config;
    }

    // Abstract methods required by all strategies
    abstract analyze(marketData: any): Promise<Signal>;

    // Core lifecycle methods
    public async start() {
        if (this.status === 'running') return;
        this.status = 'running';
        this.log(`Bot started in ${this.config.mode} mode on ${this.config.exchange}`);

        // In a real implementation, this would start the market data stream loop
        this.runLoop();
    }

    public stop() {
        this.status = 'stopped';
        this.log('Bot stopped.');
    }

    public getStatus() {
        return {
            id: this.id,
            name: this.name,
            status: this.status,
            config: this.config,
            performance: this.performance
        };
    }

    public getLogs() {
        return this.logs;
    }

    protected log(message: string) {
        const timestamp = new Date().toISOString();
        const logMsg = `[${timestamp}] ${message}`;
        this.logs.push(logMsg);
        // Keep logs manageable
        if (this.logs.length > 1000) this.logs.shift();
        this.emit('log', logMsg);
    }

    // Common analysis helpers (can be used by subclasses)
    protected calculateRSI(closes: number[], period: number = 14): number[] {
        return RSI.calculate({ values: closes, period });
    }

    protected calculateEMA(closes: number[], period: number): number[] {
        return EMA.calculate({ values: closes, period });
    }

    protected calculateSMA(closes: number[], period: number): number[] {
        return SMA.calculate({ values: closes, period });
    }

    protected calculateMACD(closes: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9) {
        return MACD.calculate({
            values: closes,
            fastPeriod,
            slowPeriod,
            signalPeriod,
            SimpleMAOscillator: false,
            SimpleMASignal: false
        });
    }

    protected calculateBollingerBands(closes: number[], period: number = 20, stdDev: number = 2) {
        return BollingerBands.calculate({ period, stdDev, values: closes });
    }

    // Execution Engine
    // This handles the actual placing of orders based on signals
    protected async execute(signal: Signal, price: number) {
        if (signal === 'HOLD') return;

        this.log(`Signal generated: ${signal} @ ${price}`);

        if (this.config.mode === 'LIVE') {
            await this.executeLiveOrder(signal, price);
        } else {
            await this.executePaperOrder(signal, price);
        }
    }

    private async executeLiveOrder(signal: Signal, price: number) {
        this.log(`🚀 EXECUTING LIVE ${signal} ORDER for ${this.config.pair} at approx ${price}`);
        try {
            // Connect to ExchangeService
            const side = signal === 'BUY' ? 'buy' : 'sell';
            const order = await executionService.placeOrder(
                this.config.exchange,
                this.config.pair,
                side,
                1, // Amount (simplified, should come from risk management)
                'market'
            );

            this.log(`✅ LIVE ORDER FILLED: ${order.id} @ ${order.price || 0}`);
            this.recordTrade(signal, order.price || 0, true); // Success
        } catch (error: any) {
            this.log(`❌ LIVE ORDER FAILED: ${error.message}`);
        }
    }

    private async executePaperOrder(signal: Signal, price: number) {
        this.log(`📝 SIMULATING ${signal} ORDER for ${this.config.pair} at ${price}`);
        this.recordTrade(signal, price, true);
    }

    private recordTrade(type: Signal, price: number, success: boolean) {
        if (!success) return;

        // Simplified PnL tracking for demonstration
        this.performance.totalTrades++;
        // Logic to calculate wins/losses would go here based on entry/exit tracking
        this.log(`Trade recorded: ${type} at ${price}`);
    }

    // Simulation loop for now, will be replaced by event-driven MarketDataService
    private async runLoop() {
        while (this.status === 'running') {
            try {
                // Mock fetching latest candle data
                // In real version, this comes from MarketDataService based on this.config.pair
                const mockData = await this.fetchMarketData();

                const signal = await this.analyze(mockData);
                if (signal !== 'HOLD') {
                    // Use the last close price for execution
                    const currentPrice = mockData.close[mockData.close.length - 1];
                    await this.execute(signal, currentPrice);
                }
            } catch (error: any) {
                this.log(`Error in loop: ${error.message}`);
            }

            // Wait for next interval (simulated 2 seconds for demo)
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    private async fetchMarketData() {
        // Returns dummy OHLCV data for analysis measurement
        // This will be replaced by real CCXT historical fetches
        const length = 100;
        const closes = Array.from({ length }, () => 100 + Math.random() * 10);
        return { close: closes };
    }
}
