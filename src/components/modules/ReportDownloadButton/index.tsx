'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from '@/lib/i18n'
  generateInvoicePDF,
  downloadPDF,
  generatePartnersPDF,
  generateProductsPDF,
  generateFinancialReport,
  generateTransactionPDF,
  type InvoiceData,
  type PartnerData,
  type ProductData,
  type TransactionData,
  type FinancialData,
} from '@/lib/reports/pdf-generator'
  exportPartnersExcel,
  exportProductsExcel,
  exportInvoicesExcel,
  exportTransactionsExcel,
  exportFinancialExcel,
} from '@/lib/reports/excel-generator'

export type ReportType = 'invoice' | 'partners' | 'products' | 'transactions' | 'financial'

interface ReportDownloadButtonProps {
  type: ReportType
  data?: unknown
  options?: Record<string, unknown>
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  label?: string
}

export function ReportDownloadButton({
  type,
  data,
  options = {},
  variant = 'outline',
  size = 'sm',
  className = '',
  label,
}: ReportDownloadButtonProps) {
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()

  const reportLabels: Record<ReportType, string> = {
    invoice: t('reports.invoicePDF') || 'Faktura PDF',
    partners: t('reports.partnersReport') || 'Izveštaj partnera',
    products: t('reports.productsReport') || 'Izveštaj proizvoda',
    transactions: t('reports.transactionsReport') || 'Izvod transakcija',
    financial: t('reports.financialReport') || 'Finansijski izveštaj',
  }

  const handleDownloadPDF = async () => {
    setLoading(true)
    try {
      // If data was passed directly, use it
      if (data) {
        generateAndDownloadPDF(data)
        return
      }

      // Otherwise fetch from API
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, format: 'pdf', options }),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('common.errorOccurred'))
        return
      }

      const result = await res.json()
      generateAndDownloadPDF(result.data)
    } catch {
      toast.error(t('common.errorOccurred'))
    } finally {
      setLoading(false)
    }
  }

  const generateAndDownloadPDF = (reportData: unknown) => {
    switch (type) {
      case 'invoice': {
        const doc = generateInvoicePDF(reportData as InvoiceData)
        const inv = reportData as InvoiceData
        downloadPDF(doc, `faktura_${inv.number}.pdf`)
        break
      }
      case 'partners': {
        const doc = generatePartnersPDF(reportData as PartnerData[])
        downloadPDF(doc, 'izvestaj_partnera.pdf')
        break
      }
      case 'products': {
        const doc = generateProductsPDF(reportData as ProductData[])
        downloadPDF(doc, 'izvestaj_proizvoda.pdf')
        break
      }
      case 'transactions': {
        const doc = generateTransactionPDF(reportData as TransactionData[], {
          dateFrom: options.dateFrom as string,
          dateTo: options.dateTo as string,
        })
        downloadPDF(doc, 'izvod_transakcija.pdf')
        break
      }
      case 'financial': {
        const doc = generateFinancialReport(reportData as FinancialData)
        downloadPDF(doc, 'finansijski_izvestaj.pdf')
        break
      }
    }
    toast.success(t('reports.downloadReady') || 'Preuzimanje završeno')
  }

  const handleDownloadExcel = async () => {
    setLoading(true)
    try {
      // If data was passed directly, use it
      if (data) {
        generateAndDownloadExcel(data)
        return
      }

      // Otherwise fetch from API
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, format: 'excel', options }),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('common.errorOccurred'))
        return
      }

      const result = await res.json()
      generateAndDownloadExcel(result.data)
    } catch {
      toast.error(t('common.errorOccurred'))
    } finally {
      setLoading(false)
    }
  }

  const generateAndDownloadExcel = (reportData: unknown) => {
    switch (type) {
      case 'invoice':
        exportInvoicesExcel(reportData as InvoiceData[])
        break
      case 'partners':
        exportPartnersExcel(reportData as PartnerData[])
        break
      case 'products':
        exportProductsExcel(reportData as ProductData[])
        break
      case 'transactions':
        exportTransactionsExcel(reportData as TransactionData[])
        break
      case 'financial':
        exportFinancialExcel(reportData as FinancialData)
        break
    }
    toast.success(t('reports.downloadReady') || 'Preuzimanje završeno')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={`gap-2 ${className}`} disabled={loading}>
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          {loading
            ? (t('reports.exporting') || 'Izvoz...')
            : (label || t('common.export') || 'Izvoz')
          }
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleDownloadPDF} disabled={loading}>
          <FileText className="h-4 w-4 mr-2 text-red-500" />
          {t('reports.downloadPDF') || 'Preuzmi PDF'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadExcel} disabled={loading}>
          <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" />
          {t('reports.downloadExcel') || 'Preuzmi Excel'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
