// src/components/ui/index.tsx
// Small, reusable UI primitives used across screens.

import React, { useState, useEffect } from "react";

/* ── Spinner ──────────────────────────────────────────────────────── */
interface SpinnerProps {
  size?: number;
  color?: string;
  top?: string;
}

export function Spinner({ size = 18, color = "rgba(255,255,255,0.7)", top = "white" }: SpinnerProps) {
  return (
    <div
      className="spin"
      style={{
        width:       size,
        height:      size,
        border:      `2px solid ${color}`,
        borderTop:   `2px solid ${top}`,
        borderRadius: "50%",
        flexShrink:  0,
      }}
    />
  );
}

/* ── AnimatedNumber ───────────────────────────────────────────────── */
interface AnimatedNumberProps {
  value: number;
}

export function AnimatedNumber({ value }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 700;
    const step     = 16;
    const inc      = value / (duration / step);
    let current    = 0;

    const timer = setInterval(() => {
      current += inc;
      if (current >= value) {
        clearInterval(timer);
        setDisplay(value);
      } else {
        setDisplay(Math.floor(current));
      }
    }, step);

    return () => clearInterval(timer);
  }, [value]);

  return <>{display}</>;
}

/* ── CheckIcon ────────────────────────────────────────────────────── */
interface CheckIconProps {
  pass: boolean;
}

export function CheckIcon({ pass }: CheckIconProps) {
  return (
    <div
      className="check-icon"
      style={{ background: pass ? "var(--green-light)" : "var(--red-light)" }}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
        stroke={pass ? "var(--green)" : "var(--red)"}
        strokeWidth="3" strokeLinecap="round">
        {pass
          ? <path d="M20 6L9 17l-5-5" />
          : <><path d="M18 6L6 18" /><path d="M6 6l12 12" /></>
        }
      </svg>
    </div>
  );
}

/* ── ShimmerLine ──────────────────────────────────────────────────── */
interface ShimmerLineProps {
  width?: string | number;
  height?: number;
  style?: React.CSSProperties;
}

export function ShimmerLine({ width = "80%", height = 14, style = {} }: ShimmerLineProps) {
  return (
    <div
      className="shimmer"
      style={{ height, width, borderRadius: 7, marginBottom: 10, ...style }}
    />
  );
}

/* ── EligibilityTag ───────────────────────────────────────────────── */
interface EligibilityTagProps {
  eligible: boolean | null;
  size?: "sm" | "lg";
}

export function EligibilityTag({ eligible, size = "sm" }: EligibilityTagProps) {
  const padding = size === "lg" ? "6px 16px" : "4px 12px";
  const fontSize = size === "lg" ? 13 : 12;
  return (
    <span
      className={`tag ${eligible ? "eligible" : "ineligible"}`}
      style={{ padding, fontSize }}
    >
      {eligible ? "✓ Eligible" : "✗ Not Eligible"}
    </span>
  );
}

/* ── SectionLabel ─────────────────────────────────────────────────── */
interface SectionLabelProps {
  children: React.ReactNode;
}

export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <div style={{
      fontSize:      12,
      fontWeight:    600,
      color:         "var(--gray-400)",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      marginBottom:  14,
    }}>
      {children}
    </div>
  );
}

/* ── VoiceWaveform ────────────────────────────────────────────────── */
export function VoiceWaveform() {
  return (
    <div style={{
      display:        "flex",
      justifyContent: "center",
      alignItems:     "flex-end",
      gap:            5,
      height:         36,
    }}>
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="wave-bar"
          style={{
            width:        4,
            borderRadius: 2,
            background:   "var(--green)",
            "--d":        `${0.4 + i * 0.08}s`,
            "--delay":    `${i * 0.05}s`,
            height:       `${8 + Math.sin(i * 0.8) * 16 + 10}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
