'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
  Trophy, Plus, Search, Eye, Trash2, Edit3, RefreshCw,
  CheckCircle2, Clock, BarChart3, Users, Star,
  TrendingUp, Target, Zap, Award, Medal, Crown,
  Flame, Gift, Lock, Unlock, ArrowUp, ArrowDown, ArrowLeft,
  CalendarDays, Settings, UsersRound, Swords, Shield,
  Sparkles, ChevronRight, Heart, Brain, Rocket, Gem,
  AlertCircle
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Goal {
  id: string
  title: string
  description: string
  category: string
  type: string
  targetValue: number
  currentValue: number
  unit: string
  deadline: string
  assignee: string
  assigneeId: string
  status: string
  points: number
  progress: number
  createdAt: string
}

interface Challenge {
  id: string
  title: string
  description: string
  type: string
  startDate: string
  endDate: string
  reward: string
  rewardPoints: number
  participantCount: number
  maxParticipants: number
  status: string
  difficulty: string
  completedCount: number
  criteria: string
  createdAt: string
}

interface BadgeItem {
  id: string
  name: string
  description: string
  icon: string
  color: string
  category: string
  requirement: string
  earnedBy: number
  points: number
  isRare: boolean
  isSecret: boolean
}

interface LeaderboardEntry {
  id: string
  employeeId: string
  employeeName: string
  department: string
  avatar: string
  totalPoints: number
  level: number
  rank: number
  previousRank: number
  badges: number
  completedGoals: number
  streak: number
}

interface GoalTemplate {
  id: string
  title: string
  description: string
  category: string
  type: string
  targetValue: number
  unit: string
  points: number
  difficulty: string
}

interface GamificationDashboard {
  activeGoals: number
  completedGoals: number
  activeChallenges: number
  completedChallenges: number
  totalBadges: number
  earnedBadges: number
  totalParticipants: number
  topScorer: string
  avgPoints: number
  recentAchievements: Array<{ employee: string; action: string; points: number; time: string }>
  categoryBreakdown: Array<{ category: string; goals: number; avgProgress: number }>
  monthlyPoints: Array<{ month: string; points: number }>
}

// ─── Config ──────────────────────────────────────────────────────────────────

const goalStatusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-700' },
  active: { label: 'Aktivan', color: 'bg-green-100 text-green-700' },
  completed: { label: 'Završen', color: 'bg-blue-100 text-blue-700' },
  failed: { label: 'Nije ostvaren', color: 'bg-red-100 text-red-700' },
  paused: { label: 'Pauziran', color: 'bg-amber-100 text-amber-700' },
}

const challengeStatusConfig: Record<string, { label: string; color: string }> = {
  upcoming: { label: 'Predstojeći', color: 'bg-gray-100 text-gray-700' },
  active: { label: 'Aktivan', color: 'bg-green-100 text-green-700' },
  completed: { label: 'Završen', color: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'Otkazan', color: 'bg-red-100 text-red-700' },
}

const challengeTypeConfig: Record<string, { label: string; color: string; icon: string }> = {
  daily: { label: 'Dnevni', color: 'bg-amber-50 text-amber-700', icon: '☀️' },
  weekly: { label: 'Sedmični', color: 'bg-blue-50 text-blue-700', icon: '📅' },
  monthly: { label: 'Mesečni', color: 'bg-purple-50 text-purple-700', icon: '🗓️' },
  quarterly: { label: 'Kvartalni', color: 'bg-green-50 text-green-700', icon: '📊' },
  special: { label: 'Specijalni', color: 'bg-red-50 text-red-700', icon: '🏆' },
}

const difficultyConfig: Record<string, { label: string; color: string; stars: number }> = {
  easy: { label: 'Lako', color: 'bg-green-100 text-green-700', stars: 1 },
  medium: { label: 'Srednje', color: 'bg-amber-100 text-amber-700', stars: 2 },
  hard: { label: 'Teško', color: 'bg-red-100 text-red-700', stars: 3 },
  epic: { label: 'Epic', color: 'bg-purple-100 text-purple-700', stars: 4 },
}

const goalCategoryConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  sales: { label: 'Prodaja', color: 'bg-green-100 text-green-700', icon: <TrendingUp className="h-4 w-4" /> },
  productivity: { label: 'Produktivnost', color: 'bg-blue-100 text-blue-700', icon: <Zap className="h-4 w-4" /> },
  learning: { label: 'Učenje', color: 'bg-purple-100 text-purple-700', icon: <Brain className="h-4 w-4" /> },
  health: { label: 'Zdravlje', color: 'bg-red-100 text-red-700', icon: <Heart className="h-4 w-4" /> },
  team: { label: 'Tim', color: 'bg-amber-100 text-amber-700', icon: <Users className="h-4 w-4" /> },
  innovation: { label: 'Inovacije', color: 'bg-cyan-100 text-cyan-700', icon: <Sparkles className="h-4 w-4" /> },
}

const templates: GoalTemplate[] = [
  { id: 'tpl-1', title: 'Dnevna prodaja', description: 'Postigni dnevni prodajni cilj', category: 'sales', type: 'individual', targetValue: 5, unit: 'prodaja', points: 100, difficulty: 'easy' },
  { id: 'tpl-2', title: 'Sedmični kod revju', description: 'Odradi 3 kod revjua nedeljno', category: 'productivity', type: 'individual', targetValue: 3, unit: 'revjua', points: 150, difficulty: 'medium' },
  { id: 'tpl-3', title: 'Mesečno učenje', description: 'Provedi 20 sati na edukaciji mesečno', category: 'learning', type: 'individual', targetValue: 20, unit: 'sati', points: 300, difficulty: 'medium' },
  { id: 'tpl-4', title: 'Kondicioni izazov', description: 'Trči 50km mesečno', category: 'health', type: 'individual', targetValue: 50, unit: 'km', points: 200, difficulty: 'hard' },
  { id: 'tpl-5', title: 'Timski sprint', description: 'Završite sprint bez zaduženja', category: 'productivity', type: 'team', targetValue: 100, unit: '%', points: 500, difficulty: 'hard' },
]

// ─── Component ───────────────────────────────────────────────────────────────

export function Gamification() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('overview')
  const [goals, setGoals] = useState<Goal[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [badges, setBadges] = useState<BadgeItem[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [dashboard, setDashboard] = useState<GamificationDashboard | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [goalDialogOpen, setGoalDialogOpen] = useState(false)
  const [challengeDialogOpen, setChallengeDialogOpen] = useState(false)
  const [badgeDialogOpen, setBadgeDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<Goal | null>(null)

  const emptyGoalForm = {
    title: '', description: '', category: 'productivity', type: 'individual',
    targetValue: '', unit: '', deadline: '', assignee: '', points: '',
  }
  const [goalForm, setGoalForm] = useState(emptyGoalForm)

  const emptyChallengeForm = {
    title: '', description: '', type: 'daily', startDate: '', endDate: '',
    reward: '', rewardPoints: '', difficulty: 'medium', criteria: '', maxParticipants: '',
  }
  const [challengeForm, setChallengeForm] = useState(emptyChallengeForm)

  const emptyBadgeForm = {
    name: '', description: '', icon: '🏆', color: '#f59e0b', category: 'productivity',
    requirement: '', points: '',
  }
  const [badgeForm, setBadgeForm] = useState(emptyBadgeForm)

  // ─── Data Loading (API) ──────────────────────────────────────────────

  const loadAll = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/gamification?companyId=${activeCompanyId}&section=all`)
      const json = await res.json()
      if (json.success) {
        setGoals(json.data.goals || [])
        setChallenges(json.data.challenges || [])
        setBadges(json.data.badges || [])
        setLeaderboard(json.data.leaderboard || [])
        setDashboard(json.data.dashboard || null)
      }
    } catch (e) {
      console.error('Failed to load gamification data', e)
      toast({ title: 'Greška', description: 'Neuspelo učitavanje podataka', variant: 'destructive' })
    }
    setLoading(false)
  }, [activeCompanyId])

  useEffect(() => { loadAll() }, [loadAll])

  // ─── Computed ───────────────────────────────────────────────────────────

  const filteredGoals = goals.filter((g) => {
    if (search && !g.title.toLowerCase().includes(search.toLowerCase())) return false
    if (categoryFilter !== 'all' && g.category !== categoryFilter) return false
    if (statusFilter !== 'all' && g.status !== statusFilter) return false
    return true
  })

  // ─── Handlers (API) ───────────────────────────────────────────────────

  const handleCreateGoal = async () => {
    if (!goalForm.title.trim() || !activeCompanyId) return
    try {
      const res = await fetch('/api/gamification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'goals', companyId: activeCompanyId, ...goalForm }),
      })
      const json = await res.json()
      if (json.success) {
        toast({ title: 'Uspešno', description: 'Cilj je kreiran' })
        setGoalDialogOpen(false)
        setGoalForm(emptyGoalForm)
        loadAll()
      } else {
        toast({ title: 'Greška', description: json.error || 'Greška pri kreiranju', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Greška', description: 'Greška pri kreiranju cilja', variant: 'destructive' })
    }
  }

  const handleCreateChallenge = async () => {
    if (!challengeForm.title.trim() || !activeCompanyId) return
    try {
      const res = await fetch('/api/gamification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'challenges', companyId: activeCompanyId, ...challengeForm }),
      })
      const json = await res.json()
      if (json.success) {
        toast({ title: 'Uspešno', description: 'Izazov je kreiran' })
        setChallengeDialogOpen(false)
        setChallengeForm(emptyChallengeForm)
        loadAll()
      } else {
        toast({ title: 'Greška', description: json.error || 'Greška pri kreiranju', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Greška', description: 'Greška pri kreiranju izazova', variant: 'destructive' })
    }
  }

  const handleCreateBadge = async () => {
    if (!badgeForm.name.trim() || !activeCompanyId) return
    try {
      const res = await fetch('/api/gamification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'badges', companyId: activeCompanyId, ...badgeForm }),
      })
      const json = await res.json()
      if (json.success) {
        toast({ title: 'Uspešno', description: 'Značka je kreirana' })
        setBadgeDialogOpen(false)
        setBadgeForm(emptyBadgeForm)
        loadAll()
      } else {
        toast({ title: 'Greška', description: json.error || 'Greška pri kreiranju', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Greška', description: 'Greška pri kreiranju značke', variant: 'destructive' })
    }
  }

  const handleDeleteGoal = async (id: string) => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/gamification?section=goals&id=${id}&companyId=${activeCompanyId}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        toast({ title: 'Obrisano', description: 'Cilj je uspešno obrisan' })
        loadAll()
      } else {
        toast({ title: 'Greška', description: json.error || 'Greška pri brisanju', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Greška', description: 'Greška pri brisanju cilja', variant: 'destructive' })
    }
  }

  const getCategoryLabel = (catId: string) => goalCategoryConfig[catId]?.label || catId
  const getCategoryColor = (catId: string) => goalCategoryConfig[catId]?.color || 'bg-gray-100 text-gray-700'
  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500'
    if (progress >= 70) return 'bg-blue-500'
    if (progress >= 40) return 'bg-amber-500'
    return 'bg-red-500'
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gamifikacija</h1>
          <p className="text-sm text-muted-foreground">Ciljevi, izazovi, značke i rang lista</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => loadAll()}>
            <RefreshCw className="h-4 w-4 mr-1" /> Osveži
          </Button>
          <Button size="sm" onClick={() => { setGoalForm(emptyGoalForm); setGoalDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Novi cilj
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="goals"><Target className="h-4 w-4 mr-1" /> Ciljevi</TabsTrigger>
          <TabsTrigger value="challenges"><Swords className="h-4 w-4 mr-1" /> Izazovi</TabsTrigger>
          <TabsTrigger value="badges"><Award className="h-4 w-4 mr-1" /> Značke</TabsTrigger>
          <TabsTrigger value="leaderboard"><Trophy className="h-4 w-4 mr-1" /> Rang lista</TabsTrigger>
          <TabsTrigger value="templates"><Settings className="h-4 w-4 mr-1" /> Šabloni</TabsTrigger>
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
                    <span className="text-xs text-muted-foreground">Aktivni ciljevi</span>
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold">{dashboard.activeGoals}</p>
                  <p className="text-xs text-muted-foreground mt-1">{dashboard.completedGoals} završenih</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Aktivni izazovi</span>
                    <Swords className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-amber-600">{dashboard.activeChallenges}</p>
                  <p className="text-xs text-muted-foreground mt-1">{dashboard.totalParticipants} učesnika</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Značke</span>
                    <Award className="h-4 w-4 text-purple-500" />
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{dashboard.earnedBadges}/{dashboard.totalBadges}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Najbolji</span>
                    <Crown className="h-4 w-4 text-yellow-500" />
                  </div>
                  <p className="text-2xl font-bold text-yellow-600 truncate">{dashboard.topScorer}</p>
                  <p className="text-xs text-muted-foreground mt-1">Prosek: {dashboard.avgPoints} poena</p>
                </Card>
              </div>

              {/* Monthly Points Chart */}
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Mesečna aktivnost (poeni)</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-end gap-4 h-40">
                    {dashboard.monthlyPoints.map((m) => {
                      const maxPts = Math.max(...dashboard.monthlyPoints.map((x) => x.points))
                      return (
                        <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-xs font-medium">{(m.points / 1000).toFixed(1)}k</span>
                          <div className="w-full rounded-t bg-primary/80" style={{ height: `${(m.points / maxPts) * 120}px` }} />
                          <span className="text-xs text-muted-foreground">{m.month}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Breakdown */}
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Ciljevi po kategorijama</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {dashboard.categoryBreakdown.map((cat) => {
                      const catCfg = goalCategoryConfig[cat.category]
                      return (
                        <div key={cat.category} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {catCfg?.icon}
                            <span className="text-sm">{getCategoryLabel(cat.category)}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div className="h-2 rounded-full bg-primary" style={{ width: `${cat.avgProgress}%` }} />
                            </div>
                            <span className="text-sm font-medium w-12 text-right">{cat.avgProgress}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                {/* Recent Achievements */}
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Nedavna dostignuća</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {dashboard.recentAchievements.map((a, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <div>
                              <p className="text-sm font-medium">{a.employee}</p>
                              <p className="text-xs text-muted-foreground">{a.action}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-green-600">+{a.points}</span>
                            <p className="text-xs text-muted-foreground">{a.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Leaderboard Preview */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2"><Trophy className="h-4 w-4 text-yellow-500" /> Top 3 rang liste</CardTitle>
                    <Button size="sm" variant="ghost" onClick={() => setActiveTab('leaderboard')}>Vidi sve <ChevronRight className="h-4 w-4 ml-1" /></Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {leaderboard.slice(0, 3).map((entry, idx) => (
                      <div key={entry.id} className="text-center p-4 rounded-lg border" style={{ borderColor: idx === 0 ? '#eab308' : idx === 1 ? '#9ca3af' : '#b45309' }}>
                        <div className="relative inline-block mb-2">
                          <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold mx-auto" style={{
                            backgroundColor: idx === 0 ? '#fef3c7' : idx === 1 ? '#f3f4f6' : '#fed7aa',
                            color: idx === 0 ? '#92400e' : idx === 1 ? '#374151' : '#9a3412',
                          }}>
                            {entry.avatar}
                          </div>
                          <div className="absolute -top-2 -right-2 text-xl">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</div>
                        </div>
                        <p className="text-sm font-medium">{entry.employeeName}</p>
                        <p className="text-xs text-muted-foreground">{entry.department}</p>
                        <p className="text-lg font-bold mt-1">{entry.totalPoints.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">poena</p>
                        <div className="flex items-center justify-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><Award className="h-3 w-3" /> {entry.badges}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><Flame className="h-3 w-3" /> {entry.streak}d</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ─── Ciljevi Tab ─────────────────────────────────────────────── */}
        <TabsContent value="goals" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pretraži ciljeve..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Sve kategorije" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Sve kategorije</SelectItem>
                {Object.entries(goalCategoryConfig).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Svi statusi" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi statusi</SelectItem>
                {Object.entries(goalStatusConfig).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filteredGoals.length === 0 ? (
            <Card className="p-8 text-center">
              <Target className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Nema ciljeva</p>
              <Button variant="outline" className="mt-3" onClick={() => { setGoalForm(emptyGoalForm); setGoalDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-1" /> Kreiraj cilj
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGoals.map((goal) => {
                const sCfg = goalStatusConfig[goal.status]
                const catCfg = goalCategoryConfig[goal.category]
                return (
                  <Card key={goal.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          {catCfg?.icon}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-medium truncate">{goal.title}</h3>
                              <Badge variant="outline" className={`text-xs shrink-0 ${sCfg?.color}`}>{sCfg?.label}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{goal.description}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelected(goal); setDetailOpen(true); }}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDeleteGoal(goal.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      {/* Progress */}
                      <div className="space-y-1 mb-3">
                        <div className="flex items-center justify-between text-xs">
                          <span>{goal.currentValue}/{goal.targetValue} {goal.unit}</span>
                          <span className="font-medium">{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className="h-2" />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex gap-2">
                          <Badge variant="outline" className={`text-xs ${getCategoryColor(goal.category)}`}>{getCategoryLabel(goal.category)}</Badge>
                          <span>{goal.type === 'team' ? '👥 Timski' : '👤 Individualni'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1"><Gift className="h-3 w-3" /> {goal.points}p</span>
                          <span>📅 {new Date(goal.deadline).toLocaleDateString('sr-RS')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* ─── Izazovi Tab ─────────────────────────────────────────────── */}
        <TabsContent value="challenges" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => { setChallengeForm(emptyChallengeForm); setChallengeDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Novi izazov
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges.map((ch) => {
              const chSCfg = challengeStatusConfig[ch.status]
              const chTCfg = challengeTypeConfig[ch.type]
              const dCfg = difficultyConfig[ch.difficulty]
              const daysLeft = Math.ceil((new Date(ch.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              return (
                <Card key={ch.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl">{chTCfg?.icon}</span>
                      <div className="flex gap-1">
                        <Badge variant="outline" className={`text-xs ${chSCfg?.color}`}>{chSCfg?.label}</Badge>
                        <Badge variant="outline" className={`text-xs ${dCfg?.color}`}>{'★'.repeat(dCfg?.stars || 1)}</Badge>
                      </div>
                    </div>
                    <h3 className="text-sm font-medium mb-1">{ch.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{ch.description}</p>
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Učesnici</span>
                        <span className="font-medium">{ch.participantCount}/{ch.maxParticipants}</span>
                      </div>
                      <Progress value={(ch.participantCount / ch.maxParticipants) * 100} className="h-1.5" />
                      {ch.status === 'active' && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Preostalo</span>
                          <span className="font-medium">{daysLeft > 0 ? `${daysLeft} dana` : 'Završeno'}</span>
                        </div>
                      )}
                    </div>
                    <Separator className="my-3" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Gift className="h-3 w-3" /> {ch.rewardPoints}p</span>
                        <span>✅ {ch.completedCount}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(ch.startDate).toLocaleDateString('sr-RS')} - {new Date(ch.endDate).toLocaleDateString('sr-RS')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* ─── Značke Tab ─────────────────────────────────────────────── */}
        <TabsContent value="badges" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Ukupno {badges.length} znački u sistemu</p>
            <Button size="sm" onClick={() => { setBadgeForm(emptyBadgeForm); setBadgeDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Nova značka
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {badges.map((badge) => (
              <Card key={badge.id} className="hover:shadow-md transition-shadow text-center">
                <CardContent className="p-4">
                  <div className="text-4xl mb-2">{badge.isSecret ? '🔒' : badge.icon}</div>
                  <h3 className="text-sm font-medium mb-1">{badge.isSecret ? '???' : badge.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{badge.isSecret ? 'Tajna značka' : badge.description}</p>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Badge variant="outline" className={`text-xs ${getCategoryColor(badge.category)}`}>{getCategoryLabel(badge.category)}</Badge>
                    {badge.isRare && <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700">⭐ Retko</Badge>}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Gift className="h-3 w-3" /> {badge.points}p</span>
                    <span>🏆 {badge.earnedBy}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ─── Rang Lista Tab ─────────────────────────────────────────── */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Trophy className="h-4 w-4 text-yellow-500" /> Rang lista zaposlenih</CardTitle>
              <CardDescription>Sortirano po ukupnom broju poena</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboard.map((entry) => {
                  const rankDiff = entry.previousRank - entry.rank
                  return (
                    <div key={entry.id} className={`flex items-center justify-between p-3 rounded-lg border ${entry.rank <= 3 ? 'border-yellow-200 bg-yellow-50/50' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-8 text-center">
                          {entry.rank === 1 ? <span className="text-xl">🥇</span> : entry.rank === 2 ? <span className="text-xl">🥈</span> : entry.rank === 3 ? <span className="text-xl">🥉</span> : <span className="text-sm font-bold text-muted-foreground">#{entry.rank}</span>}
                        </div>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{
                          backgroundColor: entry.rank === 1 ? '#fef3c7' : entry.rank === 2 ? '#f3f4f6' : entry.rank === 3 ? '#fed7aa' : '#f1f5f9',
                          color: entry.rank <= 3 ? '#1f2937' : '#64748b',
                        }}>
                          {entry.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{entry.employeeName}</p>
                          <p className="text-xs text-muted-foreground">{entry.department} · Nivo {entry.level}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Award className="h-3 w-3" /> {entry.badges}</span>
                          <span className="flex items-center gap-1"><Flame className="h-3 w-3" /> {entry.streak}d</span>
                          <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {entry.completedGoals}</span>
                        </div>
                        <div className="flex items-center gap-2 min-w-[120px] justify-end">
                          {rankDiff > 0 ? <ArrowUp className="h-4 w-4 text-green-500" /> : rankDiff < 0 ? <ArrowDown className="h-4 w-4 text-red-500" /> : null}
                          <span className="text-lg font-bold">{entry.totalPoints.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground">poena</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Šabloni Tab ────────────────────────────────────────────── */}
        <TabsContent value="templates" className="space-y-4">
          <p className="text-sm text-muted-foreground">Predefinisani šabloni za brzo kreiranje ciljeva</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockTemplates.map((tpl) => {
              const catCfg = goalCategoryConfig[tpl.category]
              const dCfg = difficultyConfig[tpl.difficulty]
              return (
                <Card key={tpl.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {catCfg?.icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">{tpl.title}</h3>
                        <div className="flex gap-1 mt-1">
                          <Badge variant="outline" className={`text-xs ${getCategoryColor(tpl.category)}`}>{getCategoryLabel(tpl.category)}</Badge>
                          <Badge variant="outline" className={`text-xs ${dCfg?.color}`}>{dCfg?.label}</Badge>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{tpl.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{tpl.targetValue} {tpl.unit} · {tpl.points}p</span>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => {
                        setGoalForm({
                          ...emptyGoalForm, title: tpl.title, description: tpl.description,
                          category: tpl.category, targetValue: String(tpl.targetValue),
                          unit: tpl.unit, points: String(tpl.points),
                        })
                        setGoalDialogOpen(true)
                      }}>
                        <Plus className="h-3 w-3 mr-1" /> Koristi
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── Create Goal Dialog ────────────────────────────────────────────── */}
{goalDialogOpen && (
<Card className="border">
<CardHeader className="flex flex-row items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setGoalDialogOpen(false)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0 flex-1"><CardTitle className="text-base">Novi cilj</CardTitle>
            <CardDescription>Definišite cilj sa metama i nagradnim poenima</CardDescription>
          </div>
            </CardHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Naslov</Label><Input value={goalForm.title} onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })} placeholder="Naslov cilja" /></div>
            <div className="space-y-2"><Label>Opis</Label><Textarea value={goalForm.description} onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })} rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategorija</Label>
                <Select value={goalForm.category} onValueChange={(v) => setGoalForm({ ...goalForm, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(goalCategoryConfig).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tip</Label>
                <Select value={goalForm.type} onValueChange={(v) => setGoalForm({ ...goalForm, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">👤 Individualni</SelectItem>
                    <SelectItem value="team">👥 Timski</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Ciljna vrednost</Label><Input type="number" value={goalForm.targetValue} onChange={(e) => setGoalForm({ ...goalForm, targetValue: e.target.value })} /></div>
              <div className="space-y-2"><Label>Jedinica</Label><Input value={goalForm.unit} onChange={(e) => setGoalForm({ ...goalForm, unit: e.target.value })} placeholder="kom, sati..." /></div>
              <div className="space-y-2"><Label>Poeni</Label><Input type="number" value={goalForm.points} onChange={(e) => setGoalForm({ ...goalForm, points: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Rok</Label><Input type="date" value={goalForm.deadline} onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })} /></div>
              <div className="space-y-2"><Label>Zadužen</Label><Input value={goalForm.assignee} onChange={(e) => setGoalForm({ ...goalForm, assignee: e.target.value })} placeholder="Ime ili tim" /></div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <Button variant="outline" onClick={() => setGoalDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleCreateGoal}><Plus className="h-4 w-4 mr-1" /> Kreiraj cilj</Button>
          </div>
</Card>
)}

      {/* ─── Challenge Dialog ──────────────────────────────────────────────── */}
{ challengeDialogOpen && (
<Card className="border">
<CardHeader className="flex flex-row items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setChallengeDialogOpen(false)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0 flex-1"><CardTitle className="text-base">Novi izazov</CardTitle></div>
            </CardHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Naslov</Label><Input value={challengeForm.title} onChange={(e) => setChallengeForm({ ...challengeForm, title: e.target.value })} placeholder="Naziv izazova" /></div>
            <div className="space-y-2"><Label>Opis</Label><Textarea value={challengeForm.description} onChange={(e) => setChallengeForm({ ...challengeForm, description: e.target.value })} rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tip</Label>
                <Select value={challengeForm.type} onValueChange={(v) => setChallengeForm({ ...challengeForm, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(challengeTypeConfig).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Težina</Label>
                <Select value={challengeForm.difficulty} onValueChange={(v) => setChallengeForm({ ...challengeForm, difficulty: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(difficultyConfig).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{'★'.repeat(v.stars)} {v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Početak</Label><Input type="date" value={challengeForm.startDate} onChange={(e) => setChallengeForm({ ...challengeForm, startDate: e.target.value })} /></div>
              <div className="space-y-2"><Label>Kraj</Label><Input type="date" value={challengeForm.endDate} onChange={(e) => setChallengeForm({ ...challengeForm, endDate: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nagrada</Label><Input value={challengeForm.reward} onChange={(e) => setChallengeForm({ ...challengeForm, reward: e.target.value })} placeholder="Opis nagrade" /></div>
              <div className="space-y-2"><Label>Poeni za nagradu</Label><Input type="number" value={challengeForm.rewardPoints} onChange={(e) => setChallengeForm({ ...challengeForm, rewardPoints: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Kriterijum</Label><Input value={challengeForm.criteria} onChange={(e) => setChallengeForm({ ...challengeForm, criteria: e.target.value })} placeholder="Uslov za završetak" /></div>
              <div className="space-y-2"><Label>Max učesnika</Label><Input type="number" value={challengeForm.maxParticipants} onChange={(e) => setChallengeForm({ ...challengeForm, maxParticipants: e.target.value })} /></div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <Button variant="outline" onClick={() => setChallengeDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleCreateChallenge}><Plus className="h-4 w-4 mr-1" /> Kreiraj izazov</Button>
          </div>
</Card>
)}

      {/* ─── Badge Dialog ──────────────────────────────────────────────────── */}
{ badgeDialogOpen && (
<Card className="border">
<CardHeader className="flex flex-row items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setBadgeDialogOpen(false)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0 flex-1"><CardTitle className="text-base">Nova značka</CardTitle></div>
            </CardHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Naziv</Label><Input value={badgeForm.name} onChange={(e) => setBadgeForm({ ...badgeForm, name: e.target.value })} placeholder="Naziv značke" /></div>
            <div className="space-y-2"><Label>Opis</Label><Textarea value={badgeForm.description} onChange={(e) => setBadgeForm({ ...badgeForm, description: e.target.value })} rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ikonica (emoji)</Label>
                <Input value={badgeForm.icon} onChange={(e) => setBadgeForm({ ...badgeForm, icon: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Kategorija</Label>
                <Select value={badgeForm.category} onValueChange={(v) => setBadgeForm({ ...badgeForm, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(goalCategoryConfig).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Uslov za dobijanje</Label><Input value={badgeForm.requirement} onChange={(e) => setBadgeForm({ ...badgeForm, requirement: e.target.value })} placeholder="Npr. 50 zatvorenih ponuda" /></div>
            <div className="space-y-2"><Label>Poeni</Label><Input type="number" value={badgeForm.points} onChange={(e) => setBadgeForm({ ...badgeForm, points: e.target.value })} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <Button variant="outline" onClick={() => setBadgeDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleCreateBadge}><Plus className="h-4 w-4 mr-1" /> Kreiraj značku</Button>
          </div>
</Card>
)}

      {/* ─── Goal Detail Dialog ────────────────────────────────────────────── */}
{ detailOpen && (
<Card className="border">
<CardHeader className="flex flex-row items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setDetailOpen(false)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0 flex-1"><CardTitle className="text-base">Detalji cilja</CardTitle></div>
            </CardHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  {goalCategoryConfig[selected.category]?.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selected.title}</h3>
                  <div className="flex gap-2">
                    <Badge variant="outline" className={`text-xs ${getCategoryColor(selected.category)}`}>{getCategoryLabel(selected.category)}</Badge>
                    <Badge variant="outline" className={`text-xs ${goalStatusConfig[selected.status]?.color}`}>{goalStatusConfig[selected.status]?.label}</Badge>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{selected.description}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Napredak</span>
                  <span className="font-medium">{selected.progress}%</span>
                </div>
                <Progress value={selected.progress} className="h-3" />
                <p className="text-xs text-muted-foreground">{selected.currentValue} / {selected.targetValue} {selected.unit}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Zadužen:</span> <p className="font-medium">{selected.assignee}</p></div>
                <div><span className="text-muted-foreground">Tip:</span> <p className="font-medium">{selected.type === 'team' ? '👥 Timski' : '👤 Individualni'}</p></div>
                <div><span className="text-muted-foreground">Rok:</span> <p className="font-medium">{new Date(selected.deadline).toLocaleDateString('sr-RS')}</p></div>
                <div><span className="text-muted-foreground">Poeni:</span> <p className="font-bold text-green-600">{selected.points}</p></div>
              </div>
              {selected.status === 'active' && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Ostalo vam je {selected.targetValue - selected.currentValue} {selected.unit} do cilja. Rok je {new Date(selected.deadline).toLocaleDateString('sr-RS')}.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
</Card>
)}
    </div>
  )
}
