import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const companyId = searchParams.get('companyId') || ''
  const entity = searchParams.get('entity') || ''
  const action = searchParams.get('action') || ''
  const userId = searchParams.get('userId') || ''
  const from = searchParams.get('from') || ''
  const to = searchParams.get('to') || ''
  const _limit = parseInt(searchParams.get('_limit') || '100')

  if (!companyId) {
    return NextResponse.json({ error: 'companyId je obavezan' }, { status: 400 })
  }

  const where: Record<string, unknown> = { companyId }

  if (entity) where.entity = entity
  if (action) where.action = action
  if (userId) where.userId = userId
  if (from || to) {
    const dateFilter: Record<string, unknown> = {}
    if (from) dateFilter.gte = new Date(from)
    if (to) dateFilter.lte = new Date(to + 'T23:59:59.999Z')
    where.createdAt = dateFilter
  }

  const logs = await db.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: Math.min(_limit, 500),
  })

  // Get user info for each log
  const userIds = [...new Set(logs.filter(l => l.userId).map(l => l.userId!))]
  const users = userIds.length > 0
    ? await db.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, firstName: true, lastName: true },
      })
    : []

  const userMap = Object.fromEntries(users.map(u => [u.id, `${u.firstName} ${u.lastName}`]))

  const enriched = logs.map(log => ({
    ...log,
    userName: log.userId ? userMap[log.userId] || 'Nepoznat korisnik' : 'Sistem',
  }))

  // Stats
  const total = await db.auditLog.count({ where })
  const recentHour = await db.auditLog.count({
    where: { ...where, createdAt: { gte: new Date(Date.now() - 3600000) } },
  })
  const today = await db.auditLog.count({
    where: { ...where, createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
  })
  const byAction = await db.auditLog.groupBy({
    by: ['action'],
    where: { companyId },
    _count: true,
    orderBy: { _count: { action: 'desc' } },
  })
  const byEntity = await db.auditLog.groupBy({
    by: ['entity'],
    where: { companyId },
    _count: true,
    orderBy: { _count: { entity: 'desc' } },
    take: 15,
  })

  return NextResponse.json({
    logs: enriched,
    stats: { total, recentHour, today, byAction, byEntity },
  })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const companyId = searchParams.get('companyId') || ''
  const before = searchParams.get('before') || ''

  if (!companyId) {
    return NextResponse.json({ error: 'companyId je obavezan' }, { status: 400 })
  }

  const where: Record<string, unknown> = { companyId }
  if (before) where.createdAt = { lt: new Date(before) }

  const result = await db.auditLog.deleteMany({ where })
  return NextResponse.json({ deleted: result.count })
}
