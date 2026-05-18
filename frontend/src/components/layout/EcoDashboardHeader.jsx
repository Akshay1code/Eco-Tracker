import { useEffect, useMemo, useState } from 'react';
import { FaFire } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';

function getGreeting(currentDate) {
  const hour = currentDate.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(currentDate) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(currentDate);
}

function EcoDashboardHeader({
  userName = 'EcoWarrior',
  streakDays = 0,
  currentDate = new Date(),
  onLogout,
}) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const greeting = useMemo(() => getGreeting(currentDate), [currentDate]);
  const dateText = useMemo(() => formatDate(currentDate), [currentDate]);

  const styles = {
    header: {
      position: 'sticky',
      top: 0,
      zIndex: 40,
      minHeight: 72,
      padding: isMobile ? '12px 16px' : '0 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: isMobile ? 12 : 18,
      background:
        'linear-gradient(90deg, #e8f5e9 0%, #f0faf0 48%, #e6f4ea 100%)',
      borderBottom: '1px solid rgba(134,197,134,0.25)',
      boxShadow: '0 2px 12px rgba(100,180,100,0.08)',
      overflow: 'hidden',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
    },
    glowLeft: {
      position: 'absolute',
      inset: '-40% auto -35% -8%',
      width: isMobile ? 160 : 260,
      background:
        'radial-gradient(circle, rgba(129,199,132,0.22) 0%, rgba(129,199,132,0.08) 42%, transparent 74%)',
      pointerEvents: 'none',
      zIndex: 0,
    },
    glowRight: {
      position: 'absolute',
      inset: '-45% -10% -38% auto',
      width: isMobile ? 180 : 280,
      background:
        'radial-gradient(circle, rgba(174,213,129,0.22) 0%, rgba(174,213,129,0.08) 44%, transparent 76%)',
      pointerEvents: 'none',
      zIndex: 0,
    },
    centerDecoration: {
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      opacity: isMobile ? 0.08 : 0.11,
      pointerEvents: 'none',
      zIndex: 0,
      animation: 'ecoHeaderLeafSway 6s ease-in-out infinite',
      filter: 'blur(0.1px)',
    },
    identity: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      minWidth: 0,
      flex: '1 1 0',
      position: 'relative',
      zIndex: 1,
    },
    titleRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      minWidth: 0,
    },
    titleBadge: {
      width: isMobile ? 30 : 34,
      height: isMobile ? 30 : 34,
      borderRadius: 12,
      display: 'grid',
      placeItems: 'center',
      background:
        'linear-gradient(135deg, rgba(111,207,115,0.24), rgba(171,226,174,0.7))',
      border: '1px solid rgba(102,187,106,0.25)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
      flexShrink: 0,
    },
    title: {
      margin: 0,
      fontSize: isMobile ? 18 : 22,
      fontWeight: 800,
      color: '#1b5e20',
      lineHeight: 1.05,
      letterSpacing: '-0.03em',
      whiteSpace: 'nowrap',
    },
    subLineWrap: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: isMobile ? 2 : 10,
      marginTop: 6,
      minWidth: 0,
    },
    subText: {
      fontSize: 13,
      color: '#6b9e6b',
      fontWeight: 400,
      whiteSpace: isMobile ? 'normal' : 'nowrap',
      lineHeight: 1.35,
    },
    subName: {
      fontWeight: 600,
      color: '#5b8f5f',
    },
    dateDot: {
      display: isMobile ? 'none' : 'inline-block',
      width: 4,
      height: 4,
      borderRadius: '50%',
      background: 'rgba(107,158,107,0.45)',
      flexShrink: 0,
    },
    rightCluster: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 12,
      flex: '1 1 0',
      position: 'relative',
      zIndex: 1,
      minWidth: 0,
    },
    greetingPill: {
      display: isMobile ? 'none' : 'flex',
      alignItems: 'center',
      padding: '6px 14px',
      borderRadius: 20,
      background: 'rgba(200,240,200,0.55)',
      border: '1px solid rgba(134,197,134,0.35)',
      color: '#2e7d32',
      fontSize: 12,
      fontWeight: 600,
      whiteSpace: 'nowrap',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
    },
    streakButton: {
      height: 36,
      padding: isMobile ? '0 13px' : '0 16px',
      borderRadius: 18,
      border: 'none',
      background: 'linear-gradient(135deg, #ff9800, #f44336)',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      fontSize: 13,
      fontWeight: 700,
      boxShadow: '0 4px 14px rgba(255,152,0,0.38)',
      cursor: 'pointer',
      transform: 'scale(1)',
      transition: 'transform 0.2s ease',
      whiteSpace: 'nowrap',
    },
    logoutButton: {
      height: 36,
      padding: isMobile ? '0 15px' : '0 20px',
      borderRadius: 18,
      border: 'none',
      background: 'linear-gradient(135deg, #c62828, #e53935)',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      fontSize: 13,
      fontWeight: 700,
      boxShadow: '0 4px 14px rgba(198,40,40,0.32)',
      cursor: 'pointer',
      transform: 'scale(1)',
      transition: 'transform 0.2s ease, opacity 0.2s ease',
      whiteSpace: 'nowrap',
    },
    iconCream: {
      color: '#fff3e0',
      width: 15,
      height: 15,
      flexShrink: 0,
    },
    iconWhite: {
      color: '#ffffff',
      width: 15,
      height: 15,
      flexShrink: 0,
    },
  };

  return (
    <>
      <style>{`
        @keyframes ecoHeaderLeafSway {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          25% { transform: translate(-50%, -50%) rotate(8deg); }
          50% { transform: translate(-50%, -50%) rotate(0deg); }
          75% { transform: translate(-50%, -50%) rotate(-8deg); }
          100% { transform: translate(-50%, -50%) rotate(0deg); }
        }
      `}</style>
      <header style={styles.header}>
        <div style={styles.glowLeft} aria-hidden="true" />
        <div style={styles.glowRight} aria-hidden="true" />

        <div style={styles.identity}>
          <div style={styles.titleRow}>
            <div style={styles.titleBadge} aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M16.7 3.4C13 4.5 8.5 8.5 6.5 12.7C5.1 15.6 4.9 18.6 6 20.7C6.9 22.2 8.7 23.2 10.7 23.2C14.2 23.2 17.2 20.7 18.5 16.8C19.3 14.6 19.2 12.2 18.4 9.7C17.9 8.3 17.3 6.8 16.7 3.4Z"
                  fill="#43a047"
                />
              </svg>
            </div>
            <h1 style={styles.title}>Eco Dashboard</h1>
          </div>
          <div style={styles.subLineWrap}>
            <div style={styles.subText}>
              {greeting}
              {', '}
              <span style={styles.subName}>{userName}</span>
            </div>
            <span style={styles.dateDot} aria-hidden="true" />
            <div style={styles.subText}>{dateText}</div>
          </div>
        </div>

        <div style={styles.centerDecoration} aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
            <path
              d="M45.7 8.4C35.8 11.4 23.6 22 18.3 33.2C14.6 41 13.9 48.8 17 54.3C19.3 58.3 24 60.8 29.5 60.8C38.9 60.8 47 54.2 50.6 43.6C52.6 37.7 52.5 31.4 50.2 24.6C48.9 20.7 47.4 16.7 45.7 8.4Z"
              fill="#4caf50"
            />
          </svg>
        </div>

        <div style={styles.rightCluster}>
          <div style={styles.greetingPill}>Welcome back, {userName}.</div>
          <button
            type="button"
            style={styles.streakButton}
            onMouseEnter={(event) => {
              event.currentTarget.style.transform = 'scale(1.04)';
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.transform = 'scale(1)';
            }}
            aria-label={`${streakDays}-day streak`}
          >
            <FaFire style={styles.iconCream} />
            <span>{streakDays}-day streak</span>
          </button>
          <button
            type="button"
            style={styles.logoutButton}
            onClick={onLogout}
            onMouseEnter={(event) => {
              event.currentTarget.style.transform = 'scale(1.03)';
              event.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.transform = 'scale(1)';
              event.currentTarget.style.opacity = '1';
            }}
          >
            <FiLogOut style={styles.iconWhite} />
            <span>Logout</span>
          </button>
        </div>
      </header>
    </>
  );
}

export default EcoDashboardHeader;
