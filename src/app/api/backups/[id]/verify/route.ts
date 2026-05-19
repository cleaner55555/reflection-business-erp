import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyBackup } from '@/lib/backup'

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const backupRecord = await db.backupRecord.findUnique({ where: { id } })
    if (!backupRecord) {
      return NextResponse.json({ error: 'Backup not found' }, { status: 404 })
    }

    const result = await verifyBackup(backupRecord)

    // Update checksum in DB if it was verified
    if (result.valid) {
      await db.backupRecord.update({
        where: { id },
        data: { checksum: result.checksum },
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Verification failed:', error)
    return NextResponse.json({ error: 'Failed to verify backup' }, { status: 500 })
  }
}
