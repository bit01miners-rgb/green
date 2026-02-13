import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";

import { createServer } from "http";

function log(message: string) {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [express] ${message}`);
}

const app = express();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for now to avoid breaking scripts in MVP
}));
app.use(cors({
  origin: process.env.CLIENT_URL || true, // Allow all in dev, specific in prod
  credentials: true,
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});
app.use("/api/", limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "green-funds-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);


app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

const server = registerRoutes(app);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
  throw err;
});

// only start server if file is run directly
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  (async () => {
    if (app.get("env") === "development") {
      const { setupVite } = await import("./vite");
      await setupVite(app, server);
    } else {
      const { serveStatic } = await import("./vite");
      serveStatic(app);
    }

    // Verify DB connection
    try {
      const { db } = await import("./db");
      const { sql } = await import("drizzle-orm");
      await db.execute(sql`SELECT 1`);
      log("Database connected successfully");

      const { botManager } = await import("./services/botEngine");
      await botManager.initialize();
      log("Bot Engine initialized");
    } catch (err) {
      log(`Database connection failed: ${err}`);
      process.exit(1);
    }

    const PORT = Number(process.env.PORT || 5000);
    server.listen(PORT, "0.0.0.0", () => {
      log(`serving on port ${PORT}`);
    });
  })();
}

export default app;
