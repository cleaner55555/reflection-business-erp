// ==================== TEMPLATE INDEX ====================
// Centralized re-exports for all 7 report type generators.
// Each generator creates a professional multi-page PDF with charts,
// tables, KPI cards, and proper headers/footers.

export { generateFinancialSummaryPDF } from './financial'
export type { FinancialSummaryData } from './financial'

export { generateSalesAnalyticsPDF } from './sales'
export type { SalesAnalyticsData } from './sales'

export { generateInventoryStatusPDF } from './inventory'
export type { InventoryStatusData } from './inventory'

export { generateEmployeePerformancePDF } from './employee'
export type { EmployeePerformanceData } from './employee'

export { generateInvoiceSummaryPDF } from './invoice'
export type { InvoiceSummaryData } from './invoice'

export { generateProjectProgressPDF } from './project'
export type { ProjectProgressData } from './project'

export { generateCustomerAnalysisPDF } from './customer'
export type { CustomerAnalysisData } from './customer'

// ==================== CONVENIENCE MAP ====================

import type {
  FinancialSummaryData,
  SalesAnalyticsData,
  InventoryStatusData,
  EmployeePerformanceData,
  InvoiceSummaryData,
  ProjectProgressData,
  CustomerAnalysisData,
} from './index'

import type { ReportType } from '../demo-data'
import {
  generateFinancialDemoData,
  generateSalesDemoData,
  generateInventoryDemoData,
  generateEmployeeDemoData,
  generateInvoiceDemoData,
  generateProjectDemoData,
  generateCustomerDemoData,
} from '../demo-data'

import { generateFinancialSummaryPDF } from './financial'
import { generateSalesAnalyticsPDF } from './sales'
import { generateInventoryStatusPDF } from './inventory'
import { generateEmployeePerformancePDF } from './employee'
import { generateInvoiceSummaryPDF } from './invoice'
import { generateProjectProgressPDF } from './project'
import { generateCustomerAnalysisPDF } from './customer'

export interface ReportGeneratorOptions {
  dateFrom?: string
  dateTo?: string
}

/**
 * Generate a PDF report by type. Uses demo data when no specific data is provided.
 * This is a convenience function that auto-selects the correct template.
 */
export async function generateReportByType(
  type: ReportType,
  data?: Record<string, unknown>,
  options?: ReportGeneratorOptions
) {
  const { dateFrom, dateTo } = options || {}

  switch (type) {
    case 'financial': {
      const d = (data || generateFinancialDemoData(dateFrom, dateTo)) as FinancialSummaryData
      return generateFinancialSummaryPDF(d)
    }
    case 'sales': {
      const d = (data || generateSalesDemoData(dateFrom, dateTo)) as SalesAnalyticsData
      return generateSalesAnalyticsPDF(d)
    }
    case 'inventory': {
      const d = (data || generateInventoryDemoData()) as InventoryStatusData
      return generateInventoryStatusPDF(d)
    }
    case 'employee': {
      const d = (data || generateEmployeeDemoData()) as EmployeePerformanceData
      return generateEmployeePerformancePDF(d)
    }
    case 'invoice': {
      const d = (data || generateInvoiceDemoData(dateFrom, dateTo)) as InvoiceSummaryData
      return generateInvoiceSummaryPDF(d)
    }
    case 'project': {
      const d = (data || generateProjectDemoData()) as ProjectProgressData
      return generateProjectProgressPDF(d)
    }
    case 'customer': {
      const d = (data || generateCustomerDemoData(dateFrom, dateTo)) as CustomerAnalysisData
      return generateCustomerAnalysisPDF(d)
    }
  }
}
