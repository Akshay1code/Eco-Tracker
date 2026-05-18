import AuthLeftPanel from './AuthLeftPanel.jsx';
import '../../styles/auth.css';

function AuthLayout({ mode = 'login', headline, subtext, children }) {
  return (
    <div className="auth-layout">
      <aside className="auth-left">
        <AuthLeftPanel mode={mode} headline={headline} subtext={subtext} />
      </aside>
      <section className="auth-right">
        <div className="auth-right-inner">
          {children}
        </div>
      </section>
    </div>
  );
}

export default AuthLayout;
