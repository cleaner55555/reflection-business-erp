import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { hashPassword } from '@/lib/seed'
import { signToken } from '@/lib/jwt'
import { registerSchema, validateRequest } from '@/lib/validations'

// POST /api/auth/register - Register new user
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validation = validateRequest(registerSchema, body)
    if (!validation.success) return validation.response

    const { email, password, firstName, lastName, phone } = validation.data

    // Check if user exists
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Korisnik sa ovim email-om već postoji' }, { status: 409 })
    }

    // Create user
    const passwordHash = await hashPassword(password)
    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone: phone || null,
        isActive: true,
      },
    })

    // Get default role
    const defaultRole = await db.role.findFirst({ where: { isDefault: true } })

    // Get first company (or create a personal one)
    let company = await db.company.findFirst({ where: { isActive: true } })
    if (!company) {
      company = await db.company.create({
        data: {
          name: `${firstName} ${lastName} - Firma`,
          plan: 'free',
          isActive: true,
        },
      })
    }

    // Link user to company
    if (defaultRole) {
      await db.userCompany.create({
        data: {
          userId: user.id,
          companyId: company.id,
          roleId: defaultRole.id,
          isDefault: true,
        },
      })
    }

    const { passwordHash: _, ...safeUser } = user

    // Generate JWT token
    const token = await signToken({
      userId: user.id,
      email: user.email,
      isSuperAdmin: user.isSuperAdmin,
    })

    return NextResponse.json({
      user: safeUser,
      company: { companyId: company.id, companyName: company.name },
      token,
    }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Greška pri registraciji' }, { status: 500 })
  }
}
