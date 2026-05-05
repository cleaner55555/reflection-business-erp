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
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  MessageCircle, Plus, Search, RefreshCw,
  CheckCircle2, Clock, BarChart3, Users, Hash,
  Send, Smile, Paperclip, AtSign, Bell, Pin
} from 'lucide-react'

interface Channel {
  id: string
  name: string
  description?: string
  type: string
  memberCount: number
  unreadCount: number
  lastMessage?: string
  lastMessageAt?: string
  isPinned?: boolean
}

interface Message {
  id: string
  channelId: string
  senderName: string
  content: string
  timestamp: string
  isOwn?: boolean
}

const channelTypeConfig: Record<string, { label: string; color: string; icon: string }> = {
  general: { label: 'Opšte', color: 'bg-gray-100 text-gray-700', icon: '#' },
  project: { label: 'Projekat', color: 'bg-blue-100 text-blue-700', icon: '#' },
  team: { label: 'Tim', color: 'bg-green-100 text-green-700', icon: '#' },
  private: { label: 'Privatno', color: 'bg-purple-100 text-purple-700', icon: '🔒' },
  announcement: { label: 'Obaveštenje', color: 'bg-amber-100 text-amber-700', icon: '📢' },
}

/* eslint-disable react-hooks/rules-of-hooks */
export function Čet() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [channels, setChannels] = useState<Channel[]>([])
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const emptyForm = { name: '', description: '', type: 'general' }
  const [form, setForm] = useState(emptyForm)

  const loadChannels = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/discuss/channels?companyId=${activeCompanyId}&limit=100`)
      if (res.ok) {
        const data = await res.json()
        const items = data.items || data || []
        setChannels(items)
        if (!selectedChannel && items.length > 0) setSelectedChannel(items[0])
      }
    } catch { /* silent */ }
    setLoading(false)
  }, [activeCompanyId])

  const loadMessages = useCallback(async (channelId: string) => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/discuss/channels/${channelId}?companyId=${activeCompanyId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch { /* silent */ }
  }, [activeCompanyId])

  useEffect(() => { loadChannels() }, [activeCompanyId, loadChannels])

  useEffect(() => {
    if (selectedChannel) loadMessages(selectedChannel.id)
  }, [selectedChannel, loadMessages])

  const totalMembers = channels.reduce((sum, c) => sum + (c.memberCount || 0), 0)
  const totalUnread = channels.reduce((sum, c) => sum + (c.unreadCount || 0), 0)

  const filtered = channels.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleCreateChannel = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/discuss/channels', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...form, memberCount: 1, unreadCount: 0 }),
      })
      if (res.ok) { setDialogOpen(false); setForm(emptyForm); loadChannels() }
    } catch { /* silent */ }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel || !activeCompanyId) return
    try {
      await fetch(`/api/discuss/channels/${selectedChannel.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_message', content: newMessage }),
      })
      setMessages([...messages, {
        id: `temp-${Date.now()}`,
        channelId: selectedChannel.id,
        senderName: 'Vi',
        content: newMessage,
        timestamp: new Date().toISOString(),
        isOwn: true,
      }])
      setNewMessage('')
    } catch { /* silent */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Čet</h1>
          <p className="text-sm text-muted-foreground">Interna komunikacija i diskusije</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadChannels}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Novi kanal</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="chat"><MessageCircle className="h-4 w-4 mr-1" /> Čet</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Kanali</span><MessageCircle className="h-4 w-4 text-muted-foreground" /></div><p className="text-2xl font-bold">{channels.length}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Članovi</span><Users className="h-4 w-4 text-primary" /></div><p className="text-2xl font-bold text-primary">{totalMembers}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Nepročitano</span><Bell className="h-4 w-4 text-amber-500" /></div><p className="text-2xl font-bold text-amber-600">{totalUnread}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Poruke</span><Send className="h-4 w-4 text-green-500" /></div><p className="text-2xl font-bold text-green-600">{messages.length}</p></Card>
          </div>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Aktivni kanali</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {channels.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Nema kanala</p>
              ) : channels.slice(0, 10).map((c) => {
                const cfg = channelTypeConfig[c.type]
                return (
                  <button key={c.id} className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-muted/50 text-left" onClick={() => { setSelectedChannel(c); setActiveTab('chat') }}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cfg?.icon}</span>
                      <div>
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{c.lastMessage || 'Nema poruka'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{c.memberCount}</span>
                      {c.unreadCount > 0 && <Badge className="h-5 w-5 flex items-center justify-center p-0 text-[10px]">{c.unreadCount}</Badge>}
                    </div>
                  </button>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="space-y-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border rounded-lg overflow-hidden" style={{ height: '600px' }}>
            {/* Channel list */}
            <div className="border-r bg-muted/20">
              <div className="p-3 border-b">
                <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Kanali..." className="pl-8 h-8 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
              </div>
              <ScrollArea className="h-[calc(100%-44px)]">
                {filtered.map((c) => {
                  const cfg = channelTypeConfig[c.type]
                  const isActive = selectedChannel?.id === c.id
                  return (
                    <button key={c.id} className={`flex items-center gap-2 w-full p-3 text-left hover:bg-muted/50 border-b ${isActive ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`} onClick={() => { setSelectedChannel(c); loadMessages(c.id) }}>
                      <span className="text-base">{cfg?.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{c.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{c.lastMessage || ''}</p>
                      </div>
                      {c.unreadCount > 0 && <Badge className="h-4 min-w-4 flex items-center justify-center p-0 text-[9px]">{c.unreadCount}</Badge>}
                    </button>
                  )
                })}
              </ScrollArea>
            </div>

            {/* Chat area */}
            <div className="col-span-3 flex flex-col">
              {selectedChannel ? (
                <>
                  <div className="p-3 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{channelTypeConfig[selectedChannel.type]?.icon}</span>
                      <span className="text-sm font-medium">{selectedChannel.name}</span>
                      <Badge variant="outline" className="text-[10px]">{channelTypeConfig[selectedChannel.type]?.label}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{selectedChannel.memberCount} članova</span>
                  </div>
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-3">
                      {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full"><p className="text-sm text-muted-foreground">Nema poruka u ovom kanalu</p></div>
                      ) : messages.map((m) => (
                        <div key={m.id} className={`flex ${m.isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] ${m.isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg px-3 py-2`}>
                            {!m.isOwn && <p className="text-xs font-medium mb-0.5">{m.senderName}</p>}
                            <p className="text-sm">{m.content}</p>
                            <p className={`text-[10px] mt-1 ${m.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{new Date(m.timestamp).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="p-3 border-t">
                    <div className="flex items-center gap-2">
                      <Input placeholder="Napišite poruku..." className="flex-1" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage() }} />
                      <Button size="icon" onClick={handleSendMessage} disabled={!newMessage.trim()}><Send className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">Izaberite kanal za početak četa</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Novi kanal</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Naziv</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="naziv-kanala" /></div>
            <div className="space-y-2"><Label>Tip</Label><Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(channelTypeConfig).map(([k, v]) => (<SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>))}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Opis</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleCreateChannel}><Plus className="h-4 w-4 mr-1" /> Kreiraj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
