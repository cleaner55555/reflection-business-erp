'use client'

import { AlertCircle, CheckCircle2, DollarSign, Download, Eye, FileSignature, FileText, Plus, RefreshCw, Search, Trash2, XCircle, FolderOpen } from 'lucide-react'



// ========== OverviewTab ==========

export function OverviewTab({ sCfg, tCfg }: { sCfg: any, tCfg: any }) {
  return (
    <TabsContent value="overview" className="space-y-6">
      {!dashboard ? (
        <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Aktivnih ugovora</span>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-600">{dashboard.activeContracts}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Uskoro ističe</span>
                <AlertCircle className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-amber-600">{dashboard.expiringSoon}</p>
              <p className="text-xs text-muted-foreground mt-1">{dashboard.renewalsDue} obnavljanja na čekanju</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Istekli</span>
                <XCircle className="h-4 w-4 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-red-600">{dashboard.expiredContracts}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Prosečna plata</span>
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold">{formatCurrency(dashboard.avgSalary)}</p>
              <p className="text-xs text-muted-foreground mt-1">Ukupno: {formatCurrency(dashboard.totalPayroll)}</p>
            </Card>
          </div>
    
          {/* Payroll Summary */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Po tipu ugovora</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {dashboard.byType.map((bt) => {
                const tCfg = typeConfig[bt.type]
                const maxCount = Math.max(...dashboard.byType.map((b) => b.count))
                return (
                  <div key={bt.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{tCfg?.icon}</span>
                      <span className="text-sm">{tCfg?.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div className="h-2 rounded-full" style={{ width: `${(bt.count / maxCount) * 100}%`, backgroundColor: bt.color }} />
                      </div>
                      <span className="text-sm font-medium w-6 text-right">{bt.count}</span>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
    
          {/* Expiring Alerts */}
          {dashboard.expiringList.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-amber-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> Upozorenja: Ugovori koji uskoro ističu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboard.expiringList.map((c) => {
                  const days = c.endDate ? daysUntilExpiry(c.endDate) : 0
                  return (
                    <div key={c.id} className="flex items-center justify-between p-3 border border-amber-200 bg-amber-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{c.employeeName}</p>
                        <p className="text-xs text-muted-foreground">{c.position} · {c.department}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-amber-700">Ističe za {days} dana</p>
                        <p className="text-xs text-muted-foreground">{c.endDate ? new Date(c.endDate).toLocaleDateString('sr-RS') : '-'}</p>
                      </div>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openRenewal(c)}>
                        <RefreshCw className="h-3 w-3 mr-1" /> Obnovi
                      </Button>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}
    
          {/* Recent Contracts */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Nedavni ugovori</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {dashboard.recentContracts.map((c) => {
                  const sCfg = statusConfig[c.status]
                  return (
                    <div key={c.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <span>{tCfg?.icon}</span>
                        <div>
                          <p className="text-sm font-medium">{c.employeeName}</p>
                          <p className="text-xs text-muted-foreground">{c.position} · {c.department}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs ${sCfg?.color}`}>{sCfg?.label}</Badge>
                        <span className="text-xs text-muted-foreground">{new Date(c.startDate).toLocaleDateString('sr-RS')}</span>
                      </div>
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

// ========== ContractsTab ==========

export function ContractsTab({ filteredContracts, k, loading, sCfg, search, setStatusFilter, setTypeFilter, statusFilter, tCfg, typeFilter }: { filteredContracts: any, k: any, loading: any, sCfg: any, search: any, setStatusFilter: any, setTypeFilter: any, statusFilter: any, tCfg: any, typeFilter: any }) {
  return (
    <TabsContent value="contracts" className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pretraži ugovore..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Svi statusi" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Svi statusi</SelectItem>
            {Object.entries(statusConfig).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Svi tipovi" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Svi tipovi</SelectItem>
            {Object.entries(typeConfig).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    
      {loading ? (
        <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filteredContracts.length === 0 ? (
        <Card className="p-8 text-center">
          <FileSignature className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Nema ugovora</p>
          <Button variant="outline" className="mt-3" onClick={() => { setForm(emptyForm); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Kreiraj ugovor
          </Button>
        </Card>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="p-3">Zaposleni</th>
                  <th className="p-3 hidden md:table-cell">Pozicija</th>
                  <th className="p-3 hidden md:table-cell">Tip</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 hidden lg:table-cell">Bruto plata</th>
                  <th className="p-3 hidden lg:table-cell">Period</th>
                  <th className="p-3">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.map((c) => {
                  const sCfg = statusConfig[c.status]
                  return (
                    <tr key={c.id} className="border-t hover:bg-muted/30">
                      <td className="p-3">
                        <p className="font-medium">{c.employeeName}</p>
                        <p className="text-xs text-muted-foreground">{c.contractNumber}</p>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <p className="text-sm">{c.position}</p>
                        <p className="text-xs text-muted-foreground">{c.department}</p>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <Badge variant="outline" className={`text-xs ${tCfg?.color}`}>{tCfg?.icon} {tCfg?.label}</Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className={`text-xs ${sCfg?.color}`}>{sCfg?.label}</Badge>
                      </td>
                      <td className="p-3 text-sm hidden lg:table-cell">{formatCurrency(c.salaryGross)}</td>
                      <td className="p-3 text-xs hidden lg:table-cell">
                        {new Date(c.startDate).toLocaleDateString('sr-RS')}
                        {c.endDate && <span className="text-muted-foreground"> → {new Date(c.endDate).toLocaleDateString('sr-RS')}</span>}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelected(c); setDetailOpen(true); }}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          {(c.status === 'pre_expiring' || c.status === 'expired') && (
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-amber-600" onClick={() => openRenewal(c)}>
                              <RefreshCw className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(c.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </TabsContent>
  )
}

// ========== RenewalsTab ==========

export function RenewalsTab({ renewals }: { renewals: any }) {
  return (
    <TabsContent value="renewals" className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Zahtevi za obnavljanje ugovora</p>
        <Button size="sm" onClick={() => { setRenewalForm(emptyRenewalForm); setRenewalDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Novo obnavljanje
        </Button>
      </div>
    
      {renewals.length === 0 ? (
        <Card className="p-8 text-center">
          <RefreshCw className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Nema zahteva za obnavljanje</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {renewals.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium">{r.employeeName}</h3>
                      <Badge variant={r.status === 'pending' ? 'outline' : 'default'} className={`text-xs ${r.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                        {r.status === 'pending' ? 'Na čekanju' : 'Odobreno'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.oldEndDate).toLocaleDateString('sr-RS')} → {new Date(r.newStartDate).toLocaleDateString('sr-RS')} do {new Date(r.newEndDate).toLocaleDateString('sr-RS')}
                    </p>
                    {r.notes && <p className="text-xs text-muted-foreground mt-1 italic">{r.notes}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground">{r.requestedDate}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    
      {/* Expiring Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Timeline isteka ugovora</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contracts
              .filter((c) => c.endDate && new Date(c.endDate) > new Date())
              .sort((a, b) => new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime())
              .slice(0, 6)
              .map((c) => {
                const days = c.endDate ? daysUntilExpiry(c.endDate) : 0
                const progress = Math.max(0, Math.min(100, 100 - (days / 365) * 100))
                return (
                  <div key={c.id} className="flex items-center gap-4">
                    <div className="w-28 text-right">
                      <p className="text-xs font-medium">{c.employeeName.split(' ')[0]}</p>
                      <p className="text-xs text-muted-foreground">{days} dana</p>
                    </div>
                    <div className="flex-1">
                      <div className="bg-muted rounded-full h-3 relative">
                        <div className={`h-3 rounded-full transition-all ${days <= 30 ? 'bg-red-400' : days <= 90 ? 'bg-amber-400' : 'bg-green-400'}`} style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                    <div className="w-24">
                      <p className="text-xs">{new Date(c.endDate!).toLocaleDateString('sr-RS')}</p>
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}

// ========== DocumentsTab ==========

export function DocumentsTab({  }: {  }) {
  return (
    <TabsContent value="documents" className="space-y-4">
      <p className="text-sm text-muted-foreground">Svi dokumenti vezani za ugovore</p>
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left text-xs text-muted-foreground">
              <th className="p-3">Dokument</th>
              <th className="p-3">Zaposleni</th>
              <th className="p-3 hidden md:table-cell">Tip</th>
              <th className="p-3 hidden md:table-cell">Veličina</th>
              <th className="p-3 hidden lg:table-cell">Datum</th>
              <th className="p-3">Akcije</th>
            </tr>
          </thead>
          <tbody>
            {contracts.flatMap((c) => c.documents.map((d) => (
              <tr key={d.id} className="border-t hover:bg-muted/30">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-red-400" />
                    <div>
                      <p className="text-sm font-medium">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.uploadedBy}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-sm">{c.employeeName}</td>
                <td className="p-3 text-sm hidden md:table-cell">
                  <Badge variant="outline" className="text-xs uppercase">{d.type}</Badge>
                </td>
                <td className="p-3 text-xs hidden md:table-cell">{d.size}</td>
                <td className="p-3 text-xs hidden lg:table-cell">{new Date(d.uploadedAt).toLocaleDateString('sr-RS')}</td>
                <td className="p-3">
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    <Download className="h-3 w-3 mr-1" /> Preuzmi
                  </Button>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
    </TabsContent>
  )
}

// ========== TypesTab ==========

export function TypesTab({ contractTypes, tCfg }: { contractTypes: any, tCfg: any }) {
  return (
    <TabsContent value="types" className="space-y-4">
      <p className="text-sm text-muted-foreground">Vrste ugovora i njihova konfiguracija</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contractTypes.map((ct) => {
          const tCfg = typeConfig[ct.id]
          return (
            <Card key={ct.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: ct.color + '20' }}>
                    {tCfg?.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">{ct.name}</h3>
                    <p className="text-xs text-muted-foreground">{ct.contractCount} ugovora</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{ct.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Trajanje: {ct.defaultDuration}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-12 bg-muted rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{ width: `${(ct.contractCount / 20) * 100}%`, backgroundColor: ct.color }} />
                    </div>
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TabsContent } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'

