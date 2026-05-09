'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Search, Trash2, Eye, Star, ThumbsUp, ThumbsDown, TrendingUp, BarChart3, Reply, CheckCircle2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

interface Review {
  id: string
  customerName: string
  customerEmail: string
  productName: string
  productSku: string
  category: string
  rating: number
  title: string
  content: string
  status: string
  source: string
  verified: boolean
  helpful: number
  notHelpful: number
  createdAt: string
  responseText: string
  respondedAt: string
  respondedBy: string
}

const STATUSES: Record<string, { color: string; label: string }> = {
  pending: { color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300', label: 'Čeka odobrenje' },
  approved: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300', label: 'Odobrena' },
  rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', label: 'Odbijena' },
  flagged: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300', label: 'Označena' },
  responded: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', label: 'Odgovorena' },
}

const SOURCES: Record<string, { label: string }> = { website: { label: 'Web sajt' }, email: { label: 'Email' }, google: { label: 'Google' }, social: { label: 'Društvene mreže' } }

function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge> }

function StarRating({ rating, size = 'sm' }: { rating: number; size?: string }) {
  return <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map(i => <Star key={i} className={`${size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5'} ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />)}</div>
}

export function Reviews() {
  const { activeCompanyId } = useAppStore()
  const [data, setData] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [responseDialogId, setResponseDialogId] = useState<string | null>(null)
  const [responseText, setResponseText] = useState('')
  const [activeTab, setActiveTab] = useState('reviews')

  const loadData = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ companyId: activeCompanyId, limit: '200' })
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      if (ratingFilter) params.set('rating', ratingFilter)
      const res = await fetch(`/api/reviews?${params}`)
      if (res.ok) {
        const json = await res.json()
        setData(json.items || [])
      }
    } catch (err) {
      console.error('Failed to load reviews:', err)
    }
    setLoading(false)
  }, [activeCompanyId, search, statusFilter, ratingFilter])

  useEffect(() => { loadData() }, [loadData])

  const filtered = useMemo(() => {
    if (!search && !statusFilter && !ratingFilter) return data
    return data.filter(item => {
      const matchSearch = !search || item.customerName.toLowerCase().includes(search.toLowerCase()) || item.productName.toLowerCase().includes(search.toLowerCase()) || item.title.toLowerCase().includes(search.toLowerCase())
      const matchStatus = !statusFilter || item.status === statusFilter
      const matchRating = !ratingFilter || item.rating === Number(ratingFilter)
      return matchSearch && matchStatus && matchRating
    })
  }, [data, search, statusFilter, ratingFilter])

  const stats = useMemo(() => ({
    total: data.length,
    avgRating: data.length > 0 ? (data.reduce((s, d) => s + d.rating, 0) / data.length).toFixed(1) : '0.0',
    pending: data.filter(d => d.status === 'pending').length,
    flagged: data.filter(d => d.status === 'flagged').length,
    responded: data.filter(d => d.status === 'responded').length,
    verified: data.filter(d => d.verified).length,
    distribution: [5, 4, 3, 2, 1].map(r => ({ rating: r, count: data.filter(d => d.rating === r).length })),
    byCategory: (() => { const m: Record<string, { count: number; avg: number }> = {}; data.forEach(d => { if (!d.category) return; if (!m[d.category]) m[d.category] = { count: 0, avg: 0 }; m[d.category].count++; m[d.category].avg += d.rating }); Object.keys(m).forEach(k => { m[k].avg = Number((m[k].avg / m[k].count).toFixed(1)) }); return Object.entries(m).sort((a, b) => b[1].count - a[1].count) })(),
  }), [data])

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) })
      if (res.ok) { toast.success(`Status: ${STATUSES[newStatus]?.label}`); loadData() }
    } catch { toast.error('Greška') }
  }

  const handleResponse = async () => {
    if (!responseText.trim()) { toast.error('Unesite odgovor'); return }
    if (!responseDialogId) return
    try {
      const res = await fetch(`/api/reviews/${responseDialogId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'responded', responseText, respondedAt: new Date().toISOString().split('T')[0], respondedBy: 'Support tim' }),
      })
      if (res.ok) { toast.success('Odgovor poslat'); setResponseDialogId(null); setResponseText(''); loadData() }
    } catch { toast.error('Greška') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati recenziju?')) return
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Recenzija obrisana'); loadData() }
    } catch { toast.error('Greška') }
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null
  const responseItem = responseDialogId ? data.find(i => i.id === responseDialogId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30"><Star className="h-5 w-5 text-amber-700 dark:text-amber-400" /></div>
          <div><h1 className="text-2xl font-bold tracking-tight">Recenzije</h1><p className="text-sm text-muted-foreground">Upravljanje recenzijama kupaca</p></div>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={loadData}><RefreshCw className="h-4 w-4" /> Osveži</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Prosek ocena</div><div className="flex items-center gap-2"><StarRating rating={Math.round(Number(stats.avgRating))} /><span className="text-xl font-bold">{stats.avgRating}</span></div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Ukupno</div><p className="text-xl font-bold">{stats.total}</p></Card>
        <Card className="p-4"><div className="text-xs text-slate-600 mb-1">Čeka</div><p className="text-xl font-bold text-slate-700">{stats.pending}</p></Card>
        <Card className="p-4"><div className="text-xs text-amber-600 mb-1">Označene</div><p className="text-xl font-bold text-amber-700">{stats.flagged}</p></Card>
        <Card className="p-4"><div className="text-xs text-blue-600 mb-1">Odgovorene</div><p className="text-xl font-bold text-blue-700">{stats.responded}</p></Card>
        <Card className="p-4"><div className="text-xs text-emerald-600 mb-1">Verifikovane</div><p className="text-xl font-bold text-emerald-700">{stats.verified}</p></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="reviews">Recenzije</TabsTrigger><TabsTrigger value="analytics">Analitika</TabsTrigger></TabsList>

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-base">Sve recenzije</CardTitle>
                <div className="flex gap-2 items-center flex-wrap">
                  <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Kupac, proizvod..." className="pl-8 h-8 w-44 text-sm" value={search} onChange={e => setSearch(e.target.value)} /></div>
                  <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
                  <Select value={ratingFilter || 'all'} onValueChange={v => setRatingFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-20 h-8 text-xs"><SelectValue placeholder="Ocena" /></SelectTrigger><SelectContent><SelectItem value="all">Sve</SelectItem><SelectItem value="5">5★</SelectItem><SelectItem value="4">4★</SelectItem><SelectItem value="3">3★</SelectItem><SelectItem value="2">2★</SelectItem><SelectItem value="1">1★</SelectItem></SelectContent></Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[560px] overflow-y-auto space-y-3">
                {filtered.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Star className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Nema recenzija</p>
                  </div>
                ) : filtered.map(item => (
                  <div key={item.id} className="p-4 rounded-lg border space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.customerName}</span>
                        {item.verified && <Badge className="bg-emerald-100 text-emerald-700 text-xs gap-1"><CheckCircle2 className="h-2.5 w-2.5" />Verifikovana</Badge>}
                        <Badge variant="outline" className="text-xs">{SOURCES[item.source]?.label}</Badge>
                      </div>
                      <div className="flex items-center gap-2">{getStatusBadge(item.status)}<StarRating rating={item.rating} /></div>
                    </div>
                    <div><p className="text-sm font-medium">{item.title}</p><p className="text-xs text-muted-foreground">{item.content}</p></div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{item.productName}</span><span>·</span><span>{formatDate(item.createdAt)}</span><span>·</span>
                        <span className="flex items-center gap-0.5"><ThumbsUp className="h-3 w-3" />{item.helpful}</span>
                        <span className="flex items-center gap-0.5"><ThumbsDown className="h-3 w-3" />{item.notHelpful}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={() => setDetailId(item.id)}><Eye className="h-3 w-3" />Detalji</Button>
                        <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={() => { setResponseDialogId(item.id); setResponseText(item.responseText || '') }}><Reply className="h-3 w-3" />Odgovori</Button>
                        <Select value={item.status} onValueChange={v => handleStatusChange(item.id, v)}><SelectTrigger className="h-6 w-28 text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleDelete(item.id)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                    {item.responseText && <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 mt-2"><p className="text-xs text-blue-600 mb-1">Odgovor — {item.respondedBy} ({formatDate(item.respondedAt)})</p><p className="text-xs">{item.responseText}</p></div>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-amber-600" />Distribucija ocena</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {stats.distribution.map(d => {
                  const pct = data.length > 0 ? (d.count / data.length) * 100 : 0
                  return <div key={d.rating} className="flex items-center gap-2"><StarRating rating={d.rating} /><div className="flex-1 h-3 rounded-full bg-muted overflow-hidden"><div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} /></div><span className="text-xs font-medium w-12 text-right">{d.count}</span></div>
                })}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-600" />Po kategoriji</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {stats.byCategory.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">Nema podataka</p> : stats.byCategory.map(([cat, info]) => (
                  <div key={cat} className="flex items-center justify-between p-2 rounded-lg bg-muted/50"><div><p className="text-xs font-medium">{cat}</p><p className="text-xs text-muted-foreground">{info.count} recenzija</p></div><div className="flex items-center gap-1"><StarRating rating={Math.round(info.avg)} /><span className="text-xs font-bold">{info.avg}</span></div></div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Detalji recenzije</DialogTitle><DialogDescription>Pregled detalja recenzije</DialogDescription></DialogHeader>
          {detailItem && (
            <div className="space-y-4">
              <div className="flex items-center justify-between"><div><p className="text-sm font-bold">{detailItem.customerName}</p><p className="text-xs text-muted-foreground">{detailItem.customerEmail || '—'}</p></div><div className="flex items-center gap-2">{getStatusBadge(detailItem.status)}<Badge variant="outline" className="text-xs">{SOURCES[detailItem.source]?.label}</Badge></div></div>
              <div className="p-4 rounded-lg border space-y-2">
                <div className="flex items-center gap-3"><StarRating rating={detailItem.rating} size="md" /><Badge variant="outline" className="text-xs">{detailItem.category || '—'}</Badge></div>
                <p className="font-medium">{detailItem.title}</p>
                <p className="text-sm text-muted-foreground">{detailItem.content}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                  <span>Proizvod: {detailItem.productName || '—'} ({detailItem.productSku || '—'})</span><span>Datum: {formatDate(detailItem.createdAt)}</span>
                </div>
                <div className="flex items-center gap-4 text-xs pt-1">
                  <span className="flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5 text-emerald-600" />{detailItem.helpful} korisno</span>
                  <span className="flex items-center gap-1"><ThumbsDown className="h-3.5 w-3.5 text-red-600" />{detailItem.notHelpful} nekorisno</span>
                </div>
              </div>
              {detailItem.responseText && <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20"><p className="text-xs text-blue-600 mb-1">Odgovor od {detailItem.respondedBy} ({formatDate(detailItem.respondedAt)})</p><p className="text-xs">{detailItem.responseText}</p></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!responseDialogId} onOpenChange={() => setResponseDialogId(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Odgovor na recenziju</DialogTitle><DialogDescription>Pišite odgovor na recenziju korisnika</DialogDescription></DialogHeader>
          {responseItem && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs font-medium">{responseItem.customerName} — {responseItem.productName}</p><p className="text-xs text-muted-foreground mt-1">&quot;{responseItem.title}&quot;</p></div>
              <div className="grid gap-2"><Label className="text-xs">Vaš odgovor</Label><Textarea placeholder="Napišite odgovor na recenziju..." className="text-sm min-h-[100px]" value={responseText} onChange={e => setResponseText(e.target.value)} /></div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setResponseDialogId(null)}>Otkaži</Button><Button onClick={handleResponse}>Pošalji odgovor</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
