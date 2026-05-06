'use client'

import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
import { formatDate } from '@/lib/helpers'
import { toast } from 'sonner'

import { useValuation } from './hooks'

export function Taksacija() {
  const {activeTab, appraisals, completed, createOpen, criteria, currentScore, d, deptAp, deptAverages, deptFilter, employees, filteredAppraisals, handleCreate, interactive, k, loadData, loading, mockPeriods, pending, periodFilter, ratingDistribution, scores, search, selected, setActiveTab, setCreateOpen, setDeptFilter, setPeriodFilter, setStatusFilter, setViewOpen, stCfg, star, statusFilter, topPerformers, val, viewOpen} = useValuation()
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button key={star} type="button"
          className={`h-4 w-4 transition-colors ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onChange?.(star)}
          disabled={!interactive}
        >
          <Star className={`h-4 w-4 ${star <= display ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
        </button>
      ))}
    </div>
  )
}

function calcOverall(scores: CompetencyScore[], criteria: Criterion[]): number {
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

// ─── Component ───────────────────────────────────────────────────────────────

export function Taksacija() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('pregled')
  const [appraisals, setAppraisals] = useState<Appraisal[]>([])
  const [criteria, setCriteria] = useState<Criterion[]>([])
  const [employees] = useState<Employee[]>(mockEmployees)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deptFilter, setDeptFilter] = useState('all')
  const [periodFilter, setPeriodFilter] = useState('all')

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [selected, setSelected] = useState<Appraisal | null>(null)

  // Create form
  const emptyScores = mockCriteria.map(c => ({ competencyId: c.id, score: 0 }))
  const [createForm, setCreateForm] = useState({
    employeeId: '', period: 'Q1 2025', scores: emptyScores as CompetencyScore[],
    strengths: '', improvements: '', goals: '',
  })

  // ─── Data Loading ───────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/employee-evaluations?companyId=${activeCompanyId || ''}`)
      if (res.ok) {
        const data = await res.json()
        if (data.items?.length) { setAppraisals(data.items); } else { setAppraisals(mockAppraisals) }
      } else { setAppraisals(mockAppraisals) }
    } catch { setAppraisals(mockAppraisals) }
    setCriteria(mockCriteria)
    setLoading(false)
  }, [activeCompanyId])

  useEffect(() => { loadData() }, [loadData])

  // ─── Computed ───────────────────────────────────────────────────────────

  const completed = appraisals.filter(a => a.status === 'zavrseno')
  const pending = appraisals.filter(a => a.status === 'zatrazeno' || a.status === 'u_toku')
  const avgRating = completed.length > 0 ? Math.round((completed.reduce((s, a) => s + a.overallRating, 0) / completed.length) * 10) / 10 : 0
  const deptsCovered = [...new Set(appraisals.filter(a => a.status === 'zavrseno').map(a => a.department))].length

  const ratingDistribution = [5, 4, 3, 2, 1].map(r => ({
    rating: r,
    count: completed.filter(a => Math.round(a.overallRating) === r).length,
  }))
  const maxDistCount = Math.max(...ratingDistribution.map(d => d.count), 1)

  const deptAverages = DEPARTMENTS.map(dept => {
    const deptCompleted = completed.filter(a => a.department === dept)
    const avg = deptCompleted.length > 0 ? Math.round((deptCompleted.reduce((s, a) => s + a.overallRating, 0) / deptCompleted.length) * 10) / 10 : 0
    return { department: dept, avg, count: deptCompleted.length }
  }).filter(d => d.count > 0).sort((a, b) => b.avg - a.avg)

  const filteredAppraisals = appraisals.filter(a => {
    if (search) {
      const s = search.toLowerCase()
      if (!a.employeeName.toLowerCase().includes(s) && !a.department.toLowerCase().includes(s)) return false
    }
    if (statusFilter !== 'all' && a.status !== statusFilter) return false
    if (deptFilter !== 'all' && a.department !== deptFilter) return false
    if (periodFilter !== 'all' && a.period !== periodFilter) return false
    return true
  })

  const topPerformers = [...completed].sort((a, b) => b.overallRating - a.overallRating).slice(0, 5)

  // ─── Handlers ───────────────────────────────────────────────────────────

  const handleCreate = () => {
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

  const handleDelete = (id: string) => {
    if (!confirm('Obrisati ocenjivanje?')) return
    setAppraisals(appraisals.filter(a => a.id !== id))
    toast.success('Ocenjivanje obrisano')
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Taksacija</h1>
          <p className="text-sm text-muted-foreground">Sistem za ocenjivanje radnog učinka zaposlenih</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-1" /> Osveži
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Novo ocenjivanje
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pregled"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="ocenjivanje"><Star className="h-4 w-4 mr-1" /> Ocenjivanje</TabsTrigger>
          <TabsTrigger value="kriterijumi"><Target className="h-4 w-4 mr-1" /> Kriterijumi</TabsTrigger>
          <TabsTrigger value="izvestaji"><FileText className="h-4 w-4 mr-1" /> Izveštaji</TabsTrigger>
        </TabsList>

        {/* ═══════ PREGLED ═══════ */}
        <OverviewTab appraisals={appraisals} completed={completed} deptAverages={deptAverages} loading={loading} pending={pending} ratingDistribution={ratingDistribution} topPerformers={topPerformers} />

        {/* ═══════ OCENJIVANJE ═══════ */}
        <OcenjivanjeTab d={d} deptFilter={deptFilter} filteredAppraisals={filteredAppraisals} k={k} loading={loading} mockPeriods={mockPeriods} periodFilter={periodFilter} search={search} setDeptFilter={setDeptFilter} setPeriodFilter={setPeriodFilter} setStatusFilter={setStatusFilter} stCfg={stCfg} statusFilter={statusFilter} />

        {/* ═══════ KRITERIJUMI ═══════ */}
        <KriterijumiTab criteria={criteria} />

        {/* ═══════ IZVEŠTAJI ═══════ */}
        <ReportsTab completed={completed} criteria={criteria} deptAp={deptAp} loading={loading} mockPeriods={mockPeriods} scores={scores} topPerformers={topPerformers} />
      </Tabs>

      {/* ═══════ CREATE APPRAISAL DIALOG ═══════ */}
              <Novoocenjivanje createOpen={createOpen} criteria={criteria} currentScore={currentScore} employees={employees} handleCreate={handleCreate} setCreateOpen={setCreateOpen} />

      {/* ═══════ VIEW APPRAISAL DIALOG ═══════ */}
              <SelectedemployeeName criteria={criteria} selected={selected} setViewOpen={setViewOpen} val={val} viewOpen={viewOpen} />
    </div>
  )
}
