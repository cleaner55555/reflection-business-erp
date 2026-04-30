import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/rental-vehicles?status=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    const vehicles = await db.rentalVehicle.findMany({
      where,
      include: {
        _count: { select: { rentals: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error('Error fetching rental vehicles:', error);
    return NextResponse.json({ error: 'Failed to fetch rental vehicles' }, { status: 500 });
  }
}

// POST /api/rental-vehicles
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      make,
      model,
      year,
      registration,
      fuelType,
      transmission,
      seats,
      dailyRate,
      weeklyRate,
      monthlyRate,
      mileage,
      status,
      ac,
      gps,
      notes,
    } = body;

    if (!name || !make || !model || !year || !registration || !dailyRate) {
      return NextResponse.json(
        { error: 'Polja naziv, marka, model, godište, registracija i dnevna cena su obavezna' },
        { status: 400 }
      );
    }

    // Check for duplicate registration
    const existingVehicle = await db.rentalVehicle.findUnique({ where: { registration } });
    if (existingVehicle) {
      return NextResponse.json({ error: 'Vozilo sa ovom registracijom već postoji' }, { status: 409 });
    }

    const vehicle = await db.rentalVehicle.create({
      data: {
        name,
        make,
        model,
        year: Number(year),
        registration,
        fuelType: fuelType || 'dizel',
        transmission: transmission || 'automatski',
        seats: Number(seats) || 5,
        dailyRate: Number(dailyRate),
        weeklyRate: weeklyRate ? Number(weeklyRate) : null,
        monthlyRate: monthlyRate ? Number(monthlyRate) : null,
        mileage: Number(mileage) || 0,
        status: status || 'dostupno',
        ac: ac !== undefined ? Boolean(ac) : true,
        gps: gps !== undefined ? Boolean(gps) : false,
        notes,
      },
    });

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    console.error('Error creating rental vehicle:', error);
    return NextResponse.json({ error: 'Failed to create rental vehicle' }, { status: 500 });
  }
}
