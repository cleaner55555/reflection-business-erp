import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createBackup, cleanupExpiredBackups, getDiskUsage } from '@/lib/backup'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''
    const status = searchParams.get('status') || ''
    const where: Record<string, unknown> = {}
    if (type) where.type = type
    if (status) where.status = status
    if (search) where.OR = [{ name: { contains: search } }, { location: { contains: search } }]
    const items = await db.backupRecord.findMany({ where, orderBy: { createdAt: 'desc' } })

    // Get disk usage info
    let diskUsage = null
    try {
      diskUsage = await getDiskUsage()
    } catch {
      // Ignore if disk usage fails — backups list is still returned
    }

    return NextResponse.json({ backups: items, diskUsage })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const backupType = searchParams.get('type') || 'full'
    const body = await request.json()
    const companyId = body.companyId

    // Use first company if no companyId provided
    const targetCompanyId = companyId || (await db.company.findFirst())?.id
    if (!targetCompanyId) {
      return NextResponse.json({ error: 'No company found' }, { status: 400 })
    }

    const name = body.name || `Manual Backup — ${new Date().toLocaleDateString('sr-RS')}`

    // Create the actual backup
    const result = await createBackup(
      targetCompanyId,
      backupType as 'full' | 'incremental',
      name
    )

    // Save record to database
    const record = await db.backupRecord.create({
      data: {
        companyId: targetCompanyId,
        name: result.name,
        type: result.type,
        status: result.status,
        size: result.size,
        duration: result.duration,
        location: result.location,
        checksum: result.checksum,
        filePath: result.filePath,
        expiresAt: result.expiresAt ? new Date(result.expiresAt) : null,
        autoDelete: result.autoDelete,
        encrypted: result.encrypted,
      },
    })

    return NextResponse.json({ ...record, sizeBytes: result.sizeBytes }, { status: 201 })
  } catch (error) {
    console.error('Backup creation failed:', error)
    const message = error instanceof Error ? error.message : 'Failed to create backup'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// Endpoint for scheduled backup tick (called by job scheduler)
export async function PUT() {
  try {
    const result = await cleanupExpiredBackups()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Cleanup failed:', error)
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 })
  }
}
