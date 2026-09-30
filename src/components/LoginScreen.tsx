import React, { useState } from 'react';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    // Simulate auth request
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Accept any credentials for now (will integrate with Neon Auth later)
    setIsLoading(false);
    onLogin();
  };

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-card">
          {/* Brand */}
          <div className="login-brand">
            <div className="login-brand-icon">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <path d="M6 24V14L16 6L26 14V24H19V17H13V24H6Z" fill="currentColor"/>
                <circle cx="16" cy="12" r="2" fill="rgba(255,255,255,0.6)"/>
              </svg>
            </div>
            <span className="login-brand-name">PropertyWatch</span>
            <span className="login-brand-tagline">Institutional Real Estate Operating System</span>
          </div>

          {/* Error message */}
          {error && (
            <div className="login-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              {error}
            </div>
          )}

          {/* Login form */}
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label className="login-label" htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                className="login-input"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="login-field">
              <label className="login-label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                className="login-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <div className="login-options">
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember me
              </label>
              <a href="#" className="login-forgot" onClick={(e) => e.preventDefault()}>
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="login-divider">or continue with</div>

            <button
              type="button"
              className="login-sso-btn"
              onClick={() => onLogin()}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Sign in with SSO
            </button>
          </form>

          <div className="login-footer">
            Don't have an account? <a href="#" onClick={(e) => e.preventDefault()}>Request access</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
