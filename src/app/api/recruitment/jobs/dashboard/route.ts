import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId')
    const where = companyId ? { companyId } : {}

    const total = await db.jobPosting.count({ where })
    const open = await db.jobPosting.count({ where: { ...where, status: 'aktivno' } })
    const closed = await db.jobPosting.count({
      where: { ...where, status: { in: ['zatvoreno', 'popunjeno'] } }
    })

    const applicantsResult = await db.jobPosting.aggregate({
      _sum: { applications: true },
      where,
    })

    const recent = await db.jobPosting.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    return NextResponse.json({
      totalJobs: total,
      openJobs: open,
      closedJobs: closed,
      totalApplicants: applicantsResult._sum.applications || 0,
      avgApplicantsPerJob: total > 0 ? Math.round((applicantsResult._sum.applications || 0) / total) : 0,
      recentJobs: recent.map(j => ({
        id: j.id,
        title: j.title,
        department: j.department || '',
        location: j.location || '',
        type: j.type,
        status: j.status,
        applicantCount: j.applications,
        description: j.description,
        requirements: j.requirements,
        publishedAt: j.postedAt?.toISOString(),
        createdAt: j.createdAt.toISOString(),
      })),
      departmentBreakdown: [],
    })
  } catch (error) {
    console.error('Recruitment dashboard error:', error)
    return NextResponse.json({
      totalJobs: 0, openJobs: 0, closedJobs: 0, totalApplicants: 0,
      avgApplicantsPerJob: 0, recentJobs: [], departmentBreakdown: [],
    })
  }
}
