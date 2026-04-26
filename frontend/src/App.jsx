import { useState, useRef } from 'react'

// ─────────────────────────────────────────────────────────
// Category configuration — color identity for each class
// ─────────────────────────────────────────────────────────
const CATEGORY_CONFIG = {
  World: {
    color: '#f59e0b',       // amber
    glow: 'rgba(245,158,11,0.35)',
    barColor: '#f59e0b',
    emoji: '🌍',
  },
  Sports: {
    color: '#f43f5e',       // rose
    glow: 'rgba(244,63,94,0.35)',
    barColor: '#f43f5e',
    emoji: '🏆',
  },
  Business: {
    color: '#a855f7',       // purple
    glow: 'rgba(168,85,247,0.35)',
    barColor: '#a855f7',
    emoji: '📈',
  },
  Tech: {
    color: '#06b6d4',       // cyan
    glow: 'rgba(6,182,212,0.35)',
    barColor: '#06b6d4',
    emoji: '⚡',
  },
}

// ─────────────────────────────────────────────────────────
// Mock API call — replace with real fetch() when backend ready
// POST /predict → { category, confidence, insight }
// ─────────────────────────────────────────────────────────
const MOCK_RESPONSES = {
  world: {
    category: 'World',
    confidence: 94.2,
    insight:
      'Geopolitical shifts in this region could reshape alliances and trigger diplomatic recalibrations across neighboring states. Investors should monitor sovereign bond spreads and currency volatility as a leading indicator of instability risk over the next quarter.',
  },
  sports: {
    category: 'Sports',
    confidence: 97.8,
    insight:
      'This outcome signals strong brand equity for the winning franchise, with projected merchandise and media rights revenues likely to surge. Sponsors may leverage this momentum through multi-cycle deals, making this a compelling case study in sports finance.',
  },
  business: {
    category: 'Business',
    confidence: 96.1,
    insight:
      'This development indicates a strategic pivot in capital allocation that could compress margins short-term but unlock significant enterprise value long-term. Analysts should reassess earnings-per-share estimates in light of this structural shift.',
  },
  tech: {
    category: 'Tech',
    confidence: 98.5,
    insight:
      'The acceleration of this technology stack signals a competitive moat expansion for early adopters. Firms that delay integration risk a 12–18 month structural disadvantage; meanwhile, semiconductor and infrastructure plays stand to benefit most from the demand surge.',
  },
}

function pickMockResponse(text) {
  const lower = text.toLowerCase()
  if (/sport|game|cricket|football|nba|match|player|cup|olympic/i.test(lower)) return MOCK_RESPONSES.sports
  if (/stock|market|revenue|profit|invest|fund|bank|gdp|ceo|merger|ipo/i.test(lower)) return MOCK_RESPONSES.business
  if (/ai|tech|chip|software|silicon|robot|apple|google|cloud|compute|gpu|model/i.test(lower)) return MOCK_RESPONSES.tech
  return MOCK_RESPONSES.world
}

async function analyzeHeadline(text) {
  // ── Swap this block for real API call: ──────────────────
  // const res = await fetch('/predict', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ text }),
  // })
  // return res.json()
  // ────────────────────────────────────────────────────────
  return new Promise((resolve) => {
    setTimeout(() => resolve(pickMockResponse(text)), 2200)
  })
}

// ─────────────────────────────────────────────────────────
// Sample headlines for quick testing
// ─────────────────────────────────────────────────────────
const SAMPLES = [
  'Tesla launches new AI chip for self-driving cars',
  'Federal Reserve raises interest rates by 0.5%',
  'India wins cricket World Cup in a thrilling final',
  'UN Security Council meets over rising tensions',
  'Apple acquires AI startup for $2 billion',
  'NASA discovers water on the surface of Mars',
]

// ─────────────────────────────────────────────────────────
// Loading animation text
// ─────────────────────────────────────────────────────────
function LoadingText() {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      Analyzing
      <span className="pulse-dot">.</span>
      <span className="pulse-dot">.</span>
      <span className="pulse-dot">.</span>
    </span>
  )
}

// ─────────────────────────────────────────────────────────
// Confidence bar component
// ─────────────────────────────────────────────────────────
function ConfidenceBar({ value, color }) {
  return (
    <div className="confidence-bar-track">
      <div
        className="confidence-bar-fill"
        style={{ width: `${value}%`, background: color }}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────────────────
export default function App() {
  const [headline, setHeadline] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | result
  const [result, setResult] = useState(null)
  const [analyzedText, setAnalyzedText] = useState('')
  const textareaRef = useRef(null)

  const MAX_CHARS = 280

  const canSubmit = headline.trim().length > 5 && headline.length <= MAX_CHARS && status !== 'loading'

  async function handleAnalyze() {
    if (!canSubmit) return
    const text = headline.trim()
    setStatus('loading')
    setResult(null)
    try {
      const data = await analyzeHeadline(text)
      setAnalyzedText(text)
      setResult(data)
      setStatus('result')
    } catch (err) {
      console.error(err)
      setStatus('idle')
    }
  }

  function handleReset() {
    setStatus('idle')
    setResult(null)
    setHeadline('')
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

  function handleSampleClick(sample) {
    setHeadline(sample)
    setStatus('idle')
    setResult(null)
    textareaRef.current?.focus()
  }

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleAnalyze()
    }
  }

  const catConfig = result ? CATEGORY_CONFIG[result.category] : null

  return (
    <>
      {/* Animated background */}
      <div className="bg-mesh">
        <div className="bg-orb" />
      </div>
      <div className="bg-grid" />

      <div className="app-wrapper">
        {/* ── Hero ──────────────────────────────────────── */}
        <section className="hero">
          <div className="logo-row">
            <div className="logo-icon">🧠</div>
            <span className="logo-wordmark">News-Insight AI</span>
          </div>

          <h1>
            Intelligence from<br />
            <span>every headline</span>
          </h1>

          <p className="hero-sub">
            Powered by a fine-tuned BERT classifier and a generative LLM.
            Drop any news headline — get the category, confidence score, and
            a synthesized business insight in seconds.
          </p>

          <div className="hero-pills">
            {['BERT Fine-tuned', 'AG News Dataset', '4 Categories', 'AI Insights'].map(t => (
              <span key={t} className="hero-pill">{t}</span>
            ))}
          </div>
        </section>

        {/* ── Main card ─────────────────────────────────── */}
        <div className="main-card">

          {/* Input zone — always visible */}
          {status !== 'result' && (
            <>
              <label className="input-label" htmlFor="headline-input">
                News Headline
              </label>
              <div className="input-wrapper">
                <textarea
                  id="headline-input"
                  ref={textareaRef}
                  className="headline-input"
                  placeholder="e.g. Tesla launches new AI chip for self-driving cars..."
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  onKeyDown={handleKeyDown}
                  maxLength={MAX_CHARS}
                  rows={3}
                  autoFocus
                />
                <span className="char-count">
                  {headline.length}/{MAX_CHARS}
                </span>
              </div>

              <button
                id="btn-analyze"
                className="btn-analyze"
                onClick={handleAnalyze}
                disabled={!canSubmit}
              >
                {status === 'loading' ? (
                  <>
                    <div className="spinner" />
                    <LoadingText />
                  </>
                ) : (
                  <>
                    <span>🔍</span>
                    Analyze Headline
                    <span style={{ marginLeft: 'auto', fontSize: '0.72rem', opacity: 0.5 }}>
                      ⌘↵
                    </span>
                  </>
                )}
              </button>
            </>
          )}

          {/* ── Results ─────────────────────────────────── */}
          {status === 'result' && result && catConfig && (
            <div className="results-container">
              <p className="results-header">✦ Analysis Complete</p>

              {/* Analyzed headline echo */}
              <div className="analyzed-headline">
                <span>Analyzed headline</span>
                "{analyzedText}"
              </div>

              {/* Category + Confidence row */}
              <div className="results-top">
                {/* Category */}
                <div
                  className="glass-card"
                  style={{
                    borderColor: `${catConfig.color}30`,
                    boxShadow: `0 0 24px ${catConfig.glow}`,
                  }}
                >
                  <div className="card-label">Category</div>
                  <div className="category-badge-wrap">
                    <div
                      className="category-dot"
                      style={{
                        background: catConfig.color,
                        boxShadow: `0 0 8px ${catConfig.glow}`,
                      }}
                    />
                    <span className="category-name" style={{ color: catConfig.color }}>
                      {catConfig.emoji} {result.category}
                    </span>
                  </div>
                </div>

                {/* Confidence */}
                <div className="glass-card">
                  <div className="card-label">Confidence Score</div>
                  <div className="confidence-display">
                    <span className="confidence-number">
                      {result.confidence}%
                    </span>
                    <ConfidenceBar value={result.confidence} color={catConfig.barColor} />
                  </div>
                </div>
              </div>

              {/* Insight card */}
              <div className="insight-card">
                <div className="insight-top-row">
                  <div className="insight-icon">💡</div>
                  <span className="insight-title">Business Intelligence</span>
                </div>
                <p className="insight-text">{result.insight}</p>
                <div className="insight-footer">
                  <div className="insight-footer-dot" />
                  Generated by your distilgpt2 LLM pipeline
                </div>
              </div>

              {/* Reset */}
              <button id="btn-analyze-another" className="btn-reset" onClick={handleReset}>
                ↩ Analyze another headline
              </button>
            </div>
          )}
        </div>

        {/* ── Sample headlines ────────────────────────────── */}
        {status !== 'loading' && (
          <div className="samples-section">
            <p className="samples-label">Try a sample headline</p>
            <div className="samples-grid">
              {SAMPLES.map((s) => (
                <button
                  key={s}
                  className="sample-chip"
                  onClick={() => handleSampleClick(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Footer ──────────────────────────────────────── */}
        <footer className="app-footer">
          <p>
            News-Insight AI &nbsp;·&nbsp; BERT (bert-base-uncased) fine-tuned on AG News
            &nbsp;·&nbsp; Insights via distilgpt2
          </p>
          <p style={{ marginTop: '0.35rem' }}>
            Press <kbd style={{ opacity: 0.6, fontSize: '0.7rem' }}>⌘ + Enter</kbd> to analyze quickly
          </p>
        </footer>
      </div>
    </>
  )
}
