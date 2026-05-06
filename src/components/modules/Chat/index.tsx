'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RefreshCw, Plus, BarChart3, MessageCircle } from 'lucide-react'
import { emptyForm } from './data'
import type { Channel, Message } from './types'
import { ChatKpiCards, OverviewTab, ChatTabContent, CreateChannelDialog } from './components'

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

  const handleOverviewSelect = (c: Channel) => {
    setSelectedChannel(c)
    setActiveTab('chat')
  }

  const handleSelectAndLoad = (c: Channel) => {
    setSelectedChannel(c)
    loadMessages(c.id)
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
          <ChatKpiCards channels={channels} messages={messages} />
          <OverviewTab channels={channels} onSelectChannel={handleOverviewSelect} />
        </TabsContent>

        <TabsContent value="chat" className="space-y-0">
          <ChatTabContent
            channels={channels}
            filtered={filtered}
            selectedChannel={selectedChannel}
            messages={messages}
            newMessage={newMessage}
            search={search}
            onSelectChannel={setSelectedChannel}
            onSelectAndLoad={handleSelectAndLoad}
            onSendMessage={handleSendMessage}
            setSearch={setSearch}
            setNewMessage={setNewMessage}
          />
        </TabsContent>
      </Tabs>

      <CreateChannelDialog open={dialogOpen} onClose={() => setDialogOpen(false)} form={form} setForm={setForm} onCreate={handleCreateChannel} />
    </div>
  )
}
