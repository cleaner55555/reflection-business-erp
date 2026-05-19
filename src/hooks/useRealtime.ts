'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

interface UseRealtimeOptions {
  companyId?: string
  userId?: string
  autoConnect?: boolean
}

interface UseRealtimeReturn {
  connected: boolean
  emit: (event: string, data: any) => void
  on: (event: string, handler: (...args: any[]) => void) => void
  off: (event: string, handler: (...args: any[]) => void) => void
  join: (room: string) => void
  leave: (room: string) => void
  onlineUsers: Set<string>
}

export function useRealtime(options: UseRealtimeOptions = {}): UseRealtimeReturn {
  const { companyId, userId, autoConnect = true } = options
  const socketRef = useRef<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!autoConnect) return

    const socket = io('/?XTransformPort=3004', {
      transports: ['websocket', 'polling'],
      auth: { companyId, userId },
      query: { companyId, userId },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    })

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    socket.on('presence', (data: { userId: string; status: string }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev)
        if (data.status === 'online') next.add(data.userId)
        else next.delete(data.userId)
        return next
      })
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
      socketRef.current = null
      setConnected(false)
    }
  }, [companyId, userId, autoConnect])

  const emit = useCallback((event: string, data: any) => {
    socketRef.current?.emit(event, data)
  }, [])

  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    socketRef.current?.on(event, handler)
  }, [])

  const off = useCallback((event: string, handler: (...args: any[]) => void) => {
    socketRef.current?.off(event, handler)
  }, [])

  const join = useCallback((room: string) => {
    socketRef.current?.join(room)
  }, [])

  const leave = useCallback((room: string) => {
    socketRef.current?.leave(room)
  }, [])

  return { connected, emit, on, off, join, leave, onlineUsers }
}
