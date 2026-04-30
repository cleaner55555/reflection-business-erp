import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/partners/stats
export async function GET() {
  try {
    const total = await db.partner.count();
    const kupci = await db.partner.count({ where: { type: 'kupac' } });
    const dobavljaci = await db.partner.count({ where: { type: 'dobavljac' } });
    const partneri = await db.partner.count({ where: { type: 'partner' } });
    const activeCount = await db.partner.count({ where: { isActive: true } });
    const inactiveCount = total - activeCount;

    // Partners with credit limits
    const partnersWithCredit = await db.partner.findMany({
      where: { creditLimit: { gt: 0 }, isActive: true },
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

    // Top partners
    const topPartners = await db.partner.findMany({
      where: { isActive: true },
      take: 10,
      include: {
        _count: { select: { invoices: true, purchaseOrders: true, deals: true, contacts: true } },
      },
      orderBy: { name: 'asc' },
    });

    // Partners by city
    const cityGroups = await db.partner.groupBy({
      by: ['city'],
      where: { city: { not: null, not: '' }, isActive: true },
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

    const allTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    return NextResponse.json({
      total,
      byType: { kupci, dobavljaci, partneri },
      active: activeCount,
      inactive: inactiveCount,
      newThisMonth,
      topPartners,
      cityGroups,
      tagCounts,
      allTags,
      partnersWithCredit,
    });
  } catch (error) {
    console.error('Error fetching partner stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
