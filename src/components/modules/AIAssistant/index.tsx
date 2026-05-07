'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  Bot,
  X,
  Send,
  Sparkles,
  ArrowUpRight,
  TableIcon,
  BarChart3,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Lightbulb,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/helpers'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'

// ============ TYPES ============

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  data?: MessageData
  actionType?: string
  module?: string
}

interface MessageData {
  columns?: Array<{ key: string; label: string }>
  rows?: Array<Record<string, unknown>>
  chartData?: Array<Record<string, unknown>>
  chartType?: 'bar' | 'line' | 'pie' | 'area'
  chartConfig?: Record<string, { label: string; color: string }>
  summaryValue?: string | number
  summaryLabel?: string
  module?: string
  actionLabel?: string
  actionType?: 'navigate' | 'created' | 'updated'
}

interface APIResponse {
  reply?: string
  actionType?: string
  module?: string
  data?: MessageData
  error?: string
}

// ============ MODULE CONFIG ============

const MODULE_CONTEXT: Record<string, string> = {
  dashboard: 'pregledne instrument table',
  finance: 'modul finansije',
  invoices: 'modul fakture',
  inventory: 'modul magacin',
  contacts: 'modul partneri',
  procurement: 'modul nabavka',
  crm: 'modul CRM',
  calendar: 'modul kalendar',
  employees: 'modul zaposleni',
  projects: 'modul projekti',
  assets: 'modul osnovna sredstva',
  documents: 'modul dokumenta',
  accounting: 'modul knjigovodstvo',
  protocol: 'modul protokol',
  education: 'modul edukacija',
  'fleet': 'modul vozni park',
  reports: 'modul izveštaji',
  settings: 'podešavanja sistema',
}

const MODULE_LABELS: Record<string, string> = {
  invoices: 'Fakture',
  contacts: 'Partneri',
  inventory: 'Magacin',
  finance: 'Finansije',
  crm: 'CRM',
  calendar: 'Kalendar',
  employees: 'Zaposleni',
  projects: 'Projekti',
  assets: 'Sredstva',
  documents: 'Dokumenta',
  accounting: 'Knjigovodstvo',
  protocol: 'Protokol',
  education: 'Edukacija',
  'fleet': 'Vozni park',
  reports: 'Izveštaji',
  procurement: 'Nabavka',
}

// ============ SUGGESTION CHIPS ============

const SUGGESTION_CHIPS = [
  { label: 'Prikaži neplaćene fakture', icon: AlertCircle },
  { label: 'Koje robe fale?', icon: BarChart3 },
  { label: 'Top partneri', icon: TableIcon },
  { label: 'Kreiraj fakturu', icon: Send },
  { label: 'Stanje blagajne', icon: BarChart3 },
]

// ============ INLINE CHART COMPONENT ============

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

// ============ RESULTS TABLE COMPONENT ============

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

// ============ ACTION CARD COMPONENT ============

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

// ============ SUMMARY CARD COMPONENT ============

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

// ============ MODULE LINK COMPONENT ============

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

// ============ LOADING SKELETON COMPONENT ============

function LoadingSkeleton() {
  return (
    <div className="space-y-2 p-1">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-[100px] w-full rounded-lg" />
    </div>
  )
}

// ============ MAIN COMPONENT ============

export function AIAssistant() {
  const { activeModule, setActiveModule } = useAppStore()
  const { t } = useTranslation()

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // ============ SCROLL TO BOTTOM ============

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    }
  }, [isOpen])

  // ============ NAVIGATE TO MODULE ============

  const navigateToModule = useCallback(
    (module: string) => {
      const validModule = module as keyof typeof MODULE_LABELS
      if (MODULE_LABELS[validModule]) {
        setActiveModule(validModule)
        setIsOpen(false)
      }
    },
    [setActiveModule]
  )

  // ============ SEND MESSAGE ============

  const sendMessage = async (text?: string) => {
    const trimmed = (text || inputValue).trim()
    if (!trimmed || isLoading) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const context = MODULE_CONTEXT[activeModule] || 'sistem'

      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          context: `Korisnik se trenutno nalazi u ${context} modulu.`,
        }),
      })

      if (!res.ok) throw new Error('Greška pri slanju poruke')

      const data: APIResponse = await res.json()

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.reply || data.error || 'Izvinjavam se, nisam uspeo da generišem odgovor.',
        timestamp: new Date(),
        data: data.data,
        actionType: data.actionType,
        module: data.module,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Izvinjavam se, došlo je do greške. Molimo pokušajte ponovo.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleSuggestionClick = (label: string) => {
    sendMessage(label)
  }

  // ============ RENDER ============

  return (
    <div className="fixed bottom-20 right-6 z-40 flex flex-col items-end gap-3">
      {/* Chat Panel */}
      <div
        className={cn(
          'w-[calc(100vw-3rem)] sm:w-[420px] transition-all duration-300 ease-in-out',
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        )}
      >
        <Card className="shadow-2xl border-border/50 overflow-hidden flex flex-col max-h-[580px]">
          {/* Header */}
          <CardHeader className="p-4 pb-3 shrink-0 border-b bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">Reflection AI Asistent</CardTitle>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    {MODULE_CONTEXT[activeModule] || 'Sistem'}
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
            {/* Welcome message */}
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Bot className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Zdravo! Ja sam Reflection AI asistent.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Mogu da vam pomognem sa fakturama, partnerima, magacinom, finansijama i još mnogo toga.
                  </p>
                </div>
                {/* Welcome suggestions */}
                <div className="flex flex-wrap gap-2 mt-3 justify-center px-2">
                  {SUGGESTION_CHIPS.map((suggestion) => (
                    <button
                      key={suggestion.label}
                      onClick={() => handleSuggestionClick(suggestion.label)}
                      className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-full border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors"
                    >
                      <suggestion.icon className="h-3 w-3" />
                      {suggestion.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat messages */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex gap-2.5',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.role === 'assistant' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-1">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  )}
                >
                  {/* Text content */}
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Summary card */}
                  {msg.data?.summaryValue && msg.data?.summaryLabel && (
                    <SummaryCard
                      value={msg.data.summaryValue}
                      label={msg.data.summaryLabel}
                    />
                  )}

                  {/* Inline chart */}
                  {msg.data?.chartData && msg.data?.chartData.length > 0 && msg.data?.chartConfig && (
                    <InlineChart
                      chartData={msg.data.chartData}
                      chartType={msg.data.chartType || 'bar'}
                      chartConfig={msg.data.chartConfig}
                    />
                  )}

                  {/* Results table */}
                  {msg.data?.columns && msg.data?.rows && msg.data.rows.length > 0 && (
                    <ResultsTable
                      columns={msg.data.columns}
                      rows={msg.data.rows}
                    />
                  )}

                  {/* Action card (create/update/navigate) */}
                  {msg.data?.actionLabel && (
                    <ActionCard
                      message={msg.content}
                      actionLabel={msg.data.actionLabel}
                      actionType={msg.data.actionType}
                      module={msg.data.module}
                      onNavigate={navigateToModule}
                    />
                  )}

                  {/* Module link (for navigate-only actions) */}
                  {msg.module && !msg.data?.actionLabel && msg.actionType === 'navigate' && (
                    <div className="mt-2">
                      <ModuleLink module={msg.module} onNavigate={navigateToModule} />
                    </div>
                  )}

                  {/* Timestamp */}
                  <p
                    className={cn(
                      'text-[10px] mt-1.5',
                      msg.role === 'user'
                        ? 'text-primary-foreground/60'
                        : 'text-muted-foreground'
                    )}
                  >
                    {msg.timestamp.toLocaleTimeString('sr-RS', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Loading state */}
            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-1">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%]">
                  <LoadingSkeleton />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions (when messages exist) */}
          {messages.length > 0 && !isLoading && (
            <div className="px-3 pt-2 shrink-0">
              <ScrollArea className="w-full" type="scroll">
                <div className="flex gap-1.5 pb-1">
                  {SUGGESTION_CHIPS.map((suggestion) => (
                    <button
                      key={suggestion.label}
                      onClick={() => handleSuggestionClick(suggestion.label)}
                      className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-full border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors whitespace-nowrap shrink-0"
                    >
                      <Lightbulb className="h-2.5 w-2.5" />
                      {suggestion.label}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t shrink-0 bg-background">
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pitajte nešto o vašem poslovanju..."
                disabled={isLoading}
                className="flex-1 text-sm h-9 rounded-full border-border/60 pl-4 pr-2"
              />
              <Button
                size="icon"
                className="h-9 w-9 rounded-full shrink-0"
                onClick={() => sendMessage()}
                disabled={isLoading || !inputValue.trim()}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="sr-only">Pošalji</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className={cn(
          'h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl',
          'bg-primary hover:bg-primary/90 text-primary-foreground',
          isOpen && 'rotate-0'
        )}
      >
        <span className="sr-only">
          {isOpen ? 'Zatvori AI asistent' : 'Otvori AI asistent'}
        </span>
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="relative">
            <Bot className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-foreground" />
            </span>
          </div>
        )}
      </Button>
    </div>
  )
}
