import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/rental-vehicles/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const vehicle = await db.rentalVehicle.findUnique({
      where: { id },
      include: {
        _count: { select: { rentals: true } },
        rentals: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vozilo nije pronađeno' }, { status: 404 });
    }

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('Error fetching rental vehicle:', error);
    return NextResponse.json({ error: 'Failed to fetch rental vehicle' }, { status: 500 });
  }
}

// PUT /api/rental-vehicles/[id]
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await db.rentalVehicle.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Vozilo nije pronađeno' }, { status: 404 });
    }

    // Check registration uniqueness if changed
    if (body.registration && body.registration !== existing.registration) {
      const regExists = await db.rentalVehicle.findUnique({ where: { registration: body.registration } });
      if (regExists) {
        return NextResponse.json({ error: 'Vozilo sa ovom registracijom već postoji' }, { status: 409 });
      }
    }

    const vehicle = await db.rentalVehicle.update({
      where: { id },
      data: {
        name: body.name,
        make: body.make,
        model: body.model,
        year: body.year !== undefined ? Number(body.year) : undefined,
        registration: body.registration,
        fuelType: body.fuelType,
        transmission: body.transmission,
        seats: body.seats !== undefined ? Number(body.seats) : undefined,
        dailyRate: body.dailyRate !== undefined ? Number(body.dailyRate) : undefined,
        weeklyRate: body.weeklyRate !== undefined ? (body.weeklyRate ? Number(body.weeklyRate) : null) : undefined,
        monthlyRate: body.monthlyRate !== undefined ? (body.monthlyRate ? Number(body.monthlyRate) : null) : undefined,
        mileage: body.mileage !== undefined ? Number(body.mileage) : undefined,
        status: body.status,
        ac: body.ac !== undefined ? Boolean(body.ac) : undefined,
        gps: body.gps !== undefined ? Boolean(body.gps) : undefined,
        notes: body.notes,
      },
      include: { _count: { select: { rentals: true } } },
    });

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('Error updating rental vehicle:', error);
    return NextResponse.json({ error: 'Failed to update rental vehicle' }, { status: 500 });
  }
}

// DELETE /api/rental-vehicles/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await db.rentalVehicle.findUnique({
      where: { id },
      include: { _count: { select: { rentals: true } } },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Vozilo nije pronađeno' }, { status: 404 });
    }

    if (existing._count.rentals > 0) {
      return NextResponse.json(
        { error: 'Vozilo ne može biti obrisano jer ima povezane iznajmljivanja' },
        { status: 400 }
      );
    }

    await db.rentalVehicle.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting rental vehicle:', error);
    return NextResponse.json({ error: 'Failed to delete rental vehicle' }, { status: 500 });
  }
}
