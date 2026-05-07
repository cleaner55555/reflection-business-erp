export interface ScannedFile {
  fileName: string
  detectedTable: string | null
  detectedLabel: string | null
  headers: string[]
  totalRows: number
  autoMapping: Record<string, string>
  previewRows: Record<string, string>[]
  selectedTarget: string

}
export interface ImportProgress {
  currentEntity: string
  currentRow: number
  totalRows: number
  percent: number
  logs: { time: string; entity: string; message: string; status: 'success' | 'error' | 'info' }

}
export interface MigrationResult {
  partners: number
  products: number
  invoices: number
  contacts: number
  total: number
  success: boolean

}
export type MigrationStep = 1 | 2 | 3 | 4
type MigrationSource = 'external_accounting' | 'custom'

interface ScannedFile {
  fileName: string
  detectedTable: string | null
  detectedLabel: string | null
  headers: string[]
  totalRows: number
  autoMapping: Record<string, string>
  previewRows: Record<string, string>[]
  selectedTarget: string
}

interface ImportProgress {
  currentEntity: string
  currentRow: number
  totalRows: number
  percent: number
  logs: { time: string;

}

}