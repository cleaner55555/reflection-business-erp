'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { RefreshCw, Plus, Search, Eye, Trash2, CheckCircle2, XCircle, BarChart3, CalendarDays, CalendarOff, Clock } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────
export interface Inspection {
  id: string; title: string; type: string; productName?: string; batchNumber?: string
  inspectorName: string; status: string; result: string; defects?: number; notes?: string
  inspectedAt?: string; createdAt: string
}

export interface DashboardData {
  totalInspections: number; passedInspections: number; failedInspections: number
  pendingInspections: number; passRate: number; totalDefects: number
  recentInspections: Inspection[]; typeBreakdown: Array<{ type: string; count: number }>
}

export const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Na čekanju', color: 'bg-amber-100 text-amber-700' },
  in_progress: { label: 'U toku', color: 'bg-blue-100 text-blue-700' },
  passed: { label: 'Prošlo', color: 'bg-green-100 text-green-700' },
  failed: { label: 'Palo', color: 'bg-red-100 text-red-700' },
}

export const typeLabels: Record<string, string> = {
  incoming: 'Dolazna kontrola', in_process: 'Kontrola u toku', final: 'Finalna kontrola', audit: 'Audit',
}

// ─── Sub-Components ──────────────────────────────────────

interface OverviewContentProps {
  dashboard: DashboardData | null
  loading: boolean
  onCreate: () => void
}

export function OverviewContent({ dashboard, loading, onCreate }: OverviewContentProps) {
  if (loading) return <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  if (!dashboard) return null

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Ukupno inspekcija</span><CheckCircle2 className="h-4 w-4 text-muted-foreground" /></div><p className="text-2xl font-bold">{dashboard.totalInspections}</p></Card>
        <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Prošlo</span><CheckCircle2 className="h-4 w-4 text-green-500" /></div><p className="text-2xl font-bold text-green-600">{dashboard.passedInspections}</p></Card>
        <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Palo</span><XCircle className="h-4 w-4 text-red-500" /></div><p className="text-2xl font-bold text-red-600">{dashboard.failedInspections}</p></Card>
        <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Stopa prolaza</span><BarChart3 className="h-4 w-4 text-primary" /></div><p className="text-2xl font-bold">{dashboard.passRate}%</p></Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Po tipu</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {dashboard.typeBreakdown.map((tp) => (
              <div key={tp.type} className="flex items-center justify-between">
                <span className="text-sm">{typeLabels[tp.type] || tp.type}</span>
                <div className="flex items-center gap-3"><div className="w-24 bg-muted rounded-full h-2"><div className="h-2 rounded-full bg-primary" style={{ width: `${dashboard.totalInspections ? (tp.count / dashboard.totalInspections) * 100 : 0}%` }} /></div><span className="text-sm font-medium w-8 text-right">{tp.count}</span></div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Ukupno defekata</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center"><p className="text-3xl font-bold">{dashboard.totalDefects}</p><p className="text-sm text-muted-foreground mt-1">ukupno pronađenih</p></div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Nedavne inspekcije</CardTitle></CardHeader>
        <CardContent>
          {dashboard.recentInspections.length === 0 ? <p className="text-sm text-muted-foreground py-8 text-center">Nema inspekcija. Kreirajte prvu inspekciju.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="pb-2 pr-4">Naslov</th><th className="pb-2 pr-4">Tip</th><th className="pb-2 pr-4">Inspektor</th><th className="pb-2 pr-4">Rezultat</th><th className="pb-2">Datum</th></tr></thead>
                <tbody>{dashboard.recentInspections.map((i) => {
                  const cfg = statusConfig[i.status]
                  return (<tr key={i.id} className="border-b last:border-0 hover:bg-muted/50"><td className="py-2 pr-4">{i.title}</td><td className="py-2 pr-4">{typeLabels[i.type] || i.type}</td><td className="py-2 pr-4">{i.inspectorName}</td><td className="py-2 pr-4"><Badge variant="outline" className={`text-xs ${cfg?.color || ''}`}>{cfg?.label || i.status}</Badge></td><td className="py-2 text-xs text-muted-foreground">{new Date(i.createdAt).toLocaleDateString('sr-RS')}</td></tr>)
                })}</tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

interface InspectionsListProps {
  items: Inspection[]
  loading: boolean
  search: string
  filter: string
  onSearch: (v: string) => void
  onFilter: (v: string) => void
  onView: (item: Inspection) => void
  onApprove: (id: string) => void
  onFail: (id: string) => void
  onDelete: (id: string) => void
  onCreate: () => void
}

export function InspectionsList({ items, loading, search, filter, onSearch, onFilter, onView, onApprove, onFail, onDelete, onCreate }: InspectionsListProps) {
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži inspekcije..." className="pl-9" value={search} onChange={e => onSearch(e.target.value)} /></div>
        <Select value={filter} onValueChange={onFilter}><SelectTrigger className="w-[160px]"><SelectValue placeholder="Svi statusi" /></SelectTrigger><SelectContent><SelectItem value="all">Svi statusi</SelectItem>{Object.entries(statusConfig).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}</SelectContent></Select>
      </div>
      {loading ? <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div> : items.length === 0 ? (
        <Card className="p-8 text-center"><p className="text-muted-foreground">Nema inspekcija</p><Button variant="outline" className="mt-3" onClick={onCreate}><Plus className="h-4 w-4 mr-1" /> Kreiraj inspekciju</Button></Card>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50"><tr className="text-left text-xs text-muted-foreground"><th className="p-3">Naslov</th><th className="p-3">Tip</th><th className="p-3">Inspektor</th><th className="p-3">Proizvod</th><th className="p-3">Status</th><th className="p-3">Akcije</th></tr></thead>
              <tbody>{items.map((i) => {
                const cfg = statusConfig[i.status]
                return (<tr key={i.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 font-medium">{i.title}</td><td className="p-3">{typeLabels[i.type] || i.type}</td><td className="p-3">{i.inspectorName}</td><td className="p-3">{i.productName || '-'}</td>
                  <td className="p-3"><Badge variant="outline" className={`text-xs ${cfg?.color || ''}`}>{cfg?.label || i.status}</Badge></td>
                  <td className="p-3"><div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onView(i)}><Eye className="h-3.5 w-3.5" /></Button>
                    {i.status === 'pending' && (<><Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => onApprove(i.id)}><CheckCircle2 className="h-3.5 w-3.5" /></Button><Button size="icon" variant="ghost" className="h-7 w-7 text-red-600" onClick={() => onFail(i.id)}><XCircle className="h-3.5 w-3.5" /></Button></>)}
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => onDelete(i.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div></td>
                </tr>)
              })}</tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}

