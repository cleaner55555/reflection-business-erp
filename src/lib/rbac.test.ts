import { describe, it, expect } from 'vitest'
import {
  MODULES,
  ACTIONS,
  DEFAULT_ROLES,
  hasPermission,
  hasAnyPermission,
  getAccessibleModules,
} from './rbac'

describe('MODULES', () => {
  it('contains all expected core modules', () => {
    expect(MODULES).toContain('dashboard')
    expect(MODULES).toContain('finansije')
    expect(MODULES).toContain('fakture')
    expect(MODULES).toContain('magacin')
    expect(MODULES).toContain('crm')
    expect(MODULES).toContain('podesavanja')
  })

  it('has at least 20 modules', () => {
    expect(MODULES.length).toBeGreaterThanOrEqual(20)
  })

  it('has no duplicate modules', () => {
    expect(new Set(MODULES).size).toBe(MODULES.length)
  })
})

describe('ACTIONS', () => {
  it('contains the four standard actions', () => {
    expect(ACTIONS).toEqual(['read', 'create', 'write', 'delete'])
  })
})

describe('DEFAULT_ROLES', () => {
  it('has an admin role with full access to all modules', () => {
    const admin = DEFAULT_ROLES.admin
    expect(admin).toBeDefined()
    expect(admin.displayName).toBe('Administrator')
    for (const mod of MODULES) {
      expect(admin.permissions[mod]).toEqual(['read', 'create', 'write', 'delete'])
    }
  })

  it('has a read_only role with only read access', () => {
    const readOnly = DEFAULT_ROLES.read_only
    expect(readOnly).toBeDefined()
    expect(readOnly.displayName).toBe('Samo čitanje')
    for (const mod of MODULES) {
      expect(readOnly.permissions[mod]).toEqual(['read'])
    }
  })

  it('has a knjigovođa role with limited access', () => {
    const knjigovoda = DEFAULT_ROLES['knjigovođa']
    expect(knjigovoda).toBeDefined()
    expect(knjigovoda.permissions.fakture).toContain('read')
    expect(knjigovoda.permissions.fakture).toContain('create')
    expect(knjigovoda.permissions.fakture).toContain('write')
    // Should NOT have delete
    expect(knjigovoda.permissions.fakture).not.toContain('delete')
  })

  it('has a prodavac role with CRM access', () => {
    const prodavac = DEFAULT_ROLES.prodavac
    expect(prodavac).toBeDefined()
    expect(prodavac.permissions.crm).toContain('read')
    expect(prodavac.permissions.crm).toContain('create')
    expect(prodavac.permissions.crm).toContain('write')
  })

  it('has a magacioner role with inventory access', () => {
    const magacioner = DEFAULT_ROLES.magacioner
    expect(magacioner).toBeDefined()
    expect(magacioner.permissions.magacin).toContain('read')
    expect(magacioner.permissions.magacin).toContain('create')
  })

  it('has an HR role', () => {
    const hr = DEFAULT_ROLES.hr
    expect(hr).toBeDefined()
    expect(hr.permissions.zaposleni).toContain('read')
    expect(hr.permissions.zaposleni).toContain('create')
  })

  it('all roles have displayName and description', () => {
    for (const [name, role] of Object.entries(DEFAULT_ROLES)) {
      expect(role.displayName).toBeTruthy()
      expect(role.description).toBeTruthy()
      expect(role.permissions).toBeDefined()
    }
  })
})

describe('hasPermission', () => {
  const adminPerms = DEFAULT_ROLES.admin.permissions

  it('returns true for admin with any action on any module', () => {
    expect(hasPermission(adminPerms, 'dashboard', 'delete')).toBe(true)
    expect(hasPermission(adminPerms, 'fakture', 'create')).toBe(true)
    expect(hasPermission(adminPerms, 'crm', 'read')).toBe(true)
  })

  it('returns true for explicit read permission', () => {
    const perms = { dashboard: ['read'] }
    expect(hasPermission(perms, 'dashboard', 'read')).toBe(true)
  })

  it('returns false for action not in permissions', () => {
    const perms = { dashboard: ['read'] }
    expect(hasPermission(perms, 'dashboard', 'write')).toBe(false)
    expect(hasPermission(perms, 'dashboard', 'delete')).toBe(false)
  })

  it('returns false for module not in permissions', () => {
    const perms = { dashboard: ['read'] }
    expect(hasPermission(perms, 'crm', 'read')).toBe(false)
  })

  it('create permission also grants write access', () => {
    const perms = { fakture: ['read', 'create'] }
    expect(hasPermission(perms, 'fakture', 'write')).toBe(true)
  })

  it('delete permission also grants write access', () => {
    const perms = { fakture: ['read', 'delete'] }
    expect(hasPermission(perms, 'fakture', 'write')).toBe(true)
  })

  it('returns false for null/undefined permissions', () => {
    expect(hasPermission(null as any, 'dashboard', 'read')).toBe(false)
    expect(hasPermission(undefined as any, 'dashboard', 'read')).toBe(false)
  })
})

describe('hasAnyPermission', () => {
  it('returns true when module has permissions', () => {
    expect(hasAnyPermission({ dashboard: ['read'] }, 'dashboard')).toBe(true)
  })

  it('returns false when module has no permissions', () => {
    expect(hasAnyPermission({ dashboard: [] }, 'dashboard')).toBe(false)
  })

  it('returns false when module is not in permissions', () => {
    expect(hasAnyPermission({ dashboard: ['read'] }, 'crm')).toBe(false)
  })

  it('returns false for null/undefined permissions', () => {
    expect(hasAnyPermission(null as any, 'dashboard')).toBe(false)
  })
})

describe('getAccessibleModules', () => {
  it('returns all modules that have at least one permission', () => {
    const perms = { dashboard: ['read'], crm: ['read', 'write'] }
    const result = getAccessibleModules(perms)
    expect(result).toContain('dashboard')
    expect(result).toContain('crm')
  })

  it('excludes modules with empty permission arrays', () => {
    const perms = { dashboard: ['read'], crm: [] }
    const result = getAccessibleModules(perms)
    expect(result).toContain('dashboard')
    expect(result).not.toContain('crm')
  })

  it('returns empty array for null permissions', () => {
    expect(getAccessibleModules(null as any)).toEqual([])
  })

  it('returns empty array for empty permissions', () => {
    expect(getAccessibleModules({})).toEqual([])
  })
})
