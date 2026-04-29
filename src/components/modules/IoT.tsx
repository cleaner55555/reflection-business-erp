/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Wifi, RefreshCw, BarChart3, Thermometer, Droplets, Zap,
  CheckCircle2, AlertCircle, Clock, Activity, MapPin, Settings
} from 'lucide-react'

interface IoTSensor {
  id: string
  name: string
  type: string
  location?: string
  status: string
  lastReading?: number
  unit?: string
  batteryLevel?: number
  updatedAt?: string
}

const sensorTypeConfig: Record<string, { label: string; color: string; icon: string }> = {
  temperature: { label: 'Temperatura', color: 'bg-red-100 text-red-700', icon: '🌡️' },
  humidity: { label: 'Vlažnost', color: 'bg-blue-100 text-blue-700', icon: '💧' },
  motion: { label: 'Pokret', color: 'bg-amber-100 text-amber-700', icon: '🏃' },
  door: { label: 'Vrata', color: 'bg-green-100 text-green-700', icon: '🚪' },
  weight: { label: 'Težina', color: 'bg-purple-100 text-purple-700', icon: '⚖️' },
  energy: { label: 'Energija', color: 'bg-yellow-100 text-yellow-700', icon: '⚡' },
  gps: { label: 'GPS', color: 'bg-teal-100 text-teal-700', icon: '📍' },
}

const statusConfig: Record<string, { label: string; color: string }> = {
  online: { label: 'Online', color: 'bg-green-100 text-green-700' },
  offline: { label: 'Offline', color: 'bg-red-100 text-red-700' },
  warning: { label: 'Upozorenje', color: 'bg-amber-100 text-amber-700' },
}

export function IoT() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [sensors, setSensors] = useState<IoTSensor[]>([])

  const loadSensors = useCallback(async () => {
    // IoT data would come from a dedicated microservice
    const demoSensors: IoTSensor[] = [
      { id: '1', name: 'Hladnjača A1', type: 'temperature', location: 'Magacin 1', status: 'online', lastReading: 4.2, unit: '°C', batteryLevel: 85, updatedAt: new Date().toISOString() },
      { id: '2', name: 'Senzor vlage B2', type: 'humidity', location: 'Magacin 2', status: 'online', lastReading: 65, unit: '%', batteryLevel: 92, updatedAt: new Date().toISOString() },
      { id: '3', name: 'Ulazna vrata', type: 'door', location: 'Glavni ulaz', status: 'online', lastReading: 0, batteryLevel: 78, updatedAt: new Date().toISOString() },
      { id: '4', name: 'Težinska rampa', type: 'weight', location: 'Otprema', status: 'warning', lastReading: 1250, unit: 'kg', batteryLevel: 45, updatedAt: new Date().toISOString() },
      { id: '5', name: 'GPS Dostava V1', type: 'gps', location: 'Dostavno vozilo 1', status: 'online', batteryLevel: 100, updatedAt: new Date().toISOString() },
      { id: '6', name: 'Merač struje', type: 'energy', location: 'Kancelarija', status: 'offline', lastReading: 0, unit: 'kWh', batteryLevel: 0, updatedAt: new Date().toISOString() },
    ]
    setSensors(demoSensors)
  }, [activeCompanyId])

  useEffect(() => { loadSensors() }, [activeCompanyId, loadSensors])

  const onlineSensors = sensors.filter((s) => s.status === 'online').length
  const warningSensors = sensors.filter((s) => s.status === 'warning').length
  const offlineSensors = sensors.filter((s) => s.status === 'offline').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">IoT</h1>
          <p className="text-sm text-muted-foreground">Internet of Things - senzori i uredjaji</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadSensors}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="sensors"><Wifi className="h-4 w-4 mr-1" /> Senzori</TabsTrigger>
          <TabsTrigger value="alerts"><AlertCircle className="h-4 w-4 mr-1" /> Upozorenja</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Senzora</span><Wifi className="h-4 w-4 text-muted-foreground" /></div><p className="text-2xl font-bold">{sensors.length}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Online</span><CheckCircle2 className="h-4 w-4 text-green-500" /></div><p className="text-2xl font-bold text-green-600">{onlineSensors}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Upozorenja</span><AlertCircle className="h-4 w-4 text-amber-500" /></div><p className="text-2xl font-bold text-amber-600">{warningSensors}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Offline</span><Wifi className="h-4 w-4 text-red-500" /></div><p className="text-2xl font-bold text-red-600">{offlineSensors}</p></Card>
          </div>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Podržani tipovi senzora</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(sensorTypeConfig).map(([key, cfg]) => (
                  <div key={key} className="p-3 border rounded-lg text-center">
                    <span className="text-2xl">{cfg.icon}</span>
                    <p className="text-sm font-medium mt-1">{cfg.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">IoT integracije</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Automatsko praćenje zaliha</p><p className="text-xs text-muted-foreground">Težinski senzori na policama automatski ažuriraju stanje</p></div></div>
              <div className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Kontrola temperature</p><p className="text-xs text-muted-foreground">Alert kada temperatura izađe iz dozvoljenog opsega</p></div></div>
              <div className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">GPS praćenje</p><p className="text-xs text-muted-foreground">Praćenje dostavnih vozila u realnom vremenu</p></div></div>
              <div className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Sigurnosni sistemi</p><p className="text-xs text-muted-foreground">Senzori pokreta, vrata, prozora</p></div></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sensors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sensors.map((s) => {
              const typeCfg = sensorTypeConfig[s.type]
              const statCfg = statusConfig[s.status]
              return (
                <Card key={s.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{typeCfg?.icon}</span>
                        <div>
                          <CardTitle className="text-sm">{s.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">{s.location}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${statCfg?.color}`}>{statCfg?.label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Trenutna vrednost</span>
                      <span className="text-lg font-bold">{s.lastReading ?? '-'}{s.unit ? ` ${s.unit}` : ''}</span>
                    </div>
                    {s.batteryLevel !== undefined && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Baterija</span>
                          <span>{s.batteryLevel}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${s.batteryLevel > 50 ? 'bg-green-500' : s.batteryLevel > 20 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${s.batteryLevel}%` }} />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">IoT upozorenja</p>
            <p className="text-xs text-muted-foreground mt-1">Konfigurišite pragove za automatska upozorenja</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
