import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CreditCard, 
  Building2, 
  ShieldCheck, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink,
  DollarSign,
  TrendingUp,
  Receipt,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  Database,
  Moon,
  Sun,
  LogOut,
  Sparkles,
  Server,
  ArrowRight,
  UserPlus,
  FileSpreadsheet
} from 'lucide-react';
import { AppUser, BillingInvoice, PlanTier, BillingStatus } from '../../types/user';
import { Property } from '../../types/realEstate';
import { NeonService } from '../../services/neonService';

interface AdminConsoleProps {
  currentUser: AppUser;
  onLogout: () => void;
  onSwitchToCustomerPortal: (userId?: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  currentUser,
  onLogout,
  onSwitchToCustomerPortal,
  isDark,
  onToggleTheme
}) => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'customers' | 'billing' | 'properties' | 'database'>('customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals state
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  // New Customer Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('client123');
  const [newPlan, setNewPlan] = useState<PlanTier>('pro');

  // New Property Form State
  const [propName, setPropName] = useState('');
  const [propAddress, setPropAddress] = useState('');
  const [propCity, setPropCity] = useState('');
  const [propState, setPropState] = useState('');
  const [propAssetClass, setPropAssetClass] = useState('Commercial Office');
  const [propValuation, setPropValuation] = useState<number>(45000000);
  const [propUserId, setPropUserId] = useState<string>('');

  // New Invoice Form State
  const [invUserId, setInvUserId] = useState<string>('');
  const [invNumber, setInvNumber] = useState(`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [invAmount, setInvAmount] = useState<number>(1499);
  const [invDueDate, setInvDueDate] = useState<string>(new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]);

  // Load live data from Neon
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedUsers, fetchedInvoices, fetchedProps] = await Promise.all([
        NeonService.getUsers(),
        NeonService.getInvoices(),
        NeonService.getProperties()
      ]);
      setUsers(fetchedUsers);
      setInvoices(fetchedInvoices);
      setAllProperties(fetchedProps);
      if (fetchedUsers.length > 0 && !propUserId) {
        setPropUserId(fetchedUsers[0].id);
        setInvUserId(fetchedUsers[0].id);
      }
    } catch (err) {
      console.error('Error loading Neon data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute live billing & tenant metrics
  const totalMrr = users
    .filter(u => u.billingStatus === 'active')
    .reduce((sum, u) => sum + (u.monthlySpend || 0), 0);

  const totalArr = totalMrr * 12;
  const payingCustomers = users.filter(u => u.role === 'customer').length;
  const pastDueCount = users.filter(u => u.billingStatus === 'past_due').length;
  const totalPropertiesInDb = allProperties.length;
  const totalValuationAll = allProperties.reduce((sum, p) => sum + (p.currentValuation || 0), 0);

  // Filtered users
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.companyName && u.companyName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || u.billingStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle Add Customer
  const handleAddCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const monthlySpend = newPlan === 'starter' ? 499 : newPlan === 'pro' ? 1499 : 4999;
    const created = await NeonService.createCustomer({
      name: newName,
      email: newEmail,
      companyName: newCompany,
      phone: newPhone,
      planTier: newPlan,
      monthlySpend,
      password: newPassword
    });

    setUsers(prev => [...prev, created]);
    setIsAddCustomerOpen(false);
    setNewName('');
    setNewEmail('');
    setNewCompany('');
    setNewPhone('');
  };

  // Handle Update Subscription
  const handleUpdateSubscriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    await NeonService.updateCustomerSubscription(
      editingUser.id,
      editingUser.planTier,
      editingUser.billingStatus,
      editingUser.monthlySpend
    );

    setUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u));
    setEditingUser(null);
  };

  // Handle Delete Customer
  const handleDeleteCustomer = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${userName} from Neon? All associated data will be removed.`)) {
      return;
    }
    await NeonService.deleteCustomer(userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
    setAllProperties(prev => prev.filter(p => (p as any).userId !== userId));
  };

  // Handle Toggle Invoice Paid
  const handleToggleInvoicePaid = async (invoiceId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'paid' ? 'past_due' : 'paid';
    await NeonService.updateInvoiceStatus(invoiceId, nextStatus);
    setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: nextStatus, paidAt: nextStatus === 'paid' ? new Date().toISOString() : undefined } : inv));
  };

  // Handle Create Invoice Submit
  const handleCreateInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetUser = users.find(u => u.id === invUserId);
    const planTier = targetUser?.planTier || 'pro';

    const newInv = await NeonService.createInvoice({
      userId: invUserId,
      invoiceNumber: invNumber,
      amount: invAmount,
      planTier,
      dueDate: invDueDate
    });

    if (newInv) {
      setInvoices(prev => [newInv, ...prev]);
    } else {
      // Local fallback
      const fallbackInv: BillingInvoice = {
        id: 'inv_' + Math.random().toString(36).substr(2, 9),
        userId: invUserId,
        userName: targetUser?.name || 'Customer',
        companyName: targetUser?.companyName || 'Institutional Client',
        invoiceNumber: invNumber,
        amount: invAmount,
        currency: 'USD',
        status: 'open',
        planTier,
        billingPeriodStart: new Date().toISOString().split('T')[0],
        billingPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        dueDate: invDueDate,
        createdAt: new Date().toISOString()
      };
      setInvoices(prev => [fallbackInv, ...prev]);
    }

    setIsAddInvoiceOpen(false);
    setInvNumber(`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  // Seed sample institutional clients directly into Neon
  const handleSeedSampleClients = async () => {
    setIsLoading(true);
    try {
      await NeonService.createCustomer({
        name: 'Sarah Jenkins',
        email: 'sarah.jenkins@blackrockre.com',
        companyName: 'Blackstone Real Estate Partners',
        phone: '+1 (212) 583-5000',
        planTier: 'pro',
        monthlySpend: 1499,
        password: 'client123'
      });
      await NeonService.createCustomer({
        name: 'Marcus Vance',
        email: 'marcus.vance@starwood.com',
        companyName: 'Starwood Capital Group',
        phone: '+1 (305) 695-5500',
        planTier: 'enterprise',
        monthlySpend: 4999,
        password: 'client123'
      });
      await NeonService.createCustomer({
        name: 'Elena Rostova',
        email: 'elena.rostova@brookfield.com',
        companyName: 'Brookfield Asset Management',
        phone: '+1 (212) 417-7000',
        planTier: 'starter',
        monthlySpend: 499,
        password: 'client123'
      });
      await loadData();
    } catch (err) {
      console.error('Error seeding clients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
      {/* ========================================================= */}
      {/* DEDICATED ADMIN HEADER (NOT THE CUSTOMER HEADER)           */}
      {/* ========================================================= */}
      <header style={{
        background: 'var(--bg-card)',
        borderBottom: '2px solid var(--accent-red)',
        padding: '0.75rem 1.5rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Left: Admin Brand & Neon Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'var(--accent-red)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(220, 38, 38, 0.4)'
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  PropertyWatch
                </span>
                <span style={{
                  background: 'var(--accent-red)',
                  color: '#FFFFFF',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase'
                }}>
                  ADMIN OS
                </span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                SaaS Tenant, Billing & Operations Management
              </div>
            </div>
          </div>

          <div style={{ height: '24px', width: '1px', background: 'var(--border-subtle)' }}></div>

          {/* Neon Connection Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(22, 163, 74, 0.08)',
            border: '1px solid rgba(22, 163, 74, 0.25)',
            fontSize: '0.72rem',
            color: '#16A34A',
            fontWeight: 600
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#16A34A', boxShadow: '0 0 6px #16A34A' }}></span>
            <Database size={12} />
            <span>Neon Serverless: Connected</span>
          </div>
        </div>

        {/* Center: Live Revenue Metric Ticker */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          background: 'var(--bg-input)',
          padding: '0.35rem 1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.78rem'
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Monthly Revenue: </span>
            <strong style={{ color: 'var(--text-primary)' }}>${totalMrr.toLocaleString()}/mo</strong>
          </div>
          <div style={{ height: '14px', width: '1px', background: 'var(--border-subtle)' }}></div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>ARR Run-Rate: </span>
            <strong style={{ color: '#16A34A' }}>${totalArr.toLocaleString()}/yr</strong>
          </div>
          <div style={{ height: '14px', width: '1px', background: 'var(--border-subtle)' }}></div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Clients in Neon: </span>
            <strong style={{ color: 'var(--text-primary)' }}>{payingCustomers} Active</strong>
          </div>
        </div>

        {/* Right: Actions, Customer Switcher & Admin Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Seed demo clients if list is sparse */}
          {users.length <= 1 && (
            <button
              onClick={handleSeedSampleClients}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px', border: '1px dashed var(--accent-red)' }}
              title="Populate sample customers into Neon"
            >
              <Sparkles size={13} color="var(--accent-red)" />
              <span>Seed Sample Clients</span>
            </button>
          )}

          {/* Switch to Customer Portal Preview */}
          <button
            onClick={() => onSwitchToCustomerPortal()}
            className="btn btn-primary btn-sm"
            style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}
            title="Preview what institutional customers see"
          >
            <Eye size={14} />
            <span>Preview Client Portal</span>
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={onToggleTheme} 
            className="btn btn-secondary btn-icon-only btn-sm"
            title="Toggle theme"
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Admin User Info Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.2rem 0.6rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'rgba(220, 38, 38, 0.15)',
              color: 'var(--accent-red)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.7rem'
            }}>
              A
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                {currentUser.name}
              </span>
              <span style={{ fontSize: '0.62rem', color: 'var(--accent-red)', fontWeight: 600, textTransform: 'uppercase' }}>
                SUPER ADMIN
              </span>
            </div>
            <button
              onClick={onLogout}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '2px',
                marginLeft: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Sign out"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* DEDICATED ADMIN SUB-NAVIGATION BAR (NOT CUSTOMER TABS)     */}
      {/* ========================================================= */}
      <nav style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <button
          onClick={() => setActiveTab('customers')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'customers' ? '3px solid var(--accent-red)' : '3px solid transparent',
            padding: '0.85rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.84rem',
            color: activeTab === 'customers' ? 'var(--accent-red)' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.15s ease'
          }}
        >
          <Users size={16} />
          <span>Customer Accounts & Tenancy ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'billing' ? '3px solid var(--accent-red)' : '3px solid transparent',
            padding: '0.85rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.84rem',
            color: activeTab === 'billing' ? 'var(--accent-red)' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.15s ease'
          }}
        >
          <CreditCard size={16} />
          <span>Billing, Invoices & Stripe MRR ({invoices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('properties')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'properties' ? '3px solid var(--accent-red)' : '3px solid transparent',
            padding: '0.85rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.84rem',
            color: activeTab === 'properties' ? 'var(--accent-red)' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.15s ease'
          }}
        >
          <Building2 size={16} />
          <span>Properties in Neon (Tied to Users) ({allProperties.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'database' ? '3px solid var(--accent-red)' : '3px solid transparent',
            padding: '0.85rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.84rem',
            color: activeTab === 'database' ? 'var(--accent-red)' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.15s ease'
          }}
        >
          <Database size={16} />
          <span>Neon Database Architecture & Schema</span>
        </button>
      </nav>

      {/* ========================================================= */}
      {/* ADMIN MAIN VIEWPORT                                       */}
      {/* ========================================================= */}
      <main style={{ flex: 1, padding: '1.5rem', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
        
        {/* SECTION 1: CUSTOMERS TABLE */}
        {activeTab === 'customers' && (
          <div>
            {/* Top Toolbar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.2rem', color: 'var(--text-primary)' }}>
                  Institutional Customer Accounts
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  Manage client access, company profile, subscription tier, and assigned properties stored in Neon.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button 
                  onClick={loadData} 
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                  <span>Sync Neon</span>
                </button>
                <button 
                  onClick={() => setIsAddCustomerOpen(true)}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <UserPlus size={14} />
                  <span>Add Customer</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              marginBottom: '1rem',
              flexWrap: 'wrap'
            }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
                <Search size={14} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search customer name, email, or institution..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem'
                  }}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Accounts</option>
                <option value="past_due">Past Due Accounts</option>
                <option value="canceled">Canceled Accounts</option>
              </select>
            </div>

            {/* Customers Table Card */}
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.85rem 1rem' }}>Client Name & Institution</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Login Email & Role</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Properties in Neon</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Portfolio Valuation</th>
                      <th style={{ padding: '0.85rem 1rem' }}>SaaS Plan Tier</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Billing Rate</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        {/* Name & Institution */}
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {user.name}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {user.companyName || 'Independent Investor'}
                          </div>
                        </td>

                        {/* Email & Role */}
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <div style={{ color: 'var(--text-secondary)' }}>{user.email}</div>
                          <span style={{
                            display: 'inline-block',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '4px',
                            background: user.role === 'admin' ? 'rgba(220, 38, 38, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                            color: user.role === 'admin' ? 'var(--accent-red)' : 'var(--text-muted)',
                            marginTop: '2px'
                          }}>
                            {user.role}
                          </span>
                        </td>

                        {/* Assigned Properties in Neon */}
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            <Building2 size={14} color="var(--accent-red)" />
                            <span>{user.propertyCount || 0} Assets</span>
                          </div>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            FK: <code>user_id</code>
                          </span>
                        </td>

                        {/* Valuation */}
                        <td style={{ padding: '0.9rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          ${((user.totalPortfolioValuation || 0) / 1000000).toFixed(1)}M
                        </td>

                        {/* Plan */}
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <span style={{
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            background: user.planTier === 'enterprise' 
                              ? 'rgba(147, 51, 234, 0.12)' 
                              : user.planTier === 'pro'
                              ? 'rgba(59, 130, 246, 0.12)'
                              : 'rgba(100, 116, 139, 0.12)',
                            color: user.planTier === 'enterprise' 
                              ? '#7C3AED' 
                              : user.planTier === 'pro'
                              ? '#2563EB'
                              : 'var(--text-secondary)'
                          }}>
                            {user.planTier}
                          </span>
                        </td>

                        {/* Spend */}
                        <td style={{ padding: '0.9rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {user.role === 'admin' ? 'Free (Admin)' : `$${(user.monthlySpend || 0).toLocaleString()} / mo`}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            background: user.billingStatus === 'active' 
                              ? 'rgba(34, 197, 94, 0.12)' 
                              : user.billingStatus === 'past_due'
                              ? 'rgba(239, 68, 68, 0.12)'
                              : 'rgba(100, 116, 139, 0.12)',
                            color: user.billingStatus === 'active' 
                              ? '#16A34A' 
                              : user.billingStatus === 'past_due'
                              ? '#DC2626'
                              : 'var(--text-muted)'
                          }}>
                            {user.billingStatus === 'active' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                            {user.billingStatus.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <button
                              onClick={() => onSwitchToCustomerPortal(user.id)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                              title="Open Customer Portal as this user"
                            >
                              <Eye size={12} />
                              <span>View Portal</span>
                            </button>
                            <button
                              onClick={() => setEditingUser({ ...user })}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                              title="Edit Plan & Billing"
                            >
                              <Edit2 size={12} />
                              <span>Manage</span>
                            </button>
                            {user.role !== 'admin' && (
                              <button
                                onClick={() => handleDeleteCustomer(user.id, user.name)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', color: '#DC2626' }}
                                title="Delete user"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: BILLING & INVOICES */}
        {activeTab === 'billing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Top Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.2rem', color: 'var(--text-primary)' }}>
                  Billing, Subscriptions & Invoices
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  Manage SaaS subscription plans, customer invoices, and Stripe billing records in Neon.
                </p>
              </div>

              <button 
                onClick={() => setIsAddInvoiceOpen(true)}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={14} />
                <span>Issue Invoice</span>
              </button>
            </div>

            {/* Pricing Tiers Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {/* Starter */}
              <div className="card" style={{ padding: '1.25rem', borderTop: '3px solid #64748B' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Starter Tier</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0.4rem 0', color: 'var(--text-primary)' }}>
                  $499 <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ mo</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  • Up to 3 active properties<br/>
                  • Basic underwriting models<br/>
                  • Single-user access
                </div>
              </div>

              {/* Pro */}
              <div className="card" style={{ padding: '1.25rem', borderTop: '3px solid #2563EB' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase' }}>Professional Tier</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0.4rem 0', color: 'var(--text-primary)' }}>
                  $1,499 <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ mo</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  • Up to 15 active properties<br/>
                  • Real-time IoT telemetry<br/>
                  • Debt capital markets & covenant tracking
                </div>
              </div>

              {/* Enterprise */}
              <div className="card" style={{ padding: '1.25rem', borderTop: '3px solid var(--accent-red)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-red)', textTransform: 'uppercase' }}>Enterprise Tier</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0.4rem 0', color: 'var(--text-primary)' }}>
                  $4,999 <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ mo</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  • Unlimited properties & portfolios<br/>
                  • Neon dedicated serverless compute<br/>
                  • Custom API integrations & LP tear sheets
                </div>
              </div>
            </div>

            {/* Invoices Table Card */}
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Invoices Ledger (Neon <code>public.invoices</code>)
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Foreign key: <code>user_id</code>
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.85rem 1rem' }}>Invoice #</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Customer / Company</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Plan Tier</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Amount</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Period</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Due Date</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          No invoices found in Neon. Click "Issue Invoice" above to generate one!
                        </td>
                      </tr>
                    ) : (
                      invoices.map((inv) => (
                        <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <Receipt size={14} color="var(--accent-red)" />
                              <span>{inv.invoiceNumber}</span>
                            </div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{inv.userName || 'Client'}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{inv.companyName}</div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700 }}>
                            {inv.planTier}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            ${inv.amount.toLocaleString()}.00
                          </td>
                          <td style={{ padding: '0.85rem 1rem', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {inv.billingPeriodStart} to {inv.billingPeriodEnd}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {inv.dueDate}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              background: inv.status === 'paid' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                              color: inv.status === 'paid' ? '#16A34A' : '#DC2626'
                            }}>
                              {inv.status === 'paid' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                              {inv.status.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                            <button
                              onClick={() => handleToggleInvoicePaid(inv.id, inv.status)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem' }}
                            >
                              {inv.status === 'paid' ? 'Mark Past Due' : 'Mark as Paid'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: PROPERTIES REGISTRY (TIED TO USERS) */}
        {activeTab === 'properties' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.2rem', color: 'var(--text-primary)' }}>
                  Neon Property Registry (Tied to Users)
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  Every property is tied directly to a client via foreign key <code>user_id</code> in Neon.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Total Asset Valuation: ${(totalValuationAll / 1000000).toFixed(1)}M
                </span>
              </div>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.85rem 1rem' }}>Property Name & Code</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Asset Class</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Location</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Tied Client Account</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Current Valuation</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Net Operating Income</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Cap Rate</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Occupancy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allProperties.map((prop) => {
                      const owner = users.find(u => u.id === (prop as any).userId);
                      return (
                        <tr key={prop.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '0.9rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <Building2 size={15} color="var(--accent-red)" />
                              <span>{prop.name}</span>
                            </div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              Code: {prop.code || 'PW-01'}
                            </span>
                          </td>
                          <td style={{ padding: '0.9rem 1rem' }}>
                            <span style={{
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              background: 'rgba(220, 38, 38, 0.08)',
                              color: 'var(--accent-red)'
                            }}>
                              {prop.assetClass}
                            </span>
                          </td>
                          <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)' }}>
                            {prop.city}, {prop.state}
                          </td>
                          <td style={{ padding: '0.9rem 1rem' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {owner?.name || 'IsaacI (admin)'}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              {owner?.companyName || 'PropertyWatch Global'}
                            </div>
                          </td>
                          <td style={{ padding: '0.9rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            ${((prop.currentValuation || 0) / 1000000).toFixed(1)}M
                          </td>
                          <td style={{ padding: '0.9rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            ${((prop.netOperatingIncome || 0) / 1000000).toFixed(2)}M / yr
                          </td>
                          <td style={{ padding: '0.9rem 1rem', fontWeight: 600, color: '#16A34A' }}>
                            {(prop.capRate || 5.8).toFixed(2)}%
                          </td>
                          <td style={{ padding: '0.9rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {(prop.physicalOccupancy || 95).toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: NEON DATABASE CONSOLE & SCHEMA */}
        {activeTab === 'database' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={18} color="var(--accent-red)" />
                Neon Postgres Relational Model
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 1.25rem' }}>
                Database: <code>neondb</code> | Host: <code>ep-summer-butterfly-arx057lh-pooler.c-4.us-west-2.aws.neon.tech</code>
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                {/* Users Table */}
                <div style={{
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.2rem',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={15} color="var(--accent-red)" />
                    <code>public.users</code>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
                    • <code>id</code> (UUID, PRIMARY KEY)<br/>
                    • <code>name</code> (TEXT)<br/>
                    • <code>email</code> (TEXT UNIQUE)<br/>
                    • <code>password_hash</code> (TEXT)<br/>
                    • <code>role</code> (TEXT: 'admin' | 'customer')<br/>
                    • <code>plan_tier</code> (TEXT: 'starter' | 'pro' | 'enterprise')<br/>
                    • <code>billing_status</code> (TEXT: 'active' | 'past_due' | 'canceled')<br/>
                    • <code>monthly_spend</code> (NUMERIC)<br/>
                    • <code>stripe_customer_id</code> (TEXT)
                  </div>
                </div>

                {/* Properties Table */}
                <div style={{
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.2rem',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={15} color="var(--accent-red)" />
                    <code>public.properties</code>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
                    • <code>id</code> (UUID, PRIMARY KEY)<br/>
                    • <code>user_id</code> (UUID, <strong>FOREIGN KEY</strong> → users.id)<br/>
                    • <code>name</code> (TEXT)<br/>
                    • <code>asset_class</code> (TEXT)<br/>
                    • <code>current_valuation</code> (NUMERIC)<br/>
                    • <code>net_operating_income</code> (NUMERIC)<br/>
                    • <code>cap_rate</code> (NUMERIC)<br/>
                    • <code>tenants</code> (JSONB)<br/>
                    • <code>telemetry</code> (JSONB)
                  </div>
                </div>

                {/* Invoices Table */}
                <div style={{
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.2rem',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Receipt size={15} color="var(--accent-red)" />
                    <code>public.invoices</code>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
                    • <code>id</code> (UUID, PRIMARY KEY)<br/>
                    • <code>user_id</code> (UUID, <strong>FOREIGN KEY</strong> → users.id)<br/>
                    • <code>invoice_number</code> (TEXT, UNIQUE)<br/>
                    • <code>amount</code> (NUMERIC)<br/>
                    • <code>status</code> (TEXT: 'paid' | 'past_due' | 'open')<br/>
                    • <code>plan_tier</code> (TEXT)<br/>
                    • <code>due_date</code> (DATE)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODALS                                                    */}
      {/* ========================================================= */}

      {/* MODAL: ADD CUSTOMER */}
      {isAddCustomerOpen && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Add New Customer Account</h3>
              <button 
                onClick={() => setIsAddCustomerOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomerSubmit}>
              <div className="login-field" style={{ marginBottom: '1rem' }}>
                <label className="login-label">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Solomon"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="login-input"
                />
              </div>

              <div className="login-field" style={{ marginBottom: '1rem' }}>
                <label className="login-label">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. d.solomon@goldman.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="login-input"
                />
              </div>

              <div className="login-field" style={{ marginBottom: '1rem' }}>
                <label className="login-label">Company / Institution</label>
                <input
                  type="text"
                  placeholder="e.g. Goldman Sachs Asset Management"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="login-input"
                />
              </div>

              <div className="login-field" style={{ marginBottom: '1rem' }}>
                <label className="login-label">Initial Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="login-input"
                />
              </div>

              <div className="login-field" style={{ marginBottom: '1.5rem' }}>
                <label className="login-label">Subscription Tier</label>
                <select
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value as PlanTier)}
                  className="login-input"
                >
                  <option value="starter">Starter Plan ($499 / mo)</option>
                  <option value="pro">Professional Plan ($1,499 / mo)</option>
                  <option value="enterprise">Enterprise Plan ($4,999 / mo)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Create in Neon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CUSTOMER */}
      {editingUser && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                Manage Subscription: {editingUser.name}
              </h3>
              <button 
                onClick={() => setEditingUser(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateSubscriptionSubmit}>
              <div className="login-field" style={{ marginBottom: '1rem' }}>
                <label className="login-label">Plan Tier</label>
                <select
                  value={editingUser.planTier}
                  onChange={(e) => {
                    const nextPlan = e.target.value as PlanTier;
                    const nextSpend = nextPlan === 'starter' ? 499 : nextPlan === 'pro' ? 1499 : 4999;
                    setEditingUser({
                      ...editingUser,
                      planTier: nextPlan,
                      monthlySpend: nextSpend
                    });
                  }}
                  className="login-input"
                >
                  <option value="starter">Starter Plan ($499 / mo)</option>
                  <option value="pro">Professional Plan ($1,499 / mo)</option>
                  <option value="enterprise">Enterprise Plan ($4,999 / mo)</option>
                </select>
              </div>

              <div className="login-field" style={{ marginBottom: '1rem' }}>
                <label className="login-label">Billing Status</label>
                <select
                  value={editingUser.billingStatus}
                  onChange={(e) => setEditingUser({ ...editingUser, billingStatus: e.target.value as BillingStatus })}
                  className="login-input"
                >
                  <option value="active">Active (Good Standing)</option>
                  <option value="past_due">Past Due (Delinquent)</option>
                  <option value="canceled">Canceled (Terminated)</option>
                  <option value="trialing">Trialing (Evaluation)</option>
                </select>
              </div>

              <div className="login-field" style={{ marginBottom: '1.5rem' }}>
                <label className="login-label">Monthly Billing Amount ($)</label>
                <input
                  type="number"
                  value={editingUser.monthlySpend}
                  onChange={(e) => setEditingUser({ ...editingUser, monthlySpend: parseFloat(e.target.value) || 0 })}
                  className="login-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save Changes in Neon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ISSUE INVOICE */}
      {isAddInvoiceOpen && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Issue Client Invoice</h3>
              <button 
                onClick={() => setIsAddInvoiceOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit}>
              <div className="login-field" style={{ marginBottom: '1rem' }}>
                <label className="login-label">Select Client *</label>
                <select
                  value={invUserId}
                  onChange={(e) => setInvUserId(e.target.value)}
                  className="login-input"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.companyName || u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="login-field" style={{ marginBottom: '1rem' }}>
                <label className="login-label">Invoice Number</label>
                <input
                  type="text"
                  required
                  value={invNumber}
                  onChange={(e) => setInvNumber(e.target.value)}
                  className="login-input"
                />
              </div>

              <div className="login-field" style={{ marginBottom: '1rem' }}>
                <label className="login-label">Amount ($ USD)</label>
                <input
                  type="number"
                  required
                  value={invAmount}
                  onChange={(e) => setInvAmount(parseFloat(e.target.value) || 0)}
                  className="login-input"
                />
              </div>

              <div className="login-field" style={{ marginBottom: '1.5rem' }}>
                <label className="login-label">Due Date</label>
                <input
                  type="date"
                  required
                  value={invDueDate}
                  onChange={(e) => setInvDueDate(e.target.value)}
                  className="login-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddInvoiceOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save & Issue in Neon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminConsole;
