'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
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
  BarChart3,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Lightbulb,
  Trash2,
  Mic,
  MicOff,
  LayoutDashboard,
  ChevronRight,
  DollarSign,
  Users,
  Package,
  TrendingUp,
  ShoppingCart,
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
  kpis?: Array<{ label: string; value: string; trend?: string }>
  module?: string
  actionLabel?: string
  actionType?: 'navigate' | 'created' | 'updated'
}

// ============ MODULE CONFIG ============

const MODULE_CONTEXT: Record<string, string> = {
  dashboard: 'pregled dashboard',
  finansije: 'modul finansije',
  fakture: 'modul fakture',
  magacin: 'modul magacin',
  partneri: 'modul partneri',
  nabavka: 'modul nabavka',
  crm: 'modul CRM',
  kalendar: 'modul kalendar',
  zaposleni: 'modul zaposleni',
  projekti: 'modul projekti',
  sredstva: 'modul osnovna sredstva',
  dokumenta: 'modul dokumenta',
  knjigovodstvo: 'modul knjigovodstvo',
  protokol: 'modul protokol',
  edukacija: 'modul edukacija',
  'vozni-park': 'modul vozni park',
  'kafe-restoran': 'modul kafe restoran',
  'email-marketing': 'modul email marketing',
  'rent-a-car': 'modul rent a car',
  izvestaji: 'modul izveštaji',
  integracije: 'modul integracije',
  'bank-sync': 'modul banka',
  pos: 'modul POS maloprodaja',
  shipping: 'modul shipping',
  marketplace: 'modul marketplace',
  ponude: 'modul ponude',
  pretplate: 'modul pretplate',
  troskovi: 'modul troškovi',
  potpisi: 'modul potpisi',
  proizvodnja: 'modul proizvodnja',
  kvalitet: 'modul kvalitet',
  odrzavanje: 'modul održavanje',
  regrutacija: 'modul regrutacija',
  odsustva: 'modul odsustva',
  preporuke: 'modul preporuke',
  podrska: 'modul podrška',
  'terenski-servis': 'modul terenski servis',
  zakazivanja: 'modul zakazivanja',
  planer: 'modul planer',
  'drustvene-mreze': 'modul društvene mreže',
  'sms-marketing': 'modul SMS marketing',
  dogadjaji: 'modul događaji',
  'mkt-automatizacija': 'modul MKT automatizacija',
  ankete: 'modul ankete',
  chet: 'modul čet',
  'baza-znanja': 'modul baza znanja',
  website: 'modul website',
  blog: 'modul blog',
  voip: 'modul VoIP',
  iot: 'modul IoT',
  forum: 'modul forum',
  plm: 'modul PLM',
  ecommerce: 'modul e-commerce',
  spreadsheet: 'modul spreadsheet',
  beleske: 'modul beleške',
  odobrenja: 'modul odobrenja',
  vestine: 'modul veštine',
  ugovori: 'modul ugovori',
  gamifikacija: 'modul gamifikacija',
  reklamacije: 'modul reklamacije',
  servis: 'modul servis centar',
  uskladenost: 'modul usklađenost',
  'program-lojalnosti': 'modul lojalnost',
  podesavanja: 'modul podešavanja',
  zakoni: 'modul zakoni',
  blagajna: 'modul blagajna',
  cenovnici: 'modul cenovnici',
  vozila: 'modul vozila',
  kamioni: 'modul kamioni',
  posetioci: 'modul posetioci',
  backup: 'modul backup',
  automatizacija: 'modul automatizacija',
}

const MODULE_LABELS: Record<string, string> = {
  invoices: 'Fakture', fakture: 'Fakture', partners: 'Partneri', partneri: 'Partneri',
  products: 'Magacin', magacin: 'Magacin', transactions: 'Finansije', finansije: 'Finansije',
  cashregister: 'Blagajna', blagajna: 'Blagajna', contacts: 'CRM', crm: 'CRM',
  deals: 'CRM', calendar: 'Kalendar', kalendar: 'Kalendar',
  employees: 'Zaposleni', zaposleni: 'Zaposleni', projects: 'Projekti', projekti: 'Projekti',
  assets: 'Sredstva', sredstva: 'Sredstva', documents: 'Dokumenta', dokumenta: 'Dokumenta',
  accounting: 'Knjigovodstvo', knjigovodstvo: 'Knjigovodstvo',
  protocol: 'Protokol', protokol: 'Protokol', education: 'Edukacija', edukacija: 'Edukacija',
  'vozni-park': 'Vozni park', vehicles: 'Vozni park',
  reports: 'Izveštaji', izvestaji: 'Izveštaji', procurement: 'Nabavka', nabavka: 'Nabavka',
  settings: 'Podešavanja', podesavanja: 'Podešavanja',
  dashboard: 'Dashboard',
  'email-marketing': 'Email marketing', 'rent-a-car': 'Rent-a-car',
  shipping: 'Shipping', marketplace: 'Marketplace', pos: 'POS',
  manufacturing: 'Proizvodnja', proizvodnja: 'Proizvodnja',
  quality: 'Kvalitet', kvalitet: 'Kvalitet', maintenance: 'Održavanje', odrzavanje: 'Održavanje',
  recruitment: 'Regrutacija', regrutacija: 'Regrutacija',
  support: 'Podrška', podrska: 'Podrška',
  helpdesktickets: 'Podrška',
  vehicleservices: 'Vozni park', 'bank-sync': 'Banka',
  pretplate: 'Pretplate', subscriptions: 'Pretplate',
}

// ============ CONTEXT-AWARE SUGGESTIONS ============

function getSuggestions(activeModule: string): Array<{ label: string; icon: typeof BarChart3 }> {
  const general = [
    { label: 'Kako stojimo?', icon: LayoutDashboard },
    { label: 'Neplaćene fakture', icon: AlertCircle },
    { label: 'Top partneri', icon: Users },
    { label: 'Koje robe fale?', icon: Package },
  ]

  const moduleMap: Record<string, Array<{ label: string; icon: typeof BarChart3 }>> = {
    dashboard: [
      { label: 'Pregled poslovanja', icon: LayoutDashboard },
      { label: 'Prihodi vs rashodi', icon: TrendingUp },
      { label: 'Neplaćene fakture', icon: AlertCircle },
      { label: 'Stanje blagajne', icon: DollarSign },
      { label: 'Top partneri', icon: Users },
      { label: 'Koje robe fale?', icon: Package },
    ],
    fakture: [
      { label: 'Neplaćene fakture', icon: AlertCircle },
      { label: 'Fakture ovog meseca', icon: TrendingUp },
      { label: 'Kreiraj fakturu', icon: ShoppingCart },
      { label: 'Raspodela po statusu', icon: BarChart3 },
    ],
    partneri: [
      { label: 'Svi partneri', icon: Users },
      { label: 'Top partneri', icon: BarChart3 },
      { label: 'Kreiraj partnera', icon: Sparkles },
    ],
    magacin: [
      { label: 'Koje robe fale?', icon: AlertCircle },
      { label: 'Svi proizvodi', icon: Package },
      { label: 'Niska zaliha', icon: BarChart3 },
    ],
    crm: [
      { label: 'Pipeline pregled', icon: BarChart3 },
      { label: 'Aktivne prilike', icon: TrendingUp },
      { label: 'Kreiraj kontakt', icon: Sparkles },
      { label: 'Gubitajemo prilike?', icon: AlertCircle },
    ],
    finansije: [
      { label: 'Stanje blagajne', icon: DollarSign },
      { label: 'Prihodi ovog meseca', icon: TrendingUp },
      { label: 'Prihodi vs rashodi', icon: BarChart3 },
    ],
    zaposleni: [
      { label: 'Svi zaposleni', icon: Users },
      { label: 'Plate ovog meseca', icon: DollarSign },
    ],
    projekti: [
      { label: 'Aktivni projekti', icon: LayoutDashboard },
      { label: 'Projekti u problemu', icon: AlertCircle },
      { label: 'Kreiraj projekat', icon: Sparkles },
    ],
    'vozni-park': [
      { label: 'Aktivna vozila', icon: Users },
      { label: 'Servisi vozila', icon: AlertCircle },
      { label: 'Troškovi goriva', icon: DollarSign },
    ],
  }

  return moduleMap[activeModule] || general
}

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
          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={35} paddingAngle={2}>
            {pieData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    )
  }

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={180}>
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
    <ResponsiveContainer width="100%" height={180}>
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
    <ResponsiveContainer width="100%" height={180}>
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
          <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: config.color }} />
            {config.label}
          </div>
        ))}
      </div>
    </div>
  )
}

// ============ KPI CARDS COMPONENT ============

function KPICards({ kpis }: { kpis: Array<{ label: string; value: string; trend?: string }> }) {
  if (!kpis || kpis.length === 0) return null
  return (
    <div className="mt-2 grid grid-cols-2 gap-2">
      {kpis.map((kpi, i) => (
        <div key={i} className={cn(
          'rounded-lg border p-2.5',
          kpi.trend === 'warning' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-gradient-to-r from-primary/5 to-transparent'
        )}>
          <p className="text-xs text-muted-foreground truncate">{kpi.label}</p>
          <p className="text-sm font-bold text-foreground tabular-nums truncate">{kpi.value}</p>
        </div>
      ))}
    </div>
  )
}

// ============ RESULTS TABLE ============

function ResultsTable({ columns, rows }: { columns: Array<{ key: string; label: string }>; rows: Array<Record<string, unknown>> }) {
  if (!columns || columns.length === 0 || !rows || rows.length === 0) return null
  return (
    <div className="mt-2 rounded-lg border overflow-hidden">
      <ScrollArea className="max-h-[220px]">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              {columns.map((col) => (
                <TableHead key={col.key} className="text-xs font-semibold h-8 px-2.5">{col.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.slice(0, 10).map((row, i) => (
              <TableRow key={i} className="hover:bg-muted/20">
                {columns.map((col) => (
                  <TableCell key={col.key} className="text-xs py-1.5 px-2.5 max-w-[140px] truncate">{String(row[col.key] ?? '')}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      {rows.length > 10 && (
        <div className="border-t px-3 py-1.5 text-xs text-muted-foreground bg-muted/20 text-center">
          + još {rows.length - 10} redova
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
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold text-foreground tabular-nums">{value}</p>
      </div>
    </div>
  )
}

// ============ LOADING ============

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
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('reflection_ai_chat_history')
        if (saved) {
          return JSON.parse(saved).map((m: ChatMessage & { timestamp: string }) => ({
            ...m, timestamp: new Date(m.timestamp),
          }))
        }
      } catch { /* ignore */ }
    }
    return []
  })
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasNewMessage, setHasNewMessage] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  // Persist messages
  useEffect(() => {
    if (messages.length > 0) {
      try { localStorage.setItem('reflection_ai_chat_history', JSON.stringify(messages)) } catch { /* ignore */ }
    }
  }, [messages])

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])
  useEffect(() => { scrollToBottom() }, [messages, isLoading, scrollToBottom])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setHasNewMessage(false)
      setTimeout(() => { inputRef.current?.focus() }, 300)
    }
  }, [isOpen])

  // Keyboard shortcut Ctrl+J
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Clean up media recorder on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const clearChat = () => {
    setMessages([])
    localStorage.removeItem('reflection_ai_chat_history')
  }

  const navigateToModule = useCallback((module: string) => {
    setActiveModule(module as Parameters<typeof setActiveModule>[0])
    setIsOpen(false)
  }, [setActiveModule])

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
          // Use ASR to transcribe
          const formData = new FormData()
          formData.append('audio', audioBlob, 'recording.webm')

          const res = await fetch('/api/asr/transcribe', {
            method: 'POST',
            body: formData,
          })

          if (res.ok) {
            const data = await res.json()
            const text = data.text || data.transcription || ''
            if (text) {
              setInputValue(text)
              // Auto-send after transcription
              setTimeout(() => sendMessage(text), 300)
            }
          } else {
            // Fallback: use Web Speech API
            setInputValue('[Glasovni unos nije dostupan]')
          }
        } catch {
          setInputValue('[Greška pri prepoznavanju glasa]')
        }
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
    } catch {
      // Fallback to Web Speech API
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as unknown as { SpeechRecognition: typeof window.SpeechRecognition }).SpeechRecognition
        const recognition = new SpeechRecognition()
        recognition.lang = 'sr-RS'
        recognition.continuous = false
        recognition.interimResults = false

        recognition.onresult = (event: { results: { transcript: string }[][] }) => {
          const text = event.results[0][0].transcript
          setInputValue(text)
          setTimeout(() => sendMessage(text), 300)
        }
        recognition.onerror = () => { setIsRecording(false) }
        recognition.onend = () => { setIsRecording(false) }

        recognition.start()
        setIsRecording(true)

        // Store for cleanup
        mediaRecorderRef.current = null
      } else {
        // No speech recognition available
        setInputValue('[Glasovni unos nije podržan u ovom pregledaču]')
      }
    }
  }

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

      // Build conversation history for context
      const history = messages.slice(-8).map(m => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          context: `Korisnik se trenutno nalazi u ${context} modulu.`,
          history,
        }),
      })

      if (!res.ok) throw new Error('Greška pri slanju poruke')

      const data = await res.json()

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.reply || 'Nisam uspeo da generišem odgovor.',
        timestamp: new Date(),
        data: data.data,
        actionType: data.actionType,
        module: data.module,
      }

      setMessages((prev) => [...prev, assistantMessage])

      if (!isOpen) setHasNewMessage(true)
    } catch {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Izvinjavam se, došlo je do greške. Pokušajte ponovo.',
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

  const suggestions = getSuggestions(activeModule)

  // ============ RENDER ============

  return (
    <div className="fixed bottom-20 right-6 z-40 flex flex-col items-end gap-3">
      {/* Chat Panel */}
      <div className={cn(
        'w-[calc(100vw-3rem)] sm:w-[440px] transition-all duration-300 ease-in-out',
        isOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
      )}>
        <Card className="shadow-2xl border-border/50 overflow-hidden flex flex-col max-h-[600px]">
          {/* Header */}
          <div className="p-4 pb-3 shrink-0 border-b bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Reflection AI</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    {MODULE_CONTEXT[activeModule] || 'Sistem'}
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={clearChat} title="Obriši istoriju">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Bot className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Zdravo! Ja sam Reflection AI</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Kontrolišem celu aplikaciju — fakture, magacin, CRM, finansije, projekte i još mnogo toga. Pitajte me bilo šta!
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mt-3 justify-center px-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.label}
                      onClick={() => sendMessage(suggestion.label)}
                      className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-full border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors"
                    >
                      <suggestion.icon className="h-3 w-3" />
                      {suggestion.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={cn('flex gap-2.5', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.role === 'assistant' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-1">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div className={cn(
                  'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                  msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted text-foreground rounded-bl-md'
                )}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* KPI Cards */}
                  {msg.data?.kpis && msg.data.kpis.length > 0 && (
                    <KPICards kpis={msg.data.kpis} />
                  )}

                  {/* Summary card */}
                  {msg.data?.summaryValue && msg.data?.summaryLabel && !msg.data?.kpis && (
                    <SummaryCard value={msg.data.summaryValue} label={msg.data.summaryLabel} />
                  )}

                  {/* Chart */}
                  {msg.data?.chartData && msg.data?.chartData.length > 0 && msg.data?.chartConfig && (
                    <InlineChart chartData={msg.data.chartData} chartType={msg.data.chartType || 'bar'} chartConfig={msg.data.chartConfig} />
                  )}

                  {/* Results table */}
                  {msg.data?.columns && msg.data?.rows && msg.data.rows.length > 0 && (
                    <ResultsTable columns={msg.data.columns} rows={msg.data.rows} />
                  )}

                  {/* Action card */}
                  {msg.data?.actionLabel && (
                    <ActionCard actionLabel={msg.data.actionLabel} actionType={msg.data.actionType} module={msg.data.module} onNavigate={navigateToModule} />
                  )}

                  {/* Module link */}
                  {msg.module && !msg.data?.actionLabel && msg.actionType === 'navigate' && (
                    <Badge variant="outline" className="cursor-pointer gap-1 mt-1 text-xs hover:bg-primary/5 hover:border-primary/30 transition-colors" onClick={() => navigateToModule(msg.module!)}>
                      <ChevronRight className="h-3 w-3" />
                      {MODULE_LABELS[msg.module] || msg.module}
                    </Badge>
                  )}

                  <p className={cn('text-xs mt-1.5', msg.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground')}>
                    {msg.timestamp.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

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

          {/* Quick Suggestions */}
          {messages.length > 0 && !isLoading && (
            <div className="px-3 pt-2 shrink-0">
              <ScrollArea className="w-full" type="scroll">
                <div className="flex gap-1.5 pb-1">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.label}
                      onClick={() => sendMessage(suggestion.label)}
                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors whitespace-nowrap shrink-0"
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
              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Pitajte nešto o vašem poslovanju..."
                  disabled={isLoading}
                  className="flex-1 text-sm h-9 rounded-full border-border/60 pl-4 pr-16"
                />
                <kbd className="pointer-events-none absolute right-14 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
                  Ctrl+J
                </kbd>
              </div>
              {/* Voice input button */}
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
        <span className="sr-only">{isOpen ? 'Zatvori AI' : 'Otvori AI'}</span>
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="relative">
            <Bot className="h-6 w-6" />
            {!hasNewMessage && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-foreground" />
              </span>
            )}
            {hasNewMessage && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-bold ring-2 ring-background">
                !
              </span>
            )}
          </div>
        )}
      </Button>
    </div>
  )
}
