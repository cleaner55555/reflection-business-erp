import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/recurring-invoices/check — Check which recurring invoices are due and auto-generate them
export async function POST() {
  try {
    const now = new Date();

    // Find all active recurring invoices where nextDate <= today and not expired
    const dueRecurring = await db.recurringInvoice.findMany({
      where: {
        isActive: true,
        nextDate: { lte: now },
        OR: [
          { endDate: null },
          { endDate: { gt: now } },
        ],
      },
      include: {
        partner: true,
      },
    });

    if (dueRecurring.length === 0) {
      return NextResponse.json({ message: 'No recurring invoices due', generated: 0 });
    }

    const results: Array<{ id: string; name: string; invoiceNumber: string; success: boolean; error?: string }> = [];
    let generated = 0;

    for (const recurring of dueRecurring) {
      try {
        // Parse items from JSON
        const templateItems: Array<Record<string, unknown>> = JSON.parse(recurring.items);

        // Generate invoice number
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const count = String(Math.floor(Math.random() * 9000) + 1000);
        const invoiceNumber = `F-${year}-${month}-${count}`;

        // Check for duplicate
        const existingInvoice = await db.invoice.findUnique({ where: { number: invoiceNumber } });
        if (existingInvoice) {
          results.push({
            id: recurring.id,
            name: recurring.name,
            invoiceNumber: '',
            success: false,
            error: 'Duplicate invoice number',
          });
          continue;
        }

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
        await db.invoice.create({
          data: {
            partnerId: recurring.partnerId,
            number: invoiceNumber,
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
          where: { id: recurring.id },
          data: {
            lastGenerated: now,
            nextDate,
            ...(shouldDeactivate ? { isActive: false } : {}),
          },
        });

        results.push({
          id: recurring.id,
          name: recurring.name,
          invoiceNumber,
          success: true,
        });
        generated++;
      } catch (itemError) {
        console.error(`Error generating invoice for recurring ${recurring.id}:`, itemError);
        results.push({
          id: recurring.id,
          name: recurring.name,
          invoiceNumber: '',
          success: false,
          error: String(itemError),
        });
      }
    }

    return NextResponse.json({
      message: `Check completed. ${generated} invoice(s) generated.`,
      generated,
      total: dueRecurring.length,
      results,
    });
  } catch (error) {
    console.error('Error checking recurring invoices:', error);
    return NextResponse.json({ error: 'Failed to check recurring invoices' }, { status: 500 });
  }
}
