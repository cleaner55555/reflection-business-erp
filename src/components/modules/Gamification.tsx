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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
  Trophy, Plus, Search, Eye, Trash2, Edit3, RefreshCw,
  CheckCircle2, Clock, BarChart3, Users, Star,
  TrendingUp, Target, Zap, Award, Medal, Crown,
  Flame, Gift, Lock, Unlock, ArrowUp, ArrowDown,
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

const mockGoals: Goal[] = [
  { id: 'g-1', title: 'Zatvori 10 ponuda ovog meseca', description: 'Cilj za prodajni tim', category: 'sales', type: 'individual', targetValue: 10, currentValue: 7, unit: 'ponuda', deadline: '2025-01-31', assignee: 'Prodajni tim', assigneeId: 'team-1', status: 'active', points: 500, progress: 70, createdAt: '2025-01-01' },
  { id: 'g-2', title: '100 commit-ova nedeljno', description: 'Timski cilj za razvojni tim', category: 'productivity', type: 'team', targetValue: 100, currentValue: 85, unit: 'commit-a', deadline: '2025-01-19', assignee: 'Dev tim', assigneeId: 'team-2', status: 'active', points: 300, progress: 85, createdAt: '2025-01-13' },
  { id: 'g-3', title: 'Završiti AWS sertifikaciju', description: 'Individualni cilj za DevOps inženjera', category: 'learning', type: 'individual', targetValue: 1, currentValue: 0, unit: 'sertifikat', deadline: '2025-03-31', assignee: 'Nikola Ilić', assigneeId: 'emp-6', status: 'active', points: 1000, progress: 0, createdAt: '2025-01-01' },
  { id: 'g-4', title: 'Koraci izazov - 50.000 koraka', description: 'Zdravstveni cilj za ceo tim', category: 'health', type: 'team', targetValue: 50000, currentValue: 32000, unit: 'koraka', deadline: '2025-01-31', assignee: 'Svi zaposleni', assigneeId: 'team-all', status: 'active', points: 200, progress: 64, createdAt: '2025-01-01' },
  { id: 'g-5', title: 'Predstaviti 3 nove ideje', description: 'Inovacioni cilj', category: 'innovation', type: 'individual', targetValue: 3, currentValue: 3, unit: 'ideje', deadline: '2025-01-15', assignee: 'Marko Petrović', assigneeId: 'emp-1', status: 'completed', points: 800, progress: 100, createdAt: '2025-01-01' },
  { id: 'g-6', title: 'Smanjiti response time na < 200ms', description: 'Tehnički cilj za backend tim', category: 'productivity', type: 'team', targetValue: 200, currentValue: 245, unit: 'ms', deadline: '2025-02-28', assignee: 'Backend tim', assigneeId: 'team-3', status: 'active', points: 600, progress: 0, createdAt: '2025-01-05' },
  { id: 'g-7', title: 'Vežbanje 3 puta nedeljno', description: 'Lični zdravstveni cilj', category: 'health', type: 'individual', targetValue: 12, currentValue: 8, unit: 'treninga', deadline: '2025-01-31', assignee: 'Ana Nikolić', assigneeId: 'emp-2', status: 'active', points: 400, progress: 67, createdAt: '2025-01-01' },
  { id: 'g-8', title: 'Proučiti novi framework', description: 'Edukacioni cilj', category: 'learning', type: 'individual', targetValue: 20, currentValue: 20, unit: 'sati', deadline: '2025-01-10', assignee: 'Ivan Đorđević', assigneeId: 'emp-5', status: 'completed', points: 500, progress: 100, createdAt: '2025-01-01' },
]

const mockChallenges: Challenge[] = [
  { id: 'ch-1', title: 'Maraton kodiranja', description: 'Napiši 1000 linija kvalitetnog koda u jednom danu', type: 'daily', startDate: '2025-01-20', endDate: '2025-01-20', reward: 'Badge: Code Warrior', rewardPoints: 200, participantCount: 12, maxParticipants: 20, status: 'upcoming', difficulty: 'hard', completedCount: 0, criteria: '1000 linija koda sa testovima', createdAt: '2025-01-15' },
  { id: 'ch-2', title: 'Sedmična produktivnost', description: 'Postigni sve dnevne zadatke svaki dan ove nedelje', type: 'weekly', startDate: '2025-01-13', endDate: '2025-01-19', reward: '500 poena + Badge: Productivity Master', rewardPoints: 500, participantCount: 25, maxParticipants: 50, status: 'active', difficulty: 'medium', completedCount: 8, criteria: '100% dnevnih zadataka 5 dana', createdAt: '2025-01-10' },
  { id: 'ch-3', title: 'Januarski prodajni sprint', description: 'Postigni prodajni cilj od 50.000 EUR ovog meseca', type: 'monthly', startDate: '2025-01-01', endDate: '2025-01-31', reward: 'Team dinner + 1000 poena', rewardPoints: 1000, participantCount: 8, maxParticipants: 10, status: 'active', difficulty: 'hard', completedCount: 0, criteria: '50.000 EUR ukupne prodaje', createdAt: '2025-01-01' },
  { id: 'ch-4', title: 'Novogodišnji zdravstveni izazov', description: '30 dana aktivnosti - bar 30 min svaki dan', type: 'monthly', startDate: '2025-01-01', endDate: '2025-01-30', reward: 'Badge: Health Champion + 300 poena', rewardPoints: 300, participantCount: 35, maxParticipants: 100, status: 'active', difficulty: 'medium', completedCount: 12, criteria: '30 min aktivnosti 30 dana', createdAt: '2024-12-28' },
  { id: 'ch-5', title: 'Zimski hackathon', description: '48-satni hackathon sa timom', type: 'special', startDate: '2025-02-15', endDate: '2025-02-16', reward: 'Pobednički tim: 2000 poena + Trophy', rewardPoints: 2000, participantCount: 0, maxParticipants: 40, status: 'upcoming', difficulty: 'epic', completedCount: 0, criteria: 'Najbolji prototip po oceni žirija', createdAt: '2025-01-10' },
  { id: 'ch-6', title: 'Kviz: Tehnologije', description: 'Tehnološki kviz sa 50 pitanja', type: 'daily', startDate: '2025-01-17', endDate: '2025-01-17', reward: '100 poena', rewardPoints: 100, participantCount: 18, maxParticipants: 50, status: 'completed', difficulty: 'easy', completedCount: 15, criteria: 'Minimalno 70% tačnosti', createdAt: '2025-01-15' },
]

const mockBadges: BadgeItem[] = [
  { id: 'b-1', name: 'Code Warrior', description: 'Napisao 1000+ linija koda u jednom danu', icon: '⚔️', color: '#ef4444', category: 'productivity', requirement: '1000 linija koda/dan', earnedBy: 5, points: 200, isRare: true, isSecret: false },
  { id: 'b-2', name: 'Sales Master', description: 'Zatvorio 50+ ponuda', icon: '💰', color: '#22c55e', category: 'sales', requirement: '50 zatvorenih ponuda', earnedBy: 3, points: 500, isRare: true, isSecret: false },
  { id: 'b-3', name: 'Team Player', description: 'Učestvovao u 10+ timskih projekata', icon: '🤝', color: '#3b82f6', category: 'team', requirement: '10 timskih projekata', earnedBy: 12, points: 300, isRare: false, isSecret: false },
  { id: 'b-4', name: 'Quick Learner', description: 'Završio 5+ kurseva', icon: '📚', color: '#a855f7', category: 'learning', requirement: '5 završenih kurseva', earnedBy: 8, points: 400, isRare: false, isSecret: false },
  { id: 'b-5', name: 'Health Champion', description: '30 dana uzastopne aktivnosti', icon: '🏋️', color: '#f97316', category: 'health', requirement: '30 dana aktivnosti', earnedBy: 6, points: 300, isRare: false, isSecret: false },
  { id: 'b-6', name: 'Innovation Spark', description: 'Predložio 10+ ideja za poboljšanje', icon: '💡', color: '#eab308', category: 'innovation', requirement: '10 predloga ideja', earnedBy: 4, points: 350, isRare: false, isSecret: false },
  { id: 'b-7', name: 'Mentor', description: 'Mentorisao 5+ junior zaposlenih', icon: '🎓', color: '#06b6d4', category: 'team', requirement: '5 mentoring relacija', earnedBy: 3, points: 600, isRare: true, isSecret: false },
  { id: 'b-8', name: 'Night Owl', description: 'Rad posle ponoći 20+ puta', icon: '🦉', color: '#6366f1', category: 'productivity', requirement: '20 radnih noći', earnedBy: 2, points: 150, isRare: true, isSecret: true },
  { id: 'b-9', name: 'Streak Master', description: '30 dana uzastopnog zadovoljavanja ciljeva', icon: '🔥', color: '#dc2626', category: 'productivity', requirement: '30 dana streak', earnedBy: 1, points: 1000, isRare: true, isSecret: false },
  { id: 'b-10', name: 'First Blood', description: 'Prvi zaposleni koji je završio izazov', icon: '🏆', color: '#f59e0b', category: 'special', requirement: 'Prvi u izazovu', earnedBy: 7, points: 100, isRare: false, isSecret: false },
  { id: 'b-11', name: 'Certified Pro', description: 'Dobio 3+ profesionalna sertifikata', icon: '🎖️', color: '#059669', category: 'learning', requirement: '3 sertifikata', earnedBy: 2, points: 800, isRare: true, isSecret: false },
  { id: 'b-12', name: 'Helping Hand', description: 'Pomogao 50+ kolega na forumu/podršci', icon: '🤲', color: '#0ea5e9', category: 'team', requirement: '50 pomoći', earnedBy: 5, points: 250, isRare: false, isSecret: false },
]

const mockLeaderboard: LeaderboardEntry[] = [
  { id: 'lb-1', employeeId: 'emp-2', employeeName: 'Ana Nikolić', department: 'Razvoj', avatar: 'AN', totalPoints: 4250, level: 12, rank: 1, previousRank: 2, badges: 8, completedGoals: 15, streak: 14 },
  { id: 'lb-2', employeeId: 'emp-4', employeeName: 'Petar Jovanović', department: 'Razvoj', avatar: 'PJ', totalPoints: 3980, level: 11, rank: 2, previousRank: 1, badges: 7, completedGoals: 14, streak: 10 },
  { id: 'lb-3', employeeId: 'emp-3', employeeName: 'Jelena Stanković', department: 'Razvoj', avatar: 'JS', totalPoints: 3650, level: 10, rank: 3, previousRank: 3, badges: 6, completedGoals: 12, streak: 8 },
  { id: 'lb-4', employeeId: 'emp-1', employeeName: 'Marko Petrović', department: 'Razvoj', avatar: 'MP', totalPoints: 3200, level: 9, rank: 4, previousRank: 5, badges: 5, completedGoals: 11, streak: 21 },
  { id: 'lb-5', employeeId: 'emp-6', employeeName: 'Nikola Ilić', department: 'DevOps', avatar: 'NI', totalPoints: 2950, level: 9, rank: 5, previousRank: 4, badges: 5, completedGoals: 10, streak: 6 },
  { id: 'lb-6', employeeId: 'emp-5', employeeName: 'Ivan Đorđević', department: 'Dizajn', avatar: 'ID', totalPoints: 2600, level: 8, rank: 6, previousRank: 7, badges: 4, completedGoals: 9, streak: 5 },
  { id: 'lb-7', employeeId: 'emp-7', employeeName: 'Milena Radovanović', department: 'Marketing', avatar: 'MR', totalPoints: 1800, level: 6, rank: 7, previousRank: 8, badges: 3, completedGoals: 5, streak: 3 },
  { id: 'lb-8', employeeId: 'emp-8', employeeName: 'Lazar Matić', department: 'Razvoj', avatar: 'LM', totalPoints: 1500, level: 5, rank: 8, previousRank: 6, badges: 2, completedGoals: 4, streak: 0 },
  { id: 'lb-9', employeeId: 'emp-9', employeeName: 'Sanja Vuković', department: 'Admin', avatar: 'SV', totalPoints: 1200, level: 4, rank: 9, previousRank: 9, badges: 2, completedGoals: 3, streak: 2 },
  { id: 'lb-10', employeeId: 'emp-10', employeeName: 'Dragan Stojanović', department: 'Finansije', avatar: 'DS', totalPoints: 900, level: 3, rank: 10, previousRank: 10, badges: 1, completedGoals: 2, streak: 0 },
]

const mockTemplates: GoalTemplate[] = [
  { id: 'tpl-1', title: 'Dnevna prodaja', description: 'Postigni dnevni prodajni cilj', category: 'sales', type: 'individual', targetValue: 5, unit: 'prodaja', points: 100, difficulty: 'easy' },
  { id: 'tpl-2', title: 'Sedmični kod revju', description: 'Odradi 3 kod revjua nedeljno', category: 'productivity', type: 'individual', targetValue: 3, unit: 'revjua', points: 150, difficulty: 'medium' },
  { id: 'tpl-3', title: 'Mesečno učenje', description: 'Provedi 20 sati na edukaciji mesečno', category: 'learning', type: 'individual', targetValue: 20, unit: 'sati', points: 300, difficulty: 'medium' },
  { id: 'tpl-4', title: 'Kondicioni izazov', description: 'Trči 50km mesečno', category: 'health', type: 'individual', targetValue: 50, unit: 'km', points: 200, difficulty: 'hard' },
  { id: 'tpl-5', title: 'Timski sprint', description: 'Završite sprint bez zaduženja', category: 'productivity', type: 'team', targetValue: 100, unit: '%', points: 500, difficulty: 'hard' },
]

const mockDashboard: GamificationDashboard = {
  activeGoals: 6,
  completedGoals: 15,
  activeChallenges: 3,
  completedChallenges: 12,
  totalBadges: 12,
  earnedBadges: 47,
  totalParticipants: 35,
  topScorer: 'Ana Nikolić',
  avgPoints: 2800,
  recentAchievements: [
    { employee: 'Marko Petrović', action: 'Završio cilj: Predstavi 3 ideje', points: 800, time: 'Pre 2 sata' },
    { employee: 'Ivan Đorđević', action: 'Završio cilj: Prouči framework', points: 500, time: 'Pre 5 sati' },
    { employee: 'Ana Nikolić', action: 'Badge: Code Warrior', points: 200, time: 'Pre 1 dan' },
    { employee: 'Tim Dev', action: 'Sedmični cilj: 100 commit-a', points: 300, time: 'Pre 1 dan' },
    { employee: 'Petar Jovanović', action: 'Izazov: Tehno kviz', points: 100, time: 'Pre 2 dana' },
  ],
  categoryBreakdown: [
    { category: 'sales', goals: 3, avgProgress: 65 },
    { category: 'productivity', goals: 5, avgProgress: 72 },
    { category: 'learning', goals: 4, avgProgress: 55 },
    { category: 'health', goals: 3, avgProgress: 68 },
    { category: 'team', goals: 4, avgProgress: 80 },
    { category: 'innovation', goals: 2, avgProgress: 45 },
  ],
  monthlyPoints: [
    { month: 'Avg', points: 12000 },
    { month: 'Sep', points: 14500 },
    { month: 'Okt', points: 13800 },
    { month: 'Nov', points: 15200 },
    { month: 'Dec', points: 9800 },
    { month: 'Jan', points: 16500 },
  ],
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Gamifikacija() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
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

  // ─── Data Loading ───────────────────────────────────────────────────────

  const loadGoals = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      setGoals(mockGoals)
    } catch { setGoals(mockGoals) }
    setLoading(false)
  }, [activeCompanyId])

  const loadChallenges = useCallback(async () => { setChallenges(mockChallenges) }, [])
  const loadBadges = useCallback(async () => { setBadges(mockBadges) }, [])
  const loadLeaderboard = useCallback(async () => { setLeaderboard(mockLeaderboard) }, [])

  const loadDashboard = useCallback(async () => {
    if (!activeCompanyId) return
    try { setDashboard(mockDashboard) } catch { setDashboard(mockDashboard) }
  }, [activeCompanyId])

  useEffect(() => {
    loadGoals(); loadChallenges(); loadBadges(); loadLeaderboard(); loadDashboard()
  }, [activeCompanyId, loadGoals, loadChallenges, loadBadges, loadLeaderboard, loadDashboard])

  // ─── Computed ───────────────────────────────────────────────────────────

  const filteredGoals = goals.filter((g) => {
    if (search && !g.title.toLowerCase().includes(search.toLowerCase())) return false
    if (categoryFilter !== 'all' && g.category !== categoryFilter) return false
    if (statusFilter !== 'all' && g.status !== statusFilter) return false
    return true
  })

  // ─── Handlers ───────────────────────────────────────────────────────────

  const handleCreateGoal = async () => {
    if (!goalForm.title.trim()) return
    const newGoal: Goal = {
      id: `g-${Date.now()}`, title: goalForm.title, description: goalForm.description,
      category: goalForm.category, type: goalForm.type,
      targetValue: parseInt(goalForm.targetValue) || 0, currentValue: 0, unit: goalForm.unit,
      deadline: goalForm.deadline, assignee: goalForm.assignee, assigneeId: `a-${Date.now()}`,
      status: 'active', points: parseInt(goalForm.points) || 0, progress: 0,
      createdAt: new Date().toISOString(),
    }
    setGoals([newGoal, ...goals])
    setGoalDialogOpen(false)
    setGoalForm(emptyGoalForm)
    loadDashboard()
  }

  const handleCreateChallenge = async () => {
    if (!challengeForm.title.trim()) return
    const newChallenge: Challenge = {
      id: `ch-${Date.now()}`, title: challengeForm.title, description: challengeForm.description,
      type: challengeForm.type, startDate: challengeForm.startDate, endDate: challengeForm.endDate,
      reward: challengeForm.reward, rewardPoints: parseInt(challengeForm.rewardPoints) || 0,
      participantCount: 0, maxParticipants: parseInt(challengeForm.maxParticipants) || 50,
      status: 'upcoming', difficulty: challengeForm.difficulty, completedCount: 0,
      criteria: challengeForm.criteria, createdAt: new Date().toISOString(),
    }
    setChallenges([newChallenge, ...challenges])
    setChallengeDialogOpen(false)
    setChallengeForm(emptyChallengeForm)
  }

  const handleCreateBadge = async () => {
    if (!badgeForm.name.trim()) return
    const newBadge: BadgeItem = {
      id: `b-${Date.now()}`, ...badgeForm, earnedBy: 0, points: parseInt(badgeForm.points) || 0,
      isRare: false, isSecret: false,
    }
    setBadges([...badges, newBadge])
    setBadgeDialogOpen(false)
    setBadgeForm(emptyBadgeForm)
  }

  const handleDeleteGoal = (id: string) => {
    if (!confirm('Obrisati cilj?')) return
    setGoals(goals.filter((g) => g.id !== id))
    loadDashboard()
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
          <Button variant="outline" size="sm" onClick={() => { loadGoals(); loadDashboard(); }}>
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
                  <p className="text-[10px] text-muted-foreground mt-1">{dashboard.completedGoals} završenih</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Aktivni izazovi</span>
                    <Swords className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-amber-600">{dashboard.activeChallenges}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{dashboard.totalParticipants} učesnika</p>
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
                  <p className="text-[10px] text-muted-foreground mt-1">Prosek: {dashboard.avgPoints} poena</p>
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
                          <span className="text-[10px] text-muted-foreground">{m.month}</span>
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
                            <p className="text-[10px] text-muted-foreground">{a.time}</p>
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
                        <p className="text-[10px] text-muted-foreground">poena</p>
                        <div className="flex items-center justify-center gap-2 mt-1">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Award className="h-3 w-3" /> {entry.badges}</span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Flame className="h-3 w-3" /> {entry.streak}d</span>
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
                              <Badge variant="outline" className={`text-[10px] shrink-0 ${sCfg?.color}`}>{sCfg?.label}</Badge>
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
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <div className="flex gap-2">
                          <Badge variant="outline" className={`text-[10px] ${getCategoryColor(goal.category)}`}>{getCategoryLabel(goal.category)}</Badge>
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
                        <Badge variant="outline" className={`text-[10px] ${chSCfg?.color}`}>{chSCfg?.label}</Badge>
                        <Badge variant="outline" className={`text-[10px] ${dCfg?.color}`}>{'★'.repeat(dCfg?.stars || 1)}</Badge>
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
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Gift className="h-3 w-3" /> {ch.rewardPoints}p</span>
                        <span>✅ {ch.completedCount}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">
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
                  <p className="text-[10px] text-muted-foreground line-clamp-2 mb-2">{badge.isSecret ? 'Tajna značka' : badge.description}</p>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Badge variant="outline" className={`text-[10px] ${getCategoryColor(badge.category)}`}>{getCategoryLabel(badge.category)}</Badge>
                    {badge.isRare && <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700">⭐ Retko</Badge>}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
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
                          <p className="text-[10px] text-muted-foreground">{entry.department} · Nivo {entry.level}</p>
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
                          <span className="text-[10px] text-muted-foreground">poena</span>
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
                          <Badge variant="outline" className={`text-[10px] ${getCategoryColor(tpl.category)}`}>{getCategoryLabel(tpl.category)}</Badge>
                          <Badge variant="outline" className={`text-[10px] ${dCfg?.color}`}>{dCfg?.label}</Badge>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{tpl.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{tpl.targetValue} {tpl.unit} · {tpl.points}p</span>
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
      <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novi cilj</DialogTitle>
            <DialogDescription>Definišite cilj sa metama i nagradnim poenima</DialogDescription>
          </DialogHeader>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setGoalDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleCreateGoal}><Plus className="h-4 w-4 mr-1" /> Kreiraj cilj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Challenge Dialog ──────────────────────────────────────────────── */}
      <Dialog open={challengeDialogOpen} onOpenChange={setChallengeDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Novi izazov</DialogTitle></DialogHeader>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setChallengeDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleCreateChallenge}><Plus className="h-4 w-4 mr-1" /> Kreiraj izazov</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Badge Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={badgeDialogOpen} onOpenChange={setBadgeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Nova značka</DialogTitle></DialogHeader>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setBadgeDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleCreateBadge}><Plus className="h-4 w-4 mr-1" /> Kreiraj značku</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Goal Detail Dialog ────────────────────────────────────────────── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Detalji cilja</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  {goalCategoryConfig[selected.category]?.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selected.title}</h3>
                  <div className="flex gap-2">
                    <Badge variant="outline" className={`text-[10px] ${getCategoryColor(selected.category)}`}>{getCategoryLabel(selected.category)}</Badge>
                    <Badge variant="outline" className={`text-[10px] ${goalStatusConfig[selected.status]?.color}`}>{goalStatusConfig[selected.status]?.label}</Badge>
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
        </DialogContent>
      </Dialog>
    </div>
  )
}
