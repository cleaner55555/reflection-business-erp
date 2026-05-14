'use client'
import type { ComponentType } from 'react'

export const itModules: Record<string, () => Promise<ComponentType>> = {
  'chat': () => import('@/components/modules/Chat').then(m => m.Chat),
  'knowledge-base': () => import('@/components/modules/KnowledgeBase').then(m => m.KnowledgeBase),
  'website': () => import('@/components/modules/WebsiteBuilder').then(m => m.WebsiteBuilder),
  'blog': () => import('@/components/modules/Blog').then(m => m.Blog),
  'forum': () => import('@/components/modules/Forum').then(m => m.Forum),
  'spreadsheet': () => import('@/components/modules/Spreadsheet').then(m => m.Spreadsheet),
  'notes': () => import('@/components/modules/Notes').then(m => m.Notes),
  'integrations': () => import('@/components/modules/Integracije').then(m => m.Integrations),
  'backup': () => import('@/components/modules/Backup').then(m => m.Backup),
  'laws': () => import('@/components/modules/Laws').then(m => m.Laws),
  'iot': () => import('@/components/modules/IoT').then(m => m.IoT),
  'voip': () => import('@/components/modules/VoIP').then(m => m.VoIP),
}
