// Chunk 8: Real estate, retail & services
'use client'
import dynamic from 'next/dynamic'
import React from 'react'
const L = () => <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
const o = { loading: L, ssr: false }
export const c8: Record<string, React.ComponentType> = {
  'property-viewings': dynamic(() => import('@/components/modules/PropertyViewings'), o),
  'utilities': dynamic(() => import('@/components/modules/Utilities'), o),
  'work-orders': dynamic(() => import('@/components/modules/WorkOrders'), o),
  'standards': dynamic(() => import('@/components/modules/Standards'), o),
  'labels': dynamic(() => import('@/components/modules/Labels'), o),
  'barcode': dynamic(() => import('@/components/modules/Barcode'), o),
  'price-lists': dynamic(() => import('@/components/modules/PriceLists'), o),
  'coupons': dynamic(() => import('@/components/modules/Coupons'), o),
  'reviews': dynamic(() => import('@/components/modules/Reviews'), o),
  'seo': dynamic(() => import('@/components/modules/SEO'), o),
  'payments': dynamic(() => import('@/components/modules/Payments'), o),
  'returns': dynamic(() => import('@/components/modules/Returns'), o),
  'cash-register': dynamic(() => import('@/components/modules/CashRegister'), o),
  'time-tracking': dynamic(() => import('@/components/modules/TimeTracking'), o),
}
