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
import { Plus, Search, Trash2, Pencil, Eye, Star, ThumbsUp, ThumbsDown, MessageSquare, TrendingUp, AlertTriangle, Filter, BarChart3, Reply, Flag, CheckCircle2, Clock } from 'lucide-react'
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
  status: 'pending' | 'approved' | 'rejected' | 'flagged' | 'responded'
  source: 'website' | 'email' | 'google' | 'social'
  verified: boolean
  helpful: number
  notHelpful: number
  createdAt: string
  responseText: string | null
  respondedAt: string | null
  respondedBy: string | null
}

const INITIAL_DATA: Review[] = [
  { id: '1', customerName: 'Jelena Marković', customerEmail: 'jelena@email.com', productName: 'Bluetooth zvučnik JBL', productSku: 'BTS-JBL01', category: 'Audio', rating: 5, title: 'Odličan zvučnik za tu cenu!', content: 'Kvalitet zvuka je izvanredan, baterija traje 8+ sati. Bluetooth konekcija stabilna. Preporučujem svima!', status: 'approved', source: 'website', verified: true, helpful: 24, notHelpful: 2, createdAt: '2024-06-14', responseText: 'Hvala Vam na prelepoj recenziji! Radujemo se što ste zadovoljni.', respondedAt: '2024-06-14', respondedBy: 'Support tim' },
  { id: '2', customerName: 'Stefan Ilić', customerEmail: 'stefan@email.com', productName: 'Tenisice Nike Air Max', productSku: 'SHO-NAM90', category: 'Obuća', rating: 4, title: 'Udobne ali veličina malo veća', content: 'Vrlo udobne patike za svakodnevno nošenje. Jedina primedba je da traju pola broja veće nego što piše na labeli.', status: 'approved', source: 'google', verified: true, helpful: 18, notHelpful: 3, createdAt: '2024-06-13', responseText: null, respondedAt: null, respondedBy: null },
  { id: '3', customerName: 'Ana Đorđević', customerEmail: 'ana@email.com', productName: 'Majica - crna (XL)', productSku: 'TSH-BLK-XL', category: 'Odeća', rating: 2, title: 'Kvalitet nije ono što sam očekivala', content: 'Majica je stigla ali je vrlo tanka i nakon jednog pranja se izvukla. Za ovu cenu sam očekivala bolji kvalitet.', status: 'responded', source: 'website', verified: true, helpful: 12, notHelpful: 8, createdAt: '2024-06-12', responseText: 'Žao nam je zbog Vašeg iskustva. Kontaktirajte nas na support za mogućnost povrata ili zamene.', respondedAt: '2024-06-12', respondedBy: 'Support tim' },
  { id: '4', customerName: 'Petar Stanković', customerEmail: 'petar@email.com', productName: 'Drvena stolica Classic', productSku: 'CHR-CLS01', category: 'Nameštaj', rating: 1, title: 'TOTALNO LOŠE - NE KUPUJTE', content: 'Stolica je stigla POLOMLJENA! Nikakva zaštita u transportu. Pokušao sam da pozovem ali niko ne odgovara. JEDI GOVNA FIRMA!!!', status: 'flagged', source: 'website', verified: true, helpful: 5, notHelpful: 15, createdAt: '2024-06-15', responseText: null, respondedAt: null, respondedBy: null },
  { id: '5', customerName: 'Miroslav Jovanović', customerEmail: 'miroslav@email.com', productName: 'Bosch bušilica GSB 550', productSku: 'DRL-BOS550', category: 'Alati', rating: 5, title: 'Profesionalna bušilica', content: 'Koristim za građevinske radove svaki dan. Odlična snaga, ergonomski držak. Zaista profesionalan alat.', status: 'pending', source: 'email', verified: true, helpful: 8, notHelpful: 0, createdAt: '2024-06-15', responseText: null, respondedAt: null, respondedBy: null },
  { id: '6', customerName: 'Ljubica Perić', customerEmail: 'ljubica@email.com', productName: 'Keramičke šolje set', productSku: 'CUP-SET6', category: 'Kuhinjski', rating: 3, title: 'Lep set ali slaba zaštita', content: 'Šolje su prelepe i kvalitetne ali su 2 od 6 stigle polomljene. Zaštita u pakovanju bi trebalo da je bolja.', status: 'approved', source: 'social', verified: false, helpful: 6, notHelpful: 1, createdAt: '2024-06-11', responseText: null, respondedAt: null, respondedBy: null },
  { id: '7', customerName: 'Goran Đorđević', customerEmail: 'goran@email.com', productName: 'LED monitor 27" 4K', productSku: 'MON-4K27', category: 'Monitori', rating: 4, title: 'Sjajan monitor, samo malo IPS bleeding', content: 'Slika je kristalno čista, boje tačne. Jedina mana je blago IPS bleeding u donjim uglovima koji se primećuje samo na potpuno crnoj pozadini.', status: 'pending', source: 'website', verified: true, helpful: 31, notHelpful: 4, createdAt: '2024-06-15', responseText: null, respondedAt: null, respondedBy: null },
  { id: '8', customerName: 'Nenad Milić', customerEmail: 'nenad@email.com', productName: 'Navlaka za auto sedišta', productSku: 'AUT-COV01', category: 'Auto', rating: 1, title: 'Ne odgovara modelu', content: 'Kupio sam za Golf 7 ali ne sedi dobro. Navlaka klizi i ne izgleda kao na slikama. Vraćam.', status: 'rejected', source: 'website', verified: false, helpful: 2, notHelpful: 3, createdAt: '2024-06-10', responseText: null, respondedAt: null, respondedBy: null },
]

const STATUSES: Record<string, { color: string; label: string }> = {
  pending: { color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300', label: 'Čeka odobrenje' },
  approved: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300', label: 'Odobrena' },
  rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', label: 'Odbijena' },
  flagged: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300', label: 'Označena' },
  responded: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', label: 'Odgovorena' },
}

const SOURCES: Record<string, { label: string }> = { website: { label: 'Web sajt' }, email: { label: 'Email' }, google: { label: 'Google' }, social: { label: 'Društvene mreže' } }

function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge> : <Badge className="text-[10px]">{s}</Badge> }

function StarRating({ rating, size = 'sm' }: { rating: number; size?: string }) {
  return <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map(i => <Star key={i} className={`${size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5'} ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />)}</div>
}

export function Reviews() {
  const [data, setData] = useState<Review[]>(INITIAL_DATA)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [responseDialogId, setResponseDialogId] = useState<string | null>(null)
  const [responseText, setResponseText] = useState('')
  const [activeTab, setActiveTab] = useState('reviews')

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const filtered = useMemo(() => data.filter(item => {
    const matchSearch = !search || item.customerName.toLowerCase().includes(search.toLowerCase()) || item.productName.toLowerCase().includes(search.toLowerCase()) || item.title.toLowerCase().includes(search.toLowerCase()) || item.content.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchRating = !ratingFilter || item.rating === Number(ratingFilter)
    const matchSource = !sourceFilter || item.source === sourceFilter
    return matchSearch && matchStatus && matchRating && matchSource
  }), [data, search, statusFilter, ratingFilter, sourceFilter])

  const stats = useMemo(() => ({
    total: data.length, avgRating: (data.reduce((s, d) => s + d.rating, 0) / data.length).toFixed(1),
    pending: data.filter(d => d.status === 'pending').length, flagged: data.filter(d => d.status === 'flagged').length,
    responded: data.filter(d => d.status === 'responded').length, verified: data.filter(d => d.verified).length,
    distribution: [5, 4, 3, 2, 1].map(r => ({ rating: r, count: data.filter(d => d.rating === r).length })),
    byCategory: (() => { const m: Record<string, { count: number; avg: number }> = {}; data.forEach(d => { if (!m[d.category]) m[d.category] = { count: 0, avg: 0 }; m[d.category].count++; m[d.category].avg += d.rating }); Object.keys(m).forEach(k => { m[k].avg = Number((m[k].avg / m[k].count).toFixed(1)) }); return Object.entries(m).sort((a, b) => b[1].count - a[1].count) })(),
  }), [data])

  const handleStatusChange = (id: string, newStatus: Review['status']) => {
    setData(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d))
    toast.success(`Status: ${STATUSES[newStatus]?.label}`)
  }

  const handleResponse = () => {
    if (!responseText.trim()) { toast.error('Unesite odgovor'); return }
    setData(prev => prev.map(d => d.id === responseDialogId ? { ...d, responseText, status: 'responded' as Review['status'], respondedAt: new Date().toISOString().split('T')[0], respondedBy: 'Support tim' } : d))
    toast.success('Odgovor poslat')
    setResponseDialogId(null); setResponseText('')
  }

  const handleDelete = (id: string) => { if (!confirm('Obrisati recenziju?')) return; setData(prev => prev.filter(i => i.id !== id)); toast.success('Recenzija obrisana') }

  const handleToggleHelpful = (id: string, type: 'helpful' | 'notHelpful') => {
    setData(prev => prev.map(d => d.id === id ? { ...d, [type]: d[type] + 1 } : d))
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
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Prosek ocena</div><div className="flex items-center gap-2"><StarRating rating={Math.round(Number(stats.avgRating))} /><span className="text-xl font-bold">{stats.avgRating}</span></div></Card>
        <Card className="p-4"><div className="text-[10px] text-muted-foreground mb-1">Ukupno</div><p className="text-xl font-bold">{stats.total}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-slate-600 mb-1">Čeka</div><p className="text-xl font-bold text-slate-700">{stats.pending}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-amber-600 mb-1">Označene</div><p className="text-xl font-bold text-amber-700">{stats.flagged}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-blue-600 mb-1">Odgovorene</div><p className="text-xl font-bold text-blue-700">{stats.responded}</p></Card>
        <Card className="p-4"><div className="text-[10px] text-emerald-600 mb-1">Verifikovane</div><p className="text-xl font-bold text-emerald-700">{stats.verified}</p></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="reviews">Recenzije</TabsTrigger><TabsTrigger value="analytics">Analitika</TabsTrigger></TabsList>

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-base">Sve recenzije</CardTitle>
                <div className="flex gap-2 items-center flex-wrap">
                  <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Kupac, proizvod..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
                  <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
                  <Select value={ratingFilter || 'all'} onValueChange={v => setRatingFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-20 h-8 text-xs"><SelectValue placeholder="Ocena" /></SelectTrigger><SelectContent><SelectItem value="all">Sve</SelectItem><SelectItem value="5">5★</SelectItem><SelectItem value="4">4★</SelectItem><SelectItem value="3">3★</SelectItem><SelectItem value="2">2★</SelectItem><SelectItem value="1">1★</SelectItem></SelectContent></Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[560px] overflow-y-auto space-y-3">
                {filtered.length === 0 ? <p className="text-center py-8 text-muted-foreground text-sm">Nema recenzija</p> : filtered.map(item => (
                  <div key={item.id} className="p-4 rounded-lg border space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{item.customerName}</span>
                        {item.verified && <Badge className="bg-emerald-100 text-emerald-700 text-[9px] gap-1"><CheckCircle2 className="h-2.5 w-2.5" />Verifikovana</Badge>}
                        <Badge variant="outline" className="text-[9px]">{SOURCES[item.source]?.label}</Badge>
                      </div>
                      <div className="flex items-center gap-2">{getStatusBadge(item.status)}<StarRating rating={item.rating} /></div>
                    </div>
                    <div><p className="text-sm font-medium">{item.title}</p><p className="text-xs text-muted-foreground">{item.content}</p></div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span>{item.productName}</span>
                        <span>·</span>
                        <span>{formatDate(item.createdAt)}</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5"><ThumbsUp className="h-3 w-3" />{item.helpful}</span>
                        <span className="flex items-center gap-0.5"><ThumbsDown className="h-3 w-3" />{item.notHelpful}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={() => setDetailId(item.id)}><Eye className="h-3 w-3" />Detalji</Button>
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={() => { setResponseDialogId(item.id); setResponseText(item.responseText || '') }}><Reply className="h-3 w-3" />Odgovori</Button>
                        <Select value={item.status} onValueChange={v => handleStatusChange(item.id, v as Review['status'])}><SelectTrigger className="h-6 w-28 text-[10px]"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleDelete(item.id)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                    {item.responseText && <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 mt-2"><p className="text-[10px] text-blue-600 mb-1">Odgovor — {item.respondedBy} ({formatDate(item.respondedAt!)})</p><p className="text-xs">{item.responseText}</p></div>}
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
                {stats.byCategory.map(([cat, info]) => (
                  <div key={cat} className="flex items-center justify-between p-2 rounded-lg bg-muted/50"><div><p className="text-xs font-medium">{cat}</p><p className="text-[10px] text-muted-foreground">{info.count} recenzija</p></div><div className="flex items-center gap-1"><StarRating rating={Math.round(info.avg)} /><span className="text-xs font-bold">{info.avg}</span></div></div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Detalji recenzije</DialogTitle></DialogHeader>
          {detailItem && (
            <div className="space-y-4">
              <div className="flex items-center justify-between"><div><p className="text-sm font-bold">{detailItem.customerName}</p><p className="text-xs text-muted-foreground">{detailItem.customerEmail}</p></div><div className="flex items-center gap-2">{getStatusBadge(detailItem.status)}<Badge variant="outline" className="text-[10px]">{SOURCES[detailItem.source]?.label}</Badge></div></div>
              <div className="p-4 rounded-lg border space-y-2">
                <div className="flex items-center gap-3"><StarRating rating={detailItem.rating} size="md" /><Badge variant="outline" className="text-xs">{detailItem.category}</Badge></div>
                <p className="font-medium">{detailItem.title}</p>
                <p className="text-sm text-muted-foreground">{detailItem.content}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                  <span>Proizvod: {detailItem.productName} ({detailItem.productSku})</span>
                  <span>Datum: {formatDate(detailItem.createdAt)}</span>
                </div>
                <div className="flex items-center gap-4 text-xs pt-1">
                  <span className="flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5 text-emerald-600" />{detailItem.helpful} korisno</span>
                  <span className="flex items-center gap-1"><ThumbsDown className="h-3.5 w-3.5 text-red-600" />{detailItem.notHelpful} nekorisno</span>
                </div>
              </div>
              {detailItem.responseText && <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20"><p className="text-[10px] text-blue-600 mb-1">Odgovor od {detailItem.respondedBy} ({formatDate(detailItem.respondedAt!)})</p><p className="text-xs">{detailItem.responseText}</p></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Response Dialog */}
      <Dialog open={!!responseDialogId} onOpenChange={() => setResponseDialogId(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Odgovor na recenziju</DialogTitle></DialogHeader>
          {responseItem && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs font-medium">{responseItem.customerName} — {responseItem.productName}</p><p className="text-xs text-muted-foreground mt-1">"{responseItem.title}"</p></div>
              <div className="grid gap-2"><Label className="text-xs">Vaš odgovor</Label><Textarea placeholder="Napišite odgovor na recenziju..." className="text-xs min-h-[100px]" value={responseText} onChange={e => setResponseText(e.target.value)} /></div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setResponseDialogId(null)}>Otkaži</Button><Button onClick={handleResponse}>Pošalji odgovor</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
