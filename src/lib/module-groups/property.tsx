'use client'
import React from 'react'

export const propertyModules: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'property': React.lazy(() => import('@/components/modules/Property')),
  'rentals': React.lazy(() => import('@/components/modules/Rentals')),
  'property-viewings': React.lazy(() => import('@/components/modules/PropertyViewings')),
  'utilities': React.lazy(() => import('@/components/modules/Utilities')),
  'work-orders': React.lazy(() => import('@/components/modules/WorkOrders')),
  'valuation': React.lazy(() => import('@/components/modules/Valuation')),
}
