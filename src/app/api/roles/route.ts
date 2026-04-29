import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const roles = await db.role.findMany({
    include: { _count: { select: { userCompanies: true } } },
    orderBy: { createdAt: 'asc' },
  })

  const enriched = roles.map(r => ({
    ...r,
    permissionsParsed: JSON.parse(r.permissions),
  }))

  return NextResponse.json(enriched)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { name, displayName, description, permissions } = body

  if (!name || !displayName) {
    return NextResponse.json({ error: 'name i displayName su obavezni' }, { status: 400 })
  }

  const existing = await db.role.findUnique({ where: { name } })
  if (existing) {
    return NextResponse.json({ error: 'Uloga sa tim imenom već postoji' }, { status: 409 })
  }

  const role = await db.role.create({
    data: {
      name,
      displayName,
      description: description || null,
      permissions: JSON.stringify(permissions || {}),
    },
  })

  return NextResponse.json(role, { status: 201 })
}
