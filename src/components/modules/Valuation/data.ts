export const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  zatrazeno: { label: 'Na čekanju', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  u_toku: { label: 'U toku', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  zavrseno: { label: 'Završeno', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  otkazano: { label: 'Otkazano', color: 'bg-red-50 text-red-700 border-red-200' },
}

export const DEPARTMENTS = ['Razvoj', 'Marketing', 'Finansije', 'HR', 'Prodaja', 'Operacije']

export const mockEmployees: { id: string; name: string; department: string; position: string }[] = [
  { id: 'emp-1', name: 'Marko Petrović', department: 'Razvoj', position: 'Senior Developer' },
  { id: 'emp-2', name: 'Ana Nikolić', department: 'Marketing', position: 'Marketing Manager' },
  { id: 'emp-3', name: 'Jelena Stanković', department: 'Finansije', position: 'Finansijski analitičar' },
  { id: 'emp-4', name: 'Nikola Ilić', department: 'Razvoj', position: 'Frontend Developer' },
  { id: 'emp-5', name: 'Ivan Đorđević', department: 'HR', position: 'HR Specijalista' },
  { id: 'emp-6', name: 'Marija Todorović', department: 'Prodaja', position: 'Prodajni direktor' },
  { id: 'emp-7', name: 'Petar Jovanović', department: 'Operacije', position: 'Operativni menadžer' },
  { id: 'emp-8', name: 'Snežana Milovanović', department: 'Finansije', position: 'Računovodja' },
  { id: 'emp-9', name: 'Aleksandar Popović', department: 'Razvoj', position: 'QA Inženjer' },
  { id: 'emp-10', name: 'Dragana Mladenović', department: 'Marketing', position: 'Content Specialist' },
]

export const mockCriteria: { id: string; name: string; category: string; description: string; weight: number; scaleMax: number; active: boolean }[] = [
  { id: 'cr-1', name: 'Stručnost', category: 'kompetencije', description: 'Nivo stručnog znanja i veština', weight: 25, scaleMax: 5, active: true },
  { id: 'cr-2', name: 'Timski rad', category: 'kompetencije', description: 'Saradnja i komunikacija u timu', weight: 20, scaleMax: 5, active: true },
  { id: 'cr-3', name: 'Produktivnost', category: 'kpi', description: 'Količina i kvalitet obavljenog posla', weight: 20, scaleMax: 5, active: true },
  { id: 'cr-4', name: 'Inicijativa', category: 'kompetencije', description: 'Proaktivnost i predlaganje rešenja', weight: 15, scaleMax: 5, active: true },
  { id: 'cr-5', name: 'Ciljevi', category: 'ciljevi', description: 'Postizanje postavljenih ciljeva', weight: 15, scaleMax: 5, active: true },
  { id: 'cr-6', name: 'Vodstvo', category: 'kompetencije', description: 'Vođenje i motivisanje tima', weight: 5, scaleMax: 5, active: false },
]

export const mockPeriods: { period: string; avgRating: number; completedCount: number; totalCount: number }[] = [
  { period: 'Q3 2024', avgRating: 3.6, completedCount: 7, totalCount: 8 },
  { period: 'Q4 2024', avgRating: 3.8, completedCount: 8, totalCount: 9 },
  { period: 'Q1 2025', avgRating: 4.1, completedCount: 6, totalCount: 10 },
]

export function getRatingColor(value: number): string {
  if (value >= 4.5) return 'text-emerald-600'
  if (value >= 4.0) return 'text-emerald-500'
  if (value >= 3.5) return 'text-amber-500'
  if (value >= 3.0) return 'text-orange-500'
  return 'text-red-500'
}

export function getRatingBg(value: number): string {
  if (value >= 4.5) return 'bg-emerald-50'
  if (value >= 4.0) return 'bg-emerald-50'
  if (value >= 3.5) return 'bg-amber-50'
  if (value >= 3.0) return 'bg-orange-50'
  return 'bg-red-50'
}

export function getRatingBarColor(value: number): string {
  if (value >= 4.5) return 'bg-emerald-500'
  if (value >= 4.0) return 'bg-emerald-400'
  if (value >= 3.5) return 'bg-amber-400'
  if (value >= 3.0) return 'bg-orange-400'
  return 'bg-red-400'
}

export function calcOverall(scores: { competencyId: string; score: number }[], criteria: { id: string; weight: number; active: boolean }[]): number {
  const active = criteria.filter(c => c.active)
  if (!active.length) return 0
  let totalWeight = 0
  let weightedSum = 0
  for (const crit of active) {
    const sc = scores.find(s => s.competencyId === crit.id)
    const val = sc?.score || 0
    weightedSum += val * crit.weight
    totalWeight += crit.weight
  }
  return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : 0
}

export function getCategoryLabel(category: string): string {
  if (category === 'kompetencije') return 'Kompetencije'
  if (category === 'kpi') return 'KPI'
  if (category === 'ciljevi') return 'Ciljevi'
  return category
}

export function getCategoryColor(category: string): string {
  if (category === 'kompetencije') return 'bg-blue-50 text-blue-700 border-blue-200'
  if (category === 'kpi') return 'bg-violet-50 text-violet-700 border-violet-200'
  return 'bg-emerald-50 text-emerald-700 border-emerald-200'
}
