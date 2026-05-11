// Chunk 2: Operations & logistics
'use client'
import dynamic from 'next/dynamic'
import React from 'react'
const L = () => <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
const o = { loading: L, ssr: false }
export const c2: Record<string, React.ComponentType> = {
  'protocol': dynamic(() => import('@/components/modules/Protocol'), o),
  'education': dynamic(() => import('@/components/modules/Education'), o),
  'fleet': dynamic(() => import('@/components/modules/Fleet'), o),
  'restaurant': dynamic(() => import('@/components/modules/Restaurant'), o),
  'email-marketing': dynamic(() => import('@/components/modules/EmailMarketing'), o),
  'rent-a-car': dynamic(() => import('@/components/modules/CarRental'), o),
  'integrations': dynamic(() => import('@/components/modules/Integracije'), o),
  'bank-sync': dynamic(() => import('@/components/modules/BankSync'), o),
  'laws': dynamic(() => import('@/components/modules/Laws'), o),
  'pos': dynamic(() => import('@/components/modules/Retail'), o),
  'shipping': dynamic(() => import('@/components/modules/Shipping'), o),
  'marketplace': dynamic(() => import('@/components/modules/Marketplace'), o),
  'offers': dynamic(() => import('@/components/modules/Offers'), o),
  'subscriptions': dynamic(() => import('@/components/modules/Subscriptions'), o),
  'expenses': dynamic(() => import('@/components/modules/Expenses'), o),
}
