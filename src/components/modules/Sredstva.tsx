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
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { formatRSD, formatDate, getStatusColor } from '@/lib/helpers'
import { useTranslation, useContentTranslation } from '@/lib/i18n'

interface Asset {
  id: string; name: string; category: string | null; serialNumber: string | null
  purchaseDate: string; purchasePrice: number; currentValue: number; depreciation: number
  usefulLife: number; location: string | null; status: string; notes: string | null; createdAt: string
}

const STATUS_LABELS: Record<string, string> = { aktivno: 'Aktivno', na_popravci: 'Na popravci', izvan_upotrebe: 'Izvan upotrebe', prodato: 'Prodato', otpisano: 'Otpisano' }

export function Sredstva() {
  const { t } = useTranslation()
  const { tc, translateTexts } = useContentTranslation()
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list')
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<Asset | null>(null)

  const fetchAssets = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/assets')
    setAssets(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchAssets() }, [fetchAssets])

  useEffect(() => {
    if (assets.length > 0) {
      translateTexts(assets.flatMap(a => [a.name, a.category, a.location].filter(Boolean)))
    }
  }, [assets])

  const handleNew = () => {
    setEditing(null)
    setViewMode('form')
  }

  const handleEdit = (item: Asset) => {
    setEditing(item)
    setViewMode('form')
  }

  const handleCancel = () => {
    setViewMode('list')
    setEditing(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('assets.confirmDelete'))) return
    try { await fetch(`/api/assets/${id}`, { method: 'DELETE' }); toast.success(t('common.deleteSuccess')); fetchAssets() } catch { toast.error(t('common.error')) }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = { name: fd.get('name'), category: fd.get('category'), serialNumber: fd.get('serialNumber'), purchaseDate: fd.get('purchaseDate'), purchasePrice: fd.get('purchasePrice'), currentValue: fd.get('currentValue'), usefulLife: fd.get('usefulLife'), location: fd.get('location'), status: fd.get('status'), notes: fd.get('notes') }
    try {
      const url = editing ? `/api/assets/${editing.id}` : '/api/assets'
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { toast.error(t('common.error')); return }
      toast.success(editing ? t('common.updated') : t('common.created')); setViewMode('list'); setEditing(null); fetchAssets()
    } catch { toast.error(t('common.error')) } finally { setSubmitting(false) }
  }

  const totalValue = assets.reduce((s, a) => s + a.currentValue, 0)
  const totalDep = assets.reduce((s, a) => s + a.depreciation, 0)
  const activeCount = assets.filter(a => a.status === 'aktivno').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('assets.title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t('assets.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4"><p className="text-xs text-muted-foreground">{t('assets.currentValue')}</p><p className="text-lg font-bold">{formatRSD(totalValue)}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">{t('assets.totalDepreciation')}</p><p className="text-lg font-bold text-red-600">{formatRSD(totalDep)}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">{t('assets.activeAssets')}</p><p className="text-lg font-bold">{activeCount}</p></Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          {viewMode === 'form' ? (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleCancel}><ArrowLeft className="h-4 w-4" /></Button>
              <div>
                <CardTitle className="text-base font-semibold">{editing ? t('common.edit') : t('common.new')} {t('assets.asset')}</CardTitle>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base font-semibold">{t('assets.allAssets')}</CardTitle>
              <Button size="sm" className="gap-2" onClick={handleNew}><Plus className="h-4 w-4" /> {t('common.new')} {t('assets.asset')}</Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {viewMode === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-4" key={editing?.id || 'new'}>
              <div className="space-y-2"><Label className="text-xs">{t('assets.assetName')} *</Label><Input name="name" defaultValue={editing?.name || ''} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="text-xs">{t('common.category')}</Label>
                  <Select name="category" defaultValue={editing?.category || ''}><SelectTrigger><SelectValue placeholder={t('common.select')} /></SelectTrigger><SelectContent>
                    <SelectItem value="IT oprema">IT oprema</SelectItem><SelectItem value="vozila">Vozila</SelectItem><SelectItem value="uređaj">Uređaj</SelectItem><SelectItem value="nameštaj">Nameštaj</SelectItem><SelectItem value="alat">Alat</SelectItem><SelectItem value="ostalo">Ostalo</SelectItem>
                  </SelectContent></Select>
                </div>
                <div className="space-y-2"><Label className="text-xs">{t('assets.serialNumber')}</Label><Input name="serialNumber" defaultValue={editing?.serialNumber || ''} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="text-xs">{t('assets.purchaseDate')}</Label><Input name="purchaseDate" type="date" defaultValue={editing?.purchaseDate?.split('T')[0] || ''} /></div>
                <div className="space-y-2"><Label className="text-xs">{t('assets.location')}</Label><Input name="location" defaultValue={editing?.location || ''} /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label className="text-xs">{t('assets.acquisitionValue')}</Label><Input name="purchasePrice" type="number" step="0.01" defaultValue={editing?.purchasePrice || ''} /></div>
                <div className="space-y-2"><Label className="text-xs">{t('assets.currentValue')}</Label><Input name="currentValue" type="number" step="0.01" defaultValue={editing?.currentValue || ''} /></div>
                <div className="space-y-2"><Label className="text-xs">{t('assets.usefulLife')}</Label><Input name="usefulLife" type="number" defaultValue={editing?.usefulLife || '60'} /></div>
              </div>
              <div className="space-y-2"><Label className="text-xs">{t('common.status')}</Label>
                <Select name="status" defaultValue={editing?.status || 'aktivno'}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="aktivno">{t('assets.statusActive')}</SelectItem><SelectItem value="na_popravci">{t('assets.statusRepair')}</SelectItem><SelectItem value="izvan_upotrebe">{t('assets.statusOutOfUse')}</SelectItem><SelectItem value="prodato">{t('assets.statusSold')}</SelectItem><SelectItem value="otpisano">{t('assets.statusWrittenOff')}</SelectItem>
                </SelectContent></Select>
              </div>
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
                <TableHead className="text-xs">{t('common.name')}</TableHead><TableHead className="text-xs">{t('common.category')}</TableHead><TableHead className="text-xs">{t('assets.serialNumber')}</TableHead><TableHead className="text-xs text-right">{t('assets.acquisitionValue')}</TableHead><TableHead className="text-xs text-right">{t('assets.currentValue')}</TableHead><TableHead className="text-xs">{t('common.status')}</TableHead><TableHead className="text-xs w-[80px]">{t('common.actions')}</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {assets.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="text-xs font-medium">{tc(a.name)}</TableCell>
                    <TableCell className="text-xs">{tc(a.category) || '-'}</TableCell>
                    <TableCell className="text-xs font-mono">{a.serialNumber || '-'}</TableCell>
                    <TableCell className="text-xs text-right">{formatRSD(a.purchasePrice)}</TableCell>
                    <TableCell className="text-xs text-right font-medium">{formatRSD(a.currentValue)}</TableCell>
                    <TableCell><Badge variant="outline" className={`text-[10px] ${getStatusColor(a.status)}`}>{STATUS_LABELS[a.status] || a.status}</Badge></TableCell>
                    <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(a)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(a.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div></TableCell>
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
