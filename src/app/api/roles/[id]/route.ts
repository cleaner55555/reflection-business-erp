import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const role = await db.role.findUnique({
    where: { id },
    include: { _count: { select: { userCompanies: true } } },
  })

  if (!role) {
    return NextResponse.json({ error: 'Uloga nije pronađena' }, { status: 404 })
  }

  return NextResponse.json({ ...role, permissionsParsed: JSON.parse(role.permissions) })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const { displayName, description, permissions } = body

  const role = await db.role.update({
    where: { id },
    data: {
      ...(displayName && { displayName }),
      ...(description !== undefined && { description }),
      ...(permissions && { permissions: JSON.stringify(permissions) }),
    },
  })

  return NextResponse.json(role)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const usersWithRole = await db.userCompany.count({ where: { roleId: id } })
  if (usersWithRole > 0) {
    return NextResponse.json(
      { error: `Nije moguće obrisati ulogu. ${usersWithRole} korisnika je dodeljena ova uloga.` },
      { status: 409 }
    )
  }

  await db.role.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
