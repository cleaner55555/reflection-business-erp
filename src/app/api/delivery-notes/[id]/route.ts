import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/delivery-notes/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const deliveryNote = await db.deliveryNote.findUnique({
      where: { id },
      include: {
        partner: true,
        items: { include: { product: true } },
      },
    });

    if (!deliveryNote) {
      return NextResponse.json({ error: 'Delivery note not found' }, { status: 404 });
    }

    return NextResponse.json(deliveryNote);
  } catch (error) {
    console.error('Error fetching delivery note:', error);
    return NextResponse.json({ error: 'Failed to fetch delivery note' }, { status: 500 });
  }
}

// PUT /api/delivery-notes/[id]
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await db.deliveryNote.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Delivery note not found' }, { status: 404 });
    }

    // Check number uniqueness if changed
    if (body.number && body.number !== existing.number) {
      const numExists = await db.deliveryNote.findUnique({ where: { number: body.number } });
      if (numExists) {
        return NextResponse.json({ error: 'Delivery note with this number already exists' }, { status: 409 });
      }
    }

    // If items are provided, replace them all
    if (body.items && Array.isArray(body.items)) {
      await db.deliveryNoteItem.deleteMany({ where: { deliveryNoteId: id } });

      const deliveryNote = await db.deliveryNote.update({
        where: { id },
        data: {
          number: body.number,
          date: body.date ? new Date(body.date) : undefined,
          status: body.status,
          invoiceNumber: body.invoiceNumber,
          notes: body.notes,
          items: {
            create: body.items.map((item: Record<string, unknown>) => ({
              productId: item.productId as string,
              productName: item.productName as string,
              quantity: parseFloat(item.quantity as string),
              unitPrice: parseFloat(item.unitPrice as string),
            })),
          },
        },
        include: { partner: true, items: true },
      });

      return NextResponse.json(deliveryNote);
    }

    // Update without changing items
    const deliveryNote = await db.deliveryNote.update({
      where: { id },
      data: {
        number: body.number,
        date: body.date ? new Date(body.date) : undefined,
        status: body.status,
        invoiceNumber: body.invoiceNumber,
        notes: body.notes,
      },
      include: { partner: true, items: true },
    });

    return NextResponse.json(deliveryNote);
  } catch (error) {
    console.error('Error updating delivery note:', error);
    return NextResponse.json({ error: 'Failed to update delivery note' }, { status: 500 });
  }
}

// DELETE /api/delivery-notes/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await db.deliveryNote.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Delivery note not found' }, { status: 404 });
    }

    // DeliveryNoteItems are deleted via cascade
    await db.deliveryNote.delete({ where: { id } });

    return NextResponse.json({ message: 'Delivery note deleted successfully' });
  } catch (error) {
    console.error('Error deleting delivery note:', error);
    return NextResponse.json({ error: 'Failed to delete delivery note' }, { status: 500 });
  }
}
