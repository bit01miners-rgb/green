# Green Funds Platform Architecture & User Guide

## 1. System Unification Overview

The Green Funds platform is a unified Full-Stack Fintech Application designed to bridge **Traditional Finance (Web2)** and **Decentralized Finance (Web3)**.

### Core Architecture
- **Frontend**: React 18, TailwindCSS, ShadcnUI, Recharts.
- **Backend**: Node.js, Express.
- **Database**: PostgreSQL (via Drizzle ORM).
- **Integration Layer**: 
  - `server/routes.ts`: Central routing hub that registers all module endpoints.
  - `server/storage.ts`: Unified data access layer for all modules.
  - `shared/schema.ts`: Single source of truth for data models (User, Accounts, Bots, Invoices).

### How Modules Interact
All modules share the same:
1.  **Authentication**: Users log in once and access all features (Banking, Trading, Commercial).
2.  **Wallet Connection**: A connected Web3 wallet is accessible by DeFi, Flash Loans, and Trading Bots.
3.  **Data Graph**: Transactions in "Banking" can influence "Credit Score" in "Lending" and provide capital for "Trading Bots".

---

## 2. Flash Loan Mechanics (`/flash-loan`)

**What is a Flash Loan?**
A Flash Loan is a DeFi transaction where you borrow a large amount of capital (e.g., $10M), use it to execute a strategy (like Arbitrage), and repay the loan **within the same transaction block**. If the repayment fails, the entire transaction is reverted as if it never happened.

### Implementation Detail
1.  **Frontend (`client/src/pages/flash-loan.tsx`)**:
    -   User selects an Asset (ETH, USDC) and Direction (Long/Short).
    -   User inputs a Loan Amount.
    -   When "Execute" is clicked, it sends a request to `/api/defi/flash-loan`.

2.  **Backend (`server/services/defi/flashLoan.ts`)**:
    -   The `executeFlashLoan` service receives the request.
    -   **Simulation**: Since this is a demo environment, it simulates network latency (2s) and calculates a probabilistic outcome.
    -   **Gas Calculation**: Estimates the gas cost (in Gwei) required for the atomic transaction.
    -   **Profit/Loss**: Simulates arbitrage opportunities (0.1% - 0.5% return) or failure (slippage exceeded).

### Usage
-   **Risk**: High. If the arbitrage path (e.g., buying on Uniswap, selling on Sashimi) doesn't yield enough profit to cover the loan fee (usually 0.09%), the transaction reverts.
-   **Goal**: To make risk-free profit using the protocol's liquidity.

---

## 3. Module Breakdown & Usage

### A. Algorithmic Trading Studio (`/bots`)
**Feature**: Automated trading terminal.
-   **Visuals**: "Matrix-style" terminal with real-time logs and live price charts.
-   **Marketplace**: Users implement "Studios" (strategies) like Grid, Momentum AI, or Arbitrage.
-   **Bot Engine**: The backend `BotEngine` runs independent loops for each bot, fetching market data and executing orders via `ExecutionService`.

### B. Commercial Finance (`/commercial`, `/invoices`)
**Feature**: Business banking tools.
-   **Invoicing**: Create, send, and track PDF invoices.
-   **Payroll**: Manage employee salaries and automated payouts.
-   **Integration**: Invoices paid updates the main "Banking" balance automatically.

### C. Personal Banking (`/banking`, `/finance`)
**Feature**: Day-to-day financial management.
-   **Accounts**: Checking, Savings, and Investment portfolios.
-   **Budgeting**: Set limits on categories (Food, Travel).
-   **Smart Transfers**: Move money between internal accounts or to external users.

### D. DeFi & Swap (`/defi`, `/swap`)
**Feature**: Direct blockchain interaction.
-   **Swap**: Exchange tokens (ETH -> USDC) using simulated liquidity pools.
-   **Collateral Optimization**: Analyze and optimize loan-to-value ratios for crypto loans.
-   **Staking**: Earn yield on deposited crypto assets.

### E. AI Advisor (`/ai`, `/sentiment`)
**Feature**: Machine learning insights.
-   **Advisor**: Chat interface (RAG) to ask financial questions ("How can I save more?").
-   **Sentiment Analysis**: Scans social media (simulated) to gauge market fear/greed index for trading signals.
-   **Risk Scoring**: Analyzes transaction history to generate a credit score.

---

## 4. How to Use the System
1.  **Start the Server**: `npm run dev`
2.  **Access the Dashboard**: Navigate to `http://localhost:5000`.
3.  **Navigate**: Use the sidebar/nav to jump between modules.
4.  **Bot Studio**:
    -   Go to **Bots**.
    -   Click the **Studio Marketplace** tab.
    -   Select **Momentum AI Studio** and click **Deploy**.
    -   Switch to **Live Terminal**, select your new bot, and click **Run Studio**.
    -   Watch the chart update and logs stream in.
