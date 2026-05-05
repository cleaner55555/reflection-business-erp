export const statusConfig: Record<string, { label: string; color: string }> = {
  open: { label: 'Otvoren', color: 'bg-red-100 text-red-700' },
  in_progress: { label: 'U toku', color: 'bg-amber-100 text-amber-700' },
  waiting: { label: 'Čeka odgovor', color: 'bg-blue-100 text-blue-700' },
  resolved: { label: 'Rešeno', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Zatvoreno', color: 'bg-gray-100 text-gray-700' },
}

export const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Nizak', color: 'bg-gray-100 text-gray-700' },
  medium: { label: 'Srednji', color: 'bg-amber-100 text-amber-700' },
  high: { label: 'Visok', color: 'bg-orange-100 text-orange-700' },
  critical: { label: 'Kritičan', color: 'bg-red-100 text-red-700' },
}

export const categoryLabels: Record<string, string> = {
  technical: 'Tehnički',
  billing: 'Naplata',
  general: 'Opšte',
  feature: 'Funkcionalnost',
  bug: 'Greška',
}

export const { activeCompanyId } = useAppStore();

export const { t } = useTranslation();

export const emptyForm = {
    subject: '', description: '', customerName: '',
    category: 'general', priority: 'medium', assignedTo: '',
  }

export const res = await fetch(`/api/helpdesk/tickets/dashboard?companyId=${activeCompanyId}`);

export const params = new URLSearchParams({ companyId: activeCompanyId });

export const res = await fetch(`/api/helpdesk/tickets?${params}`);

export const handleCreate = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/helpdesk/tickets', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...form }),
      })
      if (res.ok) { setDialogOpen(false); setForm(emptyForm); loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

export const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/helpdesk/tickets', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) { loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

export const handleDelete = async (id: string) => {
    if (!confirm('Obrisati tiket?')) return
    try {
      const res = await fetch(`/api/helpdesk/tickets?id=${id}`, { method: 'DELETE' })
      if (res.ok) { loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

export const cfg = statusConfig[tk.status]

export const pCfg = priorityConfig[tk.priority]

export const sCfg = statusConfig[tk.status]

export const pCfg = priorityConfig[tk.priority]
