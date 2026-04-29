import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT /api/bank-accounts/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, bank, account, currency, isActive, balance } = body;

    const existing = await db.bankAccount.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Bank account not found' }, { status: 404 });
    }

    const updated = await db.bankAccount.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(bank !== undefined && { bank }),
        ...(account !== undefined && { account }),
        ...(currency !== undefined && { currency }),
        ...(isActive !== undefined && { isActive }),
        ...(balance !== undefined && { balance }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating bank account:', error);
    return NextResponse.json({ error: 'Failed to update bank account' }, { status: 500 });
  }
}

// DELETE /api/bank-accounts/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const existing = await db.bankAccount.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Bank account not found' }, { status: 404 });
    }

    await db.bankTransaction.deleteMany({ where: { bankAccountId: id } });
    await db.bankAccount.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting bank account:', error);
    return NextResponse.json({ error: 'Failed to delete bank account' }, { status: 500 });
  }
}
