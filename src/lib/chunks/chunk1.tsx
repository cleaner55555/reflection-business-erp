// Chunk 1: Core business modules
'use client'
import dynamic from 'next/dynamic'
import React from 'react'
const L = () => <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
const o = { loading: L, ssr: false }
export const c1: Record<string, React.ComponentType> = {
  'dashboard': dynamic(() => import('@/components/modules/Dashboard'), o),
  'finance': dynamic(() => import('@/components/modules/Finance'), o),
  'invoices': dynamic(() => import('@/components/modules/Invoices'), o),
  'inventory': dynamic(() => import('@/components/modules/Inventory'), o),
  'contacts': dynamic(() => import('@/components/modules/Contacts'), o),
  'procurement': dynamic(() => import('@/components/modules/Procurement'), o),
  'reports': dynamic(() => import('@/components/modules/Reports'), o),
  'crm': dynamic(() => import('@/components/modules/CRM'), o),
  'calendar': dynamic(() => import('@/components/modules/Calendar'), o),
  'employees': dynamic(() => import('@/components/modules/Employees'), o),
  'projects': dynamic(() => import('@/components/modules/Projects'), o),
  'assets': dynamic(() => import('@/components/modules/Assets'), o),
  'documents': dynamic(() => import('@/components/modules/Documents'), o),
  'accounting': dynamic(() => import('@/components/modules/Accounting'), o),
  'settings': dynamic(() => import('@/components/modules/Settings'), o),
}
