import { useState, useEffect, useCallback, useMemo } from 'react'

export function useCameras() {
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

  const [cameraDialogOpen, setCameraDialogOpen] = useState(false)
  const [cameraDetailOpen, setCameraDetailOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
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
    setCameraDialogOpen(true)
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
    setCameraDialogOpen(true)
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
    setCameraDialogOpen(false)
    toast.success(editingCamera ? 'Kamera ažurirana' : 'Kamera kreirana')
  }

  const handleDeleteCamera = () => {
    if (!selectedCamera) return
    setCameras(prev => prev.filter(c => c.id !== selectedCamera.id))
    setDeleteConfirmOpen(false)
    setSelectedCamera(null)
    toast.success('Kamera obrisana')
  }

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a))
    toast.success('Alert potvrđen')
  }

  return {
    activeTab,
    alerts,
    cameraDetailOpen,
    cameraDialogOpen,
    cameras,
    deleteConfirmOpen,
    editingCamera,
    filterRecStatus,
    filterRecType,
    filterStatus,
    filterType,
    filteredCameras,
    filteredRecordings,
    handleDeleteCamera,
    handleSaveCamera,
    loadData,
    openNewCamera,
    recordings,
    searchQuery,
    selectedCamera,
    setActiveTab,
    setCameraDetailOpen,
    setCameraDialogOpen,
    setDeleteConfirmOpen,
    setFilterRecStatus,
    setFilterRecType,
    setFilterStatus,
    setFilterType,
  }
}
