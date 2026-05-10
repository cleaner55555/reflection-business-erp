import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const existing = await db.barcodeItem.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const item = await db.barcodeItem.update({
      where: { id },
      data: {
        code: body.code !== undefined ? body.code : undefined,
        type: body.type !== undefined ? body.type : undefined,
        productName: body.productName !== undefined ? body.productName : undefined,
        productId: body.productId !== undefined ? body.productId : undefined,
        category: body.category !== undefined ? body.category : undefined,
      },
    });
    return NextResponse.json(item);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const existing = await db.barcodeItem.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await db.barcodeItem.delete({ where: { id } });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
