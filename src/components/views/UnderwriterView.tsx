import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  Sliders, 
  Layers, 
  PieChart, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  DollarSign, 
  Percent,
  Download
} from 'lucide-react';
import { ProFormaInputs, UnderwritingResult } from '../../types/realEstate';
import { 
  runUnderwritingModel, 
  generateSensitivityMatrix, 
  CurrencyCode, 
  formatCurrency, 
  formatPercent 
} from '../../utils/financialModels';

interface UnderwriterViewProps {
  currency: CurrencyCode;
}

const DEFAULT_INPUTS: ProFormaInputs = {
  purchasePrice: 220000000,
  closingCostsPct: 2.0,
  exitCapRatePct: 5.5,
  holdPeriodYears: 7,
  grossPotentialRentYear1: 17500000,
  rentGrowthRatePct: 3.5,
  generalVacancyPct: 5.0,
  operatingExpenseRatioPct: 28.0,
  opexGrowthRatePct: 2.5,
  capitalReservePerSqFt: 0.35,
  totalSqFt: 620000,
  ltvPct: 55.0,
  interestRatePct: 5.75,
  amortizationYears: 30,
  exitSellingCostsPct: 2.0,
  prefReturnPct: 8.0,
  tier2HurdlePct: 15.0,
  tier2GpPromotePct: 20.0,
  tier3GpPromotePct: 35.0
};

export const UnderwriterView: React.FC<UnderwriterViewProps> = ({ currency }) => {
  const [inputs, setInputs] = useState<ProFormaInputs>(DEFAULT_INPUTS);
  const [activeModelTab, setActiveModelTab] = useState<'cashflows' | 'waterfall' | 'sensitivity'>('cashflows');

  const updateInput = <K extends keyof ProFormaInputs>(key: K, value: number) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const results: UnderwritingResult = useMemo(() => {
    return runUnderwritingModel(inputs);
  }, [inputs]);

  const sensitivity = useMemo(() => {
    return generateSensitivityMatrix(inputs);
  }, [inputs]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Engine Banner */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '1.5rem 1.75rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '1rem',
          borderLeft: '4px solid var(--accent-emerald)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-emerald">INSTITUTIONAL QUANT ENGINE</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Newton-Raphson Solver • Dynamic Pro-Forma Cash Flows</span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Deal Underwriter & Cash Flow Engine</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Real-time DCF modeling, debt amortization schedules, GP/LP promote hurdles, and 2D cap rate stress matrices.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={() => setInputs(DEFAULT_INPUTS)} 
            className="btn btn-secondary btn-sm"
          >
            <RotateCcw size={14} /> Reset Defaults
          </button>
          <button 
            onClick={() => alert('Model scenario exported as financial underwriting workbook (CSV/JSON).')}
            className="btn btn-primary btn-sm"
          >
            <Download size={14} /> Export Underwriting Deck
          </button>
        </div>
      </div>

      {/* Primary Underwriting Return KPIs */}
      <div className="kpi-grid">
        <div className="glass-panel kpi-card" style={{ borderTop: '2px solid var(--accent-emerald)' }}>
          <div className="kpi-header"><span className="kpi-title">Levered IRR</span><TrendingUp size={15} style={{ color: 'var(--accent-emerald)' }} /></div>
          <div className="kpi-value" style={{ color: 'var(--accent-emerald)' }}>{results.leveredIrr}%</div>
          <div className="kpi-footer"><span>Unlevered IRR: {results.unleveredIrr}%</span></div>
        </div>

        <div className="glass-panel kpi-card" style={{ borderTop: '2px solid var(--accent-cyan)' }}>
          <div className="kpi-header"><span className="kpi-title">Equity Multiple</span><Calculator size={15} style={{ color: 'var(--accent-cyan)' }} /></div>
          <div className="kpi-value" style={{ color: 'var(--accent-cyan)' }}>{results.equityMultiple}x</div>
          <div className="kpi-footer"><span>Net Profit: {formatCurrency(results.totalProfit, currency, true)}</span></div>
        </div>

        <div className="glass-panel kpi-card" style={{ borderTop: '2px solid var(--accent-purple)' }}>
          <div className="kpi-header"><span className="kpi-title">Required Equity</span><DollarSign size={15} style={{ color: 'var(--accent-purple)' }} /></div>
          <div className="kpi-value">{formatCurrency(results.initialEquityRequired, currency, true)}</div>
          <div className="kpi-footer"><span>LTV: {inputs.ltvPct}% (${formatCurrency(inputs.purchasePrice * (inputs.ltvPct / 100), currency, true)} Debt)</span></div>
        </div>

        <div className="glass-panel kpi-card" style={{ borderTop: '2px solid var(--accent-amber)' }}>
          <div className="kpi-header"><span className="kpi-title">Avg. Cash-on-Cash</span><Percent size={15} style={{ color: 'var(--accent-amber)' }} /></div>
          <div className="kpi-value">{results.averageCashOnCash}%</div>
          <div className="kpi-footer"><span>Year 1 DSCR: {results.dscrYear1}x</span></div>
        </div>

        <div className="glass-panel kpi-card">
          <div className="kpi-header"><span className="kpi-title">Projected Exit Value</span><Layers size={15} /></div>
          <div className="kpi-value">{formatCurrency(results.exitSalePrice, currency, true)}</div>
          <div className="kpi-footer"><span>Exit Cap: {inputs.exitCapRatePct}% (Yr {inputs.holdPeriodYears})</span></div>
        </div>

        <div className="glass-panel kpi-card">
          <div className="kpi-header"><span className="kpi-title">GP Total Promote</span><Sparkles size={15} style={{ color: '#F59E0B' }} /></div>
          <div className="kpi-value" style={{ color: '#F59E0B' }}>{formatCurrency(results.waterfall.totalGpPromote, currency, true)}</div>
          <div className="kpi-footer"><span>GP IRR: {results.waterfall.gpIrr}% vs LP: {results.waterfall.lpIrr}%</span></div>
        </div>
      </div>

      {/* Main Two-Column Layout: Parameters Left, Model Engine Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Underwriting Parameter Controls */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.94rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sliders size={16} /> Deal Assumptions
            </h3>
            <span className="badge badge-cyan">Real-Time</span>
          </div>

          {/* Acquisition & Valuation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Acquisition & Basis
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.2rem' }}>
                <span>Purchase Price</span>
                <span className="font-mono" style={{ fontWeight: 700 }}>{formatCurrency(inputs.purchasePrice, currency)}</span>
              </div>
              <input 
                type="range" 
                min={20000000} 
                max={600000000} 
                step={5000000}
                value={inputs.purchasePrice} 
                onChange={(e) => updateInput('purchasePrice', Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.2rem' }}>
                <span>Hold Period</span>
                <span className="font-mono" style={{ fontWeight: 700 }}>{inputs.holdPeriodYears} Years</span>
              </div>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {[3, 5, 7, 10].map(yrs => (
                  <button
                    key={yrs}
                    onClick={() => updateInput('holdPeriodYears', yrs)}
                    className={`btn btn-sm ${inputs.holdPeriodYears === yrs ? 'btn-cyan' : 'btn-secondary'}`}
                    style={{ flex: 1, padding: '0.3rem' }}
                  >
                    {yrs}Y
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.2rem' }}>
                <span>Terminal Exit Cap Rate</span>
                <span className="font-mono" style={{ fontWeight: 700 }}>{inputs.exitCapRatePct.toFixed(2)}%</span>
              </div>
              <input 
                type="range" 
                min={4.0} 
                max={8.0} 
                step={0.1}
                value={inputs.exitCapRatePct} 
                onChange={(e) => updateInput('exitCapRatePct', Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
              />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />

          {/* Revenue & Operations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Operations & Growth
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.2rem' }}>
                <span>Gross Potential Rent (Yr 1)</span>
                <span className="font-mono" style={{ fontWeight: 700 }}>{formatCurrency(inputs.grossPotentialRentYear1, currency)}</span>
              </div>
              <input 
                type="range" 
                min={5000000} 
                max={50000000} 
                step={500000}
                value={inputs.grossPotentialRentYear1} 
                onChange={(e) => updateInput('grossPotentialRentYear1', Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-emerald)' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Rent Growth / Yr</label>
                <input 
                  type="number" 
                  step="0.25"
                  value={inputs.rentGrowthRatePct}
                  onChange={(e) => updateInput('rentGrowthRatePct', Number(e.target.value))}
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Vacancy Pct</label>
                <input 
                  type="number" 
                  step="0.5"
                  value={inputs.generalVacancyPct}
                  onChange={(e) => updateInput('generalVacancyPct', Number(e.target.value))}
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
                />
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />

          {/* Debt Financing Stack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Debt Financing Structure
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>LTV (%)</label>
                <input 
                  type="number" 
                  step="5"
                  value={inputs.ltvPct}
                  onChange={(e) => updateInput('ltvPct', Number(e.target.value))}
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Interest Rate (%)</label>
                <input 
                  type="number" 
                  step="0.25"
                  value={inputs.interestRatePct}
                  onChange={(e) => updateInput('interestRatePct', Number(e.target.value))}
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Model Output Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Output Selector Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.25rem' }}>
            <button
              onClick={() => setActiveModelTab('cashflows')}
              className={`btn btn-sm ${activeModelTab === 'cashflows' ? 'btn-cyan' : 'btn-secondary'}`}
            >
              10-Year Pro-Forma Schedule
            </button>
            <button
              onClick={() => setActiveModelTab('waterfall')}
              className={`btn btn-sm ${activeModelTab === 'waterfall' ? 'btn-cyan' : 'btn-secondary'}`}
            >
              LP / GP Waterfall Split
            </button>
            <button
              onClick={() => setActiveModelTab('sensitivity')}
              className={`btn btn-sm ${activeModelTab === 'sensitivity' ? 'btn-cyan' : 'btn-secondary'}`}
            >
              2D Sensitivity Matrix
            </button>
          </div>

          {/* Sub-tab 1: 10-Year Cash Flow Pro-Forma Schedule */}
          {activeModelTab === 'cashflows' && (
            <div className="glass-panel table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Line Item</th>
                    {results.cashFlows.map(cf => (
                      <th key={cf.year} style={{ textAlign: 'right' }}>Yr {cf.year}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Gross Potential Rent</td>
                    {results.cashFlows.map(cf => (
                      <td key={cf.year} className="font-mono" style={{ textAlign: 'right' }}>
                        {formatCurrency(cf.potentialGrossRent, currency, true)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--text-muted)' }}>(-) Vacancy Allowance ({inputs.generalVacancyPct}%)</td>
                    {results.cashFlows.map(cf => (
                      <td key={cf.year} className="font-mono" style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                        ({formatCurrency(cf.vacancyLoss, currency, true)})
                      </td>
                    ))}
                  </tr>
                  <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <td style={{ fontWeight: 700 }}>Effective Gross Income (EGI)</td>
                    {results.cashFlows.map(cf => (
                      <td key={cf.year} className="font-mono" style={{ textAlign: 'right', fontWeight: 600 }}>
                        {formatCurrency(cf.effectiveGrossIncome, currency, true)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--accent-rose)' }}>(-) Operating Expenses (OPEX)</td>
                    {results.cashFlows.map(cf => (
                      <td key={cf.year} className="font-mono" style={{ textAlign: 'right', color: 'var(--accent-rose)' }}>
                        ({formatCurrency(cf.operatingExpenses, currency, true)})
                      </td>
                    ))}
                  </tr>
                  <tr style={{ background: 'rgba(16, 185, 129, 0.08)' }}>
                    <td style={{ fontWeight: 800, color: 'var(--accent-emerald)' }}>Net Operating Income (NOI)</td>
                    {results.cashFlows.map(cf => (
                      <td key={cf.year} className="font-mono" style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                        {formatCurrency(cf.netOperatingIncome, currency, true)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--text-muted)' }}>(-) Capital Reserves</td>
                    {results.cashFlows.map(cf => (
                      <td key={cf.year} className="font-mono" style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                        ({formatCurrency(cf.capitalReserves, currency, true)})
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--accent-amber)' }}>(-) Debt Service (P&I)</td>
                    {results.cashFlows.map(cf => (
                      <td key={cf.year} className="font-mono" style={{ textAlign: 'right', color: 'var(--accent-amber)' }}>
                        ({formatCurrency(cf.debtService, currency, true)})
                      </td>
                    ))}
                  </tr>
                  <tr style={{ borderTop: '2px solid var(--border-medium)', background: 'rgba(56, 189, 248, 0.08)' }}>
                    <td style={{ fontWeight: 800, color: 'var(--accent-cyan)' }}>Levered Net Cash Flow</td>
                    {results.cashFlows.map(cf => (
                      <td key={cf.year} className="font-mono" style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                        {formatCurrency(cf.leveredCashFlow, currency, true)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--text-secondary)' }}>Cash-on-Cash Return</td>
                    {results.cashFlows.map(cf => (
                      <td key={cf.year} className="font-mono" style={{ textAlign: 'right', fontWeight: 600 }}>
                        {cf.cashOnCashYield.toFixed(1)}%
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--text-muted)' }}>Remaining Loan Principal</td>
                    {results.cashFlows.map(cf => (
                      <td key={cf.year} className="font-mono" style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        {formatCurrency(cf.loanBalance, currency, true)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Sub-tab 2: LP / GP Waterfall Split */}
          {activeModelTab === 'waterfall' && (
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Institutional LP / GP Distribution Waterfall</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Tier 1: 8.0% Preferred Return to LP • Tier 2: 80/20 split to 15% IRR • Tier 3: 65/35 promote
                  </div>
                </div>
                <span className="badge badge-emerald">Modeled Multiple: {results.equityMultiple}x</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                    Limited Partner (LP) Proceeds
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--text-primary)' }}>
                    {formatCurrency(results.waterfall.totalLpDistribution, currency)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', marginTop: '0.35rem' }}>
                    LP Levered Net IRR: <strong>{results.waterfall.lpIrr}%</strong>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '1rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Return of Initial Equity:</span>
                      <span className="font-mono">{formatCurrency(results.waterfall.lpReturnOfCapital, currency)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Accrued 8% Pref Return:</span>
                      <span className="font-mono">{formatCurrency(results.waterfall.lpPrefReturn, currency)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Hurdle Profit Share:</span>
                      <span className="font-mono">{formatCurrency(results.waterfall.lpTier2Profit + results.waterfall.lpTier3Profit, currency)}</span>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#F59E0B', fontWeight: 700 }}>
                    General Partner (GP / Sponsor) Promote
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem', color: '#F59E0B' }}>
                    {formatCurrency(results.waterfall.totalGpPromote, currency)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', marginTop: '0.35rem' }}>
                    Sponsor Blended Return: <strong>{results.waterfall.gpIrr}% IRR</strong>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '1rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Tier 2 Promote (20% above 8%):</span>
                      <span className="font-mono">{formatCurrency(results.waterfall.gpTier2Promote, currency)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Tier 3 Promote (35% above 15%):</span>
                      <span className="font-mono">{formatCurrency(results.waterfall.gpTier3Promote, currency)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-tab 3: 2D Sensitivity Matrix Heat Map */}
          {activeModelTab === 'sensitivity' && (
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>2D Sensitivity Stress Test Matrix</h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Exit Cap Rate (Columns) vs Annual Rent Growth Rate (Rows) → Levered IRR (%)
                </div>
              </div>

              <div className="table-container">
                <table className="sensitivity-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Rent Growth \ Exit Cap</th>
                      {sensitivity.capRates.map((cr, idx) => (
                        <th key={idx} style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                          {cr.toFixed(2)}%
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sensitivity.matrix.map((row, rIdx) => (
                      <tr key={rIdx}>
                        <td style={{ padding: '0.5rem', fontWeight: 700, fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                          {row.rentGrowth.toFixed(1)}% / yr
                        </td>
                        {row.cells.map((cell, cIdx) => {
                          const irr = cell.irr;
                          let bg = 'rgba(255, 255, 255, 0.05)';
                          let text = 'var(--text-secondary)';
                          if (irr >= 20) {
                            bg = 'rgba(16, 185, 129, 0.35)';
                            text = '#34D399';
                          } else if (irr >= 15) {
                            bg = 'rgba(16, 185, 129, 0.2)';
                            text = '#6EE7B7';
                          } else if (irr >= 10) {
                            bg = 'rgba(56, 189, 248, 0.15)';
                            text = '#7DD3FC';
                          } else {
                            bg = 'rgba(244, 63, 94, 0.2)';
                            text = '#FDA4AF';
                          }

                          return (
                            <td 
                              key={cIdx} 
                              className="sensitivity-cell"
                              style={{ background: bg, color: text }}
                            >
                              {cell.irr.toFixed(1)}%
                              <div style={{ fontSize: '0.62rem', opacity: 0.8 }}>{cell.em.toFixed(2)}x</div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
