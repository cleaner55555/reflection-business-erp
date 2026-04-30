import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/resto-categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') !== 'false';

    const categories = await db.restoCategory.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { sortOrder: 'asc' },
      include: {
        items: {
          where: activeOnly ? { isAvailable: true } : undefined,
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching resto categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST /api/resto-categories
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, sortOrder, isActive } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const category = await db.restoCategory.create({
      data: {
        name,
        sortOrder: parseInt(sortOrder) || 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating resto category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
