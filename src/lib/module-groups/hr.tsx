'use client'
import type { ComponentType } from 'react'

export const hrModules: Record<string, () => Promise<ComponentType>> = {
  'employees': () => import('@/components/modules/Employees').then(m => m.Employees),
  'recruitment': () => import('@/components/modules/Recruitment').then(m => m.Recruitment),
  'leave': () => import('@/components/modules/Leave').then(m => m.Leave),
  'skills': () => import('@/components/modules/Skills').then(m => m.Skills),
  'approvals': () => import('@/components/modules/Approvals').then(m => m.Approvals),
  'workforce-planner': () => import('@/components/modules/WorkforcePlanner').then(m => m.WorkforcePlanner),
  'visitors': () => import('@/components/modules/Visitors').then(m => m.Visitors),
  'suggestions': () => import('@/components/modules/Suggestions').then(m => m.Suggestions),
  'time-tracking': () => import('@/components/modules/TimeTracking').then(m => m.TimeTracking),
  'time-billing': () => import('@/components/modules/TimeBilling').then(m => m.TimeBilling),
  'gamification': () => import('@/components/modules/Gamification').then(m => m.Gamification),
  'signatures': () => import('@/components/modules/Signatures').then(m => m.Signatures),
}
