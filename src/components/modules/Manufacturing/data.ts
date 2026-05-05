export const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Načrt', color: 'bg-slate-100 text-slate-700' },
  planned: { label: 'Planirano', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'U toku', color: 'bg-amber-100 text-amber-700' },
  quality_check: { label: 'Kontrola', color: 'bg-purple-100 text-purple-700' },
  completed: { label: 'Završeno', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Otkazano', color: 'bg-red-100 text-red-700' },
}

export const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  normal: { label: 'Normalan', color: 'bg-slate-100 text-slate-700' },
  high: { label: 'Visok', color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Hitno', color: 'bg-red-100 text-red-700' },
}

export const MACHINE_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  available: { label: 'Dostupna', color: 'bg-green-100 text-green-700' },
  working: { label: 'Radi', color: 'bg-blue-100 text-blue-700' },
  maintenance: { label: 'Održavanje', color: 'bg-amber-100 text-amber-700' },
  down: { label: 'Kvar', color: 'bg-red-100 text-red-700' },
}

export const MACHINE_TYPE_CONFIG: Record<string, string> = {
  CNC: 'CNC', Press: 'Presa', Assembly: 'Montaža', Package: 'Pakovanje', Other: 'Ostalo',
}

export const BOM_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Načrt', color: 'bg-slate-100 text-slate-700' },
  active: { label: 'Aktivan', color: 'bg-green-100 text-green-700' },
  archived: { label: 'Arhiviran', color: 'bg-amber-100 text-amber-700' },
}

export const SCHEDULE_COLORS: Record<string, string> = {
  planned: 'bg-blue-400',
  in_progress: 'bg-amber-400',
  completed: 'bg-green-400',
  delayed: 'bg-red-400',
}

export const PIE_COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#ec4899']

export const MOCK_BOM_COMPONENTS: BomComponent[] = [
  { name: 'Čelična ploča 2mm', requiredQty: 4, consumedQty: 3, unit: 'kom', costPerUnit: 1250 },
  { name: 'Zavarivačka žica 1.2mm', requiredQty: 2.5, consumedQty: 2.1, unit: 'kg', costPerUnit: 850 },
  { name: 'Lak za metal', requiredQty: 1, consumedQty: 0.8, unit: 'l', costPerUnit: 3200 },
  { name: 'Sićušni vijci M6', requiredQty: 24, consumedQty: 22, unit: 'kom', costPerUnit: 15 },
  { name: 'Guma za brtvljenje', requiredQty: 2, consumedQty: 2, unit: 'kom', costPerUnit: 450 },
]

export const MOCK_ORDERS: ProductionOrder[] = [
  {
    id: 'o1', orderNumber: 'MO-2024-001', productName: 'Metalna kućišta A100', quantityOrdered: 500, quantityProduced: 420,
    status: 'in_progress', priority: 'high', startDate: '2024-12-01', endDate: '2024-12-15',
    bomComponents: MOCK_BOM_COMPONENTS, machineId: 'm1', timeTracking: 38, qualityNotes: '', notes: 'Prioritetna isporuka', progress: 84,
  },
  {
    id: 'o2', orderNumber: 'MO-2024-002', productName: 'Plastični poklopci B200', quantityOrdered: 1000, quantityProduced: 1000,
    status: 'completed', priority: 'normal', startDate: '2024-11-20', endDate: '2024-12-05',
    bomComponents: MOCK_BOM_COMPONENTS.slice(0, 3), machineId: 'm2', timeTracking: 24, qualityNotes: 'Sve mere u toleranciji', notes: '', progress: 100,
  },
  {
    id: 'o3', orderNumber: 'MO-2024-003', productName: 'Aluminijumske profile C50', quantityOrdered: 300, quantityProduced: 0,
    status: 'planned', priority: 'urgent', startDate: '2024-12-10', endDate: '2024-12-20',
    bomComponents: MOCK_BOM_COMPONENTS.slice(0, 2), machineId: 'm3', timeTracking: 0, qualityNotes: '', notes: 'Hitna narudžba kupca', progress: 0,
  },
  {
    id: 'o4', orderNumber: 'MO-2024-004', productName: 'Elektronske pločice D80', quantityOrdered: 2000, quantityProduced: 800,
    status: 'in_progress', priority: 'normal', startDate: '2024-12-03', endDate: '2024-12-18',
    bomComponents: MOCK_BOM_COMPONENTS.slice(1, 4), machineId: 'm4', timeTracking: 52, qualityNotes: '3 odbijene u kontroli', notes: '', progress: 40,
  },
  {
    id: 'o5', orderNumber: 'MO-2024-005', productName: 'Gumene brtve E30', quantityOrdered: 5000, quantityProduced: 3500,
    status: 'quality_check', priority: 'normal', startDate: '2024-11-25', endDate: '2024-12-10',
    bomComponents: MOCK_BOM_COMPONENTS.slice(3, 5), machineId: 'm5', timeTracking: 45, qualityNotes: 'Na čekanju finalne kontrole', notes: '', progress: 70,
  },
  {
    id: 'o6', orderNumber: 'MO-2024-006', productName: 'Ventili F120', quantityOrdered: 800, quantityProduced: 0,
    status: 'draft', priority: 'normal', startDate: '2024-12-15', endDate: '2024-12-28',
    bomComponents: MOCK_BOM_COMPONENTS.slice(0, 4), machineId: 'm6', timeTracking: 0, qualityNotes: '', notes: 'Čeka odobrenje', progress: 0,
  },
  {
    id: 'o7', orderNumber: 'MO-2024-007', productName: 'Čelične opruge G60', quantityOrdered: 2000, quantityProduced: 1900,
    status: 'in_progress', priority: 'high', startDate: '2024-12-02', endDate: '2024-12-12',
    bomComponents: MOCK_BOM_COMPONENTS.slice(2, 5), machineId: 'm1', timeTracking: 30, qualityNotes: '', notes: '', progress: 95,
  },
  {
    id: 'o8', orderNumber: 'MO-2024-008', productName: 'Plastične kutije H90', quantityOrdered: 1500, quantityProduced: 1500,
    status: 'completed', priority: 'normal', startDate: '2024-11-18', endDate: '2024-12-02',
    bomComponents: MOCK_BOM_COMPONENTS.slice(0, 2), machineId: 'm2', timeTracking: 18, qualityNotes: 'Kvalitet odličan', notes: '', progress: 100,
  },
]

export const MOCK_BOMS: Bom[] = [
  { id: 'b1', productName: 'Metalna kućišta A100', version: 'v2.1', components: MOCK_BOM_COMPONENTS, status: 'active', createdDate: '2024-10-15' },
  { id: 'b2', productName: 'Plastični poklopci B200', version: 'v1.3', components: MOCK_BOM_COMPONENTS.slice(0, 3), status: 'active', createdDate: '2024-09-20' },
  { id: 'b3', productName: 'Aluminijumske profile C50', version: 'v3.0', components: MOCK_BOM_COMPONENTS.slice(0, 2), status: 'active', createdDate: '2024-11-01' },
  { id: 'b4', productName: 'Elektronske pločice D80', version: 'v1.1', components: MOCK_BOM_COMPONENTS.slice(1, 4), status: 'draft', createdDate: '2024-11-28' },
  { id: 'b5', productName: 'Ventili F120', version: 'v1.0', components: MOCK_BOM_COMPONENTS.slice(0, 4), status: 'archived', createdDate: '2024-06-10' },
]

export const MOCK_MACHINES: Machine[] = [
  { id: 'm1', name: 'CNC Frizer Alpha', type: 'CNC', status: 'working', location: 'Hala A', capacityPerHour: 50, currentLoad: 85, totalHours: 2340, downtimeLog: [{ date: '2024-11-15', hours: 4, reason: 'Zamena alata' }] },
  { id: 'm2', name: 'Hidraulična presa Beta', type: 'Press', status: 'working', location: 'Hala A', capacityPerHour: 80, currentLoad: 72, totalHours: 1890, downtimeLog: [{ date: '2024-11-20', hours: 8, reason: 'Hidraulična pumpa' }] },
  { id: 'm3', name: 'Montažna linija Gamma', type: 'Assembly', status: 'available', location: 'Hala B', capacityPerHour: 30, currentLoad: 0, totalHours: 3200, downtimeLog: [] },
  { id: 'm4', name: 'Pakovalica Delta', type: 'Package', status: 'working', location: 'Hala B', capacityPerHour: 120, currentLoad: 65, totalHours: 1500, downtimeLog: [{ date: '2024-12-01', hours: 2, reason: 'Kalibracija' }] },
  { id: 'm5', name: 'CNC Strug Epsilon', type: 'CNC', status: 'maintenance', location: 'Hala A', capacityPerHour: 40, currentLoad: 0, totalHours: 980, downtimeLog: [{ date: '2024-12-05', hours: 16, reason: 'Servis glavnog vretena' }] },
  { id: 'm6', name: 'Rotaciona presa Zeta', type: 'Press', status: 'down', location: 'Hala C', capacityPerHour: 60, currentLoad: 0, totalHours: 750, downtimeLog: [{ date: '2024-12-06', hours: 24, reason: 'Kvar motora' }] },
]

export const MOCK_SCHEDULE: ScheduleItem[] = [
  { id: 's1', productName: 'Kućišta A100', startDay: 0, duration: 5, status: 'in_progress', quantity: 500 },
  { id: 's2', productName: 'Poklopci B200', startDay: 0, duration: 3, status: 'completed', quantity: 1000 },
  { id: 's3', productName: 'Profile C50', startDay: 2, duration: 4, status: 'planned', quantity: 300 },
  { id: 's4', productName: 'Pločice D80', startDay: 1, duration: 6, status: 'in_progress', quantity: 2000 },
  { id: 's5', productName: 'Brtve E30', startDay: 3, duration: 3, status: 'delayed', quantity: 5000 },
  { id: 's6', productName: 'Opruge G60', startDay: 4, duration: 2, status: 'in_progress', quantity: 2000 },
  { id: 's7', productName: 'Kutije H90', startDay: 5, duration: 2, status: 'planned', quantity: 1500 },
]

export const MOCK_DAILY_TREND = [
  { day: 'Pon', planned: 450, actual: 420 },
  { day: 'Uto', planned: 500, actual: 510 },
  { day: 'Sre', planned: 480, actual: 460 },
  { day: 'Čet', planned: 520, actual: 540 },
  { day: 'Pet', planned: 400, actual: 380 },
  { day: 'Sub', planned: 200, actual: 210 },
]

export const MOCK_PRODUCT_PIE = [
  { name: 'Kućišta', value: 420 },
  { name: 'Poklopci', value: 1000 },
  { name: 'Pločice', value: 800 },
  { name: 'Brtve', value: 3500 },
  { name: 'Opruge', value: 1900 },
  { name: 'Kutije', value: 1500 },
]

export const MOCK_MONTHLY_OUTPUT = [
  { month: 'Jul', units: 4200 },
  { month: 'Avg', units: 4800 },
  { month: 'Sep', units: 5100 },
  { month: 'Okt', units: 4600 },
  { month: 'Nov', units: 5400 },
  { month: 'Dec', units: 3800 },
]

export const MOCK_OEE = [
  { month: 'Jul', availability: 92, performance: 88, quality: 95 },
  { month: 'Avg', availability: 90, performance: 91, quality: 93 },
  { month: 'Sep', availability: 88, performance: 93, quality: 96 },
  { month: 'Okt', availability: 85, performance: 89, quality: 94 },
  { month: 'Nov', availability: 93, performance: 92, quality: 97 },
  { month: 'Dec', availability: 91, performance: 90, quality: 92 },
]

export const MOCK_TOP_PRODUCTS = [
  { name: 'Gumene brtve E30', volume: 5200 },
  { name: 'Plastične kutije H90', volume: 4800 },
  { name: 'Čelične opruge G60', volume: 3900 },
  { name: 'Elektronske pločice D80', volume: 3200 },
  { name: 'Metalna kućišta A100', volume: 2800 },
]

export const MOCK_DEFECT_TREND = [
  { month: 'Jul', brtve: 2.1, kućišta: 3.5, pločice: 1.8 },
  { month: 'Avg', brtve: 1.9, kućišta: 3.2, pločice: 2.0 },
  { month: 'Sep', brtve: 1.5, kućišta: 2.8, pločice: 1.6 },
  { month: 'Okt', brtve: 2.0, kućišta: 3.0, pločice: 1.9 },
  { month: 'Nov', brtve: 1.3, kućišta: 2.5, pločice: 1.4 },
  { month: 'Dec', brtve: 1.8, kućišta: 2.9, pločice: 1.7 },
]

export const MOCK_COST_TABLE = [
  { product: 'Kućišta A100', material: 4850, labor: 2200, overhead: 1100, total: 8150 },
  { product: 'Poklopci B200', material: 2100, labor: 1800, overhead: 900, total: 4800 },
  { product: 'Profile C50', material: 5600, labor: 3200, overhead: 1600, total: 10400 },
  { product: 'Pločice D80', material: 1200, labor: 2800, overhead: 1400, total: 5400 },
  { product: 'Brtve E30', material: 450, labor: 600, overhead: 300, total: 1350 },
]

export const MOCK_MACHINE_UTIL = [
  { name: 'CNC Frizer', utilization: 85 },
  { name: 'Hidr. presa', utilization: 72 },
  { name: 'Montažna lin.', utilization: 0 },
  { name: 'Pakovalica', utilization: 65 },
  { name: 'CNC Strug', utilization: 0 },
  { name: 'Rotac. presa', utilization: 0 },
]

export const MOCK_SHIFT_PRODUCTIVITY = [
  { shift: 'Jutarnja (06-14)', output: 1850, efficiency: 94 },
  { shift: 'Popodnevna (14-22)', output: 1620, efficiency: 87 },
  { shift: 'Noćna (22-06)', output: 980, efficiency: 76 },
]

export const { activeCompanyId } = useAppStore();

export const { t } = useTranslation();

export const names = new Set(orders.map(o => o.productName));

export const matchSearch = !orderSearch || o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) || o.productName.toLowerCase().includes(orderSearch.toLowerCase());

export const matchStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;

export const matchProduct = orderProductFilter === 'all' || o.productName === orderProductFilter;

export const activeOrders = orders.filter(o => ['in_progress', 'quality_check'].includes(o.status)).length;

export const inQueue = orders.filter(o => ['draft', 'planned'].includes(o.status)).length;

export const completedToday = orders.filter(o => o.status === 'completed').length;

export const totalOutput = orders.reduce((sum, o) => sum + o.quantityProduced, 0);

export const totalOrdered = orders.reduce((sum, o) => sum + o.quantityOrdered, 0);

export const efficiencyRate = totalOrdered > 0 ? Math.round((totalOutput / totalOrdered) * 100) : 0;

export const defectRate = 2.3;

export const cycleMachineStatus = (machine: Machine) => {
    const cycle: Machine['status'][] = ['available', 'working', 'maintenance', 'down']
    const idx = cycle.indexOf(machine.status)
    const nextStatus = cycle[(idx + 1) % cycle.length]
    setMachines(prev => prev.map(m => m.id === machine.id ? { ...m, status: nextStatus, currentLoad: nextStatus === 'available' || nextStatus === 'down' || nextStatus === 'maintenance' ? 0 : m.currentLoad } : m))
  }

export const handleCreateOrder = () => {
    setOrderDialogOpen(false)
    setOrderForm({ productName: '', quantity: 100, startDate: '', endDate: '', priority: 'normal', notes: '' })
  }

export const handleOrderStatusChange = (order: ProductionOrder, newStatus: ProductionOrder['status']) => {
    void order
    void newStatus
  }

export const handleAddMachine = () => {
    setMachineDialogOpen(false)
    setMachineForm({ name: '', type: 'CNC', location: '', capacityPerHour: 50 })
  }

export const getLoadColor = (load: number) => {
    if (load === 0) return 'bg-gray-300'
    if (load < 70) return 'bg-emerald-500'
    if (load <= 90) return 'bg-amber-500'
    return 'bg-red-500'
  }

export const dayLabels = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned']

export const scheduleDays = scheduleView === 'weekly' ? 7 : 14;

export const totalCost = bom.components.reduce((sum, c) => sum + c.costPerUnit * c.requiredQty, 0);

export const plannedHours = 6 + Math.floor(Math.random() * 3);

export const availableHours = 8;

export const pct = Math.round((plannedHours / availableHours) * 100);
