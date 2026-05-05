export const MODULE_LABELS: Record<string, { label: string; icon: string }> = {
  dashboard: { label: 'Dashboard', icon: '📊' },
  finansije: { label: 'Finansije', icon: '💰' },
  fakture: { label: 'Fakture', icon: '📄' },
  magacin: { label: 'Magacin', icon: '🏭' },
  partneri: { label: 'Partneri', icon: '🤝' },
  nabavka: { label: 'Nabavka', icon: '🛒' },
  crm: { label: 'CRM', icon: '❤️' },
  kalendar: { label: 'Kalendar', icon: '📅' },
  zaposleni: { label: 'Zaposleni', icon: '👥' },
  projekti: { label: 'Projekti', icon: '📁' },
  sredstva: { label: 'Sredstva', icon: '🏗️' },
  dokumenta: { label: 'Dokumenta', icon: '📂' },
  knjigovodstvo: { label: 'Knjigovodstvo', icon: '📒' },
  protokol: { label: 'Protokol', icon: '📬' },
  edukacija: { label: 'Edukacija', icon: '🎓' },
  'vozni-park': { label: 'Vozni park', icon: '🚗' },
  'kafe-restoran': { label: 'Kafe restoran', icon: '☕' },
  'email-marketing': { label: 'Email Marketing', icon: '✉️' },
  'rent-a-car': { label: 'Rent a car', icon: '🚙' },
  izvestaji: { label: 'Izveštaji', icon: '📈' },
  podesavanja: { label: 'Podešavanja', icon: '⚙️' },
  integracije: { label: 'Integracije', icon: '🔌' },
  'bank-sync': { label: 'Bank Sync', icon: '🏦' },
  notifications: { label: 'Notifikacije', icon: '🔔' },
  zakoni: { label: 'Zakoni', icon: '⚖️' },
}

export const ACTIONS = ['read', 'create', 'write', 'delete'] as const;

export const ACTION_LABELS: Record<string, string> = {
  read: 'Čitanje',
  create: 'Kreiranje',
  write: 'Izmena',
  delete: 'Brisanje',
}

export const MODULE_GROUPS: ModuleGroup[] = [
  { label: 'Pregled', icon: '📊', modules: ['dashboard'] },
  { label: 'Finansije', icon: '💰', modules: ['finansije', 'fakture', 'knjigovodstvo', 'bank-sync', 'izvestaji'] },
  { label: 'Prodaja & CRM', icon: '❤️', modules: ['crm', 'partneri', 'kalendar'] },
  { label: 'Lanac snabdevanja', icon: '🏭', modules: ['magacin', 'nabavka'] },
  { label: 'Organizacija', icon: '👥', modules: ['zaposleni', 'projekti', 'sredstva', 'dokumenta', 'protokol'] },
  { label: 'Servisi', icon: '🔧', modules: ['edukacija', 'vozni-park', 'kafe-restoran', 'email-marketing', 'rent-a-car'] },
  { label: 'Sistem', icon: '⚙️', modules: ['podesavanja', 'integracije', 'notifications', 'zakoni'] },
]

export const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-700 border-red-200',
  knjigovodac: 'bg-sky-100 text-sky-700 border-sky-200',
  prodavac: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  magacioner: 'bg-amber-100 text-amber-700 border-amber-200',
  hr: 'bg-violet-100 text-violet-700 border-violet-200',
  read_only: 'bg-slate-100 text-slate-600 border-slate-200',
}

export const togglePermission = (module: string, action: string) => {
    if (readOnly) return
    const current = permissions[module] || []
    const updated = current.includes(action)
      ? current.filter((a) => a !== action)
      : [...current, action]
    onChange({ ...permissions, [module]: updated })
  }

export const toggleModuleAll = (module: string) => {
    if (readOnly) return
    const current = permissions[module] || []
    const allEnabled = ACTIONS.every((a) => current.includes(a))
    if (allEnabled) {
      onChange({ ...permissions, [module]: [] })
    } else {
      onChange({ ...permissions, [module]: [...ACTIONS] })
    }
  }

export const toggleGroupAll = (group: ModuleGroup) => {
    if (readOnly) return
    const allEnabled = group.modules.every(
      (m) => (permissions[m] || []).length === ACTIONS.length
    )
    const updated = { ...permissions }
    for (const mod of group.modules) {
      updated[mod] = allEnabled ? [] : [...ACTIONS]
    }
    onChange(updated)
  }

export const toggleAllModules = () => {
    if (readOnly) return
    const allEnabled = Object.keys(MODULE_LABELS).every(
      (m) => (permissions[m] || []).length === ACTIONS.length
    )
    if (allEnabled) {
      onChange({})
    } else {
      const updated: Permissions = {}
      for (const mod of Object.keys(MODULE_LABELS)) {
        updated[mod] = [...ACTIONS]
      }
      onChange(updated)
    }
  }

export const groupAllEnabled = group.modules.every(
          (m) => (permissions[m] || []).length === ACTIONS.length
        );

export const groupModuleCount = group.modules.filter(
          (m) => (permissions[m] || []).length > 0
        ).length;

export const modPerms = permissions[mod] || []

export const allEnabled = ACTIONS.every((a) => modPerms.includes(a));

export const info = MODULE_LABELS[mod]

export const res = await fetch('/api/roles');

export const data = await res.json();

export const openEdit = (role: Role) => {
    setEditRole(role)
    try {
      setEditPerms(JSON.parse(role.permissions))
    } catch {
      setEditPerms({})
    }
    setEditName(role.name)
    setEditDisplayName(role.displayName)
    setEditDescription(role.description || '')
    setEditDialogOpen(true)
    setViewMode('edit')
  }

export const handleSaveEdit = async () => {
    if (!editRole) return
    setSaving(true)
    try {
      const res = await fetch(`/api/roles/${editRole.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: editDisplayName,
          description: editDescription,
          permissions: editPerms,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Greška')
      }
      toast.success(`Uloga "${editDisplayName}" uspešno ažurirana`)
      setEditDialogOpen(false)
      setViewMode('list')
      fetchRoles()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Greška pri čuvanju')
    } finally {
      setSaving(false)
    }
  }

export const handleCreate = async () => {
    if (!newName || !newDisplayName) {
      toast.error('Naziv i ključ su obavezni')
      return
    }
    setNewSaving(true)
    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          displayName: newDisplayName,
          description: newDescription || null,
          permissions: newPerms,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Greška')
      }
      toast.success(`Uloga "${newDisplayName}" kreirana`)
      setNewDialogOpen(false)
      setNewName('')
      setNewDisplayName('')
      setNewDescription('')
      setNewPerms({})
      setCloneFromRole('')
      fetchRoles()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Greška pri kreiranju')
    } finally {
      setNewSaving(false)
    }
  }

export const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteSaving(true)
    try {
      const res = await fetch(`/api/roles/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Greška')
      }
      toast.success(`Uloga "${deleteTarget.displayName}" obrisana`)
      setDeleteTarget(null)
      fetchRoles()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Greška pri brisanju')
    } finally {
      setDeleteSaving(false)
    }
  }

export const handleCloneFrom = (roleId: string) => {
    if (!roleId) {
      setNewPerms({})
      return
    }
    const role = roles.find((r) => r.id === roleId)
    if (role) {
      try {
        setNewPerms(JSON.parse(role.permissions))
      } catch {
        setNewPerms({})
      }
    }
  }

export const countPerms = (role: Role) => {
    try {
      const perms: Permissions = JSON.parse(role.permissions)
      return Object.values(perms).filter((p) => p.length > 0).length
    } catch {
      return 0
    }
  }

export const countActions = (role: Role) => {
    try {
      const perms: Permissions = JSON.parse(role.permissions)
      return Object.values(perms).reduce((sum, p) => sum + p.length, 0)
    } catch {
      return 0
    }
  }

export const moduleCount = countPerms(role);

export const actionCount = countActions(role);

export const totalModules = Object.keys(MODULE_LABELS).length;

export function getRoleColor(name: string): string {
  return ROLE_COLORS[name] || 'bg-slate-100 text-slate-600 border-slate-200'
}
