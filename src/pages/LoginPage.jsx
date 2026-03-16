import { useState } from 'react';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import SocialAuthButton from '../components/auth/SocialAuthButton.jsx';
import FormInput from '../components/auth/FormInput.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginPage({ onSwitchToSignup, onNavigate }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const goTo = (path) => {
    if (onNavigate) {
      onNavigate(path);
      return;
    }
    window.location.href = path;
  };

  const validateField = (name, value) => {
    if (name === 'email') {
      if (!EMAIL_RE.test(value.trim())) return 'Enter a valid email address';
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const nextErrors = {
      email: validateField('email', form.email),
      password: validateField('password', form.password),
    };
    setErrors(nextErrors);
    setTouched({ email: true, password: true });

    if (nextErrors.email || nextErrors.password) return;

    const storedEmail = localStorage.getItem('userEmail');
    const storedPassword = localStorage.getItem('userPassword');
    if (!storedEmail || !storedPassword) {
      setFormError('No account found. Please create an account first.');
      return;
    }

    if (form.email.trim() !== storedEmail || form.password !== storedPassword) {
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
      <div className="auth-form-card auth-form-enter">
        <header className="auth-header">
          <h2>Welcome back 🌿</h2>
          <p>Sign in to continue your eco journey</p>
        </header>

        <div className="auth-social-stack">
          <SocialAuthButton provider="google" onClick={() => {}} />
          <SocialAuthButton provider="apple" onClick={() => {}} />
        </div>

        <div className="auth-divider">
          <hr />
          <span>or continue with email</span>
          <hr />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="auth-form-fields">
            <FormInput
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              icon="📧"
              error={touched.email ? errors.email : ''}
              autoComplete="email"
            />

            <FormInput
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              icon="🔒"
              error={touched.password ? errors.password : ''}
              autoComplete="current-password"
            />
          </div>

          <div className="auth-inline-row">
            <label className="custom-checkbox">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="checkbox-indicator" />
              <span>Remember me</span>
            </label>
            <button type="button" className="auth-link-btn">Forgot password?</button>
          </div>

          {formError ? <p className="auth-form-error">{formError}</p> : null}

          <button type="submit" className="auth-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in... 🌿' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer-text">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            className="auth-footer-link"
            onClick={() => (onSwitchToSignup ? onSwitchToSignup() : goTo('/signup'))}
          >
            Join EcoJourney →
          </button>
        </p>

        <div className="auth-trust-row">
          <span className="trust-badge">🔒 Secure login</span>
          <span className="trust-dot">·</span>
          <span className="trust-badge">🌿 Eco-first platform</span>
          <span className="trust-dot">·</span>
          <span className="trust-badge">🌍 12K+ members</span>
        </div>
      </div>
    </AuthLayout>
  );
}

export default LoginPage;
