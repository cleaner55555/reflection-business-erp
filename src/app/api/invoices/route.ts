import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { invoiceSchema, validateRequest } from '@/lib/validations';
import { withMonitoring } from '@/lib/monitoring/profiler';

// GET /api/invoices?search=...&status=...&type=...&partnerId=...&dateFrom=...&dateTo=...
export const GET = withMonitoring('GET /api/invoices', async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const type = searchParams.get('type') || '';
    const partnerId = searchParams.get('partnerId') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const sefStatus = searchParams.get('sefStatus') || '';

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { number: { contains: search } },
        { partner: { name: { contains: search } } },
        { notes: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (partnerId) {
      where.partnerId = partnerId;
    }

    if (sefStatus) {
      where.sefStatus = sefStatus;
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) {
        (where.date as Record<string, unknown>).gte = new Date(dateFrom);
      }
      if (dateTo) {
        (where.date as Record<string, unknown>).lte = new Date(dateTo);
      }
    }

    const invoices = await db.invoice.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        partner: { select: { id: true, name: true, pib: true } },
        items: true,
      },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
});

// POST /api/invoices
export const POST = withMonitoring('POST /api/invoices', async (request: NextRequest) => {
  try {
    const body = await request.json();

    const validation = validateRequest(invoiceSchema, body);
    if (!validation.success) return validation.response;

    const { partnerId, number, date, dueDate, status, type, discountPct, notes, paymentMethod, items } = validation.data;

    // Check for duplicate invoice number
    const existingInvoice = await db.invoice.findUnique({ where: { number } });
    if (existingInvoice) {
      return NextResponse.json({ error: 'Invoice with this number already exists' }, { status: 409 });
    }

    // Calculate totals
    const totalAmount = items.reduce((sum: number, item: Record<string, number>) => {
      const subtotal = item.quantity * item.unitPrice;
      const discount = subtotal * ((item.discountPct || 0) / 100);
      const tax = (subtotal - discount) * ((item.taxRate || 20) / 100);
      return sum + subtotal - discount + tax;
    }, 0);

    const taxAmount = items.reduce((sum: number, item: Record<string, number>) => {
      const subtotal = item.quantity * item.unitPrice;
      const discount = subtotal * ((item.discountPct || 0) / 100);
      const tax = (subtotal - discount) * ((item.taxRate || 20) / 100);
      return sum + tax;
    }, 0);

    const invoice = await db.invoice.create({
      data: {
        partnerId,
        number,
        date: date ? new Date(date) : undefined,
        dueDate: new Date(dueDate),
        status: status || 'nacrt',
        type: type || 'izlazna',
        totalAmount,
        taxAmount,
        discountPct: parseFloat(discountPct) || 0,
        notes,
        paymentMethod: paymentMethod || 'racun',
        items: {
          create: items.map((item: Record<string, unknown>) => ({
            productId: item.productId as string,
            productName: item.productName as string,
            quantity: parseFloat(item.quantity as string),
            unitPrice: parseFloat(item.unitPrice as string),
            discountPct: parseFloat((item.discountPct as string) || '0'),
            taxRate: parseFloat((item.taxRate as string) || '20'),
            total:
              parseFloat(item.quantity as string) * parseFloat(item.unitPrice as string) *
              (1 + parseFloat((item.discountPct as string) || '0') / 100) *
              (1 + parseFloat((item.taxRate as string) || '20') / 100),
          })),
        },
      },
      include: {
        partner: true,
        items: true,
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
});
