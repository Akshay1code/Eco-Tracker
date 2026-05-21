import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QUOTES from '../../data/environmentalQuotes.json';

const THEMES = {
  morning: {
    bg: '/scenic_lake_morning_bg.png',
    overlayBg: 'rgba(255, 255, 255, 0.08)',
    textColor: '#ffffff',
    borderColor: 'rgba(255, 255, 255, 0.16)',
    shadow: 'none',
  },
  noon: {
    bg: '/scenic_lake_noon_bg.png',
    overlayBg: 'rgba(255, 255, 255, 0.08)',
    textColor: '#ffffff',
    borderColor: 'rgba(255, 255, 255, 0.16)',
    shadow: 'none',
  },
  night: {
    bg: '/scenic_lake_night_bg.png',
    overlayBg: 'rgba(255, 255, 255, 0.06)',
    textColor: '#ffffff',
    borderColor: 'rgba(255, 255, 255, 0.14)',
    shadow: 'none',
  }
};

const getThemeKey = (hour) => {
  if (hour >= 6 && hour < 12) {
    return 'morning';
  } else if (hour >= 12 && hour < 17) {
    return 'noon';
  } else {
    return 'night';
  }
};

function QuoteCard() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [themeKey, setThemeKey] = useState(() => getThemeKey(new Date().getHours()));

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % QUOTES.length);
    }, 10_000); // Rotate quotes every 10 seconds
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handleTimeCheck = () => {
      const currentHour = new Date().getHours();
      setThemeKey(getThemeKey(currentHour));
    };

    // Run check every minute to keep background updated in real-time
    const intervalId = setInterval(handleTimeCheck, 60_000);
    return () => clearInterval(intervalId);
  }, []);

  const quote = QUOTES[index];
  const activeTheme = THEMES[themeKey];

  return (
    <section
      style={{
        position: 'relative',
        backgroundImage: `url('${activeTheme.bg}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 12px 32px rgba(15, 61, 31, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        width: '100%',
        minHeight: 280,
        height: '320px',
        display: 'flex',
        alignItems: 'center',
        padding: '24px',
        transition: 'background-image 1s ease-in-out',
      }}
    >
      {/* 
        This glass container is positioned on the left, matching the layout in the screenshot
        with a transparent glassmorphic style and an elegant white outline.
      */}
      <div
        style={{
          position: 'absolute',
          left: '3%',
          top: '10%',
          width: '45%',
          height: '80%',
          background: activeTheme.overlayBg,
          backdropFilter: 'blur(8px) saturate(110%)',
          border: `1px solid ${activeTheme.borderColor}`,
          borderRadius: 24,
          padding: '24px 28px',
          boxShadow: activeTheme.shadow,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
          transition: 'all 1s ease',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            style={{
              fontSize: 'clamp(14px, 1.8vw, 21px)',
              fontWeight: 600,
              lineHeight: 1.45,
              color: activeTheme.textColor,
              margin: 0,
              textAlign: 'left',
              fontFamily: "'Poppins', sans-serif",
              textShadow: '0 2px 6px rgba(0, 0, 0, 0.35)',
              transition: 'color 1s ease',
            }}
          >
            {quote.text}
          </motion.p>
        </AnimatePresence>
      </div>
    </section>
  );
}

export default QuoteCard;
