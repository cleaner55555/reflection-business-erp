 
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Star, Plus, Search, Eye, Trash2, Edit3, RefreshCw,
  CheckCircle2, Clock, BarChart3, Users, ThumbsUp,
  TrendingUp, TrendingDown, Minus, AlertCircle,
  MessageSquare, CalendarDays, Filter, Award, Target,
  PieChart, LineChart, BarChart2, Zap, Heart, Shield
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Rating {
  id: string
  targetType: string
  targetId: string
  targetName: string
  category: string
  quality: number
  service: number
  price: number
  time: number
  overall: number
  comment?: string
  ratedBy: string
  ratedAt: string
}

interface Survey {
  id: string
  name: string
  description: string
  status: string
  questionCount: number
  responseCount: number
  avgRating: number
  createdAt: string
}

interface RatingCriteria {
  id: string
  name: string
  description: string
  weight: number
  scaleMax: number
  category: string
}

interface RatingReport {
  id: string
  period: string
  totalRatings: number
  avgOverall: number
  avgQuality: number
  avgService: number
  avgPrice: number
  avgTime: number
  trend: 'up' | 'down' | 'stable'
  topRated: Array<{ name: string; rating: number; count: number }>
  bottomRated: Array<{ name: string; rating: number; count: number }>
  categoryBreakdown: Array<{ category: string; avg: number; count: number }>
  monthlyData: Array<{ month: string; avg: number; count: number }>
}

interface RatingDashboard {
  totalRatings: number
  avgRating: number
  responseRate: number
  trendDirection: 'up' | 'down' | 'stable'
  trendValue: number
  distribution: Array<{ rating: number; count: number; percentage: number }>
  topCategories: Array<{ category: string; avg: number; count: number }>
  recentRatings: Rating[]
  reports: RatingReport[]
}

// ─── Config ──────────────────────────────────────────────────────────────────

const targetTypeConfig: Record<string, { label: string; color: string; icon: string }> = {
  partner: { label: 'Partner', color: 'bg-blue-100 text-blue-700', icon: '🏢' },
  vendor: { label: 'Dobavljač', color: 'bg-purple-100 text-purple-700', icon: '📦' },
  employee: { label: 'Zaposleni', color: 'bg-green-100 text-green-700', icon: '👤' },
  product: { label: 'Proizvod', color: 'bg-orange-100 text-orange-700', icon: '🔧' },
  service: { label: 'Usluga', color: 'bg-cyan-100 text-cyan-700', icon: '⚡' },
}

const categoryConfig: Record<string, { label: string; color: string }> = {
  delivery: { label: 'Isporuka', color: 'bg-blue-100 text-blue-700' },
  support: { label: 'Podrška', color: 'bg-green-100 text-green-700' },
  quality: { label: 'Kvalitet', color: 'bg-orange-100 text-orange-700' },
  pricing: { label: 'Cene', color: 'bg-red-100 text-red-700' },
  communication: { label: 'Komunikacija', color: 'bg-purple-100 text-purple-700' },
  reliability: { label: 'Pouzdanost', color: 'bg-cyan-100 text-cyan-700' },
  expertise: { label: 'Stručnost', color: 'bg-amber-100 text-amber-700' },
  responsiveness: { label: 'Reaktivnost', color: 'bg-emerald-100 text-emerald-700' },
}

const surveyStatusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-700' },
  active: { label: 'Aktivna', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Zatvorena', color: 'bg-amber-100 text-amber-700' },
}

const ratingCriteria: RatingCriteria[] = [
  { id: 'cr-1', name: 'Kvalitet', description: 'Kvalitet proizvoda ili usluge', weight: 30, scaleMax: 5, category: 'quality' },
  { id: 'cr-2', name: 'Usluga', description: 'Kvalitet usluživanja i podrške', weight: 25, scaleMax: 5, category: 'support' },
  { id: 'cr-3', name: 'Cena', description: 'Odnos cene i kvaliteta', weight: 20, scaleMax: 5, category: 'pricing' },
  { id: 'cr-4', name: 'Vreme', description: 'Vreme isporuke ili realizacije', weight: 15, scaleMax: 5, category: 'delivery' },
  { id: 'cr-5', name: 'Komunikacija', description: 'Komunikacija i odgovornost', weight: 10, scaleMax: 5, category: 'communication' },
]

const mockRatings: Rating[] = [
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

const mockSurveys: Survey[] = [
  { id: 'sv-1', name: 'Zadovoljstvo partnera Q4 2024', description: 'Quarterly partner satisfaction survey', status: 'closed', questionCount: 12, responseCount: 34, avgRating: 4.1, createdAt: '2024-10-01' },
  { id: 'sv-2', name: 'Evaluacija dobavljača', description: 'Godišnja evaluacija dobavljača', status: 'active', questionCount: 8, responseCount: 15, avgRating: 3.8, createdAt: '2025-01-01' },
  { id: 'sv-3', name: 'Anketa o zadovoljstvu zaposlenih', description: 'Internal employee satisfaction survey', status: 'active', questionCount: 20, responseCount: 22, avgRating: 4.3, createdAt: '2025-01-10' },
  { id: 'sv-4', name: 'NPS - Klijenti', description: 'Net Promoter Score za klijente', status: 'closed', questionCount: 5, responseCount: 50, avgRating: 4.5, createdAt: '2024-11-15' },
]

const mockReports: RatingReport[] = [
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

const mockDashboard: RatingDashboard = {
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

// ─── Helper ──────────────────────────────────────────────────────────────────

function StarRating({ value, max = 5, size = 'sm', interactive = false, onChange }: { value: number; max?: number; size?: string; interactive?: boolean; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  const displayValue = hovered || value
  const sizeClass = size === 'lg' ? 'h-6 w-6' : size === 'md' ? 'h-5 w-5' : 'h-4 w-4'
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button key={star} type="button" className={`${sizeClass} transition-colors ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onChange && onChange(star)}
          disabled={!interactive}
        >
          <Star className={`${sizeClass} ${star <= displayValue ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
        </button>
      ))}
    </div>
  )
}

function getRatingColor(value: number): string {
  if (value >= 4.5) return 'text-green-600'
  if (value >= 4.0) return 'text-green-500'
  if (value >= 3.5) return 'text-amber-500'
  if (value >= 3.0) return 'text-orange-500'
  return 'text-red-500'
}

function getRatingBg(value: number): string {
  if (value >= 4.5) return 'bg-green-100'
  if (value >= 4.0) return 'bg-green-50'
  if (value >= 3.5) return 'bg-amber-50'
  if (value >= 3.0) return 'bg-orange-50'
  return 'bg-red-50'
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Ocene() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [ratings, setRatings] = useState<Rating[]>([])
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [dashboard, setDashboard] = useState<RatingDashboard | null>(null)
  const [search, setSearch] = useState('')
  const [targetFilter, setTargetFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [selected, setSelected] = useState<Rating | null>(null)
  const [selectedReport, setSelectedReport] = useState<RatingReport | null>(null)

  // Forms
  const emptyForm = {
    targetType: 'partner', targetName: '', category: 'quality',
    quality: 3, service: 3, price: 3, time: 3, comment: '',
  }
  const [form, setForm] = useState(emptyForm)

  // ─── Data Loading ───────────────────────────────────────────────────────

  const loadRatings = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/ratings?companyId=${activeCompanyId}&limit=100`)
      if (res.ok) {
        const data = await res.json()
        setRatings(data.items?.length ? data.items : mockRatings)
      } else {
        setRatings(mockRatings)
      }
    } catch {
      setRatings(mockRatings)
    }
    setLoading(false)
  }, [activeCompanyId])

  const loadSurveys = useCallback(async () => {
    try {
      setSurveys(mockSurveys)
    } catch {
      setSurveys(mockSurveys)
    }
  }, [])

  const loadDashboard = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/ratings/dashboard?companyId=${activeCompanyId}`)
      if (res.ok) {
        const data = await res.json()
        setDashboard(data)
      } else {
        setDashboard(mockDashboard)
      }
    } catch {
      setDashboard(mockDashboard)
    }
  }, [activeCompanyId])

  useEffect(() => {
    loadRatings()
    loadSurveys()
    loadDashboard()
  }, [activeCompanyId, loadRatings, loadSurveys, loadDashboard])

  // ─── Computed ───────────────────────────────────────────────────────────

  const filteredRatings = ratings.filter((r) => {
    if (search) {
      const s = search.toLowerCase()
      if (!r.targetName.toLowerCase().includes(s) && !(r.comment || '').toLowerCase().includes(s)) return false
    }
    if (targetFilter !== 'all' && r.targetType !== targetFilter) return false
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false
    return true
  })

  // ─── Handlers ───────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!activeCompanyId || !form.targetName.trim()) return
    const overall = ((form.quality * 30 + form.service * 25 + form.price * 20 + form.time * 15) / 90)
    const newRating: Rating = {
      id: `r-${Date.now()}`,
      targetType: form.targetType,
      targetId: `t-${Date.now()}`,
      targetName: form.targetName,
      category: form.category,
      quality: form.quality,
      service: form.service,
      price: form.price,
      time: form.time,
      overall: Math.round(overall * 10) / 10,
      comment: form.comment,
      ratedBy: 'Trenutni korisnik',
      ratedAt: new Date().toISOString(),
    }
    setRatings([newRating, ...ratings])
    setDialogOpen(false)
    setForm(emptyForm)
    loadDashboard()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati ocenu?')) return
    setRatings(ratings.filter((r) => r.id !== id))
    loadDashboard()
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ocene</h1>
          <p className="text-sm text-muted-foreground">Sistem ocenjivanja i povratnih informacija</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { loadRatings(); loadDashboard(); }}>
            <RefreshCw className="h-4 w-4 mr-1" /> Osveži
          </Button>
          <Button size="sm" onClick={() => { setForm(emptyForm); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Nova ocena
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="ratings"><Star className="h-4 w-4 mr-1" /> Ocene</TabsTrigger>
          <TabsTrigger value="surveys"><MessageSquare className="h-4 w-4 mr-1" /> Ankete</TabsTrigger>
          <TabsTrigger value="reports"><PieChart className="h-4 w-4 mr-1" /> Izveštaji</TabsTrigger>
        </TabsList>

        {/* ─── Pregled Tab ─────────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-6">
          {!dashboard ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Prosečna ocena</span>
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  </div>
                  <p className={`text-2xl font-bold ${getRatingColor(dashboard.avgRating)}`}>{dashboard.avgRating}/5</p>
                  <div className="flex items-center gap-1 mt-1">
                    {dashboard.trendDirection === 'up' ? <TrendingUp className="h-3 w-3 text-green-500" /> : dashboard.trendDirection === 'down' ? <TrendingDown className="h-3 w-3 text-red-500" /> : <Minus className="h-3 w-3 text-gray-500" />}
                    <span className={`text-[10px] ${dashboard.trendDirection === 'up' ? 'text-green-500' : dashboard.trendDirection === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
                      {dashboard.trendValue > 0 ? '+' : ''}{dashboard.trendValue} vs prošli mesec
                    </span>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Ukupno ocena</span>
                    <BarChart3 className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold">{dashboard.totalRatings}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{dashboard.responseRate}% stopa odgovora</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">5 zvezdica</span>
                    <ThumbsUp className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{dashboard.distribution[0]?.count || 0}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{dashboard.distribution[0]?.percentage || 0}% svih ocena</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Aktivne ankete</span>
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{surveys.filter((s) => s.status === 'active').length}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{surveys.reduce((sum, s) => sum + s.responseCount, 0)} odgovora</p>
                </Card>
              </div>

              {/* Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Distribucija ocena</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {dashboard.distribution.map((d) => {
                      const maxCount = Math.max(...dashboard.distribution.map((x) => x.count))
                      return (
                        <div key={d.rating} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-8">
                            <span className="text-sm font-medium">{d.rating}</span>
                            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                          </div>
                          <div className="flex-1 bg-muted rounded-full h-3">
                            <div className={`h-3 rounded-full transition-all ${d.rating >= 4 ? 'bg-green-400' : d.rating >= 3 ? 'bg-amber-400' : 'bg-red-400'}`}
                              style={{ width: `${(d.count / maxCount) * 100}%` }} />
                          </div>
                          <span className="text-sm font-medium w-10 text-right">{d.count}</span>
                          <span className="text-xs text-muted-foreground w-12 text-right">({d.percentage}%)</span>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                {/* Categories */}
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Po kategorijama</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {dashboard.topCategories.map((cat) => {
                      const catCfg = categoryConfig[cat.category]
                      const maxAvg = Math.max(...dashboard.topCategories.map((c) => c.avg))
                      return (
                        <div key={cat.category} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-[10px] ${catCfg?.color}`}>{catCfg?.label}</Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div className="h-2 rounded-full bg-primary" style={{ width: `${(cat.avg / maxAvg) * 100}%` }} />
                            </div>
                            <span className={`text-sm font-medium w-8 text-right ${getRatingColor(cat.avg)}`}>{cat.avg.toFixed(1)}</span>
                            <span className="text-[10px] text-muted-foreground w-8 text-right">({cat.count})</span>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* Criteria Weights */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Kriterijumi ocenjivanja</CardTitle>
                  <CardDescription>Težinski faktori za kalkulaciju ukupne ocene</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {ratingCriteria.map((cr) => {
                      const catCfg = categoryConfig[cr.category]
                      return (
                        <div key={cr.id} className={`p-4 rounded-lg text-center ${getRatingBg(4)}`}>
                          <p className="text-sm font-medium mb-1">{cr.name}</p>
                          <p className={`text-2xl font-bold ${getRatingColor(4)}`}>{cr.weight}%</p>
                          <Badge variant="outline" className={`text-[10px] mt-2 ${catCfg?.color}`}>{catCfg?.label}</Badge>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Ratings */}
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Nedavne ocene</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {dashboard.recentRatings.map((r) => {
                      const tCfg = targetTypeConfig[r.targetType]
                      return (
                        <div key={r.id} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{tCfg?.icon}</span>
                            <div>
                              <p className="text-sm font-medium">{r.targetName}</p>
                              <p className="text-xs text-muted-foreground">
                                {tCfg?.label} · {r.comment?.substring(0, 50)}{r.comment && r.comment.length > 50 ? '...' : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <StarRating value={Math.round(r.overall)} size="sm" />
                            <span className={`text-sm font-bold ${getRatingColor(r.overall)}`}>{r.overall.toFixed(1)}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ─── Ocene Tab ───────────────────────────────────────────────── */}
        <TabsContent value="ratings" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pretraži ocene..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={targetFilter} onValueChange={setTargetFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Svi tipovi" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi tipovi</SelectItem>
                {Object.entries(targetTypeConfig).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Sve kategorije" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Sve kategorije</SelectItem>
                {Object.entries(categoryConfig).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filteredRatings.length === 0 ? (
            <Card className="p-8 text-center">
              <Star className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Nema ocena</p>
              <Button variant="outline" className="mt-3" onClick={() => { setForm(emptyForm); setDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-1" /> Kreiraj ocenu
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredRatings.map((r) => {
                const tCfg = targetTypeConfig[r.targetType]
                const catCfg = categoryConfig[r.category]
                return (
                  <Card key={r.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelected(r); setDetailOpen(true); }}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <span className="text-2xl mt-0.5">{tCfg?.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-medium">{r.targetName}</h3>
                              <Badge variant="outline" className={`text-[10px] ${tCfg?.color}`}>{tCfg?.label}</Badge>
                              <Badge variant="outline" className={`text-[10px] ${catCfg?.color}`}>{catCfg?.label}</Badge>
                            </div>
                            {r.comment && <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{r.comment}</p>}
                            <div className="flex items-center gap-6">
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-muted-foreground">Ukupno:</span>
                                <StarRating value={Math.round(r.overall)} size="sm" />
                                <span className={`text-sm font-bold ${getRatingColor(r.overall)}`}>{r.overall.toFixed(1)}</span>
                              </div>
                              {r.quality > 0 && (
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] text-muted-foreground">Kvalitet:</span>
                                  <span className="text-xs font-medium">{r.quality}</span>
                                </div>
                              )}
                              {r.service > 0 && (
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] text-muted-foreground">Usluga:</span>
                                  <span className="text-xs font-medium">{r.service}</span>
                                </div>
                              )}
                              {r.price > 0 && (
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] text-muted-foreground">Cena:</span>
                                  <span className="text-xs font-medium">{r.price}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 ml-3">
                          <span className="text-[10px] text-muted-foreground">{r.ratedBy}</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(r.ratedAt).toLocaleDateString('sr-RS')}</span>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive mt-1" onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* ─── Ankete Tab ──────────────────────────────────────────────── */}
        <TabsContent value="surveys" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {surveys.map((s) => {
              const sCfg = surveyStatusConfig[s.status]
              return (
                <Card key={s.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium line-clamp-1">{s.name}</h3>
                      <Badge variant="outline" className={`text-[10px] ${sCfg?.color}`}>{sCfg?.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{s.description}</p>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <p className="text-lg font-bold">{s.questionCount}</p>
                        <p className="text-[10px] text-muted-foreground">Pitanja</p>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <p className="text-lg font-bold">{s.responseCount}</p>
                        <p className="text-[10px] text-muted-foreground">Odgovori</p>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <p className={`text-lg font-bold ${getRatingColor(s.avgRating)}`}>{s.avgRating.toFixed(1)}</p>
                        <p className="text-[10px] text-muted-foreground">Prosek</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{new Date(s.createdAt).toLocaleDateString('sr-RS')}</span>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setSelected(null); setDetailOpen(true); }}>
                        <Eye className="h-3 w-3 mr-1" /> Detalji
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* ─── Izveštaji Tab ───────────────────────────────────────────── */}
        <TabsContent value="reports" className="space-y-4">
          {mockReports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <PieChart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold">Izveštaj: {report.period}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{report.totalRatings} ocena</span>
                        <span className="text-xs">·</span>
                        {report.trend === 'up' ? (
                          <span className="text-xs text-green-500 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> +{report.trendValue}</span>
                        ) : report.trend === 'down' ? (
                          <span className="text-xs text-red-500 flex items-center gap-1"><TrendingDown className="h-3 w-3" /> {report.trendValue}</span>
                        ) : (
                          <span className="text-xs text-gray-500 flex items-center gap-1"><Minus className="h-3 w-3" /> Nema promene</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => { setSelectedReport(report); setReportOpen(true); }}>
                    <Eye className="h-4 w-4 mr-1" /> Pregled
                  </Button>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-5 gap-4 mb-6">
                  {[
                    { label: 'Ukupno', value: report.avgOverall },
                    { label: 'Kvalitet', value: report.avgQuality },
                    { label: 'Usluga', value: report.avgService },
                    { label: 'Cene', value: report.avgPrice },
                    { label: 'Vreme', value: report.avgTime },
                  ].map((item) => (
                    <div key={item.label} className={`text-center p-3 rounded-lg ${getRatingBg(item.value)}`}>
                      <p className={`text-xl font-bold ${getRatingColor(item.value)}`}>{item.value.toFixed(1)}</p>
                      <p className="text-[10px] text-muted-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>

                {/* Mini Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Monthly Trend Mini */}
                  <div>
                    <p className="text-xs font-medium mb-2">Mesečni trend</p>
                    <div className="flex items-end gap-3 h-24">
                      {report.monthlyData.map((m) => {
                        const maxAvg = 5
                        return (
                          <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-[10px] font-medium">{m.avg.toFixed(1)}</span>
                            <div className="w-full bg-primary/20 rounded-t relative" style={{ height: `${(m.avg / maxAvg) * 80}px` }}>
                              <div className="absolute bottom-0 w-full bg-primary rounded-t" style={{ height: '100%' }} />
                            </div>
                            <span className="text-[10px] text-muted-foreground">{m.month}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Top & Bottom */}
                  <div>
                    <p className="text-xs font-medium mb-2">Top ocenjeni</p>
                    <div className="space-y-1">
                      {report.topRated.slice(0, 3).map((item, idx) => (
                        <div key={item.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground font-bold">#{idx + 1}</span>
                            <span>{item.name}</span>
                          </div>
                          <span className={`font-medium ${getRatingColor(item.rating)}`}>{item.rating.toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* ─── Create Rating Dialog ──────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova ocena</DialogTitle>
            <DialogDescription>Ocenite partnera, dobavljača ili zaposlenog</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tip</Label>
                <Select value={form.targetType} onValueChange={(v) => setForm({ ...form, targetType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(targetTypeConfig).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Kategorija</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryConfig).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Naziv</Label>
              <Input value={form.targetName} onChange={(e) => setForm({ ...form, targetName: e.target.value })} placeholder="Naziv partnera/dobavljača/zaposlenog" />
            </div>
            <Separator />
            <div className="space-y-4">
              <p className="text-sm font-medium">Ocene (1-5)</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Kvalitet (30%)</Label>
                  <StarRating value={form.quality} interactive onChange={(v) => setForm({ ...form, quality: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Usluga (25%)</Label>
                  <StarRating value={form.service} interactive onChange={(v) => setForm({ ...form, service: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Cena (20%)</Label>
                  <StarRating value={form.price} interactive onChange={(v) => setForm({ ...form, price: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Vreme (15%)</Label>
                  <StarRating value={form.time} interactive onChange={(v) => setForm({ ...form, time: v })} />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Komentar</Label>
              <Textarea value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} rows={3} placeholder="Ostavite komentar..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleCreate}><Plus className="h-4 w-4 mr-1" /> Sačuvaj ocenu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Detail Dialog ────────────────────────────────────────────────── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Detalji ocene</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{targetTypeConfig[selected.targetType]?.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold">{selected.targetName}</h3>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={`text-[10px] ${targetTypeConfig[selected.targetType]?.color}`}>{targetTypeConfig[selected.targetType]?.label}</Badge>
                      <Badge variant="outline" className={`text-[10px] ${categoryConfig[selected.category]?.color}`}>{categoryConfig[selected.category]?.label}</Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-bold ${getRatingColor(selected.overall)}`}>{selected.overall.toFixed(1)}</p>
                  <StarRating value={Math.round(selected.overall)} size="md" />
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-4 gap-4">
                {selected.quality > 0 && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Kvalitet</p>
                    <p className="text-lg font-bold">{selected.quality}</p>
                    <StarRating value={selected.quality} size="sm" />
                  </div>
                )}
                {selected.service > 0 && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Usluga</p>
                    <p className="text-lg font-bold">{selected.service}</p>
                    <StarRating value={selected.service} size="sm" />
                  </div>
                )}
                {selected.price > 0 && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Cena</p>
                    <p className="text-lg font-bold">{selected.price}</p>
                    <StarRating value={selected.price} size="sm" />
                  </div>
                )}
                {selected.time > 0 && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Vreme</p>
                    <p className="text-lg font-bold">{selected.time}</p>
                    <StarRating value={selected.time} size="sm" />
                  </div>
                )}
              </div>
              {selected.comment && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Komentar:</p>
                  <p className="text-sm">{selected.comment}</p>
                </div>
              )}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Ocenio: {selected.ratedBy}</span>
                <span>{new Date(selected.ratedAt).toLocaleString('sr-RS')}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Report Detail Dialog ─────────────────────────────────────────── */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Izveštaj: {selectedReport?.period}</DialogTitle></DialogHeader>
          {selectedReport && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-5 gap-3">
                {[
                  { label: 'Ukupno', value: selectedReport.avgOverall },
                  { label: 'Kvalitet', value: selectedReport.avgQuality },
                  { label: 'Usluga', value: selectedReport.avgService },
                  { label: 'Cene', value: selectedReport.avgPrice },
                  { label: 'Vreme', value: selectedReport.avgTime },
                ].map((item) => (
                  <div key={item.label} className={`text-center p-3 rounded-lg ${getRatingBg(item.value)}`}>
                    <p className={`text-xl font-bold ${getRatingColor(item.value)}`}>{item.value.toFixed(1)}</p>
                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>

              {/* Monthly Trend */}
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Mesečni trend</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-end gap-4 h-40">
                    {selectedReport.monthlyData.map((m) => (
                      <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs font-medium">{m.avg.toFixed(1)}</span>
                        <div className="w-full rounded-t" style={{ height: `${(m.avg / 5) * 120}px`, backgroundColor: m.avg >= 4 ? '#22c55e' : m.avg >= 3 ? '#f59e0b' : '#ef4444' }} />
                        <span className="text-[10px] text-muted-foreground">{m.month}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Rated */}
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><ThumbsUp className="h-4 w-4 text-green-500" /> Najbolje ocenjeni</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {selectedReport.topRated.map((item, idx) => (
                      <div key={item.name} className="flex items-center justify-between p-2 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-muted-foreground w-6">#{idx + 1}</span>
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <StarRating value={Math.round(item.rating)} size="sm" />
                          <span className={`text-sm font-bold ${getRatingColor(item.rating)}`}>{item.rating.toFixed(1)}</span>
                          <span className="text-[10px] text-muted-foreground">({item.count})</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Bottom Rated */}
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><ThumbsUp className="h-4 w-4 text-red-500" /> Najlošije ocenjeni</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {selectedReport.bottomRated.map((item, idx) => (
                      <div key={item.name} className="flex items-center justify-between p-2 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-muted-foreground w-6">#{idx + 1}</span>
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <StarRating value={Math.round(item.rating)} size="sm" />
                          <span className={`text-sm font-bold ${getRatingColor(item.rating)}`}>{item.rating.toFixed(1)}</span>
                          <span className="text-[10px] text-muted-foreground">({item.count})</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Category Breakdown */}
                <Card className="md:col-span-2">
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Po kategorijama</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {selectedReport.categoryBreakdown.map((cat) => {
                      const catCfg = categoryConfig[cat.category]
                      return (
                        <div key={cat.category} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-[10px] ${catCfg?.color}`}>{catCfg?.label}</Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-muted rounded-full h-2">
                              <div className="h-2 rounded-full bg-primary" style={{ width: `${(cat.avg / 5) * 100}%` }} />
                            </div>
                            <span className={`text-sm font-medium w-8 text-right ${getRatingColor(cat.avg)}`}>{cat.avg.toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground w-8 text-right">({cat.count})</span>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
