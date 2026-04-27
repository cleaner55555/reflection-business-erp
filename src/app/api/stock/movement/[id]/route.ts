import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

// DELETE /api/stock/movement/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const movement = await db.stockMovement.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!movement) {
      return NextResponse.json({ error: 'Stock movement not found' }, { status: 404 });
    }

    // Reverse the stock change based on movement type
    let newStock: number;
    switch (movement.type) {
      case 'prijem':
        newStock = movement.product.currentStock - movement.quantity;
        if (newStock < 0) newStock = 0;
        break;
      case 'izdavanje':
        newStock = movement.product.currentStock + movement.quantity;
        break;
      case 'inventura':
      case 'korekcija':
        // For inventura/korekcija, we just delete without reversing stock
        await db.stockMovement.delete({ where: { id } });
        return NextResponse.json({ message: 'Stock movement deleted successfully' });
      default:
        await db.stockMovement.delete({ where: { id } });
        return NextResponse.json({ message: 'Stock movement deleted successfully' });
    }

    // Delete movement and reverse stock in a transaction
    await db.$transaction([
      db.stockMovement.delete({ where: { id } }),
      db.product.update({
        where: { id: movement.productId },
        data: { currentStock: newStock },
      }),
    ]);

    return NextResponse.json({ message: 'Stock movement deleted successfully' });
  } catch (error) {
    console.error('Error deleting stock movement:', error);
    return NextResponse.json({ error: 'Failed to delete stock movement' }, { status: 500 });
  }
}
