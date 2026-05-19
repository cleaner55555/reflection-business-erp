import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isSuperAdmin, withErrorHandler } from '@/lib/tenant'

// GET /api/roles - List all available roles
export async function GET() {
  return withErrorHandler(async () => {
    const roles = await db.role.findMany({
      include: { _count: { select: { userCompanies: true } } },
      orderBy: { createdAt: 'asc' },
    })

    const enriched = roles.map(r => ({
      ...r,
      permissionsParsed: JSON.parse(r.permissions),
    }))

    return NextResponse.json(enriched)
  })({} as Request)
}

// POST /api/roles - Create new role (only for super admin)
export async function POST(request: NextRequest) {
  return withErrorHandler(async (req) => {
    // Check super admin access
    if (!isSuperAdmin(req)) {
      return NextResponse.json(
        { error: 'Samo super administrator može kreirati nove uloge' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { name, displayName, description, permissions } = body

    if (!name || !displayName) {
      return NextResponse.json({ error: 'name i displayName su obavezni' }, { status: 400 })
    }

    // Validate name format (lowercase, alphanumeric, hyphens only)
    if (!/^[a-z][a-z0-9-]*$/.test(name)) {
      return NextResponse.json(
        { error: 'name mora biti lower-case, alfanumerički (hyphens dozvoljeni), mora početi slovom' },
        { status: 400 }
      )
    }

    const existing = await db.role.findUnique({ where: { name } })
    if (existing) {
      return NextResponse.json({ error: 'Uloga sa tim imenom već postoji' }, { status: 409 })
    }

    // Validate permissions structure
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

    const role = await db.role.create({
      data: {
        name,
        displayName,
        description: description || null,
        permissions: JSON.stringify(permissions || {}),
      },
    })

    return NextResponse.json(role, { status: 201 })
  })(request)
}
