import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

type SefStatus = 'not_sent' | 'sent' | 'accepted' | 'rejected'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { invoiceId, status } = body as { invoiceId: string; status?: SefStatus }

    if (!invoiceId) {
      return NextResponse.json({ error: 'invoiceId je obavezan' }, { status: 400 })
    }

    // Verify invoice exists
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Faktura nije pronađena' }, { status: 404 })
    }

    // Validate status if provided
    const validStatuses: SefStatus[] = ['not_sent', 'sent', 'accepted', 'rejected']
    const newStatus: SefStatus = status || 'sent'

    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json(
        { error: `Nevažeći status. Dozvoljeni: ${validStatuses.join(', ')}` },
        { status: 400 },
      )
    }

    // Build update data
    const updateData: Record<string, unknown> = { sefStatus: newStatus }

    if (newStatus === 'sent') {
      updateData.sefSentAt = new Date()
    }

    // Update invoice
    const updated = await db.invoice.update({
      where: { id: invoiceId },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      sefStatus: updated.sefStatus,
      sefSentAt: updated.sefSentAt,
    })
  } catch (error) {
    console.error('SEF status update error:', error)
    return NextResponse.json({ error: 'Greška pri ažuriranju SEF statusa' }, { status: 500 })
  }
}
