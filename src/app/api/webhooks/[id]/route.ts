import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const { name, url, events, secret, headers, isActive } = body

  const webhook = await db.webhook.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(url && { url }),
      ...(events && { events: JSON.stringify(events) }),
      ...(secret !== undefined && { secret: secret || null }),
      ...(headers !== undefined && { headers: headers ? JSON.stringify(headers) : null }),
      ...(isActive !== undefined && { isActive }),
    },
  })

  return NextResponse.json(webhook)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  await db.webhook.delete({ where: { id } })
  return NextResponse.json({ success: true })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Test webhook - send a ping event
  const webhook = await db.webhook.findUnique({ where: { id } })
  if (!webhook) {
    return NextResponse.json({ error: 'Webhook nije pronađen' }, { status: 404 })
  }

  try {
    const res = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Reflection-Event': 'ping',
      },
      body: JSON.stringify({
        event: 'ping',
        timestamp: new Date().toISOString(),
        data: { webhookId: id, message: 'Test webhook iz Reflection Business' },
      }),
    })

    await db.webhook.update({
      where: { id },
      data: {
        lastTriggerAt: new Date(),
        successCount: { increment: res.ok ? 1 : 0 },
        failCount: { increment: res.ok ? 0 : 1 },
      },
    })

    return NextResponse.json({ success: res.ok, status: res.status })
  } catch (error) {
    await db.webhook.update({
      where: { id },
      data: { lastTriggerAt: new Date(), failCount: { increment: 1 } },
    })
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
