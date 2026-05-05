export const MOCK_CAMERAS: CameraDevice[] = [
  { id: 'cam1', name: 'Ulaz - glavna vrata', location: 'Glavni ulaz', type: 'indoor', status: 'recording', resolution: '1920x1080', ipAddress: '192.168.1.101', protocol: 'RTSP', port: 554, sensitivity: 75, nightVision: true, audioEnabled: true, scheduleStart: null, scheduleEnd: null, recordingMode: 'continuous', retentionDays: 30, storageUsed: 145, totalStorage: 256, lastMotionAt: new Date(Date.now() - 300000).toISOString(), lastRecordingAt: new Date().toISOString(), notes: 'HDTV kamera sa noćnim vidom', createdAt: '2024-01-10T10:00:00Z', updatedAt: new Date().toISOString() },
  { id: 'cam2', name: 'Parking - ulaz', location: 'Parking', type: 'outdoor', status: 'online', resolution: '2560x1440', ipAddress: '192.168.1.102', protocol: 'RTSP', port: 554, sensitivity: 60, nightVision: true, audioEnabled: false, scheduleStart: '06:00', scheduleEnd: '23:00', recordingMode: 'motion', retentionDays: 14, storageUsed: 89, totalStorage: 256, lastMotionAt: new Date(Date.now() - 1800000).toISOString(), lastRecordingAt: new Date(Date.now() - 1800000).toISOString(), notes: '2K kamera za prepoznavanje tablica', createdAt: '2024-01-15T10:00:00Z', updatedAt: new Date().toISOString() },
  { id: 'cam3', name: 'Magacin - zona A', location: 'Magacin 1', type: 'indoor', status: 'recording', resolution: '1920x1080', ipAddress: '192.168.1.103', protocol: 'RTSP', port: 554, sensitivity: 80, nightVision: false, audioEnabled: true, scheduleStart: null, scheduleEnd: null, recordingMode: 'continuous', retentionDays: 30, storageUsed: 210, totalStorage: 256, lastMotionAt: new Date(Date.now() - 60000).toISOString(), lastRecordingAt: new Date().toISOString(), notes: 'Pokrivenost cele zone A magacina', createdAt: '2024-02-01T10:00:00Z', updatedAt: new Date().toISOString() },
  { id: 'cam4', name: 'Hala proizvodnje', location: 'Proizvodnja', type: 'indoor', status: 'online', resolution: '3840x2160', ipAddress: '192.168.1.104', protocol: 'RTSP', port: 554, sensitivity: 50, nightVision: false, audioEnabled: false, scheduleStart: '07:00', scheduleEnd: '21:00', recordingMode: 'scheduled', retentionDays: 7, storageUsed: 34, totalStorage: 512, lastMotionAt: new Date(Date.now() - 3600000).toISOString(), lastRecordingAt: new Date(Date.now() - 3600000).toISOString(), notes: '4K panoramska kamera', createdAt: '2024-02-15T10:00:00Z', updatedAt: new Date().toISOString() },
  { id: 'cam5', name: 'Server soba', location: 'Server soba', type: 'indoor', status: 'online', resolution: '1280x720', ipAddress: '192.168.1.105', protocol: 'RTSP', port: 554, sensitivity: 90, nightVision: true, audioEnabled: false, scheduleStart: null, scheduleEnd: null, recordingMode: 'motion', retentionDays: 60, storageUsed: 12, totalStorage: 128, lastMotionAt: new Date(Date.now() - 86400000).toISOString(), lastRecordingAt: new Date(Date.now() - 86400000).toISOString(), notes: 'Visoka osetljivost na pokret', createdAt: '2024-03-01T10:00:00Z', updatedAt: new Date().toISOString() },
  { id: 'cam6', name: 'Perimetar - sever', location: 'Eksterijer', type: 'outdoor', status: 'offline', resolution: '1920x1080', ipAddress: '192.168.1.106', protocol: 'RTSP', port: 554, sensitivity: 70, nightVision: true, audioEnabled: true, scheduleStart: null, scheduleEnd: null, recordingMode: 'continuous', retentionDays: 30, storageUsed: 178, totalStorage: 256, lastMotionAt: new Date(Date.now() - 7200000).toISOString(), lastRecordingAt: new Date(Date.now() - 7200000).toISOString(), notes: 'Offline od 2 sata - proveriti kabl', createdAt: '2024-03-10T10:00:00Z', updatedAt: new Date().toISOString() },
  { id: 'cam7', name: 'Recepcija', location: 'Recepcija', type: 'indoor', status: 'recording', resolution: '1920x1080', ipAddress: '192.168.1.107', protocol: 'RTSP', port: 554, sensitivity: 65, nightVision: false, audioEnabled: true, scheduleStart: '08:00', scheduleEnd: '20:00', recordingMode: 'scheduled', retentionDays: 14, storageUsed: 67, totalStorage: 256, lastMotionAt: new Date(Date.now() - 120000).toISOString(), lastRecordingAt: new Date().toISOString(), notes: 'Prijem posetilaca', createdAt: '2024-04-01T10:00:00Z', updatedAt: new Date().toISOString() },
  { id: 'cam8', name: 'Rampa za utovar', location: 'Otprema', type: 'outdoor', status: 'online', resolution: '2560x1440', ipAddress: '192.168.1.108', protocol: 'RTSP', port: 554, sensitivity: 55, nightVision: true, audioEnabled: false, scheduleStart: '05:00', scheduleEnd: '22:00', recordingMode: 'motion', retentionDays: 21, storageUsed: 156, totalStorage: 256, lastMotionAt: new Date(Date.now() - 900000).toISOString(), lastRecordingAt: new Date(Date.now() - 900000).toISOString(), notes: '2K kamera sa IR diodama', createdAt: '2024-05-01T10:00:00Z', updatedAt: new Date().toISOString() },
]

export const MOCK_RECORDINGS: Recording[] = [
  { id: 'rec1', cameraId: 'cam1', cameraName: 'Ulaz - glavna vrata', startDate: new Date(Date.now() - 3600000).toISOString(), endDate: new Date().toISOString(), duration: 3600, type: 'continuous', fileSize: 2400, status: 'recording', resolution: '1920x1080', hasMotion: true, notes: null, thumbnailUrl: null },
  { id: 'rec2', cameraId: 'cam2', cameraName: 'Parking - ulaz', startDate: new Date(Date.now() - 7200000).toISOString(), endDate: new Date(Date.now() - 5400000).toISOString(), duration: 1800, type: 'motion', fileSize: 890, status: 'completed', resolution: '2560x1440', hasMotion: true, notes: 'Pokret detektovan - automobil', thumbnailUrl: null },
  { id: 'rec3', cameraId: 'cam3', cameraName: 'Magacin - zona A', startDate: new Date(Date.now() - 86400000).toISOString(), endDate: new Date(Date.now() - 72000000).toISOString(), duration: 14400, type: 'continuous', fileSize: 12500, status: 'completed', resolution: '1920x1080', hasMotion: true, notes: null, thumbnailUrl: null },
  { id: 'rec4', cameraId: 'cam6', cameraName: 'Perimetar - sever', startDate: new Date(Date.now() - 172800000).toISOString(), endDate: new Date(Date.now() - 165600000).toISOString(), duration: 7200, type: 'continuous', fileSize: 5600, status: 'completed', resolution: '1920x1080', hasMotion: false, notes: 'Prekidanje snimanja - kamera offline', thumbnailUrl: null },
  { id: 'rec5', cameraId: 'cam5', cameraName: 'Server soba', startDate: new Date(Date.now() - 259200000).toISOString(), endDate: new Date(Date.now() - 259100000).toISOString(), duration: 100, type: 'motion', fileSize: 45, status: 'archived', resolution: '1280x720', hasMotion: true, notes: 'Sumnjičav pokret u server sobi', thumbnailUrl: null },
  { id: 'rec6', cameraId: 'cam7', cameraName: 'Recepcija', startDate: new Date(Date.now() - 43200000).toISOString(), endDate: new Date(Date.now() - 36000000).toISOString(), duration: 7200, type: 'scheduled', fileSize: 4800, status: 'completed', resolution: '1920x1080', hasMotion: true, notes: null, thumbnailUrl: null },
  { id: 'rec7', cameraId: 'cam8', cameraName: 'Rampa za utovar', startDate: new Date(Date.now() - 1800000).toISOString(), endDate: new Date(Date.now() - 900000).toISOString(), duration: 900, type: 'manual', fileSize: 650, status: 'completed', resolution: '2560x1440', hasMotion: true, notes: 'Ručno pokrenuto snimanje utovara robe', thumbnailUrl: null },
  { id: 'rec8', cameraId: 'cam4', cameraName: 'Hala proizvodnje', startDate: new Date(Date.now() - 50400000).toISOString(), endDate: new Date(Date.now() - 43200000).toISOString(), duration: 7200, type: 'scheduled', fileSize: 15200, status: 'completed', resolution: '3840x2160', hasMotion: true, notes: null, thumbnailUrl: null },
]

export const MOCK_CAMERA_ALERTS: CameraAlert[] = [
  { id: 'ca1', cameraId: 'cam6', cameraName: 'Perimetar - sever', type: 'camera_offline', severity: 'critical', message: 'Kamera je offline već 2 sata - proveriti kabl i napajanje', acknowledged: false, createdAt: new Date(Date.now() - 7200000).toISOString(), thumbnailUrl: null },
  { id: 'ca2', cameraId: 'cam3', cameraName: 'Magacin - zona A', type: 'storage_full', severity: 'warning', message: 'Kamera Magacin - zona A koristi 82% prostora za skladištenje', acknowledged: false, createdAt: new Date(Date.now() - 3600000).toISOString(), thumbnailUrl: null },
  { id: 'ca3', cameraId: 'cam5', cameraName: 'Server soba', type: 'motion_detected', severity: 'info', message: 'Pokret detektovan u server sobi u 03:15', acknowledged: true, createdAt: new Date(Date.now() - 259200000).toISOString(), thumbnailUrl: null },
  { id: 'ca4', cameraId: 'cam2', cameraName: 'Parking - ulaz', type: 'motion_detected', severity: 'info', message: 'Pokret na parkingu - nepoznato vozilo', acknowledged: true, createdAt: new Date(Date.now() - 7200000).toISOString(), thumbnailUrl: null },
  { id: 'ca5', cameraId: 'cam6', cameraName: 'Perimetar - sever', type: 'connection_lost', severity: 'critical', message: 'Izgubljena veza sa kamerom Perimetar - sever', acknowledged: false, createdAt: new Date(Date.now() - 7200000).toISOString(), thumbnailUrl: null },
  { id: 'ca6', cameraId: 'cam1', cameraName: 'Ulaz - glavna vrata', type: 'motion_detected', severity: 'info', message: 'Pokret na ulazu nakon radnog vremena', acknowledged: true, createdAt: new Date(Date.now() - 86400000).toISOString(), thumbnailUrl: null },
]

export const STATUS_CONFIG: Record<string, { label: string; color: string; dotColor: string }> = {
  online: { label: 'Online', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', dotColor: 'bg-green-500' },
  offline: { label: 'Offline', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', dotColor: 'bg-red-500' },
  recording: { label: 'Snima', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', dotColor: 'bg-blue-500' },
}

export const CAMERA_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  indoor: { label: 'Interna', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' },
  outdoor: { label: 'Spoljašnja', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
  parking: { label: 'Parking', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
}

export const RECORDING_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  motion: { label: 'Pokret', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  manual: { label: 'Ručno', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  scheduled: { label: 'Planirano', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  continuous: { label: 'Kontinualno', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
}

export const RECORDING_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  recording: { label: 'Snimanje u toku', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  completed: { label: 'Završeno', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  archived: { label: 'Arhivirano', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  deleted: { label: 'Obrisano', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

export const ALERT_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  motion_detected: { label: 'Pokret detektovan', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  camera_offline: { label: 'Kamera offline', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  storage_full: { label: 'Popunjenost diska', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  connection_lost: { label: 'Gubitak veze', color: 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
}

export const SEVERITY_CONFIG: Record<string, { label: string; color: string }> = {
  info: { label: 'Informacija', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  warning: { label: 'Upozorenje', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  critical: { label: 'Kritično', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

export const formatFileSize = (mb: number) => {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`
  return `${mb.toFixed(0)} MB`
}

export const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}min`
  return `${m}min`
}

export const formatTime = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })
}

export const formatRelativeTime = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Upravo sada'
  if (mins < 60) return `Pre ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Pre ${hours} h`
  return `Pre ${Math.floor(hours / 24)} d`
}

export const KpiCard = ({ label, value, icon: Icon, sub, color, bg }: { label: string; value: string | number; icon: React.ElementType; sub?: string; color?: string; bg?: string }) => (
  <Card className="p-4">
    <div className="flex items-start justify-between mb-2">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <div className={`p-1.5 rounded-lg ${bg || 'bg-muted'}`}><Icon className={`h-4 w-4 ${color || 'text-muted-foreground'}`} /></div>
    </div>
    <p className="text-2xl font-bold">{value}</p>
    {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
  </Card>
);

export const { activeCompanyId } = useAppStore();

export const { t } = useTranslation();

export const res = await fetch('/api/kamere/cameras');

export const res = await fetch('/api/kamere/recordings');

export const stats = (() => {
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
  })();

export const filteredCameras = (() => {
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
  })();

export const filteredRecordings = (() => {
    let result = [...recordings].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    if (filterRecType !== 'all') result = result.filter(r => r.type === filterRecType)
    if (filterRecStatus !== 'all') result = result.filter(r => r.status === filterRecStatus)
    return result
  })();

export const openNewCamera = () => {
    setEditingCamera(null)
    setCameraForm({ name: '', location: '', type: 'indoor', resolution: '1920x1080', ipAddress: '', port: '554', protocol: 'RTSP', sensitivity: '70', nightVision: false, audioEnabled: false, scheduleStart: '', scheduleEnd: '', recordingMode: 'motion', retentionDays: '30', notes: '' })
    setCameraDialogOpen(true)
  }

export const openEditCamera = (camera: CameraDevice) => {
    setEditingCamera(camera)
    setCameraForm({
      name: camera.name, location: camera.location, type: camera.type,
      resolution: camera.resolution, ipAddress: camera.ipAddress || '', port: camera.port?.toString() || '554',
      protocol: camera.protocol, sensitivity: camera.sensitivity.toString(), nightVision: camera.nightVision,
      audioEnabled: camera.audioEnabled, scheduleStart: camera.scheduleStart || '',
      scheduleEnd: camera.scheduleEnd || '', recordingMode: camera.recordingMode,
      retentionDays: camera.retentionDays.toString(), notes: camera.notes || '',
    })
    setCameraDialogOpen(true)
  }

export const handleSaveCamera = () => {
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
    setCameraDialogOpen(false)
    toast.success(editingCamera ? 'Kamera ažurirana' : 'Kamera kreirana')
  }

export const handleDeleteCamera = () => {
    if (!selectedCamera) return
    setCameras(prev => prev.filter(c => c.id !== selectedCamera.id))
    setDeleteConfirmOpen(false)
    setSelectedCamera(null)
    toast.success('Kamera obrisana')
  }

export const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a))
    toast.success('Alert potvrđen')
  }

export const typeCfg = ALERT_TYPE_CONFIG[alert.type] || ALERT_TYPE_CONFIG.motion_detected;

export const sevCfg = SEVERITY_CONFIG[alert.severity]
