import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const contactId = searchParams.get('contactId') || ''
  const dealId = searchParams.get('dealId') || ''
  const completed = searchParams.get('completed')

  const where: Record<string, unknown> = {}
  if (contactId) where.contactId = contactId
  if (dealId) where.dealId = dealId
  if (completed === 'true') where.completed = true
  if (completed === 'false') where.completed = false

  const activities = await db.crmActivity.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    include: { contact: { select: { id: true, firstName: true, lastName: true } }, deal: { select: { id: true, title: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return NextResponse.json(activities)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { type, title, description, dueDate, completed, contactId, dealId } = body
  if (!title) return NextResponse.json({ error: 'Naslov je obavezan' }, { status: 400 })

  const activity = await db.crmActivity.create({
    data: { type: type || 'napomena', title, description, dueDate: dueDate ? new Date(dueDate) : null, completed: !!completed, contactId, dealId },
  })
  return NextResponse.json(activity, { status: 201 })
}
