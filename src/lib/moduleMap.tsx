// Lazy ModuleRenderer - loads module group files on demand
// Each group file contains loader functions for named exports, keeping the bundler happy

'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import type { ComponentType } from 'react'
import { moduleGroupMap } from './module-groups/index'

const Loader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-sm text-muted-foreground">Učitavanje modula...</p>
    </div>
  </div>
)

type ModuleMap = Record<string, () => Promise<ComponentType>>

// Cache for loaded module groups
const groupCache = new Map<string, ModuleMap>()

const groupLoaders: Record<string, () => Promise<ModuleMap>> = {
  core: () => import('./module-groups/core').then(m => m.coreModules),
  hr: () => import('./module-groups/hr').then(m => m.hrModules),
  finance: () => import('./module-groups/finance').then(m => m.financeModules),
  sales: () => import('./module-groups/sales').then(m => m.salesModules),
  projects: () => import('./module-groups/projects').then(m => m.projectModules),
  it: () => import('./module-groups/it').then(m => m.itModules),
  logistics: () => import('./module-groups/logistics').then(m => m.logisticsModules),
  education: () => import('./module-groups/education').then(m => m.educationModules),
  hospitality: () => import('./module-groups/hospitality').then(m => m.hospitalityModules),
  construction: () => import('./module-groups/construction').then(m => m.constructionModules),
  property: () => import('./module-groups/property').then(m => m.propertyModules),
  medical: () => import('./module-groups/other').then(m => m.medicalModules),
  services: () => import('./module-groups/other').then(m => m.servicesModules),
  retail: () => import('./module-groups/other').then(m => m.retailModules),
}

export function ModuleRenderer({ moduleKey }: { moduleKey: string }) {
  const [Component, setComponent] = useState<ComponentType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const loadModule = useCallback(async (key: string) => {
    setComponent(null)
    setError(null)
    setLoading(true)

    try {
      const groupName = moduleGroupMap[key]
      if (!groupName) {
        setError(`Modul "${key}" nije pronađen`)
        setLoading(false)
        return
      }

      let groupModules = groupCache.get(groupName)

      if (!groupModules) {
        const loader = groupLoaders[groupName]
        if (!loader) {
          setError(`Grupa "${groupName}" nije pronađena`)
          setLoading(false)
          return
        }
        groupModules = await loader()
        groupCache.set(groupName, groupModules)
      }

      const moduleLoader = groupModules[key]
      if (!moduleLoader) {
        setError(`Modul "${key}" nije pronađen u grupi`)
        setLoading(false)
        return
      }

      // Call the loader function to resolve the named export
      const Mod = await moduleLoader()
      setComponent(() => Mod)
      setLoading(false)
    } catch (err) {
      console.error(`Failed to load module "${key}":`, err)
      setError(`Greška učitavanja: ${key}`)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadModule(moduleKey)
  }, [moduleKey, loadModule])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="rounded-full bg-destructive/10 p-3">
          <svg className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-sm text-destructive font-medium">{error}</p>
        <button
          onClick={() => loadModule(moduleKey)}
          className="text-xs text-primary hover:underline"
        >
          Pokušaj ponovo
        </button>
      </div>
    )
  }

  if (loading || !Component) return <Loader />

  return (
    <Suspense fallback={<Loader />}>
      <Component />
    </Suspense>
  )
}
