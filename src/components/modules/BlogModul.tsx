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
  PenLine, Plus, Search, Eye, Trash2, Edit3, RefreshCw,
  CheckCircle2, Clock, BarChart3, CalendarDays, User,
  MessageSquare, Tag, TrendingUp
} from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  excerpt?: string
  category?: string
  author?: string
  status: string
  views: number
  commentCount: number
  publishedAt?: string
  createdAt: string
}

const statusConfig: Record<string, { label: string; color: string }> = {
  published: { label: 'Objavljeno', color: 'bg-green-100 text-green-700' },
  draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-700' },
  scheduled: { label: 'Zakazano', color: 'bg-amber-100 text-amber-700' },
  archived: { label: 'Arhivirano', color: 'bg-gray-200 text-gray-500' },
}

export function BlogModul() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<BlogPost | null>(null)

  const emptyForm = { title: '', excerpt: '', category: '', content: '', status: 'draft' }
  const [form, setForm] = useState(emptyForm)
  const [formContent, setFormContent] = useState('')

  const loadPosts = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/blog/posts?companyId=${activeCompanyId}&limit=100`)
      if (res.ok) {
        const data = await res.json()
        setPosts(data.items || data || [])
      }
    } catch { /* silent */ }
    setLoading(false)
  }, [activeCompanyId])

  useEffect(() => { loadPosts() }, [activeCompanyId, loadPosts])

  const allCategories = [...new Set(posts.map((p) => p.category).filter(Boolean))]
  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0)
  const publishedPosts = posts.filter((p) => p.status === 'published')

  const filtered = posts.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
    if (catFilter !== 'all' && p.category !== catFilter) return false
    return true
  })

  const handleCreate = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/blog/posts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, title: form.title, excerpt: form.excerpt, category: form.category, content: formContent, status: form.status }),
      })
      if (res.ok) { setDialogOpen(false); setForm(emptyForm); setFormContent(''); loadPosts() }
    } catch { /* silent */ }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati članak?')) return
    try {
      const res = await fetch(`/api/blog/posts?id=${id}`, { method: 'DELETE' })
      if (res.ok) loadPosts()
    } catch { /* silent */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog</h1>
          <p className="text-sm text-muted-foreground">Članci, vesti i sadržaj marketing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadPosts}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Novi članak</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="posts"><PenLine className="h-4 w-4 mr-1" /> Članci</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Članaka</span><PenLine className="h-4 w-4 text-muted-foreground" /></div><p className="text-2xl font-bold">{posts.length}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Objavljeno</span><CheckCircle2 className="h-4 w-4 text-green-500" /></div><p className="text-2xl font-bold text-green-600">{publishedPosts.length}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Pregleda</span><TrendingUp className="h-4 w-4 text-primary" /></div><p className="text-2xl font-bold text-primary">{totalViews}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Kategorija</span><Tag className="h-4 w-4 text-amber-500" /></div><p className="text-2xl font-bold text-amber-600">{allCategories.length}</p></Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Kategorije</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {allCategories.length === 0 ? (<p className="text-sm text-muted-foreground">Nema kategorija</p>) : allCategories.map((cat) => {
                  const count = posts.filter((p) => p.category === cat).length
                  return (
                    <div key={cat} className="flex items-center justify-between cursor-pointer" onClick={() => { setCatFilter(cat); setActiveTab('posts') }}>
                      <div className="flex items-center gap-2"><Tag className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{cat}</span></div>
                      <Badge variant="outline" className="text-[10px]">{count}</Badge>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Najčitaniji članci</CardTitle></CardHeader>
              <CardContent>
                {publishedPosts.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5).map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0 cursor-pointer" onClick={() => { setSelected(p); setDetailOpen(true) }}>
                    <div><p className="text-sm font-medium truncate max-w-[200px]">{p.title}</p><p className="text-xs text-muted-foreground">{p.author || 'Anoniman'} · {new Date(p.createdAt).toLocaleDateString('sr-RS')}</p></div>
                    <span className="text-xs text-muted-foreground">{p.views || 0}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži članke..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Kategorija" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Sve</SelectItem>{allCategories.map((c) => (<SelectItem key={c} value={c!}>{c}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          {loading ? (<div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>) : filtered.length === 0 ? (
            <Card className="p-8 text-center"><PenLine className="h-12 w-12 mx-auto mb-3 text-muted-foreground" /><p className="text-muted-foreground">Nema članaka</p><Button variant="outline" className="mt-3" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Kreiraj članak</Button></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((p) => {
                const cfg = statusConfig[p.status]
                return (
                  <Card key={p.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => { setSelected(p); setDetailOpen(true) }}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{p.title}</CardTitle>
                        <Badge variant="outline" className={`text-[10px] ${cfg?.color}`}>{cfg?.label}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {p.excerpt && <p className="text-xs text-muted-foreground line-clamp-2">{p.excerpt}</p>}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {p.category && <span>{p.category}</span>}
                        <span><Eye className="h-3 w-3 inline mr-0.5" />{p.views || 0}</span>
                        <span><MessageSquare className="h-3 w-3 inline mr-0.5" />{p.commentCount || 0}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-muted-foreground">{p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('sr-RS') : new Date(p.createdAt).toLocaleDateString('sr-RS')}</span>
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button size="icon" variant="ghost" className="h-7 w-7"><Edit3 className="h-3.5 w-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Novi članak</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Naslov</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Kategorija</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="npr. Vesti, Tutorial" /></div>
              <div className="space-y-2"><Label>Status</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Nacrt</SelectItem><SelectItem value="published">Objavljeno</SelectItem><SelectItem value="scheduled">Zakazano</SelectItem></SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label>Izvod</Label><Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} placeholder="Kratak opis članka..." /></div>
            <div className="space-y-2"><Label>Sadržaj</Label><Textarea value={formContent} onChange={(e) => setFormContent(e.target.value)} rows={10} placeholder="Sadržaj članka..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleCreate}><Plus className="h-4 w-4 mr-1" /> Kreiraj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{selected?.title}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={statusConfig[selected.status]?.color}>{statusConfig[selected.status]?.label}</Badge>
                {selected.category && <Badge variant="outline">{selected.category}</Badge>}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span><User className="h-3.5 w-3.5 inline mr-0.5" />{selected.author || 'Anoniman'}</span>
                <span><Eye className="h-3.5 w-3.5 inline mr-0.5" />{selected.views || 0}</span>
                <span><MessageSquare className="h-3.5 w-3.5 inline mr-0.5" />{selected.commentCount || 0}</span>
                <span>{new Date(selected.createdAt).toLocaleDateString('sr-RS')}</span>
              </div>
              <Separator />
              <div className="text-sm text-muted-foreground py-4 text-center">Sadržaj članka</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
