'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  Bot, X, Send, Sparkles, ArrowUpRight, BarChart3, AlertCircle,
  Loader2, CheckCircle2, ExternalLink, Lightbulb, Trash2, Mic, MicOff,
  LayoutDashboard, ChevronRight, ChevronLeft, Search, Users, MessageSquare,
  TrendingUp, DollarSign, Package, Megaphone, FolderKanban, Heart, Settings,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/helpers'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { AI_AGENTS, getAgentById, buildOrchestratorPrompt } from './agents'
import type { AgentId, ChatMessage, MessageData, TeamViewMode, AIAgent } from './types'

// ============ MODULE CONTEXT MAP ============
const MODULE_CONTEXT: Record<string, string> = {
  dashboard: 'dashboard', finansije: 'finance', fakture: 'sales', magacin: 'warehouse',
  partneri: 'crm', nabavka: 'sales', crm: 'crm', kalendar: 'projects',
  zaposleni: 'hr', projekti: 'projects', sredstva: 'finance', dokumenta: 'operations',
  knjigovodstvo: 'finance', protokol: 'operations', edukacija: 'hr',
  'vozni-park': 'operations', 'kafe-restoran': 'sales', 'email-marketing': 'marketing',
  'rent-a-car': 'sales', izvestaji: 'orchestrator', integracije: 'operations',
  'bank-sync': 'finance', pos: 'sales', shipping: 'operations', marketplace: 'sales',
  ponude: 'sales', pretplate: 'finance', troskovi: 'finance', potpisi: 'operations',
  proizvodnja: 'warehouse', kvalitet: 'warehouse', odrzavanje: 'operations',
  regrutacija: 'hr', odsustva: 'hr', preporuke: 'crm', podrska: 'crm',
  'terenski-servis': 'operations', zakazivanja: 'projects', planer: 'projects',
  'drustvene-mreze': 'marketing', 'sms-marketing': 'marketing', dogadjaji: 'marketing',
  'mkt-automatizacija': 'marketing', ankete: 'marketing', chet: 'crm',
  'baza-znanja': 'crm', website: 'marketing', blog: 'marketing', voip: 'crm',
  iot: 'operations', forum: 'crm', plm: 'warehouse', ecommerce: 'sales',
  spreadsheet: 'projects', beleske: 'projects', odobrenja: 'operations',
  vestine: 'hr', ugovori: 'projects', gamifikacija: 'hr', reklamacije: 'sales',
  servis: 'operations', uskladenost: 'operations', 'program-lojalnosti': 'marketing',
  podesavanja: 'operations', zakoni: 'finance', blagajna: 'finance', cenovnici: 'sales',
  vozila: 'operations', kamioni: 'operations', backup: 'operations', automatizacija: 'operations',
}

const MODULE_LABELS: Record<string, string> = {
  invoices: 'Fakture', fakture: 'Fakture', partners: 'Partneri', partneri: 'Partneri',
  products: 'Magacin', magacin: 'Magacin', transactions: 'Finansije', finansije: 'Finansije',
  cashregister: 'Blagajna', blagajna: 'Blagajna', contacts: 'CRM', crm: 'CRM',
  deals: 'CRM', calendar: 'Kalendar', kalendar: 'Kalendar',
  employees: 'Zaposleni', zaposleni: 'Zaposleni', projects: 'Projekti', projekti: 'Projekti',
  assets: 'Sredstva', sredstva: 'Sredstva', documents: 'Dokumenta', dokumenta: 'Dokumenta',
  accounting: 'Knjigovodstvo', knjigovodstvo: 'Knjigovodstvo',
  'email-marketing': 'Email marketing', 'rent-a-car': 'Rent-a-car',
  shipping: 'Shipping', marketplace: 'Marketplace', pos: 'POS',
  manufacturing: 'Proizvodnja', proizvodnja: 'Proizvodnja',
  quality: 'Kvalitet', kvalitet: 'Kvalitet', maintenance: 'Održavanje', odrzavanje: 'Održavanje',
  recruitment: 'Regrutacija', regrutacija: 'Regrutacija',
  support: 'Podrška', podrska: 'Podrška', dashboard: 'Dashboard',
}

// ============ ICON MAP ============
const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles, TrendingUp, DollarSign, Package, Megaphone, Users, FolderKanban, Heart, Settings, Bot,
}

// ============ INLINE CHART ============
function InlineChart({ chartData, chartType, chartConfig }: {
  chartData: Array<Record<string, unknown>>; chartType: 'bar' | 'line' | 'pie' | 'area';
  chartConfig: Record<string, { label: string; color: string }>
}) {
  if (!chartData?.length) return null
  const dataKeys = Object.keys(chartConfig)
  const COLORS = ['#22c55e', '#ef4444', '#eab308', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#6366f1']

  const renderPieChart = () => {
    const pieData = chartData.map((d, i) => ({
      name: d[Object.keys(d)[0]] as string,
      value: d[Object.keys(d)[1]] as number,
      color: chartConfig[Object.keys(d)[1] as string]?.color || COLORS[i % COLORS.length],
    }))
    return (
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent />} />
          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={30} paddingAngle={2}>
            {pieData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    )
  }
  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
        <ChartTooltip content={<ChartTooltipContent />} />
        <XAxis dataKey={Object.keys(chartData[0])[0]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        {dataKeys.map((key, i) => (
          <Bar key={key} dataKey={key} fill={chartConfig[key]?.color || COLORS[i % COLORS.length]} radius={[3, 3, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
        <ChartTooltip content={<ChartTooltipContent />} />
        <XAxis dataKey={Object.keys(chartData[0])[0]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        {dataKeys.map((key, i) => (
          <Line key={key} type="monotone" dataKey={key} stroke={chartConfig[key]?.color || COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
  const renderAreaChart = () => (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
        <ChartTooltip content={<ChartTooltipContent />} />
        <XAxis dataKey={Object.keys(chartData[0])[0]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        {dataKeys.map((key, i) => (
          <Area key={key} type="monotone" dataKey={key} stroke={chartConfig[key]?.color || COLORS[i % COLORS.length]} fill={chartConfig[key]?.color || COLORS[i % COLORS.length]} fillOpacity={0.15} strokeWidth={2} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )

  return (
    <div className="mt-2 rounded-lg border bg-background/50 p-3">
      {chartType === 'pie' ? renderPieChart() : chartType === 'line' ? renderLineChart() : chartType === 'area' ? renderAreaChart() : renderBarChart()}
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        {Object.entries(chartConfig).map(([key, config]) => (
          <div key={key} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: config.color }} />
            {config.label}
          </div>
        ))}
      </div>
    </div>
  )
}

// ============ KPI CARDS ============
function KPICards({ kpis }: { kpis: Array<{ label: string; value: string; trend?: string }> }) {
  if (!kpis?.length) return null
  return (
    <div className="mt-2 grid grid-cols-2 gap-2">
      {kpis.map((kpi, i) => (
        <div key={i} className={cn(
          'rounded-lg border p-2.5',
          kpi.trend === 'warning' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-gradient-to-r from-primary/5 to-transparent'
        )}>
          <p className="text-[10px] text-muted-foreground truncate">{kpi.label}</p>
          <p className="text-sm font-bold text-foreground tabular-nums truncate">{kpi.value}</p>
        </div>
      ))}
    </div>
  )
}

// ============ RESULTS TABLE ============
function ResultsTable({ columns, rows }: { columns: Array<{ key: string; label: string }>; rows: Array<Record<string, unknown>> }) {
  if (!columns?.length || !rows?.length) return null
  return (
    <div className="mt-2 rounded-lg border overflow-hidden">
      <ScrollArea className="max-h-[200px]">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              {columns.map((col) => (
                <TableHead key={col.key} className="text-[11px] font-semibold h-8 px-2.5">{col.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.slice(0, 8).map((row, i) => (
              <TableRow key={i} className="hover:bg-muted/20">
                {columns.map((col) => (
                  <TableCell key={col.key} className="text-xs py-1.5 px-2.5 max-w-[140px] truncate">{String(row[col.key] ?? '')}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      {rows.length > 8 && (
        <div className="border-t px-3 py-1.5 text-[11px] text-muted-foreground bg-muted/20 text-center">
          + još {rows.length - 8} redova
        </div>
      )}
    </div>
  )
}

// ============ ACTION CARD ============
function ActionCard({ actionLabel, actionType, module, onNavigate }: {
  actionLabel?: string; actionType?: 'navigate' | 'created' | 'updated'; module?: string; onNavigate?: (module: string) => void
}) {
  return (
    <div className="mt-2 rounded-lg border bg-gradient-to-r from-primary/5 to-transparent p-3 space-y-2">
      {actionType && (
        <div className="flex items-center gap-2 text-xs">
          {actionType === 'created' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
          {actionType === 'updated' && <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />}
          {actionType === 'navigate' && <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />}
          <span className={cn('font-medium',
            actionType === 'created' && 'text-emerald-600 dark:text-emerald-400',
            actionType === 'updated' && 'text-blue-600 dark:text-blue-400',
          )}>
            {actionType === 'created' ? 'Kreirano' : actionType === 'updated' ? 'Ažurirano' : 'Navigacija'}
          </span>
        </div>
      )}
      {actionLabel && <p className="text-xs text-foreground">{actionLabel}</p>}
      {module && onNavigate && (
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 mt-1" onClick={() => onNavigate(module)}>
          <ArrowUpRight className="h-3 w-3" />
          Otvori {MODULE_LABELS[module] || module}
        </Button>
      )}
    </div>
  )
}

// ============ SUMMARY CARD ============
function SummaryCard({ value, label }: { value: string | number; label: string }) {
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

// ============ AGENT CARD ============
function AgentCard({ agent, isSelected, onSelect, unreadCount }: {
  agent: AIAgent; isSelected: boolean; onSelect: () => void; unreadCount?: number
}) {
  const IconComp = ICON_MAP[agent.icon] || Bot
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full text-left rounded-xl border p-4 transition-all duration-200 hover:shadow-md group',
        isSelected
          ? 'border-primary/50 bg-primary/5 shadow-sm'
          : 'border-border/50 bg-card hover:border-primary/20 hover:bg-primary/[0.02]'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-transform group-hover:scale-105',
          agent.color
        )}>
          <IconComp className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground truncate">{agent.name}</h3>
            {unreadCount ? (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shrink-0">
                {unreadCount}
              </span>
            ) : (
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 shrink-0" title="Online" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{agent.role}</p>
          <p className="text-[11px] text-muted-foreground/70 mt-1 line-clamp-2">{agent.description}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {agent.specialties.slice(0, 3).map(s => (
              <Badge key={s} variant="secondary" className="text-[10px] px-1.5 py-0 h-5">{s}</Badge>
            ))}
            {agent.specialties.length > 3 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">+{agent.specialties.length - 3}</Badge>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

// ============ LOADING ============
function LoadingDots() {
  return (
    <div className="flex gap-1.5 p-1">
      <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2 p-1">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-[80px] w-full rounded-lg" />
    </div>
  )
}

// ============ MAIN COMPONENT ============
export function AITeam() {
  const { activeModule, setActiveModule } = useAppStore()
  const { t } = useTranslation()

  const [isOpen, setIsOpen] = useState(false)
  const [viewMode, setViewMode] = useState<TeamViewMode>({ type: 'hub', selectedAgent: null })
  const [searchQuery, setSearchQuery] = useState('')

  // Chat state per agent
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('reflection_ai_team_histories')
        if (saved) {
          const parsed = JSON.parse(saved) as Record<string, (ChatMessage & { timestamp: string })[]>
          const result: Record<string, ChatMessage[]> = {}
          for (const [key, msgs] of Object.entries(parsed)) {
            result[key] = msgs.map(m => ({ ...m, timestamp: new Date(m.timestamp) }))
          }
          return result
        }
      } catch { /* ignore */ }
    }
    return {}
  })
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasNewMessage, setHasNewMessage] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  // Current agent
  const currentAgent = viewMode.selectedAgent ? getAgentById(viewMode.selectedAgent) : null
  const currentMessages = currentAgent ? (chatHistories[currentAgent.id] || []) : []

  // Suggest agent based on active module
  const suggestedAgentId = MODULE_CONTEXT[activeModule] || 'orchestrator'

  // Persist messages
  useEffect(() => {
    if (Object.keys(chatHistories).length > 0 && typeof window !== 'undefined') {
      try { localStorage.setItem('reflection_ai_team_histories', JSON.stringify(chatHistories)) } catch { /* ignore */ }
    }
  }, [chatHistories])

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])
  useEffect(() => { scrollToBottom() }, [currentMessages, isLoading, scrollToBottom])

  // Focus input when agent selected
  useEffect(() => {
    if (viewMode.type === 'chat' && isOpen) {
      setHasNewMessage(false)
      setTimeout(() => { inputRef.current?.focus() }, 300)
    }
  }, [viewMode, isOpen])

  // Keyboard shortcut Ctrl+J
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Cleanup media recorder
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop()
    }
  }, [])

  const clearCurrentChat = () => {
    if (!currentAgent) return
    setChatHistories(prev => {
      const next = { ...prev }
      delete next[currentAgent.id]
      return next
    })
    try { localStorage.removeItem('reflection_ai_team_histories') } catch { /* ignore */ }
  }

  const navigateToModule = useCallback((module: string) => {
    setActiveModule(module as Parameters<typeof setActiveModule>[0])
  }, [setActiveModule])

  const selectAgent = (agentId: AgentId) => {
    setViewMode({ type: 'chat', selectedAgent: agentId })
  }

  const backToHub = () => {
    setViewMode({ type: 'hub', selectedAgent: null })
  }

  // ============ VOICE INPUT ============
  const toggleVoiceInput = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop()
      setIsRecording(false)
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      const audioChunks: Blob[] = []
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.push(e.data) }
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        try {
          const formData = new FormData()
          formData.append('audio', audioBlob, 'recording.webm')
          const res = await fetch('/api/asr/transcribe', { method: 'POST', body: formData })
          if (res.ok) {
            const data = await res.json()
            const text = data.text || data.transcription || ''
            if (text) { setInputValue(text); setTimeout(() => sendMessage(text), 300) }
          }
        } catch { setInputValue('[Greška pri prepoznavanju glasa]') }
      }
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
    } catch {
      setInputValue('[Glasovni unos nije podržan]')
    }
  }

  // ============ SEND MESSAGE ============
  const sendMessage = async (text?: string) => {
    const trimmed = (text || inputValue).trim()
    if (!trimmed || isLoading || !currentAgent) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
      agentId: currentAgent.id,
    }

    setChatHistories(prev => ({
      ...prev,
      [currentAgent.id]: [...(prev[currentAgent.id] || []), userMessage],
    }))
    setInputValue('')
    setIsLoading(true)

    try {
      const history = (chatHistories[currentAgent.id] || []).slice(-8).map(m => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/ai-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          agentId: currentAgent.id,
          context: `Korisnik se trenutno nalazi u ${MODULE_CONTEXT[activeModule] || 'sistem'} modulu.`,
          history,
        }),
      })

      if (!res.ok) throw new Error('Greška')

      const data = await res.json()

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.reply || 'Nisam uspeo da generišem odgovor.',
        timestamp: new Date(),
        data: data.data,
        actionType: data.actionType,
        module: data.module,
        agentId: currentAgent.id,
      }

      setChatHistories(prev => ({
        ...prev,
        [currentAgent.id]: [...(prev[currentAgent.id] || []), assistantMessage],
      }))

      if (!isOpen) setHasNewMessage(true)
    } catch {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Izvinjavam se, došlo je do greške. Pokušajte ponovo.',
        timestamp: new Date(),
        agentId: currentAgent.id,
      }
      setChatHistories(prev => ({
        ...prev,
        [currentAgent.id]: [...(prev[currentAgent.id] || []), errorMessage],
      }))
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

  // ============ RENDER ============

  return (
    <>
      {/* Floating Team Button */}
      <div className="fixed bottom-20 right-6 z-40">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="icon"
          className={cn(
            'h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl',
            'bg-primary hover:bg-primary/90 text-primary-foreground',
          )}
        >
          <span className="sr-only">{isOpen ? 'Zatvori AI Tim' : 'Otvori AI Tim'}</span>
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <div className="relative">
              <Users className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-primary-foreground" />
              </span>
            </div>
          )}
        </Button>
        {!isOpen && hasNewMessage && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold ring-2 ring-background">
            !
          </span>
        )}
      </div>

      {/* Sheet Panel */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="right"
          className="w-full sm:w-[520px] p-0 flex flex-col gap-0"
        >
          {/* Header */}
          <SheetHeader className="shrink-0 p-4 pb-3 border-b bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <SheetTitle className="text-sm font-semibold">
                  {viewMode.type === 'chat' && currentAgent ? (
                    <button onClick={backToHub} className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                      <ChevronLeft className="h-4 w-4" />
                      <span>{currentAgent.name}</span>
                      <Badge variant="outline" className="text-[10px] ml-1">{currentAgent.role}</Badge>
                    </button>
                  ) : (
                    'AI Business Team'
                  )}
                </SheetTitle>
                {viewMode.type === 'hub' && (
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    8 stručnih agenata za vaše poslovanje
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </p>
                )}
              </div>
              {viewMode.type === 'chat' && currentAgent && (
                <div className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg text-white shrink-0',
                  currentAgent.color
                )}>
                  {(() => {
                    const IconComp = ICON_MAP[currentAgent.icon] || Bot
                    return <IconComp className="h-4 w-4" />
                  })()}
                </div>
              )}
            </div>
          </SheetHeader>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {viewMode.type === 'hub' ? (
              /* ============ TEAM HUB VIEW ============ */
              <div className="h-full overflow-y-auto p-4 space-y-4">
                {/* Quick Actions Bar */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => selectAgent('orchestrator')}
                    className="flex-1 h-9 text-xs gap-2 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                    variant="ghost"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Team Chat
                  </Button>
                  <Button
                    onClick={() => selectAgent(suggestedAgentId as AgentId)}
                    variant="outline"
                    className="flex-1 h-9 text-xs gap-2"
                  >
                    <Lightbulb className="h-3.5 w-3.5" />
                    Predložen agent
                  </Button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Pretraži agente..."
                    className="pl-9 h-9 text-sm"
                  />
                </div>

                {/* Agent Cards Grid */}
                <div className="grid gap-3">
                  {AI_AGENTS.filter(agent =>
                    !searchQuery ||
                    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    agent.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    agent.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
                  ).map(agent => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      isSelected={false}
                      onSelect={() => selectAgent(agent.id)}
                      unreadCount={agent.id === suggestedAgentId ? 1 : 0}
                    />
                  ))}
                </div>

                {/* Info Card */}
                <Card className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">Kako radi AI Tim?</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Svaki agent je specijalizovan za svoju oblast. Pitajte direktno ili koristite
                        &quot;Team Chat&quot; za automatsko rutiranje. Agenti mogu da traže podatke,
                        kreiraju zapise, generišu izveštaje i navigiraju kroz aplikaciju.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              /* ============ CHAT VIEW ============ */
              <div className="h-full flex flex-col">
                {/* Agent info bar */}
                {currentAgent && (
                  <div className="shrink-0 px-4 py-2 border-b bg-muted/30">
                    <p className="text-[11px] text-muted-foreground">{currentAgent.greeting}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {currentAgent.quickActions.map(action => (
                        <button
                          key={action}
                          onClick={() => sendMessage(action)}
                          className="text-[11px] px-2.5 py-1 rounded-full border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {currentMessages.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-6">
                      <div className={cn(
                        'flex h-14 w-14 items-center justify-center rounded-2xl text-white',
                        currentAgent?.color || 'bg-primary'
                      )}>
                        {(() => {
                          const IconComp = currentAgent ? (ICON_MAP[currentAgent.icon] || Bot) : Bot
                          return <IconComp className="h-7 w-7" />
                        })()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {currentAgent?.name || 'AI Agent'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {currentAgent?.greeting || 'Kako vam mogu pomoći?'}
                        </p>
                      </div>
                    </div>
                  )}

                  {currentMessages.map((msg) => (
                    <div key={msg.id} className={cn('flex gap-2.5', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                      {msg.role === 'assistant' && (
                        <div className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white mt-1',
                          (() => {
                            const agent = msg.agentId ? getAgentById(msg.agentId) : null
                            return agent?.color || 'bg-primary'
                          })()
                        )}>
                          <Bot className="h-4 w-4" />
                        </div>
                      )}
                      <div className={cn(
                        'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                        msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted text-foreground rounded-bl-md'
                      )}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>

                        {msg.data?.kpis && msg.data.kpis.length > 0 && <KPICards kpis={msg.data.kpis} />}
                        {msg.data?.summaryValue && msg.data?.summaryLabel && !msg.data?.kpis && (
                          <SummaryCard value={msg.data.summaryValue} label={msg.data.summaryLabel} />
                        )}
                        {msg.data?.chartData && msg.data?.chartData.length > 0 && msg.data?.chartConfig && (
                          <InlineChart chartData={msg.data.chartData} chartType={msg.data.chartType || 'bar'} chartConfig={msg.data.chartConfig} />
                        )}
                        {msg.data?.columns && msg.data?.rows && msg.data.rows.length > 0 && (
                          <ResultsTable columns={msg.data.columns} rows={msg.data.rows} />
                        )}
                        {msg.data?.actionLabel && (
                          <ActionCard actionLabel={msg.data.actionLabel} actionType={msg.data.actionType} module={msg.data.module} onNavigate={navigateToModule} />
                        )}
                        {msg.module && !msg.data?.actionLabel && msg.actionType === 'navigate' && (
                          <Badge variant="outline" className="cursor-pointer gap-1 mt-1 text-xs hover:bg-primary/5 hover:border-primary/30 transition-colors" onClick={() => navigateToModule(msg.module!)}>
                            <ChevronRight className="h-3 w-3" />
                            {MODULE_LABELS[msg.module] || msg.module}
                          </Badge>
                        )}

                        <p className={cn('text-[10px] mt-1.5', msg.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground')}>
                          {msg.timestamp.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-2.5 justify-start">
                      <div className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white mt-1',
                        currentAgent?.color || 'bg-primary'
                      )}>
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%]">
                        <LoadingSkeleton />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="shrink-0 border-t bg-background">
                  {currentMessages.length > 0 && (
                    <div className="px-3 pt-2">
                      <ScrollArea className="w-full" type="scroll">
                        <div className="flex gap-1.5 pb-1">
                          {currentAgent?.quickActions.map(action => (
                            <button
                              key={action}
                              onClick={() => sendMessage(action)}
                              className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-full border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors whitespace-nowrap shrink-0"
                            >
                              <Lightbulb className="h-2.5 w-2.5" />
                              {action}
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                  <div className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Input
                          ref={inputRef}
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={`Pitajte ${currentAgent?.name || 'agenta'}...`}
                          disabled={isLoading}
                          className="flex-1 text-sm h-9 rounded-full border-border/60 pl-4 pr-12"
                        />
                        <kbd className="pointer-events-none absolute right-12 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                          Ctrl+J
                        </kbd>
                      </div>
                      <Button
                        variant={isRecording ? 'destructive' : 'ghost'}
                        size="icon"
                        className={cn('h-9 w-9 rounded-full shrink-0', isRecording && 'animate-pulse')}
                        onClick={toggleVoiceInput}
                        disabled={isLoading}
                        title={isRecording ? 'Zaustavi snimanje' : 'Glasovni unos'}
                      >
                        {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </Button>
                      {currentMessages.length > 0 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-full shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={clearCurrentChat}
                          title="Obriši istoriju"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        className="h-9 w-9 rounded-full shrink-0"
                        onClick={() => sendMessage()}
                        disabled={isLoading || !inputValue.trim()}
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        <span className="sr-only">Pošalji</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
