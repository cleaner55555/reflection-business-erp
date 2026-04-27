import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

// PUT /api/resto-menu-items/[id]
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await db.restoMenuItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    const menuItem = await db.restoMenuItem.update({
      where: { id },
      data: {
        categoryId: body.categoryId,
        name: body.name,
        description: body.description,
        price: body.price !== undefined ? parseFloat(body.price) : undefined,
        cost: body.cost !== undefined ? parseFloat(body.cost) : undefined,
        image: body.image,
        isAvailable: body.isAvailable !== undefined ? Boolean(body.isAvailable) : undefined,
        sortOrder: body.sortOrder !== undefined ? parseInt(body.sortOrder) : undefined,
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(menuItem);
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 });
  }
}

// DELETE /api/resto-menu-items/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await db.restoMenuItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    await db.restoMenuItem.delete({ where: { id } });

    return NextResponse.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
  }
}
