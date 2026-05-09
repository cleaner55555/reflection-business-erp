import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (search) where.OR = [{ name: { contains: search } }, { location: { contains: search } }];
    const items = await db.backupRecord.findMany({ where, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(items);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, status, size, duration, location, expiresAt, autoDelete, encrypted } = body;
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
    const item = await db.backupRecord.create({
      data: {
        name,
        type: type || 'full',
        status: status || 'completed',
        size: size || '0 MB',
        duration: duration || '0m 0s',
        location: location || 'Local',
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        autoDelete: autoDelete !== undefined ? Boolean(autoDelete) : true,
        encrypted: encrypted !== undefined ? Boolean(encrypted) : true,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
