// src/utils/ragApi.ts
// Frontend API client for the Niti-Setu RAG backend.
// All eligibility decisions come from the server RAG pipeline.

import type { FarmerProfile, RAGResult, Scheme } from "../types";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ── Shared fetch helper ───────────────────────────────────────────────
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `API error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ── Check eligibility via RAG ─────────────────────────────────────────
export async function checkEligibilityRAG(profile: FarmerProfile): Promise<RAGResult[]> {
  const data = await apiFetch<{ results: RAGResult[] }>("/api/eligibility", {
    method: "POST",
    body:   JSON.stringify({ profile }),
  });
  return data.results;
}

// ── Fetch all schemes from MongoDB ────────────────────────────────────
export async function fetchSchemes(): Promise<Scheme[]> {
  const data = await apiFetch<{ schemes: Scheme[] }>("/api/schemes");
  return data.schemes;
}

// ── Upload a new PDF scheme ───────────────────────────────────────────
export async function uploadSchemePDF(
  file: File,
  meta: Record<string, string>
): Promise<{ message: string; schemeId: string }> {
  const formData = new FormData();
  formData.append("file", file);
  Object.entries(meta).forEach(([k, v]) => formData.append(k, v));

  const res = await fetch(`${BASE_URL}/api/schemes/upload`, {
    method: "POST",
    body:   formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Upload failed ${res.status}`);
  }

  return res.json();
}

// ── Health check ──────────────────────────────────────────────────────
export async function checkServerHealth(): Promise<boolean> {
  try {
    const data = await apiFetch<{ status: string }>("/api/health");
    return data.status === "ok";
  } catch {
    return false;
  }
}
