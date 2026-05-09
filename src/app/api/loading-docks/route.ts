import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const dockNumber = searchParams.get('dockNumber') || '';
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (dockNumber) where.dockNumber = dockNumber;
    if (search) where.OR = [
      { vehiclePlate: { contains: search } },
      { driverName: { contains: search } },
      { companyName: { contains: search } },
    ];
    const items = await db.loadingDock.findMany({ where, orderBy: { scheduledTime: 'asc' } });
    return NextResponse.json(items);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dockNumber, dockType, vehiclePlate, driverName, companyName, appointmentDate, scheduledTime, status, cargoType, cargoWeight, cargoUnit, palletCount, priority, notes, doorAssignment, handlingInstructions } = body;
    if (!dockNumber || !vehiclePlate || !driverName || !companyName) {
      return NextResponse.json({ error: 'dockNumber, vehiclePlate, driverName, companyName required' }, { status: 400 });
    }
    const item = await db.loadingDock.create({
      data: {
        dockNumber: dockNumber || '',
        dockType: dockType || 'unloading',
        vehiclePlate: vehiclePlate || '',
        driverName: driverName || '',
        companyName: companyName || '',
        appointmentDate: appointmentDate || '',
        scheduledTime: scheduledTime || '',
        status: status || 'scheduled',
        cargoType: cargoType || '',
        cargoWeight: parseFloat(cargoWeight) || 0,
        cargoUnit: cargoUnit || 'kg',
        palletCount: parseInt(palletCount) || 0,
        priority: priority || 'normal',
        notes: notes || '',
        doorAssignment: doorAssignment || '',
        handlingInstructions: handlingInstructions || '',
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
