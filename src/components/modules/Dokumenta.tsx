'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Pencil, Trash2, FileText, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate, getStatusColor } from '@/lib/helpers'
import { useTranslation } from '@/lib/i18n'

interface Doc {
  id: string; title: string; category: string | null; type: string | null; fileName: string | null
  fileSize: number; status: string; partnerId: string | null; expiresAt: string | null; notes: string | null; createdAt: string
  partner?: { id: string; name: string } | null
}

const TYPE_LABELS: Record<string, string> = { faktura: 'Faktura', ugovor: 'Ugovor', ponuda: 'Ponuda', izvestaj: 'Izveštaj', ostalo: 'Ostalo' }

export function Dokumenta() {
  const { t } = useTranslation()
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list')
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<Doc | null>(null)

  const fetchDocs = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/documents')
    setDocs(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchDocs() }, [fetchDocs])

  const handleNew = () => {
    setEditing(null)
    setViewMode('form')
  }

  const handleEdit = (item: Doc) => {
    setEditing(item)
    setViewMode('form')
  }

  const handleCancel = () => {
    setViewMode('list')
    setEditing(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('documents.confirmDelete'))) return
    try { await fetch(`/api/documents/${id}`, { method: 'DELETE' }); toast.success(t('common.deleteSuccess')); fetchDocs() } catch { toast.error(t('common.error')) }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = { title: fd.get('title'), category: fd.get('category'), type: fd.get('type'), fileName: fd.get('fileName'), notes: fd.get('notes'), expiresAt: fd.get('expiresAt') || null }
    try {
      const url = editing ? `/api/documents/${editing.id}` : '/api/documents'
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { toast.error(t('common.error')); return }
      toast.success(editing ? t('common.updated') : t('common.created')); setViewMode('list'); setEditing(null); fetchDocs()
    } catch { toast.error(t('common.error')) } finally { setSubmitting(false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('documents.title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t('documents.subtitle')}</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          {viewMode === 'form' ? (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleCancel}><ArrowLeft className="h-4 w-4" /></Button>
              <div>
                <CardTitle className="text-base font-semibold">{editing ? t('common.edit') : t('common.new')} {t('documents.document')}</CardTitle>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div><CardTitle className="text-base font-semibold">{t('documents.title')}</CardTitle><p className="text-xs text-muted-foreground mt-0.5">{docs.length} {t('documents.documentsCount')}</p></div>
              <Button size="sm" className="gap-2" onClick={handleNew}><Plus className="h-4 w-4" /> {t('common.new')} {t('documents.document')}</Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {viewMode === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-4" key={editing?.id || 'new'}>
              <div className="space-y-2"><Label className="text-xs">{t('documents.documentName')} *</Label><Input name="title" defaultValue={editing?.title || ''} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="text-xs">{t('documents.documentType')}</Label>
                  <Select name="type" defaultValue={editing?.type || ''}><SelectTrigger><SelectValue placeholder={t('common.select')} /></SelectTrigger><SelectContent>
                    <SelectItem value="faktura">{t('documents.typeInvoice')}</SelectItem><SelectItem value="ugovor">{t('documents.typeContract')}</SelectItem><SelectItem value="ponuda">{t('documents.typeOffer')}</SelectItem><SelectItem value="izvestaj">{t('documents.typeReport')}</SelectItem><SelectItem value="ostalo">{t('documents.typeOther')}</SelectItem>
                  </SelectContent></Select>
                </div>
                <div className="space-y-2"><Label className="text-xs">{t('common.category')}</Label><Input name="category" defaultValue={editing?.category || ''} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="text-xs">{t('documents.file')}</Label><Input name="fileName" defaultValue={editing?.fileName || ''} /></div>
                <div className="space-y-2"><Label className="text-xs">{t('documents.expires')}</Label><Input name="expiresAt" type="date" defaultValue={editing?.expiresAt?.split('T')[0] || ''} /></div>
              </div>
              <div className="space-y-2"><Label className="text-xs">{t('documents.notes')}</Label><Input name="notes" defaultValue={editing?.notes || ''} /></div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={handleCancel}>{t('common.cancel')}</Button>
                <Button type="submit" className="flex-1" disabled={submitting}>{submitting ? t('common.saving') : t('common.save')}</Button>
              </div>
            </form>
          ) : loading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto">
              <Table><TableHeader><TableRow>
                <TableHead className="text-xs">{t('documents.documentName')}</TableHead><TableHead className="text-xs">{t('common.type')}</TableHead><TableHead className="text-xs">{t('common.category')}</TableHead><TableHead className="text-xs">{t('common.date')}</TableHead><TableHead className="text-xs">{t('documents.expires')}</TableHead><TableHead className="text-xs">{t('common.status')}</TableHead><TableHead className="text-xs w-[80px]">{t('common.actions')}</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {docs.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">{t('documents.noDocuments')}</TableCell></TableRow> : docs.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="text-xs font-medium flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-muted-foreground" />{d.title}</TableCell>
                    <TableCell className="text-xs"><Badge variant="secondary" className="text-[10px]">{TYPE_LABELS[d.type || ''] || d.type || '-'}</Badge></TableCell>
                    <TableCell className="text-xs">{d.category || '-'}</TableCell>
                    <TableCell className="text-xs">{formatDate(d.createdAt)}</TableCell>
                    <TableCell className="text-xs">{d.expiresAt ? formatDate(d.expiresAt) : '-'}</TableCell>
                    <TableCell><Badge variant="outline" className={`text-[10px] ${getStatusColor(d.status)}`}>{d.status}</Badge></TableCell>
                    <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(d)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(d.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div></TableCell>
                  </TableRow>
                ))}
              </TableBody></Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
