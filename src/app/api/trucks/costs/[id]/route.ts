import { NextResponse } from 'next/server'

let costsStore: any[] | null = null

function getStore() {
  if (costsStore === null) {
    costsStore = [
      { id: 'cost-001', truckId: 'truck-001', truckPlate: 'БГ-001-AB', type: 'gorivo', description: 'Dizel - autoput', date: '2024-11-01', amount: 28500, mileage: 245200, documentRef: 'RAC-2024-1101', supplier: 'OMV', createdAt: '2024-11-01T16:00:00Z' },
      { id: 'cost-002', truckId: 'truck-002', truckPlate: 'БГ-012-CD', type: 'gorivo', description: 'Dizel - ruta BG-CH', date: '2024-10-28', amount: 42000, mileage: 312500, documentRef: 'RAC-2024-1028', supplier: 'Lukoil', createdAt: '2024-10-28T18:00:00Z' },
    ]
  }
  return costsStore
}

// DELETE /api/trucks/costs/[id]
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const store = getStore()
    const index = store.findIndex((c) => c.id === id)
    if (index === -1) {
      return NextResponse.json({ error: 'Трошак није пронађен' }, { status: 404 })
    }
    store.splice(index, 1)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Грешка при брисању' }, { status: 500 })
  }
}
