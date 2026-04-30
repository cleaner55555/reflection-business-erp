/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle2, Clock, BarChart3, Users, XCircle, Plus, Search,
  Eye, Trash2, Edit3, RefreshCw, FileText, Filter,
  ChevronRight, MessageSquare, Send, AlertCircle,
  CalendarDays, TrendingUp, UserCheck, UserX, ThumbsUp,
  ArrowRight, Copy, ListChecks, Settings, FileSignature
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ApprovalRequest {
  id: string
  title: string
  description: string
  type: string
  priority: string
  status: string
  requestedBy: string
  requestedByRole: string
  assignedTo: string
  assignedToRole: string
  amount?: number
  currency: string
  startDate?: string
  endDate?: string
  comments: ApprovalComment[]
  history: ApprovalHistoryEntry[]
  createdAt: string
  updatedAt: string
  approvedAt?: string
  rejectedAt?: string
}

interface ApprovalComment {
  id: string
  author: string
  content: string
  createdAt: string
}

interface ApprovalHistoryEntry {
  action: string
  performedBy: string
  timestamp: string
  note?: string
}

interface ApprovalTemplate {
  id: string
  name: string
  description: string
  type: string
  requiredFields: string[]
  approverRole: string
  isActive: boolean
  usageCount: number
}

interface ApprovalDashboard {
  totalRequests: number
  pendingRequests: number
  approvedRequests: number
  rejectedRequests: number
  avgResponseHours: number
  myPendingCount: number
  urgentPendingCount: number
  requestsByType: Array<{ type: string; count: number; label: string }>
  requestsByPriority: Array<{ priority: string; count: number }>
  recentRequests: ApprovalRequest[]
  monthlyTrend: Array<{ month: string; approved: number; rejected: number }>
}

// ─── Config ──────────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-700', icon: <FileText className="h-3.5 w-3.5" /> },
  pending: { label: 'Na čekanju', color: 'bg-amber-100 text-amber-700', icon: <Clock className="h-3.5 w-3.5" /> },
  in_review: { label: 'U pregledu', color: 'bg-blue-100 text-blue-700', icon: <Eye className="h-3.5 w-3.5" /> },
  approved: { label: 'Odobreno', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  rejected: { label: 'Odbijeno', color: 'bg-red-100 text-red-700', icon: <XCircle className="h-3.5 w-3.5" /> },
  cancelled: { label: 'Otkazano', color: 'bg-gray-200 text-gray-600', icon: <XCircle className="h-3.5 w-3.5" /> },
  returned: { label: 'Vraćeno na dopunu', color: 'bg-orange-100 text-orange-700', icon: <ArrowRight className="h-3.5 w-3.5" /> },
}

const typeConfig: Record<string, { label: string; color: string; icon: string }> = {
  vacation: { label: 'Godišnji odmor', color: 'bg-emerald-50 text-emerald-700', icon: '🏖️' },
  expense: { label: 'Troškovi', color: 'bg-amber-50 text-amber-700', icon: '💰' },
  purchase: { label: 'Nabavka', color: 'bg-blue-50 text-blue-700', icon: '📦' },
  travel: { label: 'Putovanje', color: 'bg-purple-50 text-purple-700', icon: '✈️' },
  overtime: { label: 'Prekovremeni rad', color: 'bg-red-50 text-red-700', icon: '⏰' },
  equipment: { label: 'Oprema', color: 'bg-cyan-50 text-cyan-700', icon: '🖥️' },
  training: { label: 'Edukacija', color: 'bg-indigo-50 text-indigo-700', icon: '📚' },
  other: { label: 'Ostalo', color: 'bg-gray-50 text-gray-700', icon: '📋' },
}

const priorityConfig: Record<string, { label: string; color: string; dotColor: string }> = {
  low: { label: 'Nizak', color: 'bg-gray-100 text-gray-700', dotColor: 'bg-gray-400' },
  medium: { label: 'Srednji', color: 'bg-blue-100 text-blue-700', dotColor: 'bg-blue-400' },
  high: { label: 'Visok', color: 'bg-orange-100 text-orange-700', dotColor: 'bg-orange-400' },
  urgent: { label: 'Hitno', color: 'bg-red-100 text-red-700', dotColor: 'bg-red-400' },
}

const mockRequests: ApprovalRequest[] = [
  {
    id: 'apr-1', title: 'Godišnji odmor - Jul 2025', description: 'Zahtev za godišnji odmor u periodu od 1-15. jula 2025. godine. Potrebno je osigurati zamenu za projekat ABC.',
    type: 'vacation', priority: 'medium', status: 'pending', requestedBy: 'Marko Petrović', requestedByRole: 'Senior Developer',
    assignedTo: 'Ana Nikolić', assignedToRole: 'Team Lead', startDate: '2025-07-01', endDate: '2025-07-15',
    comments: [
      { id: 'c1', author: 'Ana Nikolić', content: 'Potrebno je proveriti raspored projekta pre odobrenja.', createdAt: '2025-01-18T10:00:00' },
    ],
    history: [
      { action: 'Kreiran', performedBy: 'Marko Petrović', timestamp: '2025-01-17T09:00:00' },
      { action: 'Dodeljen', performedBy: 'Sistem', timestamp: '2025-01-17T09:00:01', note: 'Auto-dodela prema hijerarhiji' },
    ],
    createdAt: '2025-01-17T09:00:00', updatedAt: '2025-01-18T10:00:00',
  },
  {
    id: 'apr-2', title: 'Nabavka monitora za developere', description: 'Potrebno je nabaviti 4 monitora 27" 4K za developere u timu. Procenjena vrednost: 1.200 EUR.',
    type: 'purchase', priority: 'high', status: 'in_review', requestedBy: 'Jelena Stanković', requestedByRole: 'Engineering Manager',
    assignedTo: 'Petar Jovanović', assignedToRole: 'CTO', amount: 1200, currency: 'EUR',
    comments: [
      { id: 'c2', author: 'Petar Jovanović', content: 'Da li smo proverili alternative iz offline prodaje?', createdAt: '2025-01-18T14:00:00' },
      { id: 'c3', author: 'Jelena Stanković', content: 'Da, provjereno - online je 15% jeftinije.', createdAt: '2025-01-18T14:30:00' },
    ],
    history: [
      { action: 'Kreiran', performedBy: 'Jelena Stanković', timestamp: '2025-01-16T11:00:00' },
      { action: 'Prebačen u pregled', performedBy: 'Petar Jovanović', timestamp: '2025-01-17T10:00:00' },
    ],
    createdAt: '2025-01-16T11:00:00', updatedAt: '2025-01-18T14:30:00',
  },
  {
    id: 'apr-3', title: 'Putovanje - TechConf 2025 Berlin', description: 'Poslovno putovanje na konferenciju TechConf u Berlinu. Avionska karta, hotel i per diem.',
    type: 'travel', priority: 'medium', status: 'approved', requestedBy: 'Ivan Đorđević', requestedByRole: 'Frontend Developer',
    assignedTo: 'Ana Nikolić', assignedToRole: 'Team Lead', amount: 850, currency: 'EUR',
    startDate: '2025-03-15', endDate: '2025-03-19',
    comments: [
      { id: 'c4', author: 'Ana Nikolić', content: 'Odobreno. Pripremi troškovnik po povratku.', createdAt: '2025-01-15T16:00:00' },
    ],
    history: [
      { action: 'Kreiran', performedBy: 'Ivan Đorđević', timestamp: '2025-01-14T09:00:00' },
      { action: 'Odobreno', performedBy: 'Ana Nikolić', timestamp: '2025-01-15T16:00:00', note: 'U okviru budžeta za edukaciju' },
    ],
    createdAt: '2025-01-14T09:00:00', updatedAt: '2025-01-15T16:00:00', approvedAt: '2025-01-15T16:00:00',
  },
  {
    id: 'apr-4', title: 'Troškovi - reprezentacija januara', description: 'Troškovi za ručak sa klijentom ABC d.o.o. i večeru sa partnerima.',
    type: 'expense', priority: 'low', status: 'approved', requestedBy: 'Marko Petrović', requestedByRole: 'Senior Developer',
    assignedTo: 'Ana Nikolić', assignedToRole: 'Team Lead', amount: 12500, currency: 'RSD',
    comments: [],
    history: [
      { action: 'Kreiran', performedBy: 'Marko Petrović', timestamp: '2025-01-10T08:00:00' },
      { action: 'Odobreno', performedBy: 'Ana Nikolić', timestamp: '2025-01-11T09:00:00' },
    ],
    createdAt: '2025-01-10T08:00:00', updatedAt: '2025-01-11T09:00:00', approvedAt: '2025-01-11T09:00:00',
  },
  {
    id: 'apr-5', title: 'Edukacija - AWS Solutions Architect', description: 'Zahtev za finansiranje sertifikacionog ispita AWS Solutions Architect. Ispit košta 300 USD.',
    type: 'training', priority: 'medium', status: 'rejected', requestedBy: 'Nikola Ilić', requestedByRole: 'DevOps Engineer',
    assignedTo: 'Petar Jovanović', assignedToRole: 'CTO', amount: 300, currency: 'USD',
    comments: [
      { id: 'c5', author: 'Petar Jovanović', content: 'Odbijeno za ovaj kvartal. Razmotrićemo u Q2.', createdAt: '2025-01-16T11:00:00' },
    ],
    history: [
      { action: 'Kreiran', performedBy: 'Nikola Ilić', timestamp: '2025-01-15T10:00:00' },
      { action: 'Odbijeno', performedBy: 'Petar Jovanović', timestamp: '2025-01-16T11:00:00', note: 'Nema budžeta za Q1' },
    ],
    createdAt: '2025-01-15T10:00:00', updatedAt: '2025-01-16T11:00:00', rejectedAt: '2025-01-16T11:00:00',
  },
  {
    id: 'apr-6', title: 'Prekovremeni rad - mart 2025', description: 'Prekovremeni rad na hitnom projektu za klijenta XYZ. Ukupno 12 sati prekovremenog rada.',
    type: 'overtime', priority: 'urgent', status: 'pending', requestedBy: 'Jelena Stanković', requestedByRole: 'Engineering Manager',
    assignedTo: 'Petar Jovanović', assignedToRole: 'CTO',
    comments: [],
    history: [
      { action: 'Kreiran', performedBy: 'Jelena Stanković', timestamp: '2025-01-18T16:00:00' },
    ],
    createdAt: '2025-01-18T16:00:00', updatedAt: '2025-01-18T16:00:00',
  },
]

const mockTemplates: ApprovalTemplate[] = [
  { id: 'tpl-1', name: 'Godišnji odmor', description: 'Standardni zahtev za godišnji odmor zaposlenog', type: 'vacation', requiredFields: ['startDate', 'endDate', 'description'], approverRole: 'Team Lead', isActive: true, usageCount: 45 },
  { id: 'tpl-2', name: 'Troškovi', description: 'Zahtev za refundaciju poslovnih troškova', type: 'expense', requiredFields: ['amount', 'currency', 'description'], approverRole: 'Team Lead', isActive: true, usageCount: 128 },
  { id: 'tpl-3', name: 'Nabavka', description: 'Zahtev za nabavku opreme ili materijala', type: 'purchase', requiredFields: ['amount', 'currency', 'description'], approverRole: 'CTO', isActive: true, usageCount: 32 },
  { id: 'tpl-4', name: 'Putovanje', description: 'Zahtev za poslovno putovanje', type: 'travel', requiredFields: ['startDate', 'endDate', 'amount', 'currency'], approverRole: 'Team Lead', isActive: true, usageCount: 18 },
  { id: 'tpl-5', name: 'Edukacija', description: 'Zahtev za sertifikaciju ili kurs', type: 'training', requiredFields: ['amount', 'currency', 'description'], approverRole: 'CTO', isActive: true, usageCount: 22 },
  { id: 'tpl-6', name: 'Prekovremeni rad', description: 'Prijavljivanje prekovremenog rada', type: 'overtime', requiredFields: ['description'], approverRole: 'Engineering Manager', isActive: false, usageCount: 8 },
]

const mockDashboard: ApprovalDashboard = {
  totalRequests: 156,
  pendingRequests: 23,
  approvedRequests: 112,
  rejectedRequests: 14,
  avgResponseHours: 18.5,
  myPendingCount: 5,
  urgentPendingCount: 3,
  requestsByType: [
    { type: 'vacation', count: 45, label: 'Godišnji odmor' },
    { type: 'expense', count: 48, label: 'Troškovi' },
    { type: 'purchase', count: 22, label: 'Nabavka' },
    { type: 'travel', count: 15, label: 'Putovanje' },
    { type: 'training', count: 12, label: 'Edukacija' },
    { type: 'overtime', count: 8, label: 'Prekovremeni' },
    { type: 'equipment', count: 6, label: 'Oprema' },
  ],
  requestsByPriority: [
    { priority: 'low', count: 35 },
    { priority: 'medium', count: 78 },
    { priority: 'high', count: 33 },
    { priority: 'urgent', count: 10 },
  ],
  recentRequests: mockRequests.slice(0, 3),
  monthlyTrend: [
    { month: 'Avg', approved: 12, rejected: 2 },
    { month: 'Sep', approved: 15, rejected: 1 },
    { month: 'Okt', approved: 18, rejected: 3 },
    { month: 'Nov', approved: 14, rejected: 2 },
    { month: 'Dec', approved: 10, rejected: 1 },
    { month: 'Jan', approved: 8, rejected: 2 },
  ],
}

const formatCurrency = (val: number, currency: string = 'RSD') => {
  if (currency === 'EUR') return `€${val.toLocaleString('sr-RS', { minimumFractionDigits: 2 })}`
  if (currency === 'USD') return `$${val.toLocaleString('sr-RS', { minimumFractionDigits: 2 })}`
  return `${val.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD`
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Odobrenja() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [requests, setRequests] = useState<ApprovalRequest[]>([])
  const [templates, setTemplates] = useState<ApprovalTemplate[]>([])
  const [dashboard, setDashboard] = useState<ApprovalDashboard | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [commentInput, setCommentInput] = useState('')
  const [rejectNote, setRejectNote] = useState('')
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selected, setSelected] = useState<ApprovalRequest | null>(null)

  // Forms
  const emptyForm = {
    title: '', description: '', type: 'vacation', priority: 'medium',
    requestedBy: '', assignedTo: '', amount: '', currency: 'RSD',
    startDate: '', endDate: '',
  }
  const [form, setForm] = useState(emptyForm)

  // ─── Data Loading ───────────────────────────────────────────────────────

  const loadRequests = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/approvals?companyId=${activeCompanyId}&limit=100`)
      if (res.ok) {
        const data = await res.json()
        setRequests(data.items?.length ? data.items : mockRequests)
      } else {
        setRequests(mockRequests)
      }
    } catch {
      setRequests(mockRequests)
    }
    setLoading(false)
  }, [activeCompanyId])

  const loadTemplates = useCallback(async () => {
    try {
      setTemplates(mockTemplates)
    } catch {
      setTemplates(mockTemplates)
    }
  }, [])

  const loadDashboard = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/approvals/dashboard?companyId=${activeCompanyId}`)
      if (res.ok) {
        const data = await res.json()
        setDashboard(data)
      } else {
        setDashboard(mockDashboard)
      }
    } catch {
      setDashboard(mockDashboard)
    }
  }, [activeCompanyId])

  useEffect(() => {
    loadRequests()
    loadTemplates()
    loadDashboard()
  }, [activeCompanyId, loadRequests, loadTemplates, loadDashboard])

  // ─── Computed ───────────────────────────────────────────────────────────

  const filteredRequests = requests.filter((r) => {
    if (activeTab === 'my_requests' && r.requestedBy !== 'Marko Petrović') return false
    if (activeTab === 'pending' && r.status !== 'pending' && r.status !== 'in_review') return false
    if (activeTab === 'approved' && r.status !== 'approved') return false
    if (activeTab === 'rejected' && r.status !== 'rejected') return false
    if (search) {
      const s = search.toLowerCase()
      if (!r.title.toLowerCase().includes(s) && !r.description.toLowerCase().includes(s) && !r.requestedBy.toLowerCase().includes(s)) return false
    }
    if (typeFilter !== 'all' && r.type !== typeFilter) return false
    if (priorityFilter !== 'all' && r.priority !== priorityFilter) return false
    return true
  })

  // ─── Handlers ───────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!activeCompanyId || !form.title.trim()) return
    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: activeCompanyId,
          ...form,
          amount: form.amount ? parseFloat(form.amount) : undefined,
          status: 'pending',
          comments: [],
          history: [{ action: 'Kreiran', performedBy: form.requestedBy || 'Trenutni korisnik', timestamp: new Date().toISOString() }],
        }),
      })
      if (res.ok) {
        setDialogOpen(false)
        setForm(emptyForm)
        loadRequests()
        loadDashboard()
      }
    } catch { /* silent */ }
  }

  const handleApprove = async () => {
    if (!selected) return
    try {
      const res = await fetch('/api/approvals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selected.id,
          status: 'approved',
          approvedAt: new Date().toISOString(),
        }),
      })
      if (res.ok) {
        loadRequests()
        loadDashboard()
        setSelected(null)
        setDetailOpen(false)
      }
    } catch { /* silent */ }
  }

  const handleReject = async () => {
    if (!selected) return
    try {
      const res = await fetch('/api/approvals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selected.id,
          status: 'rejected',
          rejectedAt: new Date().toISOString(),
          rejectNote: rejectNote,
        }),
      })
      if (res.ok) {
        setRejectDialogOpen(false)
        setRejectNote('')
        loadRequests()
        loadDashboard()
        setSelected(null)
        setDetailOpen(false)
      }
    } catch { /* silent */ }
  }

  const handleReturn = async () => {
    if (!selected) return
    try {
      const res = await fetch('/api/approvals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id, status: 'returned' }),
      })
      if (res.ok) {
        loadRequests()
        loadDashboard()
        setSelected(null)
        setDetailOpen(false)
      }
    } catch { /* silent */ }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati zahtev za odobrenje?')) return
    try {
      const res = await fetch(`/api/approvals?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        loadRequests()
        loadDashboard()
      }
    } catch { /* silent */ }
  }

  const handleAddComment = async () => {
    if (!selected || !commentInput.trim()) return
    const newComment: ApprovalComment = {
      id: `c-${Date.now()}`,
      author: 'Trenutni korisnik',
      content: commentInput.trim(),
      createdAt: new Date().toISOString(),
    }
    setSelected({
      ...selected,
      comments: [...selected.comments, newComment],
    })
    setCommentInput('')
    try {
      await fetch('/api/approvals/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: selected.id, ...newComment }),
      })
    } catch { /* silent */ }
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Odobrenja</h1>
          <p className="text-sm text-muted-foreground">Upravljanje zahtevima za odobrenje i radnim tokovima</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { loadRequests(); loadDashboard(); }}>
            <RefreshCw className="h-4 w-4 mr-1" /> Osveži
          </Button>
          <Button size="sm" onClick={() => { setForm(emptyForm); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Novi zahtev
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="my_requests"><UserCheck className="h-4 w-4 mr-1" /> Moji zahtevi</TabsTrigger>
          <TabsTrigger value="pending"><Clock className="h-4 w-4 mr-1" /> Na čekanju</TabsTrigger>
          <TabsTrigger value="approved"><CheckCircle2 className="h-4 w-4 mr-1" /> Odobreni</TabsTrigger>
          <TabsTrigger value="rejected"><XCircle className="h-4 w-4 mr-1" /> Odbijeni</TabsTrigger>
          <TabsTrigger value="templates"><Settings className="h-4 w-4 mr-1" /> Šabloni</TabsTrigger>
        </TabsList>

        {/* ─── Pregled Tab ─────────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-6">
          {!dashboard ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Na čekanju</span>
                    <Clock className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-amber-600">{dashboard.pendingRequests}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{dashboard.urgentPendingCount} hitnih</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Odobreno</span>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{dashboard.approvedRequests}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{dashboard.totalRequests > 0 ? Math.round((dashboard.approvedRequests / dashboard.totalRequests) * 100) : 0}% ukupno</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Odbijeno</span>
                    <XCircle className="h-4 w-4 text-red-500" />
                  </div>
                  <p className="text-2xl font-bold text-red-600">{dashboard.rejectedRequests}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{dashboard.totalRequests > 0 ? Math.round((dashboard.rejectedRequests / dashboard.totalRequests) * 100) : 0}% ukupno</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Prosečno vreme odgovora</span>
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold">{dashboard.avgResponseHours}h</p>
                  <p className="text-[10px] text-muted-foreground mt-1">mojih na čekanju: {dashboard.myPendingCount}</p>
                </Card>
              </div>

              {/* Approval Rate Progress */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Stopa odobravanja</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Odobreni zahtevi</span>
                      <span className="font-medium">{dashboard.approvedRequests} / {dashboard.totalRequests}</span>
                    </div>
                    <Progress value={dashboard.totalRequests > 0 ? (dashboard.approvedRequests / dashboard.totalRequests) * 100 : 0} className="h-3" />
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>🟢 Odobreno: {dashboard.approvedRequests}</span>
                      <span>🔴 Odbijeno: {dashboard.rejectedRequests}</span>
                      <span>🟡 Na čekanju: {dashboard.pendingRequests}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* By Type */}
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Po tipu</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {dashboard.requestsByType.map((tp) => {
                      const cfg = typeConfig[tp.type]
                      const maxCount = Math.max(...dashboard.requestsByType.map((r) => r.count))
                      return (
                        <div key={tp.type} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>{cfg?.icon}</span>
                            <span className="text-sm">{tp.label}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div className="h-2 rounded-full bg-primary" style={{ width: `${(tp.count / maxCount) * 100}%` }} />
                            </div>
                            <span className="text-sm font-medium w-6 text-right">{tp.count}</span>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                {/* By Priority */}
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Po prioritetu</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {dashboard.requestsByPriority.map((pr) => {
                      const cfg = priorityConfig[pr.priority]
                      const maxCount = Math.max(...dashboard.requestsByPriority.map((r) => r.count))
                      return (
                        <div key={pr.priority} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${cfg?.dotColor}`} />
                            <span className="text-sm">{cfg?.label}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div className="h-2 rounded-full" style={{ width: `${(pr.count / maxCount) * 100}%`, backgroundColor: cfg?.dotColor }} />
                            </div>
                            <span className="text-sm font-medium w-6 text-right">{pr.count}</span>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Trend */}
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Mesečni trend</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-end gap-4 h-40">
                    {dashboard.monthlyTrend.map((m) => {
                      const maxVal = Math.max(...dashboard.monthlyTrend.map((t) => Math.max(t.approved, t.rejected)))
                      return (
                        <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full flex gap-1 items-end justify-center" style={{ height: '120px' }}>
                            <div className="w-5 bg-green-400 rounded-t" style={{ height: `${maxVal > 0 ? (m.approved / maxVal) * 100 : 0}%` }} title={`Odobreno: ${m.approved}`} />
                            <div className="w-5 bg-red-400 rounded-t" style={{ height: `${maxVal > 0 ? (m.rejected / maxVal) * 100 : 0}%` }} title={`Odbijeno: ${m.rejected}`} />
                          </div>
                          <span className="text-[10px] text-muted-foreground">{m.month}</span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-400 rounded" /> Odobreno</span>
                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-400 rounded" /> Odbijeno</span>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Requests */}
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Nedavni zahtevi</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {dashboard.recentRequests.map((r) => {
                      const sCfg = statusConfig[r.status]
                      const tCfg = typeConfig[r.type]
                      return (
                        <div key={r.id} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{tCfg?.icon}</span>
                            <div>
                              <p className="text-sm font-medium">{r.title}</p>
                              <p className="text-xs text-muted-foreground">{r.requestedBy} · {new Date(r.createdAt).toLocaleDateString('sr-RS')}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className={`text-[10px] ${sCfg?.color}`}>{sCfg?.label}</Badge>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ─── Generic Request List Tabs ────────────────────────────────── */}
        {['my_requests', 'pending', 'approved', 'rejected'].map((tabKey) => (
          <TabsContent key={tabKey} value={tabKey} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Pretraži zahteve..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Svi tipovi" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi tipovi</SelectItem>
                  {Object.entries(typeConfig).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Svi prioriteti" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi prioriteti</SelectItem>
                  {Object.entries(priorityConfig).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : filteredRequests.length === 0 ? (
              <Card className="p-8 text-center">
                <FileSignature className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">Nema zahteva</p>
                {tabKey === 'my_requests' && (
                  <Button variant="outline" className="mt-3" onClick={() => { setForm(emptyForm); setDialogOpen(true); }}>
                    <Plus className="h-4 w-4 mr-1" /> Kreiraj zahtev
                  </Button>
                )}
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredRequests.map((r) => {
                  const sCfg = statusConfig[r.status]
                  const tCfg = typeConfig[r.type]
                  const pCfg = priorityConfig[r.priority]
                  return (
                    <Card key={r.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelected(r); setDetailOpen(true); }}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <span className="text-2xl mt-0.5">{tCfg?.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-sm font-medium truncate">{r.title}</h3>
                                <Badge variant="outline" className={`text-[10px] shrink-0 ${sCfg?.color}`}>{sCfg?.label}</Badge>
                                <Badge variant="outline" className={`text-[10px] shrink-0 ${pCfg?.color}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${pCfg?.dotColor} mr-1`} />
                                  {pCfg?.label}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1">{r.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>{r.requestedBy}</span>
                                <span>→ {r.assignedTo}</span>
                                {r.amount && <span className="font-medium text-foreground">{formatCurrency(r.amount, r.currency)}</span>}
                                <span>{new Date(r.createdAt).toLocaleDateString('sr-RS')}</span>
                                {r.comments.length > 0 && (
                                  <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {r.comments.length}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1 ml-2 shrink-0">
                            {(r.status === 'pending' || r.status === 'in_review') && (
                              <>
                                <Button size="sm" variant="outline" className="h-7 text-xs text-green-600 border-green-200 hover:bg-green-50" onClick={(e) => { e.stopPropagation(); setSelected(r); handleApprove(); }}>
                                  <CheckCircle2 className="h-3 w-3 mr-1" /> Odobri
                                </Button>
                                <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); setSelected(r); setRejectDialogOpen(true); }}>
                                  <XCircle className="h-3 w-3 mr-1" /> Odbij
                                </Button>
                              </>
                            )}
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        ))}

        {/* ─── Šabloni Tab ─────────────────────────────────────────────── */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Predefinisani šabloni za brzo kreiranje zahteva</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((tpl) => {
              const tCfg = typeConfig[tpl.type]
              return (
                <Card key={tpl.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{tCfg?.icon}</span>
                        <div>
                          <h3 className="text-sm font-medium">{tpl.name}</h3>
                          <Badge variant="outline" className={`text-[10px] ${tCfg?.color}`}>{tCfg?.label}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!tpl.isActive && <Badge variant="outline" className="text-[10px] bg-gray-100">Neaktivan</Badge>}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{tpl.description}</p>
                    <div className="space-y-1 mb-3">
                      <p className="text-[10px] text-muted-foreground">Obavezna polja:</p>
                      <div className="flex flex-wrap gap-1">
                        {tpl.requiredFields.map((f) => (
                          <Badge key={f} variant="secondary" className="text-[10px]">{f}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">Korišćeno {tpl.usageCount} puta</span>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => {
                        setForm({ ...emptyForm, type: tpl.type, title: tpl.name, assignedTo: tpl.approverRole })
                        setDialogOpen(true)
                      }}>
                        <Plus className="h-3 w-3 mr-1" /> Koristi
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── Create Request Dialog ────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novi zahtev za odobrenje</DialogTitle>
            <DialogDescription>Popunite formu za podnošenje zahteva</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Naslov zahteva</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Naslov zahteva..." />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tip</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeConfig).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prioritet</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityConfig).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Zahtevač</Label>
                <Input value={form.requestedBy} onChange={(e) => setForm({ ...form, requestedBy: e.target.value })} placeholder="Ime" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Opis</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Detaljan opis zahteva..." />
            </div>
            <Separator />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Iznos</Label>
                <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label>Valuta</Label>
                <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RSD">RSD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Datum početka</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Datum završetka</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Odobritelj</Label>
              <Input value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} placeholder="Ko odobrava?" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleCreate}><Send className="h-4 w-4 mr-1" /> Podnesi zahtev</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Detail Dialog ────────────────────────────────────────────────── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalji zahteva</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-6">
              {/* Status Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{typeConfig[selected.type]?.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold">{selected.title}</h3>
                    <p className="text-sm text-muted-foreground">{typeConfig[selected.type]?.label} · {priorityConfig[selected.priority]?.label}</p>
                  </div>
                </div>
                <Badge variant="outline" className={`text-xs ${statusConfig[selected.status]?.color}`}>
                  {statusConfig[selected.status]?.icon} {statusConfig[selected.status]?.label}
                </Badge>
              </div>

              <Separator />

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Zahtevač:</span>
                  <p className="font-medium">{selected.requestedBy}</p>
                  <p className="text-xs text-muted-foreground">{selected.requestedByRole}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Odobritelj:</span>
                  <p className="font-medium">{selected.assignedTo}</p>
                  <p className="text-xs text-muted-foreground">{selected.assignedToRole}</p>
                </div>
                {selected.amount && (
                  <div>
                    <span className="text-muted-foreground">Iznos:</span>
                    <p className="font-bold text-lg">{formatCurrency(selected.amount, selected.currency)}</p>
                  </div>
                )}
                {selected.startDate && (
                  <div>
                    <span className="text-muted-foreground">Period:</span>
                    <p className="font-medium">{new Date(selected.startDate).toLocaleDateString('sr-RS')}{selected.endDate ? ` - ${new Date(selected.endDate).toLocaleDateString('sr-RS')}` : ''}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Kreirano:</span>
                  <p>{new Date(selected.createdAt).toLocaleString('sr-RS')}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Ažurirano:</span>
                  <p>{new Date(selected.updatedAt).toLocaleString('sr-RS')}</p>
                </div>
              </div>

              {selected.description && (
                <div>
                  <span className="text-sm text-muted-foreground">Opis:</span>
                  <p className="text-sm mt-1 whitespace-pre-line">{selected.description}</p>
                </div>
              )}

              <Separator />

              {/* History */}
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <ListChecks className="h-4 w-4" /> Istorija
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selected.history.map((h, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm py-1.5 border-l-2 border-muted pl-3">
                      <div>
                        <p className="font-medium">{h.action} <span className="text-muted-foreground font-normal">— {h.performedBy}</span></p>
                        <p className="text-xs text-muted-foreground">{new Date(h.timestamp).toLocaleString('sr-RS')}</p>
                        {h.note && <p className="text-xs text-muted-foreground mt-0.5 italic">{h.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Comments */}
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> Komentari ({selected.comments.length})
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                  {selected.comments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Nema komentara</p>
                  ) : (
                    selected.comments.map((c) => (
                      <div key={c.id} className="p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{c.author}</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(c.createdAt).toLocaleString('sr-RS')}</span>
                        </div>
                        <p className="text-sm">{c.content}</p>
                      </div>
                    ))
                  )}
                </div>
                {(selected.status === 'pending' || selected.status === 'in_review') && (
                  <div className="flex gap-2">
                    <Input value={commentInput} onChange={(e) => setCommentInput(e.target.value)} placeholder="Dodaj komentar..." className="flex-1"
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(); }} />
                    <Button size="sm" onClick={handleAddComment}><Send className="h-4 w-4" /></Button>
                  </div>
                )}
              </div>

              {/* Actions */}
              {(selected.status === 'pending' || selected.status === 'in_review') && (
                <>
                  <Separator />
                  <div className="flex gap-3">
                    <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleApprove}>
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Odobri
                    </Button>
                    <Button className="flex-1 bg-orange-500 hover:bg-orange-600" onClick={handleReturn}>
                      <ArrowRight className="h-4 w-4 mr-2" /> Vrati na dopunu
                    </Button>
                    <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => setRejectDialogOpen(true)}>
                      <XCircle className="h-4 w-4 mr-2" /> Odbij
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Reject Dialog ────────────────────────────────────────────────── */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Odbij zahtev</DialogTitle>
            <DialogDescription>Navedite razlog odbijanja zahteva</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Odbijanje zahteva će obavestiti zahtevača. Razlog će biti vidljiv u istoriji.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label>Razlog odbijanja</Label>
              <Textarea value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} rows={3} placeholder="Razlog odbijanja..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Otkaži</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleReject}>
              <XCircle className="h-4 w-4 mr-1" /> Potvrdi odbijanje
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
