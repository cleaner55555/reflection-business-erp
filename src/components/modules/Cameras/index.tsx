 
'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
// Dialog removed - converted to inline Card
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { formatDate } from '@/lib/helpers'
import { toast } from 'sonner'
import {
  Camera, Plus, Search, Eye, Trash2, RefreshCw, CheckCircle2, Clock,
  AlertTriangle, BarChart3, CalendarDays, Users, Star, TrendingUp,
  FileText, Download, Filter, Video, VideoOff, HardDrive,
  Settings, Monitor, Circle, Aperture, Wifi, WifiOff, Volume2, VolumeX, ArrowLeft
} from 'lucide-react'

// ============ TYPES ============

interface CameraDevice {
  id: string
  name: string
  location: string
  type: 'indoor' | 'outdoor' | 'parking'
  status: 'online' | 'offline' | 'recording'
  resolution: string
  ipAddress: string | null
  protocol: string
  port: number | null
  sensitivity: number
  nightVision: boolean
  audioEnabled: boolean
  scheduleStart: string | null
  scheduleEnd: string | null
  recordingMode: 'continuous' | 'motion' | 'scheduled'
  retentionDays: number
  storageUsed: number
  totalStorage: number
  lastMotionAt: string | null
  lastRecordingAt: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

interface Recording {
  id: string
  cameraId: string
  cameraName: string
  startDate: string
  endDate: string
  duration: number
  type: 'motion' | 'manual' | 'scheduled' | 'continuous'
  fileSize: number
  status: 'recording' | 'completed' | 'archived' | 'deleted'
  resolution: string
  hasMotion: boolean
  notes: string | null
  thumbnailUrl: string | null
}

interface CameraAlert {
  id: string
  cameraId: string
  cameraName: string
  type: 'motion_detected' | 'camera_offline' | 'storage_full' | 'connection_lost'
  severity: 'info' | 'warning' | 'critical'
  message: string
  acknowledged: boolean
  createdAt: string
  thumbnailUrl: string | null
}

// ============ MOCK DATA ============

const MOCK_CAMERAS: CameraDevice[] = [
  { id: 'cam1', name: 'Ulaz - glavna vrata', location: 'Glavni ulaz', type: 'indoor', status: 'recording', resolution: '1920x1080', ipAddress: '192.168.1.101', protocol: 'RTSP', port: 554, sensitivity: 75, nightVision: true, audioEnabled: true, scheduleStart: null, scheduleEnd: null, recordingMode: 'continuous', retentionDays: 30, storageUsed: 145, totalStorage: 256, lastMotionAt: new Date(Date.now() - 300000).toISOString(), lastRecordingAt: new Date().toISOString(), notes: 'HDTV kamera sa noćnim vidom', createdAt: '2024-01-10T10:00:00Z', updatedAt: new Date().toISOString() },
  { id: 'cam2', name: 'Parking - ulaz', location: 'Parking', type: 'outdoor', status: 'online', resolution: '2560x1440', ipAddress: '192.168.1.102', protocol: 'RTSP', port: 554, sensitivity: 60, nightVision: true, audioEnabled: false, scheduleStart: '06:00', scheduleEnd: '23:00', recordingMode: 'motion', retentionDays: 14, storageUsed: 89, totalStorage: 256, lastMotionAt: new Date(Date.now() - 1800000).toISOString(), lastRecordingAt: new Date(Date.now() - 1800000).toISOString(), notes: '2K kamera za prepoznavanje tablica', createdAt: '2024-01-15T10:00:00Z', updatedAt: new Date().toISOString() },
  { id: 'cam3', name: 'Magacin - zona A', location: 'Magacin 1', type: 'indoor', status: 'recording', resolution: '1920x1080', ipAddress: '192.168.1.103', protocol: 'RTSP', port: 554, sensitivity: 80, nightVision: false, audioEnabled: true, scheduleStart: null, scheduleEnd: null, recordingMode: 'continuous', retentionDays: 30, storageUsed: 210, totalStorage: 256, lastMotionAt: new Date(Date.now() - 60000).toISOString(), lastRecordingAt: new Date().toISOString(), notes: 'Pokrivenost cele zone A magacina', createdAt: '2024-02-01T10:00:00Z', updatedAt: new Date().toISOString() },
  { id: 'cam4', name: 'Hala proizvodnje', location: 'Proizvodnja', type: 'indoor', status: 'online', resolution: '3840x2160', ipAddress: '192.168.1.104', protocol: 'RTSP', port: 554, sensitivity: 50, nightVision: false, audioEnabled: false, scheduleStart: '07:00', scheduleEnd: '21:00', recordingMode: 'scheduled', retentionDays: 7, storageUsed: 34, totalStorage: 512, lastMotionAt: new Date(Date.now() - 3600000).toISOString(), lastRecordingAt: new Date(Date.now() - 3600000).toISOString(), notes: '4K panoramska kamera', createdAt: '2024-02-15T10:00:00Z', updatedAt: new Date().toISOString() },
  { id: 'cam5', name: 'Server soba', location: 'Server soba', type: 'indoor', status: 'online', resolution: '1280x720', ipAddress: '192.168.1.105', protocol: 'RTSP', port: 554, sensitivity: 90, nightVision: true, audioEnabled: false, scheduleStart: null, scheduleEnd: null, recordingMode: 'motion', retentionDays: 60, storageUsed: 12, totalStorage: 128, lastMotionAt: new Date(Date.now() - 86400000).toISOString(), lastRecordingAt: new Date(Date.now() - 86400000).toISOString(), notes: 'Visoka osetljivost na pokret', createdAt: '2024-03-01T10:00:00Z', updatedAt: new Date().toISOString() },
  { id: 'cam6', name: 'Perimetar - sever', location: 'Eksterijer', type: 'outdoor', status: 'offline', resolution: '1920x1080', ipAddress: '192.168.1.106', protocol: 'RTSP', port: 554, sensitivity: 70, nightVision: true, audioEnabled: true, scheduleStart: null, scheduleEnd: null, recordingMode: 'continuous', retentionDays: 30, storageUsed: 178, totalStorage: 256, lastMotionAt: new Date(Date.now() - 7200000).toISOString(), lastRecordingAt: new Date(Date.now() - 7200000).toISOString(), notes: 'Offline od 2 sata - proveriti kabl', createdAt: '2024-03-10T10:00:00Z', updatedAt: new Date().toISOString() },
  { id: 'cam7', name: 'Recepcija', location: 'Recepcija', type: 'indoor', status: 'recording', resolution: '1920x1080', ipAddress: '192.168.1.107', protocol: 'RTSP', port: 554, sensitivity: 65, nightVision: false, audioEnabled: true, scheduleStart: '08:00', scheduleEnd: '20:00', recordingMode: 'scheduled', retentionDays: 14, storageUsed: 67, totalStorage: 256, lastMotionAt: new Date(Date.now() - 120000).toISOString(), lastRecordingAt: new Date().toISOString(), notes: 'Prijem posetilaca', createdAt: '2024-04-01T10:00:00Z', updatedAt: new Date().toISOString() },
  { id: 'cam8', name: 'Rampa za utovar', location: 'Otprema', type: 'outdoor', status: 'online', resolution: '2560x1440', ipAddress: '192.168.1.108', protocol: 'RTSP', port: 554, sensitivity: 55, nightVision: true, audioEnabled: false, scheduleStart: '05:00', scheduleEnd: '22:00', recordingMode: 'motion', retentionDays: 21, storageUsed: 156, totalStorage: 256, lastMotionAt: new Date(Date.now() - 900000).toISOString(), lastRecordingAt: new Date(Date.now() - 900000).toISOString(), notes: '2K kamera sa IR diodama', createdAt: '2024-05-01T10:00:00Z', updatedAt: new Date().toISOString() },
]

const MOCK_RECORDINGS: Recording[] = [
  { id: 'rec1', cameraId: 'cam1', cameraName: 'Ulaz - glavna vrata', startDate: new Date(Date.now() - 3600000).toISOString(), endDate: new Date().toISOString(), duration: 3600, type: 'continuous', fileSize: 2400, status: 'recording', resolution: '1920x1080', hasMotion: true, notes: null, thumbnailUrl: null },
  { id: 'rec2', cameraId: 'cam2', cameraName: 'Parking - ulaz', startDate: new Date(Date.now() - 7200000).toISOString(), endDate: new Date(Date.now() - 5400000).toISOString(), duration: 1800, type: 'motion', fileSize: 890, status: 'completed', resolution: '2560x1440', hasMotion: true, notes: 'Pokret detektovan - automobil', thumbnailUrl: null },
  { id: 'rec3', cameraId: 'cam3', cameraName: 'Magacin - zona A', startDate: new Date(Date.now() - 86400000).toISOString(), endDate: new Date(Date.now() - 72000000).toISOString(), duration: 14400, type: 'continuous', fileSize: 12500, status: 'completed', resolution: '1920x1080', hasMotion: true, notes: null, thumbnailUrl: null },
  { id: 'rec4', cameraId: 'cam6', cameraName: 'Perimetar - sever', startDate: new Date(Date.now() - 172800000).toISOString(), endDate: new Date(Date.now() - 165600000).toISOString(), duration: 7200, type: 'continuous', fileSize: 5600, status: 'completed', resolution: '1920x1080', hasMotion: false, notes: 'Prekidanje snimanja - kamera offline', thumbnailUrl: null },
  { id: 'rec5', cameraId: 'cam5', cameraName: 'Server soba', startDate: new Date(Date.now() - 259200000).toISOString(), endDate: new Date(Date.now() - 259100000).toISOString(), duration: 100, type: 'motion', fileSize: 45, status: 'archived', resolution: '1280x720', hasMotion: true, notes: 'Sumnjičav pokret u server sobi', thumbnailUrl: null },
  { id: 'rec6', cameraId: 'cam7', cameraName: 'Recepcija', startDate: new Date(Date.now() - 43200000).toISOString(), endDate: new Date(Date.now() - 36000000).toISOString(), duration: 7200, type: 'scheduled', fileSize: 4800, status: 'completed', resolution: '1920x1080', hasMotion: true, notes: null, thumbnailUrl: null },
  { id: 'rec7', cameraId: 'cam8', cameraName: 'Rampa za utovar', startDate: new Date(Date.now() - 1800000).toISOString(), endDate: new Date(Date.now() - 900000).toISOString(), duration: 900, type: 'manual', fileSize: 650, status: 'completed', resolution: '2560x1440', hasMotion: true, notes: 'Ručno pokrenuto snimanje utovara robe', thumbnailUrl: null },
  { id: 'rec8', cameraId: 'cam4', cameraName: 'Hala proizvodnje', startDate: new Date(Date.now() - 50400000).toISOString(), endDate: new Date(Date.now() - 43200000).toISOString(), duration: 7200, type: 'scheduled', fileSize: 15200, status: 'completed', resolution: '3840x2160', hasMotion: true, notes: null, thumbnailUrl: null },
]

const MOCK_CAMERA_ALERTS: CameraAlert[] = [
  { id: 'ca1', cameraId: 'cam6', cameraName: 'Perimetar - sever', type: 'camera_offline', severity: 'critical', message: 'Kamera je offline već 2 sata - proveriti kabl i napajanje', acknowledged: false, createdAt: new Date(Date.now() - 7200000).toISOString(), thumbnailUrl: null },
  { id: 'ca2', cameraId: 'cam3', cameraName: 'Magacin - zona A', type: 'storage_full', severity: 'warning', message: 'Kamera Magacin - zona A koristi 82% prostora za skladištenje', acknowledged: false, createdAt: new Date(Date.now() - 3600000).toISOString(), thumbnailUrl: null },
  { id: 'ca3', cameraId: 'cam5', cameraName: 'Server soba', type: 'motion_detected', severity: 'info', message: 'Pokret detektovan u server sobi u 03:15', acknowledged: true, createdAt: new Date(Date.now() - 259200000).toISOString(), thumbnailUrl: null },
  { id: 'ca4', cameraId: 'cam2', cameraName: 'Parking - ulaz', type: 'motion_detected', severity: 'info', message: 'Pokret na parkingu - nepoznato vozilo', acknowledged: true, createdAt: new Date(Date.now() - 7200000).toISOString(), thumbnailUrl: null },
  { id: 'ca5', cameraId: 'cam6', cameraName: 'Perimetar - sever', type: 'connection_lost', severity: 'critical', message: 'Izgubljena veza sa kamerom Perimetar - sever', acknowledged: false, createdAt: new Date(Date.now() - 7200000).toISOString(), thumbnailUrl: null },
  { id: 'ca6', cameraId: 'cam1', cameraName: 'Ulaz - glavna vrata', type: 'motion_detected', severity: 'info', message: 'Pokret na ulazu nakon radnog vremena', acknowledged: true, createdAt: new Date(Date.now() - 86400000).toISOString(), thumbnailUrl: null },
]

// ============ HELPERS ============

const STATUS_CONFIG: Record<string, { label: string; color: string; dotColor: string }> = {
  online: { label: 'Online', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', dotColor: 'bg-green-500' },
  offline: { label: 'Offline', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', dotColor: 'bg-red-500' },
  recording: { label: 'Snima', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', dotColor: 'bg-blue-500' },
}

const CAMERA_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  indoor: { label: 'Interna', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' },
  outdoor: { label: 'Spoljašnja', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
  parking: { label: 'Parking', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
}

const RECORDING_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  motion: { label: 'Pokret', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  manual: { label: 'Ručno', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  scheduled: { label: 'Planirano', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  continuous: { label: 'Kontinualno', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
}

const RECORDING_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  recording: { label: 'Snimanje u toku', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  completed: { label: 'Završeno', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  archived: { label: 'Arhivirano', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  deleted: { label: 'Obrisano', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

const ALERT_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  motion_detected: { label: 'Pokret detektovan', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  camera_offline: { label: 'Kamera offline', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  storage_full: { label: 'Popunjenost diska', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  connection_lost: { label: 'Gubitak veze', color: 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
}

const SEVERITY_CONFIG: Record<string, { label: string; color: string }> = {
  info: { label: 'Informacija', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  warning: { label: 'Upozorenje', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  critical: { label: 'Kritično', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

const formatFileSize = (mb: number) => {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`
  return `${mb.toFixed(0)} MB`
}

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}min`
  return `${m}min`
}

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })
}

const formatRelativeTime = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Upravo sada'
  if (mins < 60) return `Pre ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Pre ${hours} h`
  return `Pre ${Math.floor(hours / 24)} d`
}

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

export function Cameras() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()

  const [cameras, setCameras] = useState<CameraDevice[]>([])
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [alerts, setAlerts] = useState<CameraAlert[]>([])
  const [loading, setLoading] = useState(true)

  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterRecType, setFilterRecType] = useState('all')
  const [filterRecStatus, setFilterRecStatus] = useState('all')

  const [camerasSubTab, setCamerasSubTab] = useState<'pregled' | 'dodaj' | 'detalji'>('pregled')
  const [selectedCamera, setSelectedCamera] = useState<CameraDevice | null>(null)
  const [editingCamera, setEditingCamera] = useState<CameraDevice | null>(null)

  const [cameraForm, setCameraForm] = useState({
    name: '', location: '', type: 'indoor' as 'indoor' | 'outdoor' | 'parking',
    resolution: '1920x1080', ipAddress: '', port: '554', protocol: 'RTSP',
    sensitivity: '70', nightVision: false, audioEnabled: false,
    scheduleStart: '', scheduleEnd: '', recordingMode: 'motion' as 'continuous' | 'motion' | 'scheduled',
    retentionDays: '30', notes: '',
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/kamere/cameras')
      if (res.ok) { setCameras(await res.json()) } else { setCameras(MOCK_CAMERAS) }
    } catch { setCameras(MOCK_CAMERAS) }
    try {
      const res = await fetch('/api/kamere/recordings')
      if (res.ok) { setRecordings(await res.json()) } else { setRecordings(MOCK_RECORDINGS) }
    } catch { setRecordings(MOCK_RECORDINGS) }
    setAlerts(MOCK_CAMERA_ALERTS)
    setLoading(false)
  }, [activeCompanyId])

  useEffect(() => { loadData() }, [loadData])

  const stats = (() => {
    const total = cameras.length
    const online = cameras.filter(c => c.status === 'online' || c.status === 'recording').length
    const recording = cameras.filter(c => c.status === 'recording').length
    const offline = cameras.filter(c => c.status === 'offline').length
    const totalStorage = cameras.reduce((s, c) => s + c.storageUsed, 0)
    const maxStorage = cameras.reduce((s, c) => s + c.totalStorage, 0)
    const storagePercent = maxStorage > 0 ? Math.round((totalStorage / maxStorage) * 100) : 0
    const recordingsToday = recordings.filter(r => new Date(r.startDate).toDateString() === new Date().toDateString()).length
    const unackAlerts = alerts.filter(a => !a.acknowledged).length
    const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length
    const locations = [...new Set(cameras.map(c => c.location))]
    return { total, online, recording, offline, totalStorage, maxStorage, storagePercent, recordingsToday, unackAlerts, criticalAlerts, locations }
  })()

  const filteredCameras = (() => {
    let result = [...cameras]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.ipAddress?.toLowerCase().includes(q) ||
        c.notes?.toLowerCase().includes(q)
      )
    }
    if (filterType !== 'all') result = result.filter(c => c.type === filterType)
    if (filterStatus !== 'all') result = result.filter(c => c.status === filterStatus)
    return result
  })()

  const filteredRecordings = (() => {
    let result = [...recordings].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    if (filterRecType !== 'all') result = result.filter(r => r.type === filterRecType)
    if (filterRecStatus !== 'all') result = result.filter(r => r.status === filterRecStatus)
    return result
  })()

  const openNewCamera = () => {
    setEditingCamera(null)
    setCameraForm({ name: '', location: '', type: 'indoor', resolution: '1920x1080', ipAddress: '', port: '554', protocol: 'RTSP', sensitivity: '70', nightVision: false, audioEnabled: false, scheduleStart: '', scheduleEnd: '', recordingMode: 'motion', retentionDays: '30', notes: '' })
    setActiveTab('cameras'); setCamerasSubTab('dodaj')
  }

  const openEditCamera = (camera: CameraDevice) => {
    setEditingCamera(camera)
    setCameraForm({
      name: camera.name, location: camera.location, type: camera.type,
      resolution: camera.resolution, ipAddress: camera.ipAddress || '', port: camera.port?.toString() || '554',
      protocol: camera.protocol, sensitivity: camera.sensitivity.toString(), nightVision: camera.nightVision,
      audioEnabled: camera.audioEnabled, scheduleStart: camera.scheduleStart || '',
      scheduleEnd: camera.scheduleEnd || '', recordingMode: camera.recordingMode,
      retentionDays: camera.retentionDays.toString(), notes: camera.notes || '',
    })
    setActiveTab('cameras'); setCamerasSubTab('dodaj')
  }

  const handleSaveCamera = () => {
    if (!cameraForm.name.trim()) { toast.error('Naziv je obavezan'); return }
    const newCamera: CameraDevice = {
      id: editingCamera?.id || `cam-${Date.now()}`,
      name: cameraForm.name, location: cameraForm.location, type: cameraForm.type,
      status: editingCamera?.status || 'offline', resolution: cameraForm.resolution,
      ipAddress: cameraForm.ipAddress || null, protocol: cameraForm.protocol,
      port: Number(cameraForm.port) || 554, sensitivity: Number(cameraForm.sensitivity) || 70,
      nightVision: cameraForm.nightVision, audioEnabled: cameraForm.audioEnabled,
      scheduleStart: cameraForm.scheduleStart || null, scheduleEnd: cameraForm.scheduleEnd || null,
      recordingMode: cameraForm.recordingMode, retentionDays: Number(cameraForm.retentionDays) || 30,
      storageUsed: editingCamera?.storageUsed || 0, totalStorage: 256,
      lastMotionAt: null, lastRecordingAt: null, notes: cameraForm.notes || null,
      createdAt: editingCamera?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
    setCameras(prev => editingCamera ? prev.map(c => c.id === editingCamera.id ? newCamera : c) : [...prev, newCamera])
    setCamerasSubTab('pregled'); setEditingCamera(null)
    toast.success(editingCamera ? 'Kamera ažurirana' : 'Kamera kreirana')
  }

  const handleDeleteCamera = () => {
    if (!selectedCamera) return
    setCameras(prev => prev.filter(c => c.id !== selectedCamera.id))
    
    setSelectedCamera(null)
    toast.success('Kamera obrisana')
  }

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a))
    toast.success('Alert potvrđen')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Camera className="h-6 w-6 text-primary" /> Video nadzor
          </h1>
          <p className="text-sm text-muted-foreground">Kamere, snimci, postavke i praćenje aktivnosti</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={openNewCamera}><Plus className="h-4 w-4 mr-1" /> Nova kamera</Button>
          <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview"><BarChart3 className="h-3.5 w-3.5 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="cameras"><Video className="h-3.5 w-3.5 mr-1" /> Kamere</TabsTrigger>
          <TabsTrigger value="recordings"><FileText className="h-3.5 w-3.5 mr-1" /> Snimci</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="h-3.5 w-3.5 mr-1" /> Postavke</TabsTrigger>
        </TabsList>

        {/* ===== PREGLED ===== */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard label="Kamere online" value={stats.online} icon={Video} sub={`${stats.recording} trenutno snima`} color="text-green-500" bg="bg-green-50 dark:bg-green-900/20" />
            <KpiCard label="Snimci danas" value={stats.recordingsToday} icon={FileText} sub={`${recordings.length} ukupno`} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-900/20" />
            <KpiCard label="Zauzeće skladišta" value={`${stats.storagePercent}%`} icon={HardDrive} sub={`${formatFileSize(stats.totalStorage)} od ${formatFileSize(stats.maxStorage)}`} color="text-amber-500" bg="bg-amber-50 dark:bg-amber-900/20" />
            <KpiCard label="Alerti" value={stats.unackAlerts} icon={AlertTriangle} sub={`${stats.criticalAlerts} kritičnih`} color="text-red-500" bg="bg-red-50 dark:bg-red-900/20" />
          </div>

          {stats.criticalAlerts > 0 && (
            <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="font-semibold text-red-700 dark:text-red-400">{stats.criticalAlerts} kritičnih upozorenja</span>
              </div>
              <div className="space-y-1">
                {alerts.filter(a => a.severity === 'critical' && !a.acknowledged).map(alert => (
                  <div key={alert.id} className="flex items-center justify-between text-sm text-red-700 dark:text-red-300">
                    <span>{alert.message}</span>
                    <Button size="sm" variant="outline" className="h-6 text-xs ml-2" onClick={() => handleAcknowledgeAlert(alert.id)}>Potvrdi</Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Camera Grid Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cameras.slice(0, 4).map(cam => (
              <Card key={cam.id} className="overflow-hidden">
                <div className="relative h-32 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  <Video className="h-8 w-8 text-white/30" />
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${STATUS_CONFIG[cam.status].dotColor} ${cam.status === 'recording' ? 'animate-pulse' : ''}`} />
                    <span className="text-xs text-white/80">{STATUS_CONFIG[cam.status].label}</span>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <span className="text-xs text-white/60">{cam.resolution}</span>
                  </div>
                  {cam.status === 'recording' && (
                    <div className="absolute top-2 right-2">
                      <Circle className="h-3 w-3 text-red-500 animate-pulse fill-red-500" />
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <p className="text-sm font-medium truncate">{cam.name}</p>
                  <p className="text-xs text-muted-foreground">{cam.location}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      {cam.nightVision && <Badge variant="outline" className="text-xs px-1 py-0">IR</Badge>}
                      {cam.audioEnabled && <Volume2 className="h-3 w-3 text-muted-foreground" />}
                    </div>
                    <Progress value={(cam.storageUsed / cam.totalStorage) * 100} className="w-12 h-1.5" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Recordings */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4" /> Poslednji snimci</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recordings.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).slice(0, 5).map(rec => (
                  <div key={rec.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded ${RECORDING_STATUS_CONFIG[rec.status].color}`}>
                        {rec.status === 'recording' ? <Video className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{rec.cameraName}</p>
                        <p className="text-xs text-muted-foreground">{formatRelativeTime(rec.startDate)} · {formatDuration(rec.duration)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs px-1.5 py-0 ${RECORDING_TYPE_CONFIG[rec.type].color}`}>{RECORDING_TYPE_CONFIG[rec.type].label}</Badge>
                      <span className="text-xs text-muted-foreground">{formatFileSize(rec.fileSize)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== KAMERE ===== */}
        <TabsContent value="cameras" className="space-y-4"> className="space-y-4">
          <Tabs value={camerasSubTab} onValueChange={v => setCamerasSubTab(v as 'pregled' | 'dodaj' | 'detalji')}>
            <TabsList>
              <TabsTrigger value="pregled">Pregled</TabsTrigger>
              {(editingCamera || camerasSubTab === 'dodaj') && <TabsTrigger value="dodaj">{editingCamera ? 'Uredi' : 'Dodaj'}</TabsTrigger>}
              {(selectedCamera || camerasSubTab === 'detalji') && <TabsTrigger value="detalji">Detalji</TabsTrigger>}
            </TabsList>
            <TabsContent value="pregled" className="mt-4">

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pretraži kamere..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Tip" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi tipovi</SelectItem>
                <SelectItem value="indoor">Interna</SelectItem>
                <SelectItem value="outdoor">Spoljašnja</SelectItem>
                <SelectItem value="parking">Parking</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi statusi</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="recording">Snima</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCameras.map(cam => (
              <Card key={cam.id} className="overflow-hidden">
                <div className="relative h-36 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  {cam.status === 'offline' ? (
                    <VideoOff className="h-8 w-8 text-white/20" />
                  ) : (
                    <Video className="h-8 w-8 text-white/30" />
                  )}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${STATUS_CONFIG[cam.status].dotColor} ${cam.status === 'recording' ? 'animate-pulse' : ''}`} />
                    <Badge className={`${STATUS_CONFIG[cam.status].color} text-xs px-1.5 py-0`}>{STATUS_CONFIG[cam.status].label}</Badge>
                  </div>
                  {cam.status === 'recording' && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded">
                      <Circle className="h-2 w-2 fill-white animate-pulse" /> REC
                    </div>
                  )}
                </div>
                <CardContent className="p-3 space-y-2">
                  <div>
                    <p className="text-sm font-medium">{cam.name}</p>
                    <p className="text-xs text-muted-foreground">{cam.location}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Rezolucija</span>
                      <span>{cam.resolution}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">IP</span>
                      <span className="font-mono text-xs">{cam.ipAddress}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Skladište</span>
                    <div className="flex items-center gap-1">
                      <Progress value={(cam.storageUsed / cam.totalStorage) * 100} className="w-16 h-1.5" />
                      <span>{Math.round((cam.storageUsed / cam.totalStorage) * 100)}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 pt-1">
                    <Badge className={`text-xs px-1.5 py-0 ${CAMERA_TYPE_CONFIG[cam.type].color}`}>{CAMERA_TYPE_CONFIG[cam.type].label}</Badge>
                    {cam.nightVision && <Badge variant="outline" className="text-xs px-1.5 py-0">IR</Badge>}
                    {cam.audioEnabled && <Badge variant="outline" className="text-xs px-1.5 py-0 flex items-center gap-0.5"><Volume2 className="h-2.5 w-2.5" /> Audio</Badge>}
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t">
                    <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={() => { setSelectedCamera(cam); setActiveTab('cameras'); setCamerasSubTab('detalji') }}>
                      <Eye className="h-3 w-3 mr-1" /> Pregled
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openEditCamera(cam)}>
                      Postavke
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-700" onClick={() => { if (!confirm('Obrisati kameru?')) return; setCameras(prev => prev.filter(c2 => c2.id !== cam.id)); toast.success('Kamera obrisana') }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        
            </TabsContent>
          </Tabs>
        </TabsContent></TabsContent>

        {/* ===== SNIMCI ===== */}
        <TabsContent value="recordings" className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">Evidencija snimaka ({filteredRecordings.length})</span>
            <div className="flex items-center gap-1 ml-auto">
              <Select value={filterRecType} onValueChange={setFilterRecType}>
                <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi tipovi</SelectItem>
                  <SelectItem value="motion">Pokret</SelectItem>
                  <SelectItem value="manual">Ručno</SelectItem>
                  <SelectItem value="scheduled">Planirano</SelectItem>
                  <SelectItem value="continuous">Kontinualno</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterRecStatus} onValueChange={setFilterRecStatus}>
                <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi statusi</SelectItem>
                  <SelectItem value="recording">Snimanje</SelectItem>
                  <SelectItem value="completed">Završeno</SelectItem>
                  <SelectItem value="archived">Arhivirano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredRecordings.map(rec => (
                  <div key={rec.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${RECORDING_STATUS_CONFIG[rec.status].color}`}>
                        {rec.status === 'recording' ? <Video className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{rec.cameraName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(rec.startDate)} · {formatTime(rec.startDate)} - {formatTime(rec.endDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden md:block">
                        <p className="text-xs">{formatDuration(rec.duration)}</p>
                        <p className="text-xs text-muted-foreground">{rec.resolution}</p>
                      </div>
                      <Badge className={`text-xs px-1.5 py-0 ${RECORDING_TYPE_CONFIG[rec.type].color}`}>
                        {RECORDING_TYPE_CONFIG[rec.type].label}
                      </Badge>
                      <span className="text-xs text-muted-foreground hidden sm:block">{formatFileSize(rec.fileSize)}</span>
                      <Badge className={`text-xs px-1.5 py-0 ${RECORDING_STATUS_CONFIG[rec.status].color}`}>
                        {RECORDING_STATUS_CONFIG[rec.status].label}
                      </Badge>
                      {rec.status === 'completed' && (
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Preuzmi snimak">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== POSTAVKE ===== */}
        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Storage Overview */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><HardDrive className="h-4 w-4" /> Pregled skladišta</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Ukupno zauzeće</span>
                    <span className="font-semibold">{formatFileSize(stats.totalStorage)} / {formatFileSize(stats.maxStorage)}</span>
                  </div>
                  <Progress value={stats.storagePercent} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1">{stats.storagePercent}% iskorišćenog kapaciteta</p>
                </div>
                <div className="space-y-2 pt-2 border-t">
                  <span className="text-xs text-muted-foreground font-medium">Po kamerama</span>
                  {cameras.map(cam => (
                    <div key={cam.id} className="flex items-center justify-between text-xs">
                      <span className="truncate max-w-[150px]">{cam.name}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(cam.storageUsed / cam.totalStorage) * 100} className="w-16 h-1.5" />
                        <span className="text-muted-foreground w-20 text-right">{formatFileSize(cam.storageUsed)} / {formatFileSize(cam.totalStorage)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Settings */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Settings className="h-4 w-4" /> Globalne postavke</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs">Standardna rezolucija</Label>
                  <Select defaultValue="1920x1080">
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1280x720">720p (1280x720)</SelectItem>
                      <SelectItem value="1920x1080">1080p (1920x1080)</SelectItem>
                      <SelectItem value="2560x1440">1440p (2560x1440)</SelectItem>
                      <SelectItem value="3840x2160">4K (3840x2160)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Podrazumevano zadržavanje snimaka</Label>
                  <Select defaultValue="30">
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 dana</SelectItem>
                      <SelectItem value="14">14 dana</SelectItem>
                      <SelectItem value="30">30 dana</SelectItem>
                      <SelectItem value="60">60 dana</SelectItem>
                      <SelectItem value="90">90 dana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Podrazumevano osetljivost na pokret (%)</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={70} className="flex-1 h-2" />
                    <span className="text-sm font-mono w-8 text-right">70%</span>
                  </div>
                </div>
                <div className="pt-2 border-t space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Noćni vid (globalno)</span>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">Uključen</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Auto-brisanje starih snimaka</span>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">Uključen</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Kompresija video zapisa</span>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">H.265</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alerts Panel */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Upozorenja ({stats.unackAlerts} nepotvrđenih)</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(alert => {
                    const typeCfg = ALERT_TYPE_CONFIG[alert.type] || ALERT_TYPE_CONFIG.motion_detected
                    const sevCfg = SEVERITY_CONFIG[alert.severity]
                    return (
                      <div key={alert.id} className={`flex items-start justify-between p-3 rounded-lg border ${!alert.acknowledged ? 'border-l-4 bg-muted/30' : 'opacity-50'}`} style={{ borderLeftColor: alert.severity === 'critical' ? '#ef4444' : alert.severity === 'warning' ? '#f59e0b' : '#3b82f6' }}>
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 p-1.5 rounded ${sevCfg.color}`}>
                            <AlertTriangle className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{alert.cameraName}</span>
                              <Badge className={`text-xs px-1.5 py-0 ${typeCfg.color}`}>{typeCfg.label}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{formatRelativeTime(alert.createdAt)}</p>
                          </div>
                        </div>
                        {!alert.acknowledged && (
                          <Button size="sm" variant="outline" className="h-6 text-xs flex-shrink-0" onClick={() => handleAcknowledgeAlert(alert.id)}>OK</Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Camera Form (New/Edit) */}
      

      {/* Camera Detail */}
      

      {/* Delete Confirmation */}
      
    </div>
  )
}
