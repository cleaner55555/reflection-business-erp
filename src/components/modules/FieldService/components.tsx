// ============================================================
// FieldService Module – Sub-Components
// ============================================================
'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Truck, Plus, Search, Eye, Trash2, RefreshCw,
  CheckCircle2, Clock, BarChart3, Navigation, AlertCircle
} from 'lucide-react'

export interface FieldOrder {
  id: string
  orderNumber: string
  customerName: string
  address: string
  type: string
  description?: string
  priority: string
  status: string
  assignedTo?: string
  scheduledDate?: string
  completedDate?: string
  notes?: string
  createdAt: string
}

export interface DashboardData {
  totalOrders: number
  openOrders: number
  inProgressOrders: number
  completedToday: number
  overdueOrders: number
  recentOrders: FieldOrder[]
  typeBreakdown: Array<{ type: string; count: number }>
}

export const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Na čekanju', color: 'bg-gray-100 text-gray-700' },
  scheduled: { label: 'Zakazano', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'U toku', color: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Završeno', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Otkazano', color: 'bg-red-100 text-red-700' },
}

export const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Nizak', color: 'bg-gray-100 text-gray-700' },
  normal: { label: 'Normalan', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'Visok', color: 'bg-orange-100 text-orange-700' },
  emergency: { label: 'Hitno', color: 'bg-red-100 text-red-700' },
}

export const typeLabels: Record<string, string> = {
  installation: 'Instalacija',
  repair: 'Popravka',
  maintenance: 'Održavanje',
  inspection: 'Pregled',
  delivery: 'Dostava',
}

// ─── Overview Tab ─────────────────────────────────────────
interface OverviewTabProps {
  dashboard: DashboardData | null
}

export function OverviewTab({ dashboard }: OverviewTabProps) {
  if (!dashboard) {
    return (
      <div className="flex justify-center py-20">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Na čekanju</span>
            <Clock className="h-4 w-4 text-gray-500" />
          </div>
          <p className="text-2xl font-bold">{dashboard.openOrders}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">U toku</span>
            <Navigation className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{dashboard.inProgressOrders}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Završeno danas</span>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{dashboard.completedToday}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Prekoračeni</span>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">{dashboard.overdueOrders}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Po tipu</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {dashboard.typeBreakdown.map((tp) => (
              <div key={tp.type} className="flex items-center justify-between">
                <span className="text-sm">{typeLabels[tp.type] || tp.type}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${dashboard.totalOrders ? (tp.count / dashboard.totalOrders) * 100 : 0}%` }} />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{tp.count}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Ukupno naloga</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Truck className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-bold">{dashboard.totalOrders}</p>
              <p className="text-sm text-muted-foreground mt-1">ukupno terenskih naloga</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Nedavni nalozi</CardTitle></CardHeader>
        <CardContent>
          {dashboard.recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Nema naloga. Kreirajte prvi terenski nalog.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {dashboard.recentOrders.map((o) => {
                const cfg = statusConfig[o.status]
                return (
                  <div key={o.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <div className="text-sm font-medium">{o.customerName}</div>
                      <div className="text-xs text-muted-foreground">{o.address} · {typeLabels[o.type] || o.type}</div>
                    </div>
                    <Badge variant="outline" className={`text-xs ${cfg?.color || ''}`}>{cfg?.label || o.status}</Badge>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

// ─── Orders Tab ───────────────────────────────────────────
interface OrdersTabProps {
  items: FieldOrder[]
  loading: boolean
  search: string
  filter: string
  onSearchChange: (v: string) => void
  onFilterChange: (v: string) => void
  onView: (item: FieldOrder) => void
  onUpdateStatus: (id: string, status: string) => void
  onDelete: (id: string) => void
  onOpenCreate: () => void
}

export function OrdersTab({ items, loading, search, filter, onSearchChange, onFilterChange, onView, onUpdateStatus, onDelete, onOpenCreate }: OrdersTabProps) {
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pretraži naloge..." className="pl-9" value={search} onChange={(e) => onSearchChange(e.target.value)} />
        </div>
        <Select value={filter} onValueChange={onFilterChange}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Svi statusi" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Svi statusi</SelectItem>
            {Object.entries(statusConfig).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <Card className="p-8 text-center">
          <Truck className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Nema terenskih naloga</p>
          <Button variant="outline" className="mt-3" onClick={onOpenCreate}><Plus className="h-4 w-4 mr-1" /> Kreiraj nalog</Button>
        </Card>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50"><tr className="text-left text-xs text-muted-foreground">
                <th className="p-3">Broj</th><th className="p-3">Klijent</th><th className="p-3">Tip</th><th className="p-3">Prioritet</th><th className="p-3">Status</th><th className="p-3">Akcije</th>
              </tr></thead>
              <tbody>{items.map((o) => {
                const sCfg = statusConfig[o.status]
                const pCfg = priorityConfig[o.priority]
                return (
                  <tr key={o.id} className="border-t hover:bg-muted/30">
                    <td className="p-3 font-mono text-xs">{o.orderNumber}</td>
                    <td className="p-3">{o.customerName}</td>
                    <td className="p-3">{typeLabels[o.type] || o.type}</td>
                    <td className="p-3"><Badge variant="outline" className={`text-xs ${pCfg?.color || ''}`}>{pCfg?.label || o.priority}</Badge></td>
                    <td className="p-3"><Badge variant="outline" className={`text-xs ${sCfg?.color || ''}`}>{sCfg?.label || o.status}</Badge></td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onView(o)}><Eye className="h-3.5 w-3.5" /></Button>
                        {o.status === 'scheduled' && (
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-amber-600" onClick={() => onUpdateStatus(o.id, 'in_progress')}><Navigation className="h-3.5 w-3.5" /></Button>
                        )}
                        {o.status === 'in_progress' && (
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => onUpdateStatus(o.id, 'completed')}><CheckCircle2 className="h-3.5 w-3.5" /></Button>
                        )}
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => onDelete(o.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                )
              })}</tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}

