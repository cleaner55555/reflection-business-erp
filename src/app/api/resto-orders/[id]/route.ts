import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/resto-orders/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const order = await db.restoOrder.findUnique({
      where: { id },
      include: {
        table: { select: { id: true, number: true, name: true, location: true } },
        items: {
          orderBy: { createdAt: 'asc' },
          include: {
            menuItem: { select: { id: true, name: true, price: true } },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

// PUT /api/resto-orders/[id]
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await db.restoOrder.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = await db.restoOrder.update({
      where: { id },
      data: {
        status: body.status,
        notes: body.notes,
        discountPct: body.discountPct !== undefined ? parseFloat(body.discountPct) : undefined,
        waiter: body.waiter,
        tableId: body.tableId !== undefined ? (body.tableId || null) : undefined,
      },
      include: {
        table: { select: { id: true, number: true, name: true, location: true } },
        items: { orderBy: { createdAt: 'asc' } },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

// DELETE /api/resto-orders/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await db.restoOrder.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    await db.restoOrder.delete({ where: { id } });

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
