import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/notifications/generate — Auto-generate notifications from current data
export async function POST() {
  try {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const created: unknown[] = []

    // ---- 1. Overdue invoices ----
    const overdueInvoices = await db.invoice.findMany({
      where: {
        dueDate: { lt: startOfDay },
        status: { notIn: ['placena', 'otkazana'] },
      },
      include: { partner: { select: { name: true } } },
    })

    for (const inv of overdueInvoices) {
      const existing = await db.notification.findFirst({
        where: {
          type: 'overdue_invoice',
          entityId: inv.id,
        },
      })

      if (!existing) {
        const notif = await db.notification.create({
          data: {
            type: 'overdue_invoice',
            title: 'Закаснела фактура',
            message: `Фактура ${inv.number} за партнера ${inv.partner.name} је закаснела (${inv.totalAmount.toLocaleString('sr-RS')} RSD)`,
            entityType: 'invoice',
            entityId: inv.id,
            priority: inv.dueDate < new Date(now.getTime() - 30 * 86400000) ? 'urgent' : 'high',
            actionUrl: 'invoices',
          },
        })
        created.push(notif)
      }
    }

    // ---- 2. Low stock products ----
    const lowStockProducts = await db.product.findMany({
      where: {
        isActive: true,
        currentStock: { lte: 0 },
        minStock: { gt: 0 },
      },
    })

    for (const prod of lowStockProducts) {
      const existing = await db.notification.findFirst({
        where: {
          type: 'low_stock',
          entityId: prod.id,
        },
      })

      if (!existing) {
        const notif = await db.notification.create({
          data: {
            type: 'low_stock',
            title: 'Ниска залиха',
            message: `Производ "${prod.name}" (${prod.sku}) је без залихе (мин: ${prod.minStock})`,
            entityType: 'product',
            entityId: prod.id,
            priority: 'medium',
            actionUrl: 'inventory',
          },
        })
        created.push(notif)
      }
    }

    // ---- 3. Invoices due today ----
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    const dueTodayInvoices = await db.invoice.findMany({
      where: {
        dueDate: { gte: startOfDay, lt: endOfDay },
        status: { notIn: ['placena', 'otkazana'] },
      },
      include: { partner: { select: { name: true } } },
    })

    for (const inv of dueTodayInvoices) {
      const existing = await db.notification.findFirst({
        where: {
          type: 'due_today',
          entityId: inv.id,
        },
      })

      if (!existing) {
        const notif = await db.notification.create({
          data: {
            type: 'due_today',
            title: 'Рок данас',
            message: `Фактура ${inv.number} за ${inv.partner.name} има рок данас (${inv.totalAmount.toLocaleString('sr-RS')} RSD)`,
            entityType: 'invoice',
            entityId: inv.id,
            priority: 'high',
            actionUrl: 'invoices',
          },
        })
        created.push(notif)
      }
    }

    return NextResponse.json({
      success: true,
      created: created.length,
      overdueFound: overdueInvoices.length,
      lowStockFound: lowStockProducts.length,
      dueTodayFound: dueTodayInvoices.length,
    })
  } catch (error) {
    console.error('Error generating notifications:', error)
    return NextResponse.json({ error: 'Failed to generate notifications' }, { status: 500 })
  }
}
