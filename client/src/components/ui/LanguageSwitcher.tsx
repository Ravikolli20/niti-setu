// src/components/ui/LanguageSwitcher.tsx
import React from "react";
import { useLanguage } from "../../i18n/LanguageContext";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const styles: Record<string, React.CSSProperties> = {
    container: {
      display: "flex",
      alignItems: "center",
      background: "rgba(255, 255, 255, 0.12)",
      borderRadius: 14,
      padding: "3px",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      position: "relative",
      zIndex: 10,
    },
    btn: {
      padding: "6px 12px",
      borderRadius: 11,
      fontSize: "12px",
      fontWeight: 700,
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      border: "none",
      fontFamily: "'Poppins', sans-serif",
      display: "flex",
      alignItems: "center",
      gap: 5,
    },
    active: {
      background: "#f5a623",
      color: "#0a2342",
      boxShadow: "0 4px 12px rgba(245, 166, 35, 0.35)",
    },
    inactive: {
      background: "transparent",
      color: "rgba(255, 255, 255, 0.8)",
    },
  };

  return (
    <div style={styles.container}>
      <button
        style={{
          ...styles.btn,
          ...(language === "en" ? styles.active : styles.inactive),
        }}
        onClick={() => setLanguage("en")}
      >
        <span>EN</span>
      </button>
      <button
        style={{
          ...styles.btn,
          ...(language === "hi" ? styles.active : styles.inactive),
        }}
        onClick={() => setLanguage("hi")}
      >
        <span>हिन्दी</span>
      </button>
    </div>
  );
}
