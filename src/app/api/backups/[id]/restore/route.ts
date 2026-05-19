import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { restoreBackup } from '@/lib/backup'

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const backupRecord = await db.backupRecord.findUnique({ where: { id } })
    if (!backupRecord) {
      return NextResponse.json({ error: 'Backup not found' }, { status: 404 })
    }

    if (backupRecord.status === 'failed') {
      return NextResponse.json({ error: 'Cannot restore from a failed backup' }, { status: 400 })
    }

    const result = await restoreBackup(backupRecord)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        preRestoreBackupId: result.preRestoreBackupId,
      })
    } else {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }
  } catch (error) {
    console.error('Restore failed:', error)
    const message = error instanceof Error ? error.message : 'Failed to restore backup'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
