'use client'
import React from 'react'

export const educationModules: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'education': React.lazy(() => import('@/components/modules/Education')),
  'homework': React.lazy(() => import('@/components/modules/Homework')),
  'enrollment': React.lazy(() => import('@/components/modules/Enrollment')),
  'timetable': React.lazy(() => import('@/components/modules/Timetable')),
  'library': React.lazy(() => import('@/components/modules/Library')),
  'classroom': React.lazy(() => import('@/components/modules/Classroom')),
  'tuition': React.lazy(() => import('@/components/modules/Tuition')),
}
