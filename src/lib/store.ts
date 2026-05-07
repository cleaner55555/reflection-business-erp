import { create } from 'zustand'

export type ModuleType =
  | 'dashboard'
  | 'finance'
  | 'invoices'
  | 'inventory'
  | 'contacts'
  | 'procurement'
  | 'crm'
  | 'calendar'
  | 'employees'
  | 'projects'
  | 'assets'
  | 'documents'
  | 'reports'
  | 'accounting'
  | 'protocol'
  | 'education'
  | 'fleet'
  | 'restaurant'
  | 'settings'
  | 'email-marketing'
  | 'rent-a-car'
  | 'integrations'
  | 'bank-sync'
  | 'notifications'
  | 'laws'
  | 'pos'
  | 'shipping'
  | 'marketplace'
  | 'offers'
  | 'subscriptions'
  | 'expenses'
  | 'signatures'
  | 'manufacturing'
  | 'quality'
  | 'maintenance'
  | 'recruitment'
  | 'leave'
  | 'referrals'
  | 'support'
  | 'field-service'
  | 'appointments'
  | 'scheduler'
  | 'social-media'
  | 'sms-marketing'
  | 'events'
  | 'marketing-automation'
  | 'surveys'
  | 'chat'
  | 'knowledge-base'
  | 'website'
  | 'blog'
  | 'voip'
  | 'iot'
  | 'messaging'
  | 'forum'
  | 'plm'
  | 'ecommerce'
  | 'spreadsheet'
  | 'notes'
  | 'approvals'
  | 'skills'
  | 'contracts'
  | 'ratings'
  | 'gamification'
  | 'complaints'
  | 'tenders'
  | 'warranty'
  | 'service-center'
  | 'compliance'
  | 'loyalty'
  | 'workforce-planner'
  | 'visitors'
  | 'suggestions'
  | 'valuation'
  | 'health-fund'
  | 'geolocation'
  | 'cameras'
  | 'procurement-manager'
  | 'cms'
  // --- Education (6) ---
  | 'homework'
  | 'enrollment'
  | 'timetable'
  | 'library'
  | 'classroom'
  | 'tuition'
  // --- Healthcare (4) ---
  | 'patients'
  | 'medical-records'
  | 'prescriptions'
  | 'lab'
  // --- Hospitality (5) ---
  | 'reservations'
  | 'menu'
  | 'kitchen'
  | 'orders'
  | 'delivery'
  // --- Construction (5) ---
  | 'construction-site'
  | 'blueprints'
  | 'subcontractors'
  | 'measurements'
  | 'safety'
  // --- Logistics (5) ---
  | 'routes'
  | 'loading-dock'
  | 'customs-docs'
  | 'trucks'
  | 'packaging'
  // --- Real Estate (4) ---
  | 'property'
  | 'rentals'
  | 'property-viewings'
  | 'utilities'
  // --- Production+ (3) ---
  | 'work-orders'
  | 'standards'
  | 'labels'
  // --- Retail (8) ---
  | 'barcode'
  | 'price-lists'
  | 'coupons'
  | 'reviews'
  | 'seo'
  | 'payments'
  | 'returns'
  | 'cash-register'
  // --- Services (6) ---
  | 'time-tracking'
  | 'time-billing'
  | 'client-portal'
  | 'automation'
  | 'stores'
  | 'backup'

import { type IndustryId } from './industrySets'

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

  // Industry set
  industrySet: IndustryId | null
  setIndustrySet: (industry: IndustryId) => void

  // Enabled modules (empty = all enabled)
  enabledModules: string[] | null
  setEnabledModules: (modules: string[]) => void
  isModuleEnabled: (module: string) => boolean
  isSetupComplete: boolean
  setSetupComplete: (complete: boolean) => void

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

  // Industry set
  industrySet: (() => {
    if (typeof window === 'undefined') return null
    return (localStorage.getItem('industrySet') as IndustryId) || null
  })(),
  setIndustrySet: (industry) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('industrySet', industry)
    }
    set({ industrySet: industry })
  },

  // Enabled modules
  enabledModules: (() => {
    if (typeof window === 'undefined') return null
    try {
      const stored = localStorage.getItem('enabledModules')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })(),
  setEnabledModules: (modules) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('enabledModules', JSON.stringify(modules))
    }
    set({ enabledModules: modules, setupComplete: true })
  },
  isModuleEnabled: (module) => {
    const enabled = get().enabledModules
    if (!enabled || enabled.length === 0) return true // all enabled
    return enabled.includes(module)
  },
  isSetupComplete: (() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('setupComplete') === 'true'
  })(),
  setSetupComplete: (complete) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('setupComplete', String(complete))
    }
    set({ setupComplete: complete })
  },

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
        'dashboard', 'finance', 'invoices', 'inventory', 'contacts', 'procurement',
        'crm', 'calendar', 'employees', 'projects', 'assets', 'documents',
        'accounting', 'protocol', 'education', 'fleet', 'restaurant',
        'email-marketing', 'rent-a-car', 'reports', 'integrations', 'bank-sync',
        'settings', 'notifications', 'laws', 'pos', 'shipping',
        'marketplace', 'offers', 'subscriptions', 'expenses', 'signatures',
        'manufacturing', 'quality', 'maintenance', 'recruitment', 'leave',
        'referrals', 'support', 'field-service', 'appointments', 'scheduler',
        'social-media', 'sms-marketing', 'events', 'marketing-automation',
        'surveys', 'chat', 'knowledge-base', 'website', 'blog', 'voip',
        'iot', 'messaging', 'forum', 'plm', 'ecommerce', 'spreadsheet',
        'notes', 'approvals', 'skills', 'contracts', 'ratings', 'gamification', 'complaints', 'tenders', 'warranty', 'service-center', 'compliance', 'loyalty', 'workforce-planner', 'visitors', 'suggestions', 'valuation', 'health-fund', 'geolocation', 'cameras', 'procurement-manager', 'cms',
        'homework', 'enrollment', 'timetable', 'library', 'classroom', 'tuition',
        'patients', 'medical-records', 'prescriptions', 'lab',
        'reservations', 'menu', 'kitchen', 'orders', 'delivery',
        'construction-site', 'blueprints', 'subcontractors', 'measurements', 'safety',
        'routes', 'loading-dock', 'customs-docs', 'trucks', 'packaging',
        'property', 'rentals', 'property-viewings', 'utilities',
        'work-orders', 'standards', 'labels',
        'barcode', 'price-lists', 'coupons', 'reviews', 'seo', 'payments', 'returns', 'cash-register',
        'time-tracking', 'time-billing', 'client-portal', 'automation', 'stores', 'backup'
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
