import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId')
    const where = companyId ? { companyId } : {}

    const total = await db.qualityInspection.count({ where })
    const passed = await db.qualityInspection.count({ where: { ...where, result: 'položena' } })
    const failed = await db.qualityInspection.count({ where: { ...where, result: 'pala' } })
    const pending = await db.qualityInspection.count({
      where: { ...where, status: { in: ['planirana', 'u_toku'] } }
    })

    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0

    const recent = await db.qualityInspection.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { defects: true },
    })

    const totalDefects = await db.qualityDefect.count({
      where: { inspection: { companyId: companyId || undefined } }
    })

    return NextResponse.json({
      totalInspections: total,
      passedInspections: passed,
      failedInspections: failed,
      pendingInspections: pending,
      passRate,
      totalDefects,
      recentInspections: recent.map(i => ({
        id: i.id,
        title: i.productName || i.type,
        type: i.type,
        productName: i.productName,
        batchNumber: '',
        inspectorName: i.inspector || '',
        status: i.status,
        result: i.result || '',
        defects: i.defects.length,
        notes: i.notes,
        inspectedAt: i.inspectedAt?.toISOString(),
        createdAt: i.createdAt.toISOString(),
      })),
      typeBreakdown: [],
    })
  } catch (error) {
    console.error('Quality inspections dashboard error:', error)
    return NextResponse.json({
      totalInspections: 0, passedInspections: 0, failedInspections: 0,
      pendingInspections: 0, passRate: 0, totalDefects: 0,
      recentInspections: [], typeBreakdown: [],
    })
  }
}
