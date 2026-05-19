import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withErrorHandler } from '@/lib/tenant'

// GET /api/companies/[id]/users/[userId] - Get single user membership (unused but standard)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  return withErrorHandler(async (req) => {
    const { id, userId } = await params

    const membership = await db.userCompany.findUnique({
      where: { userId_companyId: { userId, companyId: id } },
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
    })

    if (!membership) {
      return NextResponse.json({ error: 'Korisnik nije član ove kompanije' }, { status: 404 })
    }

    return NextResponse.json({
      id: membership.id,
      userId: membership.user.id,
      email: membership.user.email,
      firstName: membership.user.firstName,
      lastName: membership.user.lastName,
      fullName: `${membership.user.firstName} ${membership.user.lastName}`,
      avatar: membership.user.avatar,
      phone: membership.user.phone,
      isActive: membership.user.isActive,
      isSuperAdmin: membership.user.isSuperAdmin,
      lastLoginAt: membership.user.lastLoginAt,
      roleId: membership.role.id,
      roleName: membership.role.name,
      roleDisplayName: membership.role.displayName,
      permissions: membership.role.permissions,
      jobTitle: membership.jobTitle,
      isDefault: membership.isDefault,
      joinedAt: membership.createdAt,
    })
  })(request)
}

// PUT /api/companies/[id]/users/[userId] - Update user role in company
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  return withErrorHandler(async (req) => {
    const { id, userId } = await params
    const body = await req.json()
    const { roleId, jobTitle, isDefault } = body

    // Verify membership exists
    const membership = await db.userCompany.findUnique({
      where: { userId_companyId: { userId, companyId: id } },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Korisnik nije član ove kompanije' }, { status: 404 })
    }

    // Verify new role exists if changing role
    if (roleId) {
      const role = await db.role.findUnique({ where: { id: roleId } })
      if (!role) {
        return NextResponse.json({ error: 'Uloga nije pronađena' }, { status: 404 })
      }
    }

    const updated = await db.userCompany.update({
      where: { id: membership.id },
      data: {
        ...(roleId && { roleId }),
        ...(jobTitle !== undefined && { jobTitle }),
        ...(isDefault !== undefined && { isDefault }),
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

    return NextResponse.json(updated)
  })(request)
}

// DELETE /api/companies/[id]/users/[userId] - Remove user from company
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  return withErrorHandler(async (req) => {
    const { id, userId } = await params

    const membership = await db.userCompany.findUnique({
      where: { userId_companyId: { userId, companyId: id } },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Korisnik nije član ove kompanije' }, { status: 404 })
    }

    await db.userCompany.delete({
      where: { id: membership.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Korisnik je uklonjen iz kompanije',
    })
  })(request)
}
