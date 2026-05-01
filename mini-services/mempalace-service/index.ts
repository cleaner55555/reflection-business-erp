/**
 * MemPalace Mini-Service — HTTP wrapper za MemPalace CLI
 * Adaptiran za GLM5. Port: 3031
 * 
 * Endpoints:
 *   GET  /api/status        — mempalace palace status
 *   POST /api/search        — semantic search ({ query: string })
 *   POST /api/wake-up       — get wake-up context (L0+L1)
 *   POST /api/mine          — re-mine project modules
 */

import http from 'http'
import { exec } from 'child_process'

const PORT = 3031
const WORKSPACE = '/home/z/my-project'

function runAsync(cmd: string, timeout = 30000): Promise<string> {
  return new Promise((resolve) => {
    exec(cmd, {
      cwd: WORKSPACE,
      timeout,
      maxBuffer: 10 * 1024 * 1024,
      encoding: 'utf-8',
    }, (err, stdout, stderr) => {
      resolve(stdout || stderr || err?.message || 'Error')
    })
  })
}

async function handleStatus(): Promise<string> {
  const out = await runAsync('mempalace status', 15000)
  const drawers = out.match(/(\d+)\s+drawers/)?.[1] || 'unknown'
  const wings = out.match(/WING:\s+(\w+)/g) || []
  return JSON.stringify({ service: 'mempalace-glm5', status: 'running', drawers, wings, raw: out.trim() })
}

async function handleSearch(query: string): Promise<string> {
  const safe = (query || '').replace(/[;"'`$\\]/g, '').slice(0, 300)
  if (!safe) return JSON.stringify({ error: 'Query required' })
  const out = await runAsync(`mempalace search "${safe}"`, 20000)
  return JSON.stringify({ query: safe, results: out.trim() })
}

async function handleWakeUp(): Promise<string> {
  const out = await runAsync('mempalace wake-up', 15000)
  return JSON.stringify({ context: out.trim() })
}

async function handleMine(): Promise<string> {
  const out = await runAsync('mempalace mine --yes src/components/modules/', 60000)
  const mined = (out.match(/^\+/gm) || []).length
  return JSON.stringify({ mined, timestamp: new Date().toISOString() })
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`)
  const pathname = url.pathname
  
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  try {
    let body = ''
    if (req.method === 'POST') {
      for await (const chunk of req) body += chunk
    }
    const parsed = body ? JSON.parse(body) : {}

    let result = '{}'
    
    if (pathname.includes('status') && req.method === 'GET') {
      result = await handleStatus()
    } else if (pathname.includes('search') && req.method === 'POST') {
      result = await handleSearch(parsed.query || '')
    } else if (pathname.includes('wake-up') && req.method === 'POST') {
      result = await handleWakeUp()
    } else if (pathname.includes('mine') && req.method === 'POST') {
      result = await handleMine()
    } else {
      result = JSON.stringify({
        service: 'mempalace-glm5',
        version: '1.0.0',
        endpoints: ['GET /api/status', 'POST /api/search', 'POST /api/wake-up', 'POST /api/mine'],
      })
    }

    res.writeHead(200)
    res.end(result)
  } catch (e: any) {
    res.writeHead(500)
    res.end(JSON.stringify({ error: e.message }))
  }
})

server.listen(PORT, () => {
  console.log(`🧠 MemPalace GLM5 Service running on port ${PORT}`)
  console.log(`   Palace: ${WORKSPACE}/.mempalace`)
  console.log(`   GET  /api/status  POST /api/search  POST /api/wake-up  POST /api/mine`)
})
