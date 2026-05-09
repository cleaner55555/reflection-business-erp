'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/helpers'
import type { ReactNode } from 'react'

// ============ KPI CARD ============
export function KPICard({
  title,
  value,
  subtitle,
  change,
  icon,
  iconBg = 'bg-primary/10',
  iconColor = 'text-primary',
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
    <Card className="relative overflow-hidden border-border/60 hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider truncate">
              {title}
            </p>
            <p className="text-lg font-bold tabular-nums truncate leading-tight">{value}</p>
            {change !== null && change !== undefined && (
              <div className="flex items-center gap-1 min-w-0">
                <span className={cn(
                  'text-[11px] font-semibold tabular-nums shrink-0',
                  change >= 0 ? 'text-emerald-600' : 'text-red-600'
                )}>
                  {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                </span>
                <span className="text-[10px] text-muted-foreground truncate">vs prošli mesec</span>
              </div>
            )}
            {subtitle && (
              <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={cn('rounded-xl p-2.5 shrink-0', iconBg)}>
              {icon}
            </div>
            {sparkline && sparkline.length > 1 && (
              <Sparkline data={sparkline} color={change && change >= 0 ? '#059669' : '#dc2626'} />
            )}
          </div>
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
    red: { border: 'border-l-red-500', bg: 'bg-red-50', text: 'text-red-600' },
    amber: { border: 'border-l-amber-500', bg: 'bg-amber-50', text: 'text-amber-600' },
    orange: { border: 'border-l-orange-500', bg: 'bg-orange-50', text: 'text-orange-600' },
    sky: { border: 'border-l-sky-500', bg: 'bg-sky-50', text: 'text-sky-600' },
    emerald: { border: 'border-l-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-600' },
    violet: { border: 'border-l-violet-500', bg: 'bg-violet-50', text: 'text-violet-600' },
  }
  const c = colorMap[color]
  return (
    <Card className={cn('border-l-4 overflow-hidden', c.border)}>
      <CardContent className="p-3 flex items-center gap-2.5 min-w-0">
        <div className={cn('rounded-full p-2 shrink-0', c.bg)}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] text-muted-foreground truncate">{label}</p>
          <p className={cn('text-sm font-bold tabular-nums truncate', c.text)}>{value}</p>
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
    <Card className={cn('border-border/60 overflow-hidden', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {icon}
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm font-semibold truncate">{title}</CardTitle>
              {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
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
  width = 64,
  height = 28,
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

  // Gradient fill area
  const areaPath = `M0,${height} L${data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(' L')} L${width},${height} Z`

  return (
    <svg width={width} height={height} className="shrink-0" viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={`spark-fill-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path
        d={areaPath}
        fill={`url(#spark-fill-${color.replace('#', '')})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={width}
        cy={height - ((data[data.length - 1] - min) / range) * (height - 4) - 2}
        r={2}
        fill={color}
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
  const scoreBg = score >= 75 ? 'bg-emerald-100' : score >= 50 ? 'bg-amber-100' : 'bg-red-100'
  const scoreStroke = score >= 75 ? '#059669' : score >= 50 ? '#d97706' : '#dc2626'
  const scoreLabel = score >= 75 ? 'Odlično' : score >= 50 ? 'Dobro' : score >= 25 ? 'Potrebno unapređenje' : 'Kritično'

  // SVG circular progress
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <Card className="border-border/60 hover:shadow-sm transition-shadow overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 min-w-0">
          {/* Circular gauge */}
          <div className="relative shrink-0">
            <svg width={96} height={96} viewBox="0 0 96 96" className="-rotate-90">
              <circle cx={48} cy={48} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={8} />
              <circle
                cx={48} cy={48} r={radius} fill="none"
                stroke={scoreStroke} strokeWidth={8}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
              <span className={cn('text-xl font-bold tabular-nums', scoreColor)}>{score}</span>
              <span className="text-[9px] text-muted-foreground">/ 100</span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider truncate">Zdravlje biznisa</p>
              <p className={cn('text-sm font-semibold truncate', scoreColor)}>{scoreLabel}</p>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
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
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className={cn('text-[11px] font-semibold tabular-nums', color)}>{value}</span>
    </div>
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
    {
      label: 'Prihod',
      current: goals.revenue.current,
      goal: goals.revenue.goal,
      progress: goals.revenue.progress,
      format: (v: number) => formatCompactRSD(v),
    },
    {
      label: 'Fakture',
      current: goals.invoices.current,
      goal: goals.invoices.goal,
      progress: goals.invoices.progress,
      format: (v: number) => String(v),
    },
    {
      label: 'Poslovi (CRM)',
      current: goals.deals.current,
      goal: goals.deals.goal,
      progress: goals.deals.progress,
      format: (v: number) => String(v),
    },
    {
      label: 'Novi partneri',
      current: goals.partners.current,
      goal: goals.partners.goal,
      progress: goals.partners.progress,
      format: (v: number) => String(v),
    },
  ]

  return (
    <Card className="border-border/60 hover:shadow-sm transition-shadow overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider truncate">Ciljevi meseca</p>
        <div className="space-y-2.5">
          {goalItems.map(item => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between gap-1 min-w-0">
                <span className="text-[11px] font-medium truncate">{item.label}</span>
                <span className={cn(
                  'text-[10px] font-semibold tabular-nums shrink-0',
                  item.progress >= 100 ? 'text-emerald-600' : item.progress >= 60 ? 'text-amber-600' : 'text-muted-foreground'
                )}>
                  {item.format(item.current)} / {item.format(item.goal)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-700 ease-out',
                    item.progress >= 100 ? 'bg-emerald-500' : item.progress >= 60 ? 'bg-amber-500' : 'bg-sky-500'
                  )}
                  style={{ width: `${Math.min(100, item.progress)}%` }}
                />
              </div>
              <p className="text-[9px] text-muted-foreground text-right tabular-nums">
                {Math.round(item.progress)}%
              </p>
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
    <Card className="border-border/60 hover:shadow-sm transition-shadow overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider truncate">Naplate po dospeću</p>
          <p className="text-base font-bold tabular-nums truncate">{formatCompactRSD(total)}</p>
        </div>
        {/* Stacked bar */}
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
          {buckets.map(b => (
            <div
              key={b.label}
              className={cn('rounded-full transition-all', b.color)}
              style={{ width: `${total > 0 ? (b.amount / total) * 100 : 0}%`, minWidth: b.amount > 0 ? 4 : 0 }}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {buckets.map(b => (
            <div key={b.label} className="flex items-center gap-1.5">
              <div className={cn('h-2 w-2 rounded-full shrink-0', b.color)} />
              <div className="min-w-0">
                <p className="text-[9px] text-muted-foreground truncate">{b.label}</p>
                <p className="text-[10px] font-semibold tabular-nums">{formatCompactRSD(b.amount)} <span className="text-muted-foreground font-normal">({b.count})</span></p>
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
