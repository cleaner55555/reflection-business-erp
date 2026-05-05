export const goalStatusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-700' },
  active: { label: 'Aktivan', color: 'bg-green-100 text-green-700' },
  completed: { label: 'Završen', color: 'bg-blue-100 text-blue-700' },
  failed: { label: 'Nije ostvaren', color: 'bg-red-100 text-red-700' },
  paused: { label: 'Pauziran', color: 'bg-amber-100 text-amber-700' },
}

export const challengeStatusConfig: Record<string, { label: string; color: string }> = {
  upcoming: { label: 'Predstojeći', color: 'bg-gray-100 text-gray-700' },
  active: { label: 'Aktivan', color: 'bg-green-100 text-green-700' },
  completed: { label: 'Završen', color: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'Otkazan', color: 'bg-red-100 text-red-700' },
}

export const challengeTypeConfig: Record<string, { label: string; color: string; icon: string }> = {
  daily: { label: 'Dnevni', color: 'bg-amber-50 text-amber-700', icon: '☀️' },
  weekly: { label: 'Sedmični', color: 'bg-blue-50 text-blue-700', icon: '📅' },
  monthly: { label: 'Mesečni', color: 'bg-purple-50 text-purple-700', icon: '🗓️' },
  quarterly: { label: 'Kvartalni', color: 'bg-green-50 text-green-700', icon: '📊' },
  special: { label: 'Specijalni', color: 'bg-red-50 text-red-700', icon: '🏆' },
}

export const difficultyConfig: Record<string, { label: string; color: string; stars: number }> = {
  easy: { label: 'Lako', color: 'bg-green-100 text-green-700', stars: 1 },
  medium: { label: 'Srednje', color: 'bg-amber-100 text-amber-700', stars: 2 },
  hard: { label: 'Teško', color: 'bg-red-100 text-red-700', stars: 3 },
  epic: { label: 'Epic', color: 'bg-purple-100 text-purple-700', stars: 4 },
}

export const goalCategoryConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  sales: { label: 'Prodaja', color: 'bg-green-100 text-green-700', icon: <TrendingUp className="h-4 w-4" /> },
  productivity: { label: 'Produktivnost', color: 'bg-blue-100 text-blue-700', icon: <Zap className="h-4 w-4" /> },
  learning: { label: 'Učenje', color: 'bg-purple-100 text-purple-700', icon: <Brain className="h-4 w-4" /> },
  health: { label: 'Zdravlje', color: 'bg-red-100 text-red-700', icon: <Heart className="h-4 w-4" /> },
  team: { label: 'Tim', color: 'bg-amber-100 text-amber-700', icon: <Users className="h-4 w-4" /> },
  innovation: { label: 'Inovacije', color: 'bg-cyan-100 text-cyan-700', icon: <Sparkles className="h-4 w-4" /> },
}

export const mockGoals: Goal[] = [
  { id: 'g-1', title: 'Zatvori 10 ponuda ovog meseca', description: 'Cilj za prodajni tim', category: 'sales', type: 'individual', targetValue: 10, currentValue: 7, unit: 'ponuda', deadline: '2025-01-31', assignee: 'Prodajni tim', assigneeId: 'team-1', status: 'active', points: 500, progress: 70, createdAt: '2025-01-01' },
  { id: 'g-2', title: '100 commit-ova nedeljno', description: 'Timski cilj za razvojni tim', category: 'productivity', type: 'team', targetValue: 100, currentValue: 85, unit: 'commit-a', deadline: '2025-01-19', assignee: 'Dev tim', assigneeId: 'team-2', status: 'active', points: 300, progress: 85, createdAt: '2025-01-13' },
  { id: 'g-3', title: 'Završiti AWS sertifikaciju', description: 'Individualni cilj za DevOps inženjera', category: 'learning', type: 'individual', targetValue: 1, currentValue: 0, unit: 'sertifikat', deadline: '2025-03-31', assignee: 'Nikola Ilić', assigneeId: 'emp-6', status: 'active', points: 1000, progress: 0, createdAt: '2025-01-01' },
  { id: 'g-4', title: 'Koraci izazov - 50.000 koraka', description: 'Zdravstveni cilj za ceo tim', category: 'health', type: 'team', targetValue: 50000, currentValue: 32000, unit: 'koraka', deadline: '2025-01-31', assignee: 'Svi zaposleni', assigneeId: 'team-all', status: 'active', points: 200, progress: 64, createdAt: '2025-01-01' },
  { id: 'g-5', title: 'Predstaviti 3 nove ideje', description: 'Inovacioni cilj', category: 'innovation', type: 'individual', targetValue: 3, currentValue: 3, unit: 'ideje', deadline: '2025-01-15', assignee: 'Marko Petrović', assigneeId: 'emp-1', status: 'completed', points: 800, progress: 100, createdAt: '2025-01-01' },
  { id: 'g-6', title: 'Smanjiti response time na < 200ms', description: 'Tehnički cilj za backend tim', category: 'productivity', type: 'team', targetValue: 200, currentValue: 245, unit: 'ms', deadline: '2025-02-28', assignee: 'Backend tim', assigneeId: 'team-3', status: 'active', points: 600, progress: 0, createdAt: '2025-01-05' },
  { id: 'g-7', title: 'Vežbanje 3 puta nedeljno', description: 'Lični zdravstveni cilj', category: 'health', type: 'individual', targetValue: 12, currentValue: 8, unit: 'treninga', deadline: '2025-01-31', assignee: 'Ana Nikolić', assigneeId: 'emp-2', status: 'active', points: 400, progress: 67, createdAt: '2025-01-01' },
  { id: 'g-8', title: 'Proučiti novi framework', description: 'Edukacioni cilj', category: 'learning', type: 'individual', targetValue: 20, currentValue: 20, unit: 'sati', deadline: '2025-01-10', assignee: 'Ivan Đorđević', assigneeId: 'emp-5', status: 'completed', points: 500, progress: 100, createdAt: '2025-01-01' },
]

export const mockChallenges: Challenge[] = [
  { id: 'ch-1', title: 'Maraton kodiranja', description: 'Napiši 1000 linija kvalitetnog koda u jednom danu', type: 'daily', startDate: '2025-01-20', endDate: '2025-01-20', reward: 'Badge: Code Warrior', rewardPoints: 200, participantCount: 12, maxParticipants: 20, status: 'upcoming', difficulty: 'hard', completedCount: 0, criteria: '1000 linija koda sa testovima', createdAt: '2025-01-15' },
  { id: 'ch-2', title: 'Sedmična produktivnost', description: 'Postigni sve dnevne zadatke svaki dan ove nedelje', type: 'weekly', startDate: '2025-01-13', endDate: '2025-01-19', reward: '500 poena + Badge: Productivity Master', rewardPoints: 500, participantCount: 25, maxParticipants: 50, status: 'active', difficulty: 'medium', completedCount: 8, criteria: '100% dnevnih zadataka 5 dana', createdAt: '2025-01-10' },
  { id: 'ch-3', title: 'Januarski prodajni sprint', description: 'Postigni prodajni cilj od 50.000 EUR ovog meseca', type: 'monthly', startDate: '2025-01-01', endDate: '2025-01-31', reward: 'Team dinner + 1000 poena', rewardPoints: 1000, participantCount: 8, maxParticipants: 10, status: 'active', difficulty: 'hard', completedCount: 0, criteria: '50.000 EUR ukupne prodaje', createdAt: '2025-01-01' },
  { id: 'ch-4', title: 'Novogodišnji zdravstveni izazov', description: '30 dana aktivnosti - bar 30 min svaki dan', type: 'monthly', startDate: '2025-01-01', endDate: '2025-01-30', reward: 'Badge: Health Champion + 300 poena', rewardPoints: 300, participantCount: 35, maxParticipants: 100, status: 'active', difficulty: 'medium', completedCount: 12, criteria: '30 min aktivnosti 30 dana', createdAt: '2024-12-28' },
  { id: 'ch-5', title: 'Zimski hackathon', description: '48-satni hackathon sa timom', type: 'special', startDate: '2025-02-15', endDate: '2025-02-16', reward: 'Pobednički tim: 2000 poena + Trophy', rewardPoints: 2000, participantCount: 0, maxParticipants: 40, status: 'upcoming', difficulty: 'epic', completedCount: 0, criteria: 'Najbolji prototip po oceni žirija', createdAt: '2025-01-10' },
  { id: 'ch-6', title: 'Kviz: Tehnologije', description: 'Tehnološki kviz sa 50 pitanja', type: 'daily', startDate: '2025-01-17', endDate: '2025-01-17', reward: '100 poena', rewardPoints: 100, participantCount: 18, maxParticipants: 50, status: 'completed', difficulty: 'easy', completedCount: 15, criteria: 'Minimalno 70% tačnosti', createdAt: '2025-01-15' },
]

export const mockBadges: BadgeItem[] = [
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

export const mockLeaderboard: LeaderboardEntry[] = [
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

export const mockTemplates: GoalTemplate[] = [
  { id: 'tpl-1', title: 'Dnevna prodaja', description: 'Postigni dnevni prodajni cilj', category: 'sales', type: 'individual', targetValue: 5, unit: 'prodaja', points: 100, difficulty: 'easy' },
  { id: 'tpl-2', title: 'Sedmični kod revju', description: 'Odradi 3 kod revjua nedeljno', category: 'productivity', type: 'individual', targetValue: 3, unit: 'revjua', points: 150, difficulty: 'medium' },
  { id: 'tpl-3', title: 'Mesečno učenje', description: 'Provedi 20 sati na edukaciji mesečno', category: 'learning', type: 'individual', targetValue: 20, unit: 'sati', points: 300, difficulty: 'medium' },
  { id: 'tpl-4', title: 'Kondicioni izazov', description: 'Trči 50km mesečno', category: 'health', type: 'individual', targetValue: 50, unit: 'km', points: 200, difficulty: 'hard' },
  { id: 'tpl-5', title: 'Timski sprint', description: 'Završite sprint bez zaduženja', category: 'productivity', type: 'team', targetValue: 100, unit: '%', points: 500, difficulty: 'hard' },
]

export const mockDashboard: GamificationDashboard = {
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

export const { activeCompanyId } = useAppStore();

export const { t } = useTranslation();

export const emptyGoalForm = {
    title: '', description: '', category: 'productivity', type: 'individual',
    targetValue: '', unit: '', deadline: '', assignee: '', points: '',
  }

export const emptyChallengeForm = {
    title: '', description: '', type: 'daily', startDate: '', endDate: '',
    reward: '', rewardPoints: '', difficulty: 'medium', criteria: '', maxParticipants: '',
  }

export const emptyBadgeForm = {
    name: '', description: '', icon: '🏆', color: '#f59e0b', category: 'productivity',
    requirement: '', points: '',
  }

export const filteredGoals = goals.filter((g) => {
    if (search && !g.title.toLowerCase().includes(search.toLowerCase())) return false
    if (categoryFilter !== 'all' && g.category !== categoryFilter) return false
    if (statusFilter !== 'all' && g.status !== statusFilter) return false
    return true
  });

export const handleCreateGoal = async () => {
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

export const handleCreateChallenge = async () => {
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

export const handleCreateBadge = async () => {
    if (!badgeForm.name.trim()) return
    const newBadge: BadgeItem = {
      id: `b-${Date.now()}`, ...badgeForm, earnedBy: 0, points: parseInt(badgeForm.points) || 0,
      isRare: false, isSecret: false,
    }
    setBadges([...badges, newBadge])
    setBadgeDialogOpen(false)
    setBadgeForm(emptyBadgeForm)
  }

export const handleDeleteGoal = (id: string) => {
    if (!confirm('Obrisati cilj?')) return
    setGoals(goals.filter((g) => g.id !== id))
    loadDashboard()
  }

export const getCategoryLabel = (catId: string) => goalCategoryConfig[catId]?.label || catId;

export const getCategoryColor = (catId: string) => goalCategoryConfig[catId]?.color || 'bg-gray-100 text-gray-700';

export const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500'
    if (progress >= 70) return 'bg-blue-500'
    if (progress >= 40) return 'bg-amber-500'
    return 'bg-red-500'
  }

export const maxPts = Math.max(...dashboard.monthlyPoints.map((x) => x.points));

export const catCfg = goalCategoryConfig[cat.category]

export const sCfg = goalStatusConfig[goal.status]

export const catCfg = goalCategoryConfig[goal.category]

export const chSCfg = challengeStatusConfig[ch.status]

export const chTCfg = challengeTypeConfig[ch.type]

export const dCfg = difficultyConfig[ch.difficulty]

export const daysLeft = Math.ceil((new Date(ch.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

export const rankDiff = entry.previousRank - entry.rank;

export const catCfg = goalCategoryConfig[tpl.category]

export const dCfg = difficultyConfig[tpl.difficulty]
