import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withErrorHandler } from '@/lib/tenant'

// GET /api/companies/[id]/modules - Get company's active modules
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async (req) => {
    const { id } = await params

    const company = await db.company.findUnique({
      where: { id },
      select: { id: true, name: true, modules: true, plan: true },
    })

    if (!company) {
      return NextResponse.json({ error: 'Kompanija nije pronađena' }, { status: 404 })
    }

    let modules: string[] = []
    try {
      modules = JSON.parse(company.modules)
    } catch {
      modules = []
    }

    return NextResponse.json({
      companyId: company.id,
      companyName: company.name,
      plan: company.plan,
      modules,
      moduleCount: modules.length,
    })
  })(request)
}

// PUT /api/companies/[id]/modules - Update company's active modules
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async (req) => {
    const { id } = await params
    const body = await req.json()
    const { modules } = body

    if (!Array.isArray(modules)) {
      return NextResponse.json({ error: 'modules mora biti niz stringova' }, { status: 400 })
    }

    // Always include dashboard and settings
    const finalModules = [...new Set(['dashboard', 'settings', ...modules])]

    const company = await db.company.findUnique({ where: { id } })
    if (!company) {
      return NextResponse.json({ error: 'Kompanija nije pronađena' }, { status: 404 })
    }

    const updated = await db.company.update({
      where: { id },
      data: { modules: JSON.stringify(finalModules) },
    })

    return NextResponse.json({
      companyId: updated.id,
      companyName: updated.name,
      modules: finalModules,
      moduleCount: finalModules.length,
    })
  })(request)
}
