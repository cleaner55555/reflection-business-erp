import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/stock/movement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { productId, type, quantity, documentRef, notes } = body;

    if (!productId || !type || quantity === undefined) {
      return NextResponse.json({ error: 'productId, type, and quantity are required' }, { status: 400 });
    }

    const validTypes = ['prijem', 'izdavanje', 'inventura', 'korekcija'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty < 0) {
      return NextResponse.json({ error: 'Quantity must be a positive number' }, { status: 400 });
    }

    // Verify product exists
    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Update product stock based on movement type
    let newStock: number;
    switch (type) {
      case 'prijem':
        newStock = product.currentStock + qty;
        break;
      case 'izdavanje':
        newStock = product.currentStock - qty;
        if (newStock < 0) {
          return NextResponse.json(
            { error: 'Insufficient stock for this movement' },
            { status: 400 }
          );
        }
        break;
      case 'inventura':
        newStock = qty;
        break;
      case 'korekcija':
        newStock = qty;
        break;
      default:
        newStock = product.currentStock;
    }

    // Create movement and update product stock in a transaction
    const result = await db.$transaction([
      db.stockMovement.create({
        data: {
          productId,
          type,
          quantity: qty,
          documentRef,
          notes,
        },
        include: {
          product: { select: { id: true, name: true, sku: true } },
        },
      }),
      db.product.update({
        where: { id: productId },
        data: { currentStock: newStock },
      }),
    ]);

    return NextResponse.json(
      {
        movement: result[0],
        product: {
          id: productId,
          name: product.name,
          previousStock: product.currentStock,
          newStock,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating stock movement:', error);
    return NextResponse.json({ error: 'Failed to create stock movement' }, { status: 500 });
  }
}
