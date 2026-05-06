'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
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
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Monitor, Plus, Search, Eye, Trash2, Edit3, RefreshCw, Calculator,
  Package, Wrench, AlertTriangle, CheckCircle2, Download, Upload,
  BarChart3, TrendingDown, ArrowUpRight, ArrowDownRight, X,
  Tag, Clock, MapPin, Building, Car, Laptop, Cpu, Printer,
  Sofa, HardHat, Truck, ScanBarcode, QrCode, Settings, Info,
  FileText, Copy, Filter, Grid3X3, List, Zap, Shield, History, ChevronRight
} from 'lucide-react'
import { formatDate, formatRSD } from '@/lib/helpers'

// ============ TYPES ============

interface Asset {
  id: string; name: string; category: string | null; serialNumber: string | null
  purchaseDate: string | null; purchasePrice: number; currentValue: number; depreciation: number
  usefulLife: number; location: string | null; status: string; notes: string | null; createdAt: string
  responsible?: string | null; insurance?: string | null; maintenanceDate?: string | null
  maintenanceCost?: number; warrantyExpiry?: string | null
}

// ============ CONSTANTS ============

const STATUS_LABELS: Record<string, string> = {
  aktivno: 'Aktivno', na_popravci: 'Na popravci', izvan_upotrebe: 'Izvan upotrebe', prodato: 'Prodato', otpisano: 'Otpisano',
}

const STATUS_COLORS: Record<string, string> = {
  aktivno: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  na_popravci: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  izvan_upotrebe: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  prodato: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  otpisano: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const CATEGORIES = [
  { value: 'IT oprema', icon: Laptop, color: 'bg-blue-50 text-blue-600' },
  { value: 'Vozila', icon: Car, color: 'bg-emerald-50 text-emerald-600' },
  { value: 'Mašine i oprema', icon: Cpu, color: 'bg-purple-50 text-purple-600' },
  { value: 'Nameštaj', icon: Sofa, color: 'bg-amber-50 text-amber-600' },
  { value: 'Pokućinstva', icon: Building, color: 'bg-teal-50 text-teal-600' },
  { value: 'Alati', icon: Wrench, color: 'bg-red-50 text-red-600' },
  { value: 'Vozni park', icon: Truck, color: 'bg-orange-50 text-orange-600' },
  { value: 'Bezbednost', icon: Shield, color: 'bg-slate-100 text-slate-600' },
  { value: 'Ostalo', icon: Package, color: 'bg-gray-50 text-gray-600' },
]

const formatCurrency = (val: number) => formatRSD(val)

// ============ MAIN COMPONENT ============

export function Sredstva() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()

  const [assets, setAssets] = useState<Asset[]>([])

  const [assetDialogOpen, setAssetDialogOpen] = useState(false)

  const emptyForm = { name: '', category: 'IT oprema', serialNumber: '', purchaseDate: '', purchasePrice: 0, currentValue: 0, usefulLife: 60, location: '', status: 'aktivno', notes: '', responsible: '', insurance: '', maintenanceDate: '', warrantyExpiry: '' }
  const [assetForm, setAssetForm] = useState(emptyForm)
  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000) }

  // ============ DATA LOADING ============

  const loadAssets = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/assets')
      if (res.ok) setAssets(await res.json())
    } catch { /* silent */ }
    setLoading(false)
  }, [])

  useEffect(() => { loadAssets() }, [loadAssets])

  // ============ FILTERED ============

  const filteredAssets = useMemo(() => {
    let result = [...assets]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(a => (a.name || '').toLowerCase().includes(q) || (a.serialNumber || '').toLowerCase().includes(q) || (a.location || '').toLowerCase().includes(q) || (a.category || '').toLowerCase().includes(q) || (a.responsible || '').toLowerCase().includes(q))
    }
    if (filterCategory !== 'all') result = result.filter(a => a.category === filterCategory)
    if (filterStatus !== 'all') result = result.filter(a => a.status === filterStatus)
    return result
  }, [assets, searchQuery, filterCategory, filterStatus])

  // ============ STATS ============

  const stats = useMemo(() => {
    const total = assets.length
    const active = assets.filter(a => a.status === 'aktivno').length
    const repair = assets.filter(a => a.status === 'na_popravci').length
    const totalValue = assets.reduce((s, a) => s + (a.currentValue || 0), 0)
    const totalPurchase = assets.reduce((s, a) => s + (a.purchasePrice || 0), 0)
    const totalDepreciation = assets.reduce((s, a) => s + (a.depreciation || 0), 0)
    const netValue = totalValue - totalDepreciation

    const byCategory: Record<string, { count: number; value: number; depreciation: number }> = {}
    assets.forEach(a => {
      const cat = a.category || 'Nekategorizovano'
      if (!byCategory[cat]) byCategory[cat] = { count: 0, value: 0, depreciation: 0 }
      byCategory[cat].count++
      byCategory[cat].value += a.currentValue || 0
      byCategory[cat].depreciation += a.depreciation || 0
    })

    const byStatus: Record<string, number> = {}
    assets.forEach(a => { byStatus[a.status || 'nepoznato'] = (byStatus[a.status || 'nepoznato'] || 0) + 1 })

    const expiringWarranty = assets.filter(a => {
      if (!a.warrantyExpiry) return false
      const diff = new Date(a.warrantyExpiry).getTime() - Date.now()
      return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000
    })

    const maintenanceSoon = assets.filter(a => {
      if (!a.maintenanceDate) return false
      const diff = new Date(a.maintenanceDate).getTime() - Date.now()
      return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000
    })

    const oldAssets = assets.filter(a => a.usefulLife > 0 && a.purchaseDate).filter(a => {
      const age = (Date.now() - new Date(a.purchaseDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      return age >= (a.usefulLife * 0.8)
    })

    const recentAssets = [...assets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)

    const monthlyDepreciation = assets.reduce((s, a) => {
      if (a.usefulLife > 0 && a.status === 'aktivno') {
        const age = a.purchaseDate ? (Date.now() - new Date(a.purchaseDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000) : 0
        if (age < a.usefulLife) return s + ((a.purchasePrice || 0) / a.usefulLife) * 30.44
      }
      return s
    }, 0)

    return { total, active, repair, totalValue, totalPurchase, totalDepreciation, netValue, byCategory, byStatus, expiringWarranty, maintenanceSoon, oldAssets, recentAssets, monthlyDepreciation }
  }, [assets])

  // ============ ACTIONS ============

  const openNewAsset = () => { setEditingAsset(null); setAssetForm(emptyForm); setAssetDialogOpen(true) }

  const openEditAsset = (asset: Asset) => {
    setEditingAsset(asset)
    setAssetForm({
      name: asset.name || '', category: asset.category || 'IT oprema', serialNumber: asset.serialNumber || '',
      purchaseDate: asset.purchaseDate?.split('T')[0] || '', purchasePrice: asset.purchasePrice || 0,
      currentValue: asset.currentValue || 0, usefulLife: asset.usefulLife || 60, location: asset.location || '',
      status: asset.status || 'aktivno', notes: asset.notes || '', responsible: asset.responsible || '',
      insurance: asset.insurance || '', maintenanceDate: asset.maintenanceDate?.split('T')[0] || '',
      warrantyExpiry: asset.warrantyExpiry?.split('T')[0] || '',
    })
    setAssetDialogOpen(true)
  }

  const handleSubmitAsset = async () => {
    if (!assetForm.name.trim()) { showToast('Naziv je obavezan'); return }
    setSubmitting(true)
    try {
      const body = { ...assetForm, purchasePrice: Number(assetForm.purchasePrice) || 0, currentValue: Number(assetForm.currentValue) || 0, usefulLife: Number(assetForm.usefulLife) || 60 }
      const url = editingAsset ? `/api/assets/${editingAsset.id}` : '/api/assets'
      const res = await fetch(url, { method: editingAsset ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) { setAssetDialogOpen(false); loadAssets(); showToast(editingAsset ? 'Sredstvo ažurirano' : 'Sredstvo kreirano') }
    } catch { showToast('Greška') }
    setSubmitting(false)
  }

  const handleDeleteAsset = async () => {
    if (!selectedAsset) return
    try { await fetch(`/api/assets/${selectedAsset.id}`, { method: 'DELETE' }); setDeleteConfirmOpen(false); setSelectedAsset(null); loadAssets(); showToast('Sredstvo obrisano') }
    catch { showToast('Greška') }
  }

  const handleStatusChange = async (asset: Asset, status: string) => {
    try { await fetch(`/api/assets/${asset.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }); loadAssets(); showToast(`Status: ${STATUS_LABELS[status] || status}`) }
    catch { showToast('Greška') }
  }

  // ============ KPI ============

  const Kpi = ({ label, value, icon: Icon, sub, color }: { label: string; value: string | number; icon: React.ElementType; sub?: string; color?: string }) => (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${color || 'text-muted-foreground'}`} />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </Card>
  )

  // ============ RENDER ============

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-right">
          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"><AlertDescription>{toastMsg}</AlertDescription></Alert>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Package className="h-6 w-6 text-primary" /> Osnovna sredstva</h1>
          <p className="text-sm text-muted-foreground">Upravljanje imovinom, amortizacija i održavanje</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={openNewAsset}><Plus className="h-4 w-4 mr-1" /> Novo sredstvo</Button>
          <Button variant="outline" size="sm" onClick={loadAssets}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1 hidden sm:inline" /> Pregled</TabsTrigger>
          <TabsTrigger value="all"><List className="h-4 w-4 mr-1 hidden sm:inline" /> Sva sredstva</TabsTrigger>
          <TabsTrigger value="depreciation"><TrendingDown className="h-4 w-4 mr-1 hidden sm:inline" /> Amortizacija</TabsTrigger>
        </TabsList>

        {/* ===== OVERVIEW ===== */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Kpi label="Ukupna knjigovska vrednost" value={formatCurrency(stats.totalPurchase)} icon={Calculator} color="text-blue-500" />
            <Kpi label="Trenutna vrednost" value={formatCurrency(stats.totalValue)} icon={TrendingUp} color="text-green-500" sub={`Neto: ${formatCurrency(stats.netValue)}`} />
            <Kpi label="Ukupna amortizacija" value={formatCurrency(stats.totalDepreciation)} icon={TrendingDown} color="text-red-500" />
            <Kpi label="Aktivna sredstva" value={stats.active} icon={CheckCircle2} color="text-emerald-500" sub={`${stats.repair} na popravci`} />
          </div>

          {/* Alerts */}
          {stats.expiringWarranty.length > 0 && (
            <Card className="border-amber-200 dark:border-amber-800">
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2 text-amber-600"><AlertTriangle className="h-4 w-4" /> Garancija uskoro ističe (90 dana)</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {stats.expiringWarranty.slice(0, 5).map(a => (
                    <div key={a.id} className="flex items-center justify-between p-2 rounded hover:bg-amber-50 dark:hover:bg-amber-900/10 cursor-pointer" onClick={() => { setSelectedAsset(a); setAssetDetailOpen(true) }}>
                      <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-amber-500" /><span className="text-sm">{a.name}</span></div>
                      <span className="text-xs text-muted-foreground">{formatDate(a.warrantyExpiry!)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {stats.maintenanceSoon.length > 0 && (
            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2 text-orange-600"><Wrench className="h-4 w-4" /> Servis uskoro (30 dana)</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {stats.maintenanceSoon.slice(0, 5).map(a => (
                    <div key={a.id} className="flex items-center justify-between p-2 rounded hover:bg-orange-50 dark:hover:bg-orange-900/10 cursor-pointer" onClick={() => { setSelectedAsset(a); setAssetDetailOpen(true) }}>
                      <div className="flex items-center gap-2"><Wrench className="h-4 w-4 text-orange-500" /><span className="text-sm">{a.name}</span></div>
                      <span className="text-xs text-muted-foreground">{formatDate(a.maintenanceDate!)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {stats.oldAssets.length > 0 && (
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2 text-red-600"><History className="h-4 w-4" /> Predmeti dugovečeka (≥80% veka trajanja)</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {stats.oldAssets.map(a => (
                    <div key={a.id} className="flex items-center justify-between p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/10 cursor-pointer" onClick={() => { setSelectedAsset(a); setAssetDetailOpen(true) }}>
                      <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-red-500" /><span className="text-sm">{a.name}</span></div>
                      <span className="text-xs text-muted-foreground">{a.usefulLife} god. · {a.purchaseDate ? formatDate(a.purchaseDate) : ''}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* By Category */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Po kategorijama</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.byCategory).sort(([, a], [, b]) => b.value - a.value).map(([cat, data]) => {
                    const catInfo = CATEGORIES.find(c => c.value === cat)
                    const max = Math.max(...Object.values(stats.byCategory).map(d => d.value), 1)
                    return (
                      <div key={cat} className="flex items-center gap-3">
                        <div className="w-28 flex items-center gap-1.5">{catInfo && <catInfo.icon className="h-3 w-3" />}<span className="text-xs truncate">{cat}</span></div>
                        <div className="flex-1 bg-muted rounded-full h-3"><div className="bg-primary h-3 rounded-full" style={{ width: `${Math.round((data.value / max) * 100)}%` }} /></div>
                        <span className="text-xs font-mono w-20 text-right">{formatCurrency(data.value)}</span>
                        <Badge variant="outline" className="text-[10px]">{data.count}</Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* By Status */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Po statusima</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.byStatus).sort(([, a], [, b]) => b - a).map(([status, count]) => (
                    <div key={status} className="flex items-center gap-3">
                      <Badge variant="outline" className={`text-[10px] w-32 justify-center ${STATUS_COLORS[status] || ''}`}>{STATUS_LABELS[status] || status}</Badge>
                      <div className="flex-1 bg-muted rounded-full h-3"><div className="bg-primary h-3 rounded-full" style={{ width: `${Math.round((count / Math.max(stats.total, 1)) * 100)}%` }} /></div>
                      <span className="text-xs font-mono w-6 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent */}
            <Card>
              <CardHeader className="pb-3"><div className="flex items-center justify-between"><CardTitle className="text-sm">Nedavno dodata</CardTitle><Button variant="ghost" size="sm" onClick={() => setActiveTab('all')}>Sva <ChevronRight className="h-4 w-4 ml-1" /></Button></div></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.recentAssets.map(a => (
                    <div key={a.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50 cursor-pointer" onClick={() => { setSelectedAsset(a); setAssetDetailOpen(true) }}>
                      <div className="flex items-center gap-2"><Package className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{a.name}</span></div>
                      <div className="text-right"><p className="text-xs font-medium">{formatCurrency(a.purchasePrice)}</p><p className="text-[10px] text-muted-foreground">{formatDate(a.createdAt)}</p></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Depreciation */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Amortizacija</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Mesečna stopa amortizacije:</span><span className="font-medium">{formatCurrency(stats.monthlyDepreciation)}</span></div>
                  <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Godišnja amortizacija:</span><span className="font-medium">{formatCurrency(stats.monthlyDepreciation * 12)}</span></div>
                  <Separator />
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Formula: Nabavna vrednost / Korisni vek (godine)</p>
                    <p>Linearna amortizacija po standardnim pravilima RS</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== ALL ASSETS ===== */}
        <TabsContent value="all" className="space-y-4">
          <Card className="p-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Pretraži sredstva..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}><SelectTrigger className="w-[150px]"><SelectValue placeholder="Kategorija" /></SelectTrigger><SelectContent><SelectItem value="all">Sve kategorije</SelectItem>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.value}</SelectItem>)}</SelectContent></Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}><SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Svi statusi</SelectItem>{Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select>
            </div>
          </Card>

          <p className="text-sm text-muted-foreground">{filteredAssets.length} sredstava</p>

          {loading ? <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div> : filteredAssets.length === 0 ? (
            <Card className="p-8 text-center"><Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground" /><p className="text-muted-foreground">Nema sredstava</p><Button className="mt-3" onClick={openNewAsset}><Plus className="h-4 w-4 mr-1" /> Dodaj sredstvo</Button></Card>
          ) : (
            <Card>
              <div className="max-h-[600px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-muted/50"><tr className="text-left text-xs text-muted-foreground border-b">
                    <th className="p-3">Naziv</th><th className="p-3 hidden md:table-cell">Kategorija</th><th className="p-3 hidden lg:table-cell">Serijski br.</th><th className="p-3 hidden md:table-cell">Lokacija</th><th className="p-3 text-right">Nabavna</th><th className="p-3 text-right">Trenutna</th><th className="p-3 text-right">Amort.</th><th className="p-3">Status</th><th className="p-3 w-[80px]">Akcije</th>
                  </tr></thead>
                  <tbody>{filteredAssets.map(a => (
                    <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer" onClick={() => { setSelectedAsset(a); setAssetDetailOpen(true) }}>
                      <td className="p-3"><p className="text-xs font-medium">{a.name}</p></td>
                      <td className="p-3 hidden md:table-cell"><Badge variant="secondary" className="text-[10px]">{a.category || '-'}</Badge></td>
                      <td className="p-3 hidden lg:table-cell text-xs font-mono">{a.serialNumber || '-'}</td>
                      <td className="p-3 hidden md:table-cell text-xs">{a.location || '-'}</td>
                      <td className="p-3 text-right text-xs">{formatCurrency(a.purchasePrice)}</td>
                      <td className="p-3 text-right text-xs font-medium">{formatCurrency(a.currentValue)}</td>
                      <td className="p-3 text-right text-xs text-red-500">{formatCurrency(a.depreciation)}</td>
                      <td className="p-3"><Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[a.status] || ''}`}>{STATUS_LABELS[a.status] || a.status}</Badge></td>
                      <td className="p-3"><div className="flex gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openEditAsset(a) }}><Edit3 className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); setSelectedAsset(a); setDeleteConfirmOpen(true) }}><Trash2 className="h-3.5 w-3.5" /></Button></div></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* ===== DEPRECIATION ===== */}
        <TabsContent value="depreciation" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Amortizacioni plan</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg"><p className="text-[10px] text-muted-foreground">Ukupna nabavna</p><p className="text-lg font-bold">{formatCurrency(stats.totalPurchase)}</p></div>
                  <div className="text-center p-3 bg-green-50 rounded-lg"><p className="text-[10px] text-muted-foreground">Trenutna vrednost</p><p className="text-lg font-bold">{formatCurrency(stats.totalValue)}</p></div>
                  <div className="text-center p-3 bg-red-50 rounded-lg"><p className="text-[10px] text-muted-foreground">Ukupna amortizacija</p><p className="text-lg font-bold">{formatCurrency(stats.totalDepreciation)}</p></div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg"><p className="text-[10px] text-muted-foreground">Neto vrednost</p><p className="text-lg font-bold">{formatCurrency(stats.netValue)}</p></div>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Mesečna amortizacija:</span><span className="font-medium">{formatCurrency(stats.monthlyDepreciation)}</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Godišnja amortizacija:</span><span className="font-medium">{formatCurrency(stats.monthlyDepreciation * 12)}</span></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Po kategorijama</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.byCategory).sort(([, a], [, b]) => b.value - a.value).map(([cat, data]) => {
                  const catInfo = CATEGORIES.find(c => c.value === cat)
                  const annualDep = data.value > 0 && data.count > 0 ? data.depreciation / data.count : 0
                  return (
                    <Card key={cat} className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        {catInfo && <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${catInfo.color}`}><catInfo.icon className="h-5 w-5" /></div>}
                        <div><p className="text-sm font-medium">{cat}</p><p className="text-[11px] text-muted-foreground">{data.count} sredstava</p></div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div><span className="text-muted-foreground">Knjigovska:</span><p className="font-medium">{formatCurrency(data.value + data.depreciation)}</p></div>
                        <div><span className="text-muted-foreground">Trenutna:</span><p className="font-medium">{formatCurrency(data.value)}</p></div>
                        <div><span className="text-muted-foreground">Godišnja amort.:</span><p className="font-medium">{formatCurrency(annualDep)}</p></div>
                      </div>
                      <Progress value={Math.max(0, Math.min(100, ((data.value - data.depreciation) / Math.max(data.value, 1)) * 100))} className="mt-2 h-2" />
                      <p className="text-[10px] text-muted-foreground mt-1">Preostatak vrednosti: {formatCurrency(Math.max(0, data.value - data.depreciation))} ({Math.round(((data.value - data.depreciation) / Math.max(data.value, 1)) * 100)}%)</p>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Depreciation Guide */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Vodič kroz amortizaciju</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Linearna amortizacija</p><p className="text-muted-foreground">Jednolična stopa svakog meseca. Jednostavna i standardna metoda za većinu sredstava.</p></div></div>
                <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Korisni vek</p><p className="text-muted-foreground">Razdobljeni period korišća - amnortizuje se do nule, nakon se sredstvo otpisuje.</p></div></div>
                <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Preostatak vrednosti</p><p className="text-muted-foreground">Trenutna vrednost minus ukupna amortizacija. Koristi se za bilans stanja.</p></div></div>
                <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Fiskalni amortizacioni</p><p className="text-muted-foreground">Prema poreskoj zakonu o poretku dohotvora, amortizacija se knjiži u troškove.</p></div></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ===== DIALOGS ===== */}

      {/* New/Edit Asset */}
      <Dialog open={assetDialogOpen} onOpenChange={setAssetDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingAsset ? 'Izmeni sredstvo' : 'Novo sredstvo'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label className="text-xs">Naziv sredstva *</Label><Input value={assetForm.name} onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })} placeholder="Naziv..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-xs">Kategorija</Label>
                <Select value={assetForm.category} onValueChange={(v) => setAssetForm({ ...assetForm, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.value}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="space-y-2"><Label className="text-xs">Status</Label>
                <Select value={assetForm.status} onValueChange={(v) => setAssetForm({ ...assetForm, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-xs">Serijski broj</Label><Input value={assetForm.serialNumber} onChange={(e) => setAssetForm({ ...assetForm, serialNumber: e.target.value })} placeholder="SN-12345..." /></div>
              <div className="space-y-2"><Label className="text-xs">Datum nabavke</Label><Input type="date" value={assetForm.purchaseDate} onChange={(e) => setAssetForm({ ...assetForm, purchaseDate: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label className="text-xs">Nabavna vrednost (RSD)</Label><Input type="number" step="0.01" value={assetForm.purchasePrice} onChange={(e) => setAssetForm({ ...assetForm, purchasePrice: e.target.value })} /></div>
              <div className="space-y-2"><Label className="text-xs">Trenutna vrednost (RSD)</Label><Input type="number" step="0.01" value={assetForm.currentValue} onChange={(e) => setAssetForm({ ...assetForm, currentValue: e.target.value })} /></div>
              <div className="space-y-2"><Label className="text-xs">Korisni vek (godine)</Label><Input type="number" value={assetForm.usefulLife} onChange={(e) => setAssetForm({ ...assetForm, usefulLife: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-xs">Lokacija</Label><Input value={assetForm.location} onChange={(e) => setAssetForm({ ...assetForm, location: e.target.value })} placeholder="Kancelarija, magacin..." /></div>
              <div className="space-y-2"><Label className="text-xs">Odgovorno lice</Label><Input value={assetForm.responsible} onChange={(e) => setAssetForm({ ...assetForm, responsible: e.target.value })} placeholder="Ime zaposlenog" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-xs">Datum servisa</Label><Input type="date" value={assetForm.maintenanceDate} onChange={(e) => setAssetForm({ ...assetForm, maintenanceDate: e.target.value })} /></div>
              <div className="space-y-2"><Label className="text-xs">Istek garancije</Label><Input type="date" value={assetForm.warrantyExpiry} onChange={(e) => setAssetForm({ ...assetForm, warrantyExpiry: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label className="text-xs">Napomene</Label><Textarea value={assetForm.notes} onChange={(e) => setAssetForm({ ...assetForm, notes: e.target.value })} placeholder="Dodatne informacije..." rows={2} /></div>
          </div>
          <DialogFooter className="gap-2"><Button variant="outline" onClick={() => setAssetDialogOpen(false)}>Otkaži</Button><Button onClick={handleSubmitAsset} disabled={submitting || !assetForm.name.trim()}>{submitting ? 'Čuvanje...' : 'Sačuvaj'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail */}
      <Dialog open={assetDetailOpen} onOpenChange={setAssetDetailOpen}>
        <DialogContent className="max-w-md">
          {selectedAsset && (<>
            <DialogHeader><DialogTitle className="flex items-center gap-2"><Package className="h-5 w-5" /> {selectedAsset.name}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-xs text-muted-foreground">Kategorija:</span><br /><Badge variant="secondary">{selectedAsset.category || '-'}</Badge></div>
                <div><span className="text-xs text-muted-foreground">Status:</span><br /><Badge variant="outline" className={`text-xs ${STATUS_COLORS[selectedAsset.status] || ''}`}>{STATUS_LABELS[selectedAsset.status] || selectedAsset.status}</Badge></div>
                <div><span className="text-xs text-muted-foreground">Serijski br.:</span><br /><span className="text-xs font-mono">{selectedAsset.serialNumber || '-'}</span></div>
                <div><span className="text-xs text-muted-foreground">Datum nabavke:</span><br /><span className="text-xs">{selectedAsset.purchaseDate ? formatDate(selectedAsset.purchaseDate) : '-'}</span></div>
                <div><span className="text-xs text-muted-foreground">Lokacija:</span><br /><span className="text-xs">{selectedAsset.location || '-'}</span></div>
                <div><span className="text-xs text-muted-foreground">Odgovorno:</span><br /><span className="text-xs">{selectedAsset.responsible || '-'}</span></div>
              </div>
              <Separator />
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-blue-50 rounded-lg"><p className="text-[10px] text-muted-foreground">Nabavna</p><p className="text-lg font-bold">{formatCurrency(selectedAsset.purchasePrice)}</p></div>
                <div className="p-3 bg-green-50 rounded-lg"><p className="text-[10px] text-muted-foreground">Trenutna</p><p className="text-lg font-bold">{formatCurrency(selectedAsset.currentValue)}</p></div>
                <div className="p-3 bg-red-50 rounded-lg"><p className="text-[10px] text-muted-foreground">Amortizacija</p><p className="text-lg font-bold">{formatCurrency(selectedAsset.depreciation)}</p></div>
              </div>
              {selectedAsset.usefulLife > 0 && selectedAsset.purchaseDate && (
                <div className="space-y-1 text-xs"><span className="text-muted-foreground">Starost / Vek trajanja:</span>
                  <Progress value={Math.min(100, ((Date.now() - new Date(selectedAsset.purchaseDate).getTime()) / (selectedAsset.usefulLife * 365.25 * 24 * 60 * 60 * 1000)) * 100)} className="h-2" />
                  <p className="text-muted-foreground">{Math.round((Date.now() - new Date(selectedAsset.purchaseDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} / {selectedAsset.usefulLife} godina ({Math.round(((Date.now() - new Date(selectedAsset.purchaseDate).getTime()) / (selectedAsset.usefulLife * 365.25 * 24 * 60 * 60 * 1000)) * 100)}%)</p>
                </div>
              )}
              {(selectedAsset.warrantyExpiry || selectedAsset.maintenanceDate) && <Separator />}
              {selectedAsset.warrantyExpiry && <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Garancija do:</span><span className={new Date(selectedAsset.warrantyExpiry).getTime() < Date.now() ? 'text-red-500' : ''}>{formatDate(selectedAsset.warrantyExpiry)}</span></div>}
              {selectedAsset.maintenanceDate && <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Servis zakazan:</span><span className={new Date(selectedAsset.maintenanceDate).getTime() < Date.now() ? 'text-red-500' : ''}>{formatDate(selectedAsset.maintenanceDate)}</span></div>}
              {selectedAsset.notes && <div><span className="text-xs text-muted-foreground">Napomene:</span><p className="text-sm mt-1 bg-muted/30 rounded p-2">{selectedAsset.notes}</p></div>}
              <Separator />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => { openEditAsset(selectedAsset); setAssetDetailOpen(false) }}><Edit3 className="h-3.5 w-3.5 mr-1" /> Izmeni</Button>
                {selectedAsset.status !== 'otpisano' && <Button size="sm" variant="outline" onClick={() => handleStatusChange(selectedAsset, 'otpisano')}><Trash2 className="h-3.5 w-3.5 mr-1" /> Otpisi</Button>}
                {selectedAsset.status !== 'aktivno' && selectedAsset.status !== 'otpisano' && <Button size="sm" variant="outline" onClick={() => handleStatusChange(selectedAsset, 'aktivno')}><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Aktiviraj</Button>}
                <Button size="sm" variant="outline" className="text-destructive" onClick={() => { setDeleteConfirmOpen(true); setAssetDetailOpen(false) }}><Trash2 className="h-3.5 w-3.5 mr-1" /> Obriši</Button>
              </div>
            </div>
          </>)}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-destructive">Potvrda brisanja</DialogTitle><DialogDescription>Obrisati &quot;{selectedAsset?.name}&quot;?</DialogDescription></DialogHeader>
          <DialogFooter className="gap-2"><Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Otkaži</Button><Button variant="destructive" onClick={handleDeleteAsset}>Obriši</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Info */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Amortizacija</p><p className="text-muted-foreground">Automatski proračun</p></div></div>
            <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">9 kategorija</p><p className="text-muted-foreground">IT, vozila, alati...</p></div></div>
            <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Garancije</p><p className="text-muted-foreground">Praćenje isteka</p></div></div>
            <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Servis</p><p className="text-muted-foreground">Planiranje održavanja</p></div></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
