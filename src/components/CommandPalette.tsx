import React, { useState, useEffect } from 'react';
import { Search, Building, Calculator, FileText, ArrowRight, X, GitPullRequest, Sliders } from 'lucide-react';
import { Property } from '../types/realEstate';
import { NavTabId } from './Navigation';
import { CurrencyCode, formatCurrency } from '../utils/financialModels';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  onSelectProperty: (propertyId: string) => void;
  onNavigateTab: (tab: NavTabId) => void;
  currency: CurrencyCode;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  properties,
  onSelectProperty,
  onNavigateTab,
  currency
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // handled by parent
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredProperties = properties.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.city.toLowerCase().includes(query.toLowerCase()) ||
    p.assetClass.toLowerCase().includes(query.toLowerCase()) ||
    p.tenants.some(t => t.name.toLowerCase().includes(query.toLowerCase()))
  );

  const quickActions = [
    { label: 'Run 10-Year Pro-Forma Underwriting Model', tab: 'underwriter' as NavTabId, icon: Calculator },
    { label: 'Inspect Capital Markets & Loan Maturity Wall', tab: 'capital-markets' as NavTabId, icon: Sliders },
    { label: 'View Sourcing Pipeline & AVM Comps', tab: 'pipeline' as NavTabId, icon: GitPullRequest },
    { label: 'Generate Institutional LP Quarterly Tear Sheet', tab: 'reporting' as NavTabId, icon: FileText }
  ].filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '640px', padding: 0, overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', gap: '0.75rem' }}>
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            autoFocus
            placeholder="Type property name, tenant, city, or action..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              outline: 'none',
              fontFamily: 'var(--font-sans)'
            }}
          />
          <button onClick={onClose} className="btn-ghost btn-sm" style={{ padding: '0.2rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Results Body */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '0.75rem' }}>
          {/* Properties Section */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0.25rem 0.5rem', letterSpacing: '0.05em' }}>
              Portfolio Properties ({filteredProperties.length})
            </div>
            {filteredProperties.map(prop => (
              <div
                key={prop.id}
                onClick={() => {
                  onSelectProperty(prop.id);
                  onNavigateTab('asset-detail');
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={prop.imageUrl} alt={prop.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-primary)' }}>{prop.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      {prop.city}, {prop.state} • {prop.assetClass} • {prop.floorsCount} Fl
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.84rem' }}>
                    {formatCurrency(prop.currentValuation, currency, true)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)' }}>
                    {prop.capRate}% Cap Rate
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0.25rem 0.5rem', letterSpacing: '0.05em' }}>
              Platform Workflows
            </div>
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    onNavigateTab(action.tab);
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Icon size={16} style={{ color: 'var(--accent-cyan)' }} />
                    <span style={{ fontSize: '0.84rem', fontWeight: 500 }}>{action.label}</span>
                  </div>
                  <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer shortcuts */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 1.25rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--border-subtle)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <span>Navigation: <kbd className="kbd-shortcut">↑</kbd> <kbd className="kbd-shortcut">↓</kbd> to move</span>
          <span>Select: <kbd className="kbd-shortcut">↵ Enter</kbd></span>
          <span>Close: <kbd className="kbd-shortcut">esc</kbd></span>
        </div>
      </div>
    </div>
  );
};
