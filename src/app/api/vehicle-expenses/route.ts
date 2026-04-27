import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { vehicleId, date, type, amount, description, mileage } = body
    if (!vehicleId || !description || !amount) return NextResponse.json({ error: 'vehicleId, description i amount su obavezni' }, { status: 400 })

    const expense = await db.vehicleExpense.create({
      data: {
        vehicleId,
        date: date ? new Date(date) : new Date(),
        type: type || 'gorivo',
        amount: Number(amount),
        description,
        mileage: Number(mileage) || 0,
      }
    })
    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
