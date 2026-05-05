'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Globe, FileText, DollarSign, Package, Truck, MessageSquare, Clock, CheckCircle2, Download, Eye, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import { formatRSD, formatDate } from '@/lib/helpers'

interface PortalInvoice { id: string; number: string; amount: number; status: string; date: string; dueDate: string }
interface PortalOrder { id: string; items: number; total: number; status: string; date: string; deliveryDate: string | null }
interface PortalTicket { id: string; subject: string; status: 'open' | 'in_progress' | 'resolved' | 'closed'; priority: string; createdAt: string; updatedAt: string }
interface PortalDoc { id: string; name: string; type: string; size: string; date: string; category: string }

const INVOICES: PortalInvoice[] = [
  { id: '1', number: 'F-2024-0234', amount: 125000, status: 'poslata', date: '2024-06-01', dueDate: '2024-06-30' },
  { id: '2', number: 'F-2024-0230', amount: 89500, status: 'placena', date: '2024-05-15', dueDate: '2024-06-15' },
  { id: '3', number: 'F-2024-0225', amount: 210000, status: 'prekocena', date: '2024-04-10', dueDate: '2024-05-10' },
]

const ORDERS: PortalOrder[] = [
  { id: '1', items: 5, total: 45000, status: 'isporuceno', date: '2024-06-10', deliveryDate: '2024-06-12' },
  { id: '2', items: 3, total: 28000, status: 'u_toku', date: '2024-06-14', deliveryDate: null },
  { id: '3', items: 8, total: 92000, status: 'nacrt', date: '2024-06-15', deliveryDate: null },
]

const TICKETS: PortalTicket[] = [
  { id: '1', subject: 'Problem sa fakturisanjem', status: 'open', priority: 'high', createdAt: '2024-06-15T10:00:00', updatedAt: '2024-06-15T10:00:00' },
  { id: '2', subject: 'Zahtev za novi artikal', status: 'in_progress', priority: 'medium', createdAt: '2024-06-13T14:00:00', updatedAt: '2024-06-14T09:00:00' },
  { id: '3', subject: 'Pitanje o ceni', status: 'resolved', priority: 'low', createdAt: '2024-06-10T08:00:00', updatedAt: '2024-06-11T16:00:00' },
]

const DOCS: PortalDoc[] = [
  { id: '1', name: 'Ugovor 2024.pdf', type: 'pdf', size: '2.4 MB', date: '2024-01-15', category: 'Ugovori' },
  { id: '2', name: 'Cenovnik 2024.pdf', type: 'pdf', size: '890 KB', date: '2024-03-01', category: 'Cenovnici' },
  { id: '3', name: 'Specifikacija proizvoda.xlsx', type: 'xlsx', size: '1.2 MB', date: '2024-05-20', category: 'Specifikacije' },
]

function getInvStatusBadge(s: string) {
  const map: Record<string, { color: string; label: string }> = {
    placena: { color: 'bg-emerald-100 text-emerald-800', label: 'Plaćena' },
    poslata: { color: 'bg-blue-100 text-blue-800', label: 'Poslata' },
    prekocena: { color: 'bg-red-100 text-red-800', label: 'Prekoračena' },
    nacrt: { color: 'bg-slate-100 text-slate-600', label: 'Načrt' },
  }
  const r = map[s] || map.nacrt; return <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge>
}

function getTicketStatus(s: string) {
  const map: Record<string, { color: string; label: string }> = {
    open: { color: 'bg-red-100 text-red-800', label: 'Otvoren' },
    in_progress: { color: 'bg-amber-100 text-amber-800', label: 'U toku' },
    resolved: { color: 'bg-emerald-100 text-emerald-800', label: 'Rešeno' },
    closed: { color: 'bg-slate-100 text-slate-600', label: 'Zatvoren' },
  }
  const r = map[s] || map.open; return <Badge className={`${r.color} text-[10px]`}>{r.label}</Badge>
}

export function KlijentskiPortal() {
  const [loading, setLoading] = useState(true)

  useEffect(() => { setTimeout(() => setLoading(false), 200) }, [])

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div></div>

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Globe className="h-6 w-6" />Клијентски портал</h1><p className="text-sm text-muted-foreground">Портал за партнере — fakture, narudžbe, dokumenta i podrška</p></div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-blue-600 mb-1"><FileText className="h-3.5 w-3.5" />Fakture</div><p className="text-2xl font-bold">{INVOICES.length}</p><p className="text-[10px] text-muted-foreground">{formatRSD(INVOICES.reduce((s, i) => s + i.amount, 0))}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-amber-600 mb-1"><Package className="h-3.5 w-3.5" />Narudžbe</div><p className="text-2xl font-bold">{ORDERS.length}</p><p className="text-[10px] text-muted-foreground">{ORDERS.filter(o => o.status === 'u_toku').length} aktivnih</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-red-600 mb-1"><MessageSquare className="h-3.5 w-3.5" />Tiketi</div><p className="text-2xl font-bold">{TICKETS.length}</p><p className="text-[10px] text-muted-foreground">{TICKETS.filter(t => t.status === 'open').length} otvorenih</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><CreditCard className="h-3.5 w-3.5" />Dugovanje</div><p className="text-lg font-bold text-red-700">{formatRSD(INVOICES.filter(i => i.status !== 'placena').reduce((s, i) => s + i.amount, 0))}</p></Card>
      </div>

      <Tabs defaultValue="fakture" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="fakture" className="gap-1.5 text-xs"><FileText className="h-3.5 w-3.5" />Fakture</TabsTrigger>
          <TabsTrigger value="narudzbe" className="gap-1.5 text-xs"><Package className="h-3.5 w-3.5" />Narudžbe</TabsTrigger>
          <TabsTrigger value="podrska" className="gap-1.5 text-xs"><MessageSquare className="h-3.5 w-3.5" />Подршка</TabsTrigger>
          <TabsTrigger value="dokumenta" className="gap-1.5 text-xs"><Download className="h-3.5 w-3.5" />Dokumenta</TabsTrigger>
        </TabsList>

        <TabsContent value="fakture"><Card><CardContent className="pt-6"><Table><TableHeader><TableRow><TableHead className="text-xs">Broj</TableHead><TableHead className="text-xs">Iznos</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs hidden sm:table-cell">Datum</TableHead><TableHead className="text-xs hidden sm:table-cell">Rok</TableHead><TableHead className="text-xs text-right"></TableHead></TableRow></TableHeader><TableBody>{INVOICES.map(inv => (<TableRow key={inv.id}><TableCell className="text-xs font-mono">{inv.number}</TableCell><TableCell className="text-xs font-bold">{formatRSD(inv.amount)}</TableCell><TableCell>{getInvStatusBadge(inv.status)}</TableCell><TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{formatDate(inv.date)}</TableCell><TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{formatDate(inv.dueDate)}</TableCell><TableCell className="text-right"><Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => toast.info('Preuzimanje fakture...')}><Download className="h-3 w-3" />PDF</Button></TableCell></TableRow>))}</TableBody></Table></CardContent></Card></TabsContent>

        <TabsContent value="narudzbe"><Card><CardContent className="pt-6"><Table><TableHeader><TableRow><TableHead className="text-xs">ID</TableHead><TableHead className="text-xs">Stavki</TableHead><TableHead className="text-xs">Iznos</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs hidden sm:table-cell">Datum</TableHead><TableHead className="text-xs hidden sm:table-cell">Isporuka</TableHead></TableRow></TableHeader><TableBody>{ORDERS.map(o => (<TableRow key={o.id}><TableCell className="text-xs font-mono">ORD-{o.id.padStart(4, '0')}</TableCell><TableCell className="text-xs">{o.items}</TableCell><TableCell className="text-xs font-bold">{formatRSD(o.total)}</TableCell><TableCell><Badge variant="outline" className="text-[10px]">{o.status.replace('_', ' ')}</Badge></TableCell><TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{formatDate(o.date)}</TableCell><TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{o.deliveryDate ? formatDate(o.deliveryDate) : '—'}</TableCell></TableRow>))}</TableBody></Table></CardContent></Card></TabsContent>

        <TabsContent value="podrska"><Card><CardContent className="pt-6"><Table><TableHeader><TableRow><TableHead className="text-xs">Tema</TableHead><TableHead className="text-xs">Prioritet</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs hidden sm:table-cell">Kreiran</TableHead><TableHead className="text-xs hidden sm:table-cell">Ažuriran</TableHead></TableRow></TableHeader><TableBody>{TICKETS.map(t => (<TableRow key={t.id}><TableCell className="text-xs font-medium">{t.subject}</TableCell><TableCell><Badge variant="outline" className="text-[10px]">{t.priority}</Badge></TableCell><TableCell>{getTicketStatus(t.status)}</TableCell><TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{formatDate(t.createdAt)}</TableCell><TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{formatDate(t.updatedAt)}</TableCell></TableRow>))}</TableBody></Table></CardContent></Card></TabsContent>

        <TabsContent value="dokumenta"><Card><CardContent className="pt-6"><Table><TableHeader><TableRow><TableHead className="text-xs">Naziv</TableHead><TableHead className="text-xs hidden sm:table-cell">Kategorija</TableHead><TableHead className="text-xs hidden md:table-cell">Veličina</TableHead><TableHead className="text-xs hidden sm:table-cell">Datum</TableHead><TableHead className="text-xs text-right"></TableHead></TableRow></TableHeader><TableBody>{DOCS.map(d => (<TableRow key={d.id}><TableCell className="text-xs font-medium flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-muted-foreground" />{d.name}</TableCell><TableCell className="hidden sm:table-cell"><Badge variant="outline" className="text-[10px]">{d.category}</Badge></TableCell><TableCell className="hidden md:table-cell text-xs text-muted-foreground">{d.size}</TableCell><TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{formatDate(d.date)}</TableCell><TableCell className="text-right"><Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => toast.info('Preuzimanje...')}><Download className="h-3 w-3" /></Button></TableCell></TableRow>))}</TableBody></Table></CardContent></Card></TabsContent>
      </Tabs>
    </div>
  )
}
