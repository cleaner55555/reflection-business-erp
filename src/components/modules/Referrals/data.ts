export const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Na čekanju', color: 'bg-amber-100 text-amber-700' },
  contacted: { label: 'Kontaktiran', color: 'bg-blue-100 text-blue-700' },
  converted: { label: 'Konvertovan', color: 'bg-green-100 text-green-700' },
  expired: { label: 'Istekao', color: 'bg-gray-100 text-gray-700' },
}

export const sourceLabels: Record<string, string> = {
  email: 'Email',
  phone: 'Telefon',
  social: 'Društvene mreže',
  direct: 'Lično',
  website: 'Veb sajt',
}

export const formatCurrency = (val: number) => `${val.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD`;

export const { activeCompanyId } = useAppStore();

export const { t } = useTranslation();

export const emptyForm = {
    referrerName: '', refereeName: '', refereeEmail: '',
    refereePhone: '', source: 'direct', reward: 0, notes: '',
  }

export const res = await fetch(`/api/referrals/dashboard?companyId=${activeCompanyId}`);

export const params = new URLSearchParams({ companyId: activeCompanyId });

export const res = await fetch(`/api/referrals?${params}`);

export const handleCreate = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/referrals', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...form }),
      })
      if (res.ok) { setDialogOpen(false); setForm(emptyForm); loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

export const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/referrals', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) { loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

export const handleDelete = async (id: string) => {
    if (!confirm('Obrisati preporuku?')) return
    try {
      const res = await fetch(`/api/referrals?id=${id}`, { method: 'DELETE' })
      if (res.ok) { loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

export const cfg = statusConfig[r.status]

export const cfg = statusConfig[r.status]
