'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Globe, Eye, FileText, MousePointerClick, TrendingUp, CheckCircle2, BarChart3 } from 'lucide-react'
import type { SeoPage, Keyword } from './types'

export function getScoreColor(score: number) {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-amber-600'
  return 'text-red-600'
}

export function getStatusBadge(status: string) {
  const map: Record<string, { color: string; label: string }> = {
    indexed: { color: 'bg-emerald-100 text-emerald-800', label: 'Indeksirana' },
    not_indexed: { color: 'bg-red-100 text-red-800', label: 'Nije indeksirana' },
    pending: { color: 'bg-amber-100 text-amber-800', label: 'Na čekanju' },
    error: { color: 'bg-red-100 text-red-800', label: 'Greška' },
  }
  const s = map[status] || map.pending
  return <Badge className={`${s.color} text-[10px]`}>{s.label}</Badge>
}

export function getDiffBadge(d: string) {
  const map: Record<string, { color: string; label: string }> = { easy: { color: 'bg-emerald-100 text-emerald-800', label: 'Lako' }, medium: { color: 'bg-amber-100 text-amber-800', label: 'Srednje' }, hard: { color: 'bg-red-100 text-red-800', label: 'Teško' } }
  const s = map[d] || map.medium
  return <Badge className={`${s.color} text-[10px]`}>{s.label}</Badge>
}

interface SeoStats {
  totalClicks: number
  totalImpressions: number
  avgCtr: string
  avgPosition: string
  indexedCount: number
  totalPages: number
  keywordsCount: number
}

export function KpiCards({ stats }: { stats: SeoStats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Eye className="h-3.5 w-3.5" />Klikovi</div><p className="text-2xl font-bold">{stats.totalClicks.toLocaleString()}</p></Card>
      <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><FileText className="h-3.5 w-3.5" />Impresije</div><p className="text-2xl font-bold">{stats.totalImpressions.toLocaleString()}</p></Card>
      <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><MousePointerClick className="h-3.5 w-3.5" />CTR</div><p className="text-2xl font-bold">{stats.avgCtr}%</p></Card>
      <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><TrendingUp className="h-3.5 w-3.5" />Prosečna pozicija</div><p className="text-2xl font-bold">{stats.avgPosition}</p></Card>
      <Card className="p-4"><div className="flex items-center gap-2 text-xs text-emerald-600 mb-1"><CheckCircle2 className="h-3.5 w-3.5" />Indeksirane</div><p className="text-2xl font-bold text-emerald-700">{stats.indexedCount}/{stats.totalPages}</p></Card>
      <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><BarChart3 className="h-3.5 w-3.5" />Ključne reči</div><p className="text-2xl font-bold">{stats.keywordsCount}</p></Card>
    </div>
  )
}

export function PagesTable({ filteredPages }: { filteredPages: SeoPage[] }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="max-h-[520px] overflow-y-auto">
          <Table>
            <TableHeader><TableRow><TableHead className="text-xs">Stranica</TableHead><TableHead className="text-xs hidden md:table-cell">Status</TableHead><TableHead className="text-xs hidden sm:table-cell">Skor</TableHead><TableHead className="text-xs hidden sm:table-cell">Klikovi</TableHead><TableHead className="text-xs hidden md:table-cell">Impresije</TableHead><TableHead className="text-xs hidden lg:table-cell">CTR</TableHead><TableHead className="text-xs hidden lg:table-cell">Pozicija</TableHead><TableHead className="text-xs hidden lg:table-cell">Reči</TableHead></TableRow></TableHeader>
            <TableBody>
              {filteredPages.map(page => (
                <TableRow key={page.id}>
                  <TableCell><div><p className="text-xs font-medium">{page.title}</p><p className="text-[10px] text-muted-foreground font-mono">{page.url}</p></div></TableCell>
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
  )
}

export function KeywordsTable({ filteredKeywords }: { filteredKeywords: Keyword[] }) {
  return (
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
                  <TableCell className="hidden lg:table-cell text-[10px] font-mono text-muted-foreground">{kw.url}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export function HeaderSection({
  search,
  onSearchChange,
}: {
  search: string
  onSearchChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div><h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Globe className="h-6 w-6" />SEO Optimizacija</h1><p className="text-sm text-muted-foreground">Praćenje SEO performansi, ključnih reči i indeksiranja</p></div>
      <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Pretraga..." className="pl-8 h-9 w-56 text-xs" value={search} onChange={e => onSearchChange(e.target.value)} /></div>
    </div>
  )
}

export function SeoTabs({
  tab,
  onTabChange,
  filteredPages,
  filteredKeywords,
}: {
  tab: string
  onTabChange: (v: string) => void
  filteredPages: SeoPage[]
  filteredKeywords: Keyword[]
}) {
  return (
    <Tabs value={tab} onValueChange={onTabChange} className="space-y-4">
      <TabsList><TabsTrigger value="pages" className="gap-1.5"><Globe className="h-3.5 w-3.5" />Stranice</TabsTrigger><TabsTrigger value="keywords" className="gap-1.5"><Search className="h-3.5 w-3.5" />Ključne reči</TabsTrigger></TabsList>
      <TabsContent value="pages"><PagesTable filteredPages={filteredPages} /></TabsContent>
      <TabsContent value="keywords"><KeywordsTable filteredKeywords={filteredKeywords} /></TabsContent>
    </Tabs>
  )
}
