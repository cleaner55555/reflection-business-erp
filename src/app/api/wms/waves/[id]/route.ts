import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/wms/waves/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const wave = await db.pickWave.findUnique({
      where: { id },
      include: { lines: { orderBy: { createdAt: 'asc' } } },
    });
    if (!wave) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(wave);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// PUT /api/wms/waves/[id] - Update wave status or pick line
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { status, pickedLineId, pickedQty, pickedFrom, lotNumber, lineNotes } = body;

    if (pickedLineId) {
      const line = await db.pickWaveLine.update({
        where: { id: pickedLineId },
        data: {
          pickedQty: pickedQty || 0,
          pickedFrom: pickedFrom || null,
          lotNumber: lotNumber || null,
          status: (pickedQty || 0) >= 0 ? 'pokupljeno' : 'na_cekanju',
          pickedAt: new Date(),
          notes: lineNotes || null,
        },
      });

      const wave = await db.pickWave.findUnique({
        where: { id },
        include: { lines: true },
      });

      if (wave) {
        const allPicked = wave.lines.every(l => l.status === 'pokupljeno');
        if (allPicked) {
          await db.pickWave.update({
            where: { id },
            data: { status: 'zavrsena', completedAt: new Date() },
          });
          for (const l of wave.lines) {
            await db.stockMovement.create({
              data: {
                companyId: wave.companyId,
                productId: l.productId,
                type: 'izdavanje',
                quantity: l.pickedQty,
                documentRef: wave.name,
                lotNumber: l.lotNumber,
                notes: `Wave picking: ${l.productName}`,
              },
            });
            await db.product.update({
              where: { id: l.productId },
              data: { currentStock: { decrement: l.pickedQty } },
            });
          }
        }
      }

      return NextResponse.json(line);
    }

    if (status) {
      const updateData: Record<string, unknown> = { status };
      if (status === 'u_toku') updateData.startedAt = new Date();
      if (status === 'zavrsena') updateData.completedAt = new Date();

      const wave = await db.pickWave.update({
        where: { id },
        data: updateData,
        include: { lines: true },
      });
      return NextResponse.json(wave);
    }

    return NextResponse.json({ error: 'No action specified' }, { status: 400 });
  } catch (error) {
    console.error('Error updating pick wave:', error);
    return NextResponse.json({ error: 'Failed to update pick wave' }, { status: 500 });
  }
}

// DELETE /api/wms/waves/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const wave = await db.pickWave.findUnique({ where: { id } });
    if (!wave) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (wave.status === 'u_toku' || wave.status === 'zavrsena') {
      return NextResponse.json({ error: 'Cannot delete active or completed wave' }, { status: 400 });
    }
    await db.pickWave.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
