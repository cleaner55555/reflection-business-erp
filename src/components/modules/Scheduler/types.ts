export interface PlanningSlot {
  id: string;
  employeeId?: string;
  employeeName?: string;
  projectId?: string;
  projectName?: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  task?: string;
  status: string;
  notes?: string;
  priority?: string;
  recurring?: string;
}

export interface Employee {
  id: string;
  name: string;
  capacity: number;
  color: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
}

export interface GanttItem {
  id: string;
  projectName: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  progress: number;
  color: string;
  isMilestone?: boolean;
}

export interface AvailabilityDay {
  date: string;
  hours: number;
  status: "available" | "unavailable" | "partial";
  reason?: string;
}
