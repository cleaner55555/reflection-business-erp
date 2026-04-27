import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const includeDetails = searchParams.get('include') === 'details'

    const vehicles = await db.vehicle.findMany({
      include: {
        _count: { select: { services: true, expenses: true } },
        ...(includeDetails ? {
          services: { orderBy: { date: 'desc' }, take: 10 },
          expenses: { orderBy: { date: 'desc' }, take: 10 },
        } : {}),
      },
      orderBy: { make: 'asc' },
    })
    return NextResponse.json(vehicles)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { registration, make, model, year, fuelType, mileage, status, assignedTo, notes } = body
    if (!registration || !make || !model || !year) return NextResponse.json({ error: 'Polja registracija, marka, model i godište su obavezna' }, { status: 400 })

    const vehicle = await db.vehicle.create({
      data: { registration, make, model, year: Number(year), fuelType: fuelType || 'dizel', mileage: Number(mileage) || 0, status: status || 'aktivno', assignedTo, notes }
    })
    return NextResponse.json(vehicle, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
