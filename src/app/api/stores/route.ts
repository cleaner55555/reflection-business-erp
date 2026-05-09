import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) where.OR = [
      { name: { contains: search } },
      { city: { contains: search } },
      { code: { contains: search } },
      { manager: { contains: search } },
    ];
    const items = await db.store.findMany({ where, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(items);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, code, city, address, phone, email, manager, type, status, openDate, area, employees, monthlyRevenue, notes } = body;
    if (!name || !city) return NextResponse.json({ error: 'Name and city required' }, { status: 400 });
    const count = await db.store.count();
    const storeNo = `STR-${String(count + 1).padStart(4, '0')}`;
    const item = await db.store.create({
      data: {
        storeNo, name, code: code || '', city, address: address || '', phone: phone || '',
        email: email || '', manager: manager || '', type: type || 'retail', status: status || 'active',
        openDate: openDate || '', area: parseFloat(area) || 0, employees: parseInt(employees) || 0,
        monthlyRevenue: parseFloat(monthlyRevenue) || 0, notes: notes || '',
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
