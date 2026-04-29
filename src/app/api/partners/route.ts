import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/partners?search=...&type=...&tag=...&isActive=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const tag = searchParams.get('tag') || '';
    const isActive = searchParams.get('isActive') || '';
    const hasCreditLimit = searchParams.get('hasCreditLimit') || '';

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { pib: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { city: { contains: search } },
        { maticniBr: { contains: search } },
      ];
    }
    if (type) {
      where.type = type;
    }
    if (tag) {
      where.tags = { contains: tag };
    }
    if (isActive === 'true') {
      where.isActive = true;
    } else if (isActive === 'false') {
      where.isActive = false;
    }
    if (hasCreditLimit === 'true') {
      where.creditLimit = { gt: 0 };
    }

    const partners = await db.partner.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { invoices: true, purchaseOrders: true, contacts: true, projects: true, children: true, deals: true },
        },
      },
    });

    return NextResponse.json(partners);
  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 });
  }
}

// GET /api/partners/stats - Dashboard statistics
export async function STATS() {
  try {
    const total = await db.partner.count();
    const kupci = await db.partner.count({ where: { type: 'kupac' } });
    const dobavljaci = await db.partner.count({ where: { type: 'dobavljac' } });
    const partneri = await db.partner.count({ where: { type: 'partner' } });
    const activeCount = await db.partner.count({ where: { isActive: true } });
    const inactiveCount = await db.partner.count({ where: { isActive: false } });

    // Partners with credit limits
    const withCredit = await db.partner.findMany({
      where: { creditLimit: { gt: 0 } },
      include: {
        _count: { select: { invoices: true } },
      },
      take: 50,
    });

    // New partners this month
    const firstOfMonth = new Date();
    firstOfMonth.setDate(1);
    firstOfMonth.setHours(0, 0, 0, 0);
    const newThisMonth = await db.partner.count({
      where: { createdAt: { gte: firstOfMonth } },
    });

    // Top partners by invoice count
    const topPartners = await db.partner.findMany({
      take: 10,
      orderBy: { invoices: { _count: 'desc' } },
      select: {
        id: true,
        name: true,
        type: true,
        city: true,
        _count: { select: { invoices: true, purchaseOrders: true, deals: true } },
      },
    });

    // Partners by city
    const cityGroups = await db.partner.groupBy({
      by: ['city'],
      where: { city: { not: null } },
      _count: { city: true },
      orderBy: { _count: { city: 'desc' } },
      take: 10,
    });

    // Tags distribution
    const allPartners = await db.partner.findMany({
      select: { tags: true },
      where: { tags: { not: null } },
    });
    const tagCounts: Record<string, number> = {};
    for (const p of allPartners) {
      if (p.tags) {
        try {
          const tags = JSON.parse(p.tags) as string[];
          for (const tag of tags) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        } catch {
          // skip invalid JSON
        }
      }
    }

    return NextResponse.json({
      total,
      byType: { kupci, dobavljaci, partneri },
      active: activeCount,
      inactive: inactiveCount,
      newThisMonth,
      topPartners,
      cityGroups,
      tagCounts,
      partnersWithCredit: withCredit.length,
    });
  } catch (error) {
    console.error('Error fetching partner stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

// POST /api/partners
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, pib, maticniBr, address, city, zipCode, phone, email, type, account, bank, notes, creditLimit, paymentTerms, parentId, tags, website } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Check PIB uniqueness if provided
    if (pib) {
      const existingPartner = await db.partner.findFirst({ where: { pib } });
      if (existingPartner) {
        return NextResponse.json({ error: 'Partner with this PIB already exists' }, { status: 409 });
      }
    }

    // Parse tags
    let parsedTags: string | null = null;
    if (tags) {
      if (typeof tags === 'string') {
        // Check if it's already JSON
        try {
          JSON.parse(tags);
          parsedTags = tags;
        } catch {
          // Comma-separated string
          parsedTags = JSON.stringify(tags.split(',').map((t: string) => t.trim()).filter(Boolean));
        }
      } else if (Array.isArray(tags)) {
        parsedTags = JSON.stringify(tags);
      }
    }

    const partner = await db.partner.create({
      data: {
        name,
        pib: pib || null,
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
        creditLimit: creditLimit ? Number(creditLimit) : 0,
        paymentTerms: paymentTerms ? Number(paymentTerms) : 0,
        parentId: parentId || null,
        tags: parsedTags,
      },
    });

    return NextResponse.json(partner, { status: 201 });
  } catch (error) {
    console.error('Error creating partner:', error);
    return NextResponse.json({ error: 'Failed to create partner' }, { status: 500 });
  }
}
