'use client'

// ============================================================
// TimeBilling Module – Main Entry Point
// Reflection Business ERP – Evidencija i Fakturisanje Vremena
// ============================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
  Clock, FileText, BarChart3, Settings2, Timer, AlertTriangle,
  RefreshCw, TrendingUp,
} from 'lucide-react'

import type {
  TimeEntry, Invoice, Client, Project, Employee, TimeBillingSettings,
  InvoiceStatus, PaymentTerms,
} from './types'
import { DEFAULT_SETTINGS, mockClients, mockProjects, mockEmployees } from './data'
  StatsCards, SatniceTab, FakturisanjeTab, IzvestajiTab, PodesavanjaTab,
} from './components'

// ---------- API helpers ----------

const API = '/api/time-billing'

async function apiGet<T>(params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`${API}?${qs}`)
  if (!res.ok) throw new Error(`API greška: ${res.status}`)
  return res.json()
}

async function apiPost<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `API greška: ${res.status}`)
  }
  return res.json()
}

async function apiPatch<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch(API, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `API greška: ${res.status}`)
  }
  return res.json()
}

async function apiDelete(id: string, type: string): Promise<void> {
  const res = await fetch(`${API}?id=${encodeURIComponent(id)}&type=${type}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error(`API grešка: ${res.status}`)
}

// ---------- Types for API responses ----------

interface StatsResponse {
  success: boolean
  data: {
    totalEntries: number
    totalHours: number
    unbilledCount: number
    unbilledHours: number
    unbilledValue: number
    invoicedTotal: number
    paidTotal: number
    overdueTotal: number
    invoiceCount: number
  }
}

interface EntriesResponse {
  success: boolean
  data: TimeEntry[]
}

interface InvoicesResponse {
  success: boolean
  data: Invoice[]
}

interface SettingsResponse {
  success: boolean
  data: TimeBillingSettings
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function FakturisanjeVremena() {
  const [activeTab, setActiveTab] = useState('satnice')

  // Data state
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [settings, setSettings] = useState<TimeBillingSettings>({ ...DEFAULT_SETTINGS })
  const [stats, setStats] = useState<StatsResponse['data'] | null>(null)

  // Static data
  const [clients] = useState<Client[]>(mockClients)
  const [projects] = useState<Project[]>(mockProjects)
  const [employees] = useState<Employee[]>(mockEmployees)

  // Loading state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ---------- Load all data ----------
  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [statsRes, entriesRes, invoicesRes, settingsRes] = await Promise.allSettled([
        apiGet<StatsResponse>({ section: 'stats' }),
        apiGet<EntriesResponse>({ section: 'entries' }),
        apiGet<InvoicesResponse>({ section: 'invoices' }),
        apiGet<SettingsResponse>({ section: 'settings' }),
      ])

      if (statsRes.status === 'fulfilled' && statsRes.value.success) {
        setStats(statsRes.value.data)
      }
      if (entriesRes.status === 'fulfilled' && entriesRes.value.success) {
        setEntries(entriesRes.value.data)
      }
      if (invoicesRes.status === 'fulfilled' && invoicesRes.value.success) {
        setInvoices(invoicesRes.value.data)
      }
      if (settingsRes.status === 'fulfilled' && settingsRes.value.success) {
        setSettings((prev) => ({ ...prev, ...settingsRes.value.data }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Непозната грешка')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // ---------- Time Entry Handlers ----------
  const handleAddEntry = useCallback(async (data: {
    employeeId: string; clientId: string; projectId: string;
    date: string; hours: number; rate: number; description: string;
  }) => {
    try {
      const result = await apiPost<{ success: boolean; data: TimeEntry }>({
        action: 'create-entry',
        ...data,
      })
      if (result.success) {
        setEntries((prev) => [result.data, ...prev])
        // Refresh stats
        apiGet<StatsResponse>({ section: 'stats' }).then((res) => {
          if (res.success) setStats(res.data)
        }).catch(() => {})
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при додавању')
    }
  }, [])

  const handleDeleteEntry = useCallback(async (id: string) => {
    try {
      await apiDelete(id, 'entry')
      setEntries((prev) => prev.filter((e) => e.id !== id))
      apiGet<StatsResponse>({ section: 'stats' }).then((res) => {
        if (res.success) setStats(res.data)
      }).catch(() => {})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при брисању')
    }
  }, [])

  const handleBillEntries = useCallback(async (ids: string[]) => {
    try {
      await apiPatch({ action: 'bill-entries', entryIds: ids })
      setEntries((prev) =>
        prev.map((e) => (ids.includes(e.id) ? { ...e, billingStatus: 'billed' as const } : e))
      )
      apiGet<StatsResponse>({ section: 'stats' }).then((res) => {
        if (res.success) setStats(res.data)
      }).catch(() => {})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка')
    }
  }, [])

  const handleUnbillEntries = useCallback(async (ids: string[]) => {
    try {
      await apiPatch({ action: 'unbill-entries', entryIds: ids })
      setEntries((prev) =>
        prev.map((e) =>
          ids.includes(e.id) && e.billingStatus !== 'invoiced'
            ? { ...e, billingStatus: 'unbilled' as const, invoiceId: null }
            : e
        )
      )
      apiGet<StatsResponse>({ section: 'stats' }).then((res) => {
        if (res.success) setStats(res.data)
      }).catch(() => {})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка')
    }
  }, [])

  // ---------- Invoice Handlers ----------
  const handleGenerateInvoice = useCallback(async (params: {
    entryIds: string[]; clientId: string;
    issueDate: string; paymentTerms: PaymentTerms; notes: string;
  }) => {
    try {
      const result = await apiPost<{ success: boolean; data: Invoice }>({
        action: 'generate-invoice',
        ...params,
      })
      if (result.success) {
        setInvoices((prev) => [result.data, ...prev])
        // Update entries that were invoiced
        setEntries((prev) =>
          prev.map((e) =>
            params.entryIds.includes(e.id)
              ? { ...e, billingStatus: 'invoiced' as const, invoiceId: result.data.id }
              : e
          )
        )
        // Refresh stats and settings
        const [statsRes, settingsRes] = await Promise.allSettled([
          apiGet<StatsResponse>({ section: 'stats' }),
          apiGet<SettingsResponse>({ section: 'settings' }),
        ])
        if (statsRes.status === 'fulfilled' && statsRes.value.success) setStats(statsRes.value.data)
        if (settingsRes.status === 'fulfilled' && settingsRes.value.success) {
          setSettings((prev) => ({ ...prev, ...settingsRes.value.data }))
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при генерисању фактуре')
    }
  }, [])

  const handleUpdateInvoiceStatus = useCallback(async (invoiceId: string, status: InvoiceStatus) => {
    try {
      await apiPatch({ action: 'update-invoice-status', invoiceId, status })
      setInvoices((prev) =>
        prev.map((i) => (i.id === invoiceId ? { ...i, status } : i))
      )
      apiGet<StatsResponse>({ section: 'stats' }).then((res) => {
        if (res.success) setStats(res.data)
      }).catch(() => {})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка')
    }
  }, [])

  const handleDeleteInvoice = useCallback(async (id: string) => {
    try {
      await apiDelete(id, 'invoice')
      const invoice = invoices.find((i) => i.id === id)
      setInvoices((prev) => prev.filter((i) => i.id !== id))
      if (invoice) {
        // Revert time entries to unbilled
        setEntries((prev) =>
          prev.map((e) =>
            e.invoiceId === id
              ? { ...e, billingStatus: 'unbilled' as const, invoiceId: null }
              : e
          )
        )
      }
      apiGet<StatsResponse>({ section: 'stats' }).then((res) => {
        if (res.success) setStats(res.data)
      }).catch(() => {})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при брисању')
    }
  }, [invoices])

  // ---------- Settings Handler ----------
  const handleSaveSettings = useCallback(async (newSettings: TimeBillingSettings) => {
    try {
      const result = await apiPost<{ success: boolean; data: TimeBillingSettings }>({
        action: 'update-settings',
        settings: newSettings,
      })
      if (result.success) {
        setSettings(result.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при чувању')
    }
  }, [])

  // ---------- Computed values for header badges ----------
  const unbilledCount = useMemo(
    () => entries.filter((e) => e.billingStatus === 'unbilled').length,
    [entries]
  )
  const overdueCount = useMemo(
    () => invoices.filter((i) => i.status === 'overdue').length,
    [invoices]
  )

  // ---------- Error banner ----------
  const errorBanner = error && (
    <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span>{error}</span>
      <Button variant="ghost" size="sm" className="ml-auto h-6 px-2 text-xs" onClick={() => setError(null)}>
        Затвори
      </Button>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Фактурисање времена</h1>
          <p className="text-sm text-muted-foreground">
            Евиденција радног времена, генерисање фактура и извештаји
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Освежи
        </Button>
      </div>

      {errorBanner}

      {/* Stats Cards (only on Satnice tab) */}
      {activeTab === 'satnice' && (
        <StatsCards stats={stats} loading={loading} />
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="satnice" className="gap-1.5">
            <Timer className="h-4 w-4" />
            Satnice
            {unbilledCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                {unbilledCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="fakturisanje" className="gap-1.5">
            <FileText className="h-4 w-4" />
            Fakturisanje
            {overdueCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px] bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                {overdueCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="izvestaji" className="gap-1.5">
            <BarChart3 className="h-4 w-4" />
            Izveštaji
          </TabsTrigger>
          <TabsTrigger value="podesavanja" className="gap-1.5">
            <Settings2 className="h-4 w-4" />
            Podešavanja
          </TabsTrigger>
        </TabsList>

        {/* Satnice Tab */}
        <TabsContent value="satnice">
          <SatniceTab
            entries={entries}
            clients={clients}
            projects={projects}
            employees={employees}
            loading={loading}
            onAddEntry={handleAddEntry}
            onDeleteEntry={handleDeleteEntry}
            onBillEntries={handleBillEntries}
            onUnbillEntries={handleUnbillEntries}
          />
        </TabsContent>

        {/* Fakturisanje Tab */}
        <TabsContent value="fakturisanje">
          <FakturisanjeTab
            entries={entries}
            invoices={invoices}
            clients={clients}
            projects={projects}
            settings={settings}
            loading={loading}
            onGenerateInvoice={handleGenerateInvoice}
            onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
            onDeleteInvoice={handleDeleteInvoice}
          />
        </TabsContent>

        {/* Izveštaji Tab */}
        <TabsContent value="izvestaji">
          <IzvestajiTab
            entries={entries}
            invoices={invoices}
            clients={clients}
            projects={projects}
            employees={employees}
            settings={settings}
            loading={loading}
          />
        </TabsContent>

        {/* Podešavanja Tab */}
        <TabsContent value="podesavanja">
          <PodesavanjaTab
            settings={settings}
            loading={loading}
            onSave={handleSaveSettings}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
