// Expenses module – static data, mock generators & pure helpers

export const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Nacrt', color: 'bg-slate-100 text-slate-700' },
  submitted: { label: 'Poslata', color: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Odobreno', color: 'bg-green-100 text-green-700' },
  paid: { label: 'Placeno', color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Odbijeno', color: 'bg-red-100 text-red-700' },
  manager_review: { label: 'Pregled menadzera', color: 'bg-orange-100 text-orange-700' },
};

export const CATEGORY_LABELS: Record<string, string> = {
  office: 'Kancelarija',
  travel: 'Putovanja',
  equipment: 'Oprema',
  marketing: 'Marketing',
  utilities: 'Komunalije',
  salaries: 'Plate',
  other: 'Ostalo',
};

export const PAYMENT_METHODS: Record<string, string> = {
  cash: 'Gotovina',
  card: 'Kartica',
  bank_transfer: 'Bankovni transfer',
  company_account: 'Firmni racun',
};

export const PIE_COLORS = ['#f59e0b', '#10b981', '#6366f1', '#ef4444', '#8b5cf6', '#06b6d4', '#64748b'];

export const EMPLOYEES = [
  { id: 'emp-1', name: 'Marko Petrovic' },
  { id: 'emp-2', name: 'Jelena Nikolic' },
  { id: 'emp-3', name: 'Stefan Jovanovic' },
  { id: 'emp-4', name: 'Ana Popovic' },
  { id: 'emp-5', name: 'Nikola Milovanovic' },
];

export const EMPTY_EXPENSE_FORM = {
  description: '',
  category: 'office',
  amount: 0,
  date: new Date().toISOString().split('T')[0],
  employeeId: 'emp-1',
  paymentMethod: 'card',
  hasReceipt: false,
  notes: '',
  status: 'draft',
};

export const EMPTY_REPORT_FORM = {
  title: '',
  employeeId: 'emp-1',
  dateFrom: '',
  dateTo: '',
  notes: '',
};

export const EMPTY_BUDGET_FORM = {
  name: '',
  category: 'office',
  allocatedAmount: 0,
  period: 'monthly',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
};

export const EMPTY_POLICY_FORM = {
  name: '',
  category: 'office',
  maxAmount: 50000,
  frequency: 'monthly',
  approvalThreshold: 30000,
  isActive: true,
};

// ---- Pure helpers ----

export function getEmployeeName(id: string): string {
  return EMPLOYEES.find((e) => e.id === id)?.name || id;
}

export function getPercentUsed(spent: number, allocated: number): number {
  if (allocated <= 0) return 0;
  return Math.min(Math.round((spent / allocated) * 100), 100);
}

export function getBudgetAlertClass(pct: number): string {
  if (pct >= 100) return 'text-red-600';
  if (pct >= 80) return 'text-amber-600';
  return 'text-emerald-600';
}

// ---- Mock data generators ----

export function generateMockExpenses() {
  return [
    { id: 'exp-1', description: 'Kancelarijski materijal - papir, toneri', category: 'office', amount: 18500, date: '2025-01-15', employee: 'Marko Petrovic', employeeId: 'emp-1', paymentMethod: 'card', status: 'approved', hasReceipt: true, notes: 'Mesečna nabavka', createdAt: '2025-01-15T08:00:00Z' },
    { id: 'exp-2', description: 'Putovanje Novi Sad - sastanak klijent', category: 'travel', amount: 12400, date: '2025-01-18', employee: 'Jelena Nikolic', employeeId: 'emp-2', paymentMethod: 'company_account', status: 'submitted', hasReceipt: true, notes: 'Voz karta + taksii', createdAt: '2025-01-18T09:30:00Z' },
    { id: 'exp-3', description: 'Marketing kampanja - Google Ads', category: 'marketing', amount: 85000, date: '2025-01-10', employee: 'Ana Popovic', employeeId: 'emp-4', paymentMethod: 'bank_transfer', status: 'approved', hasReceipt: true, createdAt: '2025-01-10T10:00:00Z' },
    { id: 'exp-4', description: 'Laptop za novog zaposlenog', category: 'equipment', amount: 125000, date: '2025-01-20', employee: 'Stefan Jovanovic', employeeId: 'emp-3', paymentMethod: 'bank_transfer', status: 'paid', hasReceipt: true, notes: 'Dell Latitude 5540', createdAt: '2025-01-20T11:00:00Z' },
    { id: 'exp-5', description: 'Struja za januar', category: 'utilities', amount: 28700, date: '2025-01-25', employee: 'Marko Petrovic', employeeId: 'emp-1', paymentMethod: 'bank_transfer', status: 'paid', hasReceipt: true, createdAt: '2025-01-25T08:00:00Z' },
    { id: 'exp-6', description: 'Timski ručak - projekat Alpha', category: 'other', amount: 15600, date: '2025-01-22', employee: 'Jelena Nikolic', employeeId: 'emp-2', paymentMethod: 'cash', status: 'draft', hasReceipt: false, createdAt: '2025-01-22T12:00:00Z' },
    { id: 'exp-7', description: 'Printanje flajera 5000 kom', category: 'marketing', amount: 42000, date: '2025-01-12', employee: 'Ana Popovic', employeeId: 'emp-4', paymentMethod: 'bank_transfer', status: 'approved', hasReceipt: true, createdAt: '2025-01-12T14:00:00Z' },
    { id: 'exp-8', description: 'Pretplate softver - Adobe, Slack', category: 'software', amount: 35600, date: '2025-01-05', employee: 'Stefan Jovanovic', employeeId: 'emp-3', paymentMethod: 'card', status: 'paid', hasReceipt: true, createdAt: '2025-01-05T09:00:00Z' },
    { id: 'exp-9', description: 'Kancelarijski sto za recepciju', category: 'equipment', amount: 67800, date: '2025-01-28', employee: 'Marko Petrovic', employeeId: 'emp-1', paymentMethod: 'bank_transfer', status: 'submitted', hasReceipt: true, createdAt: '2025-01-28T10:00:00Z' },
    { id: 'exp-10', description: 'Internet provajder - januar', category: 'utilities', amount: 9500, date: '2025-01-03', employee: 'Nikola Milovanovic', employeeId: 'emp-5', paymentMethod: 'bank_transfer', status: 'paid', hasReceipt: true, createdAt: '2025-01-03T08:00:00Z' },
    { id: 'exp-11', description: 'Putovanje Beograd-Nis - sajam', category: 'travel', amount: 28900, date: '2025-01-14', employee: 'Nikola Milovanovic', employeeId: 'emp-5', paymentMethod: 'company_account', status: 'rejected', hasReceipt: true, notes: 'Nije prethodno odobreno', createdAt: '2025-01-14T07:00:00Z' },
    { id: 'exp-12', description: 'Stolice za konferencijsku salu x8', category: 'office', amount: 48000, date: '2025-01-08', employee: 'Ana Popovic', employeeId: 'emp-4', paymentMethod: 'bank_transfer', status: 'paid', hasReceipt: true, createdAt: '2025-01-08T11:00:00Z' },
  ];
}

export function generateMockReports() {
  return [
    { id: 'rep-1', title: 'Putni troškovi - januar', employee: 'Jelena Nikolic', employeeId: 'emp-2', dateFrom: '2025-01-01', dateTo: '2025-01-31', status: 'submitted', totalAmount: 41300, expenseCount: 3, notes: 'Sastanci sa klijentima', createdAt: '2025-01-25T10:00:00Z' },
    { id: 'rep-2', title: 'Marketing - Q1 2025', employee: 'Ana Popovic', employeeId: 'emp-4', dateFrom: '2025-01-01', dateTo: '2025-03-31', status: 'approved', totalAmount: 127000, expenseCount: 2, notes: 'Online i print kampanje', createdAt: '2025-01-20T09:00:00Z' },
    { id: 'rep-3', title: 'IT oprema - januar', employee: 'Stefan Jovanovic', employeeId: 'emp-3', dateFrom: '2025-01-01', dateTo: '2025-01-31', status: 'paid', totalAmount: 160600, expenseCount: 2, notes: 'Nabavka za nove zaposlene', createdAt: '2025-01-28T14:00:00Z' },
  ];
}

export function generateMockBudgets() {
  return [
    { id: 'bud-1', name: 'Kancelarija', category: 'office', allocatedAmount: 150000, spentAmount: 66500, period: 'monthly', startDate: '2025-01-01', endDate: '2025-01-31' },
    { id: 'bud-2', name: 'Putovanja', category: 'travel', allocatedAmount: 100000, spentAmount: 41300, period: 'monthly', startDate: '2025-01-01', endDate: '2025-01-31' },
    { id: 'bud-3', name: 'Oprema', category: 'equipment', allocatedAmount: 200000, spentAmount: 192800, period: 'quarterly', startDate: '2025-01-01', endDate: '2025-03-31' },
    { id: 'bud-4', name: 'Marketing', category: 'marketing', allocatedAmount: 180000, spentAmount: 127000, period: 'monthly', startDate: '2025-01-01', endDate: '2025-01-31' },
    { id: 'bud-5', name: 'Komunalije', category: 'utilities', allocatedAmount: 80000, spentAmount: 38200, period: 'monthly', startDate: '2025-01-01', endDate: '2025-01-31' },
  ];
}

export function generateMockPolicies() {
  return [
    { id: 'pol-1', name: 'Kancelarijski limit', category: 'office', maxAmount: 50000, frequency: 'monthly', approvalThreshold: 20000, isActive: true },
    { id: 'pol-2', name: 'Putni limit', category: 'travel', maxAmount: 80000, frequency: 'monthly', approvalThreshold: 30000, isActive: true },
    { id: 'pol-3', name: 'Oprema - odobrenje menadzera', category: 'equipment', maxAmount: 500000, frequency: 'quarterly', approvalThreshold: 0, isActive: true },
    { id: 'pol-4', name: 'Marketing budzet', category: 'marketing', maxAmount: 200000, frequency: 'monthly', approvalThreshold: 50000, isActive: true },
    { id: 'pol-5', name: 'Komunalije auto', category: 'utilities', maxAmount: 100000, frequency: 'monthly', approvalThreshold: 100000, isActive: false },
  ];
}

export function generateMonthlyTrend() {
  return [
    { month: 'Avg', amount: 380000 },
    { month: 'Sep', amount: 420000 },
    { month: 'Okt', amount: 395000 },
    { month: 'Nov', amount: 450000 },
    { month: 'Dec', amount: 510000 },
    { month: 'Jan', amount: 517100 },
  ];
}

export function generateCategoryDistribution(expenses: Array<{ category: string; amount: number }>) {
  const map: Record<string, number> = {};
  expenses.forEach((e) => {
    map[e.category] = (map[e.category] || 0) + e.amount;
  });
  return Object.entries(map).map(([key, value]) => ({
    name: CATEGORY_LABELS[key] || key,
    value: Math.round(value),
  }));
}

export function generateBudgetVsActual(budgets: Array<{ name: string; allocatedAmount: number; spentAmount: number }>) {
  return budgets.map((b) => ({
    name: b.name,
    budget: b.allocatedAmount,
    actual: b.spentAmount,
  }));
}

export function generateDayOfWeekData() {
  return [
    { day: 'Pon', amount: 85000 },
    { day: 'Uto', amount: 62000 },
    { day: 'Sre', amount: 95000 },
    { day: 'Cet', amount: 78000 },
    { day: 'Pet', amount: 110000 },
    { day: 'Sub', amount: 15000 },
    { day: 'Ned', amount: 5000 },
  ];
}

export function generateDeptComparison() {
  return [
    { dept: 'IT', amount: 160600 },
    { dept: 'Marketing', amount: 127000 },
    { dept: 'HR', amount: 48000 },
    { dept: 'Prodaja', amount: 41300 },
    { dept: 'Admin', amount: 38200 },
  ];
}
