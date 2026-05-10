'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import {
  Layers, Plus, Search, Eye, Trash2, Edit3, RefreshCw,
  CheckCircle2, Clock, BarChart3, TrendingUp, AlertCircle,
  GitBranch, GitCommit, FileText, FolderOpen, Upload, Download,
  Copy, ArrowRight, Users, Calendar, Filter, History, Package,
  Cog, Shield, Target, Zap,
} from 'lucide-react'

import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

// ======================== TYPES ========================

interface PLMProduct {
  id: string
  name: string
  sku: string
  category: string
  lifecycleStage: string
  status: string
  version: string
  owner: string
  lastUpdated: string
  createdAt: string
  description: string
  bomRef: string
  revisionCount: number
}

interface PLMRevision {
  id: string
  productId: string
  productName: string
  version: string
  description: string
  author: string
  date: string
  status: string
  changeType: string
  affectedComponents: string
}

interface PLMDocument {
  id: string
  title: string
  productId: string
  productName: string
  docType: string
  version: string
  status: string
  author: string
  date: string
  hasFile: boolean
  size: string
}

interface PLM_ECR {
  id: string
  number: string
  productId: string
  productName: string
  description: string
  priority: string
  requester: string
  status: string
  justification: string
  affectedAreas: string
  createdAt: string
  convertedToECO: boolean
  ecoNumber: string | null
}

interface PLM_ECO {
  id: string
  ecrNumber: string
  productName: string
  implementationPlan: string
  assignedTeam: string
  targetDate: string
  completion: number
  status: string
  approvalChain: string[]
}

// ======================== CONFIG ========================

const STAGE_CONFIG: Record<string, { label: string; color: string }> = {
  concept: { label: 'Koncept', color: 'bg-slate-100 text-slate-700' },
  design: { label: 'Dizajn', color: 'bg-violet-100 text-violet-700' },
  prototype: { label: 'Prototip', color: 'bg-cyan-100 text-cyan-700' },
  testing: { label: 'Testiranje', color: 'bg-amber-100 text-amber-700' },
  launch: { label: 'Lansiranje', color: 'bg-emerald-100 text-emerald-700' },
  production: { label: 'Proizvodnja', color: 'bg-green-100 text-green-700' },
  eol: { label: 'Kraj života', color: 'bg-red-100 text-red-700' },
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: 'Aktivan', color: 'bg-green-100 text-green-700' },
  development: { label: 'U razvoju', color: 'bg-amber-100 text-amber-700' },
  discontinued: { label: 'Prekinut', color: 'bg-red-100 text-red-700' },
}

const REVISION_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Nacrt', color: 'bg-slate-100 text-slate-700' },
  submitted: { label: 'Podnet', color: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Odobren', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Odbijen', color: 'bg-red-100 text-red-700' },
}

const DOC_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  drawing: { label: 'Crtež', color: 'bg-blue-100 text-blue-700' },
  specification: { label: 'Specifikacija', color: 'bg-violet-100 text-violet-700' },
  material_cert: { label: 'Sertifikat', color: 'bg-emerald-100 text-emerald-700' },
  test_report: { label: 'Izveštaj testa', color: 'bg-amber-100 text-amber-700' },
  manual: { label: 'Uputstvo', color: 'bg-cyan-100 text-cyan-700' },
}

const ECR_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Nacrt', color: 'bg-slate-100 text-slate-700' },
  under_review: { label: 'Na pregledu', color: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Odobren', color: 'bg-green-100 text-green-700' },
  implemented: { label: 'Implementiran', color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Odbijen', color: 'bg-red-100 text-red-700' },
}

const ECO_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  planned: { label: 'Planirano', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'U toku', color: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Završeno', color: 'bg-green-100 text-green-700' },
  on_hold: { label: 'Na čekanju', color: 'bg-slate-100 text-slate-700' },
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: 'Nizak', color: 'bg-slate-100 text-slate-700' },
  medium: { label: 'Srednji', color: 'bg-amber-100 text-amber-700' },
  high: { label: 'Visok', color: 'bg-orange-100 text-orange-700' },
  critical: { label: 'Kritičan', color: 'bg-red-100 text-red-700' },
}

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#22c55e', '#ef4444']

// ======================== CHART DATA (static reference) ========================

const MOCK_STAGE_PIE = [
  { name: 'Koncept', value: 1 },
  { name: 'Dizajn', value: 1 },
  { name: 'Prototip', value: 1 },
  { name: 'Testiranje', value: 1 },
  { name: 'Lansiranje', value: 1 },
  { name: 'Proizvodnja', value: 4 },
  { name: 'Kraj života', value: 1 },
]

const MOCK_NPD_TREND = [
  { month: 'Jul', count: 2 },
  { month: 'Avg', count: 1 },
  { month: 'Sep', count: 3 },
  { month: 'Okt', count: 2 },
  { month: 'Nov', count: 4 },
  { month: 'Dec', count: 3 },
]

const MOCK_MILESTONES = [
  { id: 'm1', title: 'PS-500 Prototip', date: '2024-12-20', stage: 'prototype', status: 'upcoming' },
  { id: 'm2', title: 'HC-150 Testiranje', date: '2024-12-25', stage: 'testing', status: 'upcoming' },
  { id: 'm3', title: 'KP-200 Rev 3.3', date: '2025-01-10', stage: 'production', status: 'planned' },
  { id: 'm4', title: 'SM-60 Koncept', date: '2025-01-15', stage: 'concept', status: 'planned' },
  { id: 'm5', title: 'LM-250 CE sertifikacija', date: '2025-01-20', stage: 'testing', status: 'planned' },
]

const MOCK_TTM_TREND = [
  { month: 'Jul', days: 145 },
  { month: 'Avg', days: 132 },
  { month: 'Sep', days: 128 },
  { month: 'Okt', days: 120 },
  { month: 'Nov', days: 115 },
  { month: 'Dec', days: 108 },
]

const MOCK_COMPLEXITY_COST = [
  { name: 'KP-200', complexity: 82, cost: 12500, category: 'Elektronika' },
  { name: 'HC-150', complexity: 65, cost: 8900, category: 'Mehanika' },
  { name: 'ST-80', complexity: 45, cost: 3200, category: 'Elektronika' },
  { name: 'AK-300', complexity: 55, cost: 5600, category: 'Mehanika' },
  { name: 'PS-500', complexity: 90, cost: 15800, category: 'Elektronika' },
  { name: 'PM-100', complexity: 30, cost: 1800, category: 'Dizajn' },
  { name: 'SM-60', complexity: 75, cost: 11200, category: 'Mehanika' },
  { name: 'CP-12', complexity: 40, cost: 2800, category: 'Elektronika' },
  { name: 'VR-45', complexity: 60, cost: 7500, category: 'Mehanika' },
  { name: 'LM-250', complexity: 35, cost: 2100, category: 'Elektronika' },
]

const MOCK_CHANGE_FREQ = [
  { name: 'CP-12', changes: 11 },
  { name: 'AK-300', changes: 9 },
  { name: 'VR-45', changes: 8 },
  { name: 'KP-200', changes: 7 },
  { name: 'PM-100', changes: 6 },
  { name: 'ST-80', changes: 5 },
  { name: 'HC-150', changes: 4 },
  { name: 'LM-250', changes: 3 },
]

const MOCK_APPROVAL_CYCLE = [
  { range: '1-3 dana', count: 3 },
  { range: '4-7 dana', count: 5 },
  { range: '8-14 dana', count: 2 },
  { range: '15+ dana', count: 1 },
]

const MOCK_TOP_INNOVATORS = [
  { name: 'Marko Petrović', approved: 8 },
  { name: 'Nenad Jovanović', approved: 6 },
  { name: 'Jelena Stanković', approved: 5 },
  { name: 'Ana Nikolić', approved: 4 },
  { name: 'Dejan Milić', approved: 3 },
]

// ======================== COMPONENT ========================

// ======================== DB Row type ========================

interface DbPlmProduct {
  id: string
  companyId: string
  name: string
  sku: string
  category: string
  lifecycleStage: string
  status: string
  version: string
  owner: string
  description: string
  bomRef: string
  revisionCount: number
  revisions: string
  documents: string
  ecrs: string
  ecos: string
  createdAt: string
  updatedAt: string
}

function mapDbToProduct(db: DbPlmProduct): PLMProduct {
  return {
    id: db.id,
    name: db.name,
    sku: db.sku,
    category: db.category,
    lifecycleStage: db.lifecycleStage,
    status: db.status,
    version: db.version,
    owner: db.owner,
    lastUpdated: db.updatedAt ? new Date(db.updatedAt).toISOString().split('T')[0] : '',
    createdAt: db.createdAt ? new Date(db.createdAt).toISOString().split('T')[0] : '',
    description: db.description || '',
    bomRef: db.bomRef || '',
    revisionCount: db.revisionCount || 0,
  }
}

function safeParse<T>(json: string): T[] {
  try { return JSON.parse(json) || [] } catch { return [] }
}

// ======================== COMPONENT ========================

export function PLM() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')

  // DB state
  const [dbProducts, setDbProducts] = useState<DbPlmProduct[]>([])
  const [loading, setLoading] = useState(true)

  // Products state (derived from DB)
  const products = useMemo(() => dbProducts.map(mapDbToProduct), [dbProducts])
  const [productSearch, setProductSearch] = useState('')
  const [productCategoryFilter, setProductCategoryFilter] = useState('all')
  const [productStageFilter, setProductStageFilter] = useState('all')
  const [productStatusFilter, setProductStatusFilter] = useState('all')
  const [productSubTab, setProductSubTab] = useState<'pregled' | 'dodaj' | 'uredi'>('pregled')
  const [selectedProduct, setSelectedProduct] = useState<PLMProduct | null>(null)

  // Revisions (derived from embedded JSON in products)
  const revisions = useMemo(() => dbProducts.flatMap(p => safeParse<PLMRevision>(p.revisions)), [dbProducts])
  const [revisionSubTab, setRevisionSubTab] = useState<'pregled' | 'dodaj'>('pregled')
  const [revisionSearch, setRevisionSearch] = useState('')
  const [revisionStatusFilter, setRevisionStatusFilter] = useState('all')

  // Documents (derived from embedded JSON in products)
  const documents = useMemo(() => dbProducts.flatMap(p => safeParse<PLMDocument>(p.documents)), [dbProducts])
  const [docSubTab, setDocSubTab] = useState<'pregled' | 'dodaj'>('pregled')
  const [docSearch, setDocSearch] = useState('')
  const [docTypeFilter, setDocTypeFilter] = useState('all')
  const [docStatusFilter, setDocStatusFilter] = useState('all')

  // ECR/ECO (derived from embedded JSON in products)
  const ecrs = useMemo(() => dbProducts.flatMap(p => safeParse<PLM_ECR>(p.ecrs)), [dbProducts])
  const ecos = useMemo(() => dbProducts.flatMap(p => safeParse<PLM_ECO>(p.ecos)), [dbProducts])
  const [ecrSubTab, setEcrSubTab] = useState<'pregled' | 'dodaj' | 'uredi'>('pregled')
  const [selectedEco, setSelectedEco] = useState<PLM_ECO | null>(null)
  const [ecrStatusFilter, setEcrStatusFilter] = useState('all')

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      setLoading(true)
      const res = await fetch(`/api/plm?companyId=${activeCompanyId}`)
      if (!res.ok) throw new Error()
      const json = await res.json()
      setDbProducts(json)
    } catch { toast.error('Greška pri učitavanju PLM podataka') }
    finally { setLoading(false) }
  }, [activeCompanyId])

  useEffect(() => { fetchData() }, [fetchData])

  // Helper to update embedded JSON in a product
  const updateProductJson = useCallback(async (productId: string, field: 'revisions' | 'documents' | 'ecrs' | 'ecos', newValue: unknown[]) => {
    const product = dbProducts.find(p => p.id === productId)
    if (!product) return
    try {
      const res = await fetch(`/api/plm/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: JSON.stringify(newValue) }),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setDbProducts(prev => prev.map(p => p.id === productId ? updated : p))
    } catch { toast.error('Greška pri ažuriranju') }
  }, [dbProducts])

  // Forms
  const emptyProductForm = { name: '', sku: '', category: 'Elektronika', lifecycleStage: 'concept', status: 'development', version: '0.1.0', owner: '', description: '' }
  const [productForm, setProductForm] = useState(emptyProductForm)

  const emptyRevisionForm = { productId: '', version: '', description: '', changeType: 'Minor' as string, affectedComponents: '' }
  const [revisionForm, setRevisionForm] = useState(emptyRevisionForm)

  const emptyDocForm = { title: '', productId: '', docType: 'drawing', version: '1.0', status: 'draft' }
  const [docForm, setDocForm] = useState(emptyDocForm)

  const emptyEcrForm = { productId: '', description: '', priority: 'medium' as string, justification: '', affectedAreas: '' }
  const [ecrForm, setEcrForm] = useState(emptyEcrForm)

  // ======================== DERIVED ========================

  const uniqueCategories = useMemo(() => [...new Set(products.map(p => p.category))], [products])

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase())
      const matchCategory = productCategoryFilter === 'all' || p.category === productCategoryFilter
      const matchStage = productStageFilter === 'all' || p.lifecycleStage === productStageFilter
      const matchStatus = productStatusFilter === 'all' || p.status === productStatusFilter
      return matchSearch && matchCategory && matchStage && matchStatus
    })
  }, [products, productSearch, productCategoryFilter, productStageFilter, productStatusFilter])

  const filteredRevisions = useMemo(() => {
    return revisions.filter(r => {
      const matchSearch = !revisionSearch || r.productName.toLowerCase().includes(revisionSearch.toLowerCase()) || r.description.toLowerCase().includes(revisionSearch.toLowerCase())
      const matchStatus = revisionStatusFilter === 'all' || r.status === revisionStatusFilter
      return matchSearch && matchStatus
    })
  }, [revisions, revisionSearch, revisionStatusFilter])

  const filteredDocs = useMemo(() => {
    return documents.filter(d => {
      const matchSearch = !docSearch || d.title.toLowerCase().includes(docSearch.toLowerCase()) || d.productName.toLowerCase().includes(docSearch.toLowerCase())
      const matchType = docTypeFilter === 'all' || d.docType === docTypeFilter
      const matchStatus = docStatusFilter === 'all' || d.status === docStatusFilter
      return matchSearch && matchType && matchStatus
    })
  }, [documents, docSearch, docTypeFilter, docStatusFilter])

  const filteredEcrs = useMemo(() => {
    return ecrs.filter(e => {
      const matchStatus = ecrStatusFilter === 'all' || e.status === ecrStatusFilter
      return matchStatus
    })
  }, [ecrs, ecrStatusFilter])

  const kpiData = useMemo(() => {
    const activeCount = products.filter(p => p.status === 'active').length
    const devCount = products.filter(p => p.status === 'development').length
    const reviewCount = revisions.filter(r => r.status === 'submitted').length
    const changesThisMonth = revisions.filter(r => {
      const d = new Date(r.date)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length
    const avgTimeToMarket = 108
    const openEcrs = ecrs.filter(e => ['draft', 'under_review', 'approved'].includes(e.status)).length
    return { activeCount, devCount, reviewCount, changesThisMonth, avgTimeToMarket, openEcrs }
  }, [products, revisions, ecrs])

  const topRevisionProducts = useMemo(() => {
    return [...products].sort((a, b) => b.revisionCount - a.revisionCount).slice(0, 5)
  }, [products])

  // ======================== HANDLERS ========================

  const handleCreateProduct = useCallback(() => {
    if (!activeCompanyId) return
    const newProduct: PLMProduct = {
      id: `p-${Date.now()}`,
      ...productForm,
      lastUpdated: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      bomRef: '',
      revisionCount: 0,
    }
    setProducts(prev => [newProduct, ...prev])
    setProductSubTab('pregled')
    setProductForm(emptyProductForm)
  }, [activeCompanyId, productForm])

  const handleDeleteProduct = useCallback((id: string) => {
    if (!confirm(t('plm.confirmDelete'))) return
    setProducts(prev => prev.filter(p => p.id !== id))
  }, [t])

  const handleCreateRevision = useCallback(() => {
    if (!activeCompanyId || !revisionForm.productId) return
    const product = products.find(p => p.id === revisionForm.productId)
    if (!product) return
    const newRevision: PLMRevision = {
      id: `r-${Date.now()}`,
      productId: revisionForm.productId,
      productName: product.name,
      version: revisionForm.version || '0.1.0',
      description: revisionForm.description,
      author: t('plm.currentUser'),
      date: new Date().toISOString().split('T')[0],
      status: 'draft',
      changeType: revisionForm.changeType,
      affectedComponents: revisionForm.affectedComponents,
    }
    setRevisions(prev => [newRevision, ...prev])
    setRevisionSubTab('pregled')
    setRevisionForm(emptyRevisionForm)
  }, [activeCompanyId, revisionForm, products, t])

  const handleRevisionAction = useCallback((revId: string, action: string) => {
    setRevisions(prev => prev.map(r => r.id === revId ? { ...r, status: action } : r))
  }, [])

  const handleCreateDoc = useCallback(() => {
    if (!activeCompanyId || !docForm.productId) return
    const product = products.find(p => p.id === docForm.productId)
    if (!product) return
    const newDoc: PLMDocument = {
      id: `d-${Date.now()}`,
      title: docForm.title,
      productId: docForm.productId,
      productName: product.name,
      docType: docForm.docType,
      version: docForm.version,
      status: docForm.status,
      author: t('plm.currentUser'),
      date: new Date().toISOString().split('T')[0],
      hasFile: false,
      size: '-',
    }
    setDocuments(prev => [newDoc, ...prev])
    setDocSubTab('pregled')
    setDocForm(emptyDocForm)
  }, [activeCompanyId, docForm, products, t])

  const handleDeleteDoc = useCallback((id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id))
  }, [])

  const handleCreateEcr = useCallback(() => {
    if (!activeCompanyId || !ecrForm.productId) return
    const product = products.find(p => p.id === ecrForm.productId)
    if (!product) return
    const newEcr: PLM_ECR = {
      id: `ecr-${Date.now()}`,
      number: `ECR-2024-${String(ecrs.length + 1).padStart(3, '0')}`,
      productId: ecrForm.productId,
      productName: product.name,
      description: ecrForm.description,
      priority: ecrForm.priority,
      requester: t('plm.currentUser'),
      status: 'draft',
      justification: ecrForm.justification,
      affectedAreas: ecrForm.affectedAreas,
      createdAt: new Date().toISOString().split('T')[0],
      convertedToECO: false,
      ecoNumber: null,
    }
    setEcrs(prev => [newEcr, ...prev])
    setEcrSubTab('pregled')
    setEcrForm(emptyEcrForm)
  }, [activeCompanyId, ecrForm, products, ecrs.length, t])

  const handleConvertToEco = useCallback((ecrId: string) => {
    const ecr = ecrs.find(e => e.id === ecrId)
    if (!ecr) return
    const ecoNumber = `ECO-2024-${String(ecos.length + 1).padStart(3, '0')}`
    setEcrs(prev => prev.map(e => e.id === ecrId ? { ...e, convertedToECO: true, ecoNumber, status: 'approved' } : e))
    const newEco: PLM_ECO = {
      id: `eco-${Date.now()}`,
      ecrNumber: ecr.number,
      productName: ecr.productName,
      implementationPlan: t('plm.toBeDefined'),
      assignedTeam: t('plm.toBeAssigned'),
      targetDate: '',
      completion: 0,
      status: 'planned',
      approvalChain: [t('plm.currentUser')],
    }
    setEcos(prev => [newEco, ...prev])
  }, [ecrs, ecos.length, t])

  // ======================== RENDER ========================

  if (!activeCompanyId) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">PLM</h1>
          <p className="text-sm text-muted-foreground">{t('plm.subtitle')}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setProducts(MOCK_PRODUCTS)}>
            <RefreshCw className="h-4 w-4 mr-1" /> {t('plm.refresh')}
          </Button>
          {activeTab === 'products' && productSubTab === 'pregled' && (
            <Button size="sm" onClick={() => setProductSubTab('dodaj')}>
              <Plus className="h-4 w-4 mr-1" /> {t('plm.newProduct')}
            </Button>
          )}
          {activeTab === 'revisions' && revisionSubTab === 'pregled' && (
            <Button size="sm" onClick={() => setRevisionSubTab('dodaj')}>
              <Plus className="h-4 w-4 mr-1" /> {t('plm.newRevision')}
            </Button>
          )}
          {activeTab === 'documents' && docSubTab === 'pregled' && (
            <Button size="sm" onClick={() => setDocSubTab('dodaj')}>
              <Plus className="h-4 w-4 mr-1" /> {t('plm.newDocument')}
            </Button>
          )}
          {activeTab === 'ecr-eco' && ecrSubTab === 'pregled' && (
            <Button size="sm" onClick={() => setEcrSubTab('dodaj')}>
              <Plus className="h-4 w-4 mr-1" /> {t('plm.newECR')}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1 hidden sm:inline" /> {t('plm.overview')}</TabsTrigger>
          <TabsTrigger value="products"><Package className="h-4 w-4 mr-1 hidden sm:inline" /> {t('plm.products')}</TabsTrigger>
          <TabsTrigger value="revisions"><GitBranch className="h-4 w-4 mr-1 hidden sm:inline" /> {t('plm.revisions')}</TabsTrigger>
          <TabsTrigger value="documents"><FileText className="h-4 w-4 mr-1 hidden sm:inline" /> {t('plm.documents')}</TabsTrigger>
          <TabsTrigger value="ecr-eco"><Cog className="h-4 w-4 mr-1 hidden sm:inline" /> ECR/ECO</TabsTrigger>
          <TabsTrigger value="analytics"><TrendingUp className="h-4 w-4 mr-1 hidden sm:inline" /> {t('plm.analytics')}</TabsTrigger>
        </TabsList>

        {/* ====== TAB 1: OVERVIEW ====== */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{t('plm.activeProducts')}</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold">{kpiData.activeCount}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{t('plm.inDevelopment')}</span>
                <Zap className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-amber-600">{kpiData.devCount}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{t('plm.pendingReview')}</span>
                <Clock className="h-4 w-4 text-violet-500" />
              </div>
              <p className="text-2xl font-bold text-violet-600">{kpiData.reviewCount}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{t('plm.changesThisMonth')}</span>
                <GitCommit className="h-4 w-4 text-cyan-500" />
              </div>
              <p className="text-2xl font-bold text-cyan-600">{kpiData.changesThisMonth}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{t('plm.avgTimeToMarket')}</span>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold">{kpiData.avgTimeToMarket}</p>
              <p className="text-xs text-muted-foreground">{t('plm.days')}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{t('plm.openECNs')}</span>
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-orange-600">{kpiData.openEcrs}</p>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lifecycle Stage Distribution */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('plm.stageDistribution')}</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={MOCK_STAGE_PIE} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {MOCK_STAGE_PIE.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* NPD Trend */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('plm.npdTrend')}</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={MOCK_NPD_TREND}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} name={t('plm.newProducts')} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Milestones + Top Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Milestones */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('plm.upcomingMilestones')}</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {MOCK_MILESTONES.map(milestone => (
                    <div key={milestone.id} className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: milestone.status === 'upcoming' ? '#f59e0b' : '#6366f1' }} />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium">{milestone.title}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className={`text-xs ${STAGE_CONFIG[milestone.stage]?.color || ''}`}>
                            {STAGE_CONFIG[milestone.stage]?.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {milestone.date}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Products by Revision Count */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('plm.topByRevisions')}</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topRevisionProducts.map((product, idx) => (
                    <div key={product.id} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground w-4">{idx + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium truncate block">{product.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">{product.sku}</span>
                          <Badge variant="outline" className={`text-xs ${STATUS_CONFIG[product.status]?.color || ''}`}>
                            {STATUS_CONFIG[product.status]?.label}
                          </Badge>
                        </div>
                      </div>
                      <Badge className="bg-primary/10 text-primary text-xs">{product.revisionCount} {t('plm.revisions')}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ====== TAB 2: PRODUCTS ====== */}
        <TabsContent value="products" className="space-y-4">
          <Tabs value={productSubTab} onValueChange={(v) => setProductSubTab(v as 'pregled' | 'dodaj' | 'uredi')}>
            <TabsList className="w-[400px]">
              <TabsTrigger value="pregled">Pregled</TabsTrigger>
              <TabsTrigger value="dodaj">Dodaj</TabsTrigger>
              {selectedProduct && <TabsTrigger value="uredi">Uredi</TabsTrigger>}
            </TabsList>
            <TabsContent value="pregled" className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('plm.searchProducts')} className="pl-9" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} />
            </div>
            <Select value={productCategoryFilter} onValueChange={setProductCategoryFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder={t('plm.allCategories')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('plm.allCategories')}</SelectItem>
                {uniqueCategories.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={productStageFilter} onValueChange={setProductStageFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder={t('plm.allStages')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('plm.allStages')}</SelectItem>
                {Object.entries(STAGE_CONFIG).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={productStatusFilter} onValueChange={setProductStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder={t('plm.allStatuses')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('plm.allStatuses')}</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          {/* Products Table */}
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('plm.name')}</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>{t('plm.category')}</TableHead>
                    <TableHead>{t('plm.lifecycleStage')}</TableHead>
                    <TableHead>{t('plm.status')}</TableHead>
                    <TableHead>{t('plm.version')}</TableHead>
                    <TableHead>{t('plm.owner')}</TableHead>
                    <TableHead>{t('plm.lastUpdated')}</TableHead>
                    <TableHead>{t('plm.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map(product => (
                    <TableRow key={product.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => { setSelectedProduct(product); setProductSubTab('uredi') }}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${STAGE_CONFIG[product.lifecycleStage]?.color || ''}`}>
                          {STAGE_CONFIG[product.lifecycleStage]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${STATUS_CONFIG[product.status]?.color || ''}`}>
                          {STATUS_CONFIG[product.status]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">v{product.version}</TableCell>
                      <TableCell className="text-xs">{product.owner}</TableCell>
                      <TableCell className="text-xs">{product.lastUpdated}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); setProductSubTab('uredi') }}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product.id) }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
              </div>
            </TabsContent>
            <TabsContent value="dodaj" className="space-y-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">{t('plm.newProduct')}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><Label>{t('plm.name')}</Label><Input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>SKU</Label><Input value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} /></div>
                    <div className="space-y-2"><Label>{t('plm.category')}</Label>
                      <Select value={productForm.category} onValueChange={(v) => setProductForm({ ...productForm, category: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {uniqueCategories.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                          <SelectItem value="Ostalo">Ostalo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>{t('plm.lifecycleStage')}</Label>
                      <Select value={productForm.lifecycleStage} onValueChange={(v) => setProductForm({ ...productForm, lifecycleStage: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(STAGE_CONFIG).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label>{t('plm.status')}</Label>
                      <Select value={productForm.status} onValueChange={(v) => setProductForm({ ...productForm, status: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_CONFIG).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>{t('plm.version')}</Label><Input value={productForm.version} onChange={(e) => setProductForm({ ...productForm, version: e.target.value })} /></div>
                    <div className="space-y-2"><Label>{t('plm.owner')}</Label><Input value={productForm.owner} onChange={(e) => setProductForm({ ...productForm, owner: e.target.value })} /></div>
                  </div>
                  <div className="space-y-2"><Label>{t('plm.description')}</Label><Textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} rows={3} /></div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setProductSubTab('pregled')}>{t('plm.cancel')}</Button>
                    <Button onClick={handleCreateProduct}><Plus className="h-4 w-4 mr-1" /> {t('plm.create')}</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="uredi" className="space-y-4">
              {selectedProduct && (
                <Card className="max-w-4xl">
                  <CardHeader className="pb-2"><CardTitle className="text-base">{selectedProduct.name}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div><span className="text-muted-foreground">SKU:</span> <span className="font-mono font-medium">{selectedProduct.sku}</span></div>
                        <div><span className="text-muted-foreground">{t('plm.category')}:</span> <span className="font-medium">{selectedProduct.category}</span></div>
                        <div><span className="text-muted-foreground">{t('plm.version')}:</span> <span className="font-mono font-medium">v{selectedProduct.version}</span></div>
                        <div><span className="text-muted-foreground">{t('plm.lifecycleStage')}:</span> <Badge variant="outline" className={STAGE_CONFIG[selectedProduct.lifecycleStage]?.color}>{STAGE_CONFIG[selectedProduct.lifecycleStage]?.label}</Badge></div>
                        <div><span className="text-muted-foreground">{t('plm.status')}:</span> <Badge variant="outline" className={STATUS_CONFIG[selectedProduct.status]?.color}>{STATUS_CONFIG[selectedProduct.status]?.label}</Badge></div>
                        <div><span className="text-muted-foreground">{t('plm.owner')}:</span> <span className="font-medium">{selectedProduct.owner}</span></div>
                        <div><span className="text-muted-foreground">{t('plm.revisions')}:</span> <span className="font-bold">{selectedProduct.revisionCount}</span></div>
                        <div><span className="text-muted-foreground">{t('plm.bom')}:</span> <span className="font-mono text-xs">{selectedProduct.bomRef || '-'}</span></div>
                        <div><span className="text-muted-foreground">{t('plm.lastUpdated')}:</span> <span>{selectedProduct.lastUpdated}</span></div>
                      </div>
                      {selectedProduct.description && (
                        <>
                          <Separator />
                          <div><span className="text-sm font-medium">{t('plm.description')}</span><p className="text-sm text-muted-foreground mt-1">{selectedProduct.description}</p></div>
                        </>
                      )}
                      <Separator />
                      <div>
                        <h4 className="text-sm font-medium mb-2">{t('plm.versionHistory')}</h4>
                        <div className="rounded-lg border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>{t('plm.version')}</TableHead>
                                <TableHead>{t('plm.description')}</TableHead>
                                <TableHead>{t('plm.date')}</TableHead>
                                <TableHead>{t('plm.status')}</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {revisions.filter(r => r.productId === selectedProduct.id).map(rev => (
                                <TableRow key={rev.id}>
                                  <TableCell className="font-mono text-xs">v{rev.version}</TableCell>
                                  <TableCell className="text-sm">{rev.description}</TableCell>
                                  <TableCell className="text-xs">{rev.date}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className={`text-xs ${REVISION_STATUS_CONFIG[rev.status]?.color || ''}`}>
                                      {REVISION_STATUS_CONFIG[rev.status]?.label}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                              {revisions.filter(r => r.productId === selectedProduct.id).length === 0 && (
                                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground text-sm py-4">{t('plm.noRevisions')}</TableCell></TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">{t('plm.linkedDocuments')}</h4>
                        <div className="space-y-2">
                          {documents.filter(d => d.productId === selectedProduct.id).map(doc => (
                            <div key={doc.id} className="flex items-center gap-2 border rounded-md p-2">
                              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span className="text-sm flex-1 truncate">{doc.title}</span>
                              <Badge variant="outline" className={`text-xs shrink-0 ${DOC_TYPE_CONFIG[doc.docType]?.color || ''}`}>
                                {DOC_TYPE_CONFIG[doc.docType]?.label}
                              </Badge>
                              <span className="text-xs text-muted-foreground">v{doc.version}</span>
                            </div>
                          ))}
                          {documents.filter(d => d.productId === selectedProduct.id).length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-2">{t('plm.noDocuments')}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setProductSubTab('pregled')}>Nazad</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ====== TAB 3: REVISIONS ====== */}
        <TabsContent value="revisions" className="space-y-4">
          <Tabs value={revisionSubTab} onValueChange={(v) => setRevisionSubTab(v as 'pregled' | 'dodaj')}>
            <TabsList className="w-[300px]">
              <TabsTrigger value="pregled">Pregled</TabsTrigger>
              <TabsTrigger value="dodaj">Dodaj</TabsTrigger>
            </TabsList>
            <TabsContent value="pregled" className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('plm.searchRevisions')} className="pl-9" value={revisionSearch} onChange={(e) => setRevisionSearch(e.target.value)} />
            </div>
            <Select value={revisionStatusFilter} onValueChange={setRevisionStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder={t('plm.allStatuses')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('plm.allStatuses')}</SelectItem>
                {Object.entries(REVISION_STATUS_CONFIG).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          {/* Revisions Table */}
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('plm.product')}</TableHead>
                    <TableHead>{t('plm.version')}</TableHead>
                    <TableHead>{t('plm.description')}</TableHead>
                    <TableHead>{t('plm.changeType')}</TableHead>
                    <TableHead>{t('plm.affectedComponents')}</TableHead>
                    <TableHead>{t('plm.author')}</TableHead>
                    <TableHead>{t('plm.date')}</TableHead>
                    <TableHead>{t('plm.status')}</TableHead>
                    <TableHead>{t('plm.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRevisions.map(rev => (
                    <TableRow key={rev.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-sm">{rev.productName}</TableCell>
                      <TableCell className="font-mono text-xs">v{rev.version}</TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">{rev.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${rev.changeType === 'Major' ? 'bg-red-100 text-red-700' : rev.changeType === 'Minor' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                          {rev.changeType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{rev.affectedComponents}</TableCell>
                      <TableCell className="text-xs">{rev.author}</TableCell>
                      <TableCell className="text-xs">{rev.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${REVISION_STATUS_CONFIG[rev.status]?.color || ''}`}>
                          {REVISION_STATUS_CONFIG[rev.status]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {rev.status === 'draft' && (
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-amber-600" title={t('plm.submit')} onClick={() => handleRevisionAction(rev.id, 'submitted')}>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {rev.status === 'submitted' && (
                            <>
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" title={t('plm.approve')} onClick={() => handleRevisionAction(rev.id, 'approved')}>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600" title={t('plm.reject')} onClick={() => handleRevisionAction(rev.id, 'rejected')}>
                                <AlertCircle className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                          {(rev.status === 'approved' || rev.status === 'rejected') && (
                            <Button size="icon" variant="ghost" className="h-7 w-7" title={t('plm.compare')} onClick={() => {}}>
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* ECN Status Summary */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{t('plm.ecnStatus')}</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(REVISION_STATUS_CONFIG).map(([key, config]) => {
                  const count = revisions.filter(r => r.status === key).length
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs ${config.color}`}>{config.label}</Badge>
                      <span className="text-lg font-bold">{count}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
            </TabsContent>
            <TabsContent value="dodaj" className="space-y-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">{t('plm.newRevision')}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><Label>{t('plm.product')}</Label>
                    <Select value={revisionForm.productId} onValueChange={(v) => setRevisionForm({ ...revisionForm, productId: v })}>
                      <SelectTrigger><SelectValue placeholder={t('plm.selectProduct')} /></SelectTrigger>
                      <SelectContent>
                        {products.map(p => (<SelectItem key={p.id} value={p.id}>{p.name} (v{p.version})</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>{t('plm.version')}</Label><Input value={revisionForm.version} onChange={(e) => setRevisionForm({ ...revisionForm, version: e.target.value })} placeholder="npr. 3.3.0" /></div>
                    <div className="space-y-2"><Label>{t('plm.changeType')}</Label>
                      <Select value={revisionForm.changeType} onValueChange={(v) => setRevisionForm({ ...revisionForm, changeType: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Major">Major</SelectItem>
                          <SelectItem value="Minor">Minor</SelectItem>
                          <SelectItem value="Patch">Patch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2"><Label>{t('plm.description')}</Label><Textarea value={revisionForm.description} onChange={(e) => setRevisionForm({ ...revisionForm, description: e.target.value })} rows={3} /></div>
                  <div className="space-y-2"><Label>{t('plm.affectedComponents')}</Label><Input value={revisionForm.affectedComponents} onChange={(e) => setRevisionForm({ ...revisionForm, affectedComponents: e.target.value })} placeholder="npr. U9, R12, C5" /></div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setRevisionSubTab('pregled')}>{t('plm.cancel')}</Button>
                    <Button onClick={handleCreateRevision}><Plus className="h-4 w-4 mr-1" /> {t('plm.createRevision')}</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ====== TAB 4: DOCUMENTS ====== */}
        <TabsContent value="documents" className="space-y-4">
          <Tabs value={docSubTab} onValueChange={(v) => setDocSubTab(v as 'pregled' | 'dodaj')}>
            <TabsList className="w-[300px]">
              <TabsTrigger value="pregled">Pregled</TabsTrigger>
              <TabsTrigger value="dodaj">Dodaj</TabsTrigger>
            </TabsList>
            <TabsContent value="pregled" className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('plm.searchDocs')} className="pl-9" value={docSearch} onChange={(e) => setDocSearch(e.target.value)} />
            </div>
            <Select value={docTypeFilter} onValueChange={setDocTypeFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder={t('plm.allTypes')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('plm.allTypes')}</SelectItem>
                {Object.entries(DOC_TYPE_CONFIG).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={docStatusFilter} onValueChange={setDocStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder={t('plm.allStatuses')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('plm.allStatuses')}</SelectItem>
                <SelectItem value="draft">{t('plm.draft')}</SelectItem>
                <SelectItem value="submitted">{t('plm.submitted')}</SelectItem>
                <SelectItem value="approved">{t('plm.approved')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Documents Table */}
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('plm.title')}</TableHead>
                    <TableHead>{t('plm.product')}</TableHead>
                    <TableHead>{t('plm.type')}</TableHead>
                    <TableHead>{t('plm.version')}</TableHead>
                    <TableHead>{t('plm.status')}</TableHead>
                    <TableHead>{t('plm.author')}</TableHead>
                    <TableHead>{t('plm.date')}</TableHead>
                    <TableHead>{t('plm.file')}</TableHead>
                    <TableHead>{t('plm.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocs.map(doc => (
                    <TableRow key={doc.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-sm">{doc.title}</TableCell>
                      <TableCell className="text-sm">{doc.productName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${DOC_TYPE_CONFIG[doc.docType]?.color || ''}`}>
                          {DOC_TYPE_CONFIG[doc.docType]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">v{doc.version}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${REVISION_STATUS_CONFIG[doc.status]?.color || ''}`}>
                          {REVISION_STATUS_CONFIG[doc.status]?.label || doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{doc.author}</TableCell>
                      <TableCell className="text-xs">{doc.date}</TableCell>
                      <TableCell>
                        {doc.hasFile ? (
                          <Badge className="bg-emerald-100 text-emerald-700 text-xs gap-1">
                            <Upload className="h-3 w-3" /> {doc.size}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-muted-foreground">-</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {doc.hasFile && (
                            <Button size="icon" variant="ghost" className="h-7 w-7" title={t('plm.download')}>
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" className="h-7 w-7" title={t('plm.edit')} onClick={() => {}}>
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" title={t('plm.delete')} onClick={() => handleDeleteDoc(doc.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
            </TabsContent>
            <TabsContent value="dodaj" className="space-y-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">{t('plm.newDocument')}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><Label>{t('plm.title')}</Label><Input value={docForm.title} onChange={(e) => setDocForm({ ...docForm, title: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>{t('plm.product')}</Label>
                      <Select value={docForm.productId} onValueChange={(v) => setDocForm({ ...docForm, productId: v })}>
                        <SelectTrigger><SelectValue placeholder={t('plm.selectProduct')} /></SelectTrigger>
                        <SelectContent>
                          {products.map(p => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label>{t('plm.type')}</Label>
                      <Select value={docForm.docType} onValueChange={(v) => setDocForm({ ...docForm, docType: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(DOC_TYPE_CONFIG).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>{t('plm.version')}</Label><Input value={docForm.version} onChange={(e) => setDocForm({ ...docForm, version: e.target.value })} /></div>
                    <div className="space-y-2"><Label>{t('plm.status')}</Label>
                      <Select value={docForm.status} onValueChange={(v) => setDocForm({ ...docForm, status: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">{t('plm.draft')}</SelectItem>
                          <SelectItem value="submitted">{t('plm.submitted')}</SelectItem>
                          <SelectItem value="approved">{t('plm.approved')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/30">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{t('plm.uploadFile')}</span>
                    <Button variant="outline" size="sm" className="ml-auto"><FolderOpen className="h-3.5 w-3.5 mr-1" /> {t('plm.browse')}</Button>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setDocSubTab('pregled')}>{t('plm.cancel')}</Button>
                    <Button onClick={handleCreateDoc}><Plus className="h-4 w-4 mr-1" /> {t('plm.create')}</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ====== TAB 5: ECR/ECO ====== */}
        <TabsContent value="ecr-eco" className="space-y-6">
          <Tabs value={ecrSubTab} onValueChange={(v) => setEcrSubTab(v as 'pregled' | 'dodaj' | 'uredi')}>
            <TabsList className="w-[400px]">
              <TabsTrigger value="pregled">Pregled</TabsTrigger>
              <TabsTrigger value="dodaj">Dodaj</TabsTrigger>
              {selectedEco && <TabsTrigger value="uredi">Uredi</TabsTrigger>}
            </TabsList>
            <TabsContent value="pregled" className="space-y-6">
              {/* ECR Filter */}
              <div className="flex flex-col sm:flex-row gap-3">
            <Select value={ecrStatusFilter} onValueChange={setEcrStatusFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder={t('plm.allStatuses')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('plm.allStatuses')}</SelectItem>
                {Object.entries(ECR_STATUS_CONFIG).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          {/* ECR List */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{t('plm.ecrList')} ({filteredEcrs.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('plm.number')}</TableHead>
                        <TableHead>{t('plm.product')}</TableHead>
                        <TableHead>{t('plm.description')}</TableHead>
                        <TableHead>{t('plm.priority')}</TableHead>
                        <TableHead>{t('plm.requester')}</TableHead>
                        <TableHead>{t('plm.status')}</TableHead>
                        <TableHead>{t('plm.eco')}</TableHead>
                        <TableHead>{t('plm.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEcrs.map(ecr => (
                        <TableRow key={ecr.id} className="hover:bg-muted/30">
                          <TableCell className="font-mono text-xs font-medium">{ecr.number}</TableCell>
                          <TableCell className="text-sm">{ecr.productName}</TableCell>
                          <TableCell className="text-sm max-w-[200px] truncate">{ecr.description}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-xs ${PRIORITY_CONFIG[ecr.priority]?.color || ''}`}>
                              {PRIORITY_CONFIG[ecr.priority]?.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">{ecr.requester}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-xs ${ECR_STATUS_CONFIG[ecr.status]?.color || ''}`}>
                              {ECR_STATUS_CONFIG[ecr.status]?.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            {ecr.ecoNumber ? (
                              <Badge className="bg-emerald-100 text-emerald-700 text-xs">{ecr.ecoNumber}</Badge>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {!ecr.convertedToECO && ['draft', 'under_review', 'approved'].includes(ecr.status) && (
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-600" title={t('plm.convertToECO')} onClick={() => handleConvertToEco(ecr.id)}>
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              <Button size="icon" variant="ghost" className="h-7 w-7" title={t('plm.viewDetails')} onClick={() => {}}>
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ECO List */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{t('plm.ecoList')} ({ecos.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ecos.map(eco => (
                  <div key={eco.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GitCommit className="h-4 w-4 text-primary" />
                        <span className="font-mono text-sm font-medium">{eco.ecrNumber}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium text-sm">{eco.productName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs ${ECO_STATUS_CONFIG[eco.status]?.color || ''}`}>
                          {ECO_STATUS_CONFIG[eco.status]?.label}
                        </Badge>
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setSelectedEco(eco); setEcrSubTab('uredi') }}>
                          <Eye className="h-3 w-3 mr-1" /> {t('plm.details')}
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div><span className="text-muted-foreground">{t('plm.team')}:</span> <span className="font-medium">{eco.assignedTeam}</span></div>
                      <div><span className="text-muted-foreground">{t('plm.targetDate')}:</span> <span className="font-medium">{eco.targetDate || '-'}</span></div>
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-muted-foreground">{t('plm.completion')}:</span>
                          <span className="font-medium">{eco.completion}%</span>
                        </div>
                        <Progress value={eco.completion} className="h-2" />
                      </div>
                    </div>
                    {/* Approval chain */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">{t('plm.approvalChain')}:</span>
                      {eco.approvalChain.map((approver, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700">
                            <Shield className="h-3 w-3 mr-0.5" /> {approver}
                          </Badge>
                          {idx < eco.approvalChain.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
            </TabsContent>
            <TabsContent value="dodaj" className="space-y-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">{t('plm.newECR')}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><Label>{t('plm.product')}</Label>
                    <Select value={ecrForm.productId} onValueChange={(v) => setEcrForm({ ...ecrForm, productId: v })}>
                      <SelectTrigger><SelectValue placeholder={t('plm.selectProduct')} /></SelectTrigger>
                      <SelectContent>
                        {products.map(p => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>{t('plm.description')}</Label><Textarea value={ecrForm.description} onChange={(e) => setEcrForm({ ...ecrForm, description: e.target.value })} rows={3} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>{t('plm.priority')}</Label>
                      <Select value={ecrForm.priority} onValueChange={(v) => setEcrForm({ ...ecrForm, priority: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label>{t('plm.affectedAreas')}</Label><Input value={ecrForm.affectedAreas} onChange={(e) => setEcrForm({ ...ecrForm, affectedAreas: e.target.value })} placeholder="npr. Hardver, Firmware" /></div>
                  </div>
                  <div className="space-y-2"><Label>{t('plm.justification')}</Label><Textarea value={ecrForm.justification} onChange={(e) => setEcrForm({ ...ecrForm, justification: e.target.value })} rows={3} /></div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setEcrSubTab('pregled')}>{t('plm.cancel')}</Button>
                    <Button onClick={handleCreateEcr}><Plus className="h-4 w-4 mr-1" /> {t('plm.createECR')}</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="uredi" className="space-y-4">
              {selectedEco && (
                <Card className="max-w-4xl">
                  <CardHeader className="pb-2"><CardTitle className="text-base">{t('plm.ecoDetails')}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="text-muted-foreground">ECR:</span> <span className="font-mono font-medium">{selectedEco.ecrNumber}</span></div>
                        <div><span className="text-muted-foreground">{t('plm.product')}:</span> <span className="font-medium">{selectedEco.productName}</span></div>
                        <div><span className="text-muted-foreground">{t('plm.status')}:</span> <Badge variant="outline" className={ECO_STATUS_CONFIG[selectedEco.status]?.color}>{ECO_STATUS_CONFIG[selectedEco.status]?.label}</Badge></div>
                        <div><span className="text-muted-foreground">{t('plm.completion')}:</span> <span className="font-bold">{selectedEco.completion}%</span></div>
                        <div><span className="text-muted-foreground">{t('plm.team')}:</span> <span className="font-medium">{selectedEco.assignedTeam}</span></div>
                        <div><span className="text-muted-foreground">{t('plm.targetDate')}:</span> <span className="font-medium">{selectedEco.targetDate || '-'}</span></div>
                      </div>
                      <Separator />
                      <div>
                        <span className="text-sm font-medium">{t('plm.implementationPlan')}</span>
                        <p className="text-sm text-muted-foreground mt-1">{selectedEco.implementationPlan}</p>
                      </div>
                      <Progress value={selectedEco.completion} className="h-3" />
                      <Separator />
                      <div>
                        <h4 className="text-sm font-medium mb-2">{t('plm.approvalChain')}</h4>
                        <div className="flex items-center gap-2 flex-wrap">
                          {selectedEco.approvalChain.map((approver, idx) => (
                            <div key={idx} className="flex items-center gap-1">
                              <div className="flex items-center gap-1.5 border rounded-md px-2 py-1">
                                <Shield className="h-3.5 w-3.5 text-green-500" />
                                <span className="text-xs font-medium">{approver}</span>
                              </div>
                              {idx < selectedEco.approvalChain.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setEcrSubTab('pregled')}>Nazad</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ====== TAB 6: ANALYTICS ====== */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Time to Market Trend */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('plm.timeToMarketTrend')}</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={MOCK_TTM_TREND}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="days" stroke="#10b981" strokeWidth={2} name={t('plm.daysAvg')} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Product Complexity vs Cost */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('plm.complexityVsCost')}</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_COMPLEXITY_COST}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="cost" fill="#6366f1" name={t('plm.costRSD')} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Change Frequency by Product */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('plm.changeFrequency')}</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_CHANGE_FREQ} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                      <Tooltip />
                      <Bar dataKey="changes" fill="#f59e0b" name={t('plm.changes')} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Approval Cycle Time Distribution */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('plm.approvalCycleTime')}</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_APPROVAL_CYCLE}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#06b6d4" name={t('plm.revisions')} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stage Gate Pass Rate */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('plm.stageGatePassRate')}</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { stage: 'Koncept → Dizajn', rate: 92 },
                    { stage: 'Dizajn → Prototip', rate: 87 },
                    { stage: 'Prototip → Testiranje', rate: 78 },
                    { stage: 'Testiranje → Lansiranje', rate: 85 },
                    { stage: 'Lansiranje → Proizvodnja', rate: 95 },
                  ].map(item => (
                    <div key={item.stage} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">{item.stage}</span>
                        <span className={`text-xs font-bold ${item.rate >= 90 ? 'text-green-600' : item.rate >= 80 ? 'text-amber-600' : 'text-red-600'}`}>{item.rate}%</span>
                      </div>
                      <Progress value={item.rate} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Innovators */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('plm.topInnovators')}</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {MOCK_TOP_INNOVATORS.map((innovator, idx) => (
                    <div key={innovator.name} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{innovator.name}</span>
                          <span className="text-xs text-muted-foreground">#{idx + 1}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex-1 bg-muted rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-primary" style={{ width: `${(innovator.approved / MOCK_TOP_INNOVATORS[0].approved) * 100}%` }} />
                          </div>
                          <span className="text-xs font-bold text-primary">{innovator.approved}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
