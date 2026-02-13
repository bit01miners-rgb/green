import { BaseBot } from './bots/BaseBot';
import { GridTradingBot } from './bots/GridTradingBot';
import { ArbitrageBot } from './bots/ArbitrageBot';
import { MomentumAIBot } from './bots/MomentumAIBot';
import { DCABot } from './bots/DCABot';
import { SMACrossoverBot } from './bots/strategies/TrendFollowing/SMACrossoverBot';
import { RSIReversalBot } from './bots/strategies/MeanReversion/RSIReversalBot';

class BotEngine {
    private bots: Map<string, BaseBot> = new Map();
    private marketDataInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.startMarketDataFeed();
        this.registerDefaultBots();
    }

    private registerDefaultBots() {
        // 1. Grid Bot
        this.registerBot(new GridTradingBot('grid-1', 'SOL Grid Farmer', {
            pair: 'SOL/USDC',
            lowerLimit: 20,
            upperLimit: 150,
            grids: 20,
            mode: 'LIVE'
        }));

        // 2. Arbitrage Bot
        this.registerBot(new ArbitrageBot('arb-1', 'CEX-DEX Arb', {
            pair: 'ETH/USDC',
            threshold: 2.5,
            mode: 'PAPER'
        }));

        // 3. Momentum AI
        this.registerBot(new MomentumAIBot('ai-1', 'WIF Momentum Speculator', {
            pair: 'WIF/SOL',
            windowSize: 15,
            mode: 'LIVE'
        }));

        // 4. DCA Bot
        this.registerBot(new DCABot('dca-1', 'Bitcoin Accumulator', {
            pair: 'BTC/USDT',
            amountPerTrade: 50,
            interval: '1d',
            mode: 'LIVE'
        }));

        // 5. SMA Crossover
        this.registerBot(new SMACrossoverBot('sma-1', 'ETH Trend Follower', {
            pair: 'ETH/USD',
            fastPeriod: 9,
            slowPeriod: 21,
            mode: 'PAPER'
        }));

        // 6. RSI Reversal
        this.registerBot(new RSIReversalBot('rsi-1', 'Oversold Sniper', {
            pair: 'JUP/USDC',
            rsiPeriod: 14,
            oversold: 30,
            overbought: 70,
            mode: 'LIVE'
        }));
    }

    public registerBot(bot: BaseBot) {
        if (this.bots.has(bot.id)) {
            console.warn(`Bot ${bot.id} already registered. Overwriting.`);
        }
        this.bots.set(bot.id, bot);

        // Forward logs
        bot.on('log', (msg) => {
            // Here we could persist logs to DB or websocket
            // console.log(`[BOT-${bot.id}] ${msg}`);
        });
    }

    public getBot(id: string): BaseBot | undefined {
        return this.bots.get(id);
    }

    public getAllBots() {
        return Array.from(this.bots.values()).map(bot => bot.getStatus());
    }

    public startBot(id: string): boolean {
        const bot = this.bots.get(id);
        if (!bot) return false;
        bot.start();
        return true;
    }

    public stopBot(id: string): boolean {
        const bot = this.bots.get(id);
        if (!bot) return false;
        bot.stop();
        return true;
    }

    public getBotLogs(id: string): string[] {
        const bot = this.bots.get(id);
        return bot ? bot.getLogs() : [];
    }

    public getAvailableStrategies() {
        return [
            { id: 'grid', name: 'Grid Trading', description: 'Profits from ranging markets by placing buy/sell grid.', category: 'Grid' },
            { id: 'arbitrage', name: 'CEX-DEX Arbitrage', description: 'Exploits price differences between exchanges.', category: 'Arbitrage' },
            { id: 'momentum', name: 'Momentum AI', description: 'AI-driven trend following using Z-Score.', category: 'AI/ML' },
            { id: 'dca', name: 'DCA Accumulator', description: 'Dollar Cost Averaging for long-term accumulation.', category: 'Accumulation' },
            { id: 'sma-crossover', name: 'SMA Crossover', description: 'Simple Moving Average Golden/Death Cross.', category: 'Trend' },
            { id: 'rsi-reversal', name: 'RSI Reversal', description: 'Mean reversion strategy for overbought/oversold.', category: 'Mean Reversion' }
        ];
    }

    public createBot(type: string, config: any): BaseBot | null {
        const id = `bot-${Date.now()}`;
        const name = config.name || `${type.toUpperCase()} Bot`;

        let bot: BaseBot | null = null;

        switch (type) {
            case 'grid':
                bot = new GridTradingBot(id, name, { ...config, mode: config.mode || 'PAPER' });
                break;
            case 'arbitrage':
                bot = new ArbitrageBot(id, name, { ...config, mode: config.mode || 'PAPER' });
                break;
            case 'momentum':
                bot = new MomentumAIBot(id, name, { ...config, mode: config.mode || 'PAPER' });
                break;
            case 'dca':
                bot = new DCABot(id, name, { ...config, mode: config.mode || 'PAPER' });
                break;
            case 'sma-crossover':
                bot = new SMACrossoverBot(id, name, { ...config, mode: config.mode || 'PAPER' });
                break;
            case 'rsi-reversal':
                bot = new RSIReversalBot(id, name, { ...config, mode: config.mode || 'PAPER' });
                break;
            default:
                console.error(`Unknown bot type: ${type}`);
                return null;
        }

        if (bot) {
            this.registerBot(bot);
            return bot;
        }
        return null;
    }

    // Centralized market data feeed (Mocked for now)
    // In a real system, this would connect to websocket streams from Binance/Coinbase
    // and dispatch updates to relevant bots based on their subscription (pair/interval)
    private startMarketDataFeed() {
        if (this.marketDataInterval) clearInterval(this.marketDataInterval);

        // this.marketDataInterval = setInterval(() => {
        //   this.bots.forEach(bot => {
        //     if (bot.status === 'running') {
        //         // In the BaseBot.runLoop we are currently fetching data individually
        //         // Optimally we push data here: bot.onMarketData(data)
        //     }
        //   });
        // }, 1000);
    }
}

export const botManager = new BotEngine();
