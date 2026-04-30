import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/resto-menu-items?categoryId=...&isAvailable=...&search=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId') || '';
    const isAvailable = searchParams.get('isAvailable');
    const search = searchParams.get('search') || '';

    const where: Record<string, unknown> = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (isAvailable === 'true') {
      where.isAvailable = true;
    } else if (isAvailable === 'false') {
      where.isAvailable = false;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const menuItems = await db.restoMenuItem.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 });
  }
}

// POST /api/resto-menu-items
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categoryId, name, description, price, cost, image, isAvailable, sortOrder } = body;

    if (!categoryId || !name || price === undefined) {
      return NextResponse.json(
        { error: 'categoryId, name, and price are required' },
        { status: 400 }
      );
    }

    const menuItem = await db.restoMenuItem.create({
      data: {
        categoryId,
        name,
        description,
        price: parseFloat(price),
        cost: parseFloat(cost) || 0,
        image,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
        sortOrder: parseInt(sortOrder) || 0,
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(menuItem, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
  }
}
