import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/wms/dashboard
export async function GET() {
  try {
    const [products, locations, lots, waves, receiving, movements] = await Promise.all([
      db.product.findMany({ where: { isActive: true } }),
      db.warehouseLocation.findMany({ where: { isActive: true } }),
      db.lot.findMany(),
      db.pickWave.findMany({ include: { lines: true } }),
      db.receivingOrder.findMany({ include: { lines: true } }),
      db.stockMovement.findMany({
        where: { date: { gte: new Date(Date.now() - 7 * 86400000) } },
      }),
    ]);

    // KPIs
    const totalProducts = products.length;
    const totalStock = products.reduce((s, p) => s + p.currentStock, 0);
    const totalValue = products.reduce((s, p) => s + p.currentStock * p.purchasePrice, 0);
    const lowStock = products.filter(p => p.currentStock > 0 && p.currentStock <= p.minStock).length;
    const outOfStock = products.filter(p => p.currentStock <= 0).length;

    // Zone distribution
    const zones = ['prijem', 'skladistenje', 'otprema', 'kontrola', 'hladjenje', 'return', 'karantin'] as const;
    const zoneCounts: Record<string, number> = {};
    for (const z of zones) {
      zoneCounts[z] = locations.filter(l => l.zone === z).length;
    }

    // Lot alerts
    const now = Date.now();
    const expiredLots = lots.filter(l => l.expiryDate && new Date(l.expiryDate) < new Date(now));
    const expiringSoon = lots.filter(l => l.expiryDate && new Date(l.expiryDate) > new Date(now) && new Date(l.expiryDate) < new Date(now + 30 * 86400000));

    // Wave stats
    const activeWaves = waves.filter(w => w.status === 'u_toku').length;
    const pendingWaves = waves.filter(w => w.status === 'nacrt').length;

    // Receiving stats
    const activeReceiving = receiving.filter(r => r.status === 'u_toku').length;
    const pendingReceiving = receiving.filter(r => r.status === 'nacrt').length;

    // 7-day movements
    const last7In = movements.filter(m => m.type === 'prijem').reduce((s, m) => s + m.quantity, 0);
    const last7Out = movements.filter(m => m.type === 'izdavanje').reduce((s, m) => s + m.quantity, 0);

    return NextResponse.json({
      totalProducts, totalStock, totalValue, lowStock, outOfStock,
      zones: zoneCounts,
      lotAlerts: { expired: expiredLots.length, expiringSoon: expiringSoon.length },
      waves: { active: activeWaves, pending: pendingWaves, total: waves.length },
      receiving: { active: activeReceiving, pending: pendingReceiving, total: receiving.length },
      movements7d: { in: last7In, out: last7Out },
      locations: locations.length,
    });
  } catch (error) {
    console.error('WMS dashboard error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
