// server/src/routes/eligibility.ts
// POST /api/eligibility
// Accepts a farmer profile, runs the full RAG chain across all schemes,
// and returns structured eligibility results with AI explanations.

import express, { Request, Response } from "express";
import { runRAGChainAll } from "../rag/ragChain.js";
import { getSchemesCollection } from "../db.js";
import type { FarmerProfile } from "../types.js";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { profile } = req.body as { profile: FarmerProfile };

    if (!profile || typeof profile !== "object") {
      res.status(400).json({ error: "Missing or invalid profile object" });
      return;
    }

    const schemesCol = await getSchemesCollection();
    const schemes    = await schemesCol.find({}).toArray();

    if (schemes.length === 0) {
      res.status(503).json({ error: "No schemes found. Please run: npm run ingest" });
      return;
    }

    console.log(`\n🔍 Running RAG chain for profile:`, profile);
    const results = await runRAGChainAll(profile, schemes);
    console.log(`✅ RAG chain complete — ${results.length} results`);

    res.json({ results });
  } catch (err) {
    const error = err as Error;
    console.error("❌ Eligibility error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
