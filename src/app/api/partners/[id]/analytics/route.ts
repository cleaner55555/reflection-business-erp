import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/partners/[id]/analytics
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Fetch partner basic info
    const partner = await db.partner.findUnique({
      where: { id },
      select: { id: true, name: true, pib: true, type: true, city: true, email: true, phone: true },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Fetch all invoices for this partner
    const invoices = await db.invoice.findMany({
      where: { partnerId: id },
      orderBy: { date: 'desc' },
      include: { items: true },
    });

    // Fetch all purchase orders for this partner
    const purchaseOrders = await db.purchaseOrder.findMany({
      where: { partnerId: id },
      orderBy: { date: 'desc' },
      include: { items: true },
    });

    // Fetch all transactions linked to this partner
    const transactions = await db.transaction.findMany({
      where: { partnerId: id },
      orderBy: { date: 'desc' },
    });

    // Fetch delivery notes for this partner
    const deliveryNotes = await db.deliveryNote.findMany({
      where: { partnerId: id },
      orderBy: { date: 'desc' },
      include: { items: true },
    });

    // Calculate summary
    const izlazneInvoices = invoices.filter((inv) => inv.type === 'izlazna');
    const ulazneInvoices = invoices.filter((inv) => inv.type === 'ulazna');

    const totalInvoiceAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const paidInvoiceAmount = invoices
      .filter((inv) => inv.status === 'placena')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    const unpaidInvoiceAmount = totalInvoiceAmount - paidInvoiceAmount;

    const totalPurchaseAmount = purchaseOrders
      .filter((po) => po.status === 'primljena')
      .reduce((sum, po) => sum + po.totalAmount, 0);

    // Take 10 most recent invoices
    const recentInvoices = invoices.slice(0, 10).map((inv) => ({
      id: inv.id,
      number: inv.number,
      date: inv.date,
      type: inv.type,
      status: inv.status,
      totalAmount: inv.totalAmount,
    }));

    // Take 10 most recent purchase orders
    const recentPurchaseOrders = purchaseOrders.slice(0, 10).map((po) => ({
      id: po.id,
      number: po.number,
      date: po.date,
      status: po.status,
      totalAmount: po.totalAmount,
    }));

    const analytics = {
      partner,
      summary: {
        totalInvoiceAmount,
        paidInvoiceAmount,
        unpaidInvoiceAmount,
        totalPurchaseAmount,
        invoiceCount: invoices.length,
        purchaseOrderCount: purchaseOrders.length,
        deliveryNoteCount: deliveryNotes.length,
        transactionCount: transactions.length,
        totalTransactionAmount: transactions.reduce((sum, tx) => sum + tx.amount, 0),
      },
      recentInvoices,
      recentPurchaseOrders,
      transactions: transactions.slice(0, 20),
      deliveryNotes: deliveryNotes.slice(0, 10).map((dn) => ({
        id: dn.id,
        number: dn.number,
        date: dn.date,
        status: dn.status,
        itemCount: dn.items.length,
        total: dn.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
      })),
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching partner analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch partner analytics' }, { status: 500 });
  }
}
