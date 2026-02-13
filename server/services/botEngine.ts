import { BaseBot } from './bots/BaseBot';
import { GridTradingBot } from './bots/GridTradingBot';
import { ArbitrageBot } from './bots/ArbitrageBot';
import { MomentumAIBot } from './bots/MomentumAIBot';
import { DCABot } from './bots/DCABot';
import { SMACrossoverBot } from './bots/strategies/TrendFollowing/SMACrossoverBot';
import { RSIReversalBot } from './bots/strategies/MeanReversion/RSIReversalBot';
import { storage } from '../storage';

class BotEngine {
    private bots: Map<string, BaseBot> = new Map();
    private marketDataInterval: NodeJS.Timeout | null = null;
    private initialized = false;

    constructor() {
        this.startMarketDataFeed();
    }

    public async initialize() {
        if (this.initialized) return;

        // Load bots from DB
        const dbBots = await storage.getAllBotStrategies();

        if (dbBots.length === 0) {
            console.log("Seeding default bots...");
            await this.seedDefaultBots();
        } else {
            console.log(`Loading ${dbBots.length} bots from DB...`);
            for (const dbBot of dbBots) {
                const config = dbBot.config as any;
                const bot = this.instantiateBot(dbBot.strategyType, dbBot.id.toString(), dbBot.name, { ...config, mode: config.mode || 'PAPER' });
                if (bot) {
                    this.bots.set(bot.id, bot);
                    if (dbBot.isActive) {
                        bot.start();
                    }
                }
            }
        }
        this.initialized = true;
    }

    private async seedDefaultBots() {
        // 1. Grid Bot
        await this.createBot('grid', {
            name: 'SOL Grid Farmer',
            pair: 'SOL/USDC',
            lowerLimit: 20,
            upperLimit: 150,
            grids: 20,
            mode: 'LIVE',
            userId: 1 // Default user
        });

        // 2. Arbitrage Bot
        await this.createBot('arbitrage', {
            name: 'CEX-DEX Arb',
            pair: 'ETH/USDC',
            threshold: 2.5,
            mode: 'PAPER',
            userId: 1
        });

        // 3. Momentum AI
        await this.createBot('momentum', {
            name: 'WIF Momentum Speculator',
            pair: 'WIF/SOL',
            windowSize: 15,
            mode: 'LIVE',
            userId: 1
        });
    }

    public registerBot(bot: BaseBot) {
        if (this.bots.has(bot.id)) {
            console.warn(`Bot ${bot.id} already registered. Overwriting.`);
        }
        this.bots.set(bot.id, bot);
    }

    public getBot(id: string): BaseBot | undefined {
        return this.bots.get(id);
    }

    public getAllBots() {
        return Array.from(this.bots.values()).map(bot => bot.getStatus());
    }

    public async startBot(id: string): Promise<boolean> {
        const bot = this.bots.get(id);
        if (!bot) return false;

        bot.start();

        // Update DB
        try {
            await storage.updateBotStrategy(parseInt(id), { isActive: true });
        } catch (e) {
            console.error(`Failed to update bot ${id} status in DB`, e);
        }
        return true;
    }

    public async stopBot(id: string): Promise<boolean> {
        const bot = this.bots.get(id);
        if (!bot) return false;

        bot.stop();

        // Update DB
        try {
            await storage.updateBotStrategy(parseInt(id), { isActive: false });
        } catch (e) {
            console.error(`Failed to update bot ${id} status in DB`, e);
        }
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

    public instantiateBot(type: string, id: string, name: string, config: any): BaseBot | null {
        switch (type) {
            case 'grid': return new GridTradingBot(id, name, config);
            case 'arbitrage': return new ArbitrageBot(id, name, config);
            case 'momentum': return new MomentumAIBot(id, name, config);
            case 'dca': return new DCABot(id, name, config);
            case 'sma-crossover': return new SMACrossoverBot(id, name, config);
            case 'rsi-reversal': return new RSIReversalBot(id, name, config);
            default:
                console.error(`Unknown bot type: ${type}`);
                return null;
        }
    }

    public async createBot(type: string, config: any): Promise<BaseBot | null> {
        // Save to DB first to get ID
        const userId = config.userId || 1; // Fallback to 1 if not provided (system bot)

        try {
            const dbBot = await storage.createBotStrategy({
                userId,
                name: config.name || `${type.toUpperCase()} Bot`,
                strategyType: type,
                config: config,
                isActive: false,
                riskLevel: 5
            });

            const id = dbBot.id.toString();
            const bot = this.instantiateBot(type, id, dbBot.name, { ...config, mode: config.mode || 'PAPER' });

            if (bot) {
                this.registerBot(bot);
                return bot;
            }
        } catch (e) {
            console.error("Failed to create bot in DB", e);
        }
        return null;
    }

    private startMarketDataFeed() {
        if (this.marketDataInterval) clearInterval(this.marketDataInterval);
    }
}

export const botManager = new BotEngine();
