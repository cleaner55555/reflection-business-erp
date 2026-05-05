export const { t } = useTranslation();

export const { t } = useTranslation();

export const res = await fetch('/api/bank-accounts');

export const data = await res.json();

export const handleOpenNew = () => {
    setEditingAccount(null)
    setDialogOpen(true)
  }

export const handleOpenEdit = (account: BankAccount) => {
    setEditingAccount(account)
    setDialogOpen(true)
  }

export const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/bank-accounts/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('common.errorOccurred'))
        return
      }
      toast.success(t('common.deleteSuccess'))
      fetchAccounts()
    } catch {
      toast.error(t('common.errorOccurred'))
    } finally {
      setDeleteId(null)
    }
  }

export const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      name: fd.get('name') as string,
      bank: fd.get('bank') as string,
      account: fd.get('account') as string,
      currency: fd.get('currency') as string,
      isActive: fd.get('isActive') !== 'false',
    }

    try {
      const isEditing = !!editingAccount
      const url = isEditing ? `/api/bank-accounts/${editingAccount.id}` : '/api/bank-accounts'
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('common.errorOccurred'))
        return
      }
      toast.success(t('common.saveSuccess'))
      setDialogOpen(false)
      setEditingAccount(null)
      fetchAccounts()
    } catch {
      toast.error(t('common.errorOccurred'))
    } finally {
      setSubmitting(false)
    }
  }

export const totalBalance = accounts.reduce((sum, a) => sum + (a.isActive ? a.balance : 0), 0);

export const { t } = useTranslation();

export const res = await fetch('/api/bank-accounts');

export const data = await res.json();

export const params = new URLSearchParams();

export const res = await fetch(`/api/bank-transactions?${params.toString()}`);

export const data = await res.json();

export const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      setImportPreview(evt.target?.result as string)
    }
    reader.readAsText(file)
  }

export const handleImport = async () => {
    if (!importAccountId || !importPreview) return
    setImporting(true)
    try {
      const res = await fetch('/api/bank-transactions/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankAccountId: importAccountId,
          csvContent: importPreview,
        }),
      })
      const result = await res.json()
      if (!res.ok) {
        toast.error(result.error || t('bankSync.importError'))
        return
      }
      toast.success(
        t('bankSync.importSuccess', { imported: result.imported, failed: result.failed })
      )
      setImportDialogOpen(false)
      setImportPreview(null)
      setImportAccountId('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      fetchAccounts()
      fetchTransactions()
    } catch {
      toast.error(t('bankSync.importError'))
    } finally {
      setImporting(false)
    }
  }

export const handleOpenMatch = async (transaction: BankTransaction) => {
    setMatchTransaction(transaction)
    setSelectedInvoiceId('')
    setMatchDialogOpen(true)

    try {
      const res = await fetch('/api/invoices?status=poslata,nacrt&type=izlazna')
      const data = await res.json()
      setInvoices(Array.isArray(data) ? data : [])
    } catch {
      setInvoices([])
    }
  }

export const handleMatch = async () => {
    if (!matchTransaction || !selectedInvoiceId) return
    setMatching(true)
    try {
      const res = await fetch(`/api/bank-transactions/${matchTransaction.id}/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: selectedInvoiceId }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('common.errorOccurred'))
        return
      }
      toast.success(t('bankSync.matchSuccess'))
      setMatchDialogOpen(false)
      fetchTransactions()
    } catch {
      toast.error(t('common.errorOccurred'))
    } finally {
      setMatching(false)
    }
  }

export const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.csv')) {
      toast.error(t('bankSync.csvOnly'))
      return
    }
    const reader = new FileReader()
    reader.onload = (evt) => {
      setImportPreview(evt.target?.result as string)
      setImportDialogOpen(true)
    }
    reader.readAsText(file)
  }

export const clearFilters = () => {
    setAccountFilter('')
    setStatusFilter('')
    setDateFrom('')
    setDateTo('')
    setSearch('')
  }

export const totalIn = transactions.filter((tx) => tx.amount > 0).reduce((s, tx) => s + tx.amount, 0);

export const totalOut = transactions.filter((tx) => tx.amount < 0).reduce((s, tx) => s + Math.abs(tx.amount), 0);

export const reconciled = transactions.filter((tx) => tx.isReconciled).length;

export const file = e.dataTransfer.files?.[0]

export const reader = new FileReader();

export const { t } = useTranslation();

export const res = await fetch('/api/bank-accounts');

export const data = await res.json();

export const res = await fetch(`/api/bank-transactions?bankAccountId=${selectedAccountId}`);

export const data = await res.json();

export const handleAutoReconcile = async () => {
    if (!selectedAccountId) {
      toast.error(t('bankSync.selectAccountFirst'))
      return
    }
    setReconciling(true)
    try {
      const res = await fetch('/api/bank-transactions/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankAccountId: selectedAccountId }),
      })
      const result = await res.json()
      if (!res.ok) {
        toast.error(result.error || t('common.errorOccurred'))
        return
      }
      setReconcileResult(result)
      toast.success(
        t('bankSync.reconcileResult', {
          auto: result.autoMatched,
          manual: result.manualNeeded,
          unmatched: result.unmatched?.length || 0,
        })
      )
      fetchStats()
    } catch {
      toast.error(t('common.errorOccurred'))
    } finally {
      setReconciling(false)
    }
  }

export const handleApprove = async (match: SuggestedMatch) => {
    setApproving(match.transactionId)
    try {
      const res = await fetch(`/api/bank-transactions/${match.transactionId}/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: match.invoiceId }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('common.errorOccurred'))
        return
      }
      toast.success(t('bankSync.matchSuccess'))
      setReconcileResult((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          suggestedMatches: prev.suggestedMatches.filter((m) => m.transactionId !== match.transactionId),
        }
      })
      fetchStats()
    } catch {
      toast.error(t('common.errorOccurred'))
    } finally {
      setApproving(null)
    }
  }

export const totalTransactions = transactions.length;

export const autoMatched = transactions.filter((tx) => tx.isReconciled && tx.invoiceId).length;

export const needsReview = reconcileResult?.suggestedMatches.length || 0;

export const unmatched = transactions.filter((tx) => !tx.isReconciled).length;
