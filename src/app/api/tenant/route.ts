import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PLANS definition
const PLANS = {
  free: { name: 'Free', maxUsers: 5, maxStorageMb: 100, price: 0 },
  starter: { name: 'Starter', maxUsers: 15, maxStorageMb: 500, price: 29 },
  pro: { name: 'Pro', maxUsers: 50, maxStorageMb: 2000, price: 79 },
  enterprise: { name: 'Enterprise', maxUsers: 999, maxStorageMb: 10000, price: 199 },
} as const

export async function GET() {
  const companies = await db.company.findMany({
    include: {
      _count: {
        select: {
          users: true,
          partners: true,
          invoices: true,
          products: true,
          journalEntries: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const enriched = companies.map(c => {
    const planInfo = PLANS[c.plan as keyof typeof PLANS] || PLANS.free
    const modules: string[] = JSON.parse(c.modules || '[]')
    return {
      ...c,
      planInfo,
      modules,
      userCount: c._count.users,
      usage: {
        users: c._count.users,
        maxUsers: c.maxUsers,
        partners: c._count.partners,
        invoices: c._count.invoices,
        products: c._count.products,
        journalEntries: c._count.journalEntries,
      },
    }
  })

  return NextResponse.json({ companies: enriched, plans: PLANS })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { name, pib, plan } = body

  if (!name) {
    return NextResponse.json({ error: 'Naziv kompanije je obavezan' }, { status: 400 })
  }

  const planInfo = PLANS[(plan || 'free') as keyof typeof PLANS] || PLANS.free

  // Check if company with same PIB exists
  if (pib) {
    const existing = await db.company.findUnique({ where: { pib } })
    if (existing) {
      return NextResponse.json({ error: 'Kompanija sa tim PIB-om već postoji' }, { status: 409 })
    }
  }

  // Create default roles for new company
  const defaultRoles = [
    { name: `${pib || name}_admin`, displayName: 'Administrator', permissions: '{}' },
    { name: `${pib || name}_read_only`, displayName: 'Samo čitanje', permissions: '{}', isDefault: true },
  ]

  const roles = await Promise.all(
    defaultRoles.map(r =>
      db.role.create({
        data: { name: r.name, displayName: r.displayName, permissions: r.permissions, isDefault: r.isDefault || false },
      })
    )
  )

  const company = await db.company.create({
    data: {
      name,
      pib: pib || null,
      plan: plan || 'free',
      maxUsers: planInfo.maxUsers,
      maxStorageMb: planInfo.maxStorageMb,
    },
  })

  return NextResponse.json({ company, roles }, { status: 201 })
}
