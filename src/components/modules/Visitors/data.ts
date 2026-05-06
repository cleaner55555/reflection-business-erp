// Visitors module – static data, mock data & pure helpers

export const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  expected: { label: 'Očekivan', color: 'bg-amber-100 text-amber-700' },
  checked_in: { label: 'Prijavljen', color: 'bg-green-100 text-green-700' },
  checked_out: { label: 'Odjavljen', color: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'Otkazan', color: 'bg-red-100 text-red-700' },
};

export const PURPOSE_LABELS: Record<string, string> = {
  sastanak: 'Sastanak',
  intervju: 'Intervju',
  isporuka: 'Isporuka',
  servis: 'Servis',
  konsultacija: 'Konsultacija',
  poseta: 'Poseta',
  prezentacija: 'Prezentacija',
  kontrola: 'Kontrola kvaliteta',
  ostalo: 'Ostalo',
};

export const DEPARTMENT_LABELS: Record<string, string> = {
  management: 'Rukovodstvo',
  it: 'IT sektor',
  prodaja: 'Prodaja',
  marketing: 'Marketing',
  finansije: 'Finansije',
  hr: 'Ljudski resursi',
  proizvodnja: 'Proizvodnja',
  magacin: 'Magacin',
  podrška: 'Podrška',
};

export const MOCK_HOSTS = [
  { id: 'emp-01', name: 'Jovan Petrović', department: 'IT sektor' },
  { id: 'emp-02', name: 'Milica Stanković', department: 'Marketing' },
  { id: 'emp-03', name: 'Dragan Milić', department: 'Magacin' },
  { id: 'emp-04', name: 'Snežana Radić', department: 'Ljudski resursi' },
  { id: 'emp-05', name: 'Aleksandar Kovačević', department: 'Prodaja' },
  { id: 'emp-06', name: 'Goran Savić', department: 'Proizvodnja' },
  { id: 'emp-07', name: 'Nenad Đorđević', department: 'Rukovodstvo' },
  { id: 'emp-08', name: 'Zorana Marković', department: 'Finansije' },
  { id: 'emp-09', name: 'Tamara Nikolić', department: 'Podrška' },
];

export const HOURLY_FLOW = [
  { hour: '07:00', count: 3 }, { hour: '08:00', count: 8 }, { hour: '09:00', count: 12 },
  { hour: '10:00', count: 10 }, { hour: '11:00', count: 7 }, { hour: '12:00', count: 4 },
  { hour: '13:00', count: 5 }, { hour: '14:00', count: 6 }, { hour: '15:00', count: 4 },
  { hour: '16:00', count: 2 },
];

export const MONTHLY_TREND = [
  { month: '2025-01', visitors: 87 }, { month: '2025-02', visitors: 92 },
  { month: '2025-03', visitors: 105 }, { month: '2025-04', visitors: 98 },
  { month: '2025-05', visitors: 115 }, { month: '2025-06', visitors: 128 },
  { month: '2025-07', visitors: 76 },
];

// ---- Pure helpers ----

export function formatDuration(minutes: number): string {
  if (!minutes) return '0 min';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export function getNextBadgeNumber(): string {
  const num = Math.floor(Math.random() * 50) + 50;
  return `POS-2025-${String(num).padStart(3, '0')}`;
}
