export const platformConfig: Record<string, { label: string; color: string; icon: string }> = {
  facebook: { label: 'Facebook', color: 'bg-blue-100 text-blue-700', icon: '📘' },
  instagram: { label: 'Instagram', color: 'bg-pink-100 text-pink-700', icon: '📸' },
  linkedin: { label: 'LinkedIn', color: 'bg-sky-100 text-sky-700', icon: '💼' },
  twitter: { label: 'X (Twitter)', color: 'bg-gray-100 text-gray-700', icon: '🐦' },
  tiktok: { label: 'TikTok', color: 'bg-gray-900 text-white', icon: '🎵' },
  youtube: { label: 'YouTube', color: 'bg-red-100 text-red-700', icon: '🎬' },
}

export const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-700' },
  scheduled: { label: 'Zakazano', color: 'bg-amber-100 text-amber-700' },
  published: { label: 'Objavljeno', color: 'bg-green-100 text-green-700' },
  failed: { label: 'Greška', color: 'bg-red-100 text-red-700' },
}

export const { activeCompanyId } = useAppStore();

export const { t } = useTranslation();

export const emptyForm = {
    platform: 'facebook', content: '', scheduledDate: '', status: 'draft',
  }

export const res = await fetch(`/api/social/posts?companyId=${activeCompanyId}&limit=100`);

export const data = await res.json();

export const items = data.items || data || []

export const filteredPosts = posts.filter((p) => {
    if (search && !p.content.toLowerCase().includes(search.toLowerCase())) return false
    if (platformFilter !== 'all' && p.platform !== platformFilter) return false
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    return true
  });

export const handleCreate = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/social/posts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...form }),
      })
      if (res.ok) { setDialogOpen(false); setForm(emptyForm); loadPosts() }
    } catch { /* silent */ }
  }

export const handleDelete = async (id: string) => {
    if (!confirm('Obrisati objavu?')) return
    try {
      const res = await fetch(`/api/social/posts?id=${id}`, { method: 'DELETE' })
      if (res.ok) loadPosts()
    } catch { /* silent */ }
  }

export const cfg = platformConfig[p.platform]

export const platCfg = platformConfig[p.platform]

export const statCfg = statusConfig[p.status]
