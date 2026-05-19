// ─── Global API Utilities ────────────────────────────────────────────────────
// Centralized error handling, response helpers, and pagination for all API routes

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// ─── Typed API Response Helpers ────────────────────────────────────────────

export function apiSuccess<T>(data: T, meta?: { total?: number; page?: number; limit?: number; message?: string }) {
  return NextResponse.json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
  })
}

export function apiCreated<T>(data: T, message = 'Kreirano uspešno') {
  return NextResponse.json({ success: true, data, message }, { status: 201 })
}

export function apiError(message: string, status: number = 400, details?: Record<string, unknown>) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details ? { details } : {}),
    },
    { status }
  )
}

export function apiBadRequest(message: string, details?: Record<string, unknown>) {
  return apiError(message, 400, details)
}

export function apiUnauthorized(message = 'Neautorizovan pristup') {
  return apiError(message, 401)
}

export function apiForbidden(message = 'Nemate dozvolu') {
  return apiError(message, 403)
}

export function apiNotFound(message = 'Resurs nije pronađen') {
  return apiError(message, 404)
}

export function apiTooManyRequests(message = 'Previše zahteva', retryAfter?: number) {
  return NextResponse.json(
    { success: false, error: message },
    {
      status: 429,
      headers: retryAfter ? { 'Retry-After': String(retryAfter) } : {},
    }
  )
}

export function apiInternalError(message = 'Interna greška servera') {
  return apiError(message, 500)
}

// ─── Pagination Helper ─────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export function parsePagination(request: NextRequest): Required<PaginationParams> {
  const { searchParams } = new URL(request.url)
  return {
    page: Math.max(1, parseInt(searchParams.get('page') || '1')),
    limit: Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50'))),
    search: searchParams.get('search') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
  }
}

export function paginationResponse<T>(data: T[], total: number, page: number, limit: number) {
  return NextResponse.json({
    success: true,
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  })
}

// ─── Request Body Parser with Validation ───────────────────────────────────

export async function parseBody<T>(request: Request, schema: z.ZodType<T>): Promise<
  { success: true; data: T; body: unknown } | { success: false; response: Response; body: unknown }
> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return {
      success: false,
      response: apiBadRequest('Neispravan JSON format u telu zahteva'),
      body: undefined,
    }
  }

  const result = schema.safeParse(body)
  if (!result.success) {
    const flattened = result.error.flatten()
    const fieldErrors: Record<string, string[]> = (flattened.fieldErrors || {}) as Record<string, string[]>
    const messages: string[] = []

    for (const [field, errors] of Object.entries(fieldErrors)) {
      if (errors && errors.length > 0) {
        messages.push(`${field}: ${errors[0]}`)
      }
    }

    return {
      success: false,
      response: apiBadRequest(
        messages.length > 0 ? messages.join('; ') : 'Neispravni podaci',
        { fieldErrors }
      ),
      body,
    }
  }

  return { success: true, data: result.data, body }
}

// ─── Global API Route Wrapper ──────────────────────────────────────────────
// Wraps any async handler with standardized error handling

type ApiHandler = (req: NextRequest, ctx?: { params?: Record<string, string> }) => Promise<Response>

interface WrappedHandlerOptions {
  requireAuth?: boolean
  validateBody?: z.ZodType<any>
  rateLimit?: { key: (req: NextRequest) => string; limit: number; windowMs: number }
}

export function withHandler(handler: ApiHandler, options: WrappedHandlerOptions = {}): ApiHandler {
  return async (req, ctx) => {
    const startTime = Date.now()

    try {
      // Auth check (soft - relies on middleware setting x-auth-verified)
      if (options.requireAuth) {
        const verified = req.headers.get('x-auth-verified')
        if (verified !== 'true') {
          return apiUnauthorized()
        }
      }

      // Body validation
      if (options.validateBody && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const result = await parseBody(req, options.validateBody)
        if (!result.success) return (result as { success: false; response: Response }).response
      }

      const response = await handler(req, ctx)

      // Add timing header
      const responseHeaders = new Headers(response.headers)
      responseHeaders.set('X-Response-Time', `${Date.now() - startTime}ms`)

      // Clone response with timing
      const body = await response.text()
      return new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      })
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`[API Error] ${req.method} ${req.url} - ${duration}ms`, error)

      // Prisma not found
      if (error && typeof error === 'object' && 'code' in error) {
        const prismaError = error as { code: string }
        if (prismaError.code === 'P2025') return apiNotFound()
        if (prismaError.code === 'P2002') {
          return apiBadRequest('Već postoji zapis sa ovim jedinstvenim podacima')
        }
        if (prismaError.code === 'P2003') {
          return apiBadRequest('Ne možete obrisati zapis koji je povezan sa drugim zapisima')
        }
      }

      return apiInternalError()
    }
  }
}

// ─── Company/User extraction from request headers ─────────────────────────

export function getRequestAuth(req: Request) {
  return {
    userId: req.headers.get('x-user-id') || undefined,
    userEmail: req.headers.get('x-user-email') || undefined,
    isSuperAdmin: req.headers.get('x-is-super-admin') === 'true',
    companyId: req.headers.get('x-company-id') || undefined,
  }
}

// ─── Search query builder for Prisma ───────────────────────────────────────

export function buildSearchFilter(search: string, fields: string[]): Record<string, unknown> {
  if (!search) return {}
  const orConditions = fields.map(field => ({
    [field]: { contains: search, mode: 'insensitive' as const },
  }))
  return { OR: orConditions }
}

export function buildOrderBy(sortBy: string, sortOrder: 'asc' | 'desc'): Record<string, unknown> {
  return { [sortBy]: sortOrder }
}
