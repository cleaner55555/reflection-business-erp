export const ACTION_ICONS: Record<string, React.ElementType> = {
  create: PlusCircle,
  update: FileEdit,
  delete: Trash,
  login: Activity,
  logout: Activity,
}

export const ACTION_COLORS: Record<string, string> = {
  create: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  update: 'bg-amber-100 text-amber-700 border-amber-200',
  delete: 'bg-red-100 text-red-700 border-red-200',
  login: 'bg-sky-100 text-sky-700 border-sky-200',
  logout: 'bg-slate-100 text-slate-600 border-slate-200',
  read: 'bg-violet-100 text-violet-700 border-violet-200',
  export: 'bg-teal-100 text-teal-700 border-teal-200',
  import: 'bg-indigo-100 text-indigo-700 border-indigo-200',
}

export const ENTITY_LABELS: Record<string, string> = {
  invoice: 'Faktura',
  partner: 'Partner',
  product: 'Proizvod',
  journal_entry: 'Nalog knjiženja',
  account: 'Konto',
  employee: 'Zaposleni',
  payroll: 'Plata',
  project: 'Projekat',
  task: 'Zadatak',
  deal: 'Poslovna prilika',
  contact: 'Kontakt',
  stock_movement: 'Kretanje zaliha',
  purchase_order: 'Narudžbenica',
  delivery_note: 'Otpremnica',
  crm_activity: 'CRM aktivnost',
  user: 'Korisnik',
  role: 'Uloga',
  company: 'Kompanija',
  budget: 'Budžet',
  asset: 'Osnovno sredstvo',
  document: 'Dokument',
  webhook: 'Webhook',
  api_key: 'API ključ',
  settings: 'Podešavanja',
}

export const ACTION_LABELS: Record<string, string> = {
  create: 'Kreiranje',
  update: 'Izmena',
  delete: 'Brisanje',
  read: 'Čitanje',
  login: 'Prijava',
  logout: 'Odjava',
  export: 'Izvoz',
  import: 'Uvoz',
  approve: 'Odobrenje',
  reject: 'Odbijanje',
  close: 'Zatvaranje',
  send: 'Slanje',
  reconcile: 'Usklađivanje',
}

export const activeCompanyId = useAppStore((s) => s.activeCompanyId);

export const pageSize = 50;

export const params = new URLSearchParams();

export const res = await fetch(`/api/audit-logs?${params.toString()}`);

export const data = await res.json();

export const filteredLogs = logs.filter((log) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      log.userName?.toLowerCase().includes(q) ||
      log.entity?.toLowerCase().includes(q) ||
      log.action?.toLowerCase().includes(q) ||
      log.details?.toLowerCase().includes(q) ||
      (ENTITY_LABELS[log.entity] || '').toLowerCase().includes(q) ||
      (ACTION_LABELS[log.action] || '').toLowerCase().includes(q)
    )
  });

export const paginatedLogs = filteredLogs.slice(page * pageSize, (page + 1) * pageSize);

export const totalPages = Math.ceil(filteredLogs.length / pageSize);

export const handleClear = async () => {
    if (!activeCompanyId) return
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

    if (!confirm('Obrisati sve logove starije od 3 meseca?')) return

    setClearing(true)
    try {
      const res = await fetch(
        `/api/audit-logs?companyId=${activeCompanyId}&before=${threeMonthsAgo.toISOString().split('T')[0]}`,
        { method: 'DELETE' }
      )
      const data = await res.json()
      toast.success(`Obrisano ${data.deleted || 0} starih logova`)
      fetchLogs()
    } catch {
      toast.error('Greška pri brisanju')
    } finally {
      setClearing(false)
    }
  }

export const handleExport = () => {
    const headers = ['Datum', 'Korisnik', 'Entitet', 'Akcija', 'Detalji', 'IP adresa']
    const rows = filteredLogs.map((log) => [
      new Date(log.createdAt).toLocaleString('sr-Latn'),
      log.userName,
      ENTITY_LABELS[log.entity] || log.entity,
      ACTION_LABELS[log.action] || log.action,
      log.details || '',
      log.ipAddress || '',
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV izvezen')
  }

export const entities = stats?.byEntity?.map((e) => e.entity) || []

export const actions = stats?.byAction?.map((a) => a.action) || []

export const getActionIcon = (action: string) => {
    const Icon = ACTION_ICONS[action] || FileEdit
    return <Icon className="h-3.5 w-3.5" />
  }

export const getActionColor = (action: string) => {
    return ACTION_COLORS[action] || 'bg-slate-100 text-slate-600 border-slate-200'
  }

export const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Upravo sada'
    if (diffMins < 60) return `Pre ${diffMins} min`
    if (diffHours < 24) return `Pre ${diffHours} h`
    if (diffDays < 7) return `Pre ${diffDays} d`
    return formatDate(dateStr)
  }

export const start = Math.max(0, Math.min(page - 2, totalPages - 5));

export const p = start + i;

export const maxCount = stats.byEntity[0]?._count || 1;

export const maxCount = stats.byAction[0]?._count || 1;
