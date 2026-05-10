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
import { Plus, Search, Trash2, Pencil, Eye, CreditCard, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

interface Payment {
  id: string; invoiceNo: string; client: string; amount: number; currency: string
  date: string; dueDate: string; paidDate: string; method: string; status: string
  reference: string; category: string; notes: string; createdAt: string
}

const STATUSES: Record<string, { color: string; label: string }> = {
  paid: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300', label: 'Plaćeno' },
  pending: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300', label: 'Na čekanju' },
  overdue: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', label: 'Kasni' },
  partial: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', label: 'Delimično' },
  cancelled: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300', label: 'Otkazan' },
}
const CATEGORIES: Record<string, string> = { invoice: 'Faktura', salary: 'Plata', rent: 'Kirija', supplier: 'Dobavljač', utility: 'Komunalije', other: 'Ostalo' }
const METHODS: Record<string, string> = { bank_transfer: 'Bankovni prenos', cash: 'Gotovina', card: 'Kartica', standing_order: 'Stalni nalog' }

function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge> }
function formatAmount(a: number, c: string) { return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: c, maximumFractionDigits: 0 }).format(a) }

export function Payments() {
  const [data, setData] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [subTab, setSubTab] = useState<'pregled' | 'dodaj' | 'detalji'>('pregled')
  const [editItem, setEditItem] = useState<Payment | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Record<string, string | number>>({})

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      if (catFilter) params.set('category', catFilter)
      const res = await fetch(`/api/payments?${params}`)
      if (res.ok) setData(await res.json())
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }, [search, statusFilter, catFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati?')) return
    try { const res = await fetch(`/api/payments/${id}`, { method: 'DELETE' }); if (res.ok) { toast.success('Obrisano'); if (detailId === id) { setDetailId(null); setSubTab('pregled'); } fetchData() } } catch { toast.error('Greška') }
  }

  const openCreate = () => {
    setEditItem(null)
    setForm({ invoiceNo: '', client: '', amount: 0, currency: 'RSD', date: new Date().toISOString().split('T')[0], dueDate: '', paidDate: '', method: 'bank_transfer', status: 'pending', reference: '', category: 'invoice', notes: '' })
    setEditItem(null)
    setSubTab('dodaj')
  }
  const openEdit = (item: Payment) => { setEditItem(item); setForm({ ...item }); setSubTab('dodaj') }

  const handleSave = async () => {
    if (!form.client || !form.amount) { toast.error('Popunite obavezna polja'); return }
    setSaving(true)
    try {
      if (editItem) {
        const res = await fetch(`/api/payments/${editItem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        if (res.ok) { toast.success('Ažurirano'); setSubTab('pregled'); setEditItem(null); fetchData() }
      } else {
        const res = await fetch('/api/payments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        if (res.ok) { toast.success('Kreirano'); setSubTab('pregled'); setEditItem(null); fetchData() }
      }
    } catch { toast.error('Greška') } finally { setSaving(false) }
  }

  if (loading && data.length === 0) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null
  const paidRSD = data.filter(i => i.status === 'paid' && i.currency === 'RSD').reduce((s, i) => s + i.amount, 0)
  const paidEUR = data.filter(i => i.status === 'paid' && i.currency === 'EUR').reduce((s, i) => s + i.amount, 0)
  const overdueAmount = data.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30"><CreditCard className="h-5 w-5 text-emerald-700 dark:text-emerald-400" /></div>
          <div><h1 className="text-2xl font-bold tracking-tight">Plaćanja</h1><p className="text-sm text-muted-foreground">Fakture, uplate, praćenje</p></div>
        </div>
        {subTab === 'pregled' && <Button size="sm" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Novo plaćanje</Button>}
      </div>

      <Tabs value={subTab} onValueChange={(v) => setSubTab(v as 'pregled' | 'dodaj' | 'detalji')}>
        <TabsList>
          <TabsTrigger value="pregled">Pregled</TabsTrigger>
          {editItem && <TabsTrigger value="dodaj">Uredi</TabsTrigger>}
          {!editItem && subTab === 'dodaj' && <TabsTrigger value="dodaj">Dodaj</TabsTrigger>}
          {detailId && detailItem && <TabsTrigger value="detalji">Detalji</TabsTrigger>}
        </TabsList>

        <TabsContent value="pregled" className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><CreditCard className="h-3 w-3" />Ukupno</div><p className="text-2xl font-bold">{data.length}</p></Card>
        <Card className="p-4"><div className="text-xs text-emerald-600 mb-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Plaćeno RSD</div><p className="text-lg font-bold text-emerald-700">{new Intl.NumberFormat('sr-RS').format(paidRSD)}</p></Card>
        <Card className="p-4"><div className="text-xs text-emerald-600 mb-1">Plaćeno EUR</div><p className="text-lg font-bold text-emerald-700">{new Intl.NumberFormat('sr-RS').format(paidEUR)} €</p></Card>
        <Card className="p-4"><div className="text-xs text-red-600 mb-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Kasni</div><p className="text-lg font-bold text-red-700">{new Intl.NumberFormat('sr-RS').format(overdueAmount)}</p></Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-base">Lista plaćanja</CardTitle>
            <div className="flex gap-2 items-center flex-wrap">
              <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-8 w-40 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
              <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
              <Select value={catFilter || 'all'} onValueChange={v => setCatFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem>{Object.entries(CATEGORIES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[520px] overflow-y-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead className="text-xs">Br. fakture</TableHead><TableHead className="text-xs">Klijent</TableHead><TableHead className="text-xs hidden sm:table-cell">Tip</TableHead><TableHead className="text-xs hidden md:table-cell">Iznos</TableHead><TableHead className="text-xs hidden lg:table-cell">Rok</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs text-right">Akcije</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {data.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">Nema plaćanja</TableCell></TableRow> : data.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="text-xs font-mono">{item.invoiceNo}</TableCell>
                    <TableCell className="text-xs font-medium">{item.client}</TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{CATEGORIES[item.category] || item.category}</TableCell>
                    <TableCell className="text-xs hidden md:table-cell font-semibold">{formatAmount(item.amount, item.currency)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{formatDate(item.dueDate)}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-right"><div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setDetailId(item.id); setSubTab('detalji'); }}><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
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

      {/* Detail Card */}
      {detailId && detailItem && (
        <TabsContent value="detalji" className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setDetailId(null); setSubTab('pregled'); }}><ArrowLeft className="h-4 w-4" /></Button>
              <CardTitle className="text-base">{detailItem.invoiceNo}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">{getStatusBadge(detailItem.status)}<Badge className="text-xs bg-muted">{CATEGORIES[detailItem.category] || detailItem.category}</Badge></div>
              <div className="grid grid-cols-2 gap-3">
                {([['Klijent', detailItem.client],['Valuta', detailItem.currency],['Iznos', formatAmount(detailItem.amount, detailItem.currency)],['Datum', formatDate(detailItem.date)],['Rok plaćanja', formatDate(detailItem.dueDate)],['Datum plaćanja', detailItem.paidDate ? formatDate(detailItem.paidDate) : 'Nije plaćeno'],['Način', METHODS[detailItem.method] || detailItem.method],['Referenca', detailItem.reference || '—']] as [string, string][]).map(([l, v]) => (
                  <div key={l} className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground">{l}</div><div className="text-xs font-medium">{v}</div></div>
                ))}
              </div>
              {detailItem.notes && <div className="p-2 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground">Napomene</div><div className="text-xs">{detailItem.notes}</div></div>}
            </div>
          </CardContent>
        </Card>
        </TabsContent>
      )}

      {/* Create/Edit Form */}
      <TabsContent value="dodaj" className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setSubTab('pregled'); setEditItem(null); }}><ArrowLeft className="h-4 w-4" /></Button>
              <CardTitle className="text-base">{editItem ? 'Uredi plaćanje' : 'Novo plaćanje'}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label className="text-xs">Klijent *</Label><Input className="text-xs" value={form.client || ''} onChange={e => setForm({ ...form, client: e.target.value })} /></div>
                <div className="grid gap-2"><Label className="text-xs">Kategorija</Label><Select value={form.category || 'invoice'} onValueChange={v => setForm({ ...form, category: v })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(CATEGORIES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div>
                <div className="grid gap-2"><Label className="text-xs">Iznos</Label><Input type="number" className="text-xs" value={form.amount || ''} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} /></div>
                <div className="grid gap-2"><Label className="text-xs">Valuta</Label><Select value={form.currency || 'RSD'} onValueChange={v => setForm({ ...form, currency: v })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="RSD">RSD</SelectItem><SelectItem value="EUR">EUR</SelectItem></SelectContent></Select></div>
                <div className="grid gap-2"><Label className="text-xs">Br. fakture</Label><Input className="text-xs" value={form.invoiceNo || ''} onChange={e => setForm({ ...form, invoiceNo: e.target.value })} /></div>
                <div className="grid gap-2"><Label className="text-xs">Status</Label><Select value={form.status || 'pending'} onValueChange={v => setForm({ ...form, status: v })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
                <div className="grid gap-2"><Label className="text-xs">Datum fakture</Label><Input type="date" className="text-xs" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
                <div className="grid gap-2"><Label className="text-xs">Rok plaćanja</Label><Input type="date" className="text-xs" value={form.dueDate || ''} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
                <div className="grid gap-2"><Label className="text-xs">Datum plaćanja</Label><Input type="date" className="text-xs" value={form.paidDate || ''} onChange={e => setForm({ ...form, paidDate: e.target.value })} /></div>
                <div className="grid gap-2"><Label className="text-xs">Način plaćanja</Label><Select value={form.method || 'bank_transfer'} onValueChange={v => setForm({ ...form, method: v })}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(METHODS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div>
                <div className="grid gap-2 col-span-2"><Label className="text-xs">Referenca</Label><Input className="text-xs" value={form.reference || ''} onChange={e => setForm({ ...form, reference: e.target.value })} /></div>
                <div className="grid gap-2 col-span-2"><Label className="text-xs">Napomene</Label><Input className="text-xs" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4"><Button variant="outline" size="sm" onClick={() => { setSubTab('pregled'); setEditItem(null); }}>Otkaži</Button><Button size="sm" onClick={handleSave} disabled={saving}>{saving ? 'Čuvanje...' : editItem ? 'Sačuvaj' : 'Kreiraj'}</Button></div>
          </CardContent>
        </Card>
      </TabsContent>

      </Tabs>
    </div>
  )
}
