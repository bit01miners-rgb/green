import type { Express } from "express";
import { createServer, type Server } from "http";
import aiRoutes from "./routes/ai";
import bankingRoutes from "./routes/banking";
import commercialRoutes from "./routes/commercial";
import defiRoutes from "./routes/defi";
import financeRoutes from "./routes/finance";
import lendingRoutes from "./routes/lending";
import tradingRoutes from "./routes/trading";
import complianceRoutes from "./routes/compliance";
import tokenRoutes from "./routes/token";
import botRoutes from "./routes/bots";
import privacyRoutes from "./routes/privacy";
import p2pRoutes from "./routes/p2p";
import forumRoutes from "./routes/forum";
import adminRoutes from "./routes/admin";
import hmntRoutes from "./routes/hmnt";
import web3Routes from "./routes/web3";
import backtestRoutes from "./routes/backtest";
import { setupAuth, authMiddleware } from "./auth";
import { storage } from "./storage";

export function registerRoutes(app: Express): Server {
    // Basic auth setup
    setupAuth(app);

    app.get("/api/health", (_req, res) => {
        res.json({
            status: "ok",
            timestamp: new Date().toISOString(),
            version: "1.0.0"
        });
    });
    app.use("/api/ai", authMiddleware, aiRoutes);
    app.use("/api/banking", authMiddleware, bankingRoutes);
    app.use("/api/commercial", authMiddleware, commercialRoutes);
    app.use("/api/defi", authMiddleware, defiRoutes);
    app.use("/api/finance", authMiddleware, financeRoutes);
    app.use("/api/lending", authMiddleware, lendingRoutes);
    app.use("/api/trading", tradingRoutes); // Mixed route - handled internally
    app.use("/api/compliance", authMiddleware, complianceRoutes);
    app.use("/api/token", authMiddleware, tokenRoutes);
    app.use("/api/bots", authMiddleware, botRoutes);
    app.use("/api/privacy", authMiddleware, privacyRoutes);
    app.use("/api/p2p", p2pRoutes); // Mixed route - handled internally
    app.use("/api/forum", forumRoutes); // Mixed route - handled internally
    app.use("/api/admin", authMiddleware, adminRoutes);
    app.use("/api/hmnt", authMiddleware, hmntRoutes);
    app.use("/api/web3", web3Routes); // Public
    app.use("/api/backtest", authMiddleware, backtestRoutes);

    const httpServer = createServer(app);
    return httpServer;
}
