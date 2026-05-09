import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
type RouteContext = { params: Promise<{ id: string }> };
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params; const body = await request.json();
    const existing = await db.patient.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const item = await db.patient.update({ where: { id }, data: {
      firstName: body.firstName, lastName: body.lastName, jmbg: body.jmbg, gender: body.gender,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : (body.dateOfBirth === null ? null : undefined),
      age: body.age, phone: body.phone, email: body.email, address: body.address, city: body.city,
      bloodType: body.bloodType, insuranceNo: body.insuranceNo, insuranceStatus: body.insuranceStatus,
      primaryDoctor: body.primaryDoctor, status: body.status,
      allergies: body.allergies !== undefined ? JSON.stringify(body.allergies) : undefined,
      chronicConditions: body.chronicConditions !== undefined ? JSON.stringify(body.chronicConditions) : undefined,
      lastVisit: body.lastVisit ? new Date(body.lastVisit) : (body.lastVisit === null ? null : undefined),
      nextAppointment: body.nextAppointment ? new Date(body.nextAppointment) : (body.nextAppointment === null ? null : undefined),
      totalVisits: body.totalVisits, notes: body.notes,
    }});
    return NextResponse.json(item);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const existing = await db.patient.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await db.patient.delete({ where: { id } }); return NextResponse.json({ message: 'Deleted' });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
