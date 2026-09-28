import React from 'react';
import { X, ShieldCheck, Calendar, DollarSign, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Tenant } from '../../types/realEstate';
import { CurrencyCode, formatCurrency } from '../../utils/financialModels';

interface TenantDetailModalProps {
  tenant: Tenant | null;
  onClose: () => void;
  currency: CurrencyCode;
}

export const TenantDetailModal: React.FC<TenantDetailModalProps> = ({
  tenant,
  onClose,
  currency
}) => {
  if (!tenant) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '600px', padding: '1.75rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-cyan">{tenant.industry}</span>
              <span className="badge badge-emerald">Rating: {tenant.creditRating}</span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{tenant.name}</h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Location: {tenant.floor}</div>
          </div>
          <button onClick={onClose} className="btn-ghost btn-sm"><X size={18} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Demised Area</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700 }}>
              {tenant.leasedSqFt.toLocaleString()} RSF
            </div>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Base Rental Rate</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
              ${tenant.rentPerSqFt} / RSF / Yr
            </div>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Annual In-Place Rent</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
              {formatCurrency(tenant.annualRent, currency)}
            </div>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Security Deposit</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700 }}>
              {tenant.securityDepositMonths} Months LOC
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Lease Commencement:</span>
            <span className="font-mono">{tenant.leaseStartDate}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Lease Expiration:</span>
            <span className="font-mono" style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{tenant.leaseExpiryDate}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Contractual Escalator:</span>
            <span style={{ fontWeight: 600 }}>{tenant.escalationType}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Extension Options:</span>
            <span>{tenant.renewalOptions}</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-primary" style={{ width: '100%' }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
