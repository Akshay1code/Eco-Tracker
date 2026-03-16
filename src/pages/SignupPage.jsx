import { useMemo, useState } from 'react';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import SocialAuthButton from '../components/auth/SocialAuthButton.jsx';
import FormInput from '../components/auth/FormInput.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RANKS = [
  { id: 'seedling', label: '🌱 Seedling' },
  { id: 'walker', label: '🌿 Eco Walker' },
  { id: 'guardian', label: '🌳 Guardian' },
  { id: 'protector', label: '🏆 Protector' },
];

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

  const strength = useMemo(() => getPasswordStrength(form.password), [form.password]);

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
      localStorage.setItem('userProfile', JSON.stringify({
        name: form.name.trim(),
        rank: selectedRank,
      }));
      localStorage.setItem('isLoggedIn', 'true');
      goTo('/dashboard');
    }, 1000);
  };

  return (
    <AuthLayout mode="signup">
      <div className="auth-form-card auth-form-enter">
        <header className="auth-header">
          <h2>Create your account 🌱</h2>
          <p>Start tracking your carbon footprint today</p>
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
          <div className="auth-form-fields compact">
            <FormInput
              label="Full name"
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              icon="🧑"
              error={touched.name ? errors.name : ''}
              autoComplete="name"
            />

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
              label="Create password"
              type="password"
              placeholder="Create password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              icon="🔒"
              error={touched.password ? errors.password : ''}
              autoComplete="new-password"
            />

            {form.password ? (
              <div className="strength-wrap">
                <div className="strength-head">
                  <span>Strength:</span>
                  <span style={{ color: strength.color }}>{strength.label}</span>
                </div>
                <div className="strength-bar">
                  {[0, 1, 2, 3, 4].map((idx) => (
                    <span
                      key={`seg-${idx}`}
                      className="strength-seg"
                      style={{ background: idx < strength.segments ? strength.color : '#e5e7eb' }}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            <FormInput
              label="Confirm password"
              type="password"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              icon="🔒"
              error={touched.confirmPassword ? errors.confirmPassword : ''}
              autoComplete="new-password"
            />
          </div>

          <div className="rank-selector">
            <div className="rank-selector-label">Choose your starting rank 🌱</div>
            <div className="rank-selector-row">
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

          <label className="custom-checkbox terms">
            <input
              type="checkbox"
              checked={form.terms}
              onChange={(e) => handleChange('terms', e.target.checked)}
              onBlur={() => handleBlur('terms')}
            />
            <span className="checkbox-indicator" />
            <span>
              I agree to the{' '}
              <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>
            </span>
          </label>
          {touched.terms && errors.terms ? <p className="form-input-error">{errors.terms}</p> : null}

          <div className="xp-bonus-hint">🎁 Sign up today and earn +200 XP Welcome Bonus!</div>

          {formError ? <p className="auth-form-error">{formError}</p> : null}

          <button type="submit" className="auth-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account... 🌱' : 'Create My Eco Account 🌿'}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account?{' '}
          <button
            type="button"
            className="auth-footer-link"
            onClick={() => (onSwitchToLogin ? onSwitchToLogin() : goTo('/login'))}
          >
            Sign in →
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}

export default SignupPage;
