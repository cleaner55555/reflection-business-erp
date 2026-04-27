import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/price-lists?active=true|false
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeParam = searchParams.get('active');

    const where: Record<string, unknown> = {};

    if (activeParam !== null && activeParam !== '') {
      where.isActive = activeParam === 'true';
    }

    const priceLists = await db.priceList.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { items: true },
        },
        items: {
          include: {
            product: { select: { id: true, name: true, sku: true, unit: true } },
          },
        },
      },
    });

    return NextResponse.json(priceLists);
  } catch (error) {
    console.error('Error fetching price lists:', error);
    return NextResponse.json({ error: 'Failed to fetch price lists' }, { status: 500 });
  }
}

// POST /api/price-lists
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, description, validFrom, validTo, isActive, items } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'At least one price list item is required' }, { status: 400 });
    }

    for (const item of items) {
      if (!item.productId || !item.price) {
        return NextResponse.json(
          { error: 'Each item must have productId and price' },
          { status: 400 }
        );
      }
    }

    const priceList = await db.priceList.create({
      data: {
        name,
        description,
        validFrom: validFrom ? new Date(validFrom) : null,
        validTo: validTo ? new Date(validTo) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        items: {
          create: items.map((item: Record<string, unknown>) => ({
            productId: item.productId as string,
            price: parseFloat(item.price as string),
            discountPct: parseFloat((item.discountPct as string) || '0'),
          })),
        },
      },
      include: {
        items: { include: { product: true } },
      },
    });

    return NextResponse.json(priceList, { status: 201 });
  } catch (error) {
    console.error('Error creating price list:', error);
    return NextResponse.json({ error: 'Failed to create price list' }, { status: 500 });
  }
}
