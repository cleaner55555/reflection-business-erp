// ============ TIMER STATE ============

export type TimerStatus = "idle" | "running" | "paused";

export interface TimerState {
  status: TimerStatus;
  entryId: string | null;
  projectId: string;
  taskId: string;
  description: string;
  startTime: string | null;
  elapsed: number; // seconds
}
// ============ TIME ENTRY ============

export type EntryStatus = "draft" | "submitted" | "approved" | "rejected";

export interface TimeEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  projectId: string;
  projectName: string;
  taskTitle: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  duration: number; // minutes
  status: EntryStatus;
  createdAt: string;
}

export interface CreateTimeEntryInput {
  employeeId: string;
  projectId: string;
  taskId: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface UpdateTimeEntryInput {
  id: string;
  projectId?: string;
  taskId?: string;
  description?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  status?: EntryStatus;
}
// ============ PROJECT & TASK ============

export interface ProjectInfo {
  id: string;
  name: string;
  color: string;
  status: string;
}

export interface TaskInfo {
  id: string;
  projectId: string;
  title: string;
  status: string;
  estimatedHours: number;
  loggedHours: number;
}
// ============ EMPLOYEE ============

export interface EmployeeInfo {
  id: string;
  name: string;
  position: string;
  department: string;
  avatar?: string;
}
// ============ ACTIVITY LOG ============

export type ActivityAction =
  | "timer_started"
  | "timer_stopped"
  | "timer_paused"
  | "timer_resumed"
  | "entry_created"
  | "entry_updated"
  | "entry_deleted"
  | "entry_submitted"
  | "entry_approved"
  | "entry_rejected";

export interface ActivityLogEntry {
  id: string;
  action: ActivityAction;
  description: string;
  timestamp: string;
  employeeName: string;
  metadata?: Record<string, string | number>;
}
// ============ REPORTS ============

export type ReportType = "project" | "employee" | "weekly";

export interface ReportFilters {
  dateFrom: string;
  dateTo: string;
  projectId?: string;
  employeeId?: string;
  reportType: ReportType;
}

export interface ProjectReportRow {
  projectId: string;
  projectName: string;
  projectColor: string;
  totalHours: number;
  totalEntries: number;
  avgHoursPerEntry: number;
}

export interface EmployeeReportRow {
  employeeId: string;
  employeeName: string;
  totalHours: number;
  totalEntries: number;
  avgDailyHours: number;
  activeDays: number;
}

export interface WeeklySummaryRow {
  day: string;
  dayLabel: string;
  totalHours: number;
  totalEntries: number;
  projectBreakdown: { projectName: string; hours: number }[];
}

export interface ReportSummary {
  totalHours: number;
  totalEntries: number;
  avgHoursPerDay: number;
  mostActiveProject: string;
  mostActiveEmployee: string;
  overtimeHours: number;
}
// ============ SETTINGS ============

export interface TimeTrackingSettings {
  defaultProjectId: string;
  roundToMinutes: number;
  allowOvertime: boolean;
  maxHoursPerDay: number;
  requireDescription: boolean;
  autoStopTimer: boolean;
  weeklyTargetHours: number;
  notifyBeforeEnd: boolean;
  notifyMinutesBefore: number;
  enableApproval: boolean;
}
// ============ DASHBOARD STATS ============

export interface DashboardStats {
  todayHours: number;
  todayEntries: number;
  weekHours: number;
  weekTarget: number;
  weekProgress: number;
  monthHours: number;
  activeProjects: number;
  runningTimer: boolean;
}
// ============ API RESPONSE ============

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
// ============ UTILITY ============

export const STATUS_LABELS: Record<EntryStatus, string> = {
  draft: "Нацрт",
  submitted: "Предат",
  approved: "Одобрен",
  rejected: "Одбијен",
};

export const STATUS_COLORS: Record<EntryStatus, string> = {
  draft: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
  submitted:
    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  approved:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  aktivan: "Активан",
  zavrsen: "Завршен",
  pauziran: "Паузиран",
  otkazan: "Отказан",
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  todo: "Чека",
  u_toku: "У току",
  zavrseno: "Завршено",
  blokirano: "Блокирано",
};
