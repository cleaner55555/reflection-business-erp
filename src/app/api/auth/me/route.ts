import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'

// GET /api/auth/me - Verify JWT and return current user info
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Autorizacija je obavezna' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    let payload
    try {
      payload = await verifyToken(token)
    } catch {
      return NextResponse.json({ error: 'Token je istekao ili nije važeći' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      include: {
        companyRoles: {
          include: {
            company: true,
            role: true,
          },
        },
      },
    })

    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'Korisnik nije pronađen' }, { status: 401 })
    }

    const { passwordHash, ...safeUser } = user

    return NextResponse.json({
      user: safeUser,
      companies: user.companyRoles.map(uc => ({
        companyId: uc.company.id,
        companyName: uc.company.name,
        roleId: uc.role.id,
        roleName: uc.role.name,
        roleDisplayName: uc.role.displayName,
        isDefault: uc.isDefault,
        jobTitle: uc.jobTitle,
      })),
    })
  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json({ error: 'Greška pri verifikaciji' }, { status: 500 })
  }
}
