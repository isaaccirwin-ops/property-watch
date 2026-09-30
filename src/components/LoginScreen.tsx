import React, { useState } from 'react';
import { AppUser } from '../types/user';
import { NeonService } from '../services/neonService';
import { ShieldCheck, User, Database, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: AppUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);

    try {
      const authResult = await NeonService.authenticate(email, password);
      setIsLoading(false);

      if (authResult.success && authResult.user) {
        onLogin(authResult.user);
      } else {
        setError(authResult.message || 'Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError('Connection to database timed out. Please try again.');
    }
  };

  const handleQuickAdminLogin = async () => {
    setIsLoading(true);
    setError('');
    setEmail('isaaccirwin@gmail.com');
    setPassword('12345');
    const authResult = await NeonService.authenticate('isaaccirwin@gmail.com', '12345');
    setIsLoading(false);
    if (authResult.success && authResult.user) {
      onLogin(authResult.user);
    }
  };

  const handleQuickCustomerLogin = async () => {
    setIsLoading(true);
    setError('');
    setEmail('sarah.jenkins@blackrockre.com');
    setPassword('client123');
    const authResult = await NeonService.authenticate('sarah.jenkins@blackrockre.com', 'client123');
    setIsLoading(false);
    if (authResult.success && authResult.user) {
      onLogin(authResult.user);
    }
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

          {/* Database Connection Status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            marginBottom: '1rem',
            fontSize: '0.72rem',
            color: '#16A34A',
            fontWeight: 600
          }}>
            <Database size={12} />
            <span>Connected to Neon Postgres</span>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16A34A' }}></span>
          </div>

          {/* Quick Demo Login Switcher */}
          <div style={{
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem',
            marginBottom: '1.25rem',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              ⚡ 1-Click Instant Sign-In
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={handleQuickAdminLogin}
                className="btn btn-sm btn-primary"
                style={{ fontSize: '0.74rem', padding: '0.45rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                disabled={isLoading}
              >
                <ShieldCheck size={14} />
                <span>Admin (IsaacI)</span>
              </button>
              <button
                type="button"
                onClick={handleQuickCustomerLogin}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '0.74rem', padding: '0.45rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                disabled={isLoading}
              >
                <User size={14} />
                <span>Client (Blackstone)</span>
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="login-error" style={{ marginBottom: '1rem' }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Login form */}
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label className="login-label" htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                className="login-input"
                type="email"
                placeholder="isaaccirwin@gmail.com"
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
              {isLoading ? (
                'Verifying with Neon...'
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span>Sign In</span>
                  <ArrowRight size={14} />
                </span>
              )}
            </button>
          </form>

          <div className="login-footer" style={{ marginTop: '1.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Admin Credentials: <code>isaaccirwin@gmail.com</code> / <code>12345</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
