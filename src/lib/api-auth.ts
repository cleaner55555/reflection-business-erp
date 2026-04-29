import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

/**
 * Middleware for API key authentication
 * Use this to protect public API v1 endpoints
 */
export async function authenticateApiKey(req: Request): Promise<{ success: true; companyId: string; userId: string } | { success: false; error: string }> {
  const authHeader = req.headers.get('authorization')
  const queryKey = new URL(req.url).searchParams.get('api_key')

  let apiKey = ''

  if (authHeader?.startsWith('Bearer ')) {
    apiKey = authHeader.substring(7)
  } else if (queryKey) {
    apiKey = queryKey
  }

  if (!apiKey) {
    return { success: false, error: 'API ključ je obavezan. Pošaljite Authorization: Bearer <key> ili ?api_key=<key>' }
  }

  const key = await db.apiKey.findUnique({
    where: { key: apiKey },
    include: { company: true },
  })

  if (!key) {
    return { success: false, error: 'Nevažeći API ključ' }
  }

  if (!key.isActive) {
    return { success: false, error: 'API ključ je deaktiviran' }
  }

  if (key.expiresAt && key.expiresAt < new Date()) {
    return { success: false, error: 'API ključ je istekao' }
  }

  // Update last used
  await db.apiKey.update({
    where: { id: key.id },
    data: { lastUsedAt: new Date() },
  })

  return { success: true, companyId: key.companyId, userId: key.userId }
}
