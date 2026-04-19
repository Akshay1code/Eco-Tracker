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

const BODY_PATH =
  'M89 300 C61 296 44 277 41 248 C39 226 49 204 63 186 C74 171 81 156 81 141 C80 119 68 101 69 77 C70 56 84 42 104 39 C123 36 143 46 152 63 C162 81 160 102 151 121 C142 140 138 156 142 173 C147 195 161 215 159 239 C157 264 141 286 117 297 C107 301 98 302 89 300 Z';

const INNER_BODY_PATH =
  'M87 293 C64 289 50 272 48 246 C47 226 56 207 68 190 C78 177 84 163 84 147 C84 128 74 111 75 87 C76 65 88 50 105 47 C121 44 138 52 146 67 C154 82 152 101 145 118 C137 136 133 151 136 168 C140 188 152 208 151 232 C149 254 136 272 115 286 C107 291 98 293 87 293 Z';

const TOE_PATHS = [
  'M58 70 C45 66 39 53 43 40 C48 26 63 20 77 26 C90 31 95 45 90 58 C84 71 71 75 58 70 Z',
  'M82 53 C70 50 65 38 69 27 C73 16 86 11 99 16 C111 21 116 33 112 45 C107 57 94 60 82 53 Z',
  'M107 54 C96 51 92 41 95 31 C99 20 110 16 121 20 C132 24 137 34 133 44 C129 54 118 57 107 54 Z',
  'M132 67 C123 64 119 55 122 46 C126 37 136 33 145 37 C154 41 159 50 156 59 C152 67 142 70 132 67 Z',
  'M150 88 C143 86 139 79 141 71 C144 63 152 59 160 61 C168 63 173 70 171 78 C168 86 159 90 150 88 Z',
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
    baseGradient: `cfp-base-${svgId}`,
    innerGradient: `cfp-inner-${svgId}`,
    glossBlur: `cfp-gloss-${svgId}`,
    rimShadow: `cfp-rim-${svgId}`,
    bodyClip: `cfp-body-clip-${svgId}`,
    shimmerGradient: `cfp-shimmer-${svgId}`,
    toeClip: `cfp-toe-clip-${svgId}`,
    backdropBlur: `cfp-backdrop-${svgId}`,
    ...TOE_PATHS.reduce((accumulator, _path, index) => {
      accumulator[`toeGradient${index}`] = `cfp-toe-${index}-${svgId}`;
      return accumulator;
    }, {}),
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
          {/* Designer-crafted 3D footprint SVG */}
          <svg
            className={svgClassName}
            viewBox="0 0 200 320"
            role="img"
            aria-label={`Carbon footprint score ${currentScore.toFixed(1)} out of 10 in ${palette.name} theme`}
          >
            <defs>
              {/* Soft footprint shadow and embossed rim */}
              <filter id={ids.rimShadow} x="-30%" y="-20%" width="160%" height="180%">
                <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor={derived.deepShadow} floodOpacity="0.55" />
              </filter>

              {/* Heel gloss blur */}
              <filter id={ids.glossBlur} x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="2" />
              </filter>

              {/* Backdrop blur for inner haze */}
              <filter id={ids.backdropBlur} x="-25%" y="-25%" width="150%" height="150%">
                <feGaussianBlur stdDeviation="5" />
              </filter>

              {/* Base 3D fill */}
              <radialGradient id={ids.baseGradient} cx="70" cy="100" r="140" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={derived.brightCore} style={{ transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                <stop offset="42%" stopColor={derived.brightEdge} style={{ transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                <stop offset="100%" stopColor={derived.darkEdge} style={{ transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />
              </radialGradient>

              {/* Inner highlight layer */}
              <linearGradient id={ids.innerGradient} x1="42" y1="42" x2="158" y2="248" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="rgba(255,255,255,0.62)" style={{ transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                <stop offset="48%" stopColor="rgba(255,255,255,0.14)" style={{ transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" style={{ transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />
              </linearGradient>

              {/* Toe shimmer sweep */}
              <linearGradient id={ids.shimmerGradient} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.45)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>

              {/* Foot clipping masks */}
              <clipPath id={ids.bodyClip}>
                <path d={BODY_PATH} />
              </clipPath>

              <clipPath id={ids.toeClip}>
                {TOE_PATHS.map((toePath, index) => (
                  <path key={ids[`toeGradient${index}`]} d={toePath} />
                ))}
              </clipPath>

              {/* Individual toe gradients for rounded depth */}
              {TOE_PATHS.map((toePath, index) => {
                const toeCenters = [
                  { x: 58, y: 34, r: 22 },
                  { x: 82, y: 25, r: 21 },
                  { x: 108, y: 27, r: 20 },
                  { x: 133, y: 42, r: 18 },
                  { x: 150, y: 64, r: 16 },
                ];

                return (
                  <radialGradient
                    key={toePath}
                    id={ids[`toeGradient${index}`]}
                    cx={toeCenters[index].x}
                    cy={toeCenters[index].y}
                    r={toeCenters[index].r}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor={derived.toeHighlight} style={{ transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                    <stop offset="45%" stopColor={lighten(derived.baseColor, 0.22)} style={{ transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                    <stop offset="100%" stopColor={derived.toeShadow} style={{ transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                  </radialGradient>
                );
              })}
            </defs>

            {/* Toe connection ambient occlusion */}
            <ellipse cx="112" cy="86" rx="44" ry="16" fill={derived.occlusion} filter={`url(#${ids.backdropBlur})`} />

            {/* Main footprint body */}
            <g filter={`url(#${ids.rimShadow})`}>
              <path d={BODY_PATH} fill={`url(#${ids.baseGradient})`} />
            </g>

            {/* Inner reflective highlight for raised surface */}
            <g clipPath={`url(#${ids.bodyClip})`} opacity="0.35">
              <path
                d={INNER_BODY_PATH}
                fill={`url(#${ids.innerGradient})`}
                transform="translate(-4 -6)"
              />
            </g>

            {/* Heel specular gloss */}
            <ellipse
              cx="94"
              cy="229"
              rx="27"
              ry="10"
              fill="rgba(255,255,255,0.2)"
              filter={`url(#${ids.glossBlur})`}
            />

            {/* Individual rounded toes */}
            {TOE_PATHS.map((toePath, index) => (
              <g key={toePath} filter={`url(#${ids.rimShadow})`}>
                <path d={toePath} fill={`url(#${ids[`toeGradient${index}`]})`} />
              </g>
            ))}

            {/* Toe highlight sweep on mount */}
            {animated ? (
              <g clipPath={`url(#${ids.toeClip})`} opacity="0.85">
                <rect x="-90" y="0" width="92" height="120" fill={`url(#${ids.shimmerGradient})`}>
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    from="-90 0"
                    to="200 0"
                    dur="1.2s"
                    begin="0s"
                    fill="freeze"
                  />
                </rect>
              </g>
            ) : null}
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
