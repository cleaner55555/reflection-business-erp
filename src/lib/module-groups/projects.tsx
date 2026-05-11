'use client'
import React from 'react'

export const projectModules: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'projects': React.lazy(() => import('@/components/modules/Projects')),
  'assets': React.lazy(() => import('@/components/modules/Assets')),
  'maintenance': React.lazy(() => import('@/components/modules/Maintenance')),
  'manufacturing': React.lazy(() => import('@/components/modules/Manufacturing')),
  'quality': React.lazy(() => import('@/components/modules/Quality')),
  'protocol': React.lazy(() => import('@/components/modules/Protocol')),
  'plm': React.lazy(() => import('@/components/modules/PLM')),
  'standards': React.lazy(() => import('@/components/modules/Standards')),
  'labels': React.lazy(() => import('@/components/modules/Labels')),
  'barcode': React.lazy(() => import('@/components/modules/Barcode')),
  'tenders': React.lazy(() => import('@/components/modules/Tenders')),
  'warranty': React.lazy(() => import('@/components/modules/Warranty')),
}
