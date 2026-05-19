import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withErrorHandler } from '@/lib/tenant'

// GET /api/companies/[id]/settings - Get all company-specific settings
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async (req) => {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const group = searchParams.get('group') || ''
    const key = searchParams.get('key') || ''

    // Verify company exists
    const company = await db.company.findUnique({
      where: { id },
      select: { id: true, name: true },
    })

    if (!company) {
      return NextResponse.json({ error: 'Kompanija nije pronađena' }, { status: 404 })
    }

    const where: Record<string, unknown> = { companyId: id }
    if (group) where.group = group
    if (key) where.key = key

    const settings = await db.appSetting.findMany({
      where,
      orderBy: [{ group: 'asc' }, { key: 'asc' }],
    })

    // Parse JSON and typed values
    const enriched = settings.map(s => {
      let parsedValue: unknown = s.value
      try {
        if (s.type === 'json') {
          parsedValue = JSON.parse(s.value)
        } else if (s.type === 'boolean') {
          parsedValue = s.value === 'true'
        } else if (s.type === 'number') {
          parsedValue = Number(s.value)
        }
      } catch {
        // Keep string value if parsing fails
      }

      return {
        ...s,
        parsedValue,
      }
    })

    return NextResponse.json({
      companyId: company.id,
      companyName: company.name,
      settings: enriched,
      count: enriched.length,
    })
  })(request)
}

// PUT /api/companies/[id]/settings - Bulk update company settings
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async (req) => {
    const { id } = await params
    const body = await req.json()
    const items: Array<{
      key: string
      value: string | number | boolean | object
      label?: string
      type?: string
      group?: string
    }> = body

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Niz podešavanja je obavezan (Array of {key, value, ...})' },
        { status: 400 }
      )
    }

    // Verify company exists
    const company = await db.company.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!company) {
      return NextResponse.json({ error: 'Kompanija nije pronađena' }, { status: 404 })
    }

    // Validate items
    for (const item of items) {
      if (!item.key) {
        return NextResponse.json({ error: 'Svako podešavanje mora imati "key"' }, { status: 400 })
      }
    }

    // Upsert all settings
    const results = await Promise.all(
      items.map(async (item) => {
        const stringValue = typeof item.value === 'object'
          ? JSON.stringify(item.value)
          : String(item.value)

        const type = item.type || (typeof item.value === 'boolean'
          ? 'boolean'
          : typeof item.value === 'number'
            ? 'number'
            : typeof item.value === 'object'
              ? 'json'
              : 'text')

        // companyId + key has a unique constraint in AppSetting
        // We need to handle the upsert carefully since companyId can be null
        const existing = await db.appSetting.findUnique({
          where: { companyId_key: { companyId: id, key: item.key } },
        })

        if (existing) {
          return db.appSetting.update({
            where: { id: existing.id },
            data: {
              value: stringValue,
              label: item.label !== undefined ? item.label : existing.label,
              type,
              group: item.group || existing.group,
            },
          })
        } else {
          return db.appSetting.create({
            data: {
              companyId: id,
              key: item.key,
              value: stringValue,
              label: item.label || null,
              type,
              group: item.group || 'general',
            },
          })
        }
      })
    )

    return NextResponse.json({
      success: true,
      updated: results.length,
      settings: results,
    })
  })(request)
}
