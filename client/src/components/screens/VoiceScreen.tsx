// src/components/screens/VoiceScreen.tsx
// Lets users speak or type their farmer profile.
// Govt-official blue / white / gold theme. Updated for TypeScript & i18n.

import React from "react";
import { Header }            from "../layout/Header";
import { ParticleBackground } from "../layout/ParticleBackground";
import { Spinner }           from "../ui";
import { useVoice, VOICE_ERRORS } from "../../hooks/useVoice";
import { VOICE_CHIPS, VOICE_EXAMPLE, DETECTED_FIELDS } from "../../data/fields";
import { parseVoice }        from "../../utils/parseVoice";
import { useLanguage }       from "../../i18n/LanguageContext";

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface VoiceScreenProps {
  transcript: string;
  setTranscript: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: () => void;
  onBack: () => void;
  onGoForm: () => void;
  loading: boolean;
  error?: string; // Analysis/RAG error
}

// ─── Keyframes ────────────────────────────────────────────────────────────────
const KEYFRAMES = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Poppins', sans-serif; background: #f0f4ff; }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes micPulse {
    0%,100% { box-shadow: 0 0 0 0   rgba(30,111,204,0.5); }
    50%      { box-shadow: 0 0 0 16px rgba(30,111,204,0);  }
  }
  @keyframes listeningPulse {
    0%,100% { box-shadow: 0 0 0 0   rgba(220,38,38,0.5); }
    50%      { box-shadow: 0 0 0 16px rgba(220,38,38,0);  }
  }
  @keyframes ringExpand {
    0%   { transform: translate(-50%,-50%) scale(0.9); opacity: 0.6; }
    100% { transform: translate(-50%,-50%) scale(2.2); opacity: 0; }
  }
  @keyframes waveBar {
    0%,100% { transform: scaleY(0.3); }
    50%      { transform: scaleY(1);   }
  }
  @keyframes shimmerSlide {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(300%);  }
  }
  @keyframes chipIn {
    from { opacity: 0; transform: scale(0.85); }
    to   { opacity: 1; transform: scale(1);    }
  }
  @keyframes detectedSlide {
    from { opacity: 0; transform: translateX(-10px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* ── Page ── */
  .vs-page {
    min-height: 100vh;
    background: linear-gradient(160deg, #e8eeff 0%, #f5f7ff 45%, #eef2ff 100%);
  }
  .vs-content {
    max-width: 560px; margin: 0 auto;
    padding: 24px 18px 60px; position: relative; z-index: 1;
  }

  .vs-hero { text-align: center; margin-bottom: 26px; animation: fadeSlideUp 0.45s 0.05s both; }
  .vs-hero-badge {
    display: inline-flex; align-items: center; gap: 7px;
    background: linear-gradient(90deg,#0a2342,#1e4d8c);
    color: #fff; border-radius: 999px; padding: 6px 16px;
    font-size: 11.5px; font-weight: 600; letter-spacing: 0.05em;
    margin-bottom: 14px; box-shadow: 0 4px 16px rgba(10,35,66,0.25);
  }
  .vs-hero h2 { font-size: 32px; font-weight: 800; color: #0a2342; line-height: 1.2; margin-bottom: 8px; }
  .vs-hero h2 .gold { color: #e08a00; }
  .vs-hero p { font-size: 14px; color: #4a5568; line-height: 1.7; }

  .vs-mic-card {
    background: #fff; border: 1.5px solid #c8d8f0;
    border-radius: 22px; padding: 32px 24px 26px;
    text-align: center; margin-bottom: 16px;
    box-shadow: 0 8px 32px rgba(10,35,66,0.09);
    position: relative; overflow: hidden;
    animation: fadeSlideUp 0.45s 0.1s both;
  }
  .vs-mic-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
    background: linear-gradient(90deg, #0a2342 0%, #1e6fcc 50%, #f5a623 100%);
  }

  .vs-mic-wrap { position: relative; width: 110px; height: 110px; margin: 0 auto 22px; }
  .vs-ring {
    position: absolute; width: 110px; height: 110px;
    border-radius: 50%; left: 50%; top: 50%;
    border: 2px solid rgba(30,111,204,0.35);
    animation: ringExpand 1.8s ease-out infinite;
  }
  .vs-ring.red { border-color: rgba(220,38,38,0.4); }

  .vs-mic-btn {
    width: 110px; height: 110px; border-radius: 50%; border: none;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    position: relative; z-index: 1; transition: transform 0.2s ease;
  }
  .vs-mic-btn.idle {
    background: linear-gradient(135deg, #0a2342, #1e6fcc);
    box-shadow: 0 8px 28px rgba(10,35,66,0.4);
    animation: micPulse 2.5s ease-in-out infinite;
  }
  .vs-mic-btn.active {
    background: linear-gradient(135deg, #9b2c2c, #e53e3e);
    box-shadow: 0 8px 28px rgba(220,38,38,0.45);
    animation: listeningPulse 1.2s ease-in-out infinite;
  }

  .vs-listening-label { font-size: 15px; font-weight: 700; color: #e53e3e; margin-bottom: 14px; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .vs-listening-dot { width: 8px; height: 8px; border-radius: 50%; background: #e53e3e; animation: listeningPulse 1s ease-in-out infinite; }
  .vs-idle-label { font-size: 13.5px; color: #718096; }

  .vs-waveform { display: flex; align-items: center; justify-content: center; gap: 4px; height: 36px; margin-bottom: 8px; }
  .vs-wave-bar { width: 4px; border-radius: 2px; background: linear-gradient(180deg, #1e6fcc, #60a5fa); transform-origin: bottom; }

  .vs-live-transcript {
    font-size: 13px; color: #4a5568; font-style: italic; line-height: 1.6;
    margin-top: 10px; padding: 10px 14px; background: #f5f8ff;
    border-radius: 10px; border: 1px solid #d8e4f5; text-align: left; min-height: 42px;
  }

  .vs-error { margin-top: 14px; border-radius: 12px; padding: 12px 14px; font-size: 13px; text-align: left; }
  .vs-error.warn { background: #fffbeb; border: 1px solid #f6ad55; color: #744210; }
  .vs-error.err  { background: #fff5f5; border: 1px solid #fc8181; color: #9b2c2c; }
  .vs-retry { background: none; border: none; cursor: pointer; font-weight: 700; font-size: 13px; color: #9b2c2c; margin-left: 8px; text-decoration: underline; font-family: 'Poppins', sans-serif; }

  .vs-divider { display: flex; align-items: center; gap: 12px; margin: 18px 0; animation: fadeSlideUp 0.4s 0.2s both; }
  .vs-divider::before, .vs-divider::after { content: ''; flex: 1; height: 1px; background: #d8e4f5; }
  .vs-divider span { font-size: 12px; color: #a0aec0; font-weight: 500; padding: 4px 12px; background: #fff; border: 1px solid #e2ecf8; border-radius: 99px; }

  .vs-text-card { background: #fff; border: 1.5px solid #c8d8f0; border-radius: 18px; padding: 18px 20px; margin-bottom: 14px; animation: fadeSlideUp 0.45s 0.25s both; }
  .vs-text-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
  .vs-text-label { font-size: 13px; font-weight: 700; color: #0a2342; }
  .vs-clear-btn { background: none; border: none; cursor: pointer; font-size: 12px; color: #718096; padding: 3px 8px; border-radius: 7px; }
  .vs-clear-btn:hover { background: #fff5f5; color: #e53e3e; }

  .vs-textarea { width: 100%; padding: 12px 14px; resize: none; line-height: 1.75; font-family: 'Poppins', sans-serif; font-size: 14px; color: #0a2342; background: #f5f8ff; border: 1.5px solid #d8e4f5; border-radius: 12px; outline: none; transition: all 0.2s; }
  .vs-textarea:focus { border-color: #1e6fcc; background: #fff; box-shadow: 0 0 0 3px rgba(30,111,204,0.1); }
  .vs-char-count { text-align: right; font-size: 11px; color: #a0aec0; margin-top: 6px; }

  .vs-chips-wrap { margin-bottom: 16px; animation: fadeSlideUp 0.45s 0.3s both; }
  .vs-chips-label { font-size: 11px; font-weight: 700; color: #718096; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 9px; }
  .vs-chips { display: flex; flex-wrap: wrap; gap: 7px; }
  .vs-chip { padding: 7px 13px; border-radius: 99px; cursor: pointer; font-family: 'Poppins', sans-serif; font-size: 12.5px; font-weight: 600; background: #fff; border: 1.5px solid #c8d8f0; color: #1e6fcc; transition: all 0.15s; animation: chipIn 0.3s both; }
  .vs-chip:hover { background: #eef4ff; border-color: #1e6fcc; transform: translateY(-1px); }
  .vs-chip-example { padding: 7px 13px; border-radius: 99px; cursor: pointer; font-family: 'Poppins', sans-serif; font-size: 12.5px; font-weight: 600; background: #fffbeb; border: 1.5px solid #f6ad55; color: #744210; }

  .vs-detected { background: #fff; border: 1.5px solid #68d391; border-radius: 18px; padding: 16px 18px; margin-bottom: 18px; animation: fadeSlideUp 0.4s both; }
  .vs-detected-header { display: flex; align-items: center; gap: 8px; margin-bottom: 13px; }
  .vs-detected-label { font-size: 12px; font-weight: 700; color: #276749; text-transform: uppercase; letter-spacing: 0.08em; }
  .vs-detected-count { margin-left: auto; font-size: 11px; font-weight: 700; color: #276749; background: #f0fff4; border: 1px solid #68d391; padding: 2px 10px; border-radius: 99px; }
  .vs-detected-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
  .vs-detected-item { display: flex; align-items: center; gap: 8px; background: #f0fff4; border: 1px solid #c6f6d5; border-radius: 10px; padding: 8px 10px; animation: detectedSlide 0.3s both; }
  .vs-detected-tick { width: 18px; height: 18px; border-radius: 50%; background: #38a169; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .vs-detected-key  { font-size: 10px; color: #718096; }
  .vs-detected-val  { font-size: 12.5px; font-weight: 700; color: #276749; }

  .vs-submit { width: 100%; padding: 15px; border-radius: 14px; cursor: pointer; font-family: 'Poppins', sans-serif; font-size: 15px; font-weight: 700; background: linear-gradient(135deg, #b45309, #f59e0b); border: none; color: #fff; box-shadow: 0 6px 22px rgba(245,158,11,0.38); display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.18s; animation: fadeSlideUp 0.45s 0.45s both; position: relative; overflow: hidden; }
  .vs-submit:disabled { opacity: 0.45; cursor: not-allowed; }
  .vs-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(245,158,11,0.5); }

  .vs-form-btn { background: none; border: none; cursor: pointer; font-family: 'Poppins', sans-serif; font-size: 13px; color: #718096; text-decoration: underline; margin-top: 12px; width: 100%; transition: color 0.18s; }
  .vs-form-btn:hover { color: #1e6fcc; }

  .vs-spinner { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.35); border-top-color: #fff; animation: spin 0.7s linear infinite; }
`;

// ─── Sub-Components ───────────────────────────────────────────────────────────
function Waveform() {
  const BARS = 18;
  const heights = [18, 28, 36, 30, 20, 32, 38, 26, 18, 32, 38, 28, 20, 32, 24, 36, 22, 18];
  return (
    <div className="vs-waveform">
      {Array.from({ length: BARS }).map((_, i) => (
        <div
          key={i}
          className="vs-wave-bar"
          style={{
            height: heights[i],
            animation: `waveBar ${0.6 + (i % 3) * 0.18}s ${i * 0.08}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function VoiceScreen({
  transcript, setTranscript, onSubmit, onBack, onGoForm, loading, error
}: VoiceScreenProps) {
  const { t } = useLanguage();
  const { listening, voiceError, start, stop, clearError } = useVoice({
    onTranscriptChange: setTranscript,
  });

  const parsed        = transcript.length > 5 ? parseVoice(transcript) : {};
  const detectedCount = Object.keys(parsed).length;
  const canSubmit     = transcript.trim().length > 5 && !loading;

  // Localized error strings
  const err = voiceError ? VOICE_ERRORS[voiceError as keyof typeof VOICE_ERRORS] : null;

  const appendChip = (insert: string) =>
    setTranscript((t) => t + (t === "" || t.endsWith(" ") ? "" : " ") + insert);

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div className="vs-page">
        <ParticleBackground />
        <Header showBack onBack={onBack} />

        <div className="vs-content">
          {/* ── Hero ── */}
          <div className="vs-hero">
            <div className="vs-hero-badge">
              🎙️ {t('voice.badge')}
            </div>
            <h2>{t('voice.title_start')} <span className="gold">{t('voice.title_highlight')}</span></h2>
            <p>{t('voice.subtitle')}</p>
          </div>

          {/* ── Mic card ── */}
          <div className="vs-mic-card">
            <div className="vs-mic-wrap">
              {listening && [0,1,2].map(i => <div key={i} className="vs-ring red" style={{ animationDelay: `${i*0.6}s` }} />)}
              {!listening && [0,1].map(i => <div key={i} className="vs-ring" style={{ animationDelay: `${i*0.9}s` }} />)}

              <button
                className={`vs-mic-btn ${listening ? "active" : "idle"}`}
                onClick={listening ? stop : start}
              >
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  {listening ? (
                    <rect x="6" y="6" width="12" height="12" rx="2" fill="white" />
                  ) : (
                    <>
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8"  y1="23" x2="16" y2="23" />
                    </>
                  )}
                </svg>
              </button>
            </div>

            {listening ? (
              <>
                <div className="vs-listening-label">
                  <div className="vs-listening-dot" />
                  {t('voice.listening')}
                </div>
                <Waveform />
                {transcript && <div className="vs-live-transcript">{transcript}</div>}
              </>
            ) : (
              <div className="vs-idle-label">{t('voice.tap_mic')}</div>
            )}

            {voiceError && err && (
              <div className={`vs-error ${voiceError === 'no_support' ? 'warn' : 'err'}`}>
                <strong>{err.icon} {err.title}</strong> — {err.msg}
                {voiceError !== 'no_support' && <button className="vs-retry" onClick={clearError}>{t('common.retry')} →</button>}
              </div>
            )}

            {/* RAG Analysis Error */}
            {!voiceError && error && (
              <div className="vs-error err">
                <strong>⚠️ {t('common.error')}</strong> — {error}
              </div>
            )}
          </div>

          {/* ── Text Entry ── */}
          <div className="vs-divider"><span>{t('voice.or_type')}</span></div>
          <div className="vs-text-card">
            <div className="vs-text-header">
              <span className="vs-text-label">{t('voice.details')}</span>
              {transcript && <button className="vs-clear-btn" onClick={() => setTranscript("")}>{t('common.clear')} ✕</button>}
            </div>
            <textarea
              className="vs-textarea"
              value={transcript}
              rows={4}
              placeholder={t('voice.placeholder')}
              onChange={(e) => setTranscript(e.target.value)}
            />
            <div className="vs-char-count">{transcript.length} {t('voice.chars')}</div>
          </div>

          {/* ── Quick Chips ── */}
          <div className="vs-chips-wrap">
            <div className="vs-chips-label">{t('voice.quick_add')}</div>
            <div className="vs-chips">
              {VOICE_CHIPS.map((c, i) => (
                <button
                  key={c.label}
                  className="vs-chip"
                  style={{ animationDelay: `${0.3 + i * 0.05}s` }}
                  onClick={() => appendChip(c.insert)}
                >
                  + {c.label}
                </button>
              ))}
              <button className="vs-chip-example" onClick={() => setTranscript(VOICE_EXAMPLE)}>
                📋 {t('common.retry')}
              </button>
            </div>
          </div>

          {/* ── Detected panel ── */}
          {detectedCount > 0 && (
            <div className="vs-detected">
              <div className="vs-detected-header">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38a169" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="vs-detected-label">{t('voice.detected', { count: detectedCount })}</span>
                <span className="vs-detected-count">{detectedCount}</span>
              </div>
              <div className="vs-detected-grid">
                {DETECTED_FIELDS.filter(f => (parsed as any)[f.key] !== undefined).map((f, i) => (
                  <div key={f.key} className="vs-detected-item" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="vs-detected-tick">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                    <div>
                      <div className="vs-detected-key">{f.label}</div>
                      <div className="vs-detected-val">{f.fmt((parsed as any)[f.key])}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Submit ── */}
          <button className="vs-submit" onClick={onSubmit} disabled={!canSubmit}>
            {loading ? (
              <>
                <div className="vs-spinner" />
                {t('voice.analyzing')}
              </>
            ) : (
              <>
                {t('voice.submit')}
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>

          <button className="vs-form-btn" onClick={onGoForm}>
            {t('voice.guided_form')} →
          </button>
        </div>
      </div>
    </>
  );
}
