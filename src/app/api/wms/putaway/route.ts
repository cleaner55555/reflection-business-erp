import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/wms/putaway?productId=...
// Suggests best location for putaway based on zone assignment and existing stock
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId') || '';
    const categoryId = searchParams.get('category') || '';

    // Get all active storage locations (skladistenje zone)
    const locations = await db.warehouseLocation.findMany({
      where: { isActive: true, zone: 'skladistenje' },
      include: {
        lots: { where: { quantity: { gt: 0 } } },
        stockMovements: {
          where: { date: { gte: new Date(Date.now() - 30 * 86400000) } },
          take: 50,
        },
      },
    });

    // Calculate utilization and suggest best location
    const suggestions = locations.map(loc => {
      const usedCapacity = loc.lots.reduce((s, l) => s + l.quantity, 0);
      const movementFreq = loc.stockMovements.length;
      const available = loc.capacity > 0 ? loc.capacity - usedCapacity : Infinity;

      // Score: prefer locations with same category items, low utilization, moderate activity
      let score = 50;
      if (available > 0) score += 20;
      if (loc.capacity > 0 && usedCapacity / loc.capacity < 0.5) score += 10;
      if (movementFreq > 0 && movementFreq < 20) score += 5; // active but not overloaded

      return {
        id: loc.id,
        code: loc.code,
        name: loc.name,
        type: loc.type,
        usedCapacity,
        capacity: loc.capacity,
        utilization: loc.capacity > 0 ? Math.round((usedCapacity / loc.capacity) * 100) : 0,
        available,
        movementFreq,
        score,
        lotsCount: loc.lots.length,
      };
    });

    // Sort by score descending
    suggestions.sort((a, b) => b.score - a.score);

    return NextResponse.json(suggestions.slice(0, 10));
  } catch (error) {
    console.error('Putaway error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
