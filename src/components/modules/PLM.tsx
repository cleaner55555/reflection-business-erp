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
  GitBranch, Plus, Search, Eye, Trash2, RefreshCw,
  CheckCircle2, Clock, BarChart3, FileCode, Layers,
  AlertCircle, ArrowRight, Package, Users
} from 'lucide-react'

interface PLMProduct {
  id: string
  name: string
  version: string
  status: string
  category?: string
  engineeringBom?: boolean
  changes?: string
  createdAt: string
  updatedAt?: string
}

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-700' },
  active: { label: 'Aktivan', color: 'bg-green-100 text-green-700' },
  under_review: { label: 'Na pregledu', color: 'bg-amber-100 text-amber-700' },
  obsolete: { label: Zastareo', color: 'bg-red-100 text-red-700' },
}

export function PLM() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [products, setProducts] = useState<PLMProduct[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<PLMProduct | null>(null)

  const emptyForm = { name: '', version: '1.0', status: 'draft', category: '', changes: '' }
  const [form, setForm] = useState(emptyForm)

  const loadProducts = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    const demo: PLMProduct[] = [
      { id: '1', name: 'Proizvod A - Elektronska kontrola', version: '2.1.3', status: 'active', category: 'Elektronika', engineeringBom: true, changes: 'Dodat novi senzor temperature', createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: '2', name: 'Proizvod B - Mehanički sklop', version: '1.0.0', status: 'under_review', category: 'Mehanika', engineeringBom: true, changes: 'ECO-001: Promena materijala osovine', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString() },
      { id: '3', name: 'Proizvod C - Softverski modul', version: '3.2.1', status: 'active', category: 'Software', engineeringBom: false, changes: 'Bugfix za v3.2', createdAt: new Date(Date.now() - 86400000 * 15).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 3).toISOString() },
      { id: '4', name: 'Proizvod D - Pakovanje', version: '1.1.0', status: 'draft', category: 'Dizajn', engineeringBom: false, changes: 'Novi dizaj kutije', createdAt: new Date(Date.now() - 86400000).toISOString() },
    ]
    setProducts(demo)
    setLoading(false)
  }, [activeCompanyId])

  useEffect(() => { loadProducts() }, [activeCompanyId, loadProducts])

  const activeProducts = products.filter((p) => p.status === 'active').length
  const underReview = products.filter((p) => p.status === 'under_review').length
  const obsoleteProducts = products.filter((p) => p.status === 'obsolete').length
  const allCategories = [...new Set(products.map((p) => p.category).filter(Boolean))]

  const filtered = products.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleCreate = async () => {
    if (!activeCompanyId) return
    setProducts([{ id: `temp-${Date.now()}`, ...form, createdAt: new Date().toISOString() }, ...products])
    setDialogOpen(false)
    setForm(emptyForm)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati proizvod?')) return
    setProducts(products.filter((p) => p.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">PLM</h1>
          <p className="text-sm text-muted-foreground">Product Lifecycle Management - upravljanje životnim ciklusom proizvoda</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadProducts}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Novi proizvod</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="products"><Package className="h-4 w-4 mr-1" /> Proizvodi</TabsTrigger>
          <TabsTrigger value="eco"><FileCode className="h-4 w-4 mr-1" /> ECO</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Proizvoda</span><Package className="h-4 w-4 text-muted-foreground" /></div><p className="text-2xl font-bold">{products.length}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Aktivnih</span><CheckCircle2 className="h-4 w-4 text-green-500" /></div><p className="text-2xl font-bold text-green-600">{activeProducts}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Na pregledu</span><AlertCircle className="h-4 w-4 text-amber-500" /></div><p className="text-2xl font-bold text-amber-600">{underReview}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Zastarelih</span><Clock className="h-4 w-4 text-red-500" /></div><p className="text-2xl font-bold text-red-600">{obsoleteProducts}</p></Card>
          </div>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">PLM proces</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { icon: Layers, label: 'EBOM', desc: 'Inženjerski BOM sa specifikacijama' },
                  { icon: AlertCircle, label: 'ECO', desc: 'Engineering Change Orders za promene' },
                  { icon: GitBranch, label: 'Verzije', desc: 'Praćenje verzija i revizija' },
                  { icon: FileCode, label: 'Dokumentacija', desc: 'Specifikacije, crteži, manuali' },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2"><item.icon className="h-6 w-6 text-primary" /></div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži proizvode..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          <div className="space-y-2">
            {filtered.map((p) => {
              const cfg = statusConfig[p.status]
              return (
                <Card key={p.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => { setSelected(p); setDetailOpen(true) }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{p.name}</span>
                          <Badge variant="outline" className="text-[10px] bg-gray-100">v{p.version}</Badge>
                          <Badge variant="outline" className={`text-[10px] ${cfg?.color}`}>{cfg?.label}</Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          {p.category && <span>{p.category}</span>}
                          <span>v{p.version}</span>
                          <span>{new Date(p.createdAt).toLocaleDateString('sr-RS')}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(p.id) }}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="eco" className="space-y-4">
          <Card className="p-8 text-center">
            <FileCode className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">Engineering Change Orders</p>
            <p className="text-xs text-muted-foreground mt-1">Upravljanje inženjerskim promenama (ECO)</p>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Novi proizvod</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Naziv</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Verzija</Label><Input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} /></div>
              <div className="space-y-2"><Label>Kategorija</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="npr. Elektronika" /></div>
            </div>
            <div className="space-y-2"><Label>Opis promena</Label><Textarea value={form.changes} onChange={(e) => setForm({ ...form, changes: e.target.value })} rows={3} placeholder="Opis promena za ovu verziju..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleCreate}><Plus className="h-4 w-4 mr-1" /> Kreiraj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selected?.name}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Verzija:</span> <span className="font-medium">v{selected.version}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline" className={statusConfig[selected.status]?.color}>{statusConfig[selected.status]?.label}</Badge></div>
                <div><span className="text-muted-foreground">Kategorija:</span> {selected.category || '-'}</div>
                <div><span className="text-muted-foreground">Kreirano:</span> {new Date(selected.createdAt).toLocaleDateString('sr-RS')}</div>
              </div>
              {selected.changes && (<><Separator /><div><span className="text-sm font-medium">Poslednje promene:</span><p className="text-sm text-muted-foreground mt-1">{selected.changes}</p></div></>)}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
