import { db } from '@/lib/db'

// ─── Module permissions map ───────────────────────────────────────────────────

export const MODULES = [
  'dashboard', 'finansije', 'fakture', 'magacin', 'partneri', 'nabavka',
  'crm', 'kalendar', 'zaposleni', 'projekti', 'sredstva', 'dokumenta',
  'knjigovodstvo', 'protokol', 'edukacija', 'vozni-park', 'kafe-restoran',
  'email-marketing', 'rent-a-car', 'izvestaji', 'podesavanja', 'integracije',
  'bank-sync', 'zakoni',
] as const

export type ModuleName = (typeof MODULES)[number]

export const ACTIONS = ['read', 'create', 'write', 'delete'] as const
export type PermissionAction = (typeof ACTIONS)[number]

export interface Permissions {
  [module: string]: PermissionAction[]
}

// ─── Default role permissions (Odoo-style) ──────────────────────────────────

export const DEFAULT_ROLES: Record<string, { displayName: string; description: string; permissions: Permissions }> = {
  admin: {
    displayName: 'Administrator',
    description: 'Pun pristup svim modulima',
    permissions: Object.fromEntries(MODULES.map(m => [m, ['read', 'create', 'write', 'delete']])),
  },
  knjigovođa: {
    displayName: 'Knjigovođa',
    description: 'Pristup knjigovodstvu, fakturama, izveštajima',
    permissions: {
      dashboard: ['read'],
      fakture: ['read', 'create', 'write'],
      knjigovodstvo: ['read', 'create', 'write'],
      finansije: ['read'],
      partneri: ['read', 'create', 'write'],
      izvestaji: ['read'],
      bankSync: ['read', 'write'],
      dokumenta: ['read', 'create', 'write'],
      sredstva: ['read', 'write'],
      podesavanja: ['read'],
    },
  },
  prodavac: {
    displayName: 'Prodavac',
    description: 'Pristup CRM-u, fakturama, kalendaru',
    permissions: {
      dashboard: ['read'],
      crm: ['read', 'create', 'write'],
      fakture: ['read', 'create', 'write'],
      partneri: ['read', 'create', 'write'],
      kalendar: ['read', 'create', 'write'],
      izvestaji: ['read'],
    },
  },
  magacioner: {
    displayName: 'Magacioner',
    description: 'Pristup magacinu i otpremnicama',
    permissions: {
      dashboard: ['read'],
      magacin: ['read', 'create', 'write'],
      nabavka: ['read', 'create', 'write'],
      partneri: ['read'],
      dokumenta: ['read'],
    },
  },
  hr: {
    displayName: 'HR',
    description: 'Pristup zaposlenima, platama, prisustvu',
    permissions: {
      dashboard: ['read'],
      zaposleni: ['read', 'create', 'write'],
      projekti: ['read'],
      kalendar: ['read'],
    },
  },
  read_only: {
    displayName: 'Samo čitanje',
    description: 'Pristup čitanju svih modula',
    permissions: Object.fromEntries(MODULES.map(m => [m, ['read']])),
  },
}

// ─── Permission checking ────────────────────────────────────────────────────

export function hasPermission(userPermissions: Permissions, module: string, action: PermissionAction): boolean {
  if (!userPermissions) return false
  const modulePerms = userPermissions[module] || []
  if (modulePerms.includes('delete') && action === 'write') return true
  if (modulePerms.includes('create') && action === 'write') return true
  return modulePerms.includes(action)
}

export function hasAnyPermission(userPermissions: Permissions, module: string): boolean {
  if (!userPermissions) return false
  return (userPermissions[module] || []).length > 0
}

export function getAccessibleModules(userPermissions: Permissions): string[] {
  if (!userPermissions) return []
  return Object.entries(userPermissions).filter(([, perms]) => perms.length > 0).map(([mod]) => mod)
}

// ─── Server-side RBAC helpers ───────────────────────────────────────────────

export async function getUserRole(userId: string, companyId: string) {
  const uc = await db.userCompany.findFirst({
    where: { userId, companyId },
    include: { role: true },
  })
  if (!uc) return null
  return {
    roleId: uc.roleId,
    roleName: uc.role.name,
    displayName: uc.role.displayName,
    permissions: JSON.parse(uc.role.permissions) as Permissions,
    jobTitle: uc.jobTitle,
    isDefault: uc.isDefault,
  }
}

export async function checkPermission(
  userId: string,
  companyId: string,
  module: string,
  action: PermissionAction
): Promise<boolean> {
  const role = await getUserRole(userId, companyId)
  if (!role) return false
  return hasPermission(role.permissions, module, action)
}

// ─── Seed default roles ─────────────────────────────────────────────────────

export async function seedDefaultRoles(companyId: string) {
  const existing = await db.role.count()
  if (existing > 0) return // already seeded

  for (const [name, data] of Object.entries(DEFAULT_ROLES)) {
    await db.role.create({
      data: {
        name,
        displayName: data.displayName,
        description: data.description,
        permissions: JSON.stringify(data.permissions),
        isDefault: name === 'read_only',
      },
    })
  }
}
