export type AssetClass = 'Commercial Office' | 'Industrial Logistics' | 'Multifamily Luxury' | 'Life Sciences' | 'Mixed-Use Retail';

export type RiskProfile = 'Core' | 'Core-Plus' | 'Value-Add' | 'Opportunistic';

export type PropertyStatus = 'Operating' | 'Under Development' | 'Underwriting' | 'Under Contract' | 'Stabilized';

export interface Tenant {
  id: string;
  name: string;
  industry: string;
  creditRating: string; // e.g. "AA-", "A+", "BBB", "Unrated"
  leasedSqFt: number;
  floor: number | string;
  rentPerSqFt: number; // annual $/sqft
  annualRent: number;
  leaseStartDate: string;
  leaseExpiryDate: string;
  escalationType: string; // e.g. "3.0% Annual Fixed", "CPI + 1.5%"
  securityDepositMonths: number;
  renewalOptions: string;
  status: 'Current' | 'Expiring Soon' | 'In Renewal' | 'Default Risk';
}

export interface StackingUnit {
  floorNumber: number;
  floorLabel: string;
  totalSqFt: number;
  occupiedSqFt: number;
  tenantName: string;
  tenantColor: string;
  annualRentPerSqFt: number;
  leaseExpiryYear: number;
  isVacant: boolean;
  useType: string;
}

export interface PropertyTelemetry {
  powerDrawKw: number;
  hvacEfficiencyPct: number;
  waterUsageGalDay: number;
  occupancyLivePct: number;
  indoorAirQualityAqi: number;
  carbonOffsetTons: number;
  openWorkOrders: number;
  highPriorityAlerts: number;
}

export interface CapExItem {
  id: string;
  title: string;
  category: 'Structural' | 'HVAC/Mechanical' | 'Facade/Roof' | 'Tenant Improvement' | 'Sustainability';
  estimatedCost: number;
  scheduledYear: number;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Planned' | 'Approved' | 'In Progress' | 'Completed';
}

export interface Property {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  country: string;
  assetClass: AssetClass;
  riskProfile: RiskProfile;
  status: PropertyStatus;
  imageUrl: string;
  yearBuilt: number;
  yearRenovated?: number;
  grossSqFt: number;
  rentableSqFt: number;
  floorsCount: number;
  parkingSpaces: number;
  leedCertification: 'Platinum' | 'Gold' | 'Silver' | 'Certified' | 'None';
  gresbScore: number; // 0 - 100
  
  // Financials
  acquisitionDate: string;
  acquisitionPrice: number;
  currentValuation: number;
  netOperatingIncome: number; // Annual NOI
  grossRevenue: number;
  operatingExpenses: number;
  capRate: number; // %
  debtBalance: number;
  loanToValue: number; // %
  debtServiceCoverageRatio: number; // DSCR e.g. 2.15
  physicalOccupancy: number; // %
  financialOccupancy: number; // %
  waltYears: number; // Weighted Average Lease Term
  unleveredIrr: number; // %
  leveredIrr: number; // %
  equityMultiple: number; // e.g. 2.1x

  // Sub-items
  tenants: Tenant[];
  stackingPlan: StackingUnit[];
  telemetry: PropertyTelemetry;
  capexProjects: CapExItem[];
  lat: number;
  lng: number;
}

export interface LoanFacility {
  id: string;
  propertyId: string;
  propertyName: string;
  lender: string;
  originalAmount: number;
  currentBalance: number;
  interestRateType: 'Fixed' | 'Floating (SOFR + Spread)';
  interestRatePct: number;
  spreadBps?: number;
  rateCapPct?: number; // e.g. 5.50%
  originationDate: string;
  maturityDate: string;
  amortizationYears: number;
  covenantMinDscr: number;
  covenantMaxLtv: number;
  status: 'Compliant' | 'Watchlist' | 'Maturing Soon';
}

export interface DealPipelineItem {
  id: string;
  propertyName: string;
  city: string;
  assetClass: AssetClass;
  stage: 'Sourced' | 'Underwriting' | 'LOI Submitted' | 'Due Diligence' | 'IC Approval' | 'Closed';
  askingPrice: number;
  projectedNoi: number;
  projectedCapRate: number;
  projectedIrr: number;
  sqFt: number;
  aiDealScore: number; // 0 - 100
  keyCatalyst: string;
  targetClosingDate: string;
  broker: string;
  discountToReplacementCost: number; // %
}

export interface ComparableSale {
  id: string;
  propertyName: string;
  address: string;
  saleDate: string;
  salePrice: number;
  sqFt: number;
  pricePerSqFt: number;
  capRate: number;
  distanceMiles: number;
  similarityScore: number; // 0-100%
  buyer: string;
}

export interface ProFormaInputs {
  purchasePrice: number;
  closingCostsPct: number;
  exitCapRatePct: number;
  holdPeriodYears: number;
  grossPotentialRentYear1: number;
  rentGrowthRatePct: number;
  generalVacancyPct: number;
  operatingExpenseRatioPct: number;
  opexGrowthRatePct: number;
  capitalReservePerSqFt: number;
  totalSqFt: number;
  ltvPct: number;
  interestRatePct: number;
  amortizationYears: number;
  exitSellingCostsPct: number;
  
  // Waterfall inputs
  prefReturnPct: number;
  tier2HurdlePct: number;
  tier2GpPromotePct: number;
  tier3GpPromotePct: number;
}

export interface CashFlowYear {
  year: number;
  potentialGrossRent: number;
  vacancyLoss: number;
  effectiveGrossIncome: number;
  operatingExpenses: number;
  netOperatingIncome: number;
  capitalReserves: number;
  debtService: number;
  interestPayment: number;
  principalPayment: number;
  unleveredCashFlow: number;
  leveredCashFlow: number;
  loanBalance: number;
  propertyValue: number;
  cashOnCashYield: number;
}

export interface UnderwritingResult {
  unleveredIrr: number;
  leveredIrr: number;
  equityMultiple: number;
  initialEquityRequired: number;
  totalProfit: number;
  exitSalePrice: number;
  netExitProceeds: number;
  averageCashOnCash: number;
  dscrYear1: number;
  cashFlows: CashFlowYear[];
  waterfall: {
    lpReturnOfCapital: number;
    lpPrefReturn: number;
    lpTier2Profit: number;
    lpTier3Profit: number;
    totalLpDistribution: number;
    totalLpProfit: number;
    gpTier2Promote: number;
    gpTier3Promote: number;
    totalGpPromote: number;
    lpIrr: number;
    gpIrr: number;
  };
}

export interface MacroIndicator {
  name: string;
  ticker: string;
  value: string;
  change: string;
  isPositive: boolean;
  description: string;
}
