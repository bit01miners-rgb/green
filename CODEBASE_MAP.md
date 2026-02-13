# Codebase Discovery and Mapping

## Root Directory: `c:/Users/josh/Downloads/green-funds`

### Directory Tree

```
├── api/
│   └── index.js (Vercel Adapter)
├── client/
│   ├── public/
│   └── src/
│       ├── components/ (UI, Layouts, Charts)
│       ├── hooks/ (useAuth, etc.)
│       ├── lib/ (queryClient, utils)
│       └── pages/ (bots.tsx, flash-loan.tsx, dashboard.tsx, etc.)
├── server/
│   ├── routes/ (API Endpoints for bots, defi, etc.)
│   ├── services/
│   │   ├── ai/ (sentiment, advisor)
│   │   ├── bots/ (BaseBot, Strategies)
│   │   ├── defi/ (flashLoan)
│   │   └── botEngine.ts
│   ├── storage.ts (Database Access)
│   └── index.ts (Server Entry)
├── shared/
│   └── schema.ts (Database Models)
├── dist/ (Build Output)
├── contracts/ (Smart Contracts)
└── scripts/ (Deployment & Test Scripts)
```

### File Manifest

| File Path | Type | Description |
|-----------|------|-------------|
| `server/services/botEngine.ts` | TypeScript | Core logic for managing trading bot lifecycles. |
| `client/src/pages/bots.tsx` | React (TSX) | Frontend interface for the Trading Bot Studio. |
| `server/services/defi/flashLoan.ts` | TypeScript | Simulation logic for Flash Loan execution. |
| `shared/schema.ts` | TypeScript | Drizzle ORM schema definitions for all data models. |
| `server/routes.ts` | TypeScript | Central API router registering all module routes. |
| `client/src/App.tsx` | React (TSX) | Main frontend application router. |
| `server/storage.ts` | TypeScript | Data access layer implementation. |
| `vite.config.ts` | TypeScript | Vite build configuration. |
| `vercel.json` | JSON | Deployment configuration for Vercel. |

*Note: This list is a high-level summary. The actual scan found 162+ files.*
