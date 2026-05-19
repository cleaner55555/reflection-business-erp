import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId')
    const where = companyId ? { companyId } : {}

    const total = await db.helpdeskTicket.count({ where })
    const open = await db.helpdeskTicket.count({ where: { ...where, status: 'otvoren' } })
    const inProgress = await db.helpdeskTicket.count({ where: { ...where, status: 'u_toku' } })
    const resolved = await db.helpdeskTicket.count({
      where: { ...where, status: { in: ['rešen', 'zatvoren'] } }
    })

    const recent = await db.helpdeskTicket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    return NextResponse.json({
      totalTickets: total,
      openTickets: open,
      inProgressTickets: inProgress,
      resolvedTickets: resolved,
      avgResolutionHours: 0,
      recentTickets: recent.map(t => ({
        id: t.id,
        ticketNumber: t.id.slice(-8),
        subject: t.title,
        description: t.description,
        customerName: t.partnerName || '',
        category: t.category || 'general',
        priority: t.priority,
        status: t.status,
        assignedTo: t.assignedTo || '',
        createdAt: t.createdAt.toISOString(),
      })),
      categoryBreakdown: [],
    })
  } catch (error) {
    console.error('Helpdesk dashboard error:', error)
    return NextResponse.json({
      totalTickets: 0, openTickets: 0, inProgressTickets: 0, resolvedTickets: 0,
      avgResolutionHours: 0, recentTickets: [], categoryBreakdown: [],
    })
  }
}
