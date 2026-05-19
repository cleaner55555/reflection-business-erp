import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isSuperAdmin, withErrorHandler } from '@/lib/tenant'

// GET /api/roles/[id] - Get role details with permissions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async (req) => {
    const { id } = await params

    const role = await db.role.findUnique({
      where: { id },
      include: { _count: { select: { userCompanies: true } } },
    })

    if (!role) {
      return NextResponse.json({ error: 'Uloga nije pronađena' }, { status: 404 })
    }

    return NextResponse.json({
      ...role,
      permissionsParsed: JSON.parse(role.permissions),
    })
  })(request)
}

// PUT /api/roles/[id] - Update role permissions
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async (req) => {
    // Check super admin access for updating roles
    if (!isSuperAdmin(req)) {
      return NextResponse.json(
        { error: 'Samo super administrator može ažurirati uloge' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await req.json()
    const { displayName, description, permissions } = body

    const role = await db.role.findUnique({ where: { id } })
    if (!role) {
      return NextResponse.json({ error: 'Uloga nije pronađena' }, { status: 404 })
    }

    // Validate permissions structure if provided
    if (permissions && typeof permissions === 'object') {
      const validLevels = ['read', 'write', 'delete', 'admin']
      for (const [key, value] of Object.entries(permissions)) {
        if (!Array.isArray(value)) {
          return NextResponse.json(
            { error: `Dozvole za "${key}" moraju biti niz` },
            { status: 400 }
          )
        }
        for (const level of value as string[]) {
          if (!validLevels.includes(level)) {
            return NextResponse.json(
              { error: `Nevažeći nivo dozvole "${level}" za "${key}". Dozvoljeni: ${validLevels.join(', ')}` },
              { status: 400 }
            )
          }
        }
      }
    }

    const updated = await db.role.update({
      where: { id },
      data: {
        ...(displayName && { displayName }),
        ...(description !== undefined && { description }),
        ...(permissions && { permissions: JSON.stringify(permissions) }),
      },
    })

    return NextResponse.json(updated)
  })(request)
}

// DELETE /api/roles/[id] - Delete role (if not assigned)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async (req) => {
    // Check super admin access for deleting roles
    if (!isSuperAdmin(req)) {
      return NextResponse.json(
        { error: 'Samo super administrator može obrisati uloge' },
        { status: 403 }
      )
    }

    const { id } = await params

    const role = await db.role.findUnique({ where: { id } })
    if (!role) {
      return NextResponse.json({ error: 'Uloga nije pronađena' }, { status: 404 })
    }

    // Prevent deletion of default system roles
    const systemRoles = ['admin', 'manager', 'accountant', 'employee']
    if (systemRoles.includes(role.name)) {
      return NextResponse.json(
        { error: `Sistemska uloga "${role.displayName}" ne može biti obrisana` },
        { status: 403 }
      )
    }

    const usersWithRole = await db.userCompany.count({ where: { roleId: id } })
    if (usersWithRole > 0) {
      return NextResponse.json(
        { error: `Nije moguće obrisati ulogu. ${usersWithRole} korisnika je dodeljena ova uloga.` },
        { status: 409 }
      )
    }

    await db.role.delete({ where: { id } })
    return NextResponse.json({ success: true })
  })(request)
}
