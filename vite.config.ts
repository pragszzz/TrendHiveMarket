import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// This config should be synchronous to avoid issues with dynamic imports
export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          // Only import @replit/vite-plugin-cartographer in non-production environment
          require("@replit/vite-plugin-cartographer").cartographer(),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"), // Use __dirname for path resolution
      "@shared": path.resolve(__dirname, "client/shared"),
      "@assets": path.resolve(__dirname, "client/attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"), // Use __dirname here too
  build: {
    outDir: path.resolve(__dirname, "dist", "public"), // Use __dirname here as well
    emptyOutDir: true,
  },
});
