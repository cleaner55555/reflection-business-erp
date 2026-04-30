import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/bank-transactions/[id]/match
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { invoiceId } = body;

    if (!invoiceId) {
      return NextResponse.json({ error: 'invoiceId is required' }, { status: 400 });
    }

    const transaction = await db.bankTransaction.findUnique({
      where: { id },
      include: { bankAccount: true },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: { partner: { select: { name: true } } },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Update transaction
    const updated = await db.bankTransaction.update({
      where: { id },
      data: {
        isReconciled: true,
        invoiceId,
      },
    });

    // Mark invoice as paid
    await db.invoice.update({
      where: { id: invoiceId },
      data: { status: 'placena' },
    });

    // Create internal transaction record
    await db.transaction.create({
      data: {
        date: new Date(),
        type: 'prihod',
        category: 'promet',
        amount: transaction.amount,
        description: `Banka: plaćena faktura ${invoice.number} - ${invoice.partner?.name || ''}`,
        documentRef: invoice.number,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error matching bank transaction:', error);
    return NextResponse.json({ error: 'Failed to match bank transaction' }, { status: 500 });
  }
}

// DELETE /api/bank-transactions/[id]/match — unlink transaction from invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const transaction = await db.bankTransaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.invoiceId) {
      // Optionally revert invoice status back to poslata
      const invoice = await db.invoice.findUnique({ where: { id: transaction.invoiceId } });
      if (invoice && invoice.status === 'placena') {
        await db.invoice.update({
          where: { id: transaction.invoiceId },
          data: { status: 'poslata' },
        });
      }
    }

    // Unlink transaction
    const updated = await db.bankTransaction.update({
      where: { id },
      data: {
        isReconciled: false,
        invoiceId: null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error unmatching bank transaction:', error);
    return NextResponse.json({ error: 'Failed to unmatch bank transaction' }, { status: 500 });
  }
}
