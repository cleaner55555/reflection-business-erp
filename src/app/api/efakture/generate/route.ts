import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { convertInvoiceToSEFData, generateSEFXML } from '@/lib/sef/generator'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { invoiceId } = body

    if (!invoiceId) {
      return NextResponse.json({ error: 'invoiceId je obavezan' }, { status: 400 })
    }

    // Fetch invoice with partner and items
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        partner: true,
        items: true,
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Faktura nije pronađena' }, { status: 404 })
    }

    if (!invoice.partner) {
      return NextResponse.json({ error: 'Faktura nema definisanog partnera' }, { status: 400 })
    }

    if (!invoice.partner.pib) {
      return NextResponse.json({ error: 'Partner nema definisan PIB' }, { status: 400 })
    }

    // Convert DB invoice to SEF data
    const sefData = convertInvoiceToSEFData(invoice as unknown as Parameters<typeof convertInvoiceToSEFData>[0])

    // Generate SEF XML
    const xml = generateSEFXML(sefData)

    // Update invoice with SEF UUID
    await db.invoice.update({
      where: { id: invoiceId },
      data: { sefUuid: sefData.uuid },
    })

    // Generate filename
    const filename = `SEF_${invoice.number.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xml`

    return NextResponse.json({ xml, filename, uuid: sefData.uuid })
  } catch (error) {
    console.error('SEF XML generation error:', error)
    return NextResponse.json({ error: 'Greška pri generisanju SEF XML-a' }, { status: 500 })
  }
}
