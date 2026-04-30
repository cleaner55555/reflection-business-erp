import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await db.project.findUnique({
    where: { id },
    include: {
      tasks: { orderBy: { orderNum: 'asc', createdAt: 'asc' } },
      partner: { select: { id: true, name: true } },
      timesheetEntries: { orderBy: { date: 'desc' } },
    },
  })
  if (!project) return NextResponse.json({ error: 'Nije pronađeno' }, { status: 404 })

  // Auto-calculate progress
  const tasks = project.tasks || []
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'zavrseno').length
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  if (progress !== project.progress) {
    const updated = await db.project.update({ where: { id }, data: { progress } })
    return NextResponse.json({ ...updated, tasks: project.tasks, partner: project.partner, timesheetEntries: project.timesheetEntries })
  }

  return NextResponse.json(project)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  try {
    // Remove computed fields from update data
    const { tasks, partner, timesheetEntries, progress, ...data } = body as Record<string, unknown>
    const p = await db.project.update({ where: { id }, data })
    return NextResponse.json(p)
  } catch {
    return NextResponse.json({ error: 'Greška' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await db.timesheetEntry.deleteMany({ where: { projectId: id } })
    await db.project.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Greška' }, { status: 500 })
  }
}
