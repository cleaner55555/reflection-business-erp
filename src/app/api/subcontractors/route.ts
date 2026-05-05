import { NextRequest, NextResponse } from 'next/server'

// In-memory store for subcontractors data (per entity type)
// In production, this would use a database via Prisma

const store: Record<string, any[]> = {
  subcontractors: [],
  contracts: [],
  deliveries: [],
  payments: [],
}

// GET /api/subcontractors — fetch all or by entity
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const entity = searchParams.get('entity')

  if (entity && store[entity]) {
    return NextResponse.json(store[entity])
  }

  return NextResponse.json(store.subcontractors)
}

// POST /api/subcontractors — create a new record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const entity = body.entity as string || 'subcontractors'
    const tableName = entity === 'subcontractors' ? 'subcontractors' : entity

    if (!store[tableName]) {
      return NextResponse.json({ error: 'Непознат ентитет' }, { status: 400 })
    }

    const record = { ...body }
    delete record.entity // remove entity field

    // Validate required fields
    if (tableName === 'subcontractors') {
      if (!record.naziv || !record.pib || !record.mb) {
        return NextResponse.json({ error: 'Назив, ПИБ и МБ су обавезни' }, { status: 400 })
      }
    } else if (tableName === 'contracts') {
      if (!record.podizvođačId || !record.brojUgovora || !record.predmetUgovora) {
        return NextResponse.json({ error: 'Подизвођач, број и предмет уговора су обавезни' }, { status: 400 })
      }
    }

    store[tableName].unshift(record)
    return NextResponse.json(record, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Грешка при креирању' }, { status: 500 })
  }
}

// PUT /api/subcontractors — update a record
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const entity = body.entity as string || 'subcontractors'
    const tableName = entity === 'subcontractors' ? 'subcontractors' : entity
    const id = body.id

    if (!id) {
      return NextResponse.json({ error: 'ID је обавезан' }, { status: 400 })
    }

    if (!store[tableName]) {
      return NextResponse.json({ error: 'Непознат ентитет' }, { status: 400 })
    }

    const idx = store[tableName].findIndex((r: any) => r.id === id)
    if (idx === -1) {
      return NextResponse.json({ error: 'Запис није пронађен' }, { status: 404 })
    }

    const updateData = { ...body }
    delete updateData.entity
    delete updateData.id

    store[tableName][idx] = { ...store[tableName][idx], ...updateData }
    return NextResponse.json(store[tableName][idx])
  } catch {
    return NextResponse.json({ error: 'Грешка при ажурирању' }, { status: 500 })
  }
}

// DELETE /api/subcontractors — delete a record
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const entity = searchParams.get('entity') || 'subcontractors'
    const tableName = entity === 'subcontractors' ? 'subcontractors' : entity
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID је обавезан' }, { status: 400 })
    }

    if (!store[tableName]) {
      return NextResponse.json({ error: 'Непознат ентитет' }, { status: 400 })
    }

    const idx = store[tableName].findIndex((r: any) => r.id === id)
    if (idx === -1) {
      return NextResponse.json({ error: 'Запис није пронађен' }, { status: 404 })
    }

    const deleted = store[tableName].splice(idx, 1)
    return NextResponse.json({ deleted: deleted[0] })
  } catch {
    return NextResponse.json({ error: 'Грешка при брисању' }, { status: 500 })
  }
}
