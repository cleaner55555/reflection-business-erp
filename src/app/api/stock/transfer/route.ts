import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// Stock transfer between warehouse locations
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { companyId, productId, fromLocationId, toLocationId, quantity, notes } = body;

  if (!companyId || !productId || !fromLocationId || !toLocationId || !quantity) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (fromLocationId === toLocationId) {
    return NextResponse.json({ error: 'Source and destination must be different' }, { status: 400 });
  }

  // Create outgoing movement
  const outMovement = await db.stockMovement.create({
    data: {
      companyId,
      productId,
      locationId: fromLocationId,
      type: 'transfer',
      quantity: -quantity,
      notes: notes ? `Transfer: ${notes}` : 'Transfer između lokacija',
    },
  });

  // Create incoming movement
  const inMovement = await db.stockMovement.create({
    data: {
      companyId,
      productId,
      locationId: toLocationId,
      type: 'transfer',
      quantity,
      notes: notes ? `Transfer: ${notes}` : 'Transfer između lokacija',
      documentRef: outMovement.id,
    },
  });

  return NextResponse.json({ outMovement, inMovement, success: true }, { status: 201 });
}
