'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Trash2, Eye, Award, CheckCircle2 } from 'lucide-react'
import { formatDate } from '@/lib/helpers'
import type { Standard, Finding } from './types'
import { STATUSES, CATEGORIES } from './data'

// ==================== HELPERS ====================

export function getStatusBadge(s: string) { const r = STATUSES[s]; return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{s}</Badge> }
export function getCategoryBadge(c: string) { const r = CATEGORIES[c]; return r ? <Badge className={`${r.color} text-xs`}>{r.label}</Badge> : <Badge className="text-xs">{c}</Badge> }

// ==================== KPI CARDS ====================

interface StandardsStats {
  total: number
  active: number
  expiring: number
  inProgress: number
  avgCompliance: number
  openFindings: number
  majorFindings: number
}

export function StandardsKpiCards({ stats }: { stats: StandardsStats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Ukupno</div><p className="text-xl font-bold">{stats.total}</p></Card>
      <Card className="p-4"><div className="text-xs text-emerald-600 mb-1">Aktivni</div><p className="text-xl font-bold text-emerald-700">{stats.active}</p></Card>
      <Card className="p-4"><div className="text-xs text-amber-600 mb-1">Ističu</div><p className="text-xl font-bold text-amber-700">{stats.expiring}</p></Card>
      <Card className="p-4"><div className="text-xs text-blue-600 mb-1">U implement.</div><p className="text-xl font-bold text-blue-700">{stats.inProgress}</p></Card>
      <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Usklađenost</div><p className="text-xl font-bold">{stats.avgCompliance}%</p></Card>
      <Card className="p-4"><div className="text-xs text-red-600 mb-1">Otvoreni nalazi</div><p className="text-xl font-bold text-red-700">{stats.openFindings}</p></Card>
      <Card className="p-4"><div className="text-xs text-red-600 mb-1">Major</div><p className="text-xl font-bold text-red-700">{stats.majorFindings}</p></Card>
    </div>
  )
}

// ==================== TABLE SECTION ====================

interface StandardsTableProps {
  filtered: Standard[]
  search: string
  statusFilter: string
  setSearch: (v: string) => void
  setStatusFilter: (v: string) => void
  onView: (id: string) => void
  onDelete: (id: string) => void
}

export function StandardsTableSection({ filtered, search, statusFilter, setSearch, setStatusFilter, onView, onDelete }: StandardsTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-base">Svi standardi</CardTitle>
          <div className="flex gap-2 items-center">
            <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="ISO, CE..." className="pl-8 h-8 w-40 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
            <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}><SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi</SelectItem>{Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[520px] overflow-y-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead className="text-xs">Standard</TableHead><TableHead className="text-xs">Naziv</TableHead><TableHead className="text-xs">Kategorija</TableHead><TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs hidden md:table-cell">Usklađ.</TableHead><TableHead className="text-xs hidden md:table-cell">Auditor</TableHead>
              <TableHead className="text-xs hidden lg:table-cell">Sledeći audit</TableHead><TableHead className="text-xs hidden lg:table-cell">Nalazi</TableHead>
              <TableHead className="text-xs text-right">Akcije</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.length === 0 ? <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground text-sm">Nema standarda</TableCell></TableRow> : filtered.map(item => {
                const openF = item.findings.filter(f => f.status !== 'closed').length
                return (
                  <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onView(item.id)}>
                    <TableCell className="text-xs font-mono font-bold">{item.code}</TableCell>
                    <TableCell><div className="text-xs font-medium">{item.name}</div><div className="text-xs text-muted-foreground">{item.scope}</div></TableCell>
                    <TableCell>{getCategoryBadge(item.category)}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="hidden md:table-cell"><div className="flex items-center gap-2"><div className={`h-1.5 rounded-full ${item.compliance >= 90 ? 'bg-emerald-500' : item.compliance >= 70 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${item.compliance}%` }} /><span className="text-xs">{item.compliance}%</span></div></TableCell>
                    <TableCell className="text-xs hidden md:table-cell">{item.auditor || '-'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{item.nextAudit ? formatDate(item.nextAudit) : '-'}</TableCell>
                    <TableCell className="hidden lg:table-cell">{openF > 0 ? <Badge className="bg-red-100 text-red-700 text-xs">{openF}</Badge> : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}</TableCell>
                    <TableCell className="text-right"><div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onView(item.id)}><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => onDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div></TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}


// ==================== HEADER ====================

export function StandardsHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30"><Award className="h-5 w-5 text-blue-700 dark:text-blue-400" /></div>
        <div><h1 className="text-2xl font-bold tracking-tight">Standardi kvaliteta</h1><p className="text-sm text-muted-foreground">Upravljanje sertifikatima i usklađenost</p></div>
      </div>
    </div>
  )
}
