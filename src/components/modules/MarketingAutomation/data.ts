export const triggerConfig: Record<string, { label: string; color: string }> = {
  new_lead: { label: 'Novi lead', color: 'bg-green-100 text-green-700' },
  cart_abandoned: { label: 'Napuštena korpa', color: 'bg-amber-100 text-amber-700' },
  purchase: { label: 'Kupovina', color: 'bg-blue-100 text-blue-700' },
  invoice_overdue: { label: 'Prekoračen rok', color: 'bg-red-100 text-red-700' },
  subscription_expired: { label: 'Istek pretplate', color: 'bg-purple-100 text-purple-700' },
  birthday: { label: 'Rođendan', color: 'bg-pink-100 text-pink-700' },
  inactivity: { label: 'Neaktivnost', color: 'bg-gray-100 text-gray-700' },
  custom: { label: 'Custom', color: 'bg-teal-100 text-teal-700' },
}

export const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Aktivna', color: 'bg-green-100 text-green-700' },
  paused: { label: 'Pauzirana', color: 'bg-amber-100 text-amber-700' },
  draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-700' },
  error: { label: 'Greška', color: 'bg-red-100 text-red-700' },
}

export const { activeCompanyId } = useAppStore();

export const { t } = useTranslation();

export const emptyForm = { name: '', trigger: 'new_lead', actions: ['send_email'], status: 'draft' }

export const actionOptions = [
    { value: 'send_email', label: 'Pošalji email' },
    { value: 'send_sms', label: 'Pošalji SMS' },
    { value: 'add_tag', label: 'Dodaj tag' },
    { value: 'create_task', label: 'Kreiraj zadatak' },
    { value: 'notify_sales', label: 'Obavesti prodaju' },
    { value: 'update_field', label: 'Ažuriraj polje' },
    { value: 'wait', label: 'Sačekaj (delay)' },
    { value: 'webhook', label: 'Pozovi webhook' },
  ]

export const res = await fetch(`/api/marketing/workflows?companyId=${activeCompanyId}&limit=100`);

export const data = await res.json();

export const activeWorkflows = workflows.filter((w) => w.status === 'active').length;

export const totalExecutions = workflows.reduce((sum, w) => sum + (w.executionCount || 0), 0);

export const filtered = workflows.filter((w) => {
    if (search && !w.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  });

export const handleCreate = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/marketing/workflows', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...form, executionCount: 0 }),
      })
      if (res.ok) { setDialogOpen(false); setForm(emptyForm); loadWorkflows() }
    } catch { /* silent */ }
  }

export const handleToggleStatus = async (w: MarketingWorkflow) => {
    try {
      const newStatus = w.status === 'active' ? 'paused' : 'active'
      const res = await fetch(`/api/marketing/workflows?id=${w.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) loadWorkflows()
    } catch { /* silent */ }
  }

export const handleDelete = async (id: string) => {
    if (!confirm('Obrisati workflow?')) return
    try {
      const res = await fetch(`/api/marketing/workflows?id=${id}`, { method: 'DELETE' })
      if (res.ok) loadWorkflows()
    } catch { /* silent */ }
  }

export const trigCfg = triggerConfig[w.trigger]

export const statCfg = statusConfig[w.status]

export const opt = actionOptions.find((o) => o.value === action);

export const opt = actionOptions.find((o) => o.value === a);
