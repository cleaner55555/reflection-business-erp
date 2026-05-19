'use client'

import { useState, useEffect } from 'react'
import { useRealtime } from '@/hooks/useRealtime'
import { useAppStore } from '@/lib/store'

export function TypingIndicator({ channel }: { channel: string }) {
  const activeCompanyId = useAppStore(s => s.activeCompanyId)
  const { on, off } = useRealtime({ companyId: activeCompanyId || undefined })
  const [typingUser, setTypingUser] = useState<string | null>(null)

  useEffect(() => {
    const handler = (data: { userId: string; channel: string }) => {
      if (data.channel === channel) {
        setTypingUser(data.userId)
        setTimeout(() => setTypingUser(null), 3000)
      }
    }
    on('typing', handler)
    return () => { off('typing', handler) }
  }, [channel, on, off])

  if (!typingUser) return null

  return (
    <span className="text-xs text-muted-foreground italic animate-pulse">
      {typingUser} kucá...
    </span>
  )
}
