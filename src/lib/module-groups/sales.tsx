'use client'
import React from 'react'

export const salesModules: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'crm': React.lazy(() => import('@/components/modules/CRM')),
  'support': React.lazy(() => import('@/components/modules/Support')),
  'email-marketing': React.lazy(() => import('@/components/modules/EmailMarketing')),
  'sms-marketing': React.lazy(() => import('@/components/modules/SmsMarketing')),
  'social-media': React.lazy(() => import('@/components/modules/SocialMedia')),
  'marketing-automation': React.lazy(() => import('@/components/modules/MarketingAutomation')),
  'surveys': React.lazy(() => import('@/components/modules/Surveys')),
  'events': React.lazy(() => import('@/components/modules/Events')),
  'loyalty': React.lazy(() => import('@/components/modules/Loyalty')),
  'ratings': React.lazy(() => import('@/components/modules/Ratings')),
  'referrals': React.lazy(() => import('@/components/modules/Referrals')),
  'complaints': React.lazy(() => import('@/components/modules/Complaints')),
}
