export const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  zatrazeno: { label: 'Na čekanju', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  u_toku: { label: 'U toku', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  zavrseno: { label: 'Završeno', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  otkazano: { label: 'Otkazano', color: 'bg-red-50 text-red-700 border-red-200' },
}

export const DEPARTMENTS = ['Razvoj', 'Marketing', 'Finansije', 'HR', 'Prodaja', 'Operacije']

export const mockEmployees: Employee[] = [
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

export const mockCriteria: Criterion[] = [
  { id: 'cr-1', name: 'Stručnost', category: 'kompetencije', description: 'Nivo stručnog znanja i veština', weight: 25, scaleMax: 5, active: true },
  { id: 'cr-2', name: 'Timski rad', category: 'kompetencije', description: 'Saradnja i komunikacija u timu', weight: 20, scaleMax: 5, active: true },
  { id: 'cr-3', name: 'Produktivnost', category: 'kpi', description: 'Količina i kvalitet obavljenog posla', weight: 20, scaleMax: 5, active: true },
  { id: 'cr-4', name: 'Inicijativa', category: 'kompetencije', description: 'Proaktivnost i predlaganje rešenja', weight: 15, scaleMax: 5, active: true },
  { id: 'cr-5', name: 'Ciljevi', category: 'ciljevi', description: 'Postizanje postavljenih ciljeva', weight: 15, scaleMax: 5, active: true },
  { id: 'cr-6', name: 'Vodstvo', category: 'kompetencije', description: 'Vođenje i motivisanje tima', weight: 5, scaleMax: 5, active: false },
]

export const mockAppraisals: Appraisal[] = [
  {
    id: 'ap-1', employeeId: 'emp-1', employeeName: 'Marko Petrović', department: 'Razvoj', period: 'Q1 2025',
    status: 'zavrseno', overallRating: 4.7,
    competencyScores: [
      { competencyId: 'cr-1', score: 5 }, { competencyId: 'cr-2', score: 4 }, { competencyId: 'cr-3', score: 5 },
      { competencyId: 'cr-4', score: 5 }, { competencyId: 'cr-5', score: 4 },
    ],
    strengths: 'Izuzetan tehnički znalac, samostalan u rešavanju složenih problema.',
    improvements: 'Može poboljšati prezentacione veštine.',
    goals: 'Preuzimanje uloge tech lead-a na novom projektu.',
    evaluatedBy: 'Ana Nikolić', evaluatedAt: '2025-01-15T10:00:00', createdAt: '2025-01-01T08:00:00',
  },
  {
    id: 'ap-2', employeeId: 'emp-2', employeeName: 'Ana Nikolić', department: 'Marketing', period: 'Q1 2025',
    status: 'zavrseno', overallRating: 4.3,
    competencyScores: [
      { competencyId: 'cr-1', score: 4 }, { competencyId: 'cr-2', score: 5 }, { competencyId: 'cr-3', score: 4 },
      { competencyId: 'cr-4', score: 4 }, { competencyId: 'cr-5', score: 5 },
    ],
    strengths: 'Odličan strateg, uspešno vodi marketinške kampanje.',
    improvements: 'Potrebno više posvećenosti analitici.',
    goals: 'Povećati ROI marketinških aktivnosti za 20%.',
    evaluatedBy: 'Marija Todorović', evaluatedAt: '2025-01-18T14:00:00', createdAt: '2025-01-02T09:00:00',
  },
  {
    id: 'ap-3', employeeId: 'emp-3', employeeName: 'Jelena Stanković', department: 'Finansije', period: 'Q1 2025',
    status: 'zavrseno', overallRating: 4.0,
    competencyScores: [
      { competencyId: 'cr-1', score: 4 }, { competencyId: 'cr-2', score: 4 }, { competencyId: 'cr-3', score: 4 },
      { competencyId: 'cr-4', score: 3 }, { competencyId: 'cr-5', score: 5 },
    ],
    strengths: 'Precizna i pouzdana u finansijskom izveštavanju.',
    improvements: 'Aktivnije učešće u timskim projektima.',
    goals: 'Certifikacija za naprednu finansijsku analizu.',
    evaluatedBy: 'Snežana Milovanović', evaluatedAt: '2025-01-20T11:00:00', createdAt: '2025-01-03T08:00:00',
  },
  {
    id: 'ap-4', employeeId: 'emp-4', employeeName: 'Nikola Ilić', department: 'Razvoj', period: 'Q1 2025',
    status: 'u_toku', overallRating: 0,
    competencyScores: [
      { competencyId: 'cr-1', score: 0 }, { competencyId: 'cr-2', score: 0 }, { competencyId: 'cr-3', score: 0 },
      { competencyId: 'cr-4', score: 0 }, { competencyId: 'cr-5', score: 0 },
    ],
    strengths: '', improvements: '', goals: '',
    evaluatedBy: 'Marko Petrović', evaluatedAt: '', createdAt: '2025-01-10T08:00:00',
  },
  {
    id: 'ap-5', employeeId: 'emp-5', employeeName: 'Ivan Đorđević', department: 'HR', period: 'Q1 2025',
    status: 'zavrseno', overallRating: 3.7,
    competencyScores: [
      { competencyId: 'cr-1', score: 4 }, { competencyId: 'cr-2', score: 4 }, { competencyId: 'cr-3', score: 3 },
      { competencyId: 'cr-4', score: 3 }, { competencyId: 'cr-5', score: 4 },
    ],
    strengths: 'Odlične komunikacijske veštine sa zaposlenima.',
    improvements: 'Brža obrada zahteva za zapošljavanje.',
    goals: 'Smanjiti vreme zapošljavanja za 30%.',
    evaluatedBy: 'Marija Todorović', evaluatedAt: '2025-01-22T09:00:00', createdAt: '2025-01-05T08:00:00',
  },
  {
    id: 'ap-6', employeeId: 'emp-6', employeeName: 'Marija Todorović', department: 'Prodaja', period: 'Q1 2025',
    status: 'zavrseno', overallRating: 4.5,
    competencyScores: [
      { competencyId: 'cr-1', score: 5 }, { competencyId: 'cr-2', score: 4 }, { competencyId: 'cr-3', score: 5 },
      { competencyId: 'cr-4', score: 4 }, { competencyId: 'cr-5', score: 5 },
    ],
    strengths: 'Izvanredni rezultati u prodaji, premašila ciljeve za 15%.',
    improvements: 'Balansiranje između strateškog i operativnog rada.',
    goals: 'Proširenje na nova tržišta u regionu.',
    evaluatedBy: 'Petar Jovanović', evaluatedAt: '2025-01-17T16:00:00', createdAt: '2025-01-04T08:00:00',
  },
  {
    id: 'ap-7', employeeId: 'emp-7', employeeName: 'Petar Jovanović', department: 'Operacije', period: 'Q1 2025',
    status: 'zatrazeno', overallRating: 0,
    competencyScores: [
      { competencyId: 'cr-1', score: 0 }, { competencyId: 'cr-2', score: 0 }, { competencyId: 'cr-3', score: 0 },
      { competencyId: 'cr-4', score: 0 }, { competencyId: 'cr-5', score: 0 },
    ],
    strengths: '', improvements: '', goals: '',
    evaluatedBy: '', evaluatedAt: '', createdAt: '2025-01-20T08:00:00',
  },
  {
    id: 'ap-8', employeeId: 'emp-8', employeeName: 'Snežana Milovanović', department: 'Finansije', period: 'Q1 2025',
    status: 'zavrseno', overallRating: 3.3,
    competencyScores: [
      { competencyId: 'cr-1', score: 3 }, { competencyId: 'cr-2', score: 4 }, { competencyId: 'cr-3', score: 3 },
      { competencyId: 'cr-4', score: 3 }, { competencyId: 'cr-5', score: 3 },
    ],
    strengths: 'Pouzdana u svakodnevnim računovodstvenim zadacima.',
    improvements: 'Potrebno usavršavanje u oblasti poreskog zakonodavstva.',
    goals: 'Uspešno završiti kurs iz poreskog prava.',
    evaluatedBy: 'Jelena Stanković', evaluatedAt: '2025-01-25T10:00:00', createdAt: '2025-01-08T08:00:00',
  },
  {
    id: 'ap-9', employeeId: 'emp-9', employeeName: 'Aleksandar Popović', department: 'Razvoj', period: 'Q1 2025',
    status: 'zavrseno', overallRating: 4.0,
    competencyScores: [
      { competencyId: 'cr-1', score: 4 }, { competencyId: 'cr-2', score: 4 }, { competencyId: 'cr-3', score: 4 },
      { competencyId: 'cr-4', score: 4 }, { competencyId: 'cr-5', score: 4 },
    ],
    strengths: 'Sistematičan pristup testiranju, smanjio bugove za 40%.',
    improvements: 'Automatizacija većeg broja test slučajeva.',
    goals: 'Uvesti CI/CD testing pipeline.',
    evaluatedBy: 'Marko Petrović', evaluatedAt: '2025-01-19T13:00:00', createdAt: '2025-01-06T08:00:00',
  },
  {
    id: 'ap-10', employeeId: 'emp-10', employeeName: 'Dragana Mladenović', department: 'Marketing', period: 'Q1 2025',
    status: 'otkazano', overallRating: 0,
    competencyScores: [
      { competencyId: 'cr-1', score: 0 }, { competencyId: 'cr-2', score: 0 }, { competencyId: 'cr-3', score: 0 },
      { competencyId: 'cr-4', score: 0 }, { competencyId: 'cr-5', score: 0 },
    ],
    strengths: '', improvements: '', goals: '',
    evaluatedBy: '', evaluatedAt: '', createdAt: '2025-01-12T08:00:00',
  },
]

export const mockPeriods: PeriodData[] = [
  { period: 'Q3 2024', avgRating: 3.6, completedCount: 7, totalCount: 8 },
  { period: 'Q4 2024', avgRating: 3.8, completedCount: 8, totalCount: 9 },
  { period: 'Q1 2025', avgRating: 4.1, completedCount: 6, totalCount: 10 },
]

export const display = hovered || value;

export const active = criteria.filter(c => c.active);

export const sc = scores.find(s => s.competencyId === crit.id);

export const val = sc?.score || 0;

export const { activeCompanyId } = useAppStore();

export const { t } = useTranslation();

export const emptyScores = mockCriteria.map(c => ({ competencyId: c.id, score: 0 }));

export const res = await fetch(`/api/employee-evaluations?companyId=${activeCompanyId || ''}`);

export const data = await res.json();

export const completed = appraisals.filter(a => a.status === 'zavrseno');

export const pending = appraisals.filter(a => a.status === 'zatrazeno' || a.status === 'u_toku');

export const avgRating = completed.length > 0 ? Math.round((completed.reduce((s, a) => s + a.overallRating, 0) / completed.length) * 10) / 10 : 0;

export const deptsCovered = [...new Set(appraisals.filter(a => a.status === 'zavrseno').map(a => a.department))].length;

export const ratingDistribution = [5, 4, 3, 2, 1].map(r => ({
    rating: r,
    count: completed.filter(a => Math.round(a.overallRating) === r).length,
  }));

export const maxDistCount = Math.max(...ratingDistribution.map(d => d.count), 1);

export const deptAverages = DEPARTMENTS.map(dept => {
    const deptCompleted = completed.filter(a => a.department === dept)
    const avg = deptCompleted.length > 0 ? Math.round((deptCompleted.reduce((s, a) => s + a.overallRating, 0) / deptCompleted.length) * 10) / 10 : 0
    return { department: dept, avg, count: deptCompleted.length }
  }).filter(d => d.count > 0).sort((a, b) => b.avg - a.avg);

export const filteredAppraisals = appraisals.filter(a => {
    if (search) {
      const s = search.toLowerCase()
      if (!a.employeeName.toLowerCase().includes(s) && !a.department.toLowerCase().includes(s)) return false
    }
    if (statusFilter !== 'all' && a.status !== statusFilter) return false
    if (deptFilter !== 'all' && a.department !== deptFilter) return false
    if (periodFilter !== 'all' && a.period !== periodFilter) return false
    return true
  });

export const topPerformers = [...completed].sort((a, b) => b.overallRating - a.overallRating).slice(0, 5);

export const handleCreate = () => {
    if (!createForm.employeeId) { toast.error('Izaberite zaposlenog'); return }
    const emp = employees.find(e => e.id === createForm.employeeId)
    const overall = calcOverall(createForm.scores, criteria)
    const newAppraisal: Appraisal = {
      id: `ap-${Date.now()}`,
      employeeId: createForm.employeeId,
      employeeName: emp?.name || '',
      department: emp?.department || '',
      period: createForm.period,
      status: 'zavrseno',
      overallRating: overall,
      competencyScores: createForm.scores,
      strengths: createForm.strengths,
      improvements: createForm.improvements,
      goals: createForm.goals,
      evaluatedBy: 'Trenutni korisnik',
      evaluatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
    setAppraisals([newAppraisal, ...appraisals])
    setCreateOpen(false)
    setCreateForm({ employeeId: '', period: 'Q1 2025', scores: emptyScores, strengths: '', improvements: '', goals: '' })
    toast.success('Ocenjivanje uspešno kreirano')
  }

export const handleDelete = (id: string) => {
    if (!confirm('Obrisati ocenjivanje?')) return
    setAppraisals(appraisals.filter(a => a.id !== id))
    toast.success('Ocenjivanje obrisano')
  }

export const stCfg = STATUS_CONFIG[ap.status]

export const catLabel = crit.category === 'kompetencije' ? 'Kompetencije' : crit.category === 'kpi' ? 'KPI' : 'Ciljevi';

export const catColor = crit.category === 'kompetencije' ? 'bg-blue-50 text-blue-700 border-blue-200' : crit.category === 'kpi' ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200';

export const prevIdx = mockPeriods.indexOf(p) - 1;

export const prev = prevIdx >= 0 ? mockPeriods[prevIdx].avgRating : null;

export const trend = prev !== null ? p.avgRating - prev : 0;

export const deptAp = completed.filter(a => a.department === dept);

export const avg = deptAp.length > 0 ? Math.round((deptAp.reduce((s, a) => s + a.overallRating, 0) / deptAp.length) * 10) / 10 : 0;

export const maxR = 5;

export const scores = completed.flatMap(a => a.competencyScores).filter(s => s.competencyId === crit.id && s.score > 0);

export const avg = scores.length > 0 ? Math.round((scores.reduce((s, sc) => s + sc.score, 0) / scores.length) * 10) / 10 : 0;

export const currentScore = createForm.scores.find(s => s.competencyId === crit.id)?.score || 0;

export const sc = selected.competencyScores.find(s => s.competencyId === crit.id);

export const val = sc?.score || 0;

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

export function calcOverall(scores: CompetencyScore[], criteria: Criterion[]): number {
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
