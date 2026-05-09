import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const existing = await db.store.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const item = await db.store.update({
      where: { id },
      data: {
        name: body.name, code: body.code, city: body.city, address: body.address,
        phone: body.phone, email: body.email, manager: body.manager, type: body.type,
        status: body.status, openDate: body.openDate,
        area: body.area !== undefined ? parseFloat(body.area) : undefined,
        employees: body.employees !== undefined ? parseInt(body.employees) : undefined,
        monthlyRevenue: body.monthlyRevenue !== undefined ? parseFloat(body.monthlyRevenue) : undefined,
        notes: body.notes,
      },
    });
    return NextResponse.json(item);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const existing = await db.store.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await db.store.delete({ where: { id } });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
