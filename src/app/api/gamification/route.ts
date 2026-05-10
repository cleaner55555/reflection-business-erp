import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// ============ GET /api/gamification ============
// ?section=all|goals|challenges|badges|leaderboard|dashboard&companyId=xxx&search=xxx&status=xxx&category=xxx

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId') || ''
    const section = searchParams.get('section') || 'all'
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const category = searchParams.get('category')

    const result: Record<string, unknown> = {}

    if (section === 'all' || section === 'goals') {
      const goalsWhere: Record<string, unknown> = { companyId }
      if (status && status !== 'all') goalsWhere.status = status
      if (category && category !== 'all') goalsWhere.category = category

      let goals = await db.gamificationGoal.findMany({
        where: goalsWhere,
        orderBy: { createdAt: 'desc' },
        take: 200,
      })

      if (search) {
        const q = search.toLowerCase()
        goals = goals.filter((g) => g.title.toLowerCase().includes(q))
      }

      result.goals = goals
    }

    if (section === 'all' || section === 'challenges') {
      const challengesWhere: Record<string, unknown> = { companyId }
      if (status && status !== 'all') challengesWhere.status = status

      let challenges = await db.gamificationChallenge.findMany({
        where: challengesWhere,
        orderBy: { createdAt: 'desc' },
        take: 200,
      })

      if (search) {
        const q = search.toLowerCase()
        challenges = challenges.filter((c) => c.title.toLowerCase().includes(q))
      }

      result.challenges = challenges
    }

    if (section === 'all' || section === 'badges') {
      let badges = await db.gamificationBadge.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 200,
      })

      if (search) {
        const q = search.toLowerCase()
        badges = badges.filter((b) => b.name.toLowerCase().includes(q))
      }

      result.badges = badges
    }

    if (section === 'all' || section === 'leaderboard') {
      const entries = await db.gamificationLeaderboardEntry.findMany({
        where: { companyId },
        orderBy: { totalPoints: 'desc' },
        take: 100,
      })
      const ranked = entries.map((e, i) => ({ ...e, rank: i + 1 }))
      result.leaderboard = ranked
    }

    if (section === 'all' || section === 'dashboard') {
      const allGoals = await db.gamificationGoal.findMany({ where: { companyId } })
      const allChallenges = await db.gamificationChallenge.findMany({ where: { companyId } })
      const allBadges = await db.gamificationBadge.findMany({ where: { companyId } })
      const leaderboardEntries = await db.gamificationLeaderboardEntry.findMany({
        where: { companyId },
        orderBy: { totalPoints: 'desc' },
        take: 50,
      })

      const activeGoals = allGoals.filter((g) => g.status === 'active').length
      const completedGoals = allGoals.filter((g) => g.status === 'completed').length
      const activeChallenges = allChallenges.filter((c) => c.status === 'active').length
      const completedChallenges = allChallenges.filter((c) => c.status === 'completed').length
      const totalBadges = allBadges.length
      const earnedBadges = allBadges.reduce((sum, b) => sum + b.earnedBy, 0)
      const totalParticipants = allChallenges.reduce((sum, c) => sum + c.participantCount, 0)

      const topScorer = leaderboardEntries.length > 0 ? leaderboardEntries[0].employeeName : '-'
      const avgPoints = leaderboardEntries.length > 0
        ? Math.round(leaderboardEntries.reduce((s, e) => s + e.totalPoints, 0) / leaderboardEntries.length)
        : 0

      const categories = ['sales', 'productivity', 'learning', 'health', 'team', 'innovation']
      const categoryBreakdown = categories
        .map((cat) => {
          const catGoals = allGoals.filter((g) => g.category === cat)
          return {
            category: cat,
            goals: catGoals.length,
            avgProgress: catGoals.length > 0
              ? Math.round(catGoals.reduce((s, g) => s + g.progress, 0) / catGoals.length)
              : 0,
          }
        })
        .filter((c) => c.goals > 0)

      result.dashboard = {
        activeGoals,
        completedGoals,
        activeChallenges,
        completedChallenges,
        totalBadges,
        earnedBadges,
        totalParticipants,
        topScorer,
        avgPoints,
        recentAchievements: [],
        categoryBreakdown,
        monthlyPoints: [],
      }
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('GET /api/gamification error:', error)
    return NextResponse.json({ success: false, error: 'Greška pri učitavanju' }, { status: 500 })
  }
}

// ============ POST /api/gamification ============
// body: { section: 'goals'|'challenges'|'badges'|'leaderboard', companyId, ...data }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { section, companyId, ...data } = body

    if (!companyId || !section) {
      return NextResponse.json(
        { success: false, error: 'Obavezna polja: companyId, section' },
        { status: 400 }
      )
    }

    if (section === 'goals') {
      const goal = await db.gamificationGoal.create({
        data: {
          companyId,
          title: data.title || '',
          description: data.description || '',
          category: data.category || 'productivity',
          type: data.type || 'individual',
          targetValue: Number(data.targetValue) || 0,
          currentValue: Number(data.currentValue) || 0,
          unit: data.unit || '',
          deadline: data.deadline || '',
          assignee: data.assignee || '',
          assigneeId: data.assigneeId || '',
          status: data.status || 'active',
          points: Number(data.points) || 0,
          progress: Number(data.progress) || 0,
        },
      })
      return NextResponse.json({ success: true, data: goal })
    }

    if (section === 'challenges') {
      const challenge = await db.gamificationChallenge.create({
        data: {
          companyId,
          title: data.title || '',
          description: data.description || '',
          type: data.type || 'daily',
          startDate: data.startDate || '',
          endDate: data.endDate || '',
          reward: data.reward || '',
          rewardPoints: Number(data.rewardPoints) || 0,
          participantCount: Number(data.participantCount) || 0,
          maxParticipants: Number(data.maxParticipants) || 50,
          status: data.status || 'upcoming',
          difficulty: data.difficulty || 'medium',
          completedCount: Number(data.completedCount) || 0,
          criteria: data.criteria || '',
        },
      })
      return NextResponse.json({ success: true, data: challenge })
    }

    if (section === 'badges') {
      const badge = await db.gamificationBadge.create({
        data: {
          companyId,
          name: data.name || '',
          description: data.description || '',
          icon: data.icon || '🏆',
          color: data.color || '#f59e0b',
          category: data.category || 'productivity',
          requirement: data.requirement || '',
          earnedBy: Number(data.earnedBy) || 0,
          points: Number(data.points) || 0,
          isRare: Boolean(data.isRare) || false,
          isSecret: Boolean(data.isSecret) || false,
        },
      })
      return NextResponse.json({ success: true, data: badge })
    }

    if (section === 'leaderboard') {
      const count = await db.gamificationLeaderboardEntry.count({ where: { companyId } })
      const entry = await db.gamificationLeaderboardEntry.create({
        data: {
          companyId,
          employeeId: data.employeeId || '',
          employeeName: data.employeeName || '',
          department: data.department || '',
          avatar: data.avatar || '',
          totalPoints: Number(data.totalPoints) || 0,
          level: Number(data.level) || 1,
          rank: count + 1,
          previousRank: Number(data.previousRank) || 0,
          badges: Number(data.badges) || 0,
          completedGoals: Number(data.completedGoals) || 0,
          streak: Number(data.streak) || 0,
        },
      })
      return NextResponse.json({ success: true, data: entry })
    }

    return NextResponse.json({ success: false, error: 'Nepoznat section' }, { status: 400 })
  } catch (error) {
    console.error('POST /api/gamification error:', error)
    return NextResponse.json({ success: false, error: 'Greška pri kreiranju' }, { status: 500 })
  }
}

// ============ PUT /api/gamification ============

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { section, id, companyId, ...data } = body

    if (!section || !id || !companyId) {
      return NextResponse.json(
        { success: false, error: 'Obavezna polja: section, id, companyId' },
        { status: 400 }
      )
    }

    if (section === 'goals') {
      const updateData: Record<string, unknown> = {}
      if (data.title !== undefined) updateData.title = data.title
      if (data.description !== undefined) updateData.description = data.description
      if (data.category !== undefined) updateData.category = data.category
      if (data.type !== undefined) updateData.type = data.type
      if (data.targetValue !== undefined) updateData.targetValue = Number(data.targetValue)
      if (data.currentValue !== undefined) {
        updateData.currentValue = Number(data.currentValue)
        const tv = Number(data.targetValue)
        if (tv > 0) updateData.progress = Math.min(100, Math.round((Number(data.currentValue) / tv) * 100))
      }
      if (data.unit !== undefined) updateData.unit = data.unit
      if (data.deadline !== undefined) updateData.deadline = data.deadline
      if (data.assignee !== undefined) updateData.assignee = data.assignee
      if (data.assigneeId !== undefined) updateData.assigneeId = data.assigneeId
      if (data.status !== undefined) updateData.status = data.status
      if (data.points !== undefined) updateData.points = Number(data.points)
      if (data.progress !== undefined) updateData.progress = Number(data.progress)

      const goal = await db.gamificationGoal.update({ where: { id, companyId }, data: updateData })
      return NextResponse.json({ success: true, data: goal })
    }

    if (section === 'challenges') {
      const updateData: Record<string, unknown> = {}
      if (data.title !== undefined) updateData.title = data.title
      if (data.description !== undefined) updateData.description = data.description
      if (data.type !== undefined) updateData.type = data.type
      if (data.startDate !== undefined) updateData.startDate = data.startDate
      if (data.endDate !== undefined) updateData.endDate = data.endDate
      if (data.reward !== undefined) updateData.reward = data.reward
      if (data.rewardPoints !== undefined) updateData.rewardPoints = Number(data.rewardPoints)
      if (data.participantCount !== undefined) updateData.participantCount = Number(data.participantCount)
      if (data.maxParticipants !== undefined) updateData.maxParticipants = Number(data.maxParticipants)
      if (data.status !== undefined) updateData.status = data.status
      if (data.difficulty !== undefined) updateData.difficulty = data.difficulty
      if (data.completedCount !== undefined) updateData.completedCount = Number(data.completedCount)
      if (data.criteria !== undefined) updateData.criteria = data.criteria

      const challenge = await db.gamificationChallenge.update({ where: { id, companyId }, data: updateData })
      return NextResponse.json({ success: true, data: challenge })
    }

    if (section === 'badges') {
      const updateData: Record<string, unknown> = {}
      if (data.name !== undefined) updateData.name = data.name
      if (data.description !== undefined) updateData.description = data.description
      if (data.icon !== undefined) updateData.icon = data.icon
      if (data.color !== undefined) updateData.color = data.color
      if (data.category !== undefined) updateData.category = data.category
      if (data.requirement !== undefined) updateData.requirement = data.requirement
      if (data.earnedBy !== undefined) updateData.earnedBy = Number(data.earnedBy)
      if (data.points !== undefined) updateData.points = Number(data.points)
      if (data.isRare !== undefined) updateData.isRare = Boolean(data.isRare)
      if (data.isSecret !== undefined) updateData.isSecret = Boolean(data.isSecret)

      const badge = await db.gamificationBadge.update({ where: { id, companyId }, data: updateData })
      return NextResponse.json({ success: true, data: badge })
    }

    if (section === 'leaderboard') {
      const updateData: Record<string, unknown> = {}
      if (data.employeeId !== undefined) updateData.employeeId = data.employeeId
      if (data.employeeName !== undefined) updateData.employeeName = data.employeeName
      if (data.department !== undefined) updateData.department = data.department
      if (data.avatar !== undefined) updateData.avatar = data.avatar
      if (data.totalPoints !== undefined) updateData.totalPoints = Number(data.totalPoints)
      if (data.level !== undefined) updateData.level = Number(data.level)
      if (data.rank !== undefined) updateData.rank = Number(data.rank)
      if (data.previousRank !== undefined) updateData.previousRank = Number(data.previousRank)
      if (data.badges !== undefined) updateData.badges = Number(data.badges)
      if (data.completedGoals !== undefined) updateData.completedGoals = Number(data.completedGoals)
      if (data.streak !== undefined) updateData.streak = Number(data.streak)

      const entry = await db.gamificationLeaderboardEntry.update({ where: { id, companyId }, data: updateData })
      return NextResponse.json({ success: true, data: entry })
    }

    return NextResponse.json({ success: false, error: 'Nepoznat section' }, { status: 400 })
  } catch (error) {
    console.error('PUT /api/gamification error:', error)
    return NextResponse.json({ success: false, error: 'Greška pri ažuriranju' }, { status: 500 })
  }
}

// ============ DELETE /api/gamification ============
// ?section=goals|challenges|badges|leaderboard&id=xxx&companyId=xxx

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section')
    const id = searchParams.get('id')
    const companyId = searchParams.get('companyId')

    if (!section || !id || !companyId) {
      return NextResponse.json(
        { success: false, error: 'Obavezna polja: section, id, companyId' },
        { status: 400 }
      )
    }

    if (section === 'goals') {
      await db.gamificationGoal.delete({ where: { id, companyId } })
    } else if (section === 'challenges') {
      await db.gamificationChallenge.delete({ where: { id, companyId } })
    } else if (section === 'badges') {
      await db.gamificationBadge.delete({ where: { id, companyId } })
    } else if (section === 'leaderboard') {
      await db.gamificationLeaderboardEntry.delete({ where: { id, companyId } })
    } else {
      return NextResponse.json({ success: false, error: 'Nepoznat section' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/gamification error:', error)
    return NextResponse.json({ success: false, error: 'Greška pri brisanju' }, { status: 500 })
  }
}
