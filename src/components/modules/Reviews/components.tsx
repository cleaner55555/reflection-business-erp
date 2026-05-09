'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Search, Star, ThumbsUp, ThumbsDown, CheckCircle2, TrendingUp, BarChart3, Reply, Trash2, Eye } from 'lucide-react'
import { formatDate } from '@/lib/helpers'
import type { Review } from './types'
import { STATUSES, SOURCES } from './data'

/* ---- Badge helpers ---- */
export function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge> }

export function StarRating({ rating, size = 'sm' }: { rating: number; size?: string }) {
  return <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map(i => <Star key={i} className={`${size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5'} ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />)}</div>
}

/* ---- KPI Cards ---- */
export function KpiCards({ stats }: { stats: { avgRating: string; total: number; pending: number; flagged: number; responded: number; verified: number } }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
      <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Prosek ocena</div><div className="flex items-center gap-2"><StarRating rating={Math.round(Number(stats.avgRating))} /><span className="text-xl font-bold">{stats.avgRating}</span></div></Card>
      <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Ukupno</div><p className="text-xl font-bold">{stats.total}</p></Card>
      <Card className="p-4"><div className="text-xs text-slate-600 mb-1">Čeka</div><p className="text-xl font-bold text-slate-700">{stats.pending}</p></Card>
      <Card className="p-4"><div className="text-xs text-amber-600 mb-1">Označene</div><p className="text-xl font-bold text-amber-700">{stats.flagged}</p></Card>
      <Card className="p-4"><div className="text-xs text-blue-600 mb-1">Odgovorene</div><p className="text-xl font-bold text-blue-700">{stats.responded}</p></Card>
      <Card className="p-4"><div className="text-xs text-emerald-600 mb-1">Verifikovane</div><p className="text-xl font-bold text-emerald-700">{stats.verified}</p></Card>
    </div>
  )
}

/* ---- Reviews List ---- */
export function ReviewsList({ filtered, search, statusFilter, ratingFilter, onViewDetail, onOpenResponse, onStatusChange, onDelete }: {
  filtered: Review[]
  search: string
  statusFilter: string
  ratingFilter: string
  onViewDetail: (id: string) => void
  onOpenResponse: (id: string) => void
  onStatusChange: (id: string, status: Review['status']) => void
  onDelete: (id: string) => void
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-base">Sve recenzije</CardTitle>
          <div className="flex gap-2 items-center flex-wrap">
            <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Kupac, proizvod..." className="pl-8 h-8 w-44 text-xs" value={search} onChange={e => {}} /></div>
            <Select value={statusFilter || 'all'} onValueChange={() => {}}><SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
            <Select value={ratingFilter || 'all'} onValueChange={() => {}}><SelectTrigger className="w-20 h-8 text-xs"><SelectValue placeholder="Ocena" /></SelectTrigger><SelectContent><SelectItem value="all">Sve</SelectItem><SelectItem value="5">5★</SelectItem><SelectItem value="4">4★</SelectItem><SelectItem value="3">3★</SelectItem><SelectItem value="2">2★</SelectItem><SelectItem value="1">1★</SelectItem></SelectContent></Select>
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
                  {item.verified && <Badge className="bg-emerald-100 text-emerald-700 text-xs gap-1"><CheckCircle2 className="h-2.5 w-2.5" />Verifikovana</Badge>}
                  <Badge variant="outline" className="text-xs">{SOURCES[item.source]?.label}</Badge>
                </div>
                <div className="flex items-center gap-2">{getStatusBadge(item.status)}<StarRating rating={item.rating} /></div>
              </div>
              <div><p className="text-sm font-medium">{item.title}</p><p className="text-xs text-muted-foreground">{item.content}</p></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{item.productName}</span>
                  <span>·</span>
                  <span>{formatDate(item.createdAt)}</span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5"><ThumbsUp className="h-3 w-3" />{item.helpful}</span>
                  <span className="flex items-center gap-0.5"><ThumbsDown className="h-3 w-3" />{item.notHelpful}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={() => onViewDetail(item.id)}><Eye className="h-3 w-3" />Detalji</Button>
                  <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={() => onOpenResponse(item.id)}><Reply className="h-3 w-3" />Odgovori</Button>
                  <Select value={item.status} onValueChange={v => onStatusChange(item.id, v as Review['status'])}><SelectTrigger className="h-6 w-28 text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => onDelete(item.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
              {item.responseText && <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 mt-2"><p className="text-xs text-blue-600 mb-1">Odgovor — {item.respondedBy} ({formatDate(item.respondedAt!)})</p><p className="text-xs">{item.responseText}</p></div>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/* ---- Analytics Tab ---- */
export function AnalyticsTab({ stats, data }: { stats: { distribution: { rating: number; count: number }[]; byCategory: [string, { count: number; avg: number }][] }; data: Review[] }) {
  return (
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
            <div key={cat} className="flex items-center justify-between p-2 rounded-lg bg-muted/50"><div><p className="text-xs font-medium">{cat}</p><p className="text-xs text-muted-foreground">{info.count} recenzija</p></div><div className="flex items-center gap-1"><StarRating rating={Math.round(info.avg)} /><span className="text-xs font-bold">{info.avg}</span></div></div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

/* ---- Detail Dialog ---- */
export function DetailDialog({ detailItem, open, onClose }: { detailItem: Review | null; open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Detalji recenzije</DialogTitle></DialogHeader>
        {detailItem && (
          <div className="space-y-4">
            <div className="flex items-center justify-between"><div><p className="text-sm font-bold">{detailItem.customerName}</p><p className="text-xs text-muted-foreground">{detailItem.customerEmail}</p></div><div className="flex items-center gap-2">{getStatusBadge(detailItem.status)}<Badge variant="outline" className="text-xs">{SOURCES[detailItem.source]?.label}</Badge></div></div>
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
            {detailItem.responseText && <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20"><p className="text-xs text-blue-600 mb-1">Odgovor od {detailItem.respondedBy} ({formatDate(detailItem.respondedAt!)})</p><p className="text-xs">{detailItem.responseText}</p></div>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

/* ---- Response Dialog ---- */
export function ResponseDialog({ responseItem, responseText, open, onClose, onTextChange, onSend }: { responseItem: Review | null; responseText: string; open: boolean; onClose: () => void; onTextChange: (t: string) => void; onSend: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader><DialogTitle>Odgovor na recenziju</DialogTitle></DialogHeader>
        {responseItem && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs font-medium">{responseItem.customerName} — {responseItem.productName}</p><p className="text-xs text-muted-foreground mt-1">"{responseItem.title}"</p></div>
            <div className="grid gap-2"><Label className="text-xs">Vaš odgovor</Label><Textarea placeholder="Napišite odgovor na recenziju..." className="text-xs min-h-[100px]" value={responseText} onChange={e => onTextChange(e.target.value)} /></div>
          </div>
        )}
        <DialogFooter><Button variant="outline" onClick={onClose}>Otkaži</Button><Button onClick={onSend}>Pošalji odgovor</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
