'use client'
import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Star } from 'lucide-react'
import { toast } from 'sonner'
import type { Review } from './types'
import { INITIAL_DATA, STATUSES } from './data'
import { KpiCards, ReviewsList, AnalyticsTab, DetailDialog, ResponseDialog } from './components'

export function Recenzije() {
  const [data, setData] = useState<Review[]>(INITIAL_DATA)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [responseDialogId, setResponseDialogId] = useState<string | null>(null)
  const [responseText, setResponseText] = useState('')
  const [activeTab, setActiveTab] = useState('reviews')

  useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 200) }, [])

  const filtered = useMemo(() => data.filter(item => {
    const matchSearch = !search || item.customerName.toLowerCase().includes(search.toLowerCase()) || item.productName.toLowerCase().includes(search.toLowerCase()) || item.title.toLowerCase().includes(search.toLowerCase()) || item.content.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchRating = !ratingFilter || item.rating === Number(ratingFilter)
    const matchSource = !sourceFilter || item.source === sourceFilter
    return matchSearch && matchStatus && matchRating && matchSource
  }), [data, search, statusFilter, ratingFilter, sourceFilter])

  const stats = useMemo(() => ({
    total: data.length, avgRating: (data.reduce((s, d) => s + d.rating, 0) / data.length).toFixed(1),
    pending: data.filter(d => d.status === 'pending').length, flagged: data.filter(d => d.status === 'flagged').length,
    responded: data.filter(d => d.status === 'responded').length, verified: data.filter(d => d.verified).length,
    distribution: [5, 4, 3, 2, 1].map(r => ({ rating: r, count: data.filter(d => d.rating === r).length })),
    byCategory: (() => { const m: Record<string, { count: number; avg: number }> = {}; data.forEach(d => { if (!m[d.category]) m[d.category] = { count: 0, avg: 0 }; m[d.category].count++; m[d.category].avg += d.rating }); Object.keys(m).forEach(k => { m[k].avg = Number((m[k].avg / m[k].count).toFixed(1)) }); return Object.entries(m).sort((a, b) => b[1].count - a[1].count) })(),
  }), [data])

  const handleStatusChange = (id: string, newStatus: Review['status']) => {
    setData(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d))
    toast.success(`Status: ${STATUSES[newStatus]?.label}`)
  }

  const handleResponse = () => {
    if (!responseText.trim()) { toast.error('Unesite odgovor'); return }
    setData(prev => prev.map(d => d.id === responseDialogId ? { ...d, responseText, status: 'responded' as Review['status'], respondedAt: new Date().toISOString().split('T')[0], respondedBy: 'Support tim' } : d))
    toast.success('Odgovor poslat')
    setResponseDialogId(null); setResponseText('')
  }

  const handleDelete = (id: string) => { if (!confirm('Obrisati recenziju?')) return; setData(prev => prev.filter(i => i.id !== id)); toast.success('Recenzija obrisana') }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>

  const detailItem = detailId ? data.find(i => i.id === detailId) : null
  const responseItem = responseDialogId ? data.find(i => i.id === responseDialogId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30"><Star className="h-5 w-5 text-amber-700 dark:text-amber-400" /></div>
          <div><h1 className="text-2xl font-bold tracking-tight">Recenzije</h1><p className="text-sm text-muted-foreground">Upravljanje recenzijama kupaca</p></div>
        </div>
      </div>

      <KpiCards stats={stats} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="reviews">Recenzije</TabsTrigger><TabsTrigger value="analytics">Analitika</TabsTrigger></TabsList>

        <TabsContent value="reviews" className="space-y-4">
          <ReviewsList filtered={filtered} search={search} statusFilter={statusFilter} ratingFilter={ratingFilter} onViewDetail={setDetailId} onOpenResponse={(id) => { setResponseDialogId(id); setResponseText(data.find(d => d.id === id)?.responseText || '') }} onStatusChange={handleStatusChange} onDelete={handleDelete} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsTab stats={stats} data={data} />
        </TabsContent>
      </Tabs>

      <DetailDialog detailItem={detailItem} open={!!detailId} onClose={() => setDetailId(null)} />
      <ResponseDialog responseItem={responseItem} responseText={responseText} open={!!responseDialogId} onClose={() => setResponseDialogId(null)} onTextChange={setResponseText} onSend={handleResponse} />
    </div>
  )
}
