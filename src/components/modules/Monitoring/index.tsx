'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Activity, AlertTriangle, Clock, Cpu, MemoryStick, Zap,
  RefreshCw, TrendingUp, TrendingDown, Shield, Bell,
  ChevronDown, ChevronUp, Plus, Trash2, Info, Server
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig
} from '@/components/ui/chart'
import {
  Area, AreaChart, Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid
} from 'recharts'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardData {
  timestamp: string
  health: { score: number; status: string; uptime: number }
  keyMetrics: {
    requestRate: number; errorRate: number; avgResponseTime: number
    p95ResponseTime: number; activeUsers: number; wsConnections: number
    memoryUsageMB: number; memoryUsagePercent: number
  }
  charts: {
    responseTimes: { timestamp: number; value: number; label?: string }[]
    errorRates: { timestamp: number; value: number; label?: string }[]
    requestCounts: { timestamp: number; value: number; label?: string }[]
    memoryUsage: { timestamp: number; value: number; label?: string }[]
  }
  topSlowEndpoints: { endpoint: string; method: string; avgDuration: number; count: number; p95: number }[]
  recentErrors: { id: string; message: string; severity: string; endpoint?: string; count: number; timestamp: number }[]
  errorCountsByEndpoint: { endpoint: string; count: number }[]
  triggeredAlerts: { type: string; threshold: number; current: number; message: string }[]
}

interface AlertConfig {
  id: string; type: string; threshold: number; windowMs: number; enabled: boolean
}

// ─── Chart configs ────────────────────────────────────────────────────────────

const responseTimeChartConfig: ChartConfig = {
  avg: { label: 'Prosečno (ms)', color: 'hsl(var(--chart-1))' },
}

const errorRateChartConfig: ChartConfig = {
  errors: { label: 'Greške', color: 'hsl(0, 84%, 60%)' },
}

const requestChartConfig: ChartConfig = {
  count: { label: 'Zahtevi', color: 'hsl(var(--chart-2))' },
}

const memoryChartConfig: ChartConfig = {
  avg: { label: 'Memorija (MB)', color: 'hsl(var(--chart-3))' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60000) return 'Upravo sada'
  if (diff < 3600000) return `Pre ${Math.floor(diff / 60000)} min`
  if (diff < 86400000) return `Pre ${Math.floor(diff / 3600000)}h`
  return `Pre ${Math.floor(diff / 86400000)}d`
}

function getHealthColor(score: number): string {
  if (score >= 80) return 'text-emerald-500'
  if (score >= 50) return 'text-amber-500'
  return 'text-red-500'
}

function getHealthBg(score: number): string {
  if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/20'
  if (score >= 50) return 'bg-amber-500/10 border-amber-500/20'
  return 'bg-red-500/10 border-red-500/20'
}

function getHealthGaugeColor(score: number): string {
  if (score >= 80) return '#10b981'
  if (score >= 50) return '#f59e0b'
  return '#ef4444'
}

function getHealthRingColor(score: number): string {
  if (score >= 80) return 'stroke-emerald-500/20'
  if (score >= 50) return 'stroke-amber-500/20'
  return 'stroke-red-500/20'
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return 'bg-red-500/10 text-red-600 border-red-500/20'
    case 'error': return 'bg-orange-500/10 text-orange-600 border-orange-500/20'
    case 'warning': return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
    default: return 'bg-sky-500/10 text-sky-600 border-sky-500/20'
  }
}

function getMethodColor(method: string): string {
  switch (method.toUpperCase()) {
    case 'GET': return 'bg-emerald-500/10 text-emerald-600'
    case 'POST': return 'bg-blue-500/10 text-blue-600'
    case 'PUT': return 'bg-amber-500/10 text-amber-600'
    case 'DELETE': return 'bg-red-500/10 text-red-600'
    default: return 'bg-muted text-muted-foreground'
  }
}

// ─── Health Score Gauge ───────────────────────────────────────────────────────

function HealthGauge({ score }: { score: number }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = getHealthGaugeColor(score)
  const ringColor = score >= 80 ? 'rgba(16,185,129,0.15)' : score >= 50 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)'

  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
        {/* Background ring */}
        <circle cx="60" cy="60" r={radius} fill="none" stroke={ringColor} strokeWidth="8" />
        {/* Progress ring */}
        <circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-3xl font-bold ${getHealthColor(score)}`}>{score}</span>
        <span className="text-[10px] text-muted-foreground mt-0.5">od 100</span>
      </div>
    </div>
  )
}

// ─── Mini Chart Component ─────────────────────────────────────────────────────

function MiniChartCard({
  title, description, config, data, dataKey, xKey, chartType, emptyMessage,
}: {
  title: string
  description: string
  config: ChartConfig
  data: { time: string; [k: string]: unknown }[]
  dataKey: string
  xKey?: string
  chartType: 'area' | 'line' | 'bar'
  emptyMessage: string
}) {
  const x = xKey || 'time'
  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {data.length > 0 ? (
          <ChartContainer config={config} className="h-48 w-full">
            {chartType === 'area' ? (
              <AreaChart data={data}>
                <defs>
                  <linearGradient id={`fill-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={`var(--color-${dataKey})`} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={`var(--color-${dataKey})`} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey={x} tickLine={false} axisLine={false} className="text-[10px]" interval="preserveStartEnd" />
                <YAxis tickLine={false} axisLine={false} className="text-[10px]" width={40} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey={dataKey} stroke={`var(--color-${dataKey})`} fill={`url(#fill-${dataKey})`} strokeWidth={2} />
              </AreaChart>
            ) : chartType === 'line' ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey={x} tickLine={false} axisLine={false} className="text-[10px]" interval="preserveStartEnd" />
                <YAxis tickLine={false} axisLine={false} className="text-[10px]" width={40} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey={dataKey} stroke={`var(--color-${dataKey})`} strokeWidth={2} dot={false} />
              </LineChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey={x} tickLine={false} axisLine={false} className="text-[10px]" interval="preserveStartEnd" />
                <YAxis tickLine={false} axisLine={false} className="text-[10px]" width={40} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey={dataKey} fill={`var(--color-${dataKey})`} radius={[3, 3, 0, 0]} />
              </BarChart>
            )}
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Monitoring Component ─────────────────────────────────────────────────────

export function Monitoring() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<string>('1h')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  // Alerts state
  const [alerts, setAlerts] = useState<AlertConfig[]>([])
  const [showAlertPanel, setShowAlertPanel] = useState(false)
  const [newAlertType, setNewAlertType] = useState<string>('error_rate')
  const [newAlertThreshold, setNewAlertThreshold] = useState<string>('5')
  const [newAlertWindow, setNewAlertWindow] = useState<string>('300000')

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch(`/api/monitoring/dashboard?range=${range}`)
      if (!res.ok) throw new Error('Neuspešno učitavanje')
      const json = await res.json()
      if (json.success) {
        setData(json.data)
        setError(null)
      }
      setLastRefresh(new Date().toLocaleTimeString())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška')
    } finally {
      setLoading(false)
    }
  }, [range])

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch('/api/monitoring/alerts/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list' }),
      })
      const json = await res.json()
      if (json.success && json.data.alerts) {
        setAlerts(json.data.alerts)
      }
    } catch {
      // Ignore
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
    fetchAlerts()
  }, [fetchDashboard, fetchAlerts])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      fetchDashboard()
    }, 30_000)
    return () => clearInterval(interval)
  }, [autoRefresh, fetchDashboard])

  const createAlert = async () => {
    const threshold = parseFloat(newAlertThreshold)
    if (isNaN(threshold) || threshold <= 0) return

    try {
      const res = await fetch('/api/monitoring/alerts/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          type: newAlertType,
          threshold,
          windowMs: parseInt(newAlertWindow, 10),
        }),
      })
      const json = await res.json()
      if (json.success) {
        await fetchAlerts()
        setNewAlertThreshold('')
      }
    } catch {
      // Ignore
    }
  }

  const deleteAlert = async (id: string) => {
    try {
      await fetch('/api/monitoring/alerts/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      })
      await fetchAlerts()
    } catch {
      // Ignore
    }
  }

  const toggleAlert = async (alert: AlertConfig) => {
    try {
      await fetch('/api/monitoring/alerts/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', id: alert.id, enabled: !alert.enabled }),
      })
      await fetchAlerts()
    } catch {
      // Ignore
    }
  }

  // ─── Loading skeleton ──────────────────────────────────────────────────

  if (loading && !data) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchDashboard}>
          <RefreshCw className="h-3 w-3 mr-1" /> Pokušaj ponovo
        </Button>
      </div>
    )
  }

  if (!data) return null

  // ─── Chart data ────────────────────────────────────────────────────────
  const responseTimesData = data.charts.responseTimes.map(p => ({ time: p.label || '', avg: p.value }))
  const errorRatesData = data.charts.errorRates.map(p => ({ time: p.label || '', errors: p.value }))
  const requestCountsData = data.charts.requestCounts.map(p => ({ time: p.label || '', count: p.value }))
  const memoryUsageData = data.charts.memoryUsage.map(p => ({ time: p.label || '', avg: p.value }))

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Monitoring sistema</h1>
            <p className="text-sm text-muted-foreground">
              Praćenje performansi, grešaka i stanja sistema
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-xs text-muted-foreground">
              Ažurirano: {lastRefresh}
            </span>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Auto</span>
            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
          </div>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-28 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5m">5 min</SelectItem>
              <SelectItem value="15m">15 min</SelectItem>
              <SelectItem value="30m">30 min</SelectItem>
              <SelectItem value="1h">1 sat</SelectItem>
              <SelectItem value="6h">6 sati</SelectItem>
              <SelectItem value="24h">24 sata</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchDashboard}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Osvježi
          </Button>
        </div>
      </div>

      {/* ─── Triggered Alerts Banner ────────────────────────────────────── */}
      {data.triggeredAlerts.length > 0 && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-red-600">
              Aktivna upozorenja ({data.triggeredAlerts.length})
            </span>
          </div>
          <div className="space-y-1">
            {data.triggeredAlerts.map((a, i) => (
              <p key={i} className="text-xs text-red-600/80">{a.message}</p>
            ))}
          </div>
        </div>
      )}

      {/* ─── Health + Key Metrics ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Health Score Gauge */}
        <Card className={`lg:col-span-2 ${getHealthBg(data.health.score)} border`}>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <HealthGauge score={data.health.score} />
              <div className="text-center sm:text-left space-y-2 flex-1">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <Shield className={`h-4 w-4 ${getHealthColor(data.health.score)}`} />
                  <span className={`text-sm font-medium capitalize ${getHealthColor(data.health.score)}`}>
                    {data.health.status === 'healthy' ? 'Zdrav sistem' :
                     data.health.status === 'degraded' ? 'Degradiran' : 'Nezdrav sistem'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Indeks zdravlja sistema (0-100)</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span className="font-medium text-foreground">{formatUptime(data.health.uptime)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4 Key Metric Cards */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Zahtevi/min</span>
              <Zap className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-foreground">{data.keyMetrics.requestRate}</div>
            <p className="text-xs text-muted-foreground mt-1">Prosečan broj zahteva</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Stopa grešaka</span>
              <AlertTriangle className={`h-3.5 w-3.5 ${data.keyMetrics.errorRate > 5 ? 'text-red-500' : 'text-muted-foreground'}`} />
            </div>
            <div className={`text-2xl font-bold ${data.keyMetrics.errorRate > 5 ? 'text-red-500' : 'text-foreground'}`}>
              {data.keyMetrics.errorRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.keyMetrics.errorRate > 5 ? 'Visoka stopa!' : 'U normalnim granicama'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Prosečno vrijeme</span>
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-foreground">{data.keyMetrics.avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground mt-1">P95: {data.keyMetrics.p95ResponseTime}ms</p>
          </CardContent>
        </Card>
      </div>

      {/* ─── Second metrics row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Aktivni korisnici</span>
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-foreground">{data.keyMetrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">WebSocket: {data.keyMetrics.wsConnections}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Memorija</span>
              <MemoryStick className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-foreground">{data.keyMetrics.memoryUsageMB} MB</div>
            <p className="text-xs text-muted-foreground mt-1">{data.keyMetrics.memoryUsagePercent}% korišćeno</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Uptime</span>
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-foreground">{formatUptime(data.health.uptime)}</div>
            <p className="text-xs text-muted-foreground mt-1">Od pokretanja servera</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">P95 vrijeme</span>
              <Cpu className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className={`text-2xl font-bold ${data.keyMetrics.p95ResponseTime > 2000 ? 'text-red-500' : 'text-foreground'}`}>
              {data.keyMetrics.p95ResponseTime}ms
            </div>
            <p className="text-xs text-muted-foreground mt-1">95. percentil</p>
          </CardContent>
        </Card>
      </div>

      {/* ─── Charts 2x2 Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MiniChartCard
          title="Vrijeme odgovora API-ja"
          description="Prosečno vrijeme odgovora u milisekundama"
          config={responseTimeChartConfig}
          data={responseTimesData}
          dataKey="avg"
          chartType="line"
          emptyMessage="Nema podataka za prikaz"
        />
        <MiniChartCard
          title="Stopa grešaka"
          description="Broj grešaka po vremenskom intervalu"
          config={errorRateChartConfig}
          data={errorRatesData}
          dataKey="errors"
          chartType="area"
          emptyMessage="Nema grešaka ✓"
        />
        <MiniChartCard
          title="Zahtevi"
          description="Ukupan broj API zahteva po intervalu"
          config={requestChartConfig}
          data={requestCountsData}
          dataKey="count"
          chartType="bar"
          emptyMessage="Nema podataka za prikaz"
        />
        <MiniChartCard
          title="Korišćenje memorije"
          description="Heap memorija (MB) kroz vrijeme"
          config={memoryChartConfig}
          data={memoryUsageData}
          dataKey="avg"
          chartType="area"
          emptyMessage="Nema podataka za prikaz"
        />
      </div>

      {/* ─── Bottom Grid: Slow Endpoints + Errors ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* ─── Top Slow Endpoints ──────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-amber-500" />
              Najsporiji endpointi
            </CardTitle>
            <CardDescription>Top API rute po prosečnom vremenu odgovora</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topSlowEndpoints.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metoda</TableHead>
                      <TableHead>Endpoint</TableHead>
                      <TableHead className="text-right">Prosek</TableHead>
                      <TableHead className="text-right">P95</TableHead>
                      <TableHead className="text-right">Broj</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.topSlowEndpoints.map((ep, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getMethodColor(ep.method)}`}>
                            {ep.method}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs max-w-[180px] truncate">
                          {ep.endpoint}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {ep.avgDuration}ms
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-muted-foreground">
                          {ep.p95}ms
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {ep.count}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                Nema podataka
              </div>
            )}
          </CardContent>
        </Card>

        {/* ─── Recent Errors ────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Skorašnje greške
            </CardTitle>
            <CardDescription>Nedavno zabilježene greške sa kontekstom</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentErrors.length > 0 ? (
              <div className="max-h-80 overflow-y-auto space-y-2">
                {data.recentErrors.map((err) => (
                  <div
                    key={err.id}
                    className="rounded-lg border p-3 space-y-1.5 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border ${getSeverityColor(err.severity)}`}>
                          {err.severity}
                        </Badge>
                        {err.count > 1 && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            ×{err.count}
                          </Badge>
                        )}
                        {err.endpoint && (
                          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            {err.endpoint}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {timeAgo(err.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-foreground break-all line-clamp-2">
                      {err.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                Nema grešaka ✓
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── Error Counts by Endpoint (Horizontal Bar Chart) ───────────── */}
      {data.errorCountsByEndpoint.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Greške po endpointu</CardTitle>
            <CardDescription>Distribucija grešaka prema API rutama</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={errorRateChartConfig} className="h-48 w-full">
              <BarChart
                data={data.errorCountsByEndpoint.map(e => ({
                  endpoint: e.endpoint.length > 25 ? e.endpoint.slice(0, 25) + '…' : e.endpoint,
                  errors: e.count,
                }))}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis type="category" dataKey="endpoint" tickLine={false} axisLine={false} className="text-xs" width={160} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="errors" fill="var(--color-errors)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* ─── System Info + Alert Configuration ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ─── System Info Card ─────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              Informacije o sistemu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Uptime</span>
                <div className="text-sm font-medium text-foreground mt-1">{formatUptime(data.health.uptime)}</div>
              </div>
              <div className="rounded-lg border p-3">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Memorija</span>
                <div className="text-sm font-medium text-foreground mt-1">
                  {data.keyMetrics.memoryUsageMB} / {Math.round(data.keyMetrics.memoryUsageMB / (data.keyMetrics.memoryUsagePercent / 100))} MB
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Korišćenje</span>
                <div className="text-sm font-medium text-foreground mt-1">{data.keyMetrics.memoryUsagePercent}%</div>
                <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      data.keyMetrics.memoryUsagePercent > 80 ? 'bg-red-500' :
                      data.keyMetrics.memoryUsagePercent > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, data.keyMetrics.memoryUsagePercent)}%` }}
                  />
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">WebSocket</span>
                <div className="text-sm font-medium text-foreground mt-1">{data.keyMetrics.wsConnections} konekcija</div>
              </div>
              <div className="rounded-lg border p-3">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Vrijeme servera</span>
                <div className="text-sm font-medium text-foreground mt-1">
                  {new Date(data.timestamp).toLocaleString('sr-Latn')}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Serie</span>
                <div className="text-sm font-medium text-foreground mt-1">
                  {typeof process !== 'undefined' ? 'Bun' : 'Browser'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Alert Configuration Panel ────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-2 cursor-pointer" onClick={() => setShowAlertPanel(!showAlertPanel)}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Konfiguracija upozorenja
                </CardTitle>
                <CardDescription>Podesite pragove za automatska upozorenja</CardDescription>
              </div>
              {showAlertPanel ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
          {showAlertPanel && (
            <CardContent className="space-y-4">
              {/* Existing alerts */}
              {alerts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Postojeća upozorenja</h4>
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={alert.enabled}
                          onCheckedChange={() => toggleAlert(alert)}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {alert.type === 'error_rate' ? 'Stopa grešaka' :
                               alert.type === 'response_time' ? 'Vrijeme odgovora' :
                               alert.type === 'memory_usage' ? 'Korišćenje memorije' :
                               'Broj grešaka'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              &gt; {alert.threshold}{alert.type === 'error_rate' || alert.type === 'memory_usage' ? '%' : 'ms'}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Prozor: {alert.windowMs / 1000}s
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteAlert(alert.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* New alert form */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-foreground mb-3">Dodaj novo upozorenje</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Tip</Label>
                    <Select value={newAlertType} onValueChange={setNewAlertType}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="error_rate">Stopa grešaka (%)</SelectItem>
                        <SelectItem value="response_time">Vrijeme odgovora (ms)</SelectItem>
                        <SelectItem value="memory_usage">Memorija (%)</SelectItem>
                        <SelectItem value="error_count">Broj grešaka</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Prag</Label>
                    <Input
                      type="number"
                      className="h-9"
                      value={newAlertThreshold}
                      onChange={(e) => setNewAlertThreshold(e.target.value)}
                      placeholder="5"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Prozor (ms)</Label>
                    <Select value={newAlertWindow} onValueChange={setNewAlertWindow}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60000">1 min</SelectItem>
                        <SelectItem value="300000">5 min</SelectItem>
                        <SelectItem value="600000">10 min</SelectItem>
                        <SelectItem value="1800000">30 min</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button size="sm" className="h-9" onClick={createAlert}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Dodaj
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}

export default Monitoring
