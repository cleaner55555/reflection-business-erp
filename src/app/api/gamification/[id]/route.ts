import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// ============ GET /api/gamification/[id] ============
// ?section=goals|challenges|badges|leaderboard&companyId=xxx

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId') || ''
    const section = searchParams.get('section') || 'goals'

    if (!companyId) {
      return NextResponse.json({ success: false, error: 'companyId je obavezan' }, { status: 400 })
    }

    if (section === 'goals') {
      const item = await db.gamificationGoal.findFirst({ where: { id, companyId } })
      if (!item) return NextResponse.json({ success: false, error: 'Nije pronađeno' }, { status: 404 })
      return NextResponse.json({ success: true, data: item })
    }

    if (section === 'challenges') {
      const item = await db.gamificationChallenge.findFirst({ where: { id, companyId } })
      if (!item) return NextResponse.json({ success: false, error: 'Nije pronađeno' }, { status: 404 })
      return NextResponse.json({ success: true, data: item })
    }

    if (section === 'badges') {
      const item = await db.gamificationBadge.findFirst({ where: { id, companyId } })
      if (!item) return NextResponse.json({ success: false, error: 'Nije pronađeno' }, { status: 404 })
      return NextResponse.json({ success: true, data: item })
    }

    if (section === 'leaderboard') {
      const item = await db.gamificationLeaderboardEntry.findFirst({ where: { id, companyId } })
      if (!item) return NextResponse.json({ success: false, error: 'Nije pronađeno' }, { status: 404 })
      return NextResponse.json({ success: true, data: item })
    }

    return NextResponse.json({ success: false, error: 'Nepoznat section' }, { status: 400 })
  } catch (error) {
    console.error('GET /api/gamification/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Greška pri učitavanju' }, { status: 500 })
  }
}

// ============ PUT /api/gamification/[id] ============
// body: { section, companyId, ...data }

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { section, companyId, ...data } = body

    if (!section || !companyId) {
      return NextResponse.json({ success: false, error: 'Obavezna polja: section, companyId' }, { status: 400 })
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

      const item = await db.gamificationGoal.update({ where: { id, companyId }, data: updateData })
      return NextResponse.json({ success: true, data: item })
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

      const item = await db.gamificationChallenge.update({ where: { id, companyId }, data: updateData })
      return NextResponse.json({ success: true, data: item })
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

      const item = await db.gamificationBadge.update({ where: { id, companyId }, data: updateData })
      return NextResponse.json({ success: true, data: item })
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

      const item = await db.gamificationLeaderboardEntry.update({ where: { id, companyId }, data: updateData })
      return NextResponse.json({ success: true, data: item })
    }

    return NextResponse.json({ success: false, error: 'Nepoznat section' }, { status: 400 })
  } catch (error) {
    console.error('PUT /api/gamification/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Greška pri ažuriranju' }, { status: 500 })
  }
}

// ============ DELETE /api/gamification/[id] ============
// ?section=goals|challenges|badges|leaderboard&companyId=xxx

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section')
    const companyId = searchParams.get('companyId')

    if (!section || !companyId) {
      return NextResponse.json({ success: false, error: 'Obavezna polja: section, companyId' }, { status: 400 })
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
    console.error('DELETE /api/gamification/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Greška pri brisanju' }, { status: 500 })
  }
}
