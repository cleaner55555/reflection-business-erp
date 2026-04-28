import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/integrations/sync-logs — List all sync logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const connectorId = searchParams.get('connectorId')

    const logs = await db.syncLog.findMany({
      where: connectorId ? { connectorId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        connector: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    })

    return NextResponse.json(logs)
  } catch (error) {
    console.error('Error fetching sync logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sync logs' },
      { status: 500 }
    )
  }
}

// DELETE /api/integrations/sync-logs — Clear all logs or logs for specific connector
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const connectorId = searchParams.get('connectorId')

    // Optionally also accept body for POST-like deletion patterns
    let bodyConnectorId: string | undefined
    try {
      const body = await request.json()
      bodyConnectorId = body.connectorId
    } catch {
      // No body — that's fine, rely on query params
    }

    const targetConnectorId = connectorId || bodyConnectorId

    const whereClause = targetConnectorId
      ? { connectorId: targetConnectorId }
      : {}

    // Check if there are logs to delete
    const existingLogs = await db.syncLog.findMany({
      where: whereClause,
      select: { id: true },
    })

    if (existingLogs.length === 0) {
      return NextResponse.json(
        {
          error: targetConnectorId
            ? 'No logs found for the specified connector'
            : 'No sync logs found',
        },
        { status: 404 }
      )
    }

    const result = await db.syncLog.deleteMany({
      where: whereClause,
    })

    return NextResponse.json({
      deletedCount: result.count,
      connectorId: targetConnectorId || undefined,
    })
  } catch (error) {
    console.error('Error deleting sync logs:', error)
    return NextResponse.json(
      { error: 'Failed to delete sync logs' },
      { status: 500 }
    )
  }
}
