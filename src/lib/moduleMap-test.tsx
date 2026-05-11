'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'

function ModuleLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Učitavanje modula...</p>
      </div>
    </div>
  )
}

export function ModuleRenderer({ moduleKey }: { moduleKey: string }) {
  const [ModuleComponent, setModuleComponent] = React.useState<React.ComponentType | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!moduleKey) return
    const importFn = () => import('@/components/modules/Dashboard')
    importFn().then((mod) => {
      setModuleComponent(() => mod.default)
    }).catch(() => {
      setError(`Modul "${moduleKey}" nije pronađen`)
    })
  }, [moduleKey])

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3 text-destructive">
          <p className="text-sm font-medium">{error}</p>
        </div>
      </div>
    )
  }

  if (!ModuleComponent) {
    return <ModuleLoader />
  }

  return <ModuleComponent />
}
