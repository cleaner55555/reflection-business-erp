'use client'import { ArrowUpRight, BarChart, CheckCircle2, ChevronRight, Clock, Eye, FileText, Phone, Search, Star, Trash2, TrendingUp, Users } from 'lucide-react'



// ========== OverviewTab ==========

export function OverviewTab({ monthlySpending, prs, suppliers }: { monthlySpending: any, prs: any, suppliers: any }) {
  return (
    <TabsContent value="overview" className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KpiCard label="Aktivni zahtevi" value={stats.active} icon={FileText} sub={`${stats.pending} čeka odobrenje`} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-900/20" />
        <KpiCard label="Na čekanju" value={stats.pending} icon={Clock} sub="Za odobrenje" color="text-amber-500" bg="bg-amber-50 dark:bg-amber-900/20" />
        <KpiCard label="Ukupna vrednost" value={formatCurrency(stats.totalValue)} icon={DollarSign} sub="Aktivni zahtevi" color="text-green-500" bg="bg-green-50 dark:bg-green-900/20" />
        <KpiCard label="Dostava na vreme" value={`${stats.onTimeRate}%`} icon={CheckCircle2} sub="Prosek dobavljača" color="text-purple-500" bg="bg-purple-50 dark:bg-purple-900/20" />
        <KpiCard label="Prosečno vreme" value={`${stats.avgLeadTime} d`} icon={Timer} sub="Rok isporuke" color="text-cyan-500" bg="bg-cyan-50 dark:bg-cyan-900/20" />
      </div>
    
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pending Approvals */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> Na čekanju odobrenja</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {prs.filter(p => p.status === 'submitted').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5).map(pr => (
                <div key={pr.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge className={`text-[10px] px-1.5 py-0 ${PR_PRIORITY_CONFIG[pr.priority].color}`}>{PR_PRIORITY_CONFIG[pr.priority].label}</Badge>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{pr.prNumber} - {pr.title}</p>
                      <p className="text-xs text-muted-foreground">{pr.requestedBy} · {pr.department} · {formatCurrency(pr.totalAmount)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleAdvanceStatus(pr)}>
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Odobri
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setSelectedPR(pr); setPrDetailOpen(true) }}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {prs.filter(p => p.status === 'submitted').length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nema zahteva na čekanju</p>
              )}
            </div>
          </CardContent>
        </Card>
    
        {/* Top Suppliers */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Star className="h-4 w-4" /> Top dobavljači</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {suppliers.filter(s => s.status === 'active').sort((a, b) => b.performanceScore - a.performanceScore).slice(0, 5).map(sup => (
              <div key={sup.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => { setSelectedSupplier(sup); setSupplierDetailOpen(true) }}>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{sup.name}</p>
                  <p className="text-xs text-muted-foreground">{sup.category}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-sm font-bold ${getPerformanceColor(sup.performanceScore)}`}>{sup.performanceScore}</span>
                  <p className="text-[10px] text-muted-foreground">{sup.onTimeRate}% na vreme</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    
      {/* Spending Trend */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Mesečna potrošnja</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {monthlySpending.map(([month, amount]) => {
              const maxAmount = Math.max(...monthlySpending.map(([, a]) => a), 1)
              return (
                <div key={month} className="flex items-center gap-3">
                  <span className="text-xs w-16 text-muted-foreground">{month}</span>
                  <div className="flex-1 bg-muted rounded-full h-4">
                    <div className="bg-primary h-4 rounded-full transition-all flex items-center" style={{ width: `${(amount / maxAmount) * 100}%`, minWidth: '40px' }}>
                      <span className="text-[10px] font-medium text-primary-foreground px-2">{formatCurrency(amount)}</span>
                    </div>
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

// ========== RequisitionsTab ==========

export function RequisitionsTab({ d, filterDept, filterPRPriority, filterPRStatus, filteredPRs, searchQuery, setFilterDept, setFilterPRPriority, setFilterPRStatus }: { d: any, filterDept: any, filterPRPriority: any, filterPRStatus: any, filteredPRs: any, searchQuery: any, setFilterDept: any, setFilterPRPriority: any, setFilterPRStatus: any }) {
  return (
    <TabsContent value="requisitions" className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pretraži zahteve..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterPRStatus} onValueChange={setFilterPRStatus}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Svi statusi</SelectItem>
            <SelectItem value="draft">Nacrt</SelectItem>
            <SelectItem value="submitted">Podnet</SelectItem>
            <SelectItem value="approved">Odobren</SelectItem>
            <SelectItem value="ordered">Naručeno</SelectItem>
            <SelectItem value="received">Primljeno</SelectItem>
            <SelectItem value="rejected">Odbijeno</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPRPriority} onValueChange={setFilterPRPriority}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Prioritet" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Svi</SelectItem>
            <SelectItem value="low">Nizak</SelectItem>
            <SelectItem value="medium">Srednji</SelectItem>
            <SelectItem value="high">Visok</SelectItem>
            <SelectItem value="urgent">Hitan</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterDept} onValueChange={setFilterDept}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Departman" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Svi departmani</SelectItem>
            {stats.departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredPRs.map(pr => (
              <div key={pr.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex flex-col gap-1">
                    <Badge className={`text-[10px] px-1.5 py-0 w-fit ${PR_STATUS_CONFIG[pr.status].color}`}>{PR_STATUS_CONFIG[pr.status].label}</Badge>
                    <Badge className={`text-[10px] px-1.5 py-0 w-fit ${PR_PRIORITY_CONFIG[pr.priority].color}`}>{PR_PRIORITY_CONFIG[pr.priority].label}</Badge>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{pr.prNumber} - {pr.title}</p>
                    <p className="text-xs text-muted-foreground">{pr.requestedBy} · {pr.department}</p>
                    {pr.supplierName && <p className="text-xs text-muted-foreground">Dobavljač: {pr.supplierName}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-semibold">{formatCurrency(pr.totalAmount)}</p>
                    <p className="text-[10px] text-muted-foreground">{formatDate(pr.requestedDate)}{pr.requiredByDate ? ` → ${formatDate(pr.requiredByDate)}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {['draft', 'submitted', 'approved', 'ordered'].includes(pr.status) && (
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleAdvanceStatus(pr)} title="Napredni status">
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setSelectedPR(pr); setPrDetailOpen(true) }}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEditPR(pr)}>
                      <FileText className="h-3.5 w-3.5" />
                    </Button>
                    {pr.status === 'draft' && (
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-700" onClick={() => { setSelectedPR(pr); setDeleteConfirmOpen(true) }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}

// ========== SuppliersTab ==========

export function SuppliersTab({ c, filterSuppCat, filterSuppStatus, filteredSuppliers, searchQuery, setFilterSuppCat, setFilterSuppStatus }: { c: any, filterSuppCat: any, filterSuppStatus: any, filteredSuppliers: any, searchQuery: any, setFilterSuppCat: any, setFilterSuppStatus: any }) {
  return (
    <TabsContent value="suppliers" className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pretraži dobavljače..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterSuppCat} onValueChange={setFilterSuppCat}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Kategorija" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Sve kategorije</SelectItem>
            {stats.supplierCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterSuppStatus} onValueChange={setFilterSuppStatus}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Svi</SelectItem>
            <SelectItem value="active">Aktivni</SelectItem>
            <SelectItem value="inactive">Neaktivni</SelectItem>
            <SelectItem value="blocked">Blokirani</SelectItem>
          </SelectContent>
        </Select>
      </div>
    
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map(sup => (
          <Card key={sup.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelectedSupplier(sup); setSupplierDetailOpen(true) }}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{sup.name}</CardTitle>
                <Badge className={`text-[10px] px-1.5 py-0 ${SUPPLIER_STATUS_CONFIG[sup.status].color}`}>{SUPPLIER_STATUS_CONFIG[sup.status].label}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{sup.code} · {sup.category}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>{getStarDisplay(sup.rating)}</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rok isporuke</span>
                  <span>{sup.leadTime} dana</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Na vreme</span>
                  <span className={sup.onTimeRate >= 90 ? 'text-green-600' : sup.onTimeRate >= 75 ? 'text-amber-600' : 'text-red-600'}>{sup.onTimeRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ukupno naruđ.</span>
                  <span>{sup.totalOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ukupno vrednost</span>
                  <span>{formatCurrency(sup.totalValue)}</span>
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Performanse</span>
                  <span className={`font-bold ${getPerformanceColor(sup.performanceScore)}`}>{sup.performanceScore}/100</span>
                </div>
                <Progress value={sup.performanceScore} className="h-2" />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span>{sup.contactPerson}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </TabsContent>
  )
}

// ========== AnalyticsTab ==========

export function AnalyticsTab({ approvalMetrics, monthlySpending, spendingByCategory, suppliers }: { approvalMetrics: any, monthlySpending: any, spendingByCategory: any, suppliers: any }) {
  return (
    <TabsContent value="analytics" className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Spending by Category */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><BarChart className="h-4 w-4" /> Potrošnja po kategorijama</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {spendingByCategory.map(([category, amount]) => {
                const maxAmount = Math.max(...spendingByCategory.map(([, a]) => a), 1)
                return (
                  <div key={category} className="flex items-center gap-3">
                    <span className="text-xs w-32 truncate">{category}</span>
                    <div className="flex-1 bg-muted rounded-full h-4">
                      <div className="bg-primary h-4 rounded-full transition-all flex items-center" style={{ width: `${(amount / maxAmount) * 100}%`, minWidth: amount > 0 ? '50px' : '0' }}>
                        <span className="text-[10px] font-medium text-primary-foreground px-2">{formatCurrency(amount)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
    
        {/* Monthly Trend */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Mesečni trend</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthlySpending.map(([month, amount]) => {
                const maxAmount = Math.max(...monthlySpending.map(([, a]) => a), 1)
                const change = prevAmount > 0 ? ((amount - prevAmount) / prevAmount) * 100 : 0
                return (
                  <div key={month} className="flex items-center gap-3">
                    <span className="text-xs w-16 text-muted-foreground">{month}</span>
                    <div className="flex-1 bg-muted rounded-full h-5">
                      <div className="bg-primary h-5 rounded-full transition-all flex items-center justify-end" style={{ width: `${(amount / maxAmount) * 100}%`, minWidth: '40px' }}>
                        <span className="text-[10px] font-medium text-primary-foreground px-2">{formatCurrency(amount)}</span>
                      </div>
                    </div>
                    {change !== 0 && (
                      <div className={`flex items-center gap-0.5 text-xs w-16 ${change > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {change > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {Math.abs(change).toFixed(1)}%
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
    
        {/* Supplier Comparison */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4" /> Poređenje dobavljača</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-2 font-medium text-muted-foreground">Dobavljač</th>
                    <th className="text-center py-2 px-1 font-medium text-muted-foreground">Ocena</th>
                    <th className="text-center py-2 px-1 font-medium text-muted-foreground">Na vreme</th>
                    <th className="text-center py-2 px-1 font-medium text-muted-foreground">Rok</th>
                    <th className="text-center py-2 px-1 font-medium text-muted-foreground">Narudžbine</th>
                    <th className="text-right py-2 pl-1 font-medium text-muted-foreground">Vrednost</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.filter(s => s.status === 'active').sort((a, b) => b.performanceScore - a.performanceScore).map(sup => (
                    <tr key={sup.id} className="border-b last:border-0 hover:bg-muted/50 cursor-pointer" onClick={() => { setSelectedSupplier(sup); setSupplierDetailOpen(true) }}>
                      <td className="py-2 pr-2 font-medium truncate max-w-[120px]">{sup.name}</td>
                      <td className="py-2 px-1 text-center">{getStarDisplay(sup.rating)}</td>
                      <td className="py-2 px-1 text-center"><span className={sup.onTimeRate >= 90 ? 'text-green-600' : sup.onTimeRate >= 75 ? 'text-amber-600' : 'text-red-600'}>{sup.onTimeRate}%</span></td>
                      <td className="py-2 px-1 text-center">{sup.leadTime}d</td>
                      <td className="py-2 px-1 text-center">{sup.totalOrders}</td>
                      <td className="py-2 pl-1 text-right font-mono">{formatCurrency(sup.totalValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
    
        {/* Approval Workflow Metrics */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> Metrike odobrenja</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {approvalMetrics.map(metric => (
              <div key={metric.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="text-sm font-medium">{metric.step}</p>
                  <p className="text-xs text-muted-foreground">{metric.approver}</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  {metric.avgTime > 0 && (
                    <div className="text-center">
                      <p className="font-semibold">{metric.avgTime}h</p>
                      <p className="text-muted-foreground">Prosek</p>
                    </div>
                  )}
                  <div className="text-center">
                    <p className="font-semibold text-amber-600">{metric.pending}</p>
                    <p className="text-muted-foreground">Čeka</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-green-600">{metric.approved}</p>
                    <p className="text-muted-foreground">Odobreno</p>
                  </div>
                  {metric.rejected > 0 && (
                    <div className="text-center">
                      <p className="font-semibold text-red-600">{metric.rejected}</p>
                      <p className="text-muted-foreground">Odbijeno</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
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

// ========== SelectedPRprNumbersele ==========

export function SelectedPRprNumbersele({ prDetailOpen, selectedPR, setPrDetailOpen }: { prDetailOpen: any, selectedPR: any, setPrDetailOpen: any }) {
  return (
    <Dialog open={prDetailOpen} onOpenChange={setPrDetailOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{selectedPR?.prNumber} - {selectedPR?.title}</DialogTitle>
                <DialogDescription>Detalji zahteva za nabavku</DialogDescription>
              </DialogHeader>
              {selectedPR && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className={PR_STATUS_CONFIG[selectedPR.status].color}>{PR_STATUS_CONFIG[selectedPR.status].label}</Badge>
                    <Badge className={PR_PRIORITY_CONFIG[selectedPR.priority].color}>{PR_PRIORITY_CONFIG[selectedPR.priority].label}</Badge>
                  </div>
                  {selectedPR.description && <p className="text-sm text-muted-foreground">{selectedPR.description}</p>}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-xs text-muted-foreground">Podneo</span><p className="font-medium">{selectedPR.requestedBy}</p></div>
                    <div><span className="text-xs text-muted-foreground">Departman</span><p className="font-medium">{selectedPR.department}</p></div>
                    <div><span className="text-xs text-muted-foreground">Datum zahteva</span><p className="font-medium">{formatDate(selectedPR.requestedDate)}</p></div>
                    <div><span className="text-xs text-muted-foreground">Rok</span><p className="font-medium">{selectedPR.requiredByDate ? formatDate(selectedPR.requiredByDate) : 'Nije definisan'}</p></div>
                    {selectedPR.supplierName && <div><span className="text-xs text-muted-foreground">Dobavljač</span><p className="font-medium">{selectedPR.supplierName}</p></div>}
                    {selectedPR.approvedBy && <div><span className="text-xs text-muted-foreground">Odobrio</span><p className="font-medium">{selectedPR.approvedBy}</p></div>}
                  </div>
                  {selectedPR.items.length > 0 && (
                    <div className="border-t pt-3">
                      <span className="text-xs text-muted-foreground font-medium">Stavke</span>
                      <div className="mt-2 space-y-1">
                        {selectedPR.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded">
                            <span>{item.name} × {item.quantity} {item.unit}</span>
                            <span className="font-mono">{(item.quantity * item.unitPrice).toLocaleString('sr-RS')} RSD</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t font-semibold">
                        <span>Ukupno</span>
                        <span>{selectedPR.totalAmount.toLocaleString('sr-RS')} {selectedPR.currency}</span>
                      </div>
                    </div>
                  )}
                  {selectedPR.notes && (
                    <div className="border-t pt-3">
                      <span className="text-xs text-muted-foreground">Napomene</span>
                      <p className="text-sm mt-1">{selectedPR.notes}</p>
                    </div>
                  )}
                </div>
              )}
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setPrDetailOpen(false)}>Zatvori</Button>
                {selectedPR && ['draft', 'submitted', 'approved', 'ordered'].includes(selectedPR.status) && (
                  <Button onClick={() => { handleAdvanceStatus(selectedPR); setPrDetailOpen(false) }}>
                    <ChevronRight className="h-4 w-4 mr-1" /> {PR_STATUS_CONFIG[selectedPR.status].label} → {PR_STATUS_CONFIG[{ draft: 'submitted', submitted: 'approved', approved: 'ordered', ordered: 'received' }[selectedPR.status] as string]?.label}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
  )
}


// ========== SelectedSuppliername ==========

export function SelectedSuppliername({ selectedSupplier, setSupplierDetailOpen, supplierDetailOpen }: { selectedSupplier: any, setSupplierDetailOpen: any, supplierDetailOpen: any }) {
  return (
    <Dialog open={supplierDetailOpen} onOpenChange={setSupplierDetailOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{selectedSupplier?.name}</DialogTitle>
                <DialogDescription>Profil dobavljača - {selectedSupplier?.code}</DialogDescription>
              </DialogHeader>
              {selectedSupplier && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge className={SUPPLIER_STATUS_CONFIG[selectedSupplier.status].color}>{SUPPLIER_STATUS_CONFIG[selectedSupplier.status].label}</Badge>
                    <Badge variant="outline">{selectedSupplier.category}</Badge>
                  </div>
                  <div>{getStarDisplay(selectedSupplier.rating)}</div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-xs text-muted-foreground">Kontakt osoba</span><p className="font-medium">{selectedSupplier.contactPerson}</p></div>
                    <div><span className="text-xs text-muted-foreground">Telefon</span><p className="font-medium">{selectedSupplier.phone}</p></div>
                    <div><span className="text-xs text-muted-foreground">Email</span><p className="font-medium text-xs">{selectedSupplier.email}</p></div>
                    <div><span className="text-xs text-muted-foreground">Adresa</span><p className="font-medium text-xs">{selectedSupplier.city}{selectedSupplier.country ? `, ${selectedSupplier.country}` : ''}</p></div>
                    {selectedSupplier.website && <div className="col-span-2"><span className="text-xs text-muted-foreground">Web</span><p className="font-medium text-xs text-blue-600">{selectedSupplier.website}</p></div>}
                  </div>
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Ukupno narudžbina</span><span className="font-semibold">{selectedSupplier.totalOrders}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Ukupna vrednost</span><span className="font-semibold">{formatCurrency(selectedSupplier.totalValue)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Rok isporuke</span><span>{selectedSupplier.leadTime} dana</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Isporuka na vreme</span>
                      <span className={selectedSupplier.onTimeRate >= 90 ? 'text-green-600 font-semibold' : selectedSupplier.onTimeRate >= 75 ? 'text-amber-600 font-semibold' : 'text-red-600 font-semibold'}>{selectedSupplier.onTimeRate}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Uslovi plaćanja</span><span>{selectedSupplier.paymentTerms}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Skor performansi</span>
                      <div className="flex items-center gap-2">
                        <Progress value={selectedSupplier.performanceScore} className="w-16 h-2" />
                        <span className={`font-bold ${getPerformanceColor(selectedSupplier.performanceScore)}`}>{selectedSupplier.performanceScore}</span>
                      </div>
                    </div>
                  </div>
                  {selectedSupplier.notes && (
                    <div className="border-t pt-3"><span className="text-xs text-muted-foreground">Napomene</span><p className="text-sm mt-1">{selectedSupplier.notes}</p></div>
                  )}
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setSupplierDetailOpen(false)}>Zatvori</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
  )
}


// ========== EditingPRIzmenizahtev ==========

export function EditingPRIzmenizahtev({ d, editingPR, handleSavePR, prDialogOpen, setPrDialogOpen, suppliers }: { d: any, editingPR: any, handleSavePR: any, prDialogOpen: any, setPrDialogOpen: any, suppliers: any }) {
  return (
    <Dialog open={prDialogOpen} onOpenChange={setPrDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingPR ? 'Izmeni zahtev' : 'Novi zahtev za nabavku'}</DialogTitle>
                <DialogDescription>{editingPR ? 'Ažurirajte podatke zahteva' : 'Kreirajte novi zahtev za nabavku robe ili usluga'}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Naziv zahteva *</Label>
                  <Input value={prForm.title} onChange={(e) => setPrForm({ ...prForm, title: e.target.value })} placeholder="npr. Kancelarijski materijal" />
                </div>
                <div>
                  <Label className="text-xs">Opis</Label>
                  <Textarea value={prForm.description} onChange={(e) => setPrForm({ ...prForm, description: e.target.value })} placeholder="Detaljan opis potrebe..." rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Prioritet</Label>
                    <Select value={prForm.priority} onValueChange={(v) => setPrForm({ ...prForm, priority: v as 'low' | 'medium' | 'high' | 'urgent' })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Nizak</SelectItem>
                        <SelectItem value="medium">Srednji</SelectItem>
                        <SelectItem value="high">Visok</SelectItem>
                        <SelectItem value="urgent">Hitan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Departman</Label>
                    <Select value={prForm.department} onValueChange={(v) => setPrForm({ ...prForm, department: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Izaberite...</SelectItem>
                        {stats.departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Dobavljač</Label>
                    <Select value={prForm.supplierId} onValueChange={(v) => setPrForm({ ...prForm, supplierId: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Izaberite...</SelectItem>
                        {suppliers.filter(s => s.status === 'active').map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Potreban do</Label>
                    <Input type="date" value={prForm.requiredByDate} onChange={(e) => setPrForm({ ...prForm, requiredByDate: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Napomene</Label>
                  <Textarea value={prForm.notes} onChange={(e) => setPrForm({ ...prForm, notes: e.target.value })} placeholder="Opcionalne napomene..." rows={2} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPrDialogOpen(false)}>Otkaži</Button>
                <Button onClick={handleSavePR}>{editingPR ? 'Sačuvaj izmene' : 'Kreiraj zahtev'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
  )
}


// ========== Brisanjezahteva ==========

export function Brisanjezahteva({ deleteConfirmOpen, handleDeletePR, selectedPR, setDeleteConfirmOpen }: { deleteConfirmOpen: any, handleDeletePR: any, selectedPR: any, setDeleteConfirmOpen: any }) {
  return (
    <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Brisanje zahteva</DialogTitle>
                <DialogDescription>Da li ste sigurni da želite da obrišete &quot;{selectedPR?.prNumber} - {selectedPR?.title}&quot;?</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Otkaži</Button>
                <Button variant="destructive" onClick={handleDeletePR}>Obriši</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
  )
}

