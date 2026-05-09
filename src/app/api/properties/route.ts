import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const type = searchParams.get('type') || '';
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (search) where.OR = [
      { title: { contains: search } },
      { address: { contains: search } },
      { city: { contains: search } },
      { neighborhood: { contains: search } },
      { propertyNo: { contains: search } },
    ];
    const items = await db.property.findMany({ where, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(items);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyNo, title, type, transactionType, status, address, city, neighborhood, area, landArea, price, pricePerSqm, bedrooms, bathrooms, floor, yearBuilt, heating, furnishing, parking, elevator, terrace, registered, agent, listedDate, views, inquiries, notes } = body;
    if (!propertyNo || !title) return NextResponse.json({ error: 'propertyNo and title required' }, { status: 400 });
    const item = await db.property.create({
      data: {
        propertyNo, title, type: type || 'apartment', transactionType: transactionType || 'sale', status: status || 'available',
        address: address || '', city: city || '', neighborhood: neighborhood || '',
        area: parseFloat(area) || 0, landArea: parseFloat(landArea) || 0,
        price: parseFloat(price) || 0, pricePerSqm: parseFloat(pricePerSqm) || 0,
        bedrooms: parseInt(bedrooms) || 0, bathrooms: parseInt(bathrooms) || 0,
        floor: floor || '', yearBuilt: parseInt(yearBuilt) || 0,
        heating: heating || 'gas', furnishing: furnishing || 'unfurnished',
        parking: Boolean(parking), elevator: Boolean(elevator), terrace: Boolean(terrace),
        registered: registered !== undefined ? Boolean(registered) : true,
        agent: agent || '', listedDate: listedDate || '',
        views: parseInt(views) || 0, inquiries: parseInt(inquiries) || 0,
        notes: notes || '',
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
