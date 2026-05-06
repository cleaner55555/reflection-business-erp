'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Repeat,
  Clock,
  Calendar,
  Play,
  Pause,
  Plus,
  Trash2,
  Pencil,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDate, formatRSD } from '@/lib/helpers'
import { useTranslation } from '@/lib/i18n'
import { motion, AnimatePresence } from 'framer-motion'

// ==================== INTERFACES ====================

interface Partner {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  sellingPrice: number
}

interface RecurringInvoice {
  id: string
  name: string
  partnerId: string
  frequency: string
  nextDate: string
  lastGenerated: string | null
  startDate: string
  endDate: string | null
  isActive: boolean
  items: string
  notes: string | null
  createdAt: string
  updatedAt: string
  partner: { id: string; name: string }
  _count: { invoices: number }
}

interface LineItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discountPct: number
  taxRate: number
}

// ==================== HELPERS ====================

function getStatus(nextDate: string, isActive: boolean) {
  if (!isActive) return 'paused'
  const now = new Date()
  const next = new Date(nextDate)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const nextDay = new Date(next.getFullYear(), next.getMonth(), next.getDate())
  if (nextDay < today) return 'overdue'
  if (nextDay.getTime() === today.getTime()) return 'dueToday'
  return 'active'
}

function getStatusConfig(status: string, t: (key: string) => string) {
  const configs: Record<string, { label: string; color: string; icon: typeof CheckCircle2; dotClass: string }> = {
    active: { label: t('recurring.active'), color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, dotClass: 'bg-emerald-500' },
    dueToday: { label: t('recurring.dueToday'), color: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertTriangle, dotClass: 'bg-amber-500' },
    overdue: { label: t('recurring.overdue'), color: 'bg-red-50 text-red-700 border-red-200', icon: AlertTriangle, dotClass: 'bg-red-500' },
    paused: { label: t('recurring.paused'), color: 'bg-slate-50 text-slate-500 border-slate-200', icon: Pause, dotClass: 'bg-slate-400' },
  }
  return configs[status] || configs.active
}

function getFrequencyLabel(freq: string, t: (key: string) => string) {
  const labels: Record<string, string> = { weekly: t('recurring.weekly'), monthly: t('recurring.monthly'), quarterly: t('recurring.quarterly'), yearly: t('recurring.yearly') }
  return labels[freq] || freq
}

function getFrequencyIcon(freq: string) {
  switch (freq) { case 'weekly': return '📅'; case 'monthly': return '🗓️'; case 'quarterly': return '📆'; case 'yearly': return '📋'; default: return '🔄' }
}

function getFrequencyBadgeClass(freq: string) {
  switch (freq) { case 'weekly': return 'bg-blue-50 text-blue-700 border-blue-200'; case 'monthly': return 'bg-violet-50 text-violet-700 border-violet-200'; case 'quarterly': return 'bg-orange-50 text-orange-700 border-orange-200'; case 'yearly': return 'bg-teal-50 text-teal-700 border-teal-200'; default: return 'bg-slate-50 text-slate-600 border-slate-200' }
}

function calcItemTotal(item: LineItem) {
  const subtotal = item.quantity * item.unitPrice
  const discount = subtotal * (item.discountPct / 100)
  const base = subtotal - discount
  const tax = base * (item.taxRate / 100)
  return base + tax
}

function daysUntil(dateStr: string): number {
  const now = new Date()
  const target = new Date(dateStr)
  const diff = target.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// ==================== MAIN CONTENT ====================

export function RecurringInvoicesContent() {
  const { t } = useTranslation()
  const [recurringInvoices, setRecurringInvoices] = useState<RecurringInvoice[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<RecurringInvoice | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [generatingId, setGeneratingId] = useState<string | null>(null)

  const [formName, setFormName] = useState('')
  const [formPartnerId, setFormPartnerId] = useState('')
  const [formFrequency, setFormFrequency] = useState('monthly')
  const [formNextDate, setFormNextDate] = useState('')
  const [formStartDate, setFormStartDate] = useState('')
  const [formEndDate, setFormEndDate] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formItems, setFormItems] = useState<LineItem[]>([
    { productId: '', productName: '', quantity: 1, unitPrice: 0, discountPct: 0, taxRate: 20 },
  ])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [recurringRes, partnersRes, productsRes] = await Promise.all([fetch('/api/recurring-invoices'), fetch('/api/partners'), fetch('/api/products')])
      const [recurringData, partnersData, productsData] = await Promise.all([recurringRes.json(), partnersRes.json(), productsRes.json()])
      setRecurringInvoices(recurringData || [])
      setPartners(partnersData || [])
      setProducts(productsData || [])
    } catch { /* ignore */ } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const stats = {
    totalActive: recurringInvoices.filter(r => r.isActive).length,
    dueThisMonth: recurringInvoices.filter(r => { if (!r.isActive) return false; const d = new Date(r.nextDate); const now = new Date(); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() }).length,
    totalAutoGenerated: recurringInvoices.reduce((sum, r) => sum + r._count.invoices, 0),
    overdueCount: recurringInvoices.filter(r => getStatus(r.nextDate, r.isActive) === 'overdue').length,
  }

  const resetForm = () => { setFormName(''); setFormPartnerId(''); setFormFrequency('monthly'); setFormNextDate(''); setFormStartDate(''); setFormEndDate(''); setFormNotes(''); setFormItems([{ productId: '', productName: '', quantity: 1, unitPrice: 0, discountPct: 0, taxRate: 20 }]); setEditing(null) }

  const handleOpenNew = () => { resetForm(); const today = new Date(); const nextMonth = new Date(today); nextMonth.setMonth(nextMonth.getMonth() + 1); setFormStartDate(today.toISOString().split('T')[0]); setFormNextDate(nextMonth.toISOString().split('T')[0]); setDialogOpen(true) }

  const handleOpenEdit = (item: RecurringInvoice) => {
    setEditing(item); setFormName(item.name); setFormPartnerId(item.partnerId); setFormFrequency(item.frequency)
    setFormNextDate(new Date(item.nextDate).toISOString().split('T')[0]); setFormStartDate(new Date(item.startDate).toISOString().split('T')[0])
    setFormEndDate(item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : ''); setFormNotes(item.notes || '')
    try { const parsed = JSON.parse(item.items); if (Array.isArray(parsed)) setFormItems(parsed) } catch { setFormItems([{ productId: '', productName: '', quantity: 1, unitPrice: 0, discountPct: 0, taxRate: 20 }]) }
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formName || !formPartnerId || !formNextDate || !formStartDate) { toast.error(t('common.required')); return }
    setSubmitting(true)
    try {
      const body = { name: formName, partnerId: formPartnerId, frequency: formFrequency, nextDate: formNextDate, startDate: formStartDate, endDate: formEndDate || null, items: formItems.filter(i => i.productName), notes: formNotes || null }
      const url = editing ? `/api/recurring-invoices/${editing.id}` : '/api/recurring-invoices'
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.error')); return }
      toast.success(editing ? t('recurring.updatedSuccess') : t('recurring.createdSuccess'))
      setDialogOpen(false); resetForm(); fetchData()
    } catch { toast.error(t('common.error')) } finally { setSubmitting(false) }
  }

  const handleToggleActive = async (item: RecurringInvoice) => {
    try { const res = await fetch(`/api/recurring-invoices/${item.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !item.isActive }) }); if (!res.ok) throw new Error(); toast.success(item.isActive ? t('recurring.pausedSuccess') : t('recurring.activatedSuccess')); fetchData() } catch { toast.error(t('common.error')) }
  }

  const handleDelete = async (item: RecurringInvoice) => {
    if (!confirm(t('common.deleteConfirm'))) return
    try { const res = await fetch(`/api/recurring-invoices/${item.id}`, { method: 'DELETE' }); if (!res.ok) throw new Error(); toast.success(t('common.deleteSuccess')); fetchData() } catch { toast.error(t('common.error')) }
  }

  const handleGenerateNow = async (id: string) => {
    setGeneratingId(id)
    try { const res = await fetch(`/api/recurring-invoices/${id}/generate`, { method: 'POST' }); if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.error')); return }; const data = await res.json(); toast.success(t('recurring.generateSuccess')); if (data.deactivated) toast.info(t('recurring.deactivatedInfo')); fetchData() } catch { toast.error(t('common.error')) } finally { setGeneratingId(null) }
  }

  const addFormItem = () => { setFormItems([...formItems, { productId: '', productName: '', quantity: 1, unitPrice: 0, discountPct: 0, taxRate: 20 }]) }
  const removeFormItem = (index: number) => { if (formItems.length > 1) setFormItems(formItems.filter((_, i) => i !== index)) }
  const updateFormItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...formItems]; updated[index] = { ...updated[index], [field]: value }
    if (field === 'productId') { const product = products.find(p => p.id === value); if (product) { updated[index].productName = product.name; updated[index].unitPrice = product.sellingPrice } }
    setFormItems(updated)
  }

  const grandTotal = formItems.reduce((sum, item) => sum + calcItemTotal(item), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2"><Repeat className="h-5 w-5 text-primary" />{t('recurring.title')}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{t('recurring.subtitle')}</p>
        </div>
        <Button size="sm" className="gap-2" onClick={handleOpenNew}><Plus className="h-4 w-4" /> {t('recurring.new')}</Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: CheckCircle2, bg: 'bg-emerald-50', color: 'text-emerald-600', value: stats.totalActive, label: t('recurring.statActive') },
          { icon: Clock, bg: 'bg-amber-50', color: 'text-amber-600', value: stats.dueThisMonth, label: t('recurring.statDueMonth') },
          { icon: FileText, bg: 'bg-violet-50', color: 'text-violet-600', value: stats.totalAutoGenerated, label: t('recurring.statTotalGenerated') },
          { icon: AlertTriangle, bg: 'bg-red-50', color: 'text-red-600', value: stats.overdueCount, label: t('recurring.statOverdue') },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4"><div className="flex items-center gap-3"><div className={`h-10 w-10 rounded-lg ${s.bg} flex items-center justify-center`}><s.icon className={`h-5 w-5 ${s.color}`} /></div><div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div></div></Card>
          </motion.div>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}</div>
      ) : recurringInvoices.length === 0 ? (
        <Card className="p-8 text-center"><Repeat className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" /><p className="text-muted-foreground">{t('recurring.noRecurring')}</p><Button variant="outline" size="sm" className="mt-3 gap-2" onClick={handleOpenNew}><Plus className="h-4 w-4" /> {t('recurring.new')}</Button></Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {recurringInvoices.map((item) => {
              const status = getStatus(item.nextDate, item.isActive)
              const statusConfig = getStatusConfig(status, t)
              const StatusIcon = statusConfig.icon
              const days = item.isActive ? daysUntil(item.nextDate) : null
              return (
                <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} layout>
                  <Card className="overflow-hidden border-l-4 transition-shadow hover:shadow-md" style={{ borderLeftColor: status === 'overdue' ? '#ef4444' : status === 'dueToday' ? '#f59e0b' : status === 'active' ? '#10b981' : '#94a3b8' }}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex-1 min-w-0"><h3 className="font-semibold text-sm truncate">{item.name}</h3><p className="text-xs text-muted-foreground mt-0.5 truncate">{item.partner?.name}</p></div>
                        <Badge variant="outline" className={`text-[10px] px-2 py-0 shrink-0 ${statusConfig.color}`}><StatusIcon className="h-3 w-3 mr-1" />{statusConfig.label}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge variant="outline" className={`text-[10px] px-2 py-0 ${getFrequencyBadgeClass(item.frequency)}`}>{getFrequencyIcon(item.frequency)} {getFrequencyLabel(item.frequency, t)}</Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" /><span>{formatDate(item.nextDate)}</span></div>
                        {days !== null && days >= 0 && days <= 30 && <span className="text-[10px] text-muted-foreground">({days === 0 ? t('recurring.today') : `${days}d`})</span>}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3"><span>{t('recurring.lastGenerated')}: {item.lastGenerated ? formatDate(item.lastGenerated) : '—'}</span><span>{t('recurring.invoicesCount')}: {item._count.invoices}</span></div>
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <div className="flex items-center gap-2 mr-auto"><Label htmlFor={`toggle-${item.id}`} className="sr-only">{item.isActive ? t('recurring.pause') : t('recurring.resume')}</Label><Switch id={`toggle-${item.id}`} checked={item.isActive} onCheckedChange={() => handleToggleActive(item)} /></div>
                        {item.isActive && <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => handleGenerateNow(item.id)} disabled={generatingId === item.id}>{generatingId === item.id ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><Zap className="h-3 w-3" /></motion.div> : <Play className="h-3 w-3" />}{t('recurring.generateNow')}</Button>}
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleOpenEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(item)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setDialogOpen(false); resetForm() } else { setDialogOpen(true) } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Repeat className="h-5 w-5" />{editing ? t('recurring.editTitle') : t('recurring.createTitle')}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2"><Label className="text-xs">{t('recurring.nameLabel')} *</Label><Input placeholder={t('recurring.namePlaceholder')} value={formName} onChange={(e) => setFormName(e.target.value)} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-xs">{t('common.partner')} *</Label><Select value={formPartnerId} onValueChange={setFormPartnerId}><SelectTrigger><SelectValue placeholder={t('recurring.selectPartner')} /></SelectTrigger><SelectContent>{partners.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label className="text-xs">{t('recurring.frequency')} *</Label><Select value={formFrequency} onValueChange={(val) => { setFormFrequency(val); if (formStartDate && !editing) { const start = new Date(formStartDate); const next = new Date(start); switch (val) { case 'weekly': next.setDate(next.getDate() + 7); break; case 'monthly': next.setMonth(next.getMonth() + 1); break; case 'quarterly': next.setMonth(next.getMonth() + 3); break; case 'yearly': next.setFullYear(next.getFullYear() + 1); break } setFormNextDate(next.toISOString().split('T')[0]) } }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="weekly"><span className="flex items-center gap-2">📅 {t('recurring.weekly')}</span></SelectItem><SelectItem value="monthly"><span className="flex items-center gap-2">🗓️ {t('recurring.monthly')}</span></SelectItem><SelectItem value="quarterly"><span className="flex items-center gap-2">📆 {t('recurring.quarterly')}</span></SelectItem><SelectItem value="yearly"><span className="flex items-center gap-2">📋 {t('recurring.yearly')}</span></SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2"><Label className="text-xs">{t('recurring.startDate')} *</Label><Input type="date" value={formStartDate} onChange={(e) => setFormStartDate(e.target.value)} /></div>
              <div className="space-y-2"><Label className="text-xs">{t('recurring.nextDate')} *</Label><Input type="date" value={formNextDate} onChange={(e) => setFormNextDate(e.target.value)} /></div>
              <div className="space-y-2"><Label className="text-xs">{t('recurring.endDate')} ({t('common.optional')})</Label><Input type="date" value={formEndDate} onChange={(e) => setFormEndDate(e.target.value)} /></div>
            </div>
            <div className="space-y-3">
              <Label className="text-xs font-semibold">{t('recurring.invoiceItems')}</Label>
              {formItems.map((item, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4">{idx === 0 && <Label className="text-[10px] text-muted-foreground">{t('invoices.itemName')}</Label>}<Select value={item.productId} onValueChange={(v) => updateFormItem(idx, 'productId', v)}><SelectTrigger className="h-9 text-xs"><SelectValue placeholder={t('common.select')} /></SelectTrigger><SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
                  <div className="col-span-2">{idx === 0 && <Label className="text-[10px] text-muted-foreground">{t('common.quantity')}</Label>}<Input type="number" className="h-9 text-xs" value={item.quantity} onChange={(e) => updateFormItem(idx, 'quantity', parseFloat(e.target.value) || 0)} min="1" /></div>
                  <div className="col-span-2">{idx === 0 && <Label className="text-[10px] text-muted-foreground">{t('common.price')}</Label>}<Input type="number" className="h-9 text-xs" value={item.unitPrice} onChange={(e) => updateFormItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)} /></div>
                  <div className="col-span-1">{idx === 0 && <Label className="text-[10px] text-muted-foreground">{t('invoices.taxPct')}</Label>}<Input type="number" className="h-9 text-xs" value={item.taxRate} onChange={(e) => updateFormItem(idx, 'taxRate', parseFloat(e.target.value) || 0)} /></div>
                  <div className="col-span-2 flex items-end justify-end"><span className="text-xs font-medium">{formatRSD(calcItemTotal(item))}</span></div>
                  <div className="col-span-1 flex items-center justify-center"><Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={() => removeFormItem(idx)} disabled={formItems.length <= 1}><Trash2 className="h-3.5 w-3.5" /></Button></div>
                </motion.div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addFormItem} className="w-full gap-1"><Plus className="h-3 w-3" /> {t('invoices.addItem')}</Button>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-right"><span className="text-sm font-medium">{t('common.total')}: </span><span className="text-lg font-bold text-primary">{formatRSD(grandTotal)}</span></div>
            <div className="space-y-2"><Label className="text-xs">{t('common.notes')} ({t('common.optional')})</Label><Input placeholder={t('recurring.notesPlaceholder')} value={formNotes} onChange={(e) => setFormNotes(e.target.value)} /></div>
            <div className="flex gap-2 pt-2"><Button onClick={handleSubmit} disabled={submitting}>{submitting ? t('common.saving') : editing ? t('common.saveChanges') : t('recurring.createBtn')}</Button><Button variant="outline" onClick={() => { setDialogOpen(false); resetForm() }}>{t('common.cancel')}</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
