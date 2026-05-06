import { NextResponse } from 'next/server'

let maintenanceStore: any[] | null = null

function getStore() {
  if (maintenanceStore === null) {
    maintenanceStore = [
      { id: 'mnt-001', truckId: 'truck-001', truckPlate: 'БГ-001-AB', type: 'redovni_servis', description: 'Veliki servis', date: '2024-10-15', cost: 85000, mileage: 240000, workshop: 'Auto-Lend d.o.o.', nextDueDate: '2025-01-15', nextDueMileage: 260000, status: 'zavrseno', createdAt: '2024-10-15T10:00:00Z' },
      { id: 'mnt-002', truckId: 'truck-001', truckPlate: 'БГ-001-AB', type: 'promena_guma', description: 'Zimske gume', date: '2024-11-01', cost: 320000, mileage: 245000, workshop: 'Vulkanizer Marko', nextDueDate: '2025-04-01', nextDueMileage: 290000, status: 'zavrseno', createdAt: '2024-11-01T09:00:00Z' },
      { id: 'mnt-003', truckId: 'truck-002', truckPlate: 'БГ-012-CD', type: 'redovni_servis', description: 'Mali servis', date: '2024-09-20', cost: 65000, mileage: 305000, workshop: 'Frigo Servis NS', nextDueDate: '2024-12-20', nextDueMileage: 325000, status: 'zavrseno', createdAt: '2024-09-20T11:00:00Z' },
      { id: 'mnt-004', truckId: 'truck-003', truckPlate: 'НС-045-EF', type: 'motor', description: 'Generalni remont motora', date: '2024-11-05', cost: 450000, mileage: 428000, workshop: 'Auto-Lend d.o.o.', nextDueDate: '2025-02-05', nextDueMileage: 448000, status: 'u_toku', createdAt: '2024-11-05T08:00:00Z' },
    ]
  }
  return maintenanceStore
}

// DELETE /api/trucks/maintenance/[id]
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const store = getStore()
    const index = store.findIndex((m) => m.id === id)
    if (index === -1) {
      return NextResponse.json({ error: 'Запис није пронађен' }, { status: 404 })
    }
    store.splice(index, 1)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Грешка при брисању' }, { status: 500 })
  }
}
