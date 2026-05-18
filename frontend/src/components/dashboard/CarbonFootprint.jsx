import { useEffect, useId, useMemo, useRef, useState } from 'react';

const TIERS = [
  {
    key: 'mint',
    min: 0,
    max: 2,
    icon: '🌿',
    title: 'Well done, champ!',
    body: "You're building a consistently low carbon footprint. The planet is grateful for every mindful choice you make.",
    light: '#a8f0b8',
    dark: '#3dcc6a',
    shadow: 'rgba(61,204,106,0.40)',
    corner: 'rgba(168,240,184,0.56)',
    panel: 'rgba(168,240,184,0.22)',
    badge: 'rgba(61,204,106,0.18)',
    titleColor: '#1f7a3f',
    bodyColor: '#3d7a53',
  },
  {
    key: 'lime',
    min: 2.01,
    max: 4,
    icon: '🌱',
    title: 'Great going!',
    body: "Your footprint is light and improving. Keep building those eco habits — you're making a real difference.",
    light: '#d4f57a',
    dark: '#9ddb20',
    shadow: 'rgba(140,210,30,0.38)',
    corner: 'rgba(212,245,122,0.56)',
    panel: 'rgba(212,245,122,0.22)',
    badge: 'rgba(157,219,32,0.18)',
    titleColor: '#5e7d08',
    bodyColor: '#6f821f',
  },
  {
    key: 'amber',
    min: 4.01,
    max: 6.01,
    icon: '🌤',
    title: 'On the edge.',
    body: 'A few mindful daily swaps could shift your score into the green. Small choices carry outsized impact.',
    light: '#ffe27a',
    dark: '#f5a623',
    shadow: 'rgba(245,166,35,0.38)',
    corner: 'rgba(255,226,122,0.56)',
    panel: 'rgba(255,226,122,0.22)',
    badge: 'rgba(245,166,35,0.18)',
    titleColor: '#9a5a06',
    bodyColor: '#a36a1b',
  },
  {
    key: 'orange',
    min: 6.02,
    max: 8,
    icon: '🔶',
    title: 'Time to act.',
    body: 'Your footprint is climbing. Small daily changes add up fast — now is the moment to course-correct.',
    light: '#ffb07a',
    dark: '#f5621a',
    shadow: 'rgba(245,98,26,0.38)',
    corner: 'rgba(255,176,122,0.56)',
    panel: 'rgba(255,176,122,0.22)',
    badge: 'rgba(245,98,26,0.18)',
    titleColor: '#a94812',
    bodyColor: '#a85f34',
  },
  {
    key: 'coral',
    min: 8.01,
    max: 10,
    icon: '🔴',
    title: 'High impact alert!',
    body: "Your carbon footprint needs urgent attention. Every step toward change counts — let's turn this around together.",
    light: '#ff9090',
    dark: '#d42020',
    shadow: 'rgba(212,32,32,0.38)',
    corner: 'rgba(255,144,144,0.56)',
    panel: 'rgba(255,144,144,0.22)',
    badge: 'rgba(212,32,32,0.18)',
    titleColor: '#9d1818',
    bodyColor: '#a74343',
  },
];

function clampScore(score) {
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.max(0, Math.min(10, score));
}

function getTier(score) {
  const safeScore = clampScore(score);
  return TIERS.find((tier) => safeScore >= tier.min && safeScore <= tier.max) ?? TIERS[TIERS.length - 1];
}

function CarbonFootprint({ score = 0, showControls = true }) {
  const currentScore = clampScore(score);
  const [floatActive, setFloatActive] = useState(true);
  const floatResetRef = useRef(null);
  const tierRef = useRef(getTier(score).key);
  const uid = useId().replace(/:/g, '');

  const tier = useMemo(() => getTier(currentScore), [currentScore]);
  const scoreText = currentScore.toFixed(2);

  useEffect(() => {
    if (tierRef.current === tier.key) {
      return undefined;
    }

    tierRef.current = tier.key;
    setFloatActive(false);

    const restartId = window.setTimeout(() => {
      setFloatActive(true);
    }, 10);

    floatResetRef.current = restartId;
    return () => window.clearTimeout(restartId);
  }, [tier.key]);

  useEffect(() => () => {
    if (floatResetRef.current) {
      window.clearTimeout(floatResetRef.current);
    }
  }, []);

  return (
    <div
      className="carbon-indicator"
      style={{
        '--cf-light': tier.light,
        '--cf-dark': tier.dark,
        '--cf-shadow': tier.shadow,
        '--cf-corner': tier.corner,
        '--cf-panel': tier.panel,
        '--cf-badge': tier.badge,
        '--cf-title': tier.titleColor,
        '--cf-body': tier.bodyColor,
      }}
    >
      <style>
        {`
          .carbon-indicator {
            position: relative;
            width: 100%;
            border-radius: 26px;
            padding: 28px;
            overflow: hidden;
            background: rgba(255,255,255,0.92);
            border: 1px solid rgba(255,255,255,0.9);
            box-shadow: 0 20px 60px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1);
            display: grid;
            grid-template-columns: minmax(0, 1.02fr) minmax(0, 0.98fr);
            gap: 24px 26px;
            font-family: 'Poppins', sans-serif;
            isolation: isolate;
          }

          .carbon-indicator * {
            box-sizing: border-box;
          }

          .carbon-indicator__corner {
            position: absolute;
            width: clamp(200px, 24vw, 260px);
            height: clamp(200px, 24vw, 260px);
            pointer-events: none;
            transition: background 0.8s ease, opacity 0.8s ease;
            opacity: 1;
          }

          .carbon-indicator__corner--tl {
            top: 0;
            left: 0;
            border-radius: 26px 0 86% 0;
            background: linear-gradient(135deg, var(--cf-corner) 0%, rgba(255,255,255,0) 72%);
          }

          .carbon-indicator__corner--tr {
            top: 0;
            right: 0;
            border-radius: 0 26px 0 86%;
            background: linear-gradient(225deg, var(--cf-corner) 0%, rgba(255,255,255,0) 72%);
          }

          .carbon-indicator__corner--bl {
            bottom: 0;
            left: 0;
            border-radius: 0 86% 0 26px;
            background: linear-gradient(45deg, var(--cf-corner) 0%, rgba(255,255,255,0) 72%);
          }

          .carbon-indicator__corner--br {
            right: 0;
            bottom: 0;
            border-radius: 86% 0 26px 0;
            background: linear-gradient(315deg, var(--cf-corner) 0%, rgba(255,255,255,0) 72%);
          }

          .carbon-indicator__column {
            position: relative;
            z-index: 1;
          }

          .carbon-indicator__column--left {
            display: grid;
            align-content: center;
            justify-items: center;
            min-width: 0;
          }

          .carbon-indicator__foot-wrap {
            width: min(100%, 250px);
            display: grid;
            justify-items: center;
            filter: drop-shadow(0 22px 34px var(--cf-shadow));
            transition: filter 0.6s ease;
          }

          .carbon-indicator__foot {
            width: 100%;
            height: auto;
            display: block;
          }

          .carbon-indicator__score {
            margin-top: 14px;
            font-size: clamp(3rem, 5vw, 56px);
            font-weight: 800;
            line-height: 1;
            letter-spacing: -3px;
            color: var(--cf-dark);
            transition: color 0.6s ease;
          }

          .carbon-indicator__label {
            margin-top: 8px;
            font-size: 11px;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            color: #9ca3af;
            text-align: center;
          }

          .carbon-indicator__column--right {
            display: grid;
            align-content: center;
          }

          .carbon-indicator__message {
            border-radius: 20px;
            padding: 18px;
            border: 1px solid rgba(255,255,255,0.6);
            background: var(--cf-panel);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            box-shadow: 0 16px 34px rgba(255,255,255,0.28), inset 0 1px 0 rgba(255,255,255,0.75);
            transition: background 0.6s ease, border-color 0.6s ease;
          }

          .carbon-indicator__message.is-floating {
            animation: carbonFloat 3.5s ease-in-out infinite;
          }

          .carbon-indicator__message-head {
            display: flex;
            align-items: center;
            gap: 14px;
            margin-bottom: 12px;
          }

          .carbon-indicator__icon-badge {
            width: 44px;
            height: 44px;
            border-radius: 14px;
            display: grid;
            place-items: center;
            font-size: 20px;
            background: var(--cf-badge);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.55);
            transition: background 0.6s ease;
            flex-shrink: 0;
          }

          .carbon-indicator__message-title {
            font-size: 14px;
            font-weight: 800;
            color: var(--cf-title);
            transition: color 0.6s ease;
          }

          .carbon-indicator__message-body {
            font-size: 12px;
            line-height: 1.65;
            color: var(--cf-body);
            transition: color 0.6s ease;
          }

          .carbon-indicator__pill {
            padding: 8px 12px;
            border-radius: 999px;
            background: var(--cf-badge);
            color: var(--cf-title);
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.02em;
            transition: background 0.6s ease, color 0.6s ease;
            white-space: nowrap;
          }

          @keyframes carbonFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
          }

          @media (max-width: 960px) {
            .carbon-indicator {
              grid-template-columns: 1fr;
              gap: 22px;
              padding: 24px 20px;
            }

          }
        `}
      </style>

      <div className="carbon-indicator__corner carbon-indicator__corner--tl" />
      <div className="carbon-indicator__corner carbon-indicator__corner--tr" />
      <div className="carbon-indicator__corner carbon-indicator__corner--bl" />
      <div className="carbon-indicator__corner carbon-indicator__corner--br" />

      <div className="carbon-indicator__column carbon-indicator__column--left">
        <div className="carbon-indicator__foot-wrap">
          <svg
            className="carbon-indicator__foot"
            viewBox="0 0 240 320"
            role="img"
            aria-label={`Carbon footprint score ${scoreText} out of 10`}
          >
            <defs>
              <linearGradient id={`foot-base-${uid}`} x1="46" y1="230" x2="188" y2="68" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={tier.light} />
                <stop offset="100%" stopColor={tier.dark} />
              </linearGradient>
              <radialGradient id={`foot-depth-${uid}`} cx="46%" cy="44%" r="62%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.12)" />
              </radialGradient>
              <linearGradient id={`foot-shine-${uid}`} x1="54" y1="42" x2="170" y2="240" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
              <filter id={`foot-shadow-${uid}`} x="-25%" y="-25%" width="160%" height="170%">
                <feDropShadow dx="0" dy="18" stdDeviation="14" floodColor={tier.shadow} />
              </filter>
              <g id={`foot-shape-${uid}`}>
                <ellipse cx="163" cy="48" rx="16" ry="18" transform="rotate(-12 163 48)" />
                <ellipse cx="130" cy="40" rx="14" ry="16" transform="rotate(-11 130 40)" />
                <ellipse cx="99" cy="49" rx="13" ry="15" transform="rotate(-9 99 49)" />
                <ellipse cx="72" cy="69" rx="11" ry="13" transform="rotate(-6 72 69)" />
                <ellipse cx="49" cy="96" rx="9" ry="11" transform="rotate(-2 49 96)" />
                <path d="M152 75C130 74 106 82 86 100C58 126 41 164 40 209C39 242 50 274 71 292C90 309 116 314 136 306C157 298 172 276 173 253C174 228 158 203 143 181C132 165 128 149 133 130C139 109 155 94 160 84C162 80 160 75 152 75Z" />
              </g>
            </defs>

            <g filter={`url(#foot-shadow-${uid})`}>
              <g fill={`url(#foot-base-${uid})`}>
                <use href={`#foot-shape-${uid}`} />
              </g>
              <g fill={`url(#foot-depth-${uid})`} opacity="0.92">
                <use href={`#foot-shape-${uid}`} />
              </g>
              <g fill={`url(#foot-shine-${uid})`} opacity="0.4">
                <use href={`#foot-shape-${uid}`} />
              </g>
              <ellipse cx="123" cy="252" rx="29" ry="44" fill="rgba(255,255,255,0.16)" transform="rotate(12 123 252)" />
              <ellipse cx="121" cy="120" rx="40" ry="28" fill="rgba(255,255,255,0.18)" transform="rotate(-16 121 120)" />
              <ellipse cx="91" cy="181" rx="18" ry="34" fill="rgba(255,255,255,0.12)" transform="rotate(18 91 181)" />
            </g>
          </svg>
        </div>

        <div className="carbon-indicator__score">{scoreText}</div>
        <div className="carbon-indicator__label">Carbon Footprint / 10</div>
      </div>

      <div className="carbon-indicator__column carbon-indicator__column--right">
        <div className={`carbon-indicator__message${floatActive ? ' is-floating' : ''}`}>
          <div className="carbon-indicator__message-head">
            <div className="carbon-indicator__icon-badge" aria-hidden="true">{tier.icon}</div>
            <div className="carbon-indicator__message-title">{tier.title}</div>
          </div>
          <p className="carbon-indicator__message-body">{tier.body}</p>
        </div>
      </div>

      {showControls ? <div className="carbon-indicator__pill">{scoreText} / 10</div> : null}
    </div>
  );
}

export default CarbonFootprint;

