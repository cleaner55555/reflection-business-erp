import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/invoices/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const invoice = await db.invoice.findUnique({
      where: { id },
      include: {
        partner: true,
        items: { include: { product: true } },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}

// PUT /api/invoices/[id]
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await db.invoice.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Check invoice number uniqueness if changed
    if (body.number && body.number !== existing.number) {
      const numExists = await db.invoice.findUnique({ where: { number: body.number } });
      if (numExists) {
        return NextResponse.json({ error: 'Invoice with this number already exists' }, { status: 409 });
      }
    }

    // If items are provided, replace them all
    if (body.items && Array.isArray(body.items)) {
      // Delete existing items
      await db.invoiceItem.deleteMany({ where: { invoiceId: id } });

      // Recalculate totals
      const totalAmount = body.items.reduce((sum: number, item: Record<string, number>) => {
        const subtotal = item.quantity * item.unitPrice;
        const discount = subtotal * ((item.discountPct || 0) / 100);
        const tax = (subtotal - discount) * ((item.taxRate || 20) / 100);
        return sum + subtotal - discount + tax;
      }, 0);

      const taxAmount = body.items.reduce((sum: number, item: Record<string, number>) => {
        const subtotal = item.quantity * item.unitPrice;
        const discount = subtotal * ((item.discountPct || 0) / 100);
        const tax = (subtotal - discount) * ((item.taxRate || 20) / 100);
        return sum + tax;
      }, 0);

      const invoice = await db.invoice.update({
        where: { id },
        data: {
          partnerId: body.partnerId,
          number: body.number,
          date: body.date ? new Date(body.date) : undefined,
          dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
          status: body.status,
          totalAmount,
          taxAmount,
          discountPct: body.discountPct !== undefined ? parseFloat(body.discountPct) : undefined,
          notes: body.notes,
          paymentMethod: body.paymentMethod,
          items: {
            create: body.items.map((item: Record<string, unknown>) => ({
              productId: item.productId as string,
              productName: item.productName as string,
              quantity: parseFloat(item.quantity as string),
              unitPrice: parseFloat(item.unitPrice as string),
              discountPct: parseFloat((item.discountPct as string) || '0'),
              taxRate: parseFloat((item.taxRate as string) || '20'),
              total:
                parseFloat(item.quantity as string) * parseFloat(item.unitPrice as string) *
                (1 + parseFloat((item.taxRate as string) || '20') / 100),
            })),
          },
        },
        include: { partner: true, items: true },
      });

      return NextResponse.json(invoice);
    }

    // Update without changing items
    const invoice = await db.invoice.update({
      where: { id },
      data: {
        partnerId: body.partnerId,
        number: body.number,
        date: body.date ? new Date(body.date) : undefined,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        status: body.status,
        discountPct: body.discountPct !== undefined ? parseFloat(body.discountPct) : undefined,
        notes: body.notes,
        paymentMethod: body.paymentMethod,
      },
      include: { partner: true, items: true },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}

// DELETE /api/invoices/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await db.invoice.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // InvoiceItems are deleted via cascade
    await db.invoice.delete({ where: { id } });

    return NextResponse.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
  }
}
