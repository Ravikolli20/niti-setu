// src/App.tsx
// Root application component.
// Owns all top-level state and routes between screens.

import React, { useState, useEffect } from "react";
import "./styles/global.css";

import { parseVoice }          from "./utils/parseVoice";
import { checkEligibilityRAG, fetchSchemes, checkServerHealth } from "./utils/ragApi";

import { HomeScreen }         from "./components/screens/HomeScreen";
import { VoiceScreen }        from "./components/screens/VoiceScreen";
import { FormScreen }         from "./components/screens/FormScreen";
import { ResultsScreen }      from "./components/screens/ResultsScreen";
import { SchemeDetailScreen } from "./components/screens/SchemeDetailScreen";

import { fetchProfile, saveProfile } from "./utils/profileApi";
import { LanguageProvider } from "./i18n/LanguageContext";
import type { FarmerProfile, RAGResult, Scheme } from "./types";

type Screen = "home" | "voice" | "form" | "results" | "detail";

export function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

function AppContent() {
  // ── Navigation ──────────────────────────────────────────────────────
  const [screen, setScreen] = useState<Screen>("home");
  const go = (s: Screen) => setScreen(s);

  // ── Server / scheme state ───────────────────────────────────────────
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const [schemes, setSchemes]           = useState<Scheme[]>([]);

  // ── Farmer profile ──────────────────────────────────────────────────
  const [profile,    setProfile]    = useState<FarmerProfile>({});
  const [profileId,  setProfileId]  = useState<string | null>(localStorage.getItem("nitisetu_profile_id"));
  const [transcript, setTranscript] = useState<string>("");
  const [formData,   setFormData]   = useState<FarmerProfile>({});
  const [formStep,   setFormStep]   = useState<number>(0);

  // ── Results ─────────────────────────────────────────────────────────
  const [results,  setResults]  = useState<RAGResult[]>([]);
  const [loading,  setLoading]  = useState<boolean>(false);
  const [ragError, setRagError] = useState<string>("");

  // ── Selected scheme detail ───────────────────────────────────────────
  const [selectedItem, setSelectedItem] = useState<RAGResult | null>(null);

  // ── On mount: check server + load schemes ───────────────────────────
  useEffect(() => {
    (async () => {
      const online = await checkServerHealth();
      setServerOnline(online);
      
      // Load saved profile if ID exists
      if (profileId) {
        const saved = await fetchProfile(profileId);
        if (saved?.data) {
          setProfile(saved.data);
          setFormData(saved.data);
        }
      }

      if (online) {
        try {
          const s = await fetchSchemes();
          setSchemes(s);
        } catch (err) {
          console.error("Failed to fetch schemes:", err);
        }
      }
    })();
  }, [profileId]);

  // ── Reset everything ────────────────────────────────────────────────
  const resetAll = () => {
    // Resetting for a new session, but KEEPING the profileId/profile
    setTranscript("");
    setFormStep(0);
    setSelectedItem(null);
    setRagError("");
    go("home");
  };

  const clearProfile = () => {
    setProfileId(null);
    setProfile({});
    setFormData({});
    localStorage.removeItem("nitisetu_profile_id");
    resetAll();
  };

  // ── Submit handler (shared by voice + form) ──────────────────────────
  const runEligibility = async (farmerProfile: FarmerProfile) => {
    setLoading(true);
    setRagError("");
    setProfile(farmerProfile);

    // Persist profile
    let currentId = profileId;
    if (!currentId) {
      currentId = "p_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
      setProfileId(currentId);
      localStorage.setItem("nitisetu_profile_id", currentId);
    }
    saveProfile(currentId, farmerProfile);

    try {
      const ragResults = await checkEligibilityRAG(farmerProfile);
      setResults(ragResults);
      go("results");
    } catch (err) {
      const error = err as Error;
      console.error("RAG error:", error);
      setRagError(error.message || "Failed to check eligibility. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceSubmit = () => runEligibility(parseVoice(transcript));
  const handleFormSubmit  = () => runEligibility(formData);

  const handleSelectScheme = (item: RAGResult) => {
    setSelectedItem(item);
    go("detail");
  };

  // ── Render ──────────────────────────────────────────────────────────
  switch (screen) {
    case "home":
      return (
        <HomeScreen 
          onNavigate={go} 
          serverOnline={serverOnline} 
          schemes={schemes} 
          hasProfile={!!profile.name}
          profileName={profile.name}
          onClearProfile={clearProfile}
        />
      );
    case "voice":
      return (
        <VoiceScreen
          transcript={transcript}
          setTranscript={setTranscript}
          onSubmit={handleVoiceSubmit}
          onBack={resetAll}
          onGoForm={() => go("form")}
          loading={loading}
          error={ragError}
        />
      );
    case "form":
      return (
        <FormScreen
          formData={formData}
          setFormData={setFormData}
          formStep={formStep}
          setFormStep={setFormStep}
          onSubmit={handleFormSubmit}
          onBack={resetAll}
          loading={loading}
          error={ragError}
        />
      );
    case "results":
      return (
        <ResultsScreen
          results={results}
          profile={profile}
          onSelectScheme={handleSelectScheme}
          onBack={resetAll}
          onReset={resetAll}
          onEditForm={() => go("form")}
        />
      );
    case "detail":
      return <SchemeDetailScreen result={selectedItem} profile={profile} onBack={() => go("results")} />;
    default:
      return null;
  }
}
