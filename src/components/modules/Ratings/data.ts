export const targetTypeConfig: Record<string, { label: string; color: string; icon: string }> = {
  partner: { label: 'Partner', color: 'bg-blue-100 text-blue-700', icon: '🏢' },
  vendor: { label: 'Dobavljač', color: 'bg-purple-100 text-purple-700', icon: '📦' },
  employee: { label: 'Zaposleni', color: 'bg-green-100 text-green-700', icon: '👤' },
  product: { label: 'Proizvod', color: 'bg-orange-100 text-orange-700', icon: '🔧' },
  service: { label: 'Usluga', color: 'bg-cyan-100 text-cyan-700', icon: '⚡' },
}

export const categoryConfig: Record<string, { label: string; color: string }> = {
  delivery: { label: 'Isporuka', color: 'bg-blue-100 text-blue-700' },
  support: { label: 'Podrška', color: 'bg-green-100 text-green-700' },
  quality: { label: 'Kvalitet', color: 'bg-orange-100 text-orange-700' },
  pricing: { label: 'Cene', color: 'bg-red-100 text-red-700' },
  communication: { label: 'Komunikacija', color: 'bg-purple-100 text-purple-700' },
  reliability: { label: 'Pouzdanost', color: 'bg-cyan-100 text-cyan-700' },
  expertise: { label: 'Stručnost', color: 'bg-amber-100 text-amber-700' },
  responsiveness: { label: 'Reaktivnost', color: 'bg-emerald-100 text-emerald-700' },
}

export const surveyStatusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-700' },
  active: { label: 'Aktivna', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Zatvorena', color: 'bg-amber-100 text-amber-700' },
}

export const ratingCriteria: RatingCriteria[] = [
  { id: 'cr-1', name: 'Kvalitet', description: 'Kvalitet proizvoda ili usluge', weight: 30, scaleMax: 5, category: 'quality' },
  { id: 'cr-2', name: 'Usluga', description: 'Kvalitet usluživanja i podrške', weight: 25, scaleMax: 5, category: 'support' },
  { id: 'cr-3', name: 'Cena', description: 'Odnos cene i kvaliteta', weight: 20, scaleMax: 5, category: 'pricing' },
  { id: 'cr-4', name: 'Vreme', description: 'Vreme isporuke ili realizacije', weight: 15, scaleMax: 5, category: 'delivery' },
  { id: 'cr-5', name: 'Komunikacija', description: 'Komunikacija i odgovornost', weight: 10, scaleMax: 5, category: 'communication' },
]

export const mockRatings: Rating[] = [
  { id: 'r-1', targetType: 'partner', targetId: 'p-1', targetName: 'ABC d.o.o.', category: 'quality', quality: 5, service: 4, price: 3, time: 4, overall: 4.2, comment: 'Odličan partner za razvoj softvera.', ratedBy: 'Marko Petrović', ratedAt: '2025-01-18T10:00:00' },
  { id: 'r-2', targetType: 'vendor', targetId: 'v-1', targetName: 'TechSupply d.o.o.', category: 'delivery', quality: 4, service: 3, price: 4, time: 5, overall: 4.0, comment: 'Brza isporuka, dobri proizvodi.', ratedBy: 'Jelena Stanković', ratedAt: '2025-01-17T14:00:00' },
  { id: 'r-3', targetType: 'employee', targetId: 'e-1', targetName: 'Marko Petrović', category: 'expertise', quality: 5, service: 5, price: 0, time: 4, overall: 4.7, comment: 'Izvanredna stručnost i predanost.', ratedBy: 'Ana Nikolić', ratedAt: '2025-01-16T09:00:00' },
  { id: 'r-4', targetType: 'partner', targetId: 'p-2', targetName: 'XYZ Solutions', category: 'communication', quality: 3, service: 4, price: 3, time: 3, overall: 3.3, comment: 'Komunikacija može biti bolja.', ratedBy: 'Petar Jovanović', ratedAt: '2025-01-15T11:00:00' },
  { id: 'r-5', targetType: 'vendor', targetId: 'v-2', targetName: 'OfficeMax', category: 'reliability', quality: 4, service: 4, price: 5, time: 4, overall: 4.3, comment: 'Pouzdani dobavljač kancelarijskog materijala.', ratedBy: 'Nikola Ilić', ratedAt: '2025-01-14T16:00:00' },
  { id: 'r-6', targetType: 'product', targetId: 'pr-1', targetName: 'ERP Modul - Knjigovodstvo', category: 'quality', quality: 5, service: 4, price: 3, time: 0, overall: 4.2, comment: 'SOLID modul za knjigovodstvo.', ratedBy: 'Ana Nikolić', ratedAt: '2025-01-13T10:00:00' },
  { id: 'r-7', targetType: 'service', targetId: 's-1', targetName: 'IT Podrška', category: 'responsiveness', quality: 4, service: 3, price: 0, time: 5, overall: 4.0, comment: 'Brza reakcija na probleme.', ratedBy: 'Ivan Đorđević', ratedAt: '2025-01-12T08:00:00' },
  { id: 'r-8', targetType: 'partner', targetId: 'p-3', targetName: 'DesignLab', category: 'quality', quality: 4, service: 5, price: 2, time: 4, overall: 3.8, comment: 'Odličan dizajn, ali skupo.', ratedBy: 'Jelena Stanković', ratedAt: '2025-01-11T13:00:00' },
  { id: 'r-9', targetType: 'employee', targetId: 'e-2', targetName: 'Ana Nikolić', category: 'leadership', quality: 5, service: 5, price: 0, time: 5, overall: 5.0, comment: 'Izuzetan timski lead.', ratedBy: 'Jelena Stanković', ratedAt: '2025-01-10T09:00:00' },
  { id: 'r-10', targetType: 'vendor', targetId: 'v-3', targetName: 'CloudHost', category: 'reliability', quality: 4, service: 4, price: 4, time: 4, overall: 4.0, comment: 'Stabilan hosting servis.', ratedBy: 'Nikola Ilić', ratedAt: '2025-01-09T15:00:00' },
]

export const mockSurveys: Survey[] = [
  { id: 'sv-1', name: 'Zadovoljstvo partnera Q4 2024', description: 'Quarterly partner satisfaction survey', status: 'closed', questionCount: 12, responseCount: 34, avgRating: 4.1, createdAt: '2024-10-01' },
  { id: 'sv-2', name: 'Evaluacija dobavljača', description: 'Godišnja evaluacija dobavljača', status: 'active', questionCount: 8, responseCount: 15, avgRating: 3.8, createdAt: '2025-01-01' },
  { id: 'sv-3', name: 'Anketa o zadovoljstvu zaposlenih', description: 'Internal employee satisfaction survey', status: 'active', questionCount: 20, responseCount: 22, avgRating: 4.3, createdAt: '2025-01-10' },
  { id: 'sv-4', name: 'NPS - Klijenti', description: 'Net Promoter Score za klijente', status: 'closed', questionCount: 5, responseCount: 50, avgRating: 4.5, createdAt: '2024-11-15' },
]

export const mockReports: RatingReport[] = [
  {
    id: 'rep-1', period: 'Januar 2025', totalRatings: 45, avgOverall: 4.1, avgQuality: 4.3, avgService: 4.0, avgPrice: 3.5, avgTime: 4.2,
    trend: 'up', trendValue: 0.3,
    topRated: [
      { name: 'Ana Nikolić', rating: 5.0, count: 3 },
      { name: 'TechSupply d.o.o.', rating: 4.3, count: 5 },
      { name: 'ERP Modul - Knjigovodstvo', rating: 4.2, count: 4 },
    ],
    bottomRated: [
      { name: 'XYZ Solutions', rating: 3.3, count: 2 },
      { name: 'DesignLab', rating: 3.8, count: 3 },
    ],
    categoryBreakdown: [
      { category: 'quality', avg: 4.3, count: 20 },
      { category: 'support', avg: 4.0, count: 15 },
      { category: 'delivery', avg: 4.2, count: 12 },
      { category: 'pricing', avg: 3.5, count: 10 },
      { category: 'communication', avg: 3.9, count: 18 },
    ],
    monthlyData: [
      { month: 'Avg', avg: 3.8, count: 30 },
      { month: 'Sep', avg: 3.9, count: 35 },
      { month: 'Okt', avg: 4.0, count: 40 },
      { month: 'Nov', avg: 3.9, count: 38 },
      { month: 'Dec', avg: 4.1, count: 42 },
      { month: 'Jan', avg: 4.1, count: 45 },
    ],
  },
]

export const mockDashboard: RatingDashboard = {
  totalRatings: 256,
  avgRating: 4.1,
  responseRate: 78,
  trendDirection: 'up',
  trendValue: 0.2,
  distribution: [
    { rating: 5, count: 85, percentage: 33.2 },
    { rating: 4, count: 98, percentage: 38.3 },
    { rating: 3, count: 45, percentage: 17.6 },
    { rating: 2, count: 18, percentage: 7.0 },
    { rating: 1, count: 10, percentage: 3.9 },
  ],
  topCategories: [
    { category: 'quality', avg: 4.3, count: 85 },
    { category: 'support', avg: 4.0, count: 72 },
    { category: 'reliability', avg: 4.0, count: 65 },
    { category: 'delivery', avg: 3.9, count: 58 },
    { category: 'communication', avg: 3.8, count: 90 },
    { category: 'pricing', avg: 3.5, count: 45 },
  ],
  recentRatings: mockRatings.slice(0, 5),
  reports: mockReports,
}

export const displayValue = hovered || value;

export const sizeClass = size === 'lg' ? 'h-6 w-6' : size === 'md' ? 'h-5 w-5' : 'h-4 w-4';

export const { activeCompanyId } = useAppStore();
