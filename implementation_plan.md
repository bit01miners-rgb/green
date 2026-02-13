# Features and Modules Integration Plan

## 1. Advanced Integration of Bots
**Source**: `C:\Users\josh\Downloads\green-funds\bots`
**Goal**: Integrate existing bot scripts into the application ecosystem, making them executable/manageable from the `Trading Bots` dashboard.

### Tasks
- [ ] **Analyze Bots Directory**: Identify language (Python/JS) and dependencies of files in `bots/`.
- [ ] **Backend Integration**: Create a backend service (`server/services/botManager.ts`) to:
    - List available bots.
    - Start/Stop bot processes.
    - Stream logs from stdout/stderr to the frontend via WebSocket.
- [ ] **Frontend Update**: Connect `client/src/pages/bots.tsx` to the backend service to control real bots instead of simulated logs.

## 2. Research & Integration from Reference Sites
**Sources**: Fordefi, Starknet, Injective, Dysnix, Chainlink, Florashore GitHub.

### Features to Implement
- [ ] **Fordefi (MPC Wallet)**:
    - Enhance `privacy.tsx` with "MPC" terminology and visual flows.
    - simulate MPC signature approval flow in `server/services/mpcService.ts`.
- [ ] **Starknet/Injective (L2/Speed)**:
    - Add "Network" selector in `dashboard.tsx` and `trading.tsx` (Ethereum, Starknet, Injective).
    - Display mock gas fees/speed comparisons.
- [ ] **Chainlink (Oracles)**:
    - Integrate a mock "Oracle Feed" in `trading.tsx` showing price updates with "Verified by Chainlink" badges.
- [ ] **Florashore (Trading Platform)**:
    - Adopt their "Bot Architecture" visuals if available (from README).
    - Ensure `bots.tsx` strategies match their capabilities (Grid, DCA, Infinity).

## 3. Deep ML Integration
**Goal**: Go beyond basic random stats.

### Tasks
- [ ] **Sentiment Analysis**:
    - Create `server/services/sentimentAnalysis.ts` using `natural` or a simple dictionary-based approach on "Community Forum" posts.
    - Display "Market Sentiment" widget in `dashboard.tsx`.
- [ ] **Price Prediction**:
    - Enhance `spendingPredictor.ts` (or create `marketPredictor.ts`) to use `brain.js` (already installed) for price prediction based on historical mock data.
    - Visualize predictions in `trading.tsx`.

## 4. Community & Privacy & P2P (Refinement)
- [ ] **Mixer/Tumbler**: Ensure `privacy.tsx` logic (deposit -> note -> withdraw) works with a mock backend ledger to actually "move" balances.
- [ ] **P2P**: Connect `p2p.tsx` to a backend table `p2p_offers` to allow persistent ad posting.

## 5. Execution Strategy
1.  **Bot Integration First**: As per user request.
2.  **Backend Services**: Set up the supporting infrastructure.
3.  **Frontend Wiring**: connect UI to real (or realistic mock) services.
4.  **Deployment**: Verify on Vercel.
