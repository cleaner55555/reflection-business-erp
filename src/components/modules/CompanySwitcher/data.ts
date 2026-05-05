export const { activeCompanyId, activeCompanyName, setActiveCompany } = useAppStore();

export const loadCompanies = async () => {
    try {
      const res = await fetch('/api/companies')
      if (res.ok) {
        const data = await res.json()
        setCompanies(Array.isArray(data) ? data : [data])
      }
    } catch {
      // silent
    }
  }

export const handleCreateCompany = async () => {
    if (!newName.trim()) {
      toast.error('Naziv kompanije je obavezan')
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          pib: newPib || undefined,
          city: newCity || undefined,
          address: newAddress || undefined,
          email: newEmail || undefined,
          phone: newPhone || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Greška pri kreiranju')
        return
      }
      const company = await res.json()
      toast.success(`Kompanija "${company.name}" je kreirana`)
      setDialogOpen(false)
      setNewName('')
      setNewPib('')
      setNewCity('')
      setNewAddress('')
      setNewEmail('')
      setNewPhone('')
      loadCompanies()

      // Auto-switch to new company
      setActiveCompany(company.id, company.name)
    } catch {
      toast.error('Greška pri kreiranju kompanije')
    } finally {
      setCreating(false)
    }
  }
