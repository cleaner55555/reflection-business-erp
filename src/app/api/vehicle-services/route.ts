import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { vehicleId, date, type, description, cost, mileage, nextDue } = body
    if (!vehicleId || !description) return NextResponse.json({ error: 'vehicleId i description su obavezni' }, { status: 400 })

    const service = await db.vehicleService.create({
      data: {
        vehicleId,
        date: date ? new Date(date) : new Date(),
        type: type || 'servis',
        description,
        cost: Number(cost) || 0,
        mileage: Number(mileage) || 0,
        nextDue: nextDue ? new Date(nextDue) : null,
      }
    })
    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
