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
import { setupAuth } from "./auth";
import { storage } from "./storage";

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

    const httpServer = createServer(app);
    return httpServer;
}
