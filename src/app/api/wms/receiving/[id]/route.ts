import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT /api/wms/receiving/[id] - Receive line or update status
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { status, receiveLineId, receivedQty, lotNumber, expiryDate, locationId, lineNotes } = body;

    // Update a specific receiving line (scan & receive)
    if (receiveLineId) {
      const line = await db.receivingOrderLine.update({
        where: { id: receiveLineId },
        data: {
          receivedQty: receivedQty || 0,
          lotNumber: lotNumber || null,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          locationId: locationId || null,
          notes: lineNotes || null,
        },
      });

      // Create stock movement for received qty
      if (receivedQty && receivedQty > 0) {
        const order = await db.receivingOrder.findUnique({ where: { id } });
        if (order) {
          await db.stockMovement.create({
            data: {
              companyId: order.companyId,
              productId: line.productId,
              type: 'prijem',
              quantity: receivedQty,
              unitCost: line.unitCost,
              documentRef: order.number,
              lotNumber: lotNumber || null,
              expiryDate: expiryDate ? new Date(expiryDate) : null,
              locationId: locationId || null,
              notes: `Prijem robe: ${line.productName}`,
            },
          });
          await db.product.update({
            where: { id: line.productId },
            data: { currentStock: { increment: receivedQty } },
          });
        }
      }

      return NextResponse.json(line);
    }

    // Update order status
    if (status) {
      const updateData: Record<string, unknown> = { status };
      if (status === 'završen') {
        updateData.receivedAt = new Date();
      }
      const order = await db.receivingOrder.update({
        where: { id },
        data: updateData,
        include: { lines: true, partner: true },
      });
      return NextResponse.json(order);
    }

    return NextResponse.json({ error: 'No action specified' }, { status: 400 });
  } catch (error) {
    console.error('Error updating receiving order:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// DELETE /api/wms/receiving/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const order = await db.receivingOrder.findUnique({ where: { id } });
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (order.status !== 'nacrt') {
      return NextResponse.json({ error: 'Can only delete draft orders' }, { status: 400 });
    }
    await db.receivingOrder.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
