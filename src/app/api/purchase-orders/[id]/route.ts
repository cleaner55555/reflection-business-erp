import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/purchase-orders/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const order = await db.purchaseOrder.findUnique({
      where: { id },
      include: {
        partner: true,
        items: { include: { product: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    return NextResponse.json({ error: 'Failed to fetch purchase order' }, { status: 500 });
  }
}

// PUT /api/purchase-orders/[id]
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await db.purchaseOrder.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 });
    }

    // Check order number uniqueness if changed
    if (body.number && body.number !== existing.number) {
      const numExists = await db.purchaseOrder.findUnique({ where: { number: body.number } });
      if (numExists) {
        return NextResponse.json({ error: 'Purchase order with this number already exists' }, { status: 409 });
      }
    }

    // If items are provided, replace them all
    if (body.items && Array.isArray(body.items)) {
      await db.purchaseOrderItem.deleteMany({ where: { orderId: id } });

      const totalAmount = body.items.reduce((sum: number, item: Record<string, number>) => {
        return sum + item.quantity * item.unitPrice;
      }, 0);

      const order = await db.purchaseOrder.update({
        where: { id },
        data: {
          partnerId: body.partnerId,
          number: body.number,
          date: body.date ? new Date(body.date) : undefined,
          status: body.status,
          totalAmount,
          notes: body.notes,
          items: {
            create: body.items.map((item: Record<string, unknown>) => ({
              productId: item.productId as string,
              productName: item.productName as string,
              quantity: parseFloat(item.quantity as string),
              unitPrice: parseFloat(item.unitPrice as string),
              total: parseFloat(item.quantity as string) * parseFloat(item.unitPrice as string),
            })),
          },
        },
        include: { partner: true, items: true },
      });

      return NextResponse.json(order);
    }

    // Update without changing items
    const order = await db.purchaseOrder.update({
      where: { id },
      data: {
        partnerId: body.partnerId,
        number: body.number,
        date: body.date ? new Date(body.date) : undefined,
        status: body.status,
        notes: body.notes,
      },
      include: { partner: true, items: true },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating purchase order:', error);
    return NextResponse.json({ error: 'Failed to update purchase order' }, { status: 500 });
  }
}

// DELETE /api/purchase-orders/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await db.purchaseOrder.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 });
    }

    // PurchaseOrderItems are deleted via cascade
    await db.purchaseOrder.delete({ where: { id } });

    return NextResponse.json({ message: 'Purchase order deleted successfully' });
  } catch (error) {
    console.error('Error deleting purchase order:', error);
    return NextResponse.json({ error: 'Failed to delete purchase order' }, { status: 500 });
  }
}
