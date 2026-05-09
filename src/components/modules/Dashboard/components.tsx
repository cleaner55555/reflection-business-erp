'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/helpers'
import type { ReactNode } from 'react'

// ============ KPI CARD (shadcn-admin style) ============
export function KPICard({
  title,
  value,
  subtitle,
  change,
  icon,
  iconBg = 'bg-muted',
  sparkline,
}: {
  title: string
  value: string
  subtitle?: string
  change?: number | null
  icon: ReactNode
  iconBg?: string
  iconColor?: string
  sparkline?: number[]
}) {
  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground truncate">{title}</CardTitle>
        <div className={cn('rounded-md p-2 shrink-0', iconBg)}>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="text-2xl font-bold tracking-tight truncate leading-none">{value}</div>
            {change !== null && change !== undefined && (
              <p className={cn('text-xs mt-1', change >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                {change >= 0 ? '+' : ''}{Math.abs(change).toFixed(1)}% od prošlog meseca
              </p>
            )}
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1 truncate">{subtitle}</p>
            )}
          </div>
          {sparkline && sparkline.length > 1 && (
            <Sparkline data={sparkline} color={change && change >= 0 ? '#059669' : '#dc2626'} />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ============ ALERT BADGE ============
export function AlertCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: string | number
  icon: ReactNode
  color: 'red' | 'amber' | 'orange' | 'sky' | 'emerald' | 'violet'
}) {
  const colorMap = {
    red: { bg: 'bg-red-50 dark:bg-red-950/50', text: 'text-red-700 dark:text-red-400', icon: 'text-red-500' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-950/50', text: 'text-amber-700 dark:text-amber-400', icon: 'text-amber-500' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-950/50', text: 'text-orange-700 dark:text-orange-400', icon: 'text-orange-500' },
    sky: { bg: 'bg-sky-50 dark:bg-sky-950/50', text: 'text-sky-700 dark:text-sky-400', icon: 'text-sky-500' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/50', text: 'text-emerald-700 dark:text-emerald-400', icon: 'text-emerald-500' },
    violet: { bg: 'bg-violet-50 dark:bg-violet-950/50', text: 'text-violet-700 dark:text-violet-400', icon: 'text-violet-500' },
  }
  const c = colorMap[color]
  return (
    <Card className={cn('hover:shadow-sm transition-shadow', c.bg)}>
      <CardContent className="p-4 flex items-center gap-3 min-w-0">
        <div className={cn('shrink-0', c.icon)}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          <p className={cn('text-2xl font-bold tabular-nums truncate leading-tight', c.text)}>{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ============ SECTION CARD WRAPPER ============
export function SectionCard({
  title,
  subtitle,
  icon,
  children,
  action,
  className,
}: {
  title: string
  subtitle?: string
  icon?: ReactNode
  children: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <Card className={cn('hover:shadow-sm transition-shadow', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && <div className="shrink-0">{icon}</div>}
            <div className="min-w-0">
              <CardTitle className="text-sm font-semibold tracking-tight truncate">{title}</CardTitle>
              {subtitle && <CardDescription className="mt-0.5 truncate">{subtitle}</CardDescription>}
            </div>
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent className="min-w-0">{children}</CardContent>
    </Card>
  )
}

// ============ SPARKLINE MINI CHART ============
export function Sparkline({
  data,
  color = '#059669',
  width = 80,
  height = 32,
}: {
  data: number[]
  color?: string
  width?: number
  height?: number
}) {
  if (data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(' ')

  const areaPath = `M0,${height} L${data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(' L')} L${width},${height} Z`

  return (
    <svg width={width} height={height} className="shrink-0" viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={`spark-fill-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.15} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#spark-fill-${color.replace('#', '')})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={width}
        cy={height - ((data[data.length - 1] - min) / range) * (height - 4) - 2}
        r={3}
        fill={color}
        stroke="white"
        strokeWidth={1.5}
      />
    </svg>
  )
}

// ============ BUSINESS HEALTH SCORE ============
export function HealthScoreCard({
  score,
  profitMargin,
  stockHealth,
  collectionRate,
  unpaidRatio,
}: {
  score: number
  profitMargin: number
  stockHealth: number
  collectionRate: number
  unpaidRatio: number
}) {
  const scoreColor = score >= 75 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-red-600'
  const scoreStroke = score >= 75 ? '#059669' : score >= 50 ? '#d97706' : '#dc2626'
  const scoreLabel = score >= 75 ? 'Odlično' : score >= 50 ? 'Dobro' : score >= 25 ? 'Potrebno unapređenje' : 'Kritično'

  const radius = 40
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative shrink-0">
            <svg width={88} height={88} viewBox="0 0 88 88" className="-rotate-90">
              <circle cx={44} cy={44} r={radius} fill="none" className="stroke-muted" strokeWidth={6} />
              <circle
                cx={44} cy={44} r={radius} fill="none"
                stroke={scoreStroke} strokeWidth={6}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn('text-xl font-bold tabular-nums', scoreColor)}>{score}</span>
              <span className="text-[9px] text-muted-foreground">/ 100</span>
            </div>
          </div>
          <div className="flex-1 min-w-0 space-y-2.5">
            <div>
              <p className="text-sm font-semibold">{scoreLabel}</p>
              <p className="text-xs text-muted-foreground">Zdravlje biznisa</p>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              <MetricItem label="Marža" value={`${profitMargin}%`} color={profitMargin >= 10 ? 'text-emerald-600' : 'text-red-600'} />
              <MetricItem label="Zalihe" value={`${stockHealth}%`} color={stockHealth >= 80 ? 'text-emerald-600' : 'text-amber-600'} />
              <MetricItem label="Naplata" value={`${collectionRate}%`} color={collectionRate >= 80 ? 'text-emerald-600' : 'text-red-600'} />
              <MetricItem label="Dugovanja" value={`${unpaidRatio}%`} color={unpaidRatio <= 20 ? 'text-emerald-600' : 'text-red-600'} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MetricItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn('text-sm font-semibold tabular-nums', color)}>{value}</span>
    </div>
  )
}

// ============ SIMPLE BAR LIST (shadcn-admin inspired) ============
export function SimpleBarList({
  items,
  barClass = 'bg-primary',
}: {
  items: { name: string; value: number }[]
  valueFormatter?: (n: number) => string
  barClass?: string
}) {
  const max = Math.max(...items.map((i) => i.value), 1)
  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const width = `${Math.round((item.value / max) * 100)}%`
        return (
          <li key={item.name} className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1 truncate text-xs text-muted-foreground">{item.name}</div>
              <div className="h-2.5 w-full rounded-full bg-muted">
                <div
                  className={cn('h-2.5 rounded-full transition-all duration-500', barClass)}
                  style={{ width }}
                />
              </div>
            </div>
            <div className="pl-2 text-xs font-medium tabular-nums shrink-0">{item.value}</div>
          </li>
        )
      })}
    </ul>
  )
}

// ============ MONTHLY GOAL TRACKER ============
export function GoalTrackerCard({
  goals,
}: {
  goals: {
    revenue: { current: number; goal: number; progress: number }
    invoices: { current: number; goal: number; progress: number }
    deals: { current: number; goal: number; progress: number }
    partners: { current: number; goal: number; progress: number }
  }
}) {
  const goalItems = [
    { label: 'Prihod', current: goals.revenue.current, goal: goals.revenue.goal, progress: goals.revenue.progress, format: (v: number) => formatCompactRSD(v) },
    { label: 'Fakture', current: goals.invoices.current, goal: goals.invoices.goal, progress: goals.invoices.progress, format: (v: number) => String(v) },
    { label: 'Poslovi (CRM)', current: goals.deals.current, goal: goals.deals.goal, progress: goals.deals.progress, format: (v: number) => String(v) },
    { label: 'Novi partneri', current: goals.partners.current, goal: goals.partners.goal, progress: goals.partners.progress, format: (v: number) => String(v) },
  ]

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4 space-y-4">
        <p className="text-sm font-semibold">Ciljevi meseca</p>
        <div className="space-y-3">
          {goalItems.map(item => (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 min-w-0">
                <span className="text-sm truncate">{item.label}</span>
                <span className={cn(
                  'text-xs font-medium tabular-nums shrink-0',
                  item.progress >= 100 ? 'text-emerald-600' : item.progress >= 60 ? 'text-amber-600' : 'text-muted-foreground'
                )}>
                  {item.format(item.current)} / {item.format(item.goal)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-700 ease-out',
                    item.progress >= 100 ? 'bg-emerald-500' : item.progress >= 60 ? 'bg-amber-500' : 'bg-primary'
                  )}
                  style={{ width: `${Math.min(100, item.progress)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ============ RECEIVABLES AGING ============
export function ReceivablesCard({
  aging,
}: {
  aging: {
    over30: { amount: number; count: number }
    sevenTo30: { amount: number; count: number }
    oneTo7: { amount: number; count: number }
    current: { amount: number; count: number }
  }
}) {
  const total = aging.over30.amount + aging.sevenTo30.amount + aging.oneTo7.amount + aging.current.amount

  const buckets = [
    { label: '> 30 dana', amount: aging.over30.amount, count: aging.over30.count, color: 'bg-red-500' },
    { label: '7-30 dana', amount: aging.sevenTo30.amount, count: aging.sevenTo30.count, color: 'bg-amber-500' },
    { label: '1-7 dana', amount: aging.oneTo7.amount, count: aging.oneTo7.count, color: 'bg-sky-500' },
    { label: 'Trenutno', amount: aging.current.amount, count: aging.current.count, color: 'bg-emerald-500' },
  ]

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4 space-y-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold">Naplate po dospeću</p>
          <p className="text-xs text-muted-foreground">{formatCompactRSD(total)} ukupno</p>
        </div>
        <div className="flex h-2.5 rounded-full bg-muted overflow-hidden gap-0.5">
          {buckets.map(b => (
            <div
              key={b.label}
              className={cn('rounded-full transition-all', b.color)}
              style={{ width: `${total > 0 ? (b.amount / total) * 100 : 0}%`, minWidth: b.amount > 0 ? 4 : 0 }}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {buckets.map(b => (
            <div key={b.label} className="flex items-center gap-2">
              <div className={cn('h-2 w-2 rounded-full shrink-0', b.color)} />
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{b.label}</p>
                <p className="text-[11px] text-muted-foreground tabular-nums">{formatCompactRSD(b.amount)} <span className="text-muted-foreground">({b.count})</span></p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ============ HELPER ============
function formatCompactRSD(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M RSD`
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K RSD`
  return `${value.toLocaleString('sr-RS')} RSD`
}
