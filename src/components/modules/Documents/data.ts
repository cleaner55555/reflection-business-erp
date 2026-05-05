export const TYPE_LABELS: Record<string, string> = {
  faktura: 'Faktura', ugovor: 'Ugovor', ponuda: 'Ponuda', izvestaj: 'Izveštaj',
  predracun: 'Predračun', otpremnica: 'Otpremnica', rešenje: 'Rešenje',
  zahtev: 'Zahtev', obaveštenje: 'Obaveštenje', ostalo: 'Ostalo',
}

export const STATUS_LABELS: Record<string, string> = {
  aktivno: 'Aktivno', arhivirano: 'Arhivirano', nacrt: 'Nacrt',
  potrebno_potpisivanje: 'Potpisivanje', isteklo: 'Isteklo', obrisano: 'Obrisano',
}

export const STATUS_COLORS: Record<string, string> = {
  aktivno: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  arhivirano: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  nacrt: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  potrebno_potpisivanje: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  isteklo: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  obrisano: 'bg-gray-100 text-gray-400',
}

export const CATEGORIES = ['Fakture', 'Ugovori', 'Ponude', 'Izveštaji', 'Predračuni', 'Otpremnice', 'Rešenja', 'Zahtevi', 'Ostalo']

export const FILE_TYPE_ICONS: Record<string, React.ElementType> = {
  pdf: FileType2, doc: FileText, docx: FileText, xls: FileSpreadsheet,
  xlsx: FileSpreadsheet, csv: FileSpreadsheet, jpg: FileImage, jpeg: FileImage,
  png: FileImage, gif: FileImage, mp4: FileVideo, avi: FileVideo,
  mp3: FileAudio, wav: FileAudio, zip: Archive, rar: Archive,
}

export const DEFAULT_FOLDERS: Folder[] = [
  { id: 'f1', name: 'Fakture i računi', parentId: null, color: '#10b981', docCount: 0, createdAt: '2025-01-01' },
  { id: 'f2', name: 'Ugovori', parentId: null, color: '#3b82f6', docCount: 0, createdAt: '2025-01-01' },
  { id: 'f3', name: 'Ponude i predračuni', parentId: null, color: '#f59e0b', docCount: 0, createdAt: '2025-01-01' },
  { id: 'f4', name: 'Izveštaji', parentId: null, color: '#8b5cf6', docCount: 0, createdAt: '2025-01-01' },
  { id: 'f5', name: 'Ostalo', parentId: null, color: '#6b7280', docCount: 0, createdAt: '2025-01-01' },
]

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export const getFileIcon = (fileName: string | null): React.ElementType => {
  if (!fileName) return File
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  return FILE_TYPE_ICONS[ext] || File
}

export const getFileTypeColor = (fileName: string | null): string => {
  if (!fileName) return 'text-gray-400'
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  const colors: Record<string, string> = {
    pdf: 'text-red-500', doc: 'text-blue-500', docx: 'text-blue-500',
    xls: 'text-green-500', xlsx: 'text-green-500', csv: 'text-green-500',
    jpg: 'text-purple-500', jpeg: 'text-purple-500', png: 'text-purple-500',
    zip: 'text-amber-500', rar: 'text-amber-500',
  }
  return colors[ext] || 'text-gray-400'
}

export const daysUntilExpiry = (date: string | null): number | null => {
  if (!date) return null
  const diff = new Date(date).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export const Kpi = ({ label, value, icon: Icon, sub, color }: { label: string; value: string | number; icon: React.ElementType; sub?: string; color?: string }) => (
  <Card className="p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Icon className={`h-4 w-4 ${color || 'text-muted-foreground'}`} />
    </div>
    <p className="text-2xl font-bold">{value}</p>
    {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
  </Card>
);

export const { activeCompanyId } = useAppStore();

export const { t } = useTranslation();

export const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000) }

export const computeStats = (data: Doc[]) => {
    const total = data.length
    const active = data.filter(d => d.status === 'aktivno').length
    const archived = data.filter(d => d.status === 'arhivirano').length
    const drafts = data.filter(d => d.status === 'nacrt').length
    const needsSign = data.filter(d => d.status === 'potrebno_potpisivanje').length
    const totalSize = data.reduce((sum, d) => sum + (d.fileSize || 0), 0)

    // Category breakdown
    const categoryMap: Record<string, number> = {}
    data.forEach(d => {
      const cat = d.category || 'Nekategorizovano'
      categoryMap[cat] = (categoryMap[cat] || 0) + 1
    })

    // Type breakdown
    const typeMap: Record<string, number> = {}
    data.forEach(d => {
      const typ = d.type || 'Nedefinisano'
      typeMap[typ] = (typeMap[typ] || 0) + 1
    })

    // Expiring docs
    const expiring = data
      .filter(d => d.expiresAt)
      .map(d => ({ ...d, daysLeft: daysUntilExpiry(d.expiresAt)! }))
      .filter(d => d.daysLeft <= 30 && d.daysLeft >= 0)
      .sort((a, b) => a.daysLeft - b.daysLeft)

    // Recent docs
    const recent = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)

    // Storage by month
    const monthMap: Record<string, number> = {}
    data.forEach(d => {
      const month = new Date(d.createdAt).toLocaleDateString('sr-RS', { year: 'numeric', month: 'short' })
      monthMap[month] = (monthMap[month] || 0) + 1
    })

    setStats({
      total, active, archived, drafts, needsSign, totalSize,
      categoryMap, typeMap, expiring, recent, monthMap,
    })
  }

export const params = new URLSearchParams();

export const res = await fetch(`/api/documents?${params}`);

export const data = await res.json();

export const folder = folders.find(f => f.id === selectedFolder);

export const q = searchQuery.toLowerCase();

export const openNewDoc = () => {
    setEditingDoc(null)
    setDocForm({ title: '', type: '', category: '', fileName: '', notes: '', expiresAt: '', folder: selectedFolder || '', tags: '', status: 'aktivno' })
    setDocDialogOpen(true)
  }

export const openEditDoc = (doc: Doc) => {
    setEditingDoc(doc)
    setDocForm({
      title: doc.title || '', type: doc.type || '', category: doc.category || '',
      fileName: doc.fileName || '', notes: doc.notes || '',
      expiresAt: doc.expiresAt?.split('T')[0] || '',
      folder: doc.folder || '', tags: doc.tags || '', status: doc.status || 'aktivno',
    })
    setDocDialogOpen(true)
  }

export const handleSubmitDoc = async () => {
    if (!docForm.title.trim()) { showToast('Naslov je obavezan'); return }
    setSubmitting(true)
    try {
      const body = {
        title: docForm.title, type: docForm.type || null, category: docForm.category || null,
        fileName: docForm.fileName || null, notes: docForm.notes || null,
        expiresAt: docForm.expiresAt || null, folder: docForm.folder || null,
        tags: docForm.tags, status: docForm.status,
      }
      const url = editingDoc ? `/api/documents/${editingDoc.id}` : '/api/documents'
      const res = await fetch(url, {
        method: editingDoc ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setDocDialogOpen(false)
        loadDocs()
        showToast(editingDoc ? 'Dokument ažuriran' : 'Dokument kreiran')
      }
    } catch { showToast('Greška') }
    setSubmitting(false)
  }

export const handleDeleteDoc = async () => {
    if (!selectedDoc) return
    try {
      await fetch(`/api/documents/${selectedDoc.id}`, { method: 'DELETE' })
      setDeleteConfirmOpen(false)
      setSelectedDoc(null)
      loadDocs()
      showToast('Dokument obrisan')
    } catch { showToast('Greška') }
  }

export const handleStatusChange = async (doc: Doc, status: string) => {
    try {
      await fetch(`/api/documents/${doc.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      loadDocs()
      showToast(`Status: ${STATUS_LABELS[status] || status}`)
    } catch { showToast('Greška') }
  }

export const handleCreateFolder = () => {
    if (!folderForm.name.trim()) { showToast('Naziv je obavezan'); return }
    const newFolder: Folder = {
      id: `f${Date.now()}`,
      name: folderForm.name,
      parentId: folderForm.parentId || null,
      color: folderForm.color,
      docCount: 0,
      createdAt: new Date().toISOString(),
    }
    setFolders([...folders, newFolder])
    setFolderDialogOpen(false)
    setFolderForm({ name: '', color: '#10b981', parentId: '' })
    showToast('Fascikla kreirana')
  }

export const dir = sortBy === 'date' && sortDir === 'desc' ? 'asc' : 'desc';

export const FileIcon = getFileIcon(doc.fileName);

export const days = daysUntilExpiry(doc.expiresAt);

export const FileIcon = getFileIcon(doc.fileName);

export const days = daysUntilExpiry(doc.expiresAt);

export const folderDocs = docs.filter(d => d.category === folder.name || d.folder === folder.name);

export const max = Math.max(...Object.values(stats.categoryMap), 1);

export const count = docs.filter(d => d.status === status).length;

export const FileIcon = getFileIcon(doc.fileName);

export const max = Math.max(...Object.values(stats.monthMap) as number[], 1);
