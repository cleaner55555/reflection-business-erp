import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId')
    const where = companyId ? { companyId } : {}

    const total = await db.signingRequest.count({ where })
    const pending = await db.signingRequest.count({ where: { ...where, status: 'na_čekanju' } })
    const signed = await db.signingRequest.count({ where: { ...where, status: 'potpisano' } })
    const rejected = await db.signingRequest.count({ where: { ...where, status: 'odbijeno' } })

    const recent = await db.signingRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    return NextResponse.json({
      totalRequests: total,
      pendingRequests: pending,
      signedRequests: signed,
      rejectedRequests: rejected,
      recentRequests: recent.map(r => ({
        id: r.id,
        title: r.documentTitle,
        documentType: 'contract',
        signerName: r.signerName,
        status: r.status,
        priority: 'medium',
        createdAt: r.createdAt.toISOString(),
        signedAt: r.signedAt?.toISOString(),
        notes: r.notes,
      })),
      typeBreakdown: [],
      priorityBreakdown: [],
    })
  } catch (error) {
    console.error('Signing requests dashboard error:', error)
    return NextResponse.json({
      totalRequests: 0, pendingRequests: 0, signedRequests: 0, rejectedRequests: 0,
      recentRequests: [], typeBreakdown: [], priorityBreakdown: [],
    })
  }
}
