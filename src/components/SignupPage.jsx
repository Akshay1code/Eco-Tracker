import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
export default function SignupPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState('next');
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    dob: '',
    education: '',
    institution: '',
    sex: '',
    interests: [],
    bio: ''
  });

  const interestOptions = [
    'Coding', 'Gaming', 'Music', 'Sports', 'Reading', 
    'Photography', 'Traveling', 'Cooking', 'Art & Design',
    'Fitness', 'Movies & Series', 'Tech & Gadgets'
  ];

  const questions = [
    {
      id: 'name',
      question: "Let's start simple — what should we call you?",
      subtitle: "Your full name works best here",
      type: 'text',
      placeholder: 'e.g., Alex Johnson',
      icon: '👋'
    },
    {
      id: 'nickname',
      question: "Got a nickname you prefer?",
      subtitle: "Or just stick with your name — totally fine!",
      type: 'text',
      placeholder: 'e.g., AJ, Techie, CodeWizard',
      icon: '✨'
    },
    {
      id: 'dob',
      question: "When's your birthday?",
      subtitle: "We promise not to spam you with birthday emails",
      type: 'date',
      icon: '🎂'
    },
    {
      id: 'education',
      question: "What's your current status?",
      subtitle: "Where are you at in your journey?",
      type: 'select',
      options: [
        'Undergraduate Student',
        'Graduate Student',
        'Recent Graduate',
        'Working Professional',
        'Career Changer',
        'Freelancer',
        'Entrepreneur'
      ],
      icon: '🎓'
    },
    {
      id: 'institution',
      question: "Where do you study or work?",
      subtitle: "University, company, or just 'currently exploring'",
      type: 'text',
      placeholder: 'e.g., MIT, Google, Self-employed',
      icon: '🏢'
    },
    {
      id: 'sex',
      question: "How do you identify?",
      subtitle: "This helps us personalize your experience",
      type: 'choice',
      options: ['Male', 'Female', 'Non-binary', 'Prefer not to say'],
      icon: '🌈'
    },
    {
      id: 'interests',
      question: "What gets you excited?",
      subtitle: "Pick as many as you'd like",
      type: 'multi-select',
      options: interestOptions,
      icon: '🎯'
    },
    {
      id: 'bio',
      question: "Tell us a bit about yourself",
      subtitle: "Fun fact, goals, or what brought you here today",
      type: 'textarea',
      placeholder: 'e.g., CS major who loves building side projects...',
      icon: '💭'
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setDirection('next');
      setTimeout(() => setCurrentStep(currentStep + 1), 50);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection('back');
      setTimeout(() => setCurrentStep(currentStep - 1), 50);
    }
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    navigate('/dashboard');
  };

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const renderInput = () => {
    switch (currentQuestion.type) {
      case 'text':
      case 'date':
        return (
          <input
            type={currentQuestion.type}
            value={formData[currentQuestion.id]}
            onChange={(e) => handleInputChange(currentQuestion.id, e.target.value)}
            placeholder={currentQuestion.placeholder}
            className="text-input"
            autoFocus
          />
        );
      case 'select':
        return (
          <select
            value={formData[currentQuestion.id]}
            onChange={(e) => handleInputChange(currentQuestion.id, e.target.value)}
            className="select-input"
            autoFocus
          >
            <option value="">Choose one...</option>
            {currentQuestion.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'choice':
        return (
          <div className="choice-grid">
            {currentQuestion.options.map(option => (
              <button
                key={option}
                onClick={() => handleInputChange(currentQuestion.id, option)}
                className={`choice-button ${formData[currentQuestion.id] === option ? 'selected' : ''}`}
              >
                {option}
              </button>
            ))}
          </div>
        );
      case 'multi-select':
        return (
          <div className="interest-grid">
            {currentQuestion.options.map(interest => (
              <button
                key={interest}
                onClick={() => handleInterestToggle(interest)}
                className={`interest-tag ${formData.interests.includes(interest) ? 'selected' : ''}`}
              >
                {interest}
              </button>
            ))}
          </div>
        );
      case 'textarea':
        return (
          <textarea
            value={formData[currentQuestion.id]}
            onChange={(e) => handleInputChange(currentQuestion.id, e.target.value)}
            placeholder={currentQuestion.placeholder}
            className="textarea-input"
            rows="4"
            autoFocus
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="signup-container">
      {/* ATMOSPHERIC BACKGROUND */}
      <div className="sky-background">
        <div className="sun"></div>
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="ground"></div>
      </div>

      {/* PROGRESS BAR */}
      <div className="progress-container">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="progress-text">Step {currentStep + 1} of {questions.length}</div>
      </div>

      {/* MAIN CARD */}
      <div className="card-wrapper">
        <div className={`question-card ${direction === 'next' ? 'slide-next' : 'slide-back'}`} key={currentStep}>
          <div className="card-icon">{currentQuestion.icon}</div>
          
          <div className="question-header">
            <h2 className="question-title">{currentQuestion.question}</h2>
            <p className="question-subtitle">{currentQuestion.subtitle}</p>
          </div>

          <div className="input-container">
            {renderInput()}
          </div>

          <div className="button-group">
            {currentStep > 0 && (
              <button onClick={handleBack} className="nav-button back-button">
                Back
              </button>
            )}
            
            {currentStep < questions.length - 1 ? (
              <button onClick={handleNext} className="nav-button next-button">
                Next Step
              </button>
            ) : (
              <button onClick={handleSubmit} className="nav-button submit-button">
                Join Now 🚀
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="skip-container">
        <button onClick={handleNext} className="skip-button">Skip this for now →</button>
      </div>

      <style jsx>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }

        .signup-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          padding: 20px;
        }

        /* --- BACKGROUND ELEMENTS --- */
        .sky-background {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, #E0F7FA, #80DEEA, #00ACC1);
          z-index: -1;
        }

        .sun {
          position: absolute;
          top: 10%;
          right: 15%;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, #FFFACD, #FFE066);
          border-radius: 50%;
          filter: blur(20px);
          opacity: 0.6;
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.3;
          animation: float 10s ease-in-out infinite;
        }
        .orb-1 { width: 300px; height: 300px; background: #00bcd4; top: 20%; left: 10%; }
        .orb-2 { width: 250px; height: 250px; background: #ffffff; bottom: 10%; right: 10%; animation-delay: 2s; }

        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }

        .ground {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 15%;
          background: #6B5344;
          opacity: 0.8;
        }

        /* --- PROGRESS BAR --- */
        .progress-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 450px;
          margin-bottom: 24px;
        }

        .progress-bar {
          height: 8px;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #00838f;
          border-radius: 10px;
          transition: width 0.4s ease;
        }

        .progress-text {
          text-align: center;
          color: #1a3a3a;
          font-size: 13px;
          font-weight: 700;
          margin-top: 8px;
        }

        /* --- FROSTED CARD --- */
        .card-wrapper {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 500px;
        }

        .question-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.4);
        }

        /* ANIMATIONS */
        .slide-next { animation: slideInNext 0.5s ease-out; }
        .slide-back { animation: slideInBack 0.5s ease-out; }

        @keyframes slideInNext {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInBack {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .card-icon {
          font-size: 50px;
          text-align: center;
          margin-bottom: 20px;
        }

        .question-title {
          font-size: 24px;
          color: #1a3a3a;
          text-align: center;
          margin-bottom: 8px;
        }

        .question-subtitle {
          font-size: 15px;
          color: #546e7a;
          text-align: center;
          margin-bottom: 30px;
        }

        /* --- INPUTS --- */
        .text-input, .select-input, .textarea-input {
          width: 100%;
          padding: 14px 18px;
          background: white;
          border: 1.5px solid #eceff1;
          border-radius: 12px;
          font-size: 16px;
          margin-bottom: 20px;
          transition: all 0.2s ease;
        }

        .text-input:focus, .select-input:focus {
          outline: none;
          border-color: #00bcd4;
          box-shadow: 0 0 0 4px rgba(0, 188, 212, 0.1);
        }

        .choice-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
        
        .choice-button, .interest-tag {
          padding: 12px;
          background: white;
          border: 1.5px solid #eceff1;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          color: #546e7a;
          transition: all 0.2s;
        }

        .choice-button.selected, .interest-tag.selected {
          background: #0097a7;
          color: white;
          border-color: #00838f;
        }

        .interest-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }

        /* --- BUTTONS --- */
        .button-group { display: flex; gap: 10px; }

        .nav-button {
          flex: 1;
          padding: 15px;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.1s;
        }

        .back-button { background: #eceff1; color: #546e7a; }
        .next-button { background: #0097a7; color: white; }
        .submit-button { background: #2e7d32; color: white; }
        
        .nav-button:active { transform: scale(0.98); }

        .skip-button {
          margin-top: 20px;
          background: none;
          border: none;
          color: #1a3a3a;
          font-weight: 600;
          cursor: pointer;
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}