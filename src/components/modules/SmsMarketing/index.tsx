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
  Megaphone, Plus, Search, Eye, Trash2, Edit3, RefreshCw, X, Filter,
  CheckCircle2, Clock, BarChart3, Send, Phone, Users, AlertTriangle,
  DollarSign, AlertCircle, MessageSquare, MoreVertical, Copy, Download,
  Upload, Zap, TrendingUp, TrendingDown, Target, UserPlus, Mail,
  CalendarDays, Timer, Globe, Shield, ShieldCheck, CreditCard, Receipt,
  FileText, Smartphone, Network, Wifi, ArrowUpRight, ArrowDownRight,
  Bell, BellOff, Volume2, VolumeX, List, LayoutGrid, PieChart,
  Settings, Info, Link2, ExternalLink, Archive, Lock, Unlock,
  ChevronRight, ChevronDown, Hash, AtSign, Star, Pin, ArrowLeft
} from 'lucide-react'
import { formatDate, formatRSD } from '@/lib/helpers'
import { toast } from 'sonner'

// ============ TYPES ============

interface SmsCampaign {
  id: string
  name: string
  content: string
  category: string
  recipientCount: number
  sentCount: number
  deliveredCount: number
  failedCount: number
  replyCount: number
  status: string
  scheduledDate: string | null
  sentDate: string | null
  costPerSms: number
  totalCost: number
  senderId: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
}

interface SmsTemplate {
  id: string
  name: string
  category: string
  body: string
  variables: string[]
  isDefault: boolean
  usedCount: number
  createdAt: string
}

interface SmsContact {
  id: string
  name: string
  phone: string
  groups: string[]
  status: 'active' | 'inactive' | 'unsubscribed'
  totalReceived: number
  totalSent: number
  lastActivity: string | null
  createdAt: string
}

interface SmsLog {
  id: string
  phone: string
  contactName: string | null
  direction: 'inbound' | 'outbound'
  content: string
  status: string
  campaignId: string | null
  cost: number
  createdAt: string
}

interface SmsKeyword {
  id: string
  keyword: string
  response: string
  autoReply: boolean
  forwardTo: string | null
  matchCount: number
  enabled: boolean
  createdAt: string
}

// ============ CONSTANTS ============

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  scheduled: { label: 'Zakazano', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  sending: { label: 'Slanje...', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  sent: { label: 'Poslato', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  failed: { label: 'Greška', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  delivered: { label: 'Isporučeno', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
}

const TEMPLATE_CATEGORIES = [
  { value: 'marketing', label: 'Marketing' },
  { value: 'transactional', label: 'Transakciona' },
  { value: 'notification', label: 'Obaveštenje' },
  { value: 'promotional', label: 'Promocija' },
  { value: 'otp', label: 'OTP/Jednokratna šifra' },
  { value: 'reminder', label: 'Podsetnik' },
]

const CONTACT_GROUPS = ['Svi klijenti', 'VIP', 'Newsletter', 'Lead-ovi', 'Neaktivni', 'Zaposleni', 'Partners']

const CONTACT_STATUS: Record<string, { label: string; color: string }> = {
  active: { label: 'Aktivan', color: 'bg-green-100 text-green-700' },
  inactive: { label: 'Neaktivan', color: 'bg-gray-100 text-gray-600' },
  unsubscribed: { label: 'Odjavljen', color: 'bg-red-100 text-red-700' },
}

const SMS_MAX_CHARS = 160
const SMS_UNICODE_MAX = 70

// ============ DEMO DATA ============

const DEMO_CAMPAIGNS: SmsCampaign[] = [
  { id: 'sc1', name: 'Zimska rasprodaja', content: 'POZOVNA ZIMSKA RASPRODAJA! -30% na sve zimske artikle. Ponuda važi do 31.01.2025. Koristite kod: ZIMA30 na sajtu. Odustanak: STOP', category: 'promotional', recipientCount: 2500, sentCount: 2500, deliveredCount: 2380, failedCount: 120, replyCount: 85, status: 'delivered', scheduledDate: '2025-01-15', sentDate: '2025-01-15', costPerSms: 3.5, totalCost: 8750, senderId: 'REFLECTION', tags: ['zima', 'akcija'], createdAt: '2025-01-10T10:00:00Z', updatedAt: '2025-01-15T10:30:00Z' },
  { id: 'sc2', name: 'Podsetnik plaćanja', content: 'Postovani, podsecamo vas da faktura br. {faktura} dospeva {datum}. Iznos: {iznos} RSD. Placanje: racun {racun}. Hvala!', category: 'transactional', recipientCount: 45, sentCount: 45, deliveredCount: 44, failedCount: 1, replyCount: 3, status: 'delivered', scheduledDate: '2025-01-20', sentDate: '2025-01-20', costPerSms: 3.5, totalCost: 157.5, senderId: 'REFLECTION', tags: ['faktura'], createdAt: '2025-01-18T10:00:00Z', updatedAt: '2025-01-20T09:00:00Z' },
  { id: 'sc3', name: 'Novi proizvodi', content: 'Novi asortiman je stigao! Pogledajte najnovije proizvode na sajtu. Besplatna dostava za porudzbine pre 5000 RSD. Sajt: www.shop.example.rs', category: 'marketing', recipientCount: 1200, sentCount: 1200, deliveredCount: 1150, failedCount: 50, replyCount: 42, status: 'delivered', scheduledDate: '2025-01-22', sentDate: '2025-01-22', costPerSms: 3.5, totalCost: 4200, senderId: 'REFLECTION', tags: ['novosti'], createdAt: '2025-01-21T10:00:00Z', updatedAt: '2025-01-22T11:00:00Z' },
  { id: 'sc4', name: 'Valentinska ponuda', content: 'VALENTINSKA PONUDA -20% za sve parove! Poklonite vašoj voljenoj nešto posebno. Ponuda važi do 14.02.2025. KOD: LJOV2025', category: 'promotional', recipientCount: 3000, sentCount: 0, deliveredCount: 0, failedCount: 0, replyCount: 0, status: 'scheduled', scheduledDate: '2025-02-10', sentDate: null, costPerSms: 3.5, totalCost: 0, senderId: 'REFLECTION', tags: ['ljubav', 'akcija'], createdAt: '2025-01-25T10:00:00Z', updatedAt: '2025-01-25T10:00:00Z' },
  { id: 'sc5', name: 'OTP verifikacija', content: 'Vas verifikacioni kod je: {kod}. Vazi 5 minuta. Ne delite ga.', category: 'otp', recipientCount: 1, sentCount: 1, deliveredCount: 1, failedCount: 0, replyCount: 0, status: 'delivered', scheduledDate: null, sentDate: null, costPerSms: 3.5, totalCost: 3.5, senderId: 'OTP', tags: ['sigurnost'], createdAt: '2025-01-28T10:00:00Z', updatedAt: '2025-01-28T10:00:00Z' },
]

const DEMO_TEMPLATES: SmsTemplate[] = [
  { id: 'st1', name: 'Dobrodošlica', category: 'marketing', body: 'Dobrodosli u Reflection! Vas nalog je kreiran. Posetite nas na www.shop.example.rs', variables: [], isDefault: false, usedCount: 456, createdAt: '2024-01-01' },
  { id: 'st2', name: 'Potvrda narudžbe', category: 'transactional', body: 'Vasa narudzba {broj} je zaprimljena! Iznos: {iznos} RSD. Stice za {dostava} radnih dana.', variables: ['broj', 'iznos', 'dostava'], isDefault: true, usedCount: 1230, createdAt: '2024-01-15' },
  { id: 'st3', name: 'Status isporuke', category: 'notification', body: 'Vasa posiljka {broj} je {status}. Pratite na: {link}', variables: ['broj', 'status', 'link'], isDefault: true, usedCount: 890, createdAt: '2024-02-01' },
  { id: 'st4', name: 'Podsetnik plaćanja', category: 'reminder', body: 'Podsecamo vas da faktura br. {faktura} dospeva {datum}. Iznos: {iznos} RSD.', variables: ['faktura', 'datum', 'iznos'], isDefault: true, usedCount: 567, createdAt: '2024-03-01' },
  { id: 'st5', name: 'OTP', category: 'otp', body: 'Vas kod je: {kod}. Vazi {vreme} minuta.', variables: ['kod', 'vreme'], isDefault: true, usedCount: 3450, createdAt: '2024-04-01' },
  { id: 'st6', name: 'Anketa zadovoljstva', category: 'marketing', body: 'Kako ste zadovoljni nasom uslugom? Ocenite 1-5 na: {link}', variables: ['link'], isDefault: false, usedCount: 234, createdAt: '2024-05-01' },
]

const DEMO_CONTACTS: SmsContact[] = [
  { id: 'sc1', name: 'Jovan Petrovic', phone: '+381631234567', groups: ['VIP'], status: 'active', totalReceived: 12, totalSent: 8, lastActivity: '2025-01-28T10:00:00Z', createdAt: '2024-01-15' },
  { id: 'sc2', name: 'Ana Stankovic', phone: '+381647890123', groups: ['Newsletter'], status: 'active', totalReceived: 5, totalSent: 15, lastActivity: '2025-01-25T14:00:00Z', createdAt: '2024-02-20' },
  { id: 'sc3', name: 'Marko Nikolic', phone: '+381651112233', groups: ['Lead-ovi'], status: 'active', totalReceived: 3, totalSent: 4, lastActivity: '2025-01-20T09:00:00Z', createdAt: '2024-06-10' },
  { id: 'sc4', name: 'Milica Jovanovic', phone: '+381605554444', groups: ['Svi klijenti', 'VIP'], status: 'active', totalReceived: 20, totalSent: 25, lastActivity: '2025-01-28T16:00:00Z', createdAt: '2024-01-01' },
  { id: 'sc5', name: 'Nikola Dordevic', phone: '+381623334444', groups: ['Svi klijenti'], status: 'inactive', totalReceived: 2, totalSent: 3, lastActivity: '2024-11-15T10:00:00Z', createdAt: '2024-03-05' },
  { id: 'sc6', name: 'Jelena Milic', phone: '+381649998887', groups: ['Neaktivni'], status: 'unsubscribed', totalReceived: 0, totalSent: 5, lastActivity: '2024-10-01T10:00:00Z', createdAt: '2024-04-10' },
]

const DEMO_LOGS: SmsLog[] = [
  { id: 'l1', phone: '+381631234567', contactName: 'Jovan Petrovic', direction: 'outbound', content: 'ZIMSKA RASPRODAJA! -30% na sve zimske artikle. KOD: ZIMA30', status: 'delivered', campaignId: 'sc1', cost: 3.5, createdAt: '2025-01-15T10:05:00Z' },
  { id: 'l2', phone: '+381647890123', contactName: 'Ana Stankovic', direction: 'outbound', content: 'ZIMSKA RASPRODAJA! -30% na sve zimske artikle. KOD: ZIMA30', status: 'delivered', campaignId: 'sc1', cost: 3.5, createdAt: '2025-01-15T10:05:01Z' },
  { id: 'l3', phone: '+381651112233', contactName: 'Marko Nikolic', direction: 'inbound', content: 'DA', status: 'received', campaignId: null, cost: 0, createdAt: '2025-01-15T10:10:00Z' },
  { id: 'l4', phone: '+381605554444', contactName: 'Milica Jovanovic', direction: 'outbound', content: 'Novi asortiman je stigao! Pogledajte najnovije proizvode.', status: 'delivered', campaignId: 'sc3', cost: 3.5, createdAt: '2025-01-22T11:00:00Z' },
  { id: 'l5', phone: '+381623334444', contactName: 'Nikola Dordevic', direction: 'outbound', content: 'Novi asortiman je stigao!', status: 'failed', campaignId: 'sc3', cost: 0, createdAt: '2025-01-22T11:00:01Z' },
  { id: 'l6', phone: '+381649998887', contactName: 'Jelena Milic', direction: 'inbound', content: 'STOP', status: 'received', campaignId: null, cost: 0, createdAt: '2024-10-01T10:00:00Z' },
]

const DEMO_KEYWORDS: SmsKeyword[] = [
  { id: 'k1', keyword: 'INFO', response: 'Reflection Business - www.shop.example.rs\nTel: +381 11 123 4567\nRadno vreme: Pon-Pet 9-17h', autoReply: true, forwardTo: null, matchCount: 234, enabled: true, createdAt: '2024-01-01' },
  { id: 'k2', keyword: 'STOP', response: 'Odjavili ste se sa primanja SMS poruka. Za ponovnu prijavu posaljite START.', autoReply: true, forwardTo: null, matchCount: 45, enabled: true, createdAt: '2024-01-01' },
  { id: 'k3', keyword: 'START', response: 'Dobrodosli nazad! Od sada cete ponovo primalati nase SMS poruke.', autoReply: true, forwardTo: null, matchCount: 12, enabled: true, createdAt: '2024-01-01' },
  { id: 'k4', keyword: 'CENE', response: 'Nase cene su dostupne na www.shop.example.rs/cenovnik ili nas pozovite na +381 11 123 4567', autoReply: true, forwardTo: null, matchCount: 89, enabled: true, createdAt: '2024-02-15' },
  { id: 'k5', keyword: 'DA', response: '', autoReply: false, forwardTo: 'marketing@example.rs', matchCount: 156, enabled: true, createdAt: '2024-03-01' },
  { id: 'k6', keyword: 'NE', response: '', autoReply: false, forwardTo: null, matchCount: 34, enabled: false, createdAt: '2024-03-01' },
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

export function SmsMarketing() {
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

  // Sub-tabs
  const [campaignsSubTab, setCampaignsSubTab] = useState<'pregled' | 'dodaj' | 'uredi'>('pregled')
  const [templatesSubTab, setTemplatesSubTab] = useState<'pregled' | 'dodaj'>('pregled')
  const [contactsSubTab, setContactsSubTab] = useState<'pregled' | 'dodaj'>('pregled')
  const [keywordsSubTab, setKeywordsSubTab] = useState<'pregled' | 'dodaj'>('pregled')
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
    setCampaignsSubTab('pregled')
    setCampaignForm({ name: '', content: '', category: 'marketing', scheduledDate: '', senderId: 'REFLECTION' })
    showToast('Kampanja kreirana')
  }

  const handleCreateTemplate = () => {
    if (!templateForm.name.trim() || !templateForm.body.trim()) { showToast('Naziv i sadržaj su obavezni'); return }
    const vars = (templateForm.body.match(/\{(\w+)\}/g) || []).map(v => v.replace(/[{}]/g, ''))
    const tpl: SmsTemplate = { id: `st-${Date.now()}`, name: templateForm.name, category: templateForm.category, body: templateForm.body, variables: vars, isDefault: false, usedCount: 0, createdAt: new Date().toISOString().split('T')[0] }
    setTemplates(prev => [...prev, tpl])
    setTemplatesSubTab('pregled')
    showToast('Template kreiran')
  }

  const handleCreateContact = () => {
    if (!contactForm.name.trim() || !contactForm.phone.trim()) { showToast('Naziv i telefon su obavezni'); return }
    const contact: SmsContact = { id: `sc-${Date.now()}`, name: contactForm.name, phone: contactForm.phone, groups: [contactForm.groups], status: 'active', totalReceived: 0, totalSent: 0, lastActivity: null, createdAt: new Date().toISOString().split('T')[0] }
    setContacts(prev => [...prev, contact])
    setContactsSubTab('pregled')
    setContactForm({ name: '', phone: '', groups: 'Svi klijenti' })
    showToast('Kontakt dodat')
  }

  const handleCreateKeyword = () => {
    if (!keywordForm.keyword.trim()) { showToast('Ključna reč je obavezna'); return }
    const kw: SmsKeyword = { id: `k-${Date.now()}`, keyword: keywordForm.keyword.toUpperCase(), response: keywordForm.response, autoReply: keywordForm.autoReply, forwardTo: keywordForm.forwardTo || null, matchCount: 0, enabled: true, createdAt: new Date().toISOString().split('T')[0] }
    setKeywords(prev => [...prev, kw])
    setKeywordsSubTab('pregled')
    setKeywordForm({ keyword: '', response: '', autoReply: true, forwardTo: '' })
    showToast('Ključna reč kreirana')
  }

  const handleToggleKeyword = (id: string) => {
    setKeywords(prev => prev.map(k => k.id === id ? { ...k, enabled: !k.enabled } : k))
    showToast('Ključna reč ažurirana')
  }

  // ============ RENDER ============

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-right">
          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"><AlertDescription>{toastMsg}</AlertDescription></Alert>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Megaphone className="h-6 w-6 text-primary" /> SMS Marketing</h1>
          <p className="text-sm text-muted-foreground">Kampanje, template-i i transakcione SMS poruke</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={() => { setActiveTab('campaigns'); setCampaignsSubTab('dodaj') }}><Plus className="h-4 w-4 mr-1" /> Nova kampanja</Button>
          <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview"><BarChart3 className="h-3.5 w-3.5 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="campaigns"><Megaphone className="h-3.5 w-3.5 mr-1" /> Kampanje</TabsTrigger>
          <TabsTrigger value="templates"><FileText className="h-3.5 w-3.5 mr-1" /> Template-i</TabsTrigger>
          <TabsTrigger value="contacts"><Users className="h-3.5 w-3.5 mr-1" /> Kontakti</TabsTrigger>
          <TabsTrigger value="logs"><MessageSquare className="h-3.5 w-3.5 mr-1" /> Log</TabsTrigger>
          <TabsTrigger value="keywords"><Hash className="h-3.5 w-3.5 mr-1" /> Ključne reči</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="h-3.5 w-3.5 mr-1" /> Podešavanja</TabsTrigger>
        </TabsList>

        {/* ===== OVERVIEW ===== */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard label="Kampanje" value={stats.totalCampaigns} icon={Megaphone} sub={`${campaigns.filter(c => c.status === 'sent' || c.status === 'delivered').length} završenih`} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-900/20" />
            <KpiCard label="Poslato SMS" value={stats.totalSent} icon={Send} sub={`Dostava: ${stats.deliveryRate}%`} color="text-green-500" bg="bg-green-50 dark:bg-green-900/20" />
            <KpiCard label="Odgovori" value={stats.totalReplies} icon={MessageSquare} sub={`${stats.totalFailed} neuspelih`} color="text-amber-500" bg="bg-amber-50 dark:bg-amber-900/20" />
            <KpiCard label="Ukupan trošak" value={formatRSD(stats.totalCost)} icon={DollarSign} sub={`~${stats.totalSent * 3.5} RSD`} color="text-purple-500" bg="bg-purple-50 dark:bg-purple-900/20" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Po kategorijama</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.byCategory).sort(([, a], [, b]) => b - a).map(([cat, count]) => {
                    const max = Math.max(...Object.values(stats.byCategory), 1)
                    return (
                      <div key={cat} className="flex items-center gap-3">
                        <span className="text-xs w-28 truncate capitalize">{cat}</span>
                        <div className="flex-1 bg-muted rounded-full h-3"><div className="bg-primary h-3 rounded-full" style={{ width: `${(count / max) * 100}%` }} /></div>
                        <span className="text-xs font-mono w-6 text-right">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Po statusima</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                    const count = stats.byStatus[status] || 0
                    if (count === 0) return null
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <Badge variant="outline" className={`text-xs w-24 justify-center ${cfg.color}`}>{cfg.label}</Badge>
                        <div className="flex-1 bg-muted rounded-full h-3"><div className="bg-primary h-3 rounded-full" style={{ width: `${(count / Math.max(stats.totalCampaigns, 1)) * 100}%` }} /></div>
                        <span className="text-xs font-mono w-6 text-right">{count}</span>
                      </div>
                    )
                  })}
                </div>
                <Separator className="my-3" />
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-muted-foreground">Aktivni kontakti:</span> <span className="font-medium">{stats.activeContacts}</span></div>
                  <div><span className="text-muted-foreground">Odjavljeni:</span> <span className="font-medium text-red-500">{stats.unsubscribed}</span></div>
                  <div><span className="text-muted-foreground">Aktivnih ključnih reči:</span> <span className="font-medium">{keywords.filter(k => k.enabled).length}</span></div>
                  <div><span className="text-muted-foreground">Template-a:</span> <span className="font-medium">{templates.length}</span></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Poslednje kampanje</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {campaigns.slice(0, 5).map(c => (
                    <div key={c.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer" onClick={() => { setSelectedCampaign(c); setActiveTab('campaigns'); setCampaignsSubTab('uredi') }}>
                      <div className="flex-1 min-w-0"><p className="text-xs font-medium truncate">{c.name}</p><p className="text-xs text-muted-foreground">{c.recipientCount} primalaca</p></div>
                      <Badge variant="outline" className={`text-xs ${STATUS_CONFIG[c.status]?.color}`}>{STATUS_CONFIG[c.status]?.label}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Dnevna aktivnost</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-end gap-1 h-24">
                  {Array.from({ length: 30 }, (_, i) => {
                    const count = Math.floor(Math.random() * 200) + (i > 20 ? Math.floor(Math.random() * 300) : 0)
                    const maxH = 500
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div className="w-full rounded-t-sm bg-primary/30 hover:bg-primary/50 transition-colors" style={{ height: `${(count / maxH) * 100}%`, minHeight: '2px' }} />
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-between mt-1 text-xs text-muted-foreground"><span>01 Jan</span><span>15 Jan</span><span>30 Jan</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-green-600" /> Usaglašenost</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-900/10"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /><span className="text-xs">STOP opcija</span></div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-900/10"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /><span className="text-xs">Odjava kontakata</span></div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-900/10"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /><span className="text-xs">Evidencija 1g</span></div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/10"><AlertCircle className="h-4 w-4 text-amber-500 shrink-0" /><span className="text-xs">DPA ugovor</span></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Sender ID-ovi</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { id: 'REFLECTION', status: 'active', desc: 'Glavni sender za marketing poruke' },
                    { id: 'OTP', status: 'active', desc: 'Sender za verifikacije i jednokratne šifre' },
                    { id: '+38111123456', status: 'inactive', desc: 'Numerički sender' },
                  ].map(sender => (
                    <div key={sender.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center"><Smartphone className="h-4 w-4 text-muted-foreground" /></div>
                        <div><p className="text-xs font-medium font-mono">{sender.id}</p><p className="text-xs text-muted-foreground">{sender.desc}</p></div>
                      </div>
                      <Badge variant="outline" className={`text-xs ${sender.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{sender.status === 'active' ? 'Aktivan' : 'Neaktivan'}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">SMS provajderi</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { name: 'Infobip', price: '3.2 RSD', coverage: 'Srbija, BiH, CG, MK', connected: true },
                    { name: 'Twilio', price: '4.5 RSD', coverage: 'Global', connected: false },
                    { name: 'Vonage', price: '4.0 RSD', coverage: 'Global', connected: false },
                  ].map(p => (
                    <div key={p.name} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium">{p.name}</p>
                        <Badge variant={p.connected ? 'default' : 'secondary'} className="text-xs">{p.connected ? 'Povezan' : 'Nije povezan'}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{p.price}/SMS</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">SMS servisi i mogućnosti</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium text-xs">Bulk slanje</p><p className="text-xs text-muted-foreground">Pošaljite SMS do hiljadu primalaca odjednom</p></div></div>
                  <div className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium text-xs">Personalizovane poruke</p><p className="text-xs text-muted-foreground">Koristite promenljive za dinamički sadržaj</p></div></div>
                  <div className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium text-xs">Zakazano slanje</p><p className="text-xs text-muted-foreground">Planirajte slanje za optimalno vreme</p></div></div>
                  <div className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium text-xs">Auto odgovori na ključne reči</p><p className="text-xs text-muted-foreground">INFO, STOP, START i druge ključne reči</p></div></div>
                  <div className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium text-xs">Izveštaji i analitika</p><p className="text-xs text-muted-foreground">Praćenje isporuke, odgovora i troškova</p></div></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== CAMPAIGNS ===== */}
        <TabsContent value="campaigns" className="space-y-4">
          <Tabs value={campaignsSubTab} onValueChange={(v) => setCampaignsSubTab(v as 'pregled' | 'dodaj' | 'uredi')}>
            <TabsList className="mb-4">
              <TabsTrigger value="pregled">Pregled</TabsTrigger>
              <TabsTrigger value="dodaj"><Plus className="h-3 w-3 mr-1" /> Dodaj</TabsTrigger>
              {selectedCampaign && <TabsTrigger value="uredi"><Eye className="h-3 w-3 mr-1" /> Detalji</TabsTrigger>}
            </TabsList>

            {/* Campaigns Pregled */}
            <TabsContent value="pregled" className="space-y-4">
          <Card className="p-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži kampanje..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
              <Select value={filterStatus} onValueChange={setFilterStatus}><SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Svi statusi</SelectItem>{Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}><SelectTrigger className="w-[140px]"><SelectValue placeholder="Kategorija" /></SelectTrigger><SelectContent><SelectItem value="all">Sve kategorije</SelectItem>{TEMPLATE_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent></Select>
            </div>
          </Card>

          <p className="text-sm text-muted-foreground">{filteredCampaigns.length} kampanja · Ukupno {filteredCampaigns.reduce((s, c) => s + c.recipientCount, 0)} primalaca</p>

          {/* Campaign Analytics Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Dostava" value={`${stats.deliveryRate}%`} icon={CheckCircle2} sub={`${stats.totalDelivered}/${stats.totalSent} isporučeno`} color="text-green-500" bg="bg-green-50 dark:bg-green-900/20" />
            <KpiCard label="Neuspele" value={stats.totalFailed} icon={AlertCircle} sub={`${stats.totalSent > 0 ? Math.round((stats.totalFailed / stats.totalSent) * 100) : 0}%`} color="text-red-500" bg="bg-red-50 dark:bg-red-900/20" />
            <KpiCard label="Odgovori" value={stats.totalReplies} icon={MessageSquare} sub={`${stats.totalSent > 0 ? Math.round((stats.totalReplies / stats.totalSent) * 100) : 0}% odgovora`} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-900/20" />
            <KpiCard label="Trošak" value={formatRSD(stats.totalCost)} icon={DollarSign} sub={`Prosek: ${stats.totalSent > 0 ? formatRSD(stats.totalCost / stats.totalSent) : '0'} po SMS`} color="text-purple-500" bg="bg-purple-50 dark:bg-purple-900/20" />
          </div>

          {/* Delivery overview */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Pregled isporuke kampanja</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {campaigns.filter(c => c.status === 'delivered' || c.status === 'sent').map(c => {
                  const deliveryPct = c.recipientCount > 0 ? Math.round((c.deliveredCount / c.recipientCount) * 100) : 0
                  const replyPct = c.sentCount > 0 ? Math.round((c.replyCount / c.sentCount) * 100) : 0
                  return (
                    <div key={c.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/30">
                      <span className="text-xs w-32 truncate font-medium">{c.name}</span>
                      <div className="flex-1 flex gap-1">
                        <div className="flex-1 bg-green-100 dark:bg-green-900/20 rounded-full h-3" style={{ width: `${deliveryPct}%` }}>
                          <div className="bg-green-500 h-3 rounded-full" style={{ width: '100%' }} />
                        </div>
                        <div className="flex-1 bg-blue-100 dark:bg-blue-900/20 rounded-full h-3" style={{ width: `${replyPct}%` }}>
                          <div className="bg-blue-500 h-3 rounded-full" style={{ width: '100%' }} />
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground w-20 text-right">{deliveryPct}% · {replyPct}%</span>
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-green-500" />Isporučeno</div>
                <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-blue-500" />Odgovori</div>
              </div>
            </CardContent>
          </Card>

          {filteredCampaigns.length === 0 ? (
            <Card className="p-8 text-center"><Megaphone className="h-12 w-12 mx-auto mb-3 text-muted-foreground" /><p className="text-muted-foreground">Nema SMS kampanja</p><Button className="mt-3" onClick={() => setCampaignsSubTab('dodaj')}><Plus className="h-4 w-4 mr-1" /> Kreiraj kampanju</Button></Card>
          ) : (
            <>
              {/* Drafts */}
              {campaigns.filter(c => c.status === 'draft').length > 0 && (
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Nacrti ({campaigns.filter(c => c.status === 'draft').length})</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {campaigns.filter(c => c.status === 'draft').map(c => (
                        <div key={c.id} className="flex items-center justify-between p-3 border border-dashed rounded-lg">
                          <div><p className="text-xs font-medium">{c.name}</p><p className="text-xs text-muted-foreground">{c.content.length} znakova</p></div>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" className="text-xs" onClick={() => { setSelectedCampaign(c); setCampaignsSubTab('uredi') }}><Eye className="h-3.5 w-3.5 mr-1" /> Pregled</Button>
                            <Button size="sm" className="text-xs"><Send className="h-3.5 w-3.5 mr-1" /> Pošalji</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              {/* Scheduled */}
              {campaigns.filter(c => c.status === 'scheduled').length > 0 && (
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Zakazano ({campaigns.filter(c => c.status === 'scheduled').length})</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {campaigns.filter(c => c.status === 'scheduled').map(c => (
                        <div key={c.id} className="flex items-center justify-between p-3 border border-blue-200 bg-blue-50/50 rounded-lg">
                          <div><p className="text-xs font-medium">{c.name}</p><p className="text-xs text-muted-foreground">📅 {c.scheduledDate ? formatDate(c.scheduledDate) : '-'} · {c.recipientCount} primalaca</p></div>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" className="text-xs" onClick={() => { setSelectedCampaign(c); setCampaignsSubTab('uredi') }}><Eye className="h-3.5 w-3.5 mr-1" /> Pregled</Button>
                            <Button variant="outline" size="sm" className="text-xs text-red-600"><X className="h-3.5 w-3.5 mr-1" /> Otkaži</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              {/* Sent */}
              <div className="space-y-3">
              {filteredCampaigns.map(c => (
                <Card key={c.id} className="hover:bg-muted/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium">{c.name}</p>
                          <Badge variant="outline" className={`text-xs ${STATUS_CONFIG[c.status]?.color}`}>{STATUS_CONFIG[c.status]?.label}</Badge>
                          <Badge variant="secondary" className="text-xs">{c.category}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground bg-muted/30 rounded p-2 line-clamp-2">{c.content}</p>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                          <span>📱 {c.sentCount}/{c.recipientCount} poslato</span>
                          <span>✅ {c.deliveredCount} isporučeno</span>
                          {c.failedCount > 0 && <span className="text-red-500">❌ {c.failedCount} grešaka</span>}
                          <span>💬 {c.replyCount} odgovora</span>
                          <span>💰 {formatRSD(c.totalCost)}</span>
                          <span>📅 {formatDate(c.createdAt)}</span>
                          {c.senderId && <span>📤 {c.senderId}</span>}
                        </div>
                        {c.recipientCount > 0 && <Progress value={(c.deliveredCount / c.recipientCount) * 100} className="mt-2 h-1.5" />}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setSelectedCampaign(c); setCampaignsSubTab('uredi') }}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Copy className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
          )}
            </TabsContent>

            {/* Campaigns Dodaj */}
            <TabsContent value="dodaj" className="space-y-4">
              <Card className="max-w-2xl">
                <CardHeader><CardTitle>Nova SMS kampanja</CardTitle><CardDescription>Kreirajte novu SMS kampanju</CardDescription></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2"><Label className="text-xs">Naziv kampanje *</Label><Input value={campaignForm.name} onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })} placeholder="npr. Zimska rasprodaja" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label className="text-xs">Kategorija</Label><Select value={campaignForm.category} onValueChange={(v) => setCampaignForm({ ...campaignForm, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TEMPLATE_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent></Select></div>
                      <div className="space-y-2"><Label className="text-xs">Datum slanja</Label><Input type="datetime-local" value={campaignForm.scheduledDate} onChange={(e) => setCampaignForm({ ...campaignForm, scheduledDate: e.target.value })} /></div>
                    </div>
                    <div className="space-y-2"><Label className="text-xs">Sender ID</Label><Input value={campaignForm.senderId} onChange={(e) => setCampaignForm({ ...campaignForm, senderId: e.target.value })} maxLength={11} /></div>
                    <div className="space-y-2">
                      <Label className="text-xs">Sadržaj poruke * (max {SMS_MAX_CHARS} znakova)</Label>
                      <Textarea value={campaignForm.content} onChange={(e) => setCampaignForm({ ...campaignForm, content: e.target.value })} rows={3} placeholder="Vaša poruka..." />
                      <div className="flex items-center justify-between text-xs text-muted-foreground"><span>{campaignForm.content.length} znakova</span><span>{Math.ceil(campaignForm.content.length / SMS_MAX_CHARS)} SMS-a · {formatRSD(Math.ceil(campaignForm.content.length / SMS_MAX_CHARS) * 3.5)}</span></div>
                      <Progress value={Math.min(100, (campaignForm.content.length / SMS_MAX_CHARS) * 100)} className="h-1.5" />
                    </div>
                    <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800"><AlertCircle className="h-4 w-4 text-amber-600" /><AlertDescription className="text-amber-700 dark:text-amber-400 text-xs">Podsetite se na STOP opciju za marketinške kampanje.</AlertDescription></Alert>
                    <div className="flex justify-end gap-2 pt-4 border-t mt-4"><Button variant="outline" onClick={() => setCampaignsSubTab('pregled')}>Otkaži</Button><Button onClick={handleCreateCampaign} disabled={!campaignForm.name.trim() || !campaignForm.content.trim()}>Kreiraj kampanju</Button></div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Campaigns Uredi / Detalji */}
            <TabsContent value="uredi" className="space-y-4">
              {selectedCampaign && (
                <Card className="max-w-2xl">
                  <CardHeader><CardTitle>{selectedCampaign.name}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-xs text-muted-foreground">Status</span><br /><Badge variant="outline" className={STATUS_CONFIG[selectedCampaign.status]?.color}>{STATUS_CONFIG[selectedCampaign.status]?.label}</Badge></div>
                        <div><span className="text-xs text-muted-foreground">Kategorija</span><br /><Badge variant="secondary">{selectedCampaign.category}</Badge></div>
                        <div><span className="text-xs text-muted-foreground">Kreirano</span><br /><span className="text-xs">{formatDate(selectedCampaign.createdAt)}</span></div>
                        <div><span className="text-xs text-muted-foreground">Sender ID</span><br /><span className="text-xs">{selectedCampaign.senderId || '-'}</span></div>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="text-center p-2 bg-muted/30 rounded"><p className="text-xs text-muted-foreground">Primalaca</p><p className="text-sm font-bold">{selectedCampaign.recipientCount}</p></div>
                        <div className="text-center p-2 bg-green-50 dark:bg-green-900/10 rounded"><p className="text-xs text-muted-foreground">Isporučeno</p><p className="text-sm font-bold">{selectedCampaign.deliveredCount}</p></div>
                        <div className="text-center p-2 bg-red-50 dark:bg-red-900/10 rounded"><p className="text-xs text-muted-foreground">Greške</p><p className="text-sm font-bold text-red-600">{selectedCampaign.failedCount}</p></div>
                        <div className="text-center p-2 bg-amber-50 dark:bg-amber-900/10 rounded"><p className="text-xs text-muted-foreground">Odgovori</p><p className="text-sm font-bold">{selectedCampaign.replyCount}</p></div>
                      </div>
                      <Progress value={selectedCampaign.recipientCount > 0 ? (selectedCampaign.deliveredCount / selectedCampaign.recipientCount) * 100 : 0} className="h-2" />
                      <p className="text-xs text-muted-foreground text-center">Dostava: {selectedCampaign.recipientCount > 0 ? Math.round((selectedCampaign.deliveredCount / selectedCampaign.recipientCount) * 100) : 0}%</p>
                      <Separator />
                      <div><span className="text-xs text-muted-foreground">Sadržaj poruke</span><p className="text-sm mt-1 p-3 bg-muted/30 rounded">{selectedCampaign.content}</p></div>
                      <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Trošak</span><span className="font-medium">{formatRSD(selectedCampaign.totalCost)}</span></div>
                      <div className="flex justify-end gap-2 pt-4 border-t mt-4"><Button variant="outline" onClick={() => setCampaignsSubTab('pregled')}>Nazad</Button></div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ===== TEMPLATES ===== */}
        <TabsContent value="templates" className="space-y-4">
          <Tabs value={templatesSubTab} onValueChange={(v) => setTemplatesSubTab(v as 'pregled' | 'dodaj')}>
            <TabsList className="mb-4">
              <TabsTrigger value="pregled">Pregled</TabsTrigger>
              <TabsTrigger value="dodaj"><Plus className="h-3 w-3 mr-1" /> Dodaj</TabsTrigger>
            </TabsList>

            {/* Templates Pregled */}
            <TabsContent value="pregled" className="space-y-4">
          <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{templates.length} template-a · {templates.filter(t => t.isDefault).length} podrazumevanih · Ukupno {templates.reduce((s, t) => s + t.usedCount, 0)} korišćenja</p><Button size="sm" onClick={() => setTemplatesSubTab('dodaj')}><Plus className="h-4 w-4 mr-1" /> Novi template</Button></div>

          {/* Template stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Template-a" value={templates.length} icon={FileText} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-900/20" />
            <KpiCard label="Podrazumevani" value={templates.filter(t => t.isDefault).length} icon={Star} color="text-amber-500" bg="bg-amber-50 dark:bg-amber-900/20" />
            <KpiCard label="Ukupno korišćeno" value={templates.reduce((s, t) => s + t.usedCount, 0)} icon={TrendingUp} color="text-green-500" bg="bg-green-50 dark:bg-green-900/20" />
            <KpiCard label="Kategorije" value={new Set(templates.map(t => t.category)).size} icon={LayoutGrid} color="text-purple-500" bg="bg-purple-50 dark:bg-purple-900/20" />
          </div>

          {/* Template usage */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Upotreba template-a</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {templates.sort((a, b) => b.usedCount - a.usedCount).map(tpl => {
                  const maxTpl = Math.max(...templates.map(t => t.usedCount), 1)
                  return (
                    <div key={tpl.id} className="flex items-center gap-3">
                      <span className="text-xs w-28 truncate">{tpl.name}</span>
                      <div className="flex-1 bg-muted rounded-full h-2.5"><div className={`h-2.5 rounded-full ${tpl.isDefault ? 'bg-amber-400' : 'bg-primary'}`} style={{ width: `${(tpl.usedCount / maxTpl) * 100}%` }} /></div>
                      <span className="text-xs font-mono w-12 text-right">{tpl.usedCount}x</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
          <div className="space-y-3">
            {templates.map(tpl => (
              <Card key={tpl.id} className="hover:bg-muted/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium">{tpl.name}</p>
                        <Badge variant="secondary" className="text-xs">{tpl.category}</Badge>
                        {tpl.isDefault && <Badge variant="outline" className="text-xs text-amber-600">Podrazumevani</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground bg-muted/30 rounded p-2">{tpl.body}</p>
                      {tpl.variables.length > 0 && <div className="flex gap-1 mt-2">{tpl.variables.map(v => <Badge key={v} variant="secondary" className="text-xs">{v}</Badge>)}</div>}
                      <p className="text-xs text-muted-foreground mt-1">Korišćen {tpl.usedCount}x · {tpl.body.length}/{SMS_MAX_CHARS} znakova</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setTemplateForm({ name: tpl.name, category: tpl.category, body: tpl.body }); setTemplatesSubTab('dodaj') }}><Edit3 className="h-3.5 w-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
            </TabsContent>

            {/* Templates Dodaj */}
            <TabsContent value="dodaj" className="space-y-4">
              <Card className="max-w-2xl">
                <CardHeader><CardTitle>Novi SMS template</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label className="text-xs">Naziv *</Label><Input value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} /></div>
                      <div className="space-y-2"><Label className="text-xs">Kategorija</Label><Select value={templateForm.category} onValueChange={(v) => setTemplateForm({ ...templateForm, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TEMPLATE_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent></Select></div>
                    </div>
                    <div className="space-y-2"><Label className="text-xs">Sadržaj * (koristite {'{ime}'}, {'{broj}'} za promenljive)</Label><Textarea value={templateForm.body} onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })} rows={3} /><p className="text-xs text-muted-foreground">{templateForm.body.length}/{SMS_MAX_CHARS} znakova · {(templateForm.body.match(/\{(\w+)\}/g) || []).length} promenljivih</p></div>
                    <div className="flex justify-end gap-2 pt-4 border-t mt-4"><Button variant="outline" onClick={() => setTemplatesSubTab('pregled')}>Otkaži</Button><Button onClick={handleCreateTemplate}>Kreiraj template</Button></div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ===== CONTACTS ===== */}
        <TabsContent value="contacts" className="space-y-4">
          <Tabs value={contactsSubTab} onValueChange={(v) => setContactsSubTab(v as 'pregled' | 'dodaj')}>
            <TabsList className="mb-4">
              <TabsTrigger value="pregled">Pregled</TabsTrigger>
              <TabsTrigger value="dodaj"><Plus className="h-3 w-3 mr-1" /> Dodaj</TabsTrigger>
            </TabsList>

            {/* Contacts Pregled */}
            <TabsContent value="pregled" className="space-y-4">
          <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{contacts.length} kontakata · {stats.activeContacts} aktivnih · {stats.unsubscribed} odjavljenih</p><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => showToast('Uvoz kontakata - CSV format podržan')}><Upload className="h-4 w-4 mr-1" /> Uvoz</Button><Button variant="outline" size="sm" onClick={() => showToast('Izvoz kontakata - CSV skinut')}><Download className="h-4 w-4 mr-1" /> Izvoz</Button><Button size="sm" onClick={() => setContactsSubTab('dodaj')}><Plus className="h-4 w-4 mr-1" /> Novi kontakt</Button></div></div>

          {/* Contact Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-3"><div className="flex items-center gap-2"><div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center"><Users className="h-3.5 w-3.5 text-green-600" /></div><div><p className="text-lg font-bold">{stats.activeContacts}</p><p className="text-xs text-muted-foreground">Aktivnih</p></div></div></Card>
            <Card className="p-3"><div className="flex items-center gap-2"><div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center"><UserPlus className="h-3.5 w-3.5 text-gray-600" /></div><div><p className="text-lg font-bold">{contacts.filter(c => c.status === 'inactive').length}</p><p className="text-xs text-muted-foreground">Neaktivnih</p></div></div></Card>
            <Card className="p-3"><div className="flex items-center gap-2"><div className="h-7 w-7 rounded-full bg-red-100 flex items-center justify-center"><UserPlus className="h-3.5 w-3.5 text-red-600" /></div><div><p className="text-lg font-bold">{stats.unsubscribed}</p><p className="text-xs text-muted-foreground">Odjavljenih</p></div></div></Card>
          </div>

          {/* Contact Groups */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Grupe kontakata</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {CONTACT_GROUPS.map(group => {
                  const count = contacts.filter(c => c.groups.includes(group)).length
                  return (
                    <div key={group} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-muted/30 cursor-pointer">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center"><Users className="h-3 w-3 text-primary" /></div>
                      <div><p className="text-xs font-medium">{group}</p><p className="text-xs text-muted-foreground">{count}</p></div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-muted/50"><tr className="text-left text-xs text-muted-foreground border-b"><th className="p-3">Naziv</th><th className="p-3 hidden md:table-cell">Telefon</th><th className="p-3 hidden lg:table-cell">Grupa</th><th className="p-3">Status</th><th className="p-3 hidden md:table-cell">Poruke</th><th className="p-3 hidden lg:table-cell">Zadnja aktivnost</th></tr></thead>
                <tbody>
                  {contacts.map(c => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-3 text-xs font-medium">{c.name}</td>
                      <td className="p-3 text-xs font-mono hidden md:table-cell">{c.phone}</td>
                      <td className="p-3 hidden lg:table-cell"><div className="flex gap-1">{c.groups.map(g => <Badge key={g} variant="secondary" className="text-xs">{g}</Badge>)}</div></td>
                      <td className="p-3"><Badge variant="outline" className={`text-xs ${CONTACT_STATUS[c.status]?.color}`}>{CONTACT_STATUS[c.status]?.label}</Badge></td>
                      <td className="p-3 text-xs hidden md:table-cell">{c.totalSent}↑ {c.totalReceived}↓</td>
                      <td className="p-3 text-xs text-muted-foreground hidden lg:table-cell">{c.lastActivity ? formatDate(c.lastActivity) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
            </TabsContent>

            {/* Contacts Dodaj */}
            <TabsContent value="dodaj" className="space-y-4">
              <Card className="max-w-md">
                <CardHeader><CardTitle>Novi kontakt</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2"><Label className="text-xs">Naziv *</Label><Input value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} /></div>
                    <div className="space-y-2"><Label className="text-xs">Telefon *</Label><Input value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} placeholder="+3816XXXXXXXX" /></div>
                    <div className="space-y-2"><Label className="text-xs">Grupa</Label><Select value={contactForm.groups} onValueChange={(v) => setContactForm({ ...contactForm, groups: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CONTACT_GROUPS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select></div>
                    <div className="flex justify-end gap-2 pt-4 border-t mt-4"><Button variant="outline" onClick={() => setContactsSubTab('pregled')}>Otkaži</Button><Button onClick={handleCreateContact}>Dodaj kontakt</Button></div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ===== LOG ===== */}
        <TabsContent value="logs" className="space-y-4">
          <Card className="p-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži log..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
              <Select><SelectTrigger className="w-[130px]"><SelectValue placeholder="Smer" /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem><SelectItem value="inbound">Dolazne</SelectItem><SelectItem value="outbound">Odlazne</SelectItem></SelectContent></Select>
              <Select><SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem><SelectItem value="delivered">Isporučeno</SelectItem><SelectItem value="failed">Greška</SelectItem><SelectItem value="received">Primljeno</SelectItem></SelectContent></Select>
            </div>
          </Card>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Ukupno" value={logs.length} icon={MessageSquare} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-900/20" />
            <KpiCard label="Odlazne" value={logs.filter(l => l.direction === 'outbound').length} icon={Send} color="text-green-500" bg="bg-green-50 dark:bg-green-900/20" />
            <KpiCard label="Dolazne" value={logs.filter(l => l.direction === 'inbound').length} icon={MessageSquare} color="text-amber-500" bg="bg-amber-50 dark:bg-amber-900/20" />
            <KpiCard label="Neuspele" value={logs.filter(l => l.status === 'failed').length} icon={AlertCircle} color="text-red-500" bg="bg-red-50 dark:bg-red-900/20" />
          </div>
          <Card>
            <div className="max-h-[500px] overflow-y-auto">
              <div className="space-y-1">
                {logs.map(log => (
                  <div key={log.id} className="flex items-start gap-3 p-3 border-b last:border-0 hover:bg-muted/30">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs ${log.direction === 'inbound' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{log.direction === 'inbound' ? '↓' : '↑'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{log.contactName || log.phone}</span>
                        <span className="text-xs text-muted-foreground">{log.phone}</span>
                      </div>
                      <p className="text-xs mt-0.5">{log.content}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant="outline" className={`text-xs ${log.status === 'delivered' ? 'bg-green-100 text-green-700' : log.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{log.status}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">{formatDate(log.createdAt)}</p>
                      {log.cost > 0 && <p className="text-xs text-muted-foreground">{formatRSD(log.cost)}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* ===== KEYWORDS ===== */}
        <TabsContent value="keywords" className="space-y-4">
          <Tabs value={keywordsSubTab} onValueChange={(v) => setKeywordsSubTab(v as 'pregled' | 'dodaj')}>
            <TabsList className="mb-4">
              <TabsTrigger value="pregled">Pregled</TabsTrigger>
              <TabsTrigger value="dodaj"><Plus className="h-3 w-3 mr-1" /> Dodaj</TabsTrigger>
            </TabsList>

            {/* Keywords Pregled */}
            <TabsContent value="pregled" className="space-y-4">
          <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{keywords.filter(k => k.enabled).length} aktivnih od {keywords.length}</p><Button size="sm" onClick={() => setKeywordsSubTab('dodaj')}><Plus className="h-4 w-4 mr-1" /> Nova ključna reč</Button></div>

          {/* Keyword Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Ukupno pokretanja" value={keywords.reduce((s, k) => s + k.matchCount, 0)} icon={Zap} color="text-purple-500" bg="bg-purple-50 dark:bg-purple-900/20" />
            <KpiCard label="Auto odgovori" value={keywords.filter(k => k.autoReply && k.enabled).length} icon={Bot} color="text-green-500" bg="bg-green-50 dark:bg-green-900/20" />
            <KpiCard label="Prosleđenja" value={keywords.filter(k => k.forwardTo && k.enabled).length} icon={Mail} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-900/20" />
            <KpiCard label="Najpopularnija" value={keywords.sort((a, b) => b.matchCount - a.matchCount)[0]?.keyword || '-'} icon={TrendingUp} color="text-amber-500" bg="bg-amber-50 dark:bg-amber-900/20" />
          </div>

          {/* Keyword distribution */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Distribucija ključnih reči</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {keywords.sort((a, b) => b.matchCount - a.matchCount).map(kw => {
                  const maxKw = Math.max(...keywords.map(k => k.matchCount), 1)
                  return (
                    <div key={kw.id} className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold w-16">{kw.keyword}</span>
                      <div className="flex-1 bg-muted rounded-full h-3"><div className={`h-3 rounded-full ${kw.enabled ? 'bg-primary' : 'bg-gray-400'}`} style={{ width: `${(kw.matchCount / maxKw) * 100}%` }} /></div>
                      <span className="text-xs font-mono w-8 text-right">{kw.matchCount}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
          <div className="space-y-3">
            {keywords.map(kw => (
              <Card key={kw.id} className={kw.enabled ? '' : 'opacity-60'}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold font-mono">{kw.keyword}</p>
                        <Badge variant="secondary" className="text-xs">Pokrenuto {kw.matchCount}x</Badge>
                        {kw.autoReply && <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700">Auto odgovor</Badge>}
                        {kw.forwardTo && <Badge variant="outline" className="text-xs">→ {kw.forwardTo}</Badge>}
                      </div>
                      {kw.response && <p className="text-xs text-muted-foreground bg-muted/30 rounded p-2 whitespace-pre-line">{kw.response}</p>}
                    </div>
                    <Switch checked={kw.enabled} onCheckedChange={() => handleToggleKeyword(kw.id)} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
            </TabsContent>

            {/* Keywords Dodaj */}
            <TabsContent value="dodaj" className="space-y-4">
              <Card className="max-w-md">
                <CardHeader><CardTitle>Nova ključna reč</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2"><Label className="text-xs">Ključna reč *</Label><Input value={keywordForm.keyword} onChange={(e) => setKeywordForm({ ...keywordForm, keyword: e.target.value })} placeholder="npr. INFO" /></div>
                    <div className="space-y-2"><Label className="text-xs">Auto odgovor</Label><div className="flex items-center gap-2"><Switch checked={keywordForm.autoReply} onCheckedChange={(v) => setKeywordForm({ ...keywordForm, autoReply: v })} /><Label className="text-xs">{keywordForm.autoReply ? 'Aktivno' : 'Neaktivno'}</Label></div></div>
                    {keywordForm.autoReply && <div className="space-y-2"><Label className="text-xs">Odgovor</Label><Textarea value={keywordForm.response} onChange={(e) => setKeywordForm({ ...keywordForm, response: e.target.value })} rows={3} /></div>}
                    <div className="space-y-2"><Label className="text-xs">Prosledi na (opcionalno)</Label><Input value={keywordForm.forwardTo} onChange={(e) => setKeywordForm({ ...keywordForm, forwardTo: e.target.value })} placeholder="email@primer.rs" /></div>
                    <div className="flex justify-end gap-2 pt-4 border-t mt-4"><Button variant="outline" onClick={() => setKeywordsSubTab('pregled')}>Otkaži</Button><Button onClick={handleCreateKeyword}>Kreiraj</Button></div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ===== SETTINGS ===== */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">SMS Gateway podešavanja</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="text-xs">Provider</Label><Select defaultValue="infobip"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="infobip">Infobip</SelectItem><SelectItem value="twilio">Twilio</SelectItem><SelectItem value="vonage">Vonage</SelectItem><SelectItem value="mobilink">Mobilink</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label className="text-xs">API Key</Label><Input type="password" defaultValue="sk-sms-xxxxxxxxxxxx" /></div>
                <div className="space-y-2"><Label className="text-xs">Default Sender ID</Label><Input defaultValue="REFLECTION" /></div>
                <div className="space-y-2"><Label className="text-xs">Cena po SMS (RSD)</Label><Input defaultValue="3.50" disabled /></div>
              </div>
              <div className="flex items-center gap-2"><Switch defaultChecked /><Label className="text-xs">Test režim (ne šalje prave poruke)</Label></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Zakonski okvir (Republika Srbija)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-muted/30 rounded-lg text-center"><p className="text-muted-foreground">Max znakova (GSM7)</p><p className="text-lg font-bold">{SMS_MAX_CHARS}</p></div>
                <div className="p-3 bg-muted/30 rounded-lg text-center"><p className="text-muted-foreground">Max znakova (Unicode)</p><p className="text-lg font-bold">{SMS_UNICODE_MAX}</p></div>
                <div className="p-3 bg-muted/30 rounded-lg text-center"><p className="text-muted-foreground">Max primalaca</p><p className="text-lg font-bold">10.000</p></div>
                <div className="p-3 bg-muted/30 rounded-lg text-center"><p className="text-muted-foreground">Brzina</p><p className="text-lg font-bold">100/s</p></div>
              </div>
              <Separator />
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>• Zakon o elektronskim komunikacijama (RS)</p>
                <p>• Svaka marketing poruka mora imati STOP opciju</p>
                <p>• Poštovanje radnog vremena za marketing kampanje (8-21h)</p>
                <p>• Evidencija o slanju i odjavi minimum 1 godina</p>
                <p>• Ne slati na brojeve na NDOS listi</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Webhook podešavanja</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {['message.received', 'message.delivered', 'message.failed', 'contact.unsubscribed', 'keyword.matched'].map(evt => (
                  <div key={evt} className="flex items-center gap-2 p-2 border rounded-lg"><Switch defaultChecked /><Label className="text-xs">{evt}</Label></div>
                ))}
              </div>
              <div className="space-y-2"><Label className="text-xs">Webhook URL</Label><Input defaultValue="https://api.example.rs/sms/webhook" disabled /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Ograničenja i napomene</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3 text-xs text-muted-foreground">
                <div className="flex items-start gap-2"><AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" /><div><p className="font-medium text-foreground">Mesečni limit</p><p className="mt-0.5">Proverite vaš mesečni limit sa provajderom. Prekoračenje limita zaustavlja slanje.</p></div></div>
                <div className="flex items-start gap-2"><AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" /><div><p className="font-medium text-foreground">Dugačke poruke</p><p className="mt-0.5">Poruke duže od {SMS_MAX_CHARS} znakova se dele na više SMS-a i naplaćuju duplo.</p></div></div>
                <div className="flex items-start gap-2"><AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" /><div><p className="font-medium text-foreground">Unicode karakteri</p><p className="mt-0.5">Ćirilična slova koriste Unicode encoding (max {SMS_UNICODE_MAX} znakova po SMS-u).</p></div></div>
                <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium text-foreground">Automatsko ponovno slanje</p><p className="mt-0.5">Neuspele poruke se automatski ponavljaju 3 puta u intervalima od 5 minuta.</p></div></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
