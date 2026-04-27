import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/journal?dateFrom=...&dateTo=...&partnerId=...&type=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const partnerId = searchParams.get('partnerId') || '';
    const type = searchParams.get('type') || '';

    const entries: Array<{
      id: string;
      date: Date;
      type: string;
      description: string;
      documentNumber: string;
      partnerName: string;
      debit: number;
      credit: number;
    }> = [];

    // --- Invoices (izlazna = credit, ulazna = debit, predracun = credit) ---
    if (!type || type === 'faktura_izlazna' || type === 'faktura_ulazna' || type === 'predracun' || type === 'faktura') {
      const invoiceWhere: Record<string, unknown> = {};
      if (dateFrom) invoiceWhere.date = { gte: new Date(dateFrom) };
      if (dateTo) invoiceWhere.date = { ...((invoiceWhere.date as Record<string, unknown>) || {}), lte: new Date(dateTo) };
      if (partnerId) invoiceWhere.partnerId = partnerId;
      if (type === 'faktura_izlazna') invoiceWhere.type = 'izlazna';
      if (type === 'faktura_ulazna') invoiceWhere.type = 'ulazna';
      if (type === 'predracun') invoiceWhere.type = 'predracun';

      const invoices = await db.invoice.findMany({
        where: invoiceWhere,
        include: { partner: { select: { name: true } } },
      });

      for (const inv of invoices) {
        const invType = inv.type || 'izlazna';
        const isIzlazna = invType === 'izlazna';
        const isPredracun = invType === 'predracun';
        entries.push({
          id: inv.id,
          date: inv.date,
          type: isPredracun ? 'predracun' : (isIzlazna ? 'faktura_izlazna' : 'faktura_ulazna'),
          description: `${isPredracun ? 'Predračun' : 'Faktura ' + (isIzlazna ? 'izlazna' : 'ulazna')} - ${inv.partner.name}`,
          documentNumber: inv.number,
          partnerName: inv.partner.name,
          debit: (!isIzlazna && !isPredracun) ? inv.totalAmount : 0,
          credit: (isIzlazna || isPredracun) ? inv.totalAmount : 0,
        });
      }
    }

    // --- Transactions (prihod = credit, rashod = debit) ---
    if (!type || type === 'prihod' || type === 'rashod' || type === 'transakcija') {
      const txWhere: Record<string, unknown> = {};
      if (dateFrom) txWhere.date = { gte: new Date(dateFrom) };
      if (dateTo) txWhere.date = { ...((txWhere.date as Record<string, unknown>) || {}), lte: new Date(dateTo) };
      if (partnerId) txWhere.partnerId = partnerId;
      if (type === 'prihod') txWhere.type = 'prihod';
      if (type === 'rashod') txWhere.type = 'rashod';

      const transactions = await db.transaction.findMany({ where: txWhere });

      for (const tx of transactions) {
        const isPrihod = tx.type === 'prihod';
        entries.push({
          id: tx.id,
          date: tx.date,
          type: isPrihod ? 'prihod' : 'rashod',
          description: tx.description,
          documentNumber: tx.documentRef || '',
          partnerName: '',
          debit: isPrihod ? 0 : tx.amount,
          credit: isPrihod ? tx.amount : 0,
        });
      }
    }

    // --- Cash Register entries (ulaz = credit, izlaz = debit) ---
    if (!type || type === 'kasa_ulaz' || type === 'kasa_izlaz' || type === 'kasa') {
      const cashWhere: Record<string, unknown> = {};
      if (dateFrom) cashWhere.date = { gte: new Date(dateFrom) };
      if (dateTo) cashWhere.date = { ...((cashWhere.date as Record<string, unknown>) || {}), lte: new Date(dateTo) };
      if (type === 'kasa_ulaz') cashWhere.type = 'ulaz';
      if (type === 'kasa_izlaz') cashWhere.type = 'izlaz';

      const cashEntries = await db.cashRegister.findMany({ where: cashWhere });

      for (const cash of cashEntries) {
        const isUlaz = cash.type === 'ulaz';
        entries.push({
          id: cash.id,
          date: cash.date,
          type: isUlaz ? 'kasa_ulaz' : 'kasa_izlaz',
          description: cash.description,
          documentNumber: '',
          partnerName: cash.partnerName || '',
          debit: isUlaz ? 0 : cash.amount,
          credit: isUlaz ? cash.amount : 0,
        });
      }
    }

    // --- Purchase Orders (primljena = debit) ---
    if (!type || type === 'nabavka') {
      const poWhere: Record<string, unknown> = { status: 'primljena' };
      if (dateFrom) poWhere.date = { gte: new Date(dateFrom) };
      if (dateTo) poWhere.date = { ...((poWhere.date as Record<string, unknown>) || {}), lte: new Date(dateTo) };
      if (partnerId) poWhere.partnerId = partnerId;

      const purchaseOrders = await db.purchaseOrder.findMany({
        where: poWhere,
        include: { partner: { select: { name: true } } },
      });

      for (const po of purchaseOrders) {
        entries.push({
          id: po.id,
          date: po.date,
          type: 'nabavka',
          description: `Nabavka - ${po.partner.name}`,
          documentNumber: po.number,
          partnerName: po.partner.name,
          debit: po.totalAmount,
          credit: 0,
        });
      }
    }

    // --- Delivery Notes (otpremljena = credit) ---
    if (!type || type === 'otpremnica') {
      const dnWhere: Record<string, unknown> = {};
      if (dateFrom) dnWhere.date = { gte: new Date(dateFrom) };
      if (dateTo) dnWhere.date = { ...((dnWhere.date as Record<string, unknown>) || {}), lte: new Date(dateTo) };
      if (partnerId) dnWhere.partnerId = partnerId;

      const deliveryNotes = await db.deliveryNote.findMany({
        where: dnWhere,
        include: { partner: { select: { name: true } }, items: true },
      });

      for (const dn of deliveryNotes) {
        const total = dn.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        entries.push({
          id: dn.id,
          date: dn.date,
          type: 'otpremnica',
          description: `Otpremnica - ${dn.partner.name}`,
          documentNumber: dn.number,
          partnerName: dn.partner.name,
          debit: 0,
          credit: total,
        });
      }
    }

    // Sort all entries by date DESC
    entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching journal:', error);
    return NextResponse.json({ error: 'Failed to fetch journal' }, { status: 500 });
  }
}
