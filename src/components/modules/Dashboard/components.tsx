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
}: {
  title: string
  value: string
  subtitle?: string
  change?: number | null
  icon: ReactNode
  iconBg?: string
  iconColor?: string
}) {
  return (
    <Card className="relative overflow-hidden border-border/60 hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider truncate">
              {title}
            </p>
            <p className="text-xl font-bold tabular-nums truncate">{value}</p>
            {change !== null && change !== undefined && (
              <div className="flex items-center gap-1">
                <span className={cn(
                  'text-[11px] font-semibold tabular-nums',
                  change >= 0 ? 'text-emerald-600' : 'text-red-600'
                )}>
                  {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                </span>
                <span className="text-[10px] text-muted-foreground">vs prošli mesec</span>
              </div>
            )}
            {subtitle && (
              <p className="text-[11px] text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={cn('rounded-xl p-2.5 shrink-0', iconBg)}>
            {icon}
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
    <Card className={cn('border-l-4', c.border)}>
      <CardContent className="p-3 flex items-center gap-3">
        <div className={cn('rounded-full p-2', c.bg)}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-muted-foreground truncate">{label}</p>
          <p className={cn('text-base font-bold tabular-nums truncate', c.text)}>{value}</p>
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
    <Card className={cn('border-border/60', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {icon}
            <div className="min-w-0">
              <CardTitle className="text-sm font-semibold truncate">{title}</CardTitle>
              {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
            </div>
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
