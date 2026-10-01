import React, { useState } from 'react';
import { AppUser } from '../types/user';
import { NeonService } from '../services/neonService';
import { Database, AlertCircle, ArrowRight, Lock, Mail, Building2 } from 'lucide-react';

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
      setError('Please enter your corporate email address.');
      return;
    }

    setIsLoading(true);

    try {
      const authResult = await NeonService.authenticate(email, password);
      setIsLoading(false);

      if (authResult.success && authResult.user) {
        onLogin(authResult.user);
      } else {
        setError(authResult.message || 'Authentication failed. Please verify your credentials.');
      }
    } catch {
      setIsLoading(false);
      setError('Connection to Neon database timed out. Please try again.');
    }
  };

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-card">
          {/* Brand Header */}
          <div className="login-brand">
            <div className="login-brand-icon">
              <Building2 size={24} />
            </div>
            <span className="login-brand-name">PropertyWatch</span>
            <span className="login-brand-tagline">Institutional Real Estate Operating System</span>
          </div>

          {/* Secure Neon Status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            marginBottom: '1.25rem',
            fontSize: '0.72rem',
            color: '#16A34A',
            fontWeight: 600
          }}>
            <Database size={12} />
            <span>Neon Lakebase Postgres Active</span>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16A34A' }}></span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="login-error" style={{ marginBottom: '1.25rem' }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label className="login-label" htmlFor="login-email">Corporate Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="login-email"
                  className="login-input"
                  style={{ paddingLeft: '36px' }}
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            <div className="login-field">
              <label className="login-label" htmlFor="login-password">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="login-password"
                  className="login-input"
                  style={{ paddingLeft: '36px' }}
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="login-options">
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember this workstation
              </label>
              <a href="#" className="login-forgot" onClick={(e) => e.preventDefault()}>
                Forgot credentials?
              </a>
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="login-spinner" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Institutional SSO & Security Note */}
          <div className="login-footer">
            <p className="login-footer-text">
              Protected by Enterprise Multi-Tenant RBAC & Neon SSL.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
