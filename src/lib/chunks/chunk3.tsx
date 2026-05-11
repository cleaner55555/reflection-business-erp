// Chunk 3: Production & HR
'use client'
import dynamic from 'next/dynamic'
import React from 'react'
const L = () => <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
const o = { loading: L, ssr: false }
export const c3: Record<string, React.ComponentType> = {
  'signatures': dynamic(() => import('@/components/modules/Signatures'), o),
  'manufacturing': dynamic(() => import('@/components/modules/Manufacturing'), o),
  'quality': dynamic(() => import('@/components/modules/Quality'), o),
  'maintenance': dynamic(() => import('@/components/modules/Maintenance'), o),
  'recruitment': dynamic(() => import('@/components/modules/Recruitment'), o),
  'leave': dynamic(() => import('@/components/modules/Leave'), o),
  'referrals': dynamic(() => import('@/components/modules/Referrals'), o),
  'support': dynamic(() => import('@/components/modules/Support'), o),
  'field-service': dynamic(() => import('@/components/modules/FieldService'), o),
  'appointments': dynamic(() => import('@/components/modules/Appointments'), o),
  'scheduler': dynamic(() => import('@/components/modules/Scheduler'), o),
  'social-media': dynamic(() => import('@/components/modules/SocialMedia'), o),
  'sms-marketing': dynamic(() => import('@/components/modules/SmsMarketing'), o),
  'events': dynamic(() => import('@/components/modules/Events'), o),
  'marketing-automation': dynamic(() => import('@/components/modules/MarketingAutomation'), o),
}
