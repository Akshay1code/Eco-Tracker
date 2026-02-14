import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function GamifiedSignup() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('intro');
  const [storyStep, setStoryStep] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [direction, setDirection] = useState('forward');
  const [score, setScore] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [combo, setCombo] = useState(0);
  const [showAchievement, setShowAchievement] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    dob: '',
    education: '',
    institution: '',
    sex: '',
    interests: [],
    bio: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const interestOptions = [
    'Coding', 'Gaming', 'Music', 'Sports', 'Reading', 
    'Photography', 'Traveling', 'Cooking', 'Art & Design',
    'Fitness', 'Movies & TV', 'Tech & Gadgets'
  ];

  const achievementsList = [
    { id: 'first-step', name: 'First Step', icon: '🎯', description: 'Journey begins', points: 10 },
    { id: 'halfway', name: 'Halfway Hero', icon: '⚡', description: '50% complete', points: 25 },
    { id: 'passionate', name: 'Multi-talented', icon: '🌟', description: '5+ interests', points: 15 },
    { id: 'speedster', name: 'Efficiency Master', icon: '🚀', description: 'Under 2 minutes', points: 30 },
    { id: 'complete', name: 'Journey Complete', icon: '🏆', description: 'Signup finished', points: 50 }
  ];

  const questions = [
    { id: 'name', question: "What's your name?", subtitle: "Let's start with the basics", type: 'text', placeholder: 'Alex Jordan', icon: '👤', required: true, points: 10 },
    { id: 'nickname', question: "Preferred nickname?", subtitle: "Optional — something you go by", type: 'text', placeholder: 'AJ, Tech Explorer, etc.', icon: '✨', optional: true, points: 5 },
    { id: 'dob', question: "When's your birthday?", subtitle: "We'll send you a surprise", type: 'date', icon: '🎂', required: true, points: 10 },
    { id: 'education', question: "Current status?", subtitle: "What stage are you at?", type: 'select', options: ['Undergraduate', 'Graduate Student', 'Recent Graduate', 'Professional', 'Freelancer', 'Entrepreneur', 'Other'], icon: '🎓', required: true, points: 10 },
    { id: 'institution', question: "Where are you based?", subtitle: "Organization, university, or company", type: 'text', placeholder: 'Stanford, Google, Self-employed', icon: '🏛️', required: true, points: 10 },
    { id: 'sex', question: "Preferred identity", subtitle: "Help us personalize your experience", type: 'choice', options: ['Male', 'Female', 'Non-binary', 'Prefer not to say'], icon: '🌈', required: true, points: 10 },
    { id: 'interests', question: "What interests you?", subtitle: "Select all that apply", type: 'multi-select', options: interestOptions, icon: '⭐', required: false, points: 15 },
    { id: 'bio', question: "Tell us about yourself", subtitle: "Optional — share your story", type: 'textarea', placeholder: 'Your passions, goals, or what brings you here...', icon: '📖', optional: true, points: 20 },
    { id: 'credentials', question: "Create your account", subtitle: "Secure credentials for access", type: 'credentials', icon: '🔐', required: true, points: 25 }
  ];

  const storyPhases = [
    { icon: '🎯', title: "Welcome", description: "Let's begin your journey together" },
    { icon: '✨', title: "Discovery", description: "Help us understand who you are" },
    { icon: '🚀', title: "Launch", description: "Ready to get started?" }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase('story-phases');
      setStoryStep(0);
      startStorySequence();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const startStorySequence = () => {
    const t1 = setTimeout(() => setStoryStep(1), 1800);
    const t2 = setTimeout(() => setStoryStep(2), 3600);
    const t3 = setTimeout(() => {
      setPhase('questions');
      unlockAchievementDirect('first-step');
    }, 5400);
    return () => [t1, t2, t3].forEach(clearTimeout);
  };

  const skipToQuestions = () => {
    setPhase('questions');
    unlockAchievementDirect('first-step');
  };

  const unlockAchievementDirect = (achievementId) => {
    const achievement = achievementsList.find(a => a.id === achievementId);
    if (achievement) {
      setAchievements(prev => {
        if (prev.includes(achievementId)) return prev;
        setShowAchievement(achievement);
        setScore(s => s + achievement.points);
        setShowConfetti(true);
        setTimeout(() => setShowAchievement(null), 3000);
        setTimeout(() => setShowConfetti(false), 2000);
        return [...prev, achievementId];
      });
    }
  };

  const unlockAchievement = (achievementId) => {
    unlockAchievementDirect(achievementId);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 300);
  };

  const handleInterestToggle = (interest) => {
    const newInterests = formData.interests.includes(interest)
      ? formData.interests.filter(i => i !== interest)
      : [...formData.interests, interest];
    setFormData(prev => ({ ...prev, interests: newInterests }));
    if (newInterests.length >= 5 && !achievements.includes('passionate')) {
      unlockAchievement('passionate');
    }
  };

  const validateCurrentQuestion = () => {
    const current = questions[currentQuestion];
    if (current.optional) return true;
    switch (current.type) {
      case 'text':
      case 'date':
      case 'select':
        if (!formData[current.id]) { setError('This field is required'); return false; }
        break;
      case 'choice':
        if (!formData[current.id]) { setError('Please make a selection'); return false; }
        break;
      case 'credentials':
        if (!formData.email || !formData.password || !formData.confirmPassword) { 
          setError('All fields are required'); return false; 
        }
        if (formData.password !== formData.confirmPassword) { 
          setError('Passwords do not match'); return false; 
        }
        if (formData.password.length < 6) { 
          setError('Password must be at least 6 characters'); return false; 
        }
        if (!formData.email.includes('@')) { 
          setError('Please enter a valid email'); return false; 
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentQuestion()) return;
    setError('');
    const currentQ = questions[currentQuestion];
    setScore(s => s + currentQ.points);
    setCombo(c => c + 1);
    if (currentQuestion === Math.floor(questions.length / 2) && !achievements.includes('halfway')) {
      unlockAchievement('halfway');
    }
    if (currentQuestion < questions.length - 1) {
      setDirection('forward');
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 50);
    } else {
      completeSignup();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setDirection('backward');
      setError('');
      setTimeout(() => setCurrentQuestion(currentQuestion - 1), 50);
    }
  };

  const handleSkip = () => {
    const current = questions[currentQuestion];
    if (current.optional && currentQuestion < questions.length - 1) {
      setDirection('forward');
      setError('');
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 50);
    }
  };

  const completeSignup = () => {
    unlockAchievement('complete');
    localStorage.setItem('userEmail', formData.email);
    localStorage.setItem('userPassword', formData.password);
    localStorage.setItem('userName', formData.name);
    localStorage.setItem('userScore', score.toString());
    localStorage.setItem('userProfile', JSON.stringify({
      name: formData.name,
      nickname: formData.nickname,
      dob: formData.dob,
      education: formData.education,
      institution: formData.institution,
      sex: formData.sex,
      interests: formData.interests,
      bio: formData.bio
    }));
    setPhase('success');
    setTimeout(() => {
      localStorage.setItem('isLoggedIn', 'true');
      navigate('/dashboard');
    }, 4000);
  };

  const renderInput = () => {
    const current = questions[currentQuestion];
    switch (current.type) {
      case 'text':
      case 'date':
        return (
          <input
            type={current.type}
            value={formData[current.id]}
            onChange={(e) => handleInputChange(current.id, e.target.value)}
            placeholder={current.placeholder}
            className={`input-field ${isTyping ? 'typing' : ''}`}
            autoFocus
          />
        );
      case 'select':
        return (
          <select
            value={formData[current.id]}
            onChange={(e) => handleInputChange(current.id, e.target.value)}
            className="select-field"
            autoFocus
          >
            <option value="">Choose an option...</option>
            {current.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'choice':
        return (
          <div className="choice-grid">
            {current.options.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => handleInputChange(current.id, option)}
                className={`choice-btn ${formData[current.id] === option ? 'selected' : ''}`}
              >
                {option}
              </button>
            ))}
          </div>
        );
      case 'multi-select':
        return (
          <div className="interest-grid">
            {current.options.map(interest => (
              <button
                key={interest}
                type="button"
                onClick={() => handleInterestToggle(interest)}
                className={`interest-btn ${formData.interests.includes(interest) ? 'selected' : ''}`}
              >
                <span className="interest-check">
                  {formData.interests.includes(interest) && '✓'}
                </span>
                <span className="interest-label">{interest}</span>
              </button>
            ))}
          </div>
        );
      case 'textarea':
        return (
          <textarea
            value={formData[current.id]}
            onChange={(e) => handleInputChange(current.id, e.target.value)}
            placeholder={current.placeholder}
            className={`textarea-field ${isTyping ? 'typing' : ''}`}
            rows="5"
            autoFocus
          />
        );
      case 'credentials':
        return (
          <div className="credentials-grid">
            <div className="field-group">
              <label>Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your.email@example.com"
                className="input-field"
                required
              />
            </div>
            <div className="field-group">
              <label>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Minimum 6 characters"
                className="input-field"
                required
              />
            </div>
            <div className="field-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Re-enter password"
                className="input-field"
                required
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const progress = phase === 'questions' ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  return (
    <div className="signup-container">
      {/* Confetti */}
      {showConfetti && (
        <div className="confetti-layer">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe'][Math.floor(Math.random() * 5)]
              }}
            />
          ))}
        </div>
      )}

      {/* Achievement Notification */}
      {showAchievement && (
        <div className="achievement-notification">
          <div className="achievement-icon-large">{showAchievement.icon}</div>
          <div className="achievement-details">
            <div className="achievement-label">Achievement Unlocked</div>
            <div className="achievement-name">{showAchievement.name}</div>
            <div className="achievement-xp">+{showAchievement.points} XP</div>
          </div>
        </div>
      )}

      {/* Score Display */}
      {phase === 'questions' && (
        <div className="score-badge">
          <div className="score-icon">🏆</div>
          <div className="score-text">{score} XP</div>
          {combo > 1 && <div className="combo-indicator">{combo}x</div>}
        </div>
      )}

      {/* Background */}
      <div className="background-layer">
        <div className="gradient-mesh"></div>
        <div className="floating-shapes">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`shape shape-${i + 1}`} />
          ))}
        </div>
      </div>

      {/* Intro Phase */}
      {phase === 'intro' && (
        <div className="phase-container intro-phase">
          <div className="intro-card">
            <div className="intro-icon-wrap">
              <div className="intro-icon">🎮</div>
            </div>
            <h1 className="intro-title">Welcome</h1>
            <p className="intro-subtitle">Your journey begins now</p>
            <div className="loading-indicator">
              <div className="loading-bar"></div>
            </div>
          </div>
        </div>
      )}

      {/* Story Phases */}
      {phase === 'story-phases' && (
        <div className="phase-container story-phase">
          <div className="story-card" key={storyStep}>
            <div className="phase-badge">Step {storyStep + 1} of 3</div>
            <div className="phase-icon">{storyPhases[storyStep].icon}</div>
            <h2 className="phase-title">{storyPhases[storyStep].title}</h2>
            <p className="phase-desc">{storyPhases[storyStep].description}</p>
            <div className="phase-indicators">
              {storyPhases.map((_, idx) => (
                <div
                  key={idx}
                  className={`indicator ${idx === storyStep ? 'active' : idx < storyStep ? 'done' : ''}`}
                />
              ))}
            </div>
          </div>
          <button className="skip-btn" onClick={skipToQuestions}>
            Begin →
          </button>
        </div>
      )}

      {/* Questions Phase */}
      {phase === 'questions' && (
        <div className="questions-container">
          {/* Progress Bar */}
          <div className="progress-wrapper">
            <div className="progress-track">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
              <div className="progress-markers">
                {questions.map((_, idx) => (
                  <div
                    key={idx}
                    className={`marker ${currentQuestion >= idx ? 'active' : ''}`}
                    style={{ left: `${(idx / (questions.length - 1)) * 100}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="progress-label">
              Question {currentQuestion + 1} of {questions.length}
            </div>
          </div>

          {/* Question Card */}
          <div className="question-card">
            <div
              className={`question-content ${direction === 'forward' ? 'slide-forward' : 'slide-backward'}`}
              key={currentQuestion}
            >
              <div className="question-icon">{questions[currentQuestion].icon}</div>
              <div className="question-header">
                <h2 className="question-title">{questions[currentQuestion].question}</h2>
                <p className="question-subtitle">{questions[currentQuestion].subtitle}</p>
              </div>

              {error && (
                <div className="error-message">
                  <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="input-wrapper">{renderInput()}</div>

              <div className="nav-buttons">
                {currentQuestion > 0 && (
                  <button onClick={handleBack} className="nav-btn back" type="button">
                    ← Back
                  </button>
                )}
                <button onClick={handleNext} className="nav-btn next" type="button">
                  {currentQuestion < questions.length - 1 ? 'Continue' : 'Complete'} →
                </button>
              </div>

              {questions[currentQuestion].optional && currentQuestion < questions.length - 1 && (
                <button onClick={handleSkip} className="skip-link">
                  Skip this question
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Phase */}
      {phase === 'success' && (
        <div className="success-container">
          <div className="success-card">
            <div className="success-icon-wrap">
              <div className="trophy-glow"></div>
              <div className="success-icon">🏆</div>
            </div>
            <h2 className="success-title">Congratulations!</h2>
            <div className="final-score-display">
              <div className="final-score-label">Total XP Earned</div>
              <div className="final-score-value">{score}</div>
            </div>
            <p className="success-message">Your account has been created successfully</p>
            <div className="achievement-showcase">
              {achievements.map(achId => {
                const ach = achievementsList.find(a => a.id === achId);
                return ach ? (
                  <div key={achId} className="achievement-badge">
                    <span>{ach.icon}</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .signup-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Sora', -apple-system, sans-serif;
          position: relative;
          overflow: hidden;
          padding: 24px;
        }

        /* ===== BACKGROUND ===== */
        .background-layer {
          position: fixed;
          inset: 0;
          z-index: 0;
        }

        .gradient-mesh {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse at 20% 30%, rgba(102, 126, 234, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(118, 75, 162, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(240, 147, 251, 0.1) 0%, transparent 50%),
            linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          animation: meshMove 20s ease-in-out infinite;
        }

        @keyframes meshMove {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        .floating-shapes {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .shape {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.4;
          animation: float 15s ease-in-out infinite;
        }

        .shape-1 { width: 300px; height: 300px; background: #667eea; top: 10%; left: 10%; animation-delay: 0s; }
        .shape-2 { width: 250px; height: 250px; background: #764ba2; top: 60%; right: 10%; animation-delay: 2s; }
        .shape-3 { width: 200px; height: 200px; background: #f093fb; bottom: 20%; left: 20%; animation-delay: 4s; }
        .shape-4 { width: 280px; height: 280px; background: #4facfe; top: 40%; right: 30%; animation-delay: 1s; }
        .shape-5 { width: 220px; height: 220px; background: #00f2fe; bottom: 40%; right: 40%; animation-delay: 3s; }
        .shape-6 { width: 260px; height: 260px; background: #667eea; top: 70%; left: 40%; animation-delay: 5s; }
        .shape-7 { width: 190px; height: 190px; background: #764ba2; top: 20%; right: 50%; animation-delay: 2.5s; }
        .shape-8 { width: 240px; height: 240px; background: #f093fb; bottom: 10%; left: 60%; animation-delay: 4.5s; }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -30px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(40px, 10px) scale(1.05); }
        }

        /* ===== CONFETTI ===== */
        .confetti-layer {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 9999;
        }

        .confetti-piece {
          position: absolute;
          width: 8px;
          height: 12px;
          top: -20px;
          animation: confettiFall 3s ease-out forwards;
        }

        @keyframes confettiFall {
          to { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }

        /* ===== ACHIEVEMENT NOTIFICATION ===== */
        .achievement-notification {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 9998;
          display: flex;
          align-items: center;
          gap: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 16px 24px;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(102, 126, 234, 0.4);
          animation: slideInRight 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        @keyframes slideInRight {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        .achievement-icon-large {
          font-size: 48px;
          animation: bounce 0.6s ease infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .achievement-details {
          color: white;
        }

        .achievement-label {
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 800;
          letter-spacing: 1.2px;
          opacity: 0.9;
        }

        .achievement-name {
          font-size: 18px;
          font-weight: 800;
          margin: 4px 0;
        }

        .achievement-xp {
          font-size: 14px;
          font-weight: 700;
          color: #ffd93d;
        }

        /* ===== SCORE BADGE ===== */
        .score-badge {
          position: fixed;
          top: 24px;
          left: 24px;
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 12px;
          background: white;
          padding: 12px 20px;
          border-radius: 100px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          border: 2px solid #ffd93d;
        }

        .score-icon {
          font-size: 24px;
        }

        .score-text {
          font-size: 18px;
          font-weight: 800;
          color: #1a202c;
        }

        .combo-indicator {
          position: absolute;
          top: -8px;
          right: -8px;
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          color: white;
          font-size: 11px;
          font-weight: 800;
          padding: 4px 8px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(238, 90, 36, 0.4);
        }

        /* ===== PHASE CONTAINERS ===== */
        .phase-container {
          position: relative;
          z-index: 100;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
          animation: fadeIn 0.6s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* ===== INTRO PHASE ===== */
        .intro-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 32px;
          padding: 60px 50px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.5);
        }

        .intro-icon-wrap {
          margin-bottom: 24px;
        }

        .intro-icon {
          font-size: 80px;
          animation: scaleIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        @keyframes scaleIn {
          from { transform: scale(0) rotate(-180deg); opacity: 0; }
          to { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        .intro-title {
          font-size: 48px;
          font-weight: 800;
          color: #1a202c;
          margin-bottom: 12px;
          letter-spacing: -1px;
        }

        .intro-subtitle {
          font-size: 18px;
          color: #718096;
          margin-bottom: 32px;
        }

        .loading-indicator {
          width: 200px;
          height: 4px;
          background: #e2e8f0;
          border-radius: 4px;
          margin: 0 auto;
          overflow: hidden;
        }

        .loading-bar {
          height: 100%;
          background: linear-gradient(90deg, #667eea, #764ba2);
          background-size: 200% 100%;
          animation: loadingProgress 2s ease-out forwards;
        }

        @keyframes loadingProgress {
          from { width: 0%; }
          to { width: 100%; }
        }

        /* ===== STORY PHASE ===== */
        .story-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          border-radius: 28px;
          padding: 48px 40px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.5);
          max-width: 500px;
          width: 100%;
          animation: fadeSlideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .phase-badge {
          display: inline-block;
          padding: 6px 16px;
          background: rgba(102, 126, 234, 0.1);
          border: 1px solid rgba(102, 126, 234, 0.3);
          border-radius: 20px;
          color: #667eea;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 24px;
        }

        .phase-icon {
          font-size: 72px;
          margin-bottom: 20px;
          animation: iconPulse 2s ease-in-out infinite;
        }

        @keyframes iconPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .phase-title {
          font-size: 32px;
          font-weight: 800;
          color: #1a202c;
          margin-bottom: 12px;
          letter-spacing: -0.5px;
        }

        .phase-desc {
          font-size: 16px;
          color: #718096;
          line-height: 1.6;
          margin-bottom: 28px;
        }

        .phase-indicators {
          display: flex;
          justify-content: center;
          gap: 8px;
        }

        .indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #cbd5e0;
          transition: all 0.3s ease;
        }

        .indicator.done {
          background: #667eea;
        }

        .indicator.active {
          width: 24px;
          border-radius: 4px;
          background: #667eea;
        }

        .skip-btn {
          padding: 14px 32px;
          background: rgba(255, 255, 255, 0.9);
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          color: #1a202c;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Sora', sans-serif;
        }

        .skip-btn:hover {
          background: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        /* ===== QUESTIONS PHASE ===== */
        .questions-container {
          position: relative;
          z-index: 50;
          width: 100%;
          max-width: 600px;
          animation: slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(60px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .progress-wrapper {
          margin-bottom: 28px;
        }

        .progress-track {
          height: 8px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 8px;
          overflow: visible;
          margin-bottom: 12px;
          position: relative;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 8px;
          transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
        }

        .progress-markers {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .marker {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 12px;
          height: 12px;
          background: white;
          border: 2px solid #cbd5e0;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .marker.active {
          background: #667eea;
          border-color: #667eea;
          box-shadow: 0 0 12px rgba(102, 126, 234, 0.6);
          transform: translate(-50%, -50%) scale(1.2);
        }

        .progress-label {
          text-align: center;
          color: #1a202c;
          font-size: 14px;
          font-weight: 700;
        }

        .question-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 28px;
          padding: 44px 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.5);
        }

        .question-content {
          min-height: 420px;
          display: flex;
          flex-direction: column;
        }

        .slide-forward {
          animation: slideForward 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .slide-backward {
          animation: slideBackward 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes slideForward {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes slideBackward {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .question-icon {
          font-size: 64px;
          text-align: center;
          margin-bottom: 24px;
          animation: iconBounce 3s ease-in-out infinite;
        }

        @keyframes iconBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .question-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .question-title {
          font-size: 26px;
          color: #1a202c;
          margin-bottom: 8px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .question-subtitle {
          font-size: 15px;
          color: #718096;
          line-height: 1.5;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          background: rgba(254, 226, 226, 0.9);
          border: 1px solid #feb2b2;
          border-radius: 12px;
          color: #c53030;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 24px;
          animation: shake 0.5s ease;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }

        .error-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .input-wrapper {
          margin-bottom: 28px;
          flex: 1;
        }

        .input-field,
        .select-field,
        .textarea-field {
          width: 100%;
          padding: 16px 18px;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          color: #1a202c;
          font-size: 16px;
          font-family: 'Sora', sans-serif;
          transition: all 0.3s ease;
        }

        .input-field:focus,
        .select-field:focus,
        .textarea-field:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .input-field.typing,
        .textarea-field.typing {
          border-color: #667eea;
        }

        .select-field {
          cursor: pointer;
        }

        .textarea-field {
          resize: vertical;
          min-height: 120px;
        }

        .choice-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .choice-btn {
          padding: 18px;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 700;
          color: #4a5568;
          font-size: 16px;
          font-family: 'Sora', sans-serif;
          transition: all 0.3s ease;
        }

        .choice-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
        }

        .choice-btn.selected {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-color: #667eea;
          transform: translateY(-2px);
        }

        .interest-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .interest-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 18px;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 700;
          color: #4a5568;
          font-size: 15px;
          font-family: 'Sora', sans-serif;
          transition: all 0.3s ease;
        }

        .interest-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .interest-btn.selected {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-color: #667eea;
        }

        .interest-check {
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
        }

        .interest-label {
          font-size: 14px;
        }

        .credentials-grid {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .field-group label {
          display: block;
          margin-bottom: 8px;
          color: #2d3748;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .nav-buttons {
          display: flex;
          gap: 12px;
          margin-top: auto;
        }

        .nav-btn {
          flex: 1;
          padding: 18px;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 16px;
          font-family: 'Sora', sans-serif;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .nav-btn.back {
          background: white;
          color: #4a5568;
          border: 2px solid #e2e8f0;
        }

        .nav-btn.back:hover {
          background: #f7fafc;
          transform: translateY(-2px);
        }

        .nav-btn.next {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }

        .nav-btn.next:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        .skip-link {
          margin-top: 16px;
          padding: 0;
          background: none;
          border: none;
          color: #718096;
          font-weight: 600;
          font-size: 14px;
          font-family: 'Sora', sans-serif;
          cursor: pointer;
          text-align: center;
          width: 100%;
          opacity: 0.8;
          transition: opacity 0.2s ease;
        }

        .skip-link:hover {
          opacity: 1;
        }

        /* ===== SUCCESS PHASE ===== */
        .success-container {
          position: fixed;
          inset: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.8s ease;
        }

        .success-card {
          text-align: center;
          color: white;
          position: relative;
          z-index: 10;
        }

        .success-icon-wrap {
          width: 140px;
          height: 140px;
          background: white;
          border-radius: 50%;
          margin: 0 auto 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          animation: popIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
        }

        .trophy-glow {
          position: absolute;
          inset: -15px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, transparent, rgba(255, 215, 0, 0.3), transparent);
          animation: trophyRotate 3s linear infinite;
        }

        @keyframes trophyRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .success-icon {
          font-size: 70px;
          position: relative;
          z-index: 1;
        }

        @keyframes popIn {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          50% { transform: scale(1.15) rotate(0deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        .success-title {
          font-size: 48px;
          font-weight: 800;
          margin-bottom: 20px;
          letter-spacing: -1px;
        }

        .final-score-display {
          margin: 20px 0 28px;
        }

        .final-score-label {
          font-size: 14px;
          font-weight: 700;
          opacity: 0.9;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .final-score-value {
          font-size: 56px;
          font-weight: 900;
          color: #ffd93d;
        }

        .success-message {
          font-size: 18px;
          opacity: 0.95;
          margin-bottom: 28px;
        }

        .achievement-showcase {
          display: flex;
          justify-content: center;
          gap: 12px;
        }

        .achievement-badge {
          width: 54px;
          height: 54px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(255, 255, 255, 0.3);
          font-size: 28px;
          animation: badgePop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }

        @keyframes badgePop {
          0% { transform: scale(0) rotate(-90deg); }
          100% { transform: scale(1) rotate(0deg); }
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 768px) {
          .signup-container {
            padding: 16px;
          }

          .score-badge,
          .achievement-notification {
            top: 16px;
            left: 16px;
            right: 16px;
          }

          .achievement-notification {
            left: auto;
          }

          .intro-card,
          .story-card,
          .question-card {
            padding: 36px 28px;
          }

          .intro-title {
            font-size: 38px;
          }

          .phase-title {
            font-size: 28px;
          }

          .question-title {
            font-size: 22px;
          }

          .question-content {
            min-height: 380px;
          }

          .choice-grid {
            grid-template-columns: 1fr;
          }

          .nav-btn {
            padding: 16px;
            font-size: 15px;
          }

          .success-title {
            font-size: 38px;
          }

          .final-score-value {
            font-size: 48px;
          }
        }

        @media (max-width: 480px) {
          .intro-icon {
            font-size: 64px;
          }

          .intro-title {
            font-size: 32px;
          }

          .phase-icon {
            font-size: 56px;
          }

          .phase-title {
            font-size: 24px;
          }

          .question-icon {
            font-size: 52px;
          }

          .question-title {
            font-size: 20px;
          }

          .interest-btn {
            font-size: 14px;
            padding: 10px 14px;
          }
        }
      `}</style>
    </div>
  );
}
