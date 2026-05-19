import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTenantId, requireTenant, withErrorHandler } from '@/lib/tenant'

// GET /api/companies/[id] - Get company details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async (req) => {
    const { id } = await params

    const company = await db.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            partners: true,
            invoices: true,
            products: true,
            apiKeys: true,
          },
        },
      },
    })

    if (!company) {
      return NextResponse.json({ error: 'Kompanija nije pronađena' }, { status: 404 })
    }

    return NextResponse.json(company)
  })(request)
}

// PUT /api/companies/[id] - Update company info
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async (req) => {
    const { id } = await params
    const body = await req.json()

    const company = await db.company.findUnique({ where: { id } })
    if (!company) {
      return NextResponse.json({ error: 'Kompanija nije pronađena' }, { status: 404 })
    }

    // Check unique PIB if provided
    if (body.pib && body.pib !== company.pib) {
      const existingPib = await db.company.findUnique({ where: { pib: body.pib } })
      if (existingPib) {
        return NextResponse.json({ error: 'Kompanija sa ovim PIB-om već postoji' }, { status: 409 })
      }
    }

    const updated = await db.company.update({
      where: { id },
      data: {
        name: body.name,
        pib: body.pib ?? undefined,
        maticniBr: body.maticniBr ?? undefined,
        address: body.address ?? undefined,
        city: body.city ?? undefined,
        zipCode: body.zipCode ?? undefined,
        phone: body.phone ?? undefined,
        email: body.email ?? undefined,
        website: body.website ?? undefined,
        logo: body.logo ?? undefined,
        bankName: body.bankName ?? undefined,
        bankAccount: body.bankAccount ?? undefined,
        plan: body.plan ?? undefined,
        maxUsers: body.maxUsers ?? undefined,
        currency: body.currency ?? undefined,
        timezone: body.timezone ?? undefined,
        locale: body.locale ?? undefined,
        maxStorageMb: body.maxStorageMb ?? undefined,
        trialEndsAt: body.trialEndsAt ? new Date(body.trialEndsAt) : undefined,
      },
    })

    return NextResponse.json(updated)
  })(request)
}

// DELETE /api/companies/[id] - Soft delete (set isActive=false)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async (req) => {
    const { id } = await params

    const company = await db.company.findUnique({ where: { id } })
    if (!company) {
      return NextResponse.json({ error: 'Kompanija nije pronađena' }, { status: 404 })
    }

    if (!company.isActive) {
      return NextResponse.json({ error: 'Kompanija je već deaktivirana' }, { status: 400 })
    }

    const deactivated = await db.company.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({
      success: true,
      message: `Kompanija "${deactivated.name}" je deaktivirana`,
      company: deactivated,
    })
  })(request)
}
