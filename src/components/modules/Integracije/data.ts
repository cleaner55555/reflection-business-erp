export const CONNECTOR_TYPES: Record<string, string> = {
  external_accounting_1: 'Spoljni knjigovodstveni sistem 1',
  external_accounting_2: 'Spoljni knjigovodstveni sistem 2',
  external_accounting_3: 'Spoljni knjigovodstveni sistem 3',
  einvoice_system: 'eFakturisanje (SEF)',
  enterprise_erp: 'Enterprise ERP',
  external_accounting_4: 'Spoljni knjigovodstveni sistem 4',
  custom_api: 'Custom API',
}

export const ENTITY_OPTIONS = [
  { value: 'partners', label: 'Partners' },
  { value: 'products', label: 'Products' },
  { value: 'transactions', label: 'Transactions' },
  { value: 'contacts', label: 'Contacts' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'stock', label: 'Stock' },
  { value: 'employees', label: 'Employees' },
]

export const ENTITY_FIELDS: Record<EntityType, EntityField[]> = {
  partners: [
    { key: 'name', label: 'Name (naziv)', required: true },
    { key: 'pib', label: 'PIB', required: false },
    { key: 'maticniBr', label: 'Matični broj', required: false },
    { key: 'address', label: 'Address', required: false },
    { key: 'city', label: 'City', required: false },
    { key: 'zipCode', label: 'Zip code', required: false },
    { key: 'phone', label: 'Phone', required: false },
    { key: 'email', label: 'Email', required: false },
    { key: 'type', label: 'Type (kupac/dobavljac)', required: false },
    { key: 'account', label: 'Bank account', required: false },
    { key: 'bank', label: 'Bank', required: false },
    { key: 'notes', label: 'Notes', required: false },
  ],
  products: [
    { key: 'name', label: 'Name (naziv)', required: true },
    { key: 'sku', label: 'SKU (šifra)', required: true },
    { key: 'barcode', label: 'Barcode', required: false },
    { key: 'category', label: 'Category', required: false },
    { key: 'unit', label: 'Unit (kom/kg/l)', required: false },
    { key: 'purchasePrice', label: 'Purchase price', required: false },
    { key: 'sellingPrice', label: 'Selling price', required: false },
    { key: 'minStock', label: 'Min stock', required: false },
    { key: 'currentStock', label: 'Current stock', required: false },
    { key: 'description', label: 'Description', required: false },
  ],
  transactions: [
    { key: 'date', label: 'Date', required: true },
    { key: 'type', label: 'Type (prihod/rashod)', required: true },
    { key: 'category', label: 'Category', required: true },
    { key: 'amount', label: 'Amount', required: true },
    { key: 'description', label: 'Description', required: true },
    { key: 'documentRef', label: 'Document ref', required: false },
  ],
  contacts: [
    { key: 'firstName', label: 'First name', required: true },
    { key: 'lastName', label: 'Last name', required: true },
    { key: 'email', label: 'Email', required: false },
    { key: 'phone', label: 'Phone', required: false },
    { key: 'position', label: 'Position', required: false },
    { key: 'company', label: 'Company', required: false },
    { key: 'notes', label: 'Notes', required: false },
    { key: 'tags', label: 'Tags', required: false },
  ],
}

export const { t } = useTranslation();

export const { t } = useTranslation();

export const res = await fetch('/api/integrations/connectors');

export const resetForm = () => {
    setFormName('')
    setFormType('external_accounting_1')
    setFormDirection('import')
    setFormHostUrl('')
    setFormApiKey('')
    setFormUsername('')
    setFormPassword('')
    setFormDatabase('')
    setFormInterval(60)
    setFormEntities(['partners', 'products'])
    setFormNotes('')
    setEditingId(null)
  }

export const handleAdd = () => { resetForm(); setViewMode('form') }

export const handleEdit = (c: SyncConnector) => {
    setEditingId(c.id)
    setFormName(c.name)
    setFormType(c.type)
    setFormDirection(c.direction)
    setFormHostUrl(c.hostUrl || '')
    setFormApiKey(c.apiKey || '')
    setFormUsername(c.username || '')
    setFormPassword('')
    setFormDatabase(c.database || '')
    setFormInterval(c.syncInterval)
    setFormEntities(JSON.parse(c.syncEntities || '[]'))
    setFormNotes(c.notes || '')
    setViewMode('form')
  }

export const handleSave = async () => {
    if (!formName.trim()) { toast.error(t('common.requiredField', 'Name')); return }
    if (formEntities.length === 0) { toast.error('Select at least one entity'); return }
    setSaving(true)
    try {
      const body = {
        name: formName,
        type: formType,
        direction: formDirection,
        hostUrl: formHostUrl || null,
        apiKey: formApiKey || null,
        username: formUsername || null,
        password: formPassword || null,
        database: formDatabase || null,
        syncInterval: formInterval,
        syncEntities: JSON.stringify(formEntities),
        notes: formNotes || null,
      }
      const url = editingId ? `/api/integrations/connectors/${editingId}` : '/api/integrations/connectors'
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast.success(t('integrations.connectorSaved'))
        resetForm()
        setViewMode('list')
        fetchConnectors()
      } else {
        const err = await res.json()
        toast.error(err.error || t('common.error'))
      }
    } catch { toast.error(t('common.error')) } finally { setSaving(false) }
  }

export const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirmDelete'))) return
    try {
      const res = await fetch(`/api/integrations/connectors/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success(t('integrations.connectorDeleted'))
        fetchConnectors()
      }
    } catch { toast.error(t('common.deleteError')) }
  }

export const handleTest = async (id: string) => {
    setTesting(id)
    try {
      const res = await fetch(`/api/integrations/connectors/${id}/test`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        toast.success(`${t('integrations.testSuccess')} (${data.latency}${t('integrations.latencyMs')})`)
      } else {
        toast.error(t('integrations.testFailed'))
      }
      fetchConnectors()
    } catch { toast.error(t('common.error')) } finally { setTesting(null) }
  }

export const handleSync = async (id: string) => {
    setSyncing(id)
    try {
      const res = await fetch(`/api/integrations/connectors/${id}/sync`, { method: 'POST' })
      if (res.ok) {
        toast.success(t('integrations.syncCompleted'))
        fetchConnectors()
      } else {
        toast.error(t('integrations.syncFailed'))
      }
    } catch { toast.error(t('integrations.syncFailed')) } finally { setSyncing(null) }
  }

export const toggleActive = async (connector: SyncConnector) => {
    const newActive = !connector.isActive
    const newStatus = newActive ? 'connected' : 'disconnected'
    try {
      const res = await fetch(`/api/integrations/connectors/${connector.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newActive, status: newStatus }),
      })
      if (res.ok) fetchConnectors()
    } catch { /* silent */ }
  }

export const toggleEntity = (entity: string) => {
    setFormEntities(prev =>
      prev.includes(entity) ? prev.filter(e => e !== entity) : [...prev, entity]
    )
  }

export const statusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-emerald-500'
      case 'syncing': return 'bg-blue-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

export const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleString('sr-RS', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

export const getNextSync = (connector: SyncConnector) => {
    if (!connector.isActive || connector.status !== 'connected') return '—'
    const last = connector.lastSyncAt ? new Date(connector.lastSyncAt).getTime() : 0
    const next = new Date(last + connector.syncInterval * 60 * 1000)
    return next.toLocaleString('sr-RS', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

export const { t } = useTranslation();

export const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error(t('integrations.supportedFormats'))
      return
    }
    setParsing(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/integrations/parse-csv', {
        method: 'POST',
        body: fd,
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('integrations.parsingError'))
        return
      }
      const data: ParsedFile = await res.json()
      setParsedFile(data)
      toast.success(
        `${t('integrations.fileParsed')}: ${data.totalRows} ${t('integrations.rowsFound')}, ${data.columns.length} ${t('integrations.columnsFound')}`
      )
      setStep(2)
    } catch {
      toast.error(t('integrations.parsingError'))
    } finally {
      setParsing(false)
    }
  }

export const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }

export const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileUpload(file)
  }

export const handleAutoMap = async () => {
    if (!parsedFile) return
    setAutoMapping(true)
    try {
      const res = await fetch('/api/integrations/ai-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          columns: parsedFile.columns,
          entityType,
        }),
      })
      if (!res.ok) {
        toast.error(t('common.error'))
        return
      }
      const data = await res.json()
      if (data.mapping) {
        setMapping(data.mapping)
        toast.success(t('integrations.autoMap'))
      }
    } catch {
      toast.error(t('common.error'))
    } finally {
      setAutoMapping(false)
    }
  }

export const handlePreview = () => {
    if (!parsedFile) return
    const preview = parsedFile.rows.slice(0, 10)
    setPreviewData(preview)
    setImportResult(null)
    setStep(3)
  }

export const handleStartImport = async () => {
    if (!parsedFile) return
    setImporting(true)
    setImportResult(null)
    try {
      const res = await fetch('/api/integrations/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          source,
          mapping,
          rows: parsedFile.rows,
          options: { skipDuplicates, updateExisting },
          fileName: parsedFile.fileName,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('integrations.importFailed'))
        setImportResult({ totalRows: 0, successRows: 0, failedRows: 0, status: 'failed', errors: [] })
        return
      }
      const data = await res.json()
      const result: ImportResult = {
        totalRows: data.summary?.totalRows ?? 0,
        successRows: data.summary?.successRows ?? 0,
        failedRows: data.summary?.failedRows ?? 0,
        status: data.summary?.status ?? 'failed',
        errors: data.errors ?? [],
      }
      setImportResult(result)
      if (result.status === 'completed') {
        toast.success(t('integrations.importSuccess'))
      } else if (result.status === 'partial') {
        toast.warning(t('integrations.importPartial'))
      } else {
        toast.error(t('integrations.importFailed'))
      }
    } catch {
      toast.error(t('integrations.importFailed'))
    } finally {
      setImporting(false)
    }
  }

export const handleBack = () => {
    if (step === 3) {
      setStep(2)
      setImportResult(null)
      setPreviewData([])
    } else if (step === 2) {
      setStep(1)
      setParsedFile(null)
      setMapping({})
    }
  }

export const handleReset = () => {
    setStep(1)
    setParsedFile(null)
    setEntityType('partners')
    setSource('custom')
    setMapping({})
    setPreviewData([])
    setSkipDuplicates(true)
    setUpdateExisting(false)
    setImportResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

export const steps = [
    { num: 1, label: t('integrations.step1') },
    { num: 2, label: t('integrations.step2') },
    { num: 3, label: t('integrations.step3') },
  ]

export const entityFields = ENTITY_FIELDS[entityType]

export const csvColKey = Object.entries(mapping).find(([, v]) => v === f.key)?.[0] || '';

export const value = row[csvColKey]

export const { t } = useTranslation();

export const entityFields = ENTITY_FIELDS[entityType]

export const required = entityFields.filter((f) => f.required).map((f) => f.key);

export const toggleColumn = (key: string) => {
    setSelectedColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

export const selectAll = () => {
    setSelectedColumns(entityFields.map((f) => f.key))
  }

export const deselectAll = () => {
    setSelectedColumns([])
  }

export const handleExport = async () => {
    if (selectedColumns.length === 0) {
      toast.error(t('integrations.selectAtLeast'))
      return
    }
    setExporting(true)
    try {
      const res = await fetch('/api/integrations/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          columns: selectedColumns,
          includeHeaders,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || t('common.error'))
        return
      }
      // Download the CSV
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${entityType}_export_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success(t('integrations.exportSuccess'))
    } catch {
      toast.error(t('common.error'))
    } finally {
      setExporting(false)
    }
  }

export const { t } = useTranslation();

export const res = await fetch('/api/integrations/jobs');

export const data = await res.json();

export const handleDeleteJob = async (id: string) => {
    if (!confirm(t('common.confirmDelete'))) return
    setDeleting(id)
    try {
      const res = await fetch('/api/integrations/jobs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      })
      if (res.ok) {
        setJobs((prev) => prev.filter((j) => j.id !== id))
        toast.success(t('integrations.deleteJob'))
      }
    } catch {
      toast.error(t('common.deleteError'))
    } finally {
      setDeleting(null)
    }
  }

export const handleClearHistory = async () => {
    if (!confirm(t('integrations.clearHistory'))) return
    setClearing(true)
    try {
      const res = await fetch('/api/integrations/jobs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: jobs.map((j) => j.id) }),
      })
      if (res.ok) {
        setJobs([])
        toast.success(t('integrations.clearHistory'))
      }
    } catch {
      toast.error(t('common.deleteError'))
    } finally {
      setClearing(false)
    }
  }

export const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
    completed: {
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    partial: {
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: <AlertCircle className="h-3 w-3" />,
    },
    failed: {
      color: 'bg-red-50 text-red-700 border-red-200',
      icon: <X className="h-3 w-3" />,
    },
    processing: {
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
    },
    pending: {
      color: 'bg-gray-50 text-gray-600 border-gray-200',
      icon: <Clock className="h-3 w-3" />,
    },
  }

export const cfg = statusConfig[job.status]
