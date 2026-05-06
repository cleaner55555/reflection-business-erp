'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Webhook,
  Send,
  Check,
  X,
  AlertCircle,
  Copy,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAppStore } from '@/lib/store'
import { formatDate } from '@/lib/helpers'

// ============ TYPES ============

interface Webhook {
  id: string
  companyId: string
  name: string
  url: string
  events: string
  secret?: string | null
  headers?: string | null
  isActive: boolean
  lastTriggeredAt?: string | null
  successCount: number
  failureCount: number
  createdAt: string
  updatedAt: string
}

const WEBHOOK_EVENTS = [
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

const EVENT_GROUPS = [
  { label: 'Fakture', events: ['invoice.created', 'invoice.paid', 'invoice.sent'] },
  { label: 'Partneri', events: ['partner.created', 'partner.updated'] },
  { label: 'Magacin', events: ['stock.low', 'stock.movement'] },
  { label: 'Finansije', events: ['payment.received', 'journal.entry'] },
  { label: 'CRM', events: ['deal.won', 'deal.lost'] },
  { label: 'Zaposleni', events: ['employee.created', 'payroll.created'] },
  { label: 'Projekti', events: ['project.completed'] },
  { label: 'Sistem', events: ['user.login', 'audit.critical'] },
]

// ============ MAIN COMPONENT ============

export function WebhookManager() {
  const activeCompanyId = useAppStore((s) => s.activeCompanyId)

  const [webhooks, setWebhooks] = useState<Webhook[]>([])

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)

  // Form state
  const [formName, setFormName] = useState('')

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Webhook | null>(null)

  // Test state
  const [testingId, setTestingId] = useState<string | null>(null)

  // Fetch webhooks
  const fetchWebhooks = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/webhooks?companyId=${activeCompanyId}`)
      const data = await res.json()
      setWebhooks(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Greška pri učitavanju webhukova')
    } finally {
      setLoading(false)
    }
  }, [activeCompanyId])

  useEffect(() => { fetchWebhooks() }, [fetchWebhooks])

  // Open create
  const openCreate = () => {
    setEditingWebhook(null)
    setFormName('')
    setFormUrl('')
    setFormSecret('')
    setFormEvents([])
    setFormActive(true)
    setDialogOpen(true)
  }

  // Open edit
  const openEdit = (webhook: Webhook) => {
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

  // Toggle event
  const toggleEvent = (event: string) => {
    setFormEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    )
  }

  // Toggle group
  const toggleGroup = (events: string[]) => {
    const allSelected = events.every((e) => formEvents.includes(e))
    if (allSelected) {
      setFormEvents((prev) => prev.filter((e) => !events.includes(e)))
    } else {
      const newEvents = new Set([...formEvents, ...events])
      setFormEvents([...newEvents])
    }
  }

  // Generate secret
  const generateSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let secret = ''
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormSecret(secret)
  }

  // Save
  const handleSave = async () => {
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

  // Delete
  const handleDelete = async () => {
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

  // Test webhook
  const handleTest = async (webhook: Webhook) => {
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

  // Copy URL
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Kopirano')
  }

  const getEventLabel = (eventValue: string) => {
    return WEBHOOK_EVENTS.find((e) => e.value === eventValue)?.label || eventValue
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Webhook className="h-5 w-5 text-primary" />
            Webhook-ovi
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Automatska obaveštenja o događajima putem HTTP zahteva
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {webhooks.length} webhook-ova
          </Badge>
          <Button size="sm" className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Novi webhook
          </Button>
        </div>
      </div>

      {/* Info card */}
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Kako funkcionišu webhook-ovi?</p>
              <p>Kada se odabran događaj desi u sistemu, poslaćemo HTTP POST zahtev na navedeni URL sa JSON payload-om. Možete koristiti webhook za integraciju sa spoljnim servisima (Slack, Zapier, n8n, itd.).</p>
              <p>Svaki webhook ima tajni ključ (secret) za verifikaciju potpisa u zaglavlju <code className="px-1 py-0.5 bg-muted rounded text-[10px] font-mono">X-Webhook-Signature</code>.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhooks list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : webhooks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Webhook className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-sm font-medium text-muted-foreground">Nema webhook-ova</h3>
            <p className="text-xs text-muted-foreground mt-1">Kreirajte prvi webhook za automatska obaveštenja</p>
            <Button size="sm" className="mt-4 gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Kreiraj webhook
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {webhooks.map((webhook) => {
            let eventCount = 0
            try { eventCount = JSON.parse(webhook.events).length } catch { /* empty */ }

            return (
              <Card key={webhook.id} className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-sm text-foreground">{webhook.name}</h3>
                        <Badge
                          variant={webhook.isActive ? 'default' : 'outline'}
                          className={`text-[10px] ${webhook.isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : ''}`}
                        >
                          {webhook.isActive ? 'Aktivan' : 'Neaktivan'}
                        </Badge>
                      </div>

                      {/* URL */}
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded truncate max-w-[400px]">
                          {webhook.url}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 shrink-0"
                          onClick={() => copyToClipboard(webhook.url)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 shrink-0"
                          onClick={() => window.open(webhook.url, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Events */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {(() => {
                          let events: string[] = []
                          try { events = JSON.parse(webhook.events) } catch { /* empty */ }
                          return events.slice(0, 5).map((e: string) => {
                            const evt = WEBHOOK_EVENTS.find((ev) => ev.value === e)
                            return (
                              <Badge key={e} variant="secondary" className="text-[10px]">
                                {evt?.icon} {evt?.label || e}
                              </Badge>
                            )
                          })
                        })()}
                        {(() => {
                          let events: string[] = []
                          try { events = JSON.parse(webhook.events) } catch { /* empty */ }
                          return events.length > 5 && (
                            <Badge variant="outline" className="text-[10px]">
                              +{events.length - 5} više
                            </Badge>
                          )
                        })()}
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                        <span>{eventCount} događaja</span>
                        {webhook.secret && (
                          <span className="flex items-center gap-1">
                            🔑 Tajni ključ postavljen
                          </span>
                        )}
                        {webhook.lastTriggeredAt && (
                          <span>Poslednji: {formatDate(webhook.lastTriggeredAt)}</span>
                        )}
                        <span>Kreiran: {formatDate(webhook.createdAt)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleTest(webhook)}
                        disabled={testingId === webhook.id}
                        title="Testiraj webhook"
                      >
                        {testingId === webhook.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => openEdit(webhook)}
                        title="Izmeni"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(webhook)}
                        title="Obriši"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* ============ CREATE/EDIT DIALOG ============ */}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-primary" />
              {editingWebhook ? 'Izmeni webhook' : 'Novi webhook'}
            </DialogTitle>
            <DialogDescription>
              {editingWebhook
                ? 'Podesite webhook za automatska obaveštenja'
                : 'Definišite URL i događaje za automatska obaveštenja'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label className="text-xs">Naziv *</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="npr. Slack notifikacije"
              />
            </div>

            {/* URL */}
            <div className="space-y-2">
              <Label className="text-xs">URL zahteva *</Label>
              <Input
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                className="font-mono text-xs"
              />
              <p className="text-[10px] text-muted-foreground">HTTP POST zahtev će biti poslat na ovaj URL</p>
            </div>

            {/* Secret */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Tajni ključ (Secret)</Label>
                <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={generateSecret}>
                  Generiši
                </Button>
              </div>
              <Input
                value={formSecret}
                onChange={(e) => setFormSecret(e.target.value)}
                placeholder="Opciono - za verifikaciju potpisa"
                className="font-mono text-xs"
                type="password"
              />
              <p className="text-[10px] text-muted-foreground">
                Koristi se za HMAC-SHA256 potpis u zaglavlju X-Webhook-Signature
              </p>
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between py-2">
              <Label className="text-xs">Aktivan</Label>
              <Switch checked={formActive} onCheckedChange={setFormActive} />
            </div>

            {/* Events */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Događaji *</Label>
                <Badge variant="secondary" className="text-[10px]">
                  {formEvents.length} odabrano
                </Badge>
              </div>
              <div className="space-y-3">
                {EVENT_GROUPS.map((group) => {
                  const allSelected = group.events.every((e) => formEvents.includes(e))
                  const someSelected = group.events.some((e) => formEvents.includes(e))

                  return (
                    <div key={group.label} className="border rounded-lg overflow-hidden">
                      {/* Group header */}
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.events)}
                        className="flex items-center gap-2 w-full px-3 py-2 bg-muted/20 hover:bg-muted/30 transition-colors text-left"
                      >
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded border text-xs transition-colors ${
                            allSelected
                              ? 'bg-primary border-primary text-primary-foreground'
                              : someSelected
                                ? 'border-primary bg-primary/20'
                                : 'border-muted-foreground/30'
                          }`}
                        >
                          {allSelected && <Check className="h-3 w-3" />}
                          {someSelected && !allSelected && <span className="text-[8px]">–</span>}
                        </div>
                        <span className="text-xs font-semibold">{group.label}</span>
                      </button>

                      {/* Events in group */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y">
                        {group.events.map((eventValue) => {
                          const evt = WEBHOOK_EVENTS.find((e) => e.value === eventValue)
                          const isSelected = formEvents.includes(eventValue)

                          return (
                            <button
                              key={eventValue}
                              type="button"
                              onClick={() => toggleEvent(eventValue)}
                              className={`flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/20 transition-colors ${
                                isSelected ? 'bg-primary/[0.03]' : ''
                              }`}
                            >
                              <div
                                className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] transition-colors shrink-0 ${
                                  isSelected
                                    ? 'bg-primary border-primary text-primary-foreground'
                                    : 'border-muted-foreground/30'
                                }`}
                              >
                                {isSelected && <Check className="h-2.5 w-2.5" />}
                              </div>
                              <span className="text-xs">{evt?.icon} {evt?.label || eventValue}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Otkaži
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {editingWebhook ? 'Sačuvaj' : 'Kreiraj'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ DELETE CONFIRMATION ============ */}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => {
        if (!open) setDeleteTarget(null)
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Obriši webhook
            </AlertDialogTitle>
            <AlertDialogDescription>
              Da li ste sigurni da želite da obrišete webhook{' '}
              <span className="font-semibold text-foreground">{deleteTarget?.name}</span>?
              Sve automatske notifikacije će prestati.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteSaving}>Otkaži</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={deleteSaving}
              className="bg-destructive text-white hover:bg-destructive/90 gap-2"
            >
              {deleteSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Obriši
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
