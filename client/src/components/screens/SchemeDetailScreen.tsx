// src/components/screens/SchemeDetailScreen.tsx
// Full detail view for a single scheme result.
// Govt-official blue / white / gold theme.

import React from "react";
import { Header }                      from "../layout/Header";
import { EligibilityTag, Spinner } from "../ui";
import { fillAndDownloadPdf } from "../../utils/pdfUtils";
import { useLanguage }                from "../../i18n/LanguageContext";
import type { RAGResult, FarmerProfile } from "../../types";

// ─── Keyframes ────────────────────────────────────────────────────────────────
const KEYFRAMES = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Poppins', sans-serif; background: #f0f4ff; }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; } to { opacity: 1; }
  }
  @keyframes shimmerSlide {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(300%);  }
  }
  @keyframes shimmerBtn {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0;  }
  }
  @keyframes glowPulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(30,111,204,0.25); }
    50%      { box-shadow: 0 0 0 8px rgba(30,111,204,0);  }
  }
  @keyframes stampIn {
    0%   { opacity: 0; transform: scale(2) rotate(-20deg); }
    60%  { transform: scale(0.88) rotate(4deg); }
    100% { opacity: 1; transform: scale(1) rotate(0deg); }
  }
  @keyframes rowIn {
    from { opacity: 0; transform: translateX(-12px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .sd-page {
    min-height: 100vh;
    background: linear-gradient(160deg, #e8eeff 0%, #f5f7ff 45%, #eef2ff 100%);
  }
  .sd-content {
    max-width: 520px; margin: 0 auto;
    padding: 22px 18px 60px; position: relative; z-index: 1;
  }

  /* ── Back button ── */
  .sd-back {
    display: inline-flex; align-items: center; gap: 6px;
    background: #fff; border: 1.5px solid #c8d8f0;
    border-radius: 11px; padding: 9px 16px;
    font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 600;
    color: #0a2342; cursor: pointer; margin-bottom: 20px;
    transition: all 0.18s;
    animation: fadeIn 0.4s both;
  }
  .sd-back:hover { border-color: #1e6fcc; color: #1e6fcc; background: #eef4ff; transform: translateX(-2px); }

  /* ── Hero card ── */
  .sd-hero-card {
    background: #fff; border: 1.5px solid #c8d8f0;
    border-radius: 22px; overflow: hidden;
    margin-bottom: 14px; box-shadow: 0 8px 32px rgba(10,35,66,0.09);
    animation: fadeSlideUp 0.45s 0.05s both;
    position: relative;
  }
  .sd-hero-top {
    padding: 26px 24px 20px;
    border-bottom: 1px solid #edf2ff;
    position: relative; overflow: hidden;
  }
  .sd-hero-top::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
    background: linear-gradient(90deg, #0a2342 0%, #1e6fcc 50%, #f5a623 100%);
  }
  .sd-hero-top::after {
    content: ''; position: absolute; top: 0; left: -60%; width: 35%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
    animation: shimmerSlide 3s 1s ease-in-out infinite;
    pointer-events: none;
  }

  /* Watermark ring */
  .sd-watermark {
    position: absolute; right: -30px; top: 50%; transform: translateY(-50%);
    width: 140px; height: 140px; border-radius: 50%;
    border: 1px solid rgba(30,111,204,0.1);
    pointer-events: none;
  }
  .sd-watermark-2 {
    position: absolute; right: 0px; top: 50%; transform: translateY(-50%);
    width: 90px; height: 90px; border-radius: 50%;
    border: 1px solid rgba(245,166,35,0.1);
    pointer-events: none;
  }

  /* Scheme title row */
  .sd-title-row {
    display: flex; align-items: center; gap: 14px; margin-bottom: 18px;
    position: relative; z-index: 1;
  }
  .sd-scheme-icon {
    width: 58px; height: 58px; border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    font-size: 27px; flex-shrink: 0; border: 2px solid rgba(0,0,0,0.06);
    box-shadow: 0 4px 12px rgba(10,35,66,0.1);
  }
  .sd-scheme-name { font-size: 24px; font-weight: 800; color: #0a2342; line-height: 1.15; }
  .sd-scheme-full { font-size: 13px; color: #718096; margin-top: 3px; }

  /* Eligible stamp */
  .sd-stamp {
    position: absolute; right: 0; top: 0;
    width: 54px; height: 54px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; font-weight: 800; border: 3px dashed;
    animation: stampIn 0.5s 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
    z-index: 2;
  }
  .sd-stamp.yes { border-color: #38a169; background: #f0fff4; color: #276749; }
  .sd-stamp.no  { border-color: #e53e3e; background: #fff5f5; color: #9b2c2c; }

  /* Benefit pills */
  .sd-pills { display: flex; gap: 10px; position: relative; z-index: 1; }
  .sd-pill {
    flex: 1; background: #f5f8ff; border: 1px solid #c8d8f0;
    border-radius: 13px; padding: 12px 14px; text-align: center;
    transition: transform 0.18s; cursor: default;
  }
  .sd-pill:hover { transform: translateY(-2px); }
  .sd-pill-val { font-size: 17px; font-weight: 800; line-height: 1.1; }
  .sd-pill-key { font-size: 11px; color: #718096; margin-top: 4px; font-weight: 500; }

  /* ── AI Explanation ── */
  .sd-ai {
    padding: 20px 24px;
    background: linear-gradient(180deg, #fafcff 0%, #fff 100%);
  }
  .sd-ai-header {
    display: flex; align-items: center; gap: 8px; margin-bottom: 13px; flex-wrap: wrap;
  }
  .sd-ai-avatar {
    width: 30px; height: 30px; border-radius: 50%;
    background: linear-gradient(135deg, #0a2342, #1e6fcc);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    animation: glowPulse 2.5s ease-in-out infinite;
  }
  .sd-ai-name { font-size: 14px; font-weight: 700; color: #0a2342; }
  .sd-confidence {
    font-size: 10.5px; font-weight: 700; padding: 3px 9px;
    border-radius: 99px; text-transform: uppercase; letter-spacing: 0.06em;
  }
  .sd-conf-high   { background: #f0fff4; color: #276749; border: 1px solid #68d391; }
  .sd-conf-medium { background: #fffbeb; color: #744210; border: 1px solid #f6ad55; }
  .sd-conf-low    { background: #fff5f5; color: #9b2c2c; border: 1px solid #fc8181; }
  .sd-chunks-info { font-size: 11px; color: #a0aec0; margin-left: auto; }
  .sd-ai-text {
    font-size: 14.5px; color: #2d3748; line-height: 1.8;
  }

  /* ── PDF Citation ── */
  .sd-citation {
    background: linear-gradient(135deg, #f0f9ff, #e8f4ff);
    border: 1.5px solid #90cdf4; border-radius: 18px;
    padding: 18px 20px; margin-bottom: 14px;
    animation: fadeSlideUp 0.45s 0.2s both;
    position: relative; overflow: hidden;
  }
  .sd-citation::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, #0a2342, #1e6fcc);
  }
  .sd-citation-header {
    display: flex; align-items: center; gap: 8px; margin-bottom: 13px;
  }
  .sd-citation-label {
    font-size: 11px; font-weight: 700; color: #1e6fcc;
    text-transform: uppercase; letter-spacing: 0.1em;
  }
  .sd-citation-badge {
    margin-left: auto; font-size: 10.5px; font-weight: 700;
    background: #1e6fcc; color: #fff;
    padding: 3px 10px; border-radius: 99px; letter-spacing: 0.04em;
  }
  .sd-citation-text {
    font-size: 14px; color: #1a365d; font-style: italic;
    line-height: 1.75; border-left: 3px solid #1e6fcc;
    padding-left: 14px; margin-bottom: 10px;
  }
  .sd-citation-source { font-size: 12px; color: #1e6fcc; font-weight: 600; }

  /* ── Section card ── */
  .sd-section {
    background: #fff; border: 1px solid #c8d8f0;
    border-radius: 18px; padding: 20px;
    margin-bottom: 14px;
    box-shadow: 0 2px 12px rgba(10,35,66,0.05);
  }
  .sd-section.delay-1 { animation: fadeSlideUp 0.45s 0.25s both; }
  .sd-section.delay-2 { animation: fadeSlideUp 0.45s 0.35s both; }
  .sd-section.delay-3 { animation: fadeSlideUp 0.45s 0.45s both; }

  .sd-section-title {
    font-size: 11px; font-weight: 700; color: #0a2342;
    text-transform: uppercase; letter-spacing: 0.1em;
    margin-bottom: 14px; display: flex; align-items: center; gap: 8px;
  }
  .sd-section-title::after {
    content: ''; flex: 1; height: 1px; background: #e2ecf8;
  }

  /* Criteria rows */
  .sd-criteria-row {
    display: flex; gap: 12px; align-items: flex-start;
    padding: 12px 0;
    border-bottom: 1px solid #f0f4ff;
    animation: rowIn 0.35s both;
  }
  .sd-criteria-row:last-child { border-bottom: none; padding-bottom: 0; }

  .sd-check {
    width: 24px; height: 24px; border-radius: 8px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; margin-top: 1px;
  }
  .sd-check.pass { background: #f0fff4; border: 1.5px solid #68d391; }
  .sd-check.fail { background: #fff5f5; border: 1.5px solid #fc8181; }

  .sd-criteria-label {
    font-size: 13.5px; font-weight: 600; margin-bottom: 3px;
  }
  .sd-criteria-label.pass { color: #276749; }
  .sd-criteria-label.fail { color: #9b2c2c; }
  .sd-criteria-msg { font-size: 12.5px; color: #718096; line-height: 1.5; }
  .sd-citation-pill {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; color: #1e6fcc; font-weight: 600;
    background: #eef4ff; border: 1px solid #c8d8f0;
    padding: 3px 10px; border-radius: 99px; margin-top: 6px;
  }

  /* Documents grid */
  .sd-docs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .sd-doc-item {
    display: flex; align-items: center; gap: 8px;
    background: #f5f8ff; border: 1px solid #d8e4f5;
    border-radius: 11px; padding: 10px 12px;
    font-size: 12.5px; color: #0a2342; font-weight: 500;
    transition: all 0.18s;
  }
  .sd-doc-item:hover { background: #eef4ff; border-color: #1e6fcc; }
  .sd-doc-tick {
    width: 18px; height: 18px; border-radius: 5px;
    background: #eef4ff; border: 1px solid #c8d8f0;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }

  /* Where to apply */
  .sd-apply {
    background: linear-gradient(135deg, #0a2342 0%, #1e4d8c 100%);
    border-radius: 18px; padding: 20px 22px;
    margin-bottom: 20px; color: #fff;
    animation: fadeSlideUp 0.45s 0.5s both;
    position: relative; overflow: hidden;
  }
  .sd-apply::after {
    content: ''; position: absolute; top: 0; left: -40%; width: 30%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
    animation: shimmerSlide 3s 1.5s ease-in-out infinite;
  }
  .sd-apply-title {
    font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: #f5a623; margin-bottom: 8px;
    display: flex; align-items: center; gap: 7px;
  }
  .sd-apply-text { font-size: 14px; color: rgba(255,255,255,0.9); line-height: 1.65; }
  .sd-apply-text strong { color: #ffd166; }

  /* Premium Action Buttons */
  .sd-btn-main {
    display: flex; align-items: center; justify-content: center; gap: 12px;
    width: 100%; border: none; border-radius: 16px; padding: 18px;
    font-family: inherit; font-size: 16px; font-weight: 800; cursor: pointer;
    transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
    margin-bottom: 12px;
    background: linear-gradient(90deg, #0a2342, #1e6fcc, #0a2342);
    background-size: 200% auto;
    color: #fff;
    box-shadow: 0 8px 24px rgba(10,35,66,0.35);
    animation: shimmerBtn 4s linear infinite;
  }
  .sd-btn-main:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.01);
    box-shadow: 0 12px 32px rgba(10,35,66,0.45);
    background-position: right center;
  }
  .sd-btn-main:active:not(:disabled) { transform: scale(0.98); }
  .sd-btn-main:disabled { opacity: 0.6; cursor: wait; }

  .sd-cta {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 15px; border-radius: 14px; cursor: pointer;
    font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 600;
    background: #fff; border: 1.5px solid #c8d8f0; color: #718096;
    transition: all 0.18s;
  }
  .sd-cta:hover { border-color: #1e6fcc; color: #1e6fcc; transform: translateY(-1px); }
`;

interface SchemeDetailProps {
  result: RAGResult | null;
  profile: FarmerProfile;
  onBack: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function SchemeDetailScreen({ result, profile, onBack }: SchemeDetailProps) {
  const { t } = useLanguage();
  const [downloading, setDownloading] = React.useState(false);

  if (!result) return null;

  const {
    scheme, eligible, proof = [], reasons = [], confidence,
    aiExplanation, retrievedSnippet, chunksUsed, topChunkScore,
  } = result;

  const allCriteria = [
    ...proof.map((p)   => ({ ...p, pass: true  })),
    ...reasons.map((r) => ({ ...r, pass: false })),
  ];

  const confClass = (c: string) =>
    c === "high" ? "sd-conf-high" : c === "medium" ? "sd-conf-medium" : "sd-conf-low";

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      // For now we map PM-KISAN schemes to our sample form
      const isPmKisan = scheme.name.toUpperCase().includes("PM-KISAN");
      const template = isPmKisan ? "/forms/pmkisan_form.pdf" : "/forms/pmkisan_form.pdf"; // Default to sample
      
      await fillAndDownloadPdf(template, profile, `${scheme.name}_Application.pdf`);
    } catch (err) {
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div className="sd-page">
        <Header showBack onBack={onBack} />

        <div className="sd-content">

          {/* Back */}
          <button className="sd-back" onClick={onBack}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {t('detail.backToResults')}
          </button>

          {/* ── Hero card ── */}
          <div className="sd-hero-card">
            <div className="sd-hero-top">
              <div className="sd-watermark" />
              <div className="sd-watermark-2" />

              {/* Eligible stamp */}
              <div className={`sd-stamp ${eligible ? "yes" : "no"}`}>
                {eligible ? "✓" : "✗"}
              </div>

              {/* Title */}
              <div className="sd-title-row" style={{ paddingRight: 64 }}>
                <div className="sd-scheme-icon"
                  style={{ background: scheme.light || "#eef4ff" }}>
                  {scheme.emoji || "📄"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                    <span className="sd-scheme-name">{scheme.name}</span>
                    {eligible !== null && <EligibilityTag eligible={eligible} size="lg" />}
                  </div>
                  <div className="sd-scheme-full">{scheme.fullName}</div>
                </div>
              </div>

              {/* Benefit pills */}
              <div className="sd-pills">
                {[
                  { key: "Benefit",   val: scheme.benefit,      color: scheme.color || "#1e6fcc" },
                  { key: "Structure", val: scheme.installments,  color: "#4a5568" },
                ].map((b) => b.val && (
                  <div key={b.key} className="sd-pill">
                    <div className="sd-pill-val" style={{ color: b.color }}>{b.val}</div>
                    <div className="sd-pill-key">{b.key}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Explanation */}
            <div className="sd-ai">
              <div className="sd-ai-header">
                <div className="sd-ai-avatar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm-1 14v-4H9l3-6 3 6h-2v4h-2z" />
                  </svg>
                </div>
                <span className="sd-ai-name">AI Advisor</span>
                {confidence && (
                  <span className={`sd-confidence ${confClass(confidence)}`}>
                    {confidence} confidence
                  </span>
                )}
                {chunksUsed !== undefined && chunksUsed > 0 && (
                  <span className="sd-chunks-info">
                    {chunksUsed} chunks{topChunkScore ? ` · ${(topChunkScore * 100).toFixed(0)}% match` : ""}
                  </span>
                )}
              </div>
              <p className="sd-ai-text">
                {aiExplanation || "No explanation available."}
              </p>
            </div>
          </div>

          {/* ── PDF Citation ── */}
          {retrievedSnippet && (
            <div className="sd-citation">
              <div className="sd-citation-header">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="#1e6fcc" strokeWidth="2.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                <span className="sd-citation-label">Retrieved from official PDF</span>
                <span className="sd-citation-badge">RAG Citation</span>
              </div>
              <p className="sd-citation-text">"{retrievedSnippet}"</p>
              <div className="sd-citation-source">— {scheme.ministry}</div>
            </div>
          )}

          {/* ── Eligibility breakdown ── */}
          {allCriteria.length > 0 && (
            <div className="sd-section delay-1">
              <div className="sd-section-title">
                <span>📋</span> {t('detail.criteriaStatus')}
              </div>
              {allCriteria.map((c, i) => (
                <div key={i} className="sd-criteria-row"
                  style={{ animationDelay: `${0.25 + i * 0.06}s` }}>
                  <div className={`sd-check ${c.pass ? "pass" : "fail"}`}>
                    {c.pass ? (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                        stroke="#38a169" strokeWidth="3" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                        stroke="#e53e3e" strokeWidth="3" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className={`sd-criteria-label ${c.pass ? "pass" : "fail"}`}>
                      {c.label}
                    </div>
                    <div className="sd-criteria-msg">{c.msg}</div>
                    {c.citation && (
                      <div className="sd-citation-pill">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2.5">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        {c.citation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Required documents ── */}
          {scheme.documents && scheme.documents.length > 0 && (
            <div className="sd-section delay-2">
              <div className="sd-section-title">
                <span>📑</span> {t('detail.requiredDocs')}
              </div>
              <div className="sd-docs-grid">
                {scheme.documents.map((doc, i) => (
                  <div key={i} className="sd-doc-item">
                    <div className="sd-doc-tick">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                        stroke="#1e6fcc" strokeWidth="3" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    {doc}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Where to apply ── */}
          <div className="sd-apply">
            <div className="sd-apply-title">
              <span>🏛️</span> {t('detail.applyAt')}
            </div>
            <div className="sd-apply-text">
              Visit your nearest CSC centre, bank branch, or apply directly at{" "}
              <strong>{scheme.applyAt || "official scheme portal"}</strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="sd-section delay-3" style={{ border: 'none', background: 'transparent', padding: 0 }}>
            <button className="sd-btn-main" onClick={handleDownload} disabled={downloading}>
              {downloading ? (
                <>
                  <Spinner size={18} />
                  {t('detail.generating')}
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  {t('detail.downloadApp')}
                </>
              )}
            </button>

            <button className="sd-cta" onClick={onBack}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              {t('detail.backToResults')}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
