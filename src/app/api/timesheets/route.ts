import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId') || ''
  const taskId = searchParams.get('taskId') || ''
  const dateFrom = searchParams.get('dateFrom') || ''
  const dateTo = searchParams.get('dateTo') || ''
  const employeeId = searchParams.get('employeeId') || ''

  const where: Record<string, unknown> = {}
  if (projectId) where.projectId = projectId
  if (taskId) where.taskId = taskId
  if (employeeId) where.employeeId = employeeId
  if (dateFrom || dateTo) {
    where.date = {} as Record<string, unknown>
    if (dateFrom) (where.date as Record<string, unknown>).gte = new Date(dateFrom)
    if (dateTo) (where.date as Record<string, unknown>).lte = new Date(dateTo)
  }

  const entries = await db.timesheetEntry.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    include: {
      project: { select: { id: true, name: true } },
      task: { select: { id: true, title: true } },
    },
    orderBy: { date: 'desc' },
  })

  // Summary stats
  const totalHours = entries.reduce((sum, e) => sum + e.hours, 0)
  const byProject: Record<string, { name: string; hours: number; entries: number }> = {}
  for (const entry of entries) {
    const pid = entry.projectId
    if (!byProject[pid]) byProject[pid] = { name: entry.project.name, hours: 0, entries: 0 }
    byProject[pid].hours += entry.hours
    byProject[pid].entries++
  }

  // Also update task loggedHours
  for (const entry of entries) {
    const taskEntries = entries.filter(e => e.taskId === entry.taskId)
    const totalTaskHours = taskEntries.reduce((sum, e) => sum + e.hours, 0)
    db.projectTask.update({ where: { id: entry.taskId }, data: { loggedHours: totalTaskHours } }).catch(() => {})
  }

  return NextResponse.json({ entries, totalHours, byProject })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { projectId, taskId, employeeId, date, hours, description } = body
  if (!projectId || !taskId || !hours) {
    return NextResponse.json({ error: 'Projekat, zadatak i sati su obavezni' }, { status: 400 })
  }

  const entry = await db.timesheetEntry.create({
    data: {
      projectId,
      taskId,
      employeeId: employeeId || null,
      date: date ? new Date(date) : new Date(),
      hours: Number(hours),
      description: description || null,
    },
  })

  // Update task loggedHours
  const allTaskEntries = await db.timesheetEntry.findMany({ where: { taskId } })
  const totalHours = allTaskEntries.reduce((sum, e) => sum + e.hours, 0)
  await db.projectTask.update({ where: { id: taskId }, data: { loggedHours: totalHours } })

  return NextResponse.json(entry, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { id, ...data } = body
  if (!id) return NextResponse.json({ error: 'ID obavezan' }, { status: 400 })

  try {
    const entry = await db.timesheetEntry.update({
      where: { id },
      data: { hours: Number(data.hours) || 0, description: data.description || null, date: data.date ? new Date(data.date) : undefined, employeeId: data.employeeId || null },
    })

    // Recalculate task loggedHours
    const allTaskEntries = await db.timesheetEntry.findMany({ where: { taskId: entry.taskId } })
    const totalHours = allTaskEntries.reduce((sum, e) => sum + e.hours, 0)
    await db.projectTask.update({ where: { id: entry.taskId }, data: { loggedHours: totalHours } })

    return NextResponse.json(entry)
  } catch {
    return NextResponse.json({ error: 'Greška' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID obavezan' }, { status: 400 })

  try {
    const entry = await db.timesheetEntry.findUnique({ where: { id }, select: { taskId: true } })
    await db.timesheetEntry.delete({ where: { id } })

    if (entry) {
      const remaining = await db.timesheetEntry.findMany({ where: { taskId: entry.taskId } })
      const totalHours = remaining.reduce((sum, e) => sum + e.hours, 0)
      await db.projectTask.update({ where: { id: entry.taskId }, data: { loggedHours: totalHours } })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Greška' }, { status: 500 })
  }
}
