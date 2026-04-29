import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const count = await db.inventoryCount.update({
    where: { id },
    data: body,
    include: { items: true },
  });

  // If status changed to 'zavrsena', apply differences to stock
  if (body.status === 'zavrsena') {
    const existingItems = await db.inventoryCountItem.findMany({ where: { inventoryCountId: id } });
    for (const item of existingItems) {
      if (item.difference !== 0) {
        await db.stockMovement.create({
          data: {
            companyId: count.companyId,
            productId: item.productId,
            quantity: item.difference,
            type: 'inventura',
            documentRef: `INV-${count.name}`,
            notes: `Inventura: sistemsko=${item.systemQty}, brojeno=${item.countedQty}`,
          },
        });
      }
    }
  }

  return NextResponse.json(count);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.inventoryCountItem.deleteMany({ where: { inventoryCountId: id } });
  await db.inventoryCount.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
