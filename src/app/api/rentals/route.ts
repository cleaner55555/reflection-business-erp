import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/rentals?status=...&vehicleId=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const vehicleId = searchParams.get('vehicleId') || '';

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    const rentals = await db.rental.findMany({
      where,
      include: {
        vehicle: {
          select: { id: true, name: true, make: true, model: true, registration: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(rentals);
  } catch (error) {
    console.error('Error fetching rentals:', error);
    return NextResponse.json({ error: 'Failed to fetch rentals' }, { status: 500 });
  }
}

// POST /api/rentals
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      number,
      vehicleId,
      clientName,
      clientPhone,
      clientEmail,
      clientIdDoc,
      startDate,
      endDate,
      pickupMileage,
      dailyRate,
      totalDays,
      totalAmount,
      deposit,
      status,
      notes,
    } = body;

    if (!number || !vehicleId || !clientName || !startDate || !endDate || !dailyRate || !totalDays || !totalAmount) {
      return NextResponse.json(
        { error: 'Polja broj, vozilo, ime klijenta, datum početka, datum završetka, dnevna cena, broj dana i ukupan iznos su obavezna' },
        { status: 400 }
      );
    }

    // Check for duplicate rental number
    const existingRental = await db.rental.findUnique({ where: { number } });
    if (existingRental) {
      return NextResponse.json({ error: 'Iznajmljivanje sa ovim brojem već postoji' }, { status: 409 });
    }

    // Verify vehicle exists
    const vehicle = await db.rentalVehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      return NextResponse.json({ error: 'Vozilo nije pronađeno' }, { status: 404 });
    }

    const rental = await db.rental.create({
      data: {
        number,
        vehicleId,
        clientName,
        clientPhone,
        clientEmail,
        clientIdDoc,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        pickupMileage: Number(pickupMileage) || 0,
        returnMileage: body.returnMileage !== undefined ? Number(body.returnMileage) : null,
        dailyRate: Number(dailyRate),
        totalDays: Number(totalDays),
        totalAmount: Number(totalAmount),
        deposit: Number(deposit) || 0,
        status: status || 'rezervacija',
        notes,
      },
      include: {
        vehicle: {
          select: { id: true, name: true, make: true, model: true, registration: true },
        },
      },
    });

    // Update vehicle status if rental is active
    if (rental.status === 'aktivna') {
      await db.rentalVehicle.update({
        where: { id: vehicleId },
        data: { status: 'iznajmljeno' },
      });
    } else if (rental.status === 'rezervacija') {
      await db.rentalVehicle.update({
        where: { id: vehicleId },
        data: { status: 'rezervisano' },
      });
    }

    return NextResponse.json(rental, { status: 201 });
  } catch (error) {
    console.error('Error creating rental:', error);
    return NextResponse.json({ error: 'Failed to create rental' }, { status: 500 });
  }
}
