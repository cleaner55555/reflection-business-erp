'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import {
  Globe, FileText, DollarSign, Package, MessageSquare, Clock,
  CheckCircle2, Download, Eye, CreditCard, User, Mail, Phone,
  MapPin, Building, Plus, Send
} from 'lucide-react'
import { toast } from 'sonner'
import { formatRSD, formatDate } from '@/lib/helpers'

// ─── Types ───────────────────────────────────────────────────────────────────

interface PortalInvoice {
  id: string
  number: string
  amount: number
  status: string
  date: string
  dueDate: string
}

interface PortalOrder {
  id: string
  orderNo: string
  items: number
  total: number
  status: string
  date: string
  deliveryDate: string | null
}

interface PortalTicket {
  id: string
  subject: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: string
  description: string
  createdAt: string
  updatedAt: string
}

interface PortalDoc {
  id: string
  name: string
  type: string
  size: string
  date: string
  category: string
}

interface ClientProfile {
  companyName: string
  pib: string
  mb: string
  address: string
  city: string
  phone: string
  email: string
  contactPerson: string
  role: string
}

// ─── Config ──────────────────────────────────────────────────────────────────

function getInvStatusBadge(s: string) {
  const map: Record<string, { color: string; label: string }> = {
    placena: { color: 'bg-emerald-100 text-emerald-800', label: 'Plaćena' },
    poslata: { color: 'bg-blue-100 text-blue-800', label: 'Poslata' },
    prekocena: { color: 'bg-red-100 text-red-800', label: 'Prekoračena' },
    nacrt: { color: 'bg-slate-100 text-slate-600', label: 'Načrt' },
  }
  const r = map[s] || map.nacrt
  return <Badge className={`${r.color} text-xs`}>{r.label}</Badge>
}

function getTicketStatus(s: string) {
  const map: Record<string, { color: string; label: string }> = {
    open: { color: 'bg-red-100 text-red-800', label: 'Otvoren' },
    in_progress: { color: 'bg-amber-100 text-amber-800', label: 'U toku' },
    resolved: { color: 'bg-emerald-100 text-emerald-800', label: 'Rešeno' },
    closed: { color: 'bg-slate-100 text-slate-600', label: 'Zatvoren' },
  }
  const r = map[s] || map.open
  return <Badge className={`${r.color} text-xs`}>{r.label}</Badge>
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockInvoices: PortalInvoice[] = [
  { id: 'inv-1', number: 'Fak-2025-001', amount: 185000, status: 'placena', date: '2025-01-05', dueDate: '2025-01-20' },
  { id: 'inv-2', number: 'Fak-2025-002', amount: 342500, status: 'poslata', date: '2025-01-10', dueDate: '2025-01-25' },
  { id: 'inv-3', number: 'Fak-2025-003', amount: 98000, status: 'prekocena', date: '2024-12-01', dueDate: '2024-12-15' },
  { id: 'inv-4', number: 'Fak-2025-004', amount: 156000, status: 'placena', date: '2024-12-15', dueDate: '2024-12-30' },
  { id: 'inv-5', number: 'Fak-2025-005', amount: 267800, status: 'nacrt', date: '2025-01-20', dueDate: '2025-02-04' },
  { id: 'inv-6', number: 'Fak-2024-048', amount: 125000, status: 'placena', date: '2024-11-20', dueDate: '2024-12-05' },
]

const mockOrders: PortalOrder[] = [
  { id: 'ord-1', orderNo: '0001', items: 5, total: 185000, status: 'isporučeno', date: '2025-01-08', deliveryDate: '2025-01-12' },
  { id: 'ord-2', orderNo: '0002', items: 12, total: 342500, status: 'u_toku', date: '2025-01-15', deliveryDate: null },
  { id: 'ord-3', orderNo: '0003', items: 3, total: 98000, status: 'priprema', date: '2025-01-18', deliveryDate: null },
  { id: 'ord-4', orderNo: '0004', items: 8, total: 156000, status: 'isporučeno', date: '2024-12-10', deliveryDate: '2024-12-15' },
]

const mockTickets: PortalTicket[] = [
  { id: 'tk-1', subject: 'Problem sa fakturom Fak-2025-003', status: 'open', priority: 'visok', description: 'Faktura ima pogrešan iznos — treba da bude 89000 RSD', createdAt: '2025-01-18', updatedAt: '2025-01-18' },
  { id: 'tk-2', subject: 'Zahtev za novi katalog', status: 'in_progress', priority: 'srednji', description: 'Treba nam ažurirani katalog proizvoda za 2025.', createdAt: '2025-01-15', updatedAt: '2025-01-17' },
  { id: 'tk-3', subject: 'Odgovor na ponudu', status: 'resolved', priority: 'nizak', description: 'Primili smo ponudu, odobreno.', createdAt: '2025-01-10', updatedAt: '2025-01-14' },
]

const mockDocs: PortalDoc[] = [
  { id: 'doc-1', name: 'Ugovor o saradnji 2025', type: 'PDF', size: '2.4 MB', date: '2025-01-01', category: 'Ugovori' },
  { id: 'doc-2', name: 'Cenovnik Q1 2025', type: 'XLSX', size: '856 KB', date: '2025-01-05', category: 'Cenovnici' },
  { id: 'doc-3', name: 'Specifikacija proizvoda', type: 'PDF', size: '1.1 MB', date: '2025-01-08', category: 'Specifikacije' },
  { id: 'doc-4', name: 'Godišnji izveštaj 2024', type: 'PDF', size: '4.2 MB', date: '2025-01-10', category: 'Izveštaji' },
  { id: 'doc-5', name: 'Uputstvo za narudžbu', type: 'PDF', size: '320 KB', date: '2024-12-15', category: 'Uputstva' },
]

const mockProfile: ClientProfile = {
  companyName: 'D.o.o. TechPro',
  pib: '108765432',
  mb: '20123456',
  address: 'Industrijska zona bb',
  city: 'Beograd',
  phone: '+38111234567',
  email: 'office@techpro.rs',
  contactPerson: 'Marko Đorđević',
  role: 'Direktor nabavke'
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ClientPortal() {
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState<PortalInvoice[]>([])
  const [orders, setOrders] = useState<PortalOrder[]>([])
  const [tickets, setTickets] = useState<PortalTicket[]>([])
  const [docs, setDocs] = useState<PortalDoc[]>([])
  const [profile] = useState<ClientProfile>(mockProfile)

  // Ticket form
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false)
  const [ticketForm, setTicketForm] = useState({ subject: '', priority: 'srednji', description: '' })

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/client-portal')
        if (res.ok) {
          const data = await res.json()
          setInvoices(data.invoices || [])
          setOrders(data.orders || [])
          setTickets(data.tickets || [])
          setDocs(data.docs || [])
        } else {
          setInvoices(mockInvoices)
          setOrders(mockOrders)
          setTickets(mockTickets)
          setDocs(mockDocs)
        }
      } catch {
        setInvoices(mockInvoices)
        setOrders(mockOrders)
        setTickets(mockTickets)
        setDocs(mockDocs)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleCreateTicket = () => {
    if (!ticketForm.subject.trim()) {
      toast.error('Unesite temu tiketa')
      return
    }
    const newTicket: PortalTicket = {
      id: `tk-${Date.now()}`,
      subject: ticketForm.subject,
      status: 'open',
      priority: ticketForm.priority,
      description: ticketForm.description,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    }
    setTickets(prev => [newTicket, ...prev])
    setTicketDialogOpen(false)
    setTicketForm({ subject: '', priority: 'srednji', description: '' })
    toast.success('Tiket kreiran')
  }

  const handleDownload = (name: string) => {
    toast.info(`Preuzimanje: ${name}`)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    )
  }

  const totalDebt = invoices.filter(i => i.status !== 'placena').reduce((s, i) => s + i.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Globe className="h-6 w-6" />
          Klijentski portal
        </h1>
        <p className="text-sm text-muted-foreground">Portal za partnere — fakture, narudžbe, dokumenta i podrška</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-blue-600 mb-1">
            <FileText className="h-3.5 w-3.5" />Fakture
          </div>
          <p className="text-2xl font-bold">{invoices.length}</p>
          <p className="text-xs text-muted-foreground">{formatRSD(invoices.reduce((s, i) => s + i.amount, 0))}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-amber-600 mb-1">
            <Package className="h-3.5 w-3.5" />Narudžbe
          </div>
          <p className="text-2xl font-bold">{orders.length}</p>
          <p className="text-xs text-muted-foreground">{orders.filter(o => o.status === 'u_toku').length} aktivnih</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-red-600 mb-1">
            <MessageSquare className="h-3.5 w-3.5" />Tiketi
          </div>
          <p className="text-2xl font-bold">{tickets.length}</p>
          <p className="text-xs text-muted-foreground">{tickets.filter(t => t.status === 'open').length} otvorenih</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-red-600 mb-1">
            <CreditCard className="h-3.5 w-3.5" />Dugovanje
          </div>
          <p className="text-lg font-bold text-red-700">{formatRSD(totalDebt)}</p>
          <p className="text-xs text-muted-foreground">
            {invoices.filter(i => i.status !== 'placena').length} neplaćenih
          </p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="fakture" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="profil" className="gap-1.5 text-xs">
            <User className="h-3.5 w-3.5" />Profil
          </TabsTrigger>
          <TabsTrigger value="fakture" className="gap-1.5 text-xs">
            <FileText className="h-3.5 w-3.5" />Fakture
          </TabsTrigger>
          <TabsTrigger value="narudzbe" className="gap-1.5 text-xs">
            <Package className="h-3.5 w-3.5" />Narudžbe
          </TabsTrigger>
          <TabsTrigger value="podrska" className="gap-1.5 text-xs">
            <MessageSquare className="h-3.5 w-3.5" />Podrška
          </TabsTrigger>
          <TabsTrigger value="dokumenta" className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" />Dokumenta
          </TabsTrigger>
        </TabsList>

        {/* ─── Profil Tab ──────────────────────────────────────────────── */}
        <TabsContent value="profil">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building className="h-5 w-5" />Podaci o firmi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Naziv firme', value: profile.companyName, icon: <Building className="h-3.5 w-3.5" /> },
                  { label: 'PIB', value: profile.pib, icon: <FileText className="h-3.5 w-3.5" /> },
                  { label: 'Matični broj', value: profile.mb, icon: <FileText className="h-3.5 w-3.5" /> },
                  { label: 'Adresa', value: `${profile.address}, ${profile.city}`, icon: <MapPin className="h-3.5 w-3.5" /> },
                  { label: 'Telefon', value: profile.phone, icon: <Phone className="h-3.5 w-3.5" /> },
                  { label: 'Email', value: profile.email, icon: <Mail className="h-3.5 w-3.5" /> }
                ].map(({ label, value, icon }) => (
                  <div key={label} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <div className="text-muted-foreground">{icon}</div>
                    <div>
                      <div className="text-xs text-muted-foreground">{label}</div>
                      <div className="text-sm font-medium">{value}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-5 w-5" />Kontakt osoba
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">{profile.contactPerson}</div>
                    <div className="text-xs text-muted-foreground">{profile.role}</div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {profile.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {profile.phone}
                  </div>
                </div>
                <Separator />
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-2">Pregled saradnje</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-lg font-bold">{invoices.length}</p>
                      <p className="text-xs text-muted-foreground">Ukupno faktura</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{orders.length}</p>
                      <p className="text-xs text-muted-foreground">Ukupno narudžbi</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Fakture Tab ─────────────────────────────────────────────── */}
        <TabsContent value="fakture">
          <Card>
            <CardContent className="pt-6">
              <div className="max-h-[480px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Broj</TableHead>
                      <TableHead className="text-xs">Iznos</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Datum</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Rok plaćanja</TableHead>
                      <TableHead className="text-xs text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                          Nema faktura
                        </TableCell>
                      </TableRow>
                    ) : (
                      invoices.map(inv => (
                        <TableRow key={inv.id} className="hover:bg-muted/50">
                          <TableCell className="text-xs font-mono">{inv.number}</TableCell>
                          <TableCell className="text-xs font-bold">{formatRSD(inv.amount)}</TableCell>
                          <TableCell>{getInvStatusBadge(inv.status)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{formatDate(inv.date)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{formatDate(inv.dueDate)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => handleDownload(`${inv.number}.pdf`)}>
                              <Download className="h-3 w-3" />PDF
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Narudžbe Tab ────────────────────────────────────────────── */}
        <TabsContent value="narudzbe">
          <Card>
            <CardContent className="pt-6">
              <div className="max-h-[480px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">ID narudžbe</TableHead>
                      <TableHead className="text-xs">Stavki</TableHead>
                      <TableHead className="text-xs">Iznos</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Datum</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Isporuka</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                          Nema narudžbi
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map(o => {
                        const statusColors: Record<string, string> = {
                          u_toku: 'bg-blue-100 text-blue-800',
                          priprema: 'bg-amber-100 text-amber-800',
                          isporučeno: 'bg-emerald-100 text-emerald-800'
                        }
                        return (
                          <TableRow key={o.id} className="hover:bg-muted/50">
                            <TableCell className="text-xs font-mono">ORD-{o.orderNo.padStart(4, '0')}</TableCell>
                            <TableCell className="text-xs">{o.items}</TableCell>
                            <TableCell className="text-xs font-bold">{formatRSD(o.total)}</TableCell>
                            <TableCell>
                              <Badge className={`text-xs ${statusColors[o.status] || ''}`}>
                                {o.status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{formatDate(o.date)}</TableCell>
                            <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">
                              {o.deliveryDate ? formatDate(o.deliveryDate) : '—'}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Podrška Tab ─────────────────────────────────────────────── */}
        <TabsContent value="podrska">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button size="sm" className="gap-2" onClick={() => setTicketDialogOpen(true)}>
                <Plus className="h-4 w-4" />Novi tiket
              </Button>
            </div>
            <Card>
              <CardContent className="pt-6">
                <div className="max-h-[480px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Tema</TableHead>
                        <TableHead className="text-xs">Prioritet</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs hidden sm:table-cell">Kreiran</TableHead>
                        <TableHead className="text-xs hidden sm:table-cell">Ažuriran</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tickets.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                            Nema tiketa
                          </TableCell>
                        </TableRow>
                      ) : (
                        tickets.map(t => {
                          const priorityColors: Record<string, string> = {
                            visok: 'bg-red-100 text-red-800',
                            srednji: 'bg-amber-100 text-amber-800',
                            nizak: 'bg-slate-100 text-slate-600'
                          }
                          return (
                            <TableRow key={t.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => toast.info(`Tiket: ${t.subject}`)}>
                              <TableCell className="text-xs font-medium">{t.subject}</TableCell>
                              <TableCell>
                                <Badge className={`text-xs ${priorityColors[t.priority] || ''}`}>{t.priority}</Badge>
                              </TableCell>
                              <TableCell>{getTicketStatus(t.status)}</TableCell>
                              <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{formatDate(t.createdAt)}</TableCell>
                              <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{formatDate(t.updatedAt)}</TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Ticket detail view */}
            {tickets.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Detalji tiketa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {tickets.filter(t => t.status !== 'closed').map(t => (
                      <div key={t.id} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{t.subject}</span>
                            {getTicketStatus(t.status)}
                          </div>
                          <span className="text-xs text-muted-foreground">{formatDate(t.createdAt)}</span>
                        </div>
                        {t.description && (
                          <p className="text-xs text-muted-foreground">{t.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* ─── Dokumenta Tab ───────────────────────────────────────────── */}
        <TabsContent value="dokumenta">
          <Card>
            <CardContent className="pt-6">
              <div className="max-h-[480px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Naziv</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Kategorija</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Tip</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Veličina</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Datum</TableHead>
                      <TableHead className="text-xs text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {docs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                          Nema dokumenata
                        </TableCell>
                      </TableRow>
                    ) : (
                      docs.map(d => (
                        <TableRow key={d.id} className="hover:bg-muted/50">
                          <TableCell className="text-xs font-medium flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                            {d.name}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant="outline" className="text-xs">{d.category}</Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="secondary" className="text-xs">{d.type}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden md:table-cell">{d.size}</TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{formatDate(d.date)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => handleDownload(d.name)}>
                              <Download className="h-3 w-3" />Preuzmi
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── Create Ticket Dialog ──────────────────────────────────────── */}
      <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Novi tiket za podršku</DialogTitle>
            <DialogDescription>Opišite svoj problem ili pitanje</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label className="text-xs">Tema *</Label>
              <Input className="text-sm" placeholder="Kratak opis problema" value={ticketForm.subject} onChange={e => setTicketForm({ ...ticketForm, subject: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs">Prioritet</Label>
              <div className="flex gap-2">
                {['nizak', 'srednji', 'visok'].map(p => (
                  <Button
                    key={p}
                    size="sm"
                    variant={ticketForm.priority === p ? 'default' : 'outline'}
                    onClick={() => setTicketForm({ ...ticketForm, priority: p })}
                    className="text-xs capitalize"
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs">Opis</Label>
              <Input className="text-sm" placeholder="Detaljan opis problema ili pitanja..." value={ticketForm.description} onChange={e => setTicketForm({ ...ticketForm, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTicketDialogOpen(false)}>Otkaži</Button>
            <Button className="gap-2" onClick={handleCreateTicket}>
              <Send className="h-4 w-4" />Pošalji tiket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
