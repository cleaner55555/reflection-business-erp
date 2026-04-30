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
  BookMarked, Plus, Search, Eye, Trash2, Edit3, RefreshCw,
  CheckCircle2, Clock, BarChart3, FolderOpen, FileText,
  Users, Star, Tag, BookOpen
} from 'lucide-react'

interface Article {
  id: string
  title: string
  category?: string
  author?: string
  status: string
  views: number
  helpfulCount: number
  createdAt: string
  updatedAt?: string
}

interface Category {
  id: string
  name: string
  articleCount: number
}

const statusConfig: Record<string, { label: string; color: string }> = {
  published: { label: 'Objavljeno', color: 'bg-green-100 text-green-700' },
  draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-700' },
  review: { label: 'Na pregledu', color: 'bg-amber-100 text-amber-700' },
  archived: { label: 'Arhivirano', color: 'bg-gray-200 text-gray-500' },
}

export function BazaZnanja() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<Article | null>(null)

  const emptyForm = { title: '', category: '', content: '', status: 'draft' }
  const [form, setForm] = useState(emptyForm)
  const [formContent, setFormContent] = useState('')

  const loadArticles = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/knowledge-base?companyId=${activeCompanyId}&limit=100`)
      if (res.ok) {
        const data = await res.json()
        const items = data.items || data || []
        setArticles(items)
        const cats: Record<string, number> = {}
        items.forEach((a: Article) => {
          if (a.category) cats[a.category] = (cats[a.category] || 0) + 1
        })
        setCategories(Object.entries(cats).map(([name, articleCount]) => ({ id: name, name, articleCount })))
      }
    } catch { /* silent */ }
    setLoading(false)
  }, [activeCompanyId])

  useEffect(() => { loadArticles() }, [activeCompanyId, loadArticles])

  const publishedArticles = articles.filter((a) => a.status === 'published').length
  const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0)
  const totalHelpful = articles.reduce((sum, a) => sum + (a.helpfulCount || 0), 0)

  const filtered = articles.filter((a) => {
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false
    if (catFilter !== 'all' && a.category !== catFilter) return false
    return true
  })

  const handleCreate = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/knowledge-base', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, title: form.title, category: form.category, content: formContent, status: form.status }),
      })
      if (res.ok) { setDialogOpen(false); setForm(emptyForm); setFormContent(''); loadArticles() }
    } catch { /* silent */ }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati članak?')) return
    try {
      const res = await fetch(`/api/knowledge-base?id=${id}`, { method: 'DELETE' })
      if (res.ok) loadArticles()
    } catch { /* silent */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Baza Znanja</h1>
          <p className="text-sm text-muted-foreground">Članci, dokumentacija i FAQ</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadArticles}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Novi članak</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="articles"><BookOpen className="h-4 w-4 mr-1" /> Članci</TabsTrigger>
          <TabsTrigger value="categories"><FolderOpen className="h-4 w-4 mr-1" /> Kategorije</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Članaka</span><BookOpen className="h-4 w-4 text-muted-foreground" /></div><p className="text-2xl font-bold">{articles.length}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Objavljeno</span><CheckCircle2 className="h-4 w-4 text-green-500" /></div><p className="text-2xl font-bold text-green-600">{publishedArticles}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Pregleda</span><Eye className="h-4 w-4 text-primary" /></div><p className="text-2xl font-bold text-primary">{totalViews}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Korisno</span><Star className="h-4 w-4 text-amber-500" /></div><p className="text-2xl font-bold text-amber-600">{totalHelpful}</p></Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Kategorije</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {categories.length === 0 ? (<p className="text-sm text-muted-foreground">Nema kategorija</p>) : categories.map((c) => (
                  <div key={c.id} className="flex items-center justify-between cursor-pointer" onClick={() => { setCatFilter(c.name); setActiveTab('articles') }}>
                    <div className="flex items-center gap-2"><FolderOpen className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{c.name}</span></div>
                    <Badge variant="outline" className="text-[10px]">{c.articleCount}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Najpopularniji članci</CardTitle></CardHeader>
              <CardContent>
                {articles.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5).map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b last:border-0 cursor-pointer" onClick={() => { setSelected(a); setDetailOpen(true) }}>
                    <div><p className="text-sm font-medium">{a.title}</p><p className="text-xs text-muted-foreground">{a.category || 'Bez kategorije'}</p></div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground"><Eye className="h-3.5 w-3.5" />{a.views || 0}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="articles" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži članke..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Kategorija" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Sve kategorije</SelectItem>{categories.map((c) => (<SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          {loading ? (<div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>) : filtered.length === 0 ? (
            <Card className="p-8 text-center"><BookOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground" /><p className="text-muted-foreground">Nema članaka</p><Button variant="outline" className="mt-3" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Kreiraj članak</Button></Card>
          ) : (
            <div className="space-y-2">
              {filtered.map((a) => {
                const cfg = statusConfig[a.status]
                return (
                  <Card key={a.id} className="hover:bg-muted/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => { setSelected(a); setDetailOpen(true) }}>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">{a.title}</span>
                            <Badge variant="outline" className={`text-[10px] shrink-0 ${cfg?.color}`}>{cfg?.label}</Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            {a.category && <span>{a.category}</span>}
                            <span><Eye className="h-3 w-3 inline mr-0.5" />{a.views || 0}</span>
                            <span><Star className="h-3 w-3 inline mr-0.5" />{a.helpfulCount || 0}</span>
                            <span>{new Date(a.createdAt).toLocaleDateString('sr-RS')}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelected(a); setDetailOpen(true) }}><Eye className="h-3.5 w-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(a.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Sve kategorije</CardTitle></CardHeader>
            <CardContent>
              {categories.length === 0 ? (<p className="text-sm text-muted-foreground py-4 text-center">Nema kategorija. Dodajte kategoriju pri kreiranju članka.</p>) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {categories.map((c) => (
                    <div key={c.id} className="p-4 border rounded-lg flex items-center justify-between cursor-pointer hover:bg-muted/50" onClick={() => { setCatFilter(c.name); setActiveTab('articles') }}>
                      <div className="flex items-center gap-2"><FolderOpen className="h-5 w-5 text-muted-foreground" /><span className="text-sm font-medium">{c.name}</span></div>
                      <Badge variant="outline">{c.articleCount}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Novi članak</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Naslov</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Naslov članka" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Kategorija</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="npr. FAQ, Proizvodi, Uputstva" /></div>
              <div className="space-y-2"><Label>Status</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Nacrt</SelectItem><SelectItem value="published">Objavljeno</SelectItem><SelectItem value="review">Na pregledu</SelectItem></SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label>Sadržaj</Label><Textarea value={formContent} onChange={(e) => setFormContent(e.target.value)} rows={10} placeholder="Sadržaj članka (podržava Markdown)..." /></div>
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
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={statusConfig[selected.status]?.color}>{statusConfig[selected.status]?.label}</Badge>
                {selected.category && <Badge variant="outline">{selected.category}</Badge>}
                <span className="text-xs text-muted-foreground">{new Date(selected.createdAt).toLocaleDateString('sr-RS')}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span><Eye className="h-3.5 w-3.5 inline mr-0.5" />{selected.views || 0} pregleda</span>
                <span><Star className="h-3.5 w-3.5 inline mr-0.5" />{selected.helpfulCount || 0} korisno</span>
              </div>
              <Separator />
              <div className="text-sm text-muted-foreground py-8 text-center">Sadržaj članka se prikazuje ovde</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
