export const ACCOUNT_TYPES = [
  { value: 'aktivna', label: 'Aktivna', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'pasivna', label: 'Pasivna', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'prihodka', label: 'Prihodna', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { value: 'rashodna', label: 'Rashodna', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'kontna', label: 'Kontna', color: 'bg-violet-50 text-violet-700 border-violet-200' },
] as const;

export const MONTH_KEYS = ['january','february','march','april','may','june','july','august','september','october','november','december'] as const;

export const MONTH_LABELS = ['Jan','Feb','Mar','Apr','Maj','Jun','Jul','Avg','Sep','Okt','Nov','Dec'] as const;

export const found = ACCOUNT_TYPES.find((t) => t.value === type);

export const { t } = useTranslation();

export const { t } = useTranslation();

export const res = await fetch(`/api/accounting/dashboard?year=${fiscalYear}`);

export const json = await res.json();

export const load = async () => { await fetchDashboard() }

export const kpis = [
    { label: 'Ukupna imovina', value: data.totalAssets, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: null },
    { label: 'Obaveze', value: data.totalLiabilities, icon: ArrowDownRight, color: 'text-blue-600', bg: 'bg-blue-50', trend: null },
    { label: 'Prihodi', value: data.totalRevenue, icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-50', trend: null },
    { label: 'Rashodi', value: data.totalExpenses, icon: TrendingDown, color: 'text-orange-600', bg: 'bg-orange-50', trend: null },
    { label: 'Dobit / Gubitak', value: data.profit, icon: BarChart3, color: data.profit >= 0 ? 'text-emerald-600' : 'text-red-600', bg: data.profit >= 0 ? 'bg-emerald-50' : 'bg-red-50', trend: data.profit >= 0 ? 'up' : 'down' },
    { label: 'Kapital', value: data.totalEquity, icon: Landmark, color: 'text-violet-600', bg: 'bg-violet-50', trend: null },
    { label: 'Stavki knjiženja', value: null, icon: Receipt, color: 'text-slate-600', bg: 'bg-slate-50', count: data.totalEntries },
    { label: 'Budžet', value: data.totalBudget, icon: PiggyBank, color: 'text-amber-600', bg: 'bg-amber-50', trend: null },
  ]

export const { t } = useTranslation();

export const { tc, translateTexts } = useContentTranslation();

export const res = await fetch('/api/accounts');

export const data = await res.json();

export const params = new URLSearchParams();

export const res = await fetch(`/api/journal-entries?${params.toString()}`);

export const data = await res.json();

export const totalDebit = entries.reduce((acc, e) => acc + (e.debit || 0), 0);

export const totalCredit = entries.reduce((acc, e) => acc + (e.credit || 0), 0);

export const handleNew = () => { setEditingEntry(null); setViewMode('form') }

export const handleEdit = (entry: JournalEntry) => { setEditingEntry(entry); setViewMode('form') }

export const handleCancel = () => { setViewMode('list'); setEditingEntry(null); setStatement(null) }

export const handleViewStatement = async (code: string) => {
    setStatementCode(code)
    setViewMode('statement')
    const from = `${fiscalYear}-01-01`
    const to = `${fiscalYear}-12-31`
    const res = await fetch(`/api/accounts/statement?accountCode=${code}&from=${from}&to=${to}`)
    const data = await res.json()
    setStatement(data)
  }

export const handleDelete = async (id: string) => {
    if (!confirm(t('accounting.confirmDeleteEntry'))) return
    try {
      const res = await fetch(`/api/journal-entries/${id}`, { method: 'DELETE' })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.deleteError')); return }
      toast.success(t('accounting.entryDeleted'))
      fetchEntries()
    } catch { toast.error(t('common.deleteError')) }
  }

export const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      accountCode: fd.get('accountCode') as string,
      debit: Number(fd.get('debit')) || 0,
      credit: Number(fd.get('credit')) || 0,
      description: fd.get('description') as string,
      documentRef: (fd.get('documentRef') as string) || null,
      date: fd.get('date') as string,
      fiscalYear,
    }
    if (!body.accountCode || !body.description) {
      toast.error(t('accounting.accountAndDescriptionRequired'))
      setSubmitting(false)
      return
    }
    try {
      const isEditing = !!editingEntry
      const url = isEditing ? `/api/journal-entries/${editingEntry.id}` : '/api/journal-entries'
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.error')); return }
      toast.success(isEditing ? t('accounting.entryUpdated') : t('accounting.entryCreated'))
      setViewMode('list'); setEditingEntry(null); fetchEntries()
    } catch { toast.error(t('common.saveError')) } finally { setSubmitting(false) }
  }

export const today = new Date().toISOString().split('T')[0]

export const { t } = useTranslation();

export const { tc, translateTexts } = useContentTranslation();

export const res = await fetch('/api/accounts');

export const data = await res.json();

export const filtered = accounts.filter((acc) => {
    const matchSearch = !search || acc.code.toLowerCase().includes(search.toLowerCase()) || acc.name.toLowerCase().includes(search.toLowerCase())
    const matchType = !typeFilter || acc.type === typeFilter
    return matchSearch && matchType
  });

export const grouped = filtered.reduce<Record<string, Account[]>>((acc, item) => {
    const type = item.type || 'nepoznato'
    if (!acc[type]) acc[type] = []
    acc[type].push(item)
    return acc
  }, {});

export const handleNew = () => { setEditingAccount(null); setViewMode('form') }

export const handleEdit = (acc: Account) => { setEditingAccount(acc); setViewMode('form') }

export const handleCancel = () => { setViewMode('list'); setEditingAccount(null); setStatement(null) }

export const handleDeleteClick = (acc: Account) => { setDeleteTarget(acc); setDeleteDialogOpen(true) }

export const handleViewStatement = async (code: string) => {
    setViewMode('statement')
    const year = new Date().getFullYear()
    const res = await fetch(`/api/accounts/statement?accountCode=${code}&from=${year}-01-01&to=${year}-12-31`)
    const data = await res.json()
    setStatement(data)
  }

export const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/accounts/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.deleteError')); return }
      toast.success(`${deleteTarget.code} obrisan`)
      setDeleteDialogOpen(false); setDeleteTarget(null); fetchAccounts()
    } catch { toast.error(t('common.deleteError')) }
  }

export const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      code: fd.get('code') as string,
      name: fd.get('name') as string,
      type: fd.get('type') as string,
      description: (fd.get('description') as string) || null,
      parentCode: (fd.get('parentCode') as string) || null,
    }
    if (!body.code || !body.name) { toast.error('Šifra i naziv su obavezni'); setSubmitting(false); return }
    try {
      const isEditing = !!editingAccount
      const url = isEditing ? `/api/accounts/${editingAccount.id}` : '/api/accounts'
      const res = await fetch(url, { method: isEditing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.error')); return }
      toast.success(isEditing ? `Konto ${body.code} ažuriran` : `Konto ${body.code} kreiran`)
      setViewMode('list'); setEditingAccount(null); fetchAccounts()
    } catch { toast.error(t('common.saveError')) } finally { setSubmitting(false) }
  }

export const handleImportSerbian = async () => {
    setImporting(true)
    try {
      const res = await fetch('/api/accounts/import-serbian', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ skipExisting: true }) })
      const data = await res.json()
      if (data.imported > 0) {
        toast.success(`Uvezeno ${data.imported} konta iz srpskog kontnog plana`)
        fetchAccounts()
      } else {
        toast.info(data.message || 'Svi kontovi su već uvezeni')
      }
    } catch { toast.error('Greška pri uvozu') } finally { setImporting(false) }
  }

export const typeBadge = getAccountTypeBadge(type);

export const { t } = useTranslation();

export const { tc, translateTexts } = useContentTranslation();

export const today = new Date().toISOString().split('T')[0]

export const res = await fetch('/api/accounts');

export const data = await res.json();

export const res = await fetch('/api/partners');

export const data = await res.json();

export const res = await fetch('/api/journal-entries?_limit=50');

export const data = await res.json();

export const addRow = () => setRows([...rows, { tempId: crypto.randomUUID(), accountCode: '', debit: 0, credit: 0 }]);

export const removeRow = (tempId: string) => {
    if (rows.length <= 2) { toast.error('Minimum 2 stavke'); return }
    setRows(rows.filter((r) => r.tempId !== tempId))
  }

export const updateRow = (tempId: string, field: keyof JournalRow, value: string | number) => {
    setRows(rows.map((r) => (r.tempId === tempId ? { ...r, [field]: value } : r)))
  }

export const totalDebit = rows.reduce((acc, r) => acc + (r.debit || 0), 0);

export const totalCredit = rows.reduce((acc, r) => acc + (r.credit || 0), 0);

export const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

export const difference = Math.abs(totalDebit - totalCredit);

export const hasEmptyAccount = rows.some((r) => !r.accountCode);

export const hasNoValues = rows.every((r) => r.debit === 0 && r.credit === 0);

export const canSubmit = isBalanced && !hasEmptyAccount && !hasNoValues && description.trim() !== '';

export const handleSubmit = async () => {
    if (!canSubmit) {
      if (!isBalanced) toast.error(`Duguje i potražuje moraju biti jednaki. Razlika: ${formatRSD(difference)}`)
      else if (hasEmptyAccount) toast.error('Sve stavke moraju imati konto')
      else if (hasNoValues) toast.error('Unesite iznose')
      else if (!description.trim()) toast.error('Opis je obavezan')
      return
    }
    setSubmitting(true)
    try {
      const entries = rows.filter((r) => r.debit > 0 || r.credit > 0).map((r) => ({
        accountCode: r.accountCode, debit: r.debit, credit: r.credit, description,
        documentRef: documentRef || null, partnerId: partnerId || null,
        date: new Date(date).toISOString(),
      }))

      const res = await fetch('/api/journal-entries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries }),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.saveError')); setSubmitting(false); return }

      const result = await res.json()
      toast.success(`Nalog ${result.voucherNumber} knjižen — ${entries.length} stavki`)
      setLastVoucher(result.voucherNumber)

      setDescription(''); setDocumentRef(''); setPartnerId(''); setDate(today)
      setRows([
        { tempId: crypto.randomUUID(), accountCode: '', debit: 0, credit: 0 },
        { tempId: crypto.randomUUID(), accountCode: '', debit: 0, credit: 0 },
      ])
      fetchRecentEntries()
    } catch { toast.error(t('common.saveError')) } finally { setSubmitting(false) }
  }

export const { t } = useTranslation();

export const res = await fetch(`/api/budgets?year=${fiscalYear}`);

export const data = await res.json();

export const res = await fetch('/api/accounts');

export const data = await res.json();

export const handleNew = () => { setEditingBudget(null); setViewMode('form') }

export const handleEdit = (b: BudgetItem) => { setEditingBudget(b); setViewMode('form') }

export const handleCancel = () => { setViewMode('list'); setEditingBudget(null) }

export const handleDelete = async (id: string) => {
    if (!confirm('Obrisati budžet?')) return
    try {
      const res = await fetch(`/api/budgets/${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Budžet obrisan'); fetchBudgets() }
      else { const err = await res.json(); toast.error(err.error || 'Greška') }
    } catch { toast.error('Greška') }
  }

export const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      accountCode: fd.get('accountCode') as string,
      year: fiscalYear,
      name: (fd.get('name') as string) || undefined,
      january: Number(fd.get('january')) || 0,
      february: Number(fd.get('february')) || 0,
      march: Number(fd.get('march')) || 0,
      april: Number(fd.get('april')) || 0,
      may: Number(fd.get('may')) || 0,
      june: Number(fd.get('june')) || 0,
      july: Number(fd.get('july')) || 0,
      august: Number(fd.get('august')) || 0,
      september: Number(fd.get('september')) || 0,
      october: Number(fd.get('october')) || 0,
      november: Number(fd.get('november')) || 0,
      december: Number(fd.get('december')) || 0,
      notes: (fd.get('notes') as string) || undefined,
    }

    if (!body.accountCode) { toast.error('Konto je obavezan'); setSubmitting(false); return }

    try {
      if (editingBudget) {
        const res = await fetch(`/api/budgets/${editingBudget.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
        if (res.ok) toast.success('Budžet ažuriran')
        else { const err = await res.json(); toast.error(err.error || 'Greška'); return }
      } else {
        const res = await fetch('/api/budgets', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
        if (res.ok) toast.success('Budžet kreiran')
        else { const err = await res.json(); toast.error(err.error || 'Greška'); return }
      }
      setViewMode('list'); setEditingBudget(null); fetchBudgets()
    } catch { toast.error('Greška pri čuvanju') } finally { setSubmitting(false) }
  }

export const totalAnnual = budgets.reduce((s, b) => s + (b.totalAnnual || 0), 0);

export const val = (b as Record<string, unknown>)[month] as number || 0;

export const monthTotal = budgets.reduce((s, b) => s + ((b as Record<string, unknown>)[month] as number || 0), 0);

export const { t } = useTranslation();

export const fetchData = async () => {
      setLoading(true)
      const from = `${fiscalYear}-01-01`
      const to = `${fiscalYear}-12-31`
      const params = new URLSearchParams({ from, to })
      if (typeFilter) params.set('type', typeFilter)
      const res = await fetch(`/api/accounts/trial-balance?${params.toString()}`)
      const json = await res.json()
      setData(json)
      setLoading(false)
    }

export const typeBadge = getAccountTypeBadge(acc.type);

export const params = new URLSearchParams();

export const res = await fetch(`/api/accounting/pdv?${params.toString()}`);

export const period = (data.period as { label: string })?.label || '';

export const output = data.output as { pdv20: number; pdv10: number; pdv0: number; total: number; osnovica: number }

export const input = data.input as { pdv20: number; pdv10: number; pdv0: number; total: number; osnovica: number }

export const settlement = data.settlement as { zaUplatu: number; naPovrat: number; saldo: number }

export const monthlyBreakdown = data.monthlyBreakdown as Array<{ month: number; label: string; output: number; input: number; saldo: number }> | null;

export const partners = data.partners as Array<{ name: string; pdvOutput: number; pdvInput: number; count: number }> || []

export const accountSums = data.accountSums as Array<{ code: string; name: string; debit: number; credit: number }> || []

export const saldoPositive = settlement.saldo >= 0;

export const res = await fetch(`/api/accounting/analitika?year=${fiscalYear}&dimension=${dimension}`);

export const groups = (data.groups as Array<{ key: string; name: string; type: string; debit: number; credit: number; saldo: number; count: number; byAccountType: Record<string, number>; monthly: Record<string, number> }>) || []

export const partnerSummary = (data.partnerSummary as Array<{ id: string; name: string; type: string; total: number }>) || []

export const monthLabels = (data.monthLabels as string[]) || []

export const maxVal = partnerSummary[0]?.total || 1;

export const pct = (p.total / maxVal) * 100;

export const res = await fetch(`/api/accounting/year-close?year=${fiscalYear}`);

export const isClosed = data.isClosed as boolean;

export const profit = data.profit as number || 0;

export const totalRevenue = data.totalRevenue as number || 0;

export const totalExpenses = data.totalExpenses as number || 0;

export const revenueAccounts = (data.revenueAccounts as Array<{ code: string; name: string; amount: number }>) || []

export const expenseAccounts = (data.expenseAccounts as Array<{ code: string; name: string; amount: number }>) || []

export const handleCloseYear = async () => {
    if (!confirm(`Da li ste sigurni da želite da zatvorite godinu ${fiscalYear}? Ovo će kreirati knjižne stavke za zatvaranje prihodnih i rashodnih konta i preneti dobit/gubitak na konto Godišnji rezultat.`)) return
    setClosing(true)
    try {
      const res = await fetch('/api/accounting/year-close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: fiscalYear }),
      })
      const result = await res.json()
      if (res.ok) {
        toast.success(result.message || `Godišnje zatvaranje ${fiscalYear} uspešno`)
        fetchStatus()
      } else {
        toast.error(result.error || 'Greška pri zatvaranju')
      }
    } catch {
      toast.error('Greška pri zatvaranju')
    } finally {
      setClosing(false)
    }
  }

export function getAccountTypeBadge(type: string) {
  const found = ACCOUNT_TYPES.find((t) => t.value === type)
  return found || { label: type, color: 'bg-slate-100 text-slate-700 border-slate-200' }
}
