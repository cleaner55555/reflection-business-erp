import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getBackupFile } from '@/lib/backup'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const backupRecord = await db.backupRecord.findUnique({ where: { id } })
    if (!backupRecord) {
      return NextResponse.json({ error: 'Backup not found' }, { status: 404 })
    }

    const result = await getBackupFile(backupRecord)
    if (!result) {
      return NextResponse.json({ error: 'Backup file not found on disk' }, { status: 404 })
    }

    return new NextResponse(result.buffer, {
      headers: {
        'Content-Type': 'application/gzip',
        'Content-Disposition': `attachment; filename="${result.fileName}"`,
        'Content-Length': String(result.buffer.length),
      },
    })
  } catch (error) {
    console.error('Download failed:', error)
    return NextResponse.json({ error: 'Failed to download backup' }, { status: 500 })
  }
}
