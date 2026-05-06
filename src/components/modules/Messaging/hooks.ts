import { useState, useEffect, useCallback, useMemo } from 'react'

export function useMessaging() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()

  // Data
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [templates, setTemplates] = useState<MessagingTemplate[]>([])
  const [autoReplies, setAutoReplies] = useState<AutoReply[]>([])
  const [campaigns, setCampaigns] = useState<MessagingCampaign[]>([])
  const [loading, setLoading] = useState(true)

  // View
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterTag, setFilterTag] = useState('all')

  // Conversation view
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)
  const [replyText, setReplyText] = useState('')
  const [convSearch, setConvSearch] = useState('')

  // Dialogs
  const [newMsgDialogOpen, setNewMsgDialogOpen] = useState(false)
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [autoReplyDialogOpen, setAutoReplyDialogOpen] = useState(false)
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<MessagingTemplate | null>(null)
  const [editingAutoReply, setEditingAutoReply] = useState<AutoReply | null>(null)

  // Forms
  const [newMsgPhone, setNewMsgPhone] = useState('')
  const [newMsgText, setNewMsgText] = useState('')
  const [templateForm, setTemplateForm] = useState({ name: '', category: 'utility', language: 'sr', body: '' })
  const [autoReplyForm, setAutoReplyForm] = useState({ name: '', description: '', trigger: 'keyword', keyword: '', response: '', delaySeconds: '0', enabled: true })

  const [toastMsg, setToastMsg] = useState('')
  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000) }

  // ============ DATA ============

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/whatsapp/conversations')
      if (res.ok) setConversations(await res.json())
      else setConversations(DEMO_CONVERSATIONS)
    } catch { setConversations(DEMO_CONVERSATIONS) }
    setTemplates(DEMO_TEMPLATES)
    setAutoReplies(DEMO_AUTO_REPLIES)
    setCampaigns(DEMO_CAMPAIGNS)
    setLoading(false)
  }, [activeCompanyId])

  useEffect(() => { loadData() }, [loadData])

  // ============ STATS ============

  const stats = useMemo(() => {
    const allMessages = conversations.flatMap(c => c.messages)
    const totalMsgs = allMessages.length
    const today = new Date().toDateString()
    const todayMsgs = allMessages.filter(m => new Date(m.timestamp).toDateString() === today).length
    const inbound = allMessages.filter(m => m.direction === 'inbound').length
    const outbound = allMessages.filter(m => m.direction === 'outbound').length
    const failed = allMessages.filter(m => m.status === 'failed').length
    const unread = conversations.filter(c => c.unreadCount > 0).length
    const openConvs = conversations.filter(c => c.status === 'open').length
    const pendingConvs = conversations.filter(c => c.status === 'pending').length
    const totalContacts = conversations.length

    const allTags = [...new Set(conversations.flatMap(c => c.tags))]

    const msgByHour: Record<number, number> = {}
    allMessages.forEach(m => { const h = new Date(m.timestamp).getHours(); msgByHour[h] = (msgByHour[h] || 0) + 1 })

    const msgByDay: Record<string, number> = {}
    allMessages.forEach(m => { const d = new Date(m.timestamp).toLocaleDateString('sr-RS', { weekday: 'short' }); msgByDay[d] = (msgByDay[d] || 0) + 1 })

    return { totalMsgs, todayMsgs, inbound, outbound, failed, unread, openConvs, pendingConvs, totalContacts, allTags, msgByHour, msgByDay }
  }, [conversations])

  // ============ FILTERED ============

  const filteredConvs = useMemo(() => {
    let result = [...conversations]
    if (convSearch) {
      const q = convSearch.toLowerCase()
      result = result.filter(c =>
        (c.contactName || '').toLowerCase().includes(q) ||
        (c.contactPhone || '').includes(q) ||
        (c.lastMessage || '').toLowerCase().includes(q)
      )
    }
    if (filterStatus !== 'all') result = result.filter(c => c.status === filterStatus)
    if (filterTag !== 'all') result = result.filter(c => c.tags.includes(filterTag))
    result.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime())
    return result
  }, [conversations, convSearch, filterStatus, filterTag])

  // ============ ACTIONS ============

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedConv) return
    const newMsg: MessagingMessage = {
      id: `m-${Date.now()}`, conversationId: selectedConv.id, contactName: selectedConv.contactName,
      contactPhone: selectedConv.contactPhone, contactAvatar: null, direction: 'outbound',
      type: 'text', content: replyText, status: 'sent', timestamp: new Date().toISOString(),
      assignedTo: null, tags: [], starred: false,
    }
    setConversations(prev => prev.map(c => c.id === selectedConv.id ? {
      ...c, messages: [...c.messages, newMsg],
      lastMessage: replyText, lastMessageTime: new Date().toISOString(), unreadCount: 0,
    } : c))
    setSelectedConv(prev => prev ? { ...prev, messages: [...prev.messages, newMsg], lastMessage: replyText, lastMessageTime: new Date().toISOString() } : null)
    setReplyText('')
    showToast('Poruka poslata')
  }

  const handleNewMessage = () => {
    if (!newMsgPhone.trim() || !newMsgText.trim()) return
    const newMsg: MessagingMessage = {
      id: `m-${Date.now()}`, conversationId: `c-${Date.now()}`, contactName: newMsgPhone,
      contactPhone: newMsgPhone, contactAvatar: null, direction: 'outbound',
      type: 'text', content: newMsgText, status: 'sent', timestamp: new Date().toISOString(),
      assignedTo: null, tags: [], starred: false,
    }
    const newConv: Conversation = {
      id: `c-${Date.now()}`, contactName: newMsgPhone, contactPhone: newMsgPhone,
      contactAvatar: null, lastMessage: newMsgText, lastMessageTime: new Date().toISOString(),
      unreadCount: 0, status: 'open', assignedTo: null, tags: [], isStarred: false,
      messages: [newMsg],
    }
    setConversations(prev => [newConv, ...prev])
    setNewMsgPhone('')
    setNewMsgText('')
    setNewMsgDialogOpen(false)
    showToast('Poruka poslata')
  }

  const handleToggleAutoReply = (id: string) => {
    setAutoReplies(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a))
    showToast('Automatski odgovor ažuriran')
  }

  const handleSaveTemplate = () => {
    if (!templateForm.name.trim() || !templateForm.body.trim()) { showToast('Naziv i sadržaj su obavezni'); return }
    const varCount = (templateForm.body.match(/\{\{(\d+)\}\}/g) || []).length
    const tpl: MessagingTemplate = {
      id: editingTemplate?.id || `t-${Date.now()}`, name: templateForm.name, category: templateForm.category,
      language: templateForm.language, status: 'pending', body: templateForm.body,
      variables: varCount, createdAt: new Date().toISOString().split('T')[0], usedCount: editingTemplate?.usedCount || 0,
      lastUsedAt: editingTemplate?.lastUsedAt || null,
    }
    setTemplates(prev => editingTemplate ? prev.map(t => t.id === editingTemplate.id ? tpl : t) : [...prev, tpl])
    setTemplateDialogOpen(false)
    showToast(editingTemplate ? 'Template ažuriran' : 'Template kreiran')
  }

  const handleSaveAutoReply = () => {
    if (!autoReplyForm.name.trim() || !autoReplyForm.response.trim()) { showToast('Naziv i odgovor su obavezni'); return }
    const ar: AutoReply = {
      id: editingAutoReply?.id || `a-${Date.now()}`, name: autoReplyForm.name, description: autoReplyForm.description,
      trigger: autoReplyForm.trigger as AutoReply['trigger'], keyword: autoReplyForm.keyword || null,
      response: autoReplyForm.response, delaySeconds: Number(autoReplyForm.delaySeconds) || 0,
      enabled: autoReplyForm.enabled, matchCount: editingAutoReply?.matchCount || 0, createdAt: new Date().toISOString().split('T')[0],
    }
    setAutoReplies(prev => editingAutoReply ? prev.map(a => a.id === editingAutoReply.id ? ar : a) : [...prev, ar])
    setAutoReplyDialogOpen(false)
    showToast(editingAutoReply ? 'Auto odgovor ažuriran' : 'Auto odgovor kreiran')
  }

  const handleToggleStar = (convId: string) => {
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, isStarred: !c.isStarred } : c))
  }

  // ============ RENDER ============

  const TRIGGER_LABELS: Record<string, string> = { keyword: 'Ključna reč', greeting: 'Pozdrav', away: 'Van radnog vremena', offline: 'Offline', always: 'Uvek' }
  const CAMPAIGN_STATUS: Record<string, { label: string; color: string }> = {
    draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-600' },
    scheduled: { label: 'Zakazano', color: 'bg-blue-100 text-blue-700' },
    sending: { label: 'Slanje...', color: 'bg-amber-100 text-amber-700' },
    completed: { label: 'Završeno', color: 'bg-green-100 text-green-700' },
    failed: { label: 'Greška', color: 'bg-red-100 text-red-700' },
  }

  return {
    activeTab,
    autoReplies,
    autoReplyDialogOpen,
    campaignDialogOpen,
    campaigns,
    catCfg,
    convSearch,
    conversations,
    editingAutoReply,
    editingTemplate,
    filterStatus,
    filterTag,
    filteredConvs,
    handleNewMessage,
    handleSaveAutoReply,
    handleSaveTemplate,
    handleSendReply,
    isInbound,
    k,
    l,
    loadData,
    newMsgDialogOpen,
    newMsgPhone,
    newMsgText,
    replyText,
    selectedConv,
    setActiveTab,
    setAutoReplyDialogOpen,
    setCampaignDialogOpen,
    setFilterStatus,
    setFilterTag,
    setNewMsgDialogOpen,
    setTemplateDialogOpen,
    statusCfg,
    t,
    templateDialogOpen,
    templates,
    toastMsg,
  }
}
