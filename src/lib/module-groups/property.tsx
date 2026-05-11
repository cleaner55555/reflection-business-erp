'use client'
import type { ComponentType } from 'react'

export const propertyModules: Record<string, () => Promise<ComponentType>> = {
  'property': () => import('@/components/modules/Property').then(m => m.Property),
  'rentals': () => import('@/components/modules/Rentals').then(m => m.Rentals),
  'property-viewings': () => import('@/components/modules/PropertyViewings').then(m => m.PropertyViewings),
  'utilities': () => import('@/components/modules/Utilities').then(m => m.Utilities),
  'work-orders': () => import('@/components/modules/WorkOrders').then(m => m.WorkOrders),
  'valuation': () => import('@/components/modules/Valuation').then(m => m.Valuation),
}
