import React from 'react';
import { 
  BarChart3, 
  Building, 
  Calculator, 
  GitPullRequest, 
  Landmark, 
  FileText 
} from 'lucide-react';

export type NavTabId = 'overview' | 'asset-detail' | 'underwriter' | 'pipeline' | 'capital-markets' | 'reporting';

interface NavigationProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  activePropertyName?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  activePropertyName
}) => {
  const tabs = [
    { id: 'overview' as NavTabId, label: 'Portfolio Command', icon: BarChart3, badge: 'Live' },
    { id: 'asset-detail' as NavTabId, label: activePropertyName ? `Asset: ${activePropertyName}` : 'Asset Twin & Stacking', icon: Building },
    { id: 'underwriter' as NavTabId, label: 'Deal Underwriter & Cash Flows', icon: Calculator, badge: '10-Yr' },
    { id: 'pipeline' as NavTabId, label: 'Sourcing Pipeline & Comps', icon: GitPullRequest, badge: '5 Deals' },
    { id: 'capital-markets' as NavTabId, label: 'Debt & Capital Markets', icon: Landmark, badge: '4 Loans' },
    { id: 'reporting' as NavTabId, label: 'LP Reporting & Tear Sheet', icon: FileText }
  ];

  return (
    <nav className="nav-tab-bar" aria-label="Main Navigation">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`nav-tab-item ${isActive ? 'active' : ''}`}
            role="tab"
            aria-selected={isActive}
          >
            <Icon size={16} />
            <span>{tab.label}</span>
            {tab.badge && (
              <span 
                style={{ 
                  fontSize: '0.65rem', 
                  padding: '0.1rem 0.4rem', 
                  borderRadius: '10px', 
                  background: isActive ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                  color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  fontWeight: 600
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
