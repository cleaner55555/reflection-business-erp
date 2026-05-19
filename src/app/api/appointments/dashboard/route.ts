import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId')
    const where = companyId ? { companyId } : {}

    const total = await db.appointment.count({ where })
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

    const todayCount = await db.appointment.count({
      where: { ...where, date: { gte: todayStart, lt: todayEnd } }
    })
    const upcoming = await db.appointment.count({
      where: { ...where, date: { gte: todayStart }, status: 'zakazano' }
    })
    const completed = await db.appointment.count({
      where: { ...where, status: 'završeno' }
    })
    const cancelled = await db.appointment.count({
      where: { ...where, status: 'otkazano' }
    })

    const recent = await db.appointment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    const weekDays = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned']
    const weeklyTrend = weekDays.map(day => ({ day, count: 0 }))

    const typeBreakdown = []

    return NextResponse.json({
      totalAppointments: total,
      todayAppointments: todayCount,
      upcomingAppointments: upcoming,
      completedAppointments: completed,
      cancelledAppointments: cancelled,
      noShowRate: 0,
      avgDuration: 30,
      totalRevenue: 0,
      weeklyTrend,
      typeBreakdown,
    })
  } catch (error) {
    console.error('Appointments dashboard error:', error)
    return NextResponse.json({
      totalAppointments: 0, todayAppointments: 0, upcomingAppointments: 0,
      completedAppointments: 0, cancelledAppointments: 0, noShowRate: 0,
      avgDuration: 0, totalRevenue: 0, weeklyTrend: [], typeBreakdown: [],
    })
  }
}
