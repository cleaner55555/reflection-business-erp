'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
import {
import { motion } from 'framer-motion'
import {
import { formatRSD, formatRSDShort, formatDate, formatDateTime, getStatusLabel, getStatusColor, getMonthLabel } from '@/lib/helpers'
import { useTranslation, useContentTranslation } from '@/lib/i18n'
import { useAppStore, type ModuleType } from '@/lib/store'

import { useDashboard } from './hooks'

export function Dashboard() {
  const {0, 3, 50, 8, 80, container, groupedActivity, i, item, kpiCards, lowStock, monthlyRevenueChart, pieData, quickActions, recentInvoices} = useDashboard()
  return (
    <motion.div
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t('dashboard.subtitle')}
        </p>
      </motion.div>

      {/* Quick Actions Row */}
      <motion.div variants={item}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.module}
              variant="outline"
              className={`h-auto flex flex-col items-center gap-2 py-4 px-3 rounded-xl border transition-all duration-200 cursor-pointer ${action.bg}`}
              onClick={() => setActiveModule(action.module)}
            >
              <div className={`rounded-lg p-2 ${action.iconBg}`}>
                <action.icon className={`h-5 w-5 ${action.color}`} />
              </div>
              <span className={`text-xs font-medium ${action.color}`}>{t(action.labelKey)}</span>
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Alerts Summary Bar */}
      <motion.div variants={item}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-full bg-red-100 p-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('dashboard.overdueCount')}</p>
                <p className="text-lg font-bold text-red-600">{data.overdueCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-full bg-amber-100 p-2">
                <BoxIcon className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('dashboard.lowStockCount')}</p>
                <p className="text-lg font-bold text-amber-600">{kpis.lowStockProducts}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-full bg-orange-100 p-2">
                <DollarSign className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('dashboard.unpaidAmount')}</p>
                <p className="text-lg font-bold text-orange-600">{formatRSD(kpis.unpaidInvoiceAmount)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-sky-500">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-full bg-sky-100 p-2">
                <Users className="h-4 w-4 text-sky-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('dashboard.newPartnersMonth')}</p>
                <p className="text-lg font-bold text-sky-600">{data.newPartnersThisMonth}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Today's Tasks + Activity Feed */}
        <TodaystasksactivityfeedSection groupedActivity={groupedActivity} item={item} />
      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1 min-w-0">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider truncate">
                    {kpi.title}
                  </p>
                  <p className="text-lg font-bold truncate">{kpi.value}</p>
                  {kpi.change !== null && (
                    <div className="flex items-center gap-1">
                      {kpi.change >= 0 ? (
                        <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-red-600" />
                      )}
                      <span
                        className={`text-[10px] font-medium ${
                          kpi.change >= 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {Math.abs(kpi.change).toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-muted-foreground">{t('dashboard.fromLastMonth')}</span>
                    </div>
                  )}
                  {(kpi as { subtitle?: string }).subtitle && (
                    <p className="text-[10px] text-muted-foreground">{(kpi as { subtitle: string }).subtitle}</p>
                  )}
                </div>
                <div className={`rounded-xl p-2.5 ${kpi.iconBg}`}>
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Charts Row */}
        <ChartsrowSection 0={0} 3={3} 50={50} 8={8} 80={80} false={false} item={item} monthlyRevenueChart={monthlyRevenueChart} pieData={pieData} />
        <BottomrowSection i={i} item={item} lowStock={lowStock} recentInvoices={recentInvoices} />
        </Card>
      </div>
    </div>
  )
}
