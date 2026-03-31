function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="social-icon" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-.9 2.4-2 3.1l3.2 2.5c1.9-1.8 3-4.4 3-7.5 0-.7-.1-1.4-.2-2H12z" />
      <path fill="#34A853" d="M12 22c2.7 0 5-1 6.7-2.7l-3.2-2.5c-.9.6-2 .9-3.5.9-2.7 0-4.9-1.8-5.7-4.3l-3.4 2.6C4.6 19.5 8 22 12 22z" />
      <path fill="#4A90E2" d="M6.3 13.4c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9L2.9 7C2.3 8.2 2 9.6 2 11.1s.3 2.9.9 4.1l3.4-1.8z" />
      <path fill="#FBBC05" d="M12 5.4c1.5 0 2.9.5 3.9 1.5l2.9-2.9C17 2.4 14.7 1.4 12 1.4 8 1.4 4.6 3.9 2.9 7l3.4 2.6c.8-2.5 3-4.2 5.7-4.2z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="social-icon" aria-hidden="true">
      <path
        fill="#111827"
        d="M16.6 12.8c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3.1-1.6-1.3-.1-2.5.8-3.1.8-.7 0-1.7-.8-2.8-.8-1.5 0-2.8.8-3.6 2-.8 1.4-1 3.7-.2 5.7.4 1 1 2.1 1.8 2.1.7 0 1-.5 1.9-.5s1.2.5 1.9.5c.8 0 1.3-1 1.7-2 .5-1.1.7-2.1.7-2.2-.1 0-2-.8-2-2.8zm-2.2-6.3c.6-.7.9-1.7.8-2.6-.8 0-1.8.5-2.4 1.2-.5.6-.9 1.6-.8 2.5.9.1 1.8-.5 2.4-1.1z"
      />
    </svg>
  );
}

function SocialAuthButton({ provider, onClick }) {
  const isGoogle = provider === 'google';
  const label = isGoogle ? 'Continue with Google' : 'Continue with Apple';

  return (
    <button type="button" className="social-btn" onClick={onClick}>
      {isGoogle ? <GoogleIcon /> : <AppleIcon />}
      <span>{label}</span>
    </button>
  );
}

export default SocialAuthButton;
