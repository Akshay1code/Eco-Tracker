import { useEffect, useMemo, useRef, useState } from 'react';
import { RxHamburgerMenu } from 'react-icons/rx';
import {
  MdDashboard,
  MdDirectionsRun,
  MdPeople,
  MdMenuBook,
  MdTrackChanges,
  MdEco,
} from 'react-icons/md';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', Icon: MdDashboard },
  { key: 'activity', label: 'Activity', Icon: MdDirectionsRun },
  { key: 'community', label: 'Community', Icon: MdPeople },
  { key: 'journal', label: 'Journal', Icon: MdMenuBook },
  { key: 'goals', label: 'Goals', Icon: MdTrackChanges },
];

function Sidebar({
  activeItem = 'Dashboard',
  userName = 'Eco Explorer',
  userInitials = 'EE',
  dailyFootprint = 0.41,
  onNavigate,
}) {
  const sidebarRef = useRef(null);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [currentActiveItem, setCurrentActiveItem] = useState(activeItem);

  useEffect(() => {
    setCurrentActiveItem(activeItem);
  }, [activeItem]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsOpen(false);
        setIsOverlayVisible(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      return undefined;
    }

    const node = sidebarRef.current;
    if (!node) {
      return undefined;
    }

    node.style.transform = isOpen ? 'translateX(0)' : 'translateX(-100%)';
    return undefined;
  }, [isMobile, isOpen]);

  const openSidebar = () => {
    setIsOverlayVisible(true);
    window.setTimeout(() => {
      setIsOpen(true);
    }, 10);
  };

  const closeSidebar = () => {
    setIsOpen(false);
    window.setTimeout(() => {
      setIsOverlayVisible(false);
    }, 200);
  };

  const handleNavigate = (item) => {
    setCurrentActiveItem(item.label);
    if (onNavigate) {
      onNavigate(item);
    }
    if (isMobile) {
      closeSidebar();
    }
  };

  const formattedFootprint = useMemo(() => `${Number(dailyFootprint || 0).toFixed(2)} kg CO₂`, [dailyFootprint]);

  const styles = {
    shell: {
      display: 'contents',
    },
    hamburger: {
      display: isMobile ? 'flex' : 'none',
      position: 'fixed',
      top: 16,
      left: 16,
      zIndex: 60,
      width: 48,
      height: 48,
      borderRadius: 14,
      background: 'linear-gradient(135deg, #173f2b, #215c3d)',
      border: 'none',
      cursor: 'pointer',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 6px 18px rgba(12, 44, 28, 0.34)',
      transform: 'scale(1)',
      transition: 'transform 0.2s ease',
    },
    overlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(4,12,8,0.56)',
      zIndex: 40,
      backdropFilter: 'blur(3px)',
      WebkitBackdropFilter: 'blur(3px)',
      opacity: isOpen ? 1 : 0,
      transition: 'opacity 280ms ease',
      display: isMobile && isOverlayVisible ? 'block' : 'none',
    },
    sidebar: {
      width: 260,
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      padding: '28px 0',
      display: 'flex',
      flexDirection: 'column',
      background:
        'linear-gradient(180deg, #0d311f 0%, #102f21 38%, #0b271a 100%)',
      borderRight: '1px solid rgba(167, 243, 208, 0.08)',
      overflow: 'hidden',
      zIndex: 50,
      transform: isMobile ? 'translateX(-100%)' : 'translateX(0)',
      transition: 'transform 320ms cubic-bezier(0.4,0,0.2,1)',
      boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.02)',
    },
    brandWrap: {
      padding: '0 24px 24px',
    },
    brand: {
      fontSize: 26,
      fontWeight: 900,
      color: '#7ae58b',
      letterSpacing: '-0.5px',
      lineHeight: 1.05,
      textShadow: '0 0 22px rgba(122,229,139,0.08)',
    },
    divider: {
      marginTop: 14,
      borderTop: '1px solid rgba(167,214,167,0.12)',
    },
    profileCard: {
      margin: '0 14px 20px',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.04))',
      border: '1px solid rgba(167,214,167,0.11)',
      borderRadius: 14,
      padding: '12px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      transition: 'background 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
    },
    avatar: {
      width: 46,
      height: 46,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #3b9b52, #7ae58b)',
      display: 'grid',
      placeItems: 'center',
      fontSize: 16,
      fontWeight: 800,
      color: '#123320',
      flexShrink: 0,
      boxShadow: '0 8px 18px rgba(61, 153, 88, 0.24)',
    },
    profileName: {
      fontSize: 14,
      fontWeight: 700,
      color: '#edf8ef',
      lineHeight: 1.2,
    },
    profileSub: {
      marginTop: 4,
      fontSize: 11,
      fontWeight: 400,
      color: '#96c89c',
      lineHeight: 1.2,
    },
    navScroll: {
      padding: '0 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      overflowY: 'auto',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      flex: 1,
    },
    spacer: {
      flex: 1,
      minHeight: 16,
    },
    footprintCard: {
      margin: '0 14px',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.045))',
      border: '1px solid rgba(167,214,167,0.11)',
      borderRadius: 14,
      padding: '14px 16px',
      position: 'relative',
      transition: 'border-color 0.25s ease, background 0.25s ease',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
    },
    footprintLabel: {
      fontSize: 11,
      fontWeight: 500,
      color: '#95c59a',
      textTransform: 'uppercase',
      letterSpacing: '0.8px',
    },
    footprintValue: {
      marginTop: 10,
      fontSize: 22,
      fontWeight: 800,
      color: '#78e289',
      lineHeight: 1.1,
    },
    ecoIcon: {
      position: 'absolute',
      right: 14,
      top: 14,
      width: 18,
      height: 18,
      color: '#a6d3ab',
    },
  };

  return (
    <>
      <style>{`
        .eco-sidebar-nav::-webkit-scrollbar { display: none; }
      `}</style>
      <div style={styles.shell}>
        <button
          type="button"
          style={styles.hamburger}
          aria-label="Open navigation menu"
          onClick={openSidebar}
          onMouseEnter={(event) => {
            event.currentTarget.style.transform = 'scale(1.06)';
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <RxHamburgerMenu size={22} color="#69f07a" />
        </button>

        <div style={styles.overlay} onClick={closeSidebar} aria-hidden="true" />

        <aside ref={sidebarRef} style={styles.sidebar}>
          <div style={styles.brandWrap}>
            <div style={styles.brand}>EcoJourney</div>
            <div style={styles.divider} />
          </div>

          <div
            style={styles.profileCard}
            role="button"
            tabIndex={0}
            onClick={() => {
              if (onNavigate) {
                onNavigate({ key: 'profile', label: 'Profile' });
              }
              if (isMobile) {
                closeSidebar();
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                if (onNavigate) {
                  onNavigate({ key: 'profile', label: 'Profile' });
                }
                if (isMobile) {
                  closeSidebar();
                }
              }
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.09), rgba(255,255,255,0.06))';
              event.currentTarget.style.borderColor = 'rgba(167,214,167,0.18)';
              event.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.04))';
              event.currentTarget.style.borderColor = 'rgba(167,214,167,0.11)';
              event.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={styles.avatar}>{userInitials}</div>
            <div>
              <div style={styles.profileName}>{userName}</div>
              <div style={styles.profileSub}>Carbon Tracker RPG</div>
            </div>
          </div>

          <nav className="eco-sidebar-nav" style={styles.navScroll}>
            {NAV_ITEMS.map((item) => {
              const isActive = currentActiveItem === item.label;
              const Icon = item.Icon;
              return (
                <div
                  key={item.key}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleNavigate(item)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleNavigate(item);
                    }
                  }}
                  onMouseEnter={(event) => {
                    if (!isActive) {
                      event.currentTarget.style.background = 'rgba(138, 201, 155, 0.09)';
                      event.currentTarget.style.color = '#eef8f0';
                    }
                  }}
                  onMouseLeave={(event) => {
                    if (!isActive) {
                      event.currentTarget.style.background = 'transparent';
                      event.currentTarget.style.color = '#e8f5e9';
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '12px 16px',
                    borderRadius: 12,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: isActive ? 'linear-gradient(135deg, #285f3a, #327247)' : 'transparent',
                    color: isActive ? '#ffffff' : '#e8f5e9',
                    fontSize: 14,
                    fontWeight: isActive ? 700 : 500,
                    borderLeft: isActive ? '3px solid #7ae58b' : '3px solid transparent',
                    boxShadow: isActive ? '0 10px 24px rgba(16, 53, 32, 0.28), inset 0 1px 0 rgba(255,255,255,0.06)' : 'none',
                    minHeight: 48,
                  }}
                >
                  <Icon
                    size={20}
                    color={isActive ? '#8ef39d' : '#8ebf92'}
                    style={{ filter: isActive ? 'drop-shadow(0 0 6px rgba(122,229,139,0.28))' : 'none', flexShrink: 0 }}
                  />
                  <span style={{ color: isActive ? '#ffffff' : '#e8f5e9' }}>{item.label}</span>
                </div>
              );
            })}
            <div style={styles.spacer} />
          </nav>

          <div
            style={styles.footprintCard}
            onMouseEnter={(event) => {
              event.currentTarget.style.borderColor = 'rgba(167,214,167,0.2)';
              event.currentTarget.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.05))';
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.borderColor = 'rgba(167,214,167,0.11)';
              event.currentTarget.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.045))';
            }}
          >
            <MdEco style={styles.ecoIcon} />
            <div style={styles.footprintLabel}>Daily Footprint</div>
            <div style={styles.footprintValue}>{formattedFootprint}</div>
          </div>
        </aside>
      </div>
    </>
  );
}

export default Sidebar;
