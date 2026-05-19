import { createServer, IncomingMessage, ServerResponse } from 'http'

const PORT = 3005
const MAIN_APP_URL = 'http://localhost:3000'

// ─── Job Definitions ────────────────────────────────────────────────────────

interface JobLog {
  timestamp: string
  status: 'success' | 'error'
  duration: number
  message: string
}

interface Job {
  id: string
  name: string
  description: string
  schedule: string
  intervalMs: number
  endpoint: string
  method: string
  body?: any
  enabled: boolean
  lastRun?: string
  nextRun?: number
  status: 'idle' | 'running' | 'error'
  logs: JobLog[]
}

const jobs: Job[] = [
  {
    id: 'recurring-invoices',
    name: 'Ponavljajuće fakture',
    description: 'Proverava i generiše fakture po rasporedu',
    schedule: 'Svakih 5 minuta',
    intervalMs: 5 * 60_000,
    endpoint: '/api/recurring-invoices/check',
    method: 'POST',
    enabled: true,
    status: 'idle',
    logs: [],
  },
  {
    id: 'notification-digest',
    name: 'Dnevni pregled notifikacija',
    description: 'Generiše dnevni rezime notifikacija',
    schedule: 'Svaki dan u 09:00',
    intervalMs: 24 * 60 * 60_000,
    endpoint: '/api/notifications/generate',
    method: 'POST',
    body: { type: 'daily-digest' },
    enabled: true,
    status: 'idle',
    logs: [],
  },
  {
    id: 'subscription-check',
    name: 'Provera subscripcija',
    description: 'Proverava istek probnih perioda i pretplata',
    schedule: 'Svaki sat',
    intervalMs: 60 * 60_000,
    endpoint: '/api/subscriptions/check',
    method: 'POST',
    enabled: false, // disabled until endpoint exists
    status: 'idle',
    logs: [],
  },
  {
    id: 'temp-cleanup',
    name: 'Čišćenje temp fajlova',
    description: 'Briše stare privremene fajlove (stariji od 24h)',
    schedule: 'Svaki sat',
    intervalMs: 60 * 60_000,
    endpoint: '',
    method: 'INTERNAL',
    enabled: true,
    status: 'idle',
    logs: [],
  },
]

// ─── Job Execution ──────────────────────────────────────────────────────────

async function executeJob(job: Job) {
  if (!job.enabled) return
  if (job.status === 'running') return

  job.status = 'running'
  const start = Date.now()

  try {
    if (job.method === 'INTERNAL') {
      // Internal cleanup logic
      if (job.id === 'temp-cleanup') {
        const { promises: fs } = require('fs')
        const path = require('path')
        const tempDir = path.join(process.cwd(), '..', 'storage', 'temp')
        try {
          const files = await fs.readdir(tempDir)
          const now = Date.now()
          let cleaned = 0
          for (const file of files) {
            const filePath = path.join(tempDir, file)
            const stat = await fs.stat(filePath)
            if (stat.mtimeMs < now - 24 * 60 * 60_000) {
              await fs.unlink(filePath).catch(() => {})
              cleaned++
            }
          }
          const msg = `Obrisano ${cleaned} starih fajlova`
          job.logs.unshift({ timestamp: new Date().toISOString(), status: 'success', duration: Date.now() - start, message: msg })
          if (job.logs.length > 50) job.logs.length = 50
        } catch {
          job.logs.unshift({ timestamp: new Date().toISOString(), status: 'success', duration: Date.now() - start, message: 'Temp dir prazan ili ne postoji' })
        }
      }
    } else {
      const response = await fetch(`${MAIN_APP_URL}${job.endpoint}?XTransformPort=3000`, {
        method: job.method,
        headers: { 'Content-Type': 'application/json' },
        body: job.body ? JSON.stringify(job.body) : undefined,
      })
      const msg = `${response.status} ${response.statusText}`
      job.logs.unshift({ timestamp: new Date().toISOString(), status: response.ok ? 'success' : 'error', duration: Date.now() - start, message: msg })
      if (job.logs.length > 50) job.logs.length = 50
    }
    job.status = 'idle'
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    job.logs.unshift({ timestamp: new Date().toISOString(), status: 'error', duration: Date.now() - start, message: msg })
    job.status = 'error'
  }

  job.lastRun = new Date().toISOString()
}

// ─── Schedule Jobs ──────────────────────────────────────────────────────────

const timers: Map<string, ReturnType<typeof setInterval>> = new Map()

function scheduleJob(job: Job) {
  if (timers.has(job.id)) clearInterval(timers.get(job.id))
  job.nextRun = Date.now() + job.intervalMs
  const timer = setInterval(() => {
    job.nextRun = Date.now() + job.intervalMs
    executeJob(job)
  }, job.intervalMs)
  timers.set(job.id, timer)
}

// Schedule all enabled jobs
jobs.forEach(job => {
  if (job.enabled) scheduleJob(job)
})

console.log(`⏰ Job Scheduler running on port ${PORT}`)
console.log(`   ${jobs.filter(j => j.enabled).length}/${jobs.length} jobs enabled`)

// ─── HTTP API ───────────────────────────────────────────────────────────────

function handleRequest(req: IncomingMessage, res: ServerResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }

  // GET /health
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok', jobs: jobs.length, uptime: process.uptime() }))
    return
  }

  // GET /jobs — list all jobs
  if (req.method === 'GET' && req.url === '/jobs') {
    const summary = jobs.map(j => ({
      id: j.id,
      name: j.name,
      description: j.description,
      schedule: j.schedule,
      enabled: j.enabled,
      status: j.status,
      lastRun: j.lastRun,
      nextRun: j.nextRun ? new Date(j.nextRun).toISOString() : null,
      lastLog: j.logs[0] || null,
    }))
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(summary))
    return
  }

  // POST /jobs/[id]/run — manually trigger
  const match = req.url?.match(/^\/jobs\/([^/]+)\/run$/)
  if (req.method === 'POST' && match) {
    const jobId = match[1]
    const job = jobs.find(j => j.id === jobId)
    if (!job) {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Job not found' }))
      return
    }
    executeJob(job)
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: `Job "${job.name}" triggered`, status: job.status }))
    return
  }

  // POST /jobs/[id]/toggle — enable/disable
  const toggleMatch = req.url?.match(/^\/jobs\/([^/]+)\/toggle$/)
  if (req.method === 'POST' && toggleMatch) {
    const jobId = toggleMatch[1]
    const job = jobs.find(j => j.id === jobId)
    if (!job) {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Job not found' }))
      return
    }
    job.enabled = !job.enabled
    if (job.enabled) scheduleJob(job)
    else if (timers.has(job.id)) { clearInterval(timers.get(job.id)); timers.delete(job.id) }
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ id: job.id, enabled: job.enabled }))
    return
  }

  // GET /jobs/[id]/logs
  const logsMatch = req.url?.match(/^\/jobs\/([^/]+)\/logs$/)
  if (req.method === 'GET' && logsMatch) {
    const jobId = logsMatch[1]
    const job = jobs.find(j => j.id === jobId)
    if (!job) {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Job not found' }))
      return
    }
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(job.logs.slice(0, 20)))
    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Not found' }))
}

createServer(handleRequest).listen(PORT)
