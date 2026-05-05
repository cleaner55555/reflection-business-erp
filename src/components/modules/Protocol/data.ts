export const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  primljen: { label: 'Primljen', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  u_radu: { label: 'U radu', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  završen: { label: 'Završen', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  proslijeđen: { label: 'Proslijeđen', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  odgovoren: { label: 'Odgovoren', className: 'bg-green-50 text-green-700 border-green-200' },
}

export const PRIORITY_CONFIG: Record<string, { label: string; className: string }> = {
  nizak: { label: 'Nizak', className: 'bg-muted text-muted-foreground' },
  srednji: { label: 'Srednji', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  visok: { label: 'Visok', className: 'bg-orange-50 text-orange-600 border-orange-200' },
  hitan: { label: 'Hitan', className: 'bg-red-50 text-red-600 border-red-200' },
}

export const DOC_TYPES: Record<string, string> = {
  pismo: 'Pismo',
  ugovor: 'Ugovor',
  ponuda: 'Ponuda',
  račun: 'Račun',
  rešenje: 'Rešenje',
  ostalo: 'Ostalo',
}

export const EMPTY_FORM: FormData = {
  direction: 'ulaz',
  sender: '',
  recipient: '',
  subject: '',
  description: '',
  documentType: '',
  dueDate: '',
  responsible: '',
  status: 'primljen',
  priority: 'srednji',
  notes: '',
}

export const { t } = useTranslation();

export const { tc, translateTexts } = useContentTranslation();

export const params = new URLSearchParams();

export const res = await fetch(`/api/protocol?${params.toString()}`);

export const data = await res.json();

export const totalCount = entries.length;

export const ulazniCount = entries.filter(e => e.direction === 'ulaz').length;

export const izlazniCount = entries.filter(e => e.direction === 'izlaz').length;

export const hitniCount = entries.filter(e => e.priority === 'hitan').length;

export const filtered = entries.filter(e => {
    if (filterStatus !== 'all' && e.status !== filterStatus) return false
    if (filterPriority !== 'all' && e.priority !== filterPriority) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        e.subject.toLowerCase().includes(q) ||
        (e.sender || '').toLowerCase().includes(q) ||
        (e.recipient || '').toLowerCase().includes(q) ||
        e.number.toLowerCase().includes(q) ||
        (e.responsible || '').toLowerCase().includes(q)
      )
    }
    return true
  });

export const openCreate = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM, direction: activeTab === 'izlaz' ? 'izlaz' : 'ulaz' })
    setViewMode('form')
  }

export const openEdit = (entry: ProtocolEntry) => {
    setEditing(entry)
    setForm({
      direction: entry.direction,
      sender: entry.sender || '',
      recipient: entry.recipient || '',
      subject: entry.subject,
      description: entry.description || '',
      documentType: entry.documentType || '',
      dueDate: entry.dueDate ? entry.dueDate.split('T')[0] : '',
      responsible: entry.responsible || '',
      status: entry.status,
      priority: entry.priority,
      notes: entry.notes || '',
    })
    setViewMode('form')
  }

export const handleCancel = () => {
    setViewMode('list')
    setEditing(null)
    setForm({ ...EMPTY_FORM })
  }

export const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.subject.trim()) {
      toast.error('Predmet je obavezan')
      return
    }
    setSubmitting(true)
    try {
      const body = {
        ...form,
        dueDate: form.dueDate || null,
      }
      const url = editing ? `/api/protocol/${editing.id}` : '/api/protocol'
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error()
      toast.success(editing ? 'Dopis ažuriran' : 'Dopis kreiran')
      handleCancel()
      fetchEntries()
    } catch {
      toast.error('Greška pri čuvanju')
    } finally {
      setSubmitting(false)
    }
  }

export const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/protocol/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Dopis obrisan')
      setDeleteTarget(null)
      fetchEntries()
    } catch {
      toast.error('Greška pri brisanju')
    } finally {
      setDeleting(false)
    }
  }

export const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

export const statusBadge = (status: string) => {
    const cfg = STATUS_CONFIG[status]
    if (!cfg) return <Badge variant="outline" className="text-[10px]">{status}</Badge>
    return <Badge variant="outline" className={`text-[10px] ${cfg.className}`}>{cfg.label}</Badge>
  }

export const priorityBadge = (priority: string) => {
    const cfg = PRIORITY_CONFIG[priority]
    if (!cfg) return <Badge variant="secondary" className="text-[10px]">{priority}</Badge>
    return <Badge variant="secondary" className={`text-[10px] ${cfg.className}`}>{cfg.label}</Badge>
  }

export const statsCards = [
    { label: t('common.total'), value: totalCount, icon: FileCheck, color: 'text-slate-600 bg-slate-50' },
    { label: t('protocol.incoming'), value: ulazniCount, icon: Inbox, color: 'text-blue-600 bg-blue-50' },
    { label: t('protocol.outgoing'), value: izlazniCount, icon: Send, color: 'text-emerald-600 bg-emerald-50' },
    { label: t('protocol.urgent'), value: hitniCount, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
  ]
