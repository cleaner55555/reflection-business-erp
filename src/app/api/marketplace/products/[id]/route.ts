import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const companyId = searchParams.get('companyId')
  if (!id || !companyId) return NextResponse.json({ error: 'id and companyId required' }, { status: 400 })

  try {
    const body = await req.json()
    const product = await db.mpProduct.update({
      where: { id, companyId },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.sku !== undefined && { sku: body.sku }),
        ...(body.barcode !== undefined && { barcode: body.barcode }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.price !== undefined && { price: body.price }),
        ...(body.compareAtPrice !== undefined && { compareAtPrice: body.compareAtPrice }),
        ...(body.costPrice !== undefined && { costPrice: body.costPrice }),
        ...(body.unit !== undefined && { unit: body.unit }),
        ...(body.stock !== undefined && { stock: body.stock }),
        ...(body.minOrderQty !== undefined && { minOrderQty: body.minOrderQty }),
        ...(body.weight !== undefined && { weight: body.weight }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.isFeatured !== undefined && { isFeatured: body.isFeatured }),
        ...(body.tags !== undefined && { tags: body.tags }),
      },
    })

    return NextResponse.json(product)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const companyId = searchParams.get('companyId')
  if (!id || !companyId) return NextResponse.json({ error: 'id and companyId required' }, { status: 400 })

  try {
    await db.mpProduct.delete({ where: { id, companyId } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
