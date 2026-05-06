export const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  received: { label: 'Primljen', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  diagnosing: { label: 'Dijagnoza', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
  waiting_parts: { label: 'Čeka delove', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  in_repair: { label: 'U popravci', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  testing: { label: 'Testiranje', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  completed: { label: 'Gotov', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  delivered: { label: 'Isporučen', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  cancelled: { label: 'Otkazan', color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400' },
}

export const CATEGORY_CONFIG: Record<string, { label: string; icon: string }> = {
  electronics: { label: 'Elektronika', icon: '💻' },
  appliances: { label: 'Bela tehnika', icon: '🔌' },
  phones: { label: 'Telefoni', icon: '📱' },
  laptops: { label: 'Laptopovi', icon: '🖥️' },
  vehicles: { label: 'Vozila', icon: '🚗' },
  tools: { label: 'Alati', icon: '🔧' },
  hvac: { label: 'Grejanje/Ventilacija', icon: '🌡️' },
  plumbing: { label: 'Vodovod', icon: '🚿' },
  other: { label: 'Ostalo', icon: '📋' },
}

export const TYPE_CONFIG: Record<string, string> = {
  repair: 'Popravka',
  maintenance: 'Održavanje',
  installation: 'Instalacija',
  diagnosis_only: 'Samo dijagnoza',
  calibration: 'Kalibracija',
  upgrade: 'Nadogradnja',
}

export const TECHNICIANS = ['Marko Petrović', 'Nikola Nikolić', 'Jelena Stanković', 'Petar Jovanović']

export const formatCurrency = (val: number) => `${val.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD`;

export const mockOrders: ServiceOrder[] = [
  {
    id: 'svc-1', number: 'SRV-2025-001', clientName: 'Jovan Đorđević', clientPhone: '+381631234567', clientEmail: 'jovan@email.com', clientAddress: 'Vojvode Mišića 15, Beograd',
    productBrand: 'Apple', productModel: 'MacBook Pro 14" M3', serialNumber: 'C02GQ1XXHASH', category: 'laptops', type: 'repair', priority: 'high', status: 'in_repair',
    description: 'Prekida se ekran, pojavljuju se linije i artefakti. Problem se javlja nakon 30-60 min rada.',
    diagnosis: 'Defektan fleks kabl ekrana — potrebna zamena kompletnog displej sklopa.', repairNotes: 'Naručene delovi od dobavljača.',
    assignedTechnician: 'Nikola Nikolić', estimatedCost: 35000, actualCost: 32000, partsCost: 28000, laborCost: 4000, currency: 'RSD',
    receivedDate: '2025-01-15', promisedDate: '2025-01-22', completedDate: null, deliveredDate: null,
    warranty: true, warrantyMonths: 3, invoiceNumber: '', rating: 0,
    timeline: [
      { id: 'e1', action: 'Primljen', description: 'Uređaj primljen na servis', performedBy: 'Sistem', timestamp: '2025-01-15T10:00:00' },
      { id: 'e2', action: 'Dijagnoza', description: 'Defektan fleks kabl', performedBy: 'Nikola Nikolić', timestamp: '2025-01-16T14:00:00' },
      { id: 'e3', action: 'Čeka delove', description: 'Naručen displej sklop', performedBy: 'Nikola Nikolić', timestamp: '2025-01-17T09:00:00' },
      { id: 'e4', action: 'U popravci', description: 'Započeta zamena displeja', performedBy: 'Nikola Nikolić', timestamp: '2025-01-19T10:00:00' },
    ],
    parts: [{ id: 'p1', name: 'Display Assembly 14" A2992', partNumber: 'APL-DSP-14-M3', quantity: 1, unitPrice: 28000, total: 28000 }],
  },
  {
    id: 'svc-2', number: 'SRV-2025-002', clientName: 'D.o.o. TechPro', clientPhone: '+38111234567', clientEmail: 'office@techpro.rs', clientAddress: 'Bulevar Mihajla Pupina 10a, Novi Beograd',
    productBrand: 'HP', productModel: 'LaserJet Enterprise M507dn', serialNumber: 'VND2P18012', category: 'electronics', type: 'maintenance', priority: 'medium', status: 'diagnosing',
    description: 'Stampač stampa crne trake, kvalitet štampe je loš. Potrebno servisiranje i čišćenje.',
    diagnosis: '', repairNotes: '',
    assignedTechnician: 'Marko Petrović', estimatedCost: 8000, actualCost: 0, partsCost: 0, laborCost: 0, currency: 'RSD',
    receivedDate: '2025-01-18', promisedDate: '2025-01-24', completedDate: null, deliveredDate: null,
    warranty: false, warrantyMonths: 0, invoiceNumber: '', rating: 0,
    timeline: [
      { id: 'e5', action: 'Primljen', description: 'Stampač primljen', performedBy: 'Sistem', timestamp: '2025-01-18T09:00:00' },
    ],
    parts: [],
  },
  {
    id: 'svc-3', number: 'SRV-2025-003', clientName: 'Milica Ilić', clientPhone: '+381648765432', clientEmail: 'milica.i@email.com', clientAddress: 'Kneza Miloša 45, Zemun',
    productBrand: 'Samsung', productModel: 'Galaxy S24 Ultra', serialNumber: 'R5CX90AABCD', category: 'phones', type: 'repair', priority: 'high', status: 'completed',
    description: 'Pukla zadnja staklena maska, kamera lepeza je ogrebana.',
    diagnosis: 'Potrebna zamena zadnje maske i lepeza kamere.',
    assignedTechnician: 'Jelena Stanković', estimatedCost: 15000, actualCost: 14000, partsCost: 11000, laborCost: 3000, currency: 'RSD',
    receivedDate: '2025-01-10', promisedDate: '2025-01-14', completedDate: '2025-01-13', deliveredDate: '2025-01-14',
    warranty: true, warrantyMonths: 3, invoiceNumber: 'INV-2025-SR003', rating: 5,
    timeline: [
      { id: 'e6', action: 'Primljen', description: 'Telefon primljen', performedBy: 'Sistem', timestamp: '2025-01-10T08:00:00' },
      { id: 'e7', action: 'Dijagnoza', description: 'Pukla maska i ogrebana lepeza', performedBy: 'Jelena Stanković', timestamp: '2025-01-10T16:00:00' },
      { id: 'e8', action: 'Gotov', description: 'Popravka završena', performedBy: 'Jelena Stanković', timestamp: '2025-01-13T15:00:00' },
      { id: 'e9', action: 'Isporučen', description: 'Kupac preuzeo uređaj', performedBy: 'Sistem', timestamp: '2025-01-14T11:00:00' },
    ],
    parts: [
      { id: 'p2', name: 'Back Glass S24 Ultra', partNumber: 'SAM-BG-S24U', quantity: 1, unitPrice: 8000, total: 8000 },
      { id: 'p3', name: 'Camera Lens Cover', partNumber: 'SAM-CL-S24U', quantity: 1, unitPrice: 3000, total: 3000 },
    ],
  },
  {
    id: 'svc-4', number: 'SRV-2025-004', clientName: 'Dragan Milić', clientPhone: '+381655556677', clientEmail: 'dragan.m@email.com', clientAddress: 'Tolstojeva 22, Vračar',
    productBrand: 'Bosch', productModel: 'WAS28460', serialNumber: 'SN-BOS-2021-98765', category: 'appliances', type: 'repair', priority: 'low', status: 'waiting_parts',
    description: 'Mašina za veš ne centriše veš, baca u svim pravcima. Problematična je već mesec dana.',
    diagnosis: 'Defektan motor za centrisanje i amortizer bubnja. Potrebna zamena oba dela.',
    assignedTechnician: 'Petar Jovanović', estimatedCost: 12000, actualCost: 0, partsCost: 0, laborCost: 0, currency: 'RSD',
    receivedDate: '2025-01-12', promisedDate: '2025-01-25', completedDate: null, deliveredDate: null,
    warranty: false, warrantyMonths: 0, invoiceNumber: '', rating: 0,
    timeline: [
      { id: 'e10', action: 'Primljen', description: 'Mašina primljena', performedBy: 'Sistem', timestamp: '2025-01-12T10:00:00' },
      { id: 'e11', action: 'Dijagnoza', description: 'Defektan motor + amortizer', performedBy: 'Petar Jovanović', timestamp: '2025-01-13T16:00:00' },
      { id: 'e12', action: 'Čeka delove', description: 'Delovi naručeni od dobavljača', performedBy: 'Petar Jovanović', timestamp: '2025-01-14T09:00:00' },
    ],
    parts: [
      { id: 'p4', name: 'Motor za centrisanje', partNumber: 'BOS-MOT-WAS28', quantity: 1, unitPrice: 5500, total: 5500 },
      { id: 'p5', name: 'Amortizer bubnja', partNumber: 'BOS-AMP-WAS28', quantity: 2, unitPrice: 2500, total: 5000 },
    ],
  },
  {
    id: 'svc-5', number: 'SRV-2024-045', clientName: 'Sara Kovačević', clientPhone: '+381601112233', clientEmail: 'sara.k@email.com', clientAddress: 'Gundulićev venac 28, Beograd',
    productBrand: 'Bosch', productModel: 'PWS 750-125', serialNumber: '', category: 'tools', type: 'repair', priority: 'low', status: 'delivered',
    description: 'Kučište brusilice je puklo, motor radi ali kućište vibrira.',
    diagnosis: 'Puklo kućište — lemljenje nije moguće, potrebna zamena.',
    assignedTechnician: 'Marko Petrović', estimatedCost: 3000, actualCost: 2800, partsCost: 1500, laborCost: 1300, currency: 'RSD',
    receivedDate: '2024-12-20', promisedDate: '2024-12-27', completedDate: '2024-12-24', deliveredDate: '2024-12-26',
    warranty: true, warrantyMonths: 3, invoiceNumber: 'INV-2024-SR045', rating: 4,
    timeline: [
      { id: 'e13', action: 'Primljen', description: 'Brusilica primljena', performedBy: 'Sistem', timestamp: '2024-12-20T10:00:00' },
      { id: 'e14', action: 'Gotov', description: 'Kućište zamenjeno', performedBy: 'Marko Petrović', timestamp: '2024-12-24T14:00:00' },
      { id: 'e15', action: 'Isporučen', description: 'Preuzeta', performedBy: 'Sistem', timestamp: '2024-12-26T10:00:00' },
    ],
    parts: [{ id: 'p6', name: 'Housing PWS 750', partNumber: 'BOS-HSG-PWS750', quantity: 1, unitPrice: 1500, total: 1500 }],
  },
]

export const mockStats: ServiceStats = {
  total: 156, open: 8, inProgress: 12, completed: 118, delivered: 112, avgRepairDays: 3.5, avgCost: 8500, totalRevenue: 1326000,
  byCategory: [
    { category: 'phones', count: 42, label: 'Telefoni' },
    { category: 'laptops', count: 35, label: 'Laptopovi' },
    { category: 'appliances', count: 30, label: 'Bela tehnika' },
    { category: 'electronics', count: 25, label: 'Elektronika' },
    { category: 'tools', count: 12, label: 'Alati' },
    { category: 'vehicles', count: 8, label: 'Vozila' },
    { category: 'other', count: 4, label: 'Ostalo' },
  ],
  byTechnician: [
    { tech: 'Nikola Nikolić', count: 48, revenue: 420000 },
    { tech: 'Marko Petrović', count: 42, revenue: 350000 },
    { tech: 'Jelena Stanković', count: 38, revenue: 310000 },
    { tech: 'Petar Jovanović', count: 28, revenue: 246000 },
  ],
  byStatus: mockOrders.reduce((acc, o) => { const s = acc.find((x) => x.status === o.status); if (s) s.count++; else acc.push({ status: o.status, count: 1 }); return acc }, [] as Array<{ status: string; count: number }>),
  topBrands: [
    { brand: 'Apple', count: 38 },
    { brand: 'Samsung', count: 32 },
    { brand: 'HP', count: 18 },
    { brand: 'Dell', count: 15 },
    { brand: 'Bosch', count: 12 },
  ],
  monthly: [
    { month: 'Avg', received: 18, completed: 16 },
    { month: 'Sep', received: 22, completed: 20 },
    { month: 'Okt', received: 20, completed: 19 },
    { month: 'Nov', received: 25, completed: 23 },
    { month: 'Dec', received: 28, completed: 24 },
    { month: 'Jan', received: 15, completed: 10 },
  ],
  satisfactionAvg: 4.3,
}

export const { activeCompanyId } = useAppStore();
