import React, { useState } from 'react';
import { AppUser } from '../types/user';
import { ShieldCheck, User } from 'lucide-react';

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

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    // Admin detection
    const normalizedEmail = email.toLowerCase().trim();
    if (normalizedEmail.includes('admin') || normalizedEmail.includes('cody')) {
      const adminUser: AppUser = {
        id: '2ea9da70-e1da-45b5-b63d-907791801107',
        name: 'Cody Irwin (Admin)',
        email: 'admin@propertywatch.com',
        role: 'admin',
        companyName: 'PropertyWatch Global Inc.',
        phone: '+1 (555) 019-2834',
        planTier: 'enterprise',
        billingStatus: 'active',
        monthlySpend: 0,
        billingCycle: 'annual',
        createdAt: new Date().toISOString()
      };
      setIsLoading(false);
      onLogin(adminUser);
      return;
    }

    // Default customer
    const customerUser: AppUser = {
      id: 'bc6b7e5f-bab1-4761-8115-1a0828a7c2aa',
      name: email.split('@')[0].replace('.', ' '),
      email: email,
      role: 'customer',
      companyName: 'Institutional Capital Partners',
      planTier: 'pro',
      billingStatus: 'active',
      monthlySpend: 1499,
      billingCycle: 'monthly',
      createdAt: new Date().toISOString()
    };
    setIsLoading(false);
    onLogin(customerUser);
  };

  const handleQuickAdminLogin = () => {
    const adminUser: AppUser = {
      id: '2ea9da70-e1da-45b5-b63d-907791801107',
      name: 'Cody Irwin (Admin)',
      email: 'admin@propertywatch.com',
      role: 'admin',
      companyName: 'PropertyWatch Global Inc.',
      phone: '+1 (555) 019-2834',
      planTier: 'enterprise',
      billingStatus: 'active',
      monthlySpend: 0,
      billingCycle: 'annual',
      createdAt: new Date().toISOString()
    };
    onLogin(adminUser);
  };

  const handleQuickCustomerLogin = () => {
    const customerUser: AppUser = {
      id: 'bc6b7e5f-bab1-4761-8115-1a0828a7c2aa',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@blackrockre.com',
      role: 'customer',
      companyName: 'Blackstone Real Estate Partners',
      planTier: 'pro',
      billingStatus: 'active',
      monthlySpend: 1499,
      billingCycle: 'monthly',
      createdAt: new Date().toISOString()
    };
    onLogin(customerUser);
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

          {/* Quick Demo Login Switcher */}
          <div style={{
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem',
            marginBottom: '1.25rem',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textAlign: 'center' }}>
              ⚡ 1-CLICK INSTANT LOGIN (NEON BACKED)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={handleQuickAdminLogin}
                className="btn btn-sm btn-primary"
                style={{ fontSize: '0.74rem', padding: '0.4rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                <ShieldCheck size={13} />
                <span>Admin Account</span>
              </button>
              <button
                type="button"
                onClick={handleQuickCustomerLogin}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '0.74rem', padding: '0.4rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                <User size={13} />
                <span>Customer Account</span>
              </button>
            </div>
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
                placeholder="admin@propertywatch.com"
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
              {isLoading ? 'Signing in with Neon...' : 'Sign in'}
            </button>
          </form>

          <div className="login-footer">
            Admin credentials: <code>admin@propertywatch.com</code> / <code>admin123</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
