import { NextResponse } from 'next/server'

// In-memory store for truck costs
let costsStore: any[] | null = null

function getStore() {
  if (costsStore === null) {
    costsStore = [
      { id: 'cost-001', truckId: 'truck-001', truckPlate: 'БГ-001-AB', type: 'gorivo', description: 'Dizel - autoput BG-NS', date: '2024-11-01', amount: 28500, mileage: 245200, documentRef: 'RAC-2024-1101', supplier: 'OMV Beograd', createdAt: '2024-11-01T16:00:00Z' },
      { id: 'cost-002', truckId: 'truck-001', truckPlate: 'БГ-001-AB', type: 'putarina', description: 'Putarina BG-Subotica', date: '2024-11-01', amount: 3200, mileage: 245300, documentRef: '', supplier: 'Put SRBIJE', createdAt: '2024-11-01T16:00:00Z' },
      { id: 'cost-003', truckId: 'truck-002', truckPlate: 'БГ-012-CD', type: 'gorivo', description: 'Dizel - ruta BG-CH', date: '2024-10-28', amount: 42000, mileage: 312500, documentRef: 'RAC-2024-1028', supplier: 'Lukoil', createdAt: '2024-10-28T18:00:00Z' },
      { id: 'cost-004', truckId: 'truck-002', truckPlate: 'БГ-012-CD', type: 'parking', description: 'Parking rest area', date: '2024-10-28', amount: 800, mileage: 312600, documentRef: '', supplier: 'Rest Area', createdAt: '2024-10-28T18:00:00Z' },
      { id: 'cost-005', truckId: 'truck-004', truckPlate: 'НИ-078-GH', type: 'gorivo', description: 'Dizel - Niš-Sofija', date: '2024-10-30', amount: 31000, mileage: 178100, documentRef: 'RAC-2024-1030', supplier: 'Gazprom Niš', createdAt: '2024-10-30T12:00:00Z' },
      { id: 'cost-006', truckId: 'truck-005', truckPlate: 'КГ-023-IJ', type: 'gorivo', description: 'Dizel - Kragujevac-BG', date: '2024-11-06', amount: 18500, mileage: 520100, documentRef: 'RAC-2024-1106', supplier: 'NIS Petrol', createdAt: '2024-11-06T10:00:00Z' },
      { id: 'cost-007', truckId: 'truck-006', truckPlate: 'СУ-056-KL', type: 'gorivo', description: 'TNG punjenje', date: '2024-10-30', amount: 22000, mileage: 198200, documentRef: 'RAC-2024-1030', supplier: 'Srbijagas', createdAt: '2024-10-30T15:00:00Z' },
      { id: 'cost-008', truckId: 'truck-001', truckPlate: 'БГ-001-AB', type: 'osiguranje', description: 'Kasko osiguranje', date: '2024-01-10', amount: 185000, mileage: 200000, documentRef: 'POL-2024-001', supplier: 'DDOR Novi Sad', createdAt: '2024-01-10T09:00:00Z' },
      { id: 'cost-009', truckId: 'truck-003', truckPlate: 'НС-045-EF', type: 'servis', description: 'Priprema motora', date: '2024-11-05', amount: 450000, mileage: 428000, documentRef: 'RAC-2024-1105', supplier: 'Auto-Lend d.o.o.', createdAt: '2024-11-05T08:00:00Z' },
      { id: 'cost-010', truckId: 'truck-007', truckPlate: 'БГ-089-MN', type: 'registracija', description: 'Registracija kamiona', date: '2024-07-20', amount: 12500, mileage: 60000, documentRef: 'RG-2024-0720', supplier: 'MUP Beograd', createdAt: '2024-07-20T10:00:00Z' },
    ]
  }
  return costsStore
}

// GET /api/trucks/costs
export async function GET() {
  try {
    return NextResponse.json(getStore())
  } catch (error) {
    return NextResponse.json({ error: 'Грешка' }, { status: 500 })
  }
}

// POST /api/trucks/costs
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const store = getStore()
    const newCost = {
      id: `cost-${Date.now()}`,
      ...body,
      truckPlate: '',
      createdAt: new Date().toISOString(),
    }
    store.unshift(newCost)
    return NextResponse.json(newCost, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Грешка при додавању' }, { status: 500 })
  }
}
