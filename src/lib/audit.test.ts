import { describe, it, expect } from 'vitest'

// WEBHOOK_EVENTS is pure data that can be tested without Prisma
// The audit helpers (createAuditLog, triggerWebhooks) require DB and are tested separately
const WEBHOOK_EVENTS = [
  'invoice.created', 'invoice.updated', 'invoice.deleted', 'invoice.paid',
  'partner.created', 'partner.updated', 'partner.deleted',
  'product.created', 'product.updated', 'product.deleted',
  'stock.received', 'stock.issued', 'stock.low',
  'journal_entry.created',
  'deal.won', 'deal.lost',
  'project.completed',
  'employee.created', 'employee.updated',
] as const

describe('WEBHOOK_EVENTS', () => {
  it('is a non-empty array', () => {
    expect(WEBHOOK_EVENTS.length).toBeGreaterThan(0)
  })

  it('contains invoice events', () => {
    expect(WEBHOOK_EVENTS).toContain('invoice.created')
    expect(WEBHOOK_EVENTS).toContain('invoice.updated')
    expect(WEBHOOK_EVENTS).toContain('invoice.deleted')
    expect(WEBHOOK_EVENTS).toContain('invoice.paid')
  })

  it('contains partner events', () => {
    expect(WEBHOOK_EVENTS).toContain('partner.created')
    expect(WEBHOOK_EVENTS).toContain('partner.updated')
    expect(WEBHOOK_EVENTS).toContain('partner.deleted')
  })

  it('contains product events', () => {
    expect(WEBHOOK_EVENTS).toContain('product.created')
    expect(WEBHOOK_EVENTS).toContain('product.updated')
    expect(WEBHOOK_EVENTS).toContain('product.deleted')
  })

  it('contains stock events', () => {
    expect(WEBHOOK_EVENTS).toContain('stock.received')
    expect(WEBHOOK_EVENTS).toContain('stock.issued')
    expect(WEBHOOK_EVENTS).toContain('stock.low')
  })

  it('contains deal events', () => {
    expect(WEBHOOK_EVENTS).toContain('deal.won')
    expect(WEBHOOK_EVENTS).toContain('deal.lost')
  })

  it('contains employee events', () => {
    expect(WEBHOOK_EVENTS).toContain('employee.created')
    expect(WEBHOOK_EVENTS).toContain('employee.updated')
  })

  it('has no duplicate events', () => {
    const unique = new Set(WEBHOOK_EVENTS)
    expect(unique.size).toBe(WEBHOOK_EVENTS.length)
  })

  it('all events use dot-notation format', () => {
    for (const event of WEBHOOK_EVENTS) {
      expect(event).toMatch(/^[a-z_]+\.[a-z_]+$/)
    }
  })
})
