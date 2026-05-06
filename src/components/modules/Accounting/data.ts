// Accounting module – static data & pure helpers

export const ACCOUNT_TYPES = [
  { value: 'aktivna', label: 'Aktivna', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'pasivna', label: 'Pasivna', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'prihodka', label: 'Prihodna', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { value: 'rashodna', label: 'Rashodna', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'kontna', label: 'Kontna', color: 'bg-violet-50 text-violet-700 border-violet-200' },
] as const;

export const MONTH_KEYS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
] as const;

export const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun',
  'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec',
] as const;

export function getAccountTypeBadge(type: string) {
  const found = ACCOUNT_TYPES.find((t) => t.value === type);
  return found || { label: type, color: 'bg-slate-100 text-slate-700 border-slate-200' };
}
