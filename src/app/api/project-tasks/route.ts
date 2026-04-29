import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  const { projectId, title, description, status, priority, dueDate, assignedTo, estimatedHours, orderNum, tags } = body
  if (!projectId || !title) return NextResponse.json({ error: 'Projekat i naslov obavezni' }, { status: 400 })

  // Get max orderNum if not provided
  let finalOrderNum = Number(orderNum) || 0
  if (!orderNum) {
    const maxTask = await db.projectTask.findFirst({
      where: { projectId },
      orderBy: { orderNum: 'desc' },
      select: { orderNum: true },
    })
    finalOrderNum = (maxTask?.orderNum || 0) + 1
  }

  const task = await db.projectTask.create({
    data: {
      projectId, title,
      description: description || null,
      status: status || 'todo',
      priority: priority || 'srednji',
      dueDate: dueDate ? new Date(dueDate) : null,
      assignedTo: assignedTo || null,
      estimatedHours: Number(estimatedHours) || 0,
      orderNum: finalOrderNum,
      tags: tags || null,
    },
  })

  // Update project progress
  updateProjectProgress(projectId).catch(() => {})

  return NextResponse.json(task, { status: 201 })
}

export async function PUT(req: Request) {
  const body = await req.json()
  const { id, projectId, status, ...data } = body
  if (!id) return NextResponse.json({ error: 'ID obavezan' }, { status: 400 })

  try {
    const task = await db.projectTask.update({ where: { id }, data })
    // Update project progress if status changed
    if (status) {
      const existingTask = await db.projectTask.findUnique({ where: { id }, select: { projectId: true } })
      if (existingTask) updateProjectProgress(existingTask.projectId).catch(() => {})
    }
    return NextResponse.json(task)
  } catch {
    return NextResponse.json({ error: 'Greška' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID obavezan' }, { status: 400 })

  try {
    const task = await db.projectTask.findUnique({ where: { id }, select: { projectId: true } })
    await db.timesheetEntry.deleteMany({ where: { taskId: id } })
    await db.projectTask.delete({ where: { id } })
    if (task) updateProjectProgress(task.projectId).catch(() => {})
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Greška' }, { status: 500 })
  }
}

// Helper: recalculate project progress
async function updateProjectProgress(projectId: string) {
  const tasks = await db.projectTask.findMany({ where: { projectId } })
  const total = tasks.length
  const done = tasks.filter(t => t.status === 'zavrseno').length
  const progress = total > 0 ? Math.round((done / total) * 100) : 0
  await db.project.update({ where: { id: projectId }, data: { progress } })
}
