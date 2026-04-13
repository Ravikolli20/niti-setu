// server/src/routes/schemes.ts
// GET  /api/schemes          — fetch all scheme metadata from MongoDB
// POST /api/schemes/upload   — upload a new PDF and trigger ingestion

import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { getSchemesCollection, getChunksCollection } from "../db.js";
import { ingestSingleScheme } from "../rag/ingest.js";
import type { Scheme } from "../types.js";

const router    = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PDF_DIR   = path.join(__dirname, "../../pdfs");

// Multer — store uploaded PDFs in server/pdfs/
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, PDF_DIR),
  filename:    (_req, file, cb) => cb(null, file.originalname),
});
const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed"));
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

// ── GET /api/schemes ──────────────────────────────────────────────────
router.get("/", async (_req: Request, res: Response) => {
  try {
    const col     = await getSchemesCollection();
    const schemes = await col.find({}, { projection: { _id: 0, embedding: 0 } }).toArray();
    res.json({ schemes });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ── GET /api/schemes/:id/chunks ───────────────────────────────────────
router.get("/:id/chunks", async (req: Request, res: Response) => {
  try {
    const col   = await getChunksCollection();
    const count = await col.countDocuments({ schemeId: req.params.id });
    res.json({ schemeId: req.params.id, chunkCount: count });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ── POST /api/schemes/upload ──────────────────────────────────────────
router.post("/upload", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No PDF file uploaded" });
      return;
    }

    const meta: Scheme & { updatedAt?: Date } = {
      id:           req.body.id,
      name:         req.body.name,
      emoji:        req.body.emoji        || "📄",
      fullName:     req.body.fullName,
      benefit:      req.body.benefit      || "",
      installments: req.body.installments || "",
      ministry:     req.body.ministry     || "",
      applyAt:      req.body.applyAt      || "",
      color:        req.body.color        || "#16a34a",
      light:        req.body.light        || "#dcfce7",
      dark:         req.body.dark         || "#14532d",
      pdfFile:      req.file.originalname,
      updatedAt:    new Date(),
    };

    if (!meta.id || !meta.name || !meta.fullName) {
      res.status(400).json({ error: "id, name, and fullName are required" });
      return;
    }

    const schemesCol = await getSchemesCollection();
    await schemesCol.updateOne({ id: meta.id }, { $set: meta }, { upsert: true });

    res.json({ message: "PDF uploaded. Ingestion starting...", schemeId: meta.id });

    // Run ingestion in background
    const chunksCol = await getChunksCollection();
    ingestSingleScheme(meta, chunksCol)
      .then((count) => console.log(`✅ Ingested ${count} chunks for ${meta.name}`))
      .catch((err)  => console.error(`❌ Ingestion failed for ${meta.name}:`, err));

  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
