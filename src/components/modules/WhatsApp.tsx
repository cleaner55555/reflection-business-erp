/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  MessageCircleReply, Plus, Search, RefreshCw,
  CheckCircle2, Clock, BarChart3, Send, Users,
  Phone, Bot, Settings, ExternalLink, MessageSquare
} from 'lucide-react'

interface WhatsAppMessage {
  id: string
  contactName: string
  contactPhone: string
  direction: string
  content: string
  status: string
  timestamp: string
}

const directionConfig: Record<string, { label: string; color: string }> = {
  inbound: { label: 'Dolazna', color: 'bg-green-100 text-green-700' },
  outbound: { label: 'Odlazna', color: 'bg-blue-100 text-blue-700' },
}

const statusConfig: Record<string, { label: string; color: string }> = {
  sent: { label: 'Poslato', color: 'bg-green-100 text-green-700' },
  delivered: { label: 'Isporučeno', color: 'bg-blue-100 text-blue-700' },
  read: { label: 'Pročitano', color: 'bg-teal-100 text-teal-700' },
  failed: { label: 'Greška', color: 'bg-red-100 text-red-700' },
  pending: { label: 'Na čekanju', color: 'bg-amber-100 text-amber-700' },
}

export function WhatsApp() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [messages, setMessages] = useState<WhatsAppMessage[]>([])
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [recipientPhone, setRecipientPhone] = useState('')

  const loadMessages = useCallback(async () => {
    // WhatsApp messages would come from WhatsApp Business API
    const demoMessages: WhatsAppMessage[] = [
      { id: '1', contactName: 'Jovan Petrović', contactPhone: '+381631234567', direction: 'inbound', content: 'Poštovani, interesujem se za vaš proizvod. Mogu li dobiti ponudu?', status: 'read', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: '2', contactName: 'Jovan Petrović', contactPhone: '+381631234567', direction: 'outbound', content: 'Zdravo Jovane! Zahvaljujemo na interesovanju. Evo linka do našeg kataloga...', status: 'delivered', timestamp: new Date(Date.now() - 3500000).toISOString() },
      { id: '3', contactName: 'Ana Stanković', contactPhone: '+381647890123', direction: 'inbound', content: 'Kada stiže moja narudžba?', status: 'read', timestamp: new Date(Date.now() - 7200000).toISOString() },
      { id: '4', contactName: 'Ana Stanković', contactPhone: '+381647890123', direction: 'outbound', content: 'Vaša narudžba je poslata danas. Broj pošiljke: SHP-2025-001. Možete je pratiti na našem sajtu.', status: 'read', timestamp: new Date(Date.now() - 7100000).toISOString() },
      { id: '5', contactName: 'Marko Nikolić', contactPhone: '+381651112233', direction: 'inbound', content: 'Da li imate na stanju proizvod XYZ?', status: 'pending', timestamp: new Date(Date.now() - 600000).toISOString() },
    ]
    setMessages(demoMessages)
  }, [activeCompanyId])

  useEffect(() => { loadMessages() }, [activeCompanyId, loadMessages])

  const todayMessages = messages.filter((m) => new Date(m.timestamp).toDateString() === new Date().toDateString())
  const inboundMessages = messages.filter((m) => m.direction === 'inbound').length
  const pendingMessages = messages.filter((m) => m.status === 'pending').length

  const filtered = messages.filter((m) => {
    if (search && !m.contactName.toLowerCase().includes(search.toLowerCase()) && !m.content.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleSend = async () => {
    if (!newMessage.trim() || !recipientPhone.trim()) return
    setMessages([{ id: `temp-${Date.now()}`, contactName: recipientPhone, contactPhone: recipientPhone, direction: 'outbound', content: newMessage, status: 'pending', timestamp: new Date().toISOString() }, ...messages])
    setNewMessage('')
    setRecipientPhone('')
    setDialogOpen(false)
  }

  const uniqueContacts = [...new Map(messages.map((m) => [m.contactPhone, m.contactName])).entries()]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">WhatsApp</h1>
          <p className="text-sm text-muted-foreground">WhatsApp Business integracija za komunikaciju sa klijentima</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadMessages}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Nova poruka</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="messages"><MessageCircleReply className="h-4 w-4 mr-1" /> Poruke</TabsTrigger>
          <TabsTrigger value="templates"><Bot className="h-4 w-4 mr-1" /> Template</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Danas</span><MessageSquare className="h-4 w-4 text-muted-foreground" /></div><p className="text-2xl font-bold">{todayMessages.length}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Dolazne</span><Phone className="h-4 w-4 text-green-500" /></div><p className="text-2xl font-bold text-green-600">{inboundMessages}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Na čekanju</span><Clock className="h-4 w-4 text-amber-500" /></div><p className="text-2xl font-bold text-amber-600">{pendingMessages}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Kontakti</span><Users className="h-4 w-4 text-primary" /></div><p className="text-2xl font-bold text-primary">{uniqueContacts.length}</p></Card>
          </div>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">WhatsApp Business mogućnosti</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Automatske poruke</p><p className="text-xs text-muted-foreground">Status narudžbe, potvrda plaćanja, podsjetnici</p></div></div>
              <div className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">CRM integracija</p><p className="text-xs text-muted-foreground">Automatsko kreiranje lead-ova iz WhatsApp poruka</p></div></div>
              <div className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Chatbot</p><p className="text-xs text-muted-foreground">AI chatbot za automatske odgovore van radnog vremena</p></div></div>
              <div className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Katalog poruke</p><p className="text-xs text-muted-foreground">Slanje kataloga proizvoda direktno putem WhatsApp-a</p></div></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži poruke..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          <div className="space-y-2">
            {filtered.map((m) => {
              const dirCfg = directionConfig[m.direction]
              const statCfg = statusConfig[m.status]
              return (
                <Card key={m.id} className="hover:bg-muted/30">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${m.direction === 'inbound' ? 'bg-green-100' : 'bg-blue-100'}`}>
                        {m.direction === 'inbound' ? <Phone className="h-4 w-4 text-green-600" /> : <Send className="h-4 w-4 text-blue-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{m.contactName}</span>
                          <Badge variant="outline" className={`text-[10px] ${dirCfg?.color}`}>{dirCfg?.label}</Badge>
                          <Badge variant="outline" className={`text-[10px] ${statCfg?.color}`}>{statCfg?.label}</Badge>
                        </div>
                        <p className="text-sm mt-1">{m.content}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{new Date(m.timestamp).toLocaleString('sr-RS')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card className="p-8 text-center">
            <Bot className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">WhatsApp template-i</p>
            <p className="text-xs text-muted-foreground mt-1">Predlošci za česte poruke i automatske odgovore</p>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Nova WhatsApp poruka</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Broj primaoca</Label><Input value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} placeholder="+3816XXXXXXXX" /></div>
            <div className="space-y-2"><Label>Poruka</Label><Textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} rows={4} placeholder="Vaša poruka..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleSend} disabled={!newMessage.trim()}><Send className="h-4 w-4 mr-1" /> Pošalji</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
