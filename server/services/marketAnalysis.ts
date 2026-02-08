import { getCoinChart, getCoinPrice } from "./marketData";

interface MarketSignal {
    symbol: string;
    price: number;
    recommendation: "STRONG_BUY" | "BUY" | "HOLD" | "SELL" | "STRONG_SELL";
    score: number; // 0-100 (0=Oversold/Buy, 100=Overbought/Sell) - wait, usually 30 is oversold, 70 is overbought.
    // actually let's standardise: 0-100, where higher is better for BUYing? Or just RSI?
    // Let's say score represents "Bullishness". 0 = Bearish, 100 = Bullish.
    indicators: {
        rsi: number;
        macd: {
            value: number;
            signal: number;
            histogram: number;
        };
        trend: "UP" | "DOWN" | "SIDEWAYS";
        change24h: number;
    };
    analysis: string;
}

export async function getMarketSignals(symbol: string): Promise<MarketSignal> {
    // 1. Get price data (last 30 days for sufficient data points)
    const chartData = await getCoinChart(symbol, 30);
    const prices = chartData.prices.map((p) => p.price);

    if (prices.length < 14) {
        throw new Error("Insufficient data for market analysis");
    }

    // 2. Calculate Indicators
    const currentPrice = prices[prices.length - 1];
    const rsi = calculateRSI(prices, 14);
    const { macdLine, signalLine, histogram } = calculateMACD(prices);

    // 3. Determine Trend (Simple Moving Average 5 vs 20)
    const sma5 = calculateSMA(prices, 5);
    const sma20 = calculateSMA(prices, 20);
    const trend = sma5 > sma20 ? "UP" : sma5 < sma20 ? "DOWN" : "SIDEWAYS";

    // 4. Get 24h Change
    const priceData = await getCoinPrice(symbol);
    const change24h = priceData[symbol]?.usd_24h_change || 0;

    // 5. Generate Scoring & Recommendation
    // RSI: <30 (Bullish/Oversold), >70 (Bearish/Overbought)
    // MACD: Histogram > 0 (Bullish), < 0 (Bearish)
    // Trend: UP (Bullish), DOWN (Bearish)

    let score = 50; // Neutral

    // RSI Contribution
    if (rsi < 30) score += 20; // Buy signal
    else if (rsi > 70) score -= 20; // Sell signal
    else if (rsi < 50) score += 5; // Slight bias
    else score -= 5;

    // MACD Contribution
    if (histogram > 0) score += 15;
    else score -= 15;

    // Trend Contribution
    if (trend === "UP") score += 15;
    else if (trend === "DOWN") score -= 15;

    // Recent Momentum
    if (change24h > 5) score += 5; // Strong momentum
    else if (change24h < -5) score -= 5;

    // Clamp score
    score = Math.max(0, Math.min(100, score));

    let recommendation: MarketSignal["recommendation"] = "HOLD";
    if (score >= 80) recommendation = "STRONG_BUY";
    else if (score >= 60) recommendation = "BUY";
    else if (score <= 20) recommendation = "STRONG_SELL";
    else if (score <= 40) recommendation = "SELL";

    // 6. Generate Analysis Text
    const analysis = `
    ${symbol.toUpperCase()} is currently trading at $${currentPrice.toFixed(2)}. 
    The technical indicators suggest a ${recommendation} position.
    RSI is at ${rsi.toFixed(1)}, indicating the asset is ${rsi < 30 ? "oversold" : rsi > 70 ? "overbought" : "neutral"}.
    MACD is ${histogram > 0 ? "positive" : "negative"}, suggesting ${histogram > 0 ? "bullish" : "bearish"} momentum.
    The short-term trend is ${trend}.
    24h Change: ${change24h.toFixed(2)}%.
  `.trim();

    return {
        symbol,
        price: currentPrice,
        recommendation,
        score,
        indicators: {
            rsi,
            macd: {
                value: macdLine,
                signal: signalLine,
                histogram
            },
            trend,
            change24h
        },
        analysis
    };
}

// --- Helper Functions ---

function calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50;

    let gains = 0;
    let losses = 0;

    for (let i = prices.length - period; i < prices.length; i++) {
        const diff = prices[i] - prices[i - 1];
        if (diff >= 0) gains += diff;
        else losses -= diff;
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

function calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1];
    const slice = prices.slice(-period);
    const sum = slice.reduce((a, b) => a + b, 0);
    return sum / period;
}

function calculateMACD(prices: number[]): { macdLine: number; signalLine: number; histogram: number } {
    // Simplified MACD: EMA(12) - EMA(26)
    // Signal: EMA(9) of MACD

    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    const macdLine = ema12 - ema26;

    // We can't easily calculate true Signal line (EMA-9 of MACD) without MACD history.
    // For approximation in this stateless function, we'll assume signal line follows macd close enough 
    // or return a simplified version. 
    // Better approach: Calculate MACD for last 9 days to get Signal.

    // Let's just return 0 for signal/histogram if we don't want to overcomplicate, 
    // OR calculate MACD for the last 9 points.

    // Recursive/Iterative approach for correct MACD
    const macdHistory: number[] = [];
    // Calculate MACD for last 9 periods
    for (let i = 9; i >= 0; i--) {
        const slice = prices.slice(0, prices.length - i);
        const e12 = calculateEMA(slice, 12);
        const e26 = calculateEMA(slice, 26);
        macdHistory.push(e12 - e26);
    }

    const signalLine = calculateEMA(macdHistory, 9);
    const histogram = macdLine - signalLine;

    return { macdLine, signalLine, histogram };
}

function calculateEMA(prices: number[], period: number): number {
    if (prices.length === 0) return 0;
    const k = 2 / (period + 1);
    let ema = prices[0];
    for (let i = 1; i < prices.length; i++) {
        ema = prices[i] * k + ema * (1 - k);
    }
    return ema;
}
