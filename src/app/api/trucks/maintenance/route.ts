import { NextResponse } from 'next/server'

// In-memory store for maintenance records
let maintenanceStore: any[] | null = null

function getStore() {
  if (maintenanceStore === null) {
    maintenanceStore = [
      { id: 'mnt-001', truckId: 'truck-001', truckPlate: 'БГ-001-AB', type: 'redovni_servis', description: 'Veliki servis - zamena ulja, filtera, kočnica', date: '2024-10-15', cost: 85000, mileage: 240000, workshop: 'Auto-Lend d.o.o.', nextDueDate: '2025-01-15', nextDueMileage: 260000, status: 'zavrseno', createdAt: '2024-10-15T10:00:00Z' },
      { id: 'mnt-002', truckId: 'truck-001', truckPlate: 'БГ-001-AB', type: 'promena_guma', description: 'Zimske gume - Kompletna seta 6+1', date: '2024-11-01', cost: 320000, mileage: 245000, workshop: 'Vulkanizer Marko', nextDueDate: '2025-04-01', nextDueMileage: 290000, status: 'zavrseno', createdAt: '2024-11-01T09:00:00Z' },
      { id: 'mnt-003', truckId: 'truck-002', truckPlate: 'БГ-012-CD', type: 'redovni_servis', description: 'Mali servis + kontrola hladnjače', date: '2024-09-20', cost: 65000, mileage: 305000, workshop: 'Frigo Servis NS', nextDueDate: '2024-12-20', nextDueMileage: 325000, status: 'zavrseno', createdAt: '2024-09-20T11:00:00Z' },
      { id: 'mnt-004', truckId: 'truck-003', truckPlate: 'НС-045-EF', type: 'motor', description: 'Generalni remont motora - zamena glave', date: '2024-11-05', cost: 450000, mileage: 428000, workshop: 'Auto-Lend d.o.o.', nextDueDate: '2025-02-05', nextDueMileage: 448000, status: 'u_toku', createdAt: '2024-11-05T08:00:00Z' },
      { id: 'mnt-005', truckId: 'truck-004', truckPlate: 'НИ-078-GH', type: 'promena_ulja', description: 'Zamena motornog ulja + filteri', date: '2024-08-10', cost: 35000, mileage: 165000, workshop: 'Volvo Service BG', nextDueDate: '2024-11-10', nextDueMileage: 185000, status: 'zavrseno', createdAt: '2024-08-10T13:00:00Z' },
      { id: 'mnt-006', truckId: 'truck-005', truckPlate: 'КГ-023-IJ', type: 'kočioni_sistem', description: 'Zamena kočionih pločica i diskova', date: '2024-07-22', cost: 72000, mileage: 510000, workshop: 'Kamion Servis Kragujevac', nextDueDate: '2024-10-22', nextDueMileage: 540000, status: 'zavrseno', createdAt: '2024-07-22T10:00:00Z' },
      { id: 'mnt-007', truckId: 'truck-006', truckPlate: 'СУ-056-KL', type: 'redovni_servis', description: 'TNG sistem kontrola + redovni servis', date: '2024-09-15', cost: 55000, mileage: 190000, workshop: 'Iveco Servis Subotica', nextDueDate: '2024-12-15', nextDueMileage: 210000, status: 'zavrseno', createdAt: '2024-09-15T14:30:00Z' },
    ]
  }
  return maintenanceStore
}

// GET /api/trucks/maintenance
export async function GET() {
  try {
    return NextResponse.json(getStore())
  } catch (error) {
    return NextResponse.json({ error: 'Грешка' }, { status: 500 })
  }
}

// POST /api/trucks/maintenance
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const store = getStore()
    const truckPlate = body.truckId?.includes('БГ') ? 'БГ-001-AB' : body.truckPlate || ''
    const newRecord = {
      id: `mnt-${Date.now()}`,
      ...body,
      truckPlate,
      createdAt: new Date().toISOString(),
    }
    store.unshift(newRecord)
    return NextResponse.json(newRecord, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Грешка при додавању' }, { status: 500 })
  }
}
