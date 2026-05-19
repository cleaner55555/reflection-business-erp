import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'
import zlib from 'zlib'

// ─── Configuration ─────────────────────────────────────────────────────────

const DB_DIR = path.join(process.cwd(), 'db')
const DB_FILE = path.join(DB_DIR, 'custom.db')
const BACKUP_DIR = path.join(DB_DIR, 'backups')

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const val = bytes / Math.pow(1024, i)
  return `${val.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes === 0 && seconds === 0) return `${ms}ms`
  if (minutes === 0) return `${seconds}s`
  return `${minutes}m ${seconds}s`
}

async function ensureBackupDir(): Promise<void> {
  await fs.mkdir(BACKUP_DIR, { recursive: true })
}

function getTimestamp(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
}

function calculateChecksum(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

function shortChecksum(checksum: string): string {
  return `${checksum.substring(0, 8)}`
}

// ─── Incremental Backup Helper ─────────────────────────────────────────────

interface IncrementalData {
  backupTime: string
  changes: Array<{
    table: string
    operation: 'insert' | 'update' | 'delete'
    data: Record<string, unknown>
  }>
}

// ─── Core Functions ────────────────────────────────────────────────────────

export interface BackupResult {
  id: string
  name: string
  type: string
  status: string
  size: string
  sizeBytes: number
  compressedSizeBytes: number
  duration: string
  location: string
  checksum: string
  filePath: string
  createdAt: string
  expiresAt: string | null
  autoDelete: boolean
  encrypted: boolean
}

/**
 * Create a real backup of the SQLite database
 * - Full: copies entire db file, compresses with gzip
 * - Incremental: exports recent changes as JSON, compresses
 */
export async function createBackup(
  companyId: string,
  type: 'full' | 'incremental' = 'full',
  name?: string
): Promise<BackupResult> {
  await ensureBackupDir()

  const startTime = Date.now()
  const timestamp = getTimestamp()

  try {
    let compressedBuffer: Buffer
    let checksum: string
    let originalSize = 0
    let compressedSize = 0
    let backupFilePath: string

    if (type === 'incremental') {
      // Incremental: export recent DB records as JSON delta
      const { db } = await import('@/lib/db')

      // Get all records modified in the last 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

      // Collect changes from key tables
      const changes: IncrementalData['changes'] = []

      // Use a list of key tables to check for recent changes
      const tablesToCheck = [
        { model: 'invoice' as const, key: 'createdAt' },
        { model: 'partner' as const, key: 'createdAt' },
        { model: 'product' as const, key: 'createdAt' },
        { model: 'transaction' as const, key: 'createdAt' },
        { model: 'crmActivity' as const, key: 'createdAt' },
        { model: 'calendarEvent' as const, key: 'createdAt' },
        { model: 'employee' as const, key: 'createdAt' },
        { model: 'purchaseOrder' as const, key: 'createdAt' },
        { model: 'deliveryNote' as const, key: 'createdAt' },
        { model: 'deal' as const, key: 'createdAt' },
      ]

      for (const table of tablesToCheck) {
        try {
          const records = await (db[table] as any).findMany({
            where: {
              companyId,
              [table.key]: { gte: oneDayAgo },
            },
            take: 500,
          })
          for (const record of records) {
            changes.push({
              table: table.model,
              operation: 'insert',
              data: record as Record<string, unknown>,
            })
          }
        } catch {
          // Table might not exist, skip
        }
      }

      const incrementalData: IncrementalData = {
        backupTime: new Date().toISOString(),
        changes,
      }

      const jsonBuffer = Buffer.from(JSON.stringify(incrementalData, null, 0), 'utf-8')
      originalSize = jsonBuffer.length
      compressedBuffer = await gzipCompress(jsonBuffer)
      compressedSize = compressedBuffer.length
      checksum = calculateChecksum(compressedBuffer)

      // Filename: backup_{timestamp}_{checksum_short}.json.gz
      const csShort = shortChecksum(checksum)
      backupFilePath = path.join(BACKUP_DIR, `backup_${timestamp}_${csShort}.json.gz`)
    } else {
      // Full: copy entire database file and compress
      const dbBuffer = await fs.readFile(DB_FILE)
      originalSize = dbBuffer.length
      compressedBuffer = await gzipCompress(dbBuffer)
      compressedSize = compressedBuffer.length
      checksum = calculateChecksum(compressedBuffer)

      // Filename: backup_{timestamp}_{checksum_short}.db.gz
      const csShort = shortChecksum(checksum)
      backupFilePath = path.join(BACKUP_DIR, `backup_${timestamp}_${csShort}.db.gz`)
    }

    // Write compressed file
    await fs.writeFile(backupFilePath, compressedBuffer)

    const duration = Date.now() - startTime

    return {
      id: '',
      name: name || `Backup — ${new Date().toLocaleDateString('sr-RS')}`,
      type,
      status: 'completed',
      size: formatBytes(originalSize),
      sizeBytes: originalSize,
      compressedSizeBytes: compressedSize,
      duration: formatDuration(duration),
      location: 'Local',
      checksum,
      filePath: backupFilePath,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      autoDelete: true,
      encrypted: false,
    }
  } catch (error) {
    throw error
  }
}

/**
 * Restore database from a backup
 * - Validates checksum
 * - Creates pre-restore backup
 * - Replaces db/custom.db with the backup data
 */
export async function restoreBackup(backupRecord: {
  id: string
  companyId: string
  type: string
  checksum: string | null
  filePath: string | null
  name: string
}): Promise<{ success: boolean; message: string; preRestoreBackupId?: string }> {
  if (!backupRecord.filePath) {
    throw new Error('Backup file path not found in record')
  }

  // Check file exists
  try {
    await fs.access(backupRecord.filePath)
  } catch {
    throw new Error(`Backup file not found at: ${backupRecord.filePath}`)
  }

  // Read and validate compressed file
  const compressedBuffer = await fs.readFile(backupRecord.filePath)
  const currentChecksum = calculateChecksum(compressedBuffer)

  if (backupRecord.checksum && currentChecksum !== backupRecord.checksum) {
    throw new Error(`Checksum mismatch! File may be corrupted. Expected: ${backupRecord.checksum.substring(0, 16)}... Got: ${currentChecksum.substring(0, 16)}...`)
  }

  // Decompress
  const decompressedBuffer = await gzipDecompress(compressedBuffer)

  if (backupRecord.type === 'incremental') {
    return {
      success: false,
      message: 'Incremental backups cannot be directly restored. Please use a full backup for restoration.',
    }
  }

  // Create pre-restore backup
  let preRestoreBackupId: string | undefined
  try {
    const preRestoreResult = await createBackup(
      backupRecord.companyId,
      'full',
      `Pre-restore backup — ${new Date().toLocaleDateString('sr-RS')}`
    )

    // Save pre-restore record to DB
    const { db } = await import('@/lib/db')
    const record = await db.backupRecord.create({
      data: {
        companyId: backupRecord.companyId,
        name: preRestoreResult.name,
        type: preRestoreResult.type,
        status: 'completed',
        size: preRestoreResult.size,
        duration: preRestoreResult.duration,
        location: preRestoreResult.location,
        checksum: preRestoreResult.checksum,
        filePath: preRestoreResult.filePath,
        expiresAt: preRestoreResult.expiresAt ? new Date(preRestoreResult.expiresAt) : null,
        autoDelete: preRestoreResult.autoDelete,
        encrypted: preRestoreResult.encrypted,
      },
    })
    preRestoreBackupId = record.id
  } catch (error) {
    console.error('Warning: Failed to create pre-restore backup:', error)
  }

  // Replace database file
  try {
    const tempPath = DB_FILE + '.restoring'
    await fs.writeFile(tempPath, decompressedBuffer)
    await fs.rename(tempPath, DB_FILE)
  } catch (error) {
    try { await fs.unlink(DB_FILE + '.restoring') } catch { /* ignore */ }
    throw new Error(`Failed to write database file: ${error instanceof Error ? error.message : String(error)}`)
  }

  return {
    success: true,
    message: 'Database restored successfully.',
    preRestoreBackupId,
  }
}

/**
 * Verify backup integrity by re-calculating checksum
 */
export async function verifyBackup(backupRecord: {
  checksum: string | null
  filePath: string | null
}): Promise<{ valid: boolean; checksum: string; message: string }> {
  if (!backupRecord.filePath) {
    return { valid: false, checksum: '', message: 'No file path associated with this backup' }
  }

  try {
    await fs.access(backupRecord.filePath)
  } catch {
    return { valid: false, checksum: '', message: 'Backup file not found on disk' }
  }

  const compressedBuffer = await fs.readFile(backupRecord.filePath)
  const currentChecksum = calculateChecksum(compressedBuffer)

  if (backupRecord.checksum && currentChecksum !== backupRecord.checksum) {
    return {
      valid: false,
      checksum: currentChecksum,
      message: `Checksum mismatch! File may be corrupted.`,
    }
  }

  return {
    valid: true,
    checksum: currentChecksum,
    message: 'Backup integrity verified successfully.',
  }
}

/**
 * Get the backup file buffer for download
 */
export async function getBackupFile(backupRecord: {
  filePath: string | null
  name: string
  type: string
}): Promise<{ buffer: Buffer; fileName: string } | null> {
  if (!backupRecord.filePath) return null

  try {
    await fs.access(backupRecord.filePath)
  } catch {
    return null
  }

  const buffer = await fs.readFile(backupRecord.filePath)
  const fileName = `${backupRecord.name.replace(/[^a-zA-Z0-9_\-\.]/g, '_')}_${backupRecord.type}.bak.gz`

  return { buffer, fileName }
}

/**
 * Delete backup file from disk
 */
export async function deleteBackupFile(filePath: string | null): Promise<void> {
  if (!filePath) return
  try {
    await fs.access(filePath)
    await fs.unlink(filePath)
  } catch {
    // File might already be deleted
  }
}

/**
 * List all backup files on disk with metadata
 */
export async function listBackupFiles(): Promise<Array<{
  fileName: string
  filePath: string
  sizeBytes: number
  sizeFormatted: string
  createdAt: string
  type: 'full' | 'incremental'
  checksum: string
}>> {
  await ensureBackupDir()

  let files: string[]
  try {
    files = await fs.readdir(BACKUP_DIR)
  } catch {
    return []
  }

  const backupFiles = files.filter(f =>
    f.startsWith('backup_') && (f.endsWith('.db.gz') || f.endsWith('.json.gz'))
  )

  const results = await Promise.all(
    backupFiles.map(async (fileName) => {
      const filePath = path.join(BACKUP_DIR, fileName)
      try {
        const stat = await fs.stat(filePath)
        const isFull = fileName.endsWith('.db.gz')
        const type: 'full' | 'incremental' = isFull ? 'full' : 'incremental'

        // Calculate checksum by reading file
        const buffer = await fs.readFile(filePath)
        const checksum = calculateChecksum(buffer)

        // Extract timestamp from filename: backup_{timestamp}_{checksum}.db.gz
        const parts = fileName.replace(/\.db\.gz$|\.json\.gz$/, '').split('_')
        // Format: backup_20250119_143022_abcdef12
        const dateStr = parts[1] || ''
        const timeStr = parts[2] || ''
        let createdAt = ''
        if (dateStr.length === 8 && timeStr.length === 6) {
          createdAt = new Date(
            parseInt(dateStr.substring(0, 4)),
            parseInt(dateStr.substring(4, 6)) - 1,
            parseInt(dateStr.substring(6, 8)),
            parseInt(timeStr.substring(0, 2)),
            parseInt(timeStr.substring(2, 4)),
            parseInt(timeStr.substring(4, 6))
          ).toISOString()
        } else {
          createdAt = stat.mtime.toISOString()
        }

        return {
          fileName,
          filePath,
          sizeBytes: stat.size,
          sizeFormatted: formatBytes(stat.size),
          createdAt,
          type,
          checksum,
        }
      } catch {
        return null
      }
    })
  )

  return results
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/**
 * Get disk usage information for backups
 */
export async function getDiskUsage(): Promise<{
  backupDirPath: string
  totalSizeBytes: number
  totalSizeFormatted: string
  fileCount: number
  fullBackupCount: number
  incrementalBackupCount: number
  dbFileSizeBytes: number
  dbFileSizeFormatted: string
  oldestBackupDate: string | null
  newestBackupDate: string | null
}> {
  const files = await listBackupFiles()
  const totalSizeBytes = files.reduce((sum, f) => sum + f.sizeBytes, 0)
  const fullBackupCount = files.filter(f => f.type === 'full').length
  const incrementalBackupCount = files.filter(f => f.type === 'incremental').length

  let dbFileSizeBytes = 0
  try {
    const stat = await fs.stat(DB_FILE)
    dbFileSizeBytes = stat.size
  } catch {
    // DB file might not exist
  }

  const dates = files.map(f => f.createdAt).sort()
  const oldestBackupDate = dates.length > 0 ? dates[0] : null
  const newestBackupDate = dates.length > 0 ? dates[dates.length - 1] : null

  return {
    backupDirPath: BACKUP_DIR,
    totalSizeBytes,
    totalSizeFormatted: formatBytes(totalSizeBytes),
    fileCount: files.length,
    fullBackupCount,
    incrementalBackupCount,
    dbFileSizeBytes,
    dbFileSizeFormatted: formatBytes(dbFileSizeBytes),
    oldestBackupDate,
    newestBackupDate,
  }
}

/**
 * Verify all backups on disk against DB records
 */
export async function verifyAllBackups(): Promise<Array<{
  id: string
  name: string
  filePath: string | null
  checksum: string | null
  valid: boolean
  message: string
  fileSizeOnDisk: number | null
}>> {
  const { db } = await import('@/lib/db')

  const records = await db.backupRecord.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const results = await Promise.all(
    records.map(async (record) => {
      let fileSizeOnDisk: number | null = null

      if (!record.filePath) {
        return {
          id: record.id,
          name: record.name,
          filePath: record.filePath,
          checksum: record.checksum,
          valid: false,
          message: 'No file path associated',
          fileSizeOnDisk: null,
        }
      }

      try {
        await fs.access(record.filePath)
      } catch {
        return {
          id: record.id,
          name: record.name,
          filePath: record.filePath,
          checksum: record.checksum,
          valid: false,
          message: 'File not found on disk',
          fileSizeOnDisk: null,
        }
      }

      try {
        const stat = await fs.stat(record.filePath)
        fileSizeOnDisk = stat.size
        const buffer = await fs.readFile(record.filePath)
        const currentChecksum = calculateChecksum(buffer)

        if (record.checksum && currentChecksum !== record.checksum) {
          return {
            id: record.id,
            name: record.name,
            filePath: record.filePath,
            checksum: record.checksum,
            valid: false,
            message: 'Checksum mismatch — file may be corrupted',
            fileSizeOnDisk,
          }
        }

        return {
          id: record.id,
          name: record.name,
          filePath: record.filePath,
          checksum: record.checksum,
          valid: true,
          message: 'Integrity verified',
          fileSizeOnDisk,
        }
      } catch (error) {
        return {
          id: record.id,
          name: record.name,
          filePath: record.filePath,
          checksum: record.checksum,
          valid: false,
          message: `Error: ${error instanceof Error ? error.message : 'Unknown'}`,
          fileSizeOnDisk,
        }
      }
    })
  )

  return results
}

/**
 * Clean up expired backups based on schedule retentionDays
 */
export async function cleanupExpiredBackups(): Promise<{ deleted: number; errors: number }> {
  const { db } = await import('@/lib/db')

  const now = new Date()
  let deleted = 0
  let errors = 0

  // 1. Delete records past their expiresAt that have autoDelete enabled
  const expiredRecords = await db.backupRecord.findMany({
    where: {
      autoDelete: true,
      expiresAt: { lt: now },
    },
  })

  for (const record of expiredRecords) {
    try {
      await deleteBackupFile(record.filePath)
      await db.backupRecord.delete({ where: { id: record.id } })
      deleted++
    } catch {
      errors++
    }
  }

  // 2. Delete old backups based on schedule retentionDays
  const schedules = await db.backupSchedule.findMany({
    where: { active: true },
  })

  for (const schedule of schedules) {
    const cutoff = new Date(now.getTime() - schedule.retentionDays * 24 * 60 * 60 * 1000)
    const oldBackups = await db.backupRecord.findMany({
      where: {
        companyId: schedule.companyId,
        type: schedule.type,
        createdAt: { lt: cutoff },
      },
      orderBy: { createdAt: 'desc' },
      skip: 5, // Keep at least 5 most recent
    })

    for (const backup of oldBackups) {
      try {
        await deleteBackupFile(backup.filePath)
        await db.backupRecord.delete({ where: { id: backup.id } })
        deleted++
      } catch {
        errors++
      }
    }
  }

  return { deleted, errors }
}

/**
 * Run scheduled backups based on BackupSchedule records
 */
export async function runScheduledBackups(): Promise<{ ran: number; errors: number }> {
  const { db } = await import('@/lib/db')

  const now = new Date()

  let ran = 0
  let errors = 0

  const schedules = await db.backupSchedule.findMany({
    where: {
      active: true,
    },
  })

  for (const schedule of schedules) {
    // Check if it's time to run
    const shouldRunFlag = shouldScheduleRun(schedule, now)
    if (!shouldRunFlag) continue

    // Check if already ran today
    if (schedule.lastRun) {
      const lastRunDate = new Date(schedule.lastRun)
      const isSameDay = lastRunDate.toDateString() === now.toDateString()
      if (isSameDay && schedule.frequency === 'daily') continue
      if (isSameWeek(lastRunDate, now) && schedule.frequency === 'weekly') continue
      if (lastRunDate.getMonth() === now.getMonth() && schedule.frequency === 'monthly') continue
    }

    try {
      const result = await createBackup(
        schedule.companyId,
        schedule.type as 'full' | 'incremental',
        `Scheduled: ${schedule.name} — ${now.toLocaleDateString('sr-RS')}`
      )

      // Save to DB
      await db.backupRecord.create({
        data: {
          companyId: schedule.companyId,
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

      // Update schedule lastRun and nextRun
      const nextRunDate = calculateNextRun(schedule, now)
      await db.backupSchedule.update({
        where: { id: schedule.id },
        data: {
          lastRun: now,
          nextRun: nextRunDate,
        },
      })

      ran++
    } catch (error) {
      console.error(`Scheduled backup failed for "${schedule.name}":`, error)
      errors++
    }
  }

  return { ran, errors }
}

// ─── Internal Helpers ──────────────────────────────────────────────────────

function gzipCompress(data: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    zlib.gzip(data, (error, result) => {
      if (error) reject(error)
      else resolve(result)
    })
  })
}

function gzipDecompress(data: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    zlib.gunzip(data, (error, result) => {
      if (error) reject(error)
      else resolve(result)
    })
  })
}

function shouldScheduleRun(schedule: { time: string; frequency: string }, now: Date): boolean {
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const [scheduledHour, scheduledMin] = schedule.time.split(':').map(Number)
  const [currentHour, currentMin] = currentTime.split(':').map(Number)
  const diffMinutes = (currentHour * 60 + currentMin) - (scheduledHour * 60 + scheduledMin)
  return diffMinutes >= 0 && diffMinutes <= 5
}

function isSameWeek(date1: Date, date2: Date): boolean {
  const oneDay = 24 * 60 * 60 * 1000
  const startOfWeek = (d: Date) => {
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.getFullYear(), d.getMonth(), diff)
  }
  return Math.abs(startOfWeek(date1).getTime() - startOfWeek(date2).getTime()) < oneDay
}

function calculateNextRun(schedule: { frequency: string; time: string }, after: Date): Date {
  const [hour, minute] = schedule.time.split(':').map(Number)
  const next = new Date(after)
  next.setHours(hour, minute, 0, 0)

  if (schedule.frequency === 'daily') {
    next.setDate(next.getDate() + 1)
  } else if (schedule.frequency === 'weekly') {
    next.setDate(next.getDate() + 7)
  } else if (schedule.frequency === 'monthly') {
    next.setMonth(next.getMonth() + 1)
  }

  return next
}

// ─── API endpoint for job scheduler ────────────────────────────────────────

export async function handleScheduledBackupTick(): Promise<{ backupsRan: number; cleanupDeleted: number; errors: number }> {
  let backupsRan = 0
  let cleanupDeleted = 0
  let errors = 0

  try {
    const backupResult = await runScheduledBackups()
    backupsRan = backupResult.ran
    errors += backupResult.errors
  } catch (error) {
    console.error('Scheduled backup tick error:', error)
    errors++
  }

  try {
    const cleanupResult = await cleanupExpiredBackups()
    cleanupDeleted = cleanupResult.deleted
    errors += cleanupResult.errors
  } catch (error) {
    console.error('Cleanup tick error:', error)
    errors++
  }

  return { backupsRan, cleanupDeleted, errors }
}
