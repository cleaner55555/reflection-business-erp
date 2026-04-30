import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT /api/notifications/read-all — Mark all as read
export async function PUT() {
  try {
    await db.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return NextResponse.json({ error: 'Failed to mark all as read' }, { status: 500 })
  }
}

// DELETE /api/notifications/read-all — Delete all read notifications
export async function DELETE() {
  try {
    await db.notification.deleteMany({
      where: { isRead: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting read notifications:', error)
    return NextResponse.json({ error: 'Failed to delete read notifications' }, { status: 500 })
  }
}
