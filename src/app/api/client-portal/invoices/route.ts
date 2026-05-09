import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    const items = await db.portalInvoice.findMany({ where, orderBy: { date: 'desc' } });
    return NextResponse.json(items);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { number, amount, status, date, dueDate } = body;
    if (!number) return NextResponse.json({ error: 'Number required' }, { status: 400 });
    const item = await db.portalInvoice.create({
      data: {
        number,
        amount: parseFloat(amount) || 0,
        status: status || 'nacrt',
        date: date || new Date().toISOString().split('T')[0],
        dueDate: dueDate || '',
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
