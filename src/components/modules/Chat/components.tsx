'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
  MessageCircle, Plus, Search,
  BarChart3, Users, Send, Bell
} from 'lucide-react'
import { channelTypeConfig } from './data'
import type { Channel, Message } from './types'

export function ChatKpiCards({ channels, messages }: { channels: Channel[]; messages: Message[] }) {
  const totalMembers = channels.reduce((sum, c) => sum + (c.memberCount || 0), 0)
  const totalUnread = channels.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Kanali</span><MessageCircle className="h-4 w-4 text-muted-foreground" /></div><p className="text-2xl font-bold">{channels.length}</p></Card>
      <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Članovi</span><Users className="h-4 w-4 text-primary" /></div><p className="text-2xl font-bold text-primary">{totalMembers}</p></Card>
      <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Nepročitano</span><Bell className="h-4 w-4 text-amber-500" /></div><p className="text-2xl font-bold text-amber-600">{totalUnread}</p></Card>
      <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Poruke</span><Send className="h-4 w-4 text-green-500" /></div><p className="text-2xl font-bold text-green-600">{messages.length}</p></Card>
    </div>
  )
}

export function OverviewTab({ channels, onSelectChannel }: { channels: Channel[]; onSelectChannel: (c: Channel) => void }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Aktivni kanali</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {channels.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Nema kanala</p>
          ) : channels.slice(0, 10).map((c) => {
            const cfg = channelTypeConfig[c.type]
            return (
              <button key={c.id} className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-muted/50 text-left" onClick={() => onSelectChannel(c)}>
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
    </div>
  )
}

export function ChannelList({ filtered, selectedChannel, search, onSelectChannel, onSelectAndLoad, setSearch }: {
  filtered: Channel[]
  selectedChannel: Channel | null
  search: string
  onSelectChannel: (c: Channel) => void
  onSelectAndLoad: (c: Channel) => void
  setSearch: (v: string) => void
}) {
  return (
    <div className="border-r bg-muted/20">
      <div className="p-3 border-b">
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Kanali..." className="pl-8 h-8 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      </div>
      <ScrollArea className="h-[calc(100%-44px)]">
        {filtered.map((c) => {
          const cfg = channelTypeConfig[c.type]
          const isActive = selectedChannel?.id === c.id
          return (
            <button key={c.id} className={`flex items-center gap-2 w-full p-3 text-left hover:bg-muted/50 border-b ${isActive ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`} onClick={() => onSelectAndLoad(c)}>
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
  )
}

export function ChatArea({ selectedChannel, messages, newMessage, setNewMessage, onSend }: {
  selectedChannel: Channel
  messages: Message[]
  newMessage: string
  setNewMessage: (v: string) => void
  onSend: () => void
}) {
  const cfg = channelTypeConfig[selectedChannel.type]
  return (
    <div className="col-span-3 flex flex-col">
      <div className="p-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{cfg?.icon}</span>
          <span className="text-sm font-medium">{selectedChannel.name}</span>
          <Badge variant="outline" className="text-[10px]">{cfg?.label}</Badge>
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
          <Input placeholder="Napišite poruku..." className="flex-1" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') onSend() }} />
          <Button size="icon" onClick={onSend} disabled={!newMessage.trim()}><Send className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  )
}

export function NoChannelSelected() {
  return (
    <div className="col-span-3 flex-1 flex items-center justify-center">
      <div className="text-center">
        <MessageCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground">Izaberite kanal za početak četa</p>
      </div>
    </div>
  )
}

export function ChatTabContent({ channels, filtered, selectedChannel, messages, newMessage, search, onSelectChannel, onSelectAndLoad, onSendMessage, setSearch, setNewMessage }: {
  channels: Channel[]
  filtered: Channel[]
  selectedChannel: Channel | null
  messages: Message[]
  newMessage: string
  search: string
  onSelectChannel: (c: Channel) => void
  onSelectAndLoad: (c: Channel) => void
  onSendMessage: () => void
  setSearch: (v: string) => void
  setNewMessage: (v: string) => void
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border rounded-lg overflow-hidden" style={{ height: '600px' }}>
      <ChannelList filtered={filtered} selectedChannel={selectedChannel} search={search} onSelectChannel={onSelectChannel} onSelectAndLoad={onSelectAndLoad} setSearch={setSearch} />
      {selectedChannel ? (
        <ChatArea selectedChannel={selectedChannel} messages={messages} newMessage={newMessage} setNewMessage={setNewMessage} onSend={onSendMessage} />
      ) : (
        <NoChannelSelected />
      )}
    </div>
  )
}

export function CreateChannelDialog({ open, onClose, form, setForm, onCreate }: {
  open: boolean
  onClose: () => void
  form: { name: string; description: string; type: string }
  setForm: (v: { name: string; description: string; type: string }) => void
  onCreate: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Novi kanal</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Naziv</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="naziv-kanala" /></div>
          <div className="space-y-2"><Label>Tip</Label><Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(channelTypeConfig).map(([k, v]) => (<SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>))}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Opis</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Otkaži</Button>
          <Button onClick={onCreate}><Plus className="h-4 w-4 mr-1" /> Kreiraj</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
