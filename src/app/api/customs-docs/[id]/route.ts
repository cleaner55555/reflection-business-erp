import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const existing = await db.customsDoc.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const item = await db.customsDoc.update({
      where: { id },
      data: {
        declarationNo: body.declarationNo !== undefined ? body.declarationNo : undefined,
        docType: body.docType !== undefined ? body.docType : undefined,
        status: body.status !== undefined ? body.status : undefined,
        country: body.country !== undefined ? body.country : undefined,
        borderCrossing: body.borderCrossing !== undefined ? body.borderCrossing : undefined,
        declarantName: body.declarantName !== undefined ? body.declarantName : undefined,
        declarantPIB: body.declarantPIB !== undefined ? body.declarantPIB : undefined,
        goodsDescription: body.goodsDescription !== undefined ? body.goodsDescription : undefined,
        hsCode: body.hsCode !== undefined ? body.hsCode : undefined,
        totalValue: body.totalValue !== undefined ? parseFloat(body.totalValue) : undefined,
        totalWeight: body.totalWeight !== undefined ? parseFloat(body.totalWeight) : undefined,
        currency: body.currency !== undefined ? body.currency : undefined,
        customsValue: body.customsValue !== undefined ? parseFloat(body.customsValue) : undefined,
        dutiesAmount: body.dutiesAmount !== undefined ? parseFloat(body.dutiesAmount) : undefined,
        vatAmount: body.vatAmount !== undefined ? parseFloat(body.vatAmount) : undefined,
        totalDues: body.totalDues !== undefined ? parseFloat(body.totalDues) : undefined,
        vehiclePlate: body.vehiclePlate !== undefined ? body.vehiclePlate : undefined,
        submissionDate: body.submissionDate !== undefined ? body.submissionDate : undefined,
        clearanceDate: body.clearanceDate !== undefined ? (body.clearanceDate || null) : undefined,
        referenceNumber: body.referenceNumber !== undefined ? body.referenceNumber : undefined,
        notes: body.notes !== undefined ? body.notes : undefined,
        items: body.items !== undefined ? JSON.stringify(body.items) : undefined,
      },
    });
    return NextResponse.json(item);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const existing = await db.customsDoc.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await db.customsDoc.delete({ where: { id } });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
