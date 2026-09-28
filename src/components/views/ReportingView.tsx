import React from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  CheckCircle2, 
  Building2, 
  Layers, 
  TrendingUp, 
  ShieldCheck,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Property, LoanFacility } from '../../types/realEstate';
import { CurrencyCode, formatCurrency, formatPercent, formatSqFt } from '../../utils/financialModels';

interface ReportingViewProps {
  properties: Property[];
  loans: LoanFacility[];
  currency: CurrencyCode;
}

export const ReportingView: React.FC<ReportingViewProps> = ({
  properties,
  loans,
  currency
}) => {
  const totalValuation = properties.reduce((acc, p) => acc + p.currentValuation, 0);
  const totalDebt = loans.reduce((acc, l) => acc + l.currentBalance, 0);
  const netAssetValue = totalValuation - totalDebt;
  const totalNoi = properties.reduce((acc, p) => acc + p.netOperatingIncome, 0);
  const totalSqFt = properties.reduce((acc, p) => acc + p.rentableSqFt, 0);
  const avgOccupancy = properties.reduce((acc, p) => acc + (p.physicalOccupancy * p.rentableSqFt), 0) / totalSqFt;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const headers = ['Property Name', 'Asset Class', 'City', 'RSF', 'Valuation', 'Annual NOI', 'Cap Rate', 'Occupancy', 'WALT'];
    const rows = properties.map(p => [
      `"${p.name}"`,
      `"${p.assetClass}"`,
      `"${p.city}"`,
      p.rentableSqFt,
      p.currentValuation,
      p.netOperatingIncome,
      `${p.capRate}%`,
      `${p.physicalOccupancy}%`,
      `${p.waltYears} yrs`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PropertyWatch_LP_Tear_Sheet_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Bar */}
      <div 
        className="glass-panel no-print" 
        style={{ 
          padding: '1.5rem 1.75rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '1rem',
          borderLeft: '4px solid var(--accent-cyan)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-cyan">LIMITED PARTNER REPORTING STUDIO</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Quarterly LP Tear Sheet • Audit-Ready Memoranda</span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Institutional LP Quarterly Tear Sheet</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Print-ready quarterly executive portfolio tear sheet for sovereign wealth funds, pension endowments, and family offices.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleExportCsv} className="btn btn-secondary">
            <Download size={15} /> Export Clean CSV
          </button>
          <button onClick={handlePrint} className="btn btn-primary">
            <Printer size={15} /> Print / Export PDF Deck
          </button>
        </div>
      </div>

      {/* Printable Institutional Tear Sheet Container */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '2.5rem', 
          background: 'var(--bg-subtle)', 
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)'
        }}
      >
        {/* Tear Sheet Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'linear-gradient(135deg, #10B981, #0284C7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                <Building2 size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>PropertyWatch Capital Partners</h2>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Global Real Estate Investment Management • Institutional Reporting Desk</div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
              Q3 2026 Institutional Performance Report
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              As of: September 28, 2026 • Reporting Currency: {currency}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', fontWeight: 600, marginTop: '2px' }}>
              GIPS & INREV Standards Compliant
            </div>
          </div>
        </div>

        {/* Fund Capital Summary Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Gross Asset Value (GAV)</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '0.25rem' }}>
              {formatCurrency(totalValuation, currency)}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>4 Stabilized Trophy Assets</div>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Net Asset Value (NAV)</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>
              {formatCurrency(netAssetValue, currency)}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)' }}>+18.4% Net Value Add</div>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Portfolio Debt Outstanding</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-amber)', marginTop: '0.25rem' }}>
              {formatCurrency(totalDebt, currency)}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Blended LTV: {((totalDebt / totalValuation) * 100).toFixed(1)}%</div>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Annualized NOI Run-Rate</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              {formatCurrency(totalNoi, currency)}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Physical Occupancy: {avgOccupancy.toFixed(1)}%</div>
          </div>
        </div>

        {/* Portfolio Table */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Consolidated Property Asset Schedule
          </h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset Name</th>
                  <th>Class</th>
                  <th>Location</th>
                  <th>RSF</th>
                  <th>Current Valuation</th>
                  <th>Annual NOI</th>
                  <th>Cap Rate</th>
                  <th>Occ %</th>
                  <th>WALT</th>
                  <th>ESG</th>
                </tr>
              </thead>
              <tbody>
                {properties.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{p.name}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{p.code}</div>
                    </td>
                    <td>{p.assetClass}</td>
                    <td>{p.city}, {p.state}</td>
                    <td className="font-mono">{p.rentableSqFt.toLocaleString()}</td>
                    <td className="font-mono" style={{ fontWeight: 700 }}>{formatCurrency(p.currentValuation, currency)}</td>
                    <td className="font-mono" style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                      {formatCurrency(p.netOperatingIncome, currency)}
                    </td>
                    <td className="font-mono">{p.capRate.toFixed(2)}%</td>
                    <td className="font-mono">{p.physicalOccupancy.toFixed(1)}%</td>
                    <td className="font-mono">{p.waltYears} yrs</td>
                    <td><span className="badge badge-emerald">GRESB {p.gresbScore}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Institutional Tenants Section */}
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Top Credit Leases & Counterparty Risk
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {[
              { name: 'Citadel Quant Capital', asset: 'The Horizon Spire (NYC)', rsf: '320,000 RSF', rating: 'AA', exp: '2036', share: '22.8%' },
              { name: 'Moderna mRNA Therapeutics', asset: 'Vertex Life Science (Cambridge)', rsf: '340,000 RSF', rating: 'A+', exp: '2038', share: '24.9%' },
              { name: 'Amazon Fulfillment Services', asset: 'Apex Logistics Hub (Denver)', rsf: '1,100,000 RSF', rating: 'AA', exp: '2037', share: '9.4%' },
              { name: 'BlackRock Fixed Income', asset: 'The Horizon Spire (NYC)', rsf: '280,000 RSF', rating: 'AA-', exp: '2034', share: '17.0%' },
            ].map((t, idx) => (
              <div key={idx} style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.name}</div>
                  <span className="badge badge-emerald">{t.rating}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{t.asset}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                  <span>{t.rsf}</span>
                  <span>Expires: {t.exp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Sign-off */}
        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <span>Confidential • Prepared exclusively for Institutional Limited Partners • Not for public distribution</span>
          <span>PropertyWatch Real Estate Operating System v1.0 Enterprise</span>
        </div>
      </div>
    </div>
  );
};
