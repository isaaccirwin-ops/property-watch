import React from 'react';
import { 
  BarChart3, 
  Building, 
  Calculator, 
  GitPullRequest, 
  Landmark, 
  FileText,
  ShieldCheck
} from 'lucide-react';

export type NavTabId = 'overview' | 'asset-detail' | 'underwriter' | 'pipeline' | 'capital-markets' | 'reporting' | 'admin';

interface NavigationProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  activePropertyName?: string;
  isAdmin?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  activePropertyName,
  isAdmin = false
}) => {
  const baseTabs = [
    { id: 'overview' as NavTabId, label: 'Portfolio Command', icon: BarChart3, badge: 'Live' },
    { id: 'asset-detail' as NavTabId, label: activePropertyName ? `Asset: ${activePropertyName}` : 'Asset Twin & Stacking', icon: Building },
    { id: 'underwriter' as NavTabId, label: 'Deal Underwriter & Cash Flows', icon: Calculator, badge: '10-Yr' },
    { id: 'pipeline' as NavTabId, label: 'Sourcing Pipeline & Comps', icon: GitPullRequest, badge: '5 Deals' },
    { id: 'capital-markets' as NavTabId, label: 'Debt & Capital Markets', icon: Landmark, badge: '4 Loans' },
    { id: 'reporting' as NavTabId, label: 'LP Reporting & Tear Sheet', icon: FileText }
  ];

  const tabs = isAdmin 
    ? [
        ...baseTabs,
        { id: 'admin' as NavTabId, label: 'Admin: Billing & Customers', icon: ShieldCheck, badge: 'Super Admin' }
      ]
    : baseTabs;

  return (
    <nav className="nav-tab-bar" aria-label="Main Navigation">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const isAdminTab = tab.id === 'admin';

        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`nav-tab-item ${isActive ? 'active' : ''}`}
            role="tab"
            aria-selected={isActive}
            style={isAdminTab && isActive ? { borderBottomColor: 'var(--accent-red)' } : {}}
          >
            <Icon size={16} color={isAdminTab ? 'var(--accent-red)' : undefined} />
            <span style={isAdminTab ? { fontWeight: 700 } : {}}>{tab.label}</span>
            {tab.badge && (
              <span 
                style={{ 
                  fontSize: '0.65rem', 
                  padding: '0.1rem 0.4rem', 
                  borderRadius: '10px', 
                  background: isAdminTab 
                    ? 'rgba(220, 38, 38, 0.15)' 
                    : isActive 
                    ? 'rgba(220, 38, 38, 0.15)' 
                    : 'rgba(0, 0, 0, 0.05)',
                  color: isAdminTab 
                    ? 'var(--accent-red)' 
                    : isActive 
                    ? 'var(--accent-red)' 
                    : 'var(--text-muted)',
                  fontWeight: 700
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
