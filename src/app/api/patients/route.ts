import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) where.OR = [{ firstName: { contains: search } }, { lastName: { contains: search } }, { patientNo: { contains: search } }];
    const items = await db.patient.findMany({ where, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(items);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.firstName || !body.lastName) return NextResponse.json({ error: 'First/last name required' }, { status: 400 });
    const patientNo = body.patientNo || `PAC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`;
    const item = await db.patient.create({
      data: {
        patientNo, firstName: body.firstName, lastName: body.lastName, jmbg: body.jmbg || null,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        age: body.age || 0, gender: body.gender || 'male', phone: body.phone || null, email: body.email || null,
        address: body.address || null, city: body.city || null, bloodType: body.bloodType || null,
        insuranceNo: body.insuranceNo || null, insuranceStatus: body.insuranceStatus || 'active',
        primaryDoctor: body.primaryDoctor || null, status: body.status || 'active',
        allergies: JSON.stringify(body.allergies || []), chronicConditions: JSON.stringify(body.chronicConditions || []),
        lastVisit: body.lastVisit ? new Date(body.lastVisit) : null,
        nextAppointment: body.nextAppointment ? new Date(body.nextAppointment) : null,
        totalVisits: body.totalVisits || 0, notes: body.notes || null,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
