'use client'
import type { ComponentType } from 'react'

export const medicalModules: Record<string, () => Promise<ComponentType>> = {
  'patients': () => import('@/components/modules/Patients').then(m => m.Patients),
  'medical-records': () => import('@/components/modules/MedicalRecords').then(m => m.MedicalRecords),
  'prescriptions': () => import('@/components/modules/Prescriptions').then(m => m.Prescriptions),
  'lab': () => import('@/components/modules/Lab').then(m => m.Lab),
  'health-fund': () => import('@/components/modules/HealthFund').then(m => m.HealthFund),
}

export const servicesModules: Record<string, () => Promise<ComponentType>> = {
  'service-center': () => import('@/components/modules/ServiceCenter').then(m => m.ServiceCenter),
  'field-service': () => import('@/components/modules/FieldService').then(m => m.FieldService),
  'appointments': () => import('@/components/modules/Appointments').then(m => m.Appointments),
  'scheduler': () => import('@/components/modules/Scheduler').then(m => m.Scheduler),
  'compliance': () => import('@/components/modules/Compliance').then(m => m.Compliance),
}

export const retailModules: Record<string, () => Promise<ComponentType>> = {
  'stores': () => import('@/components/modules/Stores').then(m => m.Stores),
  'client-portal': () => import('@/components/modules/ClientPortal').then(m => m.ClientPortal),
  'seo': () => import('@/components/modules/SEO').then(m => m.SEO),
  'reviews': () => import('@/components/modules/Reviews').then(m => m.Reviews),
  'cms': () => import('@/components/modules/CMS').then(m => m.CMS),
  'geolocation': () => import('@/components/modules/Geolocation').then(m => m.Geolocation),
  'cameras': () => import('@/components/modules/Cameras').then(m => m.Cameras),
  'messaging': () => import('@/components/modules/Messaging').then(m => m.Messaging),
}
