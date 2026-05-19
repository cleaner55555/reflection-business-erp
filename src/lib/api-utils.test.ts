import { describe, it, expect } from 'vitest'
import {
  apiSuccess,
  apiCreated,
  apiError,
  apiBadRequest,
  apiUnauthorized,
  apiForbidden,
  apiNotFound,
  apiInternalError,
  buildSearchFilter,
  buildOrderBy,
  getRequestAuth,
} from './api-utils'

// Helper to parse JSON responses
async function parseJson(response: Response) {
  return response.json()
}

describe('apiSuccess', () => {
  it('returns 200 with success: true and data', async () => {
    const res = apiSuccess({ items: [1, 2, 3] })
    expect(res.status).toBe(200)
    const body = await parseJson(res)
    expect(body.success).toBe(true)
    expect(body.data).toEqual({ items: [1, 2, 3] })
  })

  it('includes meta when provided', async () => {
    const res = apiSuccess([], { total: 0, page: 1, limit: 50 })
    const body = await parseJson(res)
    expect(body.meta).toEqual({ total: 0, page: 1, limit: 50 })
  })

  it('omits meta when not provided', async () => {
    const res = apiSuccess('ok')
    const body = await parseJson(res)
    expect(body.meta).toBeUndefined()
  })
})

describe('apiCreated', () => {
  it('returns 201 with success: true', async () => {
    const res = apiCreated({ id: '1' })
    expect(res.status).toBe(201)
    const body = await parseJson(res)
    expect(body.success).toBe(true)
    expect(body.data).toEqual({ id: '1' })
    expect(body.message).toBe('Kreirano uspešno')
  })

  it('uses custom message', async () => {
    const res = apiCreated({ id: '1' }, 'Custom message')
    const body = await parseJson(res)
    expect(body.message).toBe('Custom message')
  })
})

describe('apiError', () => {
  it('returns error with specified status', async () => {
    const res = apiError('Something failed', 500)
    expect(res.status).toBe(500)
    const body = await parseJson(res)
    expect(body.success).toBe(false)
    expect(body.error).toBe('Something failed')
  })

  it('defaults to 400 status', async () => {
    const res = apiError('Bad request')
    expect(res.status).toBe(400)
  })

  it('includes details when provided', async () => {
    const res = apiError('Validation error', 400, { field: 'email' })
    const body = await parseJson(res)
    expect(body.details).toEqual({ field: 'email' })
  })
})

describe('apiBadRequest', () => {
  it('returns 400 error', async () => {
    const res = apiBadRequest('Invalid data')
    expect(res.status).toBe(400)
    const body = await parseJson(res)
    expect(body.success).toBe(false)
    expect(body.error).toBe('Invalid data')
  })
})

describe('apiUnauthorized', () => {
  it('returns 401 with default message', async () => {
    const res = apiUnauthorized()
    expect(res.status).toBe(401)
    const body = await parseJson(res)
    expect(body.success).toBe(false)
    expect(body.error).toBe('Neautorizovan pristup')
  })

  it('returns 401 with custom message', async () => {
    const res = apiUnauthorized('Custom unauthorized')
    const body = await parseJson(res)
    expect(body.error).toBe('Custom unauthorized')
  })
})

describe('apiForbidden', () => {
  it('returns 403 with default message', async () => {
    const res = apiForbidden()
    expect(res.status).toBe(403)
    const body = await parseJson(res)
    expect(body.error).toBe('Nemate dozvolu')
  })
})

describe('apiNotFound', () => {
  it('returns 404 with default message', async () => {
    const res = apiNotFound()
    expect(res.status).toBe(404)
    const body = await parseJson(res)
    expect(body.error).toBe('Resurs nije pronađen')
  })
})

describe('apiInternalError', () => {
  it('returns 500 with default message', async () => {
    const res = apiInternalError()
    expect(res.status).toBe(500)
    const body = await parseJson(res)
    expect(body.error).toBe('Interna greška servera')
  })
})

describe('buildSearchFilter', () => {
  it('returns empty object for empty search', () => {
    expect(buildSearchFilter('', ['name', 'email'])).toEqual({})
  })

  it('returns OR conditions for non-empty search', () => {
    const result = buildSearchFilter('test', ['name', 'email'])
    expect(result).toHaveProperty('OR')
    expect((result as any).OR).toHaveLength(2)
    expect((result as any).OR[0]).toEqual({ name: { contains: 'test', mode: 'insensitive' } })
    expect((result as any).OR[1]).toEqual({ email: { contains: 'test', mode: 'insensitive' } })
  })

  it('handles single field', () => {
    const result = buildSearchFilter('john', ['name'])
    expect((result as any).OR).toHaveLength(1)
  })
})

describe('buildOrderBy', () => {
  it('builds ascending order', () => {
    expect(buildOrderBy('name', 'asc')).toEqual({ name: 'asc' })
  })

  it('builds descending order', () => {
    expect(buildOrderBy('createdAt', 'desc')).toEqual({ createdAt: 'desc' })
  })
})

describe('getRequestAuth', () => {
  it('extracts auth headers from request', () => {
    const req = new Request('http://localhost', {
      headers: {
        'x-user-id': 'user-1',
        'x-user-email': 'test@test.com',
        'x-is-super-admin': 'true',
        'x-company-id': 'company-1',
      },
    })
    const auth = getRequestAuth(req)
    expect(auth.userId).toBe('user-1')
    expect(auth.userEmail).toBe('test@test.com')
    expect(auth.isSuperAdmin).toBe(true)
    expect(auth.companyId).toBe('company-1')
  })

  it('handles missing headers', () => {
    const req = new Request('http://localhost')
    const auth = getRequestAuth(req)
    expect(auth.userId).toBeUndefined()
    expect(auth.userEmail).toBeUndefined()
    expect(auth.isSuperAdmin).toBe(false)
    expect(auth.companyId).toBeUndefined()
  })

  it('parses isSuperAdmin string correctly', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-is-super-admin': 'false' },
    })
    expect(getRequestAuth(req).isSuperAdmin).toBe(false)
  })
})
