import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/wms/receiving?status=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const orders = await db.receivingOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        partner: { select: { id: true, name: true } },
        lines: { orderBy: { createdAt: 'asc' } },
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching receiving orders:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// POST /api/wms/receiving - Create receiving order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { partnerId, documentRef, notes, lines } = body;

    const number = `PRIJEM-${new Date().toISOString().slice(0, 7)}-${String(Date.now()).slice(-4)}`;

    const order = await db.receivingOrder.create({
      data: {
        number,
        partnerId: partnerId || null,
        documentRef: documentRef || null,
        notes: notes || null,
        lines: {
          create: (lines || []).map((l: { productId: string; productName: string; expectedQty: number; unitCost?: number }) => ({
            productId: l.productId,
            productName: l.productName,
            expectedQty: l.expectedQty || 0,
            unitCost: l.unitCost || 0,
          })),
        },
      },
      include: { lines: true, partner: true },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating receiving order:', error);
    return NextResponse.json({ error: 'Failed to create receiving order' }, { status: 500 });
  }
}
