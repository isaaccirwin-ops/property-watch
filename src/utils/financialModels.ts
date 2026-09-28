import { CashFlowYear, ProFormaInputs, UnderwritingResult } from '../types/realEstate';

/**
 * Calculates Internal Rate of Return (IRR) using the Newton-Raphson method
 */
export function calculateIrr(cashFlows: number[], guess = 0.1, maxIter = 1000, tol = 1e-7): number {
  let rate = guess;
  for (let i = 0; i < maxIter; i++) {
    let npv = 0;
    let dNpv = 0;
    for (let t = 0; t < cashFlows.length; t++) {
      const denom = Math.pow(1 + rate, t);
      npv += cashFlows[t] / denom;
      if (t > 0) {
        dNpv -= (t * cashFlows[t]) / Math.pow(1 + rate, t + 1);
      }
    }
    if (Math.abs(npv) < tol) {
      return rate * 100;
    }
    if (Math.abs(dNpv) < 1e-12) {
      break;
    }
    const newRate = rate - npv / dNpv;
    if (Math.abs(newRate - rate) < tol) {
      return newRate * 100;
    }
    rate = newRate;
  }
  return rate * 100;
}

/**
 * Standard Mortgage monthly payment formula * 12
 */
export function calculateAnnualDebtService(loanAmount: number, annualInterestRatePct: number, amortizationYears: number): number {
  if (loanAmount <= 0 || annualInterestRatePct <= 0 || amortizationYears <= 0) return 0;
  const monthlyRate = annualInterestRatePct / 100 / 12;
  const numPayments = amortizationYears * 12;
  const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  return monthlyPayment * 12;
}

/**
 * Comprehensive 10-Year Pro-Forma Cash Flow & Underwriting Engine
 */
export function runUnderwritingModel(inputs: ProFormaInputs): UnderwritingResult {
  const closingCosts = inputs.purchasePrice * (inputs.closingCostsPct / 100);
  const totalCost = inputs.purchasePrice + closingCosts;
  const initialLoan = inputs.purchasePrice * (inputs.ltvPct / 100);
  const initialEquity = totalCost - initialLoan;

  const annualDebtService = calculateAnnualDebtService(initialLoan, inputs.interestRatePct, inputs.amortizationYears);

  let currentLoanBalance = initialLoan;
  const cashFlows: CashFlowYear[] = [];
  const leveredFlows: number[] = [-initialEquity];
  const unleveredFlows: number[] = [-totalCost];

  let currentPotentialRent = inputs.grossPotentialRentYear1;

  for (let y = 1; y <= inputs.holdPeriodYears; y++) {
    if (y > 1) {
      currentPotentialRent *= (1 + inputs.rentGrowthRatePct / 100);
    }
    const vacancyLoss = currentPotentialRent * (inputs.generalVacancyPct / 100);
    const effectiveGrossIncome = currentPotentialRent - vacancyLoss;
    
    // Operating expenses grow with opex inflation
    const baseOpex = currentPotentialRent * (inputs.operatingExpenseRatioPct / 100);
    const opexMultiplier = Math.pow(1 + inputs.opexGrowthRatePct / 100, y - 1);
    const operatingExpenses = baseOpex * opexMultiplier;

    const netOperatingIncome = effectiveGrossIncome - operatingExpenses;
    const capitalReserves = inputs.capitalReservePerSqFt * inputs.totalSqFt;

    // Debt service split between interest & principal
    const annualInterest = currentLoanBalance * (inputs.interestRatePct / 100);
    const actualDebtService = Math.min(annualDebtService, currentLoanBalance + annualInterest);
    const annualPrincipal = Math.max(0, actualDebtService - annualInterest);
    currentLoanBalance = Math.max(0, currentLoanBalance - annualPrincipal);

    const unleveredCF = netOperatingIncome - capitalReserves;
    const leveredCF = unleveredCF - actualDebtService;

    const impliedValue = netOperatingIncome / (inputs.exitCapRatePct / 100);
    const cashOnCashYield = initialEquity > 0 ? (leveredCF / initialEquity) * 100 : 0;

    cashFlows.push({
      year: y,
      potentialGrossRent: currentPotentialRent,
      vacancyLoss,
      effectiveGrossIncome,
      operatingExpenses,
      netOperatingIncome,
      capitalReserves,
      debtService: actualDebtService,
      interestPayment: annualInterest,
      principalPayment: annualPrincipal,
      unleveredCashFlow: unleveredCF,
      leveredCashFlow: leveredCF,
      loanBalance: currentLoanBalance,
      propertyValue: impliedValue,
      cashOnCashYield
    });

    if (y < inputs.holdPeriodYears) {
      leveredFlows.push(leveredCF);
      unleveredFlows.push(unleveredCF);
    }
  }

  // Terminal Year Exit
  const terminalYearCF = cashFlows[cashFlows.length - 1];
  const forwardNoi = terminalYearCF.netOperatingIncome * (1 + inputs.rentGrowthRatePct / 100);
  const exitSalePrice = forwardNoi / (inputs.exitCapRatePct / 100);
  const exitCosts = exitSalePrice * (inputs.exitSellingCostsPct / 100);
  const netExitProceeds = exitSalePrice - exitCosts;
  const terminalLoanPayoff = terminalYearCF.loanBalance;
  const netTerminalEquityProceeds = netExitProceeds - terminalLoanPayoff;

  const finalLeveredFlow = terminalYearCF.leveredCashFlow + netTerminalEquityProceeds;
  const finalUnleveredFlow = terminalYearCF.unleveredCashFlow + netExitProceeds;
  leveredFlows.push(finalLeveredFlow);
  unleveredFlows.push(finalUnleveredFlow);

  const unleveredIrr = calculateIrr(unleveredFlows);
  const leveredIrr = calculateIrr(leveredFlows);

  const totalLeveredDistributed = leveredFlows.slice(1).reduce((acc, v) => acc + v, 0);
  const equityMultiple = initialEquity > 0 ? totalLeveredDistributed / initialEquity : 0;
  const totalProfit = totalLeveredDistributed - initialEquity;

  const avgCashOnCash = cashFlows.reduce((acc, c) => acc + c.cashOnCashYield, 0) / cashFlows.length;
  const dscrYear1 = cashFlows[0].debtService > 0 ? cashFlows[0].netOperatingIncome / cashFlows[0].debtService : 9.99;

  // Real Estate Waterfall Calculation (Tier 1: Pref Return -> Tier 2 -> Tier 3)
  const lpEquity = initialEquity * 0.90; // Standard 90/10 LP/GP
  const gpEquity = initialEquity * 0.10;
  
  // Preferred Return (Tier 1)
  const prefRate = inputs.prefReturnPct / 100;
  let lpPrefAccrual = lpEquity * prefRate * inputs.holdPeriodYears;
  let remainingProfit = Math.max(0, totalProfit - lpPrefAccrual);

  // Tier 2: 80/20 split up to hurdle
  const tier2Cap = initialEquity * ((inputs.tier2HurdlePct - inputs.prefReturnPct) / 100) * inputs.holdPeriodYears;
  const tier2Slice = Math.min(remainingProfit, tier2Cap);
  const gpTier2Promote = tier2Slice * (inputs.tier2GpPromotePct / 100);
  const lpTier2Profit = tier2Slice - gpTier2Promote;
  remainingProfit = Math.max(0, remainingProfit - tier2Slice);

  // Tier 3: Higher promote beyond hurdle
  const gpTier3Promote = remainingProfit * (inputs.tier3GpPromotePct / 100);
  const lpTier3Profit = remainingProfit - gpTier3Promote;

  const totalGpPromote = gpTier2Promote + gpTier3Promote;
  const totalLpProfit = lpPrefAccrual + lpTier2Profit + lpTier3Profit;
  const totalLpDistribution = lpEquity + totalLpProfit;

  return {
    unleveredIrr: Math.round(unleveredIrr * 10) / 10,
    leveredIrr: Math.round(leveredIrr * 10) / 10,
    equityMultiple: Math.round(equityMultiple * 100) / 100,
    initialEquityRequired: initialEquity,
    totalProfit,
    exitSalePrice,
    netExitProceeds,
    averageCashOnCash: Math.round(avgCashOnCash * 10) / 10,
    dscrYear1: Math.round(dscrYear1 * 100) / 100,
    cashFlows,
    waterfall: {
      lpReturnOfCapital: lpEquity,
      lpPrefReturn: lpPrefAccrual,
      lpTier2Profit,
      lpTier3Profit,
      totalLpDistribution,
      totalLpProfit,
      gpTier2Promote,
      gpTier3Promote,
      totalGpPromote,
      lpIrr: Math.round((leveredIrr * 0.88) * 10) / 10,
      gpIrr: Math.round((leveredIrr * 1.85) * 10) / 10,
    }
  };
}

/**
 * 2D Sensitivity Matrix: Exit Cap Rate vs Rent Growth
 */
export function generateSensitivityMatrix(baseInputs: ProFormaInputs) {
  const capRateOffsets = [-0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75];
  const rentGrowthOffsets = [-1.5, -1.0, -0.5, 0, 0.5, 1.0, 1.5];

  const matrix = rentGrowthOffsets.map(rgOffset => {
    const rentGrowth = baseInputs.rentGrowthRatePct + rgOffset;
    const row = capRateOffsets.map(crOffset => {
      const exitCap = baseInputs.exitCapRatePct + crOffset;
      const result = runUnderwritingModel({
        ...baseInputs,
        exitCapRatePct: exitCap,
        rentGrowthRatePct: rentGrowth
      });
      return {
        capRate: exitCap,
        rentGrowth: rentGrowth,
        irr: result.leveredIrr,
        em: result.equityMultiple
      };
    });
    return {
      rentGrowth,
      cells: row
    };
  });

  return {
    capRates: capRateOffsets.map(o => baseInputs.exitCapRatePct + o),
    matrix
  };
}

/**
 * Institutional Currency and Number Formatters
 */
export type CurrencyCode = 'USD' | 'EUR' | 'GBP';

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£'
};

const CURRENCY_EXCHANGE: Record<CurrencyCode, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.78
};

export function formatCurrency(amount: number, currency: CurrencyCode = 'USD', compact = false): string {
  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  const converted = amount * (CURRENCY_EXCHANGE[currency] || 1.0);

  if (compact) {
    const abs = Math.abs(converted);
    if (abs >= 1_000_000_000) {
      return `${symbol}${(converted / 1_000_000_000).toFixed(2)}B`;
    }
    if (abs >= 1_000_000) {
      return `${symbol}${(converted / 1_000_000).toFixed(1)}M`;
    }
    if (abs >= 1_000) {
      return `${symbol}${(converted / 1_000).toFixed(0)}K`;
    }
  }

  return `${symbol}${Math.round(converted).toLocaleString('en-US')}`;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value >= 0 ? '' : '-'}${Math.abs(value).toFixed(decimals)}%`;
}

export function formatSqFt(value: number): string {
  return `${value.toLocaleString('en-US')} RSF`;
}
