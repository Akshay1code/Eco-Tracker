import { useEffect, useMemo, useState } from 'react';
import AuthLayout from '../components/auth/AuthLayout.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RANKS = [
  { id: 'seedling', label: 'Seedling' },
  { id: 'walker', label: 'Eco Walker' },
  { id: 'guardian', label: 'Guardian' },
  { id: 'protector', label: 'Protector' },
];

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="signin-social-icon" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-.9 2.4-2 3.1l3.2 2.5c1.9-1.8 3-4.4 3-7.5 0-.7-.1-1.4-.2-2H12z" />
      <path fill="#34A853" d="M12 22c2.7 0 5-1 6.7-2.7l-3.2-2.5c-.9.6-2 .9-3.5.9-2.7 0-4.9-1.8-5.7-4.3l-3.4 2.6C4.6 19.5 8 22 12 22z" />
      <path fill="#4A90E2" d="M6.3 13.4c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9L2.9 7C2.3 8.2 2 9.6 2 11.1s.3 2.9.9 4.1l3.4-1.8z" />
      <path fill="#FBBC05" d="M12 5.4c1.5 0 2.9.5 3.9 1.5l2.9-2.9C17 2.4 14.7 1.4 12 1.4 8 1.4 4.6 3.9 2.9 7l3.4 2.6c.8-2.5 3-4.2 5.7-4.2z" />
    </svg>
  );
}

function LeafPrefixIcon() {
  return (
    <svg viewBox="0 0 24 24" className="signin-field-icon" aria-hidden="true">
      <path
        fill="none"
        stroke="#4caf72"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18.5 4.5c-5.7.4-10 3.4-11.9 8.2-.8 2-.8 4.1-.1 6.3 2.1.7 4.2.6 6.2-.2 4.9-1.9 7.8-6.2 8.3-11.8-.8-.8-1.6-1.7-2.5-2.5ZM8.6 16.2c1.5-2.4 3.8-4.6 6.8-6.5"
      />
    </svg>
  );
}

function EmailPrefixIcon() {
  return (
    <svg viewBox="0 0 24 24" className="signin-field-icon" aria-hidden="true">
      <path
        fill="none"
        stroke="#4caf72"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 7.5h15a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 15V9a1.5 1.5 0 0 1 1.5-1.5Zm0 1.2 7.5 5.4 7.5-5.4"
      />
    </svg>
  );
}

function UserPrefixIcon() {
  return (
    <svg viewBox="0 0 24 24" className="signin-field-icon" aria-hidden="true">
      <path
        fill="none"
        stroke="#4caf72"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 12.4a3.7 3.7 0 1 0 0-7.4 3.7 3.7 0 0 0 0 7.4Zm-6.6 6.1c1.4-2.6 4-4 6.6-4s5.2 1.4 6.6 4"
      />
    </svg>
  );
}

function getPasswordStrength(password) {
  if (!password) {
    return { segments: 0, label: '', color: '#e5e7eb' };
  }

  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const passed = checks.filter(Boolean).length;

  if (passed <= 1) return { segments: 2, label: 'Weak', color: '#ef4444' };
  if (passed === 2) return { segments: 3, label: 'Moderate', color: '#f59e0b' };
  if (passed === 3) return { segments: 4, label: 'Strong', color: '#22c55e' };
  return { segments: 5, label: 'Very Strong', color: '#16a34a' };
}

function SignupPage({ onSwitchToLogin, onNavigate }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });
  const [selectedRank, setSelectedRank] = useState('guardian');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [leafPulseField, setLeafPulseField] = useState('');
  const [googleState, setGoogleState] = useState('default');

  const strength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  useEffect(() => {
    if (!leafPulseField) return;
    const timeout = window.setTimeout(() => setLeafPulseField(''), 220);
    return () => window.clearTimeout(timeout);
  }, [leafPulseField]);

  useEffect(() => {
    if (googleState !== 'rolling') return;
    const timeout = window.setTimeout(() => setGoogleState('connected'), 620);
    return () => window.clearTimeout(timeout);
  }, [googleState]);

  const goTo = (path) => {
    if (onNavigate) {
      onNavigate(path);
      return;
    }
    window.location.href = path;
  };

  const validateField = (name, value, allValues = form) => {
    if (name === 'name') {
      if (!value || value.trim().length < 2) return 'Please enter your name';
      return '';
    }
    if (name === 'email') {
      if (!EMAIL_RE.test((value || '').trim())) return 'Enter a valid email address';
      return '';
    }
    if (name === 'password') {
      if (!value || value.length < 8) return 'Password must be at least 8 characters';
      return '';
    }
    if (name === 'confirmPassword') {
      if (value !== allValues.password) return 'Passwords do not match';
      return '';
    }
    if (name === 'terms') {
      if (!allValues.terms) return 'You must agree to continue';
      return '';
    }
    return '';
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError('');
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, form[field], form) }));
  };

  const handleGoogleConnect = () => {
    if (googleState !== 'default') return;
    setGoogleState('rolling');
  };

  const handleTogglePassword = (field) => {
    if (field === 'password') {
      setShowPassword((prev) => !prev);
    } else {
      setShowConfirmPassword((prev) => !prev);
    }
    setLeafPulseField(field);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nextErrors = {
      name: validateField('name', form.name, form),
      email: validateField('email', form.email, form),
      password: validateField('password', form.password, form),
      confirmPassword: validateField('confirmPassword', form.confirmPassword, form),
      terms: validateField('terms', form.terms, form),
    };

    setErrors(nextErrors);
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      terms: true,
    });

    if (Object.values(nextErrors).some(Boolean)) return;

    setIsSubmitting(true);
    window.setTimeout(() => {
      localStorage.setItem('userEmail', form.email.trim());
      localStorage.setItem('userPassword', form.password);
      localStorage.setItem('userName', form.name.trim());
      localStorage.setItem('userScore', '200');
      localStorage.setItem(
        'userProfile',
        JSON.stringify({
          name: form.name.trim(),
          rank: selectedRank,
        })
      );
      localStorage.setItem('isLoggedIn', 'true');
      goTo('/dashboard');
    }, 1000);
  };

  return (
    <AuthLayout mode="signup">
      <div className="auth-form-card auth-form-enter signin-panel signup-panel">
        <header className="auth-header signin-header">
          <h2>Create your account</h2>
          <p>Start tracking your carbon footprint today.</p>
        </header>

        <section className="signin-social-stack" aria-label="Social sign up">
          <button
            type="button"
            className={`signin-social-btn ${googleState === 'connected' ? 'is-connected' : ''}`}
            onClick={handleGoogleConnect}
            disabled={googleState !== 'default'}
            aria-pressed={googleState !== 'default'}
          >
            <span className={`signin-social-icon-wrap ${googleState === 'rolling' ? 'is-rolling' : ''}`}>
              <GoogleLogo />
            </span>
            <span className={`signin-social-label ${googleState === 'rolling' ? 'is-rolling' : ''}`}>Continue with Google</span>
          </button>
        </section>

        <div className="signin-divider">
          <hr />
          <span>or continue with email</span>
          <hr />
        </div>

        <form onSubmit={handleSubmit} className="signin-form signup-form">
          <div className="signin-field">
            <label htmlFor="signup-name">Full name</label>
            <div className={`signin-input-wrap ${touched.name && errors.name ? 'error' : ''}`}>
              <span className="signin-input-prefix" aria-hidden="true">
                <UserPrefixIcon />
              </span>
              <input
                id="signup-name"
                name="name"
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                autoComplete="name"
                className="signin-input"
                aria-invalid={Boolean(touched.name && errors.name)}
              />
            </div>
            {touched.name && errors.name ? <span className="signin-error">{errors.name}</span> : null}
          </div>

          <div className="signin-field">
            <label htmlFor="signup-email">Email address</label>
            <div className={`signin-input-wrap ${touched.email && errors.email ? 'error' : ''}`}>
              <span className="signin-input-prefix" aria-hidden="true">
                <EmailPrefixIcon />
              </span>
              <input
                id="signup-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                autoComplete="email"
                className="signin-input"
                aria-invalid={Boolean(touched.email && errors.email)}
              />
            </div>
            {touched.email && errors.email ? <span className="signin-error">{errors.email}</span> : null}
          </div>

          <div className="signin-field">
            <label htmlFor="signup-password">Create password</label>
            <div className={`signin-input-wrap ${touched.password && errors.password ? 'error' : ''}`}>
              <span className="signin-input-prefix" aria-hidden="true">
                <LeafPrefixIcon />
              </span>
              <input
                id="signup-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                autoComplete="new-password"
                className="signin-input signin-input--password signin-input--with-prefix"
                aria-invalid={Boolean(touched.password && errors.password)}
              />
              <div
                className={`leaf-toggle ${showPassword ? 'is-open' : 'is-closed'} ${leafPulseField === 'password' ? 'is-pulsing' : ''}`}
                role="button"
                tabIndex={0}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => handleTogglePassword('password')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTogglePassword('password');
                  }
                }}
              >
                <div className="leaf-toggle-shape" />
              </div>
            </div>
            {touched.password && errors.password ? <span className="signin-error">{errors.password}</span> : null}

            {form.password ? (
              <div className="strength-wrap signup-strength">
                <div className="strength-head">
                  <span>Strength</span>
                  <span style={{ color: strength.color }}>{strength.label}</span>
                </div>
                <div className="strength-bar">
                  {[0, 1, 2, 3, 4].map((idx) => (
                    <span
                      key={`seg-${idx}`}
                      className="strength-seg"
                      style={{ background: idx < strength.segments ? strength.color : '#dfe8df' }}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="signin-field">
            <label htmlFor="signup-confirm-password">Confirm password</label>
            <div className={`signin-input-wrap ${touched.confirmPassword && errors.confirmPassword ? 'error' : ''}`}>
              <span className="signin-input-prefix" aria-hidden="true">
                <LeafPrefixIcon />
              </span>
              <input
                id="signup-confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                autoComplete="new-password"
                className="signin-input signin-input--password signin-input--with-prefix"
                aria-invalid={Boolean(touched.confirmPassword && errors.confirmPassword)}
              />
              <div
                className={`leaf-toggle ${showConfirmPassword ? 'is-open' : 'is-closed'} ${leafPulseField === 'confirmPassword' ? 'is-pulsing' : ''}`}
                role="button"
                tabIndex={0}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                onClick={() => handleTogglePassword('confirmPassword')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTogglePassword('confirmPassword');
                  }
                }}
              >
                <div className="leaf-toggle-shape" />
              </div>
            </div>
            {touched.confirmPassword && errors.confirmPassword ? <span className="signin-error">{errors.confirmPassword}</span> : null}
          </div>

          <div className="signup-rank-block">
            <div className="signup-rank-label">Choose your starting rank</div>
            <div className="rank-selector-row signup-rank-row">
              {RANKS.map((rank) => (
                <button
                  key={rank.id}
                  type="button"
                  className={`rank-pill ${selectedRank === rank.id ? 'active' : ''}`}
                  onClick={() => setSelectedRank(rank.id)}
                >
                  {rank.label}
                </button>
              ))}
            </div>
          </div>

          <label className="custom-checkbox signin-checkbox signup-checkbox">
            <input
              type="checkbox"
              checked={form.terms}
              onChange={(e) => handleChange('terms', e.target.checked)}
              onBlur={() => handleBlur('terms')}
            />
            <span className="checkbox-indicator" />
            <span>
              I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>
            </span>
          </label>
          {touched.terms && errors.terms ? <p className="signin-error">{errors.terms}</p> : null}

          <div className="xp-bonus-hint signup-bonus-hint">Sign up today and earn +200 XP welcome bonus.</div>

          {formError ? <p className="signin-error signin-error--form">{formError}</p> : null}

          <button type="submit" className="signin-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create My Eco Account'}
          </button>
        </form>

        <p className="signin-footer">
          Already have an account?{' '}
          <button
            type="button"
            className="signin-create-link"
            onClick={() => (onSwitchToLogin ? onSwitchToLogin() : goTo('/login'))}
          >
            Sign in
          </button>
        </p>

        <div className="signin-trust-bar">
          <span>Secure sign up</span>
          <span className="signin-trust-sep">|</span>
          <span>Eco-first platform</span>
          <span className="signin-trust-sep">|</span>
          <span>+200 XP welcome bonus</span>
        </div>
      </div>
    </AuthLayout>
  );
}

export default SignupPage;
