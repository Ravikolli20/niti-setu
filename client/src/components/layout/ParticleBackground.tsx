// src/components/layout/ParticleBackground.tsx
// Ambient background: floating wheat grains + geometric govt-seal particles.

import React, { useMemo } from "react";

// ─── Keyframes ────────────────────────────────────────────────────────────────
const KEYFRAMES = `
  @keyframes floatUp {
    0%   { transform: translateY(0px)   translateX(0px)   rotate(0deg);   opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    100% { transform: translateY(-110vh) translateX(var(--drift)) rotate(360deg); opacity: 0; }
  }
  @keyframes floatDrift {
    0%,100% { transform: translateY(0px) translateX(0px) scale(1);   opacity: 0; }
    10%      { opacity: var(--op); }
    50%      { transform: translateY(-40px) translateX(var(--drift)) scale(1.1); opacity: var(--op); }
    90%      { opacity: var(--op); }
  }
  @keyframes spinGlyph {
    0%   { transform: rotate(0deg)   scale(0.8); opacity: 0; }
    15%  { opacity: var(--op); }
    85%  { opacity: var(--op); }
    100% { transform: rotate(720deg) scale(1.2); opacity: 0; }
  }
  @keyframes twinkle {
    0%,100% { opacity: 0.15; transform: scale(0.8); }
    50%      { opacity: 0.6;  transform: scale(1.3); }
  }
`;

// ─── Particle definitions ─────────────────────────────────────────────────────
const SHAPES = ["wheat", "dot", "diamond", "ring", "star"] as const;
type ShapeType = typeof SHAPES[number];

const COLORS = [
  "rgba(245,166,35,VAL)",   // gold
  "rgba(255,255,255,VAL)",  // white
  "rgba(100,160,255,VAL)",  // sky blue
  "rgba(30,109,204,VAL)",   // royal blue
];

function seeded(seed: number, i: number): number {
  const x = Math.sin(seed + i * 127.1) * 43758.5453123;
  return x - Math.floor(x);
}

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface SvgProps {
  color: string;
  size: number;
}

interface Particle {
  id: number;
  shape: ShapeType;
  color: string;
  size: number;
  x: number;
  startY: number;
  dur: number;
  delay: number;
  drift: string;
  opacity: number;
  anim: string;
}

interface ParticleBackgroundProps {
  count?: number;
}

// ─── Single particle renderers ────────────────────────────────────────────────
function WheatSVG({ color, size }: SvgProps) {
  return (
    <svg width={size} height={size * 2.2} viewBox="0 0 10 22" fill="none"
      xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <line x1="5" y1="22" x2="5" y2="2" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      {[6, 10, 14].map((y, i) => (
        <ellipse key={i} cx={i % 2 === 0 ? 2.5 : 7.5} cy={y} rx="2.2" ry="1.2"
          fill={color} opacity="0.85" transform={`rotate(${i % 2 === 0 ? -20 : 20} ${i % 2 === 0 ? 2.5 : 7.5} ${y})`} />
      ))}
    </svg>
  );
}

function DiamondSVG({ color, size }: SvgProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="6,0 12,6 6,12 0,6" fill={color} />
    </svg>
  );
}

function RingSVG({ color, size }: SvgProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="5.5" stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="7" cy="7" r="1.5" fill={color} />
    </svg>
  );
}

function StarSVG({ color, size }: SvgProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="6,0 7.5,4.5 12,4.5 8.5,7.5 9.5,12 6,9 2.5,12 3.5,7.5 0,4.5 4.5,4.5"
        fill={color} />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function ParticleBackground({ count = 22 }: ParticleBackgroundProps) {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => {
      const r       = (n: number) => seeded(42 + i, n);
      const shape   = SHAPES[Math.floor(r(0) * SHAPES.length)];
      const colorTpl= COLORS[Math.floor(r(1) * COLORS.length)];
      const opacity = 0.12 + r(2) * 0.28;
      const color   = colorTpl.replace("VAL", opacity.toFixed(2));
      const size    = shape === "wheat" ? 5 + r(3) * 5 : 4 + r(3) * 8;
      const x       = r(4) * 100;              // % from left
      const startY  = 80 + r(5) * 25;          // start below fold
      const dur     = 12 + r(6) * 18;
      const delay   = -(r(7) * dur);           // pre-start so screen is populated on load
      const drift   = `${(r(8) - 0.5) * 120}px`;
      const anim    = shape === "wheat"   ? "floatUp"
                    : shape === "diamond" ? "spinGlyph"
                    : shape === "star"    ? "spinGlyph"
                    : "floatDrift";

      return { id: i, shape, color, size, x, startY, dur, delay, drift, opacity, anim };
    });
  }, [count]);

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              position:  "absolute",
              left:      `${p.x}%`,
              top:       `${p.startY}%`,
              "--drift": p.drift,
              "--op":    p.opacity,
              animation: `${p.anim} ${p.dur}s ${p.delay}s ease-in-out infinite`,
              willChange: "transform, opacity",
            } as React.CSSProperties}
          >
            {p.shape === "wheat"   && <WheatSVG   color={p.color} size={p.size} />}
            {p.shape === "dot"     && (
              <div style={{
                width: p.size, height: p.size, borderRadius: "50%",
                background: p.color,
                animation: `twinkle ${4 + p.dur * 0.3}s ${p.delay}s ease-in-out infinite`,
              }} />
            )}
            {p.shape === "diamond" && <DiamondSVG color={p.color} size={p.size} />}
            {p.shape === "ring"    && <RingSVG    color={p.color} size={p.size * 1.4} />}
            {p.shape === "star"    && <StarSVG    color={p.color} size={p.size} />}
          </div>
        ))}
      </div>
    </>
  );
}
