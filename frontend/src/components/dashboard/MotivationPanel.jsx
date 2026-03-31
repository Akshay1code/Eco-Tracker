import React, { useState, useEffect } from 'react';

const quotes = [
    { text: "In every walk with nature, one receives far more than he seeks.", author: "John Muir" },
    { text: "The Earth does not belong to us: we belong to the Earth.", author: "Marlee Matlin" },
    { text: "To leave the world better than you found it, sometimes you have to pick up other people's trash.", author: "Bill Nye" },
    { text: "Look deep into nature, and then you will understand everything better.", author: "Albert Einstein" }
];

const MotivationPanel = () => {
    const [currentQuote, setCurrentQuote] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setCurrentQuote(prev => (prev + 1) % quotes.length);
                setFade(true);
            }, 500); // 500ms fade out duration
        }, 8000); // Rotate every 8 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="eco-card motivation-panel" style={{ padding: '2rem', position: 'relative', overflow: 'hidden', minHeight: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

            {/* Drifting Leaves Background */}
            <div className="drifting-leaf leaf-a">🍃</div>
            <div className="drifting-leaf leaf-b">🌿</div>
            <div className="drifting-leaf leaf-c">🌱</div>

            <div style={{
                position: 'relative',
                zIndex: 2,
                transition: 'opacity 0.5s ease',
                opacity: fade ? 1 : 0,
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '2rem', color: 'var(--mint-green)', marginBottom: '0.5rem', opacity: 0.5 }}>"</div>
                <p style={{ fontStyle: 'italic', fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1rem', lineHeight: '1.6' }}>
                    {quotes[currentQuote].text}
                </p>
                <p style={{ fontWeight: 'bold', color: 'var(--leaf-green)', fontSize: '0.9rem' }}>
                    — {quotes[currentQuote].author}
                </p>
            </div>

            <style>{`
        .motivation-panel {
          background: linear-gradient(135deg, rgba(167, 243, 208, 0.1), rgba(250, 204, 21, 0.05));
        }

        .drifting-leaf {
          position: absolute;
          font-size: 1.5rem;
          opacity: 0.2;
          pointer-events: none;
        }

        .leaf-a { top: 20%; animation: drift 15s linear infinite; }
        .leaf-b { top: 60%; animation: drift 20s linear infinite 5s; }
        .leaf-c { top: 40%; animation: drift 18s linear infinite 10s; }

        @keyframes drift {
          0% { left: -10%; transform: rotate(0deg) translateY(0); }
          50% { transform: rotate(180deg) translateY(-20px); }
          100% { left: 110%; transform: rotate(360deg) translateY(0); }
        }
      `}</style>
        </div>
    );
};

export default MotivationPanel;
