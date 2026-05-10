'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table2, Plus, RefreshCw, BarChart3, FileSpreadsheet,
  Download, Upload, Save, Calculator, Filter, ArrowRight,
  ChevronDown, Maximize2, Minimize, Bold, Italic, AlignLeft, AlignCenter,
  AlignRight, Underline, Copy, Scissors, ClipboardPaste,
  Undo2, Redo2, Search, Replace, SortAsc, SortDesc, Type,
  DollarSign, Percent, Hash, Palette, Trash2, Eye, EyeOff,
  FileUp, FileDown, TableProperties, Grid3X3, Braces, BarChart2,
  PieChart as PieChartIcon, TrendingUp, CheckCircle2, X,
  ChevronRight, ChevronLeft, MoreHorizontal, Lock, Unlock,
  ArrowUpDown, Minus, Columns3, Rows3, XCircle, AlertCircle,
  Info, Sparkles, LayoutTemplate, Printer, Share2, Star,
  Clock, CalendarDays, MousePointer, Zap, ArrowUp, ArrowDown,
  ArrowLeft
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// ============ TYPES ============

interface CellFormat {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  align?: 'left' | 'center' | 'right'
  color?: string
  bgColor?: string
  fontSize?: number
  numberFormat?: 'text' | 'number' | 'currency' | 'percent' | 'date'
}

interface Sheet {
  id: string
  name: string
  data: Record<string, { value: string; format?: CellFormat }>
  colWidths: Record<number, number>
  rowHeights: Record<number, number>
  frozenRows: number
  frozenCols: number
  hiddenCols: Set<number>
  hiddenRows: Set<number>
  filters: { col: number; value: string }[]
  sortCol: number | null
  sortDir: 'asc' | 'desc' | null
}

interface SpreadsheetTemplate {
  id: string
  name: string
  description: string
  icon: string
  category: string
  sheetCount: number
}

interface HistoryEntry {
  sheetId: string
  cellRef: string
  oldValue: string
  newValue: string
  timestamp: number
}

// ============ CONSTANTS ============

const DEFAULT_COLS = 26
const DEFAULT_ROWS = 100
const COL_LETTERS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))

const FORMULA_LIST = [
  { name: 'SUM', desc: 'Zbir brojeva', syntax: '=SUM(A1:A10)', example: '=SUM(A1:A10)' },
  { name: 'AVERAGE', desc: 'Prosek brojeva', syntax: '=AVERAGE(A1:A10)', example: '=AVERAGE(A1:A10)' },
  { name: 'COUNT', desc: 'Broj ćelija sa brojevima', syntax: '=COUNT(A1:A10)', example: '=COUNT(A1:A10)' },
  { name: 'COUNTA', desc: 'Broj ne-praznih ćelija', syntax: '=COUNTA(A1:A10)', example: '=COUNTA(A1:A10)' },
  { name: 'MAX', desc: 'Maksimalna vrednost', syntax: '=MAX(A1:A10)', example: '=MAX(A1:A10)' },
  { name: 'MIN', desc: 'Minimalna vrednost', syntax: '=MIN(A1:A10)', example: '=MIN(A1:A10)' },
  { name: 'IF', desc: 'Uslovni israz', syntax: '=IF(uslov,da,ne)', example: '=IF(A1>10,"Visoko","Nisko")' },
  { name: 'AND', desc: 'Logičko I', syntax: '=AND(A1>0,B1>0)', example: '=AND(A1>0,B1>0)' },
  { name: 'OR', desc: 'Logičko ILI', syntax: '=OR(A1>0,B1>0)', example: '=OR(A1>0,B1>0)' },
  { name: 'NOT', desc: 'Logičko NE', syntax: '=NOT(A1>0)', example: '=NOT(A1>0)' },
  { name: 'CONCATENATE', desc: 'Spajanje teksta', syntax: '=CONCATENATE(A1," ",B1)', example: '=CONCATENATE(A1," ",B1)' },
  { name: 'LEFT', desc: 'Levi deo teksta', syntax: '=LEFT(A1,n)', example: '=LEFT(A1,5)' },
  { name: 'RIGHT', desc: 'Desni deo teksta', syntax: '=RIGHT(A1,n)', example: '=RIGHT(A1,5)' },
  { name: 'MID', desc: 'Srednji deo teksta', syntax: '=MID(A1,start,n)', example: '=MID(A1,2,3)' },
  { name: 'LEN', desc: 'Dužina teksta', syntax: '=LEN(A1)', example: '=LEN(A1)' },
  { name: 'UPPER', desc: 'Velika slova', syntax: '=UPPER(A1)', example: '=UPPER(A1)' },
  { name: 'LOWER', desc: 'Mala slova', syntax: '=LOWER(A1)', example: '=LOWER(A1)' },
  { name: 'TRIM', desc: 'Ukloni suvišne razmake', syntax: '=TRIM(A1)', example: '=TRIM(A1)' },
  { name: 'ROUND', desc: 'Zaokruži na decimale', syntax: '=ROUND(A1,2)', example: '=ROUND(A1,2)' },
  { name: 'ABS', desc: 'Apsolutna vrednost', syntax: '=ABS(A1)', example: '=ABS(A1)' },
  { name: 'POWER', desc: 'Stepenovanje', syntax: '=POWER(A1,2)', example: '=POWER(A1,2)' },
  { name: 'SQRT', desc: 'Kvadratni koren', syntax: '=SQRT(A1)', example: '=SQRT(A1)' },
  { name: 'MOD', desc: 'Ostatak deljenja', syntax: '=MOD(A1,2)', example: '=MOD(A1,2)' },
  { name: 'TODAY', desc: 'Današnji datum', syntax: '=TODAY()', example: '=TODAY()' },
  { name: 'NOW', desc: 'Trenutno vreme', syntax: '=NOW()', example: '=NOW()' },
  { name: 'VLOOKUP', desc: 'Vertikalna pretraga', syntax: '=VLOOKUP(val,range,col)', example: '=VLOOKUP(A1,B1:C10,2)' },
  { name: 'COUNTIF', desc: 'Broj po uslovu', syntax: '=COUNTIF(range,uslov)', example: '=COUNTIF(A1:A10,">5")' },
  { name: 'SUMIF', desc: 'Zbir po uslovu', syntax: '=SUMIF(range,uslov,suma)', example: '=SUMIF(A1:A10,">5")' },
  { name: 'AVERAGEIF', desc: 'Prosek po uslovu', syntax: '=AVERAGEIF(range,uslov)', example: '=AVERAGEIF(A1:A10,">5")' },
]

const TEMPLATES: SpreadsheetTemplate[] = [
  { id: 'blank', name: 'Prazan dokument', description: 'Prazan radni list sa 100 redova i 26 kolona', icon: '📄', category: 'Opšte', sheetCount: 1 },
  { id: 'budget', name: 'Budžet', description: 'Mesečni budžet sa prihodima, rashodima i stanjem', icon: '💰', category: 'Finansije', sheetCount: 3 },
  { id: 'inventory', name: 'Inventar', description: 'Popis robe sa količinama, cenama i vrednostima', icon: '📦', category: 'Magacin', sheetCount: 2 },
  { id: 'employees', name: 'Spisak zaposlenih', description: 'Podaci o zaposlenima sa platama i odeljenjima', icon: '👥', category: 'HR', sheetCount: 2 },
  { id: 'sales', name: 'Praćenje prodaje', description: 'Dnevna prodaja sa analizom po proizvodima', icon: '📈', category: 'Prodaja', sheetCount: 3 },
  { id: 'timesheet', name: 'Evidencija vremena', description: 'Nedeljna evidencija po zaposlenima i projektima', icon: '⏱️', category: 'Projekti', sheetCount: 2 },
  { id: 'crm_leads', name: 'CRM Lead-ovi', description: 'Spisak lead-ova sa statusom i praćenjem', icon: '🎯', category: 'CRM', sheetCount: 2 },
  { id: 'invoice_tracker', name: 'Praćenje faktura', description: 'Pregled faktura sa rokovima plaćanja', icon: '🧾', category: 'Finansije', sheetCount: 2 },
  { id: 'project_gantt', name: 'Projektni plan', description: 'Gantt dijagram sa zadacima i rokovima', icon: '📋', category: 'Projekti', sheetCount: 2 },
  { id: 'kpi_dashboard', name: 'KPI Ploča', description: 'Ključni pokazatelji performansi', icon: '📊', category: 'Analitika', sheetCount: 2 },
]

// ============ HELPERS ============

const getColLetter = (col: number): string => {
  let result = ''
  let c = col
  while (c >= 0) {
    result = String.fromCharCode(65 + (c % 26)) + result
    c = Math.floor(c / 26) - 1
  }
  return result
}

const parseCellRef = (ref: string): { row: number; col: number } | null => {
  const match = ref.match(/^([A-Z]+)(\d+)$/)
  if (!match) return null
  const col = match[1].split('').reduce((acc, ch) => acc * 26 + (ch.charCodeAt(0) - 64), 0) - 1
  const row = parseInt(match[2]) - 1
  return { row, col }
}

const getCellRef = (row: number, col: number): string => `${getColLetter(col)}${row + 1}`

const formatCurrency = (val: number) => new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', minimumFractionDigits: 2 }).format(val)
const formatPercent = (val: number) => `${(val * 100).toFixed(1)}%`
const formatDate = (val: string) => {
  const d = new Date(val)
  return isNaN(d.getTime()) ? val : d.toLocaleDateString('sr-RS')
}

// ============ FORMULA ENGINE ============

class FormulaEngine {
  private sheet: Sheet

  constructor(sheet: Sheet) {
    this.sheet = sheet
  }

  private getCellValue(ref: string): number | string {
    const parsed = parseCellRef(ref)
    if (!parsed) return 0
    const cellKey = getCellRef(parsed.row, parsed.col)
    const raw = this.sheet.data[cellKey]?.value || ''
    const num = parseFloat(raw)
    if (!isNaN(num) && raw.trim() !== '') return num
    return raw
  }

  private getRangeValues(rangeStr: string): (number | string)[] {
    const rangeMatch = rangeStr.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/)
    if (!rangeMatch) return []
    const start = parseCellRef(`${rangeMatch[1]}${rangeMatch[2]}`)
    const end = parseCellRef(`${rangeMatch[3]}${rangeMatch[4]}`)
    if (!start || !end) return []
    const values: (number | string)[] = []
    for (let r = Math.min(start.row, end.row); r <= Math.max(start.row, end.row); r++) {
      for (let c = Math.min(start.col, end.col); c <= Math.max(start.col, end.col); c++) {
        values.push(this.getCellValue(getCellRef(r, c)))
      }
    }
    return values
  }

  private getNumericRange(rangeStr: string): number[] {
    return this.getRangeValues(rangeStr).filter((v): v is number => typeof v === 'number')
  }

  private evaluateCondition(condition: string): boolean {
    const ops = ['>=', '<=', '!=', '>', '<', '=']
    for (const op of ops) {
      const idx = condition.indexOf(op)
      if (idx !== -1) {
        const left = parseFloat(condition.slice(0, idx))
        const right = parseFloat(condition.slice(idx + op.length))
        if (!isNaN(left) && !isNaN(right)) {
          switch (op) {
            case '>=': return left >= right
            case '<=': return left <= right
            case '!=': return left !== right
            case '>': return left > right
            case '<': return left < right
            case '=': return left === right
          }
        }
      }
    }
    return false
  }

  evaluate(formula: string): string {
    if (!formula.startsWith('=')) return formula
    try {
      let expr = formula.slice(1).trim()
      const upper = expr.toUpperCase()

      // SUM
      let match = upper.match(/^SUM\(([A-Z]+\d+:[A-Z]+\d+)\)$/i)
      if (match) return this.getNumericRange(expr.slice(4, -1)).reduce((a, b) => a + b, 0).toString()

      // AVERAGE
      match = upper.match(/^AVERAGE\(([A-Z]+\d+:[A-Z]+\d+)\)$/i)
      if (match) { const nums = this.getNumericRange(expr.slice(8, -1)); return nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toString() : '0' }

      // COUNT
      match = upper.match(/^COUNT\(([A-Z]+\d+:[A-Z]+\d+)\)$/i)
      if (match) return this.getNumericRange(expr.slice(6, -1)).length.toString()

      // COUNTA
      match = upper.match(/^COUNTA\(([A-Z]+\d+:[A-Z]+\d+)\)$/i)
      if (match) return this.getRangeValues(expr.slice(7, -1)).filter(v => v !== '' && v !== 0).length.toString()

      // MAX
      match = upper.match(/^MAX\(([A-Z]+\d+:[A-Z]+\d+)\)$/i)
      if (match) { const nums = this.getNumericRange(expr.slice(4, -1)); return nums.length ? Math.max(...nums).toString() : '0' }

      // MIN
      match = upper.match(/^MIN\(([A-Z]+\d+:[A-Z]+\d+)\)$/i)
      if (match) { const nums = this.getNumericRange(expr.slice(4, -1)); return nums.length ? Math.min(...nums).toString() : '0' }

      // COUNTIF
      match = upper.match(/^COUNTIF\(([A-Z]+\d+:[A-Z]+\d+),(.+)\)$/i)
      if (match) {
        const range = expr.slice(8, expr.lastIndexOf(','))
        const condition = expr.slice(expr.lastIndexOf(',') + 1, -1).trim().replace(/^["']|["']$/g, '')
        return this.getRangeValues(range).filter(v => String(v) === condition || (typeof v === 'number' && this.evaluateCondition(`${v}${condition}`))).length.toString()
      }

      // SUMIF
      match = upper.match(/^SUMIF\(([A-Z]+\d+:[A-Z]+\d+),(.+?)(?:,([A-Z]+\d+:[A-Z]+\d+))?\)$/i)
      if (match) {
        const fullExpr = expr.slice(6, -1)
        const parts = this.splitFormulaArgs(fullExpr, 3)
        if (parts.length >= 2) {
          const range = this.getRangeValues(parts[0])
          const condition = parts[1].trim().replace(/^["']|["']$/g, '')
          const sumRange = parts[2] ? this.getRangeValues(parts[2]) : range
          let sum = 0
          range.forEach((v, i) => {
            if (String(v) === condition || (typeof v === 'number' && this.evaluateCondition(`${v}${condition}`))) {
              if (typeof sumRange[i] === 'number') sum += sumRange[i]
            }
          })
          return sum.toString()
        }
      }

      // AVERAGEIF
      match = upper.match(/^AVERAGEIF\(([A-Z]+\d+:[A-Z]+\d+),(.+)\)$/i)
      if (match) {
        const fullExpr = expr.slice(10, -1)
        const parts = this.splitFormulaArgs(fullExpr, 2)
        if (parts.length >= 2) {
          const range = this.getRangeValues(parts[0])
          const condition = parts[1].trim().replace(/^["']|["']$/g, '')
          const filtered = range.filter(v => String(v) === condition || (typeof v === 'number' && this.evaluateCondition(`${v}${condition}`)))
          const nums = filtered.filter((v): v is number => typeof v === 'number')
          return nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toString() : '0'
        }
      }

      // IF
      match = upper.match(/^IF\((.+),(.+),(.+)\)$/i)
      if (match) {
        const fullExpr = expr.slice(3, -1)
        const parts = this.splitFormulaArgs(fullExpr, 3)
        if (parts.length >= 2) {
          const condition = parts[0].trim()
          const trueVal = parts[1].trim().replace(/^["']|["']$/g, '')
          const falseVal = parts[2]?.trim().replace(/^["']|["']$/g, '') || ''
          const result = this.evaluateCondition(condition) ? trueVal : falseVal
          return result
        }
      }

      // AND
      match = upper.match(/^AND\((.+)\)$/i)
      if (match) {
        const args = this.splitFormulaArgs(expr.slice(4, -1))
        return args.every(a => this.evaluateCondition(a.trim())).toString()
      }

      // OR
      match = upper.match(/^OR\((.+)\)$/i)
      if (match) {
        const args = this.splitFormulaArgs(expr.slice(3, -1))
        return args.some(a => this.evaluateCondition(a.trim())).toString()
      }

      // NOT
      match = upper.match(/^NOT\((.+)\)$/i)
      if (match) {
        return (!this.evaluateCondition(expr.slice(4, -1).trim())).toString()
      }

      // CONCATENATE / CONCAT
      match = upper.match(/^(?:CONCATENATE|CONCAT)\((.+)\)$/i)
      if (match) {
        const args = this.splitFormulaArgs(expr.slice(upper.startsWith('CONCATENATE') ? 12 : 7, -1))
        return args.map(a => {
          const trimmed = a.trim().replace(/^["']|["']$/g, '')
          const cellVal = this.getCellValue(trimmed)
          return typeof cellVal === 'number' ? cellVal.toString() : (trimmed === a.trim() ? cellVal : trimmed)
        }).join('')
      }

      // LEFT
      match = upper.match(/^LEFT\((.+),(\d+)\)$/i)
      if (match) {
        const parts = this.splitFormulaArgs(expr.slice(5, -1))
        const text = String(this.getCellValue(parts[0].trim()))
        const n = parseInt(parts[1] || '1')
        return text.slice(0, n)
      }

      // RIGHT
      match = upper.match(/^RIGHT\((.+),(\d+)\)$/i)
      if (match) {
        const parts = this.splitFormulaArgs(expr.slice(6, -1))
        const text = String(this.getCellValue(parts[0].trim()))
        const n = parseInt(parts[1] || '1')
        return text.slice(-n)
      }

      // MID
      match = upper.match(/^MID\((.+),(\d+),(\d+)\)$/i)
      if (match) {
        const parts = this.splitFormulaArgs(expr.slice(4, -1))
        const text = String(this.getCellValue(parts[0].trim()))
        const start = parseInt(parts[1] || '1') - 1
        const len = parseInt(parts[2] || '1')
        return text.slice(start, start + len)
      }

      // LEN
      match = upper.match(/^LEN\((.+)\)$/i)
      if (match) return String(this.getCellValue(expr.slice(4, -1).trim())).length.toString()

      // UPPER
      match = upper.match(/^UPPER\((.+)\)$/i)
      if (match) return String(this.getCellValue(expr.slice(6, -1).trim())).toUpperCase()

      // LOWER
      match = upper.match(/^LOWER\((.+)\)$/i)
      if (match) return String(this.getCellValue(expr.slice(6, -1).trim())).toLowerCase()

      // TRIM
      match = upper.match(/^TRIM\((.+)\)$/i)
      if (match) return String(this.getCellValue(expr.slice(5, -1).trim())).trim()

      // ROUND
      match = upper.match(/^ROUND\((.+),(\d+)\)$/i)
      if (match) {
        const parts = this.splitFormulaArgs(expr.slice(6, -1))
        const num = parseFloat(String(this.getCellValue(parts[0].trim())))
        const decimals = parseInt(parts[1] || '0')
        return isNaN(num) ? '0' : num.toFixed(decimals)
      }

      // ABS
      match = upper.match(/^ABS\((.+)\)$/i)
      if (match) { const num = parseFloat(String(this.getCellValue(expr.slice(4, -1).trim()))); return isNaN(num) ? '0' : Math.abs(num).toString() }

      // POWER
      match = upper.match(/^POWER\((.+),(.+)\)$/i)
      if (match) {
        const parts = this.splitFormulaArgs(expr.slice(6, -1))
        const base = parseFloat(String(this.getCellValue(parts[0].trim())))
        const exp = parseFloat(String(this.getCellValue(parts[1].trim())))
        return isNaN(base) || isNaN(exp) ? '0' : Math.pow(base, exp).toString()
      }

      // SQRT
      match = upper.match(/^SQRT\((.+)\)$/i)
      if (match) { const num = parseFloat(String(this.getCellValue(expr.slice(5, -1).trim()))); return isNaN(num) || num < 0 ? '0' : Math.sqrt(num).toString() }

      // MOD
      match = upper.match(/^MOD\((.+),(.+)\)$/i)
      if (match) {
        const parts = this.splitFormulaArgs(expr.slice(4, -1))
        const a = parseFloat(String(this.getCellValue(parts[0].trim())))
        const b = parseFloat(String(this.getCellValue(parts[1].trim())))
        return isNaN(a) || isNaN(b) || b === 0 ? '0' : (a % b).toString()
      }

      // TODAY
      match = upper.match(/^TODAY\(\)$/i)
      if (match) return new Date().toISOString().split('T')[0]

      // NOW
      match = upper.match(/^NOW\(\)$/i)
      if (match) return new Date().toLocaleString('sr-RS')

      // VLOOKUP
      match = upper.match(/^VLOOKUP\((.+),([A-Z]+\d+:[A-Z]+\d+),(\d+)\)$/i)
      if (match) {
        const fullExpr = expr.slice(8, -1)
        const parts = this.splitFormulaArgs(fullExpr, 3)
        if (parts.length >= 3) {
          const searchVal = parts[0].trim().replace(/^["']|["']$/g, '') || String(this.getCellValue(parts[0].trim()))
          const range = this.getRangeValues(parts[1].trim())
          const colIdx = parseInt(parts[2]) - 1
          const rangeStr = parts[1].trim()
          const rangeMatch = rangeStr.match(/^([A-Z]+\d+):([A-Z]+\d+)$/i)
          if (rangeMatch) {
            const startParsed = parseCellRef(rangeMatch[1])
            const endParsed = parseCellRef(rangeMatch[2])
            if (startParsed && endParsed) {
              const totalCols = Math.abs(endParsed.col - startParsed.col) + 1
              const startRow = Math.min(startParsed.row, endParsed.row)
              const endRow = Math.max(startParsed.row, endParsed.row)
              for (let r = startRow; r <= endRow; r++) {
                const firstColVal = String(this.getCellValue(getCellRef(r, Math.min(startParsed.col, endParsed.col))))
                if (firstColVal === searchVal) {
                  return String(this.getCellValue(getCellRef(r, Math.min(startParsed.col, endParsed.col) + colIdx)))
                }
              }
            }
          }
          return '#N/A'
        }
      }

      // Simple cell reference
      match = upper.match(/^([A-Z]+\d+)$/)
      if (match) return String(this.getCellValue(match[1]))

      // Simple math expression with cell refs
      const mathExpr = expr.replace(/([A-Z]+\d+)/g, (_, ref) => {
        const val = this.getCellValue(ref)
        return typeof val === 'number' ? val : 0
      })
      try {
        const result = new Function(`return ${mathExpr}`)() as number
        if (typeof result === 'number' && !isNaN(result)) {
          return Number.isInteger(result) ? result.toString() : result.toFixed(2)
        }
      } catch { /* fallback */ }

      return formula
    } catch {
      return '#ERROR'
    }
  }

  private splitFormulaArgs(expr: string, maxArgs?: number): string[] {
    const args: string[] = []
    let current = ''
    let depth = 0
    let inString = false
    let stringChar = ''

    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i]
      if (inString) {
        current += ch
        if (ch === stringChar) inString = false
        continue
      }
      if (ch === '"' || ch === "'") {
        inString = true
        stringChar = ch
        current += ch
        continue
      }
      if (ch === '(') depth++
      if (ch === ')') depth--
      if (ch === ',' && depth === 0 && (!maxArgs || args.length < maxArgs - 1)) {
        args.push(current)
        current = ''
        continue
      }
      current += ch
    }
    if (current) args.push(current)
    return args
  }
}

// ============ TEMPLATE DATA ============

function createTemplateData(templateId: string): Sheet[] {
  const makeSheet = (name: string, data: Record<string, string>): Sheet => ({
    id: crypto.randomUUID(),
    name,
    data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, { value: v }])),
    colWidths: {}, rowHeights: {}, frozenRows: 0, frozenCols: 0,
    hiddenCols: new Set(), hiddenRows: new Set(), filters: [], sortCol: null, sortDir: null,
  })

  switch (templateId) {
    case 'budget':
      return [
        makeSheet('Mesečni pregled', {
          A1: 'Kategorija', B1: 'Jan', C1: 'Feb', D1: 'Mar', E1: 'Q1 Ukupno', F1: 'Plan',
          A2: 'Prihodi - Prodaja', B2: '500000', C2: '520000', D2: '550000', E2: '=SUM(B2:D2)', F2: '1500000',
          A3: 'Prihodi - Ostalo', B3: '50000', C3: '45000', D3: '60000', E3: '=SUM(B3:D3)', F3: '150000',
          A4: 'Rashodi - Materijal', B4: '200000', C4: '210000', D4: '220000', E4: '=SUM(B4:D4)', F4: '600000',
          A5: 'Rashodi - Zaposleni', B5: '150000', C5: '150000', D5: '155000', E5: '=SUM(B5:D5)', F5: '450000',
          A6: 'Rashodi - Režije', B6: '30000', C6: '28000', D6: '32000', E6: '=SUM(B6:D6)', F6: '90000',
          A7: 'Rashodi - Marketing', B7: '20000', C7: '25000', D7: '22000', E7: '=SUM(B7:D7)', F7: '60000',
          A8: 'UKUPNO PRIHODI', B8: '=SUM(B2:B3)', C8: '=SUM(C2:C3)', D8: '=SUM(D2:D3)', E8: '=SUM(B8:D8)', F8: '=SUM(F2:F3)',
          A9: 'UKUPNO RASHODI', B9: '=SUM(B4:B7)', C9: '=SUM(C4:C7)', D9: '=SUM(D4:D7)', E9: '=SUM(B9:D9)', F9: '=SUM(F4:F7)',
          A10: 'PROFIT', B10: '=B8-B9', C10: '=C8-C9', D10: '=D8-D9', E10: '=SUM(B10:D10)', F10: '=F8-F9',
          A11: 'Marža %', B11: '=IF(B8>0,B10/B8*100,0)', C11: '=IF(C8>0,C10/C8*100,0)', D11: '=IF(D8>0,D10/D8*100,0)', E11: '=IF(E8>0,E10/E8*100,0)', F11: '=IF(F8>0,F10/F8*100,0)',
        }),
        makeSheet('Godišnji plan', {
          A1: 'Kategorija', B1: 'Q1', C1: 'Q2', D1: 'Q3', E1: 'Q4', F1: 'Godina',
          A2: 'Prihodi', B2: '1680000', C2: '1750000', D2: '1820000', E2: '1900000', F2: '=SUM(B2:E2)',
          A3: 'Rashodi', B3: '1200000', C3: '1250000', D3: '1300000', E3: '1350000', F3: '=SUM(B3:E3)',
          A4: 'Profit', B4: '=B2-B3', C4: '=C2-C3', D4: '=D2-D3', E4: '=E2-E3', F4: '=SUM(B4:E4)',
        }),
        makeSheet('Komitenti', {
          A1: 'Komitent', B1: 'Tip', C1: 'Iznos', D1: 'Rok', E1: 'Status',
          A2: 'Partner A DOO', B2: 'Prihod', C2: '250000', D2: '30 dana', E2: 'Aktivan',
          A3: 'Partner B DOO', B3: 'Rashod', C3: '180000', D3: '15 dana', E3: 'Aktivan',
          A4: 'Partner C DOO', B4: 'Prihod', C4: '120000', D4: '60 dana', E4: 'Na čekanju',
        }),
      ]
    case 'inventory':
      return [
        makeSheet('Inventar', {
          A1: 'Šifra', B1: 'Naziv proizvoda', C1: 'Kategorija', D1: 'Količina', E1: 'Jed. mere', F1: 'Nabavna cena', G1: 'Prodajna cena', H1: 'Vrednost zaliha', I1: 'Min. količina', J1: 'Status',
          A2: 'PRD-001', B2: 'Proizvod A', C2: 'Elektronika', D2: '150', E2: 'kom', F2: '5000', G2: '8900', H2: '=D2*F2', I2: '50', J2: '=IF(D2>I2,"OK","NEDOVOLJNO")',
          A3: 'PRD-002', B3: 'Proizvod B', C3: 'Oprema', D3: '75', E3: 'kom', F3: '12000', G3: '18900', H3: '=D3*F3', I3: '20', J3: '=IF(D3>I3,"OK","NEDOVOLJNO")',
          A4: 'PRD-003', B4: 'Materijal C', C4: 'Sirovine', D4: '500', E4: 'kg', F4: '800', G4: '1200', H4: '=D4*F4', I4: '100', J4: '=IF(D4>I4,"OK","NEDOVOLJNO")',
          A5: 'PRD-004', B5: 'Servisni paket', C5: 'Usluge', D5: '30', E5: 'kom', F5: '2000', G5: '5000', H5: '=D5*F5', I5: '10', J5: '=IF(D5>I5,"OK","NEDOVOLJNO")',
          A6: '', B6: 'UKUPNO', C6: '', D6: '=SUM(D2:D5)', E6: '', F6: '', G6: '', H6: '=SUM(H2:H5)', I6: '', J6: '',
        }),
        makeSheet('Kretanje zaliha', {
          A1: 'Datum', B1: 'Dokument', C1: 'Proizvod', D1: 'Ulaz', E1: 'Izlaz', F1: 'Stanje',
          A2: '2025-01-15', B2: 'Nabavka NB-001', C2: 'Proizvod A', D2: '200', E2: '0', F2: '=D2-E2',
          A3: '2025-01-20', B3: 'Faktura FK-010', C3: 'Proizvod A', D3: '0', E3: '50', F3: '=200-50',
          A4: '2025-02-01', B4: 'Nabavka NB-005', C4: 'Proizvod A', D4: '100', E4: '0', F4: '=150+100',
        }),
      ]
    case 'employees':
      return [
        makeSheet('Spisak zaposlenih', {
          A1: 'Ime i prezime', B1: 'Odeljenje', C1: 'Pozicija', D1: 'Datum zaposlenja', E1: 'Neto plata (RSD)', F1: 'Bruto plata (RSD)', G1: 'Radno vreme', H1: 'Status',
          A2: 'Marko Marković', B2: 'Prodaja', C2: 'Komercijalista', D2: '2020-03-15', E2: '95000', F2: '=ROUND(E2/0.7,0)', G2: 'Potpuno', H2: 'Aktivan',
          A3: 'Jelena Jovanović', B3: 'IT', C3: 'Programer', D3: '2021-06-01', E3: '120000', F3: '=ROUND(E3/0.7,0)', G3: 'Potpuno', H3: 'Aktivan',
          A4: 'Nikola Nikolić', B4: 'Magacin', C4: 'Menadžer', D4: '2019-01-10', E4: '110000', F4: '=ROUND(E4/0.7,0)', G4: 'Potpuno', H4: 'Aktivan',
          A5: 'Ana Stanković', B5: 'Marketing', C5: 'Koordinator', D5: '2022-09-15', E5: '85000', F5: '=ROUND(E5/0.7,0)', G5: '4/5', H5: 'Aktivan',
          A6: '', B6: 'UKUPNO', C6: '', D6: '', E6: '=SUM(E2:E5)', F6: '=SUM(F2:F5)', G6: '', H6: '',
          A7: '', B7: 'PROSEK', C7: '', D7: '', E7: '=AVERAGE(E2:E5)', F7: '=AVERAGE(F2:F5)', G7: '', H7: '',
        }),
        makeSheet('Odsustva', {
          A1: 'Zaposleni', B1: 'Tip odsustva', C1: 'Od', D1: 'Do', E1: 'Dana', F1: 'Odobreno',
          A2: 'Marko Marković', B2: 'Godišnji odmor', C2: '2025-07-01', D2: '2025-07-15', E2: '15', F2: 'Da',
          A3: 'Jelena Jovanović', B3: 'Bolovanje', C3: '2025-03-10', D3: '2025-03-12', E3: '3', F3: 'Da',
        }),
      ]
    case 'sales':
      return [
        makeSheet('Dnevna prodaja', {
          A1: 'Datum', B1: 'Proizvod', C1: 'Količina', D1: 'Cena', E1: 'Ukupno', F1: 'Kupac', G1: 'Nacin placanja',
          A2: '2025-01-15', B2: 'Proizvod A', C2: '5', D2: '8900', E2: '=C2*D2', F2: 'Kupac 1', G2: 'Kartica',
          A3: '2025-01-15', B3: 'Proizvod B', C3: '2', D3: '18900', E3: '=C3*D3', F3: 'Kupac 2', G3: 'Gotovina',
          A4: '2025-01-16', B4: 'Proizvod A', C4: '3', D4: '8900', E4: '=C4*D4', F4: 'Kupac 3', G4: 'Virman',
          A5: '2025-01-16', B5: 'Materijal C', C5: '10', D5: '1200', E5: '=C5*D5', F5: 'Kupac 1', G5: 'Kartica',
          A6: '', B6: 'UKUPNO', C6: '=SUM(C2:C5)', D6: '', E6: '=SUM(E2:E5)', F6: '', G6: '',
        }),
        makeSheet('Analiza', {
          A1: 'Proizvod', B1: 'Ukupno prodato', C1: 'Ukupna vrednost', D1: 'Prosecna cena', E1: '% učešće',
          A2: 'Proizvod A', B2: '8', C2: '71200', D2: '=IF(B2>0,C2/B2,0)', E2: '=IF(C2>0,C2/C5*100,0)',
          A3: 'Proizvod B', B3: '2', C3: '37800', D3: '=IF(B3>0,C3/B3,0)', E3: '=IF(C3>0,C3/C5*100,0)',
          A4: 'Materijal C', B4: '10', C4: '12000', D4: '=IF(B4>0,C4/B4,0)', E4: '=IF(C4>0,C4/C5*100,0)',
          A5: 'UKUPNO', B5: '=SUM(B2:B4)', C5: '=SUM(C2:C4)', D5: '=IF(B5>0,C5/B5,0)', E5: '=SUM(E2:E4)',
        }),
        makeSheet('Po kupcima', {
          A1: 'Kupac', B1: 'Narudžbi', C1: 'Ukupno (RSD)', D1: 'Prosečna narudžba',
          A2: 'Kupac 1', B2: '2', C2: '=E2', D2: '=IF(B2>0,C2/B2,0)',
          A3: 'Kupac 2', B3: '1', C3: '=E3', D3: '=IF(B3>0,C3/B3,0)',
          A4: 'Kupac 3', B4: '1', C4: '=E4', D4: '=IF(B4>0,C4/B4,0)',
        }),
      ]
    default:
      return [makeSheet('List 1', {})]
  }
}

// ============ MAIN COMPONENT ============

export function Spreadsheet() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const tableRef = useRef<HTMLDivElement>(null)

  // Sheets state
  const [sheets, setSheets] = useState<Sheet[]>(() => {
    const s = createTemplateData('blank')
    return s
  })
  const [activeSheetIdx, setActiveSheetIdx] = useState(0)
  const activeSheet = sheets[activeSheetIdx]

  // UI State
  const [selectedCell, setSelectedCell] = useState<string>('A1')
  const [editingCell, setEditingCell] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [formulaBar, setFormulaBar] = useState('')
  const [activeTab, setActiveTab] = useState('editor')

  // History (undo/redo)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)

  // Clipboard
  const [clipboard, setClipboard] = useState<{ value: string; format?: CellFormat } | null>(null)

  // Dialogs
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [formulaHelpOpen, setFormulaHelpOpen] = useState(false)
  const [findReplaceOpen, setFindReplaceOpen] = useState(false)
  const [sheetNameDialogOpen, setSheetNameDialogOpen] = useState(false)
  const [newSheetName, setNewSheetName] = useState('')
  const [renameSheetId, setRenameSheetId] = useState<string | null>(null)
  const [renameSheetName, setRenameSheetName] = useState('')
  const [exportDialogOpen, setExportDialogOpen] = useState(false)

  // Find/Replace
  const [findText, setFindText] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [findResults, setFindResults] = useState<string[]>([])
  const [findIdx, setFindIdx] = useState(0)

  // Selection range
  const [selectionRange, setSelectionRange] = useState<{ start: string; end: string } | null>(null)

  // Toast
  const [toast, setToast] = useState('')

  // Loading saved spreadsheets
  const [savedList, setSavedList] = useState<any[]>([])
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [loadDialogOpen, setLoadDialogOpen] = useState(false)

  // Fullscreen mode
  const [isFullscreen, setIsFullscreen] = useState(false)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  // ============ SHEET OPERATIONS ============

  const updateSheetData = useCallback((sheetId: string, cellRef: string, value: string, format?: CellFormat) => {
    setSheets(prev => prev.map(s => {
      if (s.id !== sheetId) return s
      const newData = { ...s.data }
      if (value === '' && !format) {
        delete newData[cellRef]
      } else {
        const existing = newData[cellRef] || { value: '' }
        newData[cellRef] = { value: value !== undefined ? value : existing.value, format: format || existing.format }
      }
      return { ...s, data: newData }
    }))
  }, [])

  const updateSheet = useCallback((sheetId: string, updates: Partial<Sheet>) => {
    setSheets(prev => prev.map(s => s.id === sheetId ? { ...s, ...updates } : s))
  }, [])

  // ============ HISTORY ============

  const pushHistory = useCallback((sheetId: string, cellRef: string, oldValue: string, newValue: string) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIdx + 1)
      newHistory.push({ sheetId, cellRef, oldValue, newValue, timestamp: Date.now() })
      return newHistory.slice(-100) // Keep last 100
    })
    setHistoryIdx(prev => Math.min(prev + 1, 98))
  }, [historyIdx])

  const undo = useCallback(() => {
    if (historyIdx < 0) return
    const entry = history[historyIdx]
    if (!entry) return
    updateSheetData(entry.sheetId, entry.cellRef, entry.oldValue)
    setHistoryIdx(prev => prev - 1)
    showToast('Opozvano')
  }, [history, historyIdx, updateSheetData])

  const redo = useCallback(() => {
    if (historyIdx >= history.length - 1) return
    const entry = history[historyIdx + 1]
    if (!entry) return
    updateSheetData(entry.sheetId, entry.cellRef, entry.newValue)
    setHistoryIdx(prev => prev + 1)
    showToast('Ponovljeno')
  }, [history, historyIdx, updateSheetData])

  // ============ CELL OPERATIONS ============

  const handleCellClick = (ref: string) => {
    setSelectedCell(ref)
    const cellData = activeSheet.data[ref]
    setFormulaBar(cellData?.value || '')
    setEditingCell(null)
  }

  const handleCellDoubleClick = (ref: string) => {
    setEditingCell(ref)
    const cellData = activeSheet.data[ref]
    setEditValue(cellData?.value || '')
    setFormulaBar(cellData?.value || '')
  }

  const handleCellCommit = (ref: string, value: string) => {
    const old = activeSheet.data[ref]?.value || ''
    if (old !== value) {
      pushHistory(activeSheet.id, ref, old, value)
      updateSheetData(activeSheet.id, ref, value)
    }
    setEditingCell(null)
    setFormulaBar(value)
  }

  const handleCellKeyDown = (e: React.KeyboardEvent, ref: string) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCellCommit(ref, editValue)
      const parsed = parseCellRef(ref)
      if (parsed) setSelectedCell(getCellRef(parsed.row + 1, parsed.col))
    } else if (e.key === 'Tab') {
      e.preventDefault()
      handleCellCommit(ref, editValue)
      const parsed = parseCellRef(ref)
      if (parsed) setSelectedCell(getCellRef(parsed.row, parsed.col + 1))
    } else if (e.key === 'Escape') {
      setEditingCell(null)
    }
  }

  const handleFormulaBarKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedCell) {
        handleCellCommit(selectedCell, formulaBar)
      }
    }
  }

  // ============ FORMAT OPERATIONS ============

  const toggleFormat = (prop: keyof CellFormat) => {
    if (!selectedCell) return
    const current = activeSheet.data[selectedCell]?.format || {}
    const newFormat: CellFormat = { ...current }
    if (prop === 'bold') newFormat.bold = !current.bold
    else if (prop === 'italic') newFormat.italic = !current.italic
    else if (prop === 'underline') newFormat.underline = !current.underline
    else if (prop === 'align') {
      const aligns: ('left' | 'center' | 'right')[] = ['left', 'center', 'right']
      const curIdx = aligns.indexOf(current.align || 'left')
      newFormat.align = aligns[(curIdx + 1) % aligns.length]
    }
    updateSheetData(selectedCell, activeSheet.data[selectedCell]?.value || '', newFormat)
  }

  const setNumberFormat = (fmt: CellFormat['numberFormat']) => {
    if (!selectedCell) return
    const current = activeSheet.data[selectedCell]?.format || {}
    updateSheetData(selectedCell, activeSheet.data[selectedCell]?.value || '', { ...current, numberFormat: fmt })
  }

  // ============ DISPLAY VALUE ============

  const getCellDisplay = (ref: string): string => {
    const cellData = activeSheet.data[ref]
    const raw = cellData?.value || ''
    if (raw.startsWith('=')) {
      const engine = new FormulaEngine(activeSheet)
      return engine.evaluate(raw)
    }
    return raw
  }

  const formatDisplayValue = (ref: string): string => {
    const cellData = activeSheet.data[ref]
    const display = getCellDisplay(ref)
    const fmt = cellData?.format?.numberFormat
    if (!fmt || fmt === 'text') return display
    const num = parseFloat(display)
    if (isNaN(num)) return display
    switch (fmt) {
      case 'currency': return formatCurrency(num)
      case 'percent': return formatPercent(num / 100)
      case 'number': return num.toLocaleString('sr-RS')
      case 'date': return formatDate(display)
      default: return display
    }
  }

  // ============ SELECTION STATS ============

  const selectionStats = useMemo(() => {
    if (!selectionRange) return null
    const start = parseCellRef(selectionRange.start)
    const end = parseCellRef(selectionRange.end)
    if (!start || !end) return null
    let sum = 0, count = 0, nums = 0
    const minR = Math.min(start.row, end.row), maxR = Math.max(start.row, end.row)
    const minC = Math.min(start.col, end.col), maxC = Math.max(start.col, end.col)
    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        const ref = getCellRef(r, c)
        const display = getCellDisplay(ref)
        count++
        const num = parseFloat(display)
        if (!isNaN(num)) { sum += num; nums++ }
      }
    }
    return { sum, count, nums, avg: nums > 0 ? sum / nums : 0, min: nums > 0 ? Math.min(...Array.from({ length: maxR - minR + 1 }, (_, r) => {
      for (let c = minC; c <= maxC; c++) {
        const n = parseFloat(getCellDisplay(getCellRef(minR + r, c)))
        if (!isNaN(n)) return n
      }
      return Infinity
    })) : 0 }
  }, [selectionRange, activeSheet.data])

  // ============ ROW/COL OPERATIONS ============

  const addRow = () => {
    showToast('Red dodat')
  }

  const addCol = () => {
    showToast('Kolona dodata')
  }

  const deleteRow = () => {
    if (!selectedCell) return
    const parsed = parseCellRef(selectedCell)
    if (!parsed) return
    const newData = { ...activeSheet.data }
    const lastCol = getColLetter(DEFAULT_COLS - 1)
    for (let c = 0; c < DEFAULT_COLS; c++) {
      const ref = getCellRef(parsed.row, c)
      delete newData[ref]
    }
    // Shift rows down
    for (let r = parsed.row + 1; r < DEFAULT_ROWS; r++) {
      for (let c = 0; c < DEFAULT_COLS; c++) {
        const fromRef = getCellRef(r, c)
        const toRef = getCellRef(r - 1, c)
        if (newData[fromRef]) {
          newData[toRef] = newData[fromRef]
          delete newData[fromRef]
        }
      }
    }
    updateSheet(activeSheet.id, { data: newData })
    showToast('Red obrisan')
  }

  // ============ FIND & REPLACE ============

  const handleFind = () => {
    const results: string[] = []
    if (!findText) { setFindResults([]); return }
    Object.keys(activeSheet.data).forEach(ref => {
      const val = activeSheet.data[ref]?.value || ''
      if (val.toLowerCase().includes(findText.toLowerCase())) {
        results.push(ref)
      }
    })
    setFindResults(results)
    setFindIdx(0)
    if (results.length > 0) {
      setSelectedCell(results[0])
    }
  }

  const handleReplace = () => {
    if (!findText || !replaceText || findResults.length === 0) return
    const ref = findResults[findIdx]
    if (ref) {
      const old = activeSheet.data[ref]?.value || ''
      const newVal = old.replace(new RegExp(findText, 'gi'), replaceText)
      pushHistory(activeSheet.id, ref, old, newVal)
      updateSheetData(activeSheet.id, ref, newVal)
      handleFind() // Refresh results
      showToast('Zamenjeno')
    }
  }

  const handleReplaceAll = () => {
    if (!findText || !replaceText) return
    let count = 0
    Object.keys(activeSheet.data).forEach(ref => {
      const val = activeSheet.data[ref]?.value || ''
      if (val.toLowerCase().includes(findText.toLowerCase())) {
        const newVal = val.replace(new RegExp(findText, 'gi'), replaceText)
        pushHistory(activeSheet.id, ref, val, newVal)
        updateSheetData(activeSheet.id, ref, newVal)
        count++
      }
    })
    showToast(`Zamenjeno ${count} ćelija`)
    handleFind()
  }

  // ============ CLIPBOARD ============

  const copyCell = () => {
    if (!selectedCell) return
    const cellData = activeSheet.data[selectedCell]
    setClipboard({ value: cellData?.value || '', format: cellData?.format })
    showToast('Kopirano')
  }

  const cutCell = () => {
    if (!selectedCell) return
    const cellData = activeSheet.data[selectedCell]
    setClipboard({ value: cellData?.value || '', format: cellData?.format })
    pushHistory(activeSheet.id, selectedCell, cellData?.value || '', '')
    updateSheetData(activeSheet.id, selectedCell, '')
    showToast('Izrežano')
  }

  const pasteCell = () => {
    if (!selectedCell || !clipboard) return
    const old = activeSheet.data[selectedCell]?.value || ''
    pushHistory(activeSheet.id, selectedCell, old, clipboard.value)
    updateSheetData(selectedCell, clipboard.value, clipboard.format)
    showToast('Nalepljeno')
  }

  // ============ EXPORT/IMPORT ============

  const exportCSV = () => {
    const rows: string[][] = []
    for (let r = 0; r < DEFAULT_ROWS; r++) {
      const row: string[] = []
      let hasData = false
      for (let c = 0; c < DEFAULT_COLS; c++) {
        const ref = getCellRef(r, c)
        const display = formatDisplayValue(ref)
        row.push(display)
        if (display) hasData = true
      }
      if (hasData) rows.push(row)
    }
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeSheet.name}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast('CSV preuzet')
  }

  const exportJSON = () => {
    const data = JSON.stringify(sheets.map(s => ({
      name: s.name,
      data: Object.fromEntries(Object.entries(s.data).map(([k, v]) => [k, { value: v.value, format: v.format }]))
    })), null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeSheet.name}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('JSON preuzet')
  }

  const importCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const lines = text.split('\n').filter(l => l.trim())
      const newData: Record<string, { value: string }> = {}
      lines.forEach((line, r) => {
        const cells = line.split(',').map(c => c.replace(/^"|"$/g, '').trim())
        cells.forEach((val, c) => {
          if (val || r === 0) {
            newData[getCellRef(r, c)] = { value: val }
          }
        })
      })
      updateSheet(activeSheet.id, { data: newData })
      showToast(`Uvezeno ${lines.length} redova`)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // ============ TEMPLATE ============

  const applyTemplate = (templateId: string) => {
    const newSheets = createTemplateData(templateId)
    setSheets(newSheets)
    setActiveSheetIdx(0)
    setSelectedCell('A1')
    setHistory([])
    setHistoryIdx(-1)
    setTemplateDialogOpen(false)
    showToast(`Šablon "${TEMPLATES.find(t => t.id === templateId)?.name}" primenjen`)
  }

  // ============ SHEET MANAGEMENT ============

  const addSheet = () => {
    const name = `List ${sheets.length + 1}`
    const newSheet: Sheet = {
      id: crypto.randomUUID(), name, data: {}, colWidths: {}, rowHeights: {},
      frozenRows: 0, frozenCols: 0, hiddenCols: new Set(), hiddenRows: new Set(),
      filters: [], sortCol: null, sortDir: null,
    }
    setSheets([...sheets, newSheet])
    setActiveSheetIdx(sheets.length)
    showToast(`List "${name}" dodat`)
  }

  const duplicateSheet = (idx: number) => {
    const src = sheets[idx]
    const newSheet: Sheet = {
      ...src, id: crypto.randomUUID(), name: `${src.name} (kopija)`,
      data: { ...src.data }, colWidths: { ...src.colWidths }, rowHeights: { ...src.rowHeights },
      hiddenCols: new Set(src.hiddenCols), hiddenRows: new Set(src.hiddenRows),
    }
    setSheets([...sheets, newSheet])
    setActiveSheetIdx(sheets.length)
    showToast(`List dupliciran`)
  }

  const deleteSheet = (idx: number) => {
    if (sheets.length <= 1) { showToast('Mora ostati barem jedan list'); return }
    const name = sheets[idx].name
    setSheets(sheets.filter((_, i) => i !== idx))
    if (activeSheetIdx >= sheets.length - 1) setActiveSheetIdx(sheets.length - 2)
    showToast(`List "${name}" obrisan`)
  }

  const renameSheet = (idx: number, newName: string) => {
    if (!newName.trim()) return
    setSheets(sheets.map((s, i) => i === idx ? { ...s, name: newName.trim() } : s))
    setRenameSheetId(null)
    showToast('List preimenovan')
  }

  // ============ SAVE/LOAD ============

  const handleSave = () => {
    if (!saveName.trim()) { showToast('Unesite naziv'); return }
    try {
      localStorage.setItem(`spreadsheet_${saveName}`, JSON.stringify(sheets))
      showToast(`Sačuvano kao "${saveName}"`)
      setSaveDialogOpen(false)
      setSaveName('')
    } catch { showToast('Greška pri čuvanju') }
  }

  const handleLoad = (name: string) => {
    try {
      const data = localStorage.getItem(`spreadsheet_${name}`)
      if (data) {
        setSheets(JSON.parse(data))
        setActiveSheetIdx(0)
        setLoadDialogOpen(false)
        showToast(`Učitan "${name}"`)
      }
    } catch { showToast('Greška pri učitavanju') }
  }

  // ============ KEYBOARD SHORTCUTS ============

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (editingCell) return
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo() }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo() }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') { e.preventDefault(); copyCell() }
      if ((e.ctrlKey || e.metaKey) && e.key === 'x') { e.preventDefault(); cutCell() }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') { e.preventDefault(); pasteCell() }
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') { e.preventDefault(); setFindReplaceOpen(true) }
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); toggleFormat('bold') }
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') { e.preventDefault(); toggleFormat('italic') }
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') { e.preventDefault(); toggleFormat('underline') }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); setSaveDialogOpen(true) }

      // Arrow keys for navigation
      const parsed = selectedCell ? parseCellRef(selectedCell) : null
      if (parsed && !editingCell) {
        if (e.key === 'ArrowUp' && parsed.row > 0) { setSelectedCell(getCellRef(parsed.row - 1, parsed.col)) }
        if (e.key === 'ArrowDown') { setSelectedCell(getCellRef(parsed.row + 1, parsed.col)) }
        if (e.key === 'ArrowLeft' && parsed.col > 0) { setSelectedCell(getCellRef(parsed.row, parsed.col - 1)) }
        if (e.key === 'ArrowRight') { setSelectedCell(getCellRef(parsed.row, parsed.col + 1)) }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [editingCell, selectedCell, history, historyIdx, activeSheet])

  // Load saved list on mount
  useEffect(() => {
    const list: any[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('spreadsheet_')) {
        list.push({ name: key.replace('spreadsheet_', ''), date: new Date().toISOString() })
      }
    }
    setSavedList(list)
  }, [])

  // ============ CELL COUNT ============

  const filledCells = useMemo(() => Object.keys(activeSheet.data).filter(k => activeSheet.data[k]?.value).length, [activeSheet.data])

  // ============ RENDER ============

  return (
    <TooltipProvider>
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-background p-2' : ''}`}>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-[60] animate-in fade-in slide-in-from-right">
          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"><AlertDescription>{toast}</AlertDescription></Alert>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Table2 className="h-6 w-6 text-primary" /> Spreadsheet
          </h1>
          <p className="text-sm text-muted-foreground">BI Analitika, tabele i kalkulacije</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setTemplateDialogOpen(true)}><LayoutTemplate className="h-4 w-4 mr-1" /> Šabloni</Button>
          <Button variant="outline" size="sm" onClick={addRow}><Plus className="h-4 w-4 mr-1" /> Red</Button>
          <Button variant="outline" size="sm" onClick={addCol}><Columns3 className="h-4 w-4 mr-1" /> Kolona</Button>
          <Button variant="outline" size="sm" onClick={undo} disabled={historyIdx < 0}><Undo2 className="h-4 w-4 mr-1" /> Poništi</Button>
          <Button variant="outline" size="sm" onClick={redo} disabled={historyIdx >= history.length - 1}><Redo2 className="h-4 w-4 mr-1" /> Ponovi</Button>
          <Button variant="outline" size="sm" onClick={() => setFindReplaceOpen(true)}><Search className="h-4 w-4 mr-1" /> Pronađi</Button>
          <Button variant="outline" size="sm" onClick={() => setSaveDialogOpen(true)}><Save className="h-4 w-4 mr-1" /> Sačuvaj</Button>
          <Button variant="outline" size="sm" onClick={() => setLoadDialogOpen(true)}><Upload className="h-4 w-4 mr-1" /> Učitaj</Button>
          <Button variant="outline" size="sm" onClick={() => setExportDialogOpen(true)}><Download className="h-4 w-4 mr-1" /> Izvezi</Button>
          <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="editor"><Table2 className="h-4 w-4 mr-1" /> Editor</TabsTrigger>
          <TabsTrigger value="templates"><LayoutTemplate className="h-4 w-4 mr-1" /> Šabloni</TabsTrigger>
          <TabsTrigger value="formulas"><Braces className="h-4 w-4 mr-1" /> Formule</TabsTrigger>
          <TabsTrigger value="saved"><Save className="h-4 w-4 mr-1" /> Sačuvani</TabsTrigger>
        </TabsList>

        {/* ===== EDITOR TAB ===== */}
        <TabsContent value="editor" className="space-y-3">
          {/* Toolbar */}
          <Card className="p-2">
            <div className="flex items-center gap-1 flex-wrap">
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleFormat('bold')}><Bold className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Odaberi (Ctrl+B)</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleFormat('italic')}><Italic className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Kurziv (Ctrl+I)</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleFormat('underline')}><Underline className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Podvučeno (Ctrl+U)</TooltipContent></Tooltip>
              <Separator orientation="vertical" className="h-6 mx-1" />
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleFormat('align')}><AlignLeft className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Poravnanje</TooltipContent></Tooltip>
              <Separator orientation="vertical" className="h-6 mx-1" />
              <Select onValueChange={(v) => setNumberFormat(v as CellFormat['numberFormat'])}>
                <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue placeholder="Format" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="text"><Type className="h-3 w-3 inline mr-1" /> Tekst</SelectItem>
                  <SelectItem value="number"><Hash className="h-3 w-3 inline mr-1" /> Broj</SelectItem>
                  <SelectItem value="currency"><DollarSign className="h-3 w-3 inline mr-1" /> Valuta</SelectItem>
                  <SelectItem value="percent"><Percent className="h-3 w-3 inline mr-1" /> Procenat</SelectItem>
                  <SelectItem value="date"><CalendarDays className="h-3 w-3 inline mr-1" /> Datum</SelectItem>
                </SelectContent>
              </Select>
              <Separator orientation="vertical" className="h-6 mx-1" />
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyCell}><Copy className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Kopiraj (Ctrl+C)</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={cutCell}><Scissors className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Izreži (Ctrl+X)</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={pasteCell}><ClipboardPaste className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Nalepi (Ctrl+V)</TooltipContent></Tooltip>
              <Separator orientation="vertical" className="h-6 mx-1" />
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={deleteRow}><Trash2 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Obriši red</TooltipContent></Tooltip>
              <Separator orientation="vertical" className="h-6 mx-1" />
              <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs">{filledCells} ćelija</Badge>
                <Badge variant="outline" className="text-xs">{getColLetter(DEFAULT_COLS - 1)}{DEFAULT_ROWS}</Badge>
                <label className="cursor-pointer">
                  <FileUp className="h-4 w-4" />
                  <input type="file" accept=".csv" className="hidden" onChange={importCSV} />
                </label>
              </div>
            </div>
          </Card>

          {/* Formula Bar */}
          <Card className="p-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-mono w-16 justify-center shrink-0">{selectedCell}</Badge>
              <span className="text-muted-foreground text-sm font-mono">fx</span>
              <Input
                className="font-mono text-sm flex-1"
                value={editingCell === selectedCell ? editValue : formulaBar}
                onChange={(e) => {
                  setFormulaBar(e.target.value)
                  if (editingCell === selectedCell) setEditValue(e.target.value)
                }}
                onKeyDown={handleFormulaBarKeyDown}
                onFocus={() => setEditingCell(selectedCell)}
                placeholder="Unesite vrednost ili formulu (=SUM(...))"
              />
            </div>
          </Card>

          {/* Selection Stats */}
          {selectionStats && (
            <Card className="p-2">
              <div className="flex items-center gap-4 text-xs">
                <span className="text-muted-foreground">Selekcija:</span>
                <span>Zbir: <strong>{selectionStats.sum.toLocaleString('sr-RS')}</strong></span>
                <span>Prosek: <strong>{selectionStats.avg.toFixed(2)}</strong></span>
                <span>Brojevi: <strong>{selectionStats.nums}</strong></span>
                <span>Ukupno: <strong>{selectionStats.count}</strong></span>
              </div>
            </Card>
          )}

          {/* Spreadsheet Grid */}
          <Card className="overflow-hidden">
            <div ref={tableRef} className="overflow-auto" style={{ maxHeight: isFullscreen ? 'calc(100vh - 220px)' : '65vh' }}>
              <table className="w-full border-collapse text-xs">
                <thead className="sticky top-0 z-10">
                  <tr>
                    <th className="border bg-muted/80 p-0 w-10 text-center text-muted-foreground text-xs font-medium sticky left-0 z-20">#</th>
                    {Array.from({ length: DEFAULT_COLS }, (_, c) => {
                      const letter = getColLetter(c)
                      return (
                        <th key={c} className="border bg-muted/80 p-0 min-w-[100px] text-xs font-medium text-center text-muted-foreground">
                          <button
                            className="w-full h-7 hover:bg-primary/10 transition-colors"
                            onClick={() => setSelectedCell(getCellRef(0, c))}
                          >{letter}</button>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: DEFAULT_ROWS }, (_, r) => (
                    <tr key={r} className={`${selectedCell.startsWith(String(r + 1)) ? 'bg-primary/5' : ''} hover:bg-muted/20`}>
                      <td className="border bg-muted/30 p-0 w-10 text-center text-xs text-muted-foreground font-mono sticky left-0 z-[5]">
                        <button className="w-full h-7 hover:bg-primary/10" onClick={() => setSelectedCell(getCellRef(r, 0))}>{r + 1}</button>
                      </td>
                      {Array.from({ length: DEFAULT_COLS }, (_, c) => {
                        const ref = getCellRef(r, c)
                        const isSelected = selectedCell === ref
                        const cellData = activeSheet.data[ref]
                        const fmt = cellData?.format
                        const isEditing = editingCell === ref
                        const displayValue = formatDisplayValue(ref)
                        const isFormula = (cellData?.value || '').startsWith('=')

                        return (
                          <td
                            key={c}
                            className={`border p-0 relative ${isSelected ? 'ring-2 ring-primary ring-inset z-10' : ''}`}
                            onClick={() => handleCellClick(ref)}
                            onDoubleClick={() => handleCellDoubleClick(ref)}
                          >
                            {isEditing ? (
                              <input
                                autoFocus
                                className="w-full h-7 px-2 text-xs bg-white dark:bg-background focus:outline-none font-mono"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => handleCellKeyDown(e, ref)}
                                onBlur={() => handleCellCommit(ref, editValue)}
                              />
                            ) : (
                              <div
                                className={`w-full h-7 px-2 flex items-center overflow-hidden text-xs ${
                                  fmt?.bold ? 'font-bold' : ''
                                } ${fmt?.italic ? 'italic' : ''} ${
                                  fmt?.underline ? 'underline' : ''
                                } ${
                                  fmt?.align === 'center' ? 'justify-center' : fmt?.align === 'right' ? 'justify-end' : 'justify-start'
                                } ${
                                  fmt?.color ? '' : ''
                                } ${
                                  fmt?.bgColor ? '' : ''
                                } ${
                                  isFormula ? 'font-mono' : ''
                                } ${
                                  displayValue === '#ERROR' ? 'text-red-500' : displayValue === '#N/A' ? 'text-orange-500' : ''
                                }`}
                                style={{
                                  color: fmt?.color || undefined,
                                  backgroundColor: fmt?.bgColor || undefined,
                                  fontSize: fmt?.fontSize ? `${fmt.fontSize}px` : undefined,
                                }}
                              >
                                <span className="truncate">{displayValue}</span>
                              </div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Sheet Tabs */}
          <Card className="p-2">
            <div className="flex items-center gap-1 overflow-x-auto">
              {sheets.map((s, i) => (
                <div key={s.id} className="flex items-center">
                  <button
                    className={`px-3 py-1.5 text-xs rounded-md whitespace-nowrap transition-colors ${
                      i === activeSheetIdx ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                    onClick={() => { setActiveSheetIdx(i); setSelectedCell('A1') }}
                    onDoubleClick={() => { setRenameSheetId(s.id); setRenameSheetName(s.name) }}
                    onContextMenu={(e) => { e.preventDefault(); }}
                  >
                    {s.name}
                  </button>
                  {sheets.length > 1 && (
                    <Button variant="ghost" size="icon" className="h-5 w-5 -ml-1" onClick={() => deleteSheet(i)}>
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
              <Separator orientation="vertical" className="h-5 mx-1" />
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={addSheet}><Plus className="h-3 w-3 mr-1" /> Dodaj</Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => duplicateSheet(activeSheetIdx)}><Copy className="h-3 w-3 mr-1" /> Duplikuj</Button>
            </div>
          </Card>
        </TabsContent>

        {/* ===== TEMPLATES TAB ===== */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEMPLATES.map(tmpl => (
              <Card key={tmpl.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => applyTemplate(tmpl.id)}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-2xl">{tmpl.icon}</span>
                    {tmpl.name}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs w-fit">{tmpl.category}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3">{tmpl.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{tmpl.sheetCount} list(ova)</span>
                    <Button size="sm" variant="outline">Koristi</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ===== FORMULAS TAB ===== */}
        <TabsContent value="formulas" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Referenca formule</CardTitle>
                <Badge variant="secondary">{FORMULA_LIST.length} formuli</Badge>
              </div>
              <CardDescription>Kliknite na formulu da je ubacite u izabrnu ćeliju</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {FORMULA_LIST.map(f => (
                  <Card key={f.name} className="p-3 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => {
                    if (selectedCell) {
                      pushHistory(activeSheet.id, selectedCell, activeSheet.data[selectedCell]?.value || '', f.example)
                      updateSheetData(activeSheet.id, selectedCell, f.example)
                      setActiveTab('editor')
                      showToast(`Formula ${f.name} ubačena`)
                    }
                  }}>
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">{f.name.slice(0, 2)}</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{f.name}</p>
                        <p className="text-xs text-muted-foreground">{f.desc}</p>
                        <p className="text-xs font-mono text-muted-foreground mt-1 bg-muted/50 rounded px-1.5 py-0.5 truncate">{f.syntax}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Prečice na tastaturi</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {[
                  ['Ctrl+Z', 'Poništi'], ['Ctrl+Y', 'Ponovi'], ['Ctrl+C', 'Kopiraj'],
                  ['Ctrl+X', 'Izreži'], ['Ctrl+V', 'Nalepi'], ['Ctrl+F', 'Pronađi'],
                  ['Ctrl+B', 'Podebljano'], ['Ctrl+I', 'Kurziv'], ['Ctrl+U', 'Podvučeno'],
                  ['Ctrl+S', 'Sačuvaj'], ['Tab', 'Sledeća ćelija'], ['Enter', 'Potvrdi'],
                  ['Escape', 'Otkaži'], ['Strelice', 'Navigacija'], ['DblClick', 'Uredi ćeliju'],
                ].map(([key, desc]) => (
                  <div key={key} className="flex items-center justify-between p-2 rounded bg-muted/30">
                    <span className="text-muted-foreground">{desc}</span>
                    <kbd className="bg-background border rounded px-1.5 py-0.5 text-xs font-mono">{key}</kbd>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== SAVED TAB ===== */}
        <TabsContent value="saved" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Sačuvani dokumenti</h3>
            <Button size="sm" onClick={() => setSaveDialogOpen(true)}><Save className="h-4 w-4 mr-1" /> Sačuvaj trenutni</Button>
          </div>
          {savedList.length === 0 ? (
            <Card className="p-8 text-center">
              <Save className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Nemate sačuvanih dokumenata</p>
              <p className="text-xs text-muted-foreground mt-1">Koristite Ctrl+S ili dugme &quot;Sačuvaj&quot; za čuvanje</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedList.map((doc) => (
                <Card key={doc.name} className="p-4">
                  <div className="flex items-start gap-3">
                    <FileSpreadsheet className="h-8 w-8 text-green-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">Sačuvano: {new Date(doc.date).toLocaleString('sr-RS')}</p>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" onClick={() => handleLoad(doc.name)}><Upload className="h-3 w-3 mr-1" /> Učitaj</Button>
                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => {
                          localStorage.removeItem(`spreadsheet_${doc.name}`)
                          setSavedList(prev => prev.filter(s => s.name !== doc.name))
                          showToast('Obrisano')
                        }}><Trash2 className="h-3 w-3 mr-1" /> Obriši</Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ===== FORMS ===== */}

      {/* Find & Replace */}
      {findReplaceOpen && (
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ArrowLeft className="h-4 w-4 cursor-pointer" onClick={() => setFindReplaceOpen(false)} /> <Search className="h-5 w-5" /> Pronađi i zameni</CardTitle>
            <CardDescription>Pronađite tekst u ćelijama i zamenite ga</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Pronađi</Label>
                <div className="flex gap-2">
                  <Input value={findText} onChange={(e) => setFindText(e.target.value)} placeholder="Tekst za pretragu..." className="flex-1" onKeyDown={(e) => e.key === 'Enter' && handleFind()} />
                  <Button size="sm" onClick={handleFind}>Traži</Button>
                </div>
                {findResults.length > 0 && (
                  <p className="text-xs text-muted-foreground">{findResults.length} rezultata · {findIdx + 1}/{findResults.length}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Zameni sa</Label>
                <Input value={replaceText} onChange={(e) => setReplaceText(e.target.value)} placeholder="Tekst za zamenu..." />
              </div>
              {findResults.length > 0 && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setFindIdx(prev => (prev + 1) % findResults.length); setSelectedCell(findResults[(findIdx + 1) % findResults.length]) }}>Sledeći</Button>
                  <Button size="sm" variant="outline" onClick={handleReplace}>Zameni</Button>
                  <Button size="sm" onClick={handleReplaceAll}>Zameni sve</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Form */}
      {saveDialogOpen && (
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ArrowLeft className="h-4 w-4 cursor-pointer" onClick={() => setSaveDialogOpen(false)} /> <Save className="h-5 w-5" /> Sačuvaj dokument</CardTitle>
            <CardDescription>Unesite naziv pod kojim želite sačuvati</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Input value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="Naziv dokumenta..." onKeyDown={(e) => e.key === 'Enter' && handleSave()} />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>Otkaži</Button>
                <Button onClick={handleSave} disabled={!saveName.trim()}>Sačuvaj</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Load Form */}
      {loadDialogOpen && (
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ArrowLeft className="h-4 w-4 cursor-pointer" onClick={() => setLoadDialogOpen(false)} /> <Upload className="h-5 w-5" /> Učitaj dokument</CardTitle>
          </CardHeader>
          <CardContent>
            {savedList.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nemate sačuvanih dokumenata</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {savedList.map(doc => (
                  <div key={doc.name} className="flex items-center justify-between p-2 rounded hover:bg-muted cursor-pointer" onClick={() => handleLoad(doc.name)}>
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{doc.name}</span>
                    </div>
                    <Button size="sm" variant="ghost">Učitaj</Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Export Form */}
      {exportDialogOpen && (
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ArrowLeft className="h-4 w-4 cursor-pointer" onClick={() => setExportDialogOpen(false)} /> <Download className="h-5 w-5" /> Izvezi podatke</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full justify-start" onClick={() => { exportCSV(); setExportDialogOpen(false) }}><FileDown className="h-4 w-4 mr-2" /> CSV format (Excel kompatibilan)</Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => { exportJSON(); setExportDialogOpen(false) }}><FileDown className="h-4 w-4 mr-2" /> JSON format</Button>
              <Separator />
              <label className="block">
                <Button className="w-full justify-start" variant="outline" asChild><span><FileUp className="h-4 w-4 mr-2" /> Uvezi CSV datoteku</span></Button>
                <input type="file" accept=".csv" className="hidden" onChange={(e) => { importCSV(e); setExportDialogOpen(false) }} />
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rename Sheet Form */}
      {!!renameSheetId && (
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ArrowLeft className="h-4 w-4 cursor-pointer" onClick={() => setRenameSheetId(null)} /> Preimenuj list</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={renameSheetName} onChange={(e) => setRenameSheetName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') renameSheet(sheets.findIndex(s => s.id === renameSheetId), renameSheetName) }} />
            <div className="flex justify-end gap-2 pt-4 border-t mt-4">
              <Button variant="outline" onClick={() => setRenameSheetId(null)}>Otkaži</Button>
              <Button onClick={() => renameSheet(sheets.findIndex(s => s.id === renameSheetId), renameSheetName)} disabled={!renameSheetName.trim()}>Preimenuj</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">29 formuli</p><p className="text-muted-foreground">SUM, AVERAGE, IF, VLOOKUP...</p></div></div>
            <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Formatiranje</p><p className="text-muted-foreground">Podebljano, kurziv, valuta, %</p></div></div>
            <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">10 šablona</p><p className="text-muted-foreground">Budžet, inventar, prodaja...</p></div></div>
            <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">CSV/JSON</p><p className="text-muted-foreground">Import i export podataka</p></div></div>
          </div>
        </CardContent>
      </Card>
    </div>
    </TooltipProvider>
  )
}
