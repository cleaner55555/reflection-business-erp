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
      { name: { contains: search } },
      { code: { contains: search } },
      { city: { contains: search } },
      { investor: { contains: search } },
    ];
    const items = await db.constructionSite.findMany({ where, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(items);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, type, status, address, city, investor, contractor, projectManager, workers, budget, spent, startDate, endDate, progress, area, floors, units, notes, tasks } = body;
    if (!code || !name) return NextResponse.json({ error: 'code and name required' }, { status: 400 });
    const item = await db.constructionSite.create({
      data: {
        code, name, type: type || 'residential', status: status || 'planning',
        address: address || '', city: city || '',
        investor: investor || '', contractor: contractor || '', projectManager: projectManager || '',
        workers: parseInt(workers) || 0,
        budget: parseFloat(budget) || 0, spent: parseFloat(spent) || 0,
        startDate: startDate || '', endDate: endDate || null,
        progress: parseInt(progress) || 0,
        area: parseFloat(area) || 0,
        floors: parseInt(floors) || 0, units: parseInt(units) || 0,
        notes: notes || '', tasks: JSON.stringify(tasks || []),
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
