export const WEBHOOK_EVENTS = [
  { value: 'invoice.created', label: 'Faktura kreirana', icon: '📄' },
  { value: 'invoice.paid', label: 'Faktura plaćena', icon: '✅' },
  { value: 'invoice.sent', label: 'Faktura poslata', icon: '📤' },
  { value: 'partner.created', label: 'Partner kreiran', icon: '🤝' },
  { value: 'partner.updated', label: 'Partner ažuriran', icon: '✏️' },
  { value: 'stock.low', label: 'Niska zaliha', icon: '⚠️' },
  { value: 'stock.movement', label: 'Kretanje zaliha', icon: '📦' },
  { value: 'payment.received', label: 'Plaćanje primljeno', icon: '💰' },
  { value: 'journal.entry', label: 'Knjiženje', icon: '📒' },
  { value: 'deal.won', label: 'Poslovna prilika - uspeh', icon: '🎉' },
  { value: 'deal.lost', label: 'Poslovna prilika - gubitak', icon: '😔' },
  { value: 'employee.created', label: 'Zaposleni kreiran', icon: '👤' },
  { value: 'payroll.created', label: 'Plata kreirana', icon: '💵' },
  { value: 'project.completed', label: 'Projekat završen', icon: '📁' },
  { value: 'user.login', label: 'Prijava korisnika', icon: '🔐' },
  { value: 'audit.critical', label: 'Kritičan audit događaj', icon: '🚨' },
]

export const EVENT_GROUPS = [
  { label: 'Fakture', events: ['invoice.created', 'invoice.paid', 'invoice.sent'] },
  { label: 'Partneri', events: ['partner.created', 'partner.updated'] },
  { label: 'Magacin', events: ['stock.low', 'stock.movement'] },
  { label: 'Finansije', events: ['payment.received', 'journal.entry'] },
  { label: 'CRM', events: ['deal.won', 'deal.lost'] },
  { label: 'Zaposleni', events: ['employee.created', 'payroll.created'] },
  { label: 'Projekti', events: ['project.completed'] },
  { label: 'Sistem', events: ['user.login', 'audit.critical'] },
]

export const activeCompanyId = useAppStore((s) => s.activeCompanyId);

export const res = await fetch(`/api/webhooks?companyId=${activeCompanyId}`);

export const data = await res.json();

export const openCreate = () => {
    setEditingWebhook(null)
    setFormName('')
    setFormUrl('')
    setFormSecret('')
    setFormEvents([])
    setFormActive(true)
    setDialogOpen(true)
  }

export const openEdit = (webhook: Webhook) => {
    setEditingWebhook(webhook)
    setFormName(webhook.name)
    setFormUrl(webhook.url)
    setFormSecret(webhook.secret || '')
    try {
      setFormEvents(JSON.parse(webhook.events))
    } catch {
      setFormEvents([])
    }
    setFormActive(webhook.isActive)
    setDialogOpen(true)
  }

export const toggleEvent = (event: string) => {
    setFormEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    )
  }

export const toggleGroup = (events: string[]) => {
    const allSelected = events.every((e) => formEvents.includes(e))
    if (allSelected) {
      setFormEvents((prev) => prev.filter((e) => !events.includes(e)))
    } else {
      const newEvents = new Set([...formEvents, ...events])
      setFormEvents([...newEvents])
    }
  }

export const generateSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let secret = ''
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormSecret(secret)
  }

export const handleSave = async () => {
    if (!formName || !formUrl) {
      toast.error('Naziv i URL su obavezni')
      return
    }
    if (formEvents.length === 0) {
      toast.error('Izaberite bar jedan događaj')
      return
    }

    setSaving(true)
    try {
      const body = {
        companyId: activeCompanyId,
        name: formName,
        url: formUrl,
        secret: formSecret || null,
        events: formEvents,
        headers: null,
      }

      if (editingWebhook) {
        const res = await fetch(`/api/webhooks/${editingWebhook.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || 'Greška')
        }
        toast.success(`Webhook "${formName}" ažuriran`)
      } else {
        const res = await fetch('/api/webhooks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || 'Greška')
        }
        toast.success(`Webhook "${formName}" kreiran`)
      }

      setDialogOpen(false)
      fetchWebhooks()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Greška pri čuvanju')
    } finally {
      setSaving(false)
    }
  }

export const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteSaving(true)
    try {
      const res = await fetch(`/api/webhooks/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Greška')
      }
      toast.success(`Webhook "${deleteTarget.name}" obrisan`)
      setDeleteTarget(null)
      fetchWebhooks()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Greška pri brisanju')
    } finally {
      setDeleteSaving(false)
    }
  }

export const handleTest = async (webhook: Webhook) => {
    setTestingId(webhook.id)
    try {
      const res = await fetch(`/api/webhooks/${webhook.id}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Test uspešan (${data.statusCode || 200})`)
      } else {
        toast.error(`Test neuspešan: ${data.error || 'Nema odgovora'}`)
      }
    } catch {
      toast.error('Test neuspešan - server nije dostupan')
    } finally {
      setTestingId(null)
    }
  }

export const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Kopirano')
  }

export const getEventLabel = (eventValue: string) => {
    return WEBHOOK_EVENTS.find((e) => e.value === eventValue)?.label || eventValue
  }

export const evt = WEBHOOK_EVENTS.find((ev) => ev.value === e);

export const allSelected = group.events.every((e) => formEvents.includes(e));

export const someSelected = group.events.some((e) => formEvents.includes(e));

export const evt = WEBHOOK_EVENTS.find((e) => e.value === eventValue);

export const isSelected = formEvents.includes(eventValue);
