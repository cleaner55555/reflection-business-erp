/* eslint-disable react-hooks/set-state-in-effect */
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
  UsersRound, Plus, Search, Eye, Trash2, RefreshCw,
  CheckCircle2, Clock, BarChart3, MessageSquare, Tag,
  TrendingUp, ThumbsUp, Star, FileText
} from 'lucide-react'

interface ForumTopic {
  id: string
  title: string
  content: string
  category?: string
  authorName?: string
  views: number
  replyCount: number
  likes: number
  isPinned?: boolean
  isLocked?: boolean
  createdAt: string
  updatedAt?: string
}

const categoryConfig: Record<string, { label: string; color: string }> = {
  general: { label: 'Opšte', color: 'bg-gray-100 text-gray-700' },
  support: { label: 'Podrška', color: 'bg-green-100 text-green-700' },
  feature_request: { label: 'Predlozi', color: 'bg-blue-100 text-blue-700' },
  bug_report: { label: 'Bug-ovi', color: 'bg-red-100 text-red-700' },
  discussion: { label: 'Diskusija', color: 'bg-purple-100 text-purple-700' },
  announcement: { label: 'Obaveštenja', color: 'bg-amber-100 text-amber-700' },
}

export function Forum() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [topics, setTopics] = useState<ForumTopic[]>([])
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<ForumTopic | null>(null)

  const emptyForm = { title: '', content: '', category: 'general' }
  const [form, setForm] = useState(emptyForm)

  const loadTopics = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    const demo: ForumTopic[] = [
      { id: '1', title: 'Kako podesiti PDV prijavu?', content: 'Ne mogu da nađem opciju za PDV prijavu u modulu Knjigovodstvo...', category: 'support', authorName: 'Milan J.', views: 45, replyCount: 3, likes: 8, isPinned: true, createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
      { id: '2', title: 'Predlog: Automatski backup podataka', content: 'Predlažem dodavanje automatskog backup-a svih podataka na dnevnom nivou...', category: 'feature_request', authorName: 'Jelena S.', views: 32, replyCount: 7, likes: 15, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: '3', title: 'Bug: Faktura ne šalje na email', content: 'Kada pokušam da pošaljem fakturu na email klijenta, dobijem grešku...', category: 'bug_report', authorName: 'Nikola M.', views: 28, replyCount: 2, likes: 3, isLocked: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
      { id: '4', title: 'Najbolje prakse za inventuru', content: 'Delim se iskustvom sa sprovođenom inventure u maloprodaji...', category: 'discussion', authorName: 'Dragana K.', views: 56, replyCount: 12, likes: 22, isPinned: false, createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
      { id: '5', title: 'Nova verzija sistema 4.0!', content: 'Objavljujemo novu verziju sa 50+ modula, poboljšanim UI i novim funkcionalnostima...', category: 'announcement', authorName: 'Admin', views: 120, replyCount: 25, likes: 45, isPinned: true, createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
    ]
    setTopics(demo)
    setLoading(false)
  }, [activeCompanyId])

  useEffect(() => { loadTopics() }, [activeCompanyId, loadTopics])

  const totalViews = topics.reduce((sum, t) => sum + (t.views || 0), 0)
  const totalReplies = topics.reduce((sum, t) => sum + (t.replyCount || 0), 0)
  const allCategories = [...new Set(topics.map((t) => t.category).filter(Boolean))]

  const filtered = topics.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    if (catFilter !== 'all' && t.category !== catFilter) return false
    return true
  })

  const handleCreate = async () => {
    if (!activeCompanyId) return
    setTopics([{ id: `temp-${Date.now()}`, ...form, authorName: 'Vi', views: 0, replyCount: 0, likes: 0, createdAt: new Date().toISOString() }, ...topics])
    setDialogOpen(false)
    setForm(emptyForm)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati temu?')) return
    setTopics(topics.filter((t) => t.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Forum</h1>
          <p className="text-sm text-muted-foreground">Zajednica za diskusiju, podršku i predloge</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadTopics}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Nova tema</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="topics"><MessageSquare className="h-4 w-4 mr-1" /> Teme</TabsTrigger>
          <TabsTrigger value="categories"><Tag className="h-4 w-4 mr-1" /> Kategorije</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Tema</span><MessageSquare className="h-4 w-4 text-muted-foreground" /></div><p className="text-2xl font-bold">{topics.length}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Pregleda</span><Eye className="h-4 w-4 text-primary" /></div><p className="text-2xl font-bold text-primary">{totalViews}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Odgovora</span><TrendingUp className="h-4 w-4 text-green-500" /></div><p className="text-2xl font-bold text-green-600">{totalReplies}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Kategorija</span><Tag className="h-4 w-4 text-amber-500" /></div><p className="text-2xl font-bold text-amber-600">{allCategories.length}</p></Card>
          </div>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Najpopularnije teme</CardTitle></CardHeader>
            <CardContent>
              {topics.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-0 cursor-pointer" onClick={() => { setSelected(t); setDetailOpen(true) }}>
                  <div><p className="text-sm font-medium">{t.title}</p><p className="text-xs text-muted-foreground">{t.authorName} · {t.replyCount} odgovora</p></div>
                  <span className="text-xs text-muted-foreground">{t.views || 0}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topics" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži teme..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Kategorija" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Sve</SelectItem>{allCategories.map((c) => (<SelectItem key={c} value={c!}>{c}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            {filtered.map((t) => {
              const catCfg = categoryConfig[t.category]
              return (
                <Card key={t.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => { setSelected(t); setDetailOpen(true) }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {t.isPinned && <span className="text-xs">📌</span>}
                          {t.isLocked && <span className="text-xs">🔒</span>}
                          <span className="text-sm font-medium">{t.title}</span>
                          {catCfg && <Badge variant="outline" className={`text-[10px] ${catCfg.color}`}>{catCfg.label}</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{t.content}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span>{t.authorName}</span><span>·</span>
                          <span><Eye className="h-3 w-3 inline mr-0.5" />{t.views}</span>
                          <span><MessageSquare className="h-3 w-3 inline mr-0.5" />{t.replyCount}</span>
                          <span><ThumbsUp className="h-3 w-3 inline mr-0.5" />{t.likes}</span>
                          <span>·</span><span>{new Date(t.createdAt).toLocaleDateString('sr-RS')}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(categoryConfig).map(([key, cfg]) => {
              const count = topics.filter((t) => t.category === key).length
              return (
                <Card key={key} className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50" onClick={() => { setCatFilter(key); setActiveTab('topics') }}>
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm font-medium">{cfg.label}</p><p className="text-[10px] text-muted-foreground">{count} tema</p></div>
                    <Badge variant="outline" className={cfg.color}>{count}</Badge>
                  </div>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Nova tema</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Naslov</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>Kategorija</Label><Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(categoryConfig).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Opis</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={5} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleCreate}><Plus className="h-4 w-4 mr-1" /> Kreiraj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{selected?.title}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {selected.category && <Badge variant="outline" className={categoryConfig[selected.category]?.color}>{categoryConfig[selected.category]?.label}</Badge>}
                {selected.isPinned && <Badge variant="outline">📌 Zakačeno</Badge>}
                {selected.isLocked && <Badge variant="outline">🔒 Zaključano</Badge>}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{selected.authorName}</span>
                <span><Eye className="h-3.5 w-3.5 inline mr-0.5" />{selected.views}</span>
                <span><MessageSquare className="h-3.5 w-3.5 inline mr-0.5" />{selected.replyCount}</span>
                <span>{new Date(selected.createdAt).toLocaleDateString('sr-RS')}</span>
              </div>
              <Separator />
              <p className="text-sm">{selected.content}</p>
              <div className="p-6 border rounded-lg text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Odgovori na ovu temu</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
