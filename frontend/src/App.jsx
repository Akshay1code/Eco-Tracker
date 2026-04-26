import { useMemo, useState } from 'react';
import Sidebar from './components/layout/Sidebar.jsx';
import LeafSVG from './components/shared/LeafSVG.jsx';
import DashboardView from './views/DashboardView.jsx';
import ActivityView from './views/ActivityView.jsx';
import CommunityView from './views/CommunityView.jsx';
import JournalView from './views/JournalView.jsx';
import GoalsView from './views/GoalsView.jsx';
import Profile from './views/Profile.jsx';
import CalModal from './components/modals/CalModal.jsx';
import ProfileModal from './components/modals/ProfileModal.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';

function FloatingLeaves() {
  const leaves = [
    { left: '4%', top: '8%', cls: 'leaf-float', opacity: 0.22 },
    { left: '90%', top: '12%', cls: 'leaf-float-2', opacity: 0.18 },
    { left: '8%', top: '78%', cls: 'leaf-float-3', opacity: 0.25 },
    { left: '86%', top: '72%', cls: 'leaf-float', opacity: 0.15 },
    { left: '48%', top: '4%', cls: 'leaf-float-2', opacity: 0.2 },
    { left: '52%', top: '88%', cls: 'leaf-float-3', opacity: 0.17 },
  ];

  return (
    <div className="floating-leaves" aria-hidden="true">
      {leaves.map((leaf, i) => (
        <div
          key={i}
          className={leaf.cls}
          style={{ position: 'fixed', left: leaf.left, top: leaf.top, opacity: leaf.opacity }}
        >
          <LeafSVG size={32} />
        </div>
      ))}
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [calModal, setCalModal] = useState(null);
  const [profileModal, setProfileModal] = useState(null);
  const [screen, setScreen] = useState(() => {
    if (typeof window === 'undefined') {
      return 'login';
    }
    return localStorage.getItem('isLoggedIn') === 'true' ? 'app' : 'login';
  });
  
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPassword');
    localStorage.removeItem('userName');
    localStorage.removeItem('userScore');
    localStorage.removeItem('userProfile');
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('eco_')) {
        localStorage.removeItem(key);
      }
    });
    setScreen('login');
  };

  const viewProps = {
    dashboard: { onCalClick: setCalModal, onUserClick: setProfileModal, onLogout: handleLogout },
    activity: { onLogout: handleLogout },
    community: { onUserClick: setProfileModal, onLogout: handleLogout },
    journal: { onLogout: handleLogout },
    goals: { onLogout: handleLogout },
    profile: { onLogout: handleLogout },
  };

  const viewMap = useMemo(
    () => ({
      dashboard: DashboardView,
      activity: ActivityView,
      community: CommunityView,
      journal: JournalView,
      goals: GoalsView,
      profile: Profile,
    }),
    []
  );

  const ActiveView = viewMap[activeTab] || DashboardView;
  const storedUserName = typeof window !== 'undefined' ? localStorage.getItem('userName') : '';
  const sidebarUserName = storedUserName && storedUserName.trim() ? storedUserName.trim() : 'Eco Explorer';
  const sidebarInitials = sidebarUserName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'EE';

  if (screen === 'login') {
    return (
      <LoginPage
        onSwitchToSignup={() => setScreen('signup')}
        onNavigate={(path) => {
          if (path === '/dashboard') {
            setScreen('app');
            return;
          }
          if (path === '/signup') {
            setScreen('signup');
            return;
          }
          window.location.href = path;
        }}
      />
    );
  }

  if (screen === 'signup') {
    return (
      <SignupPage
        onSwitchToLogin={() => setScreen('login')}
        onNavigate={(path) => {
          if (path === '/dashboard') {
            setScreen('app');
            return;
          }
          if (path === '/login') {
            setScreen('login');
            return;
          }
          window.location.href = path;
        }}
      />
    );
  }

  return (
    <div className="app-shell-wrap">
      <FloatingLeaves />
      <div className="app-shell">
        <Sidebar
          activeItem={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          userName={sidebarUserName}
          userInitials={sidebarInitials}
          dailyFootprint={0.41}
          onNavigate={(item) => setActiveTab(item.key)}
        />
        <main className="app-main">
          <div key={activeTab} className="view-enter">
            <ActiveView activeTab={activeTab} {...viewProps[activeTab]} />
          </div>
        </main>
      </div>

      {calModal !== null ? <CalModal day={calModal} onClose={() => setCalModal(null)} /> : null}
      {profileModal ? <ProfileModal user={profileModal} onClose={() => setProfileModal(null)} /> : null}
    </div>
  );
}

export default App;
