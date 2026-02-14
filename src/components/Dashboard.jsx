import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Traveler');

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
      navigate('/');
      return;
    }

    // Get user email for personalization
    const email = localStorage.getItem('userEmail');
    if (email) {
      const name = email.split('@')[0];
      setUserName(name.charAt(0).toUpperCase() + name.slice(1));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/');
  };

  // Mock data for the videos
  const videos = [
    {
      title: "Saving Energy 101",
      duration: "3:45",
      category: "Tips",
      thumbnail: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=400",
      description: "Simple home hacks to lower your bill and boost points."
    },
    {
      title: "How to use Eco-Tracker",
      duration: "2:15",
      category: "Guide",
      thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400",
      description: "A quick walkthrough of features and logging tasks."
    },
    {
      title: "Maximize Your Points",
      duration: "5:00",
      category: "Strategy",
      thumbnail: "https://images.unsplash.com/photo-1466611653911-954ff9a43a86?auto=format&fit=crop&q=80&w=400",
      description: "Advanced challenges to climb the leaderboard faster."
    }
  ];

  const stats = [
    { label: "Total Points", value: "1,247", icon: "⭐", color: "#FFD700" },
    { label: "Challenges Completed", value: "23", icon: "🎯", color: "#4CAF50" },
    { label: "Days Active", value: "45", icon: "🔥", color: "#FF5722" },
    { label: "Rank", value: "#156", icon: "🏆", color: "#9C27B0" }
  ];

  const recentActivities = [
    { action: "Recycled plastic bottles", points: "+50", time: "2 hours ago" },
    { action: "Used reusable bags", points: "+30", time: "5 hours ago" },
    { action: "Bike commute to work", points: "+75", time: "Yesterday" }
  ];

  return (
    <div className="dashboard-container">
      {/* ATMOSPHERIC BACKGROUND - Same as Login */}
      <div className="sky-background">
        <div className="sun"></div>
        <div className="sun-rays"></div>
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        
        <div className="aurora aurora-1"></div>
        <div className="aurora aurora-2"></div>
        
        <div className="starfield">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="star" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}></div>
          ))}
        </div>

        {[...Array(5)].map((_, i) => (
          <div key={i} className={`cloud cloud-${i + 1}`}></div>
        ))}

        {[...Array(3)].map((_, i) => (
          <div key={i} className={`bird bird-${i + 1}`}>
            <div className="bird-wing wing-left"></div>
            <div className="bird-wing wing-right"></div>
          </div>
        ))}

        {[...Array(10)].map((_, i) => (
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
        <div className="mountain mountain-front-1"></div>
      </div>

      {/* Trees */}
      <div className="trees-container">
        {[...Array(8)].map((_, i) => (
          <div key={i} className={`tree tree-${i + 1}`}>
            <div className="leaves leaves-bottom"></div>
            <div className="leaves leaves-middle"></div>
            <div className="leaves leaves-top"></div>
            <div className="trunk"></div>
          </div>
        ))}
      </div>

      {/* Header Navigation */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <span className="logo-icon">🏔️</span>
            <h1 className="logo-text">Eco Journey</h1>
          </div>
          <div className="user-section">
            <span className="welcome-text">Welcome back, <strong>{userName}</strong></span>
            <button onClick={handleLogout} className="logout-button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="logout-icon">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="glass-panel">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h2 className="hero-title">Your Eco Impact Dashboard</h2>
            <p className="hero-subtitle">Track your journey towards a sustainable lifestyle</p>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="stats-section">
          <div className="stats-grid">
            {stats.map((stat, i) => (
              <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="stat-icon" style={{ background: `linear-gradient(135deg, ${stat.color}, ${stat.color}dd)` }}>
                  {stat.icon}
                </div>
                <div className="stat-info">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
                <div className="stat-shimmer"></div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="activity-section">
          <div className="section-header">
            <h3>Recent Activity</h3>
            <button className="view-all">View All</button>
          </div>
          <div className="activity-list">
            {recentActivities.map((activity, i) => (
              <div key={i} className="activity-item" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="activity-icon">✓</div>
                <div className="activity-details">
                  <p className="activity-action">{activity.action}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
                <div className="activity-points">{activity.points}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Video Section */}
        <section className="video-section">
          <div className="section-header">
            <h3>Eco Tutorials & Tips</h3>
            <button className="view-all">See All</button>
          </div>
          
          <div className="video-grid">
            {videos.map((video, i) => (
              <div key={i} className="video-card" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="thumbnail-wrapper">
                  <img src={video.thumbnail} alt={video.title} />
                  <span className="duration">{video.duration}</span>
                  <div className="play-overlay">
                    <div className="play-button"></div>
                  </div>
                </div>
                <div className="video-info">
                  <span className="video-category">{video.category}</span>
                  <h4>{video.title}</h4>
                  <p>{video.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <style jsx>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        .dashboard-container {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          padding: 20px;
        }

        /* ===== ATMOSPHERIC BACKGROUND (Same as Login) ===== */
        .sky-background {
          position: fixed;
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
          50% { filter: hue-rotate(10deg) brightness(1.1); }
        }

        .sun {
          position: absolute;
          top: 8%;
          right: 12%;
          width: 120px;
          height: 120px;
          background: radial-gradient(circle, #FFFEF0, #FFE066, #FFD700);
          border-radius: 50%;
          filter: blur(5px);
          opacity: 0.95;
          animation: sunPulse 5s ease-in-out infinite;
          box-shadow: 0 0 60px rgba(255, 224, 102, 0.8), 0 0 100px rgba(255, 215, 0, 0.5);
        }

        @keyframes sunPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .sun-rays {
          position: absolute;
          top: 8%;
          right: 12%;
          width: 120px;
          height: 120px;
          animation: sunRotate 30s linear infinite;
        }

        .sun-rays::before {
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
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-25px, 20px) scale(0.9); }
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
          background: linear-gradient(90deg, transparent 0%, rgba(0, 255, 200, 0.5) 25%, rgba(100, 200, 255, 0.5) 50%, transparent 100%);
          animation: auroraFlow1 15s ease-in-out infinite;
        }

        .aurora-2 {
          background: linear-gradient(90deg, transparent 0%, rgba(255, 100, 200, 0.4) 30%, rgba(100, 255, 200, 0.4) 60%, transparent 100%);
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

        .firefly {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #ffd54f;
          border-radius: 50%;
          box-shadow: 0 0 10px #ffd54f, 0 0 20px #ffeb3b;
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
        .cloud-3 { width: 90px; height: 30px; top: 8%; left: -100px; animation: cloudMove1 45s linear infinite 5s; }
        .cloud-3::before { width: 45px; height: 45px; top: -22px; left: 12px; }
        .cloud-3::after { width: 50px; height: 50px; top: -25px; right: 12px; }
        .cloud-4 { width: 110px; height: 38px; top: 28%; left: -130px; animation: cloudMove2 55s linear infinite 10s; }
        .cloud-4::before { width: 52px; height: 52px; top: -26px; left: 18px; }
        .cloud-4::after { width: 58px; height: 58px; top: -29px; right: 18px; }
        .cloud-5 { width: 95px; height: 32px; top: 15%; left: -110px; animation: cloudMove1 42s linear infinite 15s; }
        .cloud-5::before { width: 48px; height: 48px; top: -24px; left: 14px; }
        .cloud-5::after { width: 53px; height: 53px; top: -27px; right: 14px; }

        @keyframes cloudMove1 { 0% { left: -150px; } 100% { left: 110%; } }
        @keyframes cloudMove2 { 0% { left: -180px; } 100% { left: 110%; } }

        .bird { position: absolute; width: 30px; height: 8px; z-index: 2; }
        .bird-wing { position: absolute; width: 15px; height: 2px; background: #37474f; border-radius: 2px; }
        .wing-left { left: 0; transform-origin: right center; animation: flapLeft 0.4s ease-in-out infinite; }
        .wing-right { right: 0; transform-origin: left center; animation: flapRight 0.4s ease-in-out infinite; }

        @keyframes flapLeft { 0%, 100% { transform: rotateZ(-20deg); } 50% { transform: rotateZ(-50deg); } }
        @keyframes flapRight { 0%, 100% { transform: rotateZ(20deg); } 50% { transform: rotateZ(50deg); } }

        .bird-1 { top: 15%; animation: birdFly1 30s linear infinite; }
        .bird-2 { top: 22%; animation: birdFly2 35s linear infinite 3s; }
        .bird-3 { top: 18%; animation: birdFly1 32s linear infinite 8s; }

        @keyframes birdFly1 { 0% { left: -50px; } 100% { left: 110%; } }
        @keyframes birdFly2 { 0% { right: -50px; } 100% { right: 110%; } }

        .mountains-container { position: fixed; bottom: 20%; width: 100%; height: 40%; z-index: 1; pointer-events: none; }

        .mountain { position: absolute; bottom: 0; animation: mountainFloat 10s ease-in-out infinite; }

        @keyframes mountainFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

        .mountain-back-1 { left: 5%; width: 0; height: 0; border-left: 180px solid transparent; border-right: 180px solid transparent; border-bottom: 280px solid #607d8b; opacity: 0.5; filter: blur(2px); }
        .mountain-back-2 { right: 10%; width: 0; height: 0; border-left: 200px solid transparent; border-right: 200px solid transparent; border-bottom: 300px solid #546e7a; opacity: 0.5; animation-delay: 1.5s; filter: blur(2px); }
        .mountain-mid-1 { left: 15%; width: 0; height: 0; border-left: 150px solid transparent; border-right: 150px solid transparent; border-bottom: 240px solid #78909c; opacity: 0.7; animation-delay: 3s; filter: blur(1px); }
        .mountain-front-1 { left: 25%; width: 0; height: 0; border-left: 130px solid transparent; border-right: 130px solid transparent; border-bottom: 200px solid #9e9e9e; opacity: 0.9; animation-delay: 6s; }

        .ground { position: fixed; bottom: 0; width: 100%; height: 20%; background: linear-gradient(to bottom, #7d6956 0%, #6B5344 50%, #5a4635 100%); z-index: 2; pointer-events: none; box-shadow: inset 0 10px 30px rgba(0, 0, 0, 0.3); }

        .trees-container { position: fixed; bottom: 20%; width: 100%; height: 25%; z-index: 4; pointer-events: none; }

        .tree { position: absolute; bottom: 0; animation: treeWind 4s ease-in-out infinite; }

        @keyframes treeWind { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(2deg); } 75% { transform: rotate(-2deg); } }

        .trunk { width: 12px; height: 35px; background: linear-gradient(to right, #5D4037, #4E342E); margin: 0 auto; border-radius: 2px; box-shadow: inset -2px 0 4px rgba(0, 0, 0, 0.3); }

        .leaves { background: linear-gradient(135deg, #43A047, #2E7D32, #1B5E20); border-radius: 50%; margin: 0 auto; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2); }
        .leaves-bottom { width: 40px; height: 40px; margin-top: -20px; animation: leavesRustle 3s ease-in-out infinite 0.6s; }
        .leaves-middle { width: 35px; height: 35px; margin-top: -18px; animation: leavesRustle 3s ease-in-out infinite 0.3s; }
        .leaves-top { width: 28px; height: 28px; margin-top: -14px; animation: leavesRustle 3s ease-in-out infinite; }

        @keyframes leavesRustle { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }

        .tree-1 { left: 8%; animation-delay: 0s; }
        .tree-2 { left: 18%; animation-delay: 0.6s; }
        .tree-3 { left: 28%; animation-delay: 1.2s; }
        .tree-4 { left: 42%; animation-delay: 0.4s; }
        .tree-5 { left: 58%; animation-delay: 0.2s; }
        .tree-6 { left: 68%; animation-delay: 0.8s; }
        .tree-7 { left: 78%; animation-delay: 0.5s; }
        .tree-8 { left: 88%; animation-delay: 1.1s; }

        /* ===== HEADER ===== */
        .dashboard-header {
          position: relative;
          z-index: 50;
          margin-bottom: 30px;
          animation: slideDown 0.8s ease;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .header-content {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 20px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.5);
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          font-size: 32px;
          animation: iconFloat 3s ease-in-out infinite;
        }

        @keyframes iconFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .logo-text {
          font-size: 24px;
          font-weight: 900;
          background: linear-gradient(135deg, #0097a7, #00bcd4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .user-section {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .welcome-text {
          color: #546e7a;
          font-size: 14px;
        }

        .welcome-text strong {
          color: #263238;
          font-weight: 800;
        }

        .logout-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: linear-gradient(135deg, #f44336, #e53935);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);
        }

        .logout-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(244, 67, 54, 0.4);
        }

        .logout-icon {
          width: 18px;
          height: 18px;
          stroke-width: 2.5;
        }

        /* ===== MAIN CONTENT ===== */
        .glass-panel {
          position: relative;
          z-index: 30;
          background: rgba(255, 255, 255, 0.93);
          backdrop-filter: blur(20px);
          border-radius: 32px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.5);
          animation: fadeInUp 1s ease;
          max-width: 1400px;
          margin: 0 auto;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ===== HERO SECTION ===== */
        .hero-section {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 30px;
          border-bottom: 2px solid rgba(0, 188, 212, 0.1);
        }

        .hero-title {
          font-size: 36px;
          font-weight: 900;
          background: linear-gradient(135deg, #0097a7, #00bcd4, #26c6da);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 10px;
          animation: textShine 3s ease-in-out infinite;
        }

        @keyframes textShine {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.2); }
        }

        .hero-subtitle {
          color: #78909c;
          font-size: 16px;
        }

        /* ===== STATS SECTION ===== */
        .stats-section {
          margin-bottom: 40px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
        }

        .stat-card {
          background: white;
          border-radius: 20px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          overflow: hidden;
          opacity: 0;
          animation: cardSlideIn 0.6s ease forwards;
        }

        @keyframes cardSlideIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .stat-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 40px rgba(0, 188, 212, 0.2);
        }

        .stat-shimmer {
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          animation: shimmer 3s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% { left: -100%; }
          50%, 100% { left: 150%; }
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .stat-info {
          flex: 1;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 900;
          color: #263238;
          line-height: 1;
          margin-bottom: 6px;
        }

        .stat-label {
          font-size: 13px;
          color: #78909c;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* ===== ACTIVITY SECTION ===== */
        .activity-section {
          margin-bottom: 40px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-header h3 {
          font-size: 22px;
          font-weight: 800;
          color: #263238;
        }

        .view-all {
          background: none;
          border: none;
          color: #00838f;
          font-weight: 700;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
          position: relative;
        }

        .view-all::after {
          content: '→';
          margin-left: 6px;
          transition: transform 0.3s ease;
          display: inline-block;
        }

        .view-all:hover::after {
          transform: translateX(4px);
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .activity-item {
          background: white;
          border-radius: 16px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
          opacity: 0;
          animation: cardSlideIn 0.6s ease forwards;
        }

        .activity-item:hover {
          transform: translateX(8px);
          box-shadow: 0 6px 20px rgba(0, 188, 212, 0.15);
        }

        .activity-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #4CAF50, #66BB6A);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 900;
          font-size: 18px;
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        }

        .activity-details {
          flex: 1;
        }

        .activity-action {
          color: #263238;
          font-weight: 600;
          font-size: 15px;
          margin-bottom: 4px;
        }

        .activity-time {
          color: #90a4ae;
          font-size: 12px;
        }

        .activity-points {
          color: #4CAF50;
          font-weight: 900;
          font-size: 18px;
        }

        /* ===== VIDEO SECTION ===== */
        .video-section {
          margin-top: 40px;
        }

        .video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }

        .video-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
          opacity: 0;
          animation: cardSlideIn 0.6s ease forwards;
        }

        .video-card:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 15px 50px rgba(0, 188, 212, 0.25);
        }

        .thumbnail-wrapper {
          position: relative;
          height: 160px;
          overflow: hidden;
        }

        .thumbnail-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .video-card:hover .thumbnail-wrapper img {
          transform: scale(1.1);
        }

        .duration {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(0, 0, 0, 0.85);
          color: white;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          backdrop-filter: blur(10px);
        }

        .play-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 188, 212, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .video-card:hover .play-overlay {
          opacity: 1;
        }

        .play-button {
          width: 60px;
          height: 60px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: scale(0.8);
          transition: transform 0.3s ease;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
        }

        .video-card:hover .play-button {
          transform: scale(1);
        }

        .play-button::after {
          content: '';
          width: 0;
          height: 0;
          border-left: 18px solid #00bcd4;
          border-top: 12px solid transparent;
          border-bottom: 12px solid transparent;
          margin-left: 4px;
        }

        .video-info {
          padding: 20px;
        }

        .video-category {
          color: #00ACC1;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          display: inline-block;
          padding: 4px 10px;
          background: rgba(0, 172, 193, 0.1);
          border-radius: 6px;
          margin-bottom: 10px;
        }

        .video-info h4 {
          margin: 8px 0;
          font-size: 17px;
          color: #263238;
          font-weight: 800;
          line-height: 1.4;
        }

        .video-info p {
          font-size: 14px;
          color: #78909c;
          line-height: 1.5;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 15px;
          }

          .header-content {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }

          .user-section {
            flex-direction: column;
            gap: 10px;
          }

          .glass-panel {
            padding: 25px 20px;
          }

          .hero-title {
            font-size: 28px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .video-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .logo-text {
            font-size: 20px;
          }

          .hero-title {
            font-size: 24px;
          }

          .section-header h3 {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  );
}
