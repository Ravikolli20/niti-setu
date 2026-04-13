// server/src/rag/rules.ts
// PHASE 2: Rule-based filtering for static fields
// Determines eligibility before calling expensive LLM

import type { FarmerProfile, Scheme, RAGResult } from "../types.js";

export interface EligibilityRule {
  schemeId: string;
  field: keyof FarmerProfile;
  condition: (value: any) => boolean;
  message: string;
  reason: 'exclude' | 'include' | 'questionable';
}

// Define all static eligibility rules
export const ELIGIBILITY_RULES: EligibilityRule[] = [
  // PM-KISAN: Land size must be ≤ 2 hectares
  {
    schemeId: 'pmkisan',
    field: 'landSize',
    condition: (size) => size !== undefined && size > 2,
    message: 'Owns more than 2 hectares',
    reason: 'exclude'
  },
  // PM-KISAN: Government employees excluded
  {
    schemeId: 'pmkisan',
    field: 'govtJob',
    condition: (isGovt) => isGovt === true,
    message: 'Is a government employee',
    reason: 'exclude'
  },

  // PMFBY: Must specify crop type
  {
    schemeId: 'pmfby',
    field: 'cropName',
    condition: (crop) => !crop,
    message: 'Crop type not specified',
    reason: 'questionable'
  },

  // PMKSY: Must own at least 0.1 hectares
  {
    schemeId: 'pmksy',
    field: 'landSize',
    condition: (size) => size !== undefined && size < 0.1,
    message: 'Owns less than 0.1 hectares',
    reason: 'exclude'
  },

  // PKVY: Minimum 0.5 hectares for organic farming
  {
    schemeId: 'pkvy',
    field: 'landSize',
    condition: (size) => size !== undefined && size < 0.5,
    message: 'Owns less than 0.5 hectares (minimum for organic farming)',
    reason: 'exclude'
  },

  // KCC: Must have land
  {
    schemeId: 'kcc',
    field: 'landSize',
    condition: (size) => size === undefined || size === 0,
    message: 'No land ownership specified',
    reason: 'exclude'
  },
];

export interface DecisionMetadata {
  llmUsed: boolean;
  rulesApplied: boolean;
  source: 'rules' | 'llm' | 'hybrid';
  processingTime: number;
  tokensOptimized?: boolean;
}

export interface RuleBasedDecision extends RAGResult {
  metadata: DecisionMetadata;
}

/**
 * Apply static rules to make quick eligibility decisions
 * Returns decision if rules are conclusive, null if LLM is needed
 */
export function applyStaticRules(
  profile: FarmerProfile,
  scheme: Scheme
): RuleBasedDecision | null {
  const startTime = Date.now();
  const rules = ELIGIBILITY_RULES.filter(r => r.schemeId === scheme.id);
  
  const exclusions: string[] = [];
  const inclusions: string[] = [];
  const questionable: string[] = [];
  
  // Apply each rule
  for (const rule of rules) {
    const fieldValue = profile[rule.field];
    
    if (rule.condition(fieldValue)) {
      if (rule.reason === 'exclude') {
        exclusions.push(rule.message);
      } else if (rule.reason === 'include') {
        inclusions.push(rule.message);
      } else {
        questionable.push(rule.message);
      }
    }
  }
  
  // If there are exclusions, farmer is definitely ineligible
  if (exclusions.length > 0) {
    return {
      eligible: false,
      confidence: 'high',
      proof: exclusions.map(msg => ({
        label: 'Exclusion Criteria',
        msg,
        citation: `${scheme.name} Guidelines`
      })),
      reasons: [],
      aiExplanation: `Unfortunately, you don't qualify for ${scheme.name} because: ${exclusions.join(', ')}.`,
      metadata: {
        llmUsed: false,
        rulesApplied: true,
        source: 'rules',
        processingTime: Date.now() - startTime,
        tokensOptimized: true
      }
    };
  }
  
  // If there are clear inclusions and no questionable items, likely eligible
  if (inclusions.length > 0 && questionable.length === 0) {
    return {
      eligible: true,
      confidence: 'high',
      proof: inclusions.map(msg => ({
        label: 'Eligibility Criteria',
        msg,
        citation: `${scheme.name} Guidelines`
      })),
      reasons: [],
      aiExplanation: `Based on eligibility criteria, you should qualify for ${scheme.name}.`,
      metadata: {
        llmUsed: false,
        rulesApplied: true,
        source: 'rules',
        processingTime: Date.now() - startTime,
        tokensOptimized: true
      }
    };
  }
  
  // Complex case - need LLM
  return null;
}

/**
 * Calculate complexity score to determine which model to use
 * Higher score = more complex = use Claude instead of Gemini
 */
export function calculateComplexityScore(
  profile: FarmerProfile,
  scheme: Scheme
): number {
  let score = 0;
  
  // Missing required fields (+1 each)
  const requiredFields: (keyof FarmerProfile)[] = ['age', 'landSize', 'income', 'state'];
  const missingCount = requiredFields.filter(f => !profile[f]).length;
  score += missingCount;
  
  // Ambiguous values (+2 each)
  if (profile.creditHistory === null || profile.creditHistory === undefined) score += 2;
  if (profile.loanee === null || profile.loanee === undefined) score += 2;
  
  // Edge cases near limits (+3)
  if (profile.landSize && profile.landSize >= 1.9 && profile.landSize <= 2.1) score += 3; // Near PM-KISAN limit
  if (profile.income && profile.income >= 90000 && profile.income <= 110000) score += 3; // Near threshold
  
  // Complex scheme (+1)
  if (['kcc', 'agribudget'].includes(scheme.id)) score += 1;
  
  return Math.min(score, 10); // Cap at 10
}

/**
 * Determine which model to use based on complexity
 */
export function selectOptimalModel(complexityScore: number): 'gemini' | 'claude' {
  if (complexityScore <= 3) return 'gemini'; // Fast, cheap
  return 'claude'; // Better accuracy for complex cases
}
