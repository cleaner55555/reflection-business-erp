import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const isLead = searchParams.get('isLead')
  const isClient = searchParams.get('isClient')

  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { email: { contains: search } },
      { company: { contains: search } },
    ]
  }
  if (isLead === 'true') where.isLead = true
  if (isClient === 'true') where.isClient = true

  const contacts = await db.contact.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    include: { partner: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(contacts)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { firstName, lastName, email, phone, position, company, partnerId, notes, tags, isClient, isSupplier, isLead } = body
  if (!firstName || !lastName) return NextResponse.json({ error: 'Ime i prezime su obavezni' }, { status: 400 })

  const contact = await db.contact.create({
    data: { firstName, lastName, email, phone, position, company, partnerId, notes, tags, isClient: !!isClient, isSupplier: !!isSupplier, isLead: isLead !== false },
  })
  return NextResponse.json(contact, { status: 201 })
}
