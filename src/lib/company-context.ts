import { db } from '@/lib/db'

// ============ MULTI-TENANT HELPERS ============
// All API routes should use these helpers to ensure data isolation

export interface CompanyContext {
  companyId: string
  companyName: string
}

/**
 * Extract companyId from request headers
 */
export function getCompanyIdFromRequest(req: Request): string | null {
  return req.headers.get('x-company-id')
}

/**
 * Get the default company for the current context.
 * Falls back to the first active company if no ID provided.
 */
export async function resolveCompany(companyId?: string | null): Promise<CompanyContext | null> {
  if (companyId) {
    const company = await db.company.findUnique({ where: { id: companyId } })
    if (company) return { companyId: company.id, companyName: company.name }
  }

  // Fallback to first active company
  const defaultCompany = await db.company.findFirst({ where: { isActive: true } })
  if (defaultCompany) {
    return { companyId: defaultCompany.id, companyName: defaultCompany.name }
  }

  return null
}

/**
 * Create a query filter for company-scoped data
 */
export function companyFilter(companyId: string) {
  return { companyId }
}

/**
 * Helper to add companyId to create data
 */
export function withCompanyId<T extends Record<string, unknown>>(data: T, companyId: string): T & { companyId: string } {
  return { ...data, companyId }
}

// Models that have companyId
export const TENANT_MODELS = [
  'Partner', 'Product', 'Invoice', 'RecurringInvoice', 'PurchaseOrder',
  'DeliveryNote', 'StockMovement', 'PriceList', 'Transaction', 'CashRegister',
  'Contact', 'Deal', 'CrmActivity', 'CalendarEvent', 'Employee', 'Payroll',
  'Attendance', 'Asset', 'Account', 'JournalEntry', 'ProtocolEntry',
  'Course', 'Lesson', 'Vehicle', 'VehicleService', 'VehicleExpense',
  'Project', 'ProjectTask', 'Document', 'RentalVehicle', 'Rental',
  'RestoCategory', 'RestoMenuItem', 'RestoTable', 'RestoOrder', 'RestoOrderItem',
  'EmailList', 'EmailSubscriber', 'EmailCampaign', 'EmailTemplate',
  'IntegrationJob', 'SyncConnector', 'SyncLog', 'Notification',
  'BankAccount', 'BankTransaction', 'AppSetting'
]

// All module permissions
export const MODULE_PERMISSIONS = [
  'dashboard', 'finansije', 'fakture', 'magacin', 'partneri', 'nabavka',
  'crm', 'kalendar', 'zaposleni', 'projekti', 'sredstva', 'dokumenta',
  'knjigovodstvo', 'protokol', 'edukacija', 'vozni-park', 'kafe-restoran',
  'email-marketing', 'rent-a-car', 'izvestaji', 'integracije', 'bank-sync',
  'podesavanja', 'notifications'
] as const

export type ModulePermission = typeof MODULE_PERMISSIONS[number]

// Permission levels
export const PERMISSION_LEVELS = ['read', 'write', 'delete', 'admin'] as const
export type PermissionLevel = typeof PERMISSION_LEVELS[number]

// Default role permissions
export const DEFAULT_ROLES = {
  admin: {
    displayName: 'Administrator',
    description: 'Puni pristup svim modulima',
    permissions: JSON.stringify(
      Object.fromEntries(
        MODULE_PERMISSIONS.map(m => [m, ['read', 'write', 'delete', 'admin']])
      )
    ),
    isDefault: false,
  },
  manager: {
    displayName: 'Menadžer',
    description: 'Čitanje i pisanje za sve module, bez brisanja',
    permissions: JSON.stringify(
      Object.fromEntries(
        MODULE_PERMISSIONS.map(m => [m, ['read', 'write']])
      )
    ),
    isDefault: false,
  },
  accountant: {
    displayName: 'Računovođa',
    description: 'Pristup fakturama, knjigovodstvu, partnerima, banci',
    permissions: JSON.stringify({
      dashboard: ['read'],
      fakture: ['read', 'write'],
      partneri: ['read', 'write'],
      magacin: ['read'],
      knjigovodstvo: ['read', 'write'],
      'bank-sync': ['read', 'write'],
      izvestaji: ['read'],
      podesavanja: ['read'],
    }),
    isDefault: false,
  },
  employee: {
    displayName: 'Zaposleni',
    description: 'Osnovni pristup - samo čitanje',
    permissions: JSON.stringify(
      Object.fromEntries(
        MODULE_PERMISSIONS.map(m => [m, ['read']])
      )
    ),
    isDefault: true,
  },
}
