export const arr = parseTags(tags);

export const TYPE_COLORS: Record<string, string> = {
  kupac: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  dobavljac: 'bg-blue-50 text-blue-700 border-blue-200',
  partner: 'bg-purple-50 text-purple-700 border-purple-200',
}

export const TYPE_LABELS: Record<string, string> = {
  kupac: 'Kupac', dobavljac: 'Dobavljač', partner: 'Partner',
}

export const TAG_COLORS = [
  'bg-slate-100 text-slate-700 border-slate-200',
  'bg-amber-50 text-amber-700 border-amber-200',
  'bg-cyan-50 text-cyan-700 border-cyan-200',
  'bg-pink-50 text-pink-700 border-pink-200',
  'bg-lime-50 text-lime-700 border-lime-200',
  'bg-orange-50 text-orange-700 border-orange-200',
  'bg-violet-50 text-violet-700 border-violet-200',
  'bg-teal-50 text-teal-700 border-teal-200',
]

export const { t } = useTranslation();

export const { t } = useTranslation();

export const { tc } = useContentTranslation();

export const res = await fetch('/api/partners/stats');

export const data = await res.json();

export const maxCount = stats.cityGroups[0]?._count?.city || 1;

export const pct = Math.round((cg._count.city / maxCount) * 100);

export const { t } = useTranslation();

export const { tc, translateTexts } = useContentTranslation();

export const params = new URLSearchParams();

export const res = await fetch(`/api/partners?${params.toString()}`);

export const data = await res.json();

export const handleNew = () => {
    setEditingPartner(null)
    setTagInput('')
    setViewMode('form')
  }

export const handleEdit = (partner: Partner) => {
    setEditingPartner(partner)
    setTagInput(formatTagsInput(partner.tags))
    setViewMode('form')
  }

export const handleCancel = () => {
    setViewMode('list')
    setEditingPartner(null)
  }

export const handleDeleteClick = (partner: Partner) => {
    setDeleteTarget(partner)
    setDeleteDialogOpen(true)
  }

export const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/partners/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('common.deleteError'))
        return
      }
      toast.success(t('partners.deleteSuccess'))
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
      fetchPartners()
    } catch {
      toast.error(t('partners.deleteError'))
    }
  }

export const handleToggleActive = async (partner: Partner) => {
    try {
      const res = await fetch(`/api/partners/${partner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !partner.isActive }),
      })
      if (!res.ok) { toast.error('Greška'); return }
      toast.success(partner.isActive ? 'Partner deaktiviran' : 'Partner aktiviran')
      fetchPartners()
    } catch {
      toast.error('Greška')
    }
  }

export const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      name: fd.get('name') as string,
      pib: fd.get('pib') as string || null,
      maticniBr: fd.get('maticniBr') as string || null,
      address: fd.get('address') as string || null,
      city: fd.get('city') as string || null,
      zipCode: fd.get('zipCode') as string || null,
      phone: fd.get('phone') as string || null,
      email: fd.get('email') as string || null,
      type: fd.get('type') as string,
      account: fd.get('account') as string || null,
      bank: fd.get('bank') as string || null,
      notes: fd.get('notes') as string || null,
      creditLimit: Number(fd.get('creditLimit')) || 0,
      paymentTerms: Number(fd.get('paymentTerms')) || 0,
      parentId: (fd.get('parentId') as string) || null,
      tags: tagInput || null,
    }
    if (!body.name) { toast.error('Naziv je obavezan'); setSubmitting(false); return }

    try {
      const isEditing = !!editingPartner
      const url = isEditing ? `/api/partners/${editingPartner.id}` : '/api/partners'
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('common.error'))
        return
      }
      toast.success(isEditing ? t('partners.updateSuccess') : t('partners.createSuccess'))
      setViewMode('list')
      setEditingPartner(null)
      fetchPartners()
    } catch {
      toast.error(t('common.error'))
    } finally {
      setSubmitting(false)
    }
  }

export const trimmed = tag.trim();

export const parts = tagInput.split(',').filter((_, j) => j !== i);

export const tags = parseTags(p.tags);

export const { t } = useTranslation();

export const { tc } = useContentTranslation();

export const res = await fetch('/api/partners');

export const data = await res.json();

export const [analyticsRes, detailRes] = await Promise.all([
        fetch(`/api/partners/${partnerId}/analytics`),
        fetch(`/api/partners/${partnerId}`),
      ]);

export const analyticsData = await analyticsRes.json();

export const detailData = await detailRes.json();

export const selectedPartner = partners.find((p) => p.id === selectedId);

export function parseTags(tags: string | null): string[] {
  if (!tags) return []
  try { return JSON.parse(tags) } catch { return [] }
}

export function formatTagsInput(tags: string | null): string {
  const arr = parseTags(tags)
  return arr.join(', ')
}

export function getTagColor(index: number) {
  return TAG_COLORS[index % TAG_COLORS.length]
}
