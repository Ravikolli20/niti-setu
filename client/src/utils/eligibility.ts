// src/utils/eligibility.ts
// Pure eligibility checking logic. No React dependencies.
// Takes a farmer profile object and a scheme definition,
// returns { eligible, proof[], reasons[] }.

import type { FarmerProfile, Scheme, RAGResult, EligibilityRule } from "../types";

/**
 * Check if a farmer profile meets a scheme's eligibility rules.
 *
 * @param {FarmerProfile} profile - Farmer profile (age, landSize, income, booleans...)
 * @param {Scheme} scheme  - Scheme definition from data/schemes.js
 * @returns {Omit<RAGResult, 'scheme'>}
 */
export function checkEligibility(profile: FarmerProfile, scheme: Scheme): Omit<RAGResult, "scheme"> {
  const proof: { label: string; msg: string; citation?: string }[] = [];
  const reasons: { label: string; msg: string; citation?: string }[] = [];
  let eligible = true;

  if (!scheme.rules) return { eligible: true, proof: [], reasons: [] };

  for (const rule of scheme.rules) {
    const field = rule.field as keyof FarmerProfile;
    const val = profile[field];

    // Boolean required=true  → field must be true
    if (rule.required === true && val !== true) {
      eligible = false;
      reasons.push({ label: rule.label, msg: rule.tip || "" });

    // Boolean required=false → field must NOT be true (exclusion rule)
    } else if (rule.required === false && val === true) {
      eligible = false;
      reasons.push({ label: rule.label, msg: rule.tip || "" });

    // Numeric min bound
    } else if (rule.min !== undefined && (val === undefined || Number(val) < rule.min)) {
      eligible = false;
      reasons.push({
        label: rule.label,
        msg: `Minimum ${rule.min} required — you entered ${val ?? "nothing"}`,
      });

    // Numeric max bound
    } else if (rule.max !== undefined && (val === undefined || Number(val) > rule.max)) {
      eligible = false;
      reasons.push({
        label: rule.label,
        msg: `Maximum ${rule.max} allowed — you entered ${val ?? "nothing"}`,
      });

    // Passed
    } else {
      proof.push({ label: rule.label, msg: rule.tip || "" });
    }
  }

  return { eligible, proof, reasons };
}

/**
 * Run eligibility check against all schemes.
 */
export function checkAllSchemes(profile: FarmerProfile, schemes: Scheme[]): RAGResult[] {
  return schemes.map((scheme) => ({
    scheme,
    ...checkEligibility(profile, scheme),
  }));
}
