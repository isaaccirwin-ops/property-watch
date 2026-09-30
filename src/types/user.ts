export type UserRole = 'admin' | 'customer' | 'analyst';

export type PlanTier = 'starter' | 'pro' | 'enterprise';

export type BillingStatus = 'active' | 'past_due' | 'canceled' | 'trialing';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyName?: string;
  phone?: string;
  avatarUrl?: string;
  planTier: PlanTier;
  billingStatus: BillingStatus;
  monthlySpend: number;
  billingCycle: 'monthly' | 'annual';
  stripeCustomerId?: string;
  createdAt: string;
  propertyCount?: number;
  totalPortfolioValuation?: number;
}

export interface BillingInvoice {
  id: string;
  userId: string;
  userName?: string;
  companyName?: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'past_due' | 'void';
  planTier: PlanTier;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  dueDate: string;
  paidAt?: string;
  createdAt: string;
}
