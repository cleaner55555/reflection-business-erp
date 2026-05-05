export const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Na čekanju', color: 'bg-gray-100 text-gray-700' },
  scheduled: { label: 'Zakazano', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'U toku', color: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Završeno', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Otkazano', color: 'bg-red-100 text-red-700' },
}

export const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Nizak', color: 'bg-gray-100 text-gray-700' },
  normal: { label: 'Normalan', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'Visok', color: 'bg-orange-100 text-orange-700' },
  emergency: { label: 'Hitno', color: 'bg-red-100 text-red-700' },
}

export const typeLabels: Record<string, string> = {
  installation: 'Instalacija',
  repair: 'Popravka',
  maintenance: 'Održavanje',
  inspection: 'Pregled',
  delivery: 'Dostava',
}

export const { activeCompanyId } = useAppStore();

export const { t } = useTranslation();

export const emptyForm = {
    customerName: '', address: '', type: 'repair',
    description: '', priority: 'normal', assignedTo: '',
    scheduledDate: '', notes: '',
  }

export const res = await fetch(`/api/field-service/orders/dashboard?companyId=${activeCompanyId}`);

export const params = new URLSearchParams({ companyId: activeCompanyId });

export const res = await fetch(`/api/field-service/orders?${params}`);

export const handleCreate = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/field-service/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...form }),
      })
      if (res.ok) { setDialogOpen(false); setForm(emptyForm); loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

export const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/field-service/orders', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) { loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

export const handleDelete = async (id: string) => {
    if (!confirm('Obrisati terenski nalog?')) return
    try {
      const res = await fetch(`/api/field-service/orders?id=${id}`, { method: 'DELETE' })
      if (res.ok) { loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

export const cfg = statusConfig[o.status]

export const sCfg = statusConfig[o.status]

export const pCfg = priorityConfig[o.priority]
