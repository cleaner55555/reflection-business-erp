// Chunk 6: Tech & Tools
'use client'
import dynamic from 'next/dynamic'
import React from 'react'
const L = () => <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
const o = { loading: L, ssr: false }
export const c6: Record<string, React.ComponentType> = {
  'cameras': dynamic(() => import('@/components/modules/Cameras'), o),
  'procurement-manager': dynamic(() => import('@/components/modules/ProcurementManager'), o),
  'cms': dynamic(() => import('@/components/modules/CMS'), o),
  'homework': dynamic(() => import('@/components/modules/Homework'), o),
  'enrollment': dynamic(() => import('@/components/modules/Enrollment'), o),
  'timetable': dynamic(() => import('@/components/modules/Timetable'), o),
  'library': dynamic(() => import('@/components/modules/Library'), o),
  'classroom': dynamic(() => import('@/components/modules/Classroom'), o),
  'tuition': dynamic(() => import('@/components/modules/Tuition'), o),
  'patients': dynamic(() => import('@/components/modules/Patients'), o),
  'medical-records': dynamic(() => import('@/components/modules/MedicalRecords'), o),
  'prescriptions': dynamic(() => import('@/components/modules/Prescriptions'), o),
  'lab': dynamic(() => import('@/components/modules/Lab'), o),
  'reservations': dynamic(() => import('@/components/modules/Reservations'), o),
  'menu': dynamic(() => import('@/components/modules/Menu'), o),
}
