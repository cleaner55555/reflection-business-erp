'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Upload,
  Download,
  History,
  FileSpreadsheet,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Sparkles,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  UploadCloud,
  X,
  Plug,
  RefreshCw,
  Play,
  Square,
  Zap,
  Plus,
  Edit2,
  Globe,
  Eye,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/lib/i18n'
import { MigrationWizard } from '@/components/modules/MigrationWizard'

// ==================== TYPES ====================

type EntityType = 'partners' | 'products' | 'transactions' | 'contacts'
type SourceType = 'custom' | 'external_accounting_1' | 'external_accounting_2' | 'external_accounting_3' | 'einvoice_system' | 'enterprise_erp' | 'reflection'
type ImportStep = 1 | 2 | 3
type JobStatus = 'completed' | 'partial' | 'failed' | 'pending'

interface EntityField {
  key: string
  label: string
  required: boolean
}

interface ParsedFile {
  columns: string[]
  rows: Record<string, string>[]
  totalRows: number
  fileName: string
}

interface ImportError {
  row: number
  field: string
  message: string
}

interface ImportResult {
  totalRows: number
  successRows: number
  failedRows: number
  status: JobStatus
  errors?: ImportError[]
}

interface IntegrationJob {
  id: string
  type: 'import' | 'export'
  entityType: string
  source: string
  status: JobStatus
  totalRows: number
  successRows: number
  failedRows: number
  errors: string | null
  createdAt: string
  fileName?: string | null
}

interface SyncConnector {
  id: string
  name: string
  type: string
  direction: string
  isActive: boolean
  status: string
  hostUrl: string | null
  apiKey: string | null
  username: string | null
  database: string | null
  syncInterval: number
  syncEntities: string
  lastSyncAt: string | null
  lastSyncStatus: string | null
  totalSyncs: number
  totalRecords: number
  notes: string | null
  createdAt: string
}

const CONNECTOR_TYPES: Record<string, string> = {
  external_accounting_1: 'Spoljni knjigovodstveni sistem 1',
  external_accounting_2: 'Spoljni knjigovodstveni sistem 2',
  external_accounting_3: 'Spoljni knjigovodstveni sistem 3',
  einvoice_system: 'eFakturisanje (SEF)',
  enterprise_erp: 'Enterprise ERP',
  external_accounting_4: 'Spoljni knjigovodstveni sistem 4',
  custom_api: 'Custom API',
}

const ENTITY_OPTIONS = [
  { value: 'partners', label: 'Partners' },
  { value: 'products', label: 'Products' },
  { value: 'transactions', label: 'Transactions' },
  { value: 'contacts', label: 'Contacts' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'stock', label: 'Stock' },
  { value: 'employees', label: 'Employees' },
]

// ==================== ENTITY FIELDS ====================

const ENTITY_FIELDS: Record<EntityType, EntityField[]> = {
  partners: [
    { key: 'name', label: 'Name (naziv)', required: true },
    { key: 'pib', label: 'PIB', required: false },
    { key: 'maticniBr', label: 'Matični broj', required: false },
    { key: 'address', label: 'Address', required: false },
    { key: 'city', label: 'City', required: false },
    { key: 'zipCode', label: 'Zip code', required: false },
    { key: 'phone', label: 'Phone', required: false },
    { key: 'email', label: 'Email', required: false },
    { key: 'type', label: 'Type (kupac/dobavljac)', required: false },
    { key: 'account', label: 'Bank account', required: false },
    { key: 'bank', label: 'Bank', required: false },
    { key: 'notes', label: 'Notes', required: false },
  ],
  products: [
    { key: 'name', label: 'Name (naziv)', required: true },
    { key: 'sku', label: 'SKU (šifra)', required: true },
    { key: 'barcode', label: 'Barcode', required: false },
    { key: 'category', label: 'Category', required: false },
    { key: 'unit', label: 'Unit (kom/kg/l)', required: false },
    { key: 'purchasePrice', label: 'Purchase price', required: false },
    { key: 'sellingPrice', label: 'Selling price', required: false },
    { key: 'minStock', label: 'Min stock', required: false },
    { key: 'currentStock', label: 'Current stock', required: false },
    { key: 'description', label: 'Description', required: false },
  ],
  transactions: [
    { key: 'date', label: 'Date', required: true },
    { key: 'type', label: 'Type (prihod/rashod)', required: true },
    { key: 'category', label: 'Category', required: true },
    { key: 'amount', label: 'Amount', required: true },
    { key: 'description', label: 'Description', required: true },
    { key: 'documentRef', label: 'Document ref', required: false },
  ],
  contacts: [
    { key: 'firstName', label: 'First name', required: true },
    { key: 'lastName', label: 'Last name', required: true },
    { key: 'email', label: 'Email', required: false },
    { key: 'phone', label: 'Phone', required: false },
    { key: 'position', label: 'Position', required: false },
    { key: 'company', label: 'Company', required: false },
    { key: 'notes', label: 'Notes', required: false },
    { key: 'tags', label: 'Tags', required: false },
  ],
}

// ==================== MAIN COMPONENT ====================

export function Integracije() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('integrations.title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t('integrations.subtitle')}
        </p>
      </div>

      <Tabs defaultValue="connections" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="connections" className="gap-1.5">
            <Plug className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('integrations.tab_connections')}</span>
          </TabsTrigger>
          <TabsTrigger value="migration" className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('integrations.tab_migration')}</span>
          </TabsTrigger>
          <TabsTrigger value="import" className="gap-1.5">
            <Upload className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('integrations.tab_import')}</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('integrations.tab_export')}</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <History className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('integrations.tab_history')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections">
          <ConnectionsTab />
        </TabsContent>
        <TabsContent value="migration">
          <MigrationWizard />
        </TabsContent>
        <TabsContent value="import">
          <ImportWizard />
        </TabsContent>
        <TabsContent value="export">
          <ExportTab />
        </TabsContent>
        <TabsContent value="history">
          <HistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ==================== CONNECTIONS TAB ====================

function ConnectionsTab() {
  const { t } = useTranslation()
  const [connectors, setConnectors] = useState<SyncConnector[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)
  const [syncing, setSyncing] = useState<string | null>(null)

  // Form state
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState('external_accounting_1')
  const [formDirection, setFormDirection] = useState('import')
  const [formHostUrl, setFormHostUrl] = useState('')
  const [formApiKey, setFormApiKey] = useState('')
  const [formUsername, setFormUsername] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formDatabase, setFormDatabase] = useState('')
  const [formInterval, setFormInterval] = useState(60)
  const [formEntities, setFormEntities] = useState<string[]>(['partners', 'products'])
  const [formNotes, setFormNotes] = useState('')

  const fetchConnectors = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/integrations/connectors')
      if (res.ok) setConnectors(await res.json())
    } catch { /* silent */ } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchConnectors() }, [fetchConnectors])

  const resetForm = () => {
    setFormName('')
    setFormType('external_accounting_1')
    setFormDirection('import')
    setFormHostUrl('')
    setFormApiKey('')
    setFormUsername('')
    setFormPassword('')
    setFormDatabase('')
    setFormInterval(60)
    setFormEntities(['partners', 'products'])
    setFormNotes('')
    setEditingId(null)
  }

  const handleAdd = () => { resetForm(); setViewMode('form') }

  const handleEdit = (c: SyncConnector) => {
    setEditingId(c.id)
    setFormName(c.name)
    setFormType(c.type)
    setFormDirection(c.direction)
    setFormHostUrl(c.hostUrl || '')
    setFormApiKey(c.apiKey || '')
    setFormUsername(c.username || '')
    setFormPassword('')
    setFormDatabase(c.database || '')
    setFormInterval(c.syncInterval)
    setFormEntities(JSON.parse(c.syncEntities || '[]'))
    setFormNotes(c.notes || '')
    setViewMode('form')
  }

  const handleSave = async () => {
    if (!formName.trim()) { toast.error(t('common.requiredField', 'Name')); return }
    if (formEntities.length === 0) { toast.error('Select at least one entity'); return }
    setSaving(true)
    try {
      const body = {
        name: formName,
        type: formType,
        direction: formDirection,
        hostUrl: formHostUrl || null,
        apiKey: formApiKey || null,
        username: formUsername || null,
        password: formPassword || null,
        database: formDatabase || null,
        syncInterval: formInterval,
        syncEntities: JSON.stringify(formEntities),
        notes: formNotes || null,
      }
      const url = editingId ? `/api/integrations/connectors/${editingId}` : '/api/integrations/connectors'
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast.success(t('integrations.connectorSaved'))
        resetForm()
        setViewMode('list')
        fetchConnectors()
      } else {
        const err = await res.json()
        toast.error(err.error || t('common.error'))
      }
    } catch { toast.error(t('common.error')) } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirmDelete'))) return
    try {
      const res = await fetch(`/api/integrations/connectors/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success(t('integrations.connectorDeleted'))
        fetchConnectors()
      }
    } catch { toast.error(t('common.deleteError')) }
  }

  const handleTest = async (id: string) => {
    setTesting(id)
    try {
      const res = await fetch(`/api/integrations/connectors/${id}/test`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        toast.success(`${t('integrations.testSuccess')} (${data.latency}${t('integrations.latencyMs')})`)
      } else {
        toast.error(t('integrations.testFailed'))
      }
      fetchConnectors()
    } catch { toast.error(t('common.error')) } finally { setTesting(null) }
  }

  const handleSync = async (id: string) => {
    setSyncing(id)
    try {
      const res = await fetch(`/api/integrations/connectors/${id}/sync`, { method: 'POST' })
      if (res.ok) {
        toast.success(t('integrations.syncCompleted'))
        fetchConnectors()
      } else {
        toast.error(t('integrations.syncFailed'))
      }
    } catch { toast.error(t('integrations.syncFailed')) } finally { setSyncing(null) }
  }

  const toggleActive = async (connector: SyncConnector) => {
    const newActive = !connector.isActive
    const newStatus = newActive ? 'connected' : 'disconnected'
    try {
      const res = await fetch(`/api/integrations/connectors/${connector.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newActive, status: newStatus }),
      })
      if (res.ok) fetchConnectors()
    } catch { /* silent */ }
  }

  const toggleEntity = (entity: string) => {
    setFormEntities(prev =>
      prev.includes(entity) ? prev.filter(e => e !== entity) : [...prev, entity]
    )
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-emerald-500'
      case 'syncing': return 'bg-blue-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleString('sr-RS', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  const getNextSync = (connector: SyncConnector) => {
    if (!connector.isActive || connector.status !== 'connected') return '—'
    const last = connector.lastSyncAt ? new Date(connector.lastSyncAt).getTime() : 0
    const next = new Date(last + connector.syncInterval * 60 * 1000)
    return next.toLocaleString('sr-RS', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  // FORM VIEW
  if (viewMode === 'form') {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { resetForm(); setViewMode('list') }}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-base font-semibold">
                {editingId ? t('integrations.editConnector') : t('integrations.addConnector')}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">{t('integrations.connectorName')} *</Label>
                <input className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formName} onChange={e => setFormName(e.target.value)} placeholder="Spoljni sistem - Test" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('integrations.connectorType')}</Label>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CONNECTOR_TYPES).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('integrations.connectorDirection')}</Label>
                <Select value={formDirection} onValueChange={setFormDirection}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="import">{t('integrations.directionImport')}</SelectItem>
                    <SelectItem value="export">{t('integrations.directionExport')}</SelectItem>
                    <SelectItem value="bidirectional">{t('integrations.directionBidirectional')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('integrations.connectorInterval')}</Label>
                <input type="number" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formInterval} onChange={e => setFormInterval(Number(e.target.value))} min={5} />
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs font-medium mb-3">{t('integrations.connectorHost')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">URL / Host</Label>
                  <input className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formHostUrl} onChange={e => setFormHostUrl(e.target.value)} placeholder="https://api.example.com" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">{t('integrations.connectorApiKey')}</Label>
                  <input type="password" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formApiKey} onChange={e => setFormApiKey(e.target.value)} placeholder="sk-..." />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">{t('integrations.connectorUsername')}</Label>
                  <input className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formUsername} onChange={e => setFormUsername(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">{t('integrations.connectorPassword')}</Label>
                  <input type="password" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formPassword} onChange={e => setFormPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">{t('integrations.connectorDatabase')}</Label>
                  <input className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formDatabase} onChange={e => setFormDatabase(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs font-medium mb-3">{t('integrations.connectorEntities')}</p>
              <div className="flex flex-wrap gap-2">
                {ENTITY_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => toggleEntity(opt.value)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${formEntities.includes(opt.value) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-muted-foreground/30 hover:border-primary/50'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">{t('integrations.connectorNotes')}</Label>
              <textarea className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formNotes} onChange={e => setFormNotes(e.target.value)} />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" size="sm" onClick={() => { resetForm(); setViewMode('list') }}>{t('common.cancel')}</Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plug className="h-3.5 w-3.5" />}
                {saving ? t('common.saving') : t('common.save')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // LIST VIEW
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">{t('integrations.connectionsTitle')}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{t('integrations.directSyncDesc')}</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={handleAdd}>
          <Plus className="h-3.5 w-3.5" />
          {t('integrations.addConnector')}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>
      ) : connectors.length === 0 ? (
        <Card className="py-12">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
              <WifiOff className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-semibold">{t('integrations.noConnectors')}</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">{t('integrations.noConnectorsDesc')}</p>
            <Button size="sm" className="mt-4 gap-1.5" onClick={handleAdd}>
              <Plus className="h-3.5 w-3.5" />
              {t('integrations.addConnector')}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {connectors.map(connector => (
            <Card key={connector.id} className={`relative overflow-hidden ${connector.isActive ? 'border-emerald-200' : ''}`}>
              {/* Status indicator bar */}
              <div className={`absolute top-0 left-0 right-0 h-0.5 ${statusColor(connector.status)}`} />
              <CardHeader className="pb-2 pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${connector.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                      <Globe className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold leading-tight">{connector.name}</CardTitle>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{CONNECTOR_TYPES[connector.type] || connector.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className={`text-[10px] h-5 px-1.5 ${connector.isActive ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-gray-200 text-gray-500'}`}>
                      <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1 ${statusColor(connector.status)}`} />
                      {t(`integrations.status${connector.status.charAt(0).toUpperCase() + connector.status.slice(1)}` as string)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-muted/50 rounded-md p-2">
                    <p className="text-sm font-bold">{connector.totalSyncs}</p>
                    <p className="text-[10px] text-muted-foreground">{t('integrations.totalSyncs')}</p>
                  </div>
                  <div className="bg-muted/50 rounded-md p-2">
                    <p className="text-sm font-bold">{connector.totalRecords}</p>
                    <p className="text-[10px] text-muted-foreground">{t('integrations.totalRecords')}</p>
                  </div>
                  <div className="bg-muted/50 rounded-md p-2">
                    <p className="text-sm font-bold">{connector.syncInterval}m</p>
                    <p className="text-[10px] text-muted-foreground">{t('integrations.connectorInterval')}</p>
                  </div>
                </div>

                {/* Sync info */}
                <div className="flex flex-col gap-1 text-[10px] text-muted-foreground">
                  <div className="flex justify-between">
                    <span>{t('integrations.lastSync')}</span>
                    <span className="font-medium text-foreground">{formatTime(connector.lastSyncAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('integrations.nextSync')}</span>
                    <span className="font-medium text-foreground">{getNextSync(connector)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('integrations.connectorEntities')}</span>
                    <span className="font-medium text-foreground">{JSON.parse(connector.syncEntities || '[]').length} tipova</span>
                  </div>
                </div>

                {/* Direction badge */}
                <div className="flex items-center gap-1.5">
                  <Badge variant="secondary" className="text-[10px] h-5">
                    {connector.direction === 'bidirectional' ? t('integrations.directionBidirectional') : connector.direction === 'export' ? t('integrations.directionExport') : t('integrations.directionImport')}
                  </Badge>
                  {connector.isActive && (
                    <Badge variant="secondary" className="text-[10px] h-5 bg-emerald-50 text-emerald-700 border-emerald-200">
                      <Zap className="h-2.5 w-2.5 mr-0.5" />
                      {t('integrations.autoSync')}
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 pt-1">
                  <Button variant="outline" size="sm" className="h-7 flex-1 gap-1 text-[10px]" onClick={() => handleTest(connector.id)} disabled={testing === connector.id}>
                    {testing === connector.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wifi className="h-3 w-3" />}
                    {t('integrations.testConnection')}
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 flex-1 gap-1 text-[10px]" onClick={() => handleSync(connector.id)} disabled={syncing === connector.id || !connector.isActive}>
                    {syncing === connector.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                    {t('integrations.syncNow')}
                  </Button>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button variant="ghost" size="sm" className="h-7 flex-1 gap-1 text-[10px]" onClick={() => handleEdit(connector)}>
                    <Edit2 className="h-3 w-3" />
                    {t('common.edit')}
                  </Button>
                  <Button variant="ghost" size="sm" className={`h-7 flex-1 gap-1 text-[10px] ${connector.isActive ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'}`} onClick={() => toggleActive(connector)}>
                    {connector.isActive ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    {connector.isActive ? t('integrations.stopSync') : t('integrations.startSync')}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] text-destructive hover:text-destructive" onClick={() => handleDelete(connector.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ==================== IMPORT WIZARD ====================

function ImportWizard() {
  const { t } = useTranslation()
  const [step, setStep] = useState<ImportStep>(1)
  const [parsedFile, setParsedFile] = useState<ParsedFile | null>(null)
  const [entityType, setEntityType] = useState<EntityType>('partners')
  const [source, setSource] = useState<SourceType>('custom')
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [previewData, setPreviewData] = useState<Record<string, string>[]>([])
  const [skipDuplicates, setSkipDuplicates] = useState(true)
  const [updateExisting, setUpdateExisting] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [autoMapping, setAutoMapping] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset mapping when entity type changes
  useEffect(() => {
    setMapping({})
    setImportResult(null)
  }, [entityType])

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error(t('integrations.supportedFormats'))
      return
    }
    setParsing(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/integrations/parse-csv', {
        method: 'POST',
        body: fd,
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('integrations.parsingError'))
        return
      }
      const data: ParsedFile = await res.json()
      setParsedFile(data)
      toast.success(
        `${t('integrations.fileParsed')}: ${data.totalRows} ${t('integrations.rowsFound')}, ${data.columns.length} ${t('integrations.columnsFound')}`
      )
      setStep(2)
    } catch {
      toast.error(t('integrations.parsingError'))
    } finally {
      setParsing(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileUpload(file)
  }

  const handleAutoMap = async () => {
    if (!parsedFile) return
    setAutoMapping(true)
    try {
      const res = await fetch('/api/integrations/ai-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          columns: parsedFile.columns,
          entityType,
        }),
      })
      if (!res.ok) {
        toast.error(t('common.error'))
        return
      }
      const data = await res.json()
      if (data.mapping) {
        setMapping(data.mapping)
        toast.success(t('integrations.autoMap'))
      }
    } catch {
      toast.error(t('common.error'))
    } finally {
      setAutoMapping(false)
    }
  }

  const handlePreview = () => {
    if (!parsedFile) return
    const preview = parsedFile.rows.slice(0, 10)
    setPreviewData(preview)
    setImportResult(null)
    setStep(3)
  }

  const handleStartImport = async () => {
    if (!parsedFile) return
    setImporting(true)
    setImportResult(null)
    try {
      const res = await fetch('/api/integrations/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          source,
          mapping,
          rows: parsedFile.rows,
          options: { skipDuplicates, updateExisting },
          fileName: parsedFile.fileName,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('integrations.importFailed'))
        setImportResult({ totalRows: 0, successRows: 0, failedRows: 0, status: 'failed', errors: [] })
        return
      }
      const data = await res.json()
      const result: ImportResult = {
        totalRows: data.summary?.totalRows ?? 0,
        successRows: data.summary?.successRows ?? 0,
        failedRows: data.summary?.failedRows ?? 0,
        status: data.summary?.status ?? 'failed',
        errors: data.errors ?? [],
      }
      setImportResult(result)
      if (result.status === 'completed') {
        toast.success(t('integrations.importSuccess'))
      } else if (result.status === 'partial') {
        toast.warning(t('integrations.importPartial'))
      } else {
        toast.error(t('integrations.importFailed'))
      }
    } catch {
      toast.error(t('integrations.importFailed'))
    } finally {
      setImporting(false)
    }
  }

  const handleBack = () => {
    if (step === 3) {
      setStep(2)
      setImportResult(null)
      setPreviewData([])
    } else if (step === 2) {
      setStep(1)
      setParsedFile(null)
      setMapping({})
    }
  }

  const handleReset = () => {
    setStep(1)
    setParsedFile(null)
    setEntityType('partners')
    setSource('custom')
    setMapping({})
    setPreviewData([])
    setSkipDuplicates(true)
    setUpdateExisting(false)
    setImportResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Step indicators
  const steps = [
    { num: 1, label: t('integrations.step1') },
    { num: 2, label: t('integrations.step2') },
    { num: 3, label: t('integrations.step3') },
  ]

  const entityFields = ENTITY_FIELDS[entityType]

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <CardTitle className="text-base font-semibold">{t('integrations.tab_import')}</CardTitle>
        </div>
        {/* Step indicators */}
        <div className="flex items-center gap-2 mt-3">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                step >= s.num
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}>
                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-current/20 text-[10px] font-bold">
                  {s.num}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-6 h-px ${step > s.num ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
              )}
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {/* STEP 1: Upload */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                  dragOver
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileInput}
                />
                {parsing ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">{t('integrations.uploadFile')}...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <UploadCloud className="h-10 w-10 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{t('integrations.uploadFile')}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t('integrations.dragDrop')}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{t('integrations.supportedFormats')}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Map Columns */}
          {step === 2 && parsedFile && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* File info */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                <span className="flex items-center gap-1.5">
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  {parsedFile.fileName}
                </span>
                <span>{parsedFile.totalRows} {t('integrations.rowsFound')}</span>
                <span>{parsedFile.columns.length} {t('integrations.columnsFound')}</span>
                <Button variant="ghost" size="sm" className="h-6 ml-auto text-muted-foreground" onClick={() => fileInputRef.current?.click()}>
                  <X className="h-3 w-3 mr-1" />
                  {t('common.cancel')}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f) }}
                />
              </div>

              {/* Source and Entity selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">{t('integrations.selectSource')}</Label>
                  <Select value={source} onValueChange={(v) => setSource(v as SourceType)}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">{t('integrations.source_custom')}</SelectItem>
                      <SelectItem value="external_accounting_1">{t('integrations.source_external_accounting_1')}</SelectItem>
                      <SelectItem value="external_accounting_2">{t('integrations.source_external_accounting_2')}</SelectItem>
                      <SelectItem value="external_accounting_3">{t('integrations.source_external_accounting_3')}</SelectItem>
                      <SelectItem value="einvoice_system">{t('integrations.source_einvoice_system')}</SelectItem>
                      <SelectItem value="enterprise_erp">{t('integrations.source_enterprise_erp')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">{t('integrations.selectEntity')}</Label>
                  <Select value={entityType} onValueChange={(v) => setEntityType(v as EntityType)}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="partners">{t('integrations.entity_partners')}</SelectItem>
                      <SelectItem value="products">{t('integrations.entity_products')}</SelectItem>
                      <SelectItem value="transactions">{t('integrations.entity_transactions')}</SelectItem>
                      <SelectItem value="contacts">{t('integrations.entity_contacts')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Auto Map button */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={handleAutoMap} disabled={autoMapping}>
                  {autoMapping ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  {t('integrations.autoMap')}
                </Button>
                <span className="text-[10px] text-muted-foreground">{t('integrations.aiSuggest')}</span>
              </div>

              {/* Mapping Table */}
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs w-1/2">{t('integrations.sourceColumn')}</TableHead>
                      <TableHead className="text-xs w-1/2">{t('integrations.targetField')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedFile.columns.map((col) => (
                      <TableRow key={col}>
                        <TableCell className="text-xs font-mono py-2">
                          {col}
                        </TableCell>
                        <TableCell className="py-2">
                          <Select
                            value={mapping[col] || '_none'}
                            onValueChange={(v) => {
                              setMapping((prev) => ({
                                ...prev,
                                [col]: v === '_none' ? '' : v,
                              }))
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="_none">— {t('integrations.optionalField')} —</SelectItem>
                              {entityFields.map((f) => (
                                <SelectItem key={f.key} value={f.key}>
                                  {f.required ? (
                                    <span className="flex items-center gap-1">
                                      <span className="text-red-500">*</span>
                                      {f.label}
                                    </span>
                                  ) : (
                                    f.label
                                  )}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Required fields notice */}
              <p className="text-[10px] text-muted-foreground">
                <span className="text-red-500">*</span> {t('integrations.requiredField')}
              </p>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={handleBack}>
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {t('common.back')}
                </Button>
                <Button size="sm" className="gap-1.5" onClick={handlePreview}>
                  {t('integrations.preview')}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Preview & Import */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {importResult ? (
                /* Import Result */
                <div className="space-y-4">
                  <div className={`rounded-xl border-2 p-6 text-center ${
                    importResult.status === 'completed'
                      ? 'border-emerald-200 bg-emerald-50/50'
                      : importResult.status === 'partial'
                        ? 'border-amber-200 bg-amber-50/50'
                        : 'border-red-200 bg-red-50/50'
                  }`}>
                    <div className="flex justify-center mb-3">
                      {importResult.status === 'completed' ? (
                        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                      ) : importResult.status === 'partial' ? (
                        <AlertCircle className="h-12 w-12 text-amber-500" />
                      ) : (
                        <X className="h-12 w-12 text-red-500" />
                      )}
                    </div>
                    <h3 className="text-base font-semibold mb-2">
                      {importResult.status === 'completed'
                        ? t('integrations.importSuccess')
                        : importResult.status === 'partial'
                          ? t('integrations.importPartial')
                          : t('integrations.importFailed')}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{importResult.totalRows}</p>
                        <p className="text-xs text-muted-foreground">{t('integrations.totalRows')}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-emerald-600">{importResult.successRows}</p>
                        <p className="text-xs text-muted-foreground">{t('integrations.importedRows')}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{importResult.failedRows}</p>
                        <p className="text-xs text-muted-foreground">{t('integrations.failedRows')}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-amber-600">{importResult.totalRows - importResult.successRows - importResult.failedRows}</p>
                        <p className="text-xs text-muted-foreground">{t('integrations.skippedRows')}</p>
                      </div>
                    </div>
                    {importResult.errors && importResult.errors.length > 0 && (
                      <div className="mt-4 text-left">
                        <p className="text-xs font-medium text-red-600 mb-1">{t('integrations.jobErrors')}:</p>
                        <div className="max-h-32 overflow-y-auto bg-white/60 rounded-md p-2">
                          {importResult.errors.map((err, i) => (
                            <p key={i} className="text-xs text-red-600 py-0.5">
                              Row {err.row}: {err.field} — {err.message}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <Button size="sm" onClick={handleReset}>
                      {t('integrations.uploadFile')}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Preview Table */}
                  <div>
                    <p className="text-xs font-medium mb-2">{t('integrations.previewRows')}</p>
                    <div className="rounded-lg border overflow-hidden max-h-[400px] overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs text-muted-foreground w-8">#</TableHead>
                            {entityFields
                              .filter((f) => Object.values(mapping).includes(f.key))
                              .map((f) => (
                                <TableHead key={f.key} className="text-xs whitespace-nowrap">
                                  {f.required ? (
                                    <span><span className="text-red-500">*</span>{f.label}</span>
                                  ) : (
                                    f.label
                                  )}
                                </TableHead>
                              ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {previewData.map((row, i) => (
                            <TableRow key={i}>
                              <TableCell className="text-xs text-muted-foreground py-1.5">{i + 1}</TableCell>
                              {entityFields
                                .filter((f) => Object.values(mapping).includes(f.key))
                                .map((f) => {
                                  const csvColKey = Object.entries(mapping).find(([, v]) => v === f.key)?.[0] || ''
                                  const value = row[csvColKey]
                                  return (
                                    <TableCell key={f.key} className="text-xs py-1.5 whitespace-nowrap">
                                      {value ? String(value) : (
                                        <span className="text-muted-foreground">—</span>
                                      )}
                                    </TableCell>
                                  )
                                })}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Import Options */}
                  <div className="space-y-3 bg-muted/50 rounded-lg p-4">
                    <p className="text-xs font-medium">{t('integrations.importOptions')}</p>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="skipDuplicates"
                          checked={skipDuplicates}
                          onCheckedChange={(v) => setSkipDuplicates(v === true)}
                        />
                        <Label htmlFor="skipDuplicates" className="text-xs cursor-pointer">
                          {t('integrations.skipDuplicates')}
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="updateExisting"
                          checked={updateExisting}
                          onCheckedChange={(v) => setUpdateExisting(v === true)}
                        />
                        <Label htmlFor="updateExisting" className="text-xs cursor-pointer">
                          {t('integrations.updateExisting')}
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-2">
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={handleBack}>
                      <ArrowLeft className="h-3.5 w-3.5" />
                      {t('common.back')}
                    </Button>
                    <Button size="sm" className="gap-1.5" onClick={handleStartImport} disabled={importing}>
                      {importing ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Upload className="h-3.5 w-3.5" />
                      )}
                      {importing ? t('common.saving') : t('integrations.startImport')}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

// ==================== EXPORT TAB ====================

function ExportTab() {
  const { t } = useTranslation()
  const [entityType, setEntityType] = useState<EntityType>('partners')
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [includeHeaders, setIncludeHeaders] = useState(true)
  const [exporting, setExporting] = useState(false)

  const entityFields = ENTITY_FIELDS[entityType]

  // Pre-select required fields when entity changes
  useEffect(() => {
    const required = entityFields.filter((f) => f.required).map((f) => f.key)
    setSelectedColumns(required)
  }, [entityType])

  const toggleColumn = (key: string) => {
    setSelectedColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const selectAll = () => {
    setSelectedColumns(entityFields.map((f) => f.key))
  }

  const deselectAll = () => {
    setSelectedColumns([])
  }

  const handleExport = async () => {
    if (selectedColumns.length === 0) {
      toast.error(t('integrations.selectAtLeast'))
      return
    }
    setExporting(true)
    try {
      const res = await fetch('/api/integrations/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          columns: selectedColumns,
          includeHeaders,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('common.error'))
        return
      }
      // Download the CSV
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${entityType}_export_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success(t('integrations.exportSuccess'))
    } catch {
      toast.error(t('common.error'))
    } finally {
      setExporting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{t('integrations.tab_export')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Entity Type */}
        <div className="space-y-2">
          <Label className="text-xs">{t('integrations.exportType')}</Label>
          <Select value={entityType} onValueChange={(v) => setEntityType(v as EntityType)}>
            <SelectTrigger className="h-9 max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="partners">{t('integrations.entity_partners')}</SelectItem>
              <SelectItem value="products">{t('integrations.entity_products')}</SelectItem>
              <SelectItem value="transactions">{t('integrations.entity_transactions')}</SelectItem>
              <SelectItem value="contacts">{t('integrations.entity_contacts')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Column selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">{t('integrations.selectColumns')}</Label>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={selectAll}>
                {t('common.selectAll')}
              </Button>
              <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={deselectAll}>
                —
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-muted/50 rounded-lg">
            {entityFields.map((f) => (
              <div key={f.key} className="flex items-center gap-2">
                <Checkbox
                  id={`col-${f.key}`}
                  checked={selectedColumns.includes(f.key)}
                  onCheckedChange={() => toggleColumn(f.key)}
                />
                <Label htmlFor={`col-${f.key}`} className="text-xs cursor-pointer flex items-center gap-1">
                  {f.required && <span className="text-red-500">*</span>}
                  {f.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Include headers */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="includeHeaders"
            checked={includeHeaders}
            onCheckedChange={(v) => setIncludeHeaders(v === true)}
          />
          <Label htmlFor="includeHeaders" className="text-xs cursor-pointer">
            {t('integrations.includeHeaders')}
          </Label>
        </div>

        {/* Export button */}
        <div className="pt-2">
          <Button size="sm" className="gap-1.5" onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            {exporting ? t('common.saving') : t('integrations.startExport')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ==================== HISTORY TAB ====================

function HistoryTab() {
  const { t } = useTranslation()
  const [jobs, setJobs] = useState<IntegrationJob[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [clearing, setClearing] = useState(false)

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/integrations/jobs')
      if (res.ok) {
        const data = await res.json()
        setJobs(data)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const handleDeleteJob = async (id: string) => {
    if (!confirm(t('common.confirmDelete'))) return
    setDeleting(id)
    try {
      const res = await fetch('/api/integrations/jobs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      })
      if (res.ok) {
        setJobs((prev) => prev.filter((j) => j.id !== id))
        toast.success(t('integrations.deleteJob'))
      }
    } catch {
      toast.error(t('common.deleteError'))
    } finally {
      setDeleting(null)
    }
  }

  const handleClearHistory = async () => {
    if (!confirm(t('integrations.clearHistory'))) return
    setClearing(true)
    try {
      const res = await fetch('/api/integrations/jobs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: jobs.map((j) => j.id) }),
      })
      if (res.ok) {
        setJobs([])
        toast.success(t('integrations.clearHistory'))
      }
    } catch {
      toast.error(t('common.deleteError'))
    } finally {
      setClearing(false)
    }
  }

  const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
    completed: {
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    partial: {
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: <AlertCircle className="h-3 w-3" />,
    },
    failed: {
      color: 'bg-red-50 text-red-700 border-red-200',
      icon: <X className="h-3 w-3" />,
    },
    processing: {
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
    },
    pending: {
      color: 'bg-gray-50 text-gray-600 border-gray-200',
      icon: <Clock className="h-3 w-3" />,
    },
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold">{t('integrations.tab_history')}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{jobs.length} {t('integrations.jobResults')}</p>
          </div>
          {jobs.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-destructive hover:text-destructive"
              onClick={handleClearHistory}
              disabled={clearing}
            >
              {clearing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              {t('integrations.clearHistory')}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <History className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">{t('integrations.noJobsYet')}</p>
          </div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">{t('integrations.jobDate')}</TableHead>
                  <TableHead className="text-xs">{t('integrations.jobType')}</TableHead>
                  <TableHead className="text-xs">{t('integrations.jobEntity')}</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">{t('integrations.jobSource')}</TableHead>
                  <TableHead className="text-xs text-center">{t('integrations.jobStatus')}</TableHead>
                  <TableHead className="text-xs text-center">{t('integrations.jobResults')}</TableHead>
                  <TableHead className="text-xs text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => {
                  const cfg = statusConfig[job.status]
                  return (
                    <TableRow key={job.id}>
                      <TableCell className="text-xs py-2">
                        {new Date(job.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs py-2">
                        <Badge variant="outline" className="text-[10px] px-2 py-0">
                          {job.type === 'import' ? (
                            <span className="flex items-center gap-1">
                              <Upload className="h-3 w-3" />
                              {t('integrations.import')}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Download className="h-3 w-3" />
                              {t('integrations.export')}
                            </span>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs py-2">
                        {t(`integrations.entity_${job.entityType}` as `integrations.${string}`)}
                      </TableCell>
                      <TableCell className="text-xs py-2 text-muted-foreground hidden lg:table-cell">
                        {job.source || '-'}
                      </TableCell>
                      <TableCell className="text-xs text-center py-2">
                        <Badge variant="outline" className={`text-[10px] px-2 py-0 ${(statusConfig[job.status] || statusConfig.pending).color}`}>
                          <span className="flex items-center gap-1">
                            {(statusConfig[job.status] || statusConfig.pending).icon}
                            {job.status}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-center py-2">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="text-emerald-600 font-medium">{job.successRows}</span>
                          <span className="text-muted-foreground">/</span>
                          <span className="text-red-600 font-medium">{job.failedRows}</span>
                          <span className="text-muted-foreground">/</span>
                          <span className="font-medium">{job.totalRows}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-right py-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteJob(job.id)}
                          disabled={deleting === job.id}
                        >
                          {deleting === job.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
