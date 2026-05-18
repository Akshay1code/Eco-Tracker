import LeafSVG from '../shared/LeafSVG.jsx';
import AuthEarthMascot from './AuthEarthMascot.jsx';

const LEAVES = [
  { left: '10%', top: '12%', size: 18, opacity: 0.18, cls: 'leaf-float' },
  { left: '82%', top: '18%', size: 22, opacity: 0.14, cls: 'leaf-float-2' },
  { left: '14%', top: '76%', size: 28, opacity: 0.12, cls: 'leaf-float-3' },
  { left: '78%', top: '72%', size: 24, opacity: 0.16, cls: 'leaf-float' },
];

const COPY = {
  login: 'Track your habits. Grow your impact.',
  signup: 'Start small. Build a cleaner tomorrow.',
};

function AuthLeftPanel({ mode = 'login' }) {
  const message = COPY[mode] || COPY.login;

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
          <LeafSVG size={leaf.size} color="rgba(167,243,208,0.92)" />
        </div>
      ))}

      <div className="auth-left-content auth-left-content--minimal">
        <div className="auth-brand-hero">
          <div className="auth-brand-mark" aria-hidden="true">
            <LeafSVG size={26} color="#d1fae5" />
          </div>
          <h1>EcoTracker</h1>
          <p>{message}</p>
        </div>

        <AuthEarthMascot mode={mode} />
      </div>
    </div>
  );
}

export default AuthLeftPanel;
