// ==========================================
// Radni Nalozi – Mock Data, Constants, Helpers
// Serbian ERP: Reflection Business
// ==========================================

import {
  type WorkOrder,
  type WorkOrderTask,
  type Employee,
  type WorkOrderStatus,
  type WorkOrderPriority,
  type TaskStatus,
  type WorkOrderFormData,
  type TaskFormData,
  type CompletionReport,
  type AssigneeReport,
  type PriorityReport,
} from "./types";

// ========== Employees ==========

export const EMPLOYEES: Employee[] = [
  {
    id: "emp-1",
    name: "Марко Петровић",
    role: "Техничар",
    department: "Одржавање",
    avatarUrl: null,
  },
  {
    id: "emp-2",
    name: "Ана Јовановић",
    role: "Инжењер",
    department: "Производња",
    avatarUrl: null,
  },
  {
    id: "emp-3",
    name: "Никола Николић",
    role: "Електричар",
    department: "Електро",
    avatarUrl: null,
  },
  {
    id: "emp-4",
    name: "Јелена Станковић",
    role: "Мајстор",
    department: "Одржавање",
    avatarUrl: null,
  },
  {
    id: "emp-5",
    name: "Душан Тодоровић",
    role: "Водитељ тима",
    department: "Производња",
    avatarUrl: null,
  },
  {
    id: "emp-6",
    name: "Марија Миловановић",
    role: "Координатор",
    department: "Логистика",
    avatarUrl: null,
  },
];
// ========== Status Config ==========

export const STATUS_CONFIG: Record<
  WorkOrderStatus,
  { label: string; color: string; bgColor: string; dotColor: string }
> = {
  novi: {
    label: "Нови",
    color: "text-sky-700 dark:text-sky-400",
    bgColor: "bg-sky-100 dark:bg-sky-950",
    dotColor: "bg-sky-500",
  },
  zakuca: {
    label: "Закучан",
    color: "text-violet-700 dark:text-violet-400",
    bgColor: "bg-violet-100 dark:bg-violet-950",
    dotColor: "bg-violet-500",
  },
  u_toku: {
    label: "У току",
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-950",
    dotColor: "bg-amber-500",
  },
  na_cekanju: {
    label: "На чекању",
    color: "text-orange-700 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-950",
    dotColor: "bg-orange-500",
  },
  zavrsen: {
    label: "Завршен",
    color: "text-emerald-700 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-950",
    dotColor: "bg-emerald-500",
  },
  otkazan: {
    label: "Отказан",
    color: "text-rose-700 dark:text-rose-400",
    bgColor: "bg-rose-100 dark:bg-rose-950",
    dotColor: "bg-rose-500",
  },
};

export const ALL_STATUSES: WorkOrderStatus[] = [
  "novi",
  "zakuca",
  "u_toku",
  "na_cekanju",
  "zavrsen",
  "otkazan",
];
// ========== Priority Config ==========

export const PRIORITY_CONFIG: Record<
  WorkOrderPriority,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  visok: {
    label: "Висок",
    color: "text-rose-700 dark:text-rose-400",
    bgColor: "bg-rose-100 dark:bg-rose-950",
    icon: "🔴",
  },
  srednji: {
    label: "Средњи",
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-950",
    icon: "🟡",
  },
  nizak: {
    label: "Низак",
    color: "text-emerald-700 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-950",
    icon: "🟢",
  },
};

export const ALL_PRIORITIES: WorkOrderPriority[] = [
  "visok",
  "srednji",
  "nizak",
];
// ========== Task Status Config ==========

export const TASK_STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; color: string; bgColor: string }
> = {
  otvoren: {
    label: "Отворен",
    color: "text-sky-700 dark:text-sky-400",
    bgColor: "bg-sky-100 dark:bg-sky-950",
  },
  u_toku: {
    label: "У току",
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-950",
  },
  zavrsen: {
    label: "Завршен",
    color: "text-emerald-700 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-950",
  },
  blokiran: {
    label: "Блокиран",
    color: "text-rose-700 dark:text-rose-400",
    bgColor: "bg-rose-100 dark:bg-rose-950",
  },
};

export const ALL_TASK_STATUSES: TaskStatus[] = [
  "otvoren",
  "u_toku",
  "zavrsen",
  "blokiran",
];
// ========== Mock Tasks ==========

const MOCK_TASKS: WorkOrderTask[] = [
  {
    id: "task-1",
    workOrderId: "wo-1",
    title: "Провера система за гас",
    description: "Инспекција комплетног система за гасњење",
    status: "zavrsen",
    assignedTo: "emp-3",
    dueDate: "2025-01-20",
    estimatedHours: 4,
    actualHours: 3.5,
    createdAt: "2025-01-10",
    updatedAt: "2025-01-19",
  },
  {
    id: "task-2",
    workOrderId: "wo-1",
    title: "Замена филтера",
    description: "Замена филтера за уље и ваздух",
    status: "zavrsen",
    assignedTo: "emp-1",
    dueDate: "2025-01-22",
    estimatedHours: 2,
    actualHours: 2,
    createdAt: "2025-01-10",
    updatedAt: "2025-01-21",
  },
  {
    id: "task-3",
    workOrderId: "wo-1",
    title: "Тестирање CNC машине",
    description: "Потпуни тест после réparacije",
    status: "u_toku",
    assignedTo: "emp-2",
    dueDate: "2025-01-25",
    estimatedHours: 3,
    actualHours: 1.5,
    createdAt: "2025-01-10",
    updatedAt: "2025-01-23",
  },
  {
    id: "task-4",
    workOrderId: "wo-2",
    title: "Инсталација аларме",
    description: "Постављање новог аларм система на спрат 3",
    status: "u_toku",
    assignedTo: "emp-3",
    dueDate: "2025-02-10",
    estimatedHours: 8,
    actualHours: 4,
    createdAt: "2025-01-25",
    updatedAt: "2025-02-01",
  },
  {
    id: "task-5",
    workOrderId: "wo-3",
    title: "Замена електро инсталације",
    description: "Комплетна замена старије електро инсталације у хали Б",
    status: "otvoren",
    assignedTo: "emp-3",
    dueDate: "2025-02-28",
    estimatedHours: 24,
    actualHours: 0,
    createdAt: "2025-02-01",
    updatedAt: "2025-02-01",
  },
  {
    id: "task-6",
    workOrderId: "wo-3",
    title: "Замена осигурача",
    description: "Монтажа нових аутоматских осигурача",
    status: "otvoren",
    assignedTo: "emp-1",
    dueDate: "2025-02-20",
    estimatedHours: 6,
    actualHours: 0,
    createdAt: "2025-02-01",
    updatedAt: "2025-02-01",
  },
  {
    id: "task-7",
    workOrderId: "wo-4",
    title: "Сервис камиона",
    description: "Редовни сервис за камион Gore-123",
    status: "zavrsen",
    assignedTo: "emp-4",
    dueDate: "2025-01-30",
    estimatedHours: 6,
    actualHours: 7,
    createdAt: "2025-01-15",
    updatedAt: "2025-01-29",
  },
  {
    id: "task-8",
    workOrderId: "wo-5",
    title: "Очисти канализацију",
    description: "Спречавање зачепљења канализационе мреже",
    status: "u_toku",
    assignedTo: "emp-4",
    dueDate: "2025-02-15",
    estimatedHours: 4,
    actualHours: 2,
    createdAt: "2025-02-05",
    updatedAt: "2025-02-10",
  },
  {
    id: "task-9",
    workOrderId: "wo-6",
    title: "Калибрација мерача",
    description: "Калибрација мерача притиска на линији 5",
    status: "zavrsen",
    assignedTo: "emp-2",
    dueDate: "2025-02-05",
    estimatedHours: 3,
    actualHours: 2.5,
    createdAt: "2025-01-28",
    updatedAt: "2025-02-04",
  },
  {
    id: "task-10",
    workOrderId: "wo-7",
    title: "Замена кровних црепова",
    description: "Поправка оштећених црепова на сектору А",
    status: "otvoren",
    assignedTo: "emp-5",
    dueDate: "2025-03-15",
    estimatedHours: 16,
    actualHours: 0,
    createdAt: "2025-02-10",
    updatedAt: "2025-02-10",
  },
  {
    id: "task-11",
    workOrderId: "wo-8",
    title: "Поставка климатизације",
    description: "Инсталација нове климе у канцеларији 12",
    status: "na_cekanju",
    assignedTo: "emp-1",
    dueDate: "2025-03-01",
    estimatedHours: 5,
    actualHours: 0,
    createdAt: "2025-02-12",
    updatedAt: "2025-02-12",
  },
  {
    id: "task-12",
    workOrderId: "wo-9",
    title: "Грејач воде",
    description: "Замена грејног елемента за бойлер у кухињи",
    status: "u_toku",
    assignedTo: "emp-3",
    dueDate: "2025-02-20",
    estimatedHours: 3,
    actualHours: 1,
    createdAt: "2025-02-14",
    updatedAt: "2025-02-18",
  },
];
// ========== Mock Work Orders ==========

export const MOCK_WORK_ORDERS: WorkOrder[] = [
  {
    id: "wo-1",
    orderNumber: "RN-2025-001",
    title: "Ремонт CNC машине – Линија 3",
    description:
      "Комплетан ремонт CNC машине за обраду метала. Укључује замену лежајева, калибрацију и тестирање.",
    priority: "visok",
    status: "u_toku",
    assignedTo: "emp-2",
    dueDate: "2025-01-25",
    estimatedHours: 16,
    actualHours: 7,
    createdAt: "2025-01-10T08:00:00Z",
    updatedAt: "2025-01-23T14:30:00Z",
    completedAt: null,
    costRSD: 185000,
    pdvRate: 20,
    tasks: MOCK_TASKS.filter((t) => t.workOrderId === "wo-1"),
  },
  {
    id: "wo-2",
    orderNumber: "RN-2025-002",
    title: "Инсталација безбедносног аларм система",
    description:
      "Поставка и конфигурација новог аларм система са 24 сензорске тачке на спрату 3.",
    priority: "srednji",
    status: "u_toku",
    assignedTo: "emp-3",
    dueDate: "2025-02-10",
    estimatedHours: 12,
    actualHours: 4,
    createdAt: "2025-01-25T09:00:00Z",
    updatedAt: "2025-02-01T16:00:00Z",
    completedAt: null,
    costRSD: 320000,
    pdvRate: 20,
    tasks: MOCK_TASKS.filter((t) => t.workOrderId === "wo-2"),
  },
  {
    id: "wo-3",
    orderNumber: "RN-2025-003",
    title: "Реконструкција електро инсталације – Хала Б",
    description:
      "Замена старе електро инсталације у хали Б. Нове кабловске руте и аутоматски осигурачи.",
    priority: "visok",
    status: "novi",
    assignedTo: "emp-3",
    dueDate: "2025-02-28",
    estimatedHours: 40,
    actualHours: 0,
    createdAt: "2025-02-01T07:30:00Z",
    updatedAt: "2025-02-01T07:30:00Z",
    completedAt: null,
    costRSD: 750000,
    pdvRate: 20,
    tasks: MOCK_TASKS.filter((t) => t.workOrderId === "wo-3"),
  },
  {
    id: "wo-4",
    orderNumber: "RN-2025-004",
    title: "Сервис возила Gore-123",
    description:
      "Редовни годишњи сервис: замена уља, филтера, провера кочница и гума.",
    priority: "srednji",
    status: "zavrsen",
    assignedTo: "emp-4",
    dueDate: "2025-01-30",
    estimatedHours: 8,
    actualHours: 7,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-29T17:00:00Z",
    completedAt: "2025-01-29T17:00:00Z",
    costRSD: 45000,
    pdvRate: 20,
    tasks: MOCK_TASKS.filter((t) => t.workOrderId === "wo-4"),
  },
  {
    id: "wo-5",
    orderNumber: "RN-2025-005",
    title: "Одржавање канализационе мреже",
    description: "Превентивно чишћење и снимање канализационе мреже фабрике.",
    priority: "nizak",
    status: "u_toku",
    assignedTo: "emp-4",
    dueDate: "2025-02-15",
    estimatedHours: 6,
    actualHours: 2,
    createdAt: "2025-02-05T08:00:00Z",
    updatedAt: "2025-02-10T12:00:00Z",
    completedAt: null,
    costRSD: 28000,
    pdvRate: 20,
    tasks: MOCK_TASKS.filter((t) => t.workOrderId === "wo-5"),
  },
  {
    id: "wo-6",
    orderNumber: "RN-2025-006",
    title: "Калибрација мерних инструмената – Линија 5",
    description: "Годишња калибрација мерача притиска, температуре и протока.",
    priority: "srednji",
    status: "zavrsen",
    assignedTo: "emp-2",
    dueDate: "2025-02-05",
    estimatedHours: 5,
    actualHours: 4,
    createdAt: "2025-01-28T09:00:00Z",
    updatedAt: "2025-02-04T15:00:00Z",
    completedAt: "2025-02-04T15:00:00Z",
    costRSD: 65000,
    pdvRate: 20,
    tasks: MOCK_TASKS.filter((t) => t.workOrderId === "wo-6"),
  },
  {
    id: "wo-7",
    orderNumber: "RN-2025-007",
    title: "Поправка крова – Сектор А",
    description:
      "Замена оштећених кровних црепова и хидроизолација на сектору А.",
    priority: "visok",
    status: "na_cekanju",
    assignedTo: "emp-5",
    dueDate: "2025-03-15",
    estimatedHours: 24,
    actualHours: 0,
    createdAt: "2025-02-10T08:00:00Z",
    updatedAt: "2025-02-10T08:00:00Z",
    completedAt: null,
    costRSD: 420000,
    pdvRate: 20,
    tasks: MOCK_TASKS.filter((t) => t.workOrderId === "wo-7"),
  },
  {
    id: "wo-8",
    orderNumber: "RN-2025-008",
    title: "Инсталација климатизације – Канцеларија 12",
    description:
      "Монтажа сплит климатизације 12kW у канцеларији 12. Укључује поставку јединице и цевовода.",
    priority: "nizak",
    status: "na_cekanju",
    assignedTo: "emp-1",
    dueDate: "2025-03-01",
    estimatedHours: 8,
    actualHours: 0,
    createdAt: "2025-02-12T10:00:00Z",
    updatedAt: "2025-02-12T10:00:00Z",
    completedAt: null,
    costRSD: 95000,
    pdvRate: 20,
    tasks: MOCK_TASKS.filter((t) => t.workOrderId === "wo-8"),
  },
  {
    id: "wo-9",
    orderNumber: "RN-2025-009",
    title: "Замена грејног елемента – Кухиња",
    description:
      "Замена грејног елемента и термостата за индустријски бојлер у кухињи.",
    priority: "srednji",
    status: "u_toku",
    assignedTo: "emp-3",
    dueDate: "2025-02-20",
    estimatedHours: 4,
    actualHours: 1,
    createdAt: "2025-02-14T07:00:00Z",
    updatedAt: "2025-02-18T11:00:00Z",
    completedAt: null,
    costRSD: 32000,
    pdvRate: 20,
    tasks: MOCK_TASKS.filter((t) => t.workOrderId === "wo-9"),
  },
  {
    id: "wo-10",
    orderNumber: "RN-2025-010",
    title: "Организација складишног простора",
    description:
      "Реорганизација и обележавање складишног простора у зони Ц према стандарду 5S.",
    priority: "nizak",
    status: "otkazan",
    assignedTo: "emp-6",
    dueDate: "2025-03-10",
    estimatedHours: 12,
    actualHours: 0,
    createdAt: "2025-02-15T08:00:00Z",
    updatedAt: "2025-02-18T09:00:00Z",
    completedAt: null,
    costRSD: 15000,
    pdvRate: 20,
    tasks: [],
  },
];
// ========== Helper Functions ==========

/** Format RSD currency */
export function formatRSD(amount: number): string {
  return (
    new Intl.NumberFormat("sr-RS", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + " RSD"
  );
}

/** Format date to Serbian locale */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/** Format date with time */
export function formatDateTime(dateStr: string): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** Generate next order number */
export function generateOrderNumber(existingOrders: WorkOrder[]): string {
  const year = new Date().getFullYear();
  const existing = existingOrders
    .map((o) => parseInt(o.orderNumber.split("-").pop() || "0", 10))
    .filter((n) => !isNaN(n));
  const maxNum = existing.length > 0 ? Math.max(...existing) : 0;
  return `RN-${year}-${String(maxNum + 1).padStart(3, "0")}`;
}

/** Check if a work order is overdue */
export function isOverdue(order: WorkOrder): boolean {
  if (order.status === "zavrsen" || order.status === "otkazan") return false;
  return new Date(order.dueDate) < new Date();
}

/** Get employee name by ID */
export function getEmployeeName(id: string): string {
  return EMPLOYEES.find((e) => e.id === id)?.name || "Непознато";
}

/** Get employee initials */
export function getEmployeeInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Default empty form data */
export function getDefaultWorkOrderForm(): WorkOrderFormData {
  return {
    title: "",
    description: "",
    priority: "srednji",
    status: "novi",
    assignedTo: "",
    dueDate: new Date().toISOString().split("T")[0],
    estimatedHours: 0,
    costRSD: 0,
    pdvRate: 20,
  };
}

/** Default empty task form */
export function getDefaultTaskForm(workOrderId: string): TaskFormData {
  return {
    workOrderId,
    title: "",
    description: "",
    status: "otvoren",
    assignedTo: "",
    dueDate: new Date().toISOString().split("T")[0],
    estimatedHours: 0,
  };
}
// ========== Report Generators ==========

export function generateCompletionReport(
  orders: WorkOrder[],
): CompletionReport {
  const total = orders.length;
  const completed = orders.filter((o) => o.status === "zavrsen").length;
  const inProgress = orders.filter((o) => o.status === "u_toku").length;
  const pending = orders.filter((o) =>
    ["novi", "na_cekanju", "zakuca"].includes(o.status),
  ).length;
  const cancelled = orders.filter((o) => o.status === "otkazan").length;
  const overdue = orders.filter(isOverdue).length;
  const completedOrders = orders.filter((o) => o.status === "zavrsen");
  const avgHours =
    completedOrders.length > 0
      ? completedOrders.reduce((sum, o) => sum + o.actualHours, 0) /
        completedOrders.length
      : 0;
  const totalCost = orders.reduce((sum, o) => sum + o.costRSD, 0);
  const totalPDV = orders.reduce(
    (sum, o) => sum + (o.costRSD * o.pdvRate) / 100,
    0,
  );

  return {
    total,
    completed,
    inProgress,
    pending,
    cancelled,
    overdue,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    avgHoursPerOrder: Math.round(avgHours * 10) / 10,
    totalCostRSD: totalCost,
    totalPDV,
  };
}

export function generateAssigneeReports(orders: WorkOrder[]): AssigneeReport[] {
  const grouped: Record<string, WorkOrder[]> = {};
  for (const order of orders) {
    if (!grouped[order.assignedTo]) grouped[order.assignedTo] = [];
    grouped[order.assignedTo].push(order);
  }

  return Object.entries(grouped).map(([empId, empsOrders]) => {
    const totalOrders = empsOrders.length;
    const completedOrders = empsOrders.filter(
      (o) => o.status === "zavrsen",
    ).length;
    const inProgressOrders = empsOrders.filter(
      (o) => o.status === "u_toku",
    ).length;
    const overdueOrders = empsOrders.filter(isOverdue).length;
    const totalHours = empsOrders.reduce((sum, o) => sum + o.actualHours, 0);

    return {
      employeeId: empId,
      employeeName: getEmployeeName(empId),
      totalOrders,
      completedOrders,
      inProgressOrders,
      overdueOrders,
      totalHours: Math.round(totalHours * 10) / 10,
      completionRate:
        totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,
    };
  });
}

export function generatePriorityReports(orders: WorkOrder[]): PriorityReport[] {
  return ALL_PRIORITIES.map((priority) => {
    const filtered = orders.filter((o) => o.priority === priority);
    return {
      priority,
      count: filtered.length,
      completed: filtered.filter((o) => o.status === "zavrsen").length,
      overdue: filtered.filter(isOverdue).length,
    };
  });
}
