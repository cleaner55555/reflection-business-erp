import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HeartHandshake, Users, Activity, TrendingUp, Megaphone, Settings2 } from 'lucide-react'
import type * as Types from './types'
import * as Data from './data'
import { scoreColor, daysUntil, initials, avatarColor, parseTags, PipelineTab, DealDetail, ForecastTab, KontaktiTab, AktivnostiTab, IzvoriTab, AutomacijeTab } from './components'

export function CRM() {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('crm.title')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('crm.subtitle')}</p>
        </div>
      </div>
      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="pipeline" className="gap-1.5"><HeartHandshake className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t('crm.pipeline')}</span></TabsTrigger>
          <TabsTrigger value="kontakti" className="gap-1.5"><Users className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t('crm.contacts')}</span></TabsTrigger>
          <TabsTrigger value="aktivnosti" className="gap-1.5"><Activity className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t('crm.activities')}</span></TabsTrigger>
          <TabsTrigger value="forecast" className="gap-1.5"><TrendingUp className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t('crm.forecast')}</span></TabsTrigger>
          <TabsTrigger value="izvori" className="gap-1.5"><Megaphone className="h-3.5 w-3.5" /><span className="hidden sm:inline">Izvori</span></TabsTrigger>
          <TabsTrigger value="automacije" className="gap-1.5"><Settings2 className="h-3.5 w-3.5" /><span className="hidden sm:inline">Automacije</span></TabsTrigger>
        </TabsList>
        <TabsContent value="pipeline"><PipelineTab /></TabsContent>
        <TabsContent value="kontakti"><KontaktiTab /></TabsContent>
        <TabsContent value="aktivnosti"><AktivnostiTab /></TabsContent>
        <TabsContent value="forecast"><ForecastTab /></TabsContent>
        <TabsContent value="izvori"><IzvoriTab /></TabsContent>
        <TabsContent value="automacije"><AutomacijeTab /></TabsContent>
      </Tabs>
    </div>
  )
}