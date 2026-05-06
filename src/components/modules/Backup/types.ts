export interface BackupRecord {
  id: string
  name: string
  type: 'full' | 'incremental' | 'snapshot'
  status: 'completed' | 'failed' | 'in_progress' | 'scheduled'
  size: string
  duration: string
  location: string
  createdAt: string
  expiresAt: string
  autoDelete: boolean
  encrypted: boolean
}

export interface BackupSchedule {
  id: string
  name: string
  frequency: 'daily' | 'weekly' | 'monthly'
  time: string
  type: 'full' | 'incremental'
  retentionDays: number
  lastRun: string | null
  nextRun: string | null
  active: boolean
}
