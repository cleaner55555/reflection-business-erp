import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { hashPassword, verifyPassword } from '@/lib/seed'

// POST /api/auth/login
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email i lozinka su obavezni' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { email },
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
      return NextResponse.json({ error: 'Pogrešan email ili lozinka' }, { status: 401 })
    }

    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) {
      return NextResponse.json({ error: 'Pogrešan email ili lozinka' }, { status: 401 })
    }

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // Return user data (without password hash)
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
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Greška pri prijavi' }, { status: 500 })
  }
}
