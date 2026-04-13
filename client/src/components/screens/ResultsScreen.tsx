// src/components/screens/ResultsScreen.tsx
// Shows RAG eligibility results across all schemes.
// Govt-official blue / white / gold theme.

import React, { useEffect, useState } from "react";
import { Header }                      from "../layout/Header";
import { AnimatedNumber, EligibilityTag } from "../ui";
import { useLanguage }                from "../../i18n/LanguageContext";
import type { FarmerProfile, RAGResult } from "../../types";

// ─── Keyframes ────────────────────────────────────────────────────────────────
const KEYFRAMES = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Poppins', sans-serif; background: #f0f4ff; }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cardPop {
    from { opacity: 0; transform: translateY(16px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)   scale(1);    }
  }
  @keyframes countUp {
    from { opacity: 0; transform: scale(0.5); }
    to   { opacity: 1; transform: scale(1);   }
  }
  @keyframes shimmer {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(300%);  }
  }
  @keyframes meterFill {
    from { width: 0%; }
  }
  @keyframes stampIn {
    0%   { opacity: 0; transform: scale(1.8) rotate(-15deg); }
    60%  { transform: scale(0.9) rotate(3deg); }
    100% { opacity: 1; transform: scale(1) rotate(0deg); }
  }
  @keyframes pulseGlow {
    0%,100% { box-shadow: 0 0 0 0 rgba(30,111,204,0.2); }
    50%      { box-shadow: 0 0 0 8px rgba(30,111,204,0);  }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes borderRun {
    0%   { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }

  .rs-page {
    min-height: 100vh;
    background: linear-gradient(160deg, #e8eeff 0%, #f5f7ff 45%, #eef2ff 100%);
  }
  .rs-content {
    max-width: 520px; margin: 0 auto;
    padding: 24px 18px 56px; position: relative; z-index: 1;
  }

  /* ── Hero header ── */
  .rs-hero {
    text-align: center; margin-bottom: 24px;
    animation: fadeSlideUp 0.5s 0.05s both;
  }
  .rs-hero-label {
    display: inline-flex; align-items: center; gap: 7px;
    background: linear-gradient(90deg,#0a2342,#1e4d8c);
    color: #fff; border-radius: 999px; padding: 6px 16px;
    font-size: 11.5px; font-weight: 600; letter-spacing: 0.05em;
    margin-bottom: 14px;
    box-shadow: 0 4px 16px rgba(10,35,66,0.25);
  }
  .rs-hero-name {
    font-size: clamp(22px,5vw,32px); font-weight: 900;
    color: #0a2342; line-height: 1.1; margin-bottom: 8px;
  }
  .rs-hero-name .gold { color: #e08a00; }
  .rs-hero-sub { font-size: 14px; color: #4a5568; margin-bottom: 12px; }
  .rs-hero-sub strong { color: #1e6fcc; font-weight: 700; }
  .rs-doc-badge {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 11.5px; color: #1e6fcc; font-weight: 600;
    padding: 5px 14px; border-radius: 99px;
    background: #eef4ff; border: 1px solid #c8d8f0;
  }

  /* ── Stat cards ── */
  .rs-stats {
    display: grid; grid-template-columns: repeat(3,1fr); gap: 10px;
    margin-bottom: 24px; animation: fadeSlideUp 0.5s 0.15s both;
  }
  .rs-stat {
    border-radius: 16px; padding: 16px 10px; text-align: center;
    position: relative; overflow: hidden;
    transition: transform 0.18s;
  }
  .rs-stat:hover { transform: translateY(-2px); }
  .rs-stat.eligible-stat {
    background: #f0fff4; border: 1.5px solid #68d391;
  }
  .rs-stat.ineligible-stat {
    background: #fff5f5; border: 1.5px solid #fc8181;
  }
  .rs-stat.total-stat {
    background: #fff; border: 1.5px solid #c8d8f0;
  }
  .rs-stat-num {
    font-size: 30px; font-weight: 900; line-height: 1;
    animation: countUp 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  .rs-stat-label { font-size: 11px; margin-top: 5px; opacity: 0.8; font-weight: 500; }

  /* ── Section label ── */
  .rs-section-label {
    font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: #0a2342;
    margin-bottom: 12px; display: flex; align-items: center; gap: 8px;
  }
  .rs-section-label::after {
    content: ''; flex: 1; height: 1px; background: #d8e4f5;
  }

  /* ── Result card ── */
  .rs-card {
    background: #fff; border: 1.5px solid #c8d8f0;
    border-radius: 20px; padding: 20px;
    margin-bottom: 12px; cursor: pointer;
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s;
    position: relative; overflow: hidden;
  }
  .rs-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(10,35,66,0.12);
    border-color: #1e6fcc;
  }
  .rs-card.is-eligible {
    border-color: #68d391;
    background: linear-gradient(180deg, #f6fff9 0%, #fff 100%);
  }
  .rs-card.is-eligible:hover { border-color: #38a169; }
  .rs-card.is-eligible .rs-card-accent {
    background: linear-gradient(90deg, #38a169, #68d391);
  }
  .rs-card .rs-card-accent {
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, #c8d8f0, #1e6fcc);
  }

  /* Eligible stamp */
  .rs-stamp {
    position: absolute; top: 14px; right: 16px;
    width: 48px; height: 48px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; border: 2px dashed;
    animation: stampIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  .rs-stamp.yes { border-color: #38a169; background: #f0fff4; }
  .rs-stamp.no  { border-color: #e53e3e; background: #fff5f5; }

  /* Card top row */
  .rs-card-top { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 14px; }
  .rs-card-icon {
    width: 46px; height: 46px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 21px; flex-shrink: 0;
  }
  .rs-card-title-row {
    display: flex; align-items: center; gap: 7px;
    flex-wrap: wrap; margin-bottom: 3px;
  }
  .rs-card-name { font-size: 17px; font-weight: 700; color: #0a2342; }
  .rs-confidence {
    font-size: 10px; font-weight: 700; padding: 2px 8px;
    border-radius: 99px; text-transform: uppercase; letter-spacing: 0.06em;
  }
  .rs-conf-high   { background: #f0fff4; color: #276749; border: 1px solid #68d391; }
  .rs-conf-medium { background: #fffbeb; color: #744210; border: 1px solid #f6ad55; }
  .rs-conf-low    { background: #fff5f5; color: #9b2c2c; border: 1px solid #fc8181; }
  .rs-card-full { font-size: 12.5px; color: #718096; }

  /* Benefit row */
  .rs-benefit-row {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 12px; flex-wrap: wrap; gap: 8px;
  }
  .rs-benefit-amount { font-size: 15px; font-weight: 700; }
  .rs-benefit-inst   { font-size: 11.5px; color: #718096; margin-top: 2px; }
  .rs-chunks {
    font-size: 11px; font-weight: 600; padding: 4px 10px;
    border-radius: 99px; background: #eef4ff; color: #1e6fcc;
    border: 1px solid #c8d8f0; white-space: nowrap;
  }

  /* Criteria meter */
  .rs-meter-label {
    display: flex; justify-content: space-between;
    font-size: 11.5px; color: #718096; margin-bottom: 5px;
  }
  .rs-meter-track {
    height: 5px; background: #e2e8f0; border-radius: 3px;
    overflow: hidden; margin-bottom: 12px;
  }
  .rs-meter-fill {
    height: 100%; border-radius: 3px;
    animation: meterFill 0.7s ease both;
  }
  .rs-meter-fill.green { background: linear-gradient(90deg,#38a169,#68d391); }
  .rs-meter-fill.red   { background: linear-gradient(90deg,#e53e3e,#fc8181); }
  .rs-meter-fill.partial { background: linear-gradient(90deg,#d69e2e,#f6ad55); }

  /* Teaser footer */
  .rs-teaser {
    display: flex; align-items: center; justify-content: space-between;
    font-size: 12.5px; padding-top: 10px;
    border-top: 1px solid #f0f4ff;
  }
  .rs-teaser-text {
    flex: 1; overflow: hidden; text-overflow: ellipsis;
    white-space: nowrap; padding-right: 8px; color: #4a5568;
  }
  .rs-teaser-cta {
    color: #1e6fcc; font-weight: 600; white-space: nowrap;
    font-size: 12px; display: flex; align-items: center; gap: 4px; flex-shrink: 0;
  }

  /* ── Actions ── */
  .rs-actions {
    display: flex; gap: 10px; margin-top: 20px;
    animation: fadeSlideUp 0.5s 0.5s both;
  }
  .rs-btn {
    flex: 1; padding: 14px; border-radius: 13px; cursor: pointer;
    font-family: 'Poppins', sans-serif; font-size: 13.5px; font-weight: 600;
    transition: all 0.18s; display: flex; align-items: center;
    justify-content: center; gap: 7px; border: 1.5px solid #c8d8f0;
    background: #fff; color: #0a2342;
  }
  .rs-btn:hover { border-color: #1e6fcc; color: #1e6fcc; background: #eef4ff; }
  .rs-btn.primary {
    background: linear-gradient(135deg,#0a2342,#1e6fcc);
    border-color: transparent; color: #fff;
    box-shadow: 0 6px 20px rgba(10,35,66,0.3);
  }
  .rs-btn.primary:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(10,35,66,0.38); }

  /* Premium View Button */
  .rs-view-btn {
    width: 100%; margin-top: 14px; padding: 12px; border-radius: 12px;
    background: linear-gradient(135deg, #0a2342, #1e6fcc);
    color: #fff; font-family: 'Poppins', sans-serif; font-size: 13.5px;
    font-weight: 700; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1);
    box-shadow: 0 4px 14px rgba(30,111,204,0.25);
  }
  .rs-view-btn:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 22px rgba(30,111,204,0.4);
    background: linear-gradient(135deg, #1e4d8c, #2563eb);
  }
  .rs-view-btn:active { transform: scale(0.98); }

  @keyframes pulseView {
    0%, 100% { box-shadow: 0 4px 14px rgba(30,111,204,0.25); }
    50% { box-shadow: 0 0 0 6px rgba(30,111,204,0.2); }
  }
  .rs-btn-pulse { animation: pulseView 2s infinite; }
`;

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface ResultsScreenProps {
  results: RAGResult[];
  profile: FarmerProfile;
  onSelectScheme: (item: RAGResult) => void;
  onBack: () => void;
  onReset: () => void;
  onEditForm: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function ResultsScreen({
  results, profile, onSelectScheme, onBack, onReset, onEditForm
}: ResultsScreenProps) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState<number[]>([]);
  const eligibleCount   = results.filter((r) => r.eligible === true).length;
  const ineligibleCount = results.length - eligibleCount;

  // Stagger result cards in
  useEffect(() => {
    results.forEach((_, i) => {
      setTimeout(() => setVisible((v) => [...v, i]), 200 + i * 90);
    });
  }, [results.length]);

  const confClass = (c: string) =>
    c === "high" ? "rs-conf-high" : c === "medium" ? "rs-conf-medium" : "rs-conf-low";

  const pct = (item: RAGResult) => {
    const total = (item.proof?.length || 0) + (item.reasons?.length || 0);
    return total > 0 ? Math.round(((item.proof?.length || 0) / total) * 100) : 0;
  };

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div className="rs-page">
        <Header showBack onBack={onBack} />

        <div className="rs-content">

          {/* ── Hero ── */}
          <div className="rs-hero">
            <div className="rs-hero-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {t('results.eligibility_report')}
            </div>
            <div className="rs-hero-name">
              {profile?.name
                ? <>{profile.name}<span className="gold">{t('results.results_suffix')}</span></>
                : <>{t('results.your_report')}</>}
            </div>
            <p className="rs-hero-sub">
              {t('results.qualify_prefix')}
              <strong>{eligibleCount} {t('results.of')} {results.length}</strong> {t('results.schemes')}
            </p>
            <div className="rs-doc-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              {t('results.backed_by_docs')}
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="rs-stats">
            {[
              { n: eligibleCount,   label: t('results.eligible'),        cls: "eligible-stat",   color: "#276749" },
              { n: ineligibleCount, label: t('results.not_eligible'),    cls: "ineligible-stat", color: "#9b2c2c" },
              { n: results.length,  label: t('results.schemes_checked'), cls: "total-stat",      color: "#0a2342" },
            ].map(({ n, label, cls, color }, i) => (
              <div key={label} className={`rs-stat ${cls}`}
                style={{ animationDelay: `${i * 80}ms` }}>
                <div className="rs-stat-num" style={{ color,
                  animationDelay: `${0.2 + i * 0.08}s` }}>
                  <AnimatedNumber value={n} />
                </div>
                <div className="rs-stat-label" style={{ color }}>{label}</div>
              </div>
            ))}
          </div>

          {/* ── Cards ── */}
          <div className="rs-section-label">{t('results.results_label')}</div>

          {results.map((item, i) => {
            const criteriaTotal = (item.proof?.length || 0) + (item.reasons?.length || 0);
            const pctVal        = pct(item);
            const meterColor    = item.eligible ? "green" : pctVal > 40 ? "partial" : "red";

            return (
              <div
                key={item.scheme?.id || i}
                className={`rs-card ${item.eligible ? "is-eligible" : ""}`}
                style={{
                  opacity:    visible.includes(i) ? 1 : 0,
                  animation:  visible.includes(i)
                    ? `cardPop 0.4s cubic-bezier(0.34,1.2,0.64,1) both` : "none",
                }}
                onClick={() => onSelectScheme(item)}
              >
                <div className="rs-card-accent" />

                {/* Stamp */}
                <div className={`rs-stamp ${item.eligible ? "yes" : "no"}`}
                  style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
                  {item.eligible ? "✓" : "✗"}
                </div>

                {/* Top row */}
                <div className="rs-card-top" style={{ paddingRight: 64 }}>
                  <div className="rs-card-icon"
                    style={{ background: item.scheme?.light || "#eef4ff" }}>
                    {item.scheme?.emoji || "📄"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                      <div style={{
                        fontSize: 12, fontWeight: 700, color: "#1e6fcc",
                        textTransform: "uppercase", letterSpacing: "0.05em"
                      }}>
                        {item.confidence === "high" ? t('results.match_pct', { pct: 95 }) : 
                         item.confidence === "medium" ? t('results.match_pct', { pct: 75 }) : 
                         t('results.match_pct', { pct: 45 })}
                      </div>
                      <EligibilityTag eligible={item.eligible} />
                    </div>
                    <div className="rs-card-title-row">
                      <span className="rs-card-name">{item.scheme?.name}</span>
                    </div>
                    <div className="rs-card-full">{item.scheme?.fullName}</div>
                  </div>
                </div>

                {/* Benefit row */}
                <div className="rs-benefit-row">
                  <div>
                    <div className="rs-benefit-amount"
                      style={{ color: item.scheme?.color || "#1e6fcc" }}>
                      {item.scheme?.benefit}
                    </div>
                    {item.scheme?.installments && (
                      <div className="rs-benefit-inst">{item.scheme?.installments}</div>
                    )}
                  </div>
                  {item.chunksUsed !== undefined && item.chunksUsed > 0 && (
                    <div className="rs-chunks">
                      📄 {item.chunksUsed} PDF chunks
                    </div>
                  )}
                </div>

                {/* Criteria meter */}
                {criteriaTotal > 0 && (
                  <>
                    <div className="rs-meter-label">
                      <span>{item.proof?.length || 0} / {criteriaTotal} criteria met</span>
                      <span style={{ fontWeight: 600, color: item.eligible ? "#276749" : "#9b2c2c" }}>
                        {pctVal}%
                      </span>
                    </div>
                    <div className="rs-meter-track">
                      <div
                        className={`rs-meter-fill ${meterColor}`}
                        style={{ width: `${pctVal}%`, animationDelay: `${0.3 + i * 0.08}s` }}
                      />
                    </div>
                  </>
                )}

                <div className="rs-card-details">
                  {item.reasons && item.reasons.length > 0 && (
                    <div className="rs-detail-sec">
                      <div className="rs-detail-label">
                        <span>💡</span> {t('results.reasoning_label')}
                      </div>
                      <ul className="rs-detail-list">
                        {item.reasons.map((r, idx) => <li key={idx}>{r.msg}</li>)}
                      </ul>
                    </div>
                  )}

                  {item.proof && item.proof.length > 0 && (
                    <div className="rs-detail-sec">
                      <div className="rs-detail-label">
                        <span>🔍</span> {t('results.evidence_label')}
                      </div>
                      <ul className="rs-detail-list">
                        {item.proof.map((p, idx) => <li key={idx}>"{p.msg}"</li>)}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="rs-card-actions">
                  <button className={`rs-view-btn ${item.confidence === 'high' ? 'rs-btn-pulse' : ''}`} 
                    onClick={(e) => { e.stopPropagation(); onSelectScheme(item); }}>
                    {t('results.viewApply')}
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Teaser */}
                <div className="rs-teaser">
                  <span className="rs-teaser-text">
                    {item.eligible
                      ? `✓ ${item.proof?.[0]?.label || "Eligible"}${(item.proof?.length || 0) > 1 ? ` +${(item.proof?.length || 0) - 1} more` : ""}`
                      : `✗ ${item.reasons?.[0]?.label || "Not eligible"}`}
                  </span>
                  <span className="rs-teaser-cta">
                    {t('results.viewApply')}
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            );
          })}

          {/* ── Actions ── */}
          <div className="rs-actions">
            <button className="rs-btn" onClick={onReset}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 1 0 .49-5.07"/>
              </svg>
              New Check
            </button>
            <button className="rs-btn primary" onClick={onEditForm}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
