import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/products/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const product = await db.product.findUnique({
      where: { id },
      include: {
        stockMovements: { orderBy: { date: 'desc' }, take: 20 },
        invoiceItems: { orderBy: { id: 'desc' }, take: 10 },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

// PUT /api/products/[id]
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check SKU uniqueness if changed
    if (body.sku && body.sku !== existing.sku) {
      const skuExists = await db.product.findUnique({ where: { sku: body.sku } });
      if (skuExists) {
        return NextResponse.json({ error: 'Product with this SKU already exists' }, { status: 409 });
      }
    }

    const product = await db.product.update({
      where: { id },
      data: {
        name: body.name,
        sku: body.sku,
        barcode: body.barcode,
        category: body.category,
        unit: body.unit,
        purchasePrice: body.purchasePrice !== undefined ? parseFloat(body.purchasePrice) : undefined,
        sellingPrice: body.sellingPrice !== undefined ? parseFloat(body.sellingPrice) : undefined,
        minStock: body.minStock !== undefined ? parseInt(body.minStock) : undefined,
        currentStock: body.currentStock !== undefined ? parseInt(body.currentStock) : undefined,
        description: body.description,
        isActive: body.isActive,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE /api/products/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await db.product.delete({ where: { id } });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
