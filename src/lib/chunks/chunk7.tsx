// Chunk 7: Hospitality, construction & logistics
'use client'
import dynamic from 'next/dynamic'
import React from 'react'
const L = () => <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
const o = { loading: L, ssr: false }
export const c7: Record<string, React.ComponentType> = {
  'kitchen': dynamic(() => import('@/components/modules/Kitchen'), o),
  'orders': dynamic(() => import('@/components/modules/Orders'), o),
  'delivery': dynamic(() => import('@/components/modules/Delivery'), o),
  'construction-site': dynamic(() => import('@/components/modules/ConstructionSite'), o),
  'blueprints': dynamic(() => import('@/components/modules/Blueprints'), o),
  'subcontractors': dynamic(() => import('@/components/modules/Subcontractors'), o),
  'measurements': dynamic(() => import('@/components/modules/Measurements'), o),
  'safety': dynamic(() => import('@/components/modules/Safety'), o),
  'routes': dynamic(() => import('@/components/modules/Routes'), o),
  'loading-dock': dynamic(() => import('@/components/modules/LoadingDock'), o),
  'customs-docs': dynamic(() => import('@/components/modules/CustomsDocs'), o),
  'trucks': dynamic(() => import('@/components/modules/Trucks'), o),
  'packaging': dynamic(() => import('@/components/modules/Packaging'), o),
  'property': dynamic(() => import('@/components/modules/Property'), o),
  'rentals': dynamic(() => import('@/components/modules/Rentals'), o),
}
