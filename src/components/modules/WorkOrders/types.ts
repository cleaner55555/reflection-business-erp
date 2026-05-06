// ==========================================
// Radni Nalozi – Type Definitions
// Serbian ERP: Reflection Business
// ==========================================

export type WorkOrderPriority = "visok" | "srednji" | "nizak";
export type WorkOrderStatus =
  | "novi"
  | "zakuca"
  | "u_toku"
  | "na_cekanju"
  | "zavrsen"
  | "otkazan";

export type TaskStatus = "otvoren" | "u_toku" | "zavrsen" | "blokiran";

// ---------- Core ----------

export interface WorkOrderTask {
  id: string;
  workOrderId: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedTo: string;
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrder {
  id: string;
  orderNumber: string;
  title: string;
  description: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  assignedTo: string;
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  costRSD: number;
  pdvRate: number;
  tasks: WorkOrderTask[];
}

// ---------- Employee ----------

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  avatarUrl: string | null;
}

// ---------- Form ----------

export interface WorkOrderFormData {
  title: string;
  description: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  assignedTo: string;
  dueDate: string;
  estimatedHours: number;
  costRSD: number;
  pdvRate: number;
}

export interface TaskFormData {
  workOrderId: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedTo: string;
  dueDate: string;
  estimatedHours: number;
}

// ---------- Reports ----------

export interface CompletionReport {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  cancelled: number;
  overdue: number;
  completionRate: number;
  avgHoursPerOrder: number;
  totalCostRSD: number;
  totalPDV: number;
}

export interface AssigneeReport {
  employeeId: string;
  employeeName: string;
  totalOrders: number;
  completedOrders: number;
  inProgressOrders: number;
  overdueOrders: number;
  totalHours: number;
  completionRate: number;
}

export interface PriorityReport {
  priority: WorkOrderPriority;
  count: number;
  completed: number;
  overdue: number;
}

// ---------- View ----------

export type WorkOrderViewMode = "tabela" | "kanban";
export type PlannerGroupBy = "datum" | "zaposleni" | "prioritet";

// ---------- API ----------

export interface WorkOrdersApiResponse {
  success: boolean;
  data?: WorkOrder[];
  error?: string;
}

export interface WorkOrderApiResponse {
  success: boolean;
  data?: WorkOrder;
  error?: string;
}
