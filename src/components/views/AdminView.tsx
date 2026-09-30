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
  RefreshCw,
  Database
} from 'lucide-react';
import { AppUser, BillingInvoice, PlanTier, BillingStatus } from '../../types/user';
import { NeonService } from '../../services/neonService';

interface AdminViewProps {
  onSelectCustomerPortfolio?: (userId: string, userName: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onSelectCustomerPortfolio }) => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'customers' | 'billing' | 'neon-schema'>('customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals state
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  // New Customer Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPlan, setNewPlan] = useState<PlanTier>('pro');

  // Load data from Neon
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedUsers, fetchedInvoices] = await Promise.all([
        NeonService.getUsers(),
        NeonService.getInvoices()
      ]);
      setUsers(fetchedUsers);
      setInvoices(fetchedInvoices);
    } catch (err) {
      console.error('Error loading Neon data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute metrics
  const totalMrr = users
    .filter(u => u.billingStatus === 'active')
    .reduce((sum, u) => sum + (u.monthlySpend || 0), 0);

  const totalArr = totalMrr * 12;
  const payingCustomers = users.filter(u => u.role === 'customer').length;
  const pastDueCount = users.filter(u => u.billingStatus === 'past_due').length;
  const totalPropertiesInDb = users.reduce((sum, u) => sum + (u.propertyCount || 0), 0);

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
      monthlySpend
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

  // Handle Mark Invoice Paid
  const handleToggleInvoicePaid = async (invoiceId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'paid' ? 'past_due' : 'paid';
    await NeonService.updateInvoiceStatus(invoiceId, nextStatus);
    setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: nextStatus, paidAt: nextStatus === 'paid' ? new Date().toISOString() : undefined } : inv));
  };

  return (
    <div className="admin-portal" style={{ padding: '1.5rem', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.25rem 1.5rem',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        marginBottom: '1.5rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: 'rgba(220, 38, 38, 0.1)',
            color: 'var(--accent-red)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Admin & Operations Command
              </h1>
              <span style={{
                background: 'rgba(220, 38, 38, 0.15)',
                color: 'var(--accent-red)',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.15rem 0.5rem',
                borderRadius: '6px',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                letterSpacing: '0.05em'
              }}>
                ADMIN ACCESS
              </span>
              <span style={{
                background: 'rgba(34, 197, 94, 0.12)',
                color: '#16A34A',
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '0.15rem 0.5rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Database size={11} />
                Neon Postgres: Live
              </span>
            </div>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Manage customer accounts, billing subscriptions, Stripe records, and properties tied to users in Neon.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={loadData} 
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
            title="Refresh from Neon"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh Neon</span>
          </button>
          <button 
            onClick={() => setIsAddCustomerOpen(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
          >
            <Plus size={15} />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {/* MRR Card */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Monthly Recurring Revenue
            </span>
            <div style={{ padding: '6px', borderRadius: '6px', background: 'rgba(220, 38, 38, 0.1)', color: 'var(--accent-red)' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0.5rem 0 0.2rem', color: 'var(--text-primary)' }}>
            ${totalMrr.toLocaleString()} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ mo</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}>
            <TrendingUp size={13} />
            ARR Run-Rate: ${totalArr.toLocaleString()}
          </div>
        </div>

        {/* Paying Customers Card */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Institutional Customers
            </span>
            <div style={{ padding: '6px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.1)', color: '#2563EB' }}>
              <Users size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0.5rem 0 0.2rem', color: 'var(--text-primary)' }}>
            {payingCustomers} Accounts
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {pastDueCount > 0 ? (
              <span style={{ color: '#DC2626', fontWeight: 600 }}>
                {pastDueCount} account past due
              </span>
            ) : (
              '100% accounts current'
            )}
          </div>
        </div>

        {/* Managed Properties in Neon */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Properties in Neon
            </span>
            <div style={{ padding: '6px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}>
              <Building2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0.5rem 0 0.2rem', color: 'var(--text-primary)' }}>
            {totalPropertiesInDb} Assets
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Tied to user accounts via foreign keys
          </div>
        </div>

        {/* Neon Auth & Schema Status */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Database & Tables
            </span>
            <div style={{ padding: '6px', borderRadius: '6px', background: 'rgba(147, 51, 234, 0.1)', color: '#7C3AED' }}>
              <Database size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0.5rem 0 0.2rem', color: 'var(--text-primary)' }}>
            3 Tables
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <code>public.users</code>, <code>properties</code>, <code>invoices</code>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '1.5rem',
        gap: '0.5rem'
      }}>
        <button
          onClick={() => setActiveSubTab('customers')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeSubTab === 'customers' ? '2px solid var(--accent-red)' : '2px solid transparent',
            padding: '0.75rem 1.25rem',
            fontWeight: 600,
            fontSize: '0.875rem',
            color: activeSubTab === 'customers' ? 'var(--accent-red)' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Users size={16} />
          <span>Customers & Accounts ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('billing')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeSubTab === 'billing' ? '2px solid var(--accent-red)' : '2px solid transparent',
            padding: '0.75rem 1.25rem',
            fontWeight: 600,
            fontSize: '0.875rem',
            color: activeSubTab === 'billing' ? 'var(--accent-red)' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <CreditCard size={16} />
          <span>Billing & Invoices ({invoices.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('neon-schema')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeSubTab === 'neon-schema' ? '2px solid var(--accent-red)' : '2px solid transparent',
            padding: '0.75rem 1.25rem',
            fontWeight: 600,
            fontSize: '0.875rem',
            color: activeSubTab === 'neon-schema' ? 'var(--accent-red)' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Database size={16} />
          <span>Neon Database Schema & Relations</span>
        </button>
      </div>

      {/* SUB-TAB 1: CUSTOMERS TABLE */}
      {activeSubTab === 'customers' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          {/* Controls Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
              <div style={{
                position: 'relative',
                flex: 1,
                maxWidth: '400px'
              }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search customer, company or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem'
                  }}
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="past_due">Past Due</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem' }}>Customer / Company</th>
                  <th style={{ padding: '0.75rem' }}>Email & Role</th>
                  <th style={{ padding: '0.75rem' }}>Properties Tied in Neon</th>
                  <th style={{ padding: '0.75rem' }}>Portfolio Valuation</th>
                  <th style={{ padding: '0.75rem' }}>Subscription Plan</th>
                  <th style={{ padding: '0.75rem' }}>Monthly Billing</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    style={{ 
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    {/* Name & Company */}
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {user.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {user.companyName || 'Individual Investor'}
                      </div>
                    </td>

                    {/* Email & Role */}
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <div style={{ color: 'var(--text-secondary)' }}>{user.email}</div>
                      <span style={{
                        display: 'inline-block',
                        fontSize: '0.68rem',
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

                    {/* Properties Count */}
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        <Building2 size={14} color="var(--accent-red)" />
                        <span>{user.propertyCount || 0} Assets</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        foreign key: user_id
                      </span>
                    </td>

                    {/* Valuation */}
                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      ${((user.totalPortfolioValuation || 0) / 1000000).toFixed(1)}M
                    </td>

                    {/* Plan Tier */}
                    <td style={{ padding: '0.85rem 0.75rem' }}>
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

                    {/* Monthly Spend */}
                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {user.role === 'admin' ? 'Free (Admin)' : `$${(user.monthlySpend || 0).toLocaleString()} / mo`}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '0.85rem 0.75rem' }}>
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
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        {onSelectCustomerPortfolio && (
                          <button
                            onClick={() => onSelectCustomerPortfolio(user.id, user.name)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                            title="Switch app view to this customer's properties"
                          >
                            <Eye size={12} />
                            <span>View Assets</span>
                          </button>
                        )}
                        <button
                          onClick={() => setEditingUser({ ...user })}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                          title="Edit Customer & Subscription"
                        >
                          <Edit2 size={12} />
                          <span>Manage</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: BILLING & INVOICES */}
      {activeSubTab === 'billing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Plan Tiers Pricing Summary */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem'
          }}>
            {/* Starter Plan */}
            <div className="card" style={{ padding: '1.25rem', borderTop: '3px solid #64748B' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Starter Tier</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.4rem 0', color: 'var(--text-primary)' }}>
                $499 <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ month</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Ideal for boutique sponsors and local syndicators managing up to 3 assets.
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                • Up to 3 active properties<br/>
                • Core underwriting models<br/>
                • Standard LP tear sheets
              </div>
            </div>

            {/* Pro Plan */}
            <div className="card" style={{ padding: '1.25rem', borderTop: '3px solid #2563EB' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase' }}>Professional Tier</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.4rem 0', color: 'var(--text-primary)' }}>
                $1,499 <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ month</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Designed for regional asset managers and funds with institutional reporting requirements.
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                • Up to 15 active properties<br/>
                • Real-time telemetry integration<br/>
                • Debt capital markets & covenant tracking
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="card" style={{ padding: '1.25rem', borderTop: '3px solid var(--accent-red)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-red)', textTransform: 'uppercase' }}>Enterprise Tier</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.4rem 0', color: 'var(--text-primary)' }}>
                $4,999 <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ month</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                For global institutional REITs, sovereign wealth funds, and multi-billion PE funds.
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                • Unlimited properties & portfolios<br/>
                • Neon Serverless dedicated compute<br/>
                • Custom API hooks & 24/7 SLA
              </div>
            </div>
          </div>

          {/* Invoices List */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Recent Invoices & Transactions (in Neon <code>public.invoices</code>)
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Auto-synced with Stripe billing
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem' }}>Invoice #</th>
                    <th style={{ padding: '0.75rem' }}>Customer</th>
                    <th style={{ padding: '0.75rem' }}>Plan Tier</th>
                    <th style={{ padding: '0.75rem' }}>Amount</th>
                    <th style={{ padding: '0.75rem' }}>Period</th>
                    <th style={{ padding: '0.75rem' }}>Due Date</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Receipt size={14} color="var(--accent-red)" />
                          <span>{inv.invoiceNumber}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{inv.userName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{inv.companyName}</div>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}>
                        {inv.planTier}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        ${inv.amount.toLocaleString()}.00
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {inv.billingPeriodStart} to {inv.billingPeriodEnd}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {inv.dueDate}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>
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
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                        <button
                          onClick={() => handleToggleInvoicePaid(inv.id, inv.status)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                        >
                          {inv.status === 'paid' ? 'Mark Past Due' : 'Mark as Paid'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: NEON DATABASE SCHEMA & ARCHITECTURE */}
      {activeSubTab === 'neon-schema' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={18} color="var(--accent-red)" />
              Neon Postgres Architecture
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 1.25rem' }}>
              Your database is hosted on <strong>Neon Serverless Postgres</strong>. Tables are structured with relational integrity so each property is tied to a user account.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {/* Users Table */}
              <div style={{
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={14} color="var(--accent-red)" />
                  <code>public.users</code>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  • <code>id</code> (UUID, PRIMARY KEY)<br/>
                  • <code>name</code> (TEXT)<br/>
                  • <code>email</code> (TEXT, UNIQUE)<br/>
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
                padding: '1rem',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={14} color="var(--accent-red)" />
                  <code>public.properties</code>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  • <code>id</code> (UUID, PRIMARY KEY)<br/>
                  • <code>user_id</code> (UUID, <strong>FOREIGN KEY</strong> → users.id)<br/>
                  • <code>name</code> (TEXT)<br/>
                  • <code>asset_class</code> (TEXT)<br/>
                  • <code>current_valuation</code> (NUMERIC)<br/>
                  • <code>net_operating_income</code> (NUMERIC)<br/>
                  • <code>cap_rate</code> (NUMERIC)<br/>
                  • <code>debt_balance</code> (NUMERIC)
                </div>
              </div>

              {/* Invoices Table */}
              <div style={{
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Receipt size={14} color="var(--accent-red)" />
                  <code>public.invoices</code>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
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

      {/* MODAL: ADD CUSTOMER */}
      {isAddCustomerOpen && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Add New Customer Account</h3>
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
                <label className="login-label">Company / Institution Name</label>
                <input
                  type="text"
                  placeholder="e.g. Goldman Sachs Real Estate"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="login-input"
                />
              </div>

              <div className="login-field" style={{ marginBottom: '1rem' }}>
                <label className="login-label">Phone</label>
                <input
                  type="text"
                  placeholder="+1 (555) 123-4567"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
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
                  Create Customer in Neon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CUSTOMER SUBSCRIPTION */}
      {editingUser && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
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
                  <option value="past_due">Past Due (Payment Failed)</option>
                  <option value="canceled">Canceled (Churned)</option>
                  <option value="trialing">Trialing (14-day evaluation)</option>
                </select>
              </div>

              <div className="login-field" style={{ marginBottom: '1.5rem' }}>
                <label className="login-label">Monthly Spend ($)</label>
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
                  Save Changes to Neon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
