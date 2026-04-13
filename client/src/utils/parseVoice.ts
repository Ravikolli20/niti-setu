// src/utils/parseVoice.ts
// Parses natural language farmer descriptions (spoken or typed)
// into a structured profile object understood by the eligibility engine.

import type { FarmerProfile } from "../types";

/**
 * Extract a structured farmer profile from free-form text.
 * Handles English and common Hindi/regional phrasings.
 */
export function parseVoice(text: string): FarmerProfile {
  const profile: FarmerProfile = {};
  const lower = text.toLowerCase();

  // ── Age ─────────────────────────────────────────────────────────
  const ageMatch = lower.match(/(\d+)\s*(?:years?\s*old|saal|sal|age)/);
  if (ageMatch) profile.age = parseInt(ageMatch[1], 10);

  // ── Land size (with unit conversion) ────────────────────────────
  const landMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:hectares?|acres?|bigha|guntha)/);
  if (landMatch) {
    let size = parseFloat(landMatch[1]);
    if (lower.includes("acre"))   size *= 0.4047;
    if (lower.includes("bigha"))  size *= 0.2;
    if (lower.includes("guntha")) size *= 0.01012;
    profile.landSize = parseFloat(size.toFixed(2));
  }

  // ── Annual income ────────────────────────────────────────────────
  const incomeMatch = lower.match(/(\d+(?:,\d+)*)\s*(?:rupees?|rs\.?|income|earn|per\s*year|annual)/);
  if (incomeMatch) {
    profile.income = parseInt(incomeMatch[1].replace(/,/g, ""), 10);
  }

  // ── Land ownership ───────────────────────────────────────────────
  if (/(?:own|lease|have|possess|cultivat)\s*(?:land|farm|khet|zameen|field)/.test(lower)) {
    profile.landOwner = true;
  }
  if (/(?:no|don'?t|do\s*not)\s*(?:own|have|possess)\s*(?:land|farm|khet)/.test(lower)) {
    profile.landOwner = false;
  }

  // ── Government job ───────────────────────────────────────────────
  if (/(?:government|govt|sarkari|central|state)\s*(?:job|employee|service|servant|officer)/.test(lower)) {
    profile.govtJob = true;
  }
  if (/(?:no|not\s*a?)\s*(?:government|govt|sarkari)\s*(?:job|employee|service)/.test(lower)) {
    profile.govtJob = false;
  }

  // ── Crops & Seasons ─────────────────────────────────────────────
  const crops = ["wheat", "rice", "paddy", "sugarcane", "cotton", "maize", "soybean", "jowar", "bajra", "mustard", "potato", "onion"];
  const seasons = ["kharif", "rabi", "summer", "zaid"];
  
  crops.forEach(c => {
    if (lower.includes(c)) {
      profile.cropName = c.charAt(0).toUpperCase() + c.slice(1);
      profile.cropType = true;
    }
  });

  seasons.forEach(s => {
    if (lower.includes(s)) profile.season = s.charAt(0).toUpperCase() + s.slice(1);
  });

  // ── Farmer Category ────────────────────────────────────────────────
  if (/(?:small|marginal|marginalized|chhota)\s*(?:farmer|kisan)/.test(lower)) {
    profile.category = "Small Farmer";
  }
  if (/(?:tenant|lease|bataidari|bataidar|sharecropper)\s*(?:farmer|kisan)/.test(lower)) {
    profile.category = "Tenant Farmer";
  }

  // ── Geography (State & District) ──────────────────────────────────
  const states = ["maharashtra", "punjab", "haryana", "uttar pradesh", "bihar", "gujarat", "karnataka", "tamil nadu", "rajasthan", "madhya pradesh"];
  states.forEach(s => {
    if (lower.includes(s)) profile.state = s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  });

  const distMatch = lower.match(/(?:district|dist|zila|zilla)\s+([a-z]+)/);
  if (distMatch) profile.district = distMatch[1].charAt(0).toUpperCase() + distMatch[1].slice(1);

  // ── Institutional loan ───────────────────────────────────────────
  if (/(?:kcc|kisan\s*credit|institutional\s*loan|bank\s*loan|crop\s*loan)/.test(lower)) {
    profile.loanee = true;
  }

  // ── Credit history ───────────────────────────────────────────────
  if (/(?:clean|good|no\s*default|clear|regular|timely)\s*(?:credit|repayment|history|loan|record)/.test(lower)) {
    profile.creditHistory = true;
  }
  if (/(?:defaulted|loan\s*default|npa|bad\s*credit)/.test(lower)) {
    profile.creditHistory = false;
  }

  // ── Name ────────────────────────────────────────────────────────
  const nameMatch = text.match(
    /(?:my\s+name\s+is|i\s+am|mera\s+naam|naam\s+hai)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/i
  );
  if (nameMatch) profile.name = nameMatch[1].trim();

  return profile;
}
