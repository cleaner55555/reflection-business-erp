'use client'import { ArrowRight, CheckCircle2, DollarSign, Eye, Mail, MapPin, Package, Phone, Plus, RefreshCw, Search, Trash2, Truck } from 'lucide-react'



// ========== OverviewTab ==========

export function OverviewTab({ cfg }: { cfg: any }) {
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
                <span className="text-xs text-muted-foreground">Ukupno pošiljki</span>
                <Package className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{dashboard.totalOrders}</p>
              <p className="text-xs text-muted-foreground">{dashboard.weekOrders} ovog tjedna</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">U tranzitu</span>
                <Truck className="h-4 w-4 text-sky-500" />
              </div>
              <p className="text-2xl font-bold text-sky-600">{dashboard.inTransitOrders}</p>
              <p className="text-xs text-muted-foreground">{dashboard.draftOrders} nacrta</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Isporučeno danas</span>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-600">{dashboard.deliveredToday}</p>
              <p className="text-xs text-muted-foreground">{dashboard.returnedOrders} vraćeno</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Troškovi dostave</span>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{formatCurrency(dashboard.totalShippingCost)}</p>
              <p className="text-xs text-muted-foreground">{dashboard.activeCarriers} kurira aktivno</p>
            </Card>
          </div>
    
          {/* COD & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Pošiljke po statusu</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {dashboard.statusBreakdown.map((s) => {
                  const cfg = statusConfig[s.status]
                  return (
                    <div key={s.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cfg?.color || ''}>{cfg?.label || s.status}</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${dashboard.totalOrders ? (s.count / dashboard.totalOrders) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{s.count}</span>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
    
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Pošiljke po kuriru</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {dashboard.carrierStats.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Nema podataka</p>
                ) : (
                  dashboard.carrierStats.map((c) => (
                    <div key={c.carrierId} className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">{c.carrierName}</span>
                        <Badge variant="outline" className="ml-2 text-[10px]">{c.carrierCode}</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{c.count} pošiljki</span>
                        <span className="text-sm font-medium w-28 text-right">{formatCurrency(c.totalCost)}</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
    
          {/* Recent Orders */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Nedavne pošiljke</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard.recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Nema pošiljki. Kreirajte prvu pošiljku da započnete.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs text-muted-foreground">
                        <th className="pb-2 pr-4">Broj</th>
                        <th className="pb-2 pr-4">Kurir</th>
                        <th className="pb-2 pr-4">Primalac</th>
                        <th className="pb-2 pr-4">Status</th>
                        <th className="pb-2 pr-4">Trošak</th>
                        <th className="pb-2">Datum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.recentOrders.map((o) => {
                        const cfg = statusConfig[o.status]
                        return (
                          <tr key={o.id} className="border-b last:border-0 hover:bg-muted/50">
                            <td className="py-2 pr-4 font-mono text-xs">{o.number}</td>
                            <td className="py-2 pr-4">{o.carrier?.name || '-'}</td>
                            <td className="py-2 pr-4">{o.recipientName || o.partner?.name || '-'}</td>
                            <td className="py-2 pr-4">
                              <Badge variant="outline" className={`text-[10px] ${cfg?.color || ''}`}>{cfg?.label || o.status}</Badge>
                            </td>
                            <td className="py-2 pr-4">{formatCurrency(o.shippingCost)}</td>
                            <td className="py-2 text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString('sr-RS')}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </TabsContent>
  )
}

// ========== OrdersTab ==========

export function OrdersTab({ cfg, key, loading, orders, ordersFilter, ordersSearch, setOrdersFilter }: { cfg: any, key: any, loading: any, orders: any, ordersFilter: any, ordersSearch: any, setOrdersFilter: any }) {
  return (
    <TabsContent value="orders" className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pretraži po broju, primaocu, tracking..."
            className="pl-9"
            value={ordersSearch}
            onChange={(e) => setOrdersSearch(e.target.value)}
          />
        </div>
        <Select value={ordersFilter} onValueChange={setOrdersFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Svi statusi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Svi statusi</SelectItem>
            {Object.entries(statusConfig).map(([key, val]) => (
              <SelectItem key={key} value={key}>{val.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    
      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : orders.length === 0 ? (
        <Card className="p-8 text-center">
          <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Nema pošiljki</p>
          <Button variant="outline" className="mt-3" onClick={() => setOrderDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Kreiraj prvu pošiljku
          </Button>
        </Card>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="p-3">Broj</th>
                  <th className="p-3">Kurir</th>
                  <th className="p-3">Primalac</th>
                  <th className="p-3">Težina</th>
                  <th className="p-3">Pouzeće</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Datum</th>
                  <th className="p-3">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const cfg = statusConfig[o.status]
                  return (
                    <tr key={o.id} className="border-t hover:bg-muted/30">
                      <td className="p-3 font-mono text-xs">{o.number}</td>
                      <td className="p-3">{o.carrier?.name || '-'}</td>
                      <td className="p-3">
                        <div>{o.recipientName || '-'}</div>
                        {o.recipientCity && <div className="text-xs text-muted-foreground">{o.recipientCity}</div>}
                      </td>
                      <td className="p-3 text-xs">{o.weight} kg</td>
                      <td className="p-3 text-xs font-medium">{o.codAmount > 0 ? formatCurrency(o.codAmount) : '-'}</td>
                      <td className="p-3">
                        <Badge variant="outline" className={`text-[10px] ${cfg?.color || ''}`}>{cfg?.label || o.status}</Badge>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString('sr-RS')}</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openTracking(o)}>
                            <MapPin className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleUpdateOrderStatus(o.id, o.status === 'nacrt' ? 'cekanje_preuzimanja' : o.status === 'cekanje_preuzimanja' ? 'u_tranzitu' : o.status === 'u_tranzitu' ? 'isporuceno' : o.status)}>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDeleteOrder(o.id)}>
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

// ========== CarriersTab ==========

export function CarriersTab({ carriers }: { carriers: any }) {
  return (
    <TabsContent value="carriers" className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setCarrierDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Novi kurir
        </Button>
      </div>
    
      {carriers.length === 0 ? (
        <Card className="p-8 text-center">
          <Truck className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Nema kurirskih službi</p>
          <p className="text-xs text-muted-foreground mt-1">Dodajte kurirske službe (BEX, Post Express, DHL...)</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {carriers.map((c) => (
            <Card key={c.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{c.name}</CardTitle>
                    <Badge variant="outline" className="mt-1 text-[10px]">{carrierTypeLabels[c.type] || c.type}</Badge>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDeleteCarrier(c.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Globe2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{c.code}</span>
                </div>
                {c.contactPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs">{c.contactPhone}</span>
                  </div>
                )}
                {c.contactEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs">{c.contactEmail}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Pošiljki</span>
                  <span className="font-medium">{c._count?.orders || 0}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Dostava</span>
                  <span className="font-medium">{c.deliveryEstimate} dana</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Cena</span>
                  <span className="font-medium">{c.defaultPrice > 0 ? formatCurrency(c.defaultPrice) : 'Prilagođena'}</span>
                </div>
                {!c.isActive && (
                  <Badge variant="secondary" className="text-[10px]">Neaktivan</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </TabsContent>
  )
}

// ========== TrackingTab ==========

export function TrackingTab({ cfg, loadOrders, orders, ordersSearch }: { cfg: any, loadOrders: any, orders: any, ordersSearch: any }) {
  return (
    <TabsContent value="tracking" className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pretraži pošiljku po broju ili tracking broju..."
            className="pl-9"
            value={ordersSearch}
            onChange={(e) => setOrdersSearch(e.target.value)}
          />
        </div>
        <Button onClick={loadOrders}>
          <Search className="h-4 w-4 mr-1" /> Pretraži
        </Button>
      </div>
    
      {orders.length === 0 ? (
        <Card className="p-8 text-center">
          <MapPin className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Unesite broj pošiljke ili tracking broj za praćenje</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const cfg = statusConfig[o.status]
            return (
              <Card key={o.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium">{o.number}</span>
                        <Badge variant="outline" className={`text-[10px] ${cfg?.color || ''}`}>{cfg?.label || o.status}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {o.carrier?.name && <span>{o.carrier.name} · </span>}
                        {o.trackingNumber && <span>Tracking: {o.trackingNumber}</span>}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => openTracking(o)}>
                      <Eye className="h-3.5 w-3.5 mr-1" /> Detalji
                    </Button>
                  </div>
    
                  {/* Route visualization */}
                  <div className="flex items-center gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-medium">{o.senderCity || 'Pošiljalac'}</div>
                      <div className="text-muted-foreground max-w-[100px] truncate">{o.senderName}</div>
                    </div>
                    <div className="flex-1 flex items-center">
                      <div className={`h-2 w-2 rounded-full ${o.status === 'nacrt' ? 'bg-gray-300' : 'bg-green-500'}`} />
                      <div className={`flex-1 h-0.5 ${o.status === 'isporuceno' ? 'bg-green-500' : o.status === 'u_tranzitu' ? 'bg-sky-400' : 'bg-gray-200'}`} />
                      <Truck className={`h-3.5 w-3.5 mx-1 ${o.status === 'u_tranzitu' ? 'text-sky-500' : 'text-gray-300'}`} />
                      <div className={`flex-1 h-0.5 ${o.status === 'isporuceno' ? 'bg-green-500' : 'bg-gray-200'}`} />
                      <div className={`h-2 w-2 rounded-full ${o.status === 'isporuceno' ? 'bg-green-500' : 'bg-gray-300'}`} />
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{o.recipientCity || 'Primalac'}</div>
                      <div className="text-muted-foreground max-w-[100px] truncate">{o.recipientName}</div>
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

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { TabsContent } from '@/components/ui/tabs'

// ========== Novapoiljka ==========

export function Novapoiljka({ carriers, handleCreateOrder, orderDialogOpen, partners, setOrderDialogOpen }: { carriers: any, handleCreateOrder: any, orderDialogOpen: any, partners: any, setOrderDialogOpen: any }) {
  return (
    <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nova pošiljka</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Kurir & Partner */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kurirska služba</Label>
                    <Select value={orderForm.carrierId} onValueChange={(v) => setOrderForm({ ...orderForm, carrierId: v })}>
                      <SelectTrigger><SelectValue placeholder="Izaberite kurira" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Bez kurira</SelectItem>
                        {carriers.filter(c => c.isActive).map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Partner</Label>
                    <Select value={orderForm.partnerId} onValueChange={(v) => setOrderForm({ ...orderForm, partnerId: v })}>
                      <SelectTrigger><SelectValue placeholder="Izaberite partnera" /></SelectTrigger>
                      <SelectContent>
                        {partners.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
    
                {/* Dimensions */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Težina (kg)</Label>
                    <Input type="number" step="0.1" value={orderForm.weight} onChange={(e) => setOrderForm({ ...orderForm, weight: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Zapremina (m³)</Label>
                    <Input type="number" step="0.01" value={orderForm.volume} onChange={(e) => setOrderForm({ ...orderForm, volume: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Broj paketa</Label>
                    <Input type="number" value={orderForm.packageCount} onChange={(e) => setOrderForm({ ...orderForm, packageCount: parseInt(e.target.value) || 1 })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Deklarisana vrednost</Label>
                    <Input type="number" value={orderForm.declaredValue} onChange={(e) => setOrderForm({ ...orderForm, declaredValue: parseFloat(e.target.value) || 0 })} />
                  </div>
                </div>
    
                {/* Costs */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Trošak dostave (RSD)</Label>
                    <Input type="number" value={orderForm.shippingCost} onChange={(e) => setOrderForm({ ...orderForm, shippingCost: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Pouzeće (RSD)</Label>
                    <Input type="number" value={orderForm.codAmount} onChange={(e) => setOrderForm({ ...orderForm, codAmount: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="flex items-end gap-2 pb-1">
                    <Switch checked={orderForm.insurance} onCheckedChange={(v) => setOrderForm({ ...orderForm, insurance: v })} />
                    <Label className="text-xs">Osiguranje</Label>
                  </div>
                </div>
    
                <Separator />
    
                {/* Sender */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Adresa pošiljaoca</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Ime / Firma</Label>
                      <Input value={orderForm.senderName} onChange={(e) => setOrderForm({ ...orderForm, senderName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Telefon</Label>
                      <Input value={orderForm.senderPhone} onChange={(e) => setOrderForm({ ...orderForm, senderPhone: e.target.value })} />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label className="text-xs">Adresa</Label>
                      <Input value={orderForm.senderAddress} onChange={(e) => setOrderForm({ ...orderForm, senderAddress: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Grad</Label>
                      <Input value={orderForm.senderCity} onChange={(e) => setOrderForm({ ...orderForm, senderCity: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Poštanski broj</Label>
                      <Input value={orderForm.senderZip} onChange={(e) => setOrderForm({ ...orderForm, senderZip: e.target.value })} />
                    </div>
                  </div>
                </div>
    
                {/* Recipient */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Adresa primaoca</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Ime / Firma</Label>
                      <Input value={orderForm.recipientName} onChange={(e) => setOrderForm({ ...orderForm, recipientName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Telefon</Label>
                      <Input value={orderForm.recipientPhone} onChange={(e) => setOrderForm({ ...orderForm, recipientPhone: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Email</Label>
                      <Input value={orderForm.recipientEmail} onChange={(e) => setOrderForm({ ...orderForm, recipientEmail: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Poštanski broj</Label>
                      <Input value={orderForm.recipientZip} onChange={(e) => setOrderForm({ ...orderForm, recipientZip: e.target.value })} />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label className="text-xs">Adresa</Label>
                      <Input value={orderForm.recipientAddress} onChange={(e) => setOrderForm({ ...orderForm, recipientAddress: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Grad</Label>
                      <Input value={orderForm.recipientCity} onChange={(e) => setOrderForm({ ...orderForm, recipientCity: e.target.value })} />
                    </div>
                  </div>
                </div>
    
                {/* Notes */}
                <div className="space-y-2">
                  <Label className="text-xs">Napomene</Label>
                  <Textarea value={orderForm.notes} onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })} rows={2} />
                </div>
              </div>
    
              <DialogFooter>
                <Button variant="outline" onClick={() => setOrderDialogOpen(false)}>Otkaži</Button>
                <Button onClick={handleCreateOrder}>Kreiraj pošiljku</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
  )
}


// ========== Novikurir ==========

export function Novikurir({ carrierDialogOpen, handleCreateCarrier, setCarrierDialogOpen }: { carrierDialogOpen: any, handleCreateCarrier: any, setCarrierDialogOpen: any }) {
  return (
    <Dialog open={carrierDialogOpen} onOpenChange={setCarrierDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Novi kurir</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Naziv</Label>
                    <Input value={carrierForm.name} onChange={(e) => setCarrierForm({ ...carrierForm, name: e.target.value })} placeholder="npr. BEX" />
                  </div>
                  <div className="space-y-2">
                    <Label>Šifra</Label>
                    <Input value={carrierForm.code} onChange={(e) => setCarrierForm({ ...carrierForm, code: e.target.value })} placeholder="npr. bex" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tip</Label>
                    <Select value={carrierForm.type} onValueChange={(v) => setCarrierForm({ ...carrierForm, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="domestic">Domaći</SelectItem>
                        <SelectItem value="regional">Regionalni</SelectItem>
                        <SelectItem value="international">Međunarodni</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Vreme dostave (dana)</Label>
                    <Input value={carrierForm.deliveryEstimate} onChange={(e) => setCarrierForm({ ...carrierForm, deliveryEstimate: e.target.value })} placeholder="1-3" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Telefon</Label>
                    <Input value={carrierForm.contactPhone} onChange={(e) => setCarrierForm({ ...carrierForm, contactPhone: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={carrierForm.contactEmail} onChange={(e) => setCarrierForm({ ...carrierForm, contactEmail: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input value={carrierForm.website} onChange={(e) => setCarrierForm({ ...carrierForm, website: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>API URL</Label>
                    <Input value={carrierForm.apiUrl} onChange={(e) => setCarrierForm({ ...carrierForm, apiUrl: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Podrazumevana težina (kg)</Label>
                    <Input type="number" step="0.1" value={carrierForm.defaultWeight} onChange={(e) => setCarrierForm({ ...carrierForm, defaultWeight: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Podrazumevana cena (RSD)</Label>
                    <Input type="number" value={carrierForm.defaultPrice} onChange={(e) => setCarrierForm({ ...carrierForm, defaultPrice: parseFloat(e.target.value) || 0 })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Napomene</Label>
                  <Textarea value={carrierForm.notes} onChange={(e) => setCarrierForm({ ...carrierForm, notes: e.target.value })} rows={2} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCarrierDialogOpen(false)}>Otkaži</Button>
                <Button onClick={handleCreateCarrier}>Dodaj kurira</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
  )
}


// ========== PraenjepoiljkeselectedOrd ==========

export function PraenjepoiljkeselectedOrd({ selectedOrder, setTrackingDialogOpen, trackingDialogOpen }: { selectedOrder: any, setTrackingDialogOpen: any, trackingDialogOpen: any }) {
  return (
    <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Praćenje pošiljke {selectedOrder?.number}</DialogTitle>
              </DialogHeader>
              {selectedOrder && (
                <div className="space-y-4">
                  {/* Status header */}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={`text-xs ${statusConfig[selectedOrder.status]?.color || ''}`}>
                      {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                    </Badge>
                    {selectedOrder.trackingNumber && (
                      <span className="text-xs text-muted-foreground font-mono">{selectedOrder.trackingNumber}</span>
                    )}
                  </div>
    
                  {/* Route */}
                  <div className="flex items-center gap-2 text-sm p-3 bg-muted/50 rounded-lg">
                    <div className="text-center">
                      <div className="font-medium">{selectedOrder.senderCity || 'Od'}</div>
                      <div className="text-xs text-muted-foreground">{selectedOrder.senderName}</div>
                    </div>
                    <div className="flex-1 flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      <div className={`flex-1 h-0.5 ${selectedOrder.status === 'isporuceno' ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      <div className={`flex-1 h-0.5 ${selectedOrder.status === 'isporuceno' ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div className={`h-1.5 w-1.5 rounded-full ${selectedOrder.status === 'isporuceno' ? 'bg-green-500' : 'bg-gray-300'}`} />
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{selectedOrder.recipientCity || 'Do'}</div>
                      <div className="text-xs text-muted-foreground">{selectedOrder.recipientName}</div>
                    </div>
                  </div>
    
                  {/* Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between p-2 bg-muted/30 rounded"><span className="text-muted-foreground">Težina:</span><span>{selectedOrder.weight} kg</span></div>
                    <div className="flex justify-between p-2 bg-muted/30 rounded"><span className="text-muted-foreground">Paketa:</span><span>{selectedOrder.packageCount}</span></div>
                    <div className="flex justify-between p-2 bg-muted/30 rounded"><span className="text-muted-foreground">Trošak:</span><span>{formatCurrency(selectedOrder.shippingCost)}</span></div>
                    <div className="flex justify-between p-2 bg-muted/30 rounded"><span className="text-muted-foreground">Pouzeće:</span><span>{formatCurrency(selectedOrder.codAmount)}</span></div>
                  </div>
    
                  {/* Quick Actions */}
                  {selectedOrder.status !== 'isporuceno' && selectedOrder.status !== 'vraceno' && selectedOrder.status !== 'otkazano' && (
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Brze akcije</Label>
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" variant="outline" onClick={() => handleAddTrackingEvent('picked_up', 'Pošiljka preuzeta od pošiljaoca', selectedOrder.senderCity)}>
                          Preuzeto
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleAddTrackingEvent('in_transit', 'Pošiljka u tranzitu', selectedOrder.recipientCity)}>
                          U tranzitu
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleAddTrackingEvent('out_for_delivery', 'Isporuka u toku', selectedOrder.recipientCity)}>
                          Isporuka u toku
                        </Button>
                        <Button size="sm" onClick={() => handleAddTrackingEvent('delivered', 'Uspešno isporučeno', selectedOrder.recipientCity)}>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Isporučeno
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
  )
}

