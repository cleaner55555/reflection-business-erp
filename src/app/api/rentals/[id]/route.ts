import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/rentals/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const rental = await db.rental.findUnique({
      where: { id },
      include: {
        vehicle: true,
      },
    });

    if (!rental) {
      return NextResponse.json({ error: 'Iznajmljivanje nije pronađeno' }, { status: 404 });
    }

    return NextResponse.json(rental);
  } catch (error) {
    console.error('Error fetching rental:', error);
    return NextResponse.json({ error: 'Failed to fetch rental' }, { status: 500 });
  }
}

// PUT /api/rentals/[id]
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await db.rental.findUnique({
      where: { id },
      include: { vehicle: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Iznajmljivanje nije pronađeno' }, { status: 404 });
    }

    // Check rental number uniqueness if changed
    if (body.number && body.number !== existing.number) {
      const numExists = await db.rental.findUnique({ where: { number: body.number } });
      if (numExists) {
        return NextResponse.json({ error: 'Iznajmljivanje sa ovim brojem već postoji' }, { status: 409 });
      }
    }

    const oldStatus = existing.status;
    const newStatus = body.status || oldStatus;

    const rental = await db.rental.update({
      where: { id },
      data: {
        number: body.number,
        vehicleId: body.vehicleId,
        clientName: body.clientName,
        clientPhone: body.clientPhone,
        clientEmail: body.clientEmail,
        clientIdDoc: body.clientIdDoc,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        pickupMileage: body.pickupMileage !== undefined ? Number(body.pickupMileage) : undefined,
        returnMileage: body.returnMileage !== undefined ? (body.returnMileage ? Number(body.returnMileage) : null) : undefined,
        dailyRate: body.dailyRate !== undefined ? Number(body.dailyRate) : undefined,
        totalDays: body.totalDays !== undefined ? Number(body.totalDays) : undefined,
        totalAmount: body.totalAmount !== undefined ? Number(body.totalAmount) : undefined,
        deposit: body.deposit !== undefined ? Number(body.deposit) : undefined,
        status: newStatus,
        notes: body.notes,
      },
      include: {
        vehicle: true,
      },
    });

    // Update vehicle status based on rental status change
    if (oldStatus !== newStatus) {
      const vehicleId = rental.vehicleId;

      if (newStatus === 'aktivna') {
        await db.rentalVehicle.update({
          where: { id: vehicleId },
          data: { status: 'iznajmljeno' },
        });
      } else if (newStatus === 'zavrsena') {
        // Check if vehicle has other active rentals
        const activeRentals = await db.rental.count({
          where: { vehicleId, status: { in: ['rezervacija', 'aktivna'] } },
        });
        if (activeRentals === 0) {
          await db.rentalVehicle.update({
            where: { id: vehicleId },
            data: { status: 'dostupno' },
          });
        }
        // Update vehicle mileage if returnMileage is set
        if (rental.returnMileage) {
          await db.rentalVehicle.update({
            where: { id: vehicleId },
            data: { mileage: rental.returnMileage },
          });
        }
      } else if (newStatus === 'otkazana') {
        // Check if vehicle has other active rentals
        const activeRentals = await db.rental.count({
          where: { vehicleId, status: { in: ['rezervacija', 'aktivna'] } },
        });
        if (activeRentals === 0) {
          await db.rentalVehicle.update({
            where: { id: vehicleId },
            data: { status: 'dostupno' },
          });
        }
      } else if (newStatus === 'rezervacija' && oldStatus !== 'rezervacija') {
        await db.rentalVehicle.update({
          where: { id: vehicleId },
          data: { status: 'rezervisano' },
        });
      }
    }

    return NextResponse.json(rental);
  } catch (error) {
    console.error('Error updating rental:', error);
    return NextResponse.json({ error: 'Failed to update rental' }, { status: 500 });
  }
}

// DELETE /api/rentals/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await db.rental.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Iznajmljivanje nije pronađeno' }, { status: 404 });
    }

    await db.rental.delete({ where: { id } });

    // Check if vehicle has other active rentals, if not set to available
    const activeRentals = await db.rental.count({
      where: { vehicleId: existing.vehicleId, status: { in: ['rezervacija', 'aktivna'] } },
    });
    if (activeRentals === 0) {
      await db.rentalVehicle.update({
        where: { id: existing.vehicleId },
        data: { status: 'dostupno' },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting rental:', error);
    return NextResponse.json({ error: 'Failed to delete rental' }, { status: 500 });
  }
}
