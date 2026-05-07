'use client'

import { useState, useEffect, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
  Building2, FileText, Truck, Wallet, BarChart3,
  RefreshCw, Download, TrendingUp, AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'

import type {
  Subcontractor, SubcontractorFormData,
  Contract, ContractFormData,
  Delivery, DeliveryFormData,
  Payment, PaymentFormData,
} from './types'
  initialSubcontractors, initialContracts, initialDeliveries, initialPayments,
  formatRSD, todayISO, generateId,
} from './data'
  SubcontractorsTab,
  ContractsTab,
  DeliveriesTab,
  FinanceTab,
  ReportsTab,
} from './components'

// ============================================================
// API base — points to /api/subcontractors
// ============================================================
const API_BASE = '/api/subcontractors'

// ============================================================
// Custom hooks for data fetching with API fallback to mock data
// ============================================================

function useSubcontractors() {
  const [data, setData] = useState<Subcontractor[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(API_BASE)
      if (res.ok) {
        const json = await res.json()
        if (Array.isArray(json) && json.length > 0) {
          setData(json)
          setLoading(false)
          return
        }
      }
    } catch {
      // API not available — fall back to mock data
    }
    setData(initialSubcontractors)
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const add = async (item: SubcontractorFormData) => {
    const newItem: Subcontractor = {
      ...item,
      id: generateId('sub'),
      datumUnosa: new Date().toISOString(),
      datumIzmene: new Date().toISOString(),
    }
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      })
      if (res.ok) {
        const created = await res.json()
        setData((prev) => [created, ...prev])
        toast.success('Подизвођач је успешно додат')
        return
      }
    } catch { /* fallback */ }
    setData((prev) => [newItem, ...prev])
    toast.success('Подизвођач је успешно додат')
  }

  const update = async (id: string, item: Partial<Subcontractor>) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, datumIzmene: new Date().toISOString() }),
      })
      if (res.ok) {
        setData((prev) => prev.map((s) => s.id === id ? { ...s, ...item, datumIzmene: new Date().toISOString() } : s))
        toast.success('Подаци су ажурирани')
        return
      }
    } catch { /* fallback */ }
    setData((prev) => prev.map((s) => s.id === id ? { ...s, ...item, datumIzmene: new Date().toISOString() } : s))
    toast.success('Подаци су ажурирани')
  }

  const remove = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setData((prev) => prev.filter((s) => s.id !== id))
        toast.success('Подизвођач је обрисан')
        return
      }
    } catch { /* fallback */ }
    setData((prev) => prev.filter((s) => s.id !== id))
    toast.success('Подизвођач је обрисан')
  }

  return { data, loading, add, update, remove, refetch: fetchData }
}

function useContracts() {
  const [data, setData] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}?entity=contracts`)
      if (res.ok) {
        const json = await res.json()
        if (Array.isArray(json) && json.length > 0) {
          setData(json)
          setLoading(false)
          return
        }
      }
    } catch { /* fallback */ }
    setData(initialContracts)
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const add = async (item: ContractFormData) => {
    const newItem: Contract = {
      ...item,
      id: generateId('ugv'),
      datumUnosa: new Date().toISOString(),
      datumIzmene: new Date().toISOString(),
    }
    try {
      const res = await fetch(`${API_BASE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity: 'contracts', ...newItem }),
      })
      if (res.ok) {
        const created = await res.json()
        setData((prev) => [created, ...prev])
        toast.success('Уговор је успешно додат')
        return
      }
    } catch { /* fallback */ }
    setData((prev) => [newItem, ...prev])
    toast.success('Уговор је успешно додат')
  }

  const update = async (id: string, item: Partial<Contract>) => {
    try {
      const res = await fetch(`${API_BASE}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity: 'contracts', id, ...item, datumIzmene: new Date().toISOString() }),
      })
      if (res.ok) {
        setData((prev) => prev.map((c) => c.id === id ? { ...c, ...item, datumIzmene: new Date().toISOString() } : c))
        toast.success('Уговор је ажуриран')
        return
      }
    } catch { /* fallback */ }
    setData((prev) => prev.map((c) => c.id === id ? { ...c, ...item, datumIzmene: new Date().toISOString() } : c))
    toast.success('Уговор је ажуриран')
  }

  const remove = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}?entity=contracts&id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setData((prev) => prev.filter((c) => c.id !== id))
        toast.success('Уговор је обрисан')
        return
      }
    } catch { /* fallback */ }
    setData((prev) => prev.filter((c) => c.id !== id))
    toast.success('Уговор је обрисан')
  }

  return { data, loading, add, update, remove, refetch: fetchData }
}

function useDeliveries() {
  const [data, setData] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}?entity=deliveries`)
      if (res.ok) {
        const json = await res.json()
        if (Array.isArray(json) && json.length > 0) {
          setData(json)
          setLoading(false)
          return
        }
      }
    } catch { /* fallback */ }
    setData(initialDeliveries)
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const add = async (item: DeliveryFormData) => {
    const newItem: Delivery = {
      ...item,
      id: generateId('isp'),
      datumUnosa: new Date().toISOString(),
      datumIzmene: new Date().toISOString(),
    }
    try {
      const res = await fetch(`${API_BASE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity: 'deliveries', ...newItem }),
      })
      if (res.ok) {
        const created = await res.json()
        setData((prev) => [created, ...prev])
        toast.success('Испорука је успешно додата')
        return
      }
    } catch { /* fallback */ }
    setData((prev) => [newItem, ...prev])
    toast.success('Испорука је успешно додата')
  }

  const update = async (id: string, item: Partial<Delivery>) => {
    try {
      const res = await fetch(`${API_BASE}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity: 'deliveries', id, ...item, datumIzmene: new Date().toISOString() }),
      })
      if (res.ok) {
        setData((prev) => prev.map((d) => d.id === id ? { ...d, ...item, datumIzmene: new Date().toISOString() } : d))
        toast.success('Испорука је ажурирана')
        return
      }
    } catch { /* fallback */ }
    setData((prev) => prev.map((d) => d.id === id ? { ...d, ...item, datumIzmene: new Date().toISOString() } : d))
    toast.success('Испорука је ажурирана')
  }

  const remove = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}?entity=deliveries&id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setData((prev) => prev.filter((d) => d.id !== id))
        toast.success('Испорука је обрисана')
        return
      }
    } catch { /* fallback */ }
    setData((prev) => prev.filter((d) => d.id !== id))
    toast.success('Испорука је обрисана')
  }

  return { data, loading, add, update, remove, refetch: fetchData }
}

function usePayments() {
  const [data, setData] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}?entity=payments`)
      if (res.ok) {
        const json = await res.json()
        if (Array.isArray(json) && json.length > 0) {
          setData(json)
          setLoading(false)
          return
        }
      }
    } catch { /* fallback */ }
    setData(initialPayments)
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const add = async (item: PaymentFormData) => {
    const newItem: Payment = {
      ...item,
      id: generateId('plc'),
      datumUnosa: new Date().toISOString(),
      datumIzmene: new Date().toISOString(),
    }
    try {
      const res = await fetch(`${API_BASE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity: 'payments', ...newItem }),
      })
      if (res.ok) {
        const created = await res.json()
        setData((prev) => [created, ...prev])
        toast.success('Плаћање је успешно додато')
        return
      }
    } catch { /* fallback */ }
    setData((prev) => [newItem, ...prev])
    toast.success('Плаћање је успешно додато')
  }

  const update = async (id: string, item: Partial<Payment>) => {
    try {
      const res = await fetch(`${API_BASE}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity: 'payments', id, ...item, datumIzmene: new Date().toISOString() }),
      })
      if (res.ok) {
        setData((prev) => prev.map((p) => p.id === id ? { ...p, ...item, datumIzmene: new Date().toISOString() } : p))
        toast.success('Плаћање је ажурирано')
        return
      }
    } catch { /* fallback */ }
    setData((prev) => prev.map((p) => p.id === id ? { ...p, ...item, datumIzmene: new Date().toISOString() } : p))
    toast.success('Плаћање је ажурирано')
  }

  const remove = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}?entity=payments&id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setData((prev) => prev.filter((p) => p.id !== id))
        toast.success('Плаћање је обрисано')
        return
      }
    } catch { /* fallback */ }
    setData((prev) => prev.filter((p) => p.id !== id))
    toast.success('Плаћање је обрисано')
  }

  return { data, loading, add, update, remove, refetch: fetchData }
}

// ============================================================
// Main Exported Component
// ============================================================

export function Subodradaci() {
  const [activeTab, setActiveTab] = useState('podizvodjaci')

  const subcontractors = useSubcontractors()
  const contracts = useContracts()
  const deliveries = useDeliveries()
  const payments = usePayments()

  const anyLoading = subcontractors.loading || contracts.loading || deliveries.loading || payments.loading

  // Aggregate numbers for the header badges
  const activeContracts = contracts.data.filter((c) => c.status === 'aktivan').length
  const overdueCount = payments.data.filter((p) => p.status === 'prekoračeno').length
  const totalContractValue = contracts.data.filter((c) => c.status === 'aktivan').reduce((s, c) => s + c.vrednost, 0)
  const totalPaid = payments.data.reduce((s, p) => s + p.iznosPlaćen, 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Подизвођачи</h1>
          <p className="text-sm text-muted-foreground">
            Управљање подизвођачима, уговорима, испорукама и плаћањима
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              subcontractors.refetch()
              contracts.refetch()
              deliveries.refetch()
              payments.refetch()
              toast.info('Подаци су освежени')
            }}
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Освежи
          </Button>
        </div>
      </div>

      {/* Summary ribbon */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Подизвођача</p>
              <p className="text-sm font-bold">{subcontractors.data.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Активних уговора</p>
              <p className="text-sm font-bold">{activeContracts}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Вредност уговора</p>
              <p className="text-sm font-bold">{formatRSD(totalContractValue)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Укупно плаћено</p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatRSD(totalPaid)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-xs text-muted-foreground">Прекорачења</p>
              <p className="text-sm font-bold text-red-600 dark:text-red-400">{overdueCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      {anyLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="grid gap-4 grid-cols-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-96" />
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="w-full justify-start bg-muted/50 p-0.5 h-auto flex-wrap gap-1">
            <TabsTrigger
              value="podizvodjaci"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm px-3 py-1.5 gap-1.5 rounded-md"
            >
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Подизвођачи</span>
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{subcontractors.data.length}</Badge>
            </TabsTrigger>
            <TabsTrigger
              value="ugovori"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm px-3 py-1.5 gap-1.5 rounded-md"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Уговори</span>
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{contracts.data.length}</Badge>
            </TabsTrigger>
            <TabsTrigger
              value="isporuke"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm px-3 py-1.5 gap-1.5 rounded-md"
            >
              <Truck className="h-4 w-4" />
              <span className="hidden sm:inline">Испорука</span>
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{deliveries.data.length}</Badge>
            </TabsTrigger>
            <TabsTrigger
              value="finansije"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm px-3 py-1.5 gap-1.5 rounded-md"
            >
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Финансије</span>
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{payments.data.length}</Badge>
            </TabsTrigger>
            <TabsTrigger
              value="izvestaji"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm px-3 py-1.5 gap-1.5 rounded-md"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Извештаји</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="podizvodjaci">
            <SubcontractorsTab
              data={subcontractors.data}
              onAdd={subcontractors.add}
              onUpdate={subcontractors.update}
              onDelete={subcontractors.remove}
            />
          </TabsContent>

          <TabsContent value="ugovori">
            <ContractsTab
              contracts={contracts.data}
              subcontractors={subcontractors.data}
              onAdd={contracts.add}
              onUpdate={contracts.update}
              onDelete={contracts.remove}
            />
          </TabsContent>

          <TabsContent value="isporuke">
            <DeliveriesTab
              deliveries={deliveries.data}
              contracts={contracts.data}
              subcontractors={subcontractors.data}
              onAdd={deliveries.add}
              onUpdate={deliveries.update}
              onDelete={deliveries.remove}
            />
          </TabsContent>

          <TabsContent value="finansije">
            <FinanceTab
              payments={payments.data}
              contracts={contracts.data}
              subcontractors={subcontractors.data}
              onAdd={payments.add}
              onUpdate={payments.update}
              onDelete={payments.remove}
            />
          </TabsContent>

          <TabsContent value="izvestaji">
            <ReportsTab
              subcontractors={subcontractors.data}
              contracts={contracts.data}
              deliveries={deliveries.data}
              payments={payments.data}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
