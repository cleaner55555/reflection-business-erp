'use client'
import type { ComponentType } from 'react'

export const constructionModules: Record<string, () => Promise<ComponentType>> = {
  'construction-site': () => import('@/components/modules/ConstructionSite').then(m => m.ConstructionSite),
  'blueprints': () => import('@/components/modules/Blueprints').then(m => m.Blueprints),
  'subcontractors': () => import('@/components/modules/Subcontractors').then(m => m.Subcontractors),
  'safety': () => import('@/components/modules/Safety').then(m => m.Safety),
}
