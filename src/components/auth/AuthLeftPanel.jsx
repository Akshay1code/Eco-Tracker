import LeafSVG from '../shared/LeafSVG.jsx';

const LEAVES = [
  { left: '8%', top: '10%', size: 18, opacity: 0.2, cls: 'leaf-float' },
  { left: '18%', top: '28%', size: 28, opacity: 0.14, cls: 'leaf-float-2' },
  { left: '80%', top: '16%', size: 22, opacity: 0.16, cls: 'leaf-float-3' },
  { left: '88%', top: '42%', size: 16, opacity: 0.2, cls: 'leaf-float' },
  { left: '10%', top: '70%', size: 40, opacity: 0.11, cls: 'leaf-float-2' },
  { left: '76%', top: '80%', size: 26, opacity: 0.25, cls: 'leaf-float-3' },
];

const BADGES = [
  { label: '🌱 Seedling', active: false },
  { label: '🌿 Eco Walker', active: false },
  { label: '🌳 Earth Guardian', active: true },
  { label: '🏆 Planet Protector', active: false },
];

const COPY = {
  login: {
    headline: 'Track Your Carbon. Earn Your Impact.',
    subtext: 'Every step you log is a vote for a healthier planet. Welcome back.',
  },
  signup: {
    headline: 'Start Your Eco Journey Today.',
    subtext: 'Join the movement. Track your footprint, earn XP, and grow your virtual ecosystem.',
  },
};

function AuthLeftPanel({ mode = 'login', headline, subtext }) {
  const variant = COPY[mode] || COPY.login;
  const finalHeadline = headline || variant.headline;
  const finalSubtext = subtext || variant.subtext;

  return (
    <div className="auth-left-inner">
      <div className="auth-mesh-overlay" />
      {LEAVES.map((leaf, index) => (
        <div
          key={`auth-leaf-${index}`}
          className={`auth-left-leaf ${leaf.cls}`}
          style={{ left: leaf.left, top: leaf.top, opacity: leaf.opacity }}
          aria-hidden="true"
        >
          <LeafSVG size={leaf.size} color="rgba(167,243,208,0.95)" />
        </div>
      ))}

      <div className="auth-left-content">
        <div className="auth-logo-block">
          <div className="auth-logo-pill">🌿</div>
          <div>
            <h1>EcoJourney</h1>
            <p>Carbon Tracker RPG</p>
          </div>
        </div>

        <div className="auth-headline-block">
          <span className="auth-tag-pill">🌍 Join 12,000+ Eco Warriors</span>
          <h2>{finalHeadline}</h2>
          <p>{finalSubtext}</p>
        </div>

        <div className="auth-stats-row">
          <div className="auth-stat">
            <strong>12K+</strong>
            <span>Active Users</span>
          </div>
          <div className="auth-stat">
            <strong>0.31 kg</strong>
            <span>Avg Daily CO2 Saved</span>
          </div>
          <div className="auth-stat">
            <strong>48K</strong>
            <span>Trees Equivalent</span>
          </div>
        </div>

        <div className="auth-rank-row">
          {BADGES.map((badge) => (
            <span key={badge.label} className={`auth-rank-pill ${badge.active ? 'active' : ''}`}>
              {badge.label}
            </span>
          ))}
        </div>

        <div className="auth-testimonial">
          <div className="auth-testimonial-head">
            <div className="auth-avatar-mini">EW</div>
            <div>
              <div className="auth-testimonial-name">EcoWalker</div>
              <div className="auth-testimonial-rank">Earth Guardian</div>
            </div>
          </div>
          <p>
            "Reduced my footprint by 40% in 3 months. This app changed my daily habits completely."
          </p>
          <div className="auth-testimonial-stars">⭐⭐⭐⭐⭐</div>
        </div>
      </div>
    </div>
  );
}

export default AuthLeftPanel;
