import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { deleteBackupFile, verifyBackup } from '@/lib/backup'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const backupRecord = await db.backupRecord.findUnique({ where: { id } })
    if (!backupRecord) {
      return NextResponse.json({ error: 'Backup not found' }, { status: 404 })
    }

    // Verify file integrity
    const verification = await verifyBackup(backupRecord)

    return NextResponse.json({
      ...backupRecord,
      verification,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const existing = await db.backupRecord.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const item = await db.backupRecord.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name : undefined,
        type: body.type !== undefined ? body.type : undefined,
        status: body.status !== undefined ? body.status : undefined,
        size: body.size !== undefined ? body.size : undefined,
        duration: body.duration !== undefined ? body.duration : undefined,
        location: body.location !== undefined ? body.location : undefined,
        checksum: body.checksum !== undefined ? body.checksum : undefined,
        filePath: body.filePath !== undefined ? body.filePath : undefined,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : (body.expiresAt === null ? null : undefined),
        autoDelete: body.autoDelete !== undefined ? Boolean(body.autoDelete) : undefined,
        encrypted: body.encrypted !== undefined ? Boolean(body.encrypted) : undefined,
      },
    })
    return NextResponse.json(item)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const existing = await db.backupRecord.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Delete physical backup file
    await deleteBackupFile(existing.filePath)

    // Delete database record
    await db.backupRecord.delete({ where: { id } })

    return NextResponse.json({ message: 'Deleted' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
