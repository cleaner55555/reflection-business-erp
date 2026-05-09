import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

// PUT /api/orders/[id]
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await db.bizOrder.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = await db.bizOrder.update({
      where: { id },
      data: {
        orderNo: body.orderNo,
        client: body.client,
        date: body.date ? new Date(body.date) : undefined,
        deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : (body.deliveryDate === null ? null : undefined),
        type: body.type,
        status: body.status,
        items: body.items !== undefined ? parseInt(body.items) : undefined,
        totalAmount: body.totalAmount !== undefined ? parseFloat(body.totalAmount) : undefined,
        warehouse: body.warehouse !== undefined ? body.warehouse : undefined,
        supplier: body.supplier !== undefined ? body.supplier : undefined,
        priority: body.priority,
        notes: body.notes !== undefined ? body.notes : undefined,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

// DELETE /api/orders/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await db.bizOrder.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    await db.bizOrder.delete({ where: { id } });

    return NextResponse.json({ message: 'Order deleted' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
