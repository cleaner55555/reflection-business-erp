'use client'

import { useState, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Phone, PhoneCall, PhoneForwarded, PhoneMissed, PhoneOff, Plus,
  Search, Eye, Trash2, Edit3, RefreshCw, CheckCircle2, Clock,
  BarChart3, Users, AlertCircle, Settings, Download, Play, Pause,
  Volume2, Mic, Headphones, Radio, Mail, Calendar, Filter,
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'

// ═══════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════

interface VoipCall {
  id: string
  direction: 'inbound' | 'outbound' | 'internal'
  from: string
  to: string
  duration: number
  extension: string
  status: 'answered' | 'missed' | 'voicemail'
  recording: boolean
  notes: string
  createdAt: string
}

interface Extension {
  id: string
  number: string
  name: string
  department: string
  type: 'Desk' | 'Softphone' | 'Mobile'
  status: 'Online' | 'Busy' | 'Away' | 'Offline'
  device: string
  ipAddress: string
  provisioningStatus: string
}

interface IvrMenu {
  id: string
  name: string
  phoneNumber: string
  language: string
  active: boolean
  entries: IvrEntry[]
}

interface IvrEntry {
  id: string
  keyPress: string
  action: 'transfer' | 'play_message' | 'submenu' | 'voicemail'
  target: string
  label: string
}

interface Recording {
  id: string
  date: string
  from: string
  to: string
  duration: number
  extension: string
  fileSize: number
  tag: 'important' | 'quality' | 'training' | ''
}

interface SipTrunk {
  id: string
  provider: string
  username: string
  host: string
  port: string
  status: 'connected' | 'disconnected' | 'registering'
}

interface CallQueue {
  id: string
  name: string
  agents: string[]
  maxWaitTime: number
  musicOnHold: boolean
}

interface ForwardingRule {
  id: string
  type: 'unconditional' | 'busy' | 'no_answer' | 'time_based'
  target: string
  active: boolean
  schedule?: string
}

interface DialPlan {
  id: string
  prefix: string
  description: string
  stripDigits: number
  active: boolean
}

// ═══════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatFileSize(kb: number): string {
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`
  return `${kb} KB`
}

// ═══════════════════════════════════════════════════════
// CONFIG MAPS
// ═══════════════════════════════════════════════════════

const directionConfig: Record<string, { labelKey: string; color: string }> = {
  inbound: { labelKey: 'voip.direction.inbound', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  outbound: { labelKey: 'voip.direction.outbound', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
  internal: { labelKey: 'voip.direction.internal', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
}

const callStatusConfig: Record<string, { labelKey: string; color: string }> = {
  answered: { labelKey: 'voip.status.answered', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  missed: { labelKey: 'voip.status.missed', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  voicemail: { labelKey: 'voip.status.voicemail', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
}

const extStatusConfig: Record<string, { color: string; dotColor: string }> = {
  Online: { color: 'bg-green-100 text-green-700', dotColor: 'bg-green-500' },
  Busy: { color: 'bg-red-100 text-red-700', dotColor: 'bg-red-500' },
  Away: { color: 'bg-amber-100 text-amber-700', dotColor: 'bg-amber-500' },
  Offline: { color: 'bg-gray-100 text-gray-500', dotColor: 'bg-gray-400' },
}

const PIE_COLORS = ['#22c55e', '#0ea5e9', '#8b5cf6']
const TAG_COLORS: Record<string, string> = {
  important: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  quality: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  training: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
}

// ═══════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════

const MOCK_CALLS: VoipCall[] = [
  { id: 'c1', direction: 'inbound', from: '+381601234567', to: '101', duration: 245, extension: '101', status: 'answered', recording: true, notes: '', createdAt: '2025-01-15T08:30:00' },
  { id: 'c2', direction: 'outbound', from: '102', to: '+381639876543', duration: 180, extension: '102', status: 'answered', recording: true, notes: 'Follow-up call', createdAt: '2025-01-15T09:15:00' },
  { id: 'c3', direction: 'inbound', from: '+381112345678', to: '103', duration: 0, extension: '103', status: 'missed', recording: false, notes: '', createdAt: '2025-01-15T09:45:00' },
  { id: 'c4', direction: 'internal', from: '101', to: '105', duration: 95, extension: '101', status: 'answered', recording: false, notes: '', createdAt: '2025-01-15T10:00:00' },
  { id: 'c5', direction: 'inbound', from: '+381609876543', to: '101', duration: 0, extension: '101', status: 'voicemail', recording: true, notes: '', createdAt: '2025-01-15T10:30:00' },
  { id: 'c6', direction: 'outbound', from: '103', to: '+381631112233', duration: 320, extension: '103', status: 'answered', recording: true, notes: 'Contract discussion', createdAt: '2025-01-15T11:00:00' },
  { id: 'c7', direction: 'inbound', from: '+381601112233', to: '104', duration: 150, extension: '104', status: 'answered', recording: true, notes: '', createdAt: '2025-01-15T11:45:00' },
  { id: 'c8', direction: 'inbound', from: '+381115556666', to: '102', duration: 0, extension: '102', status: 'missed', recording: false, notes: '', createdAt: '2025-01-15T12:30:00' },
  { id: 'c9', direction: 'outbound', from: '105', to: '+381647778899', duration: 410, extension: '105', status: 'answered', recording: true, notes: 'Technical support', createdAt: '2025-01-15T13:00:00' },
  { id: 'c10', direction: 'internal', from: '102', to: '106', duration: 60, extension: '102', status: 'answered', recording: false, notes: '', createdAt: '2025-01-15T13:30:00' },
  { id: 'c11', direction: 'inbound', from: '+381602223344', to: '107', duration: 200, extension: '107', status: 'answered', recording: true, notes: '', createdAt: '2025-01-15T14:15:00' },
  { id: 'c12', direction: 'outbound', from: '101', to: '+381636667778', duration: 0, extension: '101', status: 'missed', recording: false, notes: '', createdAt: '2025-01-15T15:00:00' },
  { id: 'c13', direction: 'inbound', from: '+381114445555', to: '108', duration: 175, extension: '108', status: 'answered', recording: true, notes: '', createdAt: '2025-01-15T15:30:00' },
  { id: 'c14', direction: 'internal', from: '103', to: '104', duration: 45, extension: '103', status: 'answered', recording: false, notes: '', createdAt: '2025-01-15T16:00:00' },
  { id: 'c15', direction: 'inbound', from: '+381608889900', to: '101', duration: 290, extension: '101', status: 'answered', recording: true, notes: '', createdAt: '2025-01-15T16:45:00' },
  { id: 'c16', direction: 'outbound', from: '106', to: '+381621234567', duration: 135, extension: '106', status: 'answered', recording: true, notes: '', createdAt: '2025-01-15T17:00:00' },
  { id: 'c17', direction: 'inbound', from: '+381119990000', to: '102', duration: 0, extension: '102', status: 'voicemail', recording: true, notes: '', createdAt: '2025-01-15T17:30:00' },
]

const MOCK_EXTENSIONS: Extension[] = [
  { id: 'e1', number: '101', name: 'Marko Petrović', department: 'Prodaja', type: 'Desk', status: 'Online', device: 'Yealink T46S', ipAddress: '192.168.1.101', provisioningStatus: 'active' },
  { id: 'e2', number: '102', name: 'Ana Jovanović', department: 'Podrška', type: 'Desk', status: 'Busy', device: 'Yealink T42G', ipAddress: '192.168.1.102', provisioningStatus: 'active' },
  { id: 'e3', number: '103', name: 'Jelena Stanković', department: 'Prodaja', type: 'Softphone', status: 'Online', device: 'MicroSIP', ipAddress: '192.168.1.55', provisioningStatus: 'active' },
  { id: 'e4', number: '104', name: 'Nikola Đorđević', department: 'IT', type: 'Desk', status: 'Away', device: 'Cisco 8845', ipAddress: '192.168.1.104', provisioningStatus: 'active' },
  { id: 'e5', number: '105', name: 'Marija Ilić', department: 'Računovodstvo', type: 'Desk', status: 'Online', device: 'Yealink T46S', ipAddress: '192.168.1.105', provisioningStatus: 'active' },
  { id: 'e6', number: '106', name: 'Stefan Nikolić', department: 'IT', type: 'Mobile', status: 'Offline', device: 'Zoiper', ipAddress: '-', provisioningStatus: 'pending' },
  { id: 'e7', number: '107', name: 'Ivana Milić', department: 'Podrška', type: 'Softphone', status: 'Online', device: 'MicroSIP', ipAddress: '192.168.1.57', provisioningStatus: 'active' },
  { id: 'e8', number: '108', name: 'Dejan Tanasković', department: 'Menadžment', type: 'Desk', status: 'Offline', device: 'Polycom VVX 601', ipAddress: '-', provisioningStatus: 'inactive' },
]

const MOCK_IVR_MENUS: IvrMenu[] = [
  {
    id: 'ivr1', name: 'Glavni IVR', phoneNumber: '+381112345678', language: 'sr', active: true,
    entries: [
      { id: 'iv1', keyPress: '1', action: 'transfer', target: '101', label: 'Prodaja' },
      { id: 'iv2', keyPress: '2', action: 'transfer', target: '102', label: 'Podrška' },
      { id: 'iv3', keyPress: '3', action: 'submenu', target: 'ivr2', label: 'IT podrška' },
      { id: 'iv4', keyPress: '0', action: 'voicemail', target: '100', label: 'Govorna pošta' },
    ],
  },
  {
    id: 'ivr2', name: 'IT Podrška', phoneNumber: '+381112345679', language: 'sr', active: true,
    entries: [
      { id: 'iv5', keyPress: '1', action: 'transfer', target: '104', label: 'Helpdesk' },
      { id: 'iv6', keyPress: '2', action: 'play_message', target: 'it-info.wav', label: 'Informacije' },
    ],
  },
  {
    id: 'ivr3', name: 'Nakradno pozdrav', phoneNumber: '+381112345680', language: 'en', active: false,
    entries: [
      { id: 'iv7', keyPress: '1', action: 'transfer', target: '108', label: 'Direktor' },
      { id: 'iv8', keyPress: '2', action: 'voicemail', target: '100', label: 'Govorna pošta' },
    ],
  },
]

const MOCK_RECORDINGS: Recording[] = [
  { id: 'r1', date: '2025-01-15T08:30:00', from: '+381601234567', to: '101', duration: 245, extension: '101', fileSize: 1200, tag: 'important' },
  { id: 'r2', date: '2025-01-15T09:15:00', from: '102', to: '+381639876543', duration: 180, extension: '102', fileSize: 890, tag: '' },
  { id: 'r3', date: '2025-01-15T10:30:00', from: '+381609876543', to: '101', duration: 15, extension: '101', fileSize: 75, tag: '' },
  { id: 'r4', date: '2025-01-15T11:00:00', from: '103', to: '+381631112233', duration: 320, extension: '103', fileSize: 1580, tag: 'training' },
  { id: 'r5', date: '2025-01-15T11:45:00', from: '+381601112233', to: '104', duration: 150, extension: '104', fileSize: 740, tag: 'quality' },
  { id: 'r6', date: '2025-01-15T13:00:00', from: '105', to: '+381647778899', duration: 410, extension: '105', fileSize: 2020, tag: 'important' },
  { id: 'r7', date: '2025-01-15T14:15:00', from: '+381602223344', to: '107', duration: 200, extension: '107', fileSize: 980, tag: '' },
  { id: 'r8', date: '2025-01-15T15:30:00', from: '+381114445555', to: '108', duration: 175, extension: '108', fileSize: 860, tag: 'quality' },
  { id: 'r9', date: '2025-01-15T16:45:00', from: '+381608889900', to: '101', duration: 290, extension: '101', fileSize: 1430, tag: '' },
  { id: 'r10', date: '2025-01-15T17:00:00', from: '106', to: '+381621234567', duration: 135, extension: '106', fileSize: 665, tag: 'training' },
]

const HOURLY_DATA = Array.from({ length: 12 }, (_, i) => {
  const hour = 7 + i
  return {
    hour: `${hour}:00`,
    inbound: Math.floor(Math.random() * 12) + 3,
    outbound: Math.floor(Math.random() * 8) + 1,
    missed: Math.floor(Math.random() * 4),
  }
})

const MOCK_SIP_TRUNKS: SipTrunk[] = [
  { id: 'sip1', provider: 'Orion Telekom', username: 'reflection-main', host: 'sip.orion.rs', port: '5060', status: 'connected' },
  { id: 'sip2', provider: 'MTS Business', username: 'reflection-mts', host: 'sip.mts.rs', port: '5061', status: 'disconnected' },
]

const MOCK_QUEUES: CallQueue[] = [
  { id: 'q1', name: 'Podrška', agents: ['102', '107', '103'], maxWaitTime: 120, musicOnHold: true },
  { id: 'q2', name: 'Prodaja', agents: ['101', '103'], maxWaitTime: 90, musicOnHold: true },
]

const MOCK_FORWARDING: ForwardingRule[] = [
  { id: 'f1', type: 'busy', target: '107', active: true },
  { id: 'f2', type: 'no_answer', target: '102', active: true, schedule: '15s' },
  { id: 'f3', type: 'time_based', target: '+381601234567', active: false, schedule: '18:00-08:00' },
]

const MOCK_DIAL_PLANS: DialPlan[] = [
  { id: 'd1', prefix: '0', description: 'Lokalni pozivi', stripDigits: 1, active: true },
  { id: 'd2', prefix: '00', description: 'Međunarodni pozivi', stripDigits: 2, active: true },
  { id: 'd3', prefix: '112', description: 'Hitne službe', stripDigits: 0, active: true },
  { id: 'd4', prefix: '06', description: 'Mobilni', stripDigits: 0, active: true },
]

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════

export function VoIP() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')

  // Call Log state
  const [callSearch, setCallSearch] = useState('')
  const [callDirFilter, setCallDirFilter] = useState('all')
  const [callExtFilter, setCallExtFilter] = useState('all')
  const [callDateFrom, setCallDateFrom] = useState('')
  const [callDateTo, setCallDateTo] = useState('')
  const [selectedCall, setSelectedCall] = useState<VoipCall | null>(null)
  const [callNotes, setCallNotes] = useState('')
  const [detailOpen, setDetailOpen] = useState(false)

  // Extensions state
  const [extSearch, setExtSearch] = useState('')
  const [extDialogOpen, setExtDialogOpen] = useState(false)
  const [editingExt, setEditingExt] = useState<Extension | null>(null)

  // IVR state
  const [ivrDialogOpen, setIvrDialogOpen] = useState(false)
  const [editingIvr, setEditingIvr] = useState<IvrMenu | null>(null)

  // Recordings state
  const [recSearch, setRecSearch] = useState('')
  const [recExtFilter, setRecExtFilter] = useState('all')
  const [recDateFrom, setRecDateFrom] = useState('')
  const [recDateTo, setRecDateTo] = useState('')
  const [selectedRecs, setSelectedRecs] = useState<string[]>([])

  // Settings state
  const [voicemailEnabled, setVoicemailEnabled] = useState(true)
  const [emailNotify, setEmailNotify] = useState(true)
  const [maxMsgLength, setMaxMsgLength] = useState('120')
  const [playingRec, setPlayingRec] = useState<string | null>(null)

  // ═══════════════════════════════════════════════════
  // COMPUTED VALUES
  // ═══════════════════════════════════════════════════

  const todayCalls = useMemo(() => {
    const today = new Date().toDateString()
    return MOCK_CALLS.filter((c) => new Date(c.createdAt).toDateString() === today)
  }, [])

  const kpi = useMemo(() => {
    const active = MOCK_CALLS.filter((c) => c.status === 'answered').length
    const total = MOCK_CALLS.length
    const missed = MOCK_CALLS.filter((c) => c.status === 'missed').length
    const answeredCalls = MOCK_CALLS.filter((c) => c.status === 'answered')
    const avgDur = answeredCalls.length > 0
      ? Math.round(answeredCalls.reduce((s, c) => s + c.duration, 0) / answeredCalls.length)
      : 0
    const avgWait = Math.round(MOCK_CALLS.reduce((s, c) => s + 5, 0) / MOCK_CALLS.length)
    const extensions = MOCK_EXTENSIONS.length
    return { active, total, missed, avgDur, avgWait, extensions }
  }, [])

  const pieData = useMemo(() => [
    { name: t('voip.direction.inbound'), value: MOCK_CALLS.filter((c) => c.direction === 'inbound').length },
    { name: t('voip.direction.outbound'), value: MOCK_CALLS.filter((c) => c.direction === 'outbound').length },
    { name: t('voip.direction.internal'), value: MOCK_CALLS.filter((c) => c.direction === 'internal').length },
  ], [t])

  const filteredCalls = useMemo(() => {
    return MOCK_CALLS.filter((c) => {
      if (callSearch && !c.from.includes(callSearch) && !c.to.includes(callSearch)) return false
      if (callDirFilter !== 'all' && c.direction !== callDirFilter) return false
      if (callExtFilter !== 'all' && c.extension !== callExtFilter) return false
      if (callDateFrom && c.createdAt < callDateFrom) return false
      if (callDateTo && c.createdAt > callDateTo) return false
      return true
    })
  }, [callSearch, callDirFilter, callExtFilter, callDateFrom, callDateTo])

  const filteredExtensions = useMemo(() => {
    return MOCK_EXTENSIONS.filter((e) => {
      if (extSearch && !e.name.toLowerCase().includes(extSearch.toLowerCase()) && !e.number.includes(extSearch)) return false
      return true
    })
  }, [extSearch])

  const filteredRecordings = useMemo(() => {
    return MOCK_RECORDINGS.filter((r) => {
      if (recSearch && !r.from.includes(recSearch) && !r.to.includes(recSearch)) return false
      if (recExtFilter !== 'all' && r.extension !== recExtFilter) return false
      if (recDateFrom && r.date < recDateFrom) return false
      if (recDateTo && r.date > recDateTo) return false
      return true
    })
  }, [recSearch, recExtFilter, recDateFrom, recDateTo])

  const storageUsed = MOCK_RECORDINGS.reduce((s, r) => s + r.fileSize, 0)
  const storageTotal = 10240
  const storagePercent = Math.round((storageUsed / storageTotal) * 100)

  // ═══════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════

  const handleOpenCallDetail = (call: VoipCall) => {
    setSelectedCall(call)
    setCallNotes(call.notes || '')
    setDetailOpen(true)
  }

  const handleSaveCallNotes = () => {
    setDetailOpen(false)
    setSelectedCall(null)
  }

  const handleExportCsv = () => {
    const headers = ['ID', 'Direction', 'From', 'To', 'Duration', 'Extension', 'Status', 'Date']
    const rows = filteredCalls.map((c) => [c.id, c.direction, c.from, c.to, c.duration, c.extension, c.status, c.createdAt])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'voip-calls.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleOpenExtDialog = (ext?: Extension) => {
    setEditingExt(ext ?? null)
    setExtDialogOpen(true)
  }

  const handleOpenIvrDialog = (ivr?: IvrMenu) => {
    setEditingIvr(ivr ?? null)
    setIvrDialogOpen(true)
  }

  const toggleRecSelection = (id: string) => {
    setSelectedRecs((prev) => prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id])
  }

  const toggleSelectAllRecs = () => {
    if (selectedRecs.length === filteredRecordings.length) {
      setSelectedRecs([])
    } else {
      setSelectedRecs(filteredRecordings.map((r) => r.id))
    }
  }

  // ═══════════════════════════════════════════════════
  // TAB 1: OVERVIEW (Pregled)
  // ═══════════════════════════════════════════════════

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard icon={<PhoneCall className="h-4 w-4 text-green-600" />} label={t('voip.kpi.activeCalls')} value={String(kpi.active)} />
        <KpiCard icon={<Phone className="h-4 w-4 text-sky-600" />} label={t('voip.kpi.totalToday')} value={String(kpi.total)} />
        <KpiCard icon={<PhoneMissed className="h-4 w-4 text-red-500" />} label={t('voip.kpi.missedCalls')} value={String(kpi.missed)} valueColor="text-red-600" />
        <KpiCard icon={<Clock className="h-4 w-4 text-primary" />} label={t('voip.kpi.avgDuration')} value={formatDuration(kpi.avgDur)} />
        <KpiCard icon={<Volume2 className="h-4 w-4 text-amber-500" />} label={t('voip.kpi.avgWaitTime')} value={`${kpi.avgWait}s`} />
        <KpiCard icon={<Users className="h-4 w-4 text-violet-600" />} label={t('voip.kpi.totalExtensions')} value={String(kpi.extensions)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('voip.chart.dailyVolume')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={HOURLY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="inbound" stroke="#22c55e" strokeWidth={2} name={t('voip.direction.inbound')} />
                  <Line type="monotone" dataKey="outbound" stroke="#0ea5e9" strokeWidth={2} name={t('voip.direction.outbound')} />
                  <Line type="monotone" dataKey="missed" stroke="#ef4444" strokeWidth={2} name={t('voip.status.missed')} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('voip.chart.distribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {pieData.map((_entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t('voip.chart.peakHours')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={HOURLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="inbound" fill="#22c55e" name={t('voip.direction.inbound')} radius={[2, 2, 0, 0]} />
                <Bar dataKey="outbound" fill="#0ea5e9" name={t('voip.direction.outbound')} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t('voip.activeExtensions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {MOCK_EXTENSIONS.filter((e) => e.status !== 'Offline').map((ext) => {
              const statusCfg = extStatusConfig[ext.status]
              return (
                <div key={ext.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${statusCfg.dotColor}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{ext.name}</p>
                    <p className="text-xs text-muted-foreground">Ext {ext.number} · {ext.department}</p>
                  </div>
                  <Badge variant="outline" className={`ml-auto text-[10px] shrink-0 ${statusCfg.color}`}>{ext.status}</Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // ═══════════════════════════════════════════════════
  // TAB 2: CALL LOG (Pozivi)
  // ═══════════════════════════════════════════════════

  const renderCalls = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('voip.search.placeholder')} className="pl-9" value={callSearch} onChange={(e) => setCallSearch(e.target.value)} />
        </div>
        <Select value={callDirFilter} onValueChange={setCallDirFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('voip.filter.all')}</SelectItem>
            <SelectItem value="inbound">{t('voip.direction.inbound')}</SelectItem>
            <SelectItem value="outbound">{t('voip.direction.outbound')}</SelectItem>
            <SelectItem value="internal">{t('voip.direction.internal')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={callExtFilter} onValueChange={setCallExtFilter}>
          <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('voip.filter.allExtensions')}</SelectItem>
            {MOCK_EXTENSIONS.map((e) => (
              <SelectItem key={e.id} value={e.number}>{e.number} - {e.name.split(' ')[0]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="date" className="w-[140px]" value={callDateFrom} onChange={(e) => setCallDateFrom(e.target.value)} />
        <Input type="date" className="w-[140px]" value={callDateTo} onChange={(e) => setCallDateTo(e.target.value)} />
        <Button variant="outline" size="sm" onClick={handleExportCsv}>
          <Download className="h-4 w-4 mr-1" /> CSV
        </Button>
      </div>

      <div className="rounded-lg border overflow-x-auto max-h-[520px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">{t('voip.table.time')}</TableHead>
              <TableHead className="text-xs">{t('voip.table.from')}</TableHead>
              <TableHead className="text-xs">{t('voip.table.to')}</TableHead>
              <TableHead className="text-xs">{t('voip.table.direction')}</TableHead>
              <TableHead className="text-xs">{t('voip.table.duration')}</TableHead>
              <TableHead className="text-xs">{t('voip.table.extension')}</TableHead>
              <TableHead className="text-xs">{t('voip.table.status')}</TableHead>
              <TableHead className="text-xs">{t('voip.table.recording')}</TableHead>
              <TableHead className="text-xs">{t('voip.table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCalls.map((call) => {
              const dirCfg = directionConfig[call.direction]
              const statCfg = callStatusConfig[call.status]
              return (
                <TableRow key={call.id}>
                  <TableCell className="text-xs">
                    {new Date(call.createdAt).toLocaleString('sr-RS', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                  <TableCell className="text-xs font-mono">{call.from}</TableCell>
                  <TableCell className="text-xs font-mono">{call.to}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] ${dirCfg.color}`}>{t(dirCfg.labelKey)}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">{formatDuration(call.duration)}</TableCell>
                  <TableCell className="text-xs">{call.extension}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] ${statCfg.color}`}>{t(statCfg.labelKey)}</Badge>
                  </TableCell>
                  <TableCell>
                    {call.recording ? <Mic className="h-3.5 w-3.5 text-green-600" /> : <span className="text-xs text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenCallDetail(call)} title={t('voip.action.viewDetails')}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" title={t('voip.action.clickToCall')}>
                        <PhoneCall className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        {filteredCalls.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <Phone className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">{t('voip.noCalls')}</p>
          </div>
        )}
      </div>

      {/* Call Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('voip.dialog.callDetails')}</DialogTitle>
          </DialogHeader>
          {selectedCall && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">{t('voip.table.from')}</span><p className="font-mono">{selectedCall.from}</p></div>
                <div><span className="text-muted-foreground">{t('voip.table.to')}</span><p className="font-mono">{selectedCall.to}</p></div>
                <div><span className="text-muted-foreground">{t('voip.table.direction')}</span><p>{t(directionConfig[selectedCall.direction].labelKey)}</p></div>
                <div><span className="text-muted-foreground">{t('voip.table.status')}</span><p><Badge variant="outline" className={callStatusConfig[selectedCall.status].color}>{t(callStatusConfig[selectedCall.status].labelKey)}</Badge></p></div>
                <div><span className="text-muted-foreground">{t('voip.table.duration')}</span><p>{formatDuration(selectedCall.duration)}</p></div>
                <div><span className="text-muted-foreground">{t('voip.table.extension')}</span><p>{selectedCall.extension}</p></div>
              </div>
              {selectedCall.recording && (
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Mic className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">{t('voip.recording.player')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPlayingRec(playingRec === selectedCall.id ? null : selectedCall.id)}>
                      {playingRec === selectedCall.id ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    </Button>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: playingRec === selectedCall.id ? '35%' : '0%' }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDuration(selectedCall.duration)}</span>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-sm">{t('voip.notes')}</Label>
                <Textarea placeholder={t('voip.notesPlaceholder')} value={callNotes} onChange={(e) => setCallNotes(e.target.value)} rows={3} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>{t('voip.action.close')}</Button>
            <Button onClick={handleSaveCallNotes}>{t('voip.action.saveNotes')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )

  // ═══════════════════════════════════════════════════
  // TAB 3: EXTENSIONS (Ekstenzije)
  // ═══════════════════════════════════════════════════

  const renderExtensions = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('voip.ext.search')} className="pl-9" value={extSearch} onChange={(e) => setExtSearch(e.target.value)} />
        </div>
        <Button size="sm" onClick={() => handleOpenExtDialog()}>
          <Plus className="h-4 w-4 mr-1" /> {t('voip.ext.add')}
        </Button>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">{t('voip.ext.number')}</TableHead>
              <TableHead className="text-xs">{t('voip.ext.name')}</TableHead>
              <TableHead className="text-xs">{t('voip.ext.department')}</TableHead>
              <TableHead className="text-xs">{t('voip.ext.type')}</TableHead>
              <TableHead className="text-xs">{t('voip.ext.status')}</TableHead>
              <TableHead className="text-xs">{t('voip.ext.device')}</TableHead>
              <TableHead className="text-xs">IP</TableHead>
              <TableHead className="text-xs">{t('voip.ext.provisioning')}</TableHead>
              <TableHead className="text-xs">{t('voip.table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExtensions.map((ext) => {
              const statusCfg = extStatusConfig[ext.status]
              return (
                <TableRow key={ext.id}>
                  <TableCell className="text-xs font-mono font-medium">{ext.number}</TableCell>
                  <TableCell className="text-xs">{ext.name}</TableCell>
                  <TableCell className="text-xs">{ext.department}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{ext.type}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <div className={`h-2 w-2 rounded-full ${statusCfg.dotColor}`} />
                      <Badge variant="outline" className={`text-[10px] ${statusCfg.color}`}>{ext.status}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">{ext.device}</TableCell>
                  <TableCell className="text-xs font-mono">{ext.ipAddress}</TableCell>
                  <TableCell>
                    <Badge variant={ext.provisioningStatus === 'active' ? 'default' : 'outline'} className="text-[10px]">
                      {ext.provisioningStatus === 'active' ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                      {ext.provisioningStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenExtDialog(ext)}><Edit3 className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Extension Dialog */}
      <Dialog open={extDialogOpen} onOpenChange={setExtDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingExt ? t('voip.ext.edit') : t('voip.ext.addNew')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">{t('voip.ext.number')}</Label><Input defaultValue={editingExt?.number ?? ''} placeholder="101" /></div>
              <div className="space-y-1"><Label className="text-xs">{t('voip.ext.name')}</Label><Input defaultValue={editingExt?.name ?? ''} placeholder={t('voip.ext.namePlaceholder')} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">{t('voip.ext.department')}</Label>
                <Select defaultValue={editingExt?.department ?? 'Prodaja'}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Prodaja">Prodaja</SelectItem>
                    <SelectItem value="Podrška">Podrška</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Računovodstvo">Računovodstvo</SelectItem>
                    <SelectItem value="Menadžment">Menadžment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label className="text-xs">{t('voip.ext.type')}</Label>
                <Select defaultValue={editingExt?.type ?? 'Desk'}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Desk">Desk</SelectItem>
                    <SelectItem value="Softphone">Softphone</SelectItem>
                    <SelectItem value="Mobile">Mobile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1"><Label className="text-xs">{t('voip.ext.device')}</Label><Input defaultValue={editingExt?.device ?? ''} placeholder="Yealink T46S" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtDialogOpen(false)}>{t('voip.action.close')}</Button>
            <Button onClick={() => setExtDialogOpen(false)}>{t('voip.action.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )

  // ═══════════════════════════════════════════════════
  // TAB 4: IVR MENUS
  // ═══════════════════════════════════════════════════

  const renderIVR = () => (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => handleOpenIvrDialog()}>
          <Plus className="h-4 w-4 mr-1" /> {t('voip.ivr.create')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_IVR_MENUS.map((ivr) => (
          <Card key={ivr.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{ivr.name}</CardTitle>
                <Switch checked={ivr.active} />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {ivr.phoneNumber}</span>
                <span className="flex items-center gap-1"><Radio className="h-3 w-3" /> {ivr.language.toUpperCase()}</span>
              </div>
              <Separator />
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">{t('voip.ivr.entries')} ({ivr.entries.length})</p>
                {ivr.entries.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className="font-mono text-[10px] min-w-[24px] justify-center">{entry.keyPress}</Badge>
                    <span className="truncate">{entry.label}</span>
                    <span className="text-muted-foreground ml-auto">→ {entry.target}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => handleOpenIvrDialog(ivr)}>
                  <Edit3 className="h-3 w-3 mr-1" /> {t('voip.action.edit')}
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs text-red-500">
                  <Trash2 className="h-3 w-3 mr-1" /> {t('voip.action.delete')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* IVR Detail / Flow Preview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t('voip.ivr.flowPreview')} — {MOCK_IVR_MENUS[0].name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="rounded-lg border-2 border-primary bg-primary/5 px-6 py-3 text-center">
              <p className="text-sm font-medium">{t('voip.ivr.entryPoint')}</p>
              <p className="text-xs text-muted-foreground">{MOCK_IVR_MENUS[0].phoneNumber}</p>
            </div>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2 rounded-lg border border-dashed px-4 py-2">
              <Volume2 className="h-4 w-4 text-primary" />
              <span className="text-sm">{t('voip.ivr.greetingMessage')}</span>
            </div>
            <div className="h-6 w-px bg-border" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl">
              {MOCK_IVR_MENUS[0].entries.map((entry) => (
                <div key={entry.id} className="text-center">
                  <Badge variant="outline" className="font-mono mb-1">{entry.keyPress}</Badge>
                  <div className="rounded-lg border bg-muted/50 p-2 text-xs">
                    <p className="font-medium truncate">{entry.label}</p>
                    <p className="text-muted-foreground">{entry.action === 'transfer' ? '→ Ext' : entry.action === 'voicemail' ? '→ VM' : '→'}</p>
                    <p className="text-muted-foreground">{entry.target}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* IVR Edit Dialog */}
      <Dialog open={ivrDialogOpen} onOpenChange={setIvrDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingIvr ? t('voip.ivr.editMenu') : t('voip.ivr.createMenu')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">{t('voip.ivr.menuName')}</Label><Input defaultValue={editingIvr?.name ?? ''} placeholder={t('voip.ivr.menuNamePlaceholder')} /></div>
              <div className="space-y-1"><Label className="text-xs">{t('voip.ivr.phoneNumber')}</Label><Input defaultValue={editingIvr?.phoneNumber ?? ''} placeholder="+38111..." /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">{t('voip.ivr.language')}</Label>
                <Select defaultValue={editingIvr?.language ?? 'sr'}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sr">Srpski</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end pb-1">
                <div className="flex items-center gap-2">
                  <Switch defaultChecked={editingIvr?.active ?? true} />
                  <Label className="text-xs">{t('voip.ivr.active')}</Label>
                </div>
              </div>
            </div>
            <Separator />
            <p className="text-xs font-medium">{t('voip.ivr.entries')}</p>
            {(editingIvr?.entries ?? MOCK_IVR_MENUS[0].entries).map((entry) => (
              <div key={entry.id} className="grid grid-cols-[50px_1fr_1fr_32px] gap-2 items-center">
                <Input className="text-center font-mono text-xs" defaultValue={entry.keyPress} placeholder="#" />
                <Select defaultValue={entry.action}>
                  <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transfer">{t('voip.ivr.action.transfer')}</SelectItem>
                    <SelectItem value="play_message">{t('voip.ivr.action.playMessage')}</SelectItem>
                    <SelectItem value="submenu">{t('voip.ivr.action.submenu')}</SelectItem>
                    <SelectItem value="voicemail">{t('voip.ivr.action.voicemail')}</SelectItem>
                  </SelectContent>
                </Select>
                <Input className="text-xs" defaultValue={entry.target} />
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400"><Trash2 className="h-3 w-3" /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full text-xs">
              <Plus className="h-3 w-3 mr-1" /> {t('voip.ivr.addEntry')}
            </Button>
            <Separator />
            <div className="space-y-1">
              <Label className="text-xs">{t('voip.ivr.uploadGreeting')}</Label>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="text-xs">
                  <Volume2 className="h-3 w-3 mr-1" /> {t('voip.ivr.uploadAudio')}
                </Button>
                <span className="text-xs text-muted-foreground">.wav, .mp3 (max 5MB)</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIvrDialogOpen(false)}>{t('voip.action.close')}</Button>
            <Button onClick={() => setIvrDialogOpen(false)}>{t('voip.action.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )

  // ═══════════════════════════════════════════════════
  // TAB 5: RECORDINGS (Snimci)
  // ═══════════════════════════════════════════════════

  const renderRecordings = () => (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">{t('voip.recording.storage')}</p>
          <span className="text-xs text-muted-foreground">{formatFileSize(storageUsed)} / {formatFileSize(storageTotal)}</span>
        </div>
        <Progress value={storagePercent} className="h-2" />
        <p className="text-xs text-muted-foreground mt-1">{storagePercent}% {t('voip.recording.storageUsed')}</p>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('voip.rec.search')} className="pl-9" value={recSearch} onChange={(e) => setRecSearch(e.target.value)} />
        </div>
        <Select value={recExtFilter} onValueChange={setRecExtFilter}>
          <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('voip.filter.allExtensions')}</SelectItem>
            {MOCK_EXTENSIONS.map((e) => (
              <SelectItem key={e.id} value={e.number}>{e.number}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="date" className="w-[140px]" value={recDateFrom} onChange={(e) => setRecDateFrom(e.target.value)} />
        <Input type="date" className="w-[140px]" value={recDateTo} onChange={(e) => setRecDateTo(e.target.value)} />
      </div>

      {selectedRecs.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{selectedRecs.length} {t('voip.rec.selected')}</span>
          <Button variant="outline" size="sm" className="text-xs text-red-500" onClick={() => setSelectedRecs([])}>
            <Trash2 className="h-3 w-3 mr-1" /> {t('voip.rec.bulkDelete')}
          </Button>
        </div>
      )}

      <div className="rounded-lg border overflow-x-auto max-h-[420px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input type="checkbox" checked={selectedRecs.length === filteredRecordings.length && filteredRecordings.length > 0} onChange={toggleSelectAllRecs} className="rounded" />
              </TableHead>
              <TableHead className="text-xs">{t('voip.table.time')}</TableHead>
              <TableHead className="text-xs">{t('voip.table.from')}</TableHead>
              <TableHead className="text-xs">{t('voip.table.to')}</TableHead>
              <TableHead className="text-xs">{t('voip.table.duration')}</TableHead>
              <TableHead className="text-xs">{t('voip.table.extension')}</TableHead>
              <TableHead className="text-xs">{t('voip.rec.fileSize')}</TableHead>
              <TableHead className="text-xs">{t('voip.rec.tag')}</TableHead>
              <TableHead className="text-xs">{t('voip.table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecordings.map((rec) => (
              <TableRow key={rec.id}>
                <TableCell>
                  <input type="checkbox" checked={selectedRecs.includes(rec.id)} onChange={() => toggleRecSelection(rec.id)} className="rounded" />
                </TableCell>
                <TableCell className="text-xs">
                  {new Date(rec.date).toLocaleString('sr-RS', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </TableCell>
                <TableCell className="text-xs font-mono">{rec.from}</TableCell>
                <TableCell className="text-xs font-mono">{rec.to}</TableCell>
                <TableCell className="text-xs">{formatDuration(rec.duration)}</TableCell>
                <TableCell className="text-xs">{rec.extension}</TableCell>
                <TableCell className="text-xs">{formatFileSize(rec.fileSize)}</TableCell>
                <TableCell>
                  {rec.tag ? (
                    <Badge variant="outline" className={`text-[10px] ${TAG_COLORS[rec.tag]}`}>{t(`voip.rec.tag.${rec.tag}`)}</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" onClick={() => setPlayingRec(playingRec === rec.id ? null : rec.id)} title={t('voip.rec.play')}>
                      {playingRec === rec.id ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" title={t('voip.rec.download')}>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400" title={t('voip.action.delete')}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredRecordings.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <Mic className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">{t('voip.rec.noRecordings')}</p>
          </div>
        )}
      </div>
    </div>
  )

  // ═══════════════════════════════════════════════════
  // TAB 6: SETTINGS (Podešavanja)
  // ═══════════════════════════════════════════════════

  const renderSettings = () => (
    <div className="space-y-6">
      {/* SIP Trunk Configuration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Radio className="h-4 w-4" /> {t('voip.settings.sipTrunk')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">{t('voip.settings.provider')}</TableHead>
                  <TableHead className="text-xs">Username</TableHead>
                  <TableHead className="text-xs">Host</TableHead>
                  <TableHead className="text-xs">Port</TableHead>
                  <TableHead className="text-xs">{t('voip.settings.status')}</TableHead>
                  <TableHead className="text-xs">{t('voip.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_SIP_TRUNKS.map((trunk) => (
                  <TableRow key={trunk.id}>
                    <TableCell className="text-xs font-medium">{trunk.provider}</TableCell>
                    <TableCell className="text-xs font-mono">{trunk.username}</TableCell>
                    <TableCell className="text-xs font-mono">{trunk.host}</TableCell>
                    <TableCell className="text-xs">{trunk.port}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${trunk.status === 'connected' ? 'bg-green-100 text-green-700' : trunk.status === 'disconnected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        <div className={`h-1.5 w-1.5 rounded-full mr-1 ${trunk.status === 'connected' ? 'bg-green-500' : trunk.status === 'disconnected' ? 'bg-red-500' : 'bg-amber-500'}`} />
                        {trunk.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Edit3 className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><RefreshCw className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Button variant="outline" size="sm" className="mt-3">
            <Plus className="h-4 w-4 mr-1" /> {t('voip.settings.addTrunk')}
          </Button>
        </CardContent>
      </Card>

      {/* Voicemail Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Mail className="h-4 w-4" /> {t('voip.settings.voicemail')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">{t('voip.settings.vmEnable')}</Label>
              <p className="text-xs text-muted-foreground">{t('voip.settings.vmEnableDesc')}</p>
            </div>
            <Switch checked={voicemailEnabled} onCheckedChange={setVoicemailEnabled} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">{t('voip.settings.vmEmailNotify')}</Label>
              <p className="text-xs text-muted-foreground">{t('voip.settings.vmEmailNotifyDesc')}</p>
            </div>
            <Switch checked={emailNotify} onCheckedChange={setEmailNotify} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <Label className="text-sm">{t('voip.settings.vmMaxLength')}</Label>
            <div className="flex items-center gap-2">
              <Input type="number" value={maxMsgLength} onChange={(e) => setMaxMsgLength(e.target.value)} className="w-20 text-right text-sm" />
              <span className="text-xs text-muted-foreground">{t('voip.settings.seconds')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call Forwarding Rules */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <PhoneForwarded className="h-4 w-4" /> {t('voip.settings.forwarding')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {MOCK_FORWARDING.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-[10px] capitalize">{rule.type.replace('_', ' ')}</Badge>
                  <div>
                    <p className="text-sm">→ {rule.target}</p>
                    {rule.schedule && <p className="text-xs text-muted-foreground">{rule.schedule}</p>}
                  </div>
                </div>
                <Switch checked={rule.active} />
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-3">
            <Plus className="h-4 w-4 mr-1" /> {t('voip.settings.addRule')}
          </Button>
        </CardContent>
      </Card>

      {/* Queue Management */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Headphones className="h-4 w-4" /> {t('voip.settings.queues')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {MOCK_QUEUES.map((queue) => (
              <div key={queue.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">{queue.name}</p>
                  <Badge variant="outline" className="text-[10px]">
                    <Users className="h-3 w-3 mr-1" /> {queue.agents.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div><span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {t('voip.settings.maxWait')}: {queue.maxWaitTime}s</span></div>
                  <div><span className="flex items-center gap-1"><Volume2 className="h-3 w-3" /> {queue.musicOnHold ? t('voip.settings.mohOn') : t('voip.settings.mohOff')}</span></div>
                </div>
                <div className="flex gap-1.5 mt-2">
                  {queue.agents.map((agent) => (
                    <Badge key={agent} variant="outline" className="text-[10px] font-mono">{agent}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-3">
            <Plus className="h-4 w-4 mr-1" /> {t('voip.settings.addQueue')}
          </Button>
        </CardContent>
      </Card>

      {/* Dial Plans */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Phone className="h-4 w-4" /> {t('voip.settings.dialPlans')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">{t('voip.settings.prefix')}</TableHead>
                  <TableHead className="text-xs">{t('voip.settings.description')}</TableHead>
                  <TableHead className="text-xs">{t('voip.settings.stripDigits')}</TableHead>
                  <TableHead className="text-xs">{t('voip.settings.active')}</TableHead>
                  <TableHead className="text-xs">{t('voip.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_DIAL_PLANS.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="text-xs font-mono">{plan.prefix}</TableCell>
                    <TableCell className="text-xs">{plan.description}</TableCell>
                    <TableCell className="text-xs text-center">{plan.stripDigits}</TableCell>
                    <TableCell><Switch checked={plan.active} /></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><Edit3 className="h-3.5 w-3.5" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Button variant="outline" size="sm" className="mt-3">
            <Plus className="h-4 w-4 mr-1" /> {t('voip.settings.addDialPlan')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  // ═══════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('voip.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('voip.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" /> {t('voip.action.refresh')}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1 hidden sm:inline-block" /> {t('voip.tab.overview')}</TabsTrigger>
          <TabsTrigger value="calls"><Phone className="h-4 w-4 mr-1 hidden sm:inline-block" /> {t('voip.tab.calls')}</TabsTrigger>
          <TabsTrigger value="extensions"><Users className="h-4 w-4 mr-1 hidden sm:inline-block" /> {t('voip.tab.extensions')}</TabsTrigger>
          <TabsTrigger value="ivr"><Radio className="h-4 w-4 mr-1 hidden sm:inline-block" /> {t('voip.tab.ivr')}</TabsTrigger>
          <TabsTrigger value="recordings"><Mic className="h-4 w-4 mr-1 hidden sm:inline-block" /> {t('voip.tab.recordings')}</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="h-4 w-4 mr-1 hidden sm:inline-block" /> {t('voip.tab.settings')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">{renderOverview()}</TabsContent>
        <TabsContent value="calls">{renderCalls()}</TabsContent>
        <TabsContent value="extensions">{renderExtensions()}</TabsContent>
        <TabsContent value="ivr">{renderIVR()}</TabsContent>
        <TabsContent value="recordings">{renderRecordings()}</TabsContent>
        <TabsContent value="settings">{renderSettings()}</TabsContent>
      </Tabs>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// SUB-COMPONENTS (defined outside of render)
// ═══════════════════════════════════════════════════════

function KpiCard({ icon, label, value, valueColor }: {
  icon: React.ReactNode
  label: string
  value: string
  valueColor?: string
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        {icon}
      </div>
      <p className={`text-2xl font-bold ${valueColor ?? ''}`}>{value}</p>
    </Card>
  )
}
