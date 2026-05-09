import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const existing = await db.property.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const item = await db.property.update({
      where: { id },
      data: {
        propertyNo: body.propertyNo !== undefined ? body.propertyNo : undefined,
        title: body.title !== undefined ? body.title : undefined,
        type: body.type !== undefined ? body.type : undefined,
        transactionType: body.transactionType !== undefined ? body.transactionType : undefined,
        status: body.status !== undefined ? body.status : undefined,
        address: body.address !== undefined ? body.address : undefined,
        city: body.city !== undefined ? body.city : undefined,
        neighborhood: body.neighborhood !== undefined ? body.neighborhood : undefined,
        area: body.area !== undefined ? parseFloat(body.area) : undefined,
        landArea: body.landArea !== undefined ? parseFloat(body.landArea) : undefined,
        price: body.price !== undefined ? parseFloat(body.price) : undefined,
        pricePerSqm: body.pricePerSqm !== undefined ? parseFloat(body.pricePerSqm) : undefined,
        bedrooms: body.bedrooms !== undefined ? parseInt(body.bedrooms) : undefined,
        bathrooms: body.bathrooms !== undefined ? parseInt(body.bathrooms) : undefined,
        floor: body.floor !== undefined ? body.floor : undefined,
        yearBuilt: body.yearBuilt !== undefined ? parseInt(body.yearBuilt) : undefined,
        heating: body.heating !== undefined ? body.heating : undefined,
        furnishing: body.furnishing !== undefined ? body.furnishing : undefined,
        parking: body.parking !== undefined ? Boolean(body.parking) : undefined,
        elevator: body.elevator !== undefined ? Boolean(body.elevator) : undefined,
        terrace: body.terrace !== undefined ? Boolean(body.terrace) : undefined,
        registered: body.registered !== undefined ? Boolean(body.registered) : undefined,
        agent: body.agent !== undefined ? body.agent : undefined,
        listedDate: body.listedDate !== undefined ? body.listedDate : undefined,
        views: body.views !== undefined ? parseInt(body.views) : undefined,
        inquiries: body.inquiries !== undefined ? parseInt(body.inquiries) : undefined,
        notes: body.notes !== undefined ? body.notes : undefined,
      },
    });
    return NextResponse.json(item);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const existing = await db.property.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await db.property.delete({ where: { id } });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
