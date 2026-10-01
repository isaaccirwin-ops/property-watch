import React, { useState } from 'react';
import { 
  Landmark, 
  ShieldAlert, 
  Calendar, 
  Percent, 
  DollarSign, 
  ArrowUpRight, 
  TrendingDown, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  Layers
} from 'lucide-react';
import { LoanFacility, Property } from '../../types/realEstate';
import { CurrencyCode, formatCurrency, formatPercent } from '../../utils/financialModels';

interface CapitalMarketsViewProps {
  loans: LoanFacility[];
  properties: Property[];
  currency: CurrencyCode;
}

export const CapitalMarketsView: React.FC<CapitalMarketsViewProps> = ({
  loans,
  properties,
  currency
}) => {
  const totalDebt = loans.reduce((acc, l) => acc + l.currentBalance, 0);
  const totalValuation = properties.reduce((acc, p) => acc + p.currentValuation, 0);
  const blendedLtv = totalValuation > 0 ? (totalDebt / totalValuation) * 100 : 0;
  
  // Wtd average interest rate
  const wtdInterestRate = totalDebt > 0 ? loans.reduce((acc, l) => acc + (l.interestRatePct * l.currentBalance), 0) / totalDebt : 0;

  // Maturity schedule (wall)
  const maturitySchedule = [
    { year: 2026, amount: 0, count: 0 },
    { year: 2027, amount: 195000000, count: 1, note: 'Aurora Biscayne (Blackstone Floating Debt Refi)' },
    { year: 2028, amount: 0, count: 0 },
    { year: 2029, amount: 0, count: 0 },
    { year: 2030, amount: 210000000, count: 1, note: 'Apex Logistics (MetLife Fixed)' },
    { year: 2031, amount: 0, count: 0 },
    { year: 2032, amount: 580000000, count: 1, note: 'The Horizon Spire (JPMorgan Fixed)' },
    { year: 2033, amount: 275000000, count: 1, note: 'Vertex Life Science (BofA Fixed)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Banner */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '1.5rem 1.75rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '1rem',
          borderLeft: '4px solid var(--accent-amber)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-amber">TREASURY & CAPITAL MARKETS</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Debt Stack • Refinancing Cliff • Interest Rate Cap Hedging</span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Debt Facilities & Capital Markets</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Active loan facilities, interest rate hedges, maturity wall scheduling, and covenant compliance monitoring.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Total Debt Outstanding</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
              {formatCurrency(totalDebt, currency)}
            </div>
          </div>
          <div style={{ width: '1px', height: '35px', background: 'var(--border-subtle)' }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Portfolio LTV</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              {blendedLtv.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="kpi-grid">
        <div className="glass-panel kpi-card">
          <div className="kpi-header"><span className="kpi-title">Wtd. Avg. Interest Rate</span><Percent size={15} style={{ color: 'var(--accent-amber)' }} /></div>
          <div className="kpi-value">{wtdInterestRate.toFixed(2)}%</div>
          <div className="kpi-footer"><span>Fixed vs Floating: 84% / 16%</span></div>
        </div>

        <div className="glass-panel kpi-card">
          <div className="kpi-header"><span className="kpi-title">Fixed Rate Lock</span><Lock size={15} style={{ color: 'var(--accent-emerald)' }} /></div>
          <div className="kpi-value">{formatCurrency(loans.filter(l => l.interestRateType === 'Fixed').reduce((a, b) => a + b.currentBalance, 0), currency, true)}</div>
          <div className="kpi-footer"><span className="badge badge-emerald">Hedging Active</span></div>
        </div>

        <div className="glass-panel kpi-card">
          <div className="kpi-header"><span className="kpi-title">Floating Exposure</span><TrendingDown size={15} style={{ color: 'var(--accent-cyan)' }} /></div>
          <div className="kpi-value">{formatCurrency(loans.filter(l => l.interestRateType.includes('Floating')).reduce((a, b) => a + b.currentBalance, 0), currency, true)}</div>
          <div className="kpi-footer"><span>Capped at 6.75% SOFR strike</span></div>
        </div>

        <div className="glass-panel kpi-card">
          <div className="kpi-header"><span className="kpi-title">Covenant Status</span><ShieldAlert size={15} style={{ color: 'var(--accent-emerald)' }} /></div>
          <div className="kpi-value" style={{ color: 'var(--accent-emerald)' }}>100% Pass</div>
          <div className="kpi-footer"><span>All facilities compliant</span></div>
        </div>
      </div>

      {/* Maturity Wall Chart Section */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Institutional Loan Maturity Wall (2026 - 2033)</h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Refinancing schedule by calendar year, balloon payments, and interest rate reset cliffs
            </div>
          </div>
          <span className="badge badge-cyan">Zero 2026 Refinancing Risk</span>
        </div>

        {/* Visual Bar Wall */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '180px', padding: '1rem 0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
          {maturitySchedule.map(item => {
            const maxAmount = 600000000;
            const heightPct = item.amount > 0 ? (item.amount / maxAmount) * 100 : 4;

            return (
              <div key={item.year} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                {item.amount > 0 && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-amber)', marginBottom: '4px' }}>
                    {formatCurrency(item.amount, currency, true)}
                  </div>
                )}
                <div 
                  style={{ 
                    width: '100%', 
                    height: `${heightPct}%`, 
                    background: item.amount > 0 ? 'linear-gradient(180deg, #F59E0B 0%, #D97706 100%)' : 'rgba(255,255,255,0.05)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'all 0.3s ease',
                    boxShadow: item.amount > 0 ? '0 0 12px rgba(245, 158, 11, 0.3)' : 'none'
                  }}
                  title={item.note || 'No debt maturing'}
                />
                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: item.amount > 0 ? 'var(--text-primary)' : 'var(--text-dim)', marginTop: '8px' }}>
                  {item.year}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Loan Facilities Register Table */}
      <div className="glass-panel table-container">
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '0.96rem', fontWeight: 700 }}>Senior & Mezzanine Debt Facilities Registry</h3>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Property & Collateral</th>
              <th>Lead Lender</th>
              <th>Structure</th>
              <th>Balance</th>
              <th>Interest Rate</th>
              <th>Maturity Date</th>
              <th>Amortization</th>
              <th>Min DSCR</th>
              <th>Max LTV</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loans.map(loan => (
              <tr key={loan.id}>
                <td>
                  <div style={{ fontWeight: 700 }}>{loan.propertyName}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Facility: {loan.id}</div>
                </td>
                <td style={{ fontWeight: 600 }}>{loan.lender}</td>
                <td>
                  <span className={`badge ${loan.interestRateType === 'Fixed' ? 'badge-emerald' : 'badge-cyan'}`}>
                    {loan.interestRateType}
                  </span>
                </td>
                <td className="font-mono" style={{ fontWeight: 700, color: 'var(--accent-amber)' }}>
                  {formatCurrency(loan.currentBalance, currency)}
                </td>
                <td className="font-mono" style={{ fontWeight: 600 }}>
                  {loan.interestRatePct.toFixed(2)}%
                  {loan.rateCapPct && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Cap: {loan.rateCapPct}%</span>}
                </td>
                <td className="font-mono">{loan.maturityDate}</td>
                <td>{loan.amortizationYears} Yrs Amort</td>
                <td className="font-mono">{loan.covenantMinDscr.toFixed(2)}x</td>
                <td className="font-mono">{loan.covenantMaxLtv.toFixed(1)}%</td>
                <td>
                  <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <CheckCircle2 size={11} /> {loan.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
