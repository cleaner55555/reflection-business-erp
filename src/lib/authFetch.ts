// Auth-aware fetch wrapper
// Automatically adds JWT token and company context to all API requests
// Use this instead of raw fetch() for authenticated API calls

type FetchInput = Parameters<typeof fetch>[0]
type FetchInit = Parameters<typeof fetch>[1] & {
  companyId?: string
}

export function authFetch(input: FetchInput, init?: FetchInit): Promise<Response> {
  const headers = new Headers(init?.headers)

  // Add JWT token if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken')
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    // Add company context if not already set
    if (init?.companyId) {
      headers.set('x-company-id', init.companyId)
    } else if (!headers.has('x-company-id')) {
      const companyId = localStorage.getItem('activeCompanyId')
      if (companyId) {
        headers.set('x-company-id', companyId)
      }
    }
  }

  // Ensure content-type for JSON bodies
  if (init?.body && typeof init.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  return fetch(input, {
    ...init,
    headers,
  })
}

// Shorthand methods
export const auth = {
  get: (url: string, init?: FetchInit) => authFetch(url, { ...init, method: 'GET' }),
  post: (url: string, body?: unknown, init?: FetchInit) =>
    authFetch(url, { ...init, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: (url: string, body?: unknown, init?: FetchInit) =>
    authFetch(url, { ...init, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: (url: string, init?: FetchInit) => authFetch(url, { ...init, method: 'DELETE' }),
}
