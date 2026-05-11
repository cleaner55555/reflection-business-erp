'use client'
import React from 'react'

export const hospitalityModules: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'restaurant': React.lazy(() => import('@/components/modules/Restaurant')),
  'reservations': React.lazy(() => import('@/components/modules/Reservations')),
  'menu': React.lazy(() => import('@/components/modules/Menu')),
  'kitchen': React.lazy(() => import('@/components/modules/Kitchen')),
  'orders': React.lazy(() => import('@/components/modules/Orders')),
}
