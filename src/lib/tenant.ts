import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// ============ MULTI-TENANT TENANT ISOLATION HELPERS ============
// Utility functions for API routes to ensure data isolation

/**
 * Extract tenant (company) ID from the x-company-id request header.
 * Returns null if no tenant ID is present.
 */
export function getTenantId(req: Request): string | null {
  return req.headers.get('x-company-id')
}

/**
 * Extract user ID from the x-user-id request header (set by middleware).
 */
export function getUserId(req: Request): string | null {
  return req.headers.get('x-user-id')
}

/**
 * Check if the current user is a super admin.
 */
export function isSuperAdmin(req: Request): boolean {
  return req.headers.get('x-is-super-admin') === 'true'
}

/**
 * Require a tenant ID from the request. Throws a 400 Response if missing.
 */
export function requireTenant(req: Request): string {
  const tenantId = getTenantId(req)
  if (!tenantId) {
    throw new TenantError('Nedostaje x-company-id header', 400)
  }
  return tenantId
}

/**
 * Require a user ID from the request. Throws a 401 Response if missing.
 */
export function requireUserId(req: Request): string {
  const userId = getUserId(req)
  if (!userId) {
    throw new TenantError('Nedostaje autentifikacija', 401)
  }
  return userId
}

/**
 * Custom error class for tenant-related errors.
 */
export class TenantError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number = 400) {
    super(message)
    this.statusCode = statusCode
    this.name = 'TenantError'
  }
}

/**
 * Type for a standard API route handler.
 */
type RouteHandler = (req: Request, context?: { params: Promise<{ id: string }> }) => Promise<Response>

/**
 * Higher-order function that wraps API handlers with tenant isolation.
 * Automatically extracts x-company-id and validates it exists.
 * Passes the tenantId to the handler via the request context.
 */
export function withTenant(handler: RouteHandler): RouteHandler {
  return async (req, context) => {
    try {
      const tenantId = getTenantId(req)
      if (!tenantId) {
        return NextResponse.json(
          { error: 'Nedostaje x-company-id header. Sve API rute zahtevaju identifikaciju kompanije.' },
          { status: 400 }
        )
      }

      // Verify company exists and is active
      const company = await db.company.findUnique({
        where: { id: tenantId },
        select: { id: true, name: true, isActive: true },
      })

      if (!company) {
        return NextResponse.json(
          { error: 'Kompanija nije pronađena' },
          { status: 404 }
        )
      }

      if (!company.isActive) {
        return NextResponse.json(
          { error: 'Kompanija je deaktivirana' },
          { status: 403 }
        )
      }

      return await handler(req, context)
    } catch (error) {
      if (error instanceof TenantError) {
        return NextResponse.json({ error: error.message }, { status: error.statusCode })
      }
      console.error('[Tenant middleware error]', error)
      return NextResponse.json({ error: 'Interna greška servera' }, { status: 500 })
    }
  }
}

/**
 * Check if the current user has permission for a specific module and level.
 * Super admins always have full access.
 *
 * @param req - The request object (with x-user-id, x-is-super-admin headers)
 * @param companyId - The company to check permissions in
 * @param module - The module name (e.g., 'invoices', 'crm')
 * @param level - The permission level ('read', 'write', 'delete', 'admin')
 * @returns true if the user has permission
 */
export async function checkPermission(
  req: Request,
  companyId: string,
  module: string,
  level: string
): Promise<boolean> {
  // Super admins bypass all permission checks
  if (isSuperAdmin(req)) return true

  const userId = getUserId(req)
  if (!userId) return false

  const userCompany = await db.userCompany.findUnique({
    where: { userId_companyId: { userId, companyId } },
    include: { role: true },
  })

  if (!userCompany) return false

  try {
    const permissions = JSON.parse(userCompany.role.permissions) as Record<string, string[]>
    const modulePerms = permissions[module]
    if (!modulePerms) return false

    const levels = ['read', 'write', 'delete', 'admin']
    const requiredIndex = levels.indexOf(level)
    if (requiredIndex === -1) return false

    return modulePerms.some((p: string) => levels.indexOf(p) >= requiredIndex)
  } catch {
    return false
  }
}

/**
 * Returns a Prisma where clause for tenant filtering.
 * Use this in all database queries to ensure data isolation.
 *
 * @example
 * const data = await db.invoice.findMany({
 *   where: tenantFilter(companyId),
 * })
 */
export function tenantFilter(companyId: string): { companyId: string } {
  return { companyId }
}

/**
 * Wrapper that catches TenantError and other errors in route handlers,
 * providing consistent error responses.
 */
export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (req, context) => {
    try {
      return await handler(req, context)
    } catch (error) {
      if (error instanceof TenantError) {
        return NextResponse.json({ error: error.message }, { status: error.statusCode })
      }
      if (error instanceof NextResponse) {
        return error
      }
      console.error('[API Error]', error)
      return NextResponse.json({ error: 'Interna greška servera' }, { status: 500 })
    }
  }
}
