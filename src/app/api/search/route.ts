import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all'

    if (!q.trim() || q.length < 1) {
      return NextResponse.json({
        partners: [],
        products: [],
        invoices: [],
        contacts: [],
        employees: [],
      })
    }

    const query = q.trim().toLowerCase()
    const results: {
      partners: unknown[]
      products: unknown[]
      invoices: unknown[]
      contacts: unknown[]
      employees: unknown[]
    } = {
      partners: [],
      products: [],
      invoices: [],
      contacts: [],
      employees: [],
    }

    // ========== PARTNERS ==========
    if (type === 'all' || type === 'partners') {
      const partners = await db.partner.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { pib: { contains: q, mode: 'insensitive' } },
            { maticniBr: { contains: q, mode: 'insensitive' } },
            { city: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q, mode: 'insensitive' } },
            { address: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
        orderBy: { updatedAt: 'desc' },
      })
      results.partners = partners.map((p) => ({
        id: p.id,
        name: p.name,
        subtitle: p.pib || '',
        city: p.city || '',
        type: p.type,
      }))
    }

    // ========== PRODUCTS ==========
    if (type === 'all' || type === 'products') {
      const products = await db.product.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { sku: { contains: q, mode: 'insensitive' } },
            { barcode: { contains: q, mode: 'insensitive' } },
            { category: { contains: q, mode: 'insensitive' } },
          ],
          isActive: true,
        },
        take: 10,
        orderBy: { updatedAt: 'desc' },
      })
      results.products = products.map((p) => ({
        id: p.id,
        name: p.name,
        subtitle: p.sku || '',
        price: p.sellingPrice,
        stock: p.currentStock,
      }))
    }

    // ========== INVOICES ==========
    if (type === 'all' || type === 'invoices') {
      const invoices = await db.invoice.findMany({
        where: {
          OR: [
            { number: { contains: q, mode: 'insensitive' } },
            { partner: { name: { contains: q, mode: 'insensitive' } } },
            { notes: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
        orderBy: { updatedAt: 'desc' },
        include: {
          partner: {
            select: { name: true },
          },
        },
      })
      results.invoices = invoices.map((inv) => ({
        id: inv.id,
        name: inv.number,
        subtitle: inv.partner?.name || '',
        amount: inv.totalAmount,
        status: inv.status,
        type: inv.type,
        date: inv.date.toISOString(),
      }))
    }

    // ========== CONTACTS ==========
    if (type === 'all' || type === 'contacts') {
      const contacts = await db.contact.findMany({
        where: {
          OR: [
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q, mode: 'insensitive' } },
            { company: { contains: q, mode: 'insensitive' } },
            { position: { contains: q, mode: 'insensitive' } },
            { tags: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
        orderBy: { updatedAt: 'desc' },
      })
      results.contacts = contacts.map((c) => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        subtitle: c.company || c.email || '',
        email: c.email || '',
        phone: c.phone || '',
        position: c.position || '',
      }))
    }

    // ========== EMPLOYEES ==========
    if (type === 'all' || type === 'employees') {
      const employees = await db.employee.findMany({
        where: {
          OR: [
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q, mode: 'insensitive' } },
            { position: { contains: q, mode: 'insensitive' } },
            { department: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
        orderBy: { updatedAt: 'desc' },
      })
      results.employees = employees.map((e) => ({
        id: e.id,
        name: `${e.firstName} ${e.lastName}`,
        subtitle: e.position || e.department || '',
        email: e.email || '',
        phone: e.phone || '',
        department: e.department || '',
        isActive: e.isActive,
      }))
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      {
        partners: [],
        products: [],
        invoices: [],
        contacts: [],
        employees: [],
        error: 'Greška pri pretrazi',
      },
      { status: 500 }
    )
  }
}
