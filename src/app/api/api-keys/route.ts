import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { getCompanyIdFromRequest } from '@/lib/company-context'
import { randomUUID } from 'crypto'

// GET /api/api-keys - List API keys for company
export async function GET(req: Request) {
  try {
    const companyId = getCompanyIdFromRequest(req)
    if (!companyId) {
      return NextResponse.json({ error: 'Kompanija nije određena' }, { status: 400 })
    }

    const keys = await db.apiKey.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        key: true,
        permissions: true,
        lastUsedAt: true,
        expiresAt: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Mask API keys for security (show first 8 chars)
    const maskedKeys = keys.map(k => ({
      ...k,
      key: k.key ? `${k.key.substring(0, 8)}...${k.key.substring(k.key.length - 4)}` : k.key,
    }))

    return NextResponse.json(maskedKeys)
  } catch (error) {
    console.error('Error fetching API keys:', error)
    return NextResponse.json({ error: 'Greška pri učitavanju API ključeva' }, { status: 500 })
  }
}

// POST /api/api-keys - Create new API key
export async function POST(req: Request) {
  try {
    const companyId = getCompanyIdFromRequest(req)
    if (!companyId) {
      return NextResponse.json({ error: 'Kompanija nije određena' }, { status: 400 })
    }

    const body = await req.json()
    const { name, userId, permissions, expiresAt } = body

    if (!name || !userId) {
      return NextResponse.json({ error: 'Naziv i korisnik su obavezni' }, { status: 400 })
    }

    // Generate unique API key
    const apiKey = `rb_${randomUUID().replace(/-/g, '')}`

    const key = await db.apiKey.create({
      data: {
        name,
        key: apiKey,
        companyId,
        userId,
        permissions: JSON.stringify(permissions || ['read']),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true,
      },
    })

    // Return the FULL key only on creation (user won't see it again)
    return NextResponse.json({
      ...key,
      key: apiKey, // Full key - show once!
      warning: 'Sačuvajte ovaj ključ! Nećete moći da ga vidite ponovo.',
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating API key:', error)
    return NextResponse.json({ error: 'Greška pri kreiranju API ključa' }, { status: 500 })
  }
}

// DELETE /api/api-keys - Revoke API key
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const keyId = searchParams.get('id')

    if (!keyId) {
      return NextResponse.json({ error: 'ID ključa je obavezan' }, { status: 400 })
    }

    await db.apiKey.delete({ where: { id: keyId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error revoking API key:', error)
    return NextResponse.json({ error: 'Greška pri brisanju API ključa' }, { status: 500 })
  }
}
