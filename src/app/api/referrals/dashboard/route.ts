import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId')
    const where = companyId ? { companyId } : {}

    const total = await db.referral.count({ where })
    const pending = await db.referral.count({ where: { ...where, status: 'primljena' } })
    const completed = await db.referral.count({
      where: { ...where, status: { in: ['zaposlena', 'odbijena'] } }
    })

    const rewards = await db.referral.aggregate({
      _sum: { bonus: true },
      where: { ...where, status: { in: ['zaposlena'] } }
    })

    const recent = await db.referral.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    const topReferrers = await db.referral.groupBy({
      by: ['referrerName'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    })

    return NextResponse.json({
      totalReferrals: total,
      pendingReferrals: pending,
      completedReferrals: completed,
      totalRewards: rewards._sum.bonus || 0,
      topReferrers: topReferrers.map(r => ({ name: r.referrerName, count: r._count.id })),
      sourceBreakdown: [],
      recentReferrals: recent.map(r => ({
        id: r.id,
        referrerName: r.referrerName,
        refereeName: r.candidateName,
        refereeEmail: r.candidateEmail,
        source: r.position,
        status: r.status,
        reward: r.bonus,
        notes: r.notes,
        createdAt: r.createdAt.toISOString(),
        completedAt: r.updatedAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Referrals dashboard error:', error)
    return NextResponse.json({
      totalReferrals: 0, pendingReferrals: 0, completedReferrals: 0,
      totalRewards: 0, topReferrers: [], sourceBreakdown: [], recentReferrals: [],
    })
  }
}
