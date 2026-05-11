// Chunk 4: Communication & Knowledge
'use client'
import dynamic from 'next/dynamic'
import React from 'react'
const L = () => <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
const o = { loading: L, ssr: false }
export const c4: Record<string, React.ComponentType> = {
  'surveys': dynamic(() => import('@/components/modules/Surveys'), o),
  'chat': dynamic(() => import('@/components/modules/Chat'), o),
  'knowledge-base': dynamic(() => import('@/components/modules/KnowledgeBase'), o),
  'website': dynamic(() => import('@/components/modules/WebsiteBuilder'), o),
  'blog': dynamic(() => import('@/components/modules/Blog'), o),
  'voip': dynamic(() => import('@/components/modules/VoIP'), o),
  'iot': dynamic(() => import('@/components/modules/IoT'), o),
  'messaging': dynamic(() => import('@/components/modules/Messaging'), o),
  'forum': dynamic(() => import('@/components/modules/Forum'), o),
  'plm': dynamic(() => import('@/components/modules/PLM'), o),
  'ecommerce': dynamic(() => import('@/components/modules/ECommerce'), o),
  'spreadsheet': dynamic(() => import('@/components/modules/Spreadsheet'), o),
  'notes': dynamic(() => import('@/components/modules/Notes'), o),
  'approvals': dynamic(() => import('@/components/modules/Approvals'), o),
  'skills': dynamic(() => import('@/components/modules/Skills'), o),
}
