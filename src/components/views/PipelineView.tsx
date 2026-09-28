import React, { useState } from 'react';
import { 
  GitPullRequest, 
  Sparkles, 
  MapPin, 
  ArrowRight, 
  CheckCircle, 
  Plus, 
  Search, 
  Building2, 
  Scale, 
  TrendingUp,
  SlidersHorizontal,
  Layers
} from 'lucide-react';
import { DealPipelineItem, ComparableSale } from '../../types/realEstate';
import { CurrencyCode, formatCurrency, formatPercent } from '../../utils/financialModels';

interface PipelineViewProps {
  pipeline: DealPipelineItem[];
  comps: ComparableSale[];
  currency: CurrencyCode;
  onAdvanceDeal: (dealId: string) => void;
  onOpenNewDealModal: () => void;
  onSendToUnderwriter: (deal: DealPipelineItem) => void;
}

const STAGES: DealPipelineItem['stage'][] = [
  'Sourced',
  'Underwriting',
  'LOI Submitted',
  'Due Diligence',
  'IC Approval',
  'Closed'
];

export const PipelineView: React.FC<PipelineViewProps> = ({
  pipeline,
  comps,
  currency,
  onAdvanceDeal,
  onOpenNewDealModal,
  onSendToUnderwriter
}) => {
  const [activeTab, setActiveTab] = useState<'kanban' | 'comps'>('kanban');
  const [selectedCompMetric, setSelectedCompMetric] = useState<'pricePerSqFt' | 'capRate'>('pricePerSqFt');

  const totalPipelineVolume = pipeline.reduce((acc, d) => acc + d.askingPrice, 0);

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
          borderLeft: '4px solid var(--accent-purple)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-purple">DEAL SOURCING & AVM ENGINE</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>AI-Scored Inbound Pipeline • Submarket Comps Database</span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Acquisition Pipeline & Comps Engine</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Track live broker opportunities from Sourced through Investment Committee (IC) sanction to closing.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Active Pipeline Volume</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-purple)' }}>
              {formatCurrency(totalPipelineVolume, currency, true)}
            </div>
          </div>
          <button onClick={onOpenNewDealModal} className="btn btn-primary">
            <Plus size={15} /> Ingest New Deal
          </button>
        </div>
      </div>

      {/* View Switcher Strip */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.25rem' }}>
        <button
          onClick={() => setActiveTab('kanban')}
          className={`btn btn-sm ${activeTab === 'kanban' ? 'btn-cyan' : 'btn-secondary'}`}
        >
          <GitPullRequest size={14} /> Pipeline Kanban ({pipeline.length} Deals)
        </button>
        <button
          onClick={() => setActiveTab('comps')}
          className={`btn btn-sm ${activeTab === 'comps' ? 'btn-cyan' : 'btn-secondary'}`}
        >
          <Scale size={14} /> Comparable Sales Database ({comps.length} Comps)
        </button>
      </div>

      {/* Tab 1: Kanban Board */}
      {activeTab === 'kanban' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', alignItems: 'start' }}>
          {STAGES.map(stage => {
            const stageDeals = pipeline.filter(d => d.stage === stage);
            const stageTotal = stageDeals.reduce((acc, d) => acc + d.askingPrice, 0);

            return (
              <div 
                key={stage} 
                style={{ 
                  background: 'rgba(14, 20, 32, 0.5)', 
                  border: '1px solid var(--border-subtle)', 
                  borderRadius: 'var(--radius-lg)', 
                  padding: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  minHeight: '480px'
                }}
              >
                {/* Stage Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>{stage}</span>
                    <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)' }}>
                      {stageDeals.length}
                    </span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {formatCurrency(stageTotal, currency, true)}
                  </div>
                </div>

                {/* Stage Deal Cards */}
                {stageDeals.map(deal => (
                  <div 
                    key={deal.id}
                    className="glass-panel"
                    style={{ padding: '0.95rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className="badge badge-purple" style={{ fontSize: '0.62rem' }}>{deal.assetClass}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        <Sparkles size={11} /> AI Score: {deal.aiDealScore}
                      </div>
                    </div>

                    <div>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                        {deal.propertyName}
                      </h4>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                        <MapPin size={11} /> {deal.city} • Broker: {deal.broker}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px' }}>
                      <div>
                        <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Asking Price</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.84rem' }}>
                          {formatCurrency(deal.askingPrice, currency, true)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Proj. Levered IRR</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.84rem', color: 'var(--accent-emerald)' }}>
                          {deal.projectedIrr}%
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.3 }}>
                      "{deal.keyCatalyst}"
                    </div>

                    {/* Quick Card Actions */}
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                      <button
                        onClick={() => onSendToUnderwriter(deal)}
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1, fontSize: '0.7rem', padding: '0.25rem' }}
                      >
                        Model DCF
                      </button>
                      <button
                        onClick={() => onAdvanceDeal(deal.id)}
                        className="btn btn-cyan btn-sm"
                        style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                        title="Advance deal to next stage"
                      >
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Comparable Sales Database */}
      {activeTab === 'comps' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Automated Valuation & Market Comps Engine</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Verified institutional transactions, adjusted price/sqft, and similarity distance weighting
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button 
                onClick={() => setSelectedCompMetric('pricePerSqFt')}
                className={`btn btn-sm ${selectedCompMetric === 'pricePerSqFt' ? 'btn-cyan' : 'btn-secondary'}`}
              >
                Sort: $/RSF
              </button>
              <button 
                onClick={() => setSelectedCompMetric('capRate')}
                className={`btn btn-sm ${selectedCompMetric === 'capRate' ? 'btn-cyan' : 'btn-secondary'}`}
              >
                Sort: Cap Rate
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Comparable Property</th>
                  <th>Sale Date</th>
                  <th>Sale Price</th>
                  <th>RSF</th>
                  <th>Price / RSF</th>
                  <th>Cap Rate</th>
                  <th>Distance</th>
                  <th>Similarity Match</th>
                  <th>Institutional Buyer</th>
                </tr>
              </thead>
              <tbody>
                {comps.map(comp => (
                  <tr key={comp.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{comp.propertyName}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{comp.address}</div>
                    </td>
                    <td className="font-mono">{comp.saleDate}</td>
                    <td className="font-mono" style={{ fontWeight: 700 }}>{formatCurrency(comp.salePrice, currency, true)}</td>
                    <td className="font-mono">{comp.sqFt.toLocaleString()}</td>
                    <td className="font-mono" style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      ${comp.pricePerSqFt} / RSF
                    </td>
                    <td className="font-mono" style={{ fontWeight: 600 }}>{comp.capRate.toFixed(2)}%</td>
                    <td style={{ fontSize: '0.76rem' }}>{comp.distanceMiles} miles</td>
                    <td>
                      <span className="badge badge-emerald">{comp.similarityScore}% Match</span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{comp.buyer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
