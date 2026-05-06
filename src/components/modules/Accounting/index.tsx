'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  BookOpen,
  Landmark,
  FilePenLine,
  AlertCircle,
  CheckCircle2,
  X,
  ArrowLeft,
  PiggyBank,
  Scale,
  Download,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  BarChart3,
  Eye,
  Calculator,
  PieChart,
  Lock,
  Unlock,
  Users,
  Filter,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatRSD, formatDate } from '@/lib/helpers'
import { useTranslation, useContentTranslation } from '@/lib/i18n'

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface Account {
  id: string
  code: string
  name: string
  type: string
  description?: string | null
  parentCode?: string | null
  isActive: boolean
  _count?: { entries: number }
}

interface JournalEntry {
  id: string
  date: string
  accountCode: string
  debit: number
  credit: number
  description: string
  documentRef?: string | null
  voucherNumber?: string | null
  fiscalYear?: number | null
  reconciled?: boolean
  partner?: { id: string; name: string } | null
  account: { code: string; name: string }
}

interface JournalRow {
  tempId: string
  accountCode: string
  debit: number
  credit: number
}

interface BudgetItem {
  id: string
  accountCode: string
  name: string
  year: number
  january: number; february: number; march: number; april: number
  may: number; june: number; july: number; august: number
  september: number; october: number; november: number; december: number
  totalAnnual: number
  notes?: string | null
  isActive: boolean
}

interface DashboardData {
  fiscalYear: number
  totalAssets: number
  totalLiabilities: number
  totalRevenue: number
  totalExpenses: number
  profit: number
  totalEquity: number
  totalEntries: number
  totalAccounts: number
  totalBudget: number
  budgetCount: number
  recentEntries: JournalEntry[]
}

interface AccountStatement {
  account: { code: string; name: string; type: string }
  openingBalance: number
  closingBalance: number
  totalDebit: number
  totalCredit: number
  entryCount: number
  entries: Array<JournalEntry & { runningBalance: number }>
}

const ACCOUNT_TYPES = [
  { value: 'aktivna', label: 'Aktivna', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'pasivna', label: 'Pasivna', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'prihodka', label: 'Prihodna', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { value: 'rashodna', label: 'Rashodna', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'kontna', label: 'Kontna', color: 'bg-violet-50 text-violet-700 border-violet-200' },
] as const

const MONTH_KEYS = ['january','february','march','april','may','june','july','august','september','october','november','december'] as const
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','Maj','Jun','Jul','Avg','Sep','Okt','Nov','Dec'] as const


// ─── Main Component ───────────────────────────────────────────────────────────

import { getAccountTypeBadge, DashboardTab, GlavnaKnjigaTab, KontniPlanTab, NalogTab, BudzetiTab, BrutoBilansTab, PdvTab, AnalitikaTab, GodZatvaranjeTab } from './components'

export function Knjigovodstvo() {
  const { t } = useTranslation()
  const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear())

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('accounting.title')}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t('accounting.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs whitespace-nowrap">Fiskalna godina:</Label>
          <Select value={String(fiscalYear)} onValueChange={(v) => setFiscalYear(parseInt(v))}>
            <SelectTrigger className="w-[100px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2025, 2024, 2023, 2026].map(y => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="pregled" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="pregled" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Pregled</span>
          </TabsTrigger>
          <TabsTrigger value="glavna-knjiga" className="gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('accounting.generalLedger')}</span>
          </TabsTrigger>
          <TabsTrigger value="kontni-plan" className="gap-1.5">
            <Landmark className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('accounting.chartOfAccounts')}</span>
          </TabsTrigger>
          <TabsTrigger value="nalog" className="gap-1.5">
            <FilePenLine className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('accounting.journalEntries')}</span>
          </TabsTrigger>
          <TabsTrigger value="budzeti" className="gap-1.5">
            <PiggyBank className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Budžeti</span>
          </TabsTrigger>
          <TabsTrigger value="bruto-bilans" className="gap-1.5">
            <Scale className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Bruto Bilans</span>
          </TabsTrigger>
          <TabsTrigger value="pdv" className="gap-1.5">
            <Calculator className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">PDV Prijava</span>
          </TabsTrigger>
          <TabsTrigger value="analitika" className="gap-1.5">
            <PieChart className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Analitika</span>
          </TabsTrigger>
          <TabsTrigger value="god-zatvaranje" className="gap-1.5">
            <Lock className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">God. Zatvaranje</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pregled">
          <DashboardTab fiscalYear={fiscalYear} />
        </TabsContent>
        <TabsContent value="glavna-knjiga">
          <GlavnaKnjigaTab fiscalYear={fiscalYear} />
        </TabsContent>
        <TabsContent value="kontni-plan">
          <KontniPlanTab />
        </TabsContent>
        <TabsContent value="nalog">
          <NalogTab />
        </TabsContent>
        <TabsContent value="budzeti">
          <BudzetiTab fiscalYear={fiscalYear} />
        </TabsContent>
        <TabsContent value="bruto-bilans">
          <BrutoBilansTab fiscalYear={fiscalYear} />
        </TabsContent>
        <TabsContent value="pdv">
          <PdvTab fiscalYear={fiscalYear} />
        </TabsContent>
        <TabsContent value="analitika">
          <AnalitikaTab fiscalYear={fiscalYear} />
        </TabsContent>
        <TabsContent value="god-zatvaranje">
          <GodZatvaranjeTab fiscalYear={fiscalYear} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
