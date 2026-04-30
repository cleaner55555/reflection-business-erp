import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/notifications?unread=true&type=overdue_invoice
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const unread = searchParams.get('unread') === 'true'
    const type = searchParams.get('type') || ''
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    const where: Record<string, unknown> = {}

    if (unread) {
      where.isRead = false
    }

    if (type) {
      where.type = type
    }

    const notifications = await db.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    const unreadCount = await db.notification.count({
      where: { isRead: false },
    })

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

// POST /api/notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, title, message, entityType, entityId, priority, actionUrl } = body

    if (!type || !title || !message) {
      return NextResponse.json({ error: 'type, title, and message are required' }, { status: 400 })
    }

    const notification = await db.notification.create({
      data: {
        type,
        title,
        message,
        entityType: entityType || null,
        entityId: entityId || null,
        priority: priority || 'medium',
        actionUrl: actionUrl || null,
      },
    })

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
  }
}
