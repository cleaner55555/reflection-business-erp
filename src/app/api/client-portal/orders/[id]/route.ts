import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const existing = await db.portalOrder.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const item = await db.portalOrder.update({
      where: { id },
      data: {
        orderNo: body.orderNo !== undefined ? body.orderNo : undefined,
        items: body.items !== undefined ? parseInt(body.items) : undefined,
        total: body.total !== undefined ? parseFloat(body.total) : undefined,
        status: body.status !== undefined ? body.status : undefined,
        date: body.date !== undefined ? body.date : undefined,
        deliveryDate: body.deliveryDate !== undefined ? (body.deliveryDate || null) : undefined,
      },
    });
    return NextResponse.json(item);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const existing = await db.portalOrder.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await db.portalOrder.delete({ where: { id } });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
