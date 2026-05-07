'use client'

import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
'use client'

import { useState } from 'react'

import { ArrowRight, BarChart3, Calendar, CheckCircle2, Clock, Copy, Edit3, ExternalLink, Eye, File, FileText, Filter, Globe, Globe2, Hash, Image, Link, Plus, Redo2, RotateCcw, Save, Search, Sparkles, Tag, Trash2, TrendingUp, Type, Undo2, Upload, Users, Video, X } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import type { ContentItem, ContentType, ContentField, MediaItem, MediaFolder, Revision, ContentCategory, ContentForm, SeoAnalysis, ContentRelation } from './types'

function Quote(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z"/></svg>
  )
}

function PregledTab({ content }: { content: ContentItem[] }) {
  const published = content.filter(c => c.status === 'published')
  const drafts = content.filter(c => c.status === 'draft')
  const scheduled = content.filter(c => c.status === 'scheduled')
  const totalViews = content.reduce((s, c) => s + c.views, 0)
  const totalWords = content.reduce((s, c) => s + c.wordCount, 0)
  const typePie = generateTypePie(content)
  const topContent = [...published].sort((a, b) => b.views - a.views).slice(0, 5)
  const recentContent = [...content].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Ukupno</span><FileText className="h-4 w-4 text-muted-foreground" /></div><p className="text-2xl font-bold">{content.length}</p></Card>
        <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Objavljeno</span><CheckCircle2 className="h-4 w-4 text-green-500" /></div><p className="text-2xl font-bold text-green-600">{published.length}</p></Card>
        <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Nacrta</span><Clock className="h-4 w-4 text-amber-500" /></div><p className="text-2xl font-bold text-amber-600">{drafts.length}</p></Card>
        <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Zakazano</span><Calendar className="h-4 w-4 text-blue-500" /></div><p className="text-2xl font-bold text-blue-600">{scheduled.length}</p></Card>
        <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Pregleda</span><TrendingUp className="h-4 w-4 text-primary" /></div><p className="text-2xl font-bold text-primary">{totalViews.toLocaleString()}</p></Card>
        <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Reči</span><Hash className="h-4 w-4 text-purple-500" /></div><p className="text-2xl font-bold text-purple-600">{totalWords.toLocaleString()}</p></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Mesečni trend</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={250}><LineChart data={generateMonthlyTrend()}><CartesianGrid strokeDasharray="3 3" className="opacity-30" /><XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Line type="monotone" dataKey="objavljeno" stroke="#22c55e" strokeWidth={2} /><Line type="monotone" dataKey="nacrta" stroke="#f59e0b" strokeWidth={2} /></LineChart></ResponsiveContainer></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Po tipovima</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={250}><PieChart><Pie data={typePie} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>{typePie.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><Eye className="h-4 w-4" /> Najčitaniji</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead className="text-xs">#</TableHead><TableHead className="text-xs">Naslov</TableHead><TableHead className="text-xs text-right">Pregledi</TableHead></TableRow></TableHeader><TableBody>{topContent.map((c, i) => <TableRow key={c.id}><TableCell className="text-xs font-medium">{i + 1}</TableCell><TableCell className="text-xs font-medium max-w-[200px] truncate">{c.title}</TableCell><TableCell className="text-xs text-right font-bold">{c.views.toLocaleString()}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><Clock className="h-4 w-4" /> Nedavno izmenjeno</CardTitle></CardHeader><CardContent><div className="space-y-3">{recentContent.map(c => { const sc = statusConfig[c.status]; return (<div key={c.id} className="flex items-start gap-3 py-2 border-b last:border-0"><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{c.title}</p><p className="text-xs text-muted-foreground">{getContentTypeName(c.typeId)} · {getAuthorName(c.authorId)} · {new Date(c.updatedAt).toLocaleDateString('sr-RS')}</p></div><Badge variant="outline" className={`text-[10px] shrink-0 ${sc?.color}`}>{sc?.label}</Badge></div>) })}</div></CardContent></Card>
      </div>
    </div>
  )
}

function ContentTab({ content, setContent }: { content: ContentItem[]; setContent: React.Dispatch<React.SetStateAction<ContentItem[]>> }) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [catFilter, setCatFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<ContentItem | null>(null)
  const [form, setForm] = useState<ContentForm>(emptyForm())
  const [seoPreview, setSeoPreview] = useState<SeoAnalysis | null>(null)

  const filtered = content.filter(c => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false
    if (typeFilter !== 'all' && c.typeId !== typeFilter) return false
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    if (catFilter !== 'all' && c.categoryId !== catFilter) return false
    return true
  })

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setDialogOpen(true) }
  const openEditor = (item: ContentItem) => {
    setEditing(item)
    setForm({
      title: item.title, slug: item.slug, typeId: item.typeId, categoryId: item.categoryId,
      authorId: item.authorId, status: item.status, content: item.content, excerpt: item.excerpt,
      featuredImage: item.featuredImage, tags: item.tags, seoTitle: item.seoTitle,
      seoDescription: item.seoDescription, ogImage: item.ogImage, scheduledAt: item.scheduledAt || '', locale: item.locale,
    })
    setSeoPreview(null)
    setEditorOpen(true)
  }

  const handleSave = () => {
    if (editing) {
      setContent(prev => prev.map(c => c.id === editing.id ? { ...c, ...form, wordCount: form.content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length, readingTime: Math.ceil(form.content.split(/\s+/).length / 200), updatedAt: new Date().toISOString(), revisionCount: c => c.revisionCount + 1 } : c))
    } else {
      const newItem: ContentItem = {
        id: `c-${Date.now()}`, title: form.title, slug: form.slug || generateSlug(form.title),
        typeId: form.typeId, categoryId: form.categoryId, authorId: form.authorId, status: form.status,
        content: form.content, excerpt: form.excerpt, featuredImage: form.featuredImage,
        tags: form.tags, views: 0, wordCount: form.content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length,
        readingTime: Math.ceil(form.content.split(/\s+/).length / 200), seoTitle: form.seoTitle,
        seoDescription: form.seoDescription, ogImage: form.ogImage, publishedAt: form.status === 'published' ? new Date().toISOString() : '',
        scheduledAt: form.scheduledAt, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), revisionCount: 0, locale: form.locale,
      }
      setContent(prev => [...prev, newItem])
    }
    setDialogOpen(false)
    setEditorOpen(false)
  }

  const handleDelete = (id: string) => setContent(prev => prev.filter(c => c.id !== id))
  const advanceStatus = (item: ContentItem) => {
    const idx = statusWorkflow.indexOf(item.status)
    if (idx < statusWorkflow.length - 1) setContent(prev => prev.map(c => c.id === item.id ? { ...c, status: statusWorkflow[idx + 1], publishedAt: statusWorkflow[idx + 1] === 'published' ? new Date().toISOString() : c.publishedAt } : c))
  }

  const toggleTag = (tag: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag] }))
  }

  const runSeoAnalysis = () => {
    if (editing) {
      const temp = { ...editing, ...form }
      setSeoPreview(analyzeSeo(temp))
    }
  }

  const allTags = [...new Set(content.flatMap(c => c.tags))]

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži sadržaj..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} /></div>
        <Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-full lg:w-[160px]"><SelectValue placeholder="Tip" /></SelectTrigger><SelectContent><SelectItem value="all">Svi tipovi</SelectItem>{mockContentTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full lg:w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Svi statusi</SelectItem>{Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
        <Select value={catFilter} onValueChange={setCatFilter}><SelectTrigger className="w-full lg:w-[160px]"><SelectValue placeholder="Kategorija" /></SelectTrigger><SelectContent><SelectItem value="all">Sve kategorije</SelectItem>{mockCategories.filter(c => !c.parentId).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Novi sadržaj</Button>
      </div>
      <div className="text-sm text-muted-foreground">{filtered.length} od {content.length}</div>
      {filtered.length === 0 ? <Card className="p-12 text-center"><FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" /><p className="text-muted-foreground font-medium">Nema sadržaja</p><Button className="mt-4" size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Kreiraj</Button></Card> : (
        <div className="rounded-md border overflow-x-auto"><Table><TableHeader><TableRow><TableHead className="text-xs">Naslov</TableHead><TableHead className="text-xs hidden md:table-cell">Tip</TableHead><TableHead className="text-xs hidden lg:table-cell">Kategorija</TableHead><TableHead className="text-xs hidden md:table-cell">Autor</TableHead><TableHead className="text-xs text-right">Pregledi</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader><TableBody>
          {filtered.map(c => { const sc = statusConfig[c.status]; const si = statusWorkflow.indexOf(c.status); return (
            <TableRow key={c.id}><TableCell className="text-xs font-medium max-w-[220px]"><div className="flex items-center gap-2">{c.featuredImage && <Image className="h-3.5 w-3.5 text-muted-foreground shrink-0" alt="" />}<span className="truncate">{c.title}</span></div><p className="text-[10px] text-muted-foreground truncate max-w-[220px]">/{c.slug}</p></TableCell><TableCell className="text-xs hidden md:table-cell"><Badge variant="outline" className="text-[10px]">{getContentTypeName(c.typeId)}</Badge></TableCell><TableCell className="text-xs hidden lg:table-cell"><Badge variant="outline" style={{ borderColor: getCategoryColor(c.categoryId), color: getCategoryColor(c.categoryId) }}>{getCategoryName(c.categoryId)}</Badge></TableCell><TableCell className="text-xs hidden md:table-cell">{getAuthorName(c.authorId)}</TableCell><TableCell className="text-xs text-right font-medium">{c.views.toLocaleString()}</TableCell><TableCell><div className="flex items-center gap-1"><Badge variant="outline" className={`text-[10px] ${sc?.color}`}>{sc?.label}</Badge>{si < statusWorkflow.length - 1 && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => advanceStatus(c)}><ArrowRight className="h-3 w-3" /></Button>}</div></TableCell><TableCell><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditor(c)}><Edit3 className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {}}><Eye className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div></TableCell></TableRow>
          ) })}
        </TableBody></Table></div>
      )}

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Novi sadržaj</DialogTitle><DialogDescription>Popunite podatke za novi sadržaj</DialogDescription></DialogHeader><div className="space-y-4">
        <div className="space-y-2"><Label>Naslov</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: generateSlug(e.target.value) }))} /></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2"><Label>Tip</Label><Select value={form.typeId} onValueChange={v => setForm(f => ({ ...f, typeId: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{mockContentTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Status</Label><Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as ContentItem['status'] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Autor</Label><Select value={form.authorId} onValueChange={v => setForm(f => ({ ...f, authorId: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{mockAuthors.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select></div>
        </div>
        <div className="space-y-2"><Label>Kategorija</Label><Select value={form.categoryId} onValueChange={v => setForm(f => ({ ...f, categoryId: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Bez kategorije</SelectItem>{mockCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-2"><Label>Slug</Label><Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} /></div>
        <div className="space-y-2"><Label>Tagovi</Label><div className="flex flex-wrap gap-2">{allTags.map(tag => <Badge key={tag} variant={form.tags.includes(tag) ? 'default' : 'outline'} className="cursor-pointer text-xs" onClick={() => toggleTag(tag)}>{tag}</Badge>)}</div></div>
        <div className="space-y-2"><Label>Kratki opis</Label><Textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} rows={2} /></div>
      </div><DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button><Button onClick={handleSave}>Sačuvaj</Button></DialogFooter></DialogContent></Dialog>

      {/* Editor Dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}><DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto"><DialogHeader><DialogTitle>{editing ? `Izmeni: ${editing.title}` : 'Novi sadržaj'}</DialogTitle><DialogDescription>WYSIWYG editor sa SEO podrškom</DialogDescription></DialogHeader><div className="space-y-4">
        <div className="space-y-2"><Label>Naslov</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: generateSlug(e.target.value) }))} /></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-2"><Label>Tip</Label><Select value={form.typeId} onValueChange={v => setForm(f => ({ ...f, typeId: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{mockContentTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Status</Label><Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as ContentItem['status'] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Autor</Label><Select value={form.authorId} onValueChange={v => setForm(f => ({ ...f, authorId: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{mockAuthors.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Jezik</Label><Select value={form.locale} onValueChange={v => setForm(f => ({ ...f, locale: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sr">🇷🇸 Srpski</SelectItem><SelectItem value="en">🇬🇧 English</SelectItem><SelectItem value="de">🇩🇪 Deutsch</SelectItem><SelectItem value="fr">🇫🇷 Français</SelectItem><SelectItem value="es">🇪🇸 Español</SelectItem><SelectItem value="it">🇮🇹 Italiano</SelectItem><SelectItem value="hu">🇭🇺 Magyar</SelectItem><SelectItem value="ro">🇷🇴 Română</SelectItem><SelectItem value="bg">🇧🇬 Български</SelectItem><SelectItem value="hr">🇭🇷 Hrvatski</SelectItem><SelectItem value="sl">🇸🇮 Slovenščina</SelectItem></SelectContent></Select></div>
        </div>
        {/* WYSIWYG Toolbar */}
        <div className="space-y-2"><Label>Sadržaj</Label><div className="border rounded-lg overflow-hidden">
          <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/50 border-b"><Undo2 className="h-4 w-4 p-1 cursor-pointer hover:bg-muted rounded" /><Redo2 className="h-4 w-4 p-1 cursor-pointer hover:bg-muted rounded" /><Separator orientation="vertical" className="h-6 mx-1" />{toolbarActions.map(a => <a.icon key={a.action} className="h-4 w-4 p-1 cursor-pointer hover:bg-muted rounded" title={a.label} />)}</div>
          <Textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={12} className="border-0 rounded-none font-mono text-sm" placeholder="HTML sadržaj ili običan tekst..." />
          <div className="flex items-center justify-between p-2 bg-muted/30 text-xs text-muted-foreground"><span>{form.content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length} reči · {Math.ceil(form.content.split(/\s+/).length / 200)} min čitanja</span></div>
        </div></div>
        <div className="space-y-2"><Label>Tagovi</Label><div className="flex flex-wrap gap-2">{allTags.map(tag => <Badge key={tag} variant={form.tags.includes(tag) ? 'default' : 'outline'} className="cursor-pointer text-xs" onClick={() => toggleTag(tag)}>{tag}</Badge>)}</div></div>
        <Separator />
        <div className="space-y-2"><Label>SEO Naslov</Label><Input value={form.seoTitle} onChange={e => setForm(f => ({ ...f, seoTitle: e.target.value }))} placeholder={`${form.title} | Reflection`} /><p className="text-[10px] text-muted-foreground">{form.seoTitle.length}/60 karaktera</p></div>
        <div className="space-y-2"><Label>SEO Opis</Label><Textarea value={form.seoDescription} onChange={e => setForm(f => ({ ...f, seoDescription: e.target.value }))} rows={2} /><p className="text-[10px] text-muted-foreground">{form.seoDescription.length}/160 karaktera</p></div>
        {seoPreview && <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-sm font-medium">SEO Analiza</span><Badge variant={seoPreview.score >= 70 ? 'default' : seoPreview.score >= 40 ? 'secondary' : 'destructive'} className="text-xs">{seoPreview.score}/100</Badge></div><div className="space-y-1">{seoPreview.issues.map((iss, i) => <p key={i} className={`text-xs ${iss.type === 'error' ? 'text-red-500' : iss.type === 'warning' ? 'text-amber-500' : 'text-muted-foreground'}`}>{iss.type === 'error' ? '✕' : iss.type === 'warning' ? '⚠' : 'ℹ'} {iss.message}</p>)}</div></Card>}
        <Button variant="outline" size="sm" onClick={runSeoAnalysis}><Sparkles className="h-4 w-4 mr-1" /> Analiziraj SEO</Button>
      </div><DialogFooter><Button variant="outline" onClick={() => setEditorOpen(false)}>Otkaži</Button><Button onClick={handleSave}><Save className="h-4 w-4 mr-1" /> Sačuvaj</Button></DialogFooter></DialogContent></Dialog>
    </div>
  )
}

function TypesTab() {
  const [types, setTypes] = useState(mockContentTypes)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', icon: 'FileText' })

  const handleCreate = () => {
    const newType: ContentType = { id: `ct-${Date.now()}`, name: form.name, slug: generateSlug(form.name), description: form.description, icon: form.icon, fields: [{ id: `f-${Date.now()}`, name: 'Sadržaj', type: 'richtext', required: true }], itemCount: 0, template: 'custom' }
    setTypes(prev => [...prev, newType])
    setDialogOpen(false)
    setForm({ name: '', description: '', icon: 'FileText' })
  }

  const handleDelete = (id: string) => setTypes(prev => prev.filter(t => t.id !== id))

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="text-sm font-medium">Tipovi sadržaja ({types.length})</h3><Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Novi tip</Button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {types.map(t => (
          <Card key={t.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">/{t.slug}</p>
                </div>
                <Badge variant="outline" className="text-[10px]">{t.itemCount}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">{t.description}</p>
              <div className="space-y-1 mb-3">
                <p className="text-[10px] font-medium text-muted-foreground">Polja ({t.fields.length}):</p>
                {t.fields.map(f => (
                  <div key={f.id} className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className="text-[9px]">{f.type}</Badge>
                    <span>{f.name}</span>
                    {f.required && <span className="text-red-400">*</span>}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" className="text-xs flex-1">
                  <Edit3 className="h-3 w-3 mr-1" /> Izmeni
                </Button>
                <Button variant="outline" size="sm" className="text-xs text-destructive" onClick={() => handleDelete(t.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>Novi tip sadržaja</DialogTitle></DialogHeader><div className="space-y-4"><div className="space-y-2"><Label>Naziv</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div><div className="space-y-2"><Label>Opis</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} /></div></div><DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button><Button onClick={handleCreate}>Kreiraj</Button></DialogFooter></DialogContent></Dialog>
    </div>
  )
}

function MediaTab() {
  const [media] = useState(mockMedia)
  const [folders] = useState(mockFolders)
  const [folderFilter, setFolderFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = media.filter(m => {
    if (folderFilter !== 'all' && m.folderId !== folderFilter) return false
    if (typeFilter !== 'all' && m.type !== typeFilter) return false
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalSize = media.reduce((s, m) => s + m.size, 0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4"><span className="text-xs text-muted-foreground">Ukupno fajlova</span><p className="text-xl font-bold">{media.length}</p></Card>
        <Card className="p-4"><span className="text-xs text-muted-foreground">Ukupna veličina</span><p className="text-xl font-bold">{formatFileSize(totalSize)}</p></Card>
        <Card className="p-4"><span className="text-xs text-muted-foreground">Foldera</span><p className="text-xl font-bold">{folders.length}</p></Card>
        <Card className="p-4"><span className="text-xs text-muted-foreground">Korišćeno u sadržaju</span><p className="text-xl font-bold">{media.reduce((s, m) => s + m.usageCount, 0)}</p></Card>
      </div>
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži medije..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} /></div>
        <Select value={folderFilter} onValueChange={setFolderFilter}><SelectTrigger className="w-full lg:w-[160px]"><SelectValue placeholder="Folder" /></SelectTrigger><SelectContent><SelectItem value="all">Svi folderi</SelectItem>{folders.map(f => <SelectItem key={f.id} value={f.id}>{f.name} ({f.itemCount})</SelectItem>)}</SelectContent></Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-full lg:w-[130px]"><SelectValue placeholder="Tip" /></SelectTrigger><SelectContent><SelectItem value="all">Svi tipovi</SelectItem><SelectItem value="image">Slike</SelectItem><SelectItem value="document">Dokumenta</SelectItem><SelectItem value="video">Video</SelectItem><SelectItem value="audio">Audio</SelectItem><SelectItem value="icon">Ikone</SelectItem></SelectContent></Select>
        <Button size="sm" onClick={() => setUploadOpen(true)}><Upload className="h-4 w-4 mr-1" /> Upload</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map(m => { const Icon = mediaTypeIcons[m.type]; const color = mediaTypeColors[m.type]; return (
          <Card key={m.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer group"><div className="flex items-center justify-center h-32 bg-muted/50 rounded-lg mb-3"><Icon className="h-12 w-12 text-muted-foreground/50" aria-label={m.type} /></div><p className="text-xs font-medium truncate" title={m.name}>{m.name}</p><div className="flex items-center justify-between mt-1"><p className="text-[10px] text-muted-foreground">{formatFileSize(m.size)}</p><Badge variant="outline" className={`text-[9px] ${color}`}>{m.type}</Badge></div><div className="flex items-center justify-between mt-2 opacity-0 group-hover:opacity-100 transition-opacity"><Button variant="ghost" size="icon" className="h-6 w-6"><Copy className="h-3 w-3" /></Button><Button variant="ghost" size="icon" className="h-6 w-6"><ExternalLink className="h-3 w-3" /></Button><Button variant="ghost" size="icon" className="h-6 w-6 text-destructive"><Trash2 className="h-3 w-3" /></Button></div>{m.usageCount > 0 && <p className="text-[9px] text-muted-foreground mt-1">Korišćeno: {m.usageCount}x</p>}</Card>
        ) })}
      </div>
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}><DialogContent><DialogHeader><DialogTitle>Upload medija</DialogTitle><DialogDescription>Izaberite fajlove za upload</DialogDescription></DialogHeader><div className="space-y-4"><div className="border-2 border-dashed rounded-lg p-8 text-center"><Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" /><p className="text-sm text-muted-foreground">Prevucite fajlove ovde ili kliknite za biranje</p><p className="text-xs text-muted-foreground mt-1">Podržano: JPG, PNG, GIF, SVG, PDF, MP4, MP3 (max 50MB)</p></div><div className="space-y-2"><Label>Folder</Label><Select><SelectTrigger><SelectValue placeholder="Izaberite folder" /></SelectTrigger><SelectContent>{folders.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent></Select></div></div><DialogFooter><Button variant="outline" onClick={() => setUploadOpen(false)}>Otkaži</Button><Button>Upload</Button></DialogFooter></DialogContent></Dialog>
    </div>
  )
}

function RevisionsTab({ content }: { content: ContentItem[] }) {
  const [selectedContent, setSelectedContent] = useState<string>('all')
  const [revisions] = useState(mockRevisions)

  const filtered = selectedContent === 'all' ? revisions : revisions.filter(r => r.contentId === selectedContent)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h3 className="text-sm font-medium">Istorija revizija ({revisions.length})</h3></div>
      <Select value={selectedContent} onValueChange={setSelectedContent}><SelectTrigger className="w-full lg:w-[300px]"><SelectValue placeholder="Filtriraj po sadržaju" /></SelectTrigger><SelectContent><SelectItem value="all">Svi sadržaji</SelectItem>{content.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent></Select>
      <div className="rounded-md border overflow-x-auto"><Table><TableHeader><TableRow><TableHead className="text-xs">Sadržaj</TableHead><TableHead className="text-xs">Autor</TableHead><TableHead className="text-xs">Promena</TableHead><TableHead className="text-xs hidden md:table-cell">Reči</TableHead><TableHead className="text-xs">Datum</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader><TableBody>
        {filtered.map(r => (
          <TableRow key={r.id}><TableCell className="text-xs font-medium max-w-[200px] truncate">{r.contentTitle}</TableCell><TableCell className="text-xs">{r.authorName}</TableCell><TableCell className="text-xs max-w-[200px] truncate">{r.changeSummary}</TableCell><TableCell className="text-xs hidden md:table-cell">{r.wordCount.toLocaleString()}</TableCell><TableCell className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString('sr-RS')}</TableCell><TableCell><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" title="Vrati ovu verziju"><RotateCcw className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button></div></TableCell></TableRow>
        ))}
      </TableBody></Table></div>
    </div>
  )
}

function SchedulerTab({ content }: { content: ContentItem[] }) {
  const scheduled = content.filter(c => c.status === 'scheduled').sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
  const drafts = content.filter(c => c.status === 'draft')
  const recentlyPublished = content.filter(c => c.status === 'published').sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()).slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4"><div className="flex items-center gap-2 mb-2"><Calendar className="h-4 w-4 text-blue-500" /><span className="text-xs text-muted-foreground">Zakazano</span></div><p className="text-2xl font-bold text-blue-600">{scheduled.length}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 mb-2"><Clock className="h-4 w-4 text-amber-500" /><span className="text-xs text-muted-foreground">Čeka objavu (nacrti)</span></div><p className="text-2xl font-bold text-amber-600">{drafts.length}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 mb-2"><CheckCircle2 className="h-4 w-4 text-green-500" /><span className="text-xs text-muted-foreground">Nedavno objavljeno</span></div><p className="text-2xl font-bold text-green-600">{recentlyPublished.length}</p></Card>
      </div>
      {scheduled.length > 0 && <><h3 className="text-sm font-medium flex items-center gap-2"><Calendar className="h-4 w-4" /> Zakazani sadržaj</h3><div className="space-y-3">{scheduled.map(c => (
        <Card key={c.id} className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-medium">{c.title}</p><p className="text-xs text-muted-foreground">{getContentTypeName(c.typeId)} · {getAuthorName(c.authorId)}</p></div><div className="text-right"><Badge variant="outline" className="text-xs mb-1">📅 {new Date(c.scheduledAt).toLocaleDateString('sr-RS')} {new Date(c.scheduledAt).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}</Badge><p className="text-[10px] text-muted-foreground">{Math.round((new Date(c.scheduledAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} dana</p></div></div></Card>
      ))}</div></>}
      {drafts.length > 0 && <><h3 className="text-sm font-medium flex items-center gap-2 mt-6"><Clock className="h-4 w-4" /> Nacrta koji čekaju</h3><div className="rounded-md border overflow-x-auto"><Table><TableHeader><TableRow><TableHead className="text-xs">Naslov</TableHead><TableHead className="text-xs hidden md:table-cell">Tip</TableHead><TableHead className="text-xs hidden md:table-cell">Autor</TableHead><TableHead className="text-xs">Reči</TableHead><TableHead className="text-xs">Revizije</TableHead></TableRow></TableHeader><TableBody>{drafts.map(c => <TableRow key={c.id}><TableCell className="text-xs font-medium">{c.title}</TableCell><TableCell className="text-xs hidden md:table-cell">{getContentTypeName(c.typeId)}</TableCell><TableCell className="text-xs hidden md:table-cell">{getAuthorName(c.authorId)}</TableCell><TableCell className="text-xs">{c.wordCount.toLocaleString()}</TableCell><TableCell className="text-xs"><Badge variant="outline" className="text-[10px]">{c.revisionCount} rev.</Badge></TableCell></TableRow>)}</TableBody></Table></div></>}
      {recentlyPublished.length > 0 && <><h3 className="text-sm font-medium flex items-center gap-2 mt-6"><CheckCircle2 className="h-4 w-4" /> Nedavno objavljeno</h3><div className="space-y-2">{recentlyPublished.map(c => <div key={c.id} className="flex items-center justify-between py-2 border-b last:border-0"><div className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /><div><p className="text-sm font-medium">{c.title}</p><p className="text-xs text-muted-foreground">{getAuthorName(c.authorId)} · {getContentTypeName(c.typeId)}</p></div></div><span className="text-xs text-muted-foreground">{new Date(c.publishedAt).toLocaleDateString('sr-RS')}</span></div>)}</div></>}
    </div>
  )
}

function SeoTab({ content }: { content: ContentItem[] }) {
  const [selected, setSelected] = useState<string>(content[0]?.id || '')
  const item = content.find(c => c.id === selected)
  const analysis = item ? analyzeSeo(item) : null

  const scoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500'
    if (score >= 40) return 'text-amber-500'
    return 'text-red-500'
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-3">
        <Select value={selected} onValueChange={setSelected}><SelectTrigger className="w-full lg:w-[300px]"><SelectValue placeholder="Izaberite sadržaj" /></SelectTrigger><SelectContent>{content.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent></Select>
      </div>
      {item && analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card className="p-6"><div className="flex items-center justify-between mb-4"><h3 className="text-sm font-medium">SEO Score</h3><span className={`text-3xl font-bold ${scoreColor(analysis.score)}`}>{analysis.score}</span></div><div className="w-full bg-muted rounded-full h-3"><div className={`h-3 rounded-full transition-all ${analysis.score >= 70 ? 'bg-green-500' : analysis.score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${analysis.score}%` }} /></div></Card>
            <Card className="p-4"><h3 className="text-sm font-medium mb-3">Meta podaci</h3><div className="space-y-3">
              <div><Label className="text-xs">SEO Naslov ({analysis.titleLength}/60)</Label><Input value={item.seoTitle} readOnly className="text-xs mt-1" /></div>
              <div><Label className="text-xs">SEO Opis ({analysis.descriptionLength}/160)</Label><Textarea value={item.seoDescription} readOnly rows={2} className="text-xs mt-1" /></div>
              <div><Label className="text-xs">Slug</Label><Input value={`reflection.business/${item.slug}`} readOnly className="text-xs mt-1" /></div>
            </div></Card>
            <Card className="p-4"><h3 className="text-sm font-medium mb-3">Open Graph</h3><div className="space-y-2"><div className="flex items-center gap-2"><Label className="text-xs w-20">OG Naslov:</Label><span className="text-xs">{item.seoTitle || item.title}</span></div><div className="flex items-center gap-2"><Label className="text-xs w-20">OG Opis:</Label><span className="text-xs truncate max-w-[300px]">{item.seoDescription || item.excerpt}</span></div><div className="flex items-center gap-2"><Label className="text-xs w-20">OG Slika:</Label><span className="text-xs">{item.ogImage ? '✅ Postavljena' : '❌ Nema'}</span></div><div className="flex items-center gap-2"><Label className="text-xs w-20">Tip:</Label><span className="text-xs">{item.typeId === 'ct-1' ? 'article' : 'website'}</span></div><div className="flex items-center gap-2"><Label className="text-xs w-20">Jezik:</Label><span className="text-xs">{item.locale === 'sr' ? 'sr_RS' : item.locale}</span></div></div></Card>
          </div>
          <div className="space-y-4">
            <Card className="p-4"><h3 className="text-sm font-medium mb-3">Analiza sadržaja</h3><div className="grid grid-cols-2 gap-4"><div className="text-center p-3 bg-muted/50 rounded-lg"><p className="text-2xl font-bold">{analysis.wordCount}</p><p className="text-xs text-muted-foreground">Reči</p></div><div className="text-center p-3 bg-muted/50 rounded-lg"><p className="text-2xl font-bold">{analysis.readability}</p><p className="text-xs text-muted-foreground">Čitljivost</p></div><div className="text-center p-3 bg-muted/50 rounded-lg"><p className="text-2xl font-bold">{analysis.headings}</p><p className="text-xs text-muted-foreground">Naslova</p></div><div className="text-center p-3 bg-muted/50 rounded-lg"><p className="text-2xl font-bold">{analysis.images}</p><p className="text-xs text-muted-foreground">Slika</p></div><div className="text-center p-3 bg-muted/50 rounded-lg"><p className="text-2xl font-bold">{analysis.links}</p><p className="text-xs text-muted-foreground">Linkova</p></div><div className="text-center p-3 bg-muted/50 rounded-lg"><p className="text-2xl font-bold">{analysis.keywordDensity}%</p><p className="text-xs text-muted-foreground">Keyword dens.</p></div></div></Card>
            <Card className="p-4"><h3 className="text-sm font-medium mb-3">Social Preview</h3><div className="border rounded-lg overflow-hidden"><div className="bg-muted p-3"><div className="flex items-center gap-2 mb-1"><Globe2 className="h-3 w-3 text-muted-foreground" /><span className="text-[10px] text-muted-foreground">reflection.business</span></div><p className="text-sm font-medium">{item.seoTitle || item.title}</p></div><div className="p-3"><p className="text-xs text-muted-foreground">{item.seoDescription || item.excerpt}</p></div></div></Card>
            <Card className="p-4"><h3 className="text-sm font-medium mb-3">SEO Problemi</h3><div className="space-y-2">{analysis.issues.length === 0 ? <p className="text-xs text-green-600">✅ Nema problema</p> : analysis.issues.map((iss, i) => <div key={i} className="flex items-start gap-2"><span className="text-xs">{iss.type === 'error' ? '🔴' : iss.type === 'warning' ? '🟡' : '🔵'}</span><p className="text-xs">{iss.message}</p></div>)}</div></Card>
            <Card className="p-4"><h3 className="text-sm font-medium mb-3">i18n Jezici (placeholder)</h3><div className="flex flex-wrap gap-2">{['sr', 'en', 'de', 'fr', 'es', 'it', 'hu', 'ro', 'bg', 'hr', 'sl', 'cs', 'pl', 'sk', 'uk', 'tr', 'ar', 'zh', 'ja', 'ko', 'pt', 'nl', 'sv', 'da', 'fi', 'no', 'el', 'he', 'th', 'vi', 'id', 'ms', 'tl', 'fil', 'sw', 'am', 'bn', 'hi', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'or', 'pa', 'ur', 'fa', 'uz', 'kk', 'az', 'ka', 'hy', 'hy', 'eu', 'gl', 'ca', 'eu', 'is', 'et', 'lv', 'lt', 'mk', 'sq', 'bs', 'me', 'sr-latn'].map(lang => <Badge key={lang} variant={lang === item.locale ? 'default' : 'outline'} className="text-[10px]">{lang === 'sr' ? '🇷🇸' : lang === 'en' ? '🇬🇧' : lang === 'de' ? '🇩🇪' : lang === 'fr' ? '🇫🇷' : lang === 'es' ? '🇪🇸' : lang === 'sr-latn' ? '🇷🇸' : '🌐'} {lang}</Badge>)}</div><p className="text-[10px] text-muted-foreground mt-2">{80} jezika — placeholder za i18n integraciju</p></Card>
          </div>
        </div>
      )}
    </div>
  )
}

function SeoTabExtended({ content }: { content: ContentItem[] }) {
  const [selected, setSelected] = useState<string>(content[0]?.id || '')
  const [seoSubTab, setSeoSubTab] = useState<'analysis' | 'sitemap' | 'analytics'>('analysis')
  const item = content.find(c => c.id === selected)
  const analysis = item ? analyzeSeo(item) : null
  const analytics = generateContentAnalytics(content)

  const scoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500'
    if (score >= 40) return 'text-amber-500'
    return 'text-red-500'
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-3">
        <Select value={selected} onValueChange={setSelected}><SelectTrigger className="w-full lg:w-[300px]"><SelectValue placeholder="Izaberite sadržaj" /></SelectTrigger><SelectContent>{content.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent></Select>
        <div className="flex gap-2">
          <Button variant={seoSubTab === 'analysis' ? 'default' : 'outline'} size="sm" onClick={() => setSeoSubTab('analysis')}>Analiza</Button>
          <Button variant={seoSubTab === 'sitemap' ? 'default' : 'outline'} size="sm" onClick={() => setSeoSubTab('sitemap')}>Sitemap</Button>
          <Button variant={seoSubTab === 'analytics' ? 'default' : 'outline'} size="sm" onClick={() => setSeoSubTab('analytics')}>Analitika</Button>
        </div>
      </div>

      {seoSubTab === 'analysis' && item && analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card className="p-6"><div className="flex items-center justify-between mb-4"><h3 className="text-sm font-medium">SEO Score</h3><span className={`text-3xl font-bold ${scoreColor(analysis.score)}`}>{analysis.score}</span></div><div className="w-full bg-muted rounded-full h-3"><div className={`h-3 rounded-full transition-all ${analysis.score >= 70 ? 'bg-green-500' : analysis.score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${analysis.score}%` }} /></div><p className="text-[10px] text-muted-foreground mt-2">{analysis.score >= 70 ? 'Odlično optimizovano' : analysis.score >= 40 ? 'Potrebna poboljšanja' : 'Zahteva hitnu optimizaciju'}</p></Card>
            <Card className="p-4"><h3 className="text-sm font-medium mb-3">Meta podaci</h3><div className="space-y-3"><div><Label className="text-xs">SEO Naslov ({analysis.titleLength}/60)</Label><Input value={item.seoTitle} readOnly className="text-xs mt-1" /></div><div><Label className="text-xs">SEO Opis ({analysis.descriptionLength}/160)</Label><Textarea value={item.seoDescription} readOnly rows={2} className="text-xs mt-1" /></div><div><Label className="text-xs">Kanonski URL</Label><Input value={`reflection.business/${item.locale}/${item.slug}`} readOnly className="text-xs mt-1" /></div></div></Card>
            <Card className="p-4"><h3 className="text-sm font-medium mb-3">Open Graph</h3><div className="space-y-2"><div className="flex items-center gap-2"><Label className="text-xs w-20">OG Naslov:</Label><span className="text-xs">{item.seoTitle || item.title}</span></div><div className="flex items-center gap-2"><Label className="text-xs w-20">OG Opis:</Label><span className="text-xs truncate max-w-[300px]">{item.seoDescription || item.excerpt}</span></div><div className="flex items-center gap-2"><Label className="text-xs w-20">OG Slika:</Label><span className="text-xs">{item.ogImage ? '✅ Postavljena' : '❌ Nema — koristi default'}</span></div><div className="flex items-center gap-2"><Label className="text-xs w-20">OG Tip:</Label><span className="text-xs">{item.typeId === 'ct-1' ? 'article' : 'website'}</span></div><div className="flex items-center gap-2"><Label className="text-xs w-20">Locale:</Label><span className="text-xs">{item.locale === 'sr' ? 'sr_RS' : item.locale}</span></div></div></Card>
          </div>
          <div className="space-y-4">
            <Card className="p-4"><h3 className="text-sm font-medium mb-3">Analiza sadržaja</h3><div className="grid grid-cols-2 gap-4"><div className="text-center p-3 bg-muted/50 rounded-lg"><p className="text-2xl font-bold">{analysis.wordCount}</p><p className="text-xs text-muted-foreground">Reči</p></div><div className="text-center p-3 bg-muted/50 rounded-lg"><p className="text-2xl font-bold">{analysis.readability}</p><p className="text-xs text-muted-foreground">Čitljivost</p></div><div className="text-center p-3 bg-muted/50 rounded-lg"><p className="text-2xl font-bold">{analysis.headings}</p><p className="text-xs text-muted-foreground">Naslova H1-H6</p></div><div className="text-center p-3 bg-muted/50 rounded-lg"><p className="text-2xl font-bold">{analysis.images}</p><p className="text-xs text-muted-foreground">Slika</p></div><div className="text-center p-3 bg-muted/50 rounded-lg"><p className="text-2xl font-bold">{analysis.links}</p><p className="text-xs text-muted-foreground">Linkova</p></div><div className="text-center p-3 bg-muted/50 rounded-lg"><p className="text-2xl font-bold">{analysis.keywordDensity}%</p><p className="text-xs text-muted-foreground">Keyword dens.</p></div></div></Card>
            <Card className="p-4"><h3 className="text-sm font-medium mb-3">Social Preview</h3><div className="border rounded-lg overflow-hidden"><div className="bg-muted p-3"><div className="flex items-center gap-2 mb-1"><Globe2 className="h-3 w-3 text-muted-foreground" /><span className="text-[10px] text-muted-foreground">reflection.business/{item.locale}</span></div><p className="text-sm font-medium">{item.seoTitle || item.title}</p></div><div className="p-3"><p className="text-xs text-muted-foreground">{item.seoDescription || item.excerpt || 'Nema opisa'}</p></div></div></Card>
            <Card className="p-4"><h3 className="text-sm font-medium mb-3">SEO Problemi ({analysis.issues.length})</h3><div className="space-y-2">{analysis.issues.length === 0 ? <p className="text-xs text-green-600 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Nema problema — odlično!</p> : analysis.issues.map((iss, i) => <div key={i} className="flex items-start gap-2 p-2 bg-muted/30 rounded"><span className="text-sm">{iss.type === 'error' ? '🔴' : iss.type === 'warning' ? '🟡' : '🔵'}</span><p className="text-xs">{iss.message}</p></div>)}</div></Card>
          </div>
        </div>
      )}

      {seoSubTab === 'sitemap' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4"><span className="text-xs text-muted-foreground">Ukupno URL-ova</span><p className="text-2xl font-bold">{sitemapItems.length}</p></Card>
            <Card className="p-4"><span className="text-xs text-muted-foreground">Visok prioritet (0.8+)</span><p className="text-2xl font-bold">{sitemapItems.filter(s => s.priority >= 0.8).length}</p></Card>
            <Card className="p-4"><span className="text-xs text-muted-foreground">Ažurirano ove sedmice</span><p className="text-2xl font-bold">{sitemapItems.filter(s => s.changefreq === 'weekly').length}</p></Card>
          </div>
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Sitemap.xml pregled</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead className="text-xs">URL</TableHead><TableHead className="text-xs">Prioritet</TableHead><TableHead className="text-xs">Učestalost</TableHead><TableHead className="text-xs">Zadnja izmena</TableHead></TableRow></TableHeader><TableBody>
            {sitemapItems.map((s, i) => <TableRow key={i}><TableCell className="text-xs font-mono">{s.url}</TableCell><TableCell className="text-xs"><Badge variant="outline" className={s.priority >= 0.8 ? 'border-green-500 text-green-600' : 'border-muted text-muted-foreground'}>{s.priority}</Badge></TableCell><TableCell className="text-xs">{s.changefreq}</TableCell><TableCell className="text-xs text-muted-foreground">{s.lastMod}</TableCell></TableRow>)}
          </TableBody></Table><div className="mt-4 p-3 bg-muted/50 rounded-lg"><code className="text-[10px] text-muted-foreground block whitespace-pre">{'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + sitemapItems.map(s => `  <url><loc>https://reflection.business${s.url}</loc><priority>${s.priority}</priority><changefreq>${s.changefreq}</changefreq><lastmod>${s.lastMod}</lastmod></url>`).join('\n') + '\n</urlset>'}</code></div></CardContent></Card>
        </div>
      )}

      {seoSubTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4"><span className="text-xs text-muted-foreground">Prosečno čitanje</span><p className="text-xl font-bold">{analytics.avgReadingTime} min</p></Card>
            <Card className="p-4"><span className="text-xs text-muted-foreground">Prosečno reči</span><p className="text-xl font-bold">{analytics.avgWordCount}</p></Card>
            <Card className="p-4"><span className="text-xs text-muted-foreground">Aktivnih autora</span><p className="text-xl font-bold">{analytics.authors.length}</p></Card>
            <Card className="p-4"><span className="text-xs text-muted-foreground">Kategorija</span><p className="text-xl font-bold">{analytics.categoryStats.length}</p></Card>
          </div>
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><Users className="h-4 w-4" /> Autori — rang lista</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead className="text-xs">Autor</TableHead><TableHead className="text-xs text-center">Objavljeno</TableHead><TableHead className="text-xs text-center">Nacrta</TableHead><TableHead className="text-xs text-right">Pregledi</TableHead><TableHead className="text-xs text-right">Ukupno reči</TableHead></TableRow></TableHeader><TableBody>
            {analytics.authors.map((a, i) => <TableRow key={a.name}><TableCell className="text-xs font-medium"><div className="flex items-center gap-2"><div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{a.avatar}</div>{a.name}</div></TableCell><TableCell className="text-xs text-center"><Badge variant="outline" className="text-[10px]">{a.published}</Badge></TableCell><TableCell className="text-xs text-center"><Badge variant="outline" className="text-[10px]">{a.drafts}</Badge></TableCell><TableCell className="text-xs text-right font-bold">{a.totalViews.toLocaleString()}</TableCell><TableCell className="text-xs text-right">{a.totalWords.toLocaleString()}</TableCell></TableRow>)}
          </TableBody></Table></CardContent></Card>
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><Tag className="h-4 w-4" /> Distribucija po kategorijama</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={250}><BarChart data={analytics.categoryStats}><CartesianGrid strokeDasharray="3 3" className="opacity-30" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip><Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} /></Tooltip></BarChart></ResponsiveContainer></CardContent></Card>
        </div>
      )}
    </div>
  )
}
