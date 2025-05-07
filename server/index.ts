import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { connectToMongoDB } from "./mongo";
import { useMongoStorage } from "./storage";
import { mongoStorage } from "./mongoStorage";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
  // Try to connect to MongoDB database but don't block server startup
  try {
    // Try MongoDB connection with a timeout
    const timeoutPromise = new Promise<boolean>((_, reject) => {
      setTimeout(() => reject(new Error("MongoDB connection timeout")), 5000);
    });
    
    const mongoPromise = connectToMongoDB();
    const mongoConnected = await Promise.race([mongoPromise, timeoutPromise])
      .catch(err => {
        log(`MongoDB connection issue: ${err.message}`, 'mongodb');
        return false;
      });
    
    if (mongoConnected) {
      // Switch to MongoDB storage
      useMongoStorage(mongoStorage);
      log("MongoDB connection successful, using MongoDB storage");
    } else {
      throw new Error("MongoDB not available. Exiting.");
    }
  } catch (error) {
    log(`Error during MongoDB setup: ${error}. Using in-memory storage.`, 'mongodb');
  }

  // Register API routes first
  const server = await registerRoutes(app);

  // Serve static files from the frontend build directory AFTER API routes
  app.use(express.static(path.join(__dirname, "../dist/public")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/public/index.html"));
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  const port = 3000;
  server.listen(port, () => {
    log(`serving on port ${port}`);
  });
})();
