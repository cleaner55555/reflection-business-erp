import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { withCompanyId } from '@/lib/company-context'
import { getCompanyIdFromRequest, resolveCompany } from '@/lib/company-context'

// GET /api/companies - List companies (for current user)
export async function GET(req: Request) {
  try {
    const companyId = getCompanyIdFromRequest(req)

    // If companyId provided, return just that company
    if (companyId) {
      const company = await db.company.findUnique({
        where: { id: companyId },
        include: {
          _count: {
            select: {
              users: true,
              partners: true,
              invoices: true,
              products: true,
            },
          },
        },
      })
      if (!company) {
        return NextResponse.json({ error: 'Kompanija nije pronađena' }, { status: 404 })
      }
      return NextResponse.json(company)
    }

    // Return all companies
    const companies = await db.company.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            users: true,
            partners: true,
            invoices: true,
            products: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(companies)
  } catch (error) {
    console.error('Error fetching companies:', error)
    return NextResponse.json({ error: 'Greška pri učitavanju kompanija' }, { status: 500 })
  }
}

// POST /api/companies - Create new company
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, pib, maticniBr, address, city, zipCode, phone, email, website, bankName, bankAccount } = body

    if (!name) {
      return NextResponse.json({ error: 'Naziv kompanije je obavezan' }, { status: 400 })
    }

    // Check unique PIB
    if (pib) {
      const existing = await db.company.findUnique({ where: { pib } })
      if (existing) {
        return NextResponse.json({ error: 'Kompanija sa ovim PIB-om već postoji' }, { status: 409 })
      }
    }

    const company = await db.company.create({
      data: {
        name,
        pib: pib || null,
        maticniBr: maticniBr || null,
        address: address || null,
        city: city || null,
        zipCode: zipCode || null,
        phone: phone || null,
        email: email || null,
        website: website || null,
        bankName: bankName || null,
        bankAccount: bankAccount || null,
        plan: 'free',
        isActive: true,
      },
    })

    return NextResponse.json(company, { status: 201 })
  } catch (error) {
    console.error('Error creating company:', error)
    return NextResponse.json({ error: 'Greška pri kreiranju kompanije' }, { status: 500 })
  }
}

// PUT /api/companies - Update company
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'ID kompanije je obavezan' }, { status: 400 })
    }

    const company = await db.company.update({
      where: { id },
      data: {
        name: data.name,
        pib: data.pib,
        maticniBr: data.maticniBr,
        address: data.address,
        city: data.city,
        zipCode: data.zipCode,
        phone: data.phone,
        email: data.email,
        website: data.website,
        bankName: data.bankName,
        bankAccount: data.bankAccount,
        logo: data.logo,
        isActive: data.isActive,
      },
    })

    return NextResponse.json(company)
  } catch (error) {
    console.error('Error updating company:', error)
    return NextResponse.json({ error: 'Greška pri ažuriranju kompanije' }, { status: 500 })
  }
}
