'use client'
import React from 'react'

export const medicalModules: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'patients': React.lazy(() => import('@/components/modules/Patients')),
  'medical-records': React.lazy(() => import('@/components/modules/MedicalRecords')),
  'prescriptions': React.lazy(() => import('@/components/modules/Prescriptions')),
  'lab': React.lazy(() => import('@/components/modules/Lab')),
  'health-fund': React.lazy(() => import('@/components/modules/HealthFund')),
}

export const servicesModules: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'service-center': React.lazy(() => import('@/components/modules/ServiceCenter')),
  'field-service': React.lazy(() => import('@/components/modules/FieldService')),
  'appointments': React.lazy(() => import('@/components/modules/Appointments')),
  'scheduler': React.lazy(() => import('@/components/modules/Scheduler')),
  'compliance': React.lazy(() => import('@/components/modules/Compliance')),
}

export const retailModules: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'stores': React.lazy(() => import('@/components/modules/Stores')),
  'client-portal': React.lazy(() => import('@/components/modules/ClientPortal')),
  'seo': React.lazy(() => import('@/components/modules/SEO')),
  'reviews': React.lazy(() => import('@/components/modules/Reviews')),
  'cms': React.lazy(() => import('@/components/modules/CMS')),
  'geolocation': React.lazy(() => import('@/components/modules/Geolocation')),
  'cameras': React.lazy(() => import('@/components/modules/Cameras')),
  'messaging': React.lazy(() => import('@/components/modules/Messaging')),
}
