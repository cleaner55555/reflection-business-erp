export interface CellFormat {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  align?: 'left' | 'center' | 'right'
  color?: string
  bgColor?: string
  fontSize?: number
  numberFormat?: 'text' | 'number' | 'currency' | 'percent' | 'date'
}

export interface Sheet {
  id: string
  name: string
  data: Record<string, { value: string; format?: CellFormat }

export interface SpreadsheetTemplate {
  id: string
  name: string
  description: string
  icon: string
  category: string
  sheetCount: number
}

export interface HistoryEntry {
  sheetId: string
  cellRef: string
  oldValue: string
  newValue: string
  timestamp: number
}
