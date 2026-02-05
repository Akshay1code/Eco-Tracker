import React from 'react';

export default function Dashboard() {
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

  return (
    <div className="dashboard-container">
      {/* ... (Previous animated background code remains the same) ... */}
      
      <main className="glass-panel">
        {/* ... (Previous Header and Stats sections remain the same) ... */}

        <section className="video-section">
          <div className="section-header">
            <h3>Eco Tutorials & Tips</h3>
            <button className="view-all">See All</button>
          </div>
          
          <div className="video-grid">
            {videos.map((video, i) => (
              <div key={i} className="video-card">
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
        /* ... (Existing styles for background and stats) ... */

        .video-section {
          margin-top: 40px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .view-all {
          background: none;
          border: none;
          color: #00838f;
          font-weight: 700;
          cursor: pointer;
          font-size: 14px;
        }

        .video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .video-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          transition: transform 0.3s ease;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .video-card:hover {
          transform: translateY(-5px);
        }

        .thumbnail-wrapper {
          position: relative;
          height: 140px;
        }

        .thumbnail-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .duration {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
        }

        .play-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .video-card:hover .play-overlay {
          opacity: 1;
        }

        .play-button {
          width: 40px;
          height: 40px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          clip-path: polygon(35% 25%, 35% 75%, 75% 50%);
        }

        .video-info {
          padding: 15px;
        }

        .video-category {
          color: #00ACC1;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .video-info h4 {
          margin: 5px 0;
          font-size: 16px;
          color: #263238;
        }

        .video-info p {
          font-size: 13px;
          color: #78909c;
          line-height: 1.4;
        }

        /* Responsive Tweaks */
        @media (max-width: 600px) {
          .video-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}