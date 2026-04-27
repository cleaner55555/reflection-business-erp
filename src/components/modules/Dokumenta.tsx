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
import { Plus, Search, Pencil, Trash2, Files, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate, getStatusColor } from '@/lib/helpers'

interface Doc {
  id: string; title: string; category: string | null; type: string | null; fileName: string | null
  fileSize: number; status: string; partnerId: string | null; expiresAt: string | null; notes: string | null; createdAt: string
  partner?: { id: string; name: string } | null
}

const TYPE_LABELS: Record<string, string> = { faktura: 'Faktura', ugovor: 'Ugovor', ponuda: 'Ponuda', izvestaj: 'Izveštaj', ostalo: 'Ostalo' }

export function Dokumenta() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<Doc | null>(null)

  const fetchDocs = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/documents')
    setDocs(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchDocs() }, [fetchDocs])

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati dokument?')) return
    try { await fetch(`/api/documents/${id}`, { method: 'DELETE' }); toast.success('Obrisano'); fetchDocs() } catch { toast.error('Greška') }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = { title: fd.get('title'), category: fd.get('category'), type: fd.get('type'), fileName: fd.get('fileName'), notes: fd.get('notes'), expiresAt: fd.get('expiresAt') || null }
    try {
      const url = editing ? `/api/documents/${editing.id}` : '/api/documents'
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { toast.error('Greška'); return }
      toast.success(editing ? 'Ažurirano' : 'Kreirano'); setDialogOpen(false); setEditing(null); fetchDocs()
    } catch { toast.error('Greška') } finally { setSubmitting(false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dokumenta</h1>
        <p className="text-muted-foreground text-sm mt-1">Upravljanje ugovorima, ponudama i dokumentima</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div><CardTitle className="text-base font-semibold">Dokumenta</CardTitle><p className="text-xs text-muted-foreground mt-0.5">{docs.length} dokumenata</p></div>
            <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null) }}>
              <DialogTrigger asChild><Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Novi Dokument</Button></DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>{editing ? 'Izmeni' : 'Novi'} Dokument</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} key={editing?.id || 'new'} className="space-y-4">
                  <div className="space-y-2"><Label className="text-xs">Naslov *</Label><Input name="title" defaultValue={editing?.title || ''} required /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label className="text-xs">Tip</Label>
                      <Select name="type" defaultValue={editing?.type || ''}><SelectTrigger><SelectValue placeholder="Izaberite" /></SelectTrigger><SelectContent>
                        <SelectItem value="faktura">Faktura</SelectItem><SelectItem value="ugovor">Ugovor</SelectItem><SelectItem value="ponuda">Ponuda</SelectItem><SelectItem value="izvestaj">Izveštaj</SelectItem><SelectItem value="ostalo">Ostalo</SelectItem>
                      </SelectContent></Select>
                    </div>
                    <div className="space-y-2"><Label className="text-xs">Kategorija</Label><Input name="category" defaultValue={editing?.category || ''} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label className="text-xs">Fajl</Label><Input name="fileName" defaultValue={editing?.fileName || ''} /></div>
                    <div className="space-y-2"><Label className="text-xs">Ističe</Label><Input name="expiresAt" type="date" defaultValue={editing?.expiresAt?.split('T')[0] || ''} /></div>
                  </div>
                  <div className="space-y-2"><Label className="text-xs">Napomene</Label><Input name="notes" defaultValue={editing?.notes || ''} /></div>
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
                <TableHead className="text-xs">Naslov</TableHead><TableHead className="text-xs">Tip</TableHead><TableHead className="text-xs">Kategorija</TableHead><TableHead className="text-xs">Datum</TableHead><TableHead className="text-xs">Ističe</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs w-[80px]">Akcije</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {docs.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">Nema dokumenata</TableCell></TableRow> : docs.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="text-xs font-medium flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-muted-foreground" />{d.title}</TableCell>
                    <TableCell className="text-xs"><Badge variant="secondary" className="text-[10px]">{TYPE_LABELS[d.type || ''] || d.type || '-'}</Badge></TableCell>
                    <TableCell className="text-xs">{d.category || '-'}</TableCell>
                    <TableCell className="text-xs">{formatDate(d.createdAt)}</TableCell>
                    <TableCell className="text-xs">{d.expiresAt ? formatDate(d.expiresAt) : '-'}</TableCell>
                    <TableCell><Badge variant="outline" className={`text-[10px] ${getStatusColor(d.status)}`}>{d.status}</Badge></TableCell>
                    <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(d); setDialogOpen(true) }}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(d.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div></TableCell>
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
