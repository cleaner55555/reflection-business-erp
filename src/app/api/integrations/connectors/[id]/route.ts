import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/integrations/connectors/[id] — Get single connector with logs
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const connector = await db.syncConnector.findUnique({
      where: { id },
      include: {
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    })

    if (!connector) {
      return NextResponse.json(
        { error: 'Connector not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(connector)
  } catch (error) {
    console.error('Error fetching connector:', error)
    return NextResponse.json(
      { error: 'Failed to fetch connector' },
      { status: 500 }
    )
  }
}

// PUT /api/integrations/connectors/[id] — Update connector
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Check connector exists
    const existing = await db.syncConnector.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Connector not found' },
        { status: 404 }
      )
    }

    // Build update data from provided fields
    const updateData: Record<string, unknown> = {}

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Name must be a non-empty string' },
          { status: 400 }
        )
      }
      updateData.name = body.name.trim()
    }

    if (body.type !== undefined) {
      if (typeof body.type !== 'string' || body.type.trim().length === 0) {
        return NextResponse.json(
          { error: 'Type must be a non-empty string' },
          { status: 400 }
        )
      }
      updateData.type = body.type.trim()
    }

    if (body.direction !== undefined) {
      if (!['import', 'export', 'bidirectional'].includes(body.direction)) {
        return NextResponse.json(
          { error: 'Direction must be one of: import, export, bidirectional' },
          { status: 400 }
        )
      }
      updateData.direction = body.direction
    }

    if (body.syncEntities !== undefined) {
      let parsedEntities: string[]
      try {
        parsedEntities =
          typeof body.syncEntities === 'string'
            ? JSON.parse(body.syncEntities)
            : body.syncEntities

        if (!Array.isArray(parsedEntities)) {
          return NextResponse.json(
            { error: 'syncEntities must be a JSON array' },
            { status: 400 }
          )
        }

        const validTypes = [
          'partners',
          'products',
          'transactions',
          'contacts',
          'invoices',
          'stock',
          'employees',
        ]
        const invalidEntities = parsedEntities.filter(
          (e) => !validTypes.includes(e)
        )
        if (invalidEntities.length > 0) {
          return NextResponse.json(
            {
              error: `Invalid entity types: ${invalidEntities.join(', ')}`,
            },
            { status: 400 }
          )
        }

        updateData.syncEntities = JSON.stringify(parsedEntities)
      } catch {
        return NextResponse.json(
          { error: 'syncEntities must be a valid JSON array' },
          { status: 400 }
        )
      }
    }

    if (body.isActive !== undefined) {
      updateData.isActive = Boolean(body.isActive)
    }

    if (body.status !== undefined) {
      const validStatuses = [
        'disconnected',
        'connected',
        'syncing',
        'error',
      ]
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          {
            error: `Status must be one of: ${validStatuses.join(', ')}`,
          },
          { status: 400 }
        )
      }
      updateData.status = body.status
    }

    if (body.hostUrl !== undefined) {
      updateData.hostUrl =
        typeof body.hostUrl === 'string' && body.hostUrl.trim().length > 0
          ? body.hostUrl.trim()
          : null
    }

    if (body.apiKey !== undefined) {
      updateData.apiKey =
        typeof body.apiKey === 'string' && body.apiKey.trim().length > 0
          ? body.apiKey.trim()
          : null
    }

    if (body.username !== undefined) {
      updateData.username =
        typeof body.username === 'string' && body.username.trim().length > 0
          ? body.username.trim()
          : null
    }

    if (body.password !== undefined) {
      updateData.password =
        typeof body.password === 'string' && body.password.trim().length > 0
          ? body.password.trim()
          : null
    }

    if (body.database !== undefined) {
      updateData.database =
        typeof body.database === 'string' && body.database.trim().length > 0
          ? body.database.trim()
          : null
    }

    if (body.syncInterval !== undefined) {
      updateData.syncInterval =
        typeof body.syncInterval === 'number' ? body.syncInterval : 60
    }

    if (body.fieldMapping !== undefined) {
      updateData.fieldMapping = body.fieldMapping
        ? typeof body.fieldMapping === 'string'
          ? body.fieldMapping
          : JSON.stringify(body.fieldMapping)
        : null
    }

    if (body.notes !== undefined) {
      updateData.notes =
        typeof body.notes === 'string' && body.notes.trim().length > 0
          ? body.notes.trim()
          : null
    }

    const connector = await db.syncConnector.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(connector)
  } catch (error) {
    console.error('Error updating connector:', error)
    return NextResponse.json(
      { error: 'Failed to update connector' },
      { status: 500 }
    )
  }
}

// DELETE /api/integrations/connectors/[id] — Delete connector and its logs
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check connector exists
    const existing = await db.syncConnector.findUnique({
      where: { id },
      include: { logs: true },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Connector not found' },
        { status: 404 }
      )
    }

    // Delete connector (logs are cascade-deleted via schema)
    await db.syncConnector.delete({
      where: { id },
    })

    return NextResponse.json({
      deleted: true,
      connectorId: id,
      deletedLogsCount: existing.logs.length,
    })
  } catch (error) {
    console.error('Error deleting connector:', error)
    return NextResponse.json(
      { error: 'Failed to delete connector' },
      { status: 500 }
    )
  }
}
