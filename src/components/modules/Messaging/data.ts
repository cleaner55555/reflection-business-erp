export const DIRECTION_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  inbound: { label: 'Dolazna', color: 'text-green-700 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  outbound: { label: 'Odlazna', color: 'text-blue-700 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  system: { label: 'Sistem', color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-100 dark:bg-gray-800' },
}

export const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: 'Na čekanju', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: '⏳' },
  sent: { label: 'Poslato', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: '✓' },
  delivered: { label: 'Isporučeno', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: '✓✓' },
  read: { label: 'Pročitano', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400', icon: '👀' },
  failed: { label: 'Greška', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: '❌' },
}

export const TEMPLATE_CATEGORIES = [
  { value: 'marketing', label: 'Marketing', color: 'bg-purple-100 text-purple-700' },
  { value: 'utility', label: 'Korisne', color: 'bg-green-100 text-green-700' },
  { value: 'authentication', label: 'Autentikacija', color: 'bg-blue-100 text-blue-700' },
  { value: 'transactional', label: 'Transakcione', color: 'bg-amber-100 text-amber-700' },
]

export const TEMPLATE_LANGUAGES = ['sr', 'sr-latn', 'en', 'de', 'hu', 'hr', 'bs', 'mk', 'sl']

export const CONV_STATUS: Record<string, { label: string; color: string }> = {
  open: { label: 'Otvorena', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  closed: { label: 'Zatvorena', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  pending: { label: 'Na čekanju', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
}

export const AVATAR_COLORS = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-amber-500', 'bg-purple-500', 'bg-teal-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500', 'bg-cyan-500']

export const getAvatarColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]

export const getInitials = (name: string) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

export const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1', contactName: 'Jovan Petrović', contactPhone: '+381631234567', contactAvatar: null,
    lastMessage: 'Zahvaljujemo na interesovanju. Evo linka do našeg kataloga...', lastMessageTime: new Date(Date.now() - 3500000).toISOString(),
    unreadCount: 0, status: 'open', assignedTo: 'Marko', tags: ['lead', 'katalog'], isStarred: true,
    messages: [
      { id: 'm1', conversationId: 'c1', contactName: 'Jovan Petrović', contactPhone: '+381631234567', contactAvatar: null, direction: 'inbound', type: 'text', content: 'Poštovani, interesujem se za vaš proizvod. Mogu li dobiti ponudu?', status: 'read', timestamp: new Date(Date.now() - 3600000).toISOString(), assignedTo: null, tags: [], starred: false },
      { id: 'm2', conversationId: 'c1', contactName: 'Jovan Petrović', contactPhone: '+381631234567', contactAvatar: null, direction: 'outbound', type: 'text', content: 'Zdravo Jovane! Zahvaljujemo na interesovanju. Evo linka do našeg kataloga: https://shop.example.com/katalog. Javite ako imate pitanja!', status: 'delivered', timestamp: new Date(Date.now() - 3500000).toISOString(), assignedTo: 'Marko', tags: [], starred: false },
      { id: 'm3', conversationId: 'c1', contactName: 'Jovan Petrović', contactPhone: '+381631234567', contactAvatar: null, direction: 'outbound', type: 'document', content: 'Katalog_2025.pdf (2.4 MB)', status: 'delivered', timestamp: new Date(Date.now() - 3400000).toISOString(), assignedTo: 'Marko', tags: [], starred: false },
    ]
  },
  {
    id: 'c2', contactName: 'Ana Stanković', contactPhone: '+381647890123', contactAvatar: null,
    lastMessage: 'Vaša narudžba je poslata danas. Broj pošiljke: SHP-2025-001.', lastMessageTime: new Date(Date.now() - 7100000).toISOString(),
    unreadCount: 0, status: 'open', assignedTo: 'Jelena', tags: ['narudžba', 'isporuka'], isStarred: false,
    messages: [
      { id: 'm4', conversationId: 'c2', contactName: 'Ana Stanković', contactPhone: '+381647890123', contactAvatar: null, direction: 'inbound', type: 'text', content: 'Kada stiže moja narudžba #ORD-2025-123?', status: 'read', timestamp: new Date(Date.now() - 7200000).toISOString(), assignedTo: null, tags: [], starred: false },
      { id: 'm5', conversationId: 'c2', contactName: 'Ana Stanković', contactPhone: '+381647890123', contactAvatar: null, direction: 'outbound', type: 'text', content: 'Vaša narudžba je poslata danas. Broj pošiljke: SHP-2025-001. Možete je pratiti na https://track.example.com/SHP-2025-001. Predviđena dostava: 2-3 radna dana.', status: 'read', timestamp: new Date(Date.now() - 7100000).toISOString(), assignedTo: 'Jelena', tags: [], starred: false },
    ]
  },
  {
    id: 'c3', contactName: 'Marko Nikolić', contactPhone: '+381651112233', contactAvatar: null,
    lastMessage: 'Da li imate na stanju proizvod XYZ?', lastMessageTime: new Date(Date.now() - 600000).toISOString(),
    unreadCount: 1, status: 'pending', assignedTo: null, tags: ['upit'], isStarred: false,
    messages: [
      { id: 'm6', conversationId: 'c3', contactName: 'Marko Nikolić', contactPhone: '+381651112233', contactAvatar: null, direction: 'inbound', type: 'text', content: 'Da li imate na stanju proizvod XYZ?', status: 'read', timestamp: new Date(Date.now() - 600000).toISOString(), assignedTo: null, tags: [], starred: false },
    ]
  },
  {
    id: 'c4', contactName: 'Milica Jovanović', contactPhone: '+381605554444', contactAvatar: null,
    lastMessage: 'Hvala na brzoj dostavi! Sve je u redu.', lastMessageTime: new Date(Date.now() - 86400000).toISOString(),
    unreadCount: 0, status: 'closed', assignedTo: 'Marko', tags: ['završena', 'dostava'], isStarred: false,
    messages: [
      { id: 'm7', conversationId: 'c4', contactName: 'Milica Jovanović', contactPhone: '+381605554444', contactAvatar: null, direction: 'inbound', type: 'text', content: 'Gde je moja pošiljka?', status: 'read', timestamp: new Date(Date.now() - 172800000).toISOString(), assignedTo: null, tags: [], starred: false },
      { id: 'm8', conversationId: 'c4', contactName: 'Milica Jovanović', contactPhone: '+381605554444', contactAvatar: null, direction: 'outbound', type: 'text', content: 'Vaša pošiljka stiže sutra između 10-14h. Kurir će vas pozvati pre dostave.', status: 'read', timestamp: new Date(Date.now() - 172000000).toISOString(), assignedTo: 'Marko', tags: [], starred: false },
      { id: 'm9', conversationId: 'c4', contactName: 'Milica Jovanović', contactPhone: '+381605554444', contactAvatar: null, direction: 'inbound', type: 'text', content: 'Hvala na brzoj dostavi! Sve je u redu.', status: 'read', timestamp: new Date(Date.now() - 86400000).toISOString(), assignedTo: null, tags: [], starred: false },
    ]
  },
  {
    id: 'c5', contactName: 'Nikola Đorđević', contactPhone: '+381623334444', contactAvatar: null,
    lastMessage: 'Poslali smo vam fakturu putem emaila.', lastMessageTime: new Date(Date.now() - 43200000).toISOString(),
    unreadCount: 0, status: 'closed', assignedTo: 'Jelena', tags: ['faktura', 'plaćanje'], isStarred: true,
    messages: [
      { id: 'm10', conversationId: 'c5', contactName: 'Nikola Đorđević', contactPhone: '+381623334444', contactAvatar: null, direction: 'outbound', type: 'template', content: 'Poštovani Nikola, vaša faktura br. FAK-2025-456 je izdata. Iznos: 45.000 RSD. Rok plaćanja: 15 dana. Hvala na poverenju!', status: 'read', timestamp: new Date(Date.now() - 43200000).toISOString(), assignedTo: 'Jelena', tags: [], starred: false },
    ]
  },
  {
    id: 'c6', contactName: 'Jelena Milić', contactPhone: '+381649998887', contactAvatar: null,
    lastMessage: 'Ne znam da li sam vas razumela...', lastMessageTime: new Date(Date.now() - 259200000).toISOString(),
    unreadCount: 0, status: 'closed', assignedTo: null, tags: ['spam'], isStarred: false,
    messages: [
      { id: 'm11', conversationId: 'c6', contactName: 'Jelena Milić', contactPhone: '+381649998887', contactAvatar: null, direction: 'inbound', type: 'text', content: 'Pozdrav, želim da naručim...', status: 'read', timestamp: new Date(Date.now() - 259200000).toISOString(), assignedTo: null, tags: [], starred: false },
      { id: 'm12', conversationId: 'c6', contactName: 'Jelena Milić', contactPhone: '+381649998887', contactAvatar: null, direction: 'outbound', type: 'text', content: 'Dobar dan! Koju vrstu proizvoda želite da naručite? Možete pogledati naš katalog na sajtu.', status: 'read', timestamp: new Date(Date.now() - 258000000).toISOString(), assignedTo: null, tags: [], starred: false },
      { id: 'm13', conversationId: 'c6', contactName: 'Jelena Milić', contactPhone: '+381649998887', contactAvatar: null, direction: 'inbound', type: 'text', content: 'Ne znam da li sam vas razumela...', status: 'read', timestamp: new Date(Date.now() - 259200000).toISOString(), assignedTo: null, tags: [], starred: false },
    ]
  },
]

export const DEMO_TEMPLATES: MessagingTemplate[] = [
  { id: 't1', name: 'Dobrodošlica', category: 'marketing', language: 'sr', status: 'approved', body: 'Dobrodošli u {{1}}! Hvala što ste nas izabrali. Vaš nalog je kreiran. Možete pregledati naše proizvode na {{2}}', variables: 2, createdAt: '2024-01-15', usedCount: 342, lastUsedAt: new Date().toISOString() },
  { id: 't2', name: 'Potvrda narudžbe', category: 'transactional', language: 'sr', status: 'approved', body: 'Vaša narudžba {{1}} je zaprimljena! Ukupan iznos: {{2}} RSD. Predviđena dostava: {{3}} radnih dana. Hvala na poverenju!', variables: 3, createdAt: '2024-01-15', usedCount: 1256, lastUsedAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 't3', name: 'Status isporuke', category: 'utility', language: 'sr', status: 'approved', body: 'Vaša pošiljka {{1}} je {{2}}. Broj pošiljke: {{3}}. Pratite na: {{4}}', variables: 4, createdAt: '2024-02-20', usedCount: 890, lastUsedAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 't4', name: 'Podsetnik plaćanja', category: 'utility', language: 'sr', status: 'approved', body: 'Poštovani/a {{1}}, podsećamo vas da faktura br. {{2}} u iznosu od {{3}} RSD dospeva {{4}}. Plaćanje možete izvršiti na: {{5}}', variables: 5, createdAt: '2024-03-10', usedCount: 456, lastUsedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 't5', name: 'Verifikacioni kod', category: 'authentication', language: 'sr', status: 'approved', body: 'Vaš verifikacioni kod je: {{1}}. Važi 5 minuta. Ne delite ga sa nikim.', variables: 1, createdAt: '2024-04-05', usedCount: 2340, lastUsedAt: new Date().toISOString() },
  { id: 't6', name: 'Popust vikend', category: 'marketing', language: 'sr', status: 'pending', body: '🔥 Specijalna ponuda! Ovog vikenda popust 30% na sve proizvode iz kategorije {{1}}. Koristite kod {{2}} na {{3}}. Ponuda važi do {{4}}!', variables: 4, createdAt: '2025-01-01', usedCount: 0, lastUsedAt: null },
]

export const DEMO_AUTO_REPLIES: AutoReply[] = [
  { id: 'a1', name: 'Pozdravna poruka', description: 'Automatski pozdrav novim kontaktima', trigger: 'greeting', keyword: null, response: 'Dobar dan! 🌟 Dobrodošli u Reflection Business. Javite nam kako vam možemo pomoći. Radno vreme: Pon-Pet 9-17h.', delaySeconds: 0, enabled: true, matchCount: 234, createdAt: '2024-01-15' },
  { id: 'a2', name: 'Odsustvo', description: 'Poruka van radnog vremena', trigger: 'away', keyword: null, response: 'Trenutno smo van radnog vremena. Radno vreme je Pon-Pet 9-17h. Vaša poruka će biti obrađena u najkraćem roku. Hvala na razumevanju! 🙏', delaySeconds: 1, enabled: true, matchCount: 89, createdAt: '2024-01-15' },
  { id: 'a3', name: 'Cena', description: 'Odgovor na upit o ceni', trigger: 'keyword', keyword: 'cena,cenovnik,koliko košta', response: 'Naše cene su dostupne na https://shop.example.com/cenovnik. Za specifične ponude, javite nam detalje narudžbe.', delaySeconds: 0, enabled: true, matchCount: 156, createdAt: '2024-02-20' },
  { id: 'a4', name: 'Dostava', description: 'Info o isporuci', trigger: 'keyword', keyword: 'dostava,pošiljka,kada stiže', response: 'Dostava je za 2-3 radna dana za Srbiju, 5-7 za region. Besplatna dostava za narudžbe pre 5000 RSD! 📦', delaySeconds: 0, enabled: true, matchCount: 112, createdAt: '2024-03-10' },
  { id: 'a5', name: 'Kontakt info', description: 'Osnovni kontakt podaci', trigger: 'keyword', keyword: 'adresa,telefon,kontakt,lokacija', response: '📍 Adresa: Beograd, Bulevar Kralja Aleksandra 123\n📞 Telefon: +381 11 123 4567\n📧 Email: info@reflection.rs\n🕐 Radno vreme: Pon-Pet 9-17h', delaySeconds: 0, enabled: false, matchCount: 45, createdAt: '2024-04-05' },
]

export const DEMO_CAMPAIGNS: MessagingCampaign[] = [
  { id: 'cmp1', name: 'Najava zimskog kataloga', templateId: 't6', status: 'completed', recipientCount: 1250, sentCount: 1250, deliveredCount: 1198, readCount: 876, failedCount: 52, scheduledAt: '2024-12-01T10:00:00Z', createdAt: '2024-11-25', completedAt: '2024-12-01T10:30:00Z' },
  { id: 'cmp2', name: 'Popust za postojeće klijente', templateId: 't6', status: 'completed', recipientCount: 890, sentCount: 890, deliveredCount: 865, readCount: 723, failedCount: 25, scheduledAt: '2025-01-10T09:00:00Z', createdAt: '2025-01-05', completedAt: '2025-01-10T09:15:00Z' },
  { id: 'cmp3', name: 'Valentinska ponuda', templateId: null, status: 'draft', recipientCount: 0, sentCount: 0, deliveredCount: 0, readCount: 0, failedCount: 0, scheduledAt: null, createdAt: '2025-01-20', completedAt: null },
]

export const KpiCard = ({ label, value, icon: Icon, sub, color, bg }: { label: string; value: string | number; icon: React.ElementType; sub?: string; color?: string; bg?: string }) => (
  <Card className="p-4">
    <div className="flex items-start justify-between mb-2">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <div className={`p-1.5 rounded-lg ${bg || 'bg-muted'}`}><Icon className={`h-4 w-4 ${color || 'text-muted-foreground'}`} /></div>
    </div>
    <p className="text-2xl font-bold">{value}</p>
    {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
  </Card>
);

export const { activeCompanyId } = useAppStore();

export const { t } = useTranslation();

export const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000) }

export const res = await fetch('/api/whatsapp/conversations');

export const allMessages = conversations.flatMap(c => c.messages);

export const totalMsgs = allMessages.length;

export const today = new Date().toDateString();

export const todayMsgs = allMessages.filter(m => new Date(m.timestamp).toDateString() === today).length;

export const inbound = allMessages.filter(m => m.direction === 'inbound').length;

export const outbound = allMessages.filter(m => m.direction === 'outbound').length;

export const failed = allMessages.filter(m => m.status === 'failed').length;

export const unread = conversations.filter(c => c.unreadCount > 0).length;

export const openConvs = conversations.filter(c => c.status === 'open').length;

export const pendingConvs = conversations.filter(c => c.status === 'pending').length;

export const totalContacts = conversations.length;

export const allTags = [...new Set(conversations.flatMap(c => c.tags))]

export const msgByHour: Record<number, number> = {}

export const msgByDay: Record<string, number> = {}

export const q = convSearch.toLowerCase();

export const handleSendReply = () => {
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

export const handleNewMessage = () => {
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

export const handleToggleAutoReply = (id: string) => {
    setAutoReplies(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a))
    showToast('Automatski odgovor ažuriran')
  }

export const handleSaveTemplate = () => {
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

export const handleSaveAutoReply = () => {
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

export const handleToggleStar = (convId: string) => {
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, isStarred: !c.isStarred } : c))
  }

export const TRIGGER_LABELS: Record<string, string> = { keyword: 'Ključna reč', greeting: 'Pozdrav', away: 'Van radnog vremena', offline: 'Offline', always: 'Uvek' }

export const CAMPAIGN_STATUS: Record<string, { label: string; color: string }> = {
    draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-600' },
    scheduled: { label: 'Zakazano', color: 'bg-blue-100 text-blue-700' },
    sending: { label: 'Slanje...', color: 'bg-amber-100 text-amber-700' },
    completed: { label: 'Završeno', color: 'bg-green-100 text-green-700' },
    failed: { label: 'Greška', color: 'bg-red-100 text-red-700' },
  }

export const count = stats.msgByHour[h] || 0;

export const maxH = Math.max(...Object.values(stats.msgByHour), 1);

export const count = conversations.filter(c => c.tags.includes(tag)).length;

export const maxTag = Math.max(...stats.allTags.map(t => conversations.filter(c => c.tags.includes(t)).length), 1);

export const count = Object.entries(stats.msgByDay).find(([k]) => k.toLowerCase().startsWith(day.toLowerCase()))?.[1] || 0;

export const maxD = Math.max(...Object.values(stats.msgByDay), 1);

export const isInbound = msg.direction === 'inbound';

export const catCfg = TEMPLATE_CATEGORIES.find(c => c.value === tpl.category);

export const statusCfg = CAMPAIGN_STATUS[cmp.status]
