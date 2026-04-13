// server/src/rag/ingest.ts
// ─────────────────────────────────────────────────────────────────────
// PDF ingestion pipeline.
//
// Can be run two ways:
//   1. CLI (one-time):  npm run ingest
//      Reads all PDFs from server/pdfs/ based on SCHEME_METADATA below.
//
//   2. Programmatic:    import { ingestSingleScheme }
//      Called by the upload route when a new PDF is uploaded via API.
// ─────────────────────────────────────────────────────────────────────

import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pdfParse from "pdf-parse";
import dotenv from "dotenv";
import { pipeline } from "@xenova/transformers";
import { connectDB, getChunksCollection, getSchemesCollection } from "../db.js";
import type { Scheme, Chunk } from "../types.js";
import type { Collection } from "mongodb";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

// Default scheme metadata used by the CLI ingest command
const SCHEME_METADATA: Partial<Scheme>[] = [
  {
    id: "pmkisan", name: "PM-KISAN", emoji: "🌾",
    fullName: "Pradhan Mantri Kisan Samman Nidhi",
    benefit: "₹6,000 / year", installments: "3 installments of ₹2,000",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    applyAt: "pmkisan.gov.in",
    color: "#16a34a", light: "#dcfce7", dark: "#14532d",
    pdfFile: "pmkisan.pdf",
  },
  {
    id: "pmfby", name: "PMFBY", emoji: "🛡️",
    fullName: "Pradhan Mantri Fasal Bima Yojana",
    benefit: "Full crop insurance", installments: "Coverage up to full sum insured",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    applyAt: "pmfby.gov.in",
    color: "#0369a1", light: "#dbeafe", dark: "#1e3a5f",
    pdfFile: "pmfby.pdf",
  },
  {
    id: "kcc", name: "KCC", emoji: "💳",
    fullName: "Kisan Credit Card Scheme",
    benefit: "Credit up to ₹3 lakh", installments: "@ 4% interest p.a.",
    ministry: "Ministry of Finance",
    applyAt: "Your nearest bank branch",
    color: "#7c3aed", light: "#ede9fe", dark: "#3b0764",
    pdfFile: "kcc.pdf",
  },
  {
    id: "pmksy", name: "PMKSY", emoji: "💧",
    fullName: "Pradhan Mantri Krishi Sinchayee Yojana",
    benefit: "Irrigation & Water efficiency", installments: "Various subsidies for micro-irrigation",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    applyAt: "pmksy.gov.in",
    color: "#0ea5e9", light: "#e0f2fe", dark: "#0c4a6e",
    pdfFile: "Pradhan Mantri Krishi Sichai Yojana.pdf",
  },
  {
    id: "pkvy", name: "PKVY", emoji: "🍀",
    fullName: "Paramparagat Krishi Vikas Yojana",
    benefit: "Organic Farming Support", installments: "₹50,000 / hectare for 3 years",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    applyAt: "pgsindia-ncof.gov.in",
    color: "#84cc16", light: "#f1f8e9", dark: "#365314",
    pdfFile: "paramparagat-krishi-vikas-yojana.pdf",
  },
  {
    id: "agribudget", name: "Agri Budget", emoji: "📊",
    fullName: "Demand for Grants Analysis 2026-27: Agriculture",
    benefit: "Policy & Funding insights", installments: "Not a direct payout scheme",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    applyAt: "prsindia.org",
    color: "#64748b", light: "#f1f5f9", dark: "#0f172a",
    pdfFile: "DfG_Analysis_2026-27-Agriculture.pdf",
  },
];

// ── Split text into overlapping chunks ───────────────────────────────
function chunkText(text: string, chunkSize = 500, overlap = 100): string[] {
  const words  = text.replace(/\s+/g, " ").trim().split(" ");
  const chunks: string[] = [];
  let i = 0;
  while (i < words.length) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    if (chunk.trim().length > 50) chunks.push(chunk);
    i += chunkSize - overlap;
  }
  return chunks;
}

// ── Generate embedding vector ─────────────────────────────────────────
async function embedText(text: string): Promise<number[]> {
  const result = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(result.data as number[]);
}

// ── Ingest a single scheme (exported for use by upload route) ─────────
export async function ingestSingleScheme(scheme: Scheme | Partial<Scheme>, chunksCol: Collection<Chunk>): Promise<number> {
  if (!scheme.pdfFile || !scheme.id || !scheme.name) {
    console.warn(`⚠️ Missing required scheme fields for ingestion. Skipping.`);
    return 0;
  }

  const pdfPath = path.join(__dirname, "../../pdfs", scheme.pdfFile);
  if (!fs.existsSync(pdfPath)) {
    console.warn(`⚠️  PDF not found: ${pdfPath} — skipping ${scheme.name}`);
    return 0;
  }

  console.log(`\n📄 Ingesting ${scheme.name} from ${scheme.pdfFile}...`);
  const parsed = await pdfParse(fs.readFileSync(pdfPath));
  const chunks = chunkText(parsed.text, 500, 100);
  console.log(`   ${chunks.length} chunks created`);

  // Clean re-ingest: remove old chunks first
  await chunksCol.deleteMany({ schemeId: scheme.id });

  let stored = 0;
  for (let i = 0; i < chunks.length; i++) {
    const embedding = await embedText(chunks[i]);
    await chunksCol.insertOne({
      schemeId:   scheme.id as string,
      schemeName: scheme.name as string,
      chunkIndex: i,
      text:       chunks[i],
      embedding,
      wordCount:  chunks[i].split(" ").length,
      createdAt:  new Date(),
    } as any);
    stored++;
    process.stdout.write(`   Stored ${stored}/${chunks.length} chunks\r`);
    await new Promise((r) => setTimeout(r, 50)); // 50ms rate-limit buffer
  }

  console.log(`\n   ✅ ${stored} chunks stored for ${scheme.name}`);
  return stored;
}

// ── CLI entry point ───────────────────────────────────────────────────
async function main() {
  console.log("🚀 Niti-Setu RAG Ingestion Pipeline\n");

  await connectDB();
  const chunksCol  = await getChunksCollection();
  const schemesCol = await getSchemesCollection();

  // Upsert metadata for all schemes
  console.log("📋 Upserting scheme metadata...");
  for (const s of SCHEME_METADATA) {
    if (s.id) {
      await schemesCol.updateOne(
        { id: s.id },
        { $set: { ...s, updatedAt: new Date() } },
        { upsert: true }
      );
    }
  }
  console.log(`   ✅ ${SCHEME_METADATA.length} schemes saved\n`);

  // Ingest each PDF
  let total = 0;
  for (const scheme of SCHEME_METADATA) {
    total += await ingestSingleScheme(scheme, chunksCol);
  }

  console.log(`\n🎉 Ingestion complete — ${total} total chunks stored`);
  process.exit(0);
}

// Run only when called directly from CLI
import { fileURLToPath as fu2p } from "url";
if (process.argv[1] === fu2p(import.meta.url)) {
  main().catch((err: Error) => {
    console.error("❌ Ingestion failed:", err);
    process.exit(1);
  });
}
