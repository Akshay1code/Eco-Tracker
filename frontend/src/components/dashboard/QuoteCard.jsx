import { useEffect, useState } from 'react';
import { QUOTES } from '../../data/mockData.js';

function QuoteCard() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % QUOTES.length);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  const quote = QUOTES[index];

  return (
    <section className="card-dark" style={{ padding: 22, color: '#fff' }}>
      <div style={{ fontSize: 13, color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: 1.2 }}>Daily Wisdom</div>
      <p key={index} className="quote-anim" style={{ fontSize: 24, lineHeight: 1.35, marginTop: 10 }}>
        "{quote.text}"
      </p>
      <div style={{ marginTop: 10, color: 'rgba(255,255,255,.8)' }}>- {quote.author}</div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        {QUOTES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Quote ${i + 1}`}
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              border: 'none',
              background: i === index ? '#4ade80' : 'rgba(255,255,255,.35)',
              cursor: 'pointer',
            }}
          />
        ))}
      </div>
    </section>
  );
}

export default QuoteCard;
