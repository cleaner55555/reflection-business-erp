import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/price-lists/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const priceList = await db.priceList.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
      },
    });

    if (!priceList) {
      return NextResponse.json({ error: 'Price list not found' }, { status: 404 });
    }

    return NextResponse.json(priceList);
  } catch (error) {
    console.error('Error fetching price list:', error);
    return NextResponse.json({ error: 'Failed to fetch price list' }, { status: 500 });
  }
}

// PUT /api/price-lists/[id]
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await db.priceList.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Price list not found' }, { status: 404 });
    }

    // If items are provided, replace them all
    if (body.items && Array.isArray(body.items)) {
      await db.priceListItem.deleteMany({ where: { priceListId: id } });

      const priceList = await db.priceList.update({
        where: { id },
        data: {
          name: body.name,
          description: body.description,
          validFrom: body.validFrom ? new Date(body.validFrom) : null,
          validTo: body.validTo ? new Date(body.validTo) : null,
          isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
          items: {
            create: body.items.map((item: Record<string, unknown>) => ({
              productId: item.productId as string,
              price: parseFloat(item.price as string),
              discountPct: parseFloat((item.discountPct as string) || '0'),
            })),
          },
        },
        include: { items: { include: { product: true } } },
      });

      return NextResponse.json(priceList);
    }

    // Update without changing items
    const priceList = await db.priceList.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        validFrom: body.validFrom ? new Date(body.validFrom) : null,
        validTo: body.validTo ? new Date(body.validTo) : null,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
      },
      include: { items: { include: { product: true } } },
    });

    return NextResponse.json(priceList);
  } catch (error) {
    console.error('Error updating price list:', error);
    return NextResponse.json({ error: 'Failed to update price list' }, { status: 500 });
  }
}

// DELETE /api/price-lists/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await db.priceList.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Price list not found' }, { status: 404 });
    }

    // PriceListItems are deleted via cascade
    await db.priceList.delete({ where: { id } });

    return NextResponse.json({ message: 'Price list deleted successfully' });
  } catch (error) {
    console.error('Error deleting price list:', error);
    return NextResponse.json({ error: 'Failed to delete price list' }, { status: 500 });
  }
}
