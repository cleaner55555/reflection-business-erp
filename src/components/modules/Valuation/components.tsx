'use client'

import { useState } from 'react'

from '@/components/ui/badge'
from '@/components/ui/button'
from '@/components/ui/card'
from '@/components/ui/dialog'
from '@/components/ui/input'
from '@/components/ui/label'
from '@/components/ui/progress'
from '@/components/ui/select'
from '@/components/ui/tabs'
from '@/components/ui/textarea'
import { , Star , Award, Target, TrendingUp} from 'lucide-react', AlertTriangle, Award, CalendarDays, CheckCircle2, ChevronRight, Clock, Plus, RefreshCw, Search, Target, Trash2, TrendingUp, Users } from 'lucide-react'
import type { Employee, CompetencyScore, Appraisal, Criterion, PeriodData } from './types'

function StarRating({ value, max = 5, interactive = false, onChange }: { value: number; max?: number; interactive?: boolean; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  const display = hovered || value
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button key={star} type="button"
          className={`h-4 w-4 transition-colors ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onChange?.(star)}
          disabled={!interactive}
        >
          <Star className={`h-4 w-4 ${star <= display ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
        </button>
      ))}
    </div>
  )
}

// ========== OverviewTab ==========

export function OverviewTab({ appraisals, completed, deptAverages, loading, pending, ratingDistribution, topPerformers }: { appraisals: any, completed: any, deptAverages: any, loading: any, pending: any, ratingDistribution: any, topPerformers: any }) {
  return (
    <TabsContent value="pregled" className="space-y-6">
      {loading ? (
        <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Prosečna ocena</span>
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              </div>
              <p className={`text-2xl font-bold ${getRatingColor(avgRating)}`}>{avgRating}/5</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <span className="text-[10px] text-emerald-500">+0.3 vs prethodni period</span>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Završena ocenjivanja</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold">{completed.length}</p>
              <p className="text-[10px] text-muted-foreground mt-1">od {appraisals.length} ukupno</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Na čekanju</span>
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-amber-600">{pending.length}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{pending.filter(p => p.status === 'zatrazeno').length} novih, {pending.filter(p => p.status === 'u_toku').length} u toku</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Oblasti pokrivene</span>
                <Users className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{deptsCovered}</p>
              <p className="text-[10px] text-muted-foreground mt-1">od {DEPARTMENTS.length} sektora</p>
            </Card>
          </div>
    
          {/* Distribution & Department Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Distribucija ocena</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {ratingDistribution.map(d => (
                  <div key={d.rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-8">
                      <span className="text-sm font-medium">{d.rating}</span>
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    </div>
                    <div className="flex-1 bg-muted rounded-full h-3">
                      <div className={`h-3 rounded-full transition-all ${d.rating >= 4 ? 'bg-emerald-400' : d.rating >= 3 ? 'bg-amber-400' : 'bg-red-400'}`}
                        style={{ width: `${(d.count / maxDistCount) * 100}%` }} />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{d.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
    
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Poređenje po sektorima</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {deptAverages.map(d => (
                  <div key={d.department} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <span className="text-sm font-medium">{d.department}</span>
                      <span className="text-[10px] text-muted-foreground">({d.count})</span>
                    </div>
                    <div className="flex items-center gap-3 flex-1 ml-4">
                      <div className="flex-1 bg-muted rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full ${getRatingBarColor(d.avg)}`}
                          style={{ width: `${(d.avg / 5) * 100}%` }} />
                      </div>
                      <span className={`text-sm font-bold w-8 text-right ${getRatingColor(d.avg)}`}>{d.avg.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
                {deptAverages.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">Nema podataka</p>
                )}
              </CardContent>
            </Card>
          </div>
    
          {/* Top Performers */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Najbolje ocenjeni zaposleni</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topPerformers.map((ap, idx) => (
                  <div key={ap.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-amber-700' : 'bg-muted text-muted-foreground'}`}>
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{ap.employeeName}</p>
                        <p className="text-xs text-muted-foreground">{ap.department} · {ap.period}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating value={Math.round(ap.overallRating)} />
                      <span className={`text-sm font-bold ${getRatingColor(ap.overallRating)}`}>{ap.overallRating.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </TabsContent>
  )
}

// ========== OcenjivanjeTab ==========

export function OcenjivanjeTab({ d, deptFilter, filteredAppraisals, k, loading, mockPeriods, periodFilter, search, setDeptFilter, setPeriodFilter, setStatusFilter, stCfg, statusFilter }: { d: any, deptFilter: any, filteredAppraisals: any, k: any, loading: any, mockPeriods: any, periodFilter: any, search: any, setDeptFilter: any, setPeriodFilter: any, setStatusFilter: any, stCfg: any, statusFilter: any }) {
  return (
    <TabsContent value="ocenjivanje" className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pretraži zaposlene..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Svi statusi" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Svi statusi</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Svi sektori" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Svi sektori</SelectItem>
            {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Svi periodi" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Svi periodi</SelectItem>
            {mockPeriods.map(p => <SelectItem key={p.period} value={p.period}>{p.period}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    
      {loading ? (
        <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filteredAppraisals.length === 0 ? (
        <Card className="p-8 text-center">
          <Star className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Nema ocenjivanja</p>
          <Button variant="outline" className="mt-3" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Kreiraj ocenjivanje
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAppraisals.map(ap => {
            const stCfg = STATUS_CONFIG[ap.status]
            return (
              <Card key={ap.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelected(ap); setViewOpen(true) }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold ${ap.status === 'zavrseno' ? 'bg-emerald-500' : ap.status === 'u_toku' ? 'bg-blue-500' : ap.status === 'zatrazeno' ? 'bg-amber-500' : 'bg-gray-400'}`}>
                        {ap.employeeName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-medium truncate">{ap.employeeName}</h3>
                          <Badge variant="outline" className={`text-[10px] shrink-0 ${stCfg?.color}`}>{stCfg?.label}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{ap.department}</span>
                          <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{ap.period}</span>
                          {ap.evaluatedBy && <span>Eval: {ap.evaluatedBy}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-3">
                      {ap.status === 'zavrseno' ? (
                        <div className="flex items-center gap-2">
                          <StarRating value={Math.round(ap.overallRating)} />
                          <span className={`text-lg font-bold ${getRatingColor(ap.overallRating)}`}>{ap.overallRating.toFixed(1)}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          {ap.status === 'zatrazeno' && <Clock className="h-4 w-4" />}
                          {ap.status === 'u_toku' && <AlertTriangle className="h-4 w-4" />}
                          <span className="text-xs">{stCfg?.label}</span>
                        </div>
                      )}
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive shrink-0" onClick={e => { e.stopPropagation(); handleDelete(ap.id) }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
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

// ========== KriterijumiTab ==========

export function KriterijumiTab({ criteria }: { criteria: any }) {
  return (
    <TabsContent value="kriterijumi" className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Kriterijumi ocenjivanja</CardTitle>
            <Badge variant="outline" className="text-[10px]">Ukupna težina: {criteria.filter(c => c.active).reduce((s, c) => s + c.weight, 0)}%</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {criteria.map(crit => {
              const catLabel = crit.category === 'kompetencije' ? 'Kompetencije' : crit.category === 'kpi' ? 'KPI' : 'Ciljevi'
              const catColor = crit.category === 'kompetencije' ? 'bg-blue-50 text-blue-700 border-blue-200' : crit.category === 'kpi' ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              return (
                <div key={crit.id} className={`p-4 rounded-lg border ${crit.active ? 'border-border' : 'border-dashed border-muted-foreground/30 opacity-60'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold">{crit.name}</h3>
                      <Badge variant="outline" className={`text-[10px] ${catColor}`}>{catLabel}</Badge>
                      {!crit.active && <Badge variant="outline" className="text-[10px] bg-gray-100 text-gray-500">Neaktivan</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary">{crit.weight}%</span>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => {
                        setCriteria(criteria.map(c => c.id === crit.id ? { ...c, active: !c.active } : c))
                        toast.success(crit.active ? `Kriterijum "${crit.name}" deaktiviran` : `Kriterijum "${crit.name}" aktiviran`)
                      }}>
                        {crit.active ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertTriangle className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{crit.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">Skala ocenjivanja:</span>
                    <div className="flex gap-1">
                      {Array.from({ length: crit.scaleMax }, (_, i) => i + 1).map(v => (
                        <Badge key={v} variant="outline" className="text-[10px] px-1.5">{v}</Badge>
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground ml-2">(1 - Nedovoljno, {crit.scaleMax} - Izuzetno)</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    
      {/* Scoring Scale Reference */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Opis skala ocenjivanja</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {[
              { value: 5, label: 'Izuzetno', desc: 'Znatno premašuje očekivanja', color: 'bg-emerald-50 border-emerald-200' },
              { value: 4, label: 'Odlično', desc: 'Premašuje očekivanja', color: 'bg-emerald-50 border-emerald-100' },
              { value: 3, label: 'Dobro', desc: 'Ispunjava očekivanja', color: 'bg-amber-50 border-amber-200' },
              { value: 2, label: 'Potrebno unapređenje', desc: 'Djelomično ispunjava', color: 'bg-orange-50 border-orange-200' },
              { value: 1, label: 'Nedovoljno', desc: 'Ne ispunjava očekivanja', color: 'bg-red-50 border-red-200' },
            ].map(sc => (
              <div key={sc.value} className={`p-3 rounded-lg border ${sc.color}`}>
                <div className="flex items-center gap-1 mb-1">
                  <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold">{sc.value}</span>
                </div>
                <p className="text-xs font-medium">{sc.label}</p>
                <p className="text-[10px] text-muted-foreground">{sc.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}

// ========== ReportsTab ==========

export function ReportsTab({ completed, criteria, deptAp, loading, mockPeriods, scores, topPerformers }: { completed: any, criteria: any, deptAp: any, loading: any, mockPeriods: any, scores: any, topPerformers: any }) {
  return (
    <TabsContent value="izvestaji" className="space-y-6">
      {loading ? (
        <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          {/* Period Trend */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Trend po periodima</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-end gap-8 h-40">
                {mockPeriods.map(p => {
                  const prevIdx = mockPeriods.indexOf(p) - 1
                  const prev = prevIdx >= 0 ? mockPeriods[prevIdx].avgRating : null
                  const trend = prev !== null ? p.avgRating - prev : 0
                  return (
                    <div key={p.period} className="flex-1 flex flex-col items-center gap-2">
                      <span className={`text-sm font-bold ${getRatingColor(p.avgRating)}`}>{p.avgRating.toFixed(1)}</span>
                      {trend !== 0 && (
                        <span className={`text-[10px] flex items-center gap-0.5 ${trend > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          <TrendingUp className={`h-3 w-3 ${trend < 0 ? 'rotate-180' : ''}`} />
                          {trend > 0 ? '+' : ''}{trend.toFixed(1)}
                        </span>
                      )}
                      <div className="w-full bg-primary/10 rounded-t relative" style={{ height: `${(p.avgRating / 5) * 100}px` }}>
                        <div className="absolute bottom-0 w-full bg-primary rounded-t transition-all" style={{ height: '100%' }} />
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">{p.period}</span>
                      <span className="text-[10px] text-muted-foreground">{p.completedCount}/{p.totalCount} završeno</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
    
          {/* Department Averages */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Prosečne ocene po sektorima</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {DEPARTMENTS.map(dept => {
                  const deptAp = completed.filter(a => a.department === dept)
                  const avg = deptAp.length > 0 ? Math.round((deptAp.reduce((s, a) => s + a.overallRating, 0) / deptAp.length) * 10) / 10 : 0
                  const maxR = 5
                  return (
                    <div key={dept} className="flex items-center gap-4">
                      <div className="w-28 text-sm font-medium shrink-0">{dept}</div>
                      <div className="flex-1">
                        <Progress value={(avg / maxR) * 100} className="h-3" />
                      </div>
                      <span className={`text-sm font-bold w-12 text-right ${deptAp.length > 0 ? getRatingColor(avg) : 'text-muted-foreground'}`}>
                        {deptAp.length > 0 ? avg.toFixed(1) : '-'}
                      </span>
                      <span className="text-[10px] text-muted-foreground w-16 text-right">{deptAp.length} ocena</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
    
          {/* Performance Distribution & Top Performers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Distribucija učinka</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: 'Izuzetni (4.5+)', count: completed.filter(a => a.overallRating >= 4.5).length, color: 'bg-emerald-500' },
                    { label: 'Odlični (4.0-4.4)', count: completed.filter(a => a.overallRating >= 4.0 && a.overallRating < 4.5).length, color: 'bg-emerald-400' },
                    { label: 'Dobri (3.5-3.9)', count: completed.filter(a => a.overallRating >= 3.5 && a.overallRating < 4.0).length, color: 'bg-amber-400' },
                    { label: 'Potrebno unapređenje (3.0-3.4)', count: completed.filter(a => a.overallRating >= 3.0 && a.overallRating < 3.5).length, color: 'bg-orange-400' },
                    { label: 'Nedovoljni (<3.0)', count: completed.filter(a => a.overallRating > 0 && a.overallRating < 3.0).length, color: 'bg-red-400' },
                  ].map(seg => (
                    <div key={seg.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-sm ${seg.color}`} />
                        <span className="text-xs">{seg.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold">{seg.count}</span>
                        <span className="text-[10px] text-muted-foreground">({completed.length > 0 ? Math.round((seg.count / completed.length) * 100) : 0}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
    
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Top 5 izvođači</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topPerformers.map((ap, idx) => (
                    <div key={ap.id} className="flex items-center gap-3 py-1">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-amber-700' : 'bg-muted text-muted-foreground'}`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{ap.employeeName}</p>
                        <p className="text-[10px] text-muted-foreground">{ap.department}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className={`h-4 w-4 ${idx === 0 ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
                        <span className={`text-sm font-bold ${getRatingColor(ap.overallRating)}`}>{ap.overallRating.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                  {topPerformers.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">Nema završenih ocenjivanja</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
    
          {/* Competency Breakdown */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Prosek po kompetencijama</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {criteria.filter(c => c.active).map(crit => {
                  const scores = completed.flatMap(a => a.competencyScores).filter(s => s.competencyId === crit.id && s.score > 0)
                  const avg = scores.length > 0 ? Math.round((scores.reduce((s, sc) => s + sc.score, 0) / scores.length) * 10) / 10 : 0
                  return (
                    <div key={crit.id} className={`text-center p-4 rounded-lg ${getRatingBg(avg)}`}>
                      <p className="text-xs text-muted-foreground mb-1">{crit.name}</p>
                      <p className={`text-2xl font-bold ${scores.length > 0 ? getRatingColor(avg) : 'text-muted-foreground'}`}>{scores.length > 0 ? avg.toFixed(1) : '-'}</p>
                      <Progress value={(avg / 5) * 100} className="h-1.5 mt-2" />
                      <p className="text-[10px] text-muted-foreground mt-1">{crit.weight}% težina</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </TabsContent>
  )
}

// ========== Novoocenjivanje ==========

export function Novoocenjivanje({ createOpen, criteria, currentScore, employees, handleCreate, setCreateOpen }: { createOpen: any, criteria: any, currentScore: any, employees: any, handleCreate: any, setCreateOpen: any }) {
  return (
    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo ocenjivanje</DialogTitle>
                <DialogDescription>Ocenite radni učink zaposlenog za izabrani period</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Zaposleni *</Label>
                    <Select value={createForm.employeeId} onValueChange={v => setCreateForm(f => ({ ...f, employeeId: v }))}>
                      <SelectTrigger><SelectValue placeholder="Izaberite zaposlenog" /></SelectTrigger>
                      <SelectContent>
                        {employees.map(e => (
                          <SelectItem key={e.id} value={e.id}>{e.name} — {e.department}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Period</Label>
                    <Select value={createForm.period} onValueChange={v => setCreateForm(f => ({ ...f, period: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Q1 2025">Q1 2025</SelectItem>
                        <SelectItem value="Q4 2024">Q4 2024</SelectItem>
                        <SelectItem value="Q3 2024">Q3 2024</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
    
                <div className="space-y-3">
                  <Label className="text-xs font-semibold">Ocene po kompetencijama</Label>
                  {criteria.filter(c => c.active).map(crit => {
                    const currentScore = createForm.scores.find(s => s.competencyId === crit.id)?.score || 0
                    return (
                      <div key={crit.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="text-sm font-medium">{crit.name}</p>
                          <p className="text-[10px] text-muted-foreground">{crit.description} · Težina: {crit.weight}%</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StarRating value={currentScore} interactive onChange={v => {
                            setCreateForm(f => ({
                              ...f,
                              scores: f.scores.map(s => s.competencyId === crit.id ? { ...s, score: v } : s),
                            }))
                          }} />
                          <span className="text-sm font-bold w-4 text-right">{currentScore}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
    
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Jakosti</Label>
                    <Textarea placeholder="Navedite glavne jakosti zaposlenog..." value={createForm.strengths}
                      onChange={e => setCreateForm(f => ({ ...f, strengths: e.target.value }))} rows={2} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Podele za unapređenje</Label>
                    <Textarea placeholder="Podele za unapređenje i razvoj..." value={createForm.improvements}
                      onChange={e => setCreateForm(f => ({ ...f, improvements: e.target.value }))} rows={2} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Ciljevi za naredni period</Label>
                    <Textarea placeholder="Postavite ciljeve za naredni period..." value={createForm.goals}
                      onChange={e => setCreateForm(f => ({ ...f, goals: e.target.value }))} rows={2} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Otkaži</Button>
                <Button onClick={handleCreate}>Sačuvaj ocenjivanje</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
  )
}


// ========== SelectedemployeeName ==========

export function SelectedemployeeName({ criteria, selected, setViewOpen, val, viewOpen }: { criteria: any, selected: any, setViewOpen: any, val: any, viewOpen: any }) {
  return (
    <Dialog open={viewOpen} onOpenChange={setViewOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              {selected && (
                <>
                  <DialogHeader>
                    <div className="flex items-center gap-3">
                      <DialogTitle>{selected.employeeName}</DialogTitle>
                      <Badge variant="outline" className={STATUS_CONFIG[selected.status]?.color}>{STATUS_CONFIG[selected.status]?.label}</Badge>
                    </div>
                    <DialogDescription>{selected.department} · {selected.period} · {selected.evaluatedBy && `Evaluirao: ${selected.evaluatedBy}`}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    {/* Overall Rating */}
                    {selected.status === 'zavrseno' && (
                      <div className={`p-4 rounded-lg text-center ${getRatingBg(selected.overallRating)}`}>
                        <p className="text-xs text-muted-foreground mb-1">Ukupna ocena</p>
                        <div className="flex items-center justify-center gap-2">
                          <StarRating value={Math.round(selected.overallRating)} />
                          <span className={`text-3xl font-bold ${getRatingColor(selected.overallRating)}`}>{selected.overallRating.toFixed(1)}</span>
                        </div>
                      </div>
                    )}
    
                    {/* Competency Scores */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">Ocene po kompetencijama</Label>
                      {criteria.filter(c => c.active).map(crit => {
                        const sc = selected.competencyScores.find(s => s.competencyId === crit.id)
                        const val = sc?.score || 0
                        return (
                          <div key={crit.id} className="flex items-center justify-between py-2 border-b last:border-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{crit.name}</span>
                              <span className="text-[10px] text-muted-foreground">({crit.weight}%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <StarRating value={val} />
                              <span className={`text-sm font-bold w-4 text-right ${val > 0 ? getRatingColor(val) : 'text-muted-foreground'}`}>{val || '-'}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
    
                    {/* Comments */}
                    {selected.strengths && (
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold flex items-center gap-1"><Award className="h-3 w-3" /> Jakosti</Label>
                        <p className="text-sm bg-emerald-50 p-3 rounded-lg text-emerald-800">{selected.strengths}</p>
                      </div>
                    )}
                    {selected.improvements && (
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold flex items-center gap-1"><Target className="h-3 w-3" /> Podele za unapređenje</Label>
                        <p className="text-sm bg-amber-50 p-3 rounded-lg text-amber-800">{selected.improvements}</p>
                      </div>
                    )}
                    {selected.goals && (
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Ciljevi za naredni period</Label>
                        <p className="text-sm bg-blue-50 p-3 rounded-lg text-blue-800">{selected.goals}</p>
                      </div>
                    )}
    
                    {/* Metadata */}
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t">
                      <span>Kreirano: {formatDate(selected.createdAt)}</span>
                      {selected.evaluatedAt && <span>Završeno: {formatDate(selected.evaluatedAt)}</span>}
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
  )
}

