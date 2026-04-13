// src/i18n/LanguageContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { translations, Language, TranslationDict } from "./translations";

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  /**
   * Translate a key from the current dictionary.
   * Format: "section.key" (e.g., "common.back")
   */
  t: (path: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

const LS_KEY = "nitisetu_lang_pref";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(
    (localStorage.getItem(LS_KEY) as Language) || "en"
  );

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LS_KEY, lang);
  };

  /**
   * Helper to access nested keys and replace parameters.
   */
  const t = (path: string, params?: Record<string, string | number>): string => {
    const keys = path.split(".");
    let current: any = translations[language];

    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        console.warn(`Translation key not found: ${path} (lang: ${language})`);
        return path;
      }
    }

    let result = current as string;
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        result = result.replace(`{${key}}`, String(value));
      });
    }

    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to use translations in components.
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
