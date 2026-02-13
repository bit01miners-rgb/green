# Green Funds Trading Bot Framework

## Overview

The Green Funds platform now includes a comprehensive Algorithmic Trading Studio (`/bots`), allowing users to deploy, monitor, and manage automated trading strategies.

## Features

### 1. Bot Dashboard
- **Active Agent Monitoring**: View real-time status of all running bots.
- **Performance Metrics**: Track total trades, win rates, and PnL.
- **Log Terminal**: Inspect live logs from individual bot instances.
- **Control Panel**: Start/Stop bots with a single click.

### 2. Strategy Marketplace
Users can deploy new bots from a curated list of strategies:

- **Grid Trading**: Profits from ranging markets by placing buy/sell orders at predefined intervals.
- **Arbitrage**: Exploits price differences between exchanges (e.g., CEX vs DEX).
- **Momentum AI**: Uses machine learning models to predict short-term price movements.
- **DCA Accumulator**: Dollar Cost Averaging strategy for long-term holding.
- **SMA Crossover**: Classic trend-following strategy using moving average crossovers.
- **RSI Reversal**: Mean reversion strategy buying oversold and selling overbought conditions.

### 3. Execution Engine
The backend (`server/services/botEngine.ts`) manages the lifecycle of all bots.
- **BaseBot Architecture**: All bots inherit from a common base class, ensuring consistent logging, state management, and execution logic.
- **Live & Paper Trading**: All strategies support both simulation (Paper) and real execution (Live) modes.
- **Extensibility**: New strategies can be easily added by extending `BaseBot` and implementing the `analyze()` method.

## Supported Strategies Implementation

### Grid Trading (`GridTradingBot.ts`)
- Initialized with `lowerLimit`, `upperLimit`, and `grids` count.
- Places simulated buy/sell orders when price crosses grid lines.

### Momentum AI (`MomentumAIBot.ts`)
- Uses a Z-Score based statistical model to detect abnormal price momentum.
- Buys when momentum is significantly positive, Sells when significantly negative.

### SMA Crossover (`SMACrossoverBot.ts`)
- Standard technical analysis strategy.
- **Golden Cross**: Fast MA crosses above Slow MA -> BUY.
- **Death Cross**: Fast MA crosses below Slow MA -> SELL.

### RSI Reversal (`RSIReversalBot.ts`)
- Detects overbought/oversold conditions using RSI indicator.
- Buys on recovery from oversold (<30).
- Sells on correction from overbought (>70).

## Configuration
The bot engine can be configured via environment variables for live trading:
- `BINANCE_API_KEY` & `BINANCE_SECRET`: For CEX execution.
- `ETHEREUM_RPC` & `PRIVATE_KEY`: For DEX execution.

## Future Roadmap
- **Backtesting Engine**: Allow users to test strategies against historical data before deployment.
- **Advanced Risk Management**: Global stop-loss and daily drawdown limits.
- **Social Trading**: Allow users to copy successful bots from other users.
