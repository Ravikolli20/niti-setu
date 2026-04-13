// server/src/rag/ragChain.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import { retrieveChunks, profileToQuery, getOrCacheContext } from "./retriever.js";
import { applyStaticRules, calculateComplexityScore, selectOptimalModel } from "./rules.js";
import type { FarmerProfile, Scheme, RAGResult, SchemeResult } from "../types.js";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// PHASE 2: Claude 3.5 Sonnet as fallback for complex cases
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const SYSTEM_PROMPT = `You are "Niti-Setu AI", an expert on Indian government schemes for farmers.
Determine eligibility based ONLY on provided PDF excerpts.

FORMAT: Respond with a valid JSON object:
{
  "eligible": boolean,
  "confidence": "high" | "medium" | "low",
  "proof": [{ "label": "string", "msg": "string", "citation": "string" }],
  "reasons": [{ "label": "string", "msg": "string", "citation": "string" }],
  "aiExplanation": "A friendly 2-3 sentence summary for the farmer.",
  "retrievedSnippet": "A single direct quote from the text that supports the decision."
}`;

export async function runRAGChain(profile: FarmerProfile, scheme: Scheme): Promise<RAGResult> {
  const startTime = Date.now();
  
  // PHASE 2: Step 1 - Apply static rules FIRST
  const ruleBasedDecision = applyStaticRules(profile, scheme);
  if (ruleBasedDecision) {
    return ruleBasedDecision;
  }
  
  // PHASE 2: Step 2 - Retrieve chunks (reduced from 5-6 to 3 for token optimization)
  const query = profileToQuery(profile, scheme.fullName);
  const chunks = await retrieveChunks(query, scheme.id, 3);

  if (!chunks || chunks.length === 0) {
    return {
      eligible: null,
      reasons: [{ label: "Data Missing", msg: "No PDF data found." }],
      aiExplanation: `I haven't processed the documents for ${scheme.name} yet.`,
    };
  }

  // PHASE 2: Step 3 - Get cached context to reduce token usage
  const { context, cached } = getOrCacheContext(scheme.id, chunks);
  
  // PHASE 2: Step 4 - Calculate complexity to select optimal model
  const complexityScore = calculateComplexityScore(profile, scheme);
  const selectedModel = selectOptimalModel(complexityScore);

  try {
    let result;
    
    if (selectedModel === 'gemini') {
      // Use Gemini for simple/medium cases
      result = await runGeminiChain(profile, scheme, context);
    } else {
      // Use Claude for complex cases (better policy interpretation)
      result = await runClaudeChain(profile, scheme, context);
    }
    
    return {
      ...result,
      chunksUsed: chunks.length,
      topChunkScore: chunks[0]?.score ?? 0,
      processingTime: Date.now() - startTime,
      modelUsed: selectedModel,
      complexityScore,
      contextCached: cached
    };
  } catch (error) {
    console.error(`❌ ${selectedModel} reasoning failed:`, error);
    
    // PHASE 2: If primary model fails, fallback to other model
    try {
      const fallbackModel = selectedModel === 'gemini' ? 'claude' : 'gemini';
      console.log(`Attempting fallback with ${fallbackModel}...`);
      
      const fallbackResult = await (fallbackModel === 'gemini' 
        ? runGeminiChain(profile, scheme, context)
        : runClaudeChain(profile, scheme, context)
      );
      
      return {
        ...fallbackResult,
        chunksUsed: chunks.length,
        topChunkScore: chunks[0]?.score ?? 0,
        modelUsed: fallbackModel,
        fallbackUsed: true
      };
    } catch (fallbackError) {
      console.error(`❌ Fallback also failed:`, fallbackError);
      return {
        eligible: null,
        aiExplanation: "I encountered an error while analyzing your eligibility. Please try again later.",
      };
    }
  }
}

// PHASE 2: Separate Gemini execution
async function runGeminiChain(
  profile: FarmerProfile,
  scheme: Scheme,
  context: string
): Promise<RAGResult> {
  const userPrompt = `FARMER PROFILE: ${JSON.stringify(profile)}
SCHEME: ${scheme.fullName}

CONTEXT FROM OFFICIAL DOCUMENTS:
${context}

Analyze the farmer against the scheme criteria. Respond ONLY in the requested JSON format.`;

  const result = await geminiModel.generateContent({
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: { responseMimeType: "application/json" },
  });

  const text = result.response.text();
  return JSON.parse(text);
}

// PHASE 2: New Claude execution for complex cases
async function runClaudeChain(
  profile: FarmerProfile,
  scheme: Scheme,
  context: string
): Promise<RAGResult> {
  const userPrompt = `FARMER PROFILE: ${JSON.stringify(profile)}
SCHEME: ${scheme.fullName}

CONTEXT FROM OFFICIAL DOCUMENTS:
${context}

Analyze the farmer against the scheme criteria. Respond with a JSON object with these exact fields:
{
  "eligible": boolean,
  "confidence": "high" | "medium" | "low",
  "proof": [{"label": "string", "msg": "string", "citation": "string"}],
  "reasons": [{"label": "string", "msg": "string", "citation": "string"}],
  "aiExplanation": "A friendly summary",
  "retrievedSnippet": "Direct quote from text"
}`;

  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{
      role: "user",
      content: userPrompt
    }]
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}';
  return JSON.parse(text);
}

export async function runRAGChainAll(profile: FarmerProfile, schemes: Scheme[]): Promise<SchemeResult[]> {
  // PHASE 2: Parallel processing with Promise.allSettled for resilience
  const results = await Promise.allSettled(schemes.map((s) => runRAGChain(profile, s)));
  return results.map((res, i) => ({
    scheme: schemes[i],
    ...(res.status === "fulfilled" ? res.value : { eligible: null, aiExplanation: "Advisory failed." }),
  }));
}