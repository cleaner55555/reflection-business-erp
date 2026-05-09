import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [invoices, orders, tickets, docs] = await Promise.all([
      db.portalInvoice.findMany({ orderBy: { date: 'desc' } }),
      db.portalOrder.findMany({ orderBy: { date: 'desc' } }),
      db.portalTicket.findMany({ orderBy: { createdAt: 'desc' } }),
      db.portalDoc.findMany({ orderBy: { date: 'desc' } }),
    ]);
    return NextResponse.json({ invoices, orders, tickets, docs });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
