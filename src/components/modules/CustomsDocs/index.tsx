'use client'
import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Plus, Search, Trash2, Pencil, Eye, FileText, Globe, Stamp, AlertTriangle, CheckCircle2, Clock, Package, Scale, Truck, Download, Upload, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

interface CustomsDocument {
  id: string
  declarationNumber: string
  docType: 'import' | 'export' | 'transit'
  status: 'draft' | 'submitted' | 'processing' | 'cleared' | 'held' | 'rejected' | 'released'
  country: string
  borderCrossing: string
  declarantName: string
  declarantPIB: string
  goodsDescription: string
  hsCode: string
  totalValue: number
  totalWeight: number
  currency: string
  customsValue: number
  dutiesAmount: number
  vatAmount: number
  totalDues: number
  vehiclePlate: string
  submissionDate: string
  clearanceDate: string | null
  referenceNumber: string
  notes: string
  items: { hsCode: string; description: string; origin: string; quantity: number; unit: string; unitValue: number; totalValue: number; weight: number; dutyRate: number }[]
}

const INITIAL_DATA: CustomsDocument[] = [
  {
    id: '1', declarationNumber: 'CU-2024-00001', docType: 'import', status: 'cleared', country: 'Nemačka', borderCrossing: 'Šid',
    declarantName: 'TehnoImport d.o.o.', declarantPIB: '100123456', goodsDescription: 'Elektronska oprema', hsCode: '8471.30',
    totalValue: 45000, totalWeight: 1200, currency: 'EUR', customsValue: 54000, dutiesAmount: 2700, vatAmount: 10260, totalDues: 12960,
    vehiclePlate: 'BG-111-AB', submissionDate: '2024-06-10', clearanceDate: '2024-06-12', referenceNumber: 'REF-DE-2024-001',
    notes: 'Standardna uvozna carina',
    items: [
      { hsCode: '8471.30', description: 'Laptop računari', origin: 'DE', quantity: 50, unit: 'kom', unitValue: 600, totalValue: 30000, weight: 600, dutyRate: 0 },
      { hsCode: '8517.62', description: 'Ruteri', origin: 'DE', quantity: 100, unit: 'kom', unitValue: 150, totalValue: 15000, weight: 600, dutyRate: 0 },
    ]
  },
  {
    id: '2', declarationNumber: 'CU-2024-00002', docType: 'export', status: 'submitted', country: 'Bosna i Hercegovina', borderCrossing: 'Šamac',
    declarantName: 'EksportPro d.o.o.', declarantPIB: '100654321', goodsDescription: 'Tekstilne robe', hsCode: '6203.42',
    totalValue: 28000, totalWeight: 3500, currency: 'EUR', customsValue: 28000, dutiesAmount: 0, vatAmount: 0, totalDues: 0,
    vehiclePlate: 'BG-222-CD', submissionDate: '2024-06-14', clearanceDate: null, referenceNumber: 'REF-EX-2024-001',
    notes: 'Eksport u BiH - preferencijalne tarife CEFTA',
    items: [
      { hsCode: '6203.42', description: 'Muške košulje', origin: 'RS', quantity: 500, unit: 'kom', unitValue: 35, totalValue: 17500, weight: 1500, dutyRate: 0 },
      { hsCode: '6204.62', description: 'Ženske haljine', origin: 'RS', quantity: 300, unit: 'kom', unitValue: 35, totalValue: 10500, weight: 2000, dutyRate: 0 },
    ]
  },
  {
    id: '3', declarationNumber: 'CU-2024-00003', docType: 'import', status: 'processing', country: 'Kina', borderCrossing: 'Subotica (željeznička)',
    declarantName: 'AsiaTrade d.o.o.', declarantPIB: '100789012', goodsDescription: 'Potrošačka elektronika', hsCode: '8516.71',
    totalValue: 62000, totalWeight: 4800, currency: 'EUR', customsValue: 74400, dutiesAmount: 3720, vatAmount: 14136, totalDues: 17856,
    vehiclePlate: 'N/A (željeznica)', submissionDate: '2024-06-13', clearanceDate: null, referenceNumber: 'REF-CN-2024-001',
    notes: 'Kontrola kvaliteta - uzorak uzet. Čeka se laboratorijski izveštaj.',
    items: [
      { hsCode: '8516.71', description: 'Grejači', origin: 'CN', quantity: 2000, unit: 'kom', unitValue: 25, totalValue: 50000, weight: 3000, dutyRate: 5 },
      { hsCode: '8516.79', description: 'Aparati za kafu', origin: 'CN', quantity: 500, unit: 'kom', unitValue: 24, totalValue: 12000, weight: 1800, dutyRate: 5 },
    ]
  },
  {
    id: '4', declarationNumber: 'CU-2024-00004', docType: 'transit', status: 'held', country: 'Turska → Austrija', borderCrossing: 'Preševo',
    declarantName: 'TransitLogistics', declarantPIB: '100345678', goodsDescription: 'Auto delovi u tranzitu', hsCode: '8708.99',
    totalValue: 85000, totalWeight: 6200, currency: 'EUR', customsValue: 85000, dutiesAmount: 0, vatAmount: 0, totalDues: 0,
    vehiclePlate: 'TR-333-FG', submissionDate: '2024-06-14', clearanceDate: null, referenceNumber: 'NCTS-2024-001',
    notes: 'TR tranzit dokument. Zadržan na granici - nedostaje sertifikat porekla.',
    items: [
      { hsCode: '8708.99', description: 'Auto delovi - karoserija', origin: 'TR', quantity: 500, unit: 'kom', unitValue: 80, totalValue: 40000, weight: 2500, dutyRate: 0 },
      { hsCode: '8708.29', description: 'Auto delovi - trap', origin: 'TR', quantity: 300, unit: 'kom', unitValue: 150, totalValue: 45000, weight: 3700, dutyRate: 0 },
    ]
  },
  {
    id: '5', declarationNumber: 'CU-2024-00005', docType: 'import', status: 'rejected', country: 'Italija', borderCrossing: 'Šid',
    declarantName: 'FoodImport', declarantPIB: '100456789', goodsDescription: 'Prehrambeni proizvodi', hsCode: '2204.21',
    totalValue: 12000, totalWeight: 4800, currency: 'EUR', customsValue: 14400, dutiesAmount: 1440, vatAmount: 2736, totalDues: 4176,
    vehiclePlate: 'BG-444-HI', submissionDate: '2024-06-12', clearanceDate: null, referenceNumber: 'REF-IT-2024-001',
    notes: 'Odbijeno - nedostaju sanitarni certifikati za uvoz hrane.',
    items: [
      { hsCode: '2204.21', description: 'Vino - crveno', origin: 'IT', quantity: 2000, unit: 'l', unitValue: 6, totalValue: 12000, weight: 2400, dutyRate: 10 },
    ]
  },
  {
    id: '6', declarationNumber: 'CU-2024-00006', docType: 'import', status: 'draft', country: 'Poljska', borderCrossing: 'Subotica',
    declarantName: 'WoodCraft d.o.o.', declarantPIB: '100567890', goodsDescription: 'Drvna građa', hsCode: '4407.99',
    totalValue: 35000, totalWeight: 12000, currency: 'EUR', customsValue: 42000, dutiesAmount: 0, vatAmount: 7980, totalDues: 7980,
    vehiclePlate: 'PL-555-JK', submissionDate: '', clearanceDate: null, referenceNumber: '',
    notes: 'Priprema dokumentacije za uvoz drva.',
    items: [
      { hsCode: '4407.99', description: 'Iverica - ploče', origin: 'PL', quantity: 200, unit: 'm3', unitValue: 175, totalValue: 35000, weight: 12000, dutyRate: 0 },
    ]
  },
]

const STATUSES: Record<string, { color: string; label: string }> = {
  draft: { color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300', label: 'Priprema' },
  submitted: { color: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300', label: 'Podnet' },
  processing: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', label: 'U obradi' },
  cleared: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300', label: 'Očišćen' },
  held: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300', label: 'Zadržan' },
  rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', label: 'Odbijen' },
  released: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300', label: 'Pušten' },
}

const DOC_TYPES: Record<string, { color: string; label: string }> = {
  import: { color: 'bg-green-100 text-green-700', label: 'Uvoz' },
  export: { color: 'bg-orange-100 text-orange-700', label: 'Izvoz' },
  transit: { color: 'bg-purple-100 text-purple-700', label: 'Tranzit' },
}

function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{s}</Badge> }
function getDocTypeBadge(t: string) { const r = DOC_TYPES[t]; return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{t}</Badge> }
function formatCurrency(n: number) { return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(n) }

export function CarinskaDokumentacija() {
  const [data, setData] = useState<CustomsDocument[]>(INITIAL_DATA)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [editItem, setEditItem] = useState<CustomsDocument | null>(null)
  const [activeTab, setActiveTab] = useState('list')
  const [formData, setFormData] = useState({ declarationNumber: '', docType: 'import' as CustomsDocument['docType'], country: '', borderCrossing: '', declarantName: '', declarantPIB: '', goodsDescription: '', hsCode: '', totalValue: 0, totalWeight: 0, currency: 'EUR', vehiclePlate: '', referenceNumber: '', notes: '' })

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const filtered = useMemo(() => data.filter(item => {
    const matchSearch = !search || item.declarationNumber.toLowerCase().includes(search.toLowerCase()) || item.declarantName.toLowerCase().includes(search.toLowerCase()) || item.goodsDescription.toLowerCase().includes(search.toLowerCase()) || item.referenceNumber.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchType = !typeFilter || item.docType === typeFilter
    return matchSearch && matchStatus && matchType
  }), [data, search, statusFilter, typeFilter])

  const stats = useMemo(() => ({
    total: data.length, draft: data.filter(d => d.status === 'draft').length, submitted: data.filter(d => d.status === 'submitted').length,
    processing: data.filter(d => d.status === 'processing').length, cleared: data.filter(d => ['cleared', 'released'].includes(d.status)).length,
    held: data.filter(d => d.status === 'held').length, rejected: data.filter(d => d.status === 'rejected').length,
    totalValue: data.reduce((s, d) => s + d.totalValue, 0), totalDues: data.reduce((s, d) => s + d.totalDues, 0),
  }), [data])

  const handleDelete = (id: string) => { if (!confirm('Obrisati dokument?')) return; setData(prev => prev.filter(i => i.id !== id)); toast.success('Dokument obrisan') }
  const handleOpenCreate = () => { setFormData({ declarationNumber: `CU-${new Date().getFullYear()}-${String(data.length + 1).padStart(5, '0')}`, docType: 'import', country: '', borderCrossing: '', declarantName: '', declarantPIB: '', goodsDescription: '', hsCode: '', totalValue: 0, totalWeight: 0, currency: 'EUR', vehiclePlate: '', referenceNumber: '', notes: '' }); setDialogOpen(true) }
  const handleOpenEdit = (item: CustomsDocument) => { setFormData({ declarationNumber: item.declarationNumber, docType: item.docType, country: item.country, borderCrossing: item.borderCrossing, declarantName: item.declarantName, declarantPIB: item.declarantPIB, goodsDescription: item.goodsDescription, hsCode: item.hsCode, totalValue: item.totalValue, totalWeight: item.totalWeight, currency: item.currency, vehiclePlate: item.vehiclePlate, referenceNumber: item.referenceNumber, notes: item.notes }); setEditItem(item); setDialogOpen(true) }
  const handleSave = () => {
    if (!formData.declarantName || !formData.goodsDescription) { toast.error('Popunite obavezna polja'); return }
    if (editItem) { setData(prev => prev.map(d => d.id === editItem.id ? { ...d, ...formData } : d)); toast.success('Dokument ažuriran') }
    else { const newItem: CustomsDocument = { ...formData, id: String(Date.now()), status: 'draft', customsValue: formData.totalValue * 1.2, dutiesAmount: formData.totalValue * 0.05, vatAmount: formData.totalValue * 1.2 * 0.2, totalDues: 0, submissionDate: '', clearanceDate: null, items: [] }; newItem.totalDues = newItem.dutiesAmount + newItem.vatAmount; setData(prev => [newItem, ...prev]); toast.success('Novi dokument kreiran') }
    setDialogOpen(false); setEditItem(null)
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>
  const detailItem = detailId ? data.find(i => i.id === detailId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30"><Stamp className="h-5 w-5 text-violet-700 dark:text-violet-400" /></div>
          <div><h1 className="text-2xl font-bold tracking-tight">Carinska dokumentacija</h1><p className="text-sm text-muted-foreground">Upravljanje carinskim prijavama i dokumentima</p></div>
        </div>
        <Button size="sm" className="gap-2" onClick={handleOpenCreate}><Plus className="h-4 w-4" />Nova prijava</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-9 gap-3">
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Ukupno</div><p className="text-xl font-bold">{stats.total}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-slate-600 mb-1">Priprema</div><p className="text-xl font-bold text-slate-700">{stats.draft}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-sky-600 mb-1">Podneti</div><p className="text-xl font-bold text-sky-700">{stats.submitted}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-blue-600 mb-1">U obradi</div><p className="text-xl font-bold text-blue-700">{stats.processing}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-emerald-600 mb-1">Očišćeni</div><p className="text-xl font-bold text-emerald-700">{stats.cleared}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-amber-600 mb-1">Zadržani</div><p className="text-xl font-bold text-amber-700">{stats.held}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-red-600 mb-1">Odbijeni</div><p className="text-xl font-bold text-red-700">{stats.rejected}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Vrednost</div><p className="text-xl font-bold">{formatCurrency(stats.totalValue)}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Carine</div><p className="text-xl font-bold">{formatCurrency(stats.totalDues)}</p></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="list">Sve prijave</TabsTrigger><TabsTrigger value="summary">Rezime</TabsTrigger></TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-base">Carinske prijave</CardTitle>
                <div className="flex gap-2 items-center flex-wrap">
                  <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Broj, firma, roba..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
                  <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
                  <Select value={typeFilter || 'all'} onValueChange={v => setTypeFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem>{Object.entries(DOC_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[520px] overflow-y-auto">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Broj</TableHead>
                    <TableHead className="text-xs">Tip</TableHead>
                    <TableHead className="text-xs">Deklarant</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Država</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Roba</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Vrednost</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Carine</TableHead>
                    <TableHead className="text-xs text-right">Akcije</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground text-sm">Nema dokumenata</TableCell></TableRow> : filtered.map(item => (
                      <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDetailId(item.id)}>
                        <TableCell className="text-xs font-mono">{item.declarationNumber}</TableCell>
                        <TableCell>{getDocTypeBadge(item.docType)}</TableCell>
                        <TableCell><div className="text-xs font-medium">{item.declarantName}</div><div className="text-[10px] text-muted-foreground">PIB: {item.declarantPIB}</div></TableCell>
                        <TableCell className="text-xs hidden sm:table-cell">{item.country}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden md:table-cell max-w-[120px] truncate">{item.goodsDescription}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="text-xs hidden lg:table-cell">{formatCurrency(item.totalValue)}</TableCell>
                        <TableCell className="text-xs hidden lg:table-cell">{formatCurrency(item.totalDues)}</TableCell>
                        <TableCell className="text-right"><div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailId(item.id)}><Eye className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-violet-600" />Po tipu dokumenta</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(DOC_TYPES).map(([k, v]) => {
                  const items = data.filter(d => d.docType === k)
                  return <div key={k} className="flex items-center justify-between p-2 rounded-lg bg-muted/50"><div className="flex items-center gap-2">{getDocTypeBadge(k)}<span className="text-xs">{v.label}</span></div><div className="text-right"><p className="text-xs font-bold">{items.length}</p><p className="text-[10px] text-muted-foreground">{formatCurrency(items.reduce((s, d) => s + d.totalValue, 0))}</p></div></div>
                })}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-600" />Problematicni dokumenti</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {data.filter(d => ['held', 'rejected'].includes(d.status)).length === 0 ? <p className="text-xs text-muted-foreground">Nema problematicnih dokumenata</p> : data.filter(d => ['held', 'rejected'].includes(d.status)).map(d => (
                  <div key={d.id} className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 space-y-1">
                    <div className="flex justify-between"><span className="text-xs font-mono">{d.declarationNumber}</span>{getStatusBadge(d.status)}</div>
                    <p className="text-xs">{d.declarantName} - {d.goodsDescription}</p>
                    <p className="text-[10px] text-muted-foreground">{d.notes}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Detalji carinske prijave</DialogTitle></DialogHeader>
          {detailItem && (
            <div className="space-y-4">
              <div className="flex items-center justify-between"><div><p className="text-lg font-bold font-mono">{detailItem.declarationNumber}</p><p className="text-xs text-muted-foreground">Ref: {detailItem.referenceNumber || 'N/A'}</p></div><div className="flex gap-2">{getDocTypeBadge(detailItem.docType)}{getStatusBadge(detailItem.status)}</div></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Deklarant</div><p className="text-xs font-medium">{detailItem.declarantName}</p><p className="text-[10px] text-muted-foreground">PIB: {detailItem.declarantPIB}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Država / Granica</div><p className="text-xs font-medium">{detailItem.country}</p><p className="text-[10px] text-muted-foreground">{detailItem.borderCrossing}</p></div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Opis robe</div><p className="text-xs font-medium">{detailItem.goodsDescription}</p><p className="text-[10px] text-muted-foreground">HS kod: {detailItem.hsCode} · Vozilo: {detailItem.vehiclePlate}</p></div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Vrednost</div><p className="text-xs font-bold">{formatCurrency(detailItem.totalValue)}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Carinska vred.</div><p className="text-xs font-bold">{formatCurrency(detailItem.customsValue)}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">Carine</div><p className="text-xs font-bold">{formatCurrency(detailItem.dutiesAmount)}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><div className="text-[10px] text-muted-foreground mb-1">PDV</div><p className="text-xs font-bold">{formatCurrency(detailItem.vatAmount)}</p></div>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20"><div className="text-[10px] text-emerald-600 mb-1">Ukupne carinske obaveze</div><p className="text-sm font-bold text-emerald-700">{formatCurrency(detailItem.totalDues)}</p></div>
              {detailItem.items.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium">Stavke robe:</p>
                  <Table><TableHeader><TableRow><TableHead className="text-[10px]">HS</TableHead><TableHead className="text-[10px]">Opis</TableHead><TableHead className="text-[10px]">Kol.</TableHead><TableHead className="text-[10px]">Vrednost</TableHead><TableHead className="text-[10px]">Carina%</TableHead></TableRow></TableHeader>
                  <TableBody>{detailItem.items.map((item, idx) => <TableRow key={idx}><TableCell className="text-[10px] font-mono">{item.hsCode}</TableCell><TableCell className="text-[10px]">{item.description}</TableCell><TableCell className="text-[10px]">{item.quantity} {item.unit}</TableCell><TableCell className="text-[10px]">{formatCurrency(item.totalValue)}</TableCell><TableCell className="text-[10px]">{item.dutyRate}%</TableCell></TableRow>)}</TableBody></Table>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-muted-foreground">Datum podnošenja:</span> {detailItem.submissionDate ? formatDate(detailItem.submissionDate) : 'N/A'}</div>
                <div><span className="text-muted-foreground">Datum oslobađanja:</span> {detailItem.clearanceDate ? formatDate(detailItem.clearanceDate) : 'N/A'}</div>
              </div>
              {detailItem.notes && <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30"><p className="text-[10px] text-amber-600 mb-1">Beleške</p><p className="text-xs">{detailItem.notes}</p></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={open => { setDialogOpen(open); if (!open) setEditItem(null) }}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem ? 'Uredi prijavu' : 'Nova carinska prijava'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label className="text-xs">Broj prijave</Label><Input placeholder="CU-2024-00001" className="text-xs font-mono" value={formData.declarationNumber} onChange={e => setFormData(p => ({ ...p, declarationNumber: e.target.value }))} /></div>
              <div className="grid gap-2"><Label className="text-xs">Tip</Label><Select value={formData.docType} onValueChange={v => setFormData(p => ({ ...p, docType: v as CustomsDocument['docType'] }))}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(DOC_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label className="text-xs">Deklarant *</Label><Input placeholder="Naziv firme" className="text-xs" value={formData.declarantName} onChange={e => setFormData(p => ({ ...p, declarantName: e.target.value }))} /></div>
              <div className="grid gap-2"><Label className="text-xs">PIB</Label><Input placeholder="100000000" className="text-xs" value={formData.declarantPIB} onChange={e => setFormData(p => ({ ...p, declarantPIB: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label className="text-xs">Država porekla</Label><Input placeholder="Nemačka" className="text-xs" value={formData.country} onChange={e => setFormData(p => ({ ...p, country: e.target.value }))} /></div>
              <div className="grid gap-2"><Label className="text-xs">Granični prelaz</Label><Input placeholder="Šid" className="text-xs" value={formData.borderCrossing} onChange={e => setFormData(p => ({ ...p, borderCrossing: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label className="text-xs">Opis robe *</Label><Input placeholder="Elektronska oprema" className="text-xs" value={formData.goodsDescription} onChange={e => setFormData(p => ({ ...p, goodsDescription: e.target.value }))} /></div>
              <div className="grid gap-2"><Label className="text-xs">HS kod</Label><Input placeholder="8471.30" className="text-xs font-mono" value={formData.hsCode} onChange={e => setFormData(p => ({ ...p, hsCode: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2"><Label className="text-xs">Vrednost (EUR)</Label><Input type="number" className="text-xs" value={formData.totalValue || ''} onChange={e => setFormData(p => ({ ...p, totalValue: Number(e.target.value) }))} /></div>
              <div className="grid gap-2"><Label className="text-xs">Težina (kg)</Label><Input type="number" className="text-xs" value={formData.totalWeight || ''} onChange={e => setFormData(p => ({ ...p, totalWeight: Number(e.target.value) }))} /></div>
              <div className="grid gap-2"><Label className="text-xs">Vozilo</Label><Input placeholder="BG-111-AB" className="text-xs" value={formData.vehiclePlate} onChange={e => setFormData(p => ({ ...p, vehiclePlate: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label className="text-xs">Referentni broj</Label><Input placeholder="REF-DE-2024-001" className="text-xs font-mono" value={formData.referenceNumber} onChange={e => setFormData(p => ({ ...p, referenceNumber: e.target.value }))} /></div>
              <div className="grid gap-2"><Label className="text-xs">Valuta</Label><Select value={formData.currency} onValueChange={v => setFormData(p => ({ ...p, currency: v }))}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="EUR">EUR</SelectItem><SelectItem value="USD">USD</SelectItem><SelectItem value="RSD">RSD</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid gap-2"><Label className="text-xs">Beleške</Label><Textarea placeholder="Napomene..." className="text-xs" value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => { setDialogOpen(false); setEditItem(null) }}>Otkaži</Button><Button onClick={handleSave}>{editItem ? 'Sačuvaj' : 'Kreiraj'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
