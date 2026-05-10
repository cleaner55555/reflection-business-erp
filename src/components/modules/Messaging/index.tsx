'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  MessageCircleReply, Plus, Search, RefreshCw, Eye, Trash2, Edit3, X, Filter,
  CheckCircle2, Clock, BarChart3, Send, Users, Phone, Bot, Settings,
  ExternalLink, MessageSquare, MoreVertical, Reply, Forward, Copy, Archive,
  UserPlus, UserCheck, UserX, PhoneCall, PhoneMissed, PhoneIncoming, PhoneOutgoing,
  Globe, Shield, ShieldCheck, Zap, TrendingUp, TrendingDown, ArrowUpRight,
  FileText, Image, Mic, Video, MapPin, Link2, Star, Pin, Bookmark,
  Bell, BellOff, Volume2, VolumeX, Check, CheckCheck, AlertCircle,
  ChevronRight, ChevronDown, ArrowLeft, AtSign, Hash, Smile, Paperclip,
  ThumbsUp, ThumbsDown, HelpCircle, Info, Package, ShoppingCart, Truck,
  Receipt, CreditCard, CalendarDays, Timer, List, LayoutGrid, PieChart,
  Network, Wifi, Smartphone, Monitor, Mail
} from 'lucide-react'
import { formatDate } from '@/lib/helpers'
import { toast } from 'sonner'

// ============ TYPES ============

interface MessagingMessage {
  id: string
  conversationId: string
  contactName: string
  contactPhone: string
  contactAvatar: string | null
  direction: 'inbound' | 'outbound' | 'system'
  type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'location' | 'template'
  content: string
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  timestamp: string
  assignedTo: string | null
  tags: string[]
  starred: boolean
}

interface Conversation {
  id: string
  contactName: string
  contactPhone: string
  contactAvatar: string | null
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  status: 'open' | 'closed' | 'pending'
  assignedTo: string | null
  tags: string[]
  isStarred: boolean
  messages: MessagingMessage[]
}

interface MessagingTemplate {
  id: string
  name: string
  category: string
  language: string
  status: 'approved' | 'pending' | 'rejected'
  body: string
  variables: number
  createdAt: string
  usedCount: number
  lastUsedAt: string | null
}

interface AutoReply {
  id: string
  name: string
  description: string
  trigger: 'keyword' | 'greeting' | 'away' | 'offline' | 'always'
  keyword: string | null
  response: string
  delaySeconds: number
  enabled: boolean
  matchCount: number
  createdAt: string
}

interface MessagingCampaign {
  id: string
  name: string
  templateId: string | null
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed'
  recipientCount: number
  sentCount: number
  deliveredCount: number
  readCount: number
  failedCount: number
  scheduledAt: string | null
  createdAt: string
  completedAt: string | null
}

// ============ CONSTANTS ============

const DIRECTION_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  inbound: { label: 'Dolazna', color: 'text-green-700 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  outbound: { label: 'Odlazna', color: 'text-blue-700 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  system: { label: 'Sistem', color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-100 dark:bg-gray-800' },
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: 'Na čekanju', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: '⏳' },
  sent: { label: 'Poslato', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: '✓' },
  delivered: { label: 'Isporučeno', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: '✓✓' },
  read: { label: 'Pročitano', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400', icon: '👀' },
  failed: { label: 'Greška', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: '❌' },
}

const TEMPLATE_CATEGORIES = [
  { value: 'marketing', label: 'Marketing', color: 'bg-purple-100 text-purple-700' },
  { value: 'utility', label: 'Korisne', color: 'bg-green-100 text-green-700' },
  { value: 'authentication', label: 'Autentikacija', color: 'bg-blue-100 text-blue-700' },
  { value: 'transactional', label: 'Transakcione', color: 'bg-amber-100 text-amber-700' },
]

const TEMPLATE_LANGUAGES = ['sr', 'sr-latn', 'en', 'de', 'hu', 'hr', 'bs', 'mk', 'sl']

const CONV_STATUS: Record<string, { label: string; color: string }> = {
  open: { label: 'Otvorena', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  closed: { label: 'Zatvorena', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  pending: { label: 'Na čekanju', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
}

const AVATAR_COLORS = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-amber-500', 'bg-purple-500', 'bg-teal-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500', 'bg-cyan-500']

const getAvatarColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
const getInitials = (name: string) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

// ============ DEMO DATA ============

const DEMO_CONVERSATIONS: Conversation[] = [
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

const DEMO_TEMPLATES: MessagingTemplate[] = [
  { id: 't1', name: 'Dobrodošlica', category: 'marketing', language: 'sr', status: 'approved', body: 'Dobrodošli u {{1}}! Hvala što ste nas izabrali. Vaš nalog je kreiran. Možete pregledati naše proizvode na {{2}}', variables: 2, createdAt: '2024-01-15', usedCount: 342, lastUsedAt: new Date().toISOString() },
  { id: 't2', name: 'Potvrda narudžbe', category: 'transactional', language: 'sr', status: 'approved', body: 'Vaša narudžba {{1}} je zaprimljena! Ukupan iznos: {{2}} RSD. Predviđena dostava: {{3}} radnih dana. Hvala na poverenju!', variables: 3, createdAt: '2024-01-15', usedCount: 1256, lastUsedAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 't3', name: 'Status isporuke', category: 'utility', language: 'sr', status: 'approved', body: 'Vaša pošiljka {{1}} je {{2}}. Broj pošiljke: {{3}}. Pratite na: {{4}}', variables: 4, createdAt: '2024-02-20', usedCount: 890, lastUsedAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 't4', name: 'Podsetnik plaćanja', category: 'utility', language: 'sr', status: 'approved', body: 'Poštovani/a {{1}}, podsećamo vas da faktura br. {{2}} u iznosu od {{3}} RSD dospeva {{4}}. Plaćanje možete izvršiti na: {{5}}', variables: 5, createdAt: '2024-03-10', usedCount: 456, lastUsedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 't5', name: 'Verifikacioni kod', category: 'authentication', language: 'sr', status: 'approved', body: 'Vaš verifikacioni kod je: {{1}}. Važi 5 minuta. Ne delite ga sa nikim.', variables: 1, createdAt: '2024-04-05', usedCount: 2340, lastUsedAt: new Date().toISOString() },
  { id: 't6', name: 'Popust vikend', category: 'marketing', language: 'sr', status: 'pending', body: '🔥 Specijalna ponuda! Ovog vikenda popust 30% na sve proizvode iz kategorije {{1}}. Koristite kod {{2}} na {{3}}. Ponuda važi do {{4}}!', variables: 4, createdAt: '2025-01-01', usedCount: 0, lastUsedAt: null },
]

const DEMO_AUTO_REPLIES: AutoReply[] = [
  { id: 'a1', name: 'Pozdravna poruka', description: 'Automatski pozdrav novim kontaktima', trigger: 'greeting', keyword: null, response: 'Dobar dan! 🌟 Dobrodošli u Reflection Business. Javite nam kako vam možemo pomoći. Radno vreme: Pon-Pet 9-17h.', delaySeconds: 0, enabled: true, matchCount: 234, createdAt: '2024-01-15' },
  { id: 'a2', name: 'Odsustvo', description: 'Poruka van radnog vremena', trigger: 'away', keyword: null, response: 'Trenutno smo van radnog vremena. Radno vreme je Pon-Pet 9-17h. Vaša poruka će biti obrađena u najkraćem roku. Hvala na razumevanju! 🙏', delaySeconds: 1, enabled: true, matchCount: 89, createdAt: '2024-01-15' },
  { id: 'a3', name: 'Cena', description: 'Odgovor na upit o ceni', trigger: 'keyword', keyword: 'cena,cenovnik,koliko košta', response: 'Naše cene su dostupne na https://shop.example.com/cenovnik. Za specifične ponude, javite nam detalje narudžbe.', delaySeconds: 0, enabled: true, matchCount: 156, createdAt: '2024-02-20' },
  { id: 'a4', name: 'Dostava', description: 'Info o isporuci', trigger: 'keyword', keyword: 'dostava,pošiljka,kada stiže', response: 'Dostava je za 2-3 radna dana za Srbiju, 5-7 za region. Besplatna dostava za narudžbe pre 5000 RSD! 📦', delaySeconds: 0, enabled: true, matchCount: 112, createdAt: '2024-03-10' },
  { id: 'a5', name: 'Kontakt info', description: 'Osnovni kontakt podaci', trigger: 'keyword', keyword: 'adresa,telefon,kontakt,lokacija', response: '📍 Adresa: Beograd, Bulevar Kralja Aleksandra 123\n📞 Telefon: +381 11 123 4567\n📧 Email: info@reflection.rs\n🕐 Radno vreme: Pon-Pet 9-17h', delaySeconds: 0, enabled: false, matchCount: 45, createdAt: '2024-04-05' },
]

const DEMO_CAMPAIGNS: MessagingCampaign[] = [
  { id: 'cmp1', name: 'Najava zimskog kataloga', templateId: 't6', status: 'completed', recipientCount: 1250, sentCount: 1250, deliveredCount: 1198, readCount: 876, failedCount: 52, scheduledAt: '2024-12-01T10:00:00Z', createdAt: '2024-11-25', completedAt: '2024-12-01T10:30:00Z' },
  { id: 'cmp2', name: 'Popust za postojeće klijente', templateId: 't6', status: 'completed', recipientCount: 890, sentCount: 890, deliveredCount: 865, readCount: 723, failedCount: 25, scheduledAt: '2025-01-10T09:00:00Z', createdAt: '2025-01-05', completedAt: '2025-01-10T09:15:00Z' },
  { id: 'cmp3', name: 'Valentinska ponuda', templateId: null, status: 'draft', recipientCount: 0, sentCount: 0, deliveredCount: 0, readCount: 0, failedCount: 0, scheduledAt: null, createdAt: '2025-01-20', completedAt: null },
]

// ============ KPI ============

const KpiCard = ({ label, value, icon: Icon, sub, color, bg }: { label: string; value: string | number; icon: React.ElementType; sub?: string; color?: string; bg?: string }) => (
  <Card className="p-4">
    <div className="flex items-start justify-between mb-2">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <div className={`p-1.5 rounded-lg ${bg || 'bg-muted'}`}><Icon className={`h-4 w-4 ${color || 'text-muted-foreground'}`} /></div>
    </div>
    <p className="text-2xl font-bold">{value}</p>
    {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
  </Card>
)

// ============ MAIN ============

export function Messaging() {
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

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-right">
          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"><AlertDescription>{toastMsg}</AlertDescription></Alert>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MessageCircleReply className="h-6 w-6 text-green-600" /> Business Poruke
          </h1>
          <p className="text-sm text-muted-foreground">Business Poruke integracija za komunikaciju sa klijentima</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={() => setNewMsgDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Nova poruka</Button>
          <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview"><BarChart3 className="h-3.5 w-3.5 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="messages"><MessageSquare className="h-3.5 w-3.5 mr-1" /> Poruke <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">{stats.unread}</Badge></TabsTrigger>
          <TabsTrigger value="templates"><FileText className="h-3.5 w-3.5 mr-1" /> Template-i</TabsTrigger>
          <TabsTrigger value="chatbot"><Bot className="h-3.5 w-3.5 mr-1" /> Chatbot</TabsTrigger>
          <TabsTrigger value="campaigns"><Send className="h-3.5 w-3.5 mr-1" /> Kampanje</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="h-3.5 w-3.5 mr-1" /> Podešavanja</TabsTrigger>
        </TabsList>

        {/* ===== OVERVIEW ===== */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard label="Danas poruka" value={stats.todayMsgs} icon={MessageSquare} sub={`${stats.totalMsgs} ukupno`} color="text-green-500" bg="bg-green-50 dark:bg-green-900/20" />
            <KpiCard label="Dolazne" value={stats.inbound} icon={PhoneIncoming} sub={`${stats.outbound} odlaznih`} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-900/20" />
            <KpiCard label="Nepročitane" value={stats.unread} icon={Bell} sub={`${stats.openConvs} otvorenih`} color="text-amber-500" bg="bg-amber-50 dark:bg-amber-900/20" />
            <KpiCard label="Kontakti" value={stats.totalContacts} icon={Users} sub={`${stats.pendingConvs} čeka dodelu`} color="text-purple-500" bg="bg-purple-50 dark:bg-purple-900/20" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Unread conversations */}
            {stats.unread > 0 && (
              <Card className="border-amber-200 dark:border-amber-800 md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-amber-600"><AlertCircle className="h-4 w-4" /> Nepročitane poruke ({stats.unread})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {conversations.filter(c => c.unreadCount > 0).map(c => (
                      <div key={c.id} className="flex items-center gap-3 p-2 rounded hover:bg-amber-50 dark:hover:bg-amber-900/10 cursor-pointer" onClick={() => { setSelectedConv(c); setActiveTab('messages') }}>
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${getAvatarColor(c.contactName)}`}>{getInitials(c.contactName)}</div>
                        <div className="flex-1 min-w-0"><p className="text-sm font-medium">{c.contactName}</p><p className="text-xs text-muted-foreground truncate">{c.lastMessage}</p></div>
                        <Badge variant="outline" className="text-xs bg-amber-100 text-amber-700">{c.unreadCount}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activity by hour */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Aktivnost po satima</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-end gap-1 h-32">
                  {Array.from({ length: 24 }, (_, h) => {
                    const count = stats.msgByHour[h] || 0
                    const maxH = Math.max(...Object.values(stats.msgByHour), 1)
                    return (
                      <div key={h} className="flex-1 flex flex-col items-center gap-1">
                        <div className={`w-full rounded-t-sm ${count > 0 ? 'bg-green-400' : 'bg-muted'} transition-all`} style={{ height: `${(count / maxH) * 100}%`, minHeight: count > 0 ? '4px' : '2px' }} />
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-between mt-1 text-xs text-muted-foreground"><span>00</span><span>06</span><span>12</span><span>18</span><span>23</span></div>
              </CardContent>
            </Card>

            {/* Stats breakdown */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Statistika poruka</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Ukupno poruka</span><span className="font-medium">{stats.totalMsgs}</span></div>
                  <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Danas</span><span className="font-medium">{stats.todayMsgs}</span></div>
                  <div className="flex items-center justify-between text-xs"><span className="text-green-600">Dolazne</span><span className="font-medium">{stats.inbound}</span></div>
                  <div className="flex items-center justify-between text-xs"><span className="text-blue-600">Odlazne</span><span className="font-medium">{stats.outbound}</span></div>
                  {stats.failed > 0 && <div className="flex items-center justify-between text-xs"><span className="text-red-600">Neuspele</span><span className="font-medium">{stats.failed}</span></div>}
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs font-medium">Template-i</p>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="secondary" className="text-xs">{templates.filter(t => t.status === 'approved').length} odobrenih</Badge>
                    <Badge variant="outline" className="text-xs">{templates.filter(t => t.status === 'pending').length} na čekanju</Badge>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs font-medium">Chatbot</p>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="secondary" className="text-xs">{autoReplies.filter(a => a.enabled).length} aktivnih pravila</Badge>
                    <span className="text-muted-foreground">{autoReplies.reduce((s, a) => s + a.matchCount, 0)} ukupno pokretanja</span>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs font-medium">Kampanje</p>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="secondary" className="text-xs">{campaigns.filter(c => c.status === 'completed').length} završenih</Badge>
                    <span className="text-muted-foreground">{campaigns.reduce((s, c) => s + c.readCount, 0)} pročitanih</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags distribution */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Distribucija tagova</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.allTags.map(tag => {
                    const count = conversations.filter(c => c.tags.includes(tag)).length
                    const maxTag = Math.max(...stats.allTags.map(t => conversations.filter(c => c.tags.includes(t)).length), 1)
                    return (
                      <div key={tag} className="flex items-center gap-3">
                        <span className="text-xs w-20 truncate">#{tag}</span>
                        <div className="flex-1 bg-muted rounded-full h-3"><div className="bg-primary h-3 rounded-full" style={{ width: `${(count / maxTag) * 100}%` }} /></div>
                        <span className="text-xs font-mono w-6 text-right">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

            {/* Activity by day */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-3"><CardTitle className="text-sm">Aktivnost po danima u sedmici</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-20">
                  {['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'].map(day => {
                    const count = Object.entries(stats.msgByDay).find(([k]) => k.toLowerCase().startsWith(day.toLowerCase()))?.[1] || 0
                    const maxD = Math.max(...Object.values(stats.msgByDay), 1)
                    return (
                      <div key={day} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs text-muted-foreground">{count}</span>
                        <div className="w-full rounded-t-sm bg-green-400" style={{ height: `${(count / maxD) * 100}%`, minHeight: '4px' }} />
                        <span className="text-xs text-muted-foreground">{day}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Contacts */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Kontakti</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('messages')}>Sve poruke <ChevronRight className="h-4 w-4 ml-1" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {conversations.map(c => (
                  <div key={c.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer" onClick={() => { setSelectedConv(c); setActiveTab('messages') }}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0 ${getAvatarColor(c.contactName)}`}>{getInitials(c.contactName)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium">{c.contactName}</span>
                        {c.isStarred && <Star className="h-3 w-3 text-amber-500 fill-amber-500" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{c.contactPhone}</p>
                    </div>
                    <Badge variant="outline" className={`text-xs ${CONV_STATUS[c.status]?.color}`}>{CONV_STATUS[c.status]?.label}</Badge>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">{formatDate(c.lastMessageTime)}</p>
                      <p className="text-xs text-muted-foreground">{c.messages.length} poruka</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Business Poruke Features */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Business Poruke mogućnosti</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { name: 'Automatske poruke', desc: 'Status narudžbe, potvrda plaćanja, podsjetnici', icon: Zap },
                  { name: 'CRM integracija', desc: 'Automatsko kreiranje lead-ova iz poruka', icon: Users },
                  { name: 'AI Chatbot', desc: 'Automatski odgovori van radnog vremena', icon: Bot },
                  { name: 'Katalog poruke', desc: 'Slanje kataloga proizvoda direktno', icon: Package },
                  { name: 'Template poruke', desc: 'Odobreni template-i za masovno slanje', icon: FileText },
                  { name: 'Broadcast kampanje', desc: 'Masovno slanje marketinških poruka', icon: Send },
                ].map(f => (
                  <div key={f.name} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="h-9 w-9 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0"><f.icon className="h-4 w-4 text-green-600" /></div>
                    <div><p className="text-xs font-medium">{f.name}</p><p className="text-xs text-muted-foreground">{f.desc}</p></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== MESSAGES ===== */}
        <TabsContent value="messages" className="space-y-0">
          <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-0 border rounded-lg overflow-hidden h-[calc(100vh-300px)] min-h-[500px]">
            {/* Conversation list */}
            <div className="border-r bg-muted/20 flex flex-col">
              <div className="p-3 space-y-2 border-b">
                <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži..." className="pl-9 h-8 text-xs" value={convSearch} onChange={(e) => setConvSearch(e.target.value)} /></div>
                <div className="flex gap-1">
                  <Select value={filterStatus} onValueChange={setFilterStatus}><SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem>{Object.entries(CONV_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
                  {stats.allTags.length > 0 && <Select value={filterTag} onValueChange={setFilterTag}><SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi tagovi</SelectItem>{stats.allTags.map(t => <SelectItem key={t} value={t}>#{t}</SelectItem>)}</SelectContent></Select>}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredConvs.map(c => (
                  <div key={c.id} className={`flex items-start gap-3 p-3 border-b cursor-pointer hover:bg-muted/50 transition-colors ${selectedConv?.id === c.id ? 'bg-muted' : ''}`} onClick={() => setSelectedConv(c)}>
                    <div className="relative shrink-0">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-xs font-medium ${getAvatarColor(c.contactName)}`}>{getInitials(c.contactName)}</div>
                      {c.unreadCount > 0 && <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">{c.unreadCount}</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5"><span className="text-xs font-medium truncate">{c.contactName}</span>{c.isStarred && <Star className="h-3 w-3 text-amber-500 fill-amber-500" />}</div>
                        <span className="text-xs text-muted-foreground shrink-0">{formatDate(c.lastMessageTime)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{c.lastMessage}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge variant="outline" className={`text-xs px-1 py-0 ${CONV_STATUS[c.status]?.color}`}>{CONV_STATUS[c.status]?.label}</Badge>
                        {c.tags.slice(0, 2).map(tag => <Badge key={tag} variant="secondary" className="text-xs px-1 py-0">#{tag}</Badge>)}
                        {c.assignedTo && <span className="text-xs text-muted-foreground ml-auto">{c.assignedTo}</span>}
                      </div>
                    </div>
                  </div>
                ))}
                {filteredConvs.length === 0 && <div className="p-8 text-center"><MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" /><p className="text-xs text-muted-foreground">Nema razgovora</p></div>}
              </div>
            </div>

            {/* Chat area */}
            <div className="flex flex-col bg-background">
              {selectedConv ? (
                <>
                  {/* Chat header */}
                  <div className="flex items-center justify-between p-3 border-b">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-medium ${getAvatarColor(selectedConv.contactName)}`}>{getInitials(selectedConv.contactName)}</div>
                      <div>
                        <p className="text-sm font-medium">{selectedConv.contactName}</p>
                        <p className="text-xs text-muted-foreground">{selectedConv.contactPhone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleStar(selectedConv.id)}>{selectedConv.isStarred ? <Star className="h-4 w-4 text-amber-500 fill-amber-500" /> : <Star className="h-4 w-4" />}</Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><PhoneCall className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {selectedConv.messages.map(msg => {
                      const isInbound = msg.direction === 'inbound'
                      return (
                        <div key={msg.id} className={`flex ${isInbound ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-[75%] rounded-lg p-3 ${isInbound ? 'bg-muted' : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'}`}>
                            <p className="text-sm">{msg.content}</p>
                            <div className="flex items-center gap-1.5 mt-1 justify-end">
                              <span className="text-xs text-muted-foreground">{new Date(msg.timestamp).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}</span>
                              {!isInbound && <span className="text-xs text-green-600">{STATUS_CONFIG[msg.status]?.icon}</span>}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Reply input */}
                  <div className="p-3 border-t">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input placeholder="Napišite poruku..." className="pr-20" value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply() } }} />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6"><Paperclip className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6"><Smile className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
                      <Button size="icon" onClick={handleSendReply} disabled={!replyText.trim()} className="bg-green-600 hover:bg-green-700"><Send className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center"><MessageCircleReply className="h-12 w-12 mx-auto mb-3 text-muted-foreground" /><p className="text-muted-foreground">Izaberite razgovor</p><p className="text-xs text-muted-foreground mt-1">ili počnite novu konverzaciju</p></div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ===== TEMPLATES ===== */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{templates.length} template-a</p>
            <Button size="sm" onClick={() => { setEditingTemplate(null); setTemplateForm({ name: '', category: 'utility', language: 'sr', body: '' }); setTemplateDialogOpen(true) }}><Plus className="h-4 w-4 mr-1" /> Novi template</Button>
          </div>
          <div className="space-y-3">
            {templates.map(tpl => {
              const catCfg = TEMPLATE_CATEGORIES.find(c => c.value === tpl.category)
              return (
                <Card key={tpl.id} className="hover:bg-muted/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium">{tpl.name}</p>
                          <Badge variant="outline" className={`text-xs ${STATUS_CONFIG[tpl.status === 'approved' ? 'delivered' : tpl.status === 'pending' ? 'pending' : 'failed']?.color}`}>{tpl.status === 'approved' ? '✅ Odobren' : tpl.status === 'pending' ? '⏳ Na čekanju' : '❌ Odbijen'}</Badge>
                          <Badge variant="secondary" className={`text-xs ${catCfg?.color}`}>{catCfg?.label}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground bg-muted/30 rounded p-2 mt-1">{tpl.body}</p>
                        <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                          <span>🇷🇸 {tpl.language}</span>
                          <span>{tpl.variables} promenljivih</span>
                          <span>Korišćen {tpl.usedCount}x</span>
                          {tpl.lastUsedAt && <span>Zadnje: {formatDate(tpl.lastUsedAt)}</span>}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => { setEditingTemplate(tpl); setTemplateForm({ name: tpl.name, category: tpl.category, language: tpl.language, body: tpl.body }); setTemplateDialogOpen(true) }}><Edit3 className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* ===== CHATBOT ===== */}
        <TabsContent value="chatbot" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{autoReplies.filter(a => a.enabled).length} aktivnih pravila od {autoReplies.length}</p>
            <Button size="sm" onClick={() => { setEditingAutoReply(null); setAutoReplyForm({ name: '', description: '', trigger: 'keyword', keyword: '', response: '', delaySeconds: '0', enabled: true }); setAutoReplyDialogOpen(true) }}><Plus className="h-4 w-4 mr-1" /> Novo pravilo</Button>
          </div>
          <div className="space-y-3">
            {autoReplies.map(ar => (
              <Card key={ar.id} className={ar.enabled ? '' : 'opacity-60'}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium">{ar.name}</p>
                        <Badge variant="outline" className="text-xs">Trigger: {TRIGGER_LABELS[ar.trigger]}</Badge>
                        {ar.enabled ? <Badge variant="secondary" className="text-xs bg-green-100 text-green-700"><CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Aktivno</Badge> : <Badge variant="secondary" className="text-xs">Neaktivno</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{ar.description}</p>
                      {ar.keyword && <p className="text-xs text-muted-foreground mt-1">Ključne reči: {ar.keyword.split(',').map(k => <Badge key={k} variant="secondary" className="text-xs mr-1">#{k.trim()}</Badge>)}</p>}
                      <p className="text-xs bg-muted/30 rounded p-2 mt-1">{ar.response}</p>
                      <p className="text-xs text-muted-foreground mt-1">Pokrenuto {ar.matchCount}x {ar.delaySeconds > 0 ? `· Kašnjenje: ${ar.delaySeconds}s` : ''}</p>
                    </div>
                    <Switch checked={ar.enabled} onCheckedChange={() => handleToggleAutoReply(ar.id)} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ===== CAMPAIGNS ===== */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{campaigns.length} kampanji</p>
            <Button size="sm" onClick={() => setCampaignDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Nova kampanja</Button>
          </div>
          <div className="space-y-3">
            {campaigns.map(cmp => {
              const statusCfg = CAMPAIGN_STATUS[cmp.status]
              return (
                <Card key={cmp.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium">{cmp.name}</p>
                          <Badge variant="outline" className={`text-xs ${statusCfg?.color}`}>{statusCfg?.label}</Badge>
                        </div>
                        {cmp.scheduledAt && <p className="text-xs text-muted-foreground">Zakazano: {formatDate(cmp.scheduledAt)}</p>}
                        <div className="grid grid-cols-4 gap-3 mt-3">
                          <div className="text-center p-2 bg-muted/30 rounded"><p className="text-xs text-muted-foreground">Primaoca</p><p className="text-sm font-bold">{cmp.recipientCount}</p></div>
                          <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/10 rounded"><p className="text-xs text-muted-foreground">Poslato</p><p className="text-sm font-bold">{cmp.sentCount}</p></div>
                          <div className="text-center p-2 bg-green-50 dark:bg-green-900/10 rounded"><p className="text-xs text-muted-foreground">Pročitano</p><p className="text-sm font-bold">{cmp.readCount}</p></div>
                          <div className="text-center p-2 bg-red-50 dark:bg-red-900/10 rounded"><p className="text-xs text-muted-foreground">Greške</p><p className="text-sm font-bold text-red-600">{cmp.failedCount}</p></div>
                        </div>
                        {cmp.recipientCount > 0 && <Progress value={(cmp.readCount / cmp.recipientCount) * 100} className="mt-2 h-2" />}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* ===== SETTINGS ===== */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Business Poruke API</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="text-xs">Business Phone Number ID</Label><Input defaultValue="123456789012345" disabled /></div>
                <div className="space-y-2"><Label className="text-xs">Access Token</Label><div className="flex gap-2"><Input defaultValue="EAAxxxxxxxxxxxx" type="password" disabled /><Button variant="outline" size="sm"><Eye className="h-4 w-4" /></Button></div></div>
                <div className="space-y-2"><Label className="text-xs">Webhook Verify Token</Label><Input defaultValue="whatsapp_verify_token" disabled /></div>
                <div className="space-y-2"><Label className="text-xs">API Version</Label><Input defaultValue="v18.0" disabled /></div>
              </div>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Webhook Events</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['messages', 'message_status', 'messaging_postbacks'].map(evt => (
                    <div key={evt} className="flex items-center gap-2 p-2 border rounded-lg"><Switch checked defaultChecked /><Label className="text-xs">{evt}</Label></div>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Radno vreme</h3>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-muted-foreground">Pon-Pet:</span><span className="font-medium">09:00 - 17:00</span>
                  <span className="text-muted-foreground ml-4">Sub:</span><span className="font-medium">10:00 - 14:00</span>
                  <span className="text-muted-foreground ml-4">Ned:</span><span className="font-medium text-red-500">Zatvoreno</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ===== DIALOGS ===== */}

      {/* New Message */}
      {newMsgDialogOpen && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setNewMsgDialogOpen(false)}><ArrowLeft className="h-4 w-4" /></Button>
            <div><CardTitle className="text-base">Nova poruka</CardTitle><CardDescription>Pošaljite poruku novom ili postojećem kontaktu</CardDescription></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label className="text-xs">Broj primaoca *</Label><Input value={newMsgPhone} onChange={(e) => setNewMsgPhone(e.target.value)} placeholder="+3816XXXXXXXX" /></div>
            <div className="space-y-2"><Label className="text-xs">Poruka *</Label><Textarea value={newMsgText} onChange={(e) => setNewMsgText(e.target.value)} rows={4} placeholder="Vaša poruka..." /></div>
          </CardContent>
          <div className="flex justify-end gap-2 px-6 pb-6"><Button variant="outline" onClick={() => setNewMsgDialogOpen(false)}>Otkaži</Button><Button onClick={handleNewMessage} disabled={!newMsgPhone.trim() || !newMsgText.trim()} className="bg-green-600 hover:bg-green-700"><Send className="h-4 w-4 mr-1" /> Pošalji</Button></div>
        </Card>
      )}

      {/* New/Edit Template */}
      {templateDialogOpen && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTemplateDialogOpen(false)}><ArrowLeft className="h-4 w-4" /></Button>
            <div><CardTitle className="text-base">{editingTemplate ? 'Izmeni template' : 'Novi template'}</CardTitle><CardDescription>Kreirajte template poruku sa promenljivim</CardDescription></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-xs">Naziv *</Label><Input value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} placeholder="npr. Potvrda narudžbe" /></div>
              <div className="space-y-2"><Label className="text-xs">Kategorija</Label><Select value={templateForm.category} onValueChange={(v) => setTemplateForm({ ...templateForm, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TEMPLATE_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label className="text-xs">Jezik</Label><Select value={templateForm.language} onValueChange={(v) => setTemplateForm({ ...templateForm, language: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TEMPLATE_LANGUAGES.map(l => <SelectItem key={l} value={l}>{l.toUpperCase()}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label className="text-xs">Sadržaj poruke * (koristite {'{{1}}'}, {'{{2}}'} za promenljive)</Label><Textarea value={templateForm.body} onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })} rows={4} placeholder="Vaša poruka sa {{1}} i {{2}}..." /></div>
            <p className="text-xs text-muted-foreground">Promenljive: {(templateForm.body.match(/\{\{(\d+)\}\}/g) || []).length}</p>
          </CardContent>
          <div className="flex justify-end gap-2 px-6 pb-6"><Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>Otkaži</Button><Button onClick={handleSaveTemplate}>{editingTemplate ? 'Sačuvaj' : 'Kreiraj'}</Button></div>
        </Card>
      )}

      {/* New/Edit Auto Reply */}
      {autoReplyDialogOpen && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setAutoReplyDialogOpen(false)}><ArrowLeft className="h-4 w-4" /></Button>
            <div><CardTitle className="text-base">{editingAutoReply ? 'Izmeni auto odgovor' : 'Novi auto odgovor'}</CardTitle><CardDescription>Definišite trigger i odgovor</CardDescription></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label className="text-xs">Naziv *</Label><Input value={autoReplyForm.name} onChange={(e) => setAutoReplyForm({ ...autoReplyForm, name: e.target.value })} /></div>
            <div className="space-y-2"><Label className="text-xs">Opis</Label><Input value={autoReplyForm.description} onChange={(e) => setAutoReplyForm({ ...autoReplyForm, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-xs">Trigger</Label><Select value={autoReplyForm.trigger} onValueChange={(v) => setAutoReplyForm({ ...autoReplyForm, trigger: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(TRIGGER_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label className="text-xs">Kašnjenje (s)</Label><Input type="number" value={autoReplyForm.delaySeconds} onChange={(e) => setAutoReplyForm({ ...autoReplyForm, delaySeconds: e.target.value })} /></div>
            </div>
            {autoReplyForm.trigger === 'keyword' && <div className="space-y-2"><Label className="text-xs">Ključne reči (zarezima)</Label><Input value={autoReplyForm.keyword} onChange={(e) => setAutoReplyForm({ ...autoReplyForm, keyword: e.target.value })} placeholder="cena,dostava,katalog" /></div>}
            <div className="space-y-2"><Label className="text-xs">Odgovor *</Label><Textarea value={autoReplyForm.response} onChange={(e) => setAutoReplyForm({ ...autoReplyForm, response: e.target.value })} rows={3} placeholder="Automatski odgovor..." /></div>
          </CardContent>
          <div className="flex justify-end gap-2 px-6 pb-6"><Button variant="outline" onClick={() => setAutoReplyDialogOpen(false)}>Otkaži</Button><Button onClick={handleSaveAutoReply}>{editingAutoReply ? 'Sačuvaj' : 'Kreiraj'}</Button></div>
        </Card>
      )}

      {/* New Campaign */}
      {campaignDialogOpen && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCampaignDialogOpen(false)}><ArrowLeft className="h-4 w-4" /></Button>
            <div><CardTitle className="text-base">Nova kampanja</CardTitle><CardDescription>Kreirajte broadcast kampanju za masovno slanje poruka</CardDescription></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label className="text-xs">Naziv kampanje *</Label><Input placeholder="npr. Najama zimskog kataloga" /></div>
            <div className="space-y-2">
              <Label className="text-xs">Template</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Izaberite template" /></SelectTrigger>
                <SelectContent>
                  {templates.filter(t => t.status === 'approved').map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label className="text-xs">Datum slanja</Label><Input type="datetime-local" /></div>
            <div className="space-y-2">
              <Label className="text-xs">Grupa primalaca</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Izaberite grupu" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi kontakti</SelectItem>
                  <SelectItem value="leads">Lead-ovi</SelectItem>
                  <SelectItem value="customers">Postojeći klijenti</SelectItem>
                  <SelectItem value="vip">VIP klijenti</SelectItem>
                  <SelectItem value="inactive">Neaktivni kontakti (30+ dana)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700 dark:text-amber-400 text-xs">
                Business Poruke dozvoljava broadcast samo za kontakte koji su vas prethodno kontaktirali. Maksimalno 10.000 primalaca po kampanji.
              </AlertDescription>
            </Alert>
          </CardContent>
          <div className="flex justify-end gap-2 px-6 pb-6">
            <Button variant="outline" onClick={() => setCampaignDialogOpen(false)}>Otkaži</Button>
            <Button onClick={() => { setCampaignDialogOpen(false); showToast('Kampanja kreirana') }}>Kreiraj kampanju</Button>
          </div>
        </Card>
      )}

      {/* ===== QUICK STATS BAR (visible on all tabs) ===== */}
      {activeTab !== 'overview' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center"><MessageSquare className="h-4 w-4 text-green-600" /></div>
              <div><p className="text-xs text-muted-foreground">Danas</p><p className="text-lg font-bold">{stats.todayMsgs}</p></div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center"><PhoneIncoming className="h-4 w-4 text-blue-600" /></div>
              <div><p className="text-xs text-muted-foreground">Nepročitane</p><p className="text-lg font-bold">{stats.unread}</p></div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center"><Bot className="h-4 w-4 text-amber-600" /></div>
              <div><p className="text-xs text-muted-foreground">Auto odgovori</p><p className="text-lg font-bold">{autoReplies.filter(a => a.enabled).length}</p></div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center"><Users className="h-4 w-4 text-purple-600" /></div>
              <div><p className="text-xs text-muted-foreground">Kontakti</p><p className="text-lg font-bold">{stats.totalContacts}</p></div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
