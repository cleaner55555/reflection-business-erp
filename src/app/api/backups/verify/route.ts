import { NextResponse } from 'next/server'
import { verifyAllBackups } from '@/lib/backup'

/**
 * POST /api/backups/verify
 * Verify integrity of ALL backups on disk against DB records.
 */
export async function POST() {
  try {
    const results = await verifyAllBackups()
    const summary = {
      total: results.length,
      valid: results.filter(r => r.valid).length,
      invalid: results.filter(r => !r.valid).length,
    }
    return NextResponse.json({ results, summary })
  } catch (error) {
    console.error('Bulk verification failed:', error)
    const message = error instanceof Error ? error.message : 'Failed to verify backups'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
