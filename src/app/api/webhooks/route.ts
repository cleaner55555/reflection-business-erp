import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const companyId = searchParams.get('companyId') || ''

  if (!companyId) {
    return NextResponse.json({ error: 'companyId je obavezan' }, { status: 400 })
  }

  const webhooks = await db.webhook.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(webhooks)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { companyId, name, url, events, secret, headers } = body

  if (!companyId || !name || !url) {
    return NextResponse.json({ error: 'companyId, name i url su obavezni' }, { status: 400 })
  }

  const webhook = await db.webhook.create({
    data: {
      companyId,
      name,
      url,
      events: JSON.stringify(events || []),
      secret: secret || null,
      headers: headers ? JSON.stringify(headers) : null,
    },
  })

  return NextResponse.json(webhook, { status: 201 })
}
