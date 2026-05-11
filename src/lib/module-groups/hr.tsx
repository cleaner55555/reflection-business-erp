'use client'
import React from 'react'

export const hrModules: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'employees': React.lazy(() => import('@/components/modules/Employees')),
  'recruitment': React.lazy(() => import('@/components/modules/Recruitment')),
  'leave': React.lazy(() => import('@/components/modules/Leave')),
  'skills': React.lazy(() => import('@/components/modules/Skills')),
  'approvals': React.lazy(() => import('@/components/modules/Approvals')),
  'workforce-planner': React.lazy(() => import('@/components/modules/WorkforcePlanner')),
  'visitors': React.lazy(() => import('@/components/modules/Visitors')),
  'suggestions': React.lazy(() => import('@/components/modules/Suggestions')),
  'time-tracking': React.lazy(() => import('@/components/modules/TimeTracking')),
  'time-billing': React.lazy(() => import('@/components/modules/TimeBilling')),
  'gamification': React.lazy(() => import('@/components/modules/Gamification')),
  'signatures': React.lazy(() => import('@/components/modules/Signatures')),
}
