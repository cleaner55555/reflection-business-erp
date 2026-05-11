'use client'
import React from 'react'

export const constructionModules: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'construction-site': React.lazy(() => import('@/components/modules/ConstructionSite')),
  'blueprints': React.lazy(() => import('@/components/modules/Blueprints')),
  'subcontractors': React.lazy(() => import('@/components/modules/Subcontractors')),
  'safety': React.lazy(() => import('@/components/modules/Safety')),
}
