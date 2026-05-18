import AuthEarthMascot from './AuthEarthMascot.jsx';
import LeafSVG from '../shared/LeafSVG.jsx';

const LEAF_PARTICLES = [
  { left: '8%', top: '84%', size: 16, delay: '0s', duration: '14s', rotate: '-12deg' },
  { left: '18%', top: '66%', size: 22, delay: '1.2s', duration: '16s', rotate: '18deg' },
  { left: '30%', top: '88%', size: 18, delay: '3.4s', duration: '13s', rotate: '-24deg' },
  { left: '42%', top: '72%', size: 20, delay: '5.2s', duration: '15s', rotate: '10deg' },
  { left: '58%', top: '82%', size: 26, delay: '2.5s', duration: '17s', rotate: '-18deg' },
  { left: '68%', top: '64%', size: 16, delay: '0.8s', duration: '12.5s', rotate: '22deg' },
  { left: '76%', top: '90%', size: 24, delay: '4.8s', duration: '16.5s', rotate: '-8deg' },
  { left: '84%', top: '76%', size: 18, delay: '6.2s', duration: '14.5s', rotate: '15deg' },
  { left: '12%', top: '48%', size: 14, delay: '7.2s', duration: '13.2s', rotate: '-16deg' },
  { left: '88%', top: '52%', size: 20, delay: '8.1s', duration: '15.2s', rotate: '24deg' },
];

const SPARKLES = [
  { left: '12%', top: '18%', size: '0.9rem', delay: '0s' },
  { left: '22%', top: '38%', size: '0.8rem', delay: '1.3s' },
  { left: '72%', top: '14%', size: '1rem', delay: '2.1s' },
  { left: '82%', top: '32%', size: '0.75rem', delay: '3.4s' },
  { left: '16%', top: '70%', size: '0.7rem', delay: '2.7s' },
  { left: '74%', top: '74%', size: '0.9rem', delay: '1.8s' },
];

const ACTION_MAP = {
  name: 'wave',
  dob: 'think',
  nickname: 'bounce',
  city: 'spin',
  country: 'cheer',
  credentials: 'nod',
  done: 'jump',
};

function SignupMascotPanel({ step }) {
  return (
    <div className="eco-signup-left-panel">
      <div className="eco-signup-left-glow" aria-hidden="true" />

      {LEAF_PARTICLES.map((leaf, index) => (
        <span
          key={`signup-leaf-${index}`}
          className="eco-signup-leaf-particle"
          style={{
            left: leaf.left,
            top: leaf.top,
            '--leaf-delay': leaf.delay,
            '--leaf-duration': leaf.duration,
            '--leaf-rotate': leaf.rotate,
          }}
          aria-hidden="true"
        >
          <LeafSVG size={leaf.size} color="rgba(191, 245, 214, 0.92)" />
        </span>
      ))}

      {SPARKLES.map((sparkle, index) => (
        <span
          key={`signup-sparkle-${index}`}
          className="eco-signup-sparkle"
          style={{
            left: sparkle.left,
            top: sparkle.top,
            fontSize: sparkle.size,
            animationDelay: sparkle.delay,
          }}
          aria-hidden="true"
        >
          ✦
        </span>
      ))}

      <div className="eco-signup-brand-lockup">
        <div className="eco-signup-brand-mark" aria-hidden="true">
          <LeafSVG size={26} color="#ffffff" />
        </div>
        <div className="eco-signup-brand-copy">
          <span className="eco-signup-brand-name">EcoTracker</span>
          <p>Terra guides every new eco-warrior one step closer to a greener routine.</p>
        </div>
      </div>

      <div key={step.id} className="eco-signup-mascot-shell">
        <AuthEarthMascot
          mode="signup"
          interactive={false}
          className="auth-earth-mascot--signup-flow"
          speechMessage={step.question}
          emotionId="happy"
          action={ACTION_MAP[step.id] || 'wave'}
        />
      </div>
    </div>
  );
}

export default SignupMascotPanel;
