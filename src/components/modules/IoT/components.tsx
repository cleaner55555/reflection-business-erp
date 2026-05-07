'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
  Wifi, RefreshCw, BarChart3, Thermometer, Droplets, Zap,
  CheckCircle2, AlertCircle, AlertTriangle, Clock, Activity, MapPin,
  Settings, Plus, Search, Eye, Trash2, Edit3, X, Filter,
  Cpu, Smartphone, Radio, Battery, BatteryCharging, BatteryWarning,
  BatteryFull, Home, Warehouse, Truck, Building2, Factory,
  TrendingUp, TrendingDown, Bell, BellOff, Play, Pause, Square,
  ChevronRight, ArrowUpRight, ArrowDownRight, Info, MoreVertical,
  Monitor, HardDrive, Shield, ShieldAlert, Lock, Unlock,
  History, FileText, Download, Upload, Copy, Link2, Share2,
  ThermometerSun, Gauge, Scale, Lightbulb, Wind, Volume2,
  RadioTower, Router, Server, Database, Globe, Network,
  QrCode, ScanLine, Satellite, Blinds, DoorOpen, DoorClosed,
  Power, Plug, Timer, CalendarDays, Users, Target,
  LayoutGrid, List, PieChart, LineChart, CircleDot
} from 'lucide-react'
import { formatDate } from '@/lib/helpers'
import { toast } from 'sonner'

// ============ TYPES ============

interface IoTSensor {
  id: string
  name: string
  type: string
  location: string | null
  status: string
  lastReading: number | null
  unit: string | null
  batteryLevel: number
  signalStrength: number
  firmware: string | null
  protocol: string | null
  groupId: string | null
  partnerId: string | null
  notes: string | null
  minThreshold: number | null
  maxThreshold: number | null
  alertEnabled: boolean
  samplingRate: number
  lastAlertAt: string | null
  totalAlerts: number
  uptime: number
  createdAt: string
  updatedAt: string
  readings?: SensorReading[]
  group?: { id: string; name: string } | null
}

interface SensorReading {
  id: string
  sensorId: string
  value: number
  timestamp: string
  status: string
}

interface AlertRule {
  id: string
  name: string
  sensorType: string
  sensorId: string | null
  groupId: string | null
  condition: 'above' | 'below' | 'equals' | 'outside_range' | 'inside_range' | 'change' | 'offline'
  threshold: number | null
  thresholdMax: number | null
  duration: number
  severity: 'info' | 'warning' | 'critical'
  enabled: boolean
  notifyEmail: boolean
  notifyPush: boolean
  notifySms: boolean
  cooldown: number
  lastTriggeredAt: string | null
  triggerCount: number
  createdAt: string
}

interface AutomationRule {
  id: string
  name: string
  description: string
  triggerType: 'sensor_value' | 'sensor_offline' | 'sensor_online' | 'schedule' | 'battery_low' | 'alert_triggered'
  triggerSensorId: string | null
  triggerCondition: string
  triggerValue: number | null
  actionType: 'notify' | 'webhook' | 'toggle_device' | 'log' | 'create_ticket' | 'update_inventory'
  actionConfig: string | null
  enabled: boolean
  lastExecutedAt: string | null
  executionCount: number
  createdAt: string
}

interface DeviceGroup {
  id: string
  name: string
  description: string | null
  location: string | null
  icon: string
  color: string
  sensorCount: number
  createdAt: string
}

interface IoTAlert {
  id: string
  sensorId: string
  sensorName: string
  sensorType: string
  type: string
  message: string
  severity: 'info' | 'warning' | 'critical'
  value: number | null
  threshold: number | null
  acknowledged: boolean
  createdAt: string
}

// ============ CONSTANTS ============

const SENSOR_TYPE_CONFIG: Record<string, { label: string; color: string; icon: string; unit: string; defaultMin: number; defaultMax: number }> = {
  temperature: { label: 'Temperatura', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: '🌡️', unit: '°C', defaultMin: -10, defaultMax: 60 },
  humidity: { label: 'Vlažnost', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: '💧', unit: '%', defaultMin: 0, defaultMax: 100 },
  motion: { label: 'Pokret', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: '🏃', unit: '', defaultMin: 0, defaultMax: 1 },
  door: { label: 'Vrata', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: '🚪', unit: '', defaultMin: 0, defaultMax: 1 },
  weight: { label: 'Težina', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: '⚖️', unit: 'kg', defaultMin: 0, defaultMax: 5000 },
  energy: { label: 'Energija', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: '⚡', unit: 'kWh', defaultMin: 0, defaultMax: 1000 },
  gps: { label: 'GPS', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400', icon: '📍', unit: '', defaultMin: 0, defaultMax: 1 },
  pressure: { label: 'Pritisak', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', icon: '📊', unit: 'hPa', defaultMin: 900, defaultMax: 1100 },
  light: { label: 'Svetlo', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: '💡', unit: 'lux', defaultMin: 0, defaultMax: 10000 },
  noise: { label: 'Bučka', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', icon: '🔊', unit: 'dB', defaultMin: 0, defaultMax: 120 },
  co2: { label: 'CO₂', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: '🫧', unit: 'ppm', defaultMin: 0, defaultMax: 5000 },
  vibration: { label: 'Vibracije', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', icon: '📳', unit: 'mm/s', defaultMin: 0, defaultMax: 100 },
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dotColor: string }> = {
  online: { label: 'Online', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', dotColor: 'bg-green-500' },
  offline: { label: 'Offline', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', dotColor: 'bg-red-500' },
  warning: { label: 'Upozorenje', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', dotColor: 'bg-amber-500' },
  maintenance: { label: 'Održavanje', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', dotColor: 'bg-blue-500' },
}

const SEVERITY_CONFIG: Record<string, { label: string; color: string }> = {
  info: { label: 'Informacija', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  warning: { label: 'Upozorenje', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  critical: { label: 'Kritično', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

const PROTOCOLS = ['MQTT', 'HTTP', 'CoAP', 'LoRaWAN', 'Zigbee', 'BLE', 'WiFi', 'Modbus', 'OPC-UA', 'BACnet']
  { value: 10, label: 'Svako 10s' },
  { value: 30, label: 'Svako 30s' },
  { value: 60, label: 'Svaki minut' },
  { value: 300, label: 'Svaka 5 min' },
  { value: 600, label: 'Svaka 10 min' },
  { value: 1800, label: 'Svaka 30 min' },
  { value: 3600, label: 'Svaki sat' },
]

// ============ DEMO DATA ============

const generateReadings = (sensorId: string, baseValue: number, variance: number, count: number): SensorReading[] => {
  const now = Date.now()
  for (let i = count - 1; i >= 0; i--) {
    const value = baseValue + (Math.random() - 0.5) * variance * 2
    readings.push({
      id: `r-${sensorId}-${i}`,
      sensorId,
      value: Math.round(value * 100) / 100,
      timestamp: new Date(now - i * 600000).toISOString(),
      status: 'normal',
    })
  }
  return readings
}

const DEMO_SENSORS: IoTSensor[] = [
  { id: 's1', name: 'Hladnjača A1', type: 'temperature', location: 'Magacin 1', status: 'online', lastReading: 4.2, unit: '°C', batteryLevel: 85, signalStrength: 92, firmware: 'v2.1.3', protocol: 'MQTT', groupId: 'g1', partnerId: null, notes: 'Hladnjača za namirnice - opseg 2-8°C', minThreshold: 2, maxThreshold: 8, alertEnabled: true, samplingRate: 60, lastAlertAt: null, totalAlerts: 3, uptime: 99.2, createdAt: '2024-06-15T10:00:00Z', updatedAt: new Date().toISOString(), readings: generateReadings('s1', 4.5, 1.5, 24) },
  { id: 's2', name: 'Senzor vlage B2', type: 'humidity', location: 'Magacin 2', status: 'online', lastReading: 65, unit: '%', batteryLevel: 92, signalStrength: 88, firmware: 'v1.8.0', protocol: 'Zigbee', groupId: 'g1', partnerId: null, notes: 'Kontrola vlage za elektroniku', minThreshold: 30, maxThreshold: 70, alertEnabled: true, samplingRate: 300, lastAlertAt: '2025-01-10T08:00:00Z', totalAlerts: 7, uptime: 98.5, createdAt: '2024-06-15T10:00:00Z', updatedAt: new Date().toISOString(), readings: generateReadings('s2', 62, 8, 24) },
  { id: 's3', name: 'Ulazna vrata', type: 'door', location: 'Glavni ulaz', status: 'online', lastReading: 0, unit: '', batteryLevel: 78, signalStrength: 95, firmware: 'v3.0.1', protocol: 'WiFi', groupId: 'g2', partnerId: null, notes: 'Magnetni senzor vrata', minThreshold: null, maxThreshold: null, alertEnabled: true, samplingRate: 10, lastAlertAt: null, totalAlerts: 0, uptime: 99.9, createdAt: '2024-07-01T10:00:00Z', updatedAt: new Date().toISOString(), readings: generateReadings('s3', 0, 0.3, 24) },
  { id: 's4', name: 'Težinska rampa', type: 'weight', location: 'Otprema', status: 'warning', lastReading: 1250, unit: 'kg', batteryLevel: 45, signalStrength: 70, firmware: 'v1.2.0', protocol: 'Modbus', groupId: 'g3', partnerId: null, notes: 'Rampa za merenje težine pošiljki. Baterija niska!', minThreshold: 0, maxThreshold: 2000, alertEnabled: true, samplingRate: 30, lastAlertAt: new Date().toISOString(), totalAlerts: 12, uptime: 95.3, createdAt: '2024-05-10T10:00:00Z', updatedAt: new Date().toISOString(), readings: generateReadings('s4', 1200, 200, 24) },
  { id: 's5', name: 'GPS Dostava V1', type: 'gps', location: 'Dostavno vozilo 1', status: 'online', batteryLevel: 100, signalStrength: 85, firmware: 'v4.0.0', protocol: 'LTE', groupId: 'g4', partnerId: null, notes: 'GPS tracker na dostavnom vozilu', minThreshold: null, maxThreshold: null, alertEnabled: true, samplingRate: 60, lastAlertAt: null, totalAlerts: 1, uptime: 99.7, createdAt: '2024-08-01T10:00:00Z', updatedAt: new Date().toISOString(), readings: generateReadings('s5', 1, 0.1, 24) },
  { id: 's6', name: 'Merač struje', type: 'energy', location: 'Server soba', status: 'offline', lastReading: 0, unit: 'kWh', batteryLevel: 0, signalStrength: 0, firmware: 'v2.0.5', protocol: 'Modbus', groupId: 'g5', partnerId: null, notes: 'Merenje potrošnje server sobe - NE RADI', minThreshold: 0, maxThreshold: 500, alertEnabled: true, samplingRate: 60, lastAlertAt: new Date().toISOString(), totalAlerts: 5, uptime: 87.2, createdAt: '2024-04-20T10:00:00Z', updatedAt: new Date().toISOString(), readings: [] },
  { id: 's7', name: 'CO₂ senzor', type: 'co2', location: 'Kancelarija', status: 'online', lastReading: 450, unit: 'ppm', batteryLevel: 98, signalStrength: 90, firmware: 'v1.5.0', protocol: 'WiFi', groupId: 'g2', partnerId: null, notes: 'Kvalitet vazduha u kancelariji', minThreshold: 0, maxThreshold: 1000, alertEnabled: true, samplingRate: 300, lastAlertAt: null, totalAlerts: 2, uptime: 99.8, createdAt: '2024-09-01T10:00:00Z', updatedAt: new Date().toISOString(), readings: generateReadings('s7', 480, 100, 24) },
  { id: 's8', name: 'LUX senzor', type: 'light', location: 'Hala A', status: 'online', lastReading: 350, unit: 'lux', batteryLevel: 70, signalStrength: 82, firmware: 'v1.0.0', protocol: 'Zigbee', groupId: 'g6', partnerId: null, notes: 'Automatsko upravljanje osvetljenjem', minThreshold: 100, maxThreshold: 800, alertEnabled: false, samplingRate: 600, lastAlertAt: null, totalAlerts: 0, uptime: 99.5, createdAt: '2024-10-01T10:00:00Z', updatedAt: new Date().toISOString(), readings: generateReadings('s8', 380, 120, 24) },
  { id: 's9', name: 'Senzor buke', type: 'noise', location: 'Proizvodnja', status: 'online', lastReading: 72, unit: 'dB', batteryLevel: 88, signalStrength: 75, firmware: 'v1.3.0', protocol: 'WiFi', groupId: 'g6', partnerId: null, notes: 'Praćenje nivoa buke za zaštitu na radu', minThreshold: 0, maxThreshold: 85, alertEnabled: true, samplingRate: 60, lastAlertAt: '2025-01-15T14:00:00Z', totalAlerts: 4, uptime: 97.8, createdAt: '2024-07-15T10:00:00Z', updatedAt: new Date().toISOString(), readings: generateReadings('s9', 70, 15, 24) },
  { id: 's10', name: 'Vibracioni senzor', type: 'vibration', location: 'Hala B', status: 'maintenance', lastReading: 0, unit: 'mm/s', batteryLevel: 60, signalStrength: 80, firmware: 'v2.2.0', protocol: 'LoRaWAN', groupId: 'g6', partnerId: null, notes: 'Na kalibraciji - povratak 2025-02-01', minThreshold: 0, maxThreshold: 50, alertEnabled: false, samplingRate: 300, lastAlertAt: null, totalAlerts: 1, uptime: 96.0, createdAt: '2024-11-01T10:00:00Z', updatedAt: new Date().toISOString(), readings: [] },
]

const DEMO_GROUPS: DeviceGroup[] = [
  { id: 'g1', name: 'Magacini', description: 'Senzori u magacinskim prostorijama', location: 'Magacin', icon: 'Warehouse', color: '#10b981', sensorCount: 2, createdAt: '2024-01-01T10:00:00Z' },
  { id: 'g2', name: 'Sigurnost', description: 'Senzori za bezbednost objekta', location: 'Ceo objekat', icon: 'Shield', color: '#ef4444', sensorCount: 2, createdAt: '2024-01-01T10:00:00Z' },
  { id: 'g3', name: 'Logistika', description: 'Senzori za logistiku i otpremu', location: 'Otprema', icon: 'Truck', color: '#f59e0b', sensorCount: 1, createdAt: '2024-01-01T10:00:00Z' },
  { id: 'g4', name: 'Vozila', description: 'GPS i senzori na vozilima', location: 'Van objekta', icon: 'Truck', color: '#3b82f6', sensorCount: 1, createdAt: '2024-01-01T10:00:00Z' },
  { id: 'g5', name: 'Infrastruktura', description: 'Merenje potrošnje i infrastrukture', location: 'Server soba', icon: 'Server', color: '#8b5cf6', sensorCount: 1, createdAt: '2024-01-01T10:00:00Z' },
  { id: 'g6', name: 'Proizvodnja', description: 'Senzori u proizvodnim halama', location: 'Hala A/B', icon: 'Factory', color: '#f97316', sensorCount: 3, createdAt: '2024-01-01T10:00:00Z' },
]

const DEMO_ALERT_RULES: AlertRule[] = [
  { id: 'ar1', name: 'Temperatura hladnjače', sensorType: 'temperature', sensorId: 's1', groupId: null, condition: 'outside_range', threshold: 2, thresholdMax: 8, duration: 300, severity: 'critical', enabled: true, notifyEmail: true, notifyPush: true, notifySms: false, cooldown: 600, lastTriggeredAt: '2025-01-05T03:00:00Z', triggerCount: 3, createdAt: '2024-06-15T10:00:00Z' },
  { id: 'ar2', name: 'Visoka vlaga', sensorType: 'humidity', sensorId: 's2', groupId: null, condition: 'above', threshold: 70, thresholdMax: null, duration: 600, severity: 'warning', enabled: true, notifyEmail: true, notifyPush: false, notifySms: false, cooldown: 1800, lastTriggeredAt: '2025-01-10T08:00:00Z', triggerCount: 7, createdAt: '2024-06-15T10:00:00Z' },
  { id: 'ar3', name: 'Niska baterija senzora', sensorType: 'temperature', sensorId: null, groupId: null, condition: 'battery_low', threshold: 20, thresholdMax: null, duration: 0, severity: 'warning', enabled: true, notifyEmail: true, notifyPush: true, notifySms: false, cooldown: 86400, lastTriggeredAt: null, triggerCount: 0, createdAt: '2024-06-15T10:00:00Z' },
  { id: 'ar4', name: 'Senzor offline', sensorType: 'temperature', sensorId: null, groupId: null, condition: 'offline', threshold: null, thresholdMax: null, duration: 300, severity: 'critical', enabled: true, notifyEmail: true, notifyPush: true, notifySms: true, cooldown: 3600, lastTriggeredAt: new Date().toISOString(), triggerCount: 5, createdAt: '2024-06-15T10:00:00Z' },
  { id: 'ar5', name: 'Preopterećenje struje', sensorType: 'energy', sensorId: 's6', groupId: null, condition: 'above', threshold: 400, thresholdMax: null, duration: 60, severity: 'critical', enabled: true, notifyEmail: true, notifyPush: true, notifySms: true, cooldown: 300, lastTriggeredAt: null, triggerCount: 0, createdAt: '2024-04-20T10:00:00Z' },
]

const DEMO_AUTOMATION_RULES: AutomationRule[] = [
  { id: 'au1', name: 'Alert na visoku temperaturu', description: 'Kada temperatura hladnjače pređe 8°C, šalji notifikaciju', triggerType: 'sensor_value', triggerSensorId: 's1', triggerCondition: 'above', triggerValue: 8, actionType: 'notify', actionConfig: '{"channel":"email","recipients":["admin@company.rs"]}', enabled: true, lastExecutedAt: '2025-01-05T03:00:00Z', executionCount: 3, createdAt: '2024-06-15T10:00:00Z' },
  { id: 'au2', name: 'Kreiraj ticket za offline senzor', description: 'Kada senzor bude offline >5 min, kreiraj podršku ticket', triggerType: 'sensor_offline', triggerSensorId: null, triggerCondition: 'duration_exceeds', triggerValue: 300, actionType: 'create_ticket', actionConfig: '{"category":"hardware","priority":"high"}', enabled: true, lastExecutedAt: new Date().toISOString(), executionCount: 2, createdAt: '2024-07-01T10:00:00Z' },
  { id: 'au3', name: 'Loguj CO₂ vrednosti', description: 'Loguj svaku CO₂ meru za izveštaj o kvalitetu vazduha', triggerType: 'sensor_value', triggerSensorId: 's7', triggerCondition: 'always', triggerValue: null, actionType: 'log', actionConfig: null, enabled: true, lastExecutedAt: new Date().toISOString(), executionCount: 156, createdAt: '2024-09-01T10:00:00Z' },
  { id: 'au4', name: 'Webhook na pokret', description: 'Šalji webhook na eksterni sistem kada je pokret detektovan', triggerType: 'sensor_value', triggerSensorId: 's3', triggerCondition: 'equals', triggerValue: 1, actionType: 'webhook', actionConfig: '{"url":"https://hooks.example.com/motion","method":"POST"}', enabled: false, lastExecutedAt: null, executionCount: 0, createdAt: '2024-10-01T10:00:00Z' },
]

const DEMO_ALERTS: IoTAlert[] = [
  { id: 'a1', sensorId: 's6', sensorName: 'Merač struje', sensorType: 'energy', type: 'offline', message: 'Senzor je offline već 2 sata', severity: 'critical', value: null, threshold: null, acknowledged: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'a2', sensorId: 's4', sensorName: 'Težinska rampa', sensorType: 'weight', type: 'battery_low', message: 'Baterija je na 45% - potrebna zamena', severity: 'warning', value: 45, threshold: 20, acknowledged: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'a3', sensorId: 's1', sensorName: 'Hladnjača A1', sensorType: 'temperature', type: 'threshold', message: 'Temperatura 5.8°C je blizu gornjeg praga (8°C)', severity: 'info', value: 5.8, threshold: 8, acknowledged: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'a4', sensorId: 's9', sensorName: 'Senzor buke', sensorType: 'noise', type: 'threshold', message: 'Nivo buke 82dB premaši limit za radno mesto', severity: 'warning', value: 82, threshold: 85, acknowledged: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'a5', sensorId: 's2', sensorName: 'Senzor vlage B2', sensorType: 'humidity', type: 'threshold', message: 'Vlažnost 72% premašuje gornji prag (70%)', severity: 'warning', value: 72, threshold: 70, acknowledged: true, createdAt: new Date(Date.now() - 259200000).toISOString() },
]

// ============ HELPERS ============

const getBatteryIcon = (level: number) => {
  if (level > 80) return <BatteryFull className="h-4 w-4 text-green-500" />
  if (level > 50) return <Battery className="h-4 w-4 text-green-500" />
  if (level > 20) return <BatteryWarning className="h-4 w-4 text-amber-500" />
  return <BatteryWarning className="h-4 w-4 text-red-500" />
}

const getBatteryColor = (level: number) => {
  if (level > 80) return 'bg-green-500'
  if (level > 50) return 'bg-green-400'
  if (level > 20) return 'bg-amber-500'
  return 'bg-red-500'
}

const getSignalBars = (strength: number) => {
  const bars = Math.ceil(strength / 25)
  return (
    <div className="flex items-end gap-0.5 h-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className={`w-1 rounded-sm ${i <= bars ? (strength > 60 ? 'bg-green-500' : strength > 30 ? 'bg-amber-500' : 'bg-red-500') : 'bg-gray-200 dark:bg-gray-700'}`} style={{ height: `${i * 25}%` }} />
      ))}
    </div>
  )
}

const formatUptime = (uptime: number) => `${uptime.toFixed(1)}%`

// ============ KPI COMPONENT ============

const KpiCard = ({ label, value, icon: Icon, sub, color, bg }: { label: string; value: string | number; icon: React.ElementType; sub?: string; color?: string; bg?: string }) => (
  <Card className="p-4">
    <div className="flex items-start justify-between mb-2">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <div className={`p-1.5 rounded-lg ${bg || 'bg-muted'}`}><Icon className={`h-4 w-4 ${color || 'text-muted-foreground'}`} /></div>
    </div>
    <p className="text-2xl font-bold">{value}</p>
    {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
  </Card>
)

// ============ MAIN COMPONENT ============


export function IoTContent() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()

  // Data state
  const [sensors, setSensors] = useState<IoTSensor[]>([])

  // View state
  const [activeTab, setActiveTab] = useState('overview')

  // Dialogs
  const [sensorDialogOpen, setSensorDialogOpen] = useState(false)

  // Forms
  const [sensorForm, setSensorForm] = useState({
    name: '', type: 'temperature', location: '', status: 'online',
    firmware: '', protocol: 'MQTT', groupId: '', notes: '',
    minThreshold: '', maxThreshold: '', alertEnabled: true, samplingRate: 60,
  })
  const [ruleForm, setRuleForm] = useState({
    name: '', sensorType: 'temperature', sensorId: '', condition: 'above',
    threshold: '', thresholdMax: '', duration: '300', severity: 'warning',
    notifyEmail: true, notifyPush: false, notifySms: false, cooldown: '600', enabled: true,
  })
  const [autoForm, setAutoForm] = useState({
    name: '', description: '', triggerType: 'sensor_value', triggerSensorId: '',
    triggerCondition: 'above', triggerValue: '', actionType: 'notify', actionConfig: '', enabled: true,
  })
  const [groupForm, setGroupForm] = useState({ name: '', description: '', location: '', color: '#10b981' })

  // Toast
  const [toastMsg, setToastMsg] = useState('')
  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000) }

  // ============ DATA LOADING ============

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/iot/sensors')
      if (res.ok) {
        const data = await res.json()
        setSensors(data)
      } else {
        setSensors(DEMO_SENSORS)
      }
    } catch {
      setSensors(DEMO_SENSORS)
    }
    try {
      const res = await fetch('/api/iot/alerts')
      if (res.ok) setAlerts(await res.json())
      else setAlerts(DEMO_ALERTS)
    } catch { setAlerts(DEMO_ALERTS) }
    setGroups(DEMO_GROUPS)
    setAlertRules(DEMO_ALERT_RULES)
    setAutomationRules(DEMO_AUTOMATION_RULES)
    setLoading(false)
  }, [activeCompanyId])

  useEffect(() => { loadData() }, [loadData])

  // ============ STATS ============

  const stats = useMemo(() => {
    const total = sensors.length
    const online = sensors.filter(s => s.status === 'online').length
    const offline = sensors.filter(s => s.status === 'offline').length
    const warning = sensors.filter(s => s.status === 'warning').length
    const maintenance = sensors.filter(s => s.status === 'maintenance').length
    const avgBattery = total > 0 ? Math.round(sensors.reduce((sum, s) => sum + s.batteryLevel, 0) / total) : 0
    const avgUptime = total > 0 ? (sensors.reduce((sum, s) => sum + s.uptime, 0) / total) : 0
    const lowBattery = sensors.filter(s => s.batteryLevel > 0 && s.batteryLevel <= 20).length
    const unackAlerts = alerts.filter(a => !a.acknowledged).length
    const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length

    const byType: Record<string, number> = {}
    sensors.forEach(s => { byType[s.type] = (byType[s.type] || 0) + 1 })

    const byLocation: Record<string, number> = {}
    sensors.forEach(s => { if (s.location) byLocation[s.location] = (byLocation[s.location] || 0) + 1 })

    const byGroup: Record<string, number> = {}
    sensors.forEach(s => { if (s.groupId) byGroup[s.groupId] = (byGroup[s.groupId] || 0) + 1 })

    return { total, online, offline, warning, maintenance, avgBattery, avgUptime, lowBattery, unackAlerts, criticalAlerts, byType, byLocation, byGroup }
  }, [sensors, alerts])

  // ============ FILTERED ============

  const filteredSensors = useMemo(() => {
    let result = [...sensors]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(s =>
        (s.name || '').toLowerCase().includes(q) ||
        (s.type || '').toLowerCase().includes(q) ||
        (s.location || '').toLowerCase().includes(q) ||
        (s.notes || '').toLowerCase().includes(q) ||
        (s.protocol || '').toLowerCase().includes(q) ||
        (s.firmware || '').toLowerCase().includes(q)
      )
    }
    if (filterType !== 'all') result = result.filter(s => s.type === filterType)
    if (filterStatus !== 'all') result = result.filter(s => s.status === filterStatus)
    if (filterGroup !== 'all') result = result.filter(s => s.groupId === filterGroup)
    return result
  }, [sensors, searchQuery, filterType, filterStatus, filterGroup])

  // ============ SENSOR ACTIONS ============

  const openNewSensor = () => {
    setEditingSensor(null)
    setSensorForm({ name: '', type: 'temperature', location: '', status: 'online', firmware: '', protocol: 'MQTT', groupId: '', notes: '', minThreshold: '', maxThreshold: '', alertEnabled: true, samplingRate: 60 })
    setSensorDialogOpen(true)
  }

  const openEditSensor = (sensor: IoTSensor) => {
    setEditingSensor(sensor)
    setSensorForm({
      name: sensor.name, type: sensor.type, location: sensor.location || '',
      status: sensor.status, firmware: sensor.firmware || '', protocol: sensor.protocol || 'MQTT',
      groupId: sensor.groupId || '', notes: sensor.notes || '',
      minThreshold: sensor.minThreshold?.toString() || '', maxThreshold: sensor.maxThreshold?.toString() || '',
      alertEnabled: sensor.alertEnabled, samplingRate: sensor.samplingRate || 60,
    })
    setSensorDialogOpen(true)
  }

  const handleSubmitSensor = async () => {
    if (!sensorForm.name.trim()) { showToast('Naziv je obavezan'); return }
    setSubmitting(true)
    try {
      const body = {
        ...sensorForm,
        minThreshold: sensorForm.minThreshold ? Number(sensorForm.minThreshold) : null,
        maxThreshold: sensorForm.maxThreshold ? Number(sensorForm.maxThreshold) : null,
        samplingRate: Number(sensorForm.samplingRate) || 60,
      }
      const url = editingSensor ? `/api/iot/sensors/${editingSensor.id}` : '/api/iot/sensors'
      const res = await fetch(url, {
        method: editingSensor ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setSensorDialogOpen(false)
        loadData()
        showToast(editingSensor ? 'Senzor ažuriran' : 'Senzor kreiran')
      }
    } catch { showToast('Greška') }
    setSubmitting(false)
  }

  const handleDeleteSensor = async () => {
    if (!selectedSensor) return
    try {
      await fetch(`/api/iot/sensors/${selectedSensor.id}`, { method: 'DELETE' })
      setDeleteConfirmOpen(false)
      setSelectedSensor(null)
      loadData()
      showToast('Senzor obrisan')
    } catch { showToast('Greška') }
  }

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a))
    showToast('Alert potvrđen')
  }

  const handleToggleRule = (ruleId: string) => {
    setAlertRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    showToast('Pravilo ažurirano')
  }

  const handleToggleAutomation = (ruleId: string) => {
    setAutomationRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    showToast('Automatizacija ažurirana')
  }

  // ============ RULE ACTIONS ============

  const openNewRule = () => {
    setEditingRule(null)
    setRuleForm({ name: '', sensorType: 'temperature', sensorId: '', condition: 'above', threshold: '', thresholdMax: '', duration: '300', severity: 'warning', notifyEmail: true, notifyPush: false, notifySms: false, cooldown: '600', enabled: true })
    setRuleDialogOpen(true)
  }

  const handleSaveRule = () => {
    if (!ruleForm.name.trim()) { showToast('Naziv je obavezan'); return }
    const newRule: AlertRule = {
      id: `ar-${Date.now()}`, name: ruleForm.name, sensorType: ruleForm.sensorType,
      sensorId: ruleForm.sensorId || null, groupId: null, condition: ruleForm.condition as AlertRule['condition'],
      threshold: ruleForm.threshold ? Number(ruleForm.threshold) : null,
      thresholdMax: ruleForm.thresholdMax ? Number(ruleForm.thresholdMax) : null,
      duration: Number(ruleForm.duration) || 300, severity: ruleForm.severity as AlertRule['severity'],
      enabled: ruleForm.enabled, notifyEmail: ruleForm.notifyEmail, notifyPush: ruleForm.notifyPush,
      notifySms: ruleForm.notifySms, cooldown: Number(ruleForm.cooldown) || 600,
      lastTriggeredAt: null, triggerCount: 0, createdAt: new Date().toISOString(),
    }
    setAlertRules(prev => editingRule ? prev.map(r => r.id === editingRule.id ? { ...r, ...newRule } : r) : [...prev, newRule])
    setRuleDialogOpen(false)
    showToast(editingRule ? 'Pravilo ažurirano' : 'Pravilo kreirano')
  }

  // ============ AUTOMATION ACTIONS ============

  const openNewAutomation = () => {
    setEditingAutomation(null)
    setAutoForm({ name: '', description: '', triggerType: 'sensor_value', triggerSensorId: '', triggerCondition: 'above', triggerValue: '', actionType: 'notify', actionConfig: '', enabled: true })
    setAutomationDialogOpen(true)
  }

  const handleSaveAutomation = () => {
    if (!autoForm.name.trim()) { showToast('Naziv je obavezan'); return }
    const newRule: AutomationRule = {
      id: `au-${Date.now()}`, name: autoForm.name, description: autoForm.description,
      triggerType: autoForm.triggerType as AutomationRule['triggerType'],
      triggerSensorId: autoForm.triggerSensorId || null, triggerCondition: autoForm.triggerCondition,
      triggerValue: autoForm.triggerValue ? Number(autoForm.triggerValue) : null,
      actionType: autoForm.actionType as AutomationRule['actionType'],
      actionConfig: autoForm.actionConfig || null, enabled: autoForm.enabled,
      lastExecutedAt: null, executionCount: 0, createdAt: new Date().toISOString(),
    }
    setAutomationRules(prev => editingAutomation ? prev.map(r => r.id === editingAutomation.id ? { ...r, ...newRule } : r) : [...prev, newRule])
    setAutomationDialogOpen(false)
    showToast(editingAutomation ? 'Automatizacija ažurirana' : 'Automatizacija kreirana')
  }

  // ============ GROUP ACTIONS ============

  const handleCreateGroup = () => {
    if (!groupForm.name.trim()) { showToast('Naziv je obavezan'); return }
    const newGroup: DeviceGroup = {
      id: `g-${Date.now()}`, name: groupForm.name, description: groupForm.description || null,
      location: groupForm.location || null, icon: 'Warehouse', color: groupForm.color,
      sensorCount: 0, createdAt: new Date().toISOString(),
    }
    setGroups(prev => [...prev, newGroup])
    setGroupDialogOpen(false)
    setGroupForm({ name: '', description: '', location: '', color: '#10b981' })
    showToast('Grupa kreirana')
  }

  // ============ RENDER ============

  const CONDITION_LABELS: Record<string, string> = {
    above: 'Iznad', below: 'Ispod', equals: 'Jednako', outside_range: 'Izvan opsega',
    inside_range: 'Unutar opsega', change: 'Promena', offline: 'Offline', battery_low: 'Niska baterija',
  }

  const TRIGGER_TYPE_LABELS: Record<string, string> = {
    sensor_value: 'Vrednost senzora', sensor_offline: 'Senzor offline', sensor_online: 'Senzor online',
    schedule: 'Raspored', battery_low: 'Niska baterija', alert_triggered: 'Alert pokrenut',
  }

  const ACTION_TYPE_LABELS: Record<string, string> = {
    notify: 'Notifikacija', webhook: 'Webhook', toggle_device: 'Uključi/isključi uredjaj',
    log: 'Logovanje', create_ticket: 'Kreiraj ticket', update_inventory: 'Ažuriraj inventar',
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-right">
          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
            <AlertDescription>{toastMsg}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <RadioTower className="h-6 w-6 text-primary" /> IoT
          </h1>
          <p className="text-sm text-muted-foreground">Internet of Things — senzori, uredjaji, automatizacija</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={openNewSensor}><Plus className="h-4 w-4 mr-1" /> Novi senzor</Button>
          <Button size="sm" variant="outline" onClick={openNewRule}><Bell className="h-4 w-4 mr-1" /> Pravilo</Button>
          <Button size="sm" variant="outline" onClick={() => setGroupDialogOpen(true)}><LayoutGrid className="h-4 w-4 mr-1" /> Grupa</Button>
          <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview"><BarChart3 className="h-3.5 w-3.5 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="sensors"><Wifi className="h-3.5 w-3.5 mr-1" /> Senzori</TabsTrigger>
          <TabsTrigger value="data"><Activity className="h-3.5 w-3.5 mr-1" /> Podaci</TabsTrigger>
          <TabsTrigger value="alerts-tab"><Bell className="h-3.5 w-3.5 mr-1" /> Upozorenja <Badge variant="destructive" className="ml-1 text-[9px] px-1.5 py-0">{stats.unackAlerts}</Badge></TabsTrigger>
          <TabsTrigger value="rules"><ShieldAlert className="h-3.5 w-3.5 mr-1" /> Pravila</TabsTrigger>
          <TabsTrigger value="automation"><Play className="h-3.5 w-3.5 mr-1" /> Automatizacija</TabsTrigger>
          <TabsTrigger value="groups"><LayoutGrid className="h-3.5 w-3.5 mr-1" /> Grupe</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="h-3.5 w-3.5 mr-1" /> Podešavanja</TabsTrigger>
        </TabsList>

        {/* ===== OVERVIEW ===== */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard label="Ukupno senzora" value={stats.total} icon={Wifi} sub={`${stats.online} online`} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-900/20" />
            <KpiCard label="Online" value={stats.online} icon={CheckCircle2} sub={`${stats.offline} offline`} color="text-green-500" bg="bg-green-50 dark:bg-green-900/20" />
            <KpiCard label="Prosečna baterija" value={`${stats.avgBattery}%`} icon={Battery} sub={`${stats.lowBattery} niskih`} color="text-amber-500" bg="bg-amber-50 dark:bg-amber-900/20" />
            <KpiCard label="Nepotvrđeni alerti" value={stats.unackAlerts} icon={AlertTriangle} sub={`${stats.criticalAlerts} kritičnih`} color="text-red-500" bg="bg-red-50 dark:bg-red-900/20" />
          </div>

          {/* Critical Alerts */}
          {stats.criticalAlerts > 0 && (
            <Alert className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-700 dark:text-red-400">
                {stats.criticalAlerts} kritičnih upozorenja zahteva pažnju!
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* By Type */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Po tipovima senzora</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.byType).sort(([, a], [, b]) => b - a).map(([type, count]) => {
                    const cfg = SENSOR_TYPE_CONFIG[type]
                    const max = Math.max(...Object.values(stats.byType), 1)
                    return (
                      <div key={type} className="flex items-center gap-3">
                        <span className="text-sm w-6">{cfg?.icon}</span>
                        <span className="text-xs w-24 truncate">{cfg?.label || type}</span>
                        <div className="flex-1 bg-muted rounded-full h-3">
                          <div className="bg-primary h-3 rounded-full transition-all" style={{ width: `${(count / max) * 100}%` }} />
                        </div>
                        <span className="text-xs font-mono w-6 text-right">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* By Location */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Po lokacijama</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.byLocation).sort(([, a], [, b]) => b - a).map(([loc, count]) => {
                    const max = Math.max(...Object.values(stats.byLocation), 1)
                    return (
                      <div key={loc} className="flex items-center gap-3">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs w-28 truncate">{loc}</span>
                        <div className="flex-1 bg-muted rounded-full h-3">
                          <div className="bg-primary h-3 rounded-full" style={{ width: `${(count / max) * 100}%` }} />
                        </div>
                        <span className="text-xs font-mono w-6 text-right">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* By Group */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Po grupama</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {groups.map(g => {
                    const count = stats.byGroup[g.id] || 0
                    if (count === 0) return null
                    const max = Math.max(...Object.values(stats.byGroup), 1)
                    return (
                      <div key={g.id} className="flex items-center gap-3">
                        <div className="h-6 w-6 rounded-full flex items-center justify-center" style={{ backgroundColor: `${g.color}20` }}>
                          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: g.color }} />
                        </div>
                        <span className="text-xs w-28 truncate">{g.name}</span>
                        <div className="flex-1 bg-muted rounded-full h-3">
                          <div className="h-3 rounded-full" style={{ width: `${(count / max) * 100}%`, backgroundColor: g.color }} />
                        </div>
                        <span className="text-xs font-mono w-6 text-right">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Status Overview */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Status senzora</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                    const count = sensors.filter(s => s.status === status).length
                    if (count === 0) return null
                    const pct = Math.round((count / Math.max(stats.total, 1)) * 100)
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <Badge variant="outline" className={`text-[10px] w-24 justify-center ${cfg.color}`}>{cfg.label}</Badge>
                        <div className="flex-1 bg-muted rounded-full h-3">
                          <div className="h-3 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-mono w-12 text-right">{count} ({pct}%)</span>
                      </div>
                    )
                  })}
                </div>
                <Separator className="my-3" />
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-muted-foreground">Prosečan uptime:</span> <span className="font-medium">{formatUptime(stats.avgUptime)}</span></div>
                  <div><span className="text-muted-foreground">Niska baterija:</span> <span className="font-medium text-amber-600">{stats.lowBattery}</span></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Supported Sensor Types */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Podržani tipovi senzora</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {Object.entries(SENSOR_TYPE_CONFIG).map(([key, cfg]) => (
                  <div key={key} className="p-3 border rounded-lg text-center hover:bg-muted/30 transition-colors">
                    <span className="text-2xl">{cfg.icon}</span>
                    <p className="text-xs font-medium mt-1">{cfg.label}</p>
                    {cfg.unit && <p className="text-[10px] text-muted-foreground">{cfg.unit}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== SENSORS ===== */}
        <TabsContent value="sensors" className="space-y-4">
          {/* Filters */}
          <Card className="p-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Pretraži senzore..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Tip" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi tipovi</SelectItem>
                  {Object.entries(SENSOR_TYPE_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi statusi</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterGroup} onValueChange={setFilterGroup}>
                <SelectTrigger className="w-[130px]"><SelectValue placeholder="Grupa" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Sve grupe</SelectItem>
                  {groups.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
              </Button>
            </div>
          </Card>

          <p className="text-sm text-muted-foreground">{filteredSensors.length} senzora</p>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
            </div>
          ) : filteredSensors.length === 0 ? (
            <Card className="p-8 text-center">
              <Wifi className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Nema senzora</p>
              <Button className="mt-3" onClick={openNewSensor}><Plus className="h-4 w-4 mr-1" /> Dodaj prvi senzor</Button>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSensors.map(sensor => {
                const typeCfg = SENSOR_TYPE_CONFIG[sensor.type]
                return (
                  <Card key={sensor.id} className="cursor-pointer hover:shadow-md transition-shadow group" onClick={() => { setSelectedSensor(sensor); setSensorDetailOpen(true) }}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{typeCfg?.icon}</span>
                          <div>
                            <CardTitle className="text-sm">{sensor.name}</CardTitle>
                            <p className="text-xs text-muted-foreground">{sensor.location || 'Nema lokacije'}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={`text-[10px] ${statCfg?.color}`}>{statCfg?.label}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Trenutna vrednost</span>
                        <span className="text-lg font-bold">
                          {sensor.lastReading !== null ? `${sensor.lastReading}${sensor.unit ? ` ${sensor.unit}` : ''}` : 'N/A'}
                        </span>
                      </div>

                      {sensor.minThreshold !== null && sensor.maxThreshold !== null && sensor.lastReading !== null && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>{sensor.minThreshold}{sensor.unit}</span>
                            <span>Dozvoljeni opseg</span>
                            <span>{sensor.maxThreshold}{sensor.unit}</span>
                          </div>
                          <div className="relative w-full bg-muted rounded-full h-2">
                            <div className="absolute inset-y-0 bg-green-200 dark:bg-green-900/30 rounded-full" style={{ left: '0%', width: '100%' }} />
                            <div className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-primary border-2 border-background shadow-sm" style={{
                              left: `${Math.min(100, Math.max(0, ((sensor.lastReading - sensor.minThreshold) / (sensor.maxThreshold - sensor.minThreshold)) * 100))}%`
                            }} />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="flex items-center gap-1">{getBatteryIcon(sensor.batteryLevel)} <span>{sensor.batteryLevel}%</span></div>
                        <div className="flex items-center gap-1">{getSignalBars(sensor.signalStrength)} <span>{sensor.signalStrength}%</span></div>
                        <div className="flex items-center gap-1"><Clock className="h-3 w-3 text-muted-foreground" /> <span>{formatUptime(sensor.uptime)}</span></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          <Badge variant="secondary" className="text-[9px]">{sensor.protocol}</Badge>
                          <Badge variant="secondary" className="text-[9px]">{sensor.firmware}</Badge>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openEditSensor(sensor) }}><Edit3 className="h-3.5 w-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); setSelectedSensor(sensor); setDeleteConfirmOpen(true) }}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>

                      {sensor.lastAlertAt && (
                        <div className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Poslednji alert: {formatDate(sensor.lastAlertAt)} ({sensor.totalAlerts} ukupno)
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <div className="max-h-[600px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-muted/50">
                    <tr className="text-left text-xs text-muted-foreground border-b">
                      <th className="p-3">Naziv</th>
                      <th className="p-3 hidden md:table-cell">Tip</th>
                      <th className="p-3 hidden lg:table-cell">Lokacija</th>
                      <th className="p-3 text-right">Vrednost</th>
                      <th className="p-3 hidden md:table-cell">Baterija</th>
                      <th className="p-3 hidden lg:table-cell">Signal</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 w-[80px]">Akcije</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSensors.map(sensor => {
                      const typeCfg = SENSOR_TYPE_CONFIG[sensor.type]
                      return (
                        <tr key={sensor.id} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer" onClick={() => { setSelectedSensor(sensor); setSensorDetailOpen(true) }}>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{typeCfg?.icon}</span>
                              <div>
                                <p className="text-xs font-medium">{sensor.name}</p>
                                <p className="text-[10px] text-muted-foreground">{sensor.protocol} · {sensor.firmware}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 hidden md:table-cell"><Badge variant="secondary" className="text-[10px]">{typeCfg?.label || sensor.type}</Badge></td>
                          <td className="p-3 hidden lg:table-cell text-xs">{sensor.location || '-'}</td>
                          <td className="p-3 text-right text-xs font-medium">{sensor.lastReading !== null ? `${sensor.lastReading} ${sensor.unit || ''}` : 'N/A'}</td>
                          <td className="p-3 hidden md:table-cell"><div className="flex items-center gap-1.5">{getBatteryIcon(sensor.batteryLevel)}<span className="text-xs">{sensor.batteryLevel}%</span></div></td>
                          <td className="p-3 hidden lg:table-cell"><div className="flex items-center gap-1.5">{getSignalBars(sensor.signalStrength)}<span className="text-xs">{sensor.signalStrength}%</span></div></td>
                          <td className="p-3"><Badge variant="outline" className={`text-[10px] ${statCfg?.color}`}>{statCfg?.label}</Badge></td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openEditSensor(sensor) }}><Edit3 className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); setSelectedSensor(sensor); setDeleteConfirmOpen(true) }}><Trash2 className="h-3.5 w-3.5" /></Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* ===== SENSOR DATA / TELEMETRY ===== */}
        <TabsContent value="data" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sensors.filter(s => s.readings && s.readings.length > 0).map(sensor => {
              const typeCfg = SENSOR_TYPE_CONFIG[sensor.type]
              const minVal = Math.min(...readings.map(r => r.value))
              const maxVal = Math.max(...readings.map(r => r.value))
              const avgVal = readings.reduce((s, r) => s + r.value, 0) / readings.length
              const chartMax = maxVal + (maxVal - minVal) * 0.2 || 1

              return (
                <Card key={sensor.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{typeCfg?.icon}</span>
                        <CardTitle className="text-sm">{sensor.name}</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{typeCfg?.label} ({sensor.unit})</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Mini chart */}
                    <div className="flex items-end gap-px h-20">
                      {readings.map((r, i) => {
                        const pct = Math.max(0, Math.min(100, (r.value / chartMax) * 100))
                        const isLast = i === readings.length - 1
                        return (
                          <div
                            key={r.id}
                            className={`flex-1 rounded-t-sm transition-all ${isLast ? 'bg-primary' : 'bg-primary/30 hover:bg-primary/50'}`}
                            style={{ height: `${pct}%` }}
                            title={`${r.value} ${sensor.unit || ''} — ${formatDate(r.timestamp)}`}
                          />
                        )
                      })}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>Min: {minVal.toFixed(1)}</span>
                      <span>Prosek: {avgVal.toFixed(1)}</span>
                      <span>Max: {maxVal.toFixed(1)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg"><p className="text-[10px] text-muted-foreground">Min</p><p className="text-sm font-bold">{minVal.toFixed(1)}</p></div>
                      <div className="text-center p-2 bg-green-50 dark:bg-green-900/10 rounded-lg"><p className="text-[10px] text-muted-foreground">Prosek</p><p className="text-sm font-bold">{avgVal.toFixed(1)}</p></div>
                      <div className="text-center p-2 bg-amber-50 dark:bg-amber-900/10 rounded-lg"><p className="text-[10px] text-muted-foreground">Max</p><p className="text-sm font-bold">{maxVal.toFixed(1)}</p></div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          {sensors.filter(s => s.readings && s.readings.length > 0).length === 0 && (
            <Card className="p-8 text-center">
              <Activity className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Nema dostupnih podataka</p>
            </Card>
          )}
        </TabsContent>

        {/* ===== ALERTS ===== */}
        <TabsContent value="alerts-tab" className="space-y-4">
          {alerts.filter(a => !a.acknowledged).length > 0 && (
            <Card className="border-amber-200 dark:border-amber-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="h-4 w-4" /> Aktivna upozorenja ({alerts.filter(a => !a.acknowledged).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {alerts.filter(a => !a.acknowledged).map(alert => {
                    const sevCfg = SEVERITY_CONFIG[alert.severity]
                    return (
                      <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg border ${alert.severity === 'critical' ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10' : 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/10'}`}>
                        <span className="text-lg mt-0.5">{typeCfg?.icon || '🔔'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{alert.sensorName}</span>
                            <Badge variant="outline" className={`text-[10px] ${sevCfg?.color}`}>{sevCfg?.label}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{alert.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{formatDate(alert.createdAt)}</p>
                        </div>
                        <Button size="sm" variant="outline" className="shrink-0 text-xs" onClick={() => handleAcknowledgeAlert(alert.id)}>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Potvrdi
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Sva upozorenja</CardTitle>
                <Badge variant="outline" className="text-[10px]">{alerts.length} ukupno</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[500px] overflow-y-auto space-y-2">
                {alerts.map(alert => {
                  const sevCfg = SEVERITY_CONFIG[alert.severity]
                  return (
                    <div key={alert.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className={`h-2 w-2 rounded-full shrink-0 ${alert.severity === 'critical' ? 'bg-red-500' : alert.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{alert.sensorName}</span>
                          <Badge variant="outline" className={`text-[9px] ${sevCfg?.color}`}>{sevCfg?.label}</Badge>
                          {alert.acknowledged && <Badge variant="secondary" className="text-[9px]"><CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Potvrđen</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{alert.message}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-muted-foreground">{formatDate(alert.createdAt)}</p>
                        {!alert.acknowledged && (
                          <Button size="sm" variant="ghost" className="text-[10px] h-6 px-2 mt-1" onClick={() => handleAcknowledgeAlert(alert.id)}>Potvrdi</Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== ALERT RULES ===== */}
        <TabsContent value="rules" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{alertRules.length} pravila upozorenja</p>
            <Button size="sm" onClick={openNewRule}><Plus className="h-4 w-4 mr-1" /> Novo pravilo</Button>
          </div>

          <div className="space-y-3">
            {alertRules.map(rule => {
              const sevCfg = SEVERITY_CONFIG[rule.severity]
              return (
                <Card key={rule.id} className={rule.enabled ? '' : 'opacity-60'}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium">{rule.name}</p>
                          <Badge variant="outline" className={`text-[10px] ${sevCfg?.color}`}>{sevCfg?.label}</Badge>
                          {rule.enabled ? <Badge variant="secondary" className="text-[9px]"><CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Aktivno</Badge> : <Badge variant="secondary" className="text-[9px]">Neaktivno</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {rule.condition === 'battery_low' ? 'Baterija <' : rule.condition === 'offline' ? 'Senzor offline >' : ''}
                          {rule.condition !== 'battery_low' && rule.condition !== 'offline' ? (
                            <>
                              {CONDITION_LABELS[rule.condition]} {rule.threshold !== null ? rule.threshold : ''}{rule.thresholdMax !== null ? ` - ${rule.thresholdMax}` : ''}
                              {rule.duration > 0 ? ` za ${rule.duration}s` : ''}
                            </>
                          ) : ` ${rule.threshold}%`}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {rule.notifyEmail && <Badge variant="secondary" className="text-[9px]">📧 Email</Badge>}
                          {rule.notifyPush && <Badge variant="secondary" className="text-[9px]">📱 Push</Badge>}
                          {rule.notifySms && <Badge variant="secondary" className="text-[9px]">💬 SMS</Badge>}
                        </div>
                        {rule.lastTriggeredAt && (
                          <p className="text-[10px] text-muted-foreground mt-1">Poslednje okidanje: {formatDate(rule.lastTriggeredAt)} · {rule.triggerCount} puta</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Switch checked={rule.enabled} onCheckedChange={() => handleToggleRule(rule.id)} />
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingRule(rule); setRuleForm({ name: rule.name, sensorType: rule.sensorType, sensorId: rule.sensorId || '', condition: rule.condition, threshold: rule.threshold?.toString() || '', thresholdMax: rule.thresholdMax?.toString() || '', duration: rule.duration.toString(), severity: rule.severity, notifyEmail: rule.notifyEmail, notifyPush: rule.notifyPush, notifySms: rule.notifySms, cooldown: rule.cooldown.toString(), enabled: rule.enabled }); setRuleDialogOpen(true) }}><Edit3 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* ===== AUTOMATION ===== */}
        <TabsContent value="automation" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{automationRules.length} automatizacija</p>
            <Button size="sm" onClick={openNewAutomation}><Plus className="h-4 w-4 mr-1" /> Nova automatizacija</Button>
          </div>

          <div className="space-y-3">
            {automationRules.map(rule => (
              <Card key={rule.id} className={rule.enabled ? '' : 'opacity-60'}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium">{rule.name}</p>
                        {rule.enabled ? <Badge variant="secondary" className="text-[9px] bg-green-100 text-green-700"><Play className="h-2.5 w-2.5 mr-0.5" /> Aktivna</Badge> : <Badge variant="secondary" className="text-[9px]"><Pause className="h-2.5 w-2.5 mr-0.5" /> Pauzirana</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{rule.description}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="text-[9px]">Trigger: {TRIGGER_TYPE_LABELS[rule.triggerType]}</Badge>
                        <Badge variant="outline" className="text-[9px]">Akcija: {ACTION_TYPE_LABELS[rule.actionType]}</Badge>
                      </div>
                      {rule.lastExecutedAt && (
                        <p className="text-[10px] text-muted-foreground mt-1">Poslednje izvršenje: {formatDate(rule.lastExecutedAt)} · {rule.executionCount} puta</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch checked={rule.enabled} onCheckedChange={() => handleToggleAutomation(rule.id)} />
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingAutomation(rule); setAutoForm({ name: rule.name, description: rule.description, triggerType: rule.triggerType, triggerSensorId: rule.triggerSensorId || '', triggerCondition: rule.triggerCondition, triggerValue: rule.triggerValue?.toString() || '', actionType: rule.actionType, actionConfig: rule.actionConfig || '', enabled: rule.enabled }); setAutomationDialogOpen(true) }}><Edit3 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ===== GROUPS ===== */}
        <TabsContent value="groups" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map(g => {
              const groupSensors = sensors.filter(s => s.groupId === g.id)
              const onlineCount = groupSensors.filter(s => s.status === 'online').length
              return (
                <Card key={g.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${g.color}20` }}>
                        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: g.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm">{g.name}</CardTitle>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{g.description || g.location || ''}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{groupSensors.length} senzora</span>
                      <Badge variant="secondary" className="text-[10px]"><CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />{onlineCount} online</Badge>
                    </div>
                    {groupSensors.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {groupSensors.slice(0, 3).map(s => {
                          const statCfg = STATUS_CONFIG[s.status]
                          return (
                            <div key={s.id} className="flex items-center gap-2 text-xs">
                              <div className={`h-1.5 w-1.5 rounded-full ${statCfg?.dotColor}`} />
                              <span className="truncate">{SENSOR_TYPE_CONFIG[s.type]?.icon} {s.name}</span>
                              <Badge variant="outline" className={`text-[9px] ml-auto ${statCfg?.color}`}>{statCfg?.label}</Badge>
                            </div>
                          )
                        })}
                        {groupSensors.length > 3 && <p className="text-[10px] text-muted-foreground pl-3.5">+{groupSensors.length - 3} više</p>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* ===== SETTINGS ===== */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">IoT podešavanja</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">MQTT Broker</Label>
                  <Input defaultValue="mqtt://broker.example.com:1883" disabled />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">API Ključ</Label>
                  <div className="flex gap-2">
                    <Input defaultValue="sk-iot-xxxxxxxxxxxx" type="password" disabled />
                    <Button variant="outline" size="sm"><Eye className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Integracije</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { name: 'MQTT Broker', desc: 'Standardni IoT protokol za komunikaciju', icon: Radio, connected: true },
                    { name: 'Webhook', desc: 'HTTP callback za eksterne sisteme', icon: Link2, connected: false },
                    { name: 'WebSocket', desc: 'Real-time podaci na klijentu', icon: Globe, connected: true },
                    { name: 'LoRaWAN Gateway', desc: 'Dalekometna IoT mreža', icon: RadioTower, connected: false },
                  ].map(int => (
                    <div key={int.name} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center"><int.icon className="h-4 w-4 text-muted-foreground" /></div>
                      <div className="flex-1">
                        <p className="text-xs font-medium">{int.name}</p>
                        <p className="text-[10px] text-muted-foreground">{int.desc}</p>
                      </div>
                      <Badge variant={int.connected ? 'default' : 'secondary'} className="text-[10px]">{int.connected ? 'Povezano' : 'Nije povezano'}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Konfiguracija</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Automatsko praćenje zaliha</p><p className="text-muted-foreground">Težinski senzori automatski ažuriraju stanje u magacinu</p></div></div>
                  <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Kontrola temperature</p><p className="text-muted-foreground">Alert kada temperatura izađe iz konfigurisanog opsega</p></div></div>
                  <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">GPS praćenje vozila</p><p className="text-muted-foreground">Praćenje dostavnih vozila u realnom vremenu</p></div></div>
                  <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Sigurnosni sistemi</p><p className="text-muted-foreground">Senzori pokreta, vrata, prozora sa automatskim alertovima</p></div></div>
                  <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Prediktivno održavanje</p><p className="text-muted-foreground">AI analiza vibracija i performansi za predviđanje kvarova</p></div></div>
                  <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Energetska efikasnost</p><p className="text-muted-foreground">Optimizacija potrošnje na osnovu senzorskih podataka</p></div></div>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Protokoli</h3>
                <div className="flex flex-wrap gap-2">
                  {PROTOCOLS.map(p => <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>)}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ===== DIALOGS ===== */}

      {/* New/Edit Sensor */}
      <Dialog open={sensorDialogOpen} onOpenChange={setSensorDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSensor ? 'Izmeni senzor' : 'Novi senzor'}</DialogTitle>
            <DialogDescription>{editingSensor ? 'Izmenite podatke o senzoru' : 'Dodajte novi IoT senzor'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label className="text-xs">Naziv senzora *</Label><Input value={sensorForm.name} onChange={(e) => setSensorForm({ ...sensorForm, name: e.target.value })} placeholder="npr. Hladnjača A1" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Tip senzora</Label>
                <Select value={sensorForm.type} onValueChange={(v) => setSensorForm({ ...sensorForm, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(SENSOR_TYPE_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Status</Label>
                <Select value={sensorForm.status} onValueChange={(v) => setSensorForm({ ...sensorForm, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-xs">Lokacija</Label><Input value={sensorForm.location} onChange={(e) => setSensorForm({ ...sensorForm, location: e.target.value })} placeholder="npr. Magacin 1" /></div>
              <div className="space-y-2"><Label className="text-xs">Protokol</Label>
                <Select value={sensorForm.protocol} onValueChange={(v) => setSensorForm({ ...sensorForm, protocol: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PROTOCOLS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-xs">Firmware verzija</Label><Input value={sensorForm.firmware} onChange={(e) => setSensorForm({ ...sensorForm, firmware: e.target.value })} placeholder="v1.0.0" /></div>
              <div className="space-y-2">
                <Label className="text-xs">Intervalska stopa</Label>
                <Select value={String(sensorForm.samplingRate)} onValueChange={(v) => setSensorForm({ ...sensorForm, samplingRate: Number(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SAMPLE_RATES.map(r => <SelectItem key={r.value} value={String(r.value)}>{r.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-xs">Min prag ({SENSOR_TYPE_CONFIG[sensorForm.type]?.unit || ''})</Label><Input type="number" value={sensorForm.minThreshold} onChange={(e) => setSensorForm({ ...sensorForm, minThreshold: e.target.value })} placeholder="Min" /></div>
              <div className="space-y-2"><Label className="text-xs">Max prag ({SENSOR_TYPE_CONFIG[sensorForm.type]?.unit || ''})</Label><Input type="number" value={sensorForm.maxThreshold} onChange={(e) => setSensorForm({ ...sensorForm, maxThreshold: e.target.value })} placeholder="Max" /></div>
            </div>
            <div className="space-y-2"><Label className="text-xs">Grupa</Label>
              <Select value={sensorForm.groupId} onValueChange={(v) => setSensorForm({ ...sensorForm, groupId: v })}>
                <SelectTrigger><SelectValue placeholder="Izaberite grupu" /></SelectTrigger>
                <SelectContent><SelectItem value="">Bez grupe</SelectItem>{groups.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2"><Switch checked={sensorForm.alertEnabled} onCheckedChange={(v) => setSensorForm({ ...sensorForm, alertEnabled: v })} /><Label className="text-xs">Omogući alerte za ovaj senzor</Label></div>
            <div className="space-y-2"><Label className="text-xs">Napomene</Label><Textarea value={sensorForm.notes} onChange={(e) => setSensorForm({ ...sensorForm, notes: e.target.value })} placeholder="Dodatne informacije..." rows={2} /></div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSensorDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleSubmitSensor} disabled={submitting || !sensorForm.name.trim()}>{submitting ? 'Čuvanje...' : 'Sačuvaj'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sensor Detail */}
      <Dialog open={sensorDetailOpen} onOpenChange={setSensorDetailOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedSensor && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="text-xl">{SENSOR_TYPE_CONFIG[selectedSensor.type]?.icon}</span>
                  {selectedSensor.name}
                </DialogTitle>
                <DialogDescription>{SENSOR_TYPE_CONFIG[selectedSensor.type]?.label} · {selectedSensor.location}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-xs text-muted-foreground">Status:</span><br /><Badge variant="outline" className={`text-xs ${STATUS_CONFIG[selectedSensor.status]?.color}`}>{STATUS_CONFIG[selectedSensor.status]?.label}</Badge></div>
                  <div><span className="text-xs text-muted-foreground">Protokol:</span><br /><Badge variant="secondary">{selectedSensor.protocol}</Badge></div>
                  <div><span className="text-xs text-muted-foreground">Firmware:</span><br /><span className="text-xs">{selectedSensor.firmware || '-'}</span></div>
                  <div><span className="text-xs text-muted-foreground">Intervalska stopa:</span><br /><span className="text-xs">{selectedSensor.samplingRate}s</span></div>
                </div>

                <Separator />

                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Trenutna vrednost</p>
                  <p className="text-3xl font-bold">
                    {selectedSensor.lastReading !== null ? selectedSensor.lastReading : 'N/A'}
                    {selectedSensor.unit && <span className="text-lg text-muted-foreground ml-1">{selectedSensor.unit}</span>}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-[10px] text-muted-foreground">Baterija</p>
                    <div className="flex items-center justify-center gap-1 mt-1">{getBatteryIcon(selectedSensor.batteryLevel)}<span className="text-sm font-bold">{selectedSensor.batteryLevel}%</span></div>
                    <Progress value={selectedSensor.batteryLevel} className="mt-1 h-1.5" />
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-[10px] text-muted-foreground">Signal</p>
                    <div className="flex items-center justify-center gap-1 mt-1">{getSignalBars(selectedSensor.signalStrength)}<span className="text-sm font-bold">{selectedSensor.signalStrength}%</span></div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-[10px] text-muted-foreground">Uptime</p>
                    <p className="text-sm font-bold mt-1">{formatUptime(selectedSensor.uptime)}</p>
                  </div>
                </div>

                {selectedSensor.minThreshold !== null && selectedSensor.maxThreshold !== null && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-xs font-medium">Pragovi za alerte</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Min: {selectedSensor.minThreshold}{selectedSensor.unit}</span>
                        <span>Max: {selectedSensor.maxThreshold}{selectedSensor.unit}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={selectedSensor.alertEnabled} disabled />
                        <Label className="text-xs">{selectedSensor.alertEnabled ? 'Alerti aktivni' : 'Alerti deaktivirani'}</Label>
                      </div>
                    </div>
                  </>
                )}

                {selectedSensor.notes && (
                  <><Separator /><div><p className="text-xs font-medium mb-1">Napomene</p><p className="text-xs text-muted-foreground bg-muted/30 rounded p-2">{selectedSensor.notes}</p></div></>
                )}

                {selectedSensor.readings && selectedSensor.readings.length > 0 && (
                  <>
                    <Separator />
                    <p className="text-xs font-medium">Poslednja merenja (24h)</p>
                    <div className="flex items-end gap-px h-16">
                      {selectedSensor.readings.map((r, i) => {
                        const vals = selectedSensor.readings!.map(x => x.value)
                        const cMax = Math.max(...vals) || 1
                        const pct = (r.value / cMax) * 100
                        return <div key={r.id} className={`flex-1 rounded-t-sm ${i === selectedSensor.readings!.length - 1 ? 'bg-primary' : 'bg-primary/30'}`} style={{ height: `${Math.max(5, pct)}%` }} />
                      })}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New/Edit Alert Rule */}
      <Dialog open={ruleDialogOpen} onOpenChange={setRuleDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Izmeni pravilo' : 'Novo pravilo upozorenja'}</DialogTitle>
            <DialogDescription>Definišite uslove za automatska upozorenja</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label className="text-xs">Naziv pravila *</Label><Input value={ruleForm.name} onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })} placeholder="npr. Visoka temperatura" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Tip senzora</Label>
                <Select value={ruleForm.sensorType} onValueChange={(v) => setRuleForm({ ...ruleForm, sensorType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(SENSOR_TYPE_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Uslov</Label>
                <Select value={ruleForm.condition} onValueChange={(v) => setRuleForm({ ...ruleForm, condition: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(CONDITION_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-xs">Prag (donji/tačan)</Label><Input type="number" value={ruleForm.threshold} onChange={(e) => setRuleForm({ ...ruleForm, threshold: e.target.value })} placeholder="Vrednost" /></div>
              <div className="space-y-2"><Label className="text-xs">Prag (gornji - za opseg)</Label><Input type="number" value={ruleForm.thresholdMax} onChange={(e) => setRuleForm({ ...ruleForm, thresholdMax: e.target.value })} placeholder="Max" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Trajanje (sekunde)</Label><Input type="number" value={ruleForm.duration} onChange={(e) => setRuleForm({ ...ruleForm, duration: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Ozbiljnost</Label>
                <Select value={ruleForm.severity} onValueChange={(v) => setRuleForm({ ...ruleForm, severity: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(SEVERITY_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label className="text-xs">Cooldown (sekunde)</Label><Input type="number" value={ruleForm.cooldown} onChange={(e) => setRuleForm({ ...ruleForm, cooldown: e.target.value })} /></div>
            <div className="space-y-2">
              <Label className="text-xs">Kanal obaveštenja</Label>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5"><Switch checked={ruleForm.notifyEmail} onCheckedChange={(v) => setRuleForm({ ...ruleForm, notifyEmail: v })} /><Label className="text-xs">📧 Email</Label></div>
                <div className="flex items-center gap-1.5"><Switch checked={ruleForm.notifyPush} onCheckedChange={(v) => setRuleForm({ ...ruleForm, notifyPush: v })} /><Label className="text-xs">📱 Push</Label></div>
                <div className="flex items-center gap-1.5"><Switch checked={ruleForm.notifySms} onCheckedChange={(v) => setRuleForm({ ...ruleForm, notifySms: v })} /><Label className="text-xs">💬 SMS</Label></div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRuleDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleSaveRule}>{editingRule ? 'Sačuvaj izmene' : 'Kreiraj pravilo'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New/Edit Automation */}
      <Dialog open={automationDialogOpen} onOpenChange={setAutomationDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAutomation ? 'Izmeni automatizaciju' : 'Nova automatizacija'}</DialogTitle>
            <DialogDescription>Definišite trigger i akciju za automatizaciju</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label className="text-xs">Naziv *</Label><Input value={autoForm.name} onChange={(e) => setAutoForm({ ...autoForm, name: e.target.value })} placeholder="npr. Alert na visoku temp" /></div>
            <div className="space-y-2"><Label className="text-xs">Opis</Label><Textarea value={autoForm.description} onChange={(e) => setAutoForm({ ...autoForm, description: e.target.value })} placeholder="Opis automatizacije..." rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Trigger tip</Label>
                <Select value={autoForm.triggerType} onValueChange={(v) => setAutoForm({ ...autoForm, triggerType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(TRIGGER_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Akcija</Label>
                <Select value={autoForm.actionType} onValueChange={(v) => setAutoForm({ ...autoForm, actionType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(ACTION_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Senzor</Label>
                <Select value={autoForm.triggerSensorId} onValueChange={(v) => setAutoForm({ ...autoForm, triggerSensorId: v })}>
                  <SelectTrigger><SelectValue placeholder="Svi senzori" /></SelectTrigger>
                  <SelectContent><SelectItem value="">Svi senzori</SelectItem>{sensors.map(s => <SelectItem key={s.id} value={s.id}>{SENSOR_TYPE_CONFIG[s.type]?.icon} {s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label className="text-xs">Trigger vrednost</Label><Input type="number" value={autoForm.triggerValue} onChange={(e) => setAutoForm({ ...autoForm, triggerValue: e.target.value })} placeholder="Opcionalno" /></div>
            </div>
            {autoForm.actionType === 'webhook' && (
              <div className="space-y-2"><Label className="text-xs">Webhook URL</Label><Input value={autoForm.actionConfig} onChange={(e) => setAutoForm({ ...autoForm, actionConfig: e.target.value })} placeholder="https://..." /></div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAutomationDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleSaveAutomation}>{editingAutomation ? 'Sačuvaj' : 'Kreiraj'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Group */}
      <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Nova grupa uređaja</DialogTitle><DialogDescription>Grupišite senzore po lokaciji ili funkciji</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label className="text-xs">Naziv grupe *</Label><Input value={groupForm.name} onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })} placeholder="npr. Magacini" /></div>
            <div className="space-y-2"><Label className="text-xs">Opis</Label><Input value={groupForm.description} onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })} placeholder="Opcionalno" /></div>
            <div className="space-y-2"><Label className="text-xs">Lokacija</Label><Input value={groupForm.location} onChange={(e) => setGroupForm({ ...groupForm, location: e.target.value })} placeholder="npr. Magacin 1" /></div>
            <div className="space-y-2"><Label className="text-xs">Boja</Label><Input type="color" value={groupForm.color} onChange={(e) => setGroupForm({ ...groupForm, color: e.target.value })} className="h-8 w-16" /></div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setGroupDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleCreateGroup} disabled={!groupForm.name.trim()}>Kreiraj grupu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Obriši senzor</DialogTitle>
            <DialogDescription>Da li ste sigurni da želite da obrišete senzor &quot;{selectedSensor?.name}&quot;? Ova akcija je nepovratna.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Otkaži</Button>
            <Button variant="destructive" onClick={handleDeleteSensor}>Obriši</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
