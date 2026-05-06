export const STATUS_CONFIG: Record<string, { label: string; color: string; nextStatus?: string }> = {
  scheduled: { label: 'Zakazano', color: 'bg-blue-100 text-blue-700', nextStatus: 'confirmed' },
  confirmed: { label: 'Potvrđeno', color: 'bg-green-100 text-green-700', nextStatus: 'in_progress' },
  in_progress: { label: 'U toku', color: 'bg-amber-100 text-amber-700', nextStatus: 'completed' },
  completed: { label: 'Završeno', color: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Otkazano', color: 'bg-red-100 text-red-700' },
  no_show: { label: 'Nije se pojavio', color: 'bg-gray-100 text-gray-700' },
}

export const TYPE_LABELS: Record<string, string> = {
  consultation: 'Konsultacija',
  followup: 'Kontrola',
  initial: 'Prvi pregled',
  emergency: 'Hitno',
  online: 'Online',
}

export const TYPE_COLORS: Record<string, string> = {
  consultation: '#3b82f6',
  followup: '#10b981',
  initial: '#f59e0b',
  emergency: '#ef4444',
  online: '#8b5cf6',
}

export const CATEGORY_LABELS: Record<string, string> = {
  konsultacija: 'Konsultacija',
  tretman: 'Tretman',
  analiza: 'Analiza',
  procedure: 'Procedure',
  drustveno: 'Društveno',
}

export const CATEGORY_COLORS: Record<string, string> = {
  konsultacija: '#3b82f6',
  tretman: '#10b981',
  analiza: '#f59e0b',
  procedure: '#ef4444',
  drustveno: '#8b5cf6',
}

export const REMINDER_LABELS: Record<string, string> = {
  sent: 'Poslata',
  pending: 'Na čekanju',
  not_sent: 'Nije poslata',
}

export const DAYS_SR: Record<string, string> = {
  mon: 'Pon', tue: 'Uto', wed: 'Sre', thu: 'Čet', fri: 'Pet', sat: 'Sub', sun: 'Ned',
}

export const DAYS_FULL: Record<string, string> = {
  mon: 'Ponedeljak', tue: 'Utorak', wed: 'Sreda', thu: 'Četvrtak', fri: 'Petak', sat: 'Subota', sun: 'Nedelja',
}

export const MOCK_CLIENTS: Client[] = [
  { id: 'c1', name: 'Jovan Petrović', phone: '+38163111222', email: 'jovan@email.com', appointmentCount: 12, totalSpent: 45000, lastVisit: '2025-01-10', isVip: true, notes: 'Redovan klijent', preferences: 'Preferira jutarnje termine' },
  { id: 'c2', name: 'Ana Marković', phone: '+38164222333', email: 'ana@email.com', appointmentCount: 5, totalSpent: 18000, lastVisit: '2025-01-08', isVip: false, notes: '', preferences: '' },
  { id: 'c3', name: 'Milan Stanković', phone: '+38165333444', email: 'milan@email.com', appointmentCount: 20, totalSpent: 89000, lastVisit: '2025-01-12', isVip: true, notes: 'VIP klijent od 2023', preferences: 'Samo četvrtkom' },
  { id: 'c4', name: 'Jelena Nikolić', phone: '+38166444555', email: 'jelena@email.com', appointmentCount: 3, totalSpent: 12000, lastVisit: '2025-01-05', isVip: false, notes: '', preferences: '' },
  { id: 'c5', name: 'Nenad Jovanović', phone: '+38167555666', email: 'nenad@email.com', appointmentCount: 8, totalSpent: 32000, lastVisit: '2025-01-11', isVip: false, notes: 'Alergija na neke supstance', preferences: 'Popodnevni termini' },
]

export const MOCK_SERVICES: Service[] = [
  { id: 's1', name: 'Opšta konsultacija', description: 'Inicijalni pregled i procena', duration: 30, price: 3000, category: 'konsultacija', bookingCount: 45 },
  { id: 's2', name: 'Kontrolni pregled', description: 'Kontrola nakon tretmana', duration: 15, price: 1500, category: 'konsultacija', bookingCount: 32 },
  { id: 's3', name: 'Dubinski tretman', description: 'Intenzivan tretman lica', duration: 60, price: 5000, category: 'tretman', bookingCount: 28 },
  { id: 's4', name: 'Hidratacija', description: 'Tretman hidratacije kože', duration: 45, price: 4000, category: 'tretman', bookingCount: 38 },
  { id: 's5', name: 'Analiza kože', description: 'Detaljna analiza tipa kože', duration: 30, price: 2500, category: 'analiza', bookingCount: 22 },
  { id: 's6', name: 'Piling', description: 'Hemijski piling lica', duration: 45, price: 3500, category: 'procedure', bookingCount: 19 },
  { id: 's7', name: 'Individualna edukacija', description: 'Jedan na jedan sesija', duration: 60, price: 6000, category: 'drustveno', bookingCount: 8 },
]

export const MOCK_STAFF: StaffMember[] = [
  { id: 'st1', name: 'Dr. Marina Kovačević', specialties: 'Konsultacije, Tretmani', workingDays: ['mon', 'tue', 'wed', 'thu', 'fri'], maxPerDay: 8, isActive: true },
  { id: 'st2', name: 'Nevena Popović', specialties: 'Analize, Procedure', workingDays: ['mon', 'wed', 'fri'], maxPerDay: 6, isActive: true },
  { id: 'st3', name: 'Aleksandar Đorđević', specialties: 'Online konsultacije', workingDays: ['tue', 'thu', 'sat'], maxPerDay: 5, isActive: true },
]

export const DEFAULT_SETTINGS: AppSettings = {
  workStart: '08:00', workEnd: '20:00', lunchStart: '12:00', lunchEnd: '13:00',
  slotDuration: 30, bufferTime: 15, reminder24h: true, reminder1h: true,
  cancelMaxHours: 24, cancelPenalty: 1000, bookingUrl: '',
}

export const WEEK_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

export const TIME_SLOTS = Array.from({ length: 25 }, (_, i) => {
  const h = Math.floor((8 * 60 + i * 30) / 60)
  const m = (8 * 60 + i * 30) % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
});

export const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export const cfg = STATUS_CONFIG[status]

export const labels: Record<string, { text: string; color: string }> = {
    sent: { text: 'Poslata', color: 'bg-green-100 text-green-700' },
    pending: { text: 'Na čekanju', color: 'bg-amber-100 text-amber-700' },
    not_sent: { text: 'Nije poslata', color: 'bg-gray-100 text-gray-600' },
  }

export const cfg = labels[status]

export const { activeCompanyId } = useAppStore();
