export const statusConfig: Record<string, { labelKey: string; color: string }> =
  {
    open: { labelKey: "statusOpen", color: "bg-red-100 text-red-700" },
    scheduled: {
      labelKey: "statusScheduled",
      color: "bg-sky-100 text-sky-700",
    },
    in_progress: {
      labelKey: "statusInProgress",
      color: "bg-amber-100 text-amber-700",
    },
    completed: {
      labelKey: "statusCompleted",
      color: "bg-green-100 text-green-700",
    },
    cancelled: {
      labelKey: "statusCancelled",
      color: "bg-gray-100 text-gray-700",
    },
  };

export const priorityConfig: Record<
  string,
  { labelKey: string; color: string }
> = {
  low: { labelKey: "priorityLow", color: "bg-gray-100 text-gray-700" },
  medium: { labelKey: "priorityMedium", color: "bg-amber-100 text-amber-700" },
  high: { labelKey: "priorityHigh", color: "bg-orange-100 text-orange-700" },
  critical: { labelKey: "priorityCritical", color: "bg-red-100 text-red-700" },
};

export const typeLabels: Record<string, string> = {
  preventive: "maintenance.preventive",
  corrective: "maintenance.corrective",
  emergency: "maintenance.emergency",
  predictive: "maintenance.predictive",
};

export const categoryLabels: Record<string, string> = {
  production: "maintenance.categoryProduction",
  office: "maintenance.categoryOffice",
  vehicles: "maintenance.categoryVehicles",
  hvac: "maintenance.categoryHVAC",
  electrical: "maintenance.categoryElectrical",
  it: "maintenance.categoryIT",
};

export const frequencyLabels: Record<string, string> = {
  daily: "maintenance.frequencyDaily",
  weekly: "maintenance.frequencyWeekly",
  monthly: "maintenance.frequencyMonthly",
  quarterly: "maintenance.frequencyQuarterly",
  annually: "maintenance.frequencyAnnually",
};

export const equipmentStatusConfig: Record<
  string,
  { labelKey: string; color: string }
> = {
  active: { labelKey: "statusActive", color: "bg-green-100 text-green-700" },
  maintenance: {
    labelKey: "statusMaintenance",
    color: "bg-amber-100 text-amber-700",
  },
  down: { labelKey: "statusDown", color: "bg-red-100 text-red-700" },
  decommissioned: {
    labelKey: "statusDecommissioned",
    color: "bg-gray-100 text-gray-700",
  },
};

export const PIE_COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#6b7280"];

export const COST_COLORS = ["#6366f1", "#22c55e", "#f59e0b"];

export const mockEquipment: EquipmentItem[] = [
  {
    id: "e1",
    name: "CNC mašina Tesla 500",
    serialNumber: "CNC-2021-001",
    category: "production",
    location: "Hala A",
    status: "active",
    lastMaintenance: "2025-05-15",
    nextMaintenance: "2025-08-15",
    healthScore: 92,
    breakdowns90d: 0,
  },
  {
    id: "e2",
    name: "Kompresor Atlas Copco GA30",
    serialNumber: "CMP-2019-012",
    category: "production",
    location: "Hala B",
    status: "active",
    lastMaintenance: "2025-06-01",
    nextMaintenance: "2025-07-01",
    healthScore: 78,
    breakdowns90d: 2,
  },
  {
    id: "e3",
    name: "Dizel generator FG Wilson",
    serialNumber: "GEN-2020-005",
    category: "electrical",
    location: "Podrum P1",
    status: "maintenance",
    lastMaintenance: "2025-06-10",
    nextMaintenance: "2025-06-25",
    healthScore: 55,
    breakdowns90d: 3,
  },
  {
    id: "e4",
    name: "Klima sistem VRV Daikin",
    serialNumber: "HVAC-2022-001",
    category: "hvac",
    location: "Sprat 1",
    status: "active",
    lastMaintenance: "2025-04-20",
    nextMaintenance: "2025-07-20",
    healthScore: 88,
    breakdowns90d: 1,
  },
  {
    id: "e5",
    name: "Volkswagen Transporter",
    serialNumber: "Veh-2018-007",
    category: "vehicles",
    location: "Garaža",
    status: "active",
    lastMaintenance: "2025-05-01",
    nextMaintenance: "2025-08-01",
    healthScore: 71,
    breakdowns90d: 1,
  },
  {
    id: "e6",
    name: "Server Dell PowerEdge R740",
    serialNumber: "IT-2023-003",
    category: "it",
    location: "Server soba",
    status: "active",
    lastMaintenance: "2025-06-05",
    nextMaintenance: "2025-09-05",
    healthScore: 96,
    breakdowns90d: 0,
  },
  {
    id: "e7",
    name: "PVC ekstruder KraussMaffei",
    serialNumber: "CNC-2017-020",
    category: "production",
    location: "Hala A",
    status: "down",
    lastMaintenance: "2025-03-10",
    nextMaintenance: "2025-06-28",
    healthScore: 22,
    breakdowns90d: 5,
  },
  {
    id: "e8",
    name: "Canon iR-ADV C5560",
    serialNumber: "OF-2021-010",
    category: "office",
    location: "Sprat 2",
    status: "active",
    lastMaintenance: "2025-05-20",
    nextMaintenance: "2025-08-20",
    healthScore: 84,
    breakdowns90d: 1,
  },
];

export const mockPlans: MaintenancePlan[] = [
  {
    id: "p1",
    equipmentId: "e1",
    equipmentName: "CNC mašina Tesla 500",
    planName: "Mesečno podmazivanje",
    frequency: "monthly",
    nextDue: "2025-07-15",
    autoCreate: true,
    completedDates: ["2025-05-15", "2025-06-15"],
  },
  {
    id: "p2",
    equipmentId: "e2",
    equipmentName: "Kompresor Atlas Copco",
    planName: "Kvartalni servis",
    frequency: "quarterly",
    nextDue: "2025-06-01",
    autoCreate: true,
    completedDates: ["2025-03-01"],
  },
  {
    id: "p3",
    equipmentId: "e4",
    equipmentName: "Klima sistem VRV Daikin",
    planName: "Godišnji servis",
    frequency: "annually",
    nextDue: "2025-07-20",
    autoCreate: false,
    completedDates: ["2024-07-20"],
  },
  {
    id: "p4",
    equipmentId: "e6",
    equipmentName: "Server Dell PowerEdge",
    planName: "Nedeljna provera",
    frequency: "weekly",
    nextDue: "2025-06-20",
    autoCreate: true,
    completedDates: ["2025-06-13", "2025-06-06"],
  },
];

export const mockSpareParts: SparePart[] = [
  {
    id: "s1",
    name: "Filter ulja CNC",
    partNumber: "FO-CNC-100",
    category: "production",
    qtyInStock: 12,
    minStock: 5,
    location: "Magacin A-1",
    unitCost: 3500,
    usageLog: [{ date: "2025-06-10", orderNumber: "MO-2025-0042", qty: 2 }],
  },
  {
    id: "s2",
    name: "Kalem za kompresor",
    partNumber: "KC-ACP-200",
    category: "production",
    qtyInStock: 3,
    minStock: 2,
    location: "Magacin A-2",
    unitCost: 18500,
    usageLog: [{ date: "2025-05-28", orderNumber: "MO-2025-0038", qty: 1 }],
  },
  {
    id: "s3",
    name: "Remenja set generatora",
    partNumber: "RS-FGW-050",
    category: "electrical",
    qtyInStock: 1,
    minStock: 2,
    location: "Magacin B-1",
    unitCost: 42000,
    usageLog: [],
  },
  {
    id: "s4",
    name: "Filter za klimu",
    partNumber: "FK-DKN-300",
    category: "hvac",
    qtyInStock: 8,
    minStock: 4,
    location: "Magacin C-1",
    unitCost: 2800,
    usageLog: [{ date: "2025-04-20", orderNumber: "MO-2025-0029", qty: 4 }],
  },
  {
    id: "s5",
    name: "Guma 235/65 R16",
    partNumber: "GR-VW-235",
    category: "vehicles",
    qtyInStock: 4,
    minStock: 4,
    location: "Garaža",
    unitCost: 15200,
    usageLog: [{ date: "2025-05-01", orderNumber: "MO-2025-0035", qty: 2 }],
  },
  {
    id: "s6",
    name: "HDD 2TB Enterprise",
    partNumber: "HD-DELL-2T",
    category: "it",
    qtyInStock: 2,
    minStock: 1,
    location: "Server soba",
    unitCost: 28000,
    usageLog: [],
  },
  {
    id: "s7",
    name: "Ležaj SKF 6205",
    partNumber: "LZ-SKF-6205",
    category: "production",
    qtyInStock: 15,
    minStock: 10,
    location: "Magacin A-3",
    unitCost: 1200,
    usageLog: [
      { date: "2025-06-15", orderNumber: "MO-2025-0045", qty: 3 },
      { date: "2025-03-10", orderNumber: "MO-2025-0018", qty: 2 },
    ],
  },
  {
    id: "s8",
    name: "Tonik za štampač",
    partNumber: "TN-CAN-055",
    category: "office",
    qtyInStock: 6,
    minStock: 3,
    location: "Magacin D-1",
    unitCost: 8500,
    usageLog: [{ date: "2025-05-20", orderNumber: "MO-2025-0036", qty: 1 }],
  },
  {
    id: "s9",
    name: "Pasta za obradu metala",
    partNumber: "PM-CNC-500",
    category: "production",
    qtyInStock: 0,
    minStock: 3,
    location: "Magacin A-1",
    unitCost: 4200,
    usageLog: [{ date: "2025-06-18", orderNumber: "MO-2025-0047", qty: 5 }],
  },
  {
    id: "s10",
    name: "LED panel 60x60",
    partNumber: "LP-EL-6060",
    category: "electrical",
    qtyInStock: 5,
    minStock: 2,
    location: "Magacin B-2",
    unitCost: 3500,
    usageLog: [],
  },
];

export const monthlyTrendData = [
  { month: "Jan", preventive: 8, corrective: 3, emergency: 1 },
  { month: "Feb", preventive: 10, corrective: 2, emergency: 0 },
  { month: "Mar", preventive: 9, corrective: 5, emergency: 2 },
  { month: "Apr", preventive: 11, corrective: 3, emergency: 1 },
  { month: "May", preventive: 12, corrective: 4, emergency: 1 },
  { month: "Jun", preventive: 14, corrective: 3, emergency: 0 },
];

export const costTrendData = [
  { month: "Jan", labor: 45000, parts: 32000, external: 15000 },
  { month: "Feb", labor: 38000, parts: 28000, external: 12000 },
  { month: "Mar", labor: 62000, parts: 55000, external: 25000 },
  { month: "Apr", labor: 48000, parts: 35000, external: 18000 },
  { month: "May", labor: 52000, parts: 41000, external: 20000 },
  { month: "Jun", labor: 44000, parts: 30000, external: 14000 },
];

export const mtbfMttrData = [
  { month: "Jan", mtbf: 320, mttr: 4.2 },
  { month: "Feb", mtbf: 345, mttr: 3.8 },
  { month: "Mar", mtbf: 280, mttr: 5.5 },
  { month: "Apr", mtbf: 360, mttr: 3.5 },
  { month: "May", mtbf: 340, mttr: 4.0 },
  { month: "Jun", mtbf: 375, mttr: 3.2 },
];

export const downtimeData = [
  { name: "maintenance.categoryProduction", value: 45 },
  { name: "maintenance.categoryElectrical", value: 20 },
  { name: "maintenance.categoryHVAC", value: 15 },
  { name: "maintenance.categoryVehicles", value: 12 },
  { name: "maintenance.categoryIT", value: 8 },
];

export const technicianData = [
  { name: "Marko Petrović", completed: 18, inProgress: 2 },
  { name: "Jovan Nikolić", completed: 14, inProgress: 3 },
  { name: "Stefan Jovanović", completed: 11, inProgress: 1 },
  { name: "Aleksandar Stanković", completed: 9, inProgress: 2 },
];

export const topRepairs = [
  {
    equipment: "PVC ekstruder KraussMaffei",
    cost: 185000,
    type: "maintenance.corrective",
  },
  {
    equipment: "Dizel generator FG Wilson",
    cost: 92000,
    type: "maintenance.emergency",
  },
  {
    equipment: "CNC mašina Tesla 500",
    cost: 67000,
    type: "maintenance.preventive",
  },
  {
    equipment: "Kompresor Atlas Copco GA30",
    cost: 54000,
    type: "maintenance.corrective",
  },
  {
    equipment: "Volkswagen Transporter",
    cost: 43000,
    type: "maintenance.preventive",
  },
];

export const { activeCompanyId } = useAppStore();
