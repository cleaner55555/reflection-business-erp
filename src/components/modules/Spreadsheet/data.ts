export const DEFAULT_COLS = 26;

export const DEFAULT_ROWS = 100;

export const COL_LETTERS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

export const FORMULA_LIST = [
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

export const TEMPLATES: SpreadsheetTemplate[] = [
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

export const getColLetter = (col: number): string => {
  let result = ''
  let c = col
  while (c >= 0) {
    result = String.fromCharCode(65 + (c % 26)) + result
    c = Math.floor(c / 26) - 1
  }
  return result
}

export const parseCellRef = (ref: string): { row: number; col: number } | null => {
  const match = ref.match(/^([A-Z]+)(\d+)$/)
  if (!match) return null
  const col = match[1].split('').reduce((acc, ch) => acc * 26 + (ch.charCodeAt(0) - 64), 0) - 1
  const row = parseInt(match[2]) - 1
  return { row, col }
}

export const getCellRef = (row: number, col: number): string => `${getColLetter(col)}${row + 1}`;

export const formatCurrency = (val: number) => new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', minimumFractionDigits: 2 }).format(val);

export const formatPercent = (val: number) => `${(val * 100).toFixed(1)}%`;

export const formatDate = (val: string) => {
  const d = new Date(val)
  return isNaN(d.getTime()) ? val : d.toLocaleDateString('sr-RS')
}

export const parsed = parseCellRef(ref);

export const cellKey = getCellRef(parsed.row, parsed.col);

export const raw = this.sheet.data[cellKey]?.value || '';

export const num = parseFloat(raw);

export const rangeMatch = rangeStr.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);

export const start = parseCellRef(`${rangeMatch[1]}${rangeMatch[2]}`);

export const end = parseCellRef(`${rangeMatch[3]}${rangeMatch[4]}`);

export const values: (number | string)[] = []

export const ops = ['>=', '<=', '!=', '>', '<', '=']

export const idx = condition.indexOf(op);

export const left = parseFloat(condition.slice(0, idx));

export const right = parseFloat(condition.slice(idx + op.length));

export const upper = expr.toUpperCase();

export const range = expr.slice(8, expr.lastIndexOf(','));

export const condition = expr.slice(expr.lastIndexOf(',') + 1, -1).trim().replace(/^["']|["']$/g, '');

export const fullExpr = expr.slice(6, -1);

export const parts = this.splitFormulaArgs(fullExpr, 3);

export const range = this.getRangeValues(parts[0]);

export const condition = parts[1].trim().replace(/^["']|["']$/g, '');

export const sumRange = parts[2] ? this.getRangeValues(parts[2]) : range;

export const fullExpr = expr.slice(10, -1);

export const parts = this.splitFormulaArgs(fullExpr, 2);

export const range = this.getRangeValues(parts[0]);

export const condition = parts[1].trim().replace(/^["']|["']$/g, '');

export const filtered = range.filter(v => String(v) === condition || (typeof v === 'number' && this.evaluateCondition(`${v}${condition}`)));

export const nums = filtered.filter((v): v is number => typeof v === 'number');

export const fullExpr = expr.slice(3, -1);

export const parts = this.splitFormulaArgs(fullExpr, 3);

export const condition = parts[0].trim();

export const trueVal = parts[1].trim().replace(/^["']|["']$/g, '');

export const falseVal = parts[2]?.trim().replace(/^["']|["']$/g, '') || '';

export const result = this.evaluateCondition(condition) ? trueVal : falseVal;

export const args = this.splitFormulaArgs(expr.slice(4, -1));

export const args = this.splitFormulaArgs(expr.slice(3, -1));

export const args = this.splitFormulaArgs(expr.slice(upper.startsWith('CONCATENATE') ? 12 : 7, -1));

export const trimmed = a.trim().replace(/^["']|["']$/g, '');

export const cellVal = this.getCellValue(trimmed);

export const parts = this.splitFormulaArgs(expr.slice(5, -1));

export const text = String(this.getCellValue(parts[0].trim()));

export const n = parseInt(parts[1] || '1');

export const parts = this.splitFormulaArgs(expr.slice(6, -1));

export const text = String(this.getCellValue(parts[0].trim()));

export const n = parseInt(parts[1] || '1');

export const parts = this.splitFormulaArgs(expr.slice(4, -1));

export const text = String(this.getCellValue(parts[0].trim()));

export const start = parseInt(parts[1] || '1') - 1;

export const len = parseInt(parts[2] || '1');

export const parts = this.splitFormulaArgs(expr.slice(6, -1));

export const num = parseFloat(String(this.getCellValue(parts[0].trim())));

export const decimals = parseInt(parts[1] || '0');

export const parts = this.splitFormulaArgs(expr.slice(6, -1));

export const base = parseFloat(String(this.getCellValue(parts[0].trim())));

export const exp = parseFloat(String(this.getCellValue(parts[1].trim())));

export const parts = this.splitFormulaArgs(expr.slice(4, -1));

export const a = parseFloat(String(this.getCellValue(parts[0].trim())));

export const b = parseFloat(String(this.getCellValue(parts[1].trim())));

export const fullExpr = expr.slice(8, -1);

export const parts = this.splitFormulaArgs(fullExpr, 3);

export const searchVal = parts[0].trim().replace(/^["']|["']$/g, '') || String(this.getCellValue(parts[0].trim()));

export const range = this.getRangeValues(parts[1].trim());

export const colIdx = parseInt(parts[2]) - 1;

export const rangeStr = parts[1].trim();

export const rangeMatch = rangeStr.match(/^([A-Z]+\d+):([A-Z]+\d+)$/i);

export const startParsed = parseCellRef(rangeMatch[1]);

export const endParsed = parseCellRef(rangeMatch[2]);

export const totalCols = Math.abs(endParsed.col - startParsed.col) + 1;

export const startRow = Math.min(startParsed.row, endParsed.row);

export const endRow = Math.max(startParsed.row, endParsed.row);

export const firstColVal = String(this.getCellValue(getCellRef(r, Math.min(startParsed.col, endParsed.col))));

export const mathExpr = expr.replace(/([A-Z]+\d+)/g, (_, ref) => {
        const val = this.getCellValue(ref)
        return typeof val === 'number' ? val : 0
      });

export const result = new Function(`return ${mathExpr}`)() as number;

export const args: string[] = []

export const ch = expr[i]

export const makeSheet = (name: string, data: Record<string, string>): Sheet => ({
    id: crypto.randomUUID(),
    name,
    data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, { value: v }])),
    colWidths: {}, rowHeights: {}, frozenRows: 0, frozenCols: 0,
    hiddenCols: new Set(), hiddenRows: new Set(), filters: [], sortCol: null, sortDir: null,
  });

export const { activeCompanyId } = useAppStore();

export const { t } = useTranslation();

export const s = createTemplateData('blank');

export const activeSheet = sheets[activeSheetIdx]

export const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

export const newData = { ...s.data }

export const existing = newData[cellRef] || { value: '' }

export const newHistory = prev.slice(0, historyIdx + 1);

export const entry = history[historyIdx]

export const entry = history[historyIdx + 1]

export const handleCellClick = (ref: string) => {
    setSelectedCell(ref)
    const cellData = activeSheet.data[ref]
    setFormulaBar(cellData?.value || '')
    setEditingCell(null)
  }

export const handleCellDoubleClick = (ref: string) => {
    setEditingCell(ref)
    const cellData = activeSheet.data[ref]
    setEditValue(cellData?.value || '')
    setFormulaBar(cellData?.value || '')
  }

export const handleCellCommit = (ref: string, value: string) => {
    const old = activeSheet.data[ref]?.value || ''
    if (old !== value) {
      pushHistory(activeSheet.id, ref, old, value)
      updateSheetData(activeSheet.id, ref, value)
    }
    setEditingCell(null)
    setFormulaBar(value)
  }

export const handleCellKeyDown = (e: React.KeyboardEvent, ref: string) => {
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

export const handleFormulaBarKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedCell) {
        handleCellCommit(selectedCell, formulaBar)
      }
    }
  }

export const toggleFormat = (prop: keyof CellFormat) => {
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

export const setNumberFormat = (fmt: CellFormat['numberFormat']) => {
    if (!selectedCell) return
    const current = activeSheet.data[selectedCell]?.format || {}
    updateSheetData(selectedCell, activeSheet.data[selectedCell]?.value || '', { ...current, numberFormat: fmt })
  }

export const getCellDisplay = (ref: string): string => {
    const cellData = activeSheet.data[ref]
    const raw = cellData?.value || ''
    if (raw.startsWith('=')) {
      const engine = new FormulaEngine(activeSheet)
      return engine.evaluate(raw)
    }
    return raw
  }

export const formatDisplayValue = (ref: string): string => {
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

export const start = parseCellRef(selectionRange.start);

export const end = parseCellRef(selectionRange.end);

export const minR = Math.min(start.row, end.row), maxR = Math.max(start.row, end.row);

export const minC = Math.min(start.col, end.col), maxC = Math.max(start.col, end.col);

export const ref = getCellRef(r, c);

export const display = getCellDisplay(ref);

export const num = parseFloat(display);

export const n = parseFloat(getCellDisplay(getCellRef(minR + r, c)));

export const addRow = () => {
    showToast('Red dodat')
  }

export const addCol = () => {
    showToast('Kolona dodata')
  }

export const deleteRow = () => {
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

export const handleFind = () => {
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

export const handleReplace = () => {
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

export const handleReplaceAll = () => {
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

export const copyCell = () => {
    if (!selectedCell) return
    const cellData = activeSheet.data[selectedCell]
    setClipboard({ value: cellData?.value || '', format: cellData?.format })
    showToast('Kopirano')
  }

export const cutCell = () => {
    if (!selectedCell) return
    const cellData = activeSheet.data[selectedCell]
    setClipboard({ value: cellData?.value || '', format: cellData?.format })
    pushHistory(activeSheet.id, selectedCell, cellData?.value || '', '')
    updateSheetData(activeSheet.id, selectedCell, '')
    showToast('Izrežano')
  }

export const pasteCell = () => {
    if (!selectedCell || !clipboard) return
    const old = activeSheet.data[selectedCell]?.value || ''
    pushHistory(activeSheet.id, selectedCell, old, clipboard.value)
    updateSheetData(selectedCell, clipboard.value, clipboard.format)
    showToast('Nalepljeno')
  }

export const exportCSV = () => {
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

export const exportJSON = () => {
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

export const importCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
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

export const applyTemplate = (templateId: string) => {
    const newSheets = createTemplateData(templateId)
    setSheets(newSheets)
    setActiveSheetIdx(0)
    setSelectedCell('A1')
    setHistory([])
    setHistoryIdx(-1)
    setTemplateDialogOpen(false)
    showToast(`Šablon "${TEMPLATES.find(t => t.id === templateId)?.name}" primenjen`)
  }

export const addSheet = () => {
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

export const duplicateSheet = (idx: number) => {
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

export const deleteSheet = (idx: number) => {
    if (sheets.length <= 1) { showToast('Mora ostati barem jedan list'); return }
    const name = sheets[idx].name
    setSheets(sheets.filter((_, i) => i !== idx))
    if (activeSheetIdx >= sheets.length - 1) setActiveSheetIdx(sheets.length - 2)
    showToast(`List "${name}" obrisan`)
  }

export const renameSheet = (idx: number, newName: string) => {
    if (!newName.trim()) return
    setSheets(sheets.map((s, i) => i === idx ? { ...s, name: newName.trim() } : s))
    setRenameSheetId(null)
    showToast('List preimenovan')
  }

export const handleSave = () => {
    if (!saveName.trim()) { showToast('Unesite naziv'); return }
    try {
      localStorage.setItem(`spreadsheet_${saveName}`, JSON.stringify(sheets))
      showToast(`Sačuvano kao "${saveName}"`)
      setSaveDialogOpen(false)
      setSaveName('')
    } catch { showToast('Greška pri čuvanju') }
  }

export const handleLoad = (name: string) => {
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

export const handler = (e: KeyboardEvent) => {
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

export const list: any[] = []

export const key = localStorage.key(i);

export const letter = getColLetter(c);

export const ref = getCellRef(r, c);

export const isSelected = selectedCell === ref;

export const cellData = activeSheet.data[ref]

export const fmt = cellData?.format;

export const isEditing = editingCell === ref;

export const displayValue = formatDisplayValue(ref);

export const isFormula = (cellData?.value || '').startsWith('=');

export function createTemplateData(templateId: string): Sheet[] {
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
