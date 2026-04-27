import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const vehicle = await db.vehicle.findUnique({
      where: { id },
      include: {
        _count: { select: { services: true, expenses: true } },
        services: { orderBy: { date: 'desc' } },
        expenses: { orderBy: { date: 'desc' } },
      },
    })
    if (!vehicle) return NextResponse.json({ error: 'Nije pronađeno' }, { status: 404 })
    return NextResponse.json(vehicle)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const vehicle = await db.vehicle.update({ where: { id }, data: body })
    return NextResponse.json(vehicle)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.vehicle.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
