export interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  employee: string;
  employeeId: string;
  paymentMethod: string;
  status: string;
  hasReceipt: boolean;
  notes?: string;
  reportId?: string;
  createdAt: string;
}

export interface ExpenseReport {
  id: string;
  title: string;
  employee: string;
  employeeId: string;
  dateFrom: string;
  dateTo: string;
  status: string;
  totalAmount: number;
  expenseCount: number;
  notes?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  name: string;
  category: string;
  allocatedAmount: number;
  spentAmount: number;
  period: string;
  startDate: string;
  endDate: string;
}

export interface Policy {
  id: string;
  name: string;
  category: string;
  maxAmount: number;
  frequency: string;
  approvalThreshold: number;
  isActive: boolean;
}
