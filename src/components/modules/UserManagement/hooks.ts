import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export function useUserManagement() {
  const activeCompanyId = useAppStore((s) => s.activeCompanyId)

  // Data state
  const [users, setUsers] = useState<CompanyUser[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Form state
  const [addForm, setAddForm] = useState<NewUserForm>({ ...EMPTY_FORM })
  const [addSubmitting, setAddSubmitting] = useState(false)

  // Edit role state
  const [editingUser, setEditingUser] = useState<CompanyUser | null>(null)
  const [editRoleId, setEditRoleId] = useState('')
  const [editSubmitting, setEditSubmitting] = useState(false)

  // Delete state
  const [deletingUser, setDeletingUser] = useState<CompanyUser | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)

  // Deactivate state
  const [deactivatingUser, setDeactivatingUser] = useState<CompanyUser | null>(null)

  // ============ HELPERS ============

  const headers = useCallback(
    () => ({
      'Content-Type': 'application/json',
      'x-company-id': activeCompanyId || '',
    }),
    [activeCompanyId]
  )

  // ============ FETCH DATA ============

  const fetchUsers = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(
        `/api/users?companyId=${activeCompanyId}`,
        { headers: headers() }
      )
      if (!res.ok) throw new Error('Greška pri učitavanju korisnika')
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : data.users || [])
    } catch (err) {
      console.error('Failed to fetch users:', err)
      toast.error('Greška pri učitavanju korisnika')
    } finally {
      setLoading(false)
    }
  }, [activeCompanyId, headers])

  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch('/api/roles', { headers: headers() })
      if (!res.ok) throw new Error('Greška pri učitavanju uloga')
      const data = await res.json()
      setRoles(Array.isArray(data) ? data : data.roles || [])
    } catch (err) {
      console.error('Failed to fetch roles:', err)
      toast.error('Greška pri učitavanju uloga')
    }
  }, [headers])

  useEffect(() => {
    setLoading(true)
    fetchUsers()
    fetchRoles()
  }, [fetchUsers, fetchRoles])

  // ============ ADD USER ============

  const handleAddUser = async () => {
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

  // ============ EDIT ROLE ============

  const openEditDialog = (user: CompanyUser) => {
    setEditingUser(user)
    setEditRoleId(user.roleId)
    setEditDialogOpen(true)
  }

  const handleEditRole = async () => {
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

  // ============ TOGGLE ACTIVE ============

  const handleToggleActive = async (user: CompanyUser) => {
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

  // ============ DELETE USER ============

  const openDeleteDialog = (user: CompanyUser) => {
    setDeletingUser(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteUser = async () => {
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

  // ============ FILTERED USERS ============

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.roleDisplayName?.toLowerCase().includes(q) ||
      u.jobTitle?.toLowerCase().includes(q)
    )
  })

  // ============ RENDER ============

  return {
    addDialogOpen,
    addSubmitting,
    deactivatingUser,
    deleteDialogOpen,
    deleteSubmitting,
    deletingUser,
    editDialogOpen,
    editRoleId,
    editSubmitting,
    editingUser,
    filteredUsers,
    handleAddUser,
    handleEditRole,
    handleToggleActive,
    loading,
    openDeleteDialog,
    openEditDialog,
    roles,
    rowVariant,
    searchQuery,
    setAddDialogOpen,
    setEditRoleId,
    staggerContainer,
    users,
  }
}
