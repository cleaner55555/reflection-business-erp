/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table2, Plus, RefreshCw, BarChart3, FileSpreadsheet,
  Download, Upload, Save, Calculator, Filter, ArrowRight,
  ChevronDown, Maximize2
} from 'lucide-react'

export function Spreadsheet() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()

  // Simple spreadsheet state
  const [rows, setRows] = useState<string[][]>(() =>
    Array.from({ length: 50 }, () => Array.from({ length: 26 }, () => ''))
  )
  const [colHeaders, setColHeaders] = useState<string[]>(() =>
    Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))
  )
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [cellValue, setCellValue] = useState('')
  const [sheetName, setSheetName] = useState('List 1')
  const [sheets, setSheets] = useState<string[]>(['List 1'])

  const getColLabel = (i: number) => String.fromCharCode(65 + (i % 26)) + (i >= 26 ? Math.floor(i / 26) : '')

  const handleCellClick = (row: number, col: number) => {
    setSelectedCell({ row, col })
    setCellValue(rows[row]?.[col] || '')
  }

  const handleCellChange = (value: string) => {
    setCellValue(value)
    if (selectedCell) {
      const newRows = [...rows]
      const newRow = [...(newRows[selectedCell.row] || [])]
      newRow[selectedCell.col] = value
      newRows[selectedCell.row] = newRow
      setRows(newRows)
    }
  }

  const handleCellBlur = () => {
    if (selectedCell && cellValue !== (rows[selectedCell.row]?.[selectedCell.col] || '')) {
      handleCellChange(cellValue)
    }
    setSelectedCell(null)
  }

  const addRow = () => setRows([...rows, Array.from({ length: 26 }, () => '')])
  const addCol = () => {
    setColHeaders([...colHeaders, `Col ${colHeaders.length}`])
    setRows(rows.map((r) => [...r, '']))
  }

  const exportCSV = () => {
    const csv = [colHeaders.join(','), ...rows.filter((r) => r.some((c) => c.trim()))].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${sheetName}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Simple formula evaluation
  const evaluateFormula = (formula: string): string => {
    if (!formula.startsWith('=')) return formula
    try {
      const expr = formula.slice(1).toUpperCase()
      // Simple SUM support
      const sumMatch = expr.match(/SUM\(([A-Z]+(\d+)?:([A-Z]+(\d+)?)\)/)
      if (sumMatch) {
        const [startCol, startRow = '1', endCol, endRow = '1'] = sumMatch[1] ? [sumMatch[1], sumMatch[2] || '1'] : [sumMatch[3], sumMatch[4] || '1']
        const colIndex = (c: string) => c.charCodeAt(0) - 65
        let sum = 0
        const sr = parseInt(startRow) || 1
        const er = parseInt(endRow) || sr
        for (let r = sr - 1; r < er; r++) {
          for (const c of [startCol, endCol]) {
            const val = parseFloat(rows[r]?.[colIndex(c)] || '0')
            if (!isNaN(val)) sum += val
          }
        }
        return sum.toString()
      }
      return formula
    } catch { return formula }
  }

  const getCellDisplay = (row: number, col: number): string => {
    const val = rows[row]?.[col] || ''
    return val.startsWith('=') ? evaluateFormula(val) : val
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Spreadsheet</h1>
          <p className="text-sm text-muted-foreground">BI Analitika i tabele</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addRow}><Plus className="h-4 w-4 mr-1" /> Red</Button>
          <Button variant="outline" size="sm" onClick={addCol}><Plus className="h-4 w-4 mr-1} /> Kolona</Button>
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-1" /> CSV</Button>
        </div>
      </div>

      <Tabs defaultValue="list1">
        <TabsList>
          {sheets.map((name, i) => (
            <TabsTrigger key={name} value={name}>{name}</TabsTrigger>
          ))}
          <Button size="sm" variant="ghost" onClick={() => {
            const newName = `List ${sheets.length + 1}`
            setSheets([...sheets, newName])
            setSheetName(newName)
          }}><Plus className="h-4 w-4" /></Button>
        </TabsList>

        {sheets.map((name) => (
          <TabsContent key={name} value={name}>
            <div className="border rounded-lg overflow-hidden" style={{ maxHeight: '600px' }}>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-muted/50 sticky top-0">
                      <th className="border p-2 w-10 text-center text-muted-foreground">#</th>
                      {colHeaders.map((h, i) => (
                        <th key={i} className="border p-2 min-w-[100px] bg-muted/50 text-left font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, ri) => (
                      <tr key={ri} className="border-b hover:bg-muted/30">
                        <td className="border p-2 text-center text-muted-foreground">{ri + 1}</td>
                        {row.map((cell, ci) => (
                          <td key={ci} className="border p-0">
                            <input
                              className="w-full h-8 px-2 text-xs border-0 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-primary/5"
                              value={getCellDisplay(ri, ci)}
                              onChange={(e) => {
                                const newRows = [...rows]
                                const newRow = [...(newRows[ri] || [])]
                                newRow[ci] = e.target.value
                                newRows[ri] = newRow
                                setRows(newRows)
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Informacije</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Formule</p><p className="text-xs text-muted-foreground">Koristite = za formule (npr. =SUM(A1:A10))</p></div></div>
          <div className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">CSV export</p><p className="text-xs text-muted-foreground">Preuzmite podatke kao CSV za analizu</p></div></div>
          <div className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div><p className="font-medium">Više listova</p><p className="text-xs text-muted-foreground">Kreirajte više radnih listova za organizaciju podataka</p></div></div>
        </CardContent>
      </Card>
    </div>
  )
}
