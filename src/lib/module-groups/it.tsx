'use client'
import React from 'react'

export const itModules: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'chat': React.lazy(() => import('@/components/modules/Chat')),
  'knowledge-base': React.lazy(() => import('@/components/modules/KnowledgeBase')),
  'website': React.lazy(() => import('@/components/modules/WebsiteBuilder')),
  'blog': React.lazy(() => import('@/components/modules/Blog')),
  'forum': React.lazy(() => import('@/components/modules/Forum')),
  'spreadsheet': React.lazy(() => import('@/components/modules/Spreadsheet')),
  'notes': React.lazy(() => import('@/components/modules/Notes')),
  'integrations': React.lazy(() => import('@/components/modules/Integracije')),
  'backup': React.lazy(() => import('@/components/modules/Backup')),
  'laws': React.lazy(() => import('@/components/modules/Laws')),
  'iot': React.lazy(() => import('@/components/modules/IoT')),
  'voip': React.lazy(() => import('@/components/modules/VoIP')),
}
