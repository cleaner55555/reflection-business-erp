'use client'
import React from 'react'

export const logisticsModules: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'shipping': React.lazy(() => import('@/components/modules/Shipping')),
  'fleet': React.lazy(() => import('@/components/modules/Fleet')),
  'rent-a-car': React.lazy(() => import('@/components/modules/CarRental')),
  'delivery': React.lazy(() => import('@/components/modules/Delivery')),
  'routes': React.lazy(() => import('@/components/modules/Routes')),
  'loading-dock': React.lazy(() => import('@/components/modules/LoadingDock')),
  'customs-docs': React.lazy(() => import('@/components/modules/CustomsDocs')),
  'trucks': React.lazy(() => import('@/components/modules/Trucks')),
  'packaging': React.lazy(() => import('@/components/modules/Packaging')),
  'measurements': React.lazy(() => import('@/components/modules/Measurements')),
  'marketplace': React.lazy(() => import('@/components/modules/Marketplace')),
  'ecommerce': React.lazy(() => import('@/components/modules/ECommerce')),
}
