import { NextResponse } from 'next/server'
import { handleScheduledBackupTick } from '@/lib/backup'

// Called by the job-scheduler mini-service every 5 minutes
export async function POST() {
  try {
    const result = await handleScheduledBackupTick()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Scheduled backup tick failed:', error)
    return NextResponse.json({ error: 'Scheduled backup tick failed' }, { status: 500 })
  }
}
