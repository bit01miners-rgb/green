import express from 'express';
import { BacktestEngine } from '../services/backtesting/BacktestEngine';
import styles from 'ansi-styles';

const router = express.Router();

router.post('/run', async (req, res) => {
    try {
        const { strategyId, config, range } = req.body;

        // Use default config if not fully provided
        const backtestConfig = {
            botType: strategyId,
            botConfig: config,
            initialCapital: 10000,
            startDate: new Date(range?.start || Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: new Date(range?.end || Date.now()),
            pair: config.pair || 'ETH/USDC',
            interval: config.interval || '1h',
            feeRate: 0.001 // 0.1% tier
        };

        const engine = new BacktestEngine(backtestConfig);
        const report = await engine.run();

        res.json(report);
    } catch (error) {
        console.error(`${styles.red.open}Generic Error in Backtest:${styles.red.close}`, error);
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;
