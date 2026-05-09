import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) where.OR = [{ code: { contains: search } }, { product: { contains: search } }, { parameter: { contains: search } }];
    const items = await db.measurement.findMany({ where, orderBy: { date: 'desc' } });
    return NextResponse.json(items);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.product || !body.parameter) return NextResponse.json({ error: 'Product and parameter required' }, { status: 400 });
    const code = body.code || `MER-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`;
    const item = await db.measurement.create({
      data: { code, product: body.product, parameter: body.parameter, nominalValue: body.nominalValue || '',
        unit: body.unit || '', measuredValue: body.measuredValue || '', tolerance: body.tolerance || '',
        deviation: body.deviation || '', status: body.status || 'pending', instrument: body.instrument || null,
        operator: body.operator || null, station: body.station || null, batch: body.batch || null,
        date: body.date ? new Date(body.date) : new Date(), notes: body.notes || null },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
