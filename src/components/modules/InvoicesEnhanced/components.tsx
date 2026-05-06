'use client'

import { useEffect, useState } from 'react'

from '@/components/ui/badge'
from '@/components/ui/button'
from '@/components/ui/card'
from '@/components/ui/input'
from '@/components/ui/label'
from '@/components/ui/select'
from '@/components/ui/separator'
from '@/components/ui/skeleton'
from '@/components/ui/table'
import { AlertTriangle, CalendarDays, CheckCircle2, DollarSign, Receipt } from 'lucide-react'
import type { InstallmentPlan, FiscalInvoice } from './types'

function RateOtplateTab() {
  const [invoices, setInvoices] = useState<InstallmentPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, pending, active, completed

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const res = await fetch('/api/invoices')
      if (cancelled) return
      const data = await res.json()
      // Filter invoices that have installment info
      const installmentInvoices = (data || []).filter((inv: InstallmentPlan) => inv.totalInstallments && inv.totalInstallments > 1)
      setInvoices(installmentInvoices)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const getFiltered = () => {
    switch (filter) {
      case 'pending': return invoices.filter(i => i.status === 'nacrt' || i.status === 'poslata')
      case 'active': return invoices.filter(i => i.status === 'poslata')
      case 'completed': return invoices.filter(i => i.status === 'placena')
      default: return invoices
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'nacrt': return <Badge variant="outline">Nacrt</Badge>
      case 'poslata': return <Badge className="bg-blue-100 text-blue-700">Poslata</Badge>
      case 'placena': return <Badge className="bg-emerald-100 text-emerald-700">Plaćena</Badge>
      case 'otkazana': return <Badge variant="destructive">Otkazana</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  const getProgress = (inv: InstallmentPlan) => {
    if (!inv.totalInstallments) return 0
    return Math.round(((inv.paidInstallments || 0) / inv.totalInstallments) * 100)
  }

  if (loading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>

  const filtered = getFiltered()

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{invoices.length} faktura sa ratama</span>
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'active', 'completed'].map(f => (
            <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)}>
              {f === 'all' ? 'Sve' : f === 'pending' ? 'Na čekanju' : f === 'active' ? 'Aktivne' : 'Završene'}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <DollarSign className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">Nema faktura sa ratama otplate</p>
          <p className="text-xs text-muted-foreground mt-1">Kreirajte fakturu sa opcijom &quot;Rate otplate&quot; da biste pratili plaćanja</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map(inv => {
            const progress = getProgress(inv)
            const amountPerInstallment = inv.totalAmount / (inv.totalInstallments || 1)
            const paidAmount = amountPerInstallment * (inv.paidInstallments || 0)
            const remainingAmount = inv.totalAmount - paidAmount

            return (
              <Card key={inv.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm font-semibold">{inv.number}</CardTitle>
                      {getStatusBadge(inv.status)}
                      <Badge variant="outline">{inv.currency}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(inv.date)}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Partner</p>
                      <p className="text-sm font-medium">{inv.partner?.name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ukupan iznos</p>
                      <p className="text-sm font-bold">{formatRSD(inv.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Plaćeno</p>
                      <p className="text-sm font-bold text-emerald-600">{formatRSD(paidAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Preostalo</p>
                      <p className={`text-sm font-bold ${remainingAmount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{formatRSD(remainingAmount)}</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Rata {inv.paidInstallments || 0} od {inv.totalInstallments}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${progress >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  {/* Installment schedule */}
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-[10px]">Rata</TableHead>
                          <TableHead className="text-[10px]">Iznos</TableHead>
                          <TableHead className="text-[10px]">Rok plaćanja</TableHead>
                          <TableHead className="text-[10px]">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.from({ length: inv.totalInstallments }).map((_, i) => {
                          const isPaid = i < (inv.paidInstallments || 0)
                          const isNext = i === (inv.paidInstallments || 0)
                          return (
                            <TableRow key={i} className={isPaid ? 'bg-emerald-50/50' : isNext ? 'bg-amber-50/50' : ''}>
                              <TableCell className="text-xs">{i + 1}</TableCell>
                              <TableCell className="text-xs font-medium">{formatRSD(amountPerInstallment)}</TableCell>
                              <TableCell className="text-xs">
                                {(() => {
                                  const d = new Date(inv.date)
                                  d.setMonth(d.getMonth() + i + 1)
                                  return formatDate(d.toISOString())
                                })()}
                              </TableCell>
                              <TableCell className="text-xs">
                                {isPaid ? (
                                  <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-3 w-3" /> Plaćeno</span>
                                ) : isNext ? (
                                  <Badge className="bg-amber-100 text-amber-700">Sledeća</Badge>
                                ) : (
                                  <span className="text-muted-foreground">Na čekanju</span>
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function FiskalizacijaTab() {
  const [invoices, setInvoices] = useState<FiscalInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [incoterms] = ['DAP', 'FOB', 'CIF', 'EXW', 'DDP', 'FCA', 'CPT', 'DPU']

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const res = await fetch('/api/invoices')
      if (cancelled) return
      setInvoices((await res.json()) || [])
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleFiskalizuj = async (id: string, number: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fiscalizedNumber: `FIS-${new Date().getFullYear()}-${number.replace(/[^0-9]/g, '')}`,
          fiscalizedAt: new Date().toISOString(),
          status: 'poslata',
        })
      })
      if (res.ok) {
        setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, fiscalizedNumber: `FIS-${new Date().getFullYear()}-${number.replace(/[^0-9]/g, '')}`, fiscalizedAt: new Date().toISOString(), status: 'poslata' } : inv))
        toast.success(`Faktura ${number} fiskalizovana`)
      }
    } catch {
      toast.error('Greška pri fiskalizaciji')
    }
  }

  const handleSetIncoterms = async (id: string, term: string) => {
    try {
      await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incoterms: term || null })
      })
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, incoterms: term || null } : inv))
      toast.success(`Incoterms ažuriran na ${term}`)
    } catch {
      toast.error('Greška')
    }
  }

  if (loading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>

  const outputInvoices = invoices.filter(i => i.type === 'izlazna')
  const totalFiscalized = outputInvoices.filter(i => i.fiscalizedNumber).length
  const totalUnfiscalized = outputInvoices.filter(i => !i.fiscalizedNumber && (i.status === 'poslata' || i.status === 'nacrt')).length

  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase font-medium">Izlazne fakture</p>
            <p className="text-2xl font-bold">{outputInvoices.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-3">
            <p className="text-[10px] text-emerald-600 uppercase font-medium">Fiskalizovane</p>
            <p className="text-2xl font-bold text-emerald-700">{totalFiscalized}</p>
          </CardContent>
        </Card>
        <Card className={totalUnfiscalized > 0 ? 'bg-amber-50 border-amber-200' : 'bg-muted/50'}>
          <CardContent className="p-3">
            <p className="text-[10px] text-amber-600 uppercase font-medium">Na fiskalizaciju</p>
            <p className="text-2xl font-bold text-amber-700">{totalUnfiscalized}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase font-medium">eFakture poslate</p>
            <p className="text-2xl font-bold">{outputInvoices.filter(i => i.sefStatus === 'sent' || i.sefStatus === 'accepted').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Incoterms info */}
      <Card className="p-4">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Incoterms - Dostavni uslovi</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {incoterms.map(term => (
              <Badge key={term} variant="outline" className="text-xs">{term}</Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Incoterms definišu uslove isporuke robe (npr. DAP = dostavljeno na mesto, FOB = slobodan na brodu, CIF = uključujući troškove osiguranja)</p>
        </CardContent>
      </Card>

      {/* Invoices list */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base font-semibold flex items-center gap-2"><Receipt className="h-4 w-4" /> Fiskalizacija faktura</CardTitle></CardHeader>
        <CardContent>
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Broj</TableHead>
                  <TableHead className="text-xs">Partner</TableHead>
                  <TableHead className="text-xs text-right">Iznos</TableHead>
                  <TableHead className="text-xs text-right">PDV</TableHead>
                  <TableHead className="text-xs">Incoterms</TableHead>
                  <TableHead className="text-xs">Fiskalni broj</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outputInvoices.map(inv => (
                  <TableRow key={inv.id}>
                    <TableCell className="text-xs font-mono font-medium">{inv.number}</TableCell>
                    <TableCell className="text-xs">{inv.partner?.name || '-'}</TableCell>
                    <TableCell className="text-xs text-right font-medium">{formatRSD(inv.totalAmount)}</TableCell>
                    <TableCell className="text-xs text-right">{formatRSD(inv.taxAmount)}</TableCell>
                    <TableCell className="text-xs">
                      <Select value={inv.incoterms || 'none'} onValueChange={v => handleSetIncoterms(inv.id, v === 'none' ? '' : v)}>
                        <SelectTrigger className="h-7 w-24 text-xs"><SelectValue placeholder="Izaberi" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">-</SelectItem>
                          {incoterms.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-xs">
                      {inv.fiscalizedNumber ? (
                        <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-3 w-3" />{inv.fiscalizedNumber}</span>
                      ) : inv.status === 'placena' ? (
                        <span className="text-muted-foreground">-</span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-600"><AlertTriangle className="h-3 w-3" />Nije</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      <Badge variant={inv.status === 'placena' ? 'outline' : inv.sefStatus === 'sent' ? 'secondary' : 'outline'}>{inv.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {!inv.fiscalizedNumber && (inv.status === 'nacrt' || inv.status === 'poslata') && (
                        <Button size="sm" variant="outline" className="h-7 gap-1" onClick={() => handleFiskalizuj(inv.id, inv.number)}>
                          <Receipt className="h-3 w-3" /> Fiskalizuj
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* EPC QR Info */}
      <Card className="p-4">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">EPC QR kod</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground">EPC QR kodovi se generišu na izlaznim fakturama za plaćanje putem SEPA direktnog zaduženja. Sadrže IBAN primaoca, iznos, i referencu plaćanja.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="p-2 border rounded text-xs">
              <p className="font-medium">IBAN primaoca</p>
              <p className="text-muted-foreground">Postavlja se u Company profilu</p>
            </div>
            <div className="p-2 border rounded text-xs">
              <p className="font-medium">Iznos sa PDV</p>
              <p className="text-muted-foreground">Automatski iz fakture</p>
            </div>
            <div className="p-2 border rounded text-xs">
              <p className="font-medium">Referenca plaćanja</p>
              <p className="text-muted-foreground">Broj fakture kao referenca</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
