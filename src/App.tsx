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
import { AdminView } from './components/views/AdminView';
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

const DEFAULT_ADMIN: AppUser = {
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

  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [loans, setLoans] = useState(INITIAL_LOANS);
  const [pipeline, setPipeline] = useState<DealPipelineItem[]>(INITIAL_PIPELINE);
  const [comps, setComps] = useState(INITIAL_COMPS);
  const [macroIndicators, setMacroIndicators] = useState<MacroIndicator[]>(MACRO_INDICATORS);

  const [activeTab, setActiveTab] = useState<NavTabId>(() => {
    return currentUser?.role === 'admin' ? 'admin' : 'overview';
  });

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
        // If customer, fetch their properties. If admin, fetch all properties.
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

  // Set light theme on load
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
      setActiveTab('admin');
    } else {
      setActiveTab('overview');
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

  // Admin selects a specific customer's portfolio to inspect
  const handleSelectCustomerPortfolio = async (userId: string, userName: string) => {
    try {
      const userProperties = await NeonService.getProperties(userId);
      setProperties(userProperties);
      if (userProperties.length > 0) {
        setSelectedPropertyId(userProperties[0].id);
      }
      setCurrentFund(`${userName}'s Monitored Portfolio`);
      setActiveTab('overview');
    } catch (err) {
      console.error('Error switching portfolio:', err);
    }
  };

  const activeProperty = properties.find(p => p.id === selectedPropertyId) || properties[0];
  const totalAum = properties.reduce((acc, p) => acc + (p.currentValuation || 0), 0);
  const isAdmin = currentUser?.role === 'admin';

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
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

      {/* Navigation Sub-system Bar */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activePropertyName={activeProperty?.name}
        isAdmin={isAdmin}
      />

      {/* Main Dynamic Viewport */}
      <main className="main-view-container">
        {activeTab === 'admin' && (
          <AdminView onSelectCustomerPortfolio={handleSelectCustomerPortfolio} />
        )}

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
