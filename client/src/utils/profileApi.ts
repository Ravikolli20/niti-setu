// src/utils/profileApi.ts
import { SavedProfile, FarmerProfile } from "../types";

const API_BASE = (process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api/profiles";

/**
 * Fetch a saved profile from the server.
 */
export async function fetchProfile(profileId: string): Promise<SavedProfile | null> {
  try {
    const response = await fetch(`${API_BASE}/${profileId}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error("Failed to fetch profile");
    return await response.json();
  } catch (err) {
    console.error("Profile API error:", err);
    return null;
  }
}

/**
 * Save or update a profile on the server.
 */
export async function saveProfile(profileId: string, data: FarmerProfile): Promise<SavedProfile | null> {
  try {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, data }),
    });
    if (!response.ok) throw new Error("Failed to save profile");
    return await response.json();
  } catch (err) {
    console.error("Profile API error:", err);
    return null;
  }
}
