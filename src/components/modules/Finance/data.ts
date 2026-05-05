export const JOURNAL_TYPE_OPTIONS = [
  { value: 'all', label: 'common.all' },
  { value: 'faktura_izlazna', label: 'invoices.outgoing' },
  { value: 'faktura_ulazna', label: 'invoices.incoming' },
  { value: 'predracun', label: 'invoices.preinvoice' },
  { value: 'transakcija', label: 'finance.transaction' },
  { value: 'kasa', label: 'finance.cashRegister' },
  { value: 'nabavka', label: 'finance.purchase' },
  { value: 'otpremnica', label: 'finance.deliveryNote' },
] as const;

export const { t } = useTranslation();

export const { t } = useTranslation();

export const { tc, translateTexts } = useContentTranslation();

export const params = new URLSearchParams();

export const res = await fetch(`/api/transactions?${params.toString()}`);

export const data = await res.json();

export const texts = transactions.map((tx) => tx.description).filter(Boolean) as string[]

export const handleEdit = (t: Transaction) => {
    setEditingTransaction(t)
    setViewMode('form')
  }

export const handleNew = () => {
    setEditingTransaction(null)
    setViewMode('form')
  }

export const handleCancel = () => {
    setViewMode('list')
    setEditingTransaction(null)
  }

export const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirmDelete'))) return
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.error')); return }
      toast.success(t('finance.transactionDeleted'))
      fetchTransactions()
    } catch { toast.error(t('common.error')) }
  }

export const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      type: fd.get('type') as string,
      category: fd.get('category') as string,
      amount: fd.get('amount') as string,
      description: fd.get('description') as string,
      documentRef: fd.get('documentRef') as string,
    }
    try {
      const isEditing = !!editingTransaction
      const url = isEditing ? `/api/transactions/${editingTransaction.id}` : '/api/transactions'
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEditing ? { ...body, date: editingTransaction.date } : body),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('common.error'))
        return
      }
      toast.success(isEditing ? t('finance.transactionUpdated') : t('finance.transactionCreated'))
      setViewMode('list')
      setEditingTransaction(null)
      fetchTransactions()
    } catch {
      toast.error(t('common.saveError'))
    } finally {
      setSubmitting(false)
    }
  }

export const { t } = useTranslation();

export const { tc, translateTexts } = useContentTranslation();

export const res = await fetch('/api/cash-register');

export const data = await res.json();

export const texts: string[] = []

export const runningBalance = entries.reduce((acc, entry) => {
    return acc + (entry.type === 'ulaz' ? entry.amount : -entry.amount)
  }, 0);

export const handleEdit = (entry: CashEntry) => {
    setEditingEntry(entry)
    setViewMode('form')
  }

export const handleNew = () => {
    setEditingEntry(null)
    setViewMode('form')
  }

export const handleCancel = () => {
    setViewMode('list')
    setEditingEntry(null)
  }

export const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirmDelete'))) return
    try {
      const res = await fetch(`/api/cash-register/${id}`, { method: 'DELETE' })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.error')); return }
      toast.success(t('finance.entryDeleted'))
      fetchEntries()
    } catch { toast.error(t('common.error')) }
  }

export const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      type: fd.get('type') as string,
      amount: fd.get('amount') as string,
      description: fd.get('description') as string,
      partnerName: fd.get('partnerName') as string,
      paymentMethod: fd.get('paymentMethod') as string,
    }
    try {
      const isEditing = !!editingEntry
      const url = isEditing ? `/api/cash-register/${editingEntry.id}` : '/api/cash-register'
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEditing ? { ...body, date: editingEntry.date } : body),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('common.error'))
        return
      }
      toast.success(isEditing ? t('finance.entryUpdated') : t('finance.cashEntryCreated'))
      setViewMode('list')
      setEditingEntry(null)
      fetchEntries()
    } catch {
      toast.error(t('common.saveError'))
    } finally {
      setSubmitting(false)
    }
  }

export const { t } = useTranslation();

export const { tc, translateTexts } = useContentTranslation();

export const params = new URLSearchParams();

export const res = await fetch(`/api/journal?${params.toString()}`);

export const data = await res.json();

export const texts: string[] = []

export const totalDebit = entries.reduce((acc, entry) => acc + (entry.debit || 0), 0);

export const totalCredit = entries.reduce((acc, entry) => acc + (entry.credit || 0), 0);

export const saldo = totalDebit - totalCredit;
