// Chunk 9: Services & admin
'use client'
import dynamic from 'next/dynamic'
import React from 'react'
const L = () => <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
const o = { loading: L, ssr: false }
export const c9: Record<string, React.ComponentType> = {
  'time-billing': dynamic(() => import('@/components/modules/TimeBilling'), o),
  'client-portal': dynamic(() => import('@/components/modules/ClientPortal'), o),
  'automation': dynamic(() => import('@/components/modules/Automation'), o),
  'stores': dynamic(() => import('@/components/modules/Stores'), o),
  'backup': dynamic(() => import('@/components/modules/Backup'), o),
}
