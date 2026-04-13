// src/components/screens/HomeScreen.tsx
// Landing page — Govt-official blue/white/gold theme.

import React, { useState } from "react";
import { Header } from "../layout/Header";
import { ParticleBackground } from "../layout/ParticleBackground";
import { useLanguage } from "../../i18n/LanguageContext";
import type { Scheme } from "../../types";

// ─── Styles & Keyframes ───────────────────────────────────────────────────────
const KEYFRAMES = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #f0f4ff;
    font-family: 'Poppins', sans-serif;
    min-height: 100vh;
  }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; } to { opacity: 1; }
  }
  @keyframes countUp {
    from { opacity: 0; transform: scale(0.7); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes shimmerSlide {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes rippleAnim {
    0%   { transform: translate(-50%,-50%) scale(0); opacity: 0.45; }
    100% { transform: translate(-50%,-50%) scale(4); opacity: 0; }
  }
  @keyframes badgePop {
    0%   { transform: scale(0.85); opacity: 0; }
    70%  { transform: scale(1.05); }
    100% { transform: scale(1);    opacity: 1; }
  }
  @keyframes borderRun {
    0%   { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }
  @keyframes floatCard {
    0%,100% { transform: translateY(0px); }
    50%      { transform: translateY(-4px); }
  }

  .ns-page {
    min-height: 100vh;
    background: linear-gradient(160deg, #e8eeff 0%, #f5f7ff 40%, #eef2ff 100%);
    position: relative;
  }
  .ns-welcome-card {
    background: #fff; border: 1.5px solid #c8d8f0; border-radius: 20px;
    padding: 20px; margin-bottom: 24px; text-align: left;
    display: flex; align-items: center; justify-content: space-between;
    animation: fadeSlideUp 0.5s 0.1s both;
    box-shadow: 0 4px 16px rgba(10,35,66,0.06);
  }
  .ns-welcome-info { display: flex; flex-direction: column; gap: 4px; }
  .ns-welcome-label { font-size: 12px; font-weight: 600; color: #1e6fcc; text-transform: uppercase; letter-spacing: 0.05em; }
  .ns-welcome-name { font-size: 18px; font-weight: 700; color: #0a2342; }
  .ns-btn-clear {
    background: #f7fafc; border: 1.5px solid #e2e8f0; border-radius: 10px;
    padding: 8px 12px; font-size: 12px; font-weight: 600; color: #718096;
    cursor: pointer; transition: all 0.2s;
  }
  .ns-btn-clear:hover { background: #fee2e2; border-color: #fca5a5; color: #dc2626; }

  .ns-content {
    max-width: 520px;
    margin: 0 auto;
    padding: 24px 18px 48px;
    position: relative;
    z-index: 1;
  }

  /* ── Hero ── */
  .ns-hero { text-align: center; margin-bottom: 32px; }
  .ns-hero-badge {
    display: inline-flex; align-items: center; gap: 7px;
    background: linear-gradient(90deg,#0a2342,#1e4d8c);
    color: #fff; border-radius: 999px;
    padding: 6px 16px; font-size: 12px; font-weight: 600;
    letter-spacing: 0.05em; margin-bottom: 18px;
    box-shadow: 0 4px 16px rgba(10,35,66,0.25);
    animation: badgePop 0.5s 0.1s both;
  }
  .ns-hero-badge .flag { font-size: 15px; }

  .ns-hero h1 {
    font-family: 'Poppins', sans-serif;
    font-size: clamp(28px, 6vw, 46px);
    font-weight: 900;
    line-height: 1.12;
    color: #0a2342;
    margin-bottom: 14px;
    animation: fadeSlideUp 0.6s 0.2s both;
  }
  .ns-hero h1 .accent { color: #1e6fcc; }
  .ns-hero h1 .gold   { color: #e08a00; }

  .ns-hero p {
    font-size: 14.5px; color: #4a5568;
    max-width: 380px; margin: 0 auto;
    line-height: 1.75; animation: fadeSlideUp 0.6s 0.35s both;
  }

  /* ── Status Badge ── */
  .ns-status {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 6px 14px; border-radius: 999px;
    font-size: 12px; font-weight: 500; margin-bottom: 16px;
    animation: badgePop 0.4s both;
  }
  .ns-status.online  { background:#f0fff4; border:1px solid #68d391; color:#276749; }
  .ns-status.offline { background:#fff5f5; border:1px solid #fc8181; color:#9b2c2c; }
  .ns-status.loading { background:#fffbeb; border:1px solid #f6e05e; color:#744210; }
  .ns-status .dot {
    width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
  }
  .ns-status.online  .dot { background:#38a169; }
  .ns-status.offline .dot { background:#e53e3e; }
  .ns-spinner {
    width: 9px; height: 9px; border-radius: 50%;
    border: 1.5px solid #f6e05e; border-top-color: #d69e2e;
    animation: spin 0.7s linear infinite;
  }

  /* ── Entry Cards ── */
  .ns-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }

  .ns-card-voice {
    border: none; border-radius: 20px; padding: 26px 20px;
    cursor: pointer; text-align: left; color: #fff;
    background: linear-gradient(135deg, #0a2342 0%, #1e4d8c 60%, #1e6fcc 100%);
    box-shadow: 0 8px 32px rgba(10,35,66,0.35);
    position: relative; overflow: hidden;
    transition: transform 0.18s ease, box-shadow 0.18s ease;
    animation: fadeSlideUp 0.6s 0.45s both;
  }
  .ns-card-voice:hover {
    transform: translateY(-3px);
    box-shadow: 0 14px 40px rgba(10,35,66,0.45);
  }
  .ns-card-voice::after {
    content: ''; position: absolute; top: 0; left: -60%;
    width: 40%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
    animation: shimmerSlide 2.5s 1s ease-in-out infinite;
    pointer-events: none;
  }
  .ns-card-voice .gold-bar {
    position: absolute; bottom: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #f5a623, #ffd700, #f5a623);
    background-size: 200% 100%;
    animation: borderRun 2s linear infinite;
  }

  .ns-card-form {
    border: 1.5px solid #c8d8f0; border-radius: 20px;
    padding: 26px 20px; cursor: pointer; text-align: left;
    background: #fff;
    box-shadow: 0 4px 20px rgba(10,35,66,0.08);
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s;
    animation: fadeSlideUp 0.6s 0.55s both;
  }
  .ns-card-form:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 32px rgba(10,35,66,0.14);
    border-color: #1e6fcc;
  }

  .ns-card-icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; margin-bottom: 12px;
  }
  .ns-card-title {
    font-weight: 700; font-size: 17px; margin-bottom: 5px; line-height: 1.2;
  }
  .ns-card-desc { font-size: 12.5px; opacity: 0.78; line-height: 1.55; }

  .ns-progress-dots { display: flex; gap: 4px; margin-top: 14px; }
  .ns-progress-dots span {
    height: 3px; flex: 1; border-radius: 2px;
    background: #e2e8f0; transition: background 0.3s;
  }
  .ns-progress-dots span.filled { background: #1e6fcc; }

  .ns-ripple {
    position: absolute; pointer-events: none;
    width: 20px; height: 20px; border-radius: 50%;
    background: rgba(255,255,255,0.4);
    transform: translate(-50%,-50%) scale(0);
    animation: rippleAnim 0.65s ease-out forwards;
  }

  /* ── RAG Explainer ── */
  .ns-rag {
    background: #fff;
    border: 1px solid #c8d8f0;
    border-radius: 18px; padding: 18px 20px;
    margin-bottom: 20px;
    animation: fadeSlideUp 0.6s 0.65s both;
    position: relative; overflow: hidden;
  }
  .ns-rag::before {
    content: ''; position: absolute;
    top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, #0a2342, #1e6fcc, #f5a623);
  }
  .ns-rag-label {
    font-size: 11px; font-weight: 700; color: #1e6fcc;
    text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 14px;
    display: flex; align-items: center; gap: 6px;
  }
  .ns-rag-steps { display: flex; align-items: flex-start; gap: 0; }
  .ns-rag-step { flex: 1; text-align: center; position: relative; }
  .ns-rag-step-icon {
    width: 38px; height: 38px; border-radius: 10px;
    background: #eef4ff; display: flex; align-items: center;
    justify-content: center; font-size: 18px; margin: 0 auto 6px;
    border: 1px solid #c8d8f0;
  }
  .ns-rag-step-title { font-size: 11.5px; font-weight: 600; color: #1a2e4a; }
  .ns-rag-step-desc  { font-size: 10.5px; color: #6b7ea8; line-height: 1.4; margin-top: 2px; }
  .ns-rag-arrow {
    position: absolute; top: 14px; right: -10px; z-index: 1;
    color: #1e6fcc; font-size: 14px; font-weight: 700;
  }

  /* ── Schemes ── */
  .ns-schemes {
    background: #fff; border: 1px solid #c8d8f0;
    border-radius: 18px; padding: 18px 20px; margin-bottom: 20px;
    animation: fadeSlideUp 0.6s 0.75s both;
  }
  .ns-schemes-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 14px;
  }
  .ns-schemes-title {
    font-size: 11px; font-weight: 700; color: #0a2342;
    text-transform: uppercase; letter-spacing: 0.1em;
  }
  .ns-schemes-count {
    font-size: 11px; color: #718096;
    background: #eef4ff; padding: 3px 10px; border-radius: 99px;
    border: 1px solid #c8d8f0;
  }
  .ns-scheme-row {
    display: flex; align-items: center; gap: 14px;
    padding: 12px 0; position: relative;
  }
  .ns-scheme-row + .ns-scheme-row::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0;
    height: 1px; background: #f0f4ff;
  }
  .ns-scheme-icon {
    width: 42px; height: 42px; border-radius: 11px;
    display: flex; align-items: center; justify-content: center;
    font-size: 19px; flex-shrink: 0;
  }
  .ns-scheme-name { font-weight: 600; font-size: 13.5px; color: #1a2e4a; }
  .ns-scheme-ministry { font-size: 11.5px; color: #718096; margin-top: 2px; }
  .ns-scheme-benefit {
    font-size: 12.5px; font-weight: 700; white-space: nowrap;
    padding: 4px 10px; border-radius: 8px;
  }

  /* ── Stats ── */
  .ns-stats {
    display: grid; grid-template-columns: repeat(3,1fr); gap: 12px;
    animation: fadeSlideUp 0.6s 0.85s both;
  }
  .ns-stat {
    background: #fff; border: 1px solid #c8d8f0;
    border-radius: 16px; padding: 16px 12px; text-align: center;
    box-shadow: 0 2px 12px rgba(10,35,66,0.06);
    transition: transform 0.18s;
  }
  .ns-stat:hover { transform: translateY(-2px); }
  .ns-stat-num {
    font-family: 'Poppins', sans-serif; font-size: 20px; font-weight: 800;
    color: #0a2342; line-height: 1;
  }
  .ns-stat-label { font-size: 11px; color: #718096; margin-top: 5px; line-height: 1.35; }

  /* ── Footer ── */
  .ns-footer {
    text-align: center; margin-top: 28px;
    font-size: 11px; color: #a0aec0; letter-spacing: 0.04em;
    animation: fadeIn 0.8s 1s both;
  }
  .ns-footer span { color: #1e6fcc; font-weight: 600; }
`;

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface StatusBadgeProps {
  serverOnline: boolean | null;
}

interface HomeScreenProps {
  onNavigate: (s: any) => void;
  serverOnline: boolean | null;
  schemes: Scheme[];
  hasProfile: boolean;
  profileName?: string;
  onClearProfile: () => void;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ serverOnline }: StatusBadgeProps) {
  if (serverOnline === null) return (
    <div className="ns-status loading">
      <div className="ns-spinner" /> Connecting to server…
    </div>
  );
  if (serverOnline) return (
    <div className="ns-status online">
      <div className="dot" /> RAG server online
    </div>
  );
  return (
    <div className="ns-status offline">
      <div className="dot" /> Server offline — run: cd server &amp;&amp; npm start
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function HomeScreen({ onNavigate, serverOnline, schemes, hasProfile, profileName, onClearProfile }: HomeScreenProps) {
  const { t } = useLanguage();
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [hoverVoice, setHoverVoice] = useState(false);

  const addRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id   = Date.now();
    setRipples((r) => [...r, {
      id,
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    }]);
    setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 700);
  };

  const displaySchemes: Scheme[] = schemes?.length > 0 ? schemes : [
    { id: "pmkisan", name: "PM-KISAN",  fullName: "Pradhan Mantri Kisan Samman Nidhi",  ministry: "Ministry of Agriculture", benefit: "₹6,000 / year",       iconBg: "#eef9ff", color: "#1e6fcc" },
    { id: "pmfby",   name: "PMFBY",     fullName: "Pradhan Mantri Fasal Bima Yojana",   ministry: "Ministry of Agriculture", benefit: "Crop insurance",      iconBg: "#fff8ec", color: "#c97c00" },
    { id: "kcc",     name: "KCC",       fullName: "Kisan Credit Card Scheme",            ministry: "Ministry of Finance",     benefit: "Up to ₹3 lakh",       iconBg: "#f0f4ff", color: "#3b4fd9" },
  ];

  const schemeEmojis = ["🌾", "🛡️", "💳"];

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div className="ns-page">
        <ParticleBackground />
        <Header showBack={false} />

        <div className="ns-content">

          {/* ── Hero ── */}
          <div className="ns-hero">
            <div><StatusBadge serverOnline={serverOnline} /></div>

            <div className="ns-hero-badge">
              <span className="flag">🇮🇳</span>
              <span>{t('home.mission')}</span>
            </div>
            
            {hasProfile && (
              <div className="ns-welcome-card">
                <div className="ns-welcome-info">
                  <span className="ns-welcome-label">{t('common.welcomeBack')}</span>
                  <span className="ns-welcome-name">{profileName || t('home.welcomeFarmer')}</span>
                </div>
                <button className="ns-btn-clear" onClick={onClearProfile}>
                  {t('common.clear')}
                </button>
              </div>
            )}

            <h1>
              {t('home.title').split('|').map((part, i) => (
                <React.Fragment key={i}>{part}<br/></React.Fragment>
              ))}
            </h1>

            <p>{t('home.subtitle')}</p>
          </div>

          {/* ── Entry Cards ── */}
          <div className="ns-cards">

            {/* Voice card */}
            <button
              className="ns-card-voice"
              onClick={(e) => { addRipple(e); setTimeout(() => onNavigate("voice"), 160); }}
              onMouseEnter={() => setHoverVoice(true)}
              onMouseLeave={() => setHoverVoice(false)}
            >
              {ripples.map((rp) => (
                <div key={rp.id} className="ns-ripple"
                  style={{ left: `${rp.x}%`, top: `${rp.y}%` }} />
              ))}
              <div className="ns-card-icon"
                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}>
                🎙️
              </div>
              <div className="ns-card-title">{t('home.btnVoice')}</div>
              <div className="ns-card-desc">
                {t('home.descVoice')}
              </div>
              {/* Govt emblem watermark */}
              <div style={{ position: "absolute", right: 14, bottom: 14, opacity: 0.12, transition: "opacity 0.3s",
                ...(hoverVoice && { opacity: 0.22 }) }}>
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.4">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </div>
              <div className="gold-bar" />
            </button>

            {/* Form card */}
            <button className="ns-card-form" onClick={() => onNavigate("form")}>
              <div className="ns-card-icon"
                style={{ background: "#eef4ff", border: "1px solid #c8d8f0" }}>
                📋
              </div>
              <div className="ns-card-title" style={{ color: "#0a2342" }}>{t('home.btnForm')}</div>
              <div className="ns-card-desc" style={{ color: "#4a5568" }}>
                {t('home.descForm')}
              </div>
              <div className="ns-progress-dots">
                {[...Array(9)].map((_, i) => (
                  <span key={i} className={i < 3 ? "filled" : ""} />
                ))}
              </div>
            </button>
          </div>

          {/* ── RAG Explainer ── */}
          <div className="ns-rag">
            <div className="ns-rag-label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              {t('home.ragTitle')}
            </div>
            <div className="ns-rag-steps">
              {[
                { icon: "📄", title: t('home.ragStep1'),  desc: t('home.ragDesc1') },
                { icon: "🔍", title: t('home.ragStep2'),  desc: t('home.ragDesc2') },
                { icon: "🤖", title: t('home.ragStep3'),  desc: t('home.ragDesc3') },
              ].map((step, i) => (
                <div key={i} className="ns-rag-step">
                  {i < 2 && <div className="ns-rag-arrow">›</div>}
                  <div className="ns-rag-step-icon">{step.icon}</div>
                  <div className="ns-rag-step-title">{step.title}</div>
                  <div className="ns-rag-step-desc">{step.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Schemes ── */}
          <div className="ns-schemes">
            <div className="ns-schemes-header">
              <div className="ns-schemes-title">Schemes Covered</div>
              <div className="ns-schemes-count">
                {schemes?.length > 0 ? `${schemes.length} from MongoDB` : "3 available"}
              </div>
            </div>
            {displaySchemes.map((s, i) => (
              <div key={s.id} className="ns-scheme-row">
                <div className="ns-scheme-icon" style={{ background: s.iconBg }}>
                  {schemeEmojis[i] || "📋"}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="ns-scheme-name">{s.name} — {s.fullName}</div>
                  <div className="ns-scheme-ministry">{s.ministry}</div>
                </div>
                <div className="ns-scheme-benefit"
                  style={{ color: s.color, background: s.iconBg }}>
                  {s.benefit}
                </div>
              </div>
            ))}
          </div>

          {/* ── Stats ── */}
          <div className="ns-stats">
            {[
              ["RAG",   "Powered\ndecisions"],
              ["< 10s", "Response\ntime"],
              ["100%",  "Document\nbacked"],
            ].map(([num, label]) => (
              <div key={label} className="ns-stat">
                <div className="ns-stat-num">{num}</div>
                <div className="ns-stat-label">{label}</div>
              </div>
            ))}
          </div>

          {/* ── Footer ── */}
          <div className="ns-footer">
            Built for <span>Bharat</span> · Powered by <span>AI</span> · Secured by <span>Official PDFs</span>
          </div>
        </div>
      </div>
    </>
  );
}
