import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { storage } from '@/lib/storage'

// GET /api/health — System health check for monitoring, load balancers, CI/CD
export async function GET() {
  const startTime = Date.now()
  const checks: Record<string, { status: 'ok' | 'degraded' | 'error'; latencyMs?: number; details?: string }> = {}

  // Database check
  try {
    const dbStart = Date.now()
    await db.$queryRaw`SELECT 1 as ok`
    checks.database = { status: 'ok', latencyMs: Date.now() - dbStart }
  } catch (error) {
    checks.database = { status: 'error', details: error instanceof Error ? error.message : 'Unknown error' }
  }

  // Storage check
  try {
    const storageStart = Date.now()
    await storage.exists('.')
    checks.storage = { status: 'ok', latencyMs: Date.now() - storageStart }
  } catch (error) {
    checks.storage = { status: 'degraded', details: error instanceof Error ? error.message : 'Storage check failed' }
  }

  const totalLatency = Date.now() - startTime
  const allOk = Object.values(checks).every(c => c.status === 'ok')
  const hasError = Object.values(checks).some(c => c.status === 'error')

  const status = hasError ? 503 : allOk ? 200 : 200

  return NextResponse.json(
    {
      status: allOk ? 'healthy' : hasError ? 'unhealthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      responseTime: `${totalLatency}ms`,
      memory: {
        used: `${Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100} MB`,
        total: `${Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100} MB`,
        rss: `${Math.round((process.memoryUsage().rss / 1024 / 1024) * 100) / 100} MB`,
      },
      checks,
    },
    { status }
  )
}
