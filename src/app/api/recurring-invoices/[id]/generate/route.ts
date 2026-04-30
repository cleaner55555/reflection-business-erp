import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

// POST /api/recurring-invoices/[id]/generate — Manually generate invoice from template NOW
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const recurring = await db.recurringInvoice.findUnique({
      where: { id },
      include: { partner: true },
    });

    if (!recurring) {
      return NextResponse.json({ error: 'Recurring invoice not found' }, { status: 404 });
    }

    if (!recurring.isActive) {
      return NextResponse.json({ error: 'Recurring invoice is not active' }, { status: 400 });
    }

    // Check if end date has passed
    if (recurring.endDate && new Date() > new Date(recurring.endDate)) {
      return NextResponse.json({ error: 'Recurring invoice has expired' }, { status: 400 });
    }

    // Parse items from JSON
    const templateItems: Array<Record<string, unknown>> = JSON.parse(recurring.items);

    // Generate invoice number
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const count = String(Math.floor(Math.random() * 9000) + 1000);
    const invoiceNumber = `F-${year}-${month}-${count}`;

    // Check for duplicate
    const existingInvoice = await db.invoice.findUnique({ where: { number: invoiceNumber } });
    if (existingInvoice) {
      // Retry with different number
      const count2 = String(Math.floor(Math.random() * 9000) + 1000);
      const invoiceNumber2 = `F-${year}-${month}-${count2}`;
      const existing2 = await db.invoice.findUnique({ where: { number: invoiceNumber2 } });
      if (existing2) {
        return NextResponse.json({ error: 'Could not generate unique invoice number. Please try again.' }, { status: 409 });
      }
    }

    const finalNumber = existingInvoice ? `F-${year}-${month}-${String(Math.floor(Math.random() * 9000) + 1000)}` : invoiceNumber;

    // Calculate due date (30 days from now)
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 30);

    // Calculate totals
    let totalAmount = 0;
    let taxAmount = 0;

    for (const item of templateItems) {
      const qty = parseFloat(String(item.quantity)) || 0;
      const price = parseFloat(String(item.unitPrice)) || 0;
      const discountPct = parseFloat(String(item.discountPct)) || 0;
      const taxRate = parseFloat(String(item.taxRate)) || 20;

      const subtotal = qty * price;
      const discount = subtotal * (discountPct / 100);
      const base = subtotal - discount;
      const tax = base * (taxRate / 100);
      const itemTotal = base + tax;

      totalAmount += itemTotal;
      taxAmount += tax;
    }

    // Create the invoice
    const invoice = await db.invoice.create({
      data: {
        partnerId: recurring.partnerId,
        number: finalNumber,
        date: now,
        dueDate,
        status: 'nacrt',
        type: 'izlazna',
        totalAmount,
        taxAmount,
        recurringId: recurring.id,
        notes: recurring.notes,
        items: {
          create: templateItems.map((item) => {
            const qty = parseFloat(String(item.quantity)) || 0;
            const price = parseFloat(String(item.unitPrice)) || 0;
            const discountPct = parseFloat(String(item.discountPct)) || 0;
            const taxRate = parseFloat(String(item.taxRate)) || 20;
            const subtotal = qty * price;
            const discount = subtotal * (discountPct / 100);
            const base = subtotal - discount;
            const itemTotal = base + (base * (taxRate / 100));

            return {
              productId: (item.productId as string) || '',
              productName: (item.productName as string) || '',
              quantity: qty,
              unitPrice: price,
              discountPct,
              taxRate,
              total: itemTotal,
            };
          }),
        },
      },
      include: {
        partner: true,
        items: true,
      },
    });

    // Advance the nextDate
    const nextDate = new Date(recurring.nextDate);
    switch (recurring.frequency) {
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    // Check if we've exceeded the end date
    const shouldDeactivate = recurring.endDate && nextDate > new Date(recurring.endDate);

    await db.recurringInvoice.update({
      where: { id },
      data: {
        lastGenerated: now,
        nextDate,
        ...(shouldDeactivate ? { isActive: false } : {}),
      },
    });

    return NextResponse.json({
      message: 'Invoice generated successfully',
      invoice,
      deactivated: shouldDeactivate,
    });
  } catch (error) {
    console.error('Error generating invoice from template:', error);
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
  }
}
