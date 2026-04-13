// src/components/layout/Header.tsx
// Sticky top navigation bar — Govt-official blue/white theme with animations.

import React, { useEffect, useRef } from "react";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";

// ─── Inline styles ────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    background: "linear-gradient(90deg, #0a2342 0%, #1a3a6b 60%, #1e4d8c 100%)",
    borderBottom: "3px solid #f5a623",
    padding: "0 28px",
    display: "flex",
    alignItems: "center",
    gap: 14,
    height: 68,
    boxShadow: "0 4px 24px rgba(10,35,66,0.45)",
    overflow: "hidden",
  },

  // Ashoka-inspired decorative stripe
  topStripe: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: "linear-gradient(90deg, #FF9933 0%, #FF9933 33.3%, #ffffff 33.3%, #ffffff 66.6%, #138808 66.6%, #138808 100%)",
  },

  // Animated shimmer overlay
  shimmer: {
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "60%",
    height: "100%",
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
    pointerEvents: "none",
  },

  logoWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: "linear-gradient(135deg, #1e6fcc, #0a2342)",
    border: "2px solid rgba(245,166,35,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    position: "relative",
    zIndex: 1,
  },

  brandBlock: {
    flex: 1,
    position: "relative",
    zIndex: 1,
  },

  brandName: {
    fontFamily: "'Poppins', 'Segoe UI', sans-serif",
    fontSize: 22,
    fontWeight: 800,
    color: "#ffffff",
    lineHeight: 1.1,
    letterSpacing: "0.01em",
    textShadow: "0 2px 8px rgba(0,0,0,0.3)",
  },

  brandDot: {
    color: "#f5a623",
  },

  brandSub: {
    fontSize: 10.5,
    color: "rgba(200,220,255,0.85)",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 500,
    marginTop: 1,
  },

  badge: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(245,166,35,0.4)",
    borderRadius: 20,
    padding: "5px 12px",
    position: "relative",
    zIndex: 1,
  },

  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#4ade80",
    flexShrink: 0,
  },

  badgeText: {
    fontSize: 11,
    color: "rgba(220,235,255,0.9)",
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 500,
    letterSpacing: "0.05em",
    whiteSpace: "nowrap",
  },

  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(245,166,35,0.5)",
    borderRadius: 10,
    padding: "8px 16px",
    color: "#fff",
    fontSize: 13,
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    backdropFilter: "blur(4px)",
    letterSpacing: "0.03em",
    position: "relative",
    zIndex: 1,
  },

  emblemRing: {
    position: "absolute",
    right: -20,
    top: "50%",
    transform: "translateY(-50%)",
    width: 120,
    height: 120,
    borderRadius: "50%",
    border: "1px solid rgba(245,166,35,0.12)",
    pointerEvents: "none",
  },

  emblemRing2: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    width: 80,
    height: 80,
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.07)",
    pointerEvents: "none",
  },
};

const keyframes = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

  @keyframes headerShimmer {
    0%   { left: -100%; }
    40%  { left: 120%; }
    100% { left: 120%; }
  }
  @keyframes logoPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(245,166,35,0.4); }
    50%       { box-shadow: 0 0 0 6px rgba(245,166,35,0); }
  }
  @keyframes livePulse {
    0%   { box-shadow: 0 0 0 0 rgba(74,222,128,0.6); }
    70%  { box-shadow: 0 0 0 5px rgba(74,222,128,0); }
    100% { box-shadow: 0 0 0 0 rgba(74,222,128,0); }
  }
  @keyframes slowSpin {
    from { transform: translateY(-50%) rotate(0deg); }
    to   { transform: translateY(-50%) rotate(360deg); }
  }
  @keyframes slideInHeader {
    from { opacity: 0; transform: translateY(-100%); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .back-btn-hov:hover {
    background: rgba(245,166,35,0.2) !important;
    border-color: rgba(245,166,35,0.9) !important;
    transform: translateX(-2px);
  }
`;

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface HeaderProps {
  showBack: boolean;
  onBack?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function Header({ showBack, onBack }: HeaderProps) {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (headerRef.current) {
      headerRef.current.style.animation = "slideInHeader 0.5s cubic-bezier(0.22,1,0.36,1) both";
    }
  }, []);

  return (
    <>
      <style>{keyframes}</style>
      <header ref={headerRef} style={styles.header}>

        {/* Tricolor top stripe */}
        <div style={styles.topStripe} />

        {/* Shimmer sweep */}
        <div style={{ ...styles.shimmer, animation: "headerShimmer 4s ease-in-out infinite" }} />

        {/* Decorative rings (right side) */}
        <div style={{ ...styles.emblemRing, animation: "slowSpin 20s linear infinite" }} />
        <div style={{ ...styles.emblemRing2, animation: "slowSpin 30s linear infinite reverse" }} />

        {/* Logo */}
        <div style={{ ...styles.logoWrap, animation: "logoPulse 3s ease-in-out infinite" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="#f5a623" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>

        {/* Brand */}
        <div style={styles.brandBlock}>
          <div style={styles.brandName}>
            Niti<span style={styles.brandDot}>·</span>Setu
          </div>
          <div style={styles.brandSub}>Scheme Eligibility Engine</div>
        </div>

        {/* Live badge */}
        {!showBack && (
          <div style={styles.badge}>
            <div style={{ ...styles.badgeDot, animation: "livePulse 1.8s ease-out infinite" }} />
            <span style={styles.badgeText}>AI Powered</span>
          </div>
        )}

        {/* Back button */}
        {showBack && (
          <button
            className="back-btn-hov"
            style={styles.backBtn}
            onClick={onBack}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Home
          </button>
        )}
        <LanguageSwitcher />
      </header>
    </>
  );
}
