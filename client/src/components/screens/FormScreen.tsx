// src/components/screens/FormScreen.tsx
// Step-by-step guided form — one question at a time with progress.
// Govt-official blue / white / gold theme.

import React, { useEffect, useState } from "react";
import { Header }            from "../layout/Header";
import { ParticleBackground } from "../layout/ParticleBackground";
import { FIELDS }            from "../../data/fields";
import { useLanguage }       from "../../i18n/LanguageContext";
import type { FarmerProfile } from "../../types";

// ─── Keyframes ────────────────────────────────────────────────────────────────
const KEYFRAMES = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Poppins', sans-serif; background: #f0f4ff; }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideRight {
    from { opacity: 0; transform: translateX(-16px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideLeft {
    from { opacity: 0; transform: translateX(16px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes progressFill {
    from { width: 0%; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes pulseRing {
    0%   { box-shadow: 0 0 0 0 rgba(30,111,204,0.35); }
    70%  { box-shadow: 0 0 0 8px rgba(30,111,204,0); }
    100% { box-shadow: 0 0 0 0 rgba(30,111,204,0); }
  }
  @keyframes errorShake {
    0%,100% { transform: translateX(0); }
    20%      { transform: translateX(-6px); }
    40%      { transform: translateX(6px); }
    60%      { transform: translateX(-4px); }
    80%      { transform: translateX(4px); }
  }
  @keyframes dotPop {
    0%   { transform: scale(0.6); opacity: 0.3; }
    60%  { transform: scale(1.5); }
    100% { transform: scale(1.3); opacity: 1; }
  }
  @keyframes shimmerSlide {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(300%); }
  }

  /* Page wrapper */
  .fs-page {
    min-height: 100vh;
    background: linear-gradient(160deg, #e8eeff 0%, #f5f7ff 45%, #eef2ff 100%);
  }
  .fs-content {
    max-width: 480px;
    margin: 0 auto;
    padding: 28px 18px 56px;
    position: relative; z-index: 1;
  }

  /* ── Progress section ── */
  .fs-progress { margin-bottom: 28px; animation: slideUp 0.45s both; }
  .fs-progress-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 10px;
  }
  .fs-progress-label { font-size: 12.5px; color: #6b7ea8; font-weight: 500; }
  .fs-progress-pct {
    font-size: 13px; font-weight: 700; color: #1e6fcc;
    background: #eef4ff; padding: 3px 10px; border-radius: 99px;
    border: 1px solid #c8d8f0;
  }

  .fs-progress-track {
    height: 5px; background: #d8e4f5; border-radius: 3px;
    overflow: hidden; margin-bottom: 14px;
    box-shadow: inset 0 1px 3px rgba(10,35,66,0.1);
  }
  .fs-progress-fill {
    height: 100%; border-radius: 3px;
    background: linear-gradient(90deg, #0a2342, #1e6fcc, #60a5fa);
    background-size: 200% 100%;
    animation: progressFill 0.5s ease, shimmerSlide 2s 0.6s linear infinite;
    transition: width 0.4s cubic-bezier(0.4,0,0.2,1);
    position: relative; overflow: hidden;
  }

  /* Stepper dots */
  .fs-dots {
    display: flex; gap: 6px; justify-content: center; flex-wrap: wrap;
  }
  .fs-dot {
    height: 4px; border-radius: 2px;
    transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
    cursor: default;
  }
  .fs-dot.done    { background: #1e6fcc; width: 8px; }
  .fs-dot.active  { background: #f5a623; width: 20px; animation: pulseRing 1.8s ease-out infinite; }
  .fs-dot.pending { background: #d0ddef; width: 8px; }

  /* ── Question card ── */
  .fs-card {
    background: #fff;
    border: 1px solid #c8d8f0;
    border-radius: 22px;
    padding: 32px 28px;
    margin-bottom: 18px;
    box-shadow: 0 8px 32px rgba(10,35,66,0.09), 0 2px 8px rgba(10,35,66,0.05);
    position: relative; overflow: hidden;
  }
  .fs-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
    background: linear-gradient(90deg, #0a2342 0%, #1e6fcc 50%, #f5a623 100%);
  }

  .fs-q-num {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 700; color: #1e6fcc;
    text-transform: uppercase; letter-spacing: 0.1em;
    background: #eef4ff; border: 1px solid #c8d8f0;
    border-radius: 99px; padding: 4px 12px;
    margin-bottom: 16px;
  }
  .fs-q-icon {
    width: 52px; height: 52px; border-radius: 14px;
    background: linear-gradient(135deg, #eef4ff, #d8e9ff);
    border: 1px solid #c8d8f0;
    display: flex; align-items: center; justify-content: center;
    font-size: 26px; margin-bottom: 14px;
    box-shadow: 0 2px 8px rgba(30,111,204,0.1);
  }
  .fs-q-label {
    font-size: 17px; font-weight: 600; color: #0a2342;
    line-height: 1.5; margin-bottom: 22px;
  }

  /* Input */
  .fs-input-wrap { position: relative; }
  .fs-input {
    width: 100%; padding: 14px 16px;
    font-family: 'Poppins', sans-serif; font-size: 15px;
    color: #0a2342; background: #f5f8ff;
    border: 1.5px solid #c8d8f0; border-radius: 12px;
    outline: none; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    appearance: none;
  }
  .fs-input:focus {
    border-color: #1e6fcc;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(30,111,204,0.12);
  }
  .fs-input::placeholder { color: #a0aec0; }
  .fs-input-unit {
    position: absolute; right: 14px; top: 50%;
    transform: translateY(-50%);
    font-size: 13px; color: #718096; pointer-events: none;
    font-weight: 500;
  }

  /* Boolean buttons */
  .fs-bool { display: flex; gap: 10px; }
  .fs-bool-btn {
    flex: 1; padding: 14px; border-radius: 13px; cursor: pointer;
    font-family: 'Poppins', sans-serif; font-size: 15px; font-weight: 600;
    border: 2px solid #d0ddef; background: #f5f8ff;
    color: #4a5568; transition: all 0.18s ease;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .fs-bool-btn:hover { border-color: #1e6fcc; background: #eef4ff; color: #1e6fcc; }
  .fs-bool-btn.yes {
    background: linear-gradient(135deg, #0a2342, #1e6fcc);
    border-color: #1e6fcc; color: #fff;
    box-shadow: 0 4px 14px rgba(30,111,204,0.3);
  }
  .fs-bool-btn.no {
    background: linear-gradient(135deg, #7f1d1d, #dc2626);
    border-color: #dc2626; color: #fff;
    box-shadow: 0 4px 14px rgba(220,38,38,0.25);
  }

  /* ── Error ── */
  .fs-error {
    background: #fff5f5; border: 1px solid #fca5a5;
    border-radius: 12px; padding: 12px 16px;
    font-size: 13px; color: #9b2c2c;
    margin-bottom: 16px; display: flex; align-items: flex-start; gap: 8px;
    animation: errorShake 0.4s ease;
  }

  /* ── Navigation ── */
  .fs-nav { display: flex; gap: 10px; }

  .fs-btn-back {
    padding: 14px 20px; border-radius: 13px; cursor: pointer;
    font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 600;
    background: #fff; border: 1.5px solid #c8d8f0; color: #0a2342;
    display: flex; align-items: center; gap: 6px;
    transition: all 0.18s; white-space: nowrap;
  }
  .fs-btn-back:hover { border-color: #1e6fcc; color: #1e6fcc; background: #eef4ff; }

  .fs-btn-next {
    flex: 1; padding: 14px 20px; border-radius: 13px; cursor: pointer;
    font-family: 'Poppins', sans-serif; font-size: 15px; font-weight: 700;
    background: linear-gradient(135deg, #0a2342, #1e6fcc);
    border: none; color: #fff;
    box-shadow: 0 6px 20px rgba(10,35,66,0.3);
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.18s; position: relative; overflow: hidden;
  }
  .fs-btn-next:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(10,35,66,0.38);
  }
  .fs-btn-next:disabled {
    opacity: 0.45; cursor: not-allowed; transform: none;
  }
  .fs-btn-next.last {
    background: linear-gradient(135deg, #b45309, #f59e0b);
    box-shadow: 0 6px 20px rgba(245,158,11,0.35);
  }
  .fs-btn-next.last:hover:not(:disabled) {
    box-shadow: 0 10px 28px rgba(245,158,11,0.5);
  }

  .fs-skip {
    text-align: center; margin-top: 10px;
  }
  .fs-skip-btn {
    background: none; border: none; cursor: pointer;
    font-family: 'Poppins', sans-serif; font-size: 12.5px;
    color: #718096; text-decoration: underline;
    padding: 6px 12px; border-radius: 8px;
    transition: color 0.18s;
  }
  .fs-skip-btn:hover { color: #1e6fcc; }

  /* ── Spinner ── */
  .fs-spinner {
    width: 16px; height: 16px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.35);
    border-top-color: #fff;
    animation: spin 0.7s linear infinite; flex-shrink: 0;
  }

  /* ── Completion hint ── */
  .fs-hint {
    text-align: center; font-size: 12px; color: #a0aec0;
    margin-top: 20px; letter-spacing: 0.03em;
  }
  .fs-hint span { color: #1e6fcc; font-weight: 600; }
`;

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface FormScreenProps {
  formData: FarmerProfile;
  setFormData: React.Dispatch<React.SetStateAction<FarmerProfile>>;
  formStep: number;
  setFormStep: React.Dispatch<React.SetStateAction<number>>;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
  error?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function FormScreen({
  formData, setFormData, formStep, setFormStep,
  onSubmit, onBack, loading, error,
}: FormScreenProps) {
  const { t } = useLanguage();
  const total    = FIELDS.length;
  const field    = FIELDS[formStep];
  const isLast   = formStep === total - 1;
  const progress = Math.round(((formStep + 1) / total) * 100);
  const [dir, setDir] = useState<"left"|"right">("right"); // animation direction

  const canNext =
    field &&
    (field.type === "boolean"
      ? formData[field.key] !== undefined
      : formData[field.key] !== undefined && formData[field.key] !== "");

  const go = (delta: number) => {
    setDir(delta > 0 ? "left" : "right");
    if (delta > 0 && isLast) { onSubmit(); return; }
    if (delta > 0) setFormStep((s) => s + 1);
    else           setFormStep((s) => s - 1);
  };

  const setValue = (val: string | number | boolean) =>
    setFormData((prev) => ({ ...prev, [field.key]: val }));

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && canNext && !loading) go(1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [canNext, loading, formStep]);

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div className="fs-page">
        <ParticleBackground />
        <Header showBack onBack={onBack} />

        <div className="fs-content">

          {/* ── Progress ── */}
          <div className="fs-progress">
            <div className="fs-progress-header">
              <span className="fs-progress-label">
                {t('form.progress', { current: formStep + 1, total })}
              </span>
              <span className="fs-progress-pct">{progress}%</span>
            </div>

            <div className="fs-progress-track">
              <div className="fs-progress-fill" style={{ width: `${progress}%` }} />
            </div>

            <div className="fs-dots">
              {FIELDS.map((_, i) => (
                <div key={i} className={
                  `fs-dot ${i < formStep ? "done" : i === formStep ? "active" : "pending"}`
                } />
              ))}
            </div>
          </div>

          {/* ── Question card ── */}
          <div
            key={formStep}
            className="fs-card"
            style={{ animation: `${dir === "left" ? "slideLeft" : "slideRight"} 0.35s cubic-bezier(0.4,0,0.2,1) both` }}
          >
            {/* Question number pill */}
            <div className="fs-q-num">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {t('form.step', { current: formStep + 1 })}
            </div>

            {/* Icon */}
            <div className="fs-q-icon">{field.icon}</div>

            {/* Label */}
            <label className="fs-q-label">{t(`form.fields.${field.key}.label`)}</label>

            {/* Input */}
            {field.type === "boolean" ? (
              <div className="fs-bool">
                <button
                  className={`fs-bool-btn ${formData[field.key] === true ? "yes" : ""}`}
                  onClick={() => setValue(true)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {t('common.yes')}
                </button>
                <button
                  className={`fs-bool-btn ${formData[field.key] === false ? "no" : ""}`}
                  onClick={() => setValue(false)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  {t('common.no')}
                </button>
              </div>
            ) : (
              <div className="fs-input-wrap">
                {field.unit && (
                  <span className="fs-input-unit">{t(`form.fields.${field.key}.unit`)}</span>
                )}
                <input
                  className="fs-input"
                  type={field.type}
                  placeholder={t(`form.fields.${field.key}.placeholder`)}
                  value={(formData[field.key] as string | number) ?? ""}
                  style={{ paddingRight: field.unit ? "52px" : "16px" }}
                  autoFocus
                  onChange={(e) =>
                    setValue(field.type === "number"
                      ? parseFloat(e.target.value)
                      : e.target.value)
                  }
                />
              </div>
            )}
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="fs-error" key={error}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="#e53e3e" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {/* ── Navigation ── */}
          <div className="fs-nav">
            {formStep > 0 && (
              <button className="fs-btn-back" onClick={() => go(-1)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                {t('common.back')}
              </button>
            )}
            <button
              className={`fs-btn-next ${isLast ? "last" : ""}`}
              disabled={!canNext || loading}
              onClick={() => go(1)}
            >
              {loading ? (
                <>
                  <div className="fs-spinner" />
                  {t('form.checking')}
                </>
              ) : isLast ? (
                <>
                  {t('form.finish')}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </>
              ) : (
                <>
                  Next
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>

          {/* Skip */}
          <div className="fs-skip">
            <button
              className="fs-skip-btn"
              onClick={() => isLast ? onSubmit() : go(1)}
            >
              Skip this question
            </button>
          </div>

          {/* Bottom hint */}
          <div className="fs-hint">
            Press <span>Enter ↵</span> to continue · All data stays on your device
          </div>
        </div>
      </div>
    </>
  );
}
