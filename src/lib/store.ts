import { create } from 'zustand'

export type ModuleType =
  | 'dashboard'
  | 'finansije'
  | 'fakture'
  | 'magacin'
  | 'partneri'
  | 'nabavka'
  | 'crm'
  | 'kalendar'
  | 'zaposleni'
  | 'projekti'
  | 'sredstva'
  | 'dokumenta'
  | 'izvestaji'
  | 'knjigovodstvo'
  | 'protokol'
  | 'edukacija'
  | 'vozni-park'
  | 'kafe-restoran'
  | 'podesavanja'
  | 'email-marketing'
  | 'rent-a-car'
  | 'integracije'
  | 'bank-sync'
  | 'notifications'

export interface UserInfo {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  phone?: string
  isActive: boolean
  isSuperAdmin: boolean
  lastLoginAt?: string
}

export interface CompanyInfo {
  companyId: string
  companyName: string
  roleId: string
  roleName: string
  roleDisplayName: string
  isDefault: boolean
  jobTitle?: string
}

interface AppState {
  // Module navigation
  activeModule: ModuleType
  setActiveModule: (module: ModuleType) => void

  // Multi-tenant
  activeCompanyId: string | null
  activeCompanyName: string | null
  setActiveCompany: (companyId: string, companyName: string) => void

  // Auth
  currentUser: UserInfo | null
  userCompanies: CompanyInfo[]
  permissions: Record<string, string[]>
  login: (user: UserInfo, companies: CompanyInfo[]) => void
  logout: () => void
  hasPermission: (module: string, level: string) => boolean
}

export const useAppStore = create<AppState>((set, get) => ({
  // Module navigation
  activeModule: 'dashboard',
  setActiveModule: (module) => set({ activeModule: module }),

  // Multi-tenant - load from localStorage on init
  activeCompanyId: typeof window !== 'undefined' ? localStorage.getItem('activeCompanyId') : null,
  activeCompanyName: typeof window !== 'undefined' ? localStorage.getItem('activeCompanyName') : null,
  setActiveCompany: (companyId, companyName) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeCompanyId', companyId)
      localStorage.setItem('activeCompanyName', companyName)
    }
    set({ activeCompanyId: companyId, activeCompanyName: companyName })
  },

  // Auth - load from localStorage on init
  currentUser: (() => {
    if (typeof window === 'undefined') return null
    try {
      const stored = localStorage.getItem('currentUser')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })(),
  userCompanies: (() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem('userCompanies')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })(),
  permissions: (() => {
    if (typeof window === 'undefined') return {}
    try {
      const stored = localStorage.getItem('userPermissions')
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  })(),

  login: (user, companies) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(user))
      localStorage.setItem('userCompanies', JSON.stringify(companies))
    }

    // Set active company from default or first
    const defaultCompany = companies.find(c => c.isDefault) || companies[0]
    const companyId = defaultCompany?.companyId || null
    const companyName = defaultCompany?.companyName || null

    if (companyId && companyName) {
      get().setActiveCompany(companyId, companyName)
    }

    // Parse permissions from role
    // For now, admin gets everything
    const permissions: Record<string, string[]> = {}
    if (user.isSuperAdmin) {
      const modules = [
        'dashboard', 'finansije', 'fakture', 'magacin', 'partneri', 'nabavka',
        'crm', 'kalendar', 'zaposleni', 'projekti', 'sredstva', 'dokumenta',
        'knjigovodstvo', 'protokol', 'edukacija', 'vozni-park', 'kafe-restoran',
        'email-marketing', 'rent-a-car', 'izvestaji', 'integracije', 'bank-sync',
        'podesavanja', 'notifications'
      ]
      modules.forEach(m => { permissions[m] = ['read', 'write', 'delete', 'admin'] })
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('userPermissions', JSON.stringify(permissions))
    }

    set({ currentUser: user, userCompanies: companies, permissions })
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser')
      localStorage.removeItem('userCompanies')
      localStorage.removeItem('userPermissions')
      // Keep company selection
    }
    set({
      currentUser: null,
      userCompanies: [],
      permissions: {},
      activeModule: 'dashboard',
    })
  },

  hasPermission: (module: string, level: string) => {
    const { permissions, currentUser } = get()
    if (currentUser?.isSuperAdmin) return true
    const modulePerms = permissions[module]
    if (!modulePerms) return false
    const levels = ['read', 'write', 'delete', 'admin']
    const requiredIndex = levels.indexOf(level)
    return modulePerms.some(p => levels.indexOf(p) >= requiredIndex)
  },
}))
