'use client'import { AlertTriangle, CalendarDays, ClipboardCheck, Plus, RefreshCw, Search, Target, Trash2, Users } from 'lucide-react'



// ========== OverviewTab ==========

export function OverviewTab({  }: {  }) {
  return (
    <TabsContent value="overview" className="space-y-6">
      {!stats ? (
        <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Usklađenost</span><ShieldCheck className="h-4 w-4 text-green-500" /></div>
              <p className="text-2xl font-bold text-green-600">{stats.complianceRate}%</p>
              <Progress value={stats.complianceRate} className="mt-2 h-2" />
              <p className="text-[10px] text-muted-foreground mt-1">{stats.compliantRequirements}/{stats.totalRequirements} zahteva</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Otvoreni NC</span><AlertOctagon className="h-4 w-4 text-red-500" /></div>
              <p className="text-2xl font-bold text-red-600">{stats.openNC}</p>
              <p className="text-[10px] text-muted-foreground">od {stats.totalNC} ukupno · {stats.criticalNC} kritično</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">CAPA</span><Target className="h-4 w-4 text-amber-500" /></div>
              <p className="text-2xl font-bold text-amber-600">{stats.openCAPA}</p>
              <p className="text-[10px] text-muted-foreground">{stats.overdueCAPA} prekoračenih roka</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Prosek audit</span><ClipboardCheck className="h-4 w-4 text-primary" /></div>
              <p className="text-2xl font-bold">{stats.avgAuditScore}%</p>
              <p className="text-[10px] text-muted-foreground">{stats.completedAudits} od {stats.totalAudits} završenih</p>
            </Card>
          </div>
    
          {stats.overdueRequirements > 0 && (
            <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30 p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">{stats.overdueRequirements} zahtev(a) prekoračio rok usklađenosti!</p>
                  <p className="text-xs text-red-600/70 dark:text-red-400/70">Hitno pregledati i preduzeti mere</p>
                </div>
              </div>
            </Card>
          )}
    
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Usklađenost po kategoriji</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {stats.byCategory.map((c) => (
                  <div key={c.category} className="flex items-center gap-3">
                    <span className="text-xs w-20 truncate">{c.category}</span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div className={`h-2 rounded-full ${c.rate >= 80 ? 'bg-green-500' : c.rate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${c.rate}%` }} />
                    </div>
                    <span className={`text-xs font-bold w-10 text-right ${c.rate >= 80 ? 'text-green-600' : c.rate >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{c.rate}%</span>
                    <span className="text-[10px] text-muted-foreground w-14 text-right">{c.compliant}/{c.total}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
    
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Usklađenost po odeljenju</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {stats.byDepartment.map((d) => (
                  <div key={d.department} className="flex items-center gap-3">
                    <span className="text-xs w-24 truncate">{d.department}</span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div className={`h-2 rounded-full ${d.rate >= 80 ? 'bg-green-500' : d.rate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${d.rate}%` }} />
                    </div>
                    <span className={`text-xs font-bold w-10 text-right ${d.rate >= 80 ? 'text-green-600' : d.rate >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{d.rate}%</span>
                    <span className="text-[10px] text-muted-foreground w-14 text-right">{d.compliant}/{d.total}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
    
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Rizici po nivou</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/10">
                    <p className="text-2xl font-bold text-red-600">{stats.highRisks}</p>
                    <p className="text-[10px] text-red-600/70">Visoko</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10">
                    <p className="text-2xl font-bold text-amber-600">{stats.mediumRisks}</p>
                    <p className="text-[10px] text-amber-600/70">Srednje</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/10">
                    <p className="text-2xl font-bold text-green-600">{stats.lowRisks}</p>
                    <p className="text-[10px] text-green-600/70">Nisko</p>
                  </div>
                </div>
              </CardContent>
            </Card>
    
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Mesečni trend</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {stats.monthlyTrend.map((m) => (
                  <div key={m.month} className="flex items-center gap-3">
                    <span className="text-xs w-10">{m.month}</span>
                    <div className="flex-1 bg-muted rounded-full h-3 relative">
                      <div className="h-3 rounded-full bg-primary/70" style={{ width: `${m.rate}%` }} />
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-medium">{m.rate > 0 ? `${m.rate}%` : ''}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground w-16 text-right">{m.audits} aud · {m.nc} NC</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </TabsContent>
  )
}

// ========== RequirementsTab ==========

export function RequirementsTab({ c, categoryFilter, d, deptFilter, loading, requirements, sc, search, setCategoryFilter, setDeptFilter }: { c: any, categoryFilter: any, d: any, deptFilter: any, loading: any, requirements: any, sc: any, search: any, setCategoryFilter: any, setDeptFilter: any }) {
  return (
    <TabsContent value="requirements" className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži zahteve..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}><SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
        <Select value={deptFilter} onValueChange={setDeptFilter}><SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger><SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
        <Button size="sm" onClick={() => { setReqForm(emptyReqForm); openCreate('requirement') }}><Plus className="h-4 w-4 mr-1" /> Novi zahtev</Button>
      </div>
    
      {loading ? <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div> : (
        <div className="space-y-3">
          {requirements.filter((r) => {
            if (categoryFilter !== 'Sve' && r.category !== categoryFilter) return false
            if (deptFilter !== 'Svi' && r.department !== deptFilter) return false
            if (search) { const s = search.toLowerCase(); return r.title.toLowerCase().includes(s) || r.regulation.toLowerCase().includes(s) || r.number.toLowerCase().includes(s) }
            return true
          }).map((r) => {
            const sc = REQ_STATUS[r.status]
            return (
              <Card key={r.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openDetail(r)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono text-muted-foreground">{r.number}</span>
                        <Badge variant="outline" className={`text-[10px] ${sc?.color}`}>{sc?.label}</Badge>
                        <Badge variant="secondary" className="text-[10px]">{r.category}</Badge>
                        <Badge variant="outline" className="text-[10px]">{r.regulation}</Badge>
                      </div>
                      <h3 className="text-sm font-medium">{r.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span><Users className="h-3 w-3 inline mr-1" />{r.owner}</span>
                        <span>{r.department}</span>
                        <span><CalendarDays className="h-3 w-3 inline mr-1" />Rok: {formatDate(r.dueDate)}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {r.status === 'non_compliant' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleStatusChange('requirement', r.id, 'partial') }}>Na čekanju</Button>}
                      {r.status === 'pending' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleStatusChange('requirement', r.id, 'partial') }}>Započni</Button>}
                      {r.status === 'partial' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleStatusChange('requirement', r.id, 'compliant') }}>Usklađeno</Button>}
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-red-500" onClick={(e) => { e.stopPropagation(); handleDelete('requirement', r.id) }}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </TabsContent>
  )
}

// ========== AuditsTab ==========

export function AuditsTab({ audits, sc }: { audits: any, sc: any }) {
  return (
    <TabsContent value="audits" className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => toast.info('Audit zakazivanje - uskoro')}><Plus className="h-4 w-4 mr-1" /> Novi audit</Button>
      </div>
      <div className="space-y-3">
        {audits.map((a) => {
          const sc = AUDIT_STATUS[a.status]
          return (
            <Card key={a.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openDetail(a)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground">{a.number}</span>
                      <Badge variant="outline" className={`text-[10px] ${sc?.color}`}>{sc?.label}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{a.type === 'internal' ? 'Interni' : 'Eksterni'}</Badge>
                      <Badge variant="outline" className="text-[10px]">{a.department}</Badge>
                    </div>
                    <h3 className="text-sm font-medium">{a.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{a.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span><Users className="h-3 w-3 inline mr-1" />{a.auditor}</span>
                      <span><CalendarDays className="h-3 w-3 inline mr-1" />{formatDate(a.scheduledDate)}</span>
                      {a.score !== null && <span className="font-medium text-foreground">Ocena: {a.score}/{a.maxScore}</span>}
                      {a.findings > 0 && <span className="text-red-500">{a.findings} nalaza{a.criticalFindings > 0 ? ` (${a.criticalFindings} krit.)` : ''}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {a.status === 'planned' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleStatusChange('audit', a.id, 'in_progress') }}>Započni</Button>}
                    {a.status === 'in_progress' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleStatusChange('audit', a.id, 'completed') }}>Završi</Button>}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </TabsContent>
  )
}

// ========== NcTab ==========

export function NcTab({ isOverdue, ncList, search, sev, st }: { isOverdue: any, ncList: any, search: any, sev: any, st: any }) {
  return (
    <TabsContent value="nc" className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži neusklađenosti..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <Button size="sm" onClick={() => { setNcForm(emptyNcForm); openCreate('nc') }}><Plus className="h-4 w-4 mr-1" /> Novi NC</Button>
      </div>
      <div className="space-y-3">
        {ncList.filter((n) => {
          if (search) { const s = search.toLowerCase(); return n.title.toLowerCase().includes(s) || n.number.toLowerCase().includes(s) }
          return true
        }).map((n) => {
          const sev = NC_SEVERITY[n.severity]
          const isOverdue = new Date(n.dueDate) < new Date() && (n.status === 'open' || n.status === 'in_progress')
          return (
            <Card key={n.id} className={`hover:shadow-md transition-shadow cursor-pointer ${isOverdue ? 'border-red-200' : ''}`} onClick={() => openDetail(n)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground">{n.number}</span>
                      <Badge variant="outline" className={`text-[10px] ${sev?.color}`}>{sev?.label}</Badge>
                      <Badge variant="outline" className={`text-[10px] ${st?.color}`}>{st?.label}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{n.type === 'product' ? 'Proizvod' : n.type === 'process' ? 'Proces' : n.type === 'safety' ? 'Bezbednost' : 'Dokument'}</Badge>
                      {isOverdue && <Badge className="text-[10px] bg-red-500 text-white">PREKORAČEN ROK</Badge>}
                    </div>
                    <h3 className="text-sm font-medium">{n.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{n.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span><Users className="h-3 w-3 inline mr-1" />{n.responsible}</span>
                      <span>{n.department}</span>
                      <span><CalendarDays className="h-3 w-3 inline mr-1" />Rok: {formatDate(n.dueDate)}</span>
                      {n.costImpact > 0 && <span className="text-red-500 font-medium">{formatCurrency(n.costImpact)}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {n.status === 'open' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleStatusChange('nc', n.id, 'in_progress') }}>Rešavaj</Button>}
                    {n.status === 'in_progress' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleStatusChange('nc', n.id, 'closed') }}>Zatvori</Button>}
                    {n.status === 'closed' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleStatusChange('nc', n.id, 'verified') }}>Verifikuj</Button>}
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-red-500" onClick={(e) => { e.stopPropagation(); handleDelete('nc', n.id) }}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </TabsContent>
  )
}

// ========== CapaTab ==========

export function CapaTab({ capaList, isOverdue, st }: { capaList: any, isOverdue: any, st: any }) {
  return (
    <TabsContent value="capa" className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setCapaForm(emptyCapaForm); openCreate('capa') }}><Plus className="h-4 w-4 mr-1" /> Novi CAPA</Button>
      </div>
      <div className="space-y-3">
        {capaList.map((c) => {
          const st = CAPA_STATUS[c.status]
          const isOverdue = new Date(c.dueDate) < new Date() && (c.status === 'open' || c.status === 'in_progress')
          return (
            <Card key={c.id} className={`hover:shadow-md transition-shadow cursor-pointer ${isOverdue ? 'border-red-200' : ''}`} onClick={() => openDetail(c)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground">{c.number}</span>
                      <Badge variant="outline" className={`text-[10px] ${st?.color}`}>{st?.label}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{c.type === 'corrective' ? 'Korektivna' : 'Preventivna'}</Badge>
                      {c.linkedNc && <Badge variant="outline" className="text-[10px]">→ {c.linkedNc}</Badge>}
                      {isOverdue && <Badge className="text-[10px] bg-red-500 text-white">PREKORAČEN ROK</Badge>}
                    </div>
                    <h3 className="text-sm font-medium">{c.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{c.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span><Users className="h-3 w-3 inline mr-1" />{c.owner}</span>
                      <span>{c.department}</span>
                      <span><CalendarDays className="h-3 w-3 inline mr-1" />Rok: {formatDate(c.dueDate)}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {c.status === 'open' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleStatusChange('capa', c.id, 'in_progress') }}>Implementiraj</Button>}
                    {c.status === 'in_progress' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleStatusChange('capa', c.id, 'completed') }}>Završi</Button>}
                    {c.status === 'completed' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleStatusChange('capa', c.id, 'verified') }}>Verifikuj</Button>}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </TabsContent>
  )
}

// ========== RisksTab ==========

export function RisksTab({ lv, risks, rlv }: { lv: any, risks: any, rlv: any }) {
  return (
    <TabsContent value="risks" className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setRiskForm(emptyRiskForm); openCreate('risk') }}><Plus className="h-4 w-4 mr-1" /> Novi rizik</Button>
      </div>
      <div className="space-y-3">
        {risks.map((r) => {
          const lv = RISK_LEVELS[r.riskLevel]
          return (
            <Card key={r.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openDetail(r)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground">{r.number}</span>
                      <Badge variant="outline" className={`text-[10px] ${lv?.color}`}>{lv?.label} ({r.riskScore})</Badge>
                      <Badge variant="secondary" className="text-[10px]">{r.category}</Badge>
                      <Badge variant="outline" className="text-[10px]">{r.department}</Badge>
                    </div>
                    <h3 className="text-sm font-medium">{r.title}</h3>
                    <div className="flex items-center gap-6 mt-2 text-xs text-muted-foreground">
                      <span>Verovatnoća: <strong>{r.likelihood}</strong></span>
                      <span>Uticaj: <strong>{r.impact}</strong></span>
                      <span>Rezidualni: <Badge variant="outline" className={`text-[9px] ${rlv?.color}`}>{rlv?.label} ({r.residualScore})</Badge></span>
                      <span><CalendarDays className="h-3 w-3 inline mr-1" />Pregled: {formatDate(r.reviewDate)}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-red-500" onClick={(e) => { e.stopPropagation(); handleDelete('risk', r.id) }}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </TabsContent>
  )
}

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TabsContent } from '@/components/ui/tabs'

// ========== DialogBlock0 ==========

export function DialogBlock0({ detailOpen, selectedItem, setDetailOpen }: { detailOpen: any, selectedItem: any, setDetailOpen: any }) {
  return (
    <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
            <DialogContent className="max-w-2xl max-h-[85vh]">
              <ScrollArea className="max-h-[75vh] pr-4">
                {selectedItem && 'owner' in selectedItem && 'description' in selectedItem && (
                  <div className="space-y-6">
                    <DialogHeader>
                      <DialogTitle className="text-lg">
                        {'number' in selectedItem ? `${(selectedItem as { number: string }).number}` : ''} — {(selectedItem as { title: string }).title}
                      </DialogTitle>
                      <DialogDescription>{'department' in selectedItem ? (selectedItem as { department: string }).department : ''} · {'owner' in selectedItem ? (selectedItem as { owner: string }).owner : ''}</DialogDescription>
                    </DialogHeader>
    
                    {/* Requirement detail */}
                    {'regulation' in selectedItem && (
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Badge variant="outline" className={REQ_STATUS[(selectedItem as Requirement).status]?.color}>{REQ_STATUS[(selectedItem as Requirement).status]?.label}</Badge>
                          <Badge variant="secondary">{(selectedItem as Requirement).category}</Badge>
                          <Badge variant="outline">{(selectedItem as Requirement).regulation}</Badge>
                        </div>
                        <div><h4 className="text-sm font-medium mb-2">Opis</h4><div className="p-3 rounded-lg bg-muted/50 text-sm whitespace-pre-wrap">{(selectedItem as Requirement).description}</div></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Dokaz</p><p className="text-sm">{(selectedItem as Requirement).evidence || '—'}</p></div>
                          <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Rok</p><p className="text-sm">{formatDate((selectedItem as Requirement).dueDate)}</p></div>
                        </div>
                        {(selectedItem as Requirement).notes && <div><h4 className="text-sm font-medium mb-2">Napomene</h4><div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-sm">{(selectedItem as Requirement).notes}</div></div>}
                      </div>
                    )}
    
                    {/* NC detail */}
                    {'severity' in selectedItem && 'costImpact' in selectedItem && !('checklist' in selectedItem) && (
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Badge variant="outline" className={NC_SEVERITY[(selectedItem as NonConformance).severity]?.color}>{NC_SEVERITY[(selectedItem as NonConformance).severity]?.label}</Badge>
                          <Badge variant="outline" className={NC_STATUS[(selectedItem as NonConformance).status]?.color}>{NC_STATUS[(selectedItem as NonConformance).status]?.label}</Badge>
                        </div>
                        <div><h4 className="text-sm font-medium mb-2">Opis</h4><div className="p-3 rounded-lg bg-muted/50 text-sm whitespace-pre-wrap">{(selectedItem as NonConformance).description}</div></div>
                        {(selectedItem as NonConformance).rootCause && <div><h4 className="text-sm font-medium mb-2">Koreni uzrok</h4><div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-sm">{(selectedItem as NonConformance).rootCause}</div></div>}
                        {(selectedItem as NonConformance).correctiveAction && <div><h4 className="text-sm font-medium mb-2">Korektivna mera</h4><div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-sm whitespace-pre-wrap">{(selectedItem as NonConformance).correctiveAction}</div></div>}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Odgovoran</p><p className="text-sm">{(selectedItem as NonConformance).responsible}</p></div>
                          <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Finansijski uticaj</p><p className="text-sm font-bold text-red-600">{formatCurrency((selectedItem as NonConformance).costImpact)}</p></div>
                        </div>
                        {(selectedItem as NonConformance).verification && <div><h4 className="text-sm font-medium mb-2">Verifikacija</h4><div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-sm">{(selectedItem as NonConformance).verification}</div></div>}
                      </div>
                    )}
    
                    {/* Audit detail */}
                    {'checklist' in selectedItem && (
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Badge variant="outline" className={AUDIT_STATUS[(selectedItem as Audit).status]?.color}>{AUDIT_STATUS[(selectedItem as Audit).status]?.label}</Badge>
                          <Badge variant="secondary">{(selectedItem as Audit).type === 'internal' ? 'Interni' : 'Eksterni'}</Badge>
                          {(selectedItem as Audit).score !== null && <Badge variant="outline">Ocena: {(selectedItem as Audit).score}/{(selectedItem as Audit).maxScore}</Badge>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Auditor</p><p className="text-sm">{(selectedItem as Audit).auditor}</p></div>
                          <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Datum</p><p className="text-sm">{formatDate((selectedItem as Audit).scheduledDate)}</p></div>
                        </div>
                        {(selectedItem as Audit).checklist.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-3">Checklista ({(selectedItem as Audit).checklist.length} stavki)</h4>
                            <div className="space-y-2">
                              {(selectedItem as Audit).checklist.map((ci) => (
                                <div key={ci.id} className="flex items-center gap-3 p-2 rounded border text-xs">
                                  <Badge variant={ci.status === 'pass' ? 'default' : ci.status === 'fail' ? 'destructive' : ci.status === 'partial' ? 'secondary' : 'outline'} className="text-[9px] w-14 justify-center">
                                    {ci.status === 'pass' ? 'OK' : ci.status === 'fail' ? 'NOK' : ci.status === 'partial' ? 'DEO' : 'N/A'}
                                  </Badge>
                                  <span className="font-mono text-muted-foreground w-10">{ci.clause}</span>
                                  <span className="flex-1">{ci.requirement}</span>
                                  {ci.notes && <span className="text-muted-foreground truncate max-w-[200px]">{ci.notes}</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
    
                    {/* CAPA detail */}
                    {'actionPlan' in selectedItem && !('checklist' in selectedItem) && !('severity' in selectedItem) && !('regulation' in selectedItem) && (
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Badge variant="outline" className={CAPA_STATUS[(selectedItem as CAPA).status]?.color}>{CAPA_STATUS[(selectedItem as CAPA).status]?.label}</Badge>
                          <Badge variant="secondary">{(selectedItem as CAPA).type === 'corrective' ? 'Korektivna' : 'Preventivna'}</Badge>
                          {(selectedItem as CAPA).linkedNc && <Badge variant="outline">→ {(selectedItem as CAPA).linkedNc}</Badge>}
                        </div>
                        <div><h4 className="text-sm font-medium mb-2">Opis</h4><div className="p-3 rounded-lg bg-muted/50 text-sm whitespace-pre-wrap">{(selectedItem as CAPA).description}</div></div>
                        {(selectedItem as CAPA).rootCause && <div><h4 className="text-sm font-medium mb-2">Koreni uzrok</h4><div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-sm">{(selectedItem as CAPA).rootCause}</div></div>}
                        {(selectedItem as CAPA).actionPlan && <div><h4 className="text-sm font-medium mb-2">Plan akcija</h4><div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-sm whitespace-pre-wrap">{(selectedItem as CAPA).actionPlan}</div></div>}
                        {(selectedItem as CAPA).effectiveness && <div><h4 className="text-sm font-medium mb-2">Efektivnost</h4><div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-sm">{(selectedItem as CAPA).effectiveness}</div></div>}
                      </div>
                    )}
    
                    {/* Risk detail */}
                    {'riskScore' in selectedItem && 'mitigationPlan' in selectedItem && 'likelihood' in selectedItem && !('actionPlan' in selectedItem) && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Nivo rizika</p><p className="text-lg font-bold">{(selectedItem as RiskAssessment).riskScore} - <Badge variant="outline" className={RISK_LEVELS[(selectedItem as RiskAssessment).riskLevel]?.color}>{RISK_LEVELS[(selectedItem as RiskAssessment).riskLevel]?.label}</Badge></p></div>
                          <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Rezidualni</p><p className="text-lg font-bold">{(selectedItem as RiskAssessment).residualScore} - <Badge variant="outline" className={RISK_LEVELS[(selectedItem as RiskAssessment).residualLevel]?.color}>{RISK_LEVELS[(selectedItem as RiskAssessment).residualLevel]?.label}</Badge></p></div>
                        </div>
                        <div className="grid grid-cols-4 gap-3 text-center">
                          <div className="p-2 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Verovatnoća</p><p className="font-bold">{(selectedItem as RiskAssessment).likelihood}</p></div>
                          <div className="p-2 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Uticaj</p><p className="font-bold">{(selectedItem as RiskAssessment).impact}</p></div>
                          <div className="p-2 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Rez. ver.</p><p className="font-bold">{(selectedItem as RiskAssessment).residualLikelihood}</p></div>
                          <div className="p-2 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Rez. ut.</p><p className="font-bold">{(selectedItem as RiskAssessment).residualImpact}</p></div>
                        </div>
                        <div><h4 className="text-sm font-medium mb-2">Postojeće kontrole</h4><div className="p-3 rounded-lg bg-muted/50 text-sm">{(selectedItem as RiskAssessment).existingControls}</div></div>
                        <div><h4 className="text-sm font-medium mb-2">Plan mitigacije</h4><div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-sm whitespace-pre-wrap">{(selectedItem as RiskAssessment).mitigationPlan}</div></div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>
  )
}


// ========== CreateTyperequirement ==========

export function CreateTyperequirement({ c, createOpen, d, handleCreate, o, setCreateOpen }: { c: any, createOpen: any, d: any, handleCreate: any, o: any, setCreateOpen: any }) {
  return (
    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {createType === 'requirement' ? 'Novi zahtev usklađenosti' : createType === 'nc' ? 'Nova neusklađenost' : createType === 'capa' ? 'Novi CAPA' : 'Nova procena rizika'}
                </DialogTitle>
                <DialogDescription>Popunite podatke za novi zapis</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
                {createType === 'requirement' && (
                  <>
                    <div className="space-y-2"><Label>Naslov *</Label><Input value={reqForm.title} onChange={(e) => setReqForm({ ...reqForm, title: e.target.value })} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2"><Label>Regulativa</Label><Input value={reqForm.regulation} onChange={(e) => setReqForm({ ...reqForm, regulation: e.target.value })} placeholder="npr. ISO 9001 kl.8.5" /></div>
                      <div className="space-y-2"><Label>Kategorija</Label><Select value={reqForm.category} onValueChange={(v) => setReqForm({ ...reqForm, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.filter((c) => c !== 'Sve').map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2"><Label>Prioritet</Label><Select value={reqForm.priority} onValueChange={(v) => setReqForm({ ...reqForm, priority: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Nizak</SelectItem><SelectItem value="medium">Srednji</SelectItem><SelectItem value="high">Visok</SelectItem></SelectContent></Select></div>
                      <div className="space-y-2"><Label>Odeljenje</Label><Select value={reqForm.department} onValueChange={(v) => setReqForm({ ...reqForm, department: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DEPARTMENTS.filter((d) => d !== 'Svi').map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
                      <div className="space-y-2"><Label>Odgovoran</Label><Select value={reqForm.owner} onValueChange={(v) => setReqForm({ ...reqForm, owner: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{OWNERS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
                    </div>
                    <div className="space-y-2"><Label>Rok</Label><Input type="date" value={reqForm.dueDate} onChange={(e) => setReqForm({ ...reqForm, dueDate: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Opis</Label><Textarea rows={3} value={reqForm.description} onChange={(e) => setReqForm({ ...reqForm, description: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Dokaz</Label><Input value={reqForm.evidence} onChange={(e) => setReqForm({ ...reqForm, evidence: e.target.value })} placeholder="Referenca dokumenta" /></div>
                  </>
                )}
    
                {createType === 'nc' && (
                  <>
                    <div className="space-y-2"><Label>Naslov *</Label><Input value={ncForm.title} onChange={(e) => setNcForm({ ...ncForm, title: e.target.value })} /></div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2"><Label>Ozbiljnost</Label><Select value={ncForm.severity} onValueChange={(v) => setNcForm({ ...ncForm, severity: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="critical">Kritično</SelectItem><SelectItem value="major">Veće</SelectItem><SelectItem value="minor">Manje</SelectItem><SelectItem value="observation">Posmatranje</SelectItem></SelectContent></Select></div>
                      <div className="space-y-2"><Label>Tip</Label><Select value={ncForm.type} onValueChange={(v) => setNcForm({ ...ncForm, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="product">Proizvod</SelectItem><SelectItem value="process">Proces</SelectItem><SelectItem value="safety">Bezbednost</SelectItem><SelectItem value="document">Dokument</SelectItem></SelectContent></Select></div>
                      <div className="space-y-2"><Label>Izvor</Label><Select value={ncForm.source} onValueChange={(v) => setNcForm({ ...ncForm, source: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Interna kontrola">Interna kontrola</SelectItem><SelectItem value="Interni audit">Interni audit</SelectItem><SelectItem value="Inspekcija">Inspekcija</SelectItem><SelectItem value="Kupac">Kupac</SelectItem><SelectItem value="Zakonska zahteva">Zakonska zahteva</SelectItem></SelectContent></Select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2"><Label>Odeljenje</Label><Select value={ncForm.department} onValueChange={(v) => setNcForm({ ...ncForm, department: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DEPARTMENTS.filter((d) => d !== 'Svi').map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
                      <div className="space-y-2"><Label>Odgovoran</Label><Select value={ncForm.responsible} onValueChange={(v) => setNcForm({ ...ncForm, responsible: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{OWNERS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
                    </div>
                    <div className="space-y-2"><Label>Rok rešavanja</Label><Input type="date" value={ncForm.dueDate} onChange={(e) => setNcForm({ ...ncForm, dueDate: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Opis neusklađenosti</Label><Textarea rows={3} value={ncForm.description} onChange={(e) => setNcForm({ ...ncForm, description: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Koreni uzrok</Label><Textarea rows={2} value={ncForm.rootCause} onChange={(e) => setNcForm({ ...ncForm, rootCause: e.target.value })} /></div>
                  </>
                )}
    
                {createType === 'capa' && (
                  <>
                    <div className="space-y-2"><Label>Naslov *</Label><Input value={capaForm.title} onChange={(e) => setCapaForm({ ...capaForm, title: e.target.value })} /></div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2"><Label>Tip</Label><Select value={capaForm.type} onValueChange={(v) => setCapaForm({ ...capaForm, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="corrective">Korektivna</SelectItem><SelectItem value="preventive">Preventivna</SelectItem></SelectContent></Select></div>
                      <div className="space-y-2"><Label>Prioritet</Label><Select value={capaForm.priority} onValueChange={(v) => setCapaForm({ ...capaForm, priority: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Nizak</SelectItem><SelectItem value="medium">Srednji</SelectItem><SelectItem value="high">Visok</SelectItem></SelectContent></Select></div>
                      <div className="space-y-2"><Label>Odeljenje</Label><Select value={capaForm.department} onValueChange={(v) => setCapaForm({ ...capaForm, department: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DEPARTMENTS.filter((d) => d !== 'Svi').map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2"><Label>Odgovoran</Label><Select value={capaForm.owner} onValueChange={(v) => setCapaForm({ ...capaForm, owner: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{OWNERS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
                      <div className="space-y-2"><Label>Rok</Label><Input type="date" value={capaForm.dueDate} onChange={(e) => setCapaForm({ ...capaForm, dueDate: e.target.value })} /></div>
                    </div>
                    <div className="space-y-2"><Label>Opis</Label><Textarea rows={2} value={capaForm.description} onChange={(e) => setCapaForm({ ...capaForm, description: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Koreni uzrok</Label><Textarea rows={2} value={capaForm.rootCause} onChange={(e) => setCapaForm({ ...capaForm, rootCause: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Plan akcija</Label><Textarea rows={3} value={capaForm.actionPlan} onChange={(e) => setCapaForm({ ...capaForm, actionPlan: e.target.value })} /></div>
                  </>
                )}
    
                {createType === 'risk' && (
                  <>
                    <div className="space-y-2"><Label>Naslov *</Label><Input value={riskForm.title} onChange={(e) => setRiskForm({ ...riskForm, title: e.target.value })} /></div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2"><Label>Kategorija</Label><Select value={riskForm.category} onValueChange={(v) => setRiskForm({ ...riskForm, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Operativno">Operativno</SelectItem><SelectItem value="Finansijsko">Finansijsko</SelectItem><SelectItem value="IT Sigurnost">IT Sigurnost</SelectItem><SelectItem value="Regulatorni">Regulatorni</SelectItem><SelectItem value="Bezbednost">Bezbednost</SelectItem><SelectItem value="Nabavka">Nabavka</SelectItem><SelectItem value="Reputaciono">Reputaciono</SelectItem></SelectContent></Select></div>
                      <div className="space-y-2"><Label>Odeljenje</Label><Select value={riskForm.department} onValueChange={(v) => setRiskForm({ ...riskForm, department: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DEPARTMENTS.filter((d) => d !== 'Svi').map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
                      <div className="space-y-2"><Label>Odgovoran</Label><Select value={riskForm.owner} onValueChange={(v) => setRiskForm({ ...riskForm, owner: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{OWNERS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2"><Label>Verovatnoća (1-5)</Label><Input type="number" min={1} max={5} value={riskForm.likelihood} onChange={(e) => setRiskForm({ ...riskForm, likelihood: parseInt(e.target.value) || 1 })} /></div>
                      <div className="space-y-2"><Label>Uticaj (1-5)</Label><Input type="number" min={1} max={5} value={riskForm.impact} onChange={(e) => setRiskForm({ ...riskForm, impact: parseInt(e.target.value) || 1 })} /></div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <p className="text-xs text-muted-foreground">Skor rizika</p>
                      <p className="text-xl font-bold">{riskForm.likelihood * riskForm.impact} - <Badge variant="outline" className={RISK_LEVELS[riskForm.likelihood * riskForm.impact >= 20 ? 'extreme' : riskForm.likelihood * riskForm.impact >= 12 ? 'high' : riskForm.likelihood * riskForm.impact >= 6 ? 'medium' : 'low']?.color}>{RISK_LEVELS[riskForm.likelihood * riskForm.impact >= 20 ? 'extreme' : riskForm.likelihood * riskForm.impact >= 12 ? 'high' : riskForm.likelihood * riskForm.impact >= 6 ? 'medium' : 'low']?.label}</Badge></p>
                    </div>
                    <div className="space-y-2"><Label>Datum pregleda</Label><Input type="date" value={riskForm.reviewDate} onChange={(e) => setRiskForm({ ...riskForm, reviewDate: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Postojeće kontrole</Label><Textarea rows={2} value={riskForm.existingControls} onChange={(e) => setRiskForm({ ...riskForm, existingControls: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Plan mitigacije</Label><Textarea rows={2} value={riskForm.mitigationPlan} onChange={(e) => setRiskForm({ ...riskForm, mitigationPlan: e.target.value })} /></div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Otkaži</Button>
                <Button onClick={handleCreate}><Plus className="h-4 w-4 mr-1" /> Kreiraj</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
  )
}

