import { db } from '@/lib/db'

// ─── Audit Log Helper ────────────────────────────────────────────────────────

export interface AuditLogData {
  companyId: string
  userId?: string
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'import' | 'settings'
  entity: string
  entityId?: string
  details?: Record<string, unknown>
  request?: Request
}

export async function createAuditLog(data: AuditLogData) {
  const ipAddress = data.request?.headers.get('x-forwarded-for') || 
                    data.request?.headers.get('x-real-ip') || 
                    'unknown'
  const userAgent = data.request?.headers.get('user-agent') || 'unknown'

  try {
    await db.auditLog.create({
      data: {
        companyId: data.companyId,
        userId: data.userId || null,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId || null,
        details: data.details ? JSON.stringify(data.details) : null,
        ipAddress,
        userAgent,
      },
    })
  } catch {
    // Silent fail - audit log should never break the main flow
  }
}

// ─── Convenience wrappers ───────────────────────────────────────────────────

export function logCreate(data: Omit<AuditLogData, 'action'>) {
  return createAuditLog({ ...data, action: 'create' })
}

export function logUpdate(data: Omit<AuditLogData, 'action'>) {
  return createAuditLog({ ...data, action: 'update' })
}

export function logDelete(data: Omit<AuditLogData, 'action'>) {
  return createAuditLog({ ...data, action: 'delete' })
}

export function logLogin(data: Omit<AuditLogData, 'action'>) {
  return createAuditLog({ ...data, action: 'login' })
}

export function logExport(data: Omit<AuditLogData, 'action'>) {
  return createAuditLog({ ...data, action: 'export' })
}

// ─── Webhook event types ─────────────────────────────────────────────────────

export const WEBHOOK_EVENTS = [
  'invoice.created', 'invoice.updated', 'invoice.deleted', 'invoice.paid',
  'partner.created', 'partner.updated', 'partner.deleted',
  'product.created', 'product.updated', 'product.deleted',
  'stock.received', 'stock.issued', 'stock.low',
  'journal_entry.created',
  'deal.won', 'deal.lost',
  'project.completed',
  'employee.created', 'employee.updated',
] as const

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number]

// ─── Trigger webhooks ────────────────────────────────────────────────────────

export async function triggerWebhooks(
  companyId: string,
  event: string,
  payload: Record<string, unknown>
) {
  try {
    const webhooks = await db.webhook.findMany({
      where: { companyId, isActive: true },
    })

    for (const wh of webhooks) {
      const events: string[] = JSON.parse(wh.events || '[]')
      if (!events.includes(event)) continue

      // Fire and forget - don't block the main flow
      fetch(wh.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Reflection-Event': event,
          'X-Reflection-Signature': wh.secret ? generateSignature(wh.secret, payload) : '',
          ...(wh.headers ? JSON.parse(wh.headers) : {}),
        },
        body: JSON.stringify({ event, timestamp: new Date().toISOString(), data: payload }),
      }).then(async (res) => {
        await db.webhook.update({
          where: { id: wh.id },
          data: {
            lastTriggerAt: new Date(),
            successCount: { increment: res.ok ? 1 : 0 },
            failCount: { increment: res.ok ? 0 : 1 },
          },
        })
      }).catch(async () => {
        await db.webhook.update({
          where: { id: wh.id },
          data: { lastTriggerAt: new Date(), failCount: { increment: 1 } },
        })
      })
    }
  } catch {
    // Silent fail
  }
}

function generateSignature(secret: string, payload: Record<string, unknown>): string {
  const { createHmac } = await import('crypto')
  return createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex')
}
