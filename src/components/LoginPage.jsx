import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EnhancedLoginWithStory() {
  const navigate = useNavigate();
  const [storyPhase, setStoryPhase] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode] = useState('login');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      navigate('/dashboard');
    } else {
      const timer1 = setTimeout(() => setStoryPhase(1), 1000);
      const timer2 = setTimeout(() => setStoryPhase(2), 3000);
      const timer3 = setTimeout(() => setStoryPhase(3), 5000);
      const timer4 = setTimeout(() => {
        setStoryPhase(4);
        setShowAuth(true);
      }, 7000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }
  }, [navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    
    const storedEmail = localStorage.getItem('userEmail');
    const storedPassword = localStorage.getItem('userPassword');

    if (!storedEmail || !storedPassword) {
      setError('No account found. Please create an account first.');
      return;
    }

    if (formData.email !== storedEmail || formData.password !== storedPassword) {
      setError('Invalid credentials. Please try again.');
      return;
    }

    setSuccess(true);
    
    setTimeout(() => {
      localStorage.setItem('isLoggedIn', 'true');
      navigate('/dashboard');
    }, 2000);
  };

  const skipStory = () => {
    setStoryPhase(4);
    setShowAuth(true);
  };

  // ✅ FIX: Navigate to Signup.jsx instead of doing in-component story
  const goToSignup = () => {
    navigate('/signup');
  };

  return (
    <div className="enhanced-login-container">
      {/* ATMOSPHERIC BACKGROUND */}
      <div className="sky-background">
        <div className="sun"></div>
        <div className="sun-rays"></div>
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        
        <div className="aurora aurora-1"></div>
        <div className="aurora aurora-2"></div>
        
        <div className="starfield">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="star" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}></div>
          ))}
        </div>
        
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`shooting-star star-${i + 1}`}></div>
        ))}

        {[...Array(8)].map((_, i) => (
          <div key={i} className={`cloud cloud-${i + 1}`}></div>
        ))}

        {[...Array(5)].map((_, i) => (
          <div key={i} className={`bird bird-${i + 1}`}>
            <div className="bird-wing wing-left"></div>
            <div className="bird-wing wing-right"></div>
          </div>
        ))}

        {[...Array(15)].map((_, i) => (
          <div key={i} className="firefly" style={{
            left: `${Math.random() * 100}%`,
            top: `${50 + Math.random() * 40}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${4 + Math.random() * 3}s`
          }}></div>
        ))}

        <div className="ground"></div>
      </div>

      {/* Mountains */}
      <div className="mountains-container">
        <div className="mountain mountain-back-1"></div>
        <div className="mountain mountain-back-2"></div>
        <div className="mountain mountain-mid-1"></div>
        <div className="mountain mountain-mid-2"></div>
        <div className="mountain mountain-front-1"></div>
        <div className="mountain mountain-front-2"></div>
      </div>

      {/* Buildings */}
      <div className="buildings-container">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`building building-${i + 1}`}>
            <div className="building-windows">
              {[...Array(6)].map((_, j) => (
                <div key={j} className="window"></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Trees */}
      <div className="trees-container">
        {[...Array(10)].map((_, i) => (
          <div key={i} className={`tree tree-${i + 1}`}>
            <div className="leaves leaves-bottom"></div>
            <div className="leaves leaves-middle"></div>
            <div className="leaves leaves-top"></div>
            <div className="trunk"></div>
            {Math.random() > 0.5 && (
              <div className="falling-leaf" style={{
                animationDelay: `${Math.random() * 5}s`
              }}>🍃</div>
            )}
          </div>
        ))}
      </div>

      {/* SUCCESS OVERLAY */}
      {success && (
        <div className="success-fullscreen">
          <div className="success-content">
            <div className="success-icon-large">✓</div>
            <h2 className="success-title">Welcome Home, Traveler!</h2>
            <p className="success-message">The mountains remember you...</p>
            <div className="success-ripple"></div>
            <div className="success-particles">
              {[...Array(30)].map((_, i) => (
                <div key={i} className="particle" style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random()}s`
                }}></div>
              ))}
            </div>
            <div className="success-waves">
              <div className="wave wave-1"></div>
              <div className="wave wave-2"></div>
              <div className="wave wave-3"></div>
            </div>
          </div>
        </div>
      )}

      {/* LOGIN STORY NARRATIVE OVERLAY */}
      {!showAuth && authMode === 'login' && (
        <div className={`story-overlay ${storyPhase > 0 ? 'active' : ''}`}>
          <div className="story-content">
            <div className={`story-text ${storyPhase >= 1 ? 'visible' : ''}`}>
              <h1 className="story-title">Welcome, Wanderer</h1>
            </div>
            
            <div className={`story-text ${storyPhase >= 2 ? 'visible' : ''}`}>
              <p className="story-subtitle">Every journey begins with a single step...</p>
            </div>
            
            <div className={`story-text ${storyPhase >= 3 ? 'visible' : ''}`}>
              <p className="story-description">
                Beyond the mountains lies a world of possibilities.
                <br />
                Are you ready to continue?
              </p>
            </div>

            {storyPhase >= 2 && storyPhase < 4 && (
              <button 
                className={`skip-story-btn ${storyPhase >= 2 ? 'visible' : ''}`}
                onClick={skipStory}
              >
                Continue your journey →
              </button>
            )}
          </div>
        </div>
      )}

      {/* LOGIN FORM */}
      {showAuth && authMode === 'login' && (
        <div className="auth-card-wrapper slide-up">
          <div className="auth-card">
            <div className="card-shimmer"></div>
            <div className="auth-header">
              <div className="header-icon-animated">🏔️</div>
              <h2 className="auth-title">Continue Your Journey</h2>
              <p className="auth-subtitle">The path remembers your footsteps</p>
            </div>

            <form onSubmit={handleLogin} className="auth-form">
              {error && (
                <div className="error-message fade-in shake">
                  <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  {error}
                </div>
              )}

              <div className="input-group progressive-reveal delay-1">
                <label htmlFor="email">
                  <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="auth-input"
                  autoFocus
                />
              </div>

              <div className="input-group progressive-reveal delay-2">
                <label htmlFor="password">
                  <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  required
                  className="auth-input"
                />
              </div>

              <div className="form-extras progressive-reveal delay-3">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <a href="#forgot" className="forgot-link">Forgot password?</a>
              </div>

              <button type="submit" className="submit-button progressive-reveal delay-4">
                <span>Enter</span>
                <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </form>

            <div className="auth-footer progressive-reveal delay-5">
              <p>
                New here?{' '}
                {/* ✅ FIX: navigate to /signup instead of in-component signup story */}
                <button onClick={goToSignup} className="story-link">
                  Create an account
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        .enhanced-login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          padding: 20px;
        }

        .sky-background {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, 
            #0a1128 0%, 
            #1a2847 20%,
            #2e4374 40%, 
            #4a7c9e 70%, 
            #80DEEA 100%
          );
          z-index: 0;
          animation: skyShift 30s ease-in-out infinite;
        }

        @keyframes skyShift {
          0%, 100% { filter: hue-rotate(0deg) brightness(1); }
          25% { filter: hue-rotate(5deg) brightness(1.05); }
          50% { filter: hue-rotate(10deg) brightness(1.1); }
          75% { filter: hue-rotate(5deg) brightness(1.05); }
        }

        .sun {
          position: absolute;
          top: 8%;
          right: 12%;
          width: 140px;
          height: 140px;
          background: radial-gradient(circle, #FFFEF0, #FFE066, #FFD700);
          border-radius: 50%;
          filter: blur(5px);
          opacity: 0.95;
          animation: sunPulse 5s ease-in-out infinite;
          box-shadow: 
            0 0 60px rgba(255, 224, 102, 0.8),
            0 0 100px rgba(255, 215, 0, 0.5),
            0 0 140px rgba(255, 200, 50, 0.3);
        }

        @keyframes sunPulse {
          0%, 100% { transform: scale(1); opacity: 0.95; }
          50% { transform: scale(1.15); opacity: 1; }
        }

        .sun-rays {
          position: absolute;
          top: 8%;
          right: 12%;
          width: 140px;
          height: 140px;
          animation: sunRotate 30s linear infinite;
        }

        .sun-rays::before,
        .sun-rays::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background: 
            linear-gradient(0deg, transparent 45%, rgba(255, 224, 102, 0.3) 50%, transparent 55%),
            linear-gradient(45deg, transparent 45%, rgba(255, 224, 102, 0.3) 50%, transparent 55%),
            linear-gradient(90deg, transparent 45%, rgba(255, 224, 102, 0.3) 50%, transparent 55%),
            linear-gradient(135deg, transparent 45%, rgba(255, 224, 102, 0.3) 50%, transparent 55%);
        }

        @keyframes sunRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .aurora {
          position: absolute;
          width: 100%;
          height: 300px;
          top: 0;
          filter: blur(40px);
          opacity: 0.4;
          mix-blend-mode: screen;
          pointer-events: none;
        }

        .aurora-1 {
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(0, 255, 200, 0.5) 25%, 
            rgba(100, 200, 255, 0.5) 50%, 
            rgba(200, 100, 255, 0.5) 75%, 
            transparent 100%
          );
          animation: auroraFlow1 15s ease-in-out infinite;
        }

        .aurora-2 {
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(255, 100, 200, 0.4) 30%, 
            rgba(100, 255, 200, 0.4) 60%, 
            transparent 100%
          );
          animation: auroraFlow2 20s ease-in-out infinite;
          animation-delay: 5s;
        }

        @keyframes auroraFlow1 {
          0%, 100% { transform: translateX(-10%) scaleY(1); opacity: 0.3; }
          50% { transform: translateX(10%) scaleY(1.2); opacity: 0.5; }
        }

        @keyframes auroraFlow2 {
          0%, 100% { transform: translateX(10%) scaleY(1); opacity: 0.3; }
          50% { transform: translateX(-10%) scaleY(1.3); opacity: 0.5; }
        }

        .starfield {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: white;
          border-radius: 50%;
          animation: starTwinkle 3s ease-in-out infinite;
          box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
        }

        @keyframes starTwinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          opacity: 0.35;
          animation: float 12s ease-in-out infinite;
          mix-blend-mode: screen;
        }
        
        .orb-1 { width: 350px; height: 350px; background: linear-gradient(45deg, #00bcd4, #4dd0e1); top: 20%; left: 10%; }
        .orb-2 { width: 300px; height: 300px; background: linear-gradient(135deg, #b388ff, #8c9eff); bottom: 10%; right: 10%; animation-delay: 3s; }
        .orb-3 { width: 250px; height: 250px; background: linear-gradient(90deg, #4dd0e1, #80deea); top: 50%; left: 50%; animation-delay: 6s; }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          33% { transform: translate(30px, -30px) scale(1.15) rotate(120deg); }
          66% { transform: translate(-25px, 20px) scale(0.9) rotate(240deg); }
        }

        .firefly {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #ffd54f;
          border-radius: 50%;
          box-shadow: 0 0 10px #ffd54f, 0 0 20px #ffeb3b, 0 0 30px rgba(255, 235, 59, 0.5);
          animation: fireflyFloat 7s ease-in-out infinite;
          opacity: 0;
        }

        @keyframes fireflyFloat {
          0%, 100% { transform: translate(0, 0); opacity: 0; }
          10%, 90% { opacity: 1; }
          25% { transform: translate(50px, -30px); }
          50% { transform: translate(-30px, -60px); }
          75% { transform: translate(40px, -40px); }
        }

        .shooting-star {
          position: absolute;
          width: 3px;
          height: 3px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 0 15px 3px rgba(255, 255, 255, 0.9);
        }

        .shooting-star::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 120px;
          height: 3px;
          background: linear-gradient(to right, rgba(255, 255, 255, 1), transparent);
          transform: translateX(-120px) rotate(-45deg);
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
        }

        .star-1 { top: 10%; right: 20%; animation: shootingStar1 4s ease-in-out 2s infinite; }
        .star-2 { top: 30%; right: 50%; animation: shootingStar1 4s ease-in-out 6s infinite; }
        .star-3 { top: 20%; right: 70%; animation: shootingStar1 4s ease-in-out 10s infinite; }
        .star-4 { top: 15%; right: 35%; animation: shootingStar1 4s ease-in-out 14s infinite; }
        .star-5 { top: 25%; right: 60%; animation: shootingStar1 4s ease-in-out 18s infinite; }

        @keyframes shootingStar1 {
          0% { transform: translate(0, 0) scale(0); opacity: 0; }
          5% { opacity: 1; transform: scale(1); }
          95% { opacity: 1; }
          100% { transform: translate(-400px, 400px) scale(0.5); opacity: 0; }
        }

        .cloud {
          position: absolute;
          background: rgba(255, 255, 255, 0.75);
          border-radius: 100px;
          opacity: 0.85;
          box-shadow: 0 4px 20px rgba(255, 255, 255, 0.2);
        }

        .cloud::before, .cloud::after {
          content: '';
          position: absolute;
          background: rgba(255, 255, 255, 0.75);
          border-radius: 50%;
        }

        .cloud-1 { width: 100px; height: 35px; top: 12%; left: -120px; animation: cloudMove1 40s linear infinite; }
        .cloud-1::before { width: 50px; height: 50px; top: -25px; left: 15px; }
        .cloud-1::after { width: 60px; height: 60px; top: -30px; right: 15px; }
        .cloud-2 { width: 120px; height: 40px; top: 20%; left: -150px; animation: cloudMove2 50s linear infinite; }
        .cloud-2::before { width: 55px; height: 55px; top: -28px; left: 20px; }
        .cloud-2::after { width: 65px; height: 65px; top: -32px; right: 20px; }
        .cloud-3 { width: 90px; height: 30px; top: 8%; left: -100px; animation: cloudMove3 45s linear infinite 5s; }
        .cloud-3::before { width: 45px; height: 45px; top: -22px; left: 12px; }
        .cloud-3::after { width: 50px; height: 50px; top: -25px; right: 12px; }
        .cloud-4 { width: 110px; height: 38px; top: 28%; left: -130px; animation: cloudMove1 55s linear infinite 10s; }
        .cloud-4::before { width: 52px; height: 52px; top: -26px; left: 18px; }
        .cloud-4::after { width: 58px; height: 58px; top: -29px; right: 18px; }
        .cloud-5 { width: 95px; height: 32px; top: 15%; left: -110px; animation: cloudMove2 42s linear infinite 15s; }
        .cloud-5::before { width: 48px; height: 48px; top: -24px; left: 14px; }
        .cloud-5::after { width: 53px; height: 53px; top: -27px; right: 14px; }
        .cloud-6 { width: 105px; height: 36px; top: 25%; left: -125px; animation: cloudMove3 48s linear infinite 20s; }
        .cloud-6::before { width: 50px; height: 50px; top: -25px; left: 16px; }
        .cloud-6::after { width: 56px; height: 56px; top: -28px; right: 16px; }
        .cloud-7 { width: 85px; height: 28px; top: 18%; left: -95px; animation: cloudMove1 38s linear infinite 25s; }
        .cloud-7::before { width: 42px; height: 42px; top: -21px; left: 11px; }
        .cloud-7::after { width: 47px; height: 47px; top: -24px; right: 11px; }
        .cloud-8 { width: 115px; height: 42px; top: 10%; left: -135px; animation: cloudMove2 52s linear infinite 30s; }
        .cloud-8::before { width: 54px; height: 54px; top: -27px; left: 19px; }
        .cloud-8::after { width: 60px; height: 60px; top: -30px; right: 19px; }

        @keyframes cloudMove1 { 0% { left: -150px; } 100% { left: 110%; } }
        @keyframes cloudMove2 { 0% { left: -180px; } 100% { left: 110%; } }
        @keyframes cloudMove3 { 0% { left: -120px; } 100% { left: 110%; } }

        .bird { position: absolute; width: 30px; height: 8px; z-index: 2; }
        .bird-wing { position: absolute; width: 15px; height: 2px; background: #37474f; border-radius: 2px; }
        .wing-left { left: 0; transform-origin: right center; animation: flapLeft 0.4s ease-in-out infinite; }
        .wing-right { right: 0; transform-origin: left center; animation: flapRight 0.4s ease-in-out infinite; }

        @keyframes flapLeft { 0%, 100% { transform: rotateZ(-20deg); } 50% { transform: rotateZ(-50deg); } }
        @keyframes flapRight { 0%, 100% { transform: rotateZ(20deg); } 50% { transform: rotateZ(50deg); } }

        .bird-1 { top: 15%; animation: birdFly1 30s linear infinite; }
        .bird-2 { top: 22%; animation: birdFly2 35s linear infinite 3s; }
        .bird-3 { top: 18%; animation: birdFly1 32s linear infinite 8s; }
        .bird-4 { top: 12%; animation: birdFly2 38s linear infinite 12s; }
        .bird-5 { top: 25%; animation: birdFly1 28s linear infinite 16s; }

        @keyframes birdFly1 { 0% { left: -50px; transform: translateY(0); } 50% { transform: translateY(-20px); } 100% { left: 110%; transform: translateY(0); } }
        @keyframes birdFly2 { 0% { right: -50px; transform: translateY(0); } 50% { transform: translateY(-20px); } 100% { right: 110%; transform: translateY(0); } }

        .mountains-container { position: absolute; bottom: 20%; width: 100%; height: 40%; z-index: 1; }

        .mountain { position: absolute; bottom: 0; animation: mountainFloat 10s ease-in-out infinite; transition: filter 0.5s ease; }
        .mountain:hover { filter: brightness(1.1); }

        @keyframes mountainFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

        .mountain-back-1 { left: 5%; width: 0; height: 0; border-left: 180px solid transparent; border-right: 180px solid transparent; border-bottom: 280px solid #607d8b; opacity: 0.5; animation-delay: 0s; filter: blur(2px); }
        .mountain-back-2 { right: 10%; width: 0; height: 0; border-left: 200px solid transparent; border-right: 200px solid transparent; border-bottom: 300px solid #546e7a; opacity: 0.5; animation-delay: 1.5s; filter: blur(2px); }
        .mountain-mid-1 { left: 15%; width: 0; height: 0; border-left: 150px solid transparent; border-right: 150px solid transparent; border-bottom: 240px solid #78909c; opacity: 0.7; animation-delay: 3s; filter: blur(1px); }
        .mountain-mid-2 { right: 20%; width: 0; height: 0; border-left: 170px solid transparent; border-right: 170px solid transparent; border-bottom: 260px solid #90a4ae; opacity: 0.7; animation-delay: 4.5s; filter: blur(1px); }
        .mountain-front-1 { left: 25%; width: 0; height: 0; border-left: 130px solid transparent; border-right: 130px solid transparent; border-bottom: 200px solid #9e9e9e; opacity: 0.9; animation-delay: 6s; }
        .mountain-front-2 { right: 5%; width: 0; height: 0; border-left: 140px solid transparent; border-right: 140px solid transparent; border-bottom: 220px solid #a1887f; opacity: 0.9; animation-delay: 7.5s; }

        .buildings-container { position: absolute; bottom: 20%; right: 5%; display: flex; align-items: flex-end; gap: 8px; z-index: 3; }

        .building { background: linear-gradient(to bottom, #455a64, #37474f); border-radius: 4px 4px 0 0; position: relative; box-shadow: -3px 0 10px rgba(0, 0, 0, 0.3); animation: buildingGlow 5s ease-in-out infinite; transition: transform 0.3s ease; }
        .building:hover { transform: translateY(-5px); }

        @keyframes buildingGlow {
          0%, 100% { box-shadow: -3px 0 10px rgba(0, 0, 0, 0.3); }
          50% { box-shadow: -3px 0 20px rgba(0, 188, 212, 0.4), 0 0 30px rgba(0, 188, 212, 0.2); }
        }

        .building-1 { width: 45px; height: 120px; animation-delay: 0s; }
        .building-2 { width: 50px; height: 140px; animation-delay: 0.8s; }
        .building-3 { width: 40px; height: 100px; animation-delay: 1.6s; }
        .building-4 { width: 55px; height: 160px; animation-delay: 2.4s; }
        .building-5 { width: 48px; height: 130px; animation-delay: 3.2s; }
        .building-6 { width: 42px; height: 110px; animation-delay: 4s; }

        .building-windows { position: absolute; top: 10px; left: 50%; transform: translateX(-50%); display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; padding: 0 6px; }

        .window { width: 8px; height: 10px; background: #ffd54f; opacity: 0.9; border-radius: 1px; animation: windowFlicker 4s ease-in-out infinite; box-shadow: 0 0 8px rgba(255, 213, 79, 0.8); }
        .window:nth-child(odd) { animation-delay: 1.5s; }
        .window:nth-child(even) { animation-delay: 3s; }

        @keyframes windowFlicker { 0%, 100% { opacity: 0.9; } 25% { opacity: 0.3; } 50% { opacity: 1; } 75% { opacity: 0.5; } }

        .ground { position: absolute; bottom: 0; width: 100%; height: 20%; background: linear-gradient(to bottom, #7d6956 0%, #6B5344 50%, #5a4635 100%); z-index: 2; box-shadow: inset 0 10px 30px rgba(0, 0, 0, 0.3); }

        .trees-container { position: absolute; bottom: 20%; width: 100%; height: 25%; z-index: 4; }

        .tree { position: absolute; bottom: 0; animation: treeWind 4s ease-in-out infinite; transition: transform 0.3s ease; }
        .tree:hover { transform: scale(1.05); }

        @keyframes treeWind { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(3deg); } 75% { transform: rotate(-3deg); } }

        .trunk { width: 12px; height: 35px; background: linear-gradient(to right, #5D4037, #4E342E); margin: 0 auto; border-radius: 2px; box-shadow: inset -2px 0 4px rgba(0, 0, 0, 0.3); }

        .leaves { background: linear-gradient(135deg, #43A047, #2E7D32, #1B5E20); border-radius: 50%; margin: 0 auto; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2), inset -2px -2px 8px rgba(0, 0, 0, 0.2); }
        .leaves-bottom { width: 40px; height: 40px; margin-top: -20px; animation: leavesRustle 3s ease-in-out infinite 0.6s; }
        .leaves-middle { width: 35px; height: 35px; margin-top: -18px; animation: leavesRustle 3s ease-in-out infinite 0.3s; }
        .leaves-top { width: 28px; height: 28px; margin-top: -14px; animation: leavesRustle 3s ease-in-out infinite; }

        @keyframes leavesRustle { 0%, 100% { transform: scale(1) rotate(0deg); } 25% { transform: scale(1.08) rotate(4deg); } 75% { transform: scale(0.95) rotate(-4deg); } }

        .falling-leaf { position: absolute; top: -30px; left: 50%; font-size: 14px; animation: leafFall 8s ease-in-out infinite; opacity: 0; }

        @keyframes leafFall {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translate(50px, 150px) rotate(360deg); opacity: 0; }
        }

        .tree-1 { left: 8%; animation-delay: 0s; }
        .tree-2 { left: 15%; animation-delay: 0.6s; }
        .tree-3 { left: 22%; animation-delay: 1.2s; }
        .tree-4 { left: 35%; animation-delay: 0.4s; }
        .tree-5 { left: 42%; animation-delay: 1s; }
        .tree-6 { left: 58%; animation-delay: 0.2s; }
        .tree-7 { left: 65%; animation-delay: 0.8s; }
        .tree-8 { left: 72%; animation-delay: 0.5s; }
        .tree-9 { left: 82%; animation-delay: 1.1s; }
        .tree-10 { left: 90%; animation-delay: 0.7s; }

        .success-fullscreen { position: fixed; inset: 0; background: linear-gradient(135deg, #0097a7, #00acc1, #00bcd4, #26c6da); background-size: 200% 200%; z-index: 1000; display: flex; align-items: center; justify-content: center; animation: slideDown 0.6s ease, gradientShift 3s ease infinite; }

        @keyframes slideDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }
        @keyframes gradientShift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }

        .success-content { text-align: center; color: white; position: relative; z-index: 10; }

        .success-icon-large { width: 140px; height: 140px; background: white; border-radius: 50%; margin: 0 auto 30px; display: flex; align-items: center; justify-content: center; font-size: 72px; color: #0097a7; animation: popIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.3s both; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3), 0 0 0 20px rgba(255, 255, 255, 0.1), 0 0 0 40px rgba(255, 255, 255, 0.05); }

        @keyframes popIn { 0% { transform: scale(0) rotate(-360deg); opacity: 0; } 50% { transform: scale(1.2) rotate(0deg); } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }

        .success-title { font-size: 42px; font-weight: 800; margin-bottom: 16px; animation: fadeInUp 0.8s ease 0.6s both; text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); }
        .success-message { font-size: 20px; opacity: 0.95; animation: fadeInUp 0.8s ease 0.9s both; text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2); }

        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

        .success-ripple { position: absolute; inset: -150px; background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%); animation: rippleOut 2.5s ease-out infinite; }
        @keyframes rippleOut { 0% { transform: scale(0.3); opacity: 1; } 100% { transform: scale(2); opacity: 0; } }

        .success-particles { position: absolute; inset: 0; pointer-events: none; }
        .particle { position: absolute; width: 8px; height: 8px; background: white; border-radius: 50%; animation: particleFloat 4s ease-in-out infinite; box-shadow: 0 0 10px rgba(255, 255, 255, 0.8); }
        @keyframes particleFloat { 0% { transform: translateY(0) scale(0) rotate(0deg); opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { transform: translateY(-300px) scale(1.5) rotate(360deg); opacity: 0; } }

        .success-waves { position: absolute; inset: 0; pointer-events: none; }
        .wave { position: absolute; inset: 0; border: 3px solid rgba(255, 255, 255, 0.5); border-radius: 50%; animation: waveExpand 3s ease-out infinite; }
        .wave-1 { animation-delay: 0s; }
        .wave-2 { animation-delay: 1s; }
        .wave-3 { animation-delay: 2s; }
        @keyframes waveExpand { 0% { transform: scale(0.5); opacity: 1; } 100% { transform: scale(3); opacity: 0; } }

        .story-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0); backdrop-filter: blur(0px); display: flex; align-items: center; justify-content: center; z-index: 100; transition: all 1.2s ease; pointer-events: none; }
        .story-overlay.active { background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(15px); pointer-events: auto; }

        .story-content { text-align: center; max-width: 600px; padding: 40px; }

        .story-text { opacity: 0; transform: translateY(40px) scale(0.95); transition: all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1); margin-bottom: 30px; }
        .story-text.visible { opacity: 1; transform: translateY(0) scale(1); }

        .story-title { font-size: 62px; font-weight: 900; color: white; text-shadow: 0 0 20px rgba(0, 188, 212, 0.5), 0 4px 30px rgba(0, 0, 0, 0.5); letter-spacing: -2px; margin-bottom: 20px; animation: textGlow 3s ease-in-out infinite; }

        @keyframes textGlow {
          0%, 100% { text-shadow: 0 0 20px rgba(0, 188, 212, 0.5), 0 4px 30px rgba(0, 0, 0, 0.5); }
          50% { text-shadow: 0 0 40px rgba(0, 188, 212, 0.8), 0 0 60px rgba(0, 188, 212, 0.4), 0 4px 30px rgba(0, 0, 0, 0.5); }
        }

        .story-subtitle { font-size: 26px; color: rgba(255, 255, 255, 0.95); font-weight: 400; text-shadow: 0 2px 15px rgba(0, 0, 0, 0.3); }
        .story-description { font-size: 20px; color: rgba(255, 255, 255, 0.9); line-height: 1.8; text-shadow: 0 2px 15px rgba(0, 0, 0, 0.3); }

        .skip-story-btn { margin-top: 50px; padding: 14px 32px; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); border: 2px solid rgba(255, 255, 255, 0.3); border-radius: 14px; color: white; font-weight: 700; font-size: 16px; cursor: pointer; transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); opacity: 0; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2); }
        .skip-story-btn.visible { opacity: 1; animation: pulseGlow 2.5s ease-in-out infinite; }

        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 15px rgba(255, 255, 255, 0.3), 0 4px 20px rgba(0, 0, 0, 0.2); transform: scale(1); }
          50% { box-shadow: 0 0 30px rgba(0, 188, 212, 0.7), 0 0 60px rgba(0, 188, 212, 0.4), 0 6px 30px rgba(0, 0, 0, 0.3); transform: scale(1.05); }
        }

        .skip-story-btn:hover { background: rgba(255, 255, 255, 0.25); transform: translateY(-4px) scale(1.05); box-shadow: 0 0 30px rgba(0, 188, 212, 0.7), 0 8px 30px rgba(0, 0, 0, 0.3); }

        .auth-card-wrapper { position: relative; z-index: 50; opacity: 0; transform: translateY(60px) scale(0.9); transition: all 1s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .auth-card-wrapper.slide-up { opacity: 1; transform: translateY(0) scale(1); }

        .auth-card { background: rgba(255, 255, 255, 0.97); backdrop-filter: blur(25px); border-radius: 32px; padding: 48px; width: 480px; max-width: 90%; box-shadow: 0 30px 60px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.5) inset; border: 1px solid rgba(255, 255, 255, 0.6); position: relative; overflow: hidden; }

        .card-shimmer { content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent); animation: shimmer 4s ease-in-out infinite; pointer-events: none; z-index: 1; }
        @keyframes shimmer { 0% { left: -100%; } 50%, 100% { left: 150%; } }

        .auth-header { text-align: center; margin-bottom: 32px; position: relative; z-index: 2; }

        .header-icon-animated { font-size: 56px; margin-bottom: 20px; animation: iconBounce 3s ease-in-out infinite; filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15)); }
        @keyframes iconBounce { 0%, 100% { transform: translateY(0) scale(1); } 25% { transform: translateY(-12px) scale(1.05); } 75% { transform: translateY(-4px) scale(0.98); } }

        .auth-title { font-size: 30px; font-weight: 900; color: #1a3a3a; margin-bottom: 10px; letter-spacing: -0.8px; }
        .auth-subtitle { color: #546e7a; font-size: 16px; line-height: 1.6; }

        .auth-form { display: flex; flex-direction: column; gap: 22px; position: relative; z-index: 2; }

        .progressive-reveal { opacity: 0; transform: translateY(25px); animation: revealItem 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
        .delay-5 { animation-delay: 0.5s; }
        @keyframes revealItem { to { opacity: 1; transform: translateY(0); } }

        .input-group label { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; color: #37474f; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .label-icon { width: 18px; height: 18px; color: #00838f; stroke-width: 2.5; }

        .auth-input { width: 100%; padding: 16px 20px; background: white; border: 2px solid #eceff1; border-radius: 14px; color: #263238; font-size: 16px; transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); }
        .auth-input:focus { outline: none; border-color: #00bcd4; box-shadow: 0 0 0 5px rgba(0, 188, 212, 0.15), 0 4px 16px rgba(0, 188, 212, 0.2); transform: translateY(-3px); }
        .auth-input:hover:not(:focus) { border-color: #b0bec5; }

        .error-message { display: flex; align-items: center; gap: 12px; padding: 14px 18px; background: linear-gradient(135deg, rgba(244, 67, 54, 0.12), rgba(244, 67, 54, 0.08)); border: 2px solid rgba(244, 67, 54, 0.4); border-radius: 12px; color: #c62828; font-size: 14px; font-weight: 700; box-shadow: 0 4px 12px rgba(244, 67, 54, 0.15); }
        .error-icon { width: 22px; height: 22px; stroke-width: 2.5; }

        .fade-in { animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .shake { animation: shake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97); }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); } 20%, 40%, 60%, 80% { transform: translateX(8px); } }

        .form-extras { display: flex; justify-content: space-between; align-items: center; font-size: 14px; }

        .remember-me { display: flex; align-items: center; gap: 8px; color: #546e7a; cursor: pointer; user-select: none; transition: color 0.2s; }
        .remember-me:hover { color: #37474f; }
        .remember-me input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; accent-color: #00bcd4; }

        .forgot-link { color: #00838f; text-decoration: none; font-weight: 700; transition: all 0.3s ease; position: relative; }
        .forgot-link::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 2px; background: #00bcd4; transition: width 0.3s ease; }
        .forgot-link:hover { color: #00bcd4; }
        .forgot-link:hover::after { width: 100%; }

        .submit-button { padding: 18px; background: linear-gradient(135deg, #0097a7, #00bcd4); border: none; border-radius: 14px; color: white; font-size: 17px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 12px; transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); box-shadow: 0 6px 20px rgba(0, 151, 167, 0.4), 0 0 0 0 rgba(0, 188, 212, 0.3); position: relative; overflow: hidden; }
        .submit-button::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.2), transparent); transform: translateX(-100%); transition: transform 0.6s ease; }
        .submit-button:hover::before { transform: translateX(100%); }
        .submit-button:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 10px 30px rgba(0, 151, 167, 0.5), 0 0 40px rgba(0, 188, 212, 0.3); }
        .submit-button:active { transform: translateY(-2px) scale(1); }
        .button-icon { width: 22px; height: 22px; stroke-width: 3; }

        .auth-footer { text-align: center; margin-top: 28px; color: #546e7a; font-size: 15px; position: relative; z-index: 2; }

        .story-link { color: #00838f; background: none; border: none; font-weight: 800; cursor: pointer; text-decoration: none; transition: all 0.3s ease; position: relative; font-size: 15px; }
        .story-link::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 2px; background: #00bcd4; transition: width 0.3s ease; }
        .story-link:hover { color: #00bcd4; }
        .story-link:hover::after { width: 100%; }

        @media (max-width: 768px) {
          .story-title { font-size: 48px; }
          .story-subtitle { font-size: 22px; }
          .story-description { font-size: 18px; }
          .auth-card { padding: 40px 32px; width: 95%; }
          .auth-title { font-size: 26px; }
        }

        @media (max-width: 480px) {
          .story-title { font-size: 40px; }
          .story-subtitle { font-size: 20px; }
          .auth-card { padding: 36px 26px; }
          .auth-title { font-size: 24px; }
          .auth-input { font-size: 15px; padding: 14px 18px; }
          .submit-button { padding: 16px; font-size: 15px; }
        }
      `}</style>
    </div>
  );
}
