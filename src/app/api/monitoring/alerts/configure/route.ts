import { NextRequest, NextResponse } from 'next/server'
import { metrics } from '@/lib/monitoring'
import type { AlertConfig } from '@/lib/monitoring'

// POST /api/monitoring/alerts/configure
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { action, id, type, threshold, windowMs, enabled } = body

    // Validate action
    if (!action || !['create', 'update', 'delete', 'list'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid "action" — must be create, update, delete, or list' },
        { status: 400 }
      )
    }

    // List all alerts
    if (action === 'list') {
      const alerts = metrics.getAlerts()
      const triggered = metrics.checkAlerts()
      return NextResponse.json({
        success: true,
        data: { alerts, triggered },
      })
    }

    // Create alert
    if (action === 'create') {
      if (!type || !threshold) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields: type, threshold' },
          { status: 400 }
        )
      }

      const validTypes: AlertConfig['type'][] = ['error_rate', 'response_time', 'memory_usage', 'error_count']
      if (!validTypes.includes(type)) {
        return NextResponse.json(
          { success: false, error: `Invalid type — must be one of: ${validTypes.join(', ')}` },
          { status: 400 }
        )
      }

      if (typeof threshold !== 'number' || threshold <= 0) {
        return NextResponse.json(
          { success: false, error: 'threshold must be a positive number' },
          { status: 400 }
        )
      }

      const alert = metrics.configureAlert({
        type,
        threshold,
        windowMs: windowMs || 300_000, // default 5 min
        enabled: enabled !== false,
      })

      return NextResponse.json({ success: true, data: alert })
    }

    // Update alert
    if (action === 'update') {
      if (!id) {
        return NextResponse.json(
          { success: false, error: 'Missing required field: id' },
          { status: 400 }
        )
      }

      const updates: Partial<AlertConfig> = {}
      if (threshold !== undefined) updates.threshold = threshold
      if (windowMs !== undefined) updates.windowMs = windowMs
      if (enabled !== undefined) updates.enabled = enabled

      const updated = metrics.updateAlert(id, updates)
      if (!updated) {
        return NextResponse.json(
          { success: false, error: 'Alert not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, data: updated })
    }

    // Delete alert
    if (action === 'delete') {
      if (!id) {
        return NextResponse.json(
          { success: false, error: 'Missing required field: id' },
          { status: 400 }
        )
      }

      const deleted = metrics.deleteAlert(id)
      if (!deleted) {
        return NextResponse.json(
          { success: false, error: 'Alert not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, data: { deleted: true } })
    }

    return NextResponse.json(
      { success: false, error: 'Unknown action' },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process alert configuration' },
      { status: 500 }
    )
  }
}
