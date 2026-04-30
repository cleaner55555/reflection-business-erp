import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const VALID_ENTITY_TYPES = [
  'partners',
  'products',
  'transactions',
  'contacts',
  'invoices',
  'stock',
  'employees',
]

// GET /api/integrations/connectors — List all connectors
export async function GET() {
  try {
    const connectors = await db.syncConnector.findMany({
      orderBy: { createdAt: 'desc' },
      include: { logs: { orderBy: { createdAt: 'desc' }, take: 5 } },
    })

    return NextResponse.json(connectors)
  } catch (error) {
    console.error('Error fetching connectors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch connectors' },
      { status: 500 }
    )
  }
}

// POST /api/integrations/connectors — Create a new connector
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      type,
      direction,
      syncEntities,
      hostUrl,
      apiKey,
      username,
      password,
      database,
      syncInterval,
      fieldMapping,
      notes,
    } = body

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    if (!type || typeof type !== 'string' || type.trim().length === 0) {
      return NextResponse.json(
        { error: 'Type is required' },
        { status: 400 }
      )
    }

    if (
      !direction ||
      !['import', 'export', 'bidirectional'].includes(direction)
    ) {
      return NextResponse.json(
        { error: 'Direction must be one of: import, export, bidirectional' },
        { status: 400 }
      )
    }

    // Validate syncEntities is a valid JSON array of valid entity types
    let parsedEntities: string[]
    try {
      parsedEntities =
        typeof syncEntities === 'string'
          ? JSON.parse(syncEntities)
          : syncEntities

      if (!Array.isArray(parsedEntities)) {
        return NextResponse.json(
          { error: 'syncEntities must be a JSON array' },
          { status: 400 }
        )
      }

      const invalidEntities = parsedEntities.filter(
        (e) => !VALID_ENTITY_TYPES.includes(e)
      )
      if (invalidEntities.length > 0) {
        return NextResponse.json(
          {
            error: `Invalid entity types: ${invalidEntities.join(', ')}. Valid types: ${VALID_ENTITY_TYPES.join(', ')}`,
          },
          { status: 400 }
        )
      }

      if (parsedEntities.length === 0) {
        return NextResponse.json(
          { error: 'syncEntities must contain at least one entity type' },
          { status: 400 }
        )
      }
    } catch {
      return NextResponse.json(
        { error: 'syncEntities must be a valid JSON array' },
        { status: 400 }
      )
    }

    const connector = await db.syncConnector.create({
      data: {
        name: name.trim(),
        type: type.trim(),
        direction,
        syncEntities: JSON.stringify(parsedEntities),
        isActive: false,
        status: 'disconnected',
        hostUrl: hostUrl?.trim() || null,
        apiKey: apiKey?.trim() || null,
        username: username?.trim() || null,
        password: password?.trim() || null,
        database: database?.trim() || null,
        syncInterval: typeof syncInterval === 'number' ? syncInterval : 60,
        fieldMapping:
          fieldMapping
            ? typeof fieldMapping === 'string'
              ? fieldMapping
              : JSON.stringify(fieldMapping)
            : null,
        notes: notes?.trim() || null,
      },
    })

    return NextResponse.json(connector, { status: 201 })
  } catch (error) {
    console.error('Error creating connector:', error)
    return NextResponse.json(
      { error: 'Failed to create connector' },
      { status: 500 }
    )
  }
}
