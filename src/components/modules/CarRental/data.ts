export const VEHICLE_STATUS_BADGES: Record<string, string> = {
  dostupno: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  iznajmljeno: 'bg-amber-50 text-amber-700 border-amber-200',
  na_servisu: 'bg-red-50 text-red-700 border-red-200',
  rezervisano: 'bg-blue-50 text-blue-700 border-blue-200',
  prodato: 'bg-slate-100 text-slate-500 border-slate-200',
}

export const VEHICLE_STATUS_LABELS: Record<string, string> = {
  dostupno: 'Dostupno',
  iznajmljeno: 'Iznajmljeno',
  na_servisu: 'Na servisu',
  rezervisano: 'Rezervisano',
  prodato: 'Prodato',
}

export const RENTAL_STATUS_BADGES: Record<string, string> = {
  rezervacija: 'bg-blue-50 text-blue-700 border-blue-200',
  aktivna: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  zavrsena: 'bg-slate-100 text-slate-600 border-slate-200',
  otkazana: 'bg-red-50 text-red-700 border-red-200',
}

export const RENTAL_STATUS_LABELS: Record<string, string> = {
  rezervacija: 'Rezervacija',
  aktivna: 'Aktivna',
  zavrsena: 'Završena',
  otkazana: 'Otkazana',
}

export const FUEL_TYPE_LABELS: Record<string, string> = {
  dizel: 'Dizel',
  benzin: 'Benzin',
  gas: 'Gas',
  hibrid: 'Hibrid',
  elektricni: 'Električni',
}

export const FUEL_TYPE_BADGES: Record<string, string> = {
  dizel: 'bg-slate-100 text-slate-700 border-slate-200',
  benzin: 'bg-amber-50 text-amber-700 border-amber-200',
  gas: 'bg-blue-50 text-blue-700 border-blue-200',
  hibrid: 'bg-green-50 text-green-700 border-green-200',
  elektricni: 'bg-purple-50 text-purple-700 border-purple-200',
}

export const TRANSMISSION_LABELS: Record<string, string> = {
  automatski: 'Automatski',
  manualni: 'Manuelni',
}

export const { t } = useTranslation();

export const { tc, translateTexts } = useContentTranslation();

export const res = await fetch('/api/rental-vehicles');

export const data = await res.json();

export const res = await fetch('/api/rentals');

export const data = await res.json();

export const texts: string[] = []

export const totalVehicles = vehicles.length;

export const activeRentals = rentals.filter(r => r.status === 'aktivna').length;

export const currentMonth = new Date().getMonth();

export const currentYear = new Date().getFullYear();

export const monthlyRevenue = rentals;

export const d = new Date(r.startDate);

export const filteredVehicles = vehicles.filter(v => {
    if (vehicleStatusFilter === 'all') return true
    return v.status === vehicleStatusFilter
  });

export const filteredRentals = rentals.filter(r => {
    if (rentalStatusFilter === 'all') return true
    return r.status === rentalStatusFilter
  });

export const calcTotalDays = (start: string, end: string): number => {
    if (!start || !end) return 0
    const s = new Date(start)
    const e = new Date(end)
    const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }

export const rentalFormTotalDays = calcTotalDays(rentalFormStartDate, rentalFormEndDate);

export const rentalFormTotalAmount = rentalFormTotalDays * rentalFormDailyRate;

export const handleVehicleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      name: fd.get('name') as string,
      make: fd.get('make') as string,
      model: fd.get('model') as string,
      year: Number(fd.get('year')),
      registration: fd.get('registration') as string,
      fuelType: (fd.get('fuelType') as string) || 'dizel',
      transmission: (fd.get('transmission') as string) || 'automatski',
      seats: Number(fd.get('seats')) || 5,
      dailyRate: Number(fd.get('dailyRate')),
      weeklyRate: fd.get('weeklyRate') ? Number(fd.get('weeklyRate')) : null,
      monthlyRate: fd.get('monthlyRate') ? Number(fd.get('monthlyRate')) : null,
      mileage: Number(fd.get('mileage')) || 0,
      status: (fd.get('status') as string) || 'dostupno',
      ac: fd.get('ac') === 'on',
      gps: fd.get('gps') === 'on',
      notes: (fd.get('notes') as string) || null,
    }
    try {
      const url = editingVehicle ? `/api/rental-vehicles/${editingVehicle.id}` : '/api/rental-vehicles'
      const res = await fetch(url, {
        method: editingVehicle ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Greška')
      }
      toast.success(editingVehicle ? t('rentACar.vehicleUpdated') : t('rentACar.vehicleCreated'))
      setViewMode('list')
      setEditingVehicle(null)
      fetchVehicles()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('common.saveError')
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

export const handleDeleteVehicle = async (id: string) => {
    if (!confirm(t('rentACar.confirmDeleteVehicle'))) return
    try {
      const res = await fetch(`/api/rental-vehicles/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Greška')
      }
      toast.success(t('rentACar.vehicleDeleted'))
      fetchVehicles()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('common.deleteError')
      toast.error(message)
    }
  }

export const openEditVehicle = (vehicle: RentalVehicleFull) => {
    setEditingVehicle(vehicle)
    setViewMode('vehicle-form')
  }

export const openNewVehicle = () => {
    setEditingVehicle(null)
    setViewMode('vehicle-form')
  }

export const openNewRental = () => {
    setEditingRental(null)
    setRentalFormVehicle('')
    setRentalFormDailyRate(0)
    setRentalFormStartDate('')
    setRentalFormEndDate('')
    setViewMode('rental-form')
  }

export const handleVehicleSelectForRental = (vehicleId: string) => {
    setRentalFormVehicle(vehicleId)
    const v = vehicles.find(v => v.id === vehicleId)
    if (v) {
      setRentalFormDailyRate(v.dailyRate)
    }
  }

export const handleRentalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!rentalFormStartDate || !rentalFormEndDate || !rentalFormVehicle) {
      toast.error(t('rentACar.fillRequiredFields'))
      return
    }
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const totalDays = calcTotalDays(rentalFormStartDate, rentalFormEndDate)
    const dailyRate = Number(fd.get('dailyRate')) || rentalFormDailyRate
    const totalAmount = totalDays * dailyRate
    const body = {
      number: fd.get('number') as string,
      vehicleId: rentalFormVehicle,
      clientName: fd.get('clientName') as string,
      clientPhone: (fd.get('clientPhone') as string) || null,
      clientEmail: (fd.get('clientEmail') as string) || null,
      clientIdDoc: (fd.get('clientIdDoc') as string) || null,
      startDate: rentalFormStartDate,
      endDate: rentalFormEndDate,
      pickupMileage: Number(fd.get('pickupMileage')) || 0,
      dailyRate,
      totalDays,
      totalAmount,
      deposit: Number(fd.get('deposit')) || 0,
      status: editingRental ? editingRental.status : 'rezervacija',
      notes: (fd.get('notes') as string) || null,
    }
    try {
      if (editingRental) {
        const res = await fetch(`/api/rentals/${editingRental.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || 'Greška')
        }
        toast.success(t('rentACar.rentalUpdated'))
      } else {
        const res = await fetch('/api/rentals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || 'Greška')
        }
        toast.success(t('rentACar.rentalCreated'))
      }
      setViewMode('list')
      setEditingRental(null)
      fetchRentals()
      fetchVehicles()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('common.saveError')
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

export const handleUpdateRentalStatus = async (rental: Rental, newStatus: string) => {
    if (newStatus === 'otkazana' && !confirm(t('rentACar.confirmCancelRental'))) return
    try {
      const res = await fetch(`/api/rentals/${rental.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Status promenjen na "${RENTAL_STATUS_LABELS[newStatus] || newStatus}"`)
      fetchRentals()
      fetchVehicles()
    } catch {
      toast.error(t('rentACar.statusChangeError'))
    }
  }

export const handleDeleteRental = async (id: string) => {
    if (!confirm(t('rentACar.confirmDeleteRental'))) return
    try {
      const res = await fetch(`/api/rentals/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success(t('rentACar.rentalDeleted'))
      fetchRentals()
      fetchVehicles()
    } catch {
      toast.error(t('common.deleteError'))
    }
  }

export const openEditRental = (rental: Rental) => {
    setEditingRental(rental)
    setRentalFormVehicle(rental.vehicleId)
    const v = vehicles.find(v => v.id === rental.vehicleId)
    setRentalFormDailyRate(v?.dailyRate || rental.dailyRate)
    setRentalFormStartDate(rental.startDate.split('T')[0])
    setRentalFormEndDate(rental.endDate.split('T')[0])
    setViewMode('rental-form')
  }

export const handleCancel = () => {
    setViewMode('list')
    setEditingVehicle(null)
    setEditingRental(null)
    setRentalFormVehicle('')
  }

export const generateRentalNumber = () => {
    const count = rentals.length + 1
    const year = new Date().getFullYear()
    return `RN-${year}-${String(count).padStart(4, '0')}`
  }
