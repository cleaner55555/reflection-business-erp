import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const existing = await db.loadingDock.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const item = await db.loadingDock.update({
      where: { id },
      data: {
        dockNumber: body.dockNumber !== undefined ? body.dockNumber : undefined,
        dockType: body.dockType !== undefined ? body.dockType : undefined,
        vehiclePlate: body.vehiclePlate !== undefined ? body.vehiclePlate : undefined,
        driverName: body.driverName !== undefined ? body.driverName : undefined,
        companyName: body.companyName !== undefined ? body.companyName : undefined,
        appointmentDate: body.appointmentDate !== undefined ? body.appointmentDate : undefined,
        scheduledTime: body.scheduledTime !== undefined ? body.scheduledTime : undefined,
        status: body.status !== undefined ? body.status : undefined,
        cargoType: body.cargoType !== undefined ? body.cargoType : undefined,
        cargoWeight: body.cargoWeight !== undefined ? parseFloat(body.cargoWeight) : undefined,
        cargoUnit: body.cargoUnit !== undefined ? body.cargoUnit : undefined,
        palletCount: body.palletCount !== undefined ? parseInt(body.palletCount) : undefined,
        priority: body.priority !== undefined ? body.priority : undefined,
        notes: body.notes !== undefined ? body.notes : undefined,
        doorAssignment: body.doorAssignment !== undefined ? body.doorAssignment : undefined,
        handlingInstructions: body.handlingInstructions !== undefined ? body.handlingInstructions : undefined,
        actualStart: body.actualStart !== undefined ? body.actualStart : undefined,
        actualEnd: body.actualEnd !== undefined ? body.actualEnd : undefined,
      },
    });
    return NextResponse.json(item);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const existing = await db.loadingDock.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await db.loadingDock.delete({ where: { id } });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
