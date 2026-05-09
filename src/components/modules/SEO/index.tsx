'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Globe, TrendingUp, Eye, MousePointerClick, FileText, ArrowUpRight, AlertTriangle, CheckCircle2, BarChart3, ExternalLink, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/helpers'

interface SeoPage {
  id: string
  url: string
  title: string
  metaDescription: string
  keywords: string
  status: 'indexed' | 'not_indexed' | 'pending' | 'error'
  score: number
  lastCrawled: string | null
  clicks: number
  impressions: number
  ctr: number
  position: number
  wordCount: number
}

interface Keyword {
  id: string
  keyword: string
  position: number
  change: number
  volume: number
  url: string
  difficulty: 'easy' | 'medium' | 'hard'
}

const INITIAL_PAGES: SeoPage[] = [
  { id: '1', url: '/', title: 'Reflection Business — ERP Sistem za Srbiju', metaDescription: 'Kompletni ERP sistem za preduzeća u Srbiji. Knjigovodstvo, fakture, CRM, inventory...', keywords: 'erp srbija, knjigovodstvo, fakturisanje', status: 'indexed', score: 92, lastCrawled: '2024-06-15T08:00:00', clicks: 342, impressions: 2100, ctr: 16.3, position: 4.2, wordCount: 1250 },
  { id: '2', url: '/cenovnik', title: 'Cenovnik — Reflection Business ERP', metaDescription: 'Pregled cena za sve module Reflection Business ERP sistema.', keywords: 'erp cenovnik, cena erp', status: 'indexed', score: 78, lastCrawled: '2024-06-14T10:00:00', clicks: 128, impressions: 890, ctr: 14.4, position: 5.8, wordCount: 680 },
  { id: '3', url: '/kontakt', title: 'Kontakt — Reflection Business', metaDescription: 'Kontaktirajte nas za demo ili ponudu ERP sistema.', keywords: 'kontakt erp, demo', status: 'indexed', score: 65, lastCrawled: '2024-06-13T09:00:00', clicks: 89, impressions: 560, ctr: 15.9, position: 7.1, wordCount: 320 },
  { id: '4', url: '/blog/erp-srbija-vodic', title: 'Kompletni vodič za ERP u Srbiji', metaDescription: 'Sve što trebate da znate o implementaciji ERP sistema...', keywords: 'erp vodič, erp srbija', status: 'indexed', score: 88, lastCrawled: '2024-06-15T07:00:00', clicks: 567, impressions: 4500, ctr: 12.6, position: 2.8, wordCount: 2400 },
  { id: '5', url: '/funkcije', title: 'Funkcije — Reflection Business', metaDescription: 'Pregled svih funkcija ERP sistema.', keywords: 'erp funkcije, moduli', status: 'not_indexed', score: 45, lastCrawled: '2024-06-12T11:00:00', clicks: 0, impressions: 120, ctr: 0, position: 28.5, wordCount: 450 },
  { id: '6', url: '/onama', title: 'O nama — Reflection Business', metaDescription: 'Upoznajte Reflection Business tim i istoriju kompanije.', keywords: 'o nama, reflection', status: 'indexed', score: 72, lastCrawled: '2024-06-14T08:00:00', clicks: 45, impressions: 340, ctr: 13.2, position: 8.4, wordCount: 520 },
]

const INITIAL_KEYWORDS: Keyword[] = [
  { id: '1', keyword: 'erp srbija', position: 3, change: 1, volume: 1900, url: '/', difficulty: 'hard' },
  { id: '2', keyword: 'knjigovodstveni program', position: 5, change: -1, volume: 2400, url: '/', difficulty: 'hard' },
  { id: '3', keyword: 'fakturisanje online', position: 2, change: 2, volume: 880, url: '/funkcije', difficulty: 'medium' },
  { id: '4', keyword: 'erp vodič', position: 1, change: 0, volume: 590, url: '/blog/erp-srbija-vodic', difficulty: 'easy' },
  { id: '5', keyword: 'crm za mala preduzeća', position: 7, change: 3, volume: 720, url: '/funkcije', difficulty: 'medium' },
  { id: '6', keyword: 'inventar program', position: 12, change: -2, volume: 480, url: '/funkcije', difficulty: 'medium' },
  { id: '7', keyword: 'poslovni softver srbija', position: 4, change: 1, volume: 320, url: '/', difficulty: 'easy' },
  { id: '8', keyword: 'rabat sistem', position: 9, change: 5, volume: 210, url: '/funkcije', difficulty: 'easy' },
]

function getScoreColor(score: number) {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-amber-600'
  return 'text-red-600'
}

function getStatusBadge(status: string) {
  const map: Record<string, { color: string; label: string }> = {
    indexed: { color: 'bg-emerald-100 text-emerald-800', label: 'Indeksirana' },
    not_indexed: { color: 'bg-red-100 text-red-800', label: 'Nije indeksirana' },
    pending: { color: 'bg-amber-100 text-amber-800', label: 'Na čekanju' },
    error: { color: 'bg-red-100 text-red-800', label: 'Greška' },
  }
  const s = map[status] || map.pending
  return <Badge className={`${s.color} text-xs`}>{s.label}</Badge>
}

function getDiffBadge(d: string) {
  const map: Record<string, { color: string; label: string }> = { easy: { color: 'bg-emerald-100 text-emerald-800', label: 'Lako' }, medium: { color: 'bg-amber-100 text-amber-800', label: 'Srednje' }, hard: { color: 'bg-red-100 text-red-800', label: 'Teško' } }
  const s = map[d] || map.medium
  return <Badge className={`${s.color} text-xs`}>{s.label}</Badge>
}

export function SEO() {
  const { activeCompanyId } = useAppStore()
  const [pages, setPages] = useState<SeoPage[]>([])
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('pages')

  const loadData = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/seo-pages?companyId=${activeCompanyId}`)
      if (res.ok) { const json = await res.json(); setPages(json.items || []) }
    } catch (err) { console.error('Failed to load SEO pages:', err) }
    setLoading(false)
  }, [activeCompanyId])

  useEffect(() => { loadData() }, [loadData])

  const totalClicks = pages.reduce((s, p) => s + p.clicks, 0)
  const totalImpressions = pages.reduce((s, p) => s + p.impressions, 0)
  const avgCtr = pages.length > 0 ? (pages.reduce((s, p) => s + p.ctr, 0) / pages.length).toFixed(1) : '0'
  const avgPosition = pages.length > 0 ? (pages.reduce((s, p) => s + p.position, 0) / pages.length).toFixed(1) : '0'

  const filteredPages = pages.filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.url.includes(search))
  const filteredKeywords = keywords.filter(k => !search || k.keyword.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Globe className="h-6 w-6" />SEO Optimizacija</h1><p className="text-sm text-muted-foreground">Praćenje SEO performansi, ključnih reči i indeksiranja</p></div>
        <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-9 w-56 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Eye className="h-3.5 w-3.5" />Klikovi</div><p className="text-2xl font-bold">{totalClicks.toLocaleString()}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><FileText className="h-3.5 w-3.5" />Impresije</div><p className="text-2xl font-bold">{totalImpressions.toLocaleString()}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><MousePointerClick className="h-3.5 w-3.5" />CTR</div><p className="text-2xl font-bold">{avgCtr}%</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><TrendingUp className="h-3.5 w-3.5" />Prosečna pozicija</div><p className="text-2xl font-bold">{avgPosition}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-emerald-600 mb-1"><CheckCircle2 className="h-3.5 w-3.5" />Indeksirane</div><p className="text-2xl font-bold text-emerald-700">{pages.filter(p => p.status === 'indexed').length}/{pages.length}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><BarChart3 className="h-3.5 w-3.5" />Ključne reči</div><p className="text-2xl font-bold">{keywords.length}</p></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList><TabsTrigger value="pages" className="gap-1.5"><Globe className="h-3.5 w-3.5" />Stranice</TabsTrigger><TabsTrigger value="keywords" className="gap-1.5"><Search className="h-3.5 w-3.5" />Ključne reči</TabsTrigger></TabsList>

        <TabsContent value="pages">
          <Card>
            <CardContent className="pt-6">
              <div className="max-h-[520px] overflow-y-auto">
                <Table>
                  <TableHeader><TableRow><TableHead className="text-xs">Stranica</TableHead><TableHead className="text-xs hidden md:table-cell">Status</TableHead><TableHead className="text-xs hidden sm:table-cell">Skor</TableHead><TableHead className="text-xs hidden sm:table-cell">Klikovi</TableHead><TableHead className="text-xs hidden md:table-cell">Impresije</TableHead><TableHead className="text-xs hidden lg:table-cell">CTR</TableHead><TableHead className="text-xs hidden lg:table-cell">Pozicija</TableHead><TableHead className="text-xs hidden lg:table-cell">Reči</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredPages.map(page => (
                      <TableRow key={page.id}>
                        <TableCell><div><p className="text-xs font-medium">{page.title}</p><p className="text-xs text-muted-foreground font-mono">{page.url}</p></div></TableCell>
                        <TableCell className="hidden md:table-cell">{getStatusBadge(page.status)}</TableCell>
                        <TableCell className="hidden sm:table-cell"><span className={`text-xs font-bold ${getScoreColor(page.score)}`}>{page.score}/100</span></TableCell>
                        <TableCell className="hidden sm:table-cell text-xs font-medium">{page.clicks}</TableCell>
                        <TableCell className="hidden md:table-cell text-xs">{page.impressions.toLocaleString()}</TableCell>
                        <TableCell className="hidden lg:table-cell text-xs">{page.ctr}%</TableCell>
                        <TableCell className="hidden lg:table-cell text-xs font-mono">#{page.position}</TableCell>
                        <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{page.wordCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords">
          <Card>
            <CardContent className="pt-6">
              <div className="max-h-[520px] overflow-y-auto">
                <Table>
                  <TableHeader><TableRow><TableHead className="text-xs">Ključna reč</TableHead><TableHead className="text-xs">Pozicija</TableHead><TableHead className="text-xs hidden sm:table-cell">Promena</TableHead><TableHead className="text-xs hidden md:table-cell">Zapremina</TableHead><TableHead className="text-xs hidden lg:table-cell">Težina</TableHead><TableHead className="text-xs hidden lg:table-cell">URL</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredKeywords.map(kw => (
                      <TableRow key={kw.id}>
                        <TableCell className="text-xs font-medium">{kw.keyword}</TableCell>
                        <TableCell><span className="text-xs font-bold font-mono">#{kw.position}</span></TableCell>
                        <TableCell className="hidden sm:table-cell"><span className={`text-xs font-medium ${kw.change > 0 ? 'text-emerald-600' : kw.change < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>{kw.change > 0 ? `↑${kw.change}` : kw.change < 0 ? `↓${Math.abs(kw.change)}` : '—'}</span></TableCell>
                        <TableCell className="hidden md:table-cell text-xs">{kw.volume}/mes</TableCell>
                        <TableCell className="hidden lg:table-cell">{getDiffBadge(kw.difficulty)}</TableCell>
                        <TableCell className="hidden lg:table-cell text-xs font-mono text-muted-foreground">{kw.url}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
