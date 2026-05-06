import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import type * as Types from './types'
import * as Data from './data'
import { MigrationFlow, MigrationGuide } from './components'

export function MigrationWizard() {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <MigrationFlow />
      <MigrationGuide />
    </div>
  )
}