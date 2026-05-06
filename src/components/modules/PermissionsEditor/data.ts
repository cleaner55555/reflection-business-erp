// PermissionsEditor module – static data & configuration maps

export const MODULE_LABELS: Record<string, { label: string; icon: string }> = {
  dashboard: { label: 'Dashboard', icon: '📊' },
  finansije: { label: 'Finansije', icon: '💰' },
  fakture: { label: 'Fakture', icon: '📄' },
  magacin: { label: 'Magacin', icon: '🏭' },
  partneri: { label: 'Partneri', icon: '🤝' },
  nabavka: { label: 'Nabavka', icon: '🛒' },
  crm: { label: 'CRM', icon: '❤️' },
  kalendar: { label: 'Kalendar', icon: '📅' },
  zaposleni: { label: 'Zaposleni', icon: '👥' },
  projekti: { label: 'Projekti', icon: '📁' },
  sredstva: { label: 'Sredstva', icon: '🏗️' },
  dokumenta: { label: 'Dokumenta', icon: '📂' },
  knjigovodstvo: { label: 'Knjigovodstvo', icon: '📒' },
  protokol: { label: 'Protokol', icon: '📬' },
  edukacija: { label: 'Edukacija', icon: '🎓' },
  'vozni-park': { label: 'Vozni park', icon: '🚗' },
  'kafe-restoran': { label: 'Kafe restoran', icon: '☕' },
  'email-marketing': { label: 'Email Marketing', icon: '✉️' },
  'rent-a-car': { label: 'Rent a car', icon: '🚙' },
  izvestaji: { label: 'Izveštaji', icon: '📈' },
  podesavanja: { label: 'Podešavanja', icon: '⚙️' },
  integracije: { label: 'Integracije', icon: '🔌' },
  'bank-sync': { label: 'Bank Sync', icon: '🏦' },
  notifications: { label: 'Notifikacije', icon: '🔔' },
  zakoni: { label: 'Zakoni', icon: '⚖️' },
};

export const ACTIONS = ['read', 'create', 'write', 'delete'] as const;

export const ACTION_LABELS: Record<string, string> = {
  read: 'Čitanje',
  create: 'Kreiranje',
  write: 'Izmena',
  delete: 'Brisanje',
};

export const MODULE_GROUPS: Array<{ label: string; icon: string; modules: string[] }> = [
  { label: 'Pregled', icon: '📊', modules: ['dashboard'] },
  { label: 'Finansije', icon: '💰', modules: ['finansije', 'fakture', 'knjigovodstvo', 'bank-sync', 'izvestaji'] },
  { label: 'Prodaja & CRM', icon: '❤️', modules: ['crm', 'partneri', 'kalendar'] },
  { label: 'Lanac snabdevanja', icon: '🏭', modules: ['magacin', 'nabavka'] },
  { label: 'Organizacija', icon: '👥', modules: ['zaposleni', 'projekti', 'sredstva', 'dokumenta', 'protokol'] },
  { label: 'Servisi', icon: '🔧', modules: ['edukacija', 'vozni-park', 'kafe-restoran', 'email-marketing', 'rent-a-car'] },
  { label: 'Sistem', icon: '⚙️', modules: ['podesavanja', 'integracije', 'notifications', 'zakoni'] },
];

export const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-700 border-red-200',
  knjigovodac: 'bg-sky-100 text-sky-700 border-sky-200',
  prodavac: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  magacioner: 'bg-amber-100 text-amber-700 border-amber-200',
  hr: 'bg-violet-100 text-violet-700 border-violet-200',
  read_only: 'bg-slate-100 text-slate-600 border-slate-200',
};

// ---- Pure helpers ----

export function getRoleColor(name: string): string {
  return ROLE_COLORS[name] || 'bg-slate-100 text-slate-600 border-slate-200';
}
