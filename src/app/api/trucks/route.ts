import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// In-memory store for trucks (used when Prisma Vehicle model is not truck-specific)
// Falls back to mock data on first call
let trucksStore: any[] | null = null

function getStore() {
  if (trucksStore === null) {
    trucksStore = [
      {
        id: 'truck-001',
        plate: 'БГ-001-AB',
        make: 'Mercedes-Benz',
        model: 'Actros 1845',
        year: 2021,
        vin: 'WDB9540121K123456',
        fuelType: 'dizel',
        status: 'aktivan',
        mileage: 245000,
        driver: 'Мирко Петровић',
        registrationExpiry: '2025-06-15',
        techInspectionExpiry: '2025-03-20',
        insuranceExpiry: '2025-01-10',
        notes: 'ADR опрема уграђена.',
        companyId: 'comp-001',
        createdAt: '2023-03-15T10:00:00Z',
        updatedAt: '2024-11-01T08:30:00Z',
      },
      {
        id: 'truck-002',
        plate: 'БГ-012-CD',
        make: 'MAN',
        model: 'TGX 18.500',
        year: 2020,
        vin: 'WMAH34ZZ0CL567890',
        fuelType: 'dizel',
        status: 'aktivan',
        mileage: 312000,
        driver: 'Ненад Николић',
        registrationExpiry: '2025-09-22',
        techInspectionExpiry: '2025-05-10',
        insuranceExpiry: '2025-04-18',
        notes: 'Hladnjača - transport hrane.',
        companyId: 'comp-001',
        createdAt: '2023-05-20T14:00:00Z',
        updatedAt: '2024-10-28T16:45:00Z',
      },
      {
        id: 'truck-003',
        plate: 'НС-045-EF',
        make: 'Scania',
        model: 'R450',
        year: 2019,
        vin: 'YS2R4X2000M345678',
        fuelType: 'dizel',
        status: 'na_servisu',
        mileage: 428000,
        driver: 'Слободан Јовановић',
        registrationExpiry: '2025-11-05',
        techInspectionExpiry: '2025-02-28',
        insuranceExpiry: '2025-07-01',
        notes: 'Promena motora u toku.',
        companyId: 'comp-001',
        createdAt: '2022-08-10T09:15:00Z',
        updatedAt: '2024-11-05T11:20:00Z',
      },
      {
        id: 'truck-004',
        plate: 'НИ-078-GH',
        make: 'Volvo',
        model: 'FH 500',
        year: 2022,
        vin: 'YV2RT40A1PA456789',
        fuelType: 'dizel',
        status: 'aktivan',
        mileage: 178000,
        driver: 'Драган Станковић',
        registrationExpiry: '2026-03-12',
        techInspectionExpiry: '2026-01-15',
        insuranceExpiry: '2025-08-20',
        notes: 'GPS praćenje ugrađeno.',
        companyId: 'comp-001',
        createdAt: '2023-01-10T08:00:00Z',
        updatedAt: '2024-11-01T07:00:00Z',
      },
      {
        id: 'truck-005',
        plate: 'КГ-023-IJ',
        make: 'DAF',
        model: 'XF 480',
        year: 2018,
        vin: 'XLRDS45Y0L5678901',
        fuelType: 'dizel',
        status: 'kvar',
        mileage: 520000,
        driver: 'Живорад Милосављевић',
        registrationExpiry: '2025-04-18',
        techInspectionExpiry: '2025-01-30',
        insuranceExpiry: '2025-02-15',
        notes: 'Puknuće pneumatika.',
        companyId: 'comp-001',
        createdAt: '2022-03-25T12:00:00Z',
        updatedAt: '2024-11-06T15:30:00Z',
      },
      {
        id: 'truck-006',
        plate: 'СУ-056-KL',
        make: 'Iveco',
        model: 'Hi-Way 500',
        year: 2021,
        vin: 'ZCFC135A006789012',
        fuelType: 'gas',
        status: 'aktivan',
        mileage: 198000,
        driver: 'Милан Тодић',
        registrationExpiry: '2025-12-01',
        techInspectionExpiry: '2025-06-10',
        insuranceExpiry: '2025-05-22',
        notes: 'TNG pogon - ekološki.',
        companyId: 'comp-001',
        createdAt: '2023-06-15T10:30:00Z',
        updatedAt: '2024-10-30T09:00:00Z',
      },
      {
        id: 'truck-007',
        plate: 'БГ-089-MN',
        make: 'Renault Trucks',
        model: 'T High 460',
        year: 2023,
        vin: 'VR6TEHYZLN7890123',
        fuelType: 'dizel',
        status: 'u_garazi',
        mileage: 85000,
        driver: '',
        registrationExpiry: '2026-07-20',
        techInspectionExpiry: '2026-05-15',
        insuranceExpiry: '2026-03-01',
        notes: 'Rezervni kamion.',
        companyId: 'comp-001',
        createdAt: '2024-01-20T08:45:00Z',
        updatedAt: '2024-11-01T10:00:00Z',
      },
      {
        id: 'truck-008',
        plate: 'НС-101-OP',
        make: 'Tatra',
        model: 'Phoenix 28',
        year: 2017,
        vin: 'TATPHO17P89012345',
        fuelType: 'dizel',
        status: 'prodato',
        mileage: 680000,
        driver: '',
        registrationExpiry: '2024-08-15',
        techInspectionExpiry: '2024-06-01',
        insuranceExpiry: '2024-05-10',
        notes: 'Prodato avgustu 2024.',
        companyId: 'comp-001',
        createdAt: '2021-04-10T07:00:00Z',
        updatedAt: '2024-08-15T14:00:00Z',
      },
    ]
  }
  return trucksStore
}

// GET /api/trucks
export async function GET() {
  try {
    const store = getStore()
    return NextResponse.json(store)
  } catch (error) {
    return NextResponse.json({ error: 'Грешка при учитавању камиона' }, { status: 500 })
  }
}

// POST /api/trucks
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const store = getStore()
    const newTruck = {
      id: `truck-${Date.now()}`,
      ...body,
      companyId: body.companyId || 'comp-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    store.unshift(newTruck)
    return NextResponse.json(newTruck, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Грешка при додавању камиона' }, { status: 500 })
  }
}
