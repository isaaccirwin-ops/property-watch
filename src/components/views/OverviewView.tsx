import React, { useState } from 'react';
import { 
  Building2, 
  TrendingUp, 
  Percent, 
  Clock, 
  ShieldCheck, 
  MapPin, 
  Layers, 
  ArrowUpRight, 
  Compass, 
  Filter, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  Zap
} from 'lucide-react';
import { Property, AssetClass } from '../../types/realEstate';
import { CurrencyCode, formatCurrency, formatPercent, formatSqFt } from '../../utils/financialModels';

interface OverviewViewProps {
  properties: Property[];
  onSelectProperty: (propertyId: string) => void;
  currency: CurrencyCode;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  properties,
  onSelectProperty,
  currency
}) => {
  const [selectedAssetClass, setSelectedAssetClass] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'map' | 'table'>('grid');

  // Aggregated KPIs
  const totalValuation = properties.reduce((acc, p) => acc + p.currentValuation, 0);
  const totalNoi = properties.reduce((acc, p) => acc + p.netOperatingIncome, 0);
  const totalSqFt = properties.reduce((acc, p) => acc + p.rentableSqFt, 0);
  const avgCapRate = properties.reduce((acc, p) => acc + (p.capRate * p.currentValuation), 0) / totalValuation;
  const avgOccupancy = properties.reduce((acc, p) => acc + (p.physicalOccupancy * p.rentableSqFt), 0) / totalSqFt;
  const avgWalt = properties.reduce((acc, p) => acc + (p.waltYears * p.currentValuation), 0) / totalValuation;
  const totalDebt = properties.reduce((acc, p) => acc + p.debtBalance, 0);
  const portfolioLtv = (totalDebt / totalValuation) * 100;
  const avgDscr = properties.reduce((acc, p) => acc + (p.debtServiceCoverageRatio * p.debtBalance), 0) / totalDebt;
  const avgGresb = Math.round(properties.reduce((acc, p) => acc + p.gresbScore, 0) / properties.length);

  // Asset Class Breakdown
  const assetClasses: AssetClass[] = ['Commercial Office', 'Industrial Logistics', 'Multifamily Luxury', 'Life Sciences'];
  const breakdown = assetClasses.map(cls => {
    const matching = properties.filter(p => p.assetClass === cls);
    const value = matching.reduce((acc, p) => acc + p.currentValuation, 0);
    const pct = (value / totalValuation) * 100;
    return {
      class: cls,
      value,
      pct,
      count: matching.length
    };
  });

  const filteredProperties = selectedAssetClass === 'All'
    ? properties
    : properties.filter(p => p.assetClass === selectedAssetClass);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Executive Command Banner */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '1.5rem 1.75rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'linear-gradient(135deg, rgba(16, 22, 36, 0.85) 0%, rgba(14, 30, 48, 0.65) 100%)',
          borderLeft: '4px solid var(--accent-cyan)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-cyan">FUND PORTFOLIO INTELLIGENCE</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Updated 3m ago • SEC & GRESB Compliant</span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Global Core Flagship Portfolio IV
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Active oversight of 4 Tier-1 Trophy Assets across NYC, Miami, Denver, and Boston bio-clusters.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
              Gross Asset Value (GAV)
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.85rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              {formatCurrency(totalValuation, currency)}
            </div>
          </div>
          <div style={{ width: '1px', height: '40px', background: 'var(--border-subtle)' }}></div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
              Annual Portfolio NOI
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.85rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
              {formatCurrency(totalNoi, currency)}
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Ribbon */}
      <div className="kpi-grid">
        <div className="glass-panel kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Wtd. Avg Cap Rate</span>
            <div className="kpi-icon-wrap" style={{ color: 'var(--accent-cyan)' }}><Percent size={15} /></div>
          </div>
          <div className="kpi-value">{avgCapRate.toFixed(2)}%</div>
          <div className="kpi-footer">
            <span className="macro-badge-pos" style={{ display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
              <TrendingUp size={12} /> +18 bps
            </span>
            <span>vs market benchmark</span>
          </div>
        </div>

        <div className="glass-panel kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Physical Occupancy</span>
            <div className="kpi-icon-wrap" style={{ color: 'var(--accent-emerald)' }}><Building2 size={15} /></div>
          </div>
          <div className="kpi-value">{avgOccupancy.toFixed(1)}%</div>
          <div className="kpi-footer">
            <span className="badge badge-emerald" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>Stabilized</span>
            <span>98.6% Financial Occupancy</span>
          </div>
        </div>

        <div className="glass-panel kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">WALT (Lease Term)</span>
            <div className="kpi-icon-wrap" style={{ color: 'var(--accent-purple)' }}><Clock size={15} /></div>
          </div>
          <div className="kpi-value">{avgWalt.toFixed(1)} Yrs</div>
          <div className="kpi-footer">
            <span style={{ color: 'var(--text-secondary)' }}>Defensive institutional roll</span>
          </div>
        </div>

        <div className="glass-panel kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Portfolio LTV</span>
            <div className="kpi-icon-wrap" style={{ color: 'var(--accent-amber)' }}><ShieldCheck size={15} /></div>
          </div>
          <div className="kpi-value">{portfolioLtv.toFixed(1)}%</div>
          <div className="kpi-footer">
            <span style={{ color: 'var(--text-secondary)' }}>Debt: {formatCurrency(totalDebt, currency, true)}</span>
          </div>
        </div>

        <div className="glass-panel kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">DSCR Coverage</span>
            <div className="kpi-icon-wrap" style={{ color: 'var(--accent-emerald)' }}><Activity size={15} /></div>
          </div>
          <div className="kpi-value">{avgDscr.toFixed(2)}x</div>
          <div className="kpi-footer">
            <span className="macro-badge-pos" style={{ fontWeight: 600 }}>Buffer: +0.85x</span>
            <span>over 1.35x covenant</span>
          </div>
        </div>

        <div className="glass-panel kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">GRESB ESG Score</span>
            <div className="kpi-icon-wrap" style={{ color: '#10B981' }}><Zap size={15} /></div>
          </div>
          <div className="kpi-value">{avgGresb} / 100</div>
          <div className="kpi-footer">
            <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>5-Star Benchmark</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Asset Allocation & Geographic Diversification */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Asset Class Allocation Bar Card */}
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>Sector Allocation & Diversification</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: 4-Core Sectors</span>
          </div>

          <div style={{ display: 'flex', height: '14px', borderRadius: '6px', overflow: 'hidden', marginBottom: '1.25rem', background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ width: `${breakdown[0].pct}%`, background: 'var(--accent-cyan)' }} title={`Commercial Office: ${breakdown[0].pct.toFixed(1)}%`} />
            <div style={{ width: `${breakdown[1].pct}%`, background: 'var(--accent-amber)' }} title={`Industrial: ${breakdown[1].pct.toFixed(1)}%`} />
            <div style={{ width: `${breakdown[2].pct}%`, background: 'var(--accent-purple)' }} title={`Multifamily: ${breakdown[2].pct.toFixed(1)}%`} />
            <div style={{ width: `${breakdown[3].pct}%`, background: 'var(--accent-emerald)' }} title={`Life Sciences: ${breakdown[3].pct.toFixed(1)}%`} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {breakdown.map((item, idx) => {
              const colors = ['var(--accent-cyan)', 'var(--accent-amber)', 'var(--accent-purple)', 'var(--accent-emerald)'];
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors[idx] }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{item.class}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatCurrency(item.value, currency, true)}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', width: '45px', textAlign: 'right' }}>
                      {item.pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real Estate Yield & Performance Chart */}
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>5-Year Historical NOI & Cash Flow</h3>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Net Operating Income Compound Annual Growth Rate: +6.8%</div>
            </div>
            <span className="badge badge-emerald">+24.2% Since Inception</span>
          </div>

          {/* SVG Trend Chart */}
          <div style={{ width: '100%', height: '140px' }}>
            <svg viewBox="0 0 500 140" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="noiGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="var(--border-subtle)" strokeDasharray="3 3" />
              <line x1="0" y1="60" x2="500" y2="60" stroke="var(--border-subtle)" strokeDasharray="3 3" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="var(--border-subtle)" strokeDasharray="3 3" />
              
              {/* Area */}
              <polygon 
                points="30,110 120,95 210,80 300,55 390,40 480,25 480,130 30,130" 
                fill="url(#noiGradient)" 
              />
              {/* Line */}
              <polyline 
                points="30,110 120,95 210,80 300,55 390,40 480,25" 
                fill="none" 
                stroke="#10B981" 
                strokeWidth="3" 
                strokeLinecap="round" 
              />
              {/* Data points */}
              {[
                { x: 30, y: 110, val: '$118M', yr: '2021' },
                { x: 120, y: 95, val: '$126M', yr: '2022' },
                { x: 210, y: 80, val: '$134M', yr: '2023' },
                { x: 300, y: 55, val: '$148M', yr: '2024' },
                { x: 390, y: 40, val: '$155M', yr: '2025' },
                { x: 480, y: 25, val: '$160M', yr: '2026' }
              ].map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r="4" fill="#080B11" stroke="#10B981" strokeWidth="2.5" />
                  <text x={pt.x} y={pt.y - 8} textAnchor="middle" fill="var(--text-secondary)" fontSize="10" fontFamily="var(--font-mono)">
                    {pt.val}
                  </text>
                  <text x={pt.x} y="138" textAnchor="middle" fill="var(--text-dim)" fontSize="10" fontFamily="var(--font-mono)">
                    {pt.yr}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* Asset Filter & View Mode Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={13} /> Filter Sector:
          </span>
          {['All', ...assetClasses].map(cls => (
            <button
              key={cls}
              onClick={() => setSelectedAssetClass(cls)}
              className={`btn btn-sm ${selectedAssetClass === cls ? 'btn-cyan' : 'btn-secondary'}`}
              style={{ fontSize: '0.76rem' }}
            >
              {cls}
            </button>
          ))}
        </div>

        {/* View Switcher: Grid, Map, Table */}
        <div style={{ display: 'flex', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '2px' }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              background: viewMode === 'grid' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              color: viewMode === 'grid' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '4px',
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Layers size={13} /> Grid Showcase
          </button>
          <button
            onClick={() => setViewMode('map')}
            style={{
              background: viewMode === 'map' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              color: viewMode === 'map' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '4px',
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Compass size={13} /> Submarket Radar
          </button>
          <button
            onClick={() => setViewMode('table')}
            style={{
              background: viewMode === 'table' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              color: viewMode === 'table' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '4px',
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Building2 size={13} /> Financial Ledger
          </button>
        </div>
      </div>

      {/* View Mode 1: Grid Showcase */}
      {viewMode === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
          {filteredProperties.map(property => (
            <div 
              key={property.id} 
              className="glass-panel" 
              style={{ overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s ease, border-color 0.2s ease' }}
              onClick={() => onSelectProperty(property.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = 'var(--border-glow)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              {/* Asset Hero Image & Badges */}
              <div style={{ position: 'relative', height: '220px', width: '100%', overflow: 'hidden' }}>
                <img 
                  src={property.imageUrl} 
                  alt={property.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(8,11,17,0.85) 100%)' }} />
                
                <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '0.4rem' }}>
                  <span className="badge badge-cyan">{property.assetClass}</span>
                  <span className="badge badge-emerald">{property.riskProfile}</span>
                </div>

                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', color: '#FFF' }}>
                    LEED {property.leedCertification}
                  </span>
                </div>

                <div style={{ position: 'absolute', bottom: '12px', left: '16px', right: '16px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} /> {property.city}, {property.state} • {property.code}
                  </div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
                    {property.name}
                  </h2>
                </div>
              </div>

              {/* Property Snapshot Body */}
              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Valuation</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                      {formatCurrency(property.currentValuation, currency, true)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cap Rate</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.98rem', color: 'var(--accent-emerald)' }}>
                      {property.capRate.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Occupancy</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.98rem', color: 'var(--accent-cyan)' }}>
                      {property.physicalOccupancy.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Secondary Specs */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  <span>{formatSqFt(property.rentableSqFt)}</span>
                  <span>{property.floorsCount} Stories</span>
                  <span>WALT: {property.waltYears} Yrs</span>
                  <span>DSCR: {property.debtServiceCoverageRatio.toFixed(2)}x</span>
                </div>

                {/* Key Anchor Tenants */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Anchor Credit Tenants ({property.tenants.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {property.tenants.slice(0, 3).map((tenant, idx) => (
                      <span 
                        key={idx} 
                        style={{ 
                          fontSize: '0.72rem', 
                          padding: '0.2rem 0.5rem', 
                          borderRadius: '4px', 
                          background: 'rgba(255,255,255,0.04)', 
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {tenant.name.split(' ')[0]} ({tenant.creditRating})
                      </span>
                    ))}
                    {property.tenants.length > 3 && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                        +{property.tenants.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Action button */}
                <button 
                  className="btn btn-secondary" 
                  style={{ width: '100%', justifyContent: 'space-between' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectProperty(property.id);
                  }}
                >
                  <span>Launch Asset Stacking Twin</span>
                  <ArrowUpRight size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Mode 2: Submarket Radar / GIS Explorer */}
      {viewMode === 'map' && (
        <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>GIS Geographic Concentration Radar</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Targeting Top Tier-1 Gateway Metros: New York Tri-State, South Florida Corridor, Mountain Logistics Hub, Cambridge Kendall Square.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span className="badge badge-emerald">4 Active Coordinates</span>
              <span className="badge badge-cyan">Zero Flood Plain Hazard</span>
            </div>
          </div>

          {/* Interactive Radar Map Surface */}
          <div 
            style={{ 
              width: '100%', 
              height: '420px', 
              borderRadius: 'var(--radius-lg)', 
              background: 'radial-gradient(circle at center, #111B2E 0%, #080B11 100%)',
              border: '1px solid var(--border-subtle)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Grid Coordinates Overlay */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(56, 189, 248, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            
            {/* Concentric radar rings */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '320px', height: '320px', border: '1px solid rgba(56, 189, 248, 0.1)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '560px', height: '560px', border: '1px solid rgba(56, 189, 248, 0.06)', borderRadius: '50%' }} />

            {/* Simulated US Map Silhouette Nodes */}
            {[
              { id: 'prop-1', name: 'The Horizon Spire', city: 'New York, NY', top: '38%', left: '78%', class: 'Office', val: '$1.45B' },
              { id: 'prop-2', name: 'Apex Logistics Hub', city: 'Denver, CO', top: '48%', left: '42%', class: 'Logistics', val: '$485M' },
              { id: 'prop-3', name: 'Aurora Biscayne Tower', city: 'Miami, FL', top: '78%', left: '76%', class: 'Multifamily', val: '$380M' },
              { id: 'prop-4', name: 'Vertex Bio-Innovation', city: 'Cambridge, MA', top: '32%', left: '84%', class: 'Life Sciences', val: '$620M' },
            ].map(pin => (
              <div 
                key={pin.id}
                onClick={() => onSelectProperty(pin.id)}
                style={{ 
                  position: 'absolute', 
                  top: pin.top, 
                  left: pin.left, 
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                  zIndex: 10
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    borderRadius: '50%', 
                    background: 'var(--accent-cyan)', 
                    boxShadow: '0 0 16px var(--accent-cyan)',
                    border: '3px solid #080B11'
                  }} />
                  <div 
                    style={{ 
                      marginTop: '6px', 
                      background: 'rgba(14, 20, 32, 0.92)', 
                      backdropFilter: 'blur(8px)',
                      padding: '0.35rem 0.65rem', 
                      borderRadius: '6px', 
                      border: '1px solid var(--border-medium)',
                      whiteSpace: 'nowrap',
                      textAlign: 'center',
                      boxShadow: 'var(--shadow-md)'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#FFF' }}>{pin.name}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                      {pin.city} • {pin.val}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View Mode 3: High Density Financial Ledger */}
      {viewMode === 'table' && (
        <div className="glass-panel table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset Code & Name</th>
                <th>Asset Class</th>
                <th>City & Metro</th>
                <th>Valuation</th>
                <th>RSF</th>
                <th>In-Place NOI</th>
                <th>Cap Rate</th>
                <th>Occupancy</th>
                <th>WALT</th>
                <th>DSCR</th>
                <th>ESG</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map(property => (
                <tr key={property.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{property.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{property.code} • Built {property.yearBuilt}</div>
                  </td>
                  <td>
                    <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{property.assetClass}</span>
                  </td>
                  <td>{property.city}, {property.state}</td>
                  <td className="font-mono" style={{ fontWeight: 700 }}>{formatCurrency(property.currentValuation, currency)}</td>
                  <td className="font-mono">{property.rentableSqFt.toLocaleString()}</td>
                  <td className="font-mono" style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                    {formatCurrency(property.netOperatingIncome, currency)}
                  </td>
                  <td className="font-mono" style={{ fontWeight: 600 }}>{property.capRate.toFixed(2)}%</td>
                  <td className="font-mono">{property.physicalOccupancy.toFixed(1)}%</td>
                  <td className="font-mono">{property.waltYears.toFixed(1)} yrs</td>
                  <td className="font-mono">{property.debtServiceCoverageRatio.toFixed(2)}x</td>
                  <td>
                    <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>{property.gresbScore} / 100</span>
                  </td>
                  <td>
                    <button 
                      onClick={() => onSelectProperty(property.id)}
                      className="btn btn-secondary btn-sm"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
