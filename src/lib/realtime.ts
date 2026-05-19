// ─── Realtime Event Emitter (for API routes) ─────────────────────────────────
// API routes call this to broadcast events via the realtime service

export async function emitRealtimeEvent(params: {
  event: string
  rooms?: string[]
  data?: any
}) {
  try {
    const url = `http://localhost:3004/emit`
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
  } catch {
    // Fire-and-forget: realtime service may not be running
  }
}

// Convenience helpers
export function emitDataUpdate(companyId: string, module: string, entity: string, action: 'create' | 'update' | 'delete', data: any) {
  return emitRealtimeEvent({
    event: 'data-update',
    rooms: [`company:${companyId}:module:${module}`],
    data: { entity, action, data, timestamp: new Date().toISOString() },
  })
}

export function emitNotification(companyId: string, userId: string | undefined, notification: any) {
  return emitRealtimeEvent({
    event: 'notification',
    rooms: userId ? [`user:${userId}`, `company:${companyId}`] : [`company:${companyId}`],
    data: notification,
  })
}
