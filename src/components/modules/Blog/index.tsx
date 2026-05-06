import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { RefreshCw, BarChart3, FileText, Tag, MessageSquare, Star, Globe } from 'lucide-react'
import type * as Types from './types'
import * as Data from './data'
import { getAuthorName, getCategoryName, getCategoryColor, emptyPostForm, generateMonthlyTrend, generateReadingTimeTrend, PregledTab, ClanciTab, KategorijeTab, KomentariTab, TagoviTab, SeoAnalitikaTab } from './components'

export function BlogModul() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [comments, setComments] = useState<BlogComment[]>([])
  const [tags, setTags] = useState<BlogTag[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/blog/posts?companyId=${activeCompanyId}&limit=100`)
      if (res.ok) {
        const data = await res.json()
        const items = data.items || data || []
        if (items.length > 0) {
          setPosts(items as BlogPost[])
        } else {
          setPosts(mockPosts)
        }
      } else {
        setPosts(mockPosts)
      }
    } catch {
      setPosts(mockPosts)
    }
    setCategories(mockCategories)
    setComments(mockComments)
    setTags(mockTags)
    setLoading(false)
  }, [activeCompanyId])

  useEffect(() => { loadData() }, [activeCompanyId, loadData])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('blog.title') || 'Blog'}</h1>
          <p className="text-sm text-muted-foreground">{t('blog.subtitle') || 'Članci, vesti i sadržaj marketing'}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-1" /> {t('blog.refresh') || 'Osveži'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1 hidden sm:inline" /> {t('blog.overview') || 'Pregled'}</TabsTrigger>
          <TabsTrigger value="posts"><FileText className="h-4 w-4 mr-1 hidden sm:inline" /> {t('blog.posts') || 'Članci'}</TabsTrigger>
          <TabsTrigger value="categories"><Tag className="h-4 w-4 mr-1 hidden sm:inline" /> {t('blog.categories') || 'Kategorije'}</TabsTrigger>
          <TabsTrigger value="comments"><MessageSquare className="h-4 w-4 mr-1 hidden sm:inline" /> {t('blog.comments') || 'Komentari'}</TabsTrigger>
          <TabsTrigger value="tags"><Star className="h-4 w-4 mr-1 hidden sm:inline" /> {t('blog.tags') || 'Tagovi'}</TabsTrigger>
          <TabsTrigger value="seo"><Globe className="h-4 w-4 mr-1 hidden sm:inline" /> {t('blog.seo') || 'SEO Analitika'}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <PregledTab posts={posts} categories={categories} comments={comments} tags={tags} />
        </TabsContent>
        <TabsContent value="posts">
          <ClanciTab posts={posts} setPosts={setPosts} categories={categories} tags={tags} />
        </TabsContent>
        <TabsContent value="categories">
          <KategorijeTab categories={categories} setCategories={setCategories} posts={posts} />
        </TabsContent>
        <TabsContent value="comments">
          <KomentariTab comments={comments} setComments={setComments} posts={posts} />
        </TabsContent>
        <TabsContent value="tags">
          <TagoviTab tags={tags} setTags={setTags} posts={posts} />
        </TabsContent>
        <TabsContent value="seo">
          <SeoAnalitikaTab posts={posts} categories={categories} />
        </TabsContent>
      </Tabs>
    </div>
  )
}