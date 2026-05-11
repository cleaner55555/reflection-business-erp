'use client'
import type { ComponentType } from 'react'

export const hospitalityModules: Record<string, () => Promise<ComponentType>> = {
  'restaurant': () => import('@/components/modules/Restaurant').then(m => m.Restaurant),
  'reservations': () => import('@/components/modules/Reservations').then(m => m.Reservations),
  'menu': () => import('@/components/modules/Menu').then(m => m.Menu),
  'kitchen': () => import('@/components/modules/Kitchen').then(m => m.Kitchen),
  'orders': () => import('@/components/modules/Orders').then(m => m.Orders),
}
