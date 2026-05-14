'use client'
import type { ComponentType } from 'react'

export const salesModules: Record<string, () => Promise<ComponentType>> = {
  'crm': () => import('@/components/modules/CRM').then(m => m.CRM),
  'support': () => import('@/components/modules/Support').then(m => m.Support),
  'email-marketing': () => import('@/components/modules/EmailMarketing').then(m => m.MailerLite),
  'sms-marketing': () => import('@/components/modules/SmsMarketing').then(m => m.SmsMarketing),
  'social-media': () => import('@/components/modules/SocialMedia').then(m => m.SocialMedia),
  'marketing-automation': () => import('@/components/modules/MarketingAutomation').then(m => m.MarketingAutomation),
  'surveys': () => import('@/components/modules/Surveys').then(m => m.Surveys),
  'events': () => import('@/components/modules/Events').then(m => m.Events),
  'loyalty': () => import('@/components/modules/Loyalty').then(m => m.Loyalty),
  'ratings': () => import('@/components/modules/Ratings').then(m => m.Ratings),
  'referrals': () => import('@/components/modules/Referrals').then(m => m.Referrals),
  'complaints': () => import('@/components/modules/Complaints').then(m => m.Complaints),
}
