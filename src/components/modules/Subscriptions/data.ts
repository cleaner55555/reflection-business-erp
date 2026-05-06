// Subscriptions module – static data, mock generators & pure helpers

export const SUB_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: 'Aktivna', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  trial: { label: 'Probni period', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  paused: { label: 'Pauzirana', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  cancelled: { label: 'Otkazana', color: 'bg-red-50 text-red-700 border-red-200' },
  expired: { label: 'Istekla', color: 'bg-slate-100 text-slate-700 border-slate-200' },
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  card: 'Kartica',
  bank: 'Bankovni transfer',
  stripe: 'Stripe',
  paypal: 'PayPal',
};

export const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  paid: { label: 'Plaćeno', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  pending: { label: 'Na čekanju', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  failed: { label: 'Neuspešno', color: 'bg-red-50 text-red-700 border-red-200' },
  refunded: { label: 'Refundirano', color: 'bg-slate-100 text-slate-700 border-slate-200' },
};

export const CYCLE_LABELS: Record<string, string> = {
  monthly: 'Mesečno',
  quarterly: 'Kvartalno',
  annually: 'Godišnje',
};

export const PIE_COLORS = ['#10b981', '#f59e0b', '#6366f1', '#ef4444', '#8b5cf6', '#06b6d4', '#64748b'];
export const CHART_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#06b6d4'];

export const EMPTY_SUB_FORM = {
  customer: '',
  planId: 'plan-1',
  billingCycle: 'monthly' as const,
  trialDays: 0,
  amount: 0,
  startDate: new Date().toISOString().split('T')[0],
};

export const EMPTY_PLAN_FORM = {
  name: '',
  description: '',
  price: 0,
  billingCycle: 'monthly' as const,
  trialPeriod: 0,
  setupFee: 0,
  features: '',
};

export const EMPTY_COUPON_FORM = {
  code: '',
  discountType: 'percentage' as const,
  discountValue: 0,
  maxUses: 100,
  validFrom: new Date().toISOString().split('T')[0],
  validTo: '',
};

// ---- Mock data generators ----

export function generateMockPlans() {
  return [
    { id: 'plan-1', name: 'Starter', description: 'Osnovni paket za male timove', price: 2900, billingCycle: 'monthly', features: ['5 korisnika', '10 GB skladište', 'Email podrška', 'Osnovne izveštaje'], subscriberCount: 3, isActive: true, trialPeriod: 7, setupFee: 0 },
    { id: 'plan-2', name: 'Professional', description: 'Napredni paket za rastuće kompanije', price: 7900, billingCycle: 'monthly', features: ['25 korisnika', '100 GB skladište', 'Prioritetna podrška', 'Napredni izveštaji', 'API pristup', 'Automatizacije'], subscriberCount: 4, isActive: true, trialPeriod: 14, setupFee: 5000 },
    { id: 'plan-3', name: 'Enterprise', description: 'Kompletno rešenje za velike organizacije', price: 19900, billingCycle: 'monthly', features: ['Neograničeno korisnika', '1 TB skladište', '24/7 podrška', 'Prilagođeni izveštaji', 'API pristup', 'Automatizacije', 'SSO integracija', 'Dedikovani menadžer'], subscriberCount: 2, isActive: true, trialPeriod: 30, setupFee: 15000 },
    { id: 'plan-4', name: 'Business', description: 'Paket za srednje firme', price: 12900, billingCycle: 'quarterly', features: ['50 korisnika', '250 GB skladište', 'Prioritetna podrška', 'Izveštaji', 'API pristup'], subscriberCount: 2, isActive: true, trialPeriod: 14, setupFee: 8000 },
    { id: 'plan-5', name: 'Legacy', description: 'Stari paket - više nije dostupan', price: 1900, billingCycle: 'monthly', features: ['3 korisnika', '5 GB skladište', 'Email podrška'], subscriberCount: 1, isActive: false, trialPeriod: 0, setupFee: 0 },
  ];
}

export function generateMockSubscriptions() {
  return [
    { id: 'sub-1', customer: 'Jovan Petrović - JP Doo', planId: 'plan-3', planName: 'Enterprise', startDate: '2024-06-15', renewalDate: '2025-06-15', amount: 19900, status: 'active', billingCycle: 'monthly', trialDays: 0 },
    { id: 'sub-2', customer: 'Ana Marković - AM Solutions', planId: 'plan-2', planName: 'Professional', startDate: '2024-09-01', renewalDate: '2025-09-01', amount: 7900, status: 'active', billingCycle: 'monthly', trialDays: 0 },
    { id: 'sub-3', customer: 'Nikola Stanković - NS Tech', planId: 'plan-1', planName: 'Starter', startDate: '2025-01-10', renewalDate: '2025-02-10', amount: 2900, status: 'trial', billingCycle: 'monthly', trialDays: 7 },
    { id: 'sub-4', customer: 'Milena Jovanović - MJ Consulting', planId: 'plan-2', planName: 'Professional', startDate: '2024-03-20', renewalDate: '2025-03-20', amount: 7900, status: 'active', billingCycle: 'monthly', trialDays: 0 },
    { id: 'sub-5', customer: 'Marko Nikolić - MN Doo', planId: 'plan-3', planName: 'Enterprise', startDate: '2024-11-01', renewalDate: '2025-11-01', amount: 19900, status: 'active', billingCycle: 'monthly', trialDays: 0 },
    { id: 'sub-6', customer: 'Jelena Đorđević - JD Studio', planId: 'plan-1', planName: 'Starter', startDate: '2024-07-01', renewalDate: '2025-07-01', amount: 2900, status: 'paused', billingCycle: 'monthly', trialDays: 0 },
    { id: 'sub-7', customer: 'Stefan Ilić - SI Group', planId: 'plan-4', planName: 'Business', startDate: '2024-08-15', renewalDate: '2025-05-15', amount: 12900, status: 'active', billingCycle: 'quarterly', trialDays: 0 },
    { id: 'sub-8', customer: 'Ivana Vasić - IV Marketing', planId: 'plan-2', planName: 'Professional', startDate: '2024-12-01', renewalDate: '2025-12-01', amount: 7900, status: 'active', billingCycle: 'monthly', trialDays: 0 },
    { id: 'sub-9', customer: 'Darko Todorović - DT Systems', planId: 'plan-5', planName: 'Legacy', startDate: '2023-01-01', renewalDate: '2024-01-01', amount: 1900, status: 'expired', billingCycle: 'monthly', trialDays: 0 },
    { id: 'sub-10', customer: 'Sanja Milosavljević - SM Design', planId: 'plan-1', planName: 'Starter', startDate: '2024-10-15', renewalDate: '2025-04-15', amount: 2900, status: 'cancelled', billingCycle: 'monthly', trialDays: 0 },
    { id: 'sub-11', customer: 'Branislav Kostić - BK Finance', planId: 'plan-4', planName: 'Business', startDate: '2025-01-01', renewalDate: '2025-04-01', amount: 12900, status: 'active', billingCycle: 'quarterly', trialDays: 0 },
    { id: 'sub-12', customer: 'Dragana Radovanović - DR Legal', planId: 'plan-2', planName: 'Professional', startDate: '2025-01-05', renewalDate: '2025-01-19', amount: 7900, status: 'trial', billingCycle: 'monthly', trialDays: 14 },
  ];
}

export function generateMockPayments() {
  return [
    { id: 'pay-1', date: '2025-01-15', customer: 'Jovan Petrović - JP Doo', subscriptionId: 'sub-1', subscriptionName: 'Enterprise', amount: 19900, method: 'card', status: 'paid' },
    { id: 'pay-2', date: '2025-01-15', customer: 'Ana Marković - AM Solutions', subscriptionId: 'sub-2', subscriptionName: 'Professional', amount: 7900, method: 'stripe', status: 'paid' },
    { id: 'pay-3', date: '2025-01-14', customer: 'Milena Jovanović - MJ Consulting', subscriptionId: 'sub-4', subscriptionName: 'Professional', amount: 7900, method: 'bank', status: 'paid' },
    { id: 'pay-4', date: '2025-01-13', customer: 'Marko Nikolić - MN Doo', subscriptionId: 'sub-5', subscriptionName: 'Enterprise', amount: 19900, method: 'card', status: 'paid' },
    { id: 'pay-5', date: '2025-01-12', customer: 'Nikola Stanković - NS Tech', subscriptionId: 'sub-3', subscriptionName: 'Starter', amount: 0, method: 'stripe', status: 'pending' },
    { id: 'pay-6', date: '2025-01-12', customer: 'Ivana Vasić - IV Marketing', subscriptionId: 'sub-8', subscriptionName: 'Professional', amount: 7900, method: 'paypal', status: 'paid' },
    { id: 'pay-7', date: '2025-01-11', customer: 'Stefan Ilić - SI Group', subscriptionId: 'sub-7', subscriptionName: 'Business', amount: 38700, method: 'bank', status: 'paid' },
    { id: 'pay-8', date: '2025-01-10', customer: 'Dragana Radovanović - DR Legal', subscriptionId: 'sub-12', subscriptionName: 'Professional', amount: 0, method: 'card', status: 'pending' },
    { id: 'pay-9', date: '2025-01-08', customer: 'Branislav Kostić - BK Finance', subscriptionId: 'sub-11', subscriptionName: 'Business', amount: 38700, method: 'bank', status: 'failed' },
    { id: 'pay-10', date: '2024-12-15', customer: 'Jovan Petrović - JP Doo', subscriptionId: 'sub-1', subscriptionName: 'Enterprise', amount: 19900, method: 'card', status: 'paid' },
    { id: 'pay-11', date: '2024-12-15', customer: 'Ana Marković - AM Solutions', subscriptionId: 'sub-2', subscriptionName: 'Professional', amount: 7900, method: 'stripe', status: 'refunded' },
    { id: 'pay-12', date: '2024-12-14', customer: 'Milena Jovanović - MJ Consulting', subscriptionId: 'sub-4', subscriptionName: 'Professional', amount: 7900, method: 'bank', status: 'paid' },
  ];
}

export function generateMockCoupons() {
  return [
    { id: 'coup-1', code: 'WELCOME2025', discountType: 'percentage', discountValue: 20, maxUses: 100, usedCount: 34, validFrom: '2025-01-01', validTo: '2025-03-31', status: 'active', usageLog: [{ date: '2025-01-15', customer: 'Nikola Stanković', subscription: 'Starter' }] },
    { id: 'coup-2', code: 'STARTER50', discountType: 'fixed', discountValue: 1500, maxUses: 50, usedCount: 50, validFrom: '2024-10-01', validTo: '2024-12-31', status: 'expired', usageLog: [] },
    { id: 'coup-3', code: 'ANNUAL30', discountType: 'percentage', discountValue: 30, maxUses: 200, usedCount: 12, validFrom: '2025-01-01', validTo: '2025-12-31', status: 'active', usageLog: [] },
    { id: 'coup-4', code: 'REFER10', discountType: 'percentage', discountValue: 10, maxUses: 500, usedCount: 87, validFrom: '2024-06-01', validTo: '2025-06-30', status: 'active', usageLog: [] },
    { id: 'coup-5', code: 'UPGRADE25', discountType: 'percentage', discountValue: 25, maxUses: 0, usedCount: 5, validFrom: '2025-01-01', validTo: '2025-06-30', status: 'active', usageLog: [] },
    { id: 'coup-6', code: 'SUMMER2024', discountType: 'fixed', discountValue: 3000, maxUses: 100, usedCount: 67, validFrom: '2024-06-01', validTo: '2024-08-31', status: 'expired', usageLog: [] },
    { id: 'coup-7', code: 'VIPACCESS', discountType: 'percentage', discountValue: 50, maxUses: 10, usedCount: 3, validFrom: '2025-01-15', validTo: '2025-02-15', status: 'active', usageLog: [] },
    { id: 'coup-8', code: 'BETA2024', discountType: 'percentage', discountValue: 100, maxUses: 20, usedCount: 20, validFrom: '2024-01-01', validTo: '2024-06-30', status: 'inactive', usageLog: [] },
  ];
}

export function generateMrrTrend() {
  return [
    { month: 'Avg', mrr: 58500 },
    { month: 'Sep', mrr: 61400 },
    { month: 'Okt', mrr: 67200 },
    { month: 'Nov', mrr: 78600 },
    { month: 'Dec', mrr: 74200 },
    { month: 'Jan', mrr: 82200 },
  ];
}

export function generateSubGrowth() {
  return [
    { month: 'Avg', count: 5 },
    { month: 'Sep', count: 7 },
    { month: 'Okt', count: 8 },
    { month: 'Nov', count: 10 },
    { month: 'Dec', count: 11 },
    { month: 'Jan', count: 12 },
  ];
}

export function generateChurnTrend() {
  return [
    { month: 'Avg', rate: 3.2 },
    { month: 'Sep', rate: 2.8 },
    { month: 'Okt', rate: 4.1 },
    { month: 'Nov', rate: 2.5 },
    { month: 'Dec', rate: 3.8 },
    { month: 'Jan', rate: 2.1 },
  ];
}

export function generateConversionFunnel() {
  return [
    { stage: 'Probni period', count: 18, fill: '#06b6d4' },
    { stage: 'Plaćeno', count: 14, fill: '#f59e0b' },
    { stage: 'Obnovljeno', count: 10, fill: '#10b981' },
  ];
}
