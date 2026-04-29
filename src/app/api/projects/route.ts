import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || ''
  const search = searchParams.get('search') || ''
  const priority = searchParams.get('priority') || ''

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (priority) where.priority = priority
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { assignedTo: { contains: search } },
    ]
  }

  const projects = await db.project.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    include: {
      tasks: { orderBy: { orderNum: 'asc', createdAt: 'asc' } },
      partner: { select: { id: true, name: true } },
      timesheetEntries: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  // Auto-calculate progress for each project
  const withProgress = projects.map(p => {
    const tasks = p.tasks || []
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.status === 'zavrseno').length
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    // Auto-update progress in DB if different
    if (progress !== p.progress) {
      db.project.update({ where: { id: p.id }, data: { progress } }).catch(() => {})
    }
    return { ...p, progress }
  })

  return NextResponse.json(withProgress)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, description, status, startDate, endDate, budget, priority, assignedTo, partnerId, tags, color } = body
  if (!name) return NextResponse.json({ error: 'Naziv je obavezan' }, { status: 400 })

  const project = await db.project.create({
    data: {
      name,
      description: description || null,
      status: status || 'aktivan',
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      budget: Number(budget) || 0,
      priority: priority || 'srednji',
      assignedTo: assignedTo || null,
      partnerId: partnerId || null,
      tags: tags || null,
      color: color || null,
      progress: 0,
    },
    include: { tasks: true, partner: { select: { id: true, name: true } } },
  })
  return NextResponse.json(project, { status: 201 })
}
