// server/src/types.ts
// Shared TypeScript interfaces for the Niti-Setu RAG backend.

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
  state?: string;
  district?: string;
  category?: string;
  cropName?: string;       // Wheat, Rice, etc.
  season?: string;         // Kharif, Rabi
}

export interface Scheme {
  id: string;
  name: string;
  fullName: string;
  benefit: string;
  installments?: string;
  ministry: string;
  applyAt?: string;
  pdfFile: string;
  color?: string;
  light?: string;
  dark?: string;
  emoji?: string;
}

export interface ProofItem {
  label: string;
  msg: string;
  citation?: string;
}

export interface RAGResult {
  eligible: boolean | null;
  confidence?: "high" | "medium" | "low";
  proof?: ProofItem[];
  reasons?: ProofItem[];
  aiExplanation?: string;
  retrievedSnippet?: string;
  chunksUsed?: number;
  topChunkScore?: number;
  // PHASE 2: New fields for optimization tracking
  processingTime?: number;
  modelUsed?: 'gemini' | 'claude';
  fallbackUsed?: boolean;
  complexityScore?: number;
  contextCached?: boolean;
}

export interface SchemeResult extends RAGResult {
  scheme: Scheme;
}

export interface Chunk {
  schemeId: string;
  schemeName: string;
  text: string;
  embedding: number[];
  score?: number;
}
