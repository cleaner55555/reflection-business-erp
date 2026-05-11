'use client'
import type { ComponentType } from 'react'

export const educationModules: Record<string, () => Promise<ComponentType>> = {
  'education': () => import('@/components/modules/Education').then(m => m.Education),
  'homework': () => import('@/components/modules/Homework').then(m => m.Homework),
  'enrollment': () => import('@/components/modules/Enrollment').then(m => m.Enrollment),
  'timetable': () => import('@/components/modules/Timetable').then(m => m.Timetable),
  'library': () => import('@/components/modules/Library').then(m => m.Library),
  'classroom': () => import('@/components/modules/Classroom').then(m => m.Classroom),
  'tuition': () => import('@/components/modules/Tuition').then(m => m.Tuition),
}
