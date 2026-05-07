'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
  Shield,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Check,
  Lock,
  Unlock,
  Users,
  Copy,
} from 'lucide-react'
import { toast } from 'sonner'

// ============ TYPES ============

interface Role {
  id: string
  name: string
  displayName: string
  description?: string | null
  permissions: string
  isDefault: boolean
  _count?: { userCompanies: number }
}

interface Permissions {
  [module: string]: string[]
}

interface ModuleGroup {
  label: string
  icon: string
  modules: string[]
}

// ============ MODULE DEFINITIONS ============

const MODULE_LABELS: Record<string, { label: string; icon: string }> = {
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

const ACTIONS = ['read', 'create', 'write', 'delete'] as const
const ACTION_LABELS: Record<string, string> = {
  read: 'Čitanje',
  create: 'Kreiranje',
  write: 'Izmena',
  delete: 'Brisanje',
}

const MODULE_GROUPS: ModuleGroup[] = [
  { label: 'Pregled', icon: '📊', modules: ['dashboard'] },
  { label: 'Finansije', icon: '💰', modules: ['finansije', 'fakture', 'knjigovodstvo', 'bank-sync', 'izvestaji'] },
  { label: 'Prodaja & CRM', icon: '❤️', modules: ['crm', 'partneri', 'kalendar'] },
  { label: 'Lanac snabdevanja', icon: '🏭', modules: ['magacin', 'nabavka'] },
  { label: 'Organizacija', icon: '👥', modules: ['zaposleni', 'projekti', 'sredstva', 'dokumenta', 'protokol'] },
  { label: 'Servisi', icon: '🔧', modules: ['edukacija', 'vozni-park', 'kafe-restoran', 'email-marketing', 'rent-a-car'] },
  { label: 'Sistem', icon: '⚙️', modules: ['podesavanja', 'integracije', 'notifications', 'zakoni'] },
]

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-700 border-red-200',
  knjigovodac: 'bg-sky-100 text-sky-700 border-sky-200',
  prodavac: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  magacioner: 'bg-amber-100 text-amber-700 border-amber-200',
  hr: 'bg-violet-100 text-violet-700 border-violet-200',
  read_only: 'bg-slate-100 text-slate-600 border-slate-200',
}

function getRoleColor(name: string): string {
  return ROLE_COLORS[name] || 'bg-slate-100 text-slate-600 border-slate-200'
}

// ============ PERMISSION CHECKBOX ============

function PermCheckbox({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: (val: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={`flex h-6 w-6 items-center justify-center rounded border transition-colors ${
        checked
          ? 'bg-primary border-primary text-primary-foreground'
          : 'border-muted-foreground/30 hover:border-primary/50'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {checked && <Check className="h-3.5 w-3.5" />}
    </button>
  )
}

// ============ PERMISSION MATRIX ============

function PermissionMatrix({
  permissions,
  onChange,
  readOnly,
}: {
  permissions: Permissions
  onChange: (perms: Permissions) => void
  readOnly?: boolean
}) {
  const togglePermission = (module: string, action: string) => {
    if (readOnly) return
    const current = permissions[module] || []
    const updated = current.includes(action)
      ? current.filter((a) => a !== action)
      : [...current, action]
    onChange({ ...permissions, [module]: updated })
  }

  const toggleModuleAll = (module: string) => {
    if (readOnly) return
    const current = permissions[module] || []
    const allEnabled = ACTIONS.every((a) => current.includes(a))
    if (allEnabled) {
      onChange({ ...permissions, [module]: [] })
    } else {
      onChange({ ...permissions, [module]: [...ACTIONS] })
    }
  }

  const toggleGroupAll = (group: ModuleGroup) => {
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

  const toggleAllModules = () => {
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

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-t-lg border-b">
        <div className="w-[180px] shrink-0" />
        <div className="flex-1 grid grid-cols-4 gap-2 text-center">
          {ACTIONS.map((action) => (
            <span key={action} className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              {ACTION_LABELS[action]}
            </span>
          ))}
        </div>
        <div className="w-[50px] shrink-0" />
      </div>

      {/* All modules toggle */}
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/10 rounded-lg border">
        <div className="w-[180px] shrink-0">
          <span className="text-xs font-bold text-foreground">Svi moduli</span>
        </div>
        <div className="flex-1 grid grid-cols-4 gap-2 justify-items-center">
          <PermCheckbox
            checked={Object.keys(MODULE_LABELS).every((m) => (permissions[m] || []).length === ACTIONS.length)}
            onChange={toggleAllModules}
            disabled={readOnly}
          />
          <div />
          <div />
          <div />
        </div>
        <div className="w-[50px] shrink-0 flex justify-center">
          <Badge variant="outline" className="text-[10px]">
            {Object.values(permissions).filter((p) => p.length > 0).length}/{Object.keys(MODULE_LABELS).length}
          </Badge>
        </div>
      </div>

      {/* Module groups */}
      {MODULE_GROUPS.map((group) => {
        const groupAllEnabled = group.modules.every(
          (m) => (permissions[m] || []).length === ACTIONS.length
        )
        const groupModuleCount = group.modules.filter(
          (m) => (permissions[m] || []).length > 0
        ).length

        return (
          <div key={group.label} className="border rounded-lg overflow-hidden">
            {/* Group header */}
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/20 border-b">
              <PermCheckbox
                checked={groupAllEnabled}
                onChange={() => toggleGroupAll(group)}
                disabled={readOnly}
              />
              <span className="text-sm">{group.icon}</span>
              <span className="text-xs font-bold text-foreground">{group.label}</span>
              <div className="flex-1" />
              <Badge variant="outline" className="text-[10px]">
                {groupModuleCount}/{group.modules.length}
              </Badge>
            </div>

            {/* Modules in group */}
            {group.modules.map((mod) => {
              const modPerms = permissions[mod] || []
              const allEnabled = ACTIONS.every((a) => modPerms.includes(a))
              const info = MODULE_LABELS[mod]

              return (
                <div
                  key={mod}
                  className={`flex items-center gap-2 px-3 py-2 ${
                    modPerms.length > 0 ? 'bg-primary/[0.02]' : ''
                  } border-b last:border-b-0`}
                >
                  <PermCheckbox
                    checked={allEnabled}
                    onChange={() => toggleModuleAll(mod)}
                    disabled={readOnly}
                  />
                  <div className="w-[140px] shrink-0 flex items-center gap-1.5">
                    <span className="text-xs">{info?.icon}</span>
                    <span className="text-xs font-medium text-foreground">{info?.label}</span>
                  </div>
                  <div className="flex-1 grid grid-cols-4 gap-2 justify-items-center">
                    {ACTIONS.map((action) => (
                      <PermCheckbox
                        key={action}
                        checked={modPerms.includes(action)}
                        onChange={() => togglePermission(mod, action)}
                        disabled={readOnly}
                      />
                    ))}
                  </div>
                  <div className="w-[50px] shrink-0 flex justify-center">
                    {modPerms.length > 0 && modPerms.length < ACTIONS.length && (
                      <Badge variant="secondary" className="text-[10px]">
                        {modPerms.length}
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

// ============ MAIN COMPONENT ============

export function PermissionsEditor() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Edit dialog
  const [editRole, setEditRole] = useState<Role | null>(null)
  const [editPerms, setEditPerms] = useState<Permissions>({})
  const [editName, setEditName] = useState('')
  const [editDisplayName, setEditDisplayName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'edit'>('list')

  // New role dialog
  const [newDialogOpen, setNewDialogOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDisplayName, setNewDisplayName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newPerms, setNewPerms] = useState<Permissions>({})
  const [newSaving, setNewSaving] = useState(false)
  const [cloneFromRole, setCloneFromRole] = useState('')

  // Delete dialog
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
    setEditName(role.name)
    setEditDisplayName(role.displayName)
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
        {roles.map((role) => {
          const moduleCount = countPerms(role)
          const actionCount = countActions(role)
          const totalModules = Object.keys(MODULE_LABELS).length

          return (
            <Card
              key={role.id}
              className="relative overflow-hidden transition-all hover:shadow-md cursor-pointer"
              onClick={() => openEdit(role)}
            >
              {role.isDefault && (
                <div className="absolute top-0 right-0">
                  <div className="bg-primary/10 text-primary text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
                    DEFAULT
                  </div>
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-foreground">{role.displayName}</h3>
                    <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{role.name}</p>
                    {role.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{role.description}</p>
                    )}
                  </div>
                  <Badge variant="outline" className={`shrink-0 text-[10px] ${getRoleColor(role.name)}`}>
                    {role._count?.userCompanies || 0}
                  </Badge>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(moduleCount / totalModules) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {moduleCount}/{totalModules} modula · {actionCount} prava
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">
                    {role._count?.userCompanies || 0} korisnika
                  </span>
                  <div className="flex-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      openEdit(role)
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                    Izmeni
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* ============ EDIT ROLE DIALOG ============ */}

      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        setEditDialogOpen(open)
        if (!open) setViewMode('list')
      }}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {viewMode === 'edit' ? `Izmeni ulogu: ${editDisplayName}` : editDisplayName}
            </DialogTitle>
            <DialogDescription>
              {viewMode === 'edit'
                ? 'Podesite permisije za svaki modul i akciju'
                : `Pregled permisija za ulogu ${editDisplayName}`}
            </DialogDescription>
          </DialogHeader>

          {viewMode === 'edit' ? (
            <div className="space-y-6">
              {/* Role info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs">Naziv (displayName)</Label>
                  <Input
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                    placeholder="npr. Knjigovođa"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Opis</Label>
                  <Input
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Kratak opis uloge"
                  />
                </div>
              </div>

              {/* Permission matrix */}
              <div className="max-h-[450px] overflow-y-auto">
                <PermissionMatrix
                  permissions={editPerms}
                  onChange={setEditPerms}
                />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setViewMode('list')
                }}>
                  Pregled
                </Button>
                <div className="flex-1" />
                <Button variant="outline" onClick={() => {
                  setEditDialogOpen(false)
                  setViewMode('list')
                }}>
                  Otkaži
                </Button>
                <Button onClick={handleSaveEdit} disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Sačuvaj
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Read-only permission matrix */}
              <div className="max-h-[450px] overflow-y-auto">
                <PermissionMatrix
                  permissions={editPerms}
                  onChange={() => {}}
                  readOnly
                />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setEditDialogOpen(false)
                  setViewMode('list')
                }}>
                  Zatvori
                </Button>
                <Button onClick={() => setViewMode('edit')} className="gap-2">
                  <Pencil className="h-4 w-4" />
                  Izmeni
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ============ NEW ROLE DIALOG ============ */}

      <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Nova uloga
            </DialogTitle>
            <DialogDescription>
              Kreirajte novu ulogu i podesite permisije
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Clone from existing */}
            <Card className="border-dashed">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <Copy className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <Label className="text-xs">Kopiraj permisije iz postojeće uloge (opciono)</Label>
                    <Select value={cloneFromRole} onValueChange={handleCloneFrom}>
                      <SelectTrigger className="h-8 mt-1">
                        <SelectValue placeholder="Izaberite ulogu za kopiranje..." />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.displayName} ({r.name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs">Ključ (name) *</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value.replace(/[^a-z_0-9]/g, '_'))}
                  placeholder="npr. prodavac_vip"
                  className="font-mono text-xs"
                />
                <p className="text-[10px] text-muted-foreground">Samo mala slova, brojevi i _</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Naziv (displayName) *</Label>
                <Input
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="npr. VIP Prodavac"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Opis</Label>
              <Input
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Kratak opis uloge"
              />
            </div>

            {/* Permission matrix */}
            <div className="max-h-[400px] overflow-y-auto">
              <PermissionMatrix
                permissions={newPerms}
                onChange={setNewPerms}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setNewDialogOpen(false)
                setNewName('')
                setNewDisplayName('')
                setNewDescription('')
                setNewPerms({})
                setCloneFromRole('')
              }}>
                Otkaži
              </Button>
              <Button onClick={handleCreate} disabled={newSaving} className="gap-2">
                {newSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Kreiraj ulogu
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* ============ DELETE CONFIRMATION ============ */}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => {
        if (!open) setDeleteTarget(null)
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Obriši ulogu
            </AlertDialogTitle>
            <AlertDialogDescription>
              Da li ste sigurni da želite da obrišete ulogu{' '}
              <span className="font-semibold text-foreground">{deleteTarget?.displayName}</span>?
              {deleteTarget && (deleteTarget._count?.userCompanies || 0) > 0 && (
                <span className="block mt-2 text-destructive font-medium">
                  Upozorenje: {deleteTarget._count?.userCompanies} korisnika koristi ovu ulogu!
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteSaving}>Otkaži</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={deleteSaving}
              className="bg-destructive text-white hover:bg-destructive/90 gap-2"
            >
              {deleteSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Obriši
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
