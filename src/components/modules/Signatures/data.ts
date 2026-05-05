export const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Na čekanju', color: 'bg-amber-100 text-amber-700' },
  signed: { label: 'Potpisano', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Odbijeno', color: 'bg-red-100 text-red-700' },
  expired: { label: 'Isteklo', color: 'bg-gray-100 text-gray-700' },
}

export const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Nizak', color: 'bg-gray-100 text-gray-700' },
  medium: { label: 'Srednji', color: 'bg-amber-100 text-amber-700' },
  high: { label: 'Visok', color: 'bg-red-100 text-red-700' },
}

export const typeLabels: Record<string, string> = {
  contract: 'Ugovor',
  nda: 'NDA',
  invoice: 'Faktura',
  proposal: 'Predlog',
  policy: 'Pravilnik',
  other: 'Ostalo',
}

export const { activeCompanyId } = useAppStore();

export const { t } = useTranslation();

export const emptyForm = {
    title: '', documentType: 'contract', signerName: '',
    priority: 'medium', notes: '',
  }

export const res = await fetch(`/api/signing-requests/dashboard?companyId=${activeCompanyId}`);

export const params = new URLSearchParams({ companyId: activeCompanyId });

export const res = await fetch(`/api/signing-requests?${params}`);

export const handleCreate = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/signing-requests', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...form }),
      })
      if (res.ok) { setDialogOpen(false); setForm(emptyForm); loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

export const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/signing-requests', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) { loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

export const handleDelete = async (id: string) => {
    if (!confirm('Obrisati zahtev za potpis?')) return
    try {
      const res = await fetch(`/api/signing-requests?id=${id}`, { method: 'DELETE' })
      if (res.ok) { loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

export const cfg = priorityConfig[pr.priority]

export const cfg = statusConfig[r.status]

export const sCfg = statusConfig[r.status]

export const pCfg = priorityConfig[r.priority]
