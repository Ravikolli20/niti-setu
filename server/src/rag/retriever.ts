// server/src/rag/retriever.ts
import { getChunksCollection } from "../db.js";
import { pipeline } from "@xenova/transformers";
import dotenv from "dotenv";
import type { FarmerProfile, Chunk } from "../types.js";
import crypto from "crypto";

dotenv.config();

// PHASE 2: Use multilingual embedding model for better regional language support
const embeddingModel = await pipeline(
  "feature-extraction",
  "Xenova/multilingual-e5-base", // Upgraded from all-MiniLM-L6-v2 for better multilingual support
  { quantized: true } // Use quantized version for speed
);

// PHASE 2: Context caching to reduce token usage
interface CachedContext {
  schemeId: string;
  context: string;
  hash: string;
  createdAt: Date;
}

const contextCache = new Map<string, CachedContext>();

// Cache cleanup (remove entries older than 24 hours)
setInterval(() => {
  const now = new Date();
  for (const [key, value] of contextCache.entries()) {
    if (now.getTime() - value.createdAt.getTime() > 24 * 60 * 60 * 1000) {
      contextCache.delete(key);
    }
  }
}, 60 * 60 * 1000); // Run every hour

async function embedText(text: string): Promise<number[]> {
  const result = await embeddingModel(text, { pooling: "mean", normalize: true });
  return Array.from(result.data as number[]);
}

// PHASE 2: Hash chunks to detect context changes
function hashChunks(chunks: Chunk[]): string {
  const chunkTexts = chunks.map(c => c.text).join("|");
  return crypto.createHash("md5").update(chunkTexts).digest("hex");
}

// PHASE 2: Get or cache context to reduce token usage
function getOrCacheContext(schemeId: string, chunks: Chunk[]): { context: string; cached: boolean } {
  const contextHash = hashChunks(chunks);
  
  if (contextCache.has(schemeId)) {
    const cached = contextCache.get(schemeId)!;
    if (cached.hash === contextHash) {
      return { context: cached.context, cached: true };
    }
  }
  
  const context = chunks.map((c) => c.text).join("\n\n---\n\n");
  contextCache.set(schemeId, { schemeId, context, hash: contextHash, createdAt: new Date() });
  return { context, cached: false };
}

export function profileToQuery(profile: FarmerProfile, schemeName: string): string {
  const parts: string[] = [];
  if (profile.landSize !== undefined) parts.push(`land size ${profile.landSize} ha`);
  if (profile.income !== undefined) parts.push(`income ${profile.income} INR`);
  if (profile.govtJob) parts.push(`is government employee`);
  return `Eligibility criteria for ${schemeName}. Farmer profile: ${parts.join(", ")}. Identify specific exclusion and inclusion rules.`;
}

export async function retrieveChunks(query: string, schemeId: string, topK = 5): Promise<Chunk[]> {
  try {
    const queryEmbedding = await embedText(query);
    const chunksCol = await getChunksCollection();

    // PHASE 2: Reduced topK for token optimization (fewer chunks = fewer tokens)
    const optimizedTopK = Math.min(topK, 3); // Reduced from 5-6 to 3

    const aggregationPipeline = [
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: optimizedTopK * 10,
          limit: optimizedTopK,
          filter: { schemeId },
        },
      },
      {
        $project: {
          _id: 0,
          schemeId: 1,
          schemeName: 1,
          text: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ];

    return await chunksCol.aggregate<Chunk>(aggregationPipeline).toArray();
  } catch (err) {
    console.error("❌ Retrieval failed:", err);
    return [];
  }
}

// PHASE 2: Export cache helper for use in RAG chain
export { getOrCacheContext, contextCache };
