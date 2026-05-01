import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/complaints - List complaints
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '100')
    const search = searchParams.get('search')

    if (!companyId) {
      return NextResponse.json({ items: [] })
    }

    const where: Record<string, unknown> = { companyId }
    if (status && status !== 'all') Object.assign(where, { status })
    if (search) {
      Object.assign(where, {
        OR: [
          { number: { contains: search } },
          { subject: { contains: search } },
          { partnerName: { contains: search } },
        ],
      })
    }

    const items = await db.complaint.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ items })
  } catch {
    return NextResponse.json({ items: [] })
  }
}

// POST /api/complaints - Create complaint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { companyId, number, partnerName, partnerEmail, partnerPhone, productCode, productName, batchNumber, category, priority, subject, description, amountRequested, deadline, status, timeline, internalNote, requestedResolution } = body

    if (!companyId) {
      return NextResponse.json({ error: 'companyId required' }, { status: 400 })
    }

    // Generate complaint number
    const count = await db.complaint.count({ where: { companyId } })
    const complaintNumber = number || `REK-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`

    const complaint = await db.complaint.create({
      data: {
        companyId,
        number: complaintNumber,
        partnerName: partnerName || '',
        partnerEmail: partnerEmail || '',
        partnerPhone: partnerPhone || '',
        productCode: productCode || '',
        productName: productName || '',
        batchNumber: batchNumber || '',
        category: category || 'other',
        priority: priority || 'medium',
        subject: subject || '',
        description: description || '',
        internalNote: internalNote || '',
        requestedResolution: requestedResolution || 'replacement',
        amountRequested: amountRequested || 0,
        amountApproved: 0,
        currency: 'RSD',
        deadline: deadline ? new Date(deadline) : null,
        status: status || 'new',
        reportedBy: body.reportedBy || '',
        assignedTo: body.assignedTo || '',
        timeline: timeline || [],
        attachments: [],
      },
    })

    return NextResponse.json(complaint)
  } catch (error) {
    console.error('Error creating complaint:', error)
    return NextResponse.json({ error: 'Failed to create complaint' }, { status: 500 })
  }
}

// PUT /api/complaints - Update complaint
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, resolutionType, amountApproved, resolvedAt, internalNote, customerNote, event } = body

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 })
    }

    const existing = await db.complaint.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (status) updateData.status = status
    if (resolutionType) updateData.resolutionType = resolutionType
    if (amountApproved !== undefined) updateData.amountApproved = amountApproved
    if (resolvedAt) updateData.resolvedAt = new Date(resolvedAt)
    if (internalNote) updateData.internalNote = internalNote
    if (customerNote) updateData.customerNote = customerNote

    // Append to timeline
    if (event) {
      const timeline = Array.isArray(existing.timeline) ? [...existing.timeline, event] : [event]
      updateData.timeline = timeline
    }

    const complaint = await db.complaint.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(complaint)
  } catch (error) {
    console.error('Error updating complaint:', error)
    return NextResponse.json({ error: 'Failed to update complaint' }, { status: 500 })
  }
}

// DELETE /api/complaints - Delete complaint
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 })
    }

    await db.complaint.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting complaint:', error)
    return NextResponse.json({ error: 'Failed to delete complaint' }, { status: 500 })
  }
}
