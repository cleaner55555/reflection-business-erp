import { useState, useEffect, useCallback, useMemo } from 'react'

export function useSmsMarketing() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()

  const [campaigns, setCampaigns] = useState<SmsCampaign[]>([])
  const [templates, setTemplates] = useState<SmsTemplate[]>([])
  const [contacts, setContacts] = useState<SmsContact[]>([])
  const [logs, setLogs] = useState<SmsLog[]>([])
  const [keywords, setKeywords] = useState<SmsKeyword[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')

  // Dialogs
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false)
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [keywordDialogOpen, setKeywordDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<SmsCampaign | null>(null)

  // Forms
  const [campaignForm, setCampaignForm] = useState({ name: '', content: '', category: 'marketing', scheduledDate: '', senderId: 'REFLECTION' })
  const [templateForm, setTemplateForm] = useState({ name: '', category: 'transactional', body: '' })
  const [contactForm, setContactForm] = useState({ name: '', phone: '', groups: 'Svi klijenti' })
  const [keywordForm, setKeywordForm] = useState({ keyword: '', response: '', autoReply: true, forwardTo: '' })

  const [toastMsg, setToastMsg] = useState('')
  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000) }

  // ============ DATA ============

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/sms/campaigns?companyId=${activeCompanyId}&limit=100`)
      if (res.ok) { const data = await res.json(); setCampaigns(data.items || data || []) }
      else setCampaigns(DEMO_CAMPAIGNS)
    } catch { setCampaigns(DEMO_CAMPAIGNS) }
    setTemplates(DEMO_TEMPLATES)
    setContacts(DEMO_CONTACTS)
    setLogs(DEMO_LOGS)
    setKeywords(DEMO_KEYWORDS)
    setLoading(false)
  }, [activeCompanyId])

  useEffect(() => { loadData() }, [loadData])

  // ============ STATS ============

  const stats = useMemo(() => {
    const totalCampaigns = campaigns.length
    const totalSent = campaigns.reduce((s, c) => s + c.sentCount, 0)
    const totalDelivered = campaigns.reduce((s, c) => s + c.deliveredCount, 0)
    const totalFailed = campaigns.reduce((s, c) => s + c.failedCount, 0)
    const totalReplies = campaigns.reduce((s, c) => s + c.replyCount, 0)
    const totalCost = campaigns.reduce((s, c) => s + c.totalCost, 0)
    const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0
    const activeContacts = contacts.filter(c => c.status === 'active').length
    const unsubscribed = contacts.filter(c => c.status === 'unsubscribed').length

    const byCategory: Record<string, number> = {}
    campaigns.forEach(c => { byCategory[c.category] = (byCategory[c.category] || 0) + 1 })

    const byStatus: Record<string, number> = {}
    campaigns.forEach(c => { byStatus[c.status] = (byStatus[c.status] || 0) + 1 })

    return { totalCampaigns, totalSent, totalDelivered, totalFailed, totalReplies, totalCost, deliveryRate, activeContacts, unsubscribed, byCategory, byStatus }
  }, [campaigns, contacts])

  // ============ FILTERED ============

  const filteredCampaigns = useMemo(() => {
    let result = [...campaigns]
    if (searchQuery) { const q = searchQuery.toLowerCase(); result = result.filter(c => c.name.toLowerCase().includes(q) || c.content.toLowerCase().includes(q)) }
    if (filterStatus !== 'all') result = result.filter(c => c.status === filterStatus)
    if (filterCategory !== 'all') result = result.filter(c => c.category === filterCategory)
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [campaigns, searchQuery, filterStatus, filterCategory])

  // ============ ACTIONS ============

  const handleCreateCampaign = () => {
    if (!campaignForm.name.trim() || !campaignForm.content.trim()) { showToast('Naziv i sadržaj su obavezni'); return }
    const newCampaign: SmsCampaign = {
      id: `sc-${Date.now()}`, name: campaignForm.name, content: campaignForm.content,
      category: campaignForm.category, recipientCount: contacts.filter(c => c.status === 'active').length,
      sentCount: 0, deliveredCount: 0, failedCount: 0, replyCount: 0, status: 'draft',
      scheduledDate: campaignForm.scheduledDate || null, sentDate: null,
      costPerSms: 3.5, totalCost: 0, senderId: campaignForm.senderId,
      tags: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
    setCampaigns(prev => [newCampaign, ...prev])
    setCampaignDialogOpen(false)
    setCampaignForm({ name: '', content: '', category: 'marketing', scheduledDate: '', senderId: 'REFLECTION' })
    showToast('Kampanja kreirana')
  }

  const handleCreateTemplate = () => {
    if (!templateForm.name.trim() || !templateForm.body.trim()) { showToast('Naziv i sadržaj su obavezni'); return }
    const vars = (templateForm.body.match(/\{(\w+)\}/g) || []).map(v => v.replace(/[{}]/g, ''))
    const tpl: SmsTemplate = { id: `st-${Date.now()}`, name: templateForm.name, category: templateForm.category, body: templateForm.body, variables: vars, isDefault: false, usedCount: 0, createdAt: new Date().toISOString().split('T')[0] }
    setTemplates(prev => [...prev, tpl])
    setTemplateDialogOpen(false)
    showToast('Template kreiran')
  }

  const handleCreateContact = () => {
    if (!contactForm.name.trim() || !contactForm.phone.trim()) { showToast('Naziv i telefon su obavezni'); return }
    const contact: SmsContact = { id: `sc-${Date.now()}`, name: contactForm.name, phone: contactForm.phone, groups: [contactForm.groups], status: 'active', totalReceived: 0, totalSent: 0, lastActivity: null, createdAt: new Date().toISOString().split('T')[0] }
    setContacts(prev => [...prev, contact])
    setContactDialogOpen(false)
    setContactForm({ name: '', phone: '', groups: 'Svi klijenti' })
    showToast('Kontakt dodat')
  }

  const handleCreateKeyword = () => {
    if (!keywordForm.keyword.trim()) { showToast('Ključna reč je obavezna'); return }
    const kw: SmsKeyword = { id: `k-${Date.now()}`, keyword: keywordForm.keyword.toUpperCase(), response: keywordForm.response, autoReply: keywordForm.autoReply, forwardTo: keywordForm.forwardTo || null, matchCount: 0, enabled: true, createdAt: new Date().toISOString().split('T')[0] }
    setKeywords(prev => [...prev, kw])
    setKeywordDialogOpen(false)
    setKeywordForm({ keyword: '', response: '', autoReply: true, forwardTo: '' })
    showToast('Ključna reč kreirana')
  }

  const handleToggleKeyword = (id: string) => {
    setKeywords(prev => prev.map(k => k.id === id ? { ...k, enabled: !k.enabled } : k))
    showToast('Ključna reč ažurirana')
  }

  // ============ RENDER ============

  return {
    activeTab,
    campaignDialogOpen,
    campaigns,
    contactDialogOpen,
    contacts,
    detailOpen,
    filterCategory,
    filterStatus,
    filteredCampaigns,
    g,
    handleCreateCampaign,
    handleCreateContact,
    handleCreateKeyword,
    handleCreateTemplate,
    k,
    keywordDialogOpen,
    keywords,
    loadData,
    logs,
    searchQuery,
    selectedCampaign,
    setActiveTab,
    setCampaignDialogOpen,
    setContactDialogOpen,
    setDetailOpen,
    setFilterCategory,
    setFilterStatus,
    setKeywordDialogOpen,
    setTemplateDialogOpen,
    templateDialogOpen,
    templates,
    toastMsg,
  }
}
