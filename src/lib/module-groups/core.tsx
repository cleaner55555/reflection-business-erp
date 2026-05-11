'use client'
import type { ComponentType } from 'react'

export const coreModules: Record<string, () => Promise<ComponentType>> = {
  'dashboard': () => import('@/components/modules/Dashboard').then(m => m.Dashboard),
  'finance': () => import('@/components/modules/Finance').then(m => m.Finance),
  'invoices': () => import('@/components/modules/Invoices').then(m => m.Invoices),
  'inventory': () => import('@/components/modules/Inventory').then(m => m.Inventory),
  'contacts': () => import('@/components/modules/Contacts').then(m => m.Contacts),
  'reports': () => import('@/components/modules/Reports').then(m => m.Reports),
  'settings': () => import('@/components/modules/Settings').then(m => m.Settings),
  'calendar': () => import('@/components/modules/Calendar').then(m => m.Calendar),
  'documents': () => import('@/components/modules/Documents').then(m => m.Documents),
  'offers': () => import('@/components/modules/Offers').then(m => m.Offers),
  'expenses': () => import('@/components/modules/Expenses').then(m => m.Expenses),
  'automation': () => import('@/components/modules/Automation').then(m => m.Automation),
}
