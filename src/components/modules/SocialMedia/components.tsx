'use client'

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
  Share2, Search, Eye, Trash2, RefreshCw,
  CheckCircle2, Clock, BarChart3, Heart,
  CalendarDays
} from 'lucide-react'
import type { SocialPost, DashboardData, PostFormData } from './types'
import { platformConfig, statusConfig } from './data'

export function OverviewTabContent({ dashboard }: { dashboard: DashboardData | null }) {
  if (!dashboard) {
    return (
      <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
    )
  }

  return (
    <div className="space-y-6">
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
    </div>
  )
}

export function PostsTabContent({
  posts, search, setSearch, platformFilter, setPlatformFilter, statusFilter, setStatusFilter, onView, onDelete,
}: {
  posts: SocialPost[]
  search: string
  setSearch: (s: string) => void
  platformFilter: string
  setPlatformFilter: (s: string) => void
  statusFilter: string
  setStatusFilter: (s: string) => void
  onView: (post: SocialPost) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="space-y-4">
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
      {posts.length === 0 ? (
        <Card className="p-8 text-center"><Share2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground" /><p className="text-muted-foreground">Nema objava</p></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((p) => {
            const platCfg = platformConfig[p.platform]
            const statCfg = statusConfig[p.status]
            return (
              <Card key={p.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{platCfg?.icon}</span>
                      <Badge variant="outline" className={platCfg?.color}>{platCfg?.label}</Badge>
                      <Badge variant="outline" className={`text-[10px] ${statCfg?.color}`}>{statCfg?.label}</Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onView(p)}><Eye className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => onDelete(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
    </div>
  )
}

export function CalendarTabContent() {
  return (
    <div className="space-y-4">
      <Card className="p-8 text-center">
        <CalendarDays className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground">Content kalendar</p>
        <p className="text-xs text-muted-foreground mt-1">Pregled zakazanih objava po datumu</p>
      </Card>
    </div>
  )
}

export function SocialMediaTabs({
  activeTab, setActiveTab,
  dashboard, filteredPosts, search, setSearch, platformFilter, setPlatformFilter, statusFilter, setStatusFilter,
  onViewPost, onDeletePost, loadPosts,
}: {
  activeTab: string
  setActiveTab: (t: string) => void
  dashboard: DashboardData | null
  filteredPosts: SocialPost[]
  search: string
  setSearch: (s: string) => void
  platformFilter: string
  setPlatformFilter: (s: string) => void
  statusFilter: string
  setStatusFilter: (s: string) => void
  onViewPost: (post: SocialPost) => void
  onDeletePost: (id: string) => void
  loadPosts: () => void
}) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
        <TabsTrigger value="posts"><Share2 className="h-4 w-4 mr-1" /> Objave</TabsTrigger>
        <TabsTrigger value="calendar"><CalendarDays className="h-4 w-4 mr-1" /> Kalendar</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <OverviewTabContent dashboard={dashboard} />
      </TabsContent>

      <TabsContent value="posts" className="space-y-4">
        <PostsTabContent
          posts={filteredPosts}
          search={search} setSearch={setSearch}
          platformFilter={platformFilter} setPlatformFilter={setPlatformFilter}
          statusFilter={statusFilter} setStatusFilter={setStatusFilter}
          onView={onViewPost}
          onDelete={onDeletePost}
        />
      </TabsContent>

      <TabsContent value="calendar" className="space-y-4">
        <CalendarTabContent />
      </TabsContent>
    </Tabs>
  )
}

export function CreatePostDialog({
  open, onOpenChange, form, setForm, onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: PostFormData
  setForm: (f: PostFormData) => void
  onCreate: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>Otkaži</Button>
          <Button onClick={onCreate}><Share2 className="h-4 w-4 mr-1" /> Kreiraj</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function PostDetailDialog({
  open, onOpenChange, selected,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  selected: SocialPost | null
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
  )
}
