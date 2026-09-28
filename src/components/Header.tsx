import React from 'react';
import { 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  Radio, 
  Sun, 
  Moon, 
  Search, 
  Plus, 
  DollarSign,
  ChevronDown
} from 'lucide-react';
import { CurrencyCode, formatCurrency } from '../utils/financialModels';
import { MacroIndicator } from '../types/realEstate';

interface HeaderProps {
  currentFund: string;
  onSelectFund: (fund: string) => void;
  currency: CurrencyCode;
  onChangeCurrency: (c: CurrencyCode) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onOpenCommandPalette: () => void;
  onOpenNewDealModal: () => void;
  macroIndicators: MacroIndicator[];
  totalAum: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentFund,
  onSelectFund,
  currency,
  onChangeCurrency,
  isDark,
  onToggleTheme,
  isSimulating,
  onToggleSimulation,
  onOpenCommandPalette,
  onOpenNewDealModal,
  macroIndicators,
  totalAum
}) => {
  return (
    <header className="app-header">
      {/* Macro Ticker Stream */}
      <div className="macro-ticker-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
          <span className="telemetry-pulse"></span>
          <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>LIVE CAPITAL DESK:</span>
        </div>
        {macroIndicators.map((item, idx) => (
          <div key={idx} className="macro-ticker-item">
            <span style={{ color: 'var(--text-secondary)' }}>{item.ticker}</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</span>
            <span className={item.isPositive ? 'macro-badge-pos' : 'macro-badge-neg'} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              {item.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {item.change}
            </span>
            <span style={{ color: 'var(--border-subtle)', marginLeft: '0.5rem' }}>|</span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={onToggleSimulation}
            className={`btn btn-sm ${isSimulating ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.7rem', padding: '0.2rem 0.55rem' }}
            title="Toggle live telemetry and simulated rent streams"
          >
            <Radio size={12} className={isSimulating ? 'animate-pulse' : ''} />
            {isSimulating ? 'Sim Engine: ACTIVE' : 'Sim Engine: PAUSED'}
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="header-main">
        {/* Brand & Fund Selection */}
        <div className="brand-section">
          <div className="brand-logo">
            <div className="brand-icon-box">
              <Building2 size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ background: 'linear-gradient(135deg, #FFFFFF, #94A3B8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  PropertyWatch
                </span>
                <span className="brand-tag">ENTERPRISE</span>
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.02em' }}>
                Institutional Real Estate Intelligence
              </div>
            </div>
          </div>

          <div style={{ height: '24px', width: '1px', background: 'var(--border-subtle)', margin: '0 0.5rem' }}></div>

          {/* Fund Selector */}
          <div className="fund-selector">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Mandate</span>
              <select 
                value={currentFund}
                onChange={(e) => onSelectFund(e.target.value)}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: 'var(--text-primary)', 
                  fontWeight: 600, 
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="Global Core Flagship Fund IV" style={{ background: '#0E131F', color: '#FFF' }}>
                  Global Core Flagship IV ({formatCurrency(totalAum, currency, true)})
                </option>
                <option value="US Opportunistic Logistics Fund II" style={{ background: '#0E131F', color: '#FFF' }}>
                  US Logistics Fund II ($1.25B)
                </option>
                <option value="European Life Science & Tech Fund I" style={{ background: '#0E131F', color: '#FFF' }}>
                  European Tech & Lab Fund (€850M)
                </option>
                <option value="All Monitored Assets" style={{ background: '#0E131F', color: '#FFF' }}>
                  Consolidated Master Portfolio
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Global Command / Search Palette Trigger */}
        <div className="header-center">
          <button onClick={onOpenCommandPalette} className="header-search-btn">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search size={14} />
              <span>Search assets, underwriting models, leases, comps...</span>
            </span>
            <span className="kbd-shortcut">⌘K</span>
          </button>
        </div>

        {/* Quick Actions & Preferences */}
        <div className="header-actions">
          {/* Currency Switcher */}
          <div style={{ display: 'flex', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '2px' }}>
            {(['USD', 'EUR', 'GBP'] as CurrencyCode[]).map((cur) => (
              <button
                key={cur}
                onClick={() => onChangeCurrency(cur)}
                style={{
                  background: currency === cur ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                  color: currency === cur ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {cur}
              </button>
            ))}
          </div>

          {/* Theme Toggle */}
          <button 
            onClick={onToggleTheme} 
            className="btn btn-secondary btn-icon-only"
            title={isDark ? "Switch to Institutional Light Theme" : "Switch to Institutional Dark Theme"}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Primary Action: Underwrite Deal */}
          <button onClick={onOpenNewDealModal} className="btn btn-primary">
            <Plus size={15} />
            <span>Underwrite Deal</span>
          </button>
        </div>
      </div>
    </header>
  );
};
