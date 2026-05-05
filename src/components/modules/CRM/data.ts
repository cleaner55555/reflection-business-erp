export const STAGES = ['lead', 'kvalifikacija', 'predlog', 'pregovaranje', 'won', 'lost'] as const;

export const STAGE_LABELS: Record<string, string> = {
  lead: 'Lead', kvalifikacija: 'Kvalifikacija', predlog: 'Predlog',
  pregovaranje: 'Pregovaranje', won: 'Dobijeno', lost: 'Izgubljeno'
}

export const STAGE_COLORS: Record<string, string> = {
  lead: 'bg-slate-100 border-slate-300', kvalifikacija: 'bg-blue-50 border-blue-300',
  predlog: 'bg-amber-50 border-amber-300', pregovaranje: 'bg-orange-50 border-orange-300',
  won: 'bg-emerald-50 border-emerald-300', lost: 'bg-red-50 border-red-300'
}

export const STAGE_DOT: Record<string, string> = {
  lead: 'bg-slate-400', kvalifikacija: 'bg-blue-400', predlog: 'bg-amber-400',
  pregovaranje: 'bg-orange-400', won: 'bg-emerald-500', lost: 'bg-red-400'
}

export const STAGE_BADGE: Record<string, string> = {
  lead: 'bg-slate-100 text-slate-700', kvalifikacija: 'bg-blue-100 text-blue-700',
  predlog: 'bg-amber-100 text-amber-700', pregovaranje: 'bg-orange-100 text-orange-700',
  won: 'bg-emerald-100 text-emerald-700', lost: 'bg-red-100 text-red-700'
}

export const SOURCE_LABELS: Record<string, string> = {
  manual: 'Manuelno', web: 'Web sajt', referral: 'Preporuka', cold_call: 'Hladni poziv',
  email: 'Email kampanja', social: 'Društvene mreže', trade_show: 'Sajam', advertising: 'Reklama', other: 'Ostalo'
}

export const SOURCE_ICONS: Record<string, string> = {
  manual: '✍️', web: '🌐', referral: '🤝', cold_call: '📞',
  email: '✉️', social: '📱', trade_show: '🎪', advertising: '📢', other: '❓'
}

export const ACTIVITY_TYPES: Record<string, { icon: string; label: string }> = {
  poziv: { icon: '📞', label: 'Poziv' },
  sastanak: { icon: '🤝', label: 'Sastanak' },
  email: { icon: '✉️', label: 'Email' },
  task: { icon: '✅', label: 'Zadatak' },
  napomena: { icon: '📝', label: 'Napomena' },
  demo: { icon: '🖥️', label: 'Demo' },
  predlog: { icon: '📋', label: 'Predlog' },
  follow_up: { icon: '🔄', label: 'Follow-up' },
}

export const now = new Date(); now.setHours(0, 0, 0, 0);

export const target = new Date(date); target.setHours(0, 0, 0, 0);

export const colors = ['bg-primary/10 text-primary', 'bg-emerald-500/10 text-emerald-600', 'bg-amber-500/10 text-amber-600', 'bg-rose-500/10 text-rose-600', 'bg-sky-500/10 text-sky-600', 'bg-violet-500/10 text-violet-600']

export const { t } = useTranslation();

export const { t } = useTranslation();

export const { tc, translateTexts } = useContentTranslation();

export const [dealsRes, contactsRes, partnersRes] = await Promise.all([
      fetch('/api/deals'), fetch('/api/contacts'), fetch('/api/partners')
    ]);

export const texts: string[] = []

export const q = search.toLowerCase();

export const moveDeal = async (dealId: string, newStage: string): Promise<void> => {
    if (newStage === 'lost') { setLostDialog({ dealId, reason: '' }); return }
    try {
      await fetch(`/api/deals/${dealId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stage: newStage }) })
      fetchDeals()
    } catch { toast.error(t('common.error')) }
  }

export const confirmLost = async (): Promise<void> => {
    if (!lostDialog) return
    try {
      await fetch(`/api/deals/${lostDialog.dealId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'lost', lostReason: lostDialog.reason || null })
      })
      setLostDialog(null); fetchDeals()
    } catch { toast.error(t('common.error')) }
  }

export const handleDelete = async (id: string): Promise<void> => {
    if (!confirm(t('crm.confirmDeleteDeal'))) return
    try { await fetch(`/api/deals/${id}`, { method: 'DELETE' }); toast.success(t('common.deleteSuccess')); fetchDeals() } catch { toast.error(t('common.error')) }
  }

export const handleNew = (): void => {
    setEditingDeal(null)
    setFormContactId(''); setFormPartnerId(''); setFormSource('manual'); setFormTags('')
    setViewMode('form')
  }

export const handleEdit = (deal: Deal): void => {
    setEditingDeal(deal)
    setFormContactId(deal.contact?.id || '')
    setFormPartnerId(deal.partner?.id || '')
    setFormSource(deal.source || 'manual')
    setFormTags(parseTags(deal.tags).join(', '))
    setViewMode('form')
  }

export const handleCancel = (): void => { setViewMode('list'); setEditingDeal(null) }

export const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault(); setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const tagsArr = formTags.split(',').map((t) => t.trim()).filter(Boolean)
    const body = {
      title: fd.get('title') as string,
      value: fd.get('value') as string,
      stage: fd.get('stage') as string,
      probability: fd.get('probability') as string,
      closeDate: fd.get('closeDate') as string,
      notes: fd.get('notes') as string,
      source: formSource,
      contactId: formContactId || null,
      partnerId: formPartnerId || null,
      tags: tagsArr.length > 0 ? JSON.stringify(tagsArr) : null,
    }
    try {
      const url = editingDeal ? `/api/deals/${editingDeal.id}` : '/api/deals'
      const res = await fetch(url, { method: editingDeal ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.error')); return }
      toast.success(editingDeal ? t('common.updated') : t('common.created'))
      setViewMode('list'); setEditingDeal(null); fetchDeals()
    } catch { toast.error(t('common.error')) } finally { setSubmitting(false) }
  }

export const recalcScores = async (): Promise<void> => {
    try {
      const res = await fetch('/api/deals/recalculate-scores', { method: 'POST' })
      const data = await res.json()
      toast.success(`${t('crm.recalcScores')}: ${data.updated}/${data.total}`)
      fetchDeals()
    } catch { toast.error(t('common.error')) }
  }

export const nextStage = (stage: string): string | null => {
    const idx = STAGES.indexOf(stage as typeof STAGES[number])
    return idx < STAGES.length - 1 ? STAGES[idx + 1] : null
  }

export const active = deals.filter((d: Deal) => !['won', 'lost'].includes(d.stage));

export const wonDeals = deals.filter((d: Deal) => d.stage === 'won');

export const completedDeals = deals.filter((d: Deal) => ['won', 'lost'].includes(d.stage));

export const now = new Date();

export const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

export const closingThisMonth = deals.filter((d: Deal) => {
      if (['won', 'lost'].includes(d.stage) || !d.closeDate) return false
      return new Date(d.closeDate) <= monthEnd
    });

export const atRisk = deals.filter((d: Deal) => {
      if (['won', 'lost'].includes(d.stage) || !d.closeDate) return false
      return new Date(d.closeDate) < now
    });

export const stageDeals = filteredDeals.filter((d: Deal) => d.stage === stage);

export const stageTotal = stageDeals.reduce((s: number, d: Deal) => s + d.value, 0);

export const days = daysUntil(deal.closeDate);

export const expected = deal.value * deal.probability / 100;

export const isOverdue = days !== null && days < 0 && !['won', 'lost'].includes(deal.stage);

export const tags = parseTags(deal.tags);

export const { t } = useTranslation();

export const { tc } = useContentTranslation();

export const addActivity = async (): Promise<void> => {
    if (!actTitle.trim()) return
    try {
      await fetch('/api/crm-activities', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: actType, title: actTitle, dealId: deal.id, description: actDescription, dueDate: actDueDate || null })
      })
      setActTitle(''); setActDescription(''); setActDueDate(''); setNewActivity(false)
      const res = await fetch(`/api/deals/${deal.id}`)
      const d = await res.json()
      setActivities(d.activities || [])
      onRefresh(); toast.success(t('common.created'))
    } catch { toast.error(t('common.error')) }
  }

export const toggleActivity = async (actId: string, completed: boolean): Promise<void> => {
    try {
      await fetch(`/api/crm-activities/${actId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completed: !completed }) })
      const res = await fetch(`/api/deals/${deal.id}`)
      const d = await res.json()
      setActivities(d.activities || [])
    } catch { toast.error(t('common.error')) }
  }

export const deleteActivity = async (actId: string): Promise<void> => {
    try {
      await fetch(`/api/crm-activities/${actId}`, { method: 'DELETE' })
      const res = await fetch(`/api/deals/${deal.id}`)
      const d = await res.json()
      setActivities(d.activities || [])
    } catch { toast.error(t('common.error')) }
  }

export const days = daysUntil(deal.closeDate);

export const isOverdue = days !== null && days < 0 && !['won', 'lost'].includes(deal.stage);

export const expected = deal.value * deal.probability / 100;

export const tags = parseTags(deal.tags);

export const scoreItems = [
    { label: t('crm.scoreContact'), value: deal.contact ? 15 : 0 },
    { label: 'Kompanija', value: deal.partner ? 15 : 0 },
    { label: t('crm.scoreValue'), value: deal.value > 0 ? 15 : 0 },
    { label: t('crm.scoreDate'), value: deal.closeDate ? 10 : 0 },
    { label: 'Verovatnoća >50%', value: deal.probability > 50 ? 10 : 0 },
    { label: 'Verovatnoća >80%', value: deal.probability > 80 ? 10 : 0 },
    { label: t('crm.scoreNotes'), value: deal.notes && deal.notes.trim().length > 0 ? 5 : 0 },
    { label: 'Izvor (ne-manual)', value: deal.source && deal.source !== 'manual' ? 10 : 0 },
    { label: 'Vrednost >100K', value: deal.value > 100000 ? 10 : 0 },
  ]

export const typeInfo = ACTIVITY_TYPES[act.type] || { icon: '📝', label: act.type }

export const actDays = daysUntil(act.dueDate);

export const isActOverdue = actDays !== null && actDays < 0 && !act.completed;

export const { t } = useTranslation();

export const months: { label: string; expected: number; won: number; count: number }[] = []

export const now = new Date();

export const monthDate = new Date(now.getFullYear(), now.getMonth() + i, 1);

export const monthEnd = new Date(now.getFullYear(), now.getMonth() + i + 1, 0);

export const monthDeals = deals.filter((d: Deal) => {
        if (!d.closeDate) return false
        const cd = new Date(d.closeDate)
        return cd >= monthDate && cd <= monthEnd
      });

export const monthLabel = t(`common.month_${monthDate.getMonth() + 1}`);

export const expected = monthDeals.filter((d: Deal) => d.stage !== 'lost').reduce((s: number, d: Deal) => s + d.value * d.probability / 100, 0);

export const won = monthDeals.filter((d: Deal) => d.stage === 'won').reduce((s: number, d: Deal) => s + d.value, 0);

export const completedDeals = deals.filter((d: Deal) => ['won', 'lost'].includes(d.stage));

export const wonDeals = deals.filter((d: Deal) => d.stage === 'won');

export const winRate = completedDeals.length > 0 ? Math.round((wonDeals.length / completedDeals.length) * 100) : 0;

export const avgDealSize = wonDeals.length > 0 ? wonDeals.reduce((s: number, d: Deal) => s + d.value, 0) / wonDeals.length : 0;

export const topDeals = [...deals].filter((d: Deal) => !['won', 'lost'].includes(d.stage)).sort((a: Deal, b: Deal) => (b.value * b.probability) - (a.value * a.probability)).slice(0, 5);

export const maxForecast = Math.max(...forecast.map((m) => m.expected), 1);

export const stageDeals = deals.filter((d: Deal) => d.stage === stage);

export const total = stageDeals.reduce((s: number, d: Deal) => s + d.value, 0);

export const maxVal = Math.max(...STAGES.filter((s: string) => s !== 'won' && s !== 'lost').map((s) => deals.filter((d: Deal) => d.stage === s).reduce((sum: number, d: Deal) => sum + d.value, 0)), 1);

export const { t } = useTranslation();

export const { tc } = useContentTranslation();

export const [cRes, pRes] = await Promise.all([fetch('/api/contacts'), fetch('/api/partners')]);

export const q = search.toLowerCase();

export const handleNew = (): void => { setEditing(null); setViewMode('form') }

export const handleEdit = (c: Contact): void => { setEditing(c); setViewMode('form') }

export const handleCancel = (): void => { setViewMode('list'); setEditing(null) }

export const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault(); setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      firstName: fd.get('firstName') as string, lastName: fd.get('lastName') as string,
      email: fd.get('email') as string, phone: fd.get('phone') as string,
      position: fd.get('position') as string, company: fd.get('company') as string,
      partnerId: fd.get('partnerId') as string || null, notes: fd.get('notes') as string,
      tags: fd.get('tags') as string, isLead: fd.get('isLead') === 'on',
      isClient: fd.get('isClient') === 'on', isSupplier: fd.get('isSupplier') === 'on',
    }
    try {
      const url = editing ? `/api/contacts/${editing.id}` : '/api/contacts'
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.error')); return }
      toast.success(editing ? t('common.updated') : t('common.created'))
      setViewMode('list'); setEditing(null); fetchContacts()
    } catch { toast.error(t('common.error')) } finally { setSubmitting(false) }
  }

export const handleDelete = async (id: string): Promise<void> => {
    if (!confirm('Obrisati kontakt?')) return
    try { await fetch(`/api/contacts/${id}`, { method: 'DELETE' }); toast.success(t('common.deleteSuccess')); fetchContacts() } catch { toast.error(t('common.error')) }
  }

export const convertToClient = async (contact: Contact): Promise<void> => {
    try {
      await fetch(`/api/contacts/${contact.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isClient: true, isLead: false }) })
      toast.success('Kontakt pretvoren u klijenta')
      fetchContacts()
    } catch { toast.error(t('common.error')) }
  }

export const { t } = useTranslation();

export const { tc } = useContentTranslation();

export const load = async () => {
      setLoading(true)
      const [aRes, cRes, dRes] = await Promise.all([fetch('/api/crm-activities'), fetch('/api/contacts'), fetch('/api/deals')])
      if (cancelled) return
      setActivities(await aRes.json())
      setContacts(await cRes.json())
      setDeals(await dRes.json())
      setLoading(false)
    }

export const addActivity = async (): Promise<void> => {
    if (!actTitle.trim()) return
    try {
      await fetch('/api/crm-activities', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: actType, title: actTitle, dueDate: actDueDate || null, contactId: actContactId || null, dealId: actDealId || null, description: '' })
      })
      setActTitle(''); setActDueDate(''); setActContactId(''); setActDealId(''); setNewAct(false)
      fetchAll(); toast.success(t('common.created'))
    } catch { toast.error(t('common.error')) }
  }

export const toggleComplete = async (id: string, completed: boolean): Promise<void> => {
    try { await fetch(`/api/crm-activities/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completed: !completed }) }); fetchAll() } catch { toast.error(t('common.error')) }
  }

export const deleteAct = async (id: string): Promise<void> => {
    try { await fetch(`/api/crm-activities/${id}`, { method: 'DELETE' }); fetchAll(); toast.success(t('common.deleteSuccess')) } catch { toast.error(t('common.error')) }
  }

export const pendingCount = activities.filter((a: CrmActivity) => !a.completed).length;

export const overdueCount = activities.filter((a: CrmActivity) => !a.completed && a.dueDate && daysUntil(a.dueDate) !== null && daysUntil(a.dueDate)! < 0).length;

export const upcomingCount = activities.filter((a: CrmActivity) => !a.completed && a.dueDate && daysUntil(a.dueDate) !== null && daysUntil(a.dueDate)! >= 0 && daysUntil(a.dueDate)! <= 7).length;

export const typeInfo = ACTIVITY_TYPES[act.type] || { icon: '📝', label: act.type }

export const actDays = daysUntil(act.dueDate);

export const isOverdue = actDays !== null && actDays < 0 && !act.completed;

export const { t } = useTranslation();

export const stats: Record<string, { total: number; won: number; lost: number; totalValue: number; wonValue: number; count: number }> = {}

export const src = d.source || 'manual';

export const totalDeals = deals.length;

export const maxCount = Math.max(...sourceStats.map(([, s]) => s.count), 1);

export const winRate = stat.count > 0 ? Math.round((stat.won / stat.count) * 100) : 0;

export function scoreColor(score: number): string {
  if (score >= 67) return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  if (score >= 34) return 'bg-amber-100 text-amber-700 border-amber-200'
  return 'bg-red-100 text-red-700 border-red-200'
}

export function daysUntil(date: string | null): number | null {
  if (!date) return null
  const now = new Date(); now.setHours(0, 0, 0, 0)
  const target = new Date(date); target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function initials(firstName?: string | null, lastName?: string | null): string {
  return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase()
}

export function avatarColor(name: string): string {
  const colors = ['bg-primary/10 text-primary', 'bg-emerald-500/10 text-emerald-600', 'bg-amber-500/10 text-amber-600', 'bg-rose-500/10 text-rose-600', 'bg-sky-500/10 text-sky-600', 'bg-violet-500/10 text-violet-600']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export function parseTags(tags: string | null): string[] {
  if (!tags) return []
  try { return JSON.parse(tags) } catch { return [] }
}
