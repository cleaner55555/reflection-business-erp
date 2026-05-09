import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// ============ GET /api/time-tracking ============

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId') || ''
    const projectId = searchParams.get('projectId')
    const employeeId = searchParams.get('employeeId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = { companyId }
    if (projectId) where.projectId = projectId
    if (employeeId) where.employeeId = employeeId
    if (status) where.status = status
    if (dateFrom || dateTo) {
      where.date = {} as Record<string, unknown>
      if (dateFrom) (where.date as Record<string, unknown>).gte = dateFrom
      if (dateTo) (where.date as Record<string, unknown>).lte = dateTo
    }

    const entries = await db.timesheetEntry.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 500,
    })

    // Also fetch projects and tasks for name resolution
    const projects = await db.project.findMany({
      where: { companyId },
      select: { id: true, name: true, color: true },
    })
    const tasks = await db.projectTask.findMany({
      where: { companyId },
      select: { id: true, title: true, projectId: true },
    })

    const projectMap = new Map(projects.map((p) => [p.id, p]))
    const taskMap = new Map(tasks.map((t) => [t.id, t]))

    const data = entries.map((e) => {
      const project = projectMap.get(e.projectId)
      const task = taskMap.get(e.taskId)
      return {
        id: e.id,
        employeeId: e.employeeId || '',
        employeeName: e.employeeId || '',
        projectId: e.projectId,
        projectName: project?.name || e.projectId,
        taskTitle: task?.title || '',
        description: e.description || '',
        date: e.date.toISOString().split('T')[0],
        startTime: e.startTime || '',
        endTime: e.endTime || '',
        duration: e.duration || Math.round(e.hours * 60),
        status: e.status || 'draft',
        createdAt: e.createdAt.toISOString().split('T')[0],
      }
    })

    // Client-side search filter
    const filtered = search
      ? data.filter((e) =>
          e.employeeName.toLowerCase().includes(search.toLowerCase()) ||
          e.projectName.toLowerCase().includes(search.toLowerCase()) ||
          e.taskTitle.toLowerCase().includes(search.toLowerCase()) ||
          (e.description || '').toLowerCase().includes(search.toLowerCase())
        )
      : data

    return NextResponse.json({ success: true, data: filtered })
  } catch (error) {
    console.error('GET /api/time-tracking error:', error)
    return NextResponse.json({ success: false, error: 'Грешка при учитавању' }, { status: 500 })
  }
}

// ============ POST /api/time-tracking ============

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { companyId, projectId, taskId, employeeId, employeeName, date, startTime, endTime, duration, hours, description, status } = body

    if (!companyId || !projectId || !taskId || !date) {
      return NextResponse.json(
        { success: false, error: 'Обавезна поља: companyId, projectId, taskId, date' },
        { status: 400 }
      )
    }

    const calcDuration = duration || (hours ? Math.round(hours * 60) : 0)
    const calcHours = hours || (duration ? duration / 60 : 0)

    const entry = await db.timesheetEntry.create({
      data: {
        companyId,
        projectId,
        taskId,
        employeeId: employeeId || null,
        date: new Date(date),
        startTime: startTime || '',
        endTime: endTime || '',
        duration: calcDuration,
        hours: calcHours,
        description: description || null,
        status: status || 'draft',
      },
    })

    return NextResponse.json({ success: true, data: entry })
  } catch (error) {
    console.error('POST /api/time-tracking error:', error)
    return NextResponse.json({ success: false, error: 'Грешка при креирању' }, { status: 500 })
  }
}

// ============ PUT /api/time-tracking ============

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID је обавезан' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (data.projectId !== undefined) updateData.projectId = data.projectId
    if (data.taskId !== undefined) updateData.taskId = data.taskId
    if (data.employeeId !== undefined) updateData.employeeId = data.employeeId || null
    if (data.date) updateData.date = new Date(data.date)
    if (data.startTime !== undefined) updateData.startTime = data.startTime
    if (data.endTime !== undefined) updateData.endTime = data.endTime
    if (data.duration !== undefined) { updateData.duration = Number(data.duration); updateData.hours = Number(data.duration) / 60 }
    if (data.hours !== undefined) { updateData.hours = Number(data.hours); updateData.duration = Math.round(Number(data.hours) * 60) }
    if (data.description !== undefined) updateData.description = data.description || null
    if (data.status !== undefined) updateData.status = data.status

    const entry = await db.timesheetEntry.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: entry })
  } catch (error) {
    console.error('PUT /api/time-tracking error:', error)
    return NextResponse.json({ success: false, error: 'Грешка при ажурирању' }, { status: 500 })
  }
}

// ============ DELETE /api/time-tracking ============

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID је обавезан' }, { status: 400 })
    }

    await db.timesheetEntry.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/time-tracking error:', error)
    return NextResponse.json({ success: false, error: 'Грешка при брисању' }, { status: 500 })
  }
}
