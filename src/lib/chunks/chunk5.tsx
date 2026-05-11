// Chunk 5: Management & CRM
'use client'
import dynamic from 'next/dynamic'
import React from 'react'
const L = () => <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
const o = { loading: L, ssr: false }
export const c5: Record<string, React.ComponentType> = {
  'contracts': dynamic(() => import('@/components/modules/Contracts'), o),
  'ratings': dynamic(() => import('@/components/modules/Ratings'), o),
  'gamification': dynamic(() => import('@/components/modules/Gamification'), o),
  'complaints': dynamic(() => import('@/components/modules/Complaints'), o),
  'tenders': dynamic(() => import('@/components/modules/Tenders'), o),
  'warranty': dynamic(() => import('@/components/modules/Warranty'), o),
  'service-center': dynamic(() => import('@/components/modules/ServiceCenter'), o),
  'compliance': dynamic(() => import('@/components/modules/Compliance'), o),
  'loyalty': dynamic(() => import('@/components/modules/Loyalty'), o),
  'workforce-planner': dynamic(() => import('@/components/modules/WorkforcePlanner'), o),
  'visitors': dynamic(() => import('@/components/modules/Visitors'), o),
  'suggestions': dynamic(() => import('@/components/modules/Suggestions'), o),
  'valuation': dynamic(() => import('@/components/modules/Valuation'), o),
  'health-fund': dynamic(() => import('@/components/modules/HealthFund'), o),
  'geolocation': dynamic(() => import('@/components/modules/Geolocation'), o),
}
