'use client'
import type { ComponentType } from 'react'

export const projectModules: Record<string, () => Promise<ComponentType>> = {
  'projects': () => import('@/components/modules/Projects').then(m => m.Projects),
  'assets': () => import('@/components/modules/Assets').then(m => m.Assets),
  'maintenance': () => import('@/components/modules/Maintenance').then(m => m.Maintenance),
  'manufacturing': () => import('@/components/modules/Manufacturing').then(m => m.Manufacturing),
  'quality': () => import('@/components/modules/Quality').then(m => m.Quality),
  'protocol': () => import('@/components/modules/Protocol').then(m => m.Protocol),
  'plm': () => import('@/components/modules/PLM').then(m => m.PLM),
  'standards': () => import('@/components/modules/Standards').then(m => m.Standards),
  'labels': () => import('@/components/modules/Labels').then(m => m.Labels),
  'barcode': () => import('@/components/modules/Barcode').then(m => m.Barcode),
  'tenders': () => import('@/components/modules/Tenders').then(m => m.Tenders),
  'warranty': () => import('@/components/modules/Warranty').then(m => m.Warranty),
}
