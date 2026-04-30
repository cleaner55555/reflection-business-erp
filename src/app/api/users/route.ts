import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { hashPassword } from '@/lib/seed'
import { getCompanyIdFromRequest } from '@/lib/company-context'

// GET /api/users - List users for a company
export async function GET(req: Request) {
  try {
    const companyId = getCompanyIdFromRequest(req)

    if (!companyId) {
      return NextResponse.json({ error: 'Kompanija nije određena' }, { status: 400 })
    }

    const users = await db.userCompany.findMany({
      where: { companyId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            phone: true,
            isActive: true,
            lastLoginAt: true,
            isSuperAdmin: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(users.map(uc => ({
      ...uc.user,
      companyId: uc.companyId,
      roleId: uc.role.id,
      roleName: uc.role.displayName,
      jobTitle: uc.jobTitle,
      joinedAt: uc.createdAt,
    })))
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Greška pri učitavanju korisnika' }, { status: 500 })
  }
}

// POST /api/users - Invite/add user to company
export async function POST(req: Request) {
  try {
    const companyId = getCompanyIdFromRequest(req)
    if (!companyId) {
      return NextResponse.json({ error: 'Kompanija nije određena' }, { status: 400 })
    }

    const body = await req.json()
    const { email, firstName, lastName, password, phone, roleId, jobTitle } = body

    if (!email || !firstName || !lastName) {
      return NextResponse.json({ error: 'Email, ime i prezime su obavezni' }, { status: 400 })
    }

    // Check if user exists
    let user = await db.user.findUnique({ where: { email } })

    if (!user) {
      // Create new user
      const passwordHash = await hashPassword(password || 'changeme123')
      user = await db.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          phone: phone || null,
          isActive: true,
        },
      })
    }

    // Check if user is already in this company
    const existingLink = await db.userCompany.findUnique({
      where: { userId_companyId: { userId: user.id, companyId } },
    })

    if (existingLink) {
      return NextResponse.json({ error: 'Korisnik je već član ove kompanije' }, { status: 409 })
    }

    // Get role
    const role = roleId
      ? await db.role.findUnique({ where: { id: roleId } })
      : await db.role.findFirst({ where: { isDefault: true } })

    if (!role) {
      return NextResponse.json({ error: 'Uloga nije pronađena' }, { status: 400 })
    }

    // Link user to company
    const userCompany = await db.userCompany.create({
      data: {
        userId: user.id,
        companyId,
        roleId: role.id,
        jobTitle: jobTitle || null,
      },
    })

    const { passwordHash: _, ...safeUser } = user

    return NextResponse.json({
      ...safeUser,
      roleName: role.displayName,
      jobTitle,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Greška pri dodavanju korisnika' }, { status: 500 })
  }
}

// PUT /api/users - Update user role/status
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { userId, companyId, roleId, jobTitle, isActive } = body

    if (!userId || !companyId) {
      return NextResponse.json({ error: 'ID korisnika i kompanije su obavezni' }, { status: 400 })
    }

    const data: Record<string, unknown> = {}
    if (roleId) data.roleId = roleId
    if (jobTitle !== undefined) data.jobTitle = jobTitle

    const userCompany = await db.userCompany.update({
      where: { userId_companyId: { userId, companyId } },
      data,
    })

    if (isActive !== undefined) {
      await db.user.update({
        where: { id: userId },
        data: { isActive },
      })
    }

    return NextResponse.json(userCompany)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Greška pri ažuriranju korisnika' }, { status: 500 })
  }
}

// DELETE /api/users - Remove user from company
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const companyId = searchParams.get('companyId')

    if (!userId || !companyId) {
      return NextResponse.json({ error: 'ID korisnika i kompanije su obavezni' }, { status: 400 })
    }

    await db.userCompany.delete({
      where: { userId_companyId: { userId, companyId } },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing user:', error)
    return NextResponse.json({ error: 'Greška pri uklanjanju korisnika' }, { status: 500 })
  }
}
