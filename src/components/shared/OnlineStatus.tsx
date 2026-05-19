'use client'

import { useRealtime } from '@/hooks/useRealtime'
import { useAppStore } from '@/lib/store'

export function OnlineStatus({ userId, size = 'sm' }: { userId: string; size?: 'sm' | 'md' }) {
  const activeCompanyId = useAppStore(s => s.activeCompanyId)
  const { onlineUsers } = useRealtime({ companyId: activeCompanyId || undefined })
  const isOnline = onlineUsers.has(userId)

  const sizeClass = size === 'sm' ? 'h-2 w-2' : 'h-3 w-3'

  return (
    <span
      className={`inline-block rounded-full ${sizeClass} ${
        isOnline ? 'bg-emerald-500' : 'bg-muted-foreground/30'
      }`}
      title={isOnline ? 'Online' : 'Offline'}
    />
  )
}
