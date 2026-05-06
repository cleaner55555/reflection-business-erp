import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type * as Types from './types'
import * as Data from './data'
import { PregledTab, ZaposleniListTab, PlateTab, PrisustvoTab } from './components'

export function Zaposleni() {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('employees.title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t('employees.subtitle')}</p>
      </div>
      <Tabs defaultValue="pregled" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="pregled" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Pregled</span>
          </TabsTrigger>
          <TabsTrigger value="zaposleni" className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('employees.employeeList')}</span>
          </TabsTrigger>
          <TabsTrigger value="plate" className="gap-1.5">
            <DollarSign className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('employees.payroll')}</span>
          </TabsTrigger>
          <TabsTrigger value="prisustvo" className="gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('employees.attendance')}</span>
          </TabsTrigger>
          <TabsTrigger value="organigram" className="gap-1.5">
            <GitBranch className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Organigram</span>
          </TabsTrigger>
          <TabsTrigger value="ocene" className="gap-1.5">
            <Star className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Ocene</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pregled"><PregledTab /></TabsContent>
        <TabsContent value="zaposleni"><ZaposleniListTab /></TabsContent>
        <TabsContent value="plate"><PlateTab /></TabsContent>
        <TabsContent value="prisustvo"><PrisustvoTab /></TabsContent>
        <TabsContent value="organigram"><OrganigramTab /></TabsContent>
        <TabsContent value="ocene"><OceneTab /></TabsContent>
      </Tabs>
    </div>
  )
}