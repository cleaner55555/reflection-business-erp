export const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Na čekanju', color: 'bg-amber-100 text-amber-700' },
  in_progress: { label: 'U toku', color: 'bg-blue-100 text-blue-700' },
  passed: { label: 'Prošlo', color: 'bg-green-100 text-green-700' },
  failed: { label: 'Palo', color: 'bg-red-100 text-red-700' },
}

export const typeLabels: Record<string, string> = {
  incoming: 'Dolazna kontrola',
  in_process: 'Kontrola u toku',
  final: 'Finalna kontrola',
  audit: 'Audit',
}

export const { activeCompanyId } = useAppStore();

export const { t } = useTranslation();

export const emptyForm = {
    title: '', type: 'final', productName: '', batchNumber: '',
    inspectorName: '', result: 'pending', defects: 0, notes: '',
  }

export const res = await fetch(`/api/quality/inspections/dashboard?companyId=${activeCompanyId}`);

export const params = new URLSearchParams({ companyId: activeCompanyId });

export const res = await fetch(`/api/quality/inspections?${params}`);

export const handleCreate = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/quality/inspections', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...form }),
      })
      if (res.ok) { setDialogOpen(false); setForm(emptyForm); loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

export const handleUpdateStatus = async (id: string, status: string, result: string) => {
    try {
      const res = await fetch('/api/quality/inspections', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, result }),
      })
      if (res.ok) { loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

export const handleDelete = async (id: string) => {
    if (!confirm('Obrisati inspekciju?')) return
    try {
      const res = await fetch(`/api/quality/inspections?id=${id}`, { method: 'DELETE' })
      if (res.ok) { loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

export const cfg = statusConfig[i.status]

export const cfg = statusConfig[i.status]
