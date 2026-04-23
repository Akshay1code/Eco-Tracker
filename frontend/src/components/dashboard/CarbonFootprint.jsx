import { useEffect, useId, useMemo, useState } from 'react';

const PALETTES = [
  {
    score: 0,
    name: 'Pure Green',
    label: 'Excellent Leaf',
    accent: 'Calm flow',
    base: '#16a34a',
    glow: 'rgba(34,197,94,0.6)',
    glass: 'rgba(187,247,208,0.25)',
  },
  {
    score: 1.5,
    name: 'Light Green',
    label: 'Healthy Path',
    accent: 'Stable pace',
    base: '#65a30d',
    glow: 'rgba(132,204,22,0.5)',
    glass: 'rgba(217,249,157,0.2)',
  },
  {
    score: 3.5,
    name: 'Yellow',
    label: 'Average \u26A1',
    accent: 'Needs tuning',
    base: '#ca8a04',
    glow: 'rgba(234,179,8,0.55)',
    glass: 'rgba(254,240,138,0.2)',
  },
  {
    score: 5.5,
    name: 'Orange',
    label: 'Elevated Heat',
    accent: 'Trim impact',
    base: '#ea580c',
    glow: 'rgba(249,115,22,0.6)',
    glass: 'rgba(254,215,170,0.2)',
  },
  {
    score: 7,
    name: 'Red',
    label: 'Warning Zone',
    accent: 'Act now',
    base: '#dc2626',
    glow: 'rgba(239,68,68,0.65)',
    glass: 'rgba(254,202,202,0.2)',
  },
  {
    score: 9,
    name: 'Critical Black',
    label: 'Critical Burn',
    accent: 'Urgent reduction',
    base: '#1c1c1e',
    glow: 'rgba(100,0,0,0.7)',
    glass: 'rgba(50,0,0,0.15)',
  },
  {
    score: 10,
    name: 'Critical Black',
    label: 'Critical Burn',
    accent: 'Urgent reduction',
    base: '#1c1c1e',
    glow: 'rgba(100,0,0,0.7)',
    glass: 'rgba(50,0,0,0.15)',
  },
];

function clampScore(score) {
  return Math.max(0, Math.min(10, Number.isFinite(score) ? score : 5));
}

function hexToRgb(hex) {
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3
    ? normalized.split('').map((char) => char + char).join('')
    : normalized;

  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function parseColor(color) {
  if (color.startsWith('#')) {
    const { r, g, b } = hexToRgb(color);
    return { r, g, b, a: 1 };
  }

  const values = color.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0, 1];
  return {
    r: values[0] ?? 0,
    g: values[1] ?? 0,
    b: values[2] ?? 0,
    a: values[3] ?? 1,
  };
}

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

function mixColor(from, to, amount, withAlpha = false) {
  const left = parseColor(from);
  const right = parseColor(to);
  const r = Math.round(lerp(left.r, right.r, amount));
  const g = Math.round(lerp(left.g, right.g, amount));
  const b = Math.round(lerp(left.b, right.b, amount));

  if (withAlpha) {
    const a = Number(lerp(left.a, right.a, amount).toFixed(3));
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  return `rgb(${r}, ${g}, ${b})`;
}

function withAlpha(color, alpha) {
  const { r, g, b } = parseColor(color);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function lighten(color, amount) {
  return mixColor(color, '#ffffff', amount, false);
}

function darken(color, amount) {
  return mixColor(color, '#050505', amount, false);
}

function getPalette(score) {
  const safeScore = clampScore(score);

  for (let index = 0; index < PALETTES.length - 1; index += 1) {
    const current = PALETTES[index];
    const next = PALETTES[index + 1];

    if (safeScore >= current.score && safeScore <= next.score) {
      const amount = next.score === current.score
        ? 0
        : (safeScore - current.score) / (next.score - current.score);

      return {
        score: safeScore,
        name: amount < 0.5 ? current.name : next.name,
        label: amount < 0.5 ? current.label : next.label,
        accent: amount < 0.5 ? current.accent : next.accent,
        base: mixColor(current.base, next.base, amount, false),
        glow: mixColor(current.glow, next.glow, amount, true),
        glass: mixColor(current.glass, next.glass, amount, true),
      };
    }
  }

  const fallback = PALETTES[PALETTES.length - 1];
  return {
    score: safeScore,
    name: fallback.name,
    label: fallback.label,
    accent: fallback.accent,
    base: fallback.base,
    glow: fallback.glow,
    glass: fallback.glass,
  };
}

// Main component: glassmorphic 3D carbon footprint hero visual.
function CarbonFootprint({
  score = 5,
  animated = true,
  showControls = true,
  size = 280,
}) {
  const [currentScore, setCurrentScore] = useState(clampScore(score));
  const [isRippling, setIsRippling] = useState(false);
  const svgId = useId().replace(/:/g, '');

  useEffect(() => {
    setCurrentScore(clampScore(score));
  }, [score]);

  useEffect(() => {
    setIsRippling(true);
    const timeoutId = window.setTimeout(() => setIsRippling(false), 520);
    return () => window.clearTimeout(timeoutId);
  }, [currentScore]);

  const palette = useMemo(() => getPalette(currentScore), [currentScore]);

  const derived = useMemo(() => {
    const baseColor = palette.base;
    const brightCore = lighten(baseColor, 0.4);
    const brightEdge = lighten(baseColor, 0.16);
    const darkEdge = darken(baseColor, 0.45);
    const deepShadow = darken(baseColor, 0.72);
    const trackFill = withAlpha(baseColor, 0.2);
    const panelTint = withAlpha(baseColor, 0.06);
    const sliderFill = `linear-gradient(90deg, ${lighten(baseColor, 0.25)} 0%, ${baseColor} 55%, ${darkEdge} 100%)`;

    return {
      baseColor,
      brightCore,
      brightEdge,
      darkEdge,
      deepShadow,
      trackFill,
      panelTint,
      sliderFill,
      textStrong: currentScore >= 8.5 ? '#f8d7d7' : '#effff3',
      textSoft: currentScore >= 8.5 ? 'rgba(255,223,223,0.76)' : 'rgba(240,255,246,0.74)',
      toeShadow: withAlpha(deepShadow, 0.44),
      toeHighlight: withAlpha('#ffffff', 0.82),
      occlusion: withAlpha('#090909', 0.24),
    };
  }, [currentScore, palette]);

  const ids = {
    footGradient: `cfp-foot-${svgId}`,
    glowGradient: `cfp-glow-${svgId}`,
    footShadow: `cfp-shadow-${svgId}`,
  };

  const showGlowPulse = animated && currentScore <= 2;
  const showWarningPulse = animated && currentScore >= 8;
  const wrapperClassName = [
    'cfp-shell',
    showGlowPulse ? 'cfp-shell--glow' : '',
    showWarningPulse ? 'cfp-shell--warning' : '',
  ].filter(Boolean).join(' ');
  const svgClassName = [
    'cfp-visual',
    animated ? 'cfp-visual--animated' : '',
    isRippling ? 'cfp-visual--ripple' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={wrapperClassName}
      style={{
        '--cfp-base': derived.baseColor,
        '--cfp-glow': palette.glow,
        '--cfp-glass': palette.glass,
        '--cfp-soft': derived.textSoft,
        '--cfp-strong': derived.textStrong,
        '--cfp-track': derived.trackFill,
      }}
    >
      <style>
        {`
          .cfp-shell {
            position: relative;
            display: grid;
            gap: 1.1rem;
            justify-items: center;
            transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .cfp-glow-ring {
            position: absolute;
            width: 60%;
            aspect-ratio: 1;
            border-radius: 999px;
            top: 18%;
            left: 50%;
            transform: translateX(-50%);
            filter: blur(40px);
            opacity: 0.3;
            pointer-events: none;
            transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .cfp-card {
            position: relative;
            width: min(100%, ${Math.max(size + 36, 300)}px);
            padding: 1.25rem 1.25rem 1rem;
            border-radius: 2rem;
            border: 1px solid rgba(255,255,255,0.18);
            background:
              linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04)),
              linear-gradient(180deg, ${derived.panelTint}, transparent 62%),
              rgba(255,255,255,0.08);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            box-shadow:
              0 8px 32px ${palette.glow},
              inset 0 1px 0 rgba(255,255,255,0.2);
            overflow: hidden;
            transform-origin: center;
            transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .cfp-card::before {
            content: '';
            position: absolute;
            inset: 0;
            background:
              radial-gradient(circle at 24% 18%, rgba(255,255,255,0.18), transparent 32%),
              linear-gradient(180deg, rgba(255,255,255,0.08), transparent 30%);
            pointer-events: none;
          }

          .cfp-visual-wrap {
            position: relative;
            display: grid;
            place-items: center;
            min-height: ${size + 28}px;
            transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .cfp-card:hover .cfp-visual-wrap {
            transform: translateY(-4px) scale(1.02);
          }

          .cfp-card:hover {
            box-shadow:
              0 16px 42px ${withAlpha(palette.glow, 0.92)},
              inset 0 1px 0 rgba(255,255,255,0.22);
          }

          .cfp-visual {
            width: ${size}px;
            height: auto;
            display: block;
            transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), filter 0.8s cubic-bezier(0.4, 0, 0.2, 1);
            transform-origin: center;
            filter: drop-shadow(0 10px 26px ${withAlpha(palette.glow, 0.34)});
          }

          .cfp-visual--ripple {
            animation: cfp-ripple 0.52s cubic-bezier(0.22, 1, 0.36, 1);
          }

          .cfp-shell--glow .cfp-glow-ring {
            animation: cfp-glow-pulse 2s ease-in-out infinite;
          }

          .cfp-shell--warning .cfp-card {
            animation: cfp-warning-pulse 1.5s ease-in-out infinite;
          }

          .cfp-readout {
            position: absolute;
            inset: auto 0 0;
            display: grid;
            gap: 0.35rem;
            padding: 0 0.5rem;
            text-align: center;
            pointer-events: none;
          }

          .cfp-score {
            color: var(--cfp-strong);
            font-size: clamp(1.6rem, 2vw, 1.85rem);
            font-weight: 800;
            letter-spacing: -0.04em;
            text-shadow: 0 2px 14px rgba(0,0,0,0.24);
          }

          .cfp-label-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.55rem;
            flex-wrap: wrap;
          }

          .cfp-label {
            color: var(--cfp-strong);
            font-size: 0.92rem;
            font-weight: 700;
          }

          .cfp-accent {
            color: var(--cfp-soft);
            font-size: 0.74rem;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          .cfp-caption {
            position: relative;
            z-index: 1;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
            margin-top: 0.9rem;
            color: var(--cfp-soft);
          }

          .cfp-caption strong {
            display: block;
            color: var(--cfp-strong);
            font-size: 0.98rem;
            margin-bottom: 0.2rem;
          }

          .cfp-caption span {
            font-size: 0.78rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }

          .cfp-chip {
            padding: 0.45rem 0.75rem;
            border-radius: 999px;
            border: 1px solid rgba(255,255,255,0.16);
            background: linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.06));
            color: var(--cfp-strong);
            font-size: 0.72rem;
            letter-spacing: 0.09em;
            text-transform: uppercase;
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.18);
          }

          .cfp-controls {
            width: min(100%, ${Math.max(size + 36, 300)}px);
            padding: 1rem 1.1rem 1.1rem;
            border-radius: 1.45rem;
            border: 1px solid rgba(255,255,255,0.16);
            background: linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.06));
            backdrop-filter: blur(16px) saturate(160%);
            -webkit-backdrop-filter: blur(16px) saturate(160%);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.14);
            transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .cfp-controls-top {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: 0.85rem;
            margin-bottom: 0.85rem;
          }

          .cfp-controls-top strong {
            color: var(--cfp-strong);
            font-size: 1rem;
          }

          .cfp-controls-top span {
            color: var(--cfp-soft);
            font-size: 0.78rem;
          }

          .cfp-range {
            width: 100%;
            appearance: none;
            height: 10px;
            border-radius: 999px;
            outline: none;
            background:
              linear-gradient(90deg, rgba(255,255,255,0.18), rgba(255,255,255,0.05)),
              var(--cfp-track);
            box-shadow: inset 0 1px 4px rgba(0,0,0,0.14);
          }

          .cfp-range::-webkit-slider-runnable-track {
            height: 10px;
            border-radius: 999px;
            background:
              linear-gradient(90deg, rgba(255,255,255,0.16), rgba(255,255,255,0.03)),
              var(--cfp-track);
          }

          .cfp-range::-moz-range-track {
            height: 10px;
            border-radius: 999px;
            background:
              linear-gradient(90deg, rgba(255,255,255,0.16), rgba(255,255,255,0.03)),
              var(--cfp-track);
          }

          .cfp-range::-webkit-slider-thumb {
            appearance: none;
            width: 24px;
            height: 24px;
            margin-top: -7px;
            border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.72);
            background: var(--cfp-base);
            box-shadow: 0 8px 18px ${palette.glow};
            cursor: pointer;
            transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .cfp-range::-moz-range-thumb {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.72);
            background: var(--cfp-base);
            box-shadow: 0 8px 18px ${palette.glow};
            cursor: pointer;
            transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          }

          @keyframes cfp-glow-pulse {
            0%, 100% { opacity: 0.2; transform: translateX(-50%) scale(0.96); }
            50% { opacity: 0.5; transform: translateX(-50%) scale(1.08); }
          }

          @keyframes cfp-warning-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
          }

          @keyframes cfp-ripple {
            0% { transform: scale(0.96); }
            64% { transform: scale(1.016); }
            100% { transform: scale(1); }
          }

          .cfp-toe {
            transform-origin: center;
            transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            animation: cfp-float 4s ease-in-out infinite;
          }
          .cfp-toe:hover {
            transform: scale(1.15) translateY(-2px);
          }
          .cfp-toe-1 { animation-delay: 0.0s; transform-origin: 67.5px 18px; }
          .cfp-toe-2 { animation-delay: 0.2s; transform-origin: 48.5px 16px; }
          .cfp-toe-3 { animation-delay: 0.4s; transform-origin: 31.5px 23.5px; }
          .cfp-toe-4 { animation-delay: 0.6s; transform-origin: 19px 34px; }

          .cfp-leaf {
            transform-origin: 37px 54px;
            transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          .cfp-leaf:hover {
            transform: scale(1.03) rotate(1deg);
          }
          .cfp-leaf-bottom {
            transform-origin: 34px 101px;
          }

          @keyframes cfp-float {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-3px) scale(1.02); }
          }

          @media (max-width: 640px) {
            .cfp-card,
            .cfp-controls {
              width: min(100%, 100%);
            }

            .cfp-caption,
            .cfp-controls-top {
              flex-direction: column;
              align-items: flex-start;
            }

            .cfp-readout {
              bottom: -0.2rem;
            }
          }
        `}
      </style>

      {/* Ambient glow behind the glass card */}
      <div
        className="cfp-glow-ring"
        style={{
          background: `radial-gradient(circle, ${withAlpha(palette.glow, 0.72)} 0%, ${withAlpha(palette.glow, 0.22)} 45%, transparent 74%)`,
        }}
      />

      {/* Main glassmorphic card wrapper */}
      <div className="cfp-card">
        <div className="cfp-visual-wrap">
          {/* Reference-style footprint SVG */}
          <svg
            className={svgClassName}
            viewBox="0 0 82 150"
            role="img"
            aria-label={`Carbon footprint score ${currentScore.toFixed(1)} out of 10 in ${palette.name} theme`}
          >
            <defs>
              <filter id={ids.footShadow} x="-25%" y="-15%" width="150%" height="165%">
                <feDropShadow dx="-2" dy="7" stdDeviation="5" floodColor="rgba(5,75,28,0.32)" />
              </filter>
              <linearGradient id={ids.footGradient} x1="8" y1="74" x2="74" y2="78" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#07833a" />
                <stop offset="45%" stopColor="#71be1d" />
                <stop offset="100%" stopColor="#93cd1d" />
              </linearGradient>
              <radialGradient id={ids.glowGradient} cx="50%" cy="42%" r="50%">
                <stop offset="0%" stopColor="rgba(140, 214, 48, 0.28)" />
                <stop offset="100%" stopColor="rgba(140, 214, 48, 0)" />
              </radialGradient>
            </defs>

            <ellipse cx="41" cy="76" rx="34" ry="56" fill={`url(#${ids.glowGradient})`} />

            <g filter={`url(#${ids.footShadow})`}>
              <ellipse className="cfp-toe cfp-toe-1" cx="67.5" cy="18" rx="14.5" ry="15.5" fill={`url(#${ids.footGradient})`} />
              <ellipse className="cfp-toe cfp-toe-2" cx="48.5" cy="16" rx="11" ry="13.5" fill={`url(#${ids.footGradient})`} />
              <ellipse className="cfp-toe cfp-toe-3" cx="31.5" cy="23.5" rx="8.5" ry="11.5" fill={`url(#${ids.footGradient})`} />
              <ellipse className="cfp-toe cfp-toe-4" cx="19" cy="34" rx="7" ry="9" fill={`url(#${ids.footGradient})`} />

              <path
                className="cfp-leaf"
                d="M63 27C34 26 12 48 12 81c0 18 6 35 14 48c8-23 17-37 30-47c8-6 16-18 17-33c1-8-2-16-10-22Z"
                fill={`url(#${ids.footGradient})`}
              />
              <path
                className="cfp-leaf cfp-leaf-bottom"
                d="M46 82c-10 9-17 24-22 45c7 12 19 20 33 20c14 0 24-6 24-18c0-9-4-15-11-22c-7-7-13-14-14-25c-1 0-4 0-10 0Z"
                fill={`url(#${ids.footGradient})`}
              />
            </g>
          </svg>

          {/* Floating score overlay */}
          <div className="cfp-readout">
            <div className="cfp-score">{currentScore.toFixed(1)} / 10</div>
            <div className="cfp-label-row">
              <span className="cfp-label">{palette.label}</span>
              <span className="cfp-accent">{palette.accent}</span>
            </div>
          </div>
        </div>

        {/* Supporting meta line inside the card */}
        <div className="cfp-caption">
          <div>
            <strong>Carbon Footprint Signal</strong>
            <span>{palette.name} glassmorphic state</span>
          </div>
          <div className="cfp-chip">{currentScore <= 2 ? 'Low impact' : currentScore >= 8 ? 'High urgency' : 'Monitor trend'}</div>
        </div>
      </div>

      {/* Optional interactive demo slider */}
      {showControls ? (
        <div className="cfp-controls">
          <div className="cfp-controls-top">
            <strong>{currentScore.toFixed(1)} / 10</strong>
            <span>{palette.label}</span>
          </div>
          <input
            className="cfp-range"
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={currentScore}
            onChange={(event) => setCurrentScore(clampScore(Number(event.target.value)))}
            aria-label="Carbon footprint score"
            style={{
              background: `${derived.sliderFill}`,
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

export default CarbonFootprint;