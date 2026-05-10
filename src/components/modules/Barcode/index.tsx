'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScanBarcode, Plus, Search, Trash2, Pencil, Printer, Download, QrCode, BarcodeIcon, Tag, Package, AlertTriangle, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

interface BarcodeItem {
  id: string
  code: string
  type: 'EAN13' | 'EAN8' | 'QR' | 'CODE128' | 'UPC'
  productName: string
  productId: string
  category: string
  createdAt: string
}

function getTypeBadge(type: string) {
  const map: Record<string, { color: string; label: string }> = {
    EAN13: { color: 'bg-blue-100 text-blue-800', label: 'EAN-13' },
    EAN8: { color: 'bg-emerald-100 text-emerald-800', label: 'EAN-8' },
    QR: { color: 'bg-violet-100 text-violet-800', label: 'QR Code' },
    CODE128: { color: 'bg-amber-100 text-amber-800', label: 'Code 128' },
    UPC: { color: 'bg-rose-100 text-rose-800', label: 'UPC-A' },
  }
  const s = map[type] || map.EAN13
  return <Badge className={`${s.color} text-xs`}>{s.label}</Badge>
}

export function Barcode() {
  const [items, setItems] = useState<BarcodeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [scanInput, setScanInput] = useState('')

  const [editing, setEditing] = useState<BarcodeItem | null>(null)
  const [subTab, setSubTab] = useState<'pregled' | 'dodaj'>('pregled')
  const [formData, setFormData] = useState({ code: '', type: 'EAN13' as BarcodeItem['type'], productName: '', productId: '', category: '' })
  const [printMode, setPrintMode] = useState(false)
  const [selectedForPrint, setSelectedForPrint] = useState<Set<string>>(new Set())

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/barcode-items')
      if (!res.ok) throw new Error()
      const json = await res.json()
      setItems(json)
    } catch { toast.error('Greška pri učitavanju') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const categories = [...new Set(items.map(i => i.category))]

  const filtered = items.filter(i => {
    const matchSearch = !search || i.code.includes(search) || i.productName.toLowerCase().includes(search.toLowerCase())
    const matchType = !typeFilter || i.type === typeFilter
    const matchCat = !catFilter || i.category === catFilter
    return matchSearch && matchType && matchCat
  })

  const handleScan = useCallback(() => {
    if (!scanInput) return
    const found = items.find(i => i.code === scanInput)
    if (found) { toast.success(`Pronađeno: ${found.productName}`, { description: found.code }) }
    else { toast.error('Barkod nije pronađen', { description: scanInput }) }
    setScanInput('')
  }, [scanInput, items])

  const handleNew = useCallback(() => { setEditing(null); setFormData({ code: '', type: 'EAN13', productName: '', productId: '', category: '' }); setSubTab('dodaj') }, [])

  const handleEdit = useCallback((item: BarcodeItem) => { setEditing(item); setFormData({ code: item.code, type: item.type, productName: item.productName, productId: item.productId, category: item.category }); setSubTab('dodaj') }, [])

  const handleSave = useCallback(async () => {
    if (!formData.code || !formData.productName) { toast.error('Popunite sva polja'); return }
    try {
      if (editing) {
        const res = await fetch(`/api/barcode-items/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
        if (!res.ok) throw new Error()
        const updated = await res.json()
        setItems(prev => prev.map(i => i.id === editing.id ? updated : i))
        toast.success('Barkod ažuriran')
      } else {
        const res = await fetch('/api/barcode-items', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
        if (!res.ok) throw new Error()
        const created = await res.json()
        setItems(prev => [created, ...prev])
        toast.success('Barkod kreiran')
      }
      setSubTab('pregled')
    } catch { toast.error('Greška pri čuvanju') }
  }, [formData, editing])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Obrisati barkod?')) return
    try {
      await fetch(`/api/barcode-items/${id}`, { method: 'DELETE' })
      setItems(prev => prev.filter(i => i.id !== id))
      toast.success('Barkod obrisan')
    } catch { toast.error('Greška pri brisanju') }
  }, [])

  const togglePrint = (id: string) => {
    const next = new Set(selectedForPrint)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelectedForPrint(next)
  }

  const handleGenerate = (type: BarcodeItem['type']) => {
    let code = ''
    if (type === 'EAN13') code = '860' + String(Math.floor(Math.random() * 10000000000)).padStart(10, '0')
    else if (type === 'EAN8') code = '860' + String(Math.floor(Math.random() * 10000)).padStart(4, '0')
    else if (type === 'QR') code = `QR-${Date.now()}`
    else code = `CODE128-${Math.floor(Math.random() * 9999)}`
    setFormData(prev => ({ ...prev, code, type }))
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><ScanBarcode className="h-6 w-6" />Баркод и QR код</h1><p className="text-sm text-muted-foreground">Генерисање, управљање и штампање баркодова</p></div>
        <div className="flex gap-2">
          {selectedForPrint.size > 0 && <Button variant="outline" size="sm" className="gap-2" onClick={() => { toast.success(`Štampa ${selectedForPrint.size} barkodova...`); setSelectedForPrint(new Set()) }}><Printer className="h-4 w-4" />Штампај ({selectedForPrint.size})</Button>}
          <Button size="sm" className="gap-2" onClick={handleNew}><Plus className="h-4 w-4" />Novi barkod</Button>
        </div>
      </div>

      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1"><ScanBarcode className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Skeniraj ili unesi barkod..." className="pl-8 h-10 text-sm font-mono" value={scanInput} onChange={e => setScanInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleScan()} /></div>
            <Button onClick={handleScan} variant="secondary">Skeniraj</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><BarcodeIcon className="h-3.5 w-3.5" />Ukupno</div><p className="text-2xl font-bold">{items.length}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-blue-600 mb-1"><BarcodeIcon className="h-3.5 w-3.5" />EAN-13</div><p className="text-2xl font-bold">{items.filter(i => i.type === 'EAN13').length}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-violet-600 mb-1"><QrCode className="h-3.5 w-3.5" />QR kodovi</div><p className="text-2xl font-bold">{items.filter(i => i.type === 'QR').length}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Tag className="h-3.5 w-3.5" />Kategorije</div><p className="text-2xl font-bold">{categories.length}</p></Card>
      </div>

      <Tabs value={subTab} onValueChange={v => setSubTab(v as 'pregled' | 'dodaj')}>
        <TabsList><TabsTrigger value="pregled">Pregled</TabsTrigger><TabsTrigger value="dodaj" disabled={!editing && subTab !== 'dodaj'}>{editing ? 'Uredi' : 'Dodaj'}</TabsTrigger></TabsList>
        <TabsContent value="pregled" className="mt-4">

        </TabsContent>

        <TabsContent value="dodaj" className="mt-4">
          <Card className="sm:max-w-[450px]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => { setSubTab('pregled'); setEditing(null) }}><ArrowLeft className="h-4 w-4" /></Button>
                <CardTitle className="text-base font-semibold">{editing ? 'Izmeni barkod' : 'Novi barkod'}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2"><Label className="text-xs">Barkod *</Label><div className="flex gap-2"><Input placeholder="8601234567890" className="font-mono" value={formData.code} onChange={e => setFormData(p => ({ ...p, code: e.target.value }))} /><Select value={formData.type} onValueChange={v => { setFormData(p => ({ ...p, type: v as BarcodeItem['type'] })); handleGenerate(v as BarcodeItem['type']) }}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="EAN13">EAN-13</SelectItem><SelectItem value="EAN8">EAN-8</SelectItem><SelectItem value="QR">QR</SelectItem><SelectItem value="CODE128">Code 128</SelectItem></SelectContent></Select></div></div>
                <div className="grid gap-2"><Label className="text-xs">Naziv proizvoda *</Label><Input placeholder="Naziv..." value={formData.productName} onChange={e => setFormData(p => ({ ...p, productName: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label className="text-xs">Šifra proizvoda</Label><Input placeholder="prod-xxx" value={formData.productId} onChange={e => setFormData(p => ({ ...p, productId: e.target.value }))} /></div>
                  <div className="grid gap-2"><Label className="text-xs">Kategorija</Label><Input placeholder="Kategorija" value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))} /></div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => { setSubTab('pregled'); setEditing(null) }}>Otkaži</Button>
                <Button onClick={handleSave}>{editing ? 'Sačuvaj' : 'Kreiraj'}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-base">Lista barkodova</CardTitle>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
              <Select value={typeFilter || 'all'} onValueChange={v => setTypeFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi tipovi</SelectItem><SelectItem value="EAN13">EAN-13</SelectItem><SelectItem value="EAN8">EAN-8</SelectItem><SelectItem value="QR">QR</SelectItem><SelectItem value="CODE128">Code 128</SelectItem></SelectContent></Select>
              <Select value={catFilter || 'all'} onValueChange={v => setCatFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Sve kategorije</SelectItem>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[480px] overflow-y-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead className="w-8"></TableHead><TableHead className="text-xs">Barkod</TableHead><TableHead className="text-xs">Proizvod</TableHead><TableHead className="text-xs hidden sm:table-cell">Tip</TableHead><TableHead className="text-xs hidden md:table-cell">Kategorija</TableHead><TableHead className="text-xs hidden lg:table-cell">Datum</TableHead><TableHead className="text-xs text-right">Akcije</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filtered.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">Nema barkodova</TableCell></TableRow> : filtered.map(item => (
                  <TableRow key={item.id}>
                    <TableCell><input type="checkbox" checked={selectedForPrint.has(item.id)} onChange={() => togglePrint(item.id)} className="h-4 w-4 rounded" /></TableCell>
                    <TableCell><span className="text-xs font-mono font-bold">{item.code}</span></TableCell>
                    <TableCell><div><p className="text-xs font-medium">{item.productName}</p><p className="text-xs text-muted-foreground">{item.productId}</p></div></TableCell>
                    <TableCell className="hidden sm:table-cell">{getTypeBadge(item.type)}</TableCell>
                    <TableCell className="hidden md:table-cell"><Badge variant="outline" className="text-xs"><Package className="h-2.5 w-2.5 mr-1" />{item.category}</Badge></TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
                    <TableCell className="text-right"><div className="flex items-center justify-end gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast.info('Barkod generisan za stampu...')} title="Stampaj"><Printer className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      
    </div>
  )
}
