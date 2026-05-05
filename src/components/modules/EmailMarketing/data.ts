export const getCampaignStatuses = (t: (key: string) => string): Record<string, { label: string; color: string }> => ({
  nacrt: { label: t('common.nacrt'), color: 'bg-slate-100 text-slate-700 border-slate-200' },
  poslata: { label: t('common.poslata'), color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  zakazana: { label: t('common.zakazana'), color: 'bg-blue-50 text-blue-700 border-blue-200' },
  u_toku: { label: t('emailMarketing.inProgress'), color: 'bg-amber-50 text-amber-700 border-amber-200' },
  zavrsena: { label: t('common.zavrsena_mail'), color: 'bg-slate-100 text-slate-600 border-slate-300' },
});

export const getSubscriberStatuses = (t: (key: string) => string): Record<string, { label: string; color: string }> => ({
  aktivan: { label: t('common.aktivan_sub'), color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  neaktivan: { label: t('common.neaktivan'), color: 'bg-slate-100 text-slate-600 border-slate-200' },
  otkazan: { label: t('common.otkazan'), color: 'bg-red-50 text-red-700 border-red-200' },
});

export const getTemplateCategories = (t: (key: string) => string): Record<string, string> => ({
  promotivno: t('emailMarketing.promotional'),
  transakciono: t('emailMarketing.transactional'),
  obavestenje: t('emailMarketing.notification'),
});

export const { t } = useTranslation();

export const { tc, translateTexts } = useContentTranslation();

export const CAMPAIGN_STATUS = getCampaignStatuses(t);

export const [listsRes, subsRes, campsRes, tempsRes] = await Promise.all([
        fetch('/api/email-lists'),
        fetch('/api/email-subscribers'),
        fetch('/api/email-campaigns'),
        fetch('/api/email-templates'),
      ]);

export const texts: string[] = []

export const totalCampaigns = campaigns.length;

export const totalSubscribers = subscribers.filter(s => s.status === 'aktivan').length;

export const avgOpenRate = campaigns.length > 0;

export const activeLists = lists.filter(l => l._count && l._count.subscribers > 0).length;

export const stats = [
    { label: t('emailMarketing.totalCampaigns'), value: totalCampaigns, icon: Mail, color: 'text-emerald-600 bg-emerald-50' },
    { label: t('emailMarketing.totalSubscribers'), value: totalSubscribers, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: t('emailMarketing.avgOpenRate'), value: `${avgOpenRate.toFixed(1)}%`, icon: Eye, color: 'text-amber-600 bg-amber-50' },
    { label: t('emailMarketing.activeLists'), value: activeLists, icon: FileText, color: 'text-violet-600 bg-violet-50' },
  ]

export const { t } = useTranslation();

export const { tc } = useContentTranslation();

export const CAMPAIGN_STATUS = getCampaignStatuses(t);

export const handleDelete = async (id: string) => {
    if (!confirm(t('emailMarketing.confirmDeleteCampaign'))) return
    try {
      await fetch(`/api/email-campaigns/${id}`, { method: 'DELETE' })
      toast.success(t('emailMarketing.campaignDeleted'))
      onRefresh()
    } catch { toast.error(t('common.error')) }
  }

export const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/email-campaigns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, sentAt: status === 'poslata' ? new Date().toISOString() : undefined }),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.error')); return }
      toast.success(`${t('common.status')}: ${CAMPAIGN_STATUS[status]?.label || status}`)
      onRefresh()
    } catch { toast.error(t('common.error')) }
  }

export const handleDuplicate = async (campaign: EmailCampaign) => {
    try {
      const res = await fetch('/api/email-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${campaign.name} ${t('emailMarketing.copy')}`,
          subject: campaign.subject,
          preheader: campaign.preheader,
          content: campaign.content,
          listId: campaign.listId,
          status: 'nacrt',
        }),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.error')); return }
      toast.success(t('emailMarketing.campaignDuplicated'))
      onRefresh()
    } catch { toast.error(t('common.error')) }
  }

export const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      name: fd.get('name') as string,
      subject: fd.get('subject') as string,
      preheader: (fd.get('preheader') as string) || null,
      content: fd.get('content') as string,
      listId: (fd.get('listId') as string) || null,
    }
    try {
      const url = editing ? `/api/email-campaigns/${editing.id}` : '/api/email-campaigns'
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.error')); return }
      toast.success(editing ? t('emailMarketing.campaignUpdated') : t('emailMarketing.campaignCreated'))
      setViewMode('list')
      setEditing(null)
      onRefresh()
    } catch { toast.error(t('common.error')) } finally { setSubmitting(false) }
  }

export const { t } = useTranslation();

export const SUBSCRIBER_STATUS = getSubscriberStatuses(t);

export const filtered = subscribers.filter(s => {
    if (filterList && filterList !== 'all' && s.listId !== filterList) return false
    if (filterStatus && filterStatus !== 'all' && s.status !== filterStatus) return false
    return true
  });

export const handleDelete = async (id: string) => {
    if (!confirm(t('emailMarketing.confirmDeleteSubscriber'))) return
    try {
      await fetch(`/api/email-subscribers/${id}`, { method: 'DELETE' })
      toast.success(t('emailMarketing.subscriberDeleted'))
      onRefresh()
    } catch { toast.error(t('common.error')) }
  }

export const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      email: fd.get('email') as string,
      firstName: (fd.get('firstName') as string) || null,
      lastName: (fd.get('lastName') as string) || null,
      listId: (fd.get('listId') as string) || null,
      source: 'ručno',
    }
    try {
      const url = editing ? `/api/email-subscribers/${editing.id}` : '/api/email-subscribers'
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.error')); return }
      toast.success(editing ? t('emailMarketing.subscriberUpdated') : t('emailMarketing.subscriberAdded'))
      setViewMode('list')
      setEditing(null)
      onRefresh()
    } catch { toast.error(t('common.error')) } finally { setSubmitting(false) }
  }

export const { t } = useTranslation();

export const handleDelete = async (id: string) => {
    if (!confirm(t('emailMarketing.confirmDeleteList'))) return
    try {
      await fetch(`/api/email-lists/${id}`, { method: 'DELETE' })
      toast.success(t('emailMarketing.listDeleted'))
      onRefresh()
    } catch { toast.error(t('common.error')) }
  }

export const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      name: fd.get('name') as string,
      description: (fd.get('description') as string) || null,
    }
    try {
      const url = editing ? `/api/email-lists/${editing.id}` : '/api/email-lists'
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.error')); return }
      toast.success(editing ? t('emailMarketing.listUpdated') : t('emailMarketing.listCreated'))
      setViewMode('list')
      setEditing(null)
      onRefresh()
    } catch { toast.error(t('common.error')) } finally { setSubmitting(false) }
  }

export const { t } = useTranslation();

export const TEMPLATE_CATEGORIES = getTemplateCategories(t);

export const handleDelete = async (id: string) => {
    if (!confirm(t('emailMarketing.confirmDeleteTemplate'))) return
    try {
      await fetch(`/api/email-templates/${id}`, { method: 'DELETE' })
      toast.success(t('emailMarketing.templateDeleted'))
      onRefresh()
    } catch { toast.error(t('common.error')) }
  }

export const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      name: fd.get('name') as string,
      subject: fd.get('subject') as string,
      content: fd.get('content') as string,
      category: (fd.get('category') as string) || null,
    }
    try {
      const url = editing ? `/api/email-templates/${editing.id}` : '/api/email-templates'
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || t('common.error')); return }
      toast.success(editing ? t('emailMarketing.templateUpdated') : t('emailMarketing.templateCreated'))
      setViewMode('list')
      setEditing(null)
      onRefresh()
    } catch { toast.error(t('common.error')) } finally { setSubmitting(false) }
  }

export const getCategoryColor = (cat: string | null) => {
    switch (cat) {
      case 'promotivno': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'transakciono': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'obavestenje': return 'bg-blue-50 text-blue-700 border-blue-200'
      default: return 'bg-slate-100 text-slate-600 border-slate-200'
    }
  }
