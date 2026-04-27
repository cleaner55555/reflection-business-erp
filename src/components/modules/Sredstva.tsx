'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Pencil, Trash2, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatRSD, formatDate, getStatusColor } from '@/lib/helpers'

interface Asset {
  id: string; name: string; category: string | null; serialNumber: string | null
  purchaseDate: string; purchasePrice: number; currentValue: number; depreciation: number
  usefulLife: number; location: string | null; status: string; notes: string | null; createdAt: string
}

const STATUS_LABELS: Record<string, string> = { aktivno: 'Aktivno', na_popravci: 'Na popravci', izvan_upotrebe: 'Izvan upotrebe', prodato: 'Prodato', otpisano: 'Otpisano' }

export function Sredstva() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<Asset | null>(null)

  const fetchAssets = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/assets')
    setAssets(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchAssets() }, [fetchAssets])

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati sredstvo?')) return
    try { await fetch(`/api/assets/${id}`, { method: 'DELETE' }); toast.success('Obrisano'); fetchAssets() } catch { toast.error('Greška') }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = { name: fd.get('name'), category: fd.get('category'), serialNumber: fd.get('serialNumber'), purchaseDate: fd.get('purchaseDate'), purchasePrice: fd.get('purchasePrice'), currentValue: fd.get('currentValue'), usefulLife: fd.get('usefulLife'), location: fd.get('location'), status: fd.get('status'), notes: fd.get('notes') }
    try {
      const url = editing ? `/api/assets/${editing.id}` : '/api/assets'
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { toast.error('Greška'); return }
      toast.success(editing ? 'Ažurirano' : 'Kreirano'); setDialogOpen(false); setEditing(null); fetchAssets()
    } catch { toast.error('Greška') } finally { setSubmitting(false) }
  }

  const totalValue = assets.reduce((s, a) => s + a.currentValue, 0)
  const totalDep = assets.reduce((s, a) => s + a.depreciation, 0)
  const activeCount = assets.filter(a => a.status === 'aktivno').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Osnovna Sredstva</h1>
        <p className="text-muted-foreground text-sm mt-1">Praćenje i amortizacija osnovnih sredstava</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4"><p className="text-xs text-muted-foreground">Trenutna vrednost</p><p className="text-lg font-bold">{formatRSD(totalValue)}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Ukupna amortizacija</p><p className="text-lg font-bold text-red-600">{formatRSD(totalDep)}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Aktivna sredstva</p><p className="text-lg font-bold">{activeCount}</p></Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-semibold">Sva sredstva</CardTitle>
            <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null) }}>
              <DialogTrigger asChild><Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Novo Sredstvo</Button></DialogTrigger>
              <DialogContent key={editing?.id || 'new'} className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{editing ? 'Izmeni' : 'Novo'} Sredstvo</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2"><Label className="text-xs">Naziv *</Label><Input name="name" defaultValue={editing?.name || ''} required /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label className="text-xs">Kategorija</Label>
                      <Select name="category" defaultValue={editing?.category || ''}><SelectTrigger><SelectValue placeholder="Izaberite" /></SelectTrigger><SelectContent>
                        <SelectItem value="IT oprema">IT oprema</SelectItem><SelectItem value="vozila">Vozila</SelectItem><SelectItem name="uredjaj">Uređaj</SelectItem><SelectItem value="nameštaj">Nameštaj</SelectItem><SelectItem value="alat">Alat</SelectItem><SelectItem value="ostalo">Ostalo</SelectItem>
                      </SelectContent></Select>
                    </div>
                    <div className="space-y-2"><Label className="text-xs">Serijski broj</Label><Input name="serialNumber" defaultValue={editing?.serialNumber || ''} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label className="text-xs">Datum kupovine</Label><Input name="purchaseDate" type="date" defaultValue={editing?.purchaseDate?.split('T')[0] || ''} /></div>
                    <div className="space-y-2"><Label className="text-xs">Lokacija</Label><Input name="location" defaultValue={editing?.location || ''} /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2"><Label className="text-xs">Nabavna cena</Label><Input name="purchasePrice" type="number" step="0.01" defaultValue={editing?.purchasePrice || ''} /></div>
                    <div className="space-y-2"><Label className="text-xs">Trenutna vrednost</Label><Input name="currentValue" type="number" step="0.01" defaultValue={editing?.currentValue || ''} /></div>
                    <div className="space-y-2"><Label className="text-xs">Životni vek (mes.)</Label><Input name="usefulLife" type="number" defaultValue={editing?.usefulLife || '60'} /></div>
                  </div>
                  <div className="space-y-2"><Label className="text-xs">Status</Label>
                    <Select name="status" defaultValue={editing?.status || 'aktivno'}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                      <SelectItem value="aktivno">Aktivno</SelectItem><SelectItem value="na_popravci">Na popravci</SelectItem><SelectItem value="izvan_upotrebe">Izvan upotrebe</SelectItem><SelectItem value="prodato">Prodato</SelectItem><SelectItem value="otpisano">Otpisano</SelectItem>
                    </SelectContent></Select>
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>{submitting ? 'Čuvanje...' : 'Sačuvaj'}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div> : (
            <div className="max-h-[500px] overflow-y-auto">
              <Table><TableHeader><TableRow>
                <TableHead className="text-xs">Naziv</TableHead><TableHead className="text-xs">Kategorija</TableHead><TableHead className="text-xs">Serijski br.</TableHead><TableHead className="text-xs text-right">Nabavna</TableHead><TableHead className="text-xs text-right">Trenutna</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs w-[80px]">Akcije</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {assets.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="text-xs font-medium">{a.name}</TableCell>
                    <TableCell className="text-xs">{a.category || '-'}</TableCell>
                    <TableCell className="text-xs font-mono">{a.serialNumber || '-'}</TableCell>
                    <TableCell className="text-xs text-right">{formatRSD(a.purchasePrice)}</TableCell>
                    <TableCell className="text-xs text-right font-medium">{formatRSD(a.currentValue)}</TableCell>
                    <TableCell><Badge variant="outline" className={`text-[10px] ${getStatusColor(a.status)}`}>{STATUS_LABELS[a.status] || a.status}</Badge></TableCell>
                    <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(a); setDialogOpen(true) }}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(a.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div></TableCell>
                  </TableRow>
                ))}
              </TableBody></Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
