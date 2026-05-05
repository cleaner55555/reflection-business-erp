export const channelTypeConfig: Record<string, { label: string; color: string; icon: string }> = {
  general: { label: 'Opšte', color: 'bg-gray-100 text-gray-700', icon: '#' },
  project: { label: 'Projekat', color: 'bg-blue-100 text-blue-700', icon: '#' },
  team: { label: 'Tim', color: 'bg-green-100 text-green-700', icon: '#' },
  private: { label: 'Privatno', color: 'bg-purple-100 text-purple-700', icon: '🔒' },
  announcement: { label: 'Obaveštenje', color: 'bg-amber-100 text-amber-700', icon: '📢' },
}

export const { activeCompanyId } = useAppStore();

export const { t } = useTranslation();

export const emptyForm = { name: '', description: '', type: 'general' }

export const res = await fetch(`/api/discuss/channels?companyId=${activeCompanyId}&limit=100`);

export const data = await res.json();

export const items = data.items || data || []

export const res = await fetch(`/api/discuss/channels/${channelId}?companyId=${activeCompanyId}`);

export const data = await res.json();

export const totalMembers = channels.reduce((sum, c) => sum + (c.memberCount || 0), 0);

export const totalUnread = channels.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

export const filtered = channels.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  });

export const handleCreateChannel = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/discuss/channels', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...form, memberCount: 1, unreadCount: 0 }),
      })
      if (res.ok) { setDialogOpen(false); setForm(emptyForm); loadChannels() }
    } catch { /* silent */ }
  }

export const handleSendMessage = async () => {
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

export const cfg = channelTypeConfig[c.type]

export const cfg = channelTypeConfig[c.type]

export const isActive = selectedChannel?.id === c.id;
