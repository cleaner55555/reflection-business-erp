import { useState, useEffect, useCallback, useMemo } from 'react'

export function useGamification() {
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

  return {
    activeTab,
    badgeDialogOpen,
    badges,
    catCfg,
    categoryFilter,
    chSCfg,
    chTCfg,
    challengeDialogOpen,
    challenges,
    dCfg,
    detailOpen,
    filteredGoals,
    goalDialogOpen,
    handleCreateBadge,
    handleCreateChallenge,
    handleCreateGoal,
    k,
    leaderboard,
    loading,
    mockTemplates,
    sCfg,
    search,
    selected,
    setActiveTab,
    setBadgeDialogOpen,
    setCategoryFilter,
    setChallengeDialogOpen,
    setDetailOpen,
    setGoalDialogOpen,
    setStatusFilter,
    statusFilter,
  }
}
