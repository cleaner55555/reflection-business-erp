import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/invoices/post-to-journal
 * Body: { invoiceId: string }
 * 
 * Posts an invoice to the general ledger (knjigovodstvo) by creating journal entries.
 * Serbian accounting: debits customer account (201), credits revenue (201-opšti prihodi)
 * For PDV: debits customer for full amount, credits revenue (osnovica), credits PDV (obaveza)
 */
export async function POST(req: NextRequest) {
  try {
    const { invoiceId } = await req.json()
    if (!invoiceId) return NextResponse.json({ error: 'invoiceId je obavezan' }, { status: 400 })

    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        items: true,
        partner: { select: { id: true, name: true } },
      },
    })

    if (!invoice) return NextResponse.json({ error: 'Faktura nije pronađena' }, { status: 404 })
    if (invoice.postedToJournal) return NextResponse.json({ error: 'Faktura je već knjižena' }, { status: 400 })

    const fiscalYear = invoice.date.getFullYear()
    const companyId = invoice.companyId

    // Find or create a voucher number
    const existingEntries = await db.journalEntry.findMany({
      where: { companyId, fiscalYear },
      orderBy: { createdAt: 'desc' },
      take: 1,
    })
    const lastVoucher = existingEntries[0]?.voucherNumber
    let nextNum = 1
    if (lastVoucher) {
      const match = lastVoucher.match(/(\d+)$/)
      if (match) nextNum = parseInt(match[1]) + 1
    }
    const voucherNumber = `NAL-${fiscalYear}-${String(nextNum).padStart(4, '0')}`

    // Calculate totals
    const totalBase = invoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (1 - item.discountPct / 100)), 0)
    const totalTax = invoice.taxAmount || 0
    const totalAmount = invoice.totalAmount

    // For output invoices (izlazna):
    // Duguje: 201 - Kupac (full amount with tax)
    // Potražuje: 201-opšti prihodi (base amount) + 241-PDV obaveza (tax amount)
    //
    // For input invoices (ulazna):
    // Duguje: 211-Materijal (base) + 243-PDV preduzeća (tax)
    // Potražuje: 202-Dobavljač (full amount)

    const isOutput = invoice.type === 'izlazna' || invoice.type === 'avansna'

    // Create journal entry lines
    const entries = []

    if (isOutput) {
      // Debit: Customer account (201)
      entries.push({
        companyId,
        date: invoice.date,
        accountId: '201',
        debit: totalAmount,
        credit: 0,
        description: `Faktura ${invoice.number} - ${invoice.partner?.name || 'Partner'}`,
        documentRef: invoice.number,
        voucherNumber,
        partnerId: invoice.partnerId,
        fiscalYear,
        currency: invoice.currency,
        exchangeRate: invoice.exchangeRate,
        postedToJournal: false,
      })

      // Credit: Revenue (opšti prihodi)
      entries.push({
        companyId,
        date: invoice.date,
        accountId: '201-01',
        debit: 0,
        credit: totalBase,
        description: `Faktura ${invoice.number} - osnovica`,
        documentRef: invoice.number,
        voucherNumber,
        partnerId: invoice.partnerId,
        fiscalYear,
        currency: invoice.currency,
        exchangeRate: invoice.exchangeRate,
      })

      // Credit: PDV obaveza (if tax > 0)
      if (totalTax > 0) {
        entries.push({
          companyId,
          date: invoice.date,
          accountId: '241',
          debit: 0,
          credit: totalTax,
          description: `Faktura ${invoice.number} - PDV`,
          documentRef: invoice.number,
          voucherNumber,
          partnerId: invoice.partnerId,
          fiscalYear,
          currency: invoice.currency,
          exchangeRate: invoice.exchangeRate,
        })
      }
    } else {
      // Input invoice
      // Debit: Material/Expense account
      entries.push({
        companyId,
        date: invoice.date,
        accountId: '211',
        debit: totalBase,
        credit: 0,
        description: `Ulazna faktura ${invoice.number} - ${invoice.partner?.name || 'Partner'}`,
        documentRef: invoice.number,
        voucherNumber,
        partnerId: invoice.partnerId,
        fiscalYear,
        currency: invoice.currency,
        exchangeRate: invoice.exchangeRate,
      })

      // Debit: PDV preduzeća
      if (totalTax > 0) {
        entries.push({
          companyId,
          date: invoice.date,
          accountId: '243',
          debit: totalTax,
          credit: 0,
          description: `Ulazna faktura ${invoice.number} - PDV`,
          documentRef: invoice.number,
          voucherNumber,
          partnerId: invoice.partnerId,
          fiscalYear,
          currency: invoice.currency,
          exchangeRate: invoice.exchangeRate,
        })
      }

      // Credit: Supplier account
      entries.push({
        companyId,
        date: invoice.date,
        accountId: '202',
        debit: 0,
        credit: totalAmount,
        description: `Ulazna faktura ${invoice.number} - ukupno`,
        documentRef: invoice.number,
        voucherNumber,
        partnerId: invoice.partnerId,
        fiscalYear,
        currency: invoice.currency,
        exchangeRate: invoice.exchangeRate,
      })
    }

    // Create all entries
    await db.journalEntry.createMany({ data: entries as any[] })

    // Mark invoice as posted
    await db.invoice.update({
      where: { id: invoiceId },
      data: {
        postedToJournal: true,
        postedAt: new Date(),
      },
    })

    const totalDebit = entries.reduce((s, e) => s + e.debit, 0)
    const totalCredit = entries.reduce((s, e) => s + e.credit, 0)

    return NextResponse.json({
      success: true,
      voucherNumber,
      entriesCreated: entries.length,
      totalDebit,
      totalCredit,
      message: `Faktura ${invoice.number} uspešno knjižena u dnevnik ${voucherNumber}`,
    })
  } catch (error) {
    console.error('Post to journal error:', error)
    return NextResponse.json({ error: 'Greška pri knjiženju fakture' }, { status: 500 })
  }
}
