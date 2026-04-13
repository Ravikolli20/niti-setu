// src/hooks/useVoice.ts
// Encapsulates all Web Speech API logic.
// Uses 'any' for SpeechRecognition types since they are non-standard
// and only available in browser environments via @types/dom-speech-recognition.

import { useState, useRef } from "react";
import { useLanguage } from "../i18n/LanguageContext";

type VoiceErrorKey = "no_support" | "denied" | "no_speech" | "network" | "other" | "";

export const VOICE_ERRORS: Record<Exclude<VoiceErrorKey, "">, { icon: string; title: string; msg: string }> = {
  no_support: {
    icon: "🌐",
    title: "Browser not supported",
    msg: "Voice input requires Chrome, Edge, or Safari. Please type your details instead.",
  },
  denied: {
    icon: "🎙️",
    title: "Microphone access denied",
    msg: "Allow microphone access in your browser settings, then try again.",
  },
  no_speech: {
    icon: "🔇",
    title: "No speech detected",
    msg: "We didn't hear anything. Make sure your mic is working and speak clearly.",
  },
  network: {
    icon: "📶",
    title: "Network error",
    msg: "Voice recognition requires an internet connection. Check your connection and retry.",
  },
  other: {
    icon: "⚠️",
    title: "Microphone error",
    msg: "Something went wrong with the mic. Try again or type your details below.",
  },
};

interface UseVoiceProps {
  onTranscriptChange: (text: string) => void;
}

// eslint-disable-next-line
type AnyRecognition = any;

export function useVoice({ onTranscriptChange }: UseVoiceProps) {
  const { language } = useLanguage();
  const [listening, setListening]   = useState<boolean>(false);
  const [voiceError, setVoiceError] = useState<VoiceErrorKey>("");
  const recogRef                    = useRef<AnyRecognition>(null);

  // eslint-disable-next-line
  const w = window as any;
  const isSupported = !!(w.SpeechRecognition || w.webkitSpeechRecognition);

  const start = () => {
    setVoiceError("");
    onTranscriptChange("");

    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) { setVoiceError("no_support"); return; }

    const r: AnyRecognition = new SR();
    r.lang           = language === "hi" ? "hi-IN" : "en-IN";
    r.continuous     = true;
    r.interimResults = true;

    r.onstart = () => setListening(true);

    r.onresult = (e: any) => {
      const text = Array.from(e.results as any[])
        .map((result: any) => result[0].transcript)
        .join(" ");
      onTranscriptChange(text);
    };

    r.onend = () => setListening(false);

    r.onerror = (e: any) => {
      setListening(false);
      const map: Record<string, VoiceErrorKey> = {
        "not-allowed":         "denied",
        "service-not-allowed": "denied",
        "no-speech":           "no_speech",
        "network":             "network",
      };
      setVoiceError(map[e.error] ?? "other");
    };

    recogRef.current = r;
    r.start();
  };

  const stop = () => {
    recogRef.current?.stop();
    setListening(false);
  };

  const clearError = () => setVoiceError("");

  return { listening, voiceError, isSupported, start, stop, clearError };
}
