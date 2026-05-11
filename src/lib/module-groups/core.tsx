'use client'
import React from 'react'

export const coreModules: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'dashboard': React.lazy(() => import('@/components/modules/Dashboard')),
  'finance': React.lazy(() => import('@/components/modules/Finance')),
  'invoices': React.lazy(() => import('@/components/modules/Invoices')),
  'inventory': React.lazy(() => import('@/components/modules/Inventory')),
  'contacts': React.lazy(() => import('@/components/modules/Contacts')),
  'reports': React.lazy(() => import('@/components/modules/Reports')),
  'settings': React.lazy(() => import('@/components/modules/Settings')),
  'calendar': React.lazy(() => import('@/components/modules/Calendar')),
  'documents': React.lazy(() => import('@/components/modules/Documents')),
  'offers': React.lazy(() => import('@/components/modules/Offers')),
  'expenses': React.lazy(() => import('@/components/modules/Expenses')),
  'automation': React.lazy(() => import('@/components/modules/Automation')),
}
