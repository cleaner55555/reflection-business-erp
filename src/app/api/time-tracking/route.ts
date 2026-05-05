import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// ============ GET /api/time-tracking ============
// List time entries with optional filters

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const projectId = searchParams.get('projectId')
    const employeeId = searchParams.get('employeeId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (companyId) where.companyId = companyId
    if (projectId) where.projectId = projectId
    if (employeeId) where.employeeId = employeeId
    if (dateFrom || dateTo) {
      where.date = {} as Record<string, unknown>
      if (dateFrom) (where.date as Record<string, unknown>).gte = new Date(dateFrom)
      if (dateTo) (where.date as Record<string, unknown>).lte = new Date(dateTo + 'T23:59:59.999Z')
    }

    const entries = await db.timesheetEntry.findMany({
      where,
      include: {
        project: { select: { name: true, color: true } },
        task: { select: { title: true } },
      },
      orderBy: { date: 'desc' },
      take: 200,
    })

    return NextResponse.json({
      success: true,
      data: entries.map((e) => ({
        id: e.id,
        employeeId: e.employeeId || '',
        employeeName: e.employeeId || '',
        projectId: e.projectId,
        projectName: e.project.name,
        taskTitle: e.task.title,
        description: e.description || '',
        date: e.date.toISOString().split('T')[0],
        startTime: '',
        endTime: '',
        duration: e.hours * 60,
        status: status || 'draft',
        createdAt: e.createdAt.toISOString().split('T')[0],
      })),
    })
  } catch (error) {
    console.error('GET /api/time-tracking error:', error)
    return NextResponse.json({ success: false, error: 'Грешка при учитавању' }, { status: 500 })
  }
}

// ============ POST /api/time-tracking ============
// Create a new time entry

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { companyId, projectId, taskId, employeeId, date, hours, description } = body

    if (!companyId || !projectId || !taskId || !date || !hours) {
      return NextResponse.json(
        { success: false, error: 'Обавезна поља: companyId, projectId, taskId, date, hours' },
        { status: 400 }
      )
    }

    const entry = await db.timesheetEntry.create({
      data: {
        companyId,
        projectId,
        taskId,
        employeeId: employeeId || null,
        date: new Date(date),
        hours: Number(hours),
        description: description || null,
      },
    })

    return NextResponse.json({ success: true, data: entry })
  } catch (error) {
    console.error('POST /api/time-tracking error:', error)
    return NextResponse.json({ success: false, error: 'Грешка при креирању' }, { status: 500 })
  }
}

// ============ PUT /api/time-tracking ============
// Update an existing time entry

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID је обавезан' }, { status: 400 })
    }

    const entry = await db.timesheetEntry.update({
      where: { id },
      data: {
        ...(data.projectId && { projectId: data.projectId }),
        ...(data.taskId && { taskId: data.taskId }),
        ...(data.employeeId !== undefined && { employeeId: data.employeeId || null }),
        ...(data.date && { date: new Date(data.date) }),
        ...(data.hours !== undefined && { hours: Number(data.hours) }),
        ...(data.description !== undefined && { description: data.description || null }),
      },
    })

    return NextResponse.json({ success: true, data: entry })
  } catch (error) {
    console.error('PUT /api/time-tracking error:', error)
    return NextResponse.json({ success: false, error: 'Грешка при ажурирању' }, { status: 500 })
  }
}

// ============ DELETE /api/time-tracking ============
// Delete a time entry

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
