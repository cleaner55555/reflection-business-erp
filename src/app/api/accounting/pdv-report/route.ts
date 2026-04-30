import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// PDV prijava - poreski izveštaj za Srbiju
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId') || '';
  const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
  const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());

  if (!companyId) {
    return NextResponse.json({ error: 'companyId is required' }, { status: 400 });
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // Get all journal entries for the period
  const entries = await db.journalEntry.findMany({
    where: {
      companyId,
      date: { gte: startDate, lte: endDate },
    },
    include: { account: { select: { code: true, name: true, type: true } } },
  });

  // Calculate PDV (VAT)
  let ulazniPDV = 0; // input VAT (20% - account 241)
  let izlazniPDV = 0; // output VAT (20% - account 241)
  let prometSaPDV = 0; // revenue with VAT
  let prometBezPDV = 0; // revenue without VAT
  let nabavkaSaPDV = 0; // purchases with VAT
  let nabavkaBezPDV = 0; // purchases without VAT

  for (const entry of entries) {
    if (entry.account.code.startsWith('241')) {
      // PDV account
      if (entry.debit > 0) ulazniPDV += entry.debit;
      if (entry.credit > 0) izlazniPDV += entry.credit;
    }
    if (entry.account.type === 'prihodka') {
      if (entry.credit > 0) prometBezPDV += entry.credit;
    }
    if (entry.account.type === 'rashodna') {
      if (entry.debit > 0) nabavkaBezPDV += entry.debit;
    }
  }

  prometSaPDV = prometBezPDV * 1.2;
  nabavkaSaPDV = nabavkaBezPDV * 1.2;

  const pdvZaPlacanje = izlazniPDV - ulazniPDV;

  return NextResponse.json({
    period: { year, month },
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    izlazniPDV: Math.round(izlazniPDV * 100) / 100,
    ulazniPDV: Math.round(ulazniPDV * 100) / 100,
    pdvZaPlacanje: Math.round(pdvZaPlacanje * 100) / 100,
    prometBezPDV: Math.round(prometBezPDV * 100) / 100,
    prometSaPDV: Math.round(prometSaPDV * 100) / 100,
    nabavkaBezPDV: Math.round(nabavkaBezPDV * 100) / 100,
    nabavkaSaPDV: Math.round(nabavkaSaPDV * 100) / 100,
    totalEntries: entries.length,
    isObligation: pdvZaPlacanje > 0,
    isRefund: pdvZaPlacanje < 0,
    refundAmount: pdvZaPlacanje < 0 ? Math.abs(pdvZaPlacanje) : 0,
  });
}
