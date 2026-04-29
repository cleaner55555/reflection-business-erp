import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const PLANS = {
  free: { name: 'Free', maxUsers: 5, maxStorageMb: 100, price: 0 },
  starter: { name: 'Starter', maxUsers: 15, maxStorageMb: 500, price: 29 },
  pro: { name: 'Pro', maxUsers: 50, maxStorageMb: 2000, price: 79 },
  enterprise: { name: 'Enterprise', maxUsers: 999, maxStorageMb: 10000, price: 199 },
} as const

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const company = await db.company.findUnique({
    where: { id },
    include: {
      users: {
        include: {
          role: true,
          user: { select: { id: true, email: true, firstName: true, lastName: true, isActive: true, lastLoginAt: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          partners: true,
          invoices: true,
          products: true,
          journalEntries: true,
          deals: true,
          projects: true,
          employees: true,
          apiKeys: true,
          webhooks: true,
        },
      },
    },
  })

  if (!company) {
    return NextResponse.json({ error: 'Kompanija nije pronađena' }, { status: 404 })
  }

  const planInfo = PLANS[company.plan as keyof typeof PLANS] || PLANS.free
  const modules: string[] = JSON.parse(company.modules || '[]')

  return NextResponse.json({
    ...company,
    planInfo,
    modules,
    userCount: company.users.length,
  })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const { name, plan, currency, timezone, locale, modules, maxUsers, maxStorageMb, isActive } = body

  const planInfo = plan ? (PLANS[plan as keyof typeof PLANS] || PLANS.free) : null

  const company = await db.company.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(plan && { plan, maxUsers: planInfo!.maxUsers, maxStorageMb: planInfo!.maxStorageMb }),
      ...(currency && { currency }),
      ...(timezone && { timezone }),
      ...(locale && { locale }),
      ...(modules !== undefined && { modules: JSON.stringify(modules) }),
      ...(maxUsers !== undefined && { maxUsers }),
      ...(maxStorageMb !== undefined && { maxStorageMb }),
      ...(isActive !== undefined && { isActive }),
    },
  })

  return NextResponse.json(company)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Cascade will handle all related data
  await db.company.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
