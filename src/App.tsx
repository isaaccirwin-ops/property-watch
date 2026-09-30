import React, { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { Navigation, NavTabId } from './components/Navigation';
import { CommandPalette } from './components/CommandPalette';
import { OverviewView } from './components/views/OverviewView';
import { AssetDetailView } from './components/views/AssetDetailView';
import { UnderwriterView } from './components/views/UnderwriterView';
import { PipelineView } from './components/views/PipelineView';
import { CapitalMarketsView } from './components/views/CapitalMarketsView';
import { ReportingView } from './components/views/ReportingView';
import { AdminConsole } from './components/views/AdminConsole';
import { NewDealModal } from './components/modals/NewDealModal';
import { TenantDetailModal } from './components/modals/TenantDetailModal';
import { 
  INITIAL_PROPERTIES, 
  INITIAL_LOANS, 
  INITIAL_PIPELINE, 
  INITIAL_COMPS, 
  MACRO_INDICATORS 
} from './data/portfolioData';
import { Property, Tenant, DealPipelineItem, MacroIndicator } from './types/realEstate';
import { AppUser } from './types/user';
import { CurrencyCode } from './utils/financialModels';
import { NeonService } from './services/neonService';
import { ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';

const DEFAULT_ADMIN: AppUser = {
  id: '2ea9da70-e1da-45b5-b63d-907791801107',
  name: 'IsaacI (admin)',
  email: 'isaaccirwin@gmail.com',
  role: 'admin',
  companyName: 'PropertyWatch Global Inc.',
  phone: '+1 (555) 019-2834',
  planTier: 'enterprise',
  billingStatus: 'active',
  monthlySpend: 0,
  billingCycle: 'annual',
  createdAt: new Date().toISOString()
};

export const App: React.FC = () => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('propertywatch-auth') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem('propertywatch-user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return localStorage.getItem('propertywatch-auth') === 'true' ? DEFAULT_ADMIN : null;
  });

  // Admin view mode: 'console' (dedicated admin UI) or 'preview' (previewing customer UI)
  const [adminViewMode, setAdminViewMode] = useState<'console' | 'preview'>('console');
  const [previewCustomerName, setPreviewCustomerName] = useState<string>('');

  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [loans, setLoans] = useState(INITIAL_LOANS);
  const [pipeline, setPipeline] = useState<DealPipelineItem[]>(INITIAL_PIPELINE);
  const [comps, setComps] = useState(INITIAL_COMPS);
  const [macroIndicators, setMacroIndicators] = useState<MacroIndicator[]>(MACRO_INDICATORS);

  const [activeTab, setActiveTab] = useState<NavTabId>('overview');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [currentFund, setCurrentFund] = useState<string>('Global Core Flagship Fund IV');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('propertywatch-theme') === 'dark';
  });
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Modals state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNewDealModalOpen, setIsNewDealModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  // Load properties from Neon when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadPropertiesFromNeon = async () => {
      try {
        const userId = currentUser?.role === 'admin' ? undefined : currentUser?.id;
        const neonProperties = await NeonService.getProperties(userId);
        if (neonProperties && neonProperties.length > 0) {
          setProperties(neonProperties);
          setSelectedPropertyId(neonProperties[0].id);
        }
      } catch (err) {
        console.warn('Could not load properties from Neon:', err);
      }
    };

    loadPropertiesFromNeon();
  }, [isAuthenticated, currentUser]);

  // Set theme on load
  useEffect(() => {
    const savedTheme = localStorage.getItem('propertywatch-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Login handler
  const handleLogin = (user: AppUser) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('propertywatch-auth', 'true');
    localStorage.setItem('propertywatch-user', JSON.stringify(user));
    if (user.role === 'admin') {
      setAdminViewMode('console');
    }
  };

  // Logout handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('propertywatch-auth');
    localStorage.removeItem('propertywatch-user');
  };

  // Toggle Theme handler
  const handleToggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    const themeStr = nextTheme ? 'dark' : 'light';
    localStorage.setItem('propertywatch-theme', themeStr);
    document.documentElement.setAttribute('data-theme', themeStr);
  };

  // Switch to customer portal preview from Admin
  const handleSwitchToCustomerPortal = async (userId?: string) => {
    if (userId) {
      const userProps = await NeonService.getProperties(userId);
      setProperties(userProps);
      if (userProps.length > 0) {
        setSelectedPropertyId(userProps[0].id);
      }
      setPreviewCustomerName('Selected Customer');
    } else {
      const allProps = await NeonService.getProperties();
      setProperties(allProps);
      if (allProps.length > 0) {
        setSelectedPropertyId(allProps[0].id);
      }
      setPreviewCustomerName('Consolidated Master Portfolio');
    }
    setActiveTab('overview');
    setAdminViewMode('preview');
  };

  // Keyboard shortcut listener for Command Palette (Cmd+K)
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated]);

  // Live Telemetry Simulation Engine
  useEffect(() => {
    if (!isSimulating || !isAuthenticated) return;

    const interval = setInterval(() => {
      setProperties(prev => prev.map(p => {
        const deltaPower = Math.floor(Math.random() * 21) - 10;
        const newPower = Math.max(100, (p.telemetry?.powerDrawKw || 200) + deltaPower);
        return {
          ...p,
          telemetry: {
            ...p.telemetry,
            powerDrawKw: newPower
          }
        };
      }));

      setMacroIndicators(prev => prev.map(m => {
        if (m.ticker === 'US10Y') {
          const deltaBps = (Math.random() * 0.02 - 0.01).toFixed(2);
          const currentVal = parseFloat(m.value);
          const nextVal = (currentVal + parseFloat(deltaBps)).toFixed(2);
          return {
            ...m,
            value: `${nextVal}%`
          };
        }
        return m;
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, [isSimulating, isAuthenticated]);

  // Handle pipeline deal progression
  const handleAdvanceDeal = (dealId: string) => {
    const stageOrder: DealPipelineItem['stage'][] = [
      'Sourced', 'Underwriting', 'LOI Submitted', 'Due Diligence', 'IC Approval', 'Closed'
    ];

    setPipeline(prev => prev.map(deal => {
      if (deal.id === dealId) {
        const currentIndex = stageOrder.indexOf(deal.stage);
        if (currentIndex < stageOrder.length - 1) {
          return { ...deal, stage: stageOrder[currentIndex + 1] };
        }
      }
      return deal;
    }));
  };

  // Handle add new deal from modal
  const handleAddDeal = (newDeal: DealPipelineItem) => {
    setPipeline(prev => [newDeal, ...prev]);
    setActiveTab('pipeline');
  };

  // Drill in property selection
  const handleSelectProperty = (id: string) => {
    setSelectedPropertyId(id);
    setActiveTab('asset-detail');
  };

  const activeProperty = properties.find(p => p.id === selectedPropertyId) || properties[0];
  const totalAum = properties.reduce((acc, p) => acc + (p.currentValuation || 0), 0);
  const isAdmin = currentUser?.role === 'admin';

  // 1. Show login screen if not authenticated
  if (!isAuthenticated || !currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // 2. If user is Admin and in Console mode, render the dedicated Executive Admin Console!
  if (isAdmin && adminViewMode === 'console') {
    return (
      <AdminConsole
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchToCustomerPortal={handleSwitchToCustomerPortal}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  // 3. Otherwise render Customer Portal (or Admin Previewing Customer Portal)
  return (
    <div className="app-container">
      {/* Floating Admin Banner when admin is previewing customer portal */}
      {isAdmin && (
        <div style={{
          background: 'var(--accent-red)',
          color: '#FFFFFF',
          padding: '0.45rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.78rem',
          fontWeight: 700,
          boxShadow: '0 2px 8px rgba(220, 38, 38, 0.35)',
          zIndex: 9999
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={16} />
            <span>ADMIN PREVIEW MODE — You are viewing the customer experience ({previewCustomerName || 'All Assets'})</span>
          </div>

          <button 
            onClick={() => setAdminViewMode('console')}
            style={{
              background: '#FFFFFF',
              color: 'var(--accent-red)',
              border: 'none',
              borderRadius: '6px',
              padding: '0.25rem 0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
            }}
          >
            <ArrowLeft size={13} />
            <span>Return to Admin Console</span>
          </button>
        </div>
      )}

      {/* Institutional Capital Header */}
      <Header
        currentFund={currentFund}
        onSelectFund={setCurrentFund}
        currency={currency}
        onChangeCurrency={setCurrency}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        isSimulating={isSimulating}
        onToggleSimulation={() => setIsSimulating(!isSimulating)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenNewDealModal={() => setIsNewDealModalOpen(true)}
        macroIndicators={macroIndicators}
        totalAum={totalAum}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Customer Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activePropertyName={activeProperty?.name}
      />

      {/* Main Dynamic Viewport */}
      <main className="main-view-container">
        {activeTab === 'overview' && (
          <OverviewView
            properties={properties}
            onSelectProperty={handleSelectProperty}
            currency={currency}
          />
        )}

        {activeTab === 'asset-detail' && (
          <AssetDetailView
            properties={properties}
            selectedPropertyId={selectedPropertyId}
            onSelectPropertyId={setSelectedPropertyId}
            currency={currency}
            onOpenTenantModal={(t) => setSelectedTenant(t)}
          />
        )}

        {activeTab === 'underwriter' && (
          <UnderwriterView currency={currency} />
        )}

        {activeTab === 'pipeline' && (
          <PipelineView
            pipeline={pipeline}
            comps={comps}
            currency={currency}
            onAdvanceDeal={handleAdvanceDeal}
            onOpenNewDealModal={() => setIsNewDealModalOpen(true)}
            onSendToUnderwriter={() => setActiveTab('underwriter')}
          />
        )}

        {activeTab === 'capital-markets' && (
          <CapitalMarketsView
            loans={loans}
            properties={properties}
            currency={currency}
          />
        )}

        {activeTab === 'reporting' && (
          <ReportingView
            properties={properties}
            loans={loans}
            currency={currency}
          />
        )}
      </main>

      {/* Global Modals */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        properties={properties}
        onSelectProperty={handleSelectProperty}
        onNavigateTab={setActiveTab}
        currency={currency}
      />

      <NewDealModal
        isOpen={isNewDealModalOpen}
        onClose={() => setIsNewDealModalOpen(false)}
        onAddDeal={handleAddDeal}
        currency={currency}
      />

      <TenantDetailModal
        tenant={selectedTenant}
        onClose={() => setSelectedTenant(null)}
        currency={currency}
      />
    </div>
  );
};

export default App;
