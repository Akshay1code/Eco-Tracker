import { useEffect, useState } from 'react';
import AuthLayout from '../components/auth/AuthLayout.jsx';

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

function LoginPage({ onSwitchToSignup, onNavigate }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleState, setGoogleState] = useState('default');
  const [showPassword, setShowPassword] = useState(false);
  const [leafPulse, setLeafPulse] = useState(false);

  useEffect(() => {
    if (!leafPulse) return;
    const timeout = window.setTimeout(() => setLeafPulse(false), 220);
    return () => window.clearTimeout(timeout);
  }, [leafPulse]);

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

  const validateField = (name, value) => {
    if (name === 'username') {
      if (!value.trim()) return 'Enter your username or email';
      return '';
    }
    if (name === 'password') {
      if (!value || value.length < 8) return 'Password must be at least 8 characters';
      return '';
    }
    return '';
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, form[field]) }));
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError('');
  };

  const handleGoogleConnect = () => {
    if (googleState !== 'default') return;
    setGoogleState('rolling');
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
    setLeafPulse(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nextErrors = {
      username: validateField('username', form.username),
      password: validateField('password', form.password),
    };
    setErrors(nextErrors);
    setTouched({ username: true, password: true });

    if (nextErrors.username || nextErrors.password) return;

    const storedEmail = localStorage.getItem('userEmail');
    const storedName = localStorage.getItem('userName');
    const storedPassword = localStorage.getItem('userPassword');

    if (!storedEmail || !storedPassword) {
      setFormError('No account found. Please create an account first.');
      return;
    }

    const normalizedInput = form.username.trim().toLowerCase();
    const emailMatch = normalizedInput === storedEmail.trim().toLowerCase();
    const nameMatch = storedName ? normalizedInput === storedName.trim().toLowerCase() : false;

    if ((!emailMatch && !nameMatch) || form.password !== storedPassword) {
      setFormError('Invalid credentials. Please try again.');
      return;
    }

    setIsSubmitting(true);
    window.setTimeout(() => {
      localStorage.setItem('isLoggedIn', 'true');
      goTo('/dashboard');
    }, 900);
  };

  return (
    <AuthLayout mode="login">
      <div className="auth-form-card auth-form-enter signin-panel">
        <header className="auth-header signin-header">
          <h2>Welcome back</h2>
          <p>Sign in to continue your eco journey.</p>
        </header>

        <section className="signin-social-stack" aria-label="Social sign in">
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

        <form onSubmit={handleSubmit} className="signin-form">
          <div className="signin-field">
            <label htmlFor="signin-username">Username</label>
            <div className={`signin-input-wrap ${touched.username && errors.username ? 'error' : ''}`}>
              <span className="signin-input-prefix" aria-hidden="true">
                <LeafPrefixIcon />
              </span>
              <input
                id="signin-username"
                name="username"
                type="text"
                placeholder="Enter your username or email"
                value={form.username}
                onChange={(e) => handleChange('username', e.target.value)}
                onBlur={() => handleBlur('username')}
                autoComplete="username"
                className="signin-input"
                aria-invalid={Boolean(touched.username && errors.username)}
              />
            </div>
            {touched.username && errors.username ? <span className="signin-error">{errors.username}</span> : null}
          </div>

          <div className="signin-field">
            <label htmlFor="signin-password">Password</label>
            <div className={`signin-input-wrap ${touched.password && errors.password ? 'error' : ''}`}>
              <input
                id="signin-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                autoComplete="current-password"
                className="signin-input signin-input--password"
                aria-invalid={Boolean(touched.password && errors.password)}
              />
              <div
                className={`leaf-toggle ${showPassword ? 'is-open' : 'is-closed'} ${leafPulse ? 'is-pulsing' : ''}`}
                role="button"
                tabIndex={0}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={handleTogglePassword}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTogglePassword();
                  }
                }}
              >
                <div className="leaf-toggle-shape" />
              </div>
            </div>
            {touched.password && errors.password ? <span className="signin-error">{errors.password}</span> : null}
          </div>

          <div className="signin-inline-row">
            <label className="custom-checkbox signin-checkbox">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="checkbox-indicator" />
              <span>Remember me</span>
            </label>
            <button type="button" className="signin-forgot-btn">Forgot password?</button>
          </div>

          {formError ? <p className="signin-error signin-error--form">{formError}</p> : null}

          <button type="submit" className="signin-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="signin-footer">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            className="signin-create-link"
            onClick={() => (onSwitchToSignup ? onSwitchToSignup() : goTo('/signup'))}
          >
            Create one
          </button>
        </p>

        <div className="signin-trust-bar">
          <span>Secure login</span>
          <span className="signin-trust-sep">|</span>
          <span>Eco-first platform</span>
          <span className="signin-trust-sep">|</span>
          <span>12K+ members</span>
        </div>
      </div>
    </AuthLayout>
  );
}

export default LoginPage;
