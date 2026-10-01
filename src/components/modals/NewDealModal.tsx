import React, { useState } from 'react';
import { X, Building2, DollarSign, Percent, MapPin, Check } from 'lucide-react';
import { AssetClass, DealPipelineItem } from '../../types/realEstate';
import { CurrencyCode } from '../../utils/financialModels';

interface NewDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDeal: (deal: DealPipelineItem) => void;
  currency: CurrencyCode;
}

export const NewDealModal: React.FC<NewDealModalProps> = ({
  isOpen,
  onClose,
  onAddDeal,
  currency
}) => {
  const [propertyName, setPropertyName] = useState('');
  const [city, setCity] = useState('');
  const [assetClass, setAssetClass] = useState<AssetClass>('Commercial Office');
  const [askingPrice, setAskingPrice] = useState(150000000);
  const [sqFt, setSqFt] = useState(450000);
  const [projectedNoi, setProjectedNoi] = useState(8700000);
  const [keyCatalyst, setKeyCatalyst] = useState('');
  const [broker, setBroker] = useState('CBRE Capital Markets');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyName || !city) return;

    const projectedCapRate = (projectedNoi / askingPrice) * 100;
    const projectedIrr = projectedCapRate + 11.5; // Quantitative heuristic

    const newDeal: DealPipelineItem = {
      id: `deal-${Date.now()}`,
      propertyName,
      city,
      assetClass,
      stage: 'Underwriting',
      askingPrice,
      projectedNoi,
      projectedCapRate: Math.round(projectedCapRate * 10) / 10,
      projectedIrr: Math.round(projectedIrr * 10) / 10,
      sqFt,
      aiDealScore: Math.floor(Math.random() * 15) + 82, // 82 - 97
      keyCatalyst: keyCatalyst || 'Prime transit-oriented infill asset with in-place rent upside and capital refresh.',
      targetClosingDate: '2026-12-15',
      broker,
      discountToReplacementCost: 15
    };

    onAddDeal(newDeal);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '580px', padding: '1.75rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <div>
            <span className="badge badge-purple" style={{ marginBottom: '0.25rem' }}>ACQUISITION DESK</span>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Ingest New Deal & Underwrite</h2>
          </div>
          <button onClick={onClose} className="btn-ghost btn-sm"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
              Property / Asset Name
            </label>
            <input 
              type="text" 
              required
              placeholder="e.g. 500 South Michigan Avenue"
              value={propertyName}
              onChange={(e) => setPropertyName(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.88rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                City & State
              </label>
              <input 
                type="text" 
                required
                placeholder="e.g. Chicago, IL"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.88rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                Asset Class
              </label>
              <select 
                value={assetClass}
                onChange={(e) => setAssetClass(e.target.value as AssetClass)}
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.88rem' }}
              >
                <option value="Commercial Office">Commercial Office</option>
                <option value="Industrial Logistics">Industrial Logistics</option>
                <option value="Multifamily Luxury">Multifamily Luxury</option>
                <option value="Life Sciences">Life Sciences</option>
                <option value="Mixed-Use Retail">Mixed-Use Retail</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                Asking Price ($)
              </label>
              <input 
                type="number" 
                step="5000000"
                value={askingPrice}
                onChange={(e) => setAskingPrice(Number(e.target.value))}
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                Rentable Area (RSF)
              </label>
              <input 
                type="number" 
                step="10000"
                value={sqFt}
                onChange={(e) => setSqFt(Number(e.target.value))}
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                In-Place / Proj. NOI ($)
              </label>
              <input 
                type="number" 
                step="250000"
                value={projectedNoi}
                onChange={(e) => setProjectedNoi(Number(e.target.value))}
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                Listing Broker
              </label>
              <input 
                type="text" 
                value={broker}
                onChange={(e) => setBroker(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
              Investment Thesis & Catalyst
            </label>
            <textarea 
              rows={2}
              placeholder="e.g. Below replacement cost, long-term tech anchor tenant, rollover conversion..."
              value={keyCatalyst}
              onChange={(e) => setKeyCatalyst(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', resize: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={15} /> Ingest into Underwriting Pipeline
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
