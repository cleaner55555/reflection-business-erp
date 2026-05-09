 
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Share2, Plus, Search, Eye, Trash2, Edit3, RefreshCw,
  CheckCircle2, Clock, BarChart3, TrendingUp, Heart,
  MessageSquare, Users, Globe2, ExternalLink, CalendarDays
} from 'lucide-react'

interface SocialPost {
  id: string
  platform: string
  content: string
  status: string
  scheduledDate?: string
  publishedDate?: string
  likes?: number
  comments?: number
  shares?: number
  createdAt: string
}

interface DashboardData {
  totalPosts: number
  publishedPosts: number
  scheduledPosts: number
  totalEngagement: number
  platformBreakdown: Array<{ platform: string; count: number }>
  recentPosts: SocialPost[]
}

const platformConfig: Record<string, { label: string; color: string; icon: string }> = {
  facebook: { label: 'Facebook', color: 'bg-blue-100 text-blue-700', icon: '📘' },
  instagram: { label: 'Instagram', color: 'bg-pink-100 text-pink-700', icon: '📸' },
  linkedin: { label: 'LinkedIn', color: 'bg-sky-100 text-sky-700', icon: '💼' },
  twitter: { label: 'X (Twitter)', color: 'bg-gray-100 text-gray-700', icon: '🐦' },
  tiktok: { label: 'TikTok', color: 'bg-gray-900 text-white', icon: '🎵' },
  youtube: { label: 'YouTube', color: 'bg-red-100 text-red-700', icon: '🎬' },
}

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-700' },
  scheduled: { label: 'Zakazano', color: 'bg-amber-100 text-amber-700' },
  published: { label: 'Objavljeno', color: 'bg-green-100 text-green-700' },
  failed: { label: 'Greška', color: 'bg-red-100 text-red-700' },
}

export function SocialMedia() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [search, setSearch] = useState('')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<SocialPost | null>(null)

  const emptyForm = {
    platform: 'facebook', content: '', scheduledDate: '', status: 'draft',
  }
  const [form, setForm] = useState(emptyForm)

  const loadPosts = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/social/posts?companyId=${activeCompanyId}&limit=100`)
      if (res.ok) {
        const data = await res.json()
        const items = data.items || data || []
        setPosts(items)
        setDashboard({
          totalPosts: items.length,
          publishedPosts: items.filter((p: SocialPost) => p.status === 'published').length,
          scheduledPosts: items.filter((p: SocialPost) => p.status === 'scheduled').length,
          totalEngagement: items.reduce((sum: number, p: SocialPost) => sum + (p.likes || 0) + (p.comments || 0) + (p.shares || 0), 0),
          platformBreakdown: Object.entries(
            items.reduce<Record<string, number>>((acc, p: SocialPost) => { acc[p.platform] = (acc[p.platform] || 0) + 1; return acc }, {})
          ).map(([platform, count]) => ({ platform, count })),
          recentPosts: items.slice(0, 5),
        })
      }
    } catch { /* silent */ }
  }, [activeCompanyId])

  useEffect(() => { loadPosts() }, [activeCompanyId, loadPosts])

  const filteredPosts = posts.filter((p) => {
    if (search && !p.content.toLowerCase().includes(search.toLowerCase())) return false
    if (platformFilter !== 'all' && p.platform !== platformFilter) return false
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    return true
  })

  const handleCreate = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/social/posts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...form }),
      })
      if (res.ok) { setDialogOpen(false); setForm(emptyForm); loadPosts() }
    } catch { /* silent */ }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati objavu?')) return
    try {
      const res = await fetch(`/api/social/posts?id=${id}`, { method: 'DELETE' })
      if (res.ok) loadPosts()
    } catch { /* silent */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Društvene Mreže</h1>
          <p className="text-sm text-muted-foreground">Upravljanje objavama na društvenim mrežama</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadPosts}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Nova objava</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="posts"><Share2 className="h-4 w-4 mr-1" /> Objave</TabsTrigger>
          <TabsTrigger value="calendar"><CalendarDays className="h-4 w-4 mr-1" /> Kalendar</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {!dashboard ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Ukupno</span><Share2 className="h-4 w-4 text-muted-foreground" /></div><p className="text-2xl font-bold">{dashboard.totalPosts}</p></Card>
                <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Objavljene</span><CheckCircle2 className="h-4 w-4 text-green-500" /></div><p className="text-2xl font-bold text-green-600">{dashboard.publishedPosts}</p></Card>
                <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Zakazane</span><Clock className="h-4 w-4 text-amber-500" /></div><p className="text-2xl font-bold text-amber-600">{dashboard.scheduledPosts}</p></Card>
                <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Engagement</span><Heart className="h-4 w-4 text-pink-500" /></div><p className="text-2xl font-bold text-pink-600">{dashboard.totalEngagement}</p></Card>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Po platformama</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {dashboard.platformBreakdown.map((p) => {
                      const cfg = platformConfig[p.platform]
                      return (
                        <div key={p.platform} className="flex items-center justify-between">
                          <span className="text-sm">{cfg?.icon} {cfg?.label || p.platform}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-muted rounded-full h-2"><div className="h-2 rounded-full bg-primary" style={{ width: `${(p.count / Math.max(dashboard.totalPosts, 1)) * 100}%` }} /></div>
                            <span className="text-sm font-medium w-8 text-right">{p.count}</span>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Povezani nalozi</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(platformConfig).map(([key, cfg]) => (
                      <div key={key} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2"><span className="text-lg">{cfg.icon}</span><span className="text-sm">{cfg.label}</span></div>
                        <Button size="sm" variant="outline">Poveži</Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži objave..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Platforma" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Sve</SelectItem>{Object.entries(platformConfig).map(([k, v]) => (<SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>))}</SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Svi</SelectItem>{Object.entries(statusConfig).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          {filteredPosts.length === 0 ? (
            <Card className="p-8 text-center"><Share2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground" /><p className="text-muted-foreground">Nema objava</p></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPosts.map((p) => {
                const platCfg = platformConfig[p.platform]
                const statCfg = statusConfig[p.status]
                return (
                  <Card key={p.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{platCfg?.icon}</span>
                          <Badge variant="outline" className={platCfg?.color}>{platCfg?.label}</Badge>
                          <Badge variant="outline" className={`text-xs ${statCfg?.color}`}>{statCfg?.label}</Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelected(p); setDetailOpen(true) }}><Eye className="h-3.5 w-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm line-clamp-3">{p.content}</p>
                      <Separator className="my-3" />
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>❤️ {p.likes || 0}</span><span>💬 {p.comments || 0}</span><span>🔄 {p.shares || 0}</span>
                        {p.scheduledDate && <span className="ml-auto">📅 {new Date(p.scheduledDate).toLocaleDateString('sr-RS')}</span>}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card className="p-8 text-center">
            <CalendarDays className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">Content kalendar</p>
            <p className="text-xs text-muted-foreground mt-1">Pregled zakazanih objava po datumu</p>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Nova objava</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Platforma</Label>
              <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(platformConfig).map(([k, v]) => (<SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Sadržaj</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={5} placeholder="Napišite sadržaj objave..." /></div>
            <div className="space-y-2"><Label>Datum objave (opcionalno)</Label><Input type="date" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleCreate}><Plus className="h-4 w-4 mr-1" /> Kreiraj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Detalji objave</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">{platformConfig[selected.platform]?.icon}</span>
                <Badge variant="outline" className={platformConfig[selected.platform]?.color}>{platformConfig[selected.platform]?.label}</Badge>
                <Badge variant="outline" className={statusConfig[selected.status]?.color}>{statusConfig[selected.status]?.label}</Badge>
              </div>
              <p className="text-sm">{selected.content}</p>
              <Separator />
              <div className="grid grid-cols-3 gap-4 text-center">
                <div><p className="text-lg font-bold">{selected.likes || 0}</p><p className="text-xs text-muted-foreground">Lajkovi</p></div>
                <div><p className="text-lg font-bold">{selected.comments || 0}</p><p className="text-xs text-muted-foreground">Komentari</p></div>
                <div><p className="text-lg font-bold">{selected.shares || 0}</p><p className="text-xs text-muted-foreground">Deljenja</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
