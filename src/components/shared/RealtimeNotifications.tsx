'use client'

import { useRealtime } from '@/hooks/useRealtime'
import { useAppStore } from '@/lib/store'
import { useEffect } from 'react'
import { toast } from 'sonner'

export function RealtimeNotifications() {
  const activeCompanyId = useAppStore(s => s.activeCompanyId)
  const currentUser = useAppStore(s => s.currentUser)

  const { on, off } = useRealtime({
    companyId: activeCompanyId || undefined,
    userId: currentUser?.id,
  })

  useEffect(() => {
    const handler = (data: any) => {
      if (data?.title) {
        toast(data.title, { description: data.body || data.message })
      }
    }
    on('notification', handler)
    return () => { off('notification', handler) }
  }, [on, off])

  return null // Invisible component
}
