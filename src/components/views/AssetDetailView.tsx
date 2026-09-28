import React, { useState } from 'react';
import { 
  Building, 
  MapPin, 
  Calendar, 
  Layers, 
  ShieldCheck, 
  Zap, 
  AlertCircle, 
  FileText, 
  Activity, 
  DollarSign, 
  Wrench, 
  Thermometer, 
  Droplet, 
  Wind, 
  CheckCircle, 
  ExternalLink,
  Info
} from 'lucide-react';
import { Property, Tenant, StackingUnit } from '../../types/realEstate';
import { CurrencyCode, formatCurrency, formatPercent, formatSqFt } from '../../utils/financialModels';

interface AssetDetailViewProps {
  properties: Property[];
  selectedPropertyId: string;
  onSelectPropertyId: (id: string) => void;
  currency: CurrencyCode;
  onOpenTenantModal: (tenant: Tenant) => void;
}

export const AssetDetailView: React.FC<AssetDetailViewProps> = ({
  properties,
  selectedPropertyId,
  onSelectPropertyId,
  currency,
  onOpenTenantModal
}) => {
  const property = properties.find(p => p.id === selectedPropertyId) || properties[0];
  const [activeTab, setActiveTab] = useState<'stacking' | 'rentroll' | 'telemetry' | 'capex'>('stacking');
  const [selectedFloorUnit, setSelectedFloorUnit] = useState<StackingUnit | null>(property.stackingPlan[0] || null);

  // Rollover analysis (grouping tenant sqft expiry by year)
  const expirationTimeline = [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036];
  const rolloverData = expirationTimeline.map(year => {
    const expiredTenants = property.tenants.filter(t => new Date(t.leaseExpiryDate).getFullYear() === year);
    const expiringSqFt = expiredTenants.reduce((acc, t) => acc + t.leasedSqFt, 0);
    const pct = property.rentableSqFt > 0 ? (expiringSqFt / property.rentableSqFt) * 100 : 0;
    return { year, expiringSqFt, pct, count: expiredTenants.length };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Property Selector Strip */}
      <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {properties.map(p => {
          const isSelected = p.id === property.id;
          return (
            <button
              key={p.id}
              onClick={() => {
                onSelectPropertyId(p.id);
                setSelectedFloorUnit(p.stackingPlan[0] || null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6rem 1rem',
                borderRadius: 'var(--radius-lg)',
                background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-card)',
                border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <div style={{ width: '28px', height: '28px', borderRadius: '4px', overflow: 'hidden' }}>
                <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>{p.name}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{p.city} • {p.assetClass}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Property Hero Master Panel */}
      <div 
        className="glass-panel" 
        style={{ 
          position: 'relative', 
          overflow: 'hidden', 
          borderRadius: 'var(--radius-xl)',
          minHeight: '280px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '2rem'
        }}
      >
        <img 
          src={property.imageUrl} 
          alt={property.name} 
          style={{ 
            position: 'absolute', 
            inset: 0, 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover', 
            zIndex: 0,
            filter: 'brightness(0.38) contrast(1.1)'
          }} 
        />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-cyan">{property.assetClass}</span>
              <span className="badge badge-emerald">Risk: {property.riskProfile}</span>
              <span className="badge badge-purple">LEED {property.leedCertification}</span>
              <span className="badge badge-amber">GRESB: {property.gresbScore}/100</span>
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {property.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem', color: '#CBD5E1', fontSize: '0.88rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={15} style={{ color: 'var(--accent-cyan)' }} /> {property.address}, {property.city}, {property.state}
              </span>
              <span>•</span>
              <span>Year Built: {property.yearBuilt}</span>
              <span>•</span>
              <span>Code: {property.code}</span>
            </div>
          </div>

          {/* Quick Valuation Block */}
          <div style={{ display: 'flex', gap: '1.5rem', background: 'rgba(8, 11, 17, 0.85)', backdropFilter: 'blur(12px)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-medium)' }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Valuation</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                {formatCurrency(property.currentValuation, currency)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)' }}>Acquired: {formatCurrency(property.acquisitionPrice, currency, true)}</div>
            </div>
            <div style={{ width: '1px', background: 'var(--border-subtle)' }} />
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Annual NOI</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                {formatCurrency(property.netOperatingIncome, currency)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Cap: {property.capRate.toFixed(2)}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Property Vital Stats Bar */}
      <div className="kpi-grid">
        <div className="glass-panel kpi-card">
          <div className="kpi-header"><span className="kpi-title">Rentable Area</span><Layers size={15} /></div>
          <div className="kpi-value">{property.rentableSqFt.toLocaleString()}</div>
          <div className="kpi-footer"><span>Gross: {property.grossSqFt.toLocaleString()} RSF</span></div>
        </div>
        <div className="glass-panel kpi-card">
          <div className="kpi-header"><span className="kpi-title">Physical Occupancy</span><Building size={15} /></div>
          <div className="kpi-value">{property.physicalOccupancy.toFixed(1)}%</div>
          <div className="kpi-footer"><span className="badge badge-emerald">Fin: {property.financialOccupancy.toFixed(1)}%</span></div>
        </div>
        <div className="glass-panel kpi-card">
          <div className="kpi-header"><span className="kpi-title">WALT (Lease Roll)</span><Calendar size={15} /></div>
          <div className="kpi-value">{property.waltYears} Yrs</div>
          <div className="kpi-footer"><span>{property.tenants.length} Master Leases</span></div>
        </div>
        <div className="glass-panel kpi-card">
          <div className="kpi-header"><span className="kpi-title">Debt Balance</span><DollarSign size={15} /></div>
          <div className="kpi-value">{formatCurrency(property.debtBalance, currency, true)}</div>
          <div className="kpi-footer"><span>LTV: {property.loanToValue.toFixed(1)}%</span></div>
        </div>
        <div className="glass-panel kpi-card">
          <div className="kpi-header"><span className="kpi-title">Debt Service Coverage</span><Activity size={15} /></div>
          <div className="kpi-value">{property.debtServiceCoverageRatio.toFixed(2)}x</div>
          <div className="kpi-footer"><span className="badge badge-cyan">Compliant</span></div>
        </div>
        <div className="glass-panel kpi-card">
          <div className="kpi-header"><span className="kpi-title">Underwritten Levered IRR</span><ShieldCheck size={15} /></div>
          <div className="kpi-value">{property.leveredIrr.toFixed(1)}%</div>
          <div className="kpi-footer"><span className="macro-badge-pos">{property.equityMultiple.toFixed(2)}x Multiple</span></div>
        </div>
      </div>

      {/* Detail Sub-Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.25rem' }}>
        {[
          { id: 'stacking', label: 'Interactive Building Stacking Plan', icon: Layers },
          { id: 'rentroll', label: `Rent Roll & Tenant Stack (${property.tenants.length})`, icon: FileText },
          { id: 'telemetry', label: 'IoT Digital Twin & Live Building Telemetry', icon: Zap },
          { id: 'capex', label: `CapEx Plan & Reserves (${property.capexProjects.length})`, icon: Wrench },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`btn btn-sm ${isActive ? 'btn-cyan' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem' }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Interactive Stacking Plan */}
      {activeTab === 'stacking' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Vertical Stacking Plan Floor List */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '0.96rem', fontWeight: 700 }}>Vertical Cross-Section Stacking</h3>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Click floor to inspect tenant footprint, rent $/sqft & expiry</div>
              </div>
              <span className="badge badge-cyan">{property.stackingPlan.length} Tier Slices</span>
            </div>

            <div className="stacking-plan-wrapper">
              {property.stackingPlan.map((floor, idx) => {
                const isSelected = selectedFloorUnit?.floorNumber === floor.floorNumber;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedFloorUnit(floor)}
                    className={`stacking-floor-row ${floor.isVacant ? 'vacant' : ''}`}
                    style={{
                      borderLeftColor: floor.tenantColor,
                      background: isSelected ? 'rgba(56, 189, 248, 0.12)' : undefined,
                      border: isSelected ? '1px solid var(--accent-cyan)' : undefined,
                      borderLeftWidth: '5px'
                    }}
                  >
                    <div style={{ width: '45px', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      FL {floor.floorNumber}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.84rem' }}>{floor.tenantName}</span>
                        {floor.isVacant && <span className="badge badge-rose" style={{ fontSize: '0.6rem' }}>VACANT</span>}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        {floor.floorLabel} • {floor.useType}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.82rem' }}>
                        ${floor.annualRentPerSqFt} / RSF
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        Roll: {floor.leaseExpiryYear}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stacking Detail Card */}
          {selectedFloorUnit && (
            <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: `4px solid ${selectedFloorUnit.tenantColor}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span className="badge badge-cyan">FLOOR UNIT DOSSIER</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Level {selectedFloorUnit.floorNumber}
                </span>
              </div>

              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {selectedFloorUnit.tenantName}
              </h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                {selectedFloorUnit.floorLabel} • {selectedFloorUnit.useType}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'var(--bg-input)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Leased Space</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem' }}>
                    {selectedFloorUnit.occupiedSqFt.toLocaleString()} RSF
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Tier: {selectedFloorUnit.totalSqFt.toLocaleString()} RSF</div>
                </div>

                <div style={{ background: 'var(--bg-input)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Annual Rent Rate</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-emerald)' }}>
                    ${selectedFloorUnit.annualRentPerSqFt} / RSF
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Annual: {formatCurrency(selectedFloorUnit.occupiedSqFt * selectedFloorUnit.annualRentPerSqFt, currency)}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-input)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Lease Expiration</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-cyan)' }}>
                    {selectedFloorUnit.leaseExpiryYear}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {selectedFloorUnit.leaseExpiryYear - 2026} Years Remaining
                  </div>
                </div>

                <div style={{ background: 'var(--bg-input)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Occupancy Status</div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: selectedFloorUnit.isVacant ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                    {selectedFloorUnit.isVacant ? 'Vacant Shell' : '100% Occupied'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Commercial Sublease Allowed</div>
                </div>
              </div>

              {/* Lease Roll Expiration Wall Preview */}
              <div>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  Portfolio-Wide Expiration Timeline (2026 - 2036)
                </h4>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '90px', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                  {rolloverData.map((d, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                      <div 
                        style={{ 
                          width: '100%', 
                          height: `${Math.max(8, d.pct * 2)}%`, 
                          background: d.pct > 20 ? 'var(--accent-rose)' : d.pct > 0 ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.06)',
                          borderRadius: '2px',
                          transition: 'height 0.3s ease'
                        }}
                        title={`${d.year}: ${d.expiringSqFt.toLocaleString()} RSF (${d.pct.toFixed(1)}%)`}
                      />
                      <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '4px' }}>
                        '{String(d.year).slice(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Rent Roll & Tenant Stack */}
      {activeTab === 'rentroll' && (
        <div className="glass-panel table-container">
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '0.96rem', fontWeight: 700 }}>Institutional Rent Roll & Tenant Directory</h3>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Underlying credit ratings, annual escalators, security deposits, and renewal terms</div>
            </div>
            <span className="badge badge-emerald">{property.tenants.length} Active Master Leases</span>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Tenant Name & Industry</th>
                <th>Credit</th>
                <th>Leased RSF</th>
                <th>Base Rent / RSF</th>
                <th>Annual Base Rent</th>
                <th>Escalation Clause</th>
                <th>Lease Expiry</th>
                <th>Deposit</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {property.tenants.map(tenant => (
                <tr key={tenant.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{tenant.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{tenant.floor} • {tenant.industry}</div>
                  </td>
                  <td>
                    <span 
                      style={{ 
                        fontFamily: 'var(--font-mono)', 
                        fontWeight: 700, 
                        fontSize: '0.75rem',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '4px',
                        background: tenant.creditRating.startsWith('A') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: tenant.creditRating.startsWith('A') ? 'var(--accent-emerald)' : 'var(--accent-amber)'
                      }}
                    >
                      {tenant.creditRating}
                    </span>
                  </td>
                  <td className="font-mono">{tenant.leasedSqFt.toLocaleString()}</td>
                  <td className="font-mono" style={{ fontWeight: 600 }}>${tenant.rentPerSqFt}</td>
                  <td className="font-mono" style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>
                    {formatCurrency(tenant.annualRent, currency)}
                  </td>
                  <td style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>{tenant.escalationType}</td>
                  <td className="font-mono">{tenant.leaseExpiryDate}</td>
                  <td style={{ fontSize: '0.76rem' }}>{tenant.securityDepositMonths} Mo LOC</td>
                  <td>
                    <span className={`badge ${tenant.status === 'Current' ? 'badge-emerald' : tenant.status === 'In Renewal' ? 'badge-cyan' : 'badge-amber'}`}>
                      {tenant.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => onOpenTenantModal(tenant)}
                      className="btn btn-secondary btn-sm"
                    >
                      View Lease
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: IoT Digital Twin & Telemetry */}
      {activeTab === 'telemetry' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="telemetry-pulse" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Real-Time Building Telemetry & BAS Gateway</h3>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Connected to Honeywell Niagara / Johnson Controls Metasys BMS via BACnet/IP
                </div>
              </div>
              <span className="badge badge-emerald">BMS Status: Online (Latency 14ms)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--accent-amber)', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-muted)' }}>Power Consumption</span>
                  <Zap size={16} />
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 700 }}>
                  {property.telemetry.powerDrawKw.toLocaleString()} kW
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>
                  Peak: 2,400 kW • Off-Peak Tariff Active
                </div>
              </div>

              <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-muted)' }}>HVAC Chiller COP / Eff.</span>
                  <Thermometer size={16} />
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 700 }}>
                  {property.telemetry.hvacEfficiencyPct}%
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>
                  AI Variable Frequency Drive Optimized
                </div>
              </div>

              <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#38BDF8', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-muted)' }}>Daily Water Usage</span>
                  <Droplet size={16} />
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 700 }}>
                  {property.telemetry.waterUsageGalDay.toLocaleString()} gal
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Greywater recycling active (35% reused)
                </div>
              </div>

              <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--accent-emerald)', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-muted)' }}>Indoor Air Quality (AQI)</span>
                  <Wind size={16} />
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 700 }}>
                  {property.telemetry.indoorAirQualityAqi} AQI
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>
                  MERV 16 Filtration • CO2: 440 ppm (Excellent)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: CapEx Plan & Reserves */}
      {activeTab === 'capex' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>5-Year Capital Improvement Plan (CapEx)</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Approved structural, MEP, sustainability, and tenant enhancement capital reserves
              </div>
            </div>
            <button className="btn btn-primary btn-sm">+ Propose CapEx Item</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {property.capexProjects.map(project => (
              <div key={project.id} style={{ background: 'var(--bg-input)', padding: '1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="badge badge-purple">{project.category}</span>
                  <span className={`badge ${project.status === 'Completed' ? 'badge-emerald' : project.status === 'In Progress' ? 'badge-cyan' : 'badge-amber'}`}>
                    {project.status}
                  </span>
                </div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  {project.title}
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Budget Estimate</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--accent-emerald)' }}>
                      {formatCurrency(project.estimatedCost, currency)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Target Year</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.95rem' }}>
                      {project.scheduledYear}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
