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
import { setupAuth } from "./auth";
import { storage } from "./storage";
import adminRoutes from "./routes/admin";
import hmntRoutes from "./routes/hmnt";

export function registerRoutes(app: Express): Server {
    setupAuth(app);

    // Health check endpoint for monitoring
    app.get("/api/health", (_req, res) => {
        res.json({
            status: "ok",
            timestamp: new Date().toISOString(),
            version: "1.0.0"
        });
    });

    app.use("/api/ai", aiRoutes);
    app.use("/api/banking", bankingRoutes);
    app.use("/api/commercial", commercialRoutes);

    app.use("/api/defi", defiRoutes);
    app.use("/api/finance", financeRoutes);
    app.use("/api/lending", lendingRoutes);
    app.use("/api/trading", tradingRoutes);
    app.use("/api/compliance", complianceRoutes);
    app.use("/api/token", tokenRoutes);
    app.use("/api/bots", botRoutes);
    app.use("/api/privacy", privacyRoutes);
    app.use("/api/p2p", p2pRoutes);
    app.use("/api/forum", forumRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/hmnt", hmntRoutes);

    const httpServer = createServer(app);
    return httpServer;
}
