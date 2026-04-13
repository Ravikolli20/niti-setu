// server/src/index.ts
// Express server entry point for the Niti-Setu RAG backend.

import dns from "node:dns";
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db.js";
import eligibilityRoutes from "./routes/eligibility.js";
import schemesRoutes from "./routes/schemes.js";
import profilesRoutes from "./routes/profiles.js";
import { errorHandler } from "./middleware/errorHandler.js";

// DNS workaround for Windows MongoDB compatibility (Google Public DNS)
if (process.platform === "win32") {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
}

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Global Error Handlers ──────────────────────────────────────────────
process.on("unhandledRejection", (reason, promise) => {
  const msg = `\n🛑 Unhandled Rejection at: ${promise} reason: ${reason}\n`;
  process.stderr.write(msg);
});

process.on("uncaughtException", (err) => {
  const msg = `\n🛑 Uncaught Exception:\n${err.stack || err}\n`;
  process.stderr.write(msg);
  setTimeout(() => process.exit(1), 500);
});

// ── Middleware ────────────────────────────────────────────────────────
const corsOptions = {
  origin: process.env.PROD_ORIGIN || ["http://localhost:3000", "http://127.0.0.1:3000"],
  methods: ["GET", "POST"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.set("Cache-Control", "no-store");
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/eligibility", eligibilityRoutes);
app.use("/api/schemes",     schemesRoutes);
app.use("/api/profiles",    profilesRoutes);

app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────
async function start(): Promise<void> {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`\n🚀 Niti-Setu RAG Server running on http://localhost:${PORT}`);
      console.log(`   Health:      GET  /api/health`);
      console.log(`   Schemes:     GET  /api/schemes`);
      console.log(`   Eligibility: POST /api/eligibility`);
      console.log(`   Upload PDF:  POST /api/schemes/upload\n`);
    });
  } catch (err) {
    const errorMsg = `\n❌ Failed to start server:\n${err instanceof Error ? err.stack : err}\n`;
    process.stderr.write(errorMsg);
    setTimeout(() => process.exit(1), 500);
  }
}

start();
