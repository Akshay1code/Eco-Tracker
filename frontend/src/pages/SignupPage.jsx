import { useEffect, useMemo, useState } from 'react';
import SignupMascotPanel from '../components/auth/SignupMascotPanel.jsx';
import { signupUser as signupUserRequest } from '../lib/authApi.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TRANSITION_MS = 320;
const TOTAL_STEPS = 6;
const SCROLLABLE_STEP_IDS = new Set(['credentials']);

const STEP_CONFIG = [
  {
    id: 'name',
    eyebrow: 'Profile Setup',
    title: 'Full Name',
    question: "Hey there! 🌱 I'm Terra! What's your name, eco-warrior?",
    bubbleLines: ["Hey there! 🌱 I'm Terra!", "What's your name,", 'eco-warrior?'],
    animation: 'wave',
    fields: ['name'],
  },
  {
    id: 'dob',
    eyebrow: 'Personal Details',
    title: 'Date of Birth',
    question: "Nice to meet you! When's your birthday? 🎂",
    bubbleLines: ['Nice to meet you!', "When's your", 'birthday? 🎂'],
    animation: 'think',
    fields: ['dob'],
  },
  {
    id: 'nickname',
    eyebrow: 'Your Identity',
    title: 'Nickname',
    question: 'Cool! Do you have a fun nickname for your eco-profile? 🌿',
    bubbleLines: ['Cool! Do you have', 'a fun nickname for', 'your eco-profile? 🌿'],
    animation: 'bounce',
    fields: ['nickname'],
  },
  {
    id: 'city',
    eyebrow: 'Your Location',
    title: 'City',
    question: 'Which city are you saving the planet from? 🏙️',
    bubbleLines: ['Which city are you', 'saving the planet', 'from? 🏙️'],
    animation: 'spin',
    fields: ['city'],
  },
  {
    id: 'country',
    eyebrow: 'Global Community',
    title: 'Country',
    question: 'And your country? Together we go global! 🌍',
    bubbleLines: ['And your country?', 'Together we go', 'global! 🌍'],
    animation: 'cheer',
    fields: ['country'],
  },
  {
    id: 'credentials',
    eyebrow: 'Secure Access',
    title: 'Email & Password',
    question: 'Almost there! Set up your eco-account login 🔐',
    bubbleLines: ['Almost there!', 'Set up your eco-', 'account login 🔐'],
    animation: 'nod',
    fields: ['email', 'password', 'confirmPassword'],
  },
  {
    id: 'done',
    eyebrow: 'Ready To Begin',
    title: 'All Done',
    question: "Welcome to the EcoArmy! 🎉 You've earned +200 XP!",
    bubbleLines: ['Welcome to the', "EcoArmy! 🎉 You've", 'earned +200 XP!'],
    animation: 'jump',
    fields: [],
  },
];

function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

function LeafToggleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="eco-signup-toggle-icon" aria-hidden="true">
      <path
        d="M18.6 4.4c-5.8.5-10.1 3.5-12 8.3-.8 2-.8 4.1-.1 6.3 2.1.7 4.2.6 6.3-.2 4.9-1.9 7.8-6.2 8.3-11.8-.8-.9-1.6-1.8-2.5-2.6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.7 16.1c1.5-2.4 3.8-4.6 6.8-6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

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

function StepCard({
  step,
  form,
  errors,
  touched,
  today,
  showPassword,
  showConfirmPassword,
  googleState,
  onChange,
  onBlur,
  onTogglePassword,
  onGoogleConnect,
}) {
  if (step.id === 'done') {
    return (
      <div className="eco-signup-step-shell">
        <div className="eco-signup-success eco-signup-form-panel eco-signup-form-panel--success">
          <div className="eco-signup-step-header eco-signup-step-header--compact">
            <span className="eco-signup-step-eyebrow">{step.eyebrow}</span>
            <span className="eco-signup-success-badge">+200 XP unlocked</span>
            <h2>Welcome to the EcoArmy</h2>
            <p>
              Terra has your profile ready, your welcome XP is packed, and your first greener streak is waiting.
            </p>
          </div>
          <div className="eco-signup-summary-grid">
            <div className="eco-signup-summary-chip">
              <span>Profile</span>
              <strong>{form.nickname.trim() || form.name.trim()}</strong>
            </div>
            <div className="eco-signup-summary-chip">
              <span>Location</span>
              <strong>{`${form.city.trim()}, ${form.country.trim()}`}</strong>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="eco-signup-step-shell">
      <header className="eco-signup-step-header">
        <span className="eco-signup-step-eyebrow">{step.eyebrow}</span>
        <h2>{step.title}</h2>
        <p>{step.question}</p>
      </header>

      <div className={`eco-signup-form-panel ${step.id === 'credentials' ? 'eco-signup-form-panel--rich' : ''}`}>
        {step.id === 'name' ? (
          <div className="eco-signup-field">
            <label htmlFor="signup-name">Full Name</label>
            <input
              id="signup-name"
              type="text"
              className={`eco-signup-input ${touched.name && errors.name ? 'is-error' : ''}`}
              placeholder="Your full name"
              value={form.name}
              onChange={(event) => onChange('name', event.target.value)}
              onBlur={() => onBlur('name')}
              autoComplete="name"
            />
            {touched.name && errors.name ? <span className="eco-signup-error">{errors.name}</span> : null}
          </div>
        ) : null}

        {step.id === 'dob' ? (
          <div className="eco-signup-field">
            <label htmlFor="signup-dob">Date Of Birth</label>
            <input
              id="signup-dob"
              type="date"
              max={today}
              className={`eco-signup-input ${touched.dob && errors.dob ? 'is-error' : ''}`}
              value={form.dob}
              onChange={(event) => onChange('dob', event.target.value)}
              onBlur={() => onBlur('dob')}
            />
            {touched.dob && errors.dob ? <span className="eco-signup-error">{errors.dob}</span> : null}
          </div>
        ) : null}

        {step.id === 'nickname' ? (
          <div className="eco-signup-field">
            <label htmlFor="signup-nickname">Nickname</label>
            <input
              id="signup-nickname"
              type="text"
              className={`eco-signup-input ${touched.nickname && errors.nickname ? 'is-error' : ''}`}
              placeholder="Your nickname"
              value={form.nickname}
              onChange={(event) => onChange('nickname', event.target.value)}
              onBlur={() => onBlur('nickname')}
              autoComplete="nickname"
            />
            {touched.nickname && errors.nickname ? <span className="eco-signup-error">{errors.nickname}</span> : null}
          </div>
        ) : null}

        {step.id === 'city' ? (
          <div className="eco-signup-field">
            <label htmlFor="signup-city">City</label>
            <input
              id="signup-city"
              type="text"
              className={`eco-signup-input ${touched.city && errors.city ? 'is-error' : ''}`}
              placeholder="Your city"
              value={form.city}
              onChange={(event) => onChange('city', event.target.value)}
              onBlur={() => onBlur('city')}
              autoComplete="address-level2"
            />
            {touched.city && errors.city ? <span className="eco-signup-error">{errors.city}</span> : null}
          </div>
        ) : null}

        {step.id === 'country' ? (
          <div className="eco-signup-field">
            <label htmlFor="signup-country">Country</label>
            <input
              id="signup-country"
              type="text"
              className={`eco-signup-input ${touched.country && errors.country ? 'is-error' : ''}`}
              placeholder="Your country"
              value={form.country}
              onChange={(event) => onChange('country', event.target.value)}
              onBlur={() => onBlur('country')}
              autoComplete="country-name"
            />
            {touched.country && errors.country ? <span className="eco-signup-error">{errors.country}</span> : null}
          </div>
        ) : null}

        {step.id === 'credentials' ? (
          <div className="eco-signup-credentials">
            <div className="eco-signup-social-stack" aria-label="Social sign up">
              <button
                type="button"
                className={`signin-social-btn eco-signup-social-btn ${googleState === 'connected' ? 'is-connected' : ''}`}
                onClick={onGoogleConnect}
                disabled={googleState !== 'default'}
                aria-pressed={googleState !== 'default'}
              >
                <span className={`signin-social-icon-wrap ${googleState === 'rolling' ? 'is-rolling' : ''}`}>
                  <GoogleLogo />
                </span>
                <span className={`signin-social-label ${googleState === 'rolling' ? 'is-rolling' : ''}`}>
                  {googleState === 'connected' ? 'Google connected' : 'Continue with Google'}
                </span>
              </button>

              <div className="eco-signup-divider">
                <span>or continue with email</span>
              </div>
            </div>

            <div className="eco-signup-field">
              <label htmlFor="signup-email">Email Address</label>
              <input
                id="signup-email"
                type="email"
                className={`eco-signup-input ${touched.email && errors.email ? 'is-error' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={(event) => onChange('email', event.target.value)}
                onBlur={() => onBlur('email')}
                autoComplete="email"
              />
              {touched.email && errors.email ? <span className="eco-signup-error">{errors.email}</span> : null}
            </div>

            <div className="eco-signup-field">
              <label htmlFor="signup-password">Create Password</label>
              <div className="eco-signup-input-wrap">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`eco-signup-input eco-signup-input--with-toggle ${touched.password && errors.password ? 'is-error' : ''}`}
                  placeholder="Create password"
                  value={form.password}
                  onChange={(event) => onChange('password', event.target.value)}
                  onBlur={() => onBlur('password')}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="eco-signup-toggle"
                  onClick={() => onTogglePassword('password')}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <LeafToggleIcon />
                </button>
              </div>
              {touched.password && errors.password ? <span className="eco-signup-error">{errors.password}</span> : null}
            </div>

            <div className="eco-signup-field">
              <label htmlFor="signup-confirm-password">Confirm Password</label>
              <div className="eco-signup-input-wrap">
                <input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`eco-signup-input eco-signup-input--with-toggle ${touched.confirmPassword && errors.confirmPassword ? 'is-error' : ''}`}
                  placeholder="Confirm password"
                  value={form.confirmPassword}
                  onChange={(event) => onChange('confirmPassword', event.target.value)}
                  onBlur={() => onBlur('confirmPassword')}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="eco-signup-toggle"
                  onClick={() => onTogglePassword('confirmPassword')}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  <LeafToggleIcon />
                </button>
              </div>
              {touched.confirmPassword && errors.confirmPassword ? <span className="eco-signup-error">{errors.confirmPassword}</span> : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SignupPage({ onSwitchToLogin, onNavigate }) {
  const [form, setForm] = useState({
    name: '',
    dob: '',
    nickname: '',
    city: '',
    country: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [activeStep, setActiveStep] = useState(0);
  const [visibleStep, setVisibleStep] = useState(0);
  const [outgoingStep, setOutgoingStep] = useState(null);
  const [transitionDirection, setTransitionDirection] = useState('forward');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [googleState, setGoogleState] = useState('default');
  const [submitError, setSubmitError] = useState('');

  const today = useMemo(() => getTodayString(), []);
  const currentStep = STEP_CONFIG[activeStep];
  const progressStep = Math.min(activeStep + 1, TOTAL_STEPS);
  const progressValue = activeStep >= TOTAL_STEPS ? 100 : (progressStep / TOTAL_STEPS) * 100;

  useEffect(() => {
    if (!isTransitioning) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setOutgoingStep(null);
      setIsTransitioning(false);
    }, TRANSITION_MS);

    return () => window.clearTimeout(timeout);
  }, [isTransitioning]);

  useEffect(() => {
    if (googleState !== 'rolling') {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setGoogleState('connected');
    }, 620);

    return () => window.clearTimeout(timeout);
  }, [googleState]);

  useEffect(() => {
    document.documentElement.classList.add('signup-page-active');
    document.body.classList.add('signup-page-active');

    return () => {
      document.documentElement.classList.remove('signup-page-active');
      document.body.classList.remove('signup-page-active');
    };
  }, []);

  const goTo = (path) => {
    if (onNavigate) {
      onNavigate(path);
      return;
    }
    window.location.href = path;
  };

  const validateField = (field, value, values = form) => {
    const trimmed = typeof value === 'string' ? value.trim() : value;

    if (['name', 'nickname', 'city', 'country'].includes(field)) {
      if (!trimmed || trimmed.length < 2) {
        return 'Please enter at least 2 characters.';
      }
      return '';
    }

    if (field === 'dob') {
      if (!value) {
        return 'Please choose your date of birth.';
      }
      if (value > today) {
        return 'Date of birth cannot be in the future.';
      }
      return '';
    }

    if (field === 'email') {
      if (!EMAIL_RE.test((value || '').trim())) {
        return 'Enter a valid email address.';
      }
      return '';
    }

    if (field === 'password') {
      if (!value || value.length < 8) {
        return 'Password must be at least 8 characters.';
      }
      return '';
    }

    if (field === 'confirmPassword') {
      if (value !== values.password) {
        return 'Passwords must match.';
      }
      return '';
    }

    return '';
  };

  const handleChange = (field, value) => {
    setSubmitError('');
    setForm((previous) => {
      const nextForm = { ...previous, [field]: value };

      setErrors((previousErrors) => {
        const nextErrors = { ...previousErrors };

        if (touched[field]) {
          nextErrors[field] = validateField(field, value, nextForm);
        }

        if (field === 'password' && touched.confirmPassword) {
          nextErrors.confirmPassword = validateField('confirmPassword', nextForm.confirmPassword, nextForm);
        }

        return nextErrors;
      });

      return nextForm;
    });
  };

  const handleBlur = (field) => {
    setTouched((previous) => ({ ...previous, [field]: true }));
    setErrors((previous) => ({
      ...previous,
      [field]: validateField(field, form[field], form),
    }));
  };

  const runTransition = (nextStep, direction) => {
    if (isTransitioning || nextStep === activeStep || nextStep < 0 || nextStep >= STEP_CONFIG.length) {
      return;
    }

    setTransitionDirection(direction);
    setOutgoingStep(visibleStep);
    setVisibleStep(nextStep);
    setActiveStep(nextStep);
    setIsTransitioning(true);
  };

  const validateCurrentStep = () => {
    const stepFields = currentStep.fields;
    const nextTouched = {};
    const nextErrors = {};

    stepFields.forEach((field) => {
      nextTouched[field] = true;
      nextErrors[field] = validateField(field, form[field], form);
    });

    setTouched((previous) => ({ ...previous, ...nextTouched }));
    setErrors((previous) => ({ ...previous, ...nextErrors }));

    return Object.values(nextErrors).every((value) => !value);
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }
    runTransition(activeStep + 1, 'forward');
  };

  const handleBack = () => {
    runTransition(activeStep - 1, 'back');
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    setSubmitError('');

    try {
      const response = await signupUserRequest({
        name: form.name,
        dob: form.dob,
        nickname: form.nickname,
        city: form.city,
        country: form.country,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      localStorage.setItem('userEmail', response.user.email);
      localStorage.setItem('userName', response.user.name);
      localStorage.setItem('userScore', String(response.welcomeXp ?? response.user.score ?? 200));
      localStorage.setItem('userProfile', JSON.stringify(response.profile));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.removeItem('userPassword');
      goTo('/dashboard');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to create your account right now.');
      setIsFinishing(false);
    }
  };

  const panelsToRender = [
    outgoingStep !== null
      ? {
          stepIndex: outgoingStep,
          state: 'outgoing',
        }
      : null,
    {
      stepIndex: visibleStep,
      state: 'incoming',
    },
  ].filter(Boolean);

  const handleGoogleConnect = () => {
    if (googleState !== 'default') {
      return;
    }
    setGoogleState('rolling');
  };

  return (
    <div className="eco-signup-page">
      <section className="eco-signup-left">
        <SignupMascotPanel step={currentStep} />
      </section>

      <section className="eco-signup-right">
        <div className="eco-signup-right-inner">
          <div className="eco-signup-progress-block">
            <div className="eco-signup-progress-track" aria-hidden="true">
              <span className="eco-signup-progress-fill" style={{ width: `${progressValue}%` }} />
            </div>
            <div className="eco-signup-progress-copy">
              <span>{`Step ${progressStep} of ${TOTAL_STEPS} · ${currentStep.title}`}</span>
              <button
                type="button"
                className="eco-signup-login-link"
                onClick={() => (onSwitchToLogin ? onSwitchToLogin() : goTo('/login'))}
              >
                Sign In
              </button>
            </div>
          </div>

          <div className={`eco-signup-card ${SCROLLABLE_STEP_IDS.has(currentStep.id) ? 'is-scrollable' : ''}`}>
            <form
              className="eco-signup-form-shell"
              onSubmit={(event) => {
                event.preventDefault();
                if (currentStep.id === 'done') {
                  handleFinish();
                  return;
                }
                handleNext();
              }}
            >
              <div
                className={`eco-signup-stage eco-signup-stage--${currentStep.id} ${outgoingStep !== null ? 'is-transitioning' : 'is-static'}`}
              >
                {panelsToRender.map(({ stepIndex, state }) => {
                  const step = STEP_CONFIG[stepIndex];
                  const panelClassName = [
                    'eco-signup-step-panel',
                    `is-${state}`,
                    transitionDirection === 'forward' ? 'dir-forward' : 'dir-back',
                  ].join(' ');

                  return (
                    <div key={`${state}-${step.id}-${stepIndex}`} className={panelClassName}>
                      <div className="eco-signup-step-inner">
                        <StepCard
                          step={step}
                          form={form}
                          errors={errors}
                          touched={touched}
                          today={today}
                          showPassword={showPassword}
                          showConfirmPassword={showConfirmPassword}
                          googleState={googleState}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          onTogglePassword={(field) => {
                            if (field === 'password') {
                              setShowPassword((previous) => !previous);
                              return;
                            }
                            setShowConfirmPassword((previous) => !previous);
                          }}
                          onGoogleConnect={handleGoogleConnect}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="eco-signup-footer-bar">
                <div className="eco-signup-xp-badge">+200 XP welcome bonus</div>

                <div className="eco-signup-actions">
                  {submitError ? <p className="eco-signup-error eco-signup-error--form">{submitError}</p> : null}
                  <button
                    type="button"
                    className="eco-signup-back"
                    onClick={handleBack}
                    disabled={activeStep === 0 || isTransitioning || isFinishing}
                  >
                    ← Back
                  </button>

                  <button
                    type="submit"
                    className="eco-signup-next"
                    disabled={isTransitioning || isFinishing}
                  >
                    {currentStep.id === 'done'
                      ? isFinishing
                        ? 'Starting...'
                        : 'Start Your Eco Journey →'
                      : 'Next →'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SignupPage;
