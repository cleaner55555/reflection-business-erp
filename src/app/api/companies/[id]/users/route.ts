import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/seed'
import { withErrorHandler, requireTenant, checkPermission, TenantError } from '@/lib/tenant'

// GET /api/companies/[id]/users - List users in company with their roles
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async (req) => {
    const { id } = await params

    const company = await db.company.findUnique({
      where: { id },
      select: { id: true, name: true, maxUsers: true },
    })

    if (!company) {
      return NextResponse.json({ error: 'Kompanija nije pronađena' }, { status: 404 })
    }

    const userCompanies = await db.userCompany.findMany({
      where: { companyId: id },
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
            isSuperAdmin: true,
            lastLoginAt: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            displayName: true,
            permissions: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    const users = userCompanies.map(uc => ({
      id: uc.id,
      userId: uc.user.id,
      email: uc.user.email,
      firstName: uc.user.firstName,
      lastName: uc.user.lastName,
      fullName: `${uc.user.firstName} ${uc.user.lastName}`,
      avatar: uc.user.avatar,
      phone: uc.user.phone,
      isActive: uc.user.isActive,
      isSuperAdmin: uc.user.isSuperAdmin,
      lastLoginAt: uc.user.lastLoginAt,
      roleId: uc.role.id,
      roleName: uc.role.name,
      roleDisplayName: uc.role.displayName,
      permissions: uc.role.permissions,
      jobTitle: uc.jobTitle,
      isDefault: uc.isDefault,
      joinedAt: uc.createdAt,
    }))

    return NextResponse.json({
      companyId: company.id,
      companyName: company.name,
      maxUsers: company.maxUsers,
      currentUsers: users.length,
      users,
    })
  })(request)
}

// POST /api/companies/[id]/users - Invite user to company
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async (req) => {
    const { id } = await params
    const body = await req.json()
    const { email, firstName, lastName, roleId, jobTitle } = body

    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, ime i prezime su obavezni' },
        { status: 400 }
      )
    }

    if (!roleId) {
      return NextResponse.json({ error: 'Uloga je obavezna' }, { status: 400 })
    }

    // Verify company exists
    const company = await db.company.findUnique({
      where: { id },
      select: { id: true, name: true, maxUsers: true },
    })

    if (!company) {
      return NextResponse.json({ error: 'Kompanija nije pronađena' }, { status: 404 })
    }

    // Check user limit
    const currentCount = await db.userCompany.count({ where: { companyId: id } })
    if (currentCount >= company.maxUsers) {
      return NextResponse.json(
        { error: `Dostignut je maksimalan broj korisnika (${company.maxUsers})` },
        { status: 400 }
      )
    }

    // Verify role exists
    const role = await db.role.findUnique({ where: { id: roleId } })
    if (!role) {
      return NextResponse.json({ error: 'Uloga nije pronađena' }, { status: 404 })
    }

    // Find or create user
    let user = await db.user.findUnique({ where: { email } })

    if (!user) {
      // Create user with temporary password
      const tempPassword = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10)
      user = await db.user.create({
        data: {
          email,
          firstName,
          lastName,
          passwordHash: await hashPassword(tempPassword),
          isActive: true,
          isSuperAdmin: false,
        },
      })
      console.log(`[Invite] Created user ${email} with temp password: ${tempPassword}`)
    } else {
      // Check if user is already in this company
      const existingMembership = await db.userCompany.findUnique({
        where: { userId_companyId: { userId: user.id, companyId: id } },
      })
      if (existingMembership) {
        return NextResponse.json(
          { error: 'Korisnik je već član ove kompanije' },
          { status: 409 }
        )
      }
    }

    // Create UserCompany record
    const membership = await db.userCompany.create({
      data: {
        userId: user.id,
        companyId: id,
        roleId,
        jobTitle: jobTitle || null,
        isDefault: false,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            isActive: true,
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
    })

    // Log invitation (in production, send email)
    console.log(`[Invite] User ${email} invited to ${company.name} as ${role.displayName}`)

    return NextResponse.json(membership, { status: 201 })
  })(request)
}
