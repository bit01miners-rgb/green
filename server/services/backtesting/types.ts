export interface Candle {
    timestamp: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

export interface BacktestInput {
    strategyId: string;
    symbol: string;
    timeframe: Timeframe;
    params: Record<string, any>;
    range: {
        start: string; // ISO date string
        end: string;
    };
    initialCapital: number;
}
