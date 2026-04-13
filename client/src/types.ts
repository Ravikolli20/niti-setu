// src/types.ts - Shared TypeScript interfaces for the Niti-Setu frontend

export interface FarmerProfile {
  name?: string;
  age?: number;
  landSize?: number;       // in hectares
  income?: number;         // annual in INR
  landOwner?: boolean;
  govtJob?: boolean;
  cropType?: boolean;
  loanee?: boolean;
  creditHistory?: boolean;
  category?: string;       // Small/Marginal, Tenant, etc.
  cropName?: string;       // Wheat, Rice, etc.
  season?: string;         // Kharif, Rabi
  state?: string;
  district?: string;
}

export interface ProofItem {
  label: string;
  msg: string;
  citation?: string;
}

export interface Scheme {
  id: string;
  name: string;
  emoji?: string;
  fullName: string;
  benefit: string;
  installments?: string;
  ministry: string;
  applyAt?: string;
  color?: string;
  light?: string;
  dark?: string;
  iconBg?: string;
  rules?: EligibilityRule[];
  documents?: string[];
  snippet?: string;
}

export interface EligibilityRule {
  field: string;
  label: string;
  value?: string | number | boolean;
  required?: boolean;
  min?: number;
  max?: number;
  tip?: string;
}

export interface SavedProfile {
  _id?: string;
  profileId: string;
  data: FarmerProfile;
  updatedAt: string;
}

export interface RAGResult {
  scheme: Scheme;
  eligible: boolean | null;
  confidence?: "high" | "medium" | "low";
  proof?: ProofItem[];
  reasons?: ProofItem[];
  aiExplanation?: string;
  retrievedSnippet?: string;
  chunksUsed?: number;
  topChunkScore?: number;
}
