import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const where: Record<string, unknown> = {};
    if (search) where.OR = [
      { name: { contains: search } },
      { category: { contains: search } },
      { type: { contains: search } },
      { createdBy: { contains: search } },
    ];
    const items = await db.priceListV2.findMany({ where, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(items);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, type, validFrom, validUntil, items, status, createdBy, notes } = body;
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
    const count = await db.priceListV2.count();
    const listNo = `CL-${String(count + 1).padStart(4, '0')}`;
    const item = await db.priceListV2.create({
      data: {
        listNo, name, category: category || '', type: type || 'retail',
        validFrom: validFrom || '', validUntil: validUntil || '',
        items: parseInt(items) || 0, status: status || 'draft',
        createdBy: createdBy || '', notes: notes || '',
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
