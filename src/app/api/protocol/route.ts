import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const direction = searchParams.get('direction')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (direction) where.direction = direction
    if (status) where.status = status

    const entries = await db.protocolEntry.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { date: 'desc' },
      take: 200,
    })
    return NextResponse.json(entries)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { direction, sender, recipient, subject, description, documentType, dueDate, responsible, priority } = body
    if (!subject) return NextResponse.json({ error: 'subject je obavezan' }, { status: 400 })

    const count = await db.protocolEntry.count()
    const number = `PROT-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`

    const entry = await db.protocolEntry.create({
      data: { number, direction: direction || 'ulaz', sender, recipient, subject, description, documentType, dueDate: dueDate ? new Date(dueDate) : null, responsible, priority: priority || 'srednji' }
    })
    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
