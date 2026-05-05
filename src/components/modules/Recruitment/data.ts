export const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-700' },
  open: { label: 'Otvoren', color: 'bg-green-100 text-green-700' },
  paused: { label: 'Pauziran', color: 'bg-amber-100 text-amber-700' },
  closed: { label: 'Zatvoren', color: 'bg-red-100 text-red-700' },
}

export const typeLabels: Record<string, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Ugovor',
  internship: 'Praksa',
  remote: 'Remote',
}

export const { activeCompanyId } = useAppStore();

export const { t } = useTranslation();

export const emptyForm = {
    title: '', department: '', location: '', type: 'full_time',
    salaryMin: 0, salaryMax: 0, description: '', requirements: '',
  }

export const res = await fetch(`/api/recruitment/jobs/dashboard?companyId=${activeCompanyId}`);

export const params = new URLSearchParams({ companyId: activeCompanyId });

export const res = await fetch(`/api/recruitment/jobs?${params}`);

export const handleCreate = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/recruitment/jobs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...form }),
      })
      if (res.ok) { setDialogOpen(false); setForm(emptyForm); loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

export const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/recruitment/jobs', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) { loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

export const handleDelete = async (id: string) => {
    if (!confirm('Obrisati oglas za posao?')) return
    try {
      const res = await fetch(`/api/recruitment/jobs?id=${id}`, { method: 'DELETE' })
      if (res.ok) { loadItems(); loadDashboard() }
    } catch { /* silent */ }
  }

export const cfg = statusConfig[j.status]

export const cfg = statusConfig[j.status]
