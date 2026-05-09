import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    const items = await db.portalOrder.findMany({ where, orderBy: { date: 'desc' } });
    return NextResponse.json(items);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderNo, items, total, status, date, deliveryDate } = body;
    if (!orderNo) return NextResponse.json({ error: 'Order number required' }, { status: 400 });
    const item = await db.portalOrder.create({
      data: {
        orderNo,
        items: parseInt(items) || 1,
        total: parseFloat(total) || 0,
        status: status || 'nacrt',
        date: date || new Date().toISOString().split('T')[0],
        deliveryDate: deliveryDate || null,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
