import { NextRequest, NextResponse } from 'next/server'

// ==========================================
// /api/work-orders – Work Orders API
// Serbian ERP: Reflection Business
// In-memory store (fallback when no DB)
// ==========================================

interface WorkOrderTask {
  id: string
  workOrderId: string
  title: string
  description: string
  status: string
  assignedTo: string
  dueDate: string
  estimatedHours: number
  actualHours: number
  createdAt: string
  updatedAt: string
}

interface WorkOrder {
  id: string
  orderNumber: string
  title: string
  description: string
  priority: string
  status: string
  assignedTo: string
  dueDate: string
  estimatedHours: number
  actualHours: number
  createdAt: string
  updatedAt: string
  completedAt: string | null
  costRSD: number
  pdvRate: number
  tasks: WorkOrderTask[]
}

// In-memory store
let workOrders: WorkOrder[] = []

// GET /api/work-orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const status = searchParams.get('status')
    const assignee = searchParams.get('assignee')

    let result = [...workOrders]

    if (id) {
      const order = result.find(o => o.id === id)
      if (!order) {
        return NextResponse.json({ success: true, data: null })
      }
      return NextResponse.json({ success: true, data: order })
    }

    if (status) {
      result = result.filter(o => o.status === status)
    }

    if (assignee) {
      result = result.filter(o => o.assignedTo === assignee)
    }

    // Sort by updatedAt descending
    result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Greška pri učitavanju radnih naloga' },
      { status: 500 }
    )
  }
}

// POST /api/work-orders – Create or Update
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Naziv je obavezan' },
        { status: 400 }
      )
    }

    if (body.id) {
      // Update existing
      const idx = workOrders.findIndex(o => o.id === body.id)
      if (idx === -1) {
        return NextResponse.json(
          { success: false, error: 'Radni nalog nije pronađen' },
          { status: 404 }
        )
      }

      const now = new Date().toISOString()
      workOrders[idx] = {
        ...workOrders[idx],
        ...body,
        updatedAt: now,
        tasks: body.tasks || workOrders[idx].tasks,
      }

      return NextResponse.json({ success: true, data: workOrders[idx] })
    }

    // Create new
    const year = new Date().getFullYear()
    const existingNums = workOrders
      .map(o => parseInt(o.orderNumber.split('-').pop() || '0', 10))
      .filter(n => !isNaN(n))
    const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 0

    const now = new Date().toISOString()
    const newOrder: WorkOrder = {
      id: body.id || `wo-${Date.now()}`,
      orderNumber: `RN-${year}-${String(maxNum + 1).padStart(3, '0')}`,
      title: body.title,
      description: body.description || '',
      priority: body.priority || 'srednji',
      status: body.status || 'novi',
      assignedTo: body.assignedTo || '',
      dueDate: body.dueDate || '',
      estimatedHours: body.estimatedHours || 0,
      actualHours: body.actualHours || 0,
      createdAt: body.createdAt || now,
      updatedAt: now,
      completedAt: body.completedAt || null,
      costRSD: body.costRSD || 0,
      pdvRate: body.pdvRate ?? 20,
      tasks: body.tasks || [],
    }

    workOrders.unshift(newOrder)

    return NextResponse.json({ success: true, data: newOrder }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Greška pri čuvanju radnog naloga' },
      { status: 500 }
    )
  }
}

// DELETE /api/work-orders?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID je obavezan' },
        { status: 400 }
      )
    }

    const idx = workOrders.findIndex(o => o.id === id)
    if (idx === -1) {
      return NextResponse.json(
        { success: false, error: 'Radni nalog nije pronađen' },
        { status: 404 }
      )
    }

    workOrders.splice(idx, 1)

    return NextResponse.json({ success: true, message: 'Radni nalog obrisan' })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Greška pri brisanju radnog naloga' },
      { status: 500 }
    )
  }
}
