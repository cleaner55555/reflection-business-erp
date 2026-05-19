import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { hashPassword } from '@/lib/seed'
import { signToken } from '@/lib/jwt'
import { registerSchema, validateRequest } from '@/lib/validations'
import { registerLimiter, getClientIp } from '@/lib/rate-limit'
import { validatePassword } from '@/lib/password-policy'

// POST /api/auth/register
export async function POST(req: Request) {
  try {
    // Rate limiting
    const ip = getClientIp(req)
    const rl = registerLimiter(`register:${ip}`)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Previše pokušaja registracije. Pokušajte ponovo kasnije.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      )
    }

    const body = await req.json()

    // Password policy check
    const pwCheck = validatePassword(body.password || '')
    if (!pwCheck.valid) {
      return NextResponse.json(
        { error: pwCheck.errors.join('; '), details: { password: pwCheck.errors } },
        { status: 400 }
      )
    }

    const validation = validateRequest(registerSchema, body)
    if (!validation.success) return validation.response

    const { email, password, firstName, lastName, phone } = validation.data

    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Korisnik sa ovim email-om već postoji' }, { status: 409 })
    }

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

    const defaultRole = await db.role.findFirst({ where: { isDefault: true } })

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
