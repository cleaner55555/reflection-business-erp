import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (search) where.OR = [{ title: { contains: search } }, { author: { contains: search } }];
    const items = await db.libraryBook.findMany({ where, orderBy: { title: 'asc' } });
    return NextResponse.json(items);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title || !body.author) return NextResponse.json({ error: 'Title and author required' }, { status: 400 });
    const item = await db.libraryBook.create({
      data: { isbn: body.isbn || null, title: body.title, author: body.author, publisher: body.publisher || null,
        year: body.year || 0, category: body.category || 'fiction', totalCopies: body.totalCopies || 1,
        availableCopies: body.availableCopies || 1, borrowedCount: body.borrowedCount || 0,
        location: body.location || null, status: body.status || 'available', language: body.language || null,
        pages: body.pages || 0, notes: body.notes || null },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
