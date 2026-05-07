export interface Employee {
  id: string; firstName: string; lastName: string; email: string | null; phone: string | null
  position: string | null; department: string | null; baseSalary: number; bankAccount: string | null
  isActive: boolean; hireDate: string; createdAt: string; partnerId: string | null
  partner?: { id: string; name: string }

}
export interface Payroll {
  id: string; employeeId: string; month: number; year: number; baseSalary: number;
  bonuses: number; deductions: number; netSalary: number; status: string;
  payDate: string | null; notes: string | null
  employee: { id: string; firstName: string; lastName: string }

}
export interface Attendance {
  id: string; employeeId: string; date: string; hoursWorked: number;
  type: string; notes: string | null; createdAt: string
  employee: { id: string; firstName: string; lastName: string }

}
export interface EmployeeOption {
  id: string; firstName: string; lastName: string; baseSalary: number; department: string | null

}
export interface EmployeeStats {
  total: number; active: number; inactive: number; totalSalaryCost: number; avgSalary: number
  newThisMonth: number; anniversaries: { id: string; firstName: string; lastName: string; hireDate: string; years: number }

}