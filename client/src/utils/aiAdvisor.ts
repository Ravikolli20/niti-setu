// src/utils/aiAdvisor.ts
// Calls the Anthropic API to generate a personalised eligibility
// explanation for a given scheme + farmer profile combination.

import type { Scheme, RAGResult, FarmerProfile } from "../types";

/**
 * Fetch an AI-generated eligibility explanation.
 *
 * @param {Scheme} scheme  - Scheme definition
 * @param {RAGResult} result  - { eligible, proof, reasons }
 * @param {FarmerProfile} profile - Farmer profile
 * @returns {Promise<string>} Plain-text explanation
 */
export async function fetchAiAnalysis(
  scheme: Scheme,
  result: RAGResult,
  profile: FarmerProfile
): Promise<string> {
  const profileSummary = Object.entries(profile)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");

  const passedLabels  = result.proof?.map((p) => p.label).join(", ") || "None";
  const failedLabels  = result.reasons?.map((r) => r.label).join(", ") || "None";
  const statusLine    = result.eligible
    ? `ELIGIBLE. Passed criteria: ${passedLabels}`
    : `NOT ELIGIBLE. Failed criteria: ${failedLabels}`;

  const prompt = `You are a friendly government scheme advisor for Indian farmers.

Farmer profile: ${profileSummary}
Scheme: ${scheme.fullName} (${scheme.name})
Result: ${statusLine}
Official rule: "${scheme.snippet}"

Write 2–3 short, warm sentences:
1. Clearly state if the farmer is eligible or not.
2. Explain the key reason(s) in simple language.
3. Give one practical next step (where to apply, what to fix, etc.).

Use plain English. Address the farmer as "you". No bullet points. No markdown.`;

  // Note: External API call usually requires server-side proxying to avoid CORS,
  // but this utility follows the existing implementation pattern.
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-3-sonnet-20240229", // Fixed model ID to be realistic
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  interface AnthropicResponse {
    content?: Array<{ type: string; text: string }>;
  }

  const data = (await response.json()) as AnthropicResponse;
  const textBlock = data.content?.find((c) => c.type === "text");
  return textBlock?.text ?? "Analysis unavailable.";
}
