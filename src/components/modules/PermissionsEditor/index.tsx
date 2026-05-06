'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Shield, Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { Role, Permissions } from './types'
import { MODULE_LABELS } from './data'
import {
  RoleCard,
  EditRoleDialog,
  NewRoleDialog,
  DeleteConfirmDialog,
} from './components'

// ============ MAIN COMPONENT ============

export function PermissionsEditor() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Edit dialog state
  const [editRole, setEditRole] = useState<Role | null>(null)
  const [editPerms, setEditPerms] = useState<Permissions>({})
  const [editDisplayName, setEditDisplayName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'edit'>('list')

  // New role dialog state
  const [newDialogOpen, setNewDialogOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDisplayName, setNewDisplayName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newPerms, setNewPerms] = useState<Permissions>({})
  const [newSaving, setNewSaving] = useState(false)
  const [cloneFromRole, setCloneFromRole] = useState('')

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null)
  const [deleteSaving, setDeleteSaving] = useState(false)

  // Fetch roles
  const fetchRoles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/roles')
      const data = await res.json()
      setRoles(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Greška pri učitavanju uloga')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRoles() }, [fetchRoles])

  // Open edit
  const openEdit = (role: Role) => {
    setEditRole(role)
    try {
      setEditPerms(JSON.parse(role.permissions))
    } catch {
      setEditPerms({})
    }
    setEditDescription(role.description || '')
    setEditDialogOpen(true)
    setViewMode('edit')
  }

  // Save edit
  const handleSaveEdit = async () => {
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

  // Create new
  const handleCreate = async () => {
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
      resetNewForm()
      fetchRoles()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Greška pri kreiranju')
    } finally {
      setNewSaving(false)
    }
  }

  const resetNewForm = () => {
    setNewName('')
    setNewDisplayName('')
    setNewDescription('')
    setNewPerms({})
    setCloneFromRole('')
  }

  // Delete
  const handleDelete = async () => {
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

  // Clone role
  const handleCloneFrom = (roleId: string) => {
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

  // Count module permissions
  const countPerms = (role: Role) => {
    try {
      const perms: Permissions = JSON.parse(role.permissions)
      return Object.values(perms).filter((p) => p.length > 0).length
    } catch {
      return 0
    }
  }

  // Get total actions
  const countActions = (role: Role) => {
    try {
      const perms: Permissions = JSON.parse(role.permissions)
      return Object.values(perms).reduce((sum, p) => sum + p.length, 0)
    } catch {
      return 0
    }
  }

  const totalModules = Object.keys(MODULE_LABELS).length

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Upravljanje ulogama i permisijama
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Definišite uloge i kontrolišite pristup modulima po akcijama
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {roles.length} uloga
          </Badge>
          <Button size="sm" className="gap-2" onClick={() => setNewDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Nova uloga
          </Button>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            moduleCount={countPerms(role)}
            actionCount={countActions(role)}
            totalModules={totalModules}
            onClick={() => openEdit(role)}
          />
        ))}
      </div>

      {/* Edit Role Dialog */}
      <EditRoleDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        displayName={editDisplayName}
        description={editDescription}
        perms={editPerms}
        viewMode={viewMode}
        saving={saving}
        onDisplayNameChange={setEditDisplayName}
        onDescriptionChange={setEditDescription}
        onPermsChange={setEditPerms}
        onViewModeChange={setViewMode}
        onSave={handleSaveEdit}
      />

      {/* New Role Dialog */}
      <NewRoleDialog
        open={newDialogOpen}
        onOpenChange={setNewDialogOpen}
        saving={newSaving}
        roles={roles}
        cloneFromRole={cloneFromRole}
        name={newName}
        displayName={newDisplayName}
        description={newDescription}
        perms={newPerms}
        onCloneFromChange={handleCloneFrom}
        onNameChange={setNewName}
        onDisplayNameChange={setNewDisplayName}
        onDescriptionChange={setNewDescription}
        onPermsChange={setNewPerms}
        onCreate={handleCreate}
        onCancel={() => { setNewDialogOpen(false); resetNewForm() }}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        target={deleteTarget}
        saving={deleteSaving}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
