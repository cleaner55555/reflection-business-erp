/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Megaphone, Plus, Search, Eye, Trash2, RefreshCw,
  CheckCircle2, Clock, BarChart3, Send, Phone, Users,
  DollarSign, AlertCircle, MessageSquare
} from 'lucide-react'

interface SmsCampaign {
  id: string
  name: string
  content: string
  recipientCount: number
  sentCount: number
  status: string
  scheduledDate?: string
  sentDate?: string
  createdAt: string
}

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-700' },
  scheduled: { label: 'Zakazano', color: 'bg-amber-100 text-amber-700' },
  sending: { label: 'Šalje se', color: 'bg-blue-100 text-blue-700' },
  sent: { label: 'Poslato', color: 'bg-green-100 text-green-700' },
  failed: { label: 'Greška', color: 'bg-red-100 text-red-700' },
}

export function SmsMarketing() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [campaigns, setCampaigns] = useState<SmsCampaign[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<SmsCampaign | null>(null)

  const emptyForm = { name: '', content: '', recipientCount: 0, scheduledDate: '' }
  const [form, setForm] = useState(emptyForm)

  const loadCampaigns = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/sms/campaigns?companyId=${activeCompanyId}&limit=100`)
      if (res.ok) {
        const data = await res.json()
        setCampaigns(data.items || data || [])
      }
    } catch { /* silent */ }
    setLoading(false)
  }, [activeCompanyId])

  useEffect(() => { loadCampaigns() }, [activeCompanyId, loadCampaigns])

  const totalSent = campaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0)
  const totalRecipients = campaigns.reduce((sum, c) => sum + (c.recipientCount || 0), 0)

  const filtered = campaigns.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleCreate = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/sms/campaigns', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...form }),
      })
      if (res.ok) { setDialogOpen(false); setForm(emptyForm); loadCampaigns() }
    } catch { /* silent */ }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati kampanju?')) return
    try {
      const res = await fetch(`/api/sms/campaigns?id=${id}`, { method: 'DELETE' })
      if (res.ok) loadCampaigns()
    } catch { /* silent */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">SMS Marketing</h1>
          <p className="text-sm text-muted-foreground">Kampanje i transakcione SMS poruke</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadCampaigns}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Nova kampanja</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="campaigns"><Megaphone className="h-4 w-4 mr-1" /> Kampanje</TabsTrigger>
          <TabsTrigger value="templates"><MessageSquare className="h-4 w-4 mr-1" /> Template</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Kampanje</span><Megaphone className="h-4 w-4 text-muted-foreground" /></div><p className="text-2xl font-bold">{campaigns.length}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Poslate</span><Send className="h-4 w-4 text-green-500" /></div><p className="text-2xl font-bold text-green-600">{totalSent}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Primalaca</span><Users className="h-4 w-4 text-primary" /></div><p className="text-2xl font-bold text-primary">{totalRecipients}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Dostava</span><CheckCircle2 className="h-4 w-4 text-amber-500" /></div><p className="text-2xl font-bold text-amber-600">{totalRecipients > 0 ? Math.round((totalSent / totalRecipients) * 100) : 0}%</p></Card>
          </div>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Informacije o SMS servisu</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Bulk slanje</p><p className="text-xs text-muted-foreground">Pošaljite SMS do hiljadu primalaca odjednom</p></div></div>
              <div className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Personalizovane poruke</p><p className="text-xs text-muted-foreground">Koristite varijable kao {{name}}, {{order_number}}</p></div></div>
              <div className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Zakazano slanje</p><p className="text-xs text-muted-foreground">Planirajte slanje za optimalno vreme</p></div></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži kampanje..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          {loading ? (<div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>) : filtered.length === 0 ? (
            <Card className="p-8 text-center"><Megaphone className="h-12 w-12 mx-auto mb-3 text-muted-foreground" /><p className="text-muted-foreground">Nema SMS kampanja</p><Button variant="outline" className="mt-3" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Kreiraj kampanju</Button></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((c) => {
                const cfg = statusConfig[c.status]
                return (
                  <Card key={c.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{c.name}</CardTitle>
                        <Badge variant="outline" className={`text-[10px] ${cfg?.color}`}>{cfg?.label}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p className="text-xs text-muted-foreground line-clamp-2">{c.content}</p>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{c.sentCount}/{c.recipientCount} poslato</span>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelected(c); setDetailOpen(true) }}><Eye className="h-3.5 w-3.5" /></Button>
                          {c.status === 'draft' && <Button size="sm" variant="outline" className="h-7 text-xs"><Send className="h-3 w-3 mr-1" /> Pošalji</Button>}
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card className="p-8 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">SMS template-i</p>
            <p className="text-xs text-muted-foreground mt-1">Predlošci za često korišćene poruke</p>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Nova SMS kampanja</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Naziv kampanje</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Naziv kampanje" /></div>
            <div className="space-y-2"><Label>Sadržaj poruke</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} placeholder="Vaša poruka... (max 160 znakova)" /><p className="text-xs text-muted-foreground">{form.content.length}/160 znakova</p></div>
            <div className="space-y-2"><Label>Zakazano slanje</Label><Input type="date" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleCreate}><Plus className="h-4 w-4 mr-1" /> Kreiraj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Detalji kampanje</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Naziv:</span> <span className="font-medium">{selected.name}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline" className={statusConfig[selected.status]?.color}>{statusConfig[selected.status]?.label}</Badge></div>
                <div><span className="text-muted-foreground">Poslato:</span> {selected.sentCount}/{selected.recipientCount}</div>
                <div><span className="text-muted-foreground">Datum:</span> {new Date(selected.createdAt).toLocaleDateString('sr-RS')}</div>
              </div>
              <div className="text-sm"><span className="text-muted-foreground">Sadržaj:</span><p className="mt-1 p-3 bg-muted/50 rounded-lg">{selected.content}</p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
