'use client'

import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
import { useShipping } from './hooks'

export function Shipping() {
  const {activeTab, carrierDialogOpen, carriers, cfg, handleCreateCarrier, handleCreateOrder, key, loadOrders, loading, orderDialogOpen, orders, ordersFilter, ordersSearch, partners, selectedOrder, setActiveTab, setCarrierDialogOpen, setOrderDialogOpen, setOrdersFilter, setTrackingDialogOpen, trackingDialogOpen} = useShipping()
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Isporuka & Logistika</h1>
          <p className="text-sm text-muted-foreground">Upravljanje kurirskim službama, pošiljkama i praćenjem</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { loadDashboard(); loadOrders(); loadCarriers(); }}>
            <RefreshCw className="h-4 w-4 mr-1" /> Osveži
          </Button>
          <Button size="sm" onClick={() => setOrderDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Nova pošiljka
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="orders"><Package className="h-4 w-4 mr-1" /> Pošiljke</TabsTrigger>
          <TabsTrigger value="carriers"><Truck className="h-4 w-4 mr-1" /> Kuriri</TabsTrigger>
          <TabsTrigger value="tracking"><MapPin className="h-4 w-4 mr-1" /> Praćenje</TabsTrigger>
        </TabsList>

        {/* ===== OVERVIEW TAB ===== */}
        <OverviewTab cfg={cfg} />

        {/* ===== ORDERS TAB ===== */}
        <OrdersTab cfg={cfg} key={key} loading={loading} orders={orders} ordersFilter={ordersFilter} ordersSearch={ordersSearch} setOrdersFilter={setOrdersFilter} />

        {/* ===== CARRIERS TAB ===== */}
        <CarriersTab carriers={carriers} />

        {/* ===== TRACKING TAB ===== */}
        <TrackingTab cfg={cfg} loadOrders={loadOrders} orders={orders} ordersSearch={ordersSearch} />
      </Tabs>

      {/* ===== NEW ORDER DIALOG ===== */}
              <Novapoiljka carriers={carriers} handleCreateOrder={handleCreateOrder} orderDialogOpen={orderDialogOpen} partners={partners} setOrderDialogOpen={setOrderDialogOpen} />

      {/* ===== NEW CARRIER DIALOG ===== */}
              <Novikurir carrierDialogOpen={carrierDialogOpen} handleCreateCarrier={handleCreateCarrier} setCarrierDialogOpen={setCarrierDialogOpen} />

      {/* ===== TRACKING DETAIL DIALOG ===== */}
              <PraenjepoiljkeselectedOrd selectedOrder={selectedOrder} setTrackingDialogOpen={setTrackingDialogOpen} trackingDialogOpen={trackingDialogOpen} />
    </div>
  )
}
