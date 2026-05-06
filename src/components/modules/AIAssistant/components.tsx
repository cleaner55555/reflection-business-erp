'use client'

from '@/components/ui/badge'
from '@/components/ui/button'
from '@/components/ui/card'
from '@/components/ui/chart'
from '@/components/ui/input'
from '@/components/ui/scroll-area'
from '@/components/ui/skeleton'
from '@/components/ui/table'
import { , ArrowUpRight, BarChart3, CheckCircle2, ExternalLink, X } from 'lucide-react'
import type { ChatMessage, MessageData, APIResponse } from './types'

function InlineChart({
  chartData,
  chartType,
  chartConfig,
}: {
  chartData: Array<Record<string, unknown>>
  chartType: 'bar' | 'line' | 'pie' | 'area'
  chartConfig: Record<string, { label: string; color: string }>
}) {
  if (!chartData || chartData.length === 0) return null

  const dataKeys = Object.keys(chartConfig)
  const COLORS = ['#22c55e', '#ef4444', '#eab308', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#6366f1']

  const renderPieChart = () => {
    const pieData = chartData.map((d, i) => ({
      name: d[Object.keys(d)[0]] as string,
      value: d[Object.keys(d)[1]] as number,
      color: chartConfig[Object.keys(d)[1] as string]?.color || COLORS[i % COLORS.length],
    }))

    return (
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent />} />
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={70}
            innerRadius={35}
            paddingAngle={2}
          >
            {pieData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    )
  }

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
        <ChartTooltip content={<ChartTooltipContent />} />
        <XAxis
          dataKey={Object.keys(chartData[0])[0]}
          tick={{ fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        {dataKeys.map((key, i) => (
          <Bar
            key={key}
            dataKey={key}
            fill={chartConfig[key]?.color || COLORS[i % COLORS.length]}
            radius={[3, 3, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
        <ChartTooltip content={<ChartTooltipContent />} />
        <XAxis
          dataKey={Object.keys(chartData[0])[0]}
          tick={{ fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        {dataKeys.map((key, i) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={chartConfig[key]?.color || COLORS[i % COLORS.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )

  const renderAreaChart = () => (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
        <ChartTooltip content={<ChartTooltipContent />} />
        <XAxis
          dataKey={Object.keys(chartData[0])[0]}
          tick={{ fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        {dataKeys.map((key, i) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stroke={chartConfig[key]?.color || COLORS[i % COLORS.length]}
            fill={chartConfig[key]?.color || COLORS[i % COLORS.length]}
            fillOpacity={0.15}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )

  return (
    <div className="mt-2 rounded-lg border bg-background/50 p-3">
      {chartType === 'pie' ? renderPieChart() : chartType === 'line' ? renderLineChart() : chartType === 'area' ? renderAreaChart() : renderBarChart()}
      {/* Legend */}
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        {Object.entries(chartConfig).map(([key, config]) => (
          <div key={key} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <div
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: config.color }}
            />
            {config.label}
          </div>
        ))}
      </div>
    </div>
  )
}

function ResultsTable({
  columns,
  rows,
}: {
  columns: Array<{ key: string; label: string }>
  rows: Array<Record<string, unknown>>
}) {
  if (!columns || columns.length === 0 || !rows || rows.length === 0) return null

  return (
    <div className="mt-2 rounded-lg border overflow-hidden">
      <ScrollArea className="max-h-[220px]">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              {columns.map((col) => (
                <TableHead key={col.key} className="text-[11px] font-semibold h-8 px-2.5">
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.slice(0, 10).map((row, i) => (
              <TableRow key={i} className="hover:bg-muted/20">
                {columns.map((col) => (
                  <TableCell key={col.key} className="text-xs py-1.5 px-2.5 max-w-[140px] truncate">
                    {String(row[col.key] ?? '')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      {rows.length > 10 && (
        <div className="border-t px-3 py-1.5 text-[11px] text-muted-foreground bg-muted/20 text-center">
          + još {rows.length - 10} redova
        </div>
      )}
    </div>
  )
}

function ActionCard({
  message,
  actionLabel,
  actionType,
  module,
  onNavigate,
}: {
  message: string
  actionLabel?: string
  actionType?: 'navigate' | 'created' | 'updated'
  module?: string
  onNavigate?: (module: string) => void
}) {
  return (
    <div className="mt-2 rounded-lg border bg-gradient-to-r from-primary/5 to-transparent p-3 space-y-2">
      {actionType && (
        <div className="flex items-center gap-2 text-xs">
          {actionType === 'created' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
          {actionType === 'updated' && <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />}
          {actionType === 'navigate' && <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />}
          <span className={cn(
            'font-medium',
            actionType === 'created' && 'text-emerald-600 dark:text-emerald-400',
            actionType === 'updated' && 'text-blue-600 dark:text-blue-400',
          )}>
            {actionType === 'created' ? 'Kreirano' : actionType === 'updated' ? 'Ažurirano' : 'Navigacija'}
          </span>
        </div>
      )}
      {actionLabel && <p className="text-xs text-foreground">{actionLabel}</p>}
      {module && onNavigate && (
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1.5 mt-1"
          onClick={() => onNavigate(module)}
        >
          <ArrowUpRight className="h-3 w-3" />
          Otvori {MODULE_LABELS[module] || module}
        </Button>
      )}
    </div>
  )
}

function SummaryCard({
  value,
  label,
}: {
  value: string | number
  label: string
}) {
  return (
    <div className="mt-2 flex items-center gap-3 rounded-lg border bg-gradient-to-r from-emerald-500/5 to-emerald-500/0 p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
        <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-lg font-bold text-foreground tabular-nums">{value}</p>
      </div>
    </div>
  )
}

function ModuleLink({
  module,
  onNavigate,
}: {
  module: string
  onNavigate: (module: string) => void
}) {
  const label = MODULE_LABELS[module] || module
  return (
    <Badge
      variant="outline"
      className="cursor-pointer gap-1 mt-1 text-xs hover:bg-primary/5 hover:border-primary/30 transition-colors"
      onClick={() => onNavigate(module)}
    >
      <ArrowUpRight className="h-3 w-3" />
      {label}
    </Badge>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2 p-1">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-[100px] w-full rounded-lg" />
    </div>
  )
}
