import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const existing = await db.label.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const item = await db.label.update({
      where: { id },
      data: {
        name: body.name, sku: body.sku, category: body.category, status: body.status,
        size: body.size, material: body.material, color: body.color,
        quantity: body.quantity !== undefined ? parseInt(body.quantity) : undefined,
        costPerUnit: body.costPerUnit !== undefined ? parseFloat(body.costPerUnit) : undefined,
        printDate: body.printDate, notes: body.notes,
      },
    });
    return NextResponse.json(item);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const existing = await db.label.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await db.label.delete({ where: { id } });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
