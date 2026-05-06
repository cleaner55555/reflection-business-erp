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
