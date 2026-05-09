import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const CATEGORY_MAP: Record<string, string> = {
  appetizer: 'Predjelo', soup: 'Supa', salad: 'Salata', main_course: 'Glavno jelo',
  dessert: 'Desert', drink: 'Piće', side_dish: 'Prilog', breakfast: 'Doručak', grill: 'Roštilj',
};

async function resolveCategoryId(categoryKey: string) {
  const name = CATEGORY_MAP[categoryKey] || categoryKey;
  const cat = await db.restoCategory.findFirst({ where: { name } });
  if (cat) return cat.id;
  const created = await db.restoCategory.create({ data: { name, sortOrder: 0 } });
  return created.id;
}

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

    let categoryId = existing.categoryId;
    if (body.categoryKey && body.categoryKey !== existing.categoryKey) {
      categoryId = await resolveCategoryId(body.categoryKey);
    }

    const menuItem = await db.restoMenuItem.update({
      where: { id },
      data: {
        categoryId,
        categoryKey: body.categoryKey !== undefined ? body.categoryKey : undefined,
        name: body.name,
        description: body.description,
        price: body.price !== undefined ? parseFloat(body.price) : undefined,
        cost: body.cost !== undefined ? parseFloat(body.cost) : undefined,
        image: body.image,
        isAvailable: body.isAvailable !== undefined ? Boolean(body.isAvailable) : undefined,
        sortOrder: body.sortOrder !== undefined ? parseInt(body.sortOrder) : undefined,
        preparationTime: body.preparationTime !== undefined ? parseInt(body.preparationTime) : undefined,
        calories: body.calories !== undefined ? parseInt(body.calories) : undefined,
        isVegetarian: body.isVegetarian !== undefined ? Boolean(body.isVegetarian) : undefined,
        isVegan: body.isVegan !== undefined ? Boolean(body.isVegan) : undefined,
        isGlutenFree: body.isGlutenFree !== undefined ? Boolean(body.isGlutenFree) : undefined,
        isSpicy: body.isSpicy !== undefined ? Boolean(body.isSpicy) : undefined,
        allergens: body.allergens !== undefined ? JSON.stringify(body.allergens) : undefined,
        ingredients: body.ingredients !== undefined ? JSON.stringify(body.ingredients) : undefined,
        rating: body.rating !== undefined ? parseFloat(body.rating) : undefined,
        orderCount: body.orderCount !== undefined ? parseInt(body.orderCount) : undefined,
      },
      include: { category: { select: { id: true, name: true } } },
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
