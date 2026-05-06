'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Plus, RefreshCw, Share2 } from 'lucide-react'
import type { SocialPost, DashboardData } from './types'
import { emptyForm } from './data'
import { SocialMediaTabs, CreatePostDialog, PostDetailDialog } from './components'

export function DruštveneMreže() {
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

      <SocialMediaTabs
        activeTab={activeTab} setActiveTab={setActiveTab}
        dashboard={dashboard} filteredPosts={filteredPosts}
        search={search} setSearch={setSearch}
        platformFilter={platformFilter} setPlatformFilter={setPlatformFilter}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        onViewPost={(post) => { setSelected(post); setDetailOpen(true) }}
        onDeletePost={handleDelete}
        loadPosts={loadPosts}
      />

      <CreatePostDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        form={form}
        setForm={setForm}
        onCreate={handleCreate}
      />

      <PostDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        selected={selected}
      />
    </div>
  )
}
