'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import {
  Shield, Plus, Pencil, Trash2, Loader2, Check, Users, Copy,
} from 'lucide-react'
import type { Role, Permissions, ModuleGroup } from './types'

// Re-export constants so index can use them too
export { MODULE_LABELS, ACTIONS, ACTION_LABELS, MODULE_GROUPS, ROLE_COLORS } from './data'

// ============ UTILS ============

export function getRoleColor(name: string): string {
  return ROLE_COLORS[name] || 'bg-slate-100 text-slate-600 border-slate-200'
}

// ============ PERMISSION CHECKBOX ============

export function PermCheckbox({
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

export function PermissionMatrix({
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

// ============ ROLE CARD ============

export function RoleCard({
  role,
  moduleCount,
  actionCount,
  totalModules,
  onClick,
}: {
  role: Role
  moduleCount: number
  actionCount: number
  totalModules: number
  onClick: () => void
}) {
  return (
    <Card
      className="relative overflow-hidden transition-all hover:shadow-md cursor-pointer"
      onClick={onClick}
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
              onClick()
            }}
          >
            <Pencil className="h-3 w-3" />
            Izmeni
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ============ EDIT ROLE DIALOG ============

export function EditRoleDialog({
  open,
  onOpenChange,
  displayName,
  description,
  perms,
  viewMode,
  saving,
  onDisplayNameChange,
  onDescriptionChange,
  onPermsChange,
  onViewModeChange,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  displayName: string
  description: string
  perms: Permissions
  viewMode: 'list' | 'edit'
  saving: boolean
  onDisplayNameChange: (val: string) => void
  onDescriptionChange: (val: string) => void
  onPermsChange: (perms: Permissions) => void
  onViewModeChange: (mode: 'list' | 'edit') => void
  onSave: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open)
      if (!open) onViewModeChange('list')
    }}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {viewMode === 'edit' ? `Izmeni ulogu: ${displayName}` : displayName}
          </DialogTitle>
          <DialogDescription>
            {viewMode === 'edit'
              ? 'Podesite permisije za svaki modul i akciju'
              : `Pregled permisija za ulogu ${displayName}`}
          </DialogDescription>
        </DialogHeader>

        {viewMode === 'edit' ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs">Naziv (displayName)</Label>
                <Input
                  value={displayName}
                  onChange={(e) => onDisplayNameChange(e.target.value)}
                  placeholder="npr. Knjigovođa"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Opis</Label>
                <Input
                  value={description}
                  onChange={(e) => onDescriptionChange(e.target.value)}
                  placeholder="Kratak opis uloge"
                />
              </div>
            </div>

            <div className="max-h-[450px] overflow-y-auto">
              <PermissionMatrix permissions={perms} onChange={onPermsChange} />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onViewModeChange('list')}>
                Pregled
              </Button>
              <div className="flex-1" />
              <Button variant="outline" onClick={() => {
                onOpenChange(false)
                onViewModeChange('list')
              }}>
                Otkaži
              </Button>
              <Button onClick={onSave} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Sačuvaj
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="max-h-[450px] overflow-y-auto">
              <PermissionMatrix
                permissions={perms}
                onChange={() => {}}
                readOnly
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                onOpenChange(false)
                onViewModeChange('list')
              }}>
                Zatvori
              </Button>
              <Button onClick={() => onViewModeChange('edit')} className="gap-2">
                <Pencil className="h-4 w-4" />
                Izmeni
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ============ NEW ROLE DIALOG ============

export function NewRoleDialog({
  open,
  onOpenChange,
  saving,
  roles,
  cloneFromRole,
  name,
  displayName,
  description,
  perms,
  onCloneFromChange,
  onNameChange,
  onDisplayNameChange,
  onDescriptionChange,
  onPermsChange,
  onCreate,
  onCancel,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  saving: boolean
  roles: Role[]
  cloneFromRole: string
  name: string
  displayName: string
  description: string
  perms: Permissions
  onCloneFromChange: (roleId: string) => void
  onNameChange: (val: string) => void
  onDisplayNameChange: (val: string) => void
  onDescriptionChange: (val: string) => void
  onPermsChange: (perms: Permissions) => void
  onCreate: () => void
  onCancel: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Card className="border-dashed">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <Copy className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <Label className="text-xs">Kopiraj permisije iz postojeće uloge (opciono)</Label>
                  <Select value={cloneFromRole} onValueChange={onCloneFromChange}>
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs">Ključ (name) *</Label>
              <Input
                value={name}
                onChange={(e) => onNameChange(e.target.value.replace(/[^a-z_0-9]/g, '_'))}
                placeholder="npr. prodavac_vip"
                className="font-mono text-xs"
              />
              <p className="text-[10px] text-muted-foreground">Samo mala slova, brojevi i _</p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Naziv (displayName) *</Label>
              <Input
                value={displayName}
                onChange={(e) => onDisplayNameChange(e.target.value)}
                placeholder="npr. VIP Prodavac"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Opis</Label>
            <Input
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Kratak opis uloge"
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            <PermissionMatrix permissions={perms} onChange={onPermsChange} />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onCancel}>
              Otkaži
            </Button>
            <Button onClick={onCreate} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Kreiraj ulogu
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============ DELETE CONFIRMATION ============

export function DeleteConfirmDialog({
  target,
  saving,
  onConfirm,
  onCancel,
}: {
  target: Role | null
  saving: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <AlertDialog open={!!target} onOpenChange={(open) => {
      if (!open) onCancel()
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Obriši ulogu
          </AlertDialogTitle>
          <AlertDialogDescription>
            Da li ste sigurni da želite da obrišete ulogu{' '}
            <span className="font-semibold text-foreground">{target?.displayName}</span>?
            {target && (target._count?.userCompanies || 0) > 0 && (
              <span className="block mt-2 text-destructive font-medium">
                Upozorenje: {target._count?.userCompanies} korisnika koristi ovu ulogu!
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={saving}>Otkaži</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={saving}
            className="bg-destructive text-white hover:bg-destructive/90 gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Obriši
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
