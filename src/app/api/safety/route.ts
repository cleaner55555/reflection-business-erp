import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

// GET /api/safety
export async function GET(req: NextRequest) {
  try {
    const session = await auth(req)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { search, status, severity, type } = Object.fromEntries(req.nextUrl.searchParams)
    
    const where: Record<string, unknown> = { companyId: session.user.companyId }
    if (status) where.status = status
    if (severity) where.severity = severity
    if (type) where.type = type
    if (search) {
      where.OR = [
        { number: { contains: search } },
        { description: { contains: search } },
        { reporterName: { contains: search } },
        { location: { contains: search } },
        { department: { contains: search } },
      ]
    }

    const incidents = await db.safetyIncident.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(incidents)
  } catch (error) {
    console.error('GET /api/safety:', error)
    return NextResponse.json({ error: 'Failed to fetch safety incidents' }, { status: 500 })
  }
}

// POST /api/safety
export async function POST(req: NextRequest) {
  try {
    const session = await auth(req)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { number, type, severity, status, location, department, reporterName, reporterRole, description, incidentDate, incidentTime, injuredWorkers, lostDays, rootCause, correctiveAction, responsible, deadline } = body

    if (!description || !location || !reporterName) {
      return NextResponse.json({ error: 'Description, location and reporter are required' }, { status: 400 })
    }

    // Generate number if not provided
    const year = new Date().getFullYear()
    const count = await db.safetyIncident.count({
      where: { companyId: session.user.companyId, number: { startsWith: `SFT-${year}` },
    })
    const autoNumber = `SFT-${year}-${String(count + 1).padStart(3, '0')}`

    const incident = await db.safetyIncident.create({
      data: {
        companyId: session.user.companyId,
        number: number || autoNumber,
        type: type || 'injury',
        severity: severity || 'moderate',
        status: status || 'reported',
        location,
        department: department || '',
        reporterName,
        reporterRole: reporterRole || '',
        description,
        incidentDate: incidentDate ? new Date(incidentDate) : new Date(),
        incidentTime: incidentTime || '',
        injuredWorkers: injuredWorkers || 0,
        lostDays: lostDays || 0,
        rootCause: rootCause || '',
        correctiveAction: correctiveAction || '',
        responsible: responsible || '',
        deadline: deadline ? new Date(deadline) : null,
      },
    })

    return NextResponse.json(incident, { status: 201 })
  } catch (error) {
    console.error('POST /api/safety:', error)
    return NextResponse.json({ error: 'Failed to create incident' }, { status: 500 })
  }
}

// PUT /api/safety/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth(req)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await req.json()

    const incident = await db.safetyIncident.findUnique({
      where: { id, companyId: session.user.companyId },
    })
    if (!incident) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const updated = await db.safetyIncident.update({
      where: { id },
      data: {
        ...(body.type !== undefined && { type: body.type }),
        ...(body.severity !== undefined && { severity: body.severity }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.location !== undefined && { location: body.location }),
        ...(body.department !== undefined && { department: body.department }),
        ...(body.reporterName !== undefined && { reporterName: body.reporterName }),
        ...(body.reporterRole !== undefined && { reporterRole: body.reporterRole }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.incidentTime !== undefined && { incidentTime: body.incidentTime }),
        ...(body.injuredWorkers !== undefined && { injuredWorkers: body.injuredWorkers }),
        ...(body.lostDays !== undefined && { lostDays: body.lostDays }),
        ...(body.rootCause !== undefined && { rootCause: body.rootCause }),
        ...(body.correctiveAction !== undefined && { correctiveAction: body.correctiveAction }),
        ...(body.responsible !== undefined && { responsible: body.responsible }),
        ...(body.deadline !== undefined && { deadline: body.deadline ? new Date(body.deadline) : null }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('PUT /api/safety/[id]:', error)
    return NextResponse.json({ error: 'Failed to update incident' }, { status: 500 })
  }
}

// DELETE /api/safety/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth(req)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const incident = await db.safetyIncident.findUnique({
      where: { id, companyId: session.user.companyId },
    })
    if (!incident) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await db.safetyIncident.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/safety/[id]:', error)
    return NextResponse.json({ error: 'Failed to delete incident' }, { status: 500 })
  }
}
