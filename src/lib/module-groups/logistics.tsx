'use client'
import type { ComponentType } from 'react'

export const logisticsModules: Record<string, () => Promise<ComponentType>> = {
  'shipping': () => import('@/components/modules/Shipping').then(m => m.Shipping),
  'fleet': () => import('@/components/modules/Fleet').then(m => m.Fleet),
  'rent-a-car': () => import('@/components/modules/CarRental').then(m => m.CarRental),
  'delivery': () => import('@/components/modules/Delivery').then(m => m.Delivery),
  'routes': () => import('@/components/modules/Routes').then(m => m.Routes),
  'loading-dock': () => import('@/components/modules/LoadingDock').then(m => m.LoadingDock),
  'customs-docs': () => import('@/components/modules/CustomsDocs').then(m => m.CustomsDocs),
  'trucks': () => import('@/components/modules/Trucks').then(m => m.Trucks),
  'packaging': () => import('@/components/modules/Packaging').then(m => m.Packaging),
  'measurements': () => import('@/components/modules/Measurements').then(m => m.Measurements),
  'marketplace': () => import('@/components/modules/Marketplace').then(m => m.Marketplace),
  'ecommerce': () => import('@/components/modules/ECommerce').then(m => m.ECommerce),
}
