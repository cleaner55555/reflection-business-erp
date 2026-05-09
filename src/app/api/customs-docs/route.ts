import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const docType = searchParams.get('docType') || '';
    const search = searchParams.get('search') || '';
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (docType) where.docType = docType;
    if (search) where.OR = [
      { declarationNo: { contains: search } },
      { declarantName: { contains: search } },
      { goodsDescription: { contains: search } },
      { referenceNumber: { contains: search } },
    ];
    const items = await db.customsDoc.findMany({ where, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(items);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { declarationNo, docType, status, country, borderCrossing, declarantName, declarantPIB, goodsDescription, hsCode, totalValue, totalWeight, currency, customsValue, dutiesAmount, vatAmount, totalDues, vehiclePlate, submissionDate, clearanceDate, referenceNumber, notes, items } = body;
    if (!declarationNo) return NextResponse.json({ error: 'Declaration number required' }, { status: 400 });
    const item = await db.customsDoc.create({
      data: {
        declarationNo,
        docType: docType || 'import',
        status: status || 'draft',
        country: country || '',
        borderCrossing: borderCrossing || '',
        declarantName: declarantName || '',
        declarantPIB: declarantPIB || '',
        goodsDescription: goodsDescription || '',
        hsCode: hsCode || '',
        totalValue: parseFloat(totalValue) || 0,
        totalWeight: parseFloat(totalWeight) || 0,
        currency: currency || 'EUR',
        customsValue: parseFloat(customsValue) || 0,
        dutiesAmount: parseFloat(dutiesAmount) || 0,
        vatAmount: parseFloat(vatAmount) || 0,
        totalDues: parseFloat(totalDues) || 0,
        vehiclePlate: vehiclePlate || '',
        submissionDate: submissionDate || '',
        clearanceDate: clearanceDate || null,
        referenceNumber: referenceNumber || '',
        notes: notes || '',
        items: JSON.stringify(items || []),
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
