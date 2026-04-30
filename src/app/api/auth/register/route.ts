import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { hashPassword } from '@/lib/seed'

// POST /api/auth/register - Register new user
export async function POST(req: Request) {
  try {
    const { email, password, firstName, lastName, phone } = await req.json()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, lozinka, ime i prezime su obavezni' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Lozinka mora imati najmanje 6 karaktera' },
        { status: 400 }
      )
    }

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

    return NextResponse.json({
      user: safeUser,
      company: { companyId: company.id, companyName: company.name },
    }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Greška pri registraciji' }, { status: 500 })
  }
}
