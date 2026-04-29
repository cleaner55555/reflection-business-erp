import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  const data: any = {}
  if (body.description !== undefined) data.description = body.description
  if (body.categories !== undefined) data.categories = JSON.stringify(body.categories)
  if (body.deliveryTime !== undefined) data.deliveryTime = body.deliveryTime
  if (body.minOrderAmount !== undefined) data.minOrderAmount = body.minOrderAmount
  if (body.commissionRate !== undefined) data.commissionRate = body.commissionRate
  if (body.paymentTerms !== undefined) data.paymentTerms = body.paymentTerms
  if (body.shippingFree !== undefined) data.shippingFree = body.shippingFree
  if (body.bankAccount !== undefined) data.bankAccount = body.bankAccount

  // Status changes
  if (body.status === 'active') {
    data.status = 'active'
    data.approvedAt = new Date()
  } else if (body.status === 'suspended' || body.status === 'rejected') {
    data.status = body.status
  } else if (body.status) {
    data.status = body.status
  }

  if (body.rating !== undefined) data.rating = body.rating
  if (body.reviewCount !== undefined) data.reviewCount = body.reviewCount
  if (body.totalSales !== undefined) data.totalSales = body.totalSales
  if (body.totalOrders !== undefined) data.totalOrders = body.totalOrders

  try {
    const vendor = await db.mpVendor.update({ where: { id }, data })
    return NextResponse.json(vendor)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await db.mpVendor.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
