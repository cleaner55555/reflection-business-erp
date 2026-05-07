export interface Goal {
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
export interface Challenge {
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
export interface BadgeItem {
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
export interface LeaderboardEntry {
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
export interface GoalTemplate {
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
export interface GamificationDashboard {
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

}