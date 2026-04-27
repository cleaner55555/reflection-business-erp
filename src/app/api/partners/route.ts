import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/partners?search=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { pib: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { city: { contains: search } },
      ];
    }
    if (type) {
      where.type = type;
    }

    const partners = await db.partner.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { invoices: true, purchaseOrders: true },
        },
      },
    });

    return NextResponse.json(partners);
  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 });
  }
}

// POST /api/partners
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, pib, maticniBr, address, city, zipCode, phone, email, type, account, bank, notes } = body;

    if (!name || !pib) {
      return NextResponse.json({ error: 'Name and PIB are required' }, { status: 400 });
    }

    const existingPartner = await db.partner.findUnique({ where: { pib } });
    if (existingPartner) {
      return NextResponse.json({ error: 'Partner with this PIB already exists' }, { status: 409 });
    }

    const partner = await db.partner.create({
      data: {
        name,
        pib,
        maticniBr,
        address,
        city,
        zipCode,
        phone,
        email,
        type: type || 'kupac',
        account,
        bank,
        notes,
      },
    });

    return NextResponse.json(partner, { status: 201 });
  } catch (error) {
    console.error('Error creating partner:', error);
    return NextResponse.json({ error: 'Failed to create partner' }, { status: 500 });
  }
}
