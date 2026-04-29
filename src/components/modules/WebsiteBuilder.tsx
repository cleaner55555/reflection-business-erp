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
  Globe2, Plus, Search, Eye, Trash2, Edit3, RefreshCw,
  CheckCircle2, Clock, BarChart3, ExternalLink, FileCode,
  Layout, Palette, Type, Image, Settings
} from 'lucide-react'

interface Page {
  id: string
  title: string
  slug: string
  type: string
  status: string
  seoTitle?: string
  updatedAt?: string
  createdAt: string
}

const pageTypeConfig: Record<string, { label: string; color: string }> = {
  home: { label: 'Početna', color: 'bg-green-100 text-green-700' },
  about: { label: 'O nama', color: 'bg-blue-100 text-blue-700' },
  contact: { label: 'Kontakt', color: 'bg-amber-100 text-amber-700' },
  product: { label: 'Proizvodi', color: 'bg-purple-100 text-purple-700' },
  blog: { label: 'Blog', color: 'bg-pink-100 text-pink-700' },
  custom: { label: 'Custom', color: 'bg-gray-100 text-gray-700' },
}

const statusConfig: Record<string, { label: string; color: string }> = {
  published: { label: 'Objavljeno', color: 'bg-green-100 text-green-700' },
  draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-700' },
  archived: { label: 'Arhivirano', color: 'bg-gray-200 text-gray-500' },
}

export function WebsiteBuilder() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [pages, setPages] = useState<Page[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const emptyForm = { title: '', slug: '', type: 'custom', status: 'draft' }
  const [form, setForm] = useState(emptyForm)

  const loadPages = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/website/pages?companyId=${activeCompanyId}&limit=100`)
      if (res.ok) {
        const data = await res.json()
        setPages(data.items || data || [])
      }
    } catch { /* silent */ }
    setLoading(false)
  }, [activeCompanyId])

  useEffect(() => { loadPages() }, [activeCompanyId, loadPages])

  const publishedPages = pages.filter((p) => p.status === 'published').length

  const filtered = pages.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleCreate = async () => {
    if (!activeCompanyId) return
    const slug = form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    try {
      const res = await fetch('/api/website/pages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...form, slug }),
      })
      if (res.ok) { setDialogOpen(false); setForm(emptyForm); loadPages() }
    } catch { /* silent */ }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati stranicu?')) return
    try {
      const res = await fetch(`/api/website/pages?id=${id}`, { method: 'DELETE' })
      if (res.ok) loadPages()
    } catch { /* silent */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Website</h1>
          <p className="text-sm text-muted-foreground">Kreiranje i upravljanje veb stranicama</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadPages}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Nova stranica</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="pages"><FileCode className="h-4 w-4 mr-1" /> Stranice</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="h-4 w-4 mr-1" /> Podešavanja</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Stranice</span><FileCode className="h-4 w-4 text-muted-foreground" /></div><p className="text-2xl font-bold">{pages.length}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Objavljene</span><CheckCircle2 className="h-4 w-4 text-green-500" /></div><p className="text-2xl font-bold text-green-600">{publishedPages}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Nacrti</span><Clock className="h-4 w-4 text-amber-500" /></div><p className="text-2xl font-bold text-amber-600">{pages.length - publishedPages}</p></Card>
          </div>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Funkcionalnosti website builder-a</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { icon: Layout, label: 'Drag & Drop editor', desc: 'Vizuelno uređivanje stranica' },
                  { icon: Palette, label: 'Teme', desc: 'Predlošci i boje' },
                  { icon: Type, label: 'SEO', desc: 'Meta tagovi i sitemap' },
                  { icon: Image, label: 'Media', desc: 'Slike, video, dokumenta' },
                  { icon: Globe2, label: 'Multi-jezik', desc: '80+ jezika podržano' },
                  { icon: Settings, label: 'Custom domeni', desc: 'CNAME i SSL' },
                ].map((item) => (
                  <div key={item.label} className="p-3 border rounded-lg text-center">
                    <item.icon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži stranice..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          {loading ? (<div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>) : filtered.length === 0 ? (
            <Card className="p-8 text-center"><Globe2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground" /><p className="text-muted-foreground">Nema stranica</p><Button variant="outline" className="mt-3" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Kreiraj stranicu</Button></Card>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr className="text-left text-xs text-muted-foreground">
                  <th className="p-3">Naziv</th><th className="p-3">URL</th><th className="p-3">Tip</th><th className="p-3">Status</th><th className="p-3">Akcije</th>
                </tr></thead>
                <tbody>{filtered.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-muted/30">
                    <td className="p-3 font-medium">{p.title}</td>
                    <td className="p-3 text-xs text-muted-foreground">/{p.slug}</td>
                    <td className="p-3"><Badge variant="outline" className={`text-[10px] ${pageTypeConfig[p.type]?.color}`}>{pageTypeConfig[p.type]?.label}</Badge></td>
                    <td className="p-3"><Badge variant="outline" className={`text-[10px] ${statusConfig[p.status]?.color}`}>{statusConfig[p.status]?.label}</Badge></td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7"><Edit3 className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Podešavanja sajta</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Naziv sajta</Label><Input placeholder="Naziv vašeg sajta" /></div>
                <div className="space-y-2"><Label>Domain</Label><Input placeholder="vas-sajt.rs" /></div>
                <div className="space-y-2"><Label>Favicon</Label><Input type="file" /></div>
                <div className="space-y-2"><Label>Google Analytics</Label><Input placeholder="UA-XXXXX" /></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Nova stranica</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Naziv</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} placeholder="Naziv stranice" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>URL slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="url-slug" /></div>
              <div className="space-y-2"><Label>Tip</Label><Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(pageTypeConfig).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}</SelectContent></Select></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleCreate}><Plus className="h-4 w-4 mr-1" /> Kreiraj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
