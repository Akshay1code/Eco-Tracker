import React, { useState } from 'react';

import { Link } from "react-router-dom";


export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Welcome, ${username}! 🌅`);
  };

  return (
    <div className="login-container">
      {/* Sky Background */}
      <div className="sky-background">
        <div className="sun"></div>
        <div className="sun-rays"></div>
        
        {/* Animated Clouds */}
        {[...Array(8)].map((_, i) => (
          <div key={i} className={`cloud cloud-${i + 1}`}></div>
        ))}

        {/* Animated Birds */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`bird bird-${i + 1}`}>
            <div className="bird-wing wing-left"></div>
            <div className="bird-wing wing-right"></div>
          </div>
        ))}
      </div>

      {/* Mountain Ranges */}
      <div className="mountains-container">
        <div className="mountain mountain-back-1"></div>
        <div className="mountain mountain-back-2"></div>
        <div className="mountain mountain-mid-1"></div>
        <div className="mountain mountain-mid-2"></div>
        <div className="mountain mountain-front-1"></div>
        <div className="mountain mountain-front-2"></div>
      </div>

      {/* Buildings at Bottom Right */}
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

      {/* Animated Trees with Wind */}
      <div className="trees-container">
        {[...Array(10)].map((_, i) => (
          <div key={i} className={`tree tree-${i + 1}`}>
            <div className="leaves leaves-bottom"></div>
            <div className="leaves leaves-middle"></div>
            <div className="leaves leaves-top"></div>
            <div className="trunk"></div>
          </div>
        ))}
      </div>

      {/* Additional Greenery - Bushes and Grass */}
      <div className="greenery-container">
        {[...Array(15)].map((_, i) => (
          <div key={i} className={`bush bush-${i + 1}`}></div>
        ))}
        {[...Array(20)].map((_, i) => (
          <div key={i} className={`grass grass-${i + 1}`}></div>
        ))}
      </div>

      {/* Flowing River */}
      <div className="river-container">
        <div className="river">
          <div className="river-wave wave-1"></div>
          <div className="river-wave wave-2"></div>
          <div className="river-wave wave-3"></div>
        </div>
        <div className="river-reflection"></div>
      </div>

      {/* Road */}
      <div className="road-container">
        <div className="road">
          <div className="road-line line-1"></div>
          <div className="road-line line-2"></div>
          <div className="road-line line-3"></div>
          <div className="road-line line-4"></div>
        </div>
      </div>

      <div className="ground"></div>

      {/* Login Card */}
      <div className="login-card">
        <div className="card-header">
          <h1>Welcome Back</h1>
          <p>Sign in to continue your journey</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. wanderer_01"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="form-footer">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#forgot" className="forgot-password">Forgot password?</a>
          </div>

          <button type="submit" className="submit-button">
            <span>Sign In</span>
            <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </form>

        <div className="signup-link">
          Don't have an account? <Link to="/signup">Create one</Link>
        </div>
      </div>

      <style jsx>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        /* SKY BACKGROUND */
        .sky-background {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, #E0F7FA 0%, #80DEEA 50%, #4DD0E1 100%);
          z-index: 0;
        }

        .sun {
          position: absolute;
          top: 8%;
          right: 12%;
          width: 120px;
          height: 120px;
          background: radial-gradient(circle, #FFFACD, #FFE066);
          border-radius: 50%;
          filter: blur(5px);
          opacity: 0.9;
          animation: sunPulse 4s ease-in-out infinite;
        }

        @keyframes sunPulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.05); opacity: 1; }
        }

        /* ANIMATED CLOUDS */
        .cloud {
          position: absolute;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 100px;
          opacity: 0.8;
        }

        .cloud::before,
        .cloud::after {
          content: '';
          position: absolute;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 50%;
        }

        .cloud-1 {
          width: 100px;
          height: 35px;
          top: 12%;
          left: -120px;
          animation: cloudMove1 35s linear infinite;
        }
        .cloud-1::before { width: 50px; height: 50px; top: -25px; left: 15px; }
        .cloud-1::after { width: 60px; height: 60px; top: -30px; right: 15px; }

        .cloud-2 {
          width: 120px;
          height: 40px;
          top: 20%;
          left: -150px;
          animation: cloudMove2 45s linear infinite;
        }
        .cloud-2::before { width: 55px; height: 55px; top: -28px; left: 20px; }
        .cloud-2::after { width: 65px; height: 65px; top: -32px; right: 20px; }

        .cloud-3 {
          width: 90px;
          height: 30px;
          top: 8%;
          left: -100px;
          animation: cloudMove3 40s linear infinite 5s;
        }
        .cloud-3::before { width: 45px; height: 45px; top: -22px; left: 12px; }
        .cloud-3::after { width: 50px; height: 50px; top: -25px; right: 12px; }

        .cloud-4 {
          width: 110px;
          height: 38px;
          top: 28%;
          left: -130px;
          animation: cloudMove1 50s linear infinite 10s;
        }
        .cloud-4::before { width: 52px; height: 52px; top: -26px; left: 18px; }
        .cloud-4::after { width: 58px; height: 58px; top: -29px; right: 18px; }

        .cloud-5 {
          width: 95px;
          height: 32px;
          top: 15%;
          left: -110px;
          animation: cloudMove2 38s linear infinite 15s;
        }
        .cloud-5::before { width: 48px; height: 48px; top: -24px; left: 14px; }
        .cloud-5::after { width: 53px; height: 53px; top: -27px; right: 14px; }

        .cloud-6 {
          width: 105px;
          height: 36px;
          top: 25%;
          left: -125px;
          animation: cloudMove3 42s linear infinite 20s;
        }
        .cloud-6::before { width: 50px; height: 50px; top: -25px; left: 16px; }
        .cloud-6::after { width: 56px; height: 56px; top: -28px; right: 16px; }

        .cloud-7 {
          width: 85px;
          height: 28px;
          top: 18%;
          left: -95px;
          animation: cloudMove1 36s linear infinite 25s;
        }
        .cloud-7::before { width: 42px; height: 42px; top: -21px; left: 11px; }
        .cloud-7::after { width: 47px; height: 47px; top: -24px; right: 11px; }

        .cloud-8 {
          width: 115px;
          height: 42px;
          top: 10%;
          left: -135px;
          animation: cloudMove2 48s linear infinite 30s;
        }
        .cloud-8::before { width: 54px; height: 54px; top: -27px; left: 19px; }
        .cloud-8::after { width: 60px; height: 60px; top: -30px; right: 19px; }

        @keyframes cloudMove1 {
          0% { left: -150px; }
          100% { left: 110%; }
        }

        @keyframes cloudMove2 {
          0% { left: -180px; }
          100% { left: 110%; }
        }

        @keyframes cloudMove3 {
          0% { left: -120px; }
          100% { left: 110%; }
        }

        /* ANIMATED BIRDS */
        .bird {
          position: absolute;
          width: 30px;
          height: 8px;
          z-index: 2;
        }

        .bird-wing {
          position: absolute;
          width: 15px;
          height: 2px;
          background: #37474f;
          border-radius: 2px;
        }

        .wing-left {
          left: 0;
          transform-origin: right center;
          animation: flapLeft 0.5s ease-in-out infinite;
        }

        .wing-right {
          right: 0;
          transform-origin: left center;
          animation: flapRight 0.5s ease-in-out infinite;
        }

        @keyframes flapLeft {
          0%, 100% { transform: rotateZ(-15deg); }
          50% { transform: rotateZ(-45deg); }
        }

        @keyframes flapRight {
          0%, 100% { transform: rotateZ(15deg); }
          50% { transform: rotateZ(45deg); }
        }

        .bird-1 {
          top: 15%;
          animation: birdFly1 25s linear infinite;
        }

        .bird-2 {
          top: 22%;
          animation: birdFly2 30s linear infinite 3s;
        }

        .bird-3 {
          top: 18%;
          animation: birdFly1 28s linear infinite 8s;
        }

        .bird-4 {
          top: 12%;
          animation: birdFly2 32s linear infinite 12s;
        }

        .bird-5 {
          top: 25%;
          animation: birdFly1 26s linear infinite 16s;
        }

        @keyframes birdFly1 {
          0% { left: -50px; }
          100% { left: 110%; }
        }

        @keyframes birdFly2 {
          0% { right: -50px; }
          100% { right: 110%; }
        }

        /* MOUNTAIN RANGES */
        .mountains-container {
          position: absolute;
          bottom: 20%;
          width: 100%;
          height: 40%;
          z-index: 1;
        }

        .mountain {
          position: absolute;
          bottom: 0;
        }

        .mountain-back-1 {
          left: 5%;
          width: 0;
          height: 0;
          border-left: 180px solid transparent;
          border-right: 180px solid transparent;
          border-bottom: 280px solid #607d8b;
          opacity: 0.4;
        }

        .mountain-back-2 {
          right: 10%;
          width: 0;
          height: 0;
          border-left: 200px solid transparent;
          border-right: 200px solid transparent;
          border-bottom: 300px solid #546e7a;
          opacity: 0.4;
        }

        .mountain-mid-1 {
          left: 15%;
          width: 0;
          height: 0;
          border-left: 150px solid transparent;
          border-right: 150px solid transparent;
          border-bottom: 240px solid #78909c;
          opacity: 0.6;
        }

        .mountain-mid-2 {
          right: 20%;
          width: 0;
          height: 0;
          border-left: 170px solid transparent;
          border-right: 170px solid transparent;
          border-bottom: 260px solid #90a4ae;
          opacity: 0.6;
        }

        .mountain-front-1 {
          left: 25%;
          width: 0;
          height: 0;
          border-left: 130px solid transparent;
          border-right: 130px solid transparent;
          border-bottom: 200px solid #9e9e9e;
          opacity: 0.8;
        }

        .mountain-front-2 {
          right: 5%;
          width: 0;
          height: 0;
          border-left: 140px solid transparent;
          border-right: 140px solid transparent;
          border-bottom: 220px solid #a1887f;
          opacity: 0.8;
        }

        /* BUILDINGS AT BOTTOM RIGHT */
        .buildings-container {
          position: absolute;
          bottom: 20%;
          right: 5%;
          display: flex;
          align-items: flex-end;
          gap: 8px;
          z-index: 3;
        }

        .building {
          background: linear-gradient(to bottom, #455a64, #37474f);
          border-radius: 4px 4px 0 0;
          position: relative;
          box-shadow: -2px 0 8px rgba(0, 0, 0, 0.2);
        }

        .building-1 { width: 45px; height: 120px; }
        .building-2 { width: 50px; height: 140px; }
        .building-3 { width: 40px; height: 100px; }
        .building-4 { width: 55px; height: 160px; }
        .building-5 { width: 48px; height: 130px; }
        .building-6 { width: 42px; height: 110px; }

        .building-windows {
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6px;
          padding: 0 6px;
        }

        .window {
          width: 8px;
          height: 10px;
          background: #ffd54f;
          opacity: 0.8;
          border-radius: 1px;
          animation: windowFlicker 3s ease-in-out infinite;
        }

        .window:nth-child(odd) {
          animation-delay: 1s;
        }

        @keyframes windowFlicker {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0.3; }
        }

        /* GROUND */
        .ground {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 20%;
          background: linear-gradient(to bottom, #7d6956, #6B5344);
          z-index: 2;
        }

        /* ANIMATED TREES WITH WIND */
        .trees-container {
          position: absolute;
          bottom: 20%;
          width: 100%;
          height: 25%;
          z-index: 4;
        }

        .tree {
          position: absolute;
          bottom: 0;
          animation: treeWind 3s ease-in-out infinite;
        }

        @keyframes treeWind {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(2deg); }
          75% { transform: rotate(-2deg); }
        }

        .trunk {
          width: 12px;
          height: 35px;
          background: #5D4037;
          margin: 0 auto;
          border-radius: 2px;
        }

        .leaves {
          background: linear-gradient(135deg, #43A047, #2E7D32);
          border-radius: 50%;
          margin: 0 auto;
        }

        .leaves-bottom {
          width: 40px;
          height: 40px;
          margin-top: -20px;
          animation: leavesRustle 2s ease-in-out infinite 0.6s;
        }

        .leaves-middle {
          width: 35px;
          height: 35px;
          margin-top: -18px;
          animation: leavesRustle 2s ease-in-out infinite 0.3s;
        }

        .leaves-top {
          width: 28px;
          height: 28px;
          margin-top: -14px;
          animation: leavesRustle 2s ease-in-out infinite;
        }

        @keyframes leavesRustle {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.05) rotate(3deg); }
          75% { transform: scale(0.98) rotate(-3deg); }
        }

        .tree-1 { left: 8%; animation-delay: 0s; }
        .tree-2 { left: 15%; animation-delay: 0.5s; }
        .tree-3 { left: 22%; animation-delay: 1s; }
        .tree-4 { left: 35%; animation-delay: 0.3s; }
        .tree-5 { left: 42%; animation-delay: 0.8s; }
        .tree-6 { left: 58%; animation-delay: 0.2s; }
        .tree-7 { left: 65%; animation-delay: 0.7s; }
        .tree-8 { left: 72%; animation-delay: 0.4s; }
        .tree-9 { left: 82%; animation-delay: 0.9s; }
        .tree-10 { left: 90%; animation-delay: 0.6s; }

        /* GREENERY - Bushes and Grass */
        .greenery-container {
          position: absolute;
          bottom: 20%;
          width: 100%;
          height: 15%;
          z-index: 4;
        }

        .bush {
          position: absolute;
          background: linear-gradient(135deg, #66BB6A, #388E3C);
          border-radius: 50%;
          animation: bushSway 4s ease-in-out infinite;
        }

        @keyframes bushSway {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .bush-1 { width: 30px; height: 18px; left: 5%; bottom: 0; animation-delay: 0s; }
        .bush-2 { width: 25px; height: 15px; left: 12%; bottom: 0; animation-delay: 0.5s; }
        .bush-3 { width: 35px; height: 20px; left: 18%; bottom: 0; animation-delay: 1s; }
        .bush-4 { width: 28px; height: 17px; left: 25%; bottom: 0; animation-delay: 0.3s; }
        .bush-5 { width: 32px; height: 19px; left: 32%; bottom: 0; animation-delay: 0.8s; }
        .bush-6 { width: 26px; height: 16px; left: 40%; bottom: 0; animation-delay: 0.2s; }
        .bush-7 { width: 30px; height: 18px; left: 48%; bottom: 0; animation-delay: 0.7s; }
        .bush-8 { width: 33px; height: 20px; left: 55%; bottom: 0; animation-delay: 0.4s; }
        .bush-9 { width: 27px; height: 16px; left: 62%; bottom: 0; animation-delay: 0.9s; }
        .bush-10 { width: 31px; height: 19px; left: 70%; bottom: 0; animation-delay: 0.6s; }
        .bush-11 { width: 29px; height: 17px; left: 77%; bottom: 0; animation-delay: 0.1s; }
        .bush-12 { width: 34px; height: 21px; left: 85%; bottom: 0; animation-delay: 0.4s; }
        .bush-13 { width: 28px; height: 17px; left: 92%; bottom: 0; animation-delay: 0.7s; }
        .bush-14 { width: 26px; height: 15px; left: 3%; bottom: 5px; animation-delay: 0.3s; }
        .bush-15 { width: 30px; height: 18px; left: 95%; bottom: 5px; animation-delay: 0.9s; }

        .grass {
          position: absolute;
          width: 3px;
          background: linear-gradient(to top, #558B2F, #7CB342);
          border-radius: 2px 2px 0 0;
          bottom: 0;
          animation: grassWave 2s ease-in-out infinite;
        }

        @keyframes grassWave {
          0%, 100% { transform: rotate(0deg); height: 15px; }
          25% { transform: rotate(3deg); height: 17px; }
          75% { transform: rotate(-3deg); height: 16px; }
        }

        .grass-1 { left: 6%; animation-delay: 0s; }
        .grass-2 { left: 11%; animation-delay: 0.2s; }
        .grass-3 { left: 14%; animation-delay: 0.4s; }
        .grass-4 { left: 19%; animation-delay: 0.1s; }
        .grass-5 { left: 23%; animation-delay: 0.6s; }
        .grass-6 { left: 28%; animation-delay: 0.3s; }
        .grass-7 { left: 33%; animation-delay: 0.5s; }
        .grass-8 { left: 38%; animation-delay: 0.7s; }
        .grass-9 { left: 44%; animation-delay: 0.2s; }
        .grass-10 { left: 50%; animation-delay: 0.4s; }
        .grass-11 { left: 56%; animation-delay: 0.6s; }
        .grass-12 { left: 61%; animation-delay: 0.1s; }
        .grass-13 { left: 67%; animation-delay: 0.5s; }
        .grass-14 { left: 73%; animation-delay: 0.3s; }
        .grass-15 { left: 78%; animation-delay: 0.7s; }
        .grass-16 { left: 84%; animation-delay: 0.2s; }
        .grass-17 { left: 89%; animation-delay: 0.4s; }
        .grass-18 { left: 94%; animation-delay: 0.6s; }
        .grass-19 { left: 9%; animation-delay: 0.8s; }
        .grass-20 { left: 97%; animation-delay: 0.9s; }

        /* FLOWING RIVER */
        .river-container {
          position: absolute;
          bottom: 20%;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 35%;
          z-index: 1;
          overflow: hidden;
          perspective: 1000px;
        }

        .river {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          height: 100%;
          background: linear-gradient(to top, 
            rgba(25, 118, 210, 0.9) 0%,
            rgba(30, 136, 229, 0.7) 40%,
            rgba(33, 150, 243, 0.5) 70%,
            rgba(100, 181, 246, 0.3) 100%
          );
          clip-path: polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%);
        }

        .river-wave {
          position: absolute;
          width: 100%;
          height: 30px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          filter: blur(3px);
        }

        .wave-1 {
          bottom: 10%;
          animation: waveFlow 2s ease-in-out infinite;
        }

        .wave-2 {
          bottom: 35%;
          width: 80%;
          left: 10%;
          animation: waveFlow 2s ease-in-out infinite 0.7s;
          opacity: 0.6;
        }

        .wave-3 {
          bottom: 60%;
          width: 60%;
          left: 20%;
          animation: waveFlow 2s ease-in-out infinite 1.4s;
          opacity: 0.4;
        }

        @keyframes waveFlow {
          0% { 
            transform: translateY(0) scaleX(1);
            opacity: 0.2;
          }
          50% { 
            transform: translateY(-10px) scaleX(1.1);
            opacity: 0.4;
          }
          100% { 
            transform: translateY(-20px) scaleX(0.8);
            opacity: 0;
          }
        }

        .river-reflection {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to top, 
            rgba(255, 255, 255, 0.15),
            transparent 50%
          );
          animation: shimmer 3s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes shimmer {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }

        /* ROAD */
        .road-container {
          position: absolute;
          bottom: 20%;
          left: 0;
          width: 100%;
          height: 18%;
          z-index: 3;
        }

        .road {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, #616161, #424242);
          clip-path: polygon(30% 0%, 70% 0%, 85% 100%, 15% 100%);
        }

        .road-line {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 8%;
          height: 6px;
          background: #FDD835;
          border-radius: 3px;
        }

        .line-1 {
          top: 30%;
          animation: roadLine 2s ease-in-out infinite;
        }

        .line-2 {
          top: 45%;
          animation: roadLine 2s ease-in-out infinite 0.5s;
        }

        .line-3 {
          top: 60%;
          animation: roadLine 2s ease-in-out infinite 1s;
        }

        .line-4 {
          top: 75%;
          animation: roadLine 2s ease-in-out infinite 1.5s;
        }

        @keyframes roadLine {
          0% { opacity: 0.4; width: 8%; }
          50% { opacity: 1; width: 10%; }
          100% { opacity: 0.4; width: 8%; }
        }

        /* LOGIN CARD */
        .login-card {
          position: relative;
          z-index: 10;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border-radius: 24px;
          padding: 48px;
          width: 420px;
          max-width: 90%;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.4);
        }

        .card-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .card-header h1 {
          font-size: 28px;
          font-weight: 800;
          color: #1a3a3a;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .card-header p {
          color: #546e7a;
          font-size: 15px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-group label {
          display: block;
          margin-bottom: 8px;
          color: #37474f;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 18px;
          height: 18px;
          color: #90a4ae;
        }

        .input-wrapper input {
          width: 100%;
          padding: 14px 14px 14px 44px;
          background: #ffffff;
          border: 1.5px solid #eceff1;
          border-radius: 12px;
          color: #263238;
          font-size: 15px;
          transition: all 0.2s ease;
        }

        .input-wrapper input:focus {
          outline: none;
          border-color: #00bcd4;
          box-shadow: 0 0 0 4px rgba(0, 188, 212, 0.1);
        }

        .form-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
        }

        .remember-me {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #546e7a;
          cursor: pointer;
        }

        .forgot-password {
          color: #00838f;
          text-decoration: none;
          font-weight: 600;
        }

        .submit-button {
          margin-top: 10px;
          padding: 16px;
          background: #0097a7;
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s ease, transform 0.1s ease;
        }

        .submit-button:hover {
          background: #00838f;
        }

        .submit-button:active {
          transform: scale(0.98);
        }

        .arrow-icon {
          width: 18px;
          height: 18px;
        }

        .signup-link {
          text-align: center;
          margin-top: 24px;
          color: #546e7a;
          font-size: 14px;
        }

        .signup-link a {
          color: #00838f;
          text-decoration: none;
          font-weight: 700;
        }

        /* RESPONSIVE DESIGN */
        @media (max-width: 768px) {
          .login-card {
            padding: 32px 24px;
            width: 95%;
            border-radius: 20px;
          }

          .card-header h1 {
            font-size: 24px;
          }

          .card-header p {
            font-size: 14px;
          }

          .sun {
            width: 80px;
            height: 80px;
            top: 5%;
            right: 8%;
          }

          .buildings-container {
            right: 2%;
            bottom: 20%;
            gap: 4px;
          }

          .building-1 { width: 35px; height: 90px; }
          .building-2 { width: 40px; height: 110px; }
          .building-3 { width: 32px; height: 80px; }
          .building-4 { width: 42px; height: 125px; }
          .building-5 { width: 38px; height: 100px; }
          .building-6 { width: 35px; height: 85px; }

          .building-windows {
            gap: 4px;
            padding: 0 4px;
          }

          .window {
            width: 7px;
            height: 9px;
          }

          .mountains-container {
            height: 35%;
          }

          .mountain-back-1 {
            border-left: 120px solid transparent;
            border-right: 120px solid transparent;
            border-bottom: 200px solid #607d8b;
          }

          .mountain-back-2 {
            border-left: 130px solid transparent;
            border-right: 130px solid transparent;
            border-bottom: 220px solid #546e7a;
          }

          .mountain-mid-1 {
            border-left: 100px solid transparent;
            border-right: 100px solid transparent;
            border-bottom: 170px solid #78909c;
          }

          .mountain-mid-2 {
            border-left: 110px solid transparent;
            border-right: 110px solid transparent;
            border-bottom: 180px solid #90a4ae;
          }

          .mountain-front-1 {
            border-left: 90px solid transparent;
            border-right: 90px solid transparent;
            border-bottom: 140px solid #9e9e9e;
          }

          .mountain-front-2 {
            border-left: 95px solid transparent;
            border-right: 95px solid transparent;
            border-bottom: 150px solid #a1887f;
          }

          .trunk {
            width: 10px;
            height: 28px;
          }

          .leaves-bottom { width: 32px; height: 32px; }
          .leaves-middle { width: 28px; height: 28px; }
          .leaves-top { width: 22px; height: 22px; }

          .bush {
            transform: scale(0.8);
          }

          .grass {
            height: 12px;
          }

          .river-container {
            height: 30%;
            width: 70%;
          }

          .road-container {
            height: 15%;
          }

          .road-line {
            width: 10%;
            height: 4px;
          }

          .form-footer {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 28px 20px;
          }

          .card-header h1 {
            font-size: 22px;
          }

          .input-wrapper input {
            padding: 12px 12px 12px 40px;
            font-size: 14px;
          }

          .submit-button {
            padding: 14px;
            font-size: 15px;
          }

          .cloud {
            transform: scale(0.7);
          }

          .bird {
            transform: scale(0.8);
          }

          .bush {
            transform: scale(0.6);
          }

          .grass {
            height: 10px;
          }

          .river-container {
            height: 25%;
            width: 80%;
          }

          .road-container {
            height: 12%;
          }

          .buildings-container {
            right: 1%;
            bottom: 20%;
            gap: 3px;
            z-index: 5;
          }

          .building-1 { width: 32px; height: 85px; }
          .building-2 { width: 36px; height: 100px; }
          .building-3 { width: 30px; height: 75px; }
          .building-4 { width: 38px; height: 115px; }
          .building-5 { width: 34px; height: 95px; }
          .building-6 { width: 32px; height: 80px; }

          .building-windows {
            gap: 3px;
            padding: 0 3px;
          }

          .window {
            width: 6px;
            height: 8px;
          }
        }

        @media (min-width: 1200px) {
          .login-card {
            width: 450px;
            padding: 56px;
          }

          .sun {
            width: 160px;
            height: 160px;
          }

          .buildings-container {
            gap: 12px;
          }

          .building-1 { width: 55px; height: 140px; }
          .building-2 { width: 60px; height: 165px; }
          .building-3 { width: 50px; height: 120px; }
          .building-4 { width: 65px; height: 190px; }
          .building-5 { width: 58px; height: 155px; }
          .building-6 { width: 52px; height: 130px; }

          .bush {
            transform: scale(1.2);
          }

          .grass {
            height: 18px;
          }

          .river-container {
            height: 40%;
            width: 55%;
          }

          .road-container {
            height: 20%;
          }
        }
      `}</style>
    </div>
  );
}