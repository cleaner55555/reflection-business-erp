export const EMPTY_FORM: NewUserForm = {
  email: '',
  firstName: '',
  lastName: '',
  password: '',
  phone: '',
  roleId: '',
  jobTitle: '',
}

export const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  superadmin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  manager: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  employee: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  accountant: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  viewer: 'bg-slate-100 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400',
}

export const key = roleName.toLowerCase();

export const f = firstName?.charAt(0)?.toUpperCase() || '';

export const l = lastName?.charAt(0)?.toUpperCase() || '';

export const date = new Date(dateStr);

export const now = new Date();

export const diffMs = now.getTime() - date.getTime();

export const diffMins = Math.floor(diffMs / 60000);

export const diffHours = Math.floor(diffMs / 3600000);

export const diffDays = Math.floor(diffMs / 86400000);

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: 'easeOut' },
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.04,
    },
  },
}

export const rowVariant = {
  initial: { opacity: 0, x: -12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 12 },
}

export const activeCompanyId = useAppStore((s) => s.activeCompanyId);

export const res = await fetch(
        `/api/users?companyId=${activeCompanyId}`,
        { headers: headers() }
      );

export const data = await res.json();

export const res = await fetch('/api/roles', { headers: headers() });

export const data = await res.json();

export const handleAddUser = async () => {
    if (!addForm.email || !addForm.firstName || !addForm.lastName || !addForm.roleId) {
      toast.error('Popunite obavezna polja: email, ime, prezime i uloga')
      return
    }

    setAddSubmitting(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(addForm),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || errData.message || 'Greška pri dodavanju korisnika')
      }

      toast.success(`Korisnik ${addForm.firstName} ${addForm.lastName} je uspešno dodat`)
      setAddForm({ ...EMPTY_FORM })
      setAddDialogOpen(false)
      fetchUsers()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Greška pri dodavanju korisnika'
      toast.error(message)
    } finally {
      setAddSubmitting(false)
    }
  }

export const openEditDialog = (user: CompanyUser) => {
    setEditingUser(user)
    setEditRoleId(user.roleId)
    setEditDialogOpen(true)
  }

export const handleEditRole = async () => {
    if (!editingUser || !editRoleId) return

    setEditSubmitting(true)
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({
          userId: editingUser.id,
          roleId: editRoleId,
        }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || errData.message || 'Greška pri izmeni uloge')
      }

      toast.success(`Uloga za ${editingUser.firstName} ${editingUser.lastName} je uspešno izmenjena`)
      setEditDialogOpen(false)
      setEditingUser(null)
      fetchUsers()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Greška pri izmeni uloge'
      toast.error(message)
    } finally {
      setEditSubmitting(false)
    }
  }

export const handleToggleActive = async (user: CompanyUser) => {
    setDeactivatingUser(user)
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({
          userId: user.id,
          isActive: !user.isActive,
        }),
      })
      if (!res.ok) throw new Error('Greška')

      toast.success(
        user.isActive
          ? `Korisnik ${user.firstName} ${user.lastName} je deaktiviran`
          : `Korisnik ${user.firstName} ${user.lastName} je aktiviran`
      )
      fetchUsers()
    } catch {
      toast.error('Greška pri promeni statusa korisnika')
    } finally {
      setDeactivatingUser(null)
    }
  }

export const openDeleteDialog = (user: CompanyUser) => {
    setDeletingUser(user)
    setDeleteDialogOpen(true)
  }

export const handleDeleteUser = async () => {
    if (!deletingUser) return

    setDeleteSubmitting(true)
    try {
      const res = await fetch(
        `/api/users?userId=${deletingUser.id}&companyId=${activeCompanyId}`,
        {
          method: 'DELETE',
          headers: headers(),
        }
      )
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || errData.message || 'Greška pri brisanju korisnika')
      }

      toast.success(`Korisnik ${deletingUser.firstName} ${deletingUser.lastName} je uspešno obrisan`)
      setDeleteDialogOpen(false)
      setDeletingUser(null)
      fetchUsers()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Greška pri brisanju korisnika'
      toast.error(message)
    } finally {
      setDeleteSubmitting(false)
    }
  }

export const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.roleDisplayName?.toLowerCase().includes(q) ||
      u.jobTitle?.toLowerCase().includes(q)
    )
  });

export function getRoleBadgeClasses(roleName: string): string {
  const key = roleName.toLowerCase()
  return ROLE_COLORS[key] || 'bg-slate-100 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400'
}

export function getInitials(firstName: string, lastName: string): string {
  const f = firstName?.charAt(0)?.toUpperCase() || ''
  const l = lastName?.charAt(0)?.toUpperCase() || ''
  return `${f}${l}` || '?'
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Upravo sada'
    if (diffMins < 60) return `Pre ${diffMins} min`
    if (diffHours < 24) return `Pre ${diffHours} h`
    if (diffDays < 7) return `Pre ${diffDays} d`

    return date.toLocaleDateString('sr-Latn', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}
