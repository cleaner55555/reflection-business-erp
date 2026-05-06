import { useState, useEffect, useCallback, useMemo } from 'react'

export function useGeolocation() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()

  const [employees, setEmployees] = useState<TrackedEmployee[]>([])
  const [geofences, setGeofences] = useState<Geofence[]>([])
  const [events, setEvents] = useState<LocationEvent[]>([])
  const [alerts, setAlerts] = useState<LocationAlert[]>([])
  const [loading, setLoading] = useState(true)

  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDept, setFilterDept] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterEventType, setFilterEventType] = useState('all')

  const [geofenceDialogOpen, setGeofenceDialogOpen] = useState(false)
  const [employeeDetailOpen, setEmployeeDetailOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<TrackedEmployee | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [selectedGeofence, setSelectedGeofence] = useState<Geofence | null>(null)

  const [geofenceForm, setGeofenceForm] = useState({
    name: '', type: 'circle' as 'circle' | 'polygon', latitude: '', longitude: '',
    radius: '', color: '#3b82f6', status: 'active' as 'active' | 'inactive',
    notifyEnter: true, notifyExit: true, scheduleStart: '', scheduleEnd: '', notes: '',
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/geolokacija/employees')
      if (res.ok) {
        setEmployees(await res.json())
      } else {
        setEmployees(MOCK_EMPLOYEES)
      }
    } catch {
      setEmployees(MOCK_EMPLOYEES)
    }
    try {
      const res = await fetch('/api/geolokacija/geofences')
      if (res.ok) {
        setGeofences(await res.json())
      } else {
        setGeofences(MOCK_GEOFENCES)
      }
    } catch {
      setGeofences(MOCK_GEOFENCES)
    }
    try {
      const res = await fetch('/api/geolokacija/events')
      if (res.ok) {
        setEvents(await res.json())
      } else {
        setEvents(MOCK_EVENTS)
      }
    } catch {
      setEvents(MOCK_EVENTS)
    }
    setAlerts(MOCK_ALERTS)
    setLoading(false)
  }, [activeCompanyId])

  useEffect(() => { loadData() }, [loadData])

  const stats = (() => {
    const tracked = employees.filter(e => e.isTracked).length
    const online = employees.filter(e => e.isOnline && e.isTracked).length
    const activeGeofences = geofences.filter(g => g.status === 'active').length
    const alertsToday = alerts.filter(a => new Date(a.createdAt).toDateString() === new Date().toDateString()).length
    const unackAlerts = alerts.filter(a => !a.acknowledged).length
    const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length
    const totalDistance = employees.reduce((sum, e) => sum + e.distanceToday, 0)
    const lowBattery = employees.filter(e => e.isTracked && e.batteryLevel > 0 && e.batteryLevel <= 20).length
    const departments = [...new Set(employees.map(e => e.department))]
    return { tracked, online, activeGeofences, alertsToday, unackAlerts, criticalAlerts, totalDistance, lowBattery, departments }
  })()

  const filteredEmployees = (() => {
    let result = [...employees]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.position.toLowerCase().includes(q) ||
        (e.lastLocationName || '').toLowerCase().includes(q)
      )
    }
    if (filterDept !== 'all') result = result.filter(e => e.department === filterDept)
    if (filterStatus === 'tracked') result = result.filter(e => e.isTracked)
    if (filterStatus === 'untracked') result = result.filter(e => !e.isTracked)
    if (filterStatus === 'online') result = result.filter(e => e.isOnline && e.isTracked)
    if (filterStatus === 'offline') result = result.filter(e => !e.isOnline || !e.isTracked)
    return result
  })()

  const filteredEvents = (() => {
    let result = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    if (filterEventType !== 'all') result = result.filter(e => e.eventType === filterEventType)
    return result
  })()

  const openGeofenceDialog = (geofence?: Geofence) => {
    if (geofence) {
      setSelectedGeofence(geofence)
      setGeofenceForm({
        name: geofence.name, type: geofence.type, latitude: geofence.latitude.toString(),
        longitude: geofence.longitude.toString(), radius: geofence.radius?.toString() || '',
        color: geofence.color, status: geofence.status, notifyEnter: geofence.notifyEnter,
        notifyExit: geofence.notifyExit, scheduleStart: geofence.scheduleStart || '',
        scheduleEnd: geofence.scheduleEnd || '', notes: geofence.notes || '',
      })
    } else {
      setSelectedGeofence(null)
      setGeofenceForm({ name: '', type: 'circle', latitude: '', longitude: '', radius: '', color: '#3b82f6', status: 'active', notifyEnter: true, notifyExit: true, scheduleStart: '', scheduleEnd: '', notes: '' })
    }
    setGeofenceDialogOpen(true)
  }

  const handleSaveGeofence = () => {
    if (!geofenceForm.name.trim()) { toast.error('Naziv je obavezan'); return }
    if (!geofenceForm.latitude.trim()) { toast.error('Koordinate su obavezne'); return }
    const newGeofence: Geofence = {
      id: selectedGeofence?.id || `gf-${Date.now()}`,
      name: geofenceForm.name, type: geofenceForm.type,
      latitude: Number(geofenceForm.latitude), longitude: Number(geofenceForm.longitude),
      radius: geofenceForm.radius ? Number(geofenceForm.radius) : null,
      color: geofenceForm.color, status: geofenceForm.status,
      assignedEmployees: selectedGeofence?.assignedEmployees || [],
      notifyEnter: geofenceForm.notifyEnter, notifyExit: geofenceForm.notifyExit,
      scheduleStart: geofenceForm.scheduleStart || null, scheduleEnd: geofenceForm.scheduleEnd || null,
      notes: geofenceForm.notes || null, createdAt: selectedGeofence?.createdAt || new Date().toISOString(),
    }
    setGeofences(prev => selectedGeofence ? prev.map(g => g.id === selectedGeofence.id ? newGeofence : g) : [...prev, newGeofence])
    setGeofenceDialogOpen(false)
    toast.success(selectedGeofence ? 'Geo-ograničenje ažurirano' : 'Geo-ograničenje kreirano')
  }

  const handleDeleteGeofence = () => {
    if (!selectedGeofence) return
    setGeofences(prev => prev.filter(g => g.id !== selectedGeofence.id))
    setDeleteConfirmOpen(false)
    setSelectedGeofence(null)
    toast.success('Geo-ograničenje obrisano')
  }

  const handleToggleTracking = (employeeId: string) => {
    setEmployees(prev => prev.map(e => e.id === employeeId ? { ...e, isTracked: !e.isTracked } : e))
    toast.success('Status praćenja ažuriran')
  }

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a))
    toast.success('Alert potvrđen')
  }

  return {
    activeTab,
    alerts,
    d,
    deleteConfirmOpen,
    employeeDetailOpen,
    employees,
    filterDept,
    filterEventType,
    filterStatus,
    filteredEmployees,
    filteredEvents,
    geofenceDialogOpen,
    geofences,
    handleDeleteGeofence,
    handleSaveGeofence,
    loadData,
    searchQuery,
    selectedEmployee,
    selectedGeofence,
    setActiveTab,
    setDeleteConfirmOpen,
    setEmployeeDetailOpen,
    setFilterDept,
    setFilterEventType,
    setFilterStatus,
    setGeofenceDialogOpen,
  }
}
