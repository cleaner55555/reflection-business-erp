import { Server } from 'socket.io'

const PORT = 3004
const io = new Server(PORT, {
  cors: { origin: '*' },
  serveClient: false,
})

// Track online users per company
const companyUsers = new Map<string, Set<string>>()
// Track socket → user mapping
const socketUsers = new Map<string, { userId: string; companyId: string }>()

console.log(`🔗 Realtime service running on port ${PORT}`)

io.on('connection', (socket) => {
  const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId as string
  const companyId = socket.handshake.auth?.companyId || socket.handshake.query?.companyId as string

  if (userId && companyId) {
    socketUsers.set(socket.id, { userId, companyId })
    if (!companyUsers.has(companyId)) companyUsers.set(companyId, new Set())
    companyUsers.get(companyId)!.add(userId)
    socket.join(`company:${companyId}`)
    io.to(`company:${companyId}`).emit('presence', { userId, status: 'online', companyOnlineCount: companyUsers.get(companyId)?.size || 0 })
    console.log(`✅ Connected: ${socket.id} (user: ${userId}, company: ${companyId})`)
  }

  // ── Event: join-module ──
  socket.on('join-module', ({ companyId: cid, module: mod }: { companyId: string; module: string }) => {
    socket.join(`company:${cid}:module:${mod}`)
  })

  // ── Event: leave-module ──
  socket.on('leave-module', ({ companyId: cid, module: mod }: { companyId: string; module: string }) => {
    socket.leave(`company:${cid}:module:${mod}`)
  })

  // ── Event: notification ──
  socket.on('notification', (data: { companyId: string; userId?: string; notification: any }) => {
    if (data.userId) {
      io.emit(`user:${data.userId}`, data.notification)
    }
    io.to(`company:${data.companyId}`).emit('notification', data.notification)
  })

  // ── Event: chat-message ──
  socket.on('chat-message', (data: { companyId: string; channel: string; message: any }) => {
    io.to(`company:${data.companyId}:chat:${data.channel}`).emit('chat-message', data.message)
  })

  // ── Event: typing ──
  socket.on('typing', (data: { companyId: string; channel: string; userId: string }) => {
    socket.to(`company:${data.companyId}:chat:${data.channel}`).emit('typing', { userId: data.userId, channel: data.channel })
  })

  // ── Event: pos-event ──
  socket.on('pos-event', (data: { companyId: string; event: any }) => {
    io.to(`company:${data.companyId}:module:pos`).emit('pos-event', data.event)
  })

  // ── Disconnect ──
  socket.on('disconnect', () => {
    const info = socketUsers.get(socket.id)
    if (info) {
      const users = companyUsers.get(info.companyId)
      if (users) {
        users.delete(info.userId)
        if (users.size === 0) companyUsers.delete(info.companyId)
        io.to(`company:${info.companyId}`).emit('presence', {
          userId: info.userId,
          status: 'offline',
          companyOnlineCount: users.size,
        })
      }
      socketUsers.delete(socket.id)
      console.log(`❌ Disconnected: ${socket.id} (user: ${info.userId})`)
    }
  })
})

// ── REST endpoint for API routes to broadcast events ──
io.on('connection', (socket) => {
  // No-op, handled above
})

// Simple HTTP server for REST emit endpoint
const httpServer = io.httpServer
import { createServer } from 'http'

const http = httpServer || createServer()

// Handle POST /emit for API route integration
const originalListeners = http.listeners('request')
http.removeAllListeners('request')

http.on('request', (req, res) => {
  if (req.method === 'POST' && req.url === '/emit') {
    let body = ''
    req.on('data', (chunk: Buffer) => { body += chunk.toString() })
    req.on('end', () => {
      try {
        const { event, rooms, data } = JSON.parse(body)
        if (rooms && Array.isArray(rooms)) {
          rooms.forEach((room: string) => io.to(room).emit(event, data))
        } else {
          io.emit(event, data)
        }
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: true }))
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Invalid JSON' }))
      }
    })
    return
  }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      status: 'ok',
      connections: io.sockets.sockets.size,
      companies: companyUsers.size,
      uptime: process.uptime(),
    }))
    return
  }

  // Restore original listeners
  originalListeners.forEach((listener: any) => listener(req, res))
})

http.listen(PORT, () => {
  console.log(`🚀 Realtime REST API on port ${PORT}`)
})
