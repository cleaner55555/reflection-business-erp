'use client'

from '@/components/ui/alert-dialog'
from '@/components/ui/badge'
from '@/components/ui/button'
from '@/components/ui/card'
from '@/components/ui/dialog'
from '@/components/ui/input'
from '@/components/ui/label'
from '@/components/ui/select'
from '@/components/ui/skeleton'
from '@/components/ui/switch'
from '@/components/ui/table'
import { , Check } from 'lucide-react'
import type { Role, Permissions, ModuleGroup } from './types'

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
