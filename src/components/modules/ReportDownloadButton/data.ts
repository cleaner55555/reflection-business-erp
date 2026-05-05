export const { t } = useTranslation();

export const reportLabels: Record<ReportType, string> = {
    invoice: t('reports.invoicePDF') || 'Faktura PDF',
    partners: t('reports.partnersReport') || 'Izveštaj partnera',
    products: t('reports.productsReport') || 'Izveštaj proizvoda',
    transactions: t('reports.transactionsReport') || 'Izvod transakcija',
    financial: t('reports.financialReport') || 'Finansijski izveštaj',
  }

export const handleDownloadPDF = async () => {
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

export const generateAndDownloadPDF = (reportData: unknown) => {
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

export const handleDownloadExcel = async () => {
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

export const generateAndDownloadExcel = (reportData: unknown) => {
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
