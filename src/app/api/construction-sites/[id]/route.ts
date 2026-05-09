import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const existing = await db.constructionSite.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const item = await db.constructionSite.update({
      where: { id },
      data: {
        code: body.code !== undefined ? body.code : undefined,
        name: body.name !== undefined ? body.name : undefined,
        type: body.type !== undefined ? body.type : undefined,
        status: body.status !== undefined ? body.status : undefined,
        address: body.address !== undefined ? body.address : undefined,
        city: body.city !== undefined ? body.city : undefined,
        investor: body.investor !== undefined ? body.investor : undefined,
        contractor: body.contractor !== undefined ? body.contractor : undefined,
        projectManager: body.projectManager !== undefined ? body.projectManager : undefined,
        workers: body.workers !== undefined ? parseInt(body.workers) : undefined,
        budget: body.budget !== undefined ? parseFloat(body.budget) : undefined,
        spent: body.spent !== undefined ? parseFloat(body.spent) : undefined,
        startDate: body.startDate !== undefined ? body.startDate : undefined,
        endDate: body.endDate !== undefined ? (body.endDate || null) : undefined,
        progress: body.progress !== undefined ? parseInt(body.progress) : undefined,
        area: body.area !== undefined ? parseFloat(body.area) : undefined,
        floors: body.floors !== undefined ? parseInt(body.floors) : undefined,
        units: body.units !== undefined ? parseInt(body.units) : undefined,
        notes: body.notes !== undefined ? body.notes : undefined,
        tasks: body.tasks !== undefined ? JSON.stringify(body.tasks) : undefined,
      },
    });
    return NextResponse.json(item);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const existing = await db.constructionSite.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await db.constructionSite.delete({ where: { id } });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
