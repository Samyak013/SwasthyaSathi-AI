import dotenv from "dotenv";
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed";
import { initializeEmailTransporter } from "./notifications";

// Initialize email transporter after environment is loaded
initializeEmailTransporter();

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

// Request timeout middleware - optimized for Render free tier
app.use((req, res, next) => {
  // Set longer timeout for free tier (30 seconds)
  req.socket.setTimeout(30000);
  
  // OTP endpoint gets 20 seconds timeout
  // All other /api endpoints get 15 seconds
  if (req.path.startsWith('/api')) {
    const isOTPEndpoint = req.path.includes('otp') || req.path.includes('auth');
    const timeoutMs = isOTPEndpoint ? 20000 : 15000;
    
    const timeoutHandle = setTimeout(() => {
      if (!res.headersSent) {
        console.error(`⏱️ Request timeout (${timeoutMs}ms) for ${req.method} ${req.path}`);
        res.status(504).json({ message: 'Request timeout - server busy' });
      }
    }, timeoutMs);

    res.on('finish', () => clearTimeout(timeoutHandle));
    res.on('close', () => clearTimeout(timeoutHandle));
  }
  
  next();
});

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

(async () => {
  // Seed database in background (don't block server startup)
  // Add 10-second timeout to prevent hanging on slow databases
  const seedPromise = Promise.race([
    seedDatabase(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database seeding timeout')), 10000)
    ),
  ]);
  
  seedPromise.catch(err => {
    console.error('⚠️ Database seeding failed, but server will continue:', err.message);
  });
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  // In production (Render), bind to 0.0.0.0 so Render can detect the open port
  // In development, use 0.0.0.0 to accept both IPv4 and IPv6
  const isProduction = process.env.NODE_ENV === 'production';
  const host = process.env.HOST || '0.0.0.0';
  server.listen({
    port,
    host,
  }, () => {
    log(`serving on http://localhost:${port}`);
  });
})();
