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

// GET /api/resto-menu-items?categoryKey=...&isAvailable=...&search=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryKey = searchParams.get('categoryKey') || '';
    const isAvailable = searchParams.get('isAvailable');
    const search = searchParams.get('search') || '';

    const where: Record<string, unknown> = {};

    if (categoryKey) {
      where.categoryKey = categoryKey;
    }

    if (isAvailable === 'true') where.isAvailable = true;
    else if (isAvailable === 'false') where.isAvailable = false;

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
    const {
      name, description, price, cost, image, isAvailable, sortOrder,
      preparationTime, calories, isVegetarian, isVegan, isGlutenFree, isSpicy,
      allergens, ingredients, rating, orderCount, categoryKey
    } = body;

    if (!name || price === undefined) {
      return NextResponse.json({ error: 'name and price are required' }, { status: 400 });
    }

    const categoryId = await resolveCategoryId(categoryKey || 'main_course');

    const menuItem = await db.restoMenuItem.create({
      data: {
        categoryId,
        categoryKey: categoryKey || 'main_course',
        name,
        description: description || null,
        price: parseFloat(price),
        cost: parseFloat(cost) || 0,
        image: image || null,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
        sortOrder: parseInt(sortOrder) || 0,
        preparationTime: parseInt(preparationTime) || 0,
        calories: parseInt(calories) || 0,
        isVegetarian: Boolean(isVegetarian),
        isVegan: Boolean(isVegan),
        isGlutenFree: Boolean(isGlutenFree),
        isSpicy: Boolean(isSpicy),
        allergens: JSON.stringify(allergens || []),
        ingredients: JSON.stringify(ingredients || []),
        rating: parseFloat(rating) || 0,
        orderCount: parseInt(orderCount) || 0,
      },
      include: { category: { select: { id: true, name: true } } },
    });

    return NextResponse.json(menuItem, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
  }
}
