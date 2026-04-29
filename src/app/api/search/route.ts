import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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

    const query = q.trim()
    const queryLower = query.toLowerCase()

    const results: {
      partners: unknown[]
      products: unknown[]
      invoices: unknown[]
      contacts: unknown[]
      employees: []
    } = {
      partners: [],
      products: [],
      invoices: [],
      contacts: [],
      employees: [],
    }

    // ========== PARTNERS ==========
    if (type === 'all' || type === 'partners') {
      // SQLite doesn't support mode:'insensitive', fetch and filter in JS
      const allPartners = await db.partner.findMany({
        take: 200,
        orderBy: { updatedAt: 'desc' },
      })
      const partners = allPartners.filter((p) => {
        const searchStr = `${p.name} ${p.pib} ${p.maticniBr || ''} ${p.city || ''} ${p.email || ''} ${p.phone || ''} ${p.address || ''}`.toLowerCase()
        return searchStr.includes(queryLower)
      }).slice(0, 10)
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
      const allProducts = await db.product.findMany({
        where: { isActive: true },
        take: 200,
        orderBy: { updatedAt: 'desc' },
      })
      const products = allProducts.filter((p) => {
        const searchStr = `${p.name} ${p.sku} ${p.barcode || ''} ${p.category || ''}`.toLowerCase()
        return searchStr.includes(queryLower)
      }).slice(0, 10)
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
      const allInvoices = await db.invoice.findMany({
        take: 200,
        orderBy: { updatedAt: 'desc' },
        include: {
          partner: {
            select: { name: true },
          },
        },
      })
      const invoices = allInvoices.filter((inv) => {
        const searchStr = `${inv.number} ${inv.partner?.name || ''} ${inv.notes || ''} ${inv.status} ${inv.type}`.toLowerCase()
        return searchStr.includes(queryLower)
      }).slice(0, 10)
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
      const allContacts = await db.contact.findMany({
        take: 200,
        orderBy: { updatedAt: 'desc' },
      })
      const contacts = allContacts.filter((c) => {
        const searchStr = `${c.firstName} ${c.lastName} ${c.email || ''} ${c.phone || ''} ${c.company || ''} ${c.position || ''} ${c.tags || ''}`.toLowerCase()
        return searchStr.includes(queryLower)
      }).slice(0, 10)
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
      const allEmployees = await db.employee.findMany({
        take: 200,
        orderBy: { updatedAt: 'desc' },
      })
      const employees = allEmployees.filter((e) => {
        const searchStr = `${e.firstName} ${e.lastName} ${e.email || ''} ${e.phone || ''} ${e.position || ''} ${e.department || ''}`.toLowerCase()
        return searchStr.includes(queryLower)
      }).slice(0, 10)
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
