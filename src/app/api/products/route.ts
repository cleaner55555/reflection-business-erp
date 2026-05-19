import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { productSchema, validateRequest } from '@/lib/validations';
import { withMonitoring } from '@/lib/monitoring/profiler';

// GET /api/products?search=...&category=...&lowStock=true
export const GET = withMonitoring('GET /api/products', async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const lowStock = searchParams.get('lowStock') === 'true';
    const activeOnly = searchParams.get('activeOnly') !== 'false';

    const where: Record<string, unknown> = {};

    if (activeOnly) {
      where.isActive = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { barcode: { contains: search } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (lowStock) {
      where.currentStock = { lte: 0 };
    }

    const products = await db.product.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
});

// POST /api/products
export const POST = withMonitoring('POST /api/products', async (request: NextRequest) => {
  try {
    const body = await request.json();

    const validation = validateRequest(productSchema, body);
    if (!validation.success) return validation.response;

    const { name, sku, barcode, category, unit, purchasePrice, sellingPrice, minStock, currentStock, description } = validation.data;

    // Check for duplicate SKU

    const existingProduct = await db.product.findUnique({ where: { sku } });
    if (existingProduct) {
      return NextResponse.json({ error: 'Product with this SKU already exists' }, { status: 409 });
    }

    const product = await db.product.create({
      data: {
        name,
        sku,
        barcode,
        category,
        unit: unit || 'kom',
        purchasePrice: parseFloat(purchasePrice),
        sellingPrice: parseFloat(sellingPrice),
        minStock: parseInt(minStock) || 0,
        currentStock: parseInt(currentStock) || 0,
        description,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
});
