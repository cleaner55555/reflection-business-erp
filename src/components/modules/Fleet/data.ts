export const STATUS_BADGES: Record<string, string> = {
  aktivno: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  na_servisu: 'bg-amber-50 text-amber-700 border-amber-200',
  u_garazi: 'bg-blue-50 text-blue-700 border-blue-200',
  prodato: 'bg-slate-100 text-slate-500 border-slate-200',
}

export const STATUS_LABELS: Record<string, string> = {
  aktivno: 'Aktivno',
  na_servisu: 'Na servisu',
  u_garazi: 'U garaži',
  prodato: 'Prodato',
}

export const FUEL_TYPE_BADGES: Record<string, string> = {
  dizel: 'bg-slate-100 text-slate-700 border-slate-200',
  benzin: 'bg-amber-50 text-amber-700 border-amber-200',
  gas: 'bg-blue-50 text-blue-700 border-blue-200',
  hibrid: 'bg-green-50 text-green-700 border-green-200',
  elektricni: 'bg-purple-50 text-purple-700 border-purple-200',
}

export const FUEL_TYPE_LABELS: Record<string, string> = {
  dizel: 'Dizel',
  benzin: 'Benzin',
  gas: 'Gas',
  hibrid: 'Hibrid',
  elektricni: 'Električni',
}

export const SERVICE_TYPE_LABELS: Record<string, string> = {
  servis: 'Servis',
  promjena_ulja: 'Promena ulja',
  gume: 'Gume',
  tehnicki: 'Tehnički pregled',
  registracija: 'Registracija',
}

export const EXPENSE_TYPE_LABELS: Record<string, string> = {
  gorivo: 'Gorivo',
  putarina: 'Putarina',
  parking: 'Parking',
  servis: 'Servis',
  ostalo: 'Ostalo',
}

export const { t } = useTranslation();

export const { tc, translateTexts } = useContentTranslation();

export const res = await fetch('/api/vehicles');

export const data = await res.json();

export const texts: string[] = []

export const texts: string[] = []

export const res = await fetch(`/api/vehicles/${vehicleId}`);

export const data = await res.json();

export const handleExpand = (vehicleId: string) => {
    if (expandedId === vehicleId) {
      setExpandedId(null)
    } else {
      setExpandedId(vehicleId)
      const vehicle = vehicles.find(v => v.id === vehicleId)
      if (vehicle && !vehicle.services) {
        fetchVehicleDetails(vehicleId)
      }
    }
  }

export const handleDeleteVehicle = async (id: string) => {
    if (!confirm(t('vehicleFleet.confirmDeleteVehicle'))) return
    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success(t('vehicleFleet.vehicleDeleted'))
      if (expandedId === id) setExpandedId(null)
      fetchVehicles()
    } catch {
      toast.error(t('common.deleteError'))
    }
  }

export const handleDeleteService = async (serviceId: string, vehicleId: string) => {
    if (!confirm(t('vehicleFleet.confirmDeleteService'))) return
    try {
      const res = await fetch(`/api/vehicle-services/${serviceId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success(t('vehicleFleet.serviceDeleted'))
      fetchVehicleDetails(vehicleId)
    } catch {
      toast.error(t('common.deleteError'))
    }
  }

export const handleDeleteExpense = async (expenseId: string, vehicleId: string) => {
    if (!confirm(t('vehicleFleet.confirmDeleteExpense'))) return
    try {
      const res = await fetch(`/api/vehicle-expenses/${expenseId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success(t('vehicleFleet.expenseDeleted'))
      fetchVehicleDetails(vehicleId)
    } catch {
      toast.error(t('common.deleteError'))
    }
  }

export const handleVehicleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      registration: fd.get('registration') as string,
      make: fd.get('make') as string,
      model: fd.get('model') as string,
      year: Number(fd.get('year')),
      fuelType: fd.get('fuelType') as string || 'dizel',
      mileage: Number(fd.get('mileage')) || 0,
      status: fd.get('status') as string || 'aktivno',
      assignedTo: fd.get('assignedTo') as string || null,
      notes: fd.get('notes') as string || null,
    }
    try {
      const url = editingVehicle ? `/api/vehicles/${editingVehicle.id}` : '/api/vehicles'
      const res = await fetch(url, {
        method: editingVehicle ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error()
      toast.success(editingVehicle ? t('vehicleFleet.vehicleUpdated') : t('vehicleFleet.vehicleCreated'))
      setViewMode('list')
      setEditingVehicle(null)
      fetchVehicles()
    } catch {
      toast.error(t('common.saveError'))
    } finally {
      setSubmitting(false)
    }
  }

export const handleServiceSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!targetVehicleId) return
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      vehicleId: targetVehicleId,
      date: fd.get('date') as string || new Date().toISOString().split('T')[0],
      type: fd.get('type') as string || 'servis',
      description: fd.get('description') as string,
      cost: Number(fd.get('cost')) || 0,
      mileage: Number(fd.get('mileage')) || 0,
      nextDue: fd.get('nextDue') as string || null,
    }
    try {
      const res = await fetch('/api/vehicle-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error()
      toast.success(t('vehicleFleet.serviceAdded'))
      const vid = targetVehicleId
      setViewMode('list')
      setTargetVehicleId(null)
      fetchVehicleDetails(vid)
    } catch {
      toast.error(t('common.saveError'))
    } finally {
      setSubmitting(false)
    }
  }

export const handleExpenseSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!targetVehicleId) return
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      vehicleId: targetVehicleId,
      date: fd.get('date') as string || new Date().toISOString().split('T')[0],
      type: fd.get('type') as string || 'gorivo',
      amount: Number(fd.get('amount')) || 0,
      description: fd.get('description') as string,
      mileage: Number(fd.get('mileage')) || 0,
    }
    try {
      const res = await fetch('/api/vehicle-expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error()
      toast.success(t('vehicleFleet.expenseAdded'))
      const vid = targetVehicleId
      setViewMode('list')
      setTargetVehicleId(null)
      fetchVehicleDetails(vid)
    } catch {
      toast.error(t('common.saveError'))
    } finally {
      setSubmitting(false)
    }
  }

export const openEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setViewMode('vehicle-form')
  }

export const openNewVehicle = () => {
    setEditingVehicle(null)
    setViewMode('vehicle-form')
  }

export const openAddService = (vehicleId: string) => {
    setTargetVehicleId(vehicleId)
    setViewMode('service-form')
  }

export const openAddExpense = (vehicleId: string) => {
    setTargetVehicleId(vehicleId)
    setViewMode('expense-form')
  }

export const handleCancel = () => {
    setViewMode('list')
    setEditingVehicle(null)
    setTargetVehicleId(null)
  }

export const filteredVehicles = vehicles.filter(v => {
    if (activeTab === 'active') return v.status === 'aktivno'
    if (activeTab === 'service') return v.status === 'na_servisu'
    return true
  });

export const totalMileage = vehicles.reduce((s, v) => s + (v.mileage || 0), 0);

export const currentMonth = new Date().getMonth();

export const currentYear = new Date().getFullYear();

export const monthlyExpenses = vehicles.reduce((sum, v) => {
    if (!v.expenses) return sum
    return sum + v.expenses
      .filter(e => {
        const d = new Date(e.date)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
      })
      .reduce((s, e) => s + e.amount, 0)
  }, 0);

export const isExpanded = expandedId === vehicle.id;
