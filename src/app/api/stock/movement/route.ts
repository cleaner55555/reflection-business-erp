import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, type, quantity, documentRef, notes, locationId } = body;

    if (!productId || !type || quantity === undefined) {
      return NextResponse.json({ error: 'productId, type, and quantity are required' }, { status: 400 });
    }

    const validTypes = ['prijem', 'izdavanje', 'inventura', 'korekcija', 'transfer'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: `Invalid type. Must be one of: ${validTypes.join(', ')}` }, { status: 400 });
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty < 0) {
      return NextResponse.json({ error: 'Quantity must be a positive number' }, { status: 400 });
    }

    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    let newStock: number;
    switch (type) {
      case 'prijem':
        newStock = product.currentStock + qty;
        break;
      case 'izdavanje':
        newStock = product.currentStock - qty;
        if (newStock < 0) {
          return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
        }
        break;
      case 'inventura':
      case 'korekcija':
        newStock = qty;
        break;
      case 'transfer':
        newStock = product.currentStock; // transfer doesn't change total, only location
        break;
      default:
        newStock = product.currentStock;
    }

    const result = await db.$transaction([
      db.stockMovement.create({
        data: {
          productId,
          type,
          quantity: qty,
          documentRef,
          notes,
          locationId: locationId || null,
        },
        include: {
          product: { select: { id: true, name: true, sku: true } },
          location: { select: { id: true, name: true, code: true } },
        },
      }),
      ...(type !== 'transfer'
        ? [db.product.update({ where: { id: productId }, data: { currentStock: newStock } })]
        : []),
    ]);

    return NextResponse.json({
      movement: result[0],
      product: {
        id: productId,
        name: product.name,
        previousStock: product.currentStock,
        newStock: type === 'transfer' ? product.currentStock : newStock,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating stock movement:', error);
    return NextResponse.json({ error: 'Failed to create stock movement' }, { status: 500 });
  }
}
