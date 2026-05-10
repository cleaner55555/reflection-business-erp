'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
// Dialog removed - converted to inline Card
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import {
  FileText, Plus, Search, Eye, Trash2, Edit3, RefreshCw, CheckCircle2, Clock,
  BarChart3, TrendingUp, Users, Calendar, Tag, MessageSquare, Globe,
  Star, ArrowRight, Filter, Share2, AlertCircle, ArrowLeft
} from 'lucide-react'

// ============ INTERFACES ============

interface BlogPost {
  id: string
  title: string
  content: string
  categoryId: string
  authorId: string
  status: 'draft' | 'scheduled' | 'published' | 'archived'
  views: number
  commentCount: number
  tags: string[]
  featured: boolean
  seoTitle: string
  seoDescription: string
  publishedAt: string
  createdAt: string
  readingTime: number
}

interface BlogCategory {
  id: string
  name: string
  slug: string
  description: string
  postCount: number
  color: string
}

interface BlogComment {
  id: string
  authorName: string
  postId: string
  postTitle: string
  content: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  parentId: string | null
}

interface BlogTag {
  id: string
  name: string
  slug: string
  postCount: number
}

interface PostForm {
  title: string
  categoryId: string
  authorId: string
  content: string
  status: BlogPost['status']
  tags: string[]
  featured: boolean
  seoTitle: string
  seoDescription: string
  publishedAt: string
}

// ============ CONFIG ============

const postStatusConfig: Record<string, { label: string; color: string }> = {
  published: { label: 'Objavljeno', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  scheduled: { label: 'Zakazano', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  archived: { label: 'Arhivirano', color: 'bg-gray-200 text-gray-500 dark:bg-gray-800/50 dark:text-gray-400' },
}

const commentStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Na čekanju', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  approved: { label: 'Odobreno', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  rejected: { label: 'Odbijeno', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

const statusWorkflow = ['draft', 'scheduled', 'published', 'archived'] as const

const CHART_COLORS = ['#22c55e', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

// ============ MOCK DATA ============

const mockCategories: BlogCategory[] = [
  { id: 'cat-1', name: 'Tehnologija', slug: 'tehnologija', description: 'Vesti iz sveta tehnologije i IT sektora', postCount: 5, color: '#3b82f6' },
  { id: 'cat-2', name: 'Biznis', slug: 'biznis', description: 'Poslovni saveti, trendovi i analize tržišta', postCount: 3, color: '#22c55e' },
  { id: 'cat-3', name: 'Marketing', slug: 'marketing', description: 'Digitalni marketing, SEO i društvene mreže', postCount: 3, color: '#f59e0b' },
  { id: 'cat-4', name: 'Dizajn', slug: 'dizajn', description: 'UI/UX dizajn, grafika i kreativnost', postCount: 2, color: '#8b5cf6' },
  { id: 'cat-5', name: 'Razvoj', slug: 'razvoj', description: 'Programiranje, alati i metodologije', postCount: 4, color: '#ef4444' },
  { id: 'cat-6', name: 'Vodiči', slug: 'vodici', description: 'Praktični vodiči i tutorijali', postCount: 2, color: '#ec4899' },
]

const mockAuthors = [
  { id: 'auth-1', name: 'Marko Petrović' },
  { id: 'auth-2', name: 'Ana Jovanović' },
  { id: 'auth-3', name: 'Nikola Stanković' },
  { id: 'auth-4', name: 'Jelena Milić' },
]

const mockPosts: BlogPost[] = [
  { id: 'post-1', title: 'Kako napraviti SEO strategiju za 2025', content: 'SEO je ključan za online vidljivost. U ovom članku ćemo pokriti najnovije trendove...', categoryId: 'cat-3', authorId: 'auth-1', status: 'published', views: 4520, commentCount: 8, tags: ['tag-1', 'tag-3', 'tag-5'], featured: true, seoTitle: 'SEO Strategija 2025 - Kompletni vodič', seoDescription: 'Naučite kako da kreirate efikasnu SEO strategiju za 2025 godinu.', publishedAt: '2025-01-15T10:00:00Z', createdAt: '2025-01-14T08:00:00Z', readingTime: 8 },
  { id: 'post-2', title: 'Uvod u React Server Components', content: 'React Server Components donose novi paradigma u React razvoj...', categoryId: 'cat-5', authorId: 'auth-2', status: 'published', views: 3890, commentCount: 12, tags: ['tag-2', 'tag-4'], featured: true, seoTitle: 'React Server Components - Uvod', seoDescription: 'Sve što treba da znate o React Server Components.', publishedAt: '2025-01-20T09:00:00Z', createdAt: '2025-01-19T14:00:00Z', readingTime: 12 },
  { id: 'post-3', title: '10 saveta za produktivniji rad', content: 'Produktivnost je veština koja se može usavršiti...', categoryId: 'cat-2', authorId: 'auth-3', status: 'published', views: 2340, commentCount: 5, tags: ['tag-6', 'tag-7'], featured: false, seoTitle: '10 saveta za produktivnost', seoDescription: 'Poboljšajte svoju produktivnost sa ovim 10 praktičnih saveta.', publishedAt: '2025-02-01T11:00:00Z', createdAt: '2025-01-30T10:00:00Z', readingTime: 6 },
  { id: 'post-4', title: 'Next.js 15 - Nove mogućnosti', content: 'Next.js 15 donosi mnoge poboljšanja i nove funkcionalnosti...', categoryId: 'cat-5', authorId: 'auth-1', status: 'published', views: 5670, commentCount: 15, tags: ['tag-2', 'tag-4', 'tag-8'], featured: true, seoTitle: 'Next.js 15 Nove mogućnosti', seoDescription: 'Upoznajte se sa novim funkcionalnostima u Next.js 15.', publishedAt: '2025-02-10T08:00:00Z', createdAt: '2025-02-09T16:00:00Z', readingTime: 10 },
  { id: 'post-5', title: 'UI/UX dizajn trendovi 2025', content: 'Svake godine donosi nove trendove u dizajnu...', categoryId: 'cat-4', authorId: 'auth-4', status: 'published', views: 1890, commentCount: 3, tags: ['tag-9', 'tag-10'], featured: false, seoTitle: 'UI/UX trendovi 2025', seoDescription: 'Najnoviji trendovi u UI/UX dizajnu za 2025 godinu.', publishedAt: '2025-02-15T14:00:00Z', createdAt: '2025-02-14T12:00:00Z', readingTime: 7 },
  { id: 'post-6', title: 'Veštačka inteligencija u biznisu', content: 'AI transformiše način na koji poslujemo...', categoryId: 'cat-1', authorId: 'auth-2', status: 'published', views: 3210, commentCount: 9, tags: ['tag-1', 'tag-6'], featured: true, seoTitle: 'AI u biznisu', seoDescription: 'Kako veštačka inteligencija menja poslovanje.', publishedAt: '2025-02-20T10:00:00Z', createdAt: '2025-02-19T09:00:00Z', readingTime: 9 },
  { id: 'post-7', title: 'Vodič za TypeScript tipove', content: 'TypeScript tipovi su moćan alat...', categoryId: 'cat-6', authorId: 'auth-3', status: 'scheduled', views: 0, commentCount: 0, tags: ['tag-2', 'tag-8'], featured: false, seoTitle: 'TypeScript tipovi vodič', seoDescription: 'Kompletni vodič za TypeScript tipove.', publishedAt: '2025-03-01T08:00:00Z', createdAt: '2025-02-25T10:00:00Z', readingTime: 15 },
  { id: 'post-8', title: 'Optimizacija baze podataka', content: 'Brzina upita je kritična za performanse...', categoryId: 'cat-5', authorId: 'auth-1', status: 'draft', views: 0, commentCount: 0, tags: ['tag-4', 'tag-5'], featured: false, seoTitle: 'Optimizacija baze podataka', seoDescription: 'Kako optimizovati upite baze podataka.', publishedAt: '', createdAt: '2025-02-28T14:00:00Z', readingTime: 11 },
  { id: 'post-9', title: 'Društvene mreže za mala preduzeća', content: 'Social media marketing za SME sektor...', categoryId: 'cat-3', authorId: 'auth-4', status: 'draft', views: 0, commentCount: 0, tags: ['tag-3', 'tag-6'], featured: false, seoTitle: 'Društvene mreže za SME', seoDescription: 'Kako koristiti društvene mreže za rast biznisa.', publishedAt: '', createdAt: '2025-03-01T09:00:00Z', readingTime: 8 },
  { id: 'post-10', title: 'Figma vs Sketch - Poređenje', content: 'Dva najpopularnija alata za dizajn...', categoryId: 'cat-4', authorId: 'auth-2', status: 'published', views: 1450, commentCount: 6, tags: ['tag-9', 'tag-10'], featured: false, seoTitle: 'Figma vs Sketch poređenje', seoDescription: 'Uporedite Figmu i Sketch za dizajn korisničkog interfejsa.', publishedAt: '2025-03-05T12:00:00Z', createdAt: '2025-03-04T08:00:00Z', readingTime: 6 },
  { id: 'post-11', title: 'DevOps prakse za timove', content: 'CI/CD, Docker i Kubernetes su standardi...', categoryId: 'cat-5', authorId: 'auth-3', status: 'published', views: 2670, commentCount: 4, tags: ['tag-4', 'tag-5', 'tag-8'], featured: false, seoTitle: 'DevOps prakse', seoDescription: 'Najbolje DevOps prakse za razvojne timove.', publishedAt: '2025-03-10T09:00:00Z', createdAt: '2025-03-09T11:00:00Z', readingTime: 13 },
  { id: 'post-12', title: 'Cybersecurity osnovi', content: 'Zaštita podataka je obaveza svake kompanije...', categoryId: 'cat-1', authorId: 'auth-1', status: 'scheduled', views: 0, commentCount: 0, tags: ['tag-1', 'tag-5'], featured: false, seoTitle: 'Cybersecurity osnovi', seoDescription: 'Osnovni principi zaštite u cyber prostoru.', publishedAt: '2025-03-20T10:00:00Z', createdAt: '2025-03-12T08:00:00Z', readingTime: 10 },
  { id: 'post-13', title: 'Kreiranje brenda od nule', content: 'Brending je mnogo više od logotipa...', categoryId: 'cat-2', authorId: 'auth-4', status: 'published', views: 1980, commentCount: 7, tags: ['tag-3', 'tag-6', 'tag-7'], featured: true, seoTitle: 'Kreiranje brenda', seoDescription: 'Kako kreirati jak brend od početka.', publishedAt: '2025-03-15T08:00:00Z', createdAt: '2025-03-14T10:00:00Z', readingTime: 9 },
  { id: 'post-14', title: 'API dizajn najbolje prakse', content: 'REST vs GraphQL, verzionisanje, autentikacija...', categoryId: 'cat-6', authorId: 'auth-2', status: 'archived', views: 890, commentCount: 2, tags: ['tag-2', 'tag-4'], featured: false, seoTitle: 'API dizajn prakse', seoDescription: 'Najbolje prakse za dizajn API-ja.', publishedAt: '2024-12-01T10:00:00Z', createdAt: '2024-11-28T14:00:00Z', readingTime: 14 },
  { id: 'post-15', title: 'Startup ekosistem u Srbiji', content: 'Srbija postaje regionalni hub za inovacije...', categoryId: 'cat-2', authorId: 'auth-3', status: 'published', views: 3100, commentCount: 11, tags: ['tag-6', 'tag-7', 'tag-1'], featured: true, seoTitle: 'Startup ekosistem Srbija', seoDescription: 'Pregled startup ekosistema u Srbiji 2025.', publishedAt: '2025-03-18T11:00:00Z', createdAt: '2025-03-17T09:00:00Z', readingTime: 11 },
]

const mockComments: BlogComment[] = [
  { id: 'cmt-1', authorName: 'Ivan Savić', postId: 'post-1', postTitle: 'Kako napraviti SEO strategiju za 2025', content: 'Odličan članak! Veoma korisni saveti za SEO optimizaciju.', status: 'approved', createdAt: '2025-01-16T14:30:00Z', parentId: null },
  { id: 'cmt-2', authorName: 'Maja Đorđević', postId: 'post-2', postTitle: 'Uvod u React Server Components', content: 'Konačno objašnjenje RSC koje ima smisla. Hvala!', status: 'approved', createdAt: '2025-01-21T09:15:00Z', parentId: null },
  { id: 'cmt-3', authorName: 'Lazar Popović', postId: 'post-4', postTitle: 'Next.js 15 - Nove mogućnosti', content: 'Turbopack je zaista brz, testirao sam na velikom projektu.', status: 'pending', createdAt: '2025-02-11T16:45:00Z', parentId: null },
  { id: 'cmt-4', authorName: 'Sara Marković', postId: 'post-6', postTitle: 'Veštačka inteligencija u biznisu', content: 'Koji AI alati preporučujete za mala preduzeća?', status: 'approved', createdAt: '2025-02-21T11:20:00Z', parentId: null },
  { id: 'cmt-5', authorName: 'Nenad Vukčević', postId: 'post-1', postTitle: 'Kako napraviti SEO strategiju za 2025', content: 'Da li ste probali nove AI SEO alate?', status: 'pending', createdAt: '2025-02-22T08:10:00Z', parentId: 'cmt-1' },
  { id: 'cmt-6', authorName: 'Jovana Nikolić', postId: 'post-10', postTitle: 'Figma vs Sketch - Poređenje', content: 'Figma je pobednik za saradnju u timu, definitivno.', status: 'approved', createdAt: '2025-03-06T10:00:00Z', parentId: null },
  { id: 'cmt-7', authorName: 'Bogdan Jokić', postId: 'post-13', postTitle: 'Kreiranje brenda od nule', content: 'Vrlo inspirativan članak. Imam pitanje o brend strategiji.', status: 'pending', createdAt: '2025-03-16T14:30:00Z', parentId: null },
  { id: 'cmt-8', authorName: 'Milica Radovanović', postId: 'post-15', postTitle: 'Startup ekosistem u Srbiji', content: 'Srbija zaista ima potencijal. NAPREDak je odlična inicijativa!', status: 'approved', createdAt: '2025-03-19T09:45:00Z', parentId: null },
  { id: 'cmt-9', authorName: 'Đorđe Stamenić', postId: 'post-11', postTitle: 'DevOps prakse za timove', content: 'Kubernetes je prekompleksan za male timove. Docker Compose je dovoljan.', status: 'rejected', createdAt: '2025-03-11T16:00:00Z', parentId: null },
  { id: 'cmt-10', authorName: 'Ana Đorđević', postId: 'post-5', postTitle: 'UI/UX dizajn trendovi 2025', content: 'Glassmorphism i dalje u trendu?', status: 'approved', createdAt: '2025-02-16T11:30:00Z', parentId: null },
  { id: 'cmt-11', authorName: 'Viktor Todorović', postId: 'post-3', postTitle: '10 saveta za produktivniji rad', content: 'Pomodoro tehnika je zaista promenila moj radni dan.', status: 'approved', createdAt: '2025-02-02T15:20:00Z', parentId: null },
  { id: 'cmt-12', authorName: 'Tamara Ilić', postId: 'post-15', postTitle: 'Startup ekosistem u Srbiji', content: 'Koje fondiranje opcije postoje za tech startup u Srbiji?', status: 'pending', createdAt: '2025-03-20T08:00:00Z', parentId: null },
]

const mockTags: BlogTag[] = [
  { id: 'tag-1', name: 'AI', slug: 'ai', postCount: 3 },
  { id: 'tag-2', name: 'React', slug: 'react', postCount: 3 },
  { id: 'tag-3', name: 'Marketing', slug: 'marketing', postCount: 3 },
  { id: 'tag-4', name: 'Veb razvoj', slug: 'veb-razvoj', postCount: 4 },
  { id: 'tag-5', name: 'Bezbednost', slug: 'bezbednost', postCount: 3 },
  { id: 'tag-6', name: 'Biznis', slug: 'biznis', postCount: 4 },
  { id: 'tag-7', name: 'Kreativnost', slug: 'kreativnost', postCount: 3 },
  { id: 'tag-8', name: 'Alati', slug: 'alati', postCount: 3 },
  { id: 'tag-9', name: 'Dizajn', slug: 'dizajn', postCount: 2 },
  { id: 'tag-10', name: 'UX', slug: 'ux', postCount: 2 },
]

// ============ HELPERS ============

function getAuthorName(id: string): string {
  return mockAuthors.find((a) => a.id === id)?.name ?? 'Nepoznat'
}

function getCategoryName(id: string): string {
  return mockCategories.find((c) => c.id === id)?.name ?? ''
}

function getCategoryColor(id: string): string {
  return mockCategories.find((c) => c.id === id)?.color ?? '#6b7280'
}

function emptyPostForm(): PostForm {
  return {
    title: '', categoryId: '', authorId: '', content: '', status: 'draft',
    tags: [], featured: false, seoTitle: '', seoDescription: '', publishedAt: '',
  }
}

// ============ MONTHLY TREND DATA ============

function generateMonthlyTrend(): { month: string; posts: number }[] {
  return [
    { month: 'Jan', posts: 3 },
    { month: 'Feb', posts: 5 },
    { month: 'Mar', posts: 7 },
  ]
}

function generateReadingTimeTrend(): { month: string; avgTime: number }[] {
  return [
    { month: 'Jan', avgTime: 7.2 },
    { month: 'Feb', avgTime: 8.5 },
    { month: 'Mar', avgTime: 9.8 },
  ]
}

// ============ MAIN COMPONENT ============

export function Blog() {
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

// ============ TAB 1: PREGLED ============

function PregledTab({ posts, categories, comments, tags }: { posts: BlogPost[]; categories: BlogCategory[]; comments: BlogComment[]; tags: BlogTag[] }) {
  const { t } = useTranslation()

  const totalPosts = posts.length
  const publishedPosts = posts.filter((p) => p.status === 'published')
  const draftPosts = posts.filter((p) => p.status === 'draft')
  const totalViews = posts.reduce((sum, p) => sum + p.views, 0)
  const totalComments = comments.length
  const totalAuthors = new Set(posts.map((p) => p.authorId)).size

  const categoryPieData = categories.map((c) => ({
    name: c.name,
    value: posts.filter((p) => p.categoryId === c.id).length,
    color: c.color,
  })).filter((d) => d.value > 0)

  const topPosts = [...publishedPosts].sort((a, b) => b.views - a.views).slice(0, 5)
  const recentComments = [...comments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{t('blog.kpi.totalPosts') || 'Ukupno članaka'}</span>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold">{totalPosts}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{t('blog.kpi.published') || 'Objavljeno'}</span>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{publishedPosts.length}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{t('blog.kpi.drafts') || 'Nacrta'}</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{draftPosts.length}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{t('blog.kpi.totalViews') || 'Ukupno pregleda'}</span>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-primary">{totalViews.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{t('blog.kpi.comments') || 'Komentara'}</span>
            <MessageSquare className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-600">{totalComments}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{t('blog.kpi.authors') || 'Autora'}</span>
            <Users className="h-4 w-4 text-teal-500" />
          </div>
          <p className="text-2xl font-bold text-teal-600">{totalAuthors}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> {t('blog.chart.monthlyTrend') || 'Mesečni trend objava'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={generateMonthlyTrend()}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="posts" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" /> {t('blog.chart.categoryDistribution') || 'Distribucija po kategorijama'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={categoryPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {categoryPieData.map((entry, index) => (
                    <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" /> {t('blog.topPosts') || 'Najčitaniji članci'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">#</TableHead>
                  <TableHead className="text-xs">{t('blog.postTitle') || 'Naslov'}</TableHead>
                  <TableHead className="text-xs text-right">{t('blog.views') || 'Pregledi'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPosts.map((p, i) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-xs font-medium">{i + 1}</TableCell>
                    <TableCell className="text-xs font-medium max-w-[200px] truncate">{p.title}</TableCell>
                    <TableCell className="text-xs text-right font-bold">{p.views.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> {t('blog.recentComments') || 'Nedavni komentari'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentComments.map((c) => {
                const cfg = commentStatusConfig[c.status]
                return (
                  <div key={c.id} className="flex items-start gap-3 py-2 border-b last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{c.authorName}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">{c.postTitle} · {new Date(c.createdAt).toLocaleDateString('sr-RS')}</p>
                    </div>
                    <Badge variant="outline" className={`text-xs shrink-0 ${cfg?.color}`}>{cfg?.label}</Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============ TAB 2: ČLANCI ============

function ClanciTab({ posts, setPosts, categories, tags }: {
  posts: BlogPost[]; setPosts: React.Dispatch<React.SetStateAction<BlogPost[]>>; categories: BlogCategory[]; tags: BlogTag[]
}) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [authorFilter, setAuthorFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [form, setForm] = useState<PostForm>(emptyPostForm())

  const filtered = posts.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
    if (catFilter !== 'all' && p.categoryId !== catFilter) return false
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    if (authorFilter !== 'all' && p.authorId !== authorFilter) return false
    return true
  })

  const openCreate = () => {
    setEditingPost(null)
    setForm(emptyPostForm())
    setDialogOpen(true)
  }

  const openEdit = (post: BlogPost) => {
    setEditingPost(post)
    setForm({
      title: post.title, categoryId: post.categoryId, authorId: post.authorId,
      content: post.content, status: post.status, tags: post.tags,
      featured: post.featured, seoTitle: post.seoTitle, seoDescription: post.seoDescription,
      publishedAt: post.publishedAt || '',
    })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (editingPost) {
      setPosts((prev) => prev.map((p) => p.id === editingPost.id ? { ...p, ...form } : p))
    } else {
      const newPost: BlogPost = {
        id: `post-${Date.now()}`, title: form.title, content: form.content,
        categoryId: form.categoryId, authorId: form.authorId, status: form.status,
        views: 0, commentCount: 0, tags: form.tags, featured: form.featured,
        seoTitle: form.seoTitle, seoDescription: form.seoDescription,
        publishedAt: form.publishedAt, createdAt: new Date().toISOString(), readingTime: Math.ceil(form.content.split(/\s+/).length / 200),
      }
      setPosts((prev) => [...prev, newPost])
    }
    setDialogOpen(false)
  }

  const handleDuplicate = (post: BlogPost) => {
    const dup: BlogPost = { ...post, id: `post-${Date.now()}`, title: `${post.title} (kopija)`, views: 0, commentCount: 0, status: 'draft', createdAt: new Date().toISOString() }
    setPosts((prev) => [...prev, dup])
  }

  const handleDelete = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  const advanceStatus = (post: BlogPost) => {
    const idx = statusWorkflow.indexOf(post.status)
    if (idx < statusWorkflow.length - 1) {
      setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, status: statusWorkflow[idx + 1] } : p))
    }
  }

  const toggleTag = (tagId: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId) ? prev.tags.filter((t) => t !== tagId) : [...prev.tags, tagId],
    }))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('blog.searchPosts') || 'Pretraži članke...'} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-full lg:w-[160px]"><SelectValue placeholder={t('blog.category') || 'Kategorija'} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('blog.allCategories') || 'Sve kategorije'}</SelectItem>
            {categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full lg:w-[140px]"><SelectValue placeholder={t('blog.status') || 'Status'} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('blog.allStatuses') || 'Svi statusi'}</SelectItem>
            {Object.entries(postStatusConfig).map(([key, cfg]) => (<SelectItem key={key} value={key}>{cfg.label}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={authorFilter} onValueChange={setAuthorFilter}>
          <SelectTrigger className="w-full lg:w-[160px]"><SelectValue placeholder={t('blog.author') || 'Autor'} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('blog.allAuthors') || 'Svi autori'}</SelectItem>
            {mockAuthors.map((a) => (<SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>))}
          </SelectContent>
        </Select>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> {t('blog.newPost') || 'Novi članak'}</Button>
      </div>

      <div className="text-sm text-muted-foreground">
        {t('blog.showing') || 'Prikazano'} {filtered.length} {t('blog.of') || 'od'} {posts.length}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground font-medium">{t('blog.noPosts') || 'Nema članaka'}</p>
          <Button className="mt-4" size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> {t('blog.createFirst') || 'Kreiraj članak'}</Button>
        </Card>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">{t('blog.postTitle') || 'Naslov'}</TableHead>
                <TableHead className="text-xs hidden md:table-cell">{t('blog.category') || 'Kategorija'}</TableHead>
                <TableHead className="text-xs hidden lg:table-cell">{t('blog.author') || 'Autor'}</TableHead>
                <TableHead className="text-xs hidden md:table-cell">{t('blog.publishedDate') || 'Datum'}</TableHead>
                <TableHead className="text-xs text-right">{t('blog.views') || 'Pregledi'}</TableHead>
                <TableHead className="text-xs">{t('blog.status') || 'Status'}</TableHead>
                <TableHead className="text-xs text-right">{t('blog.actions') || 'Akcije'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => {
                const cfg = postStatusConfig[p.status]
                const statusIdx = statusWorkflow.indexOf(p.status)
                return (
                  <TableRow key={p.id}>
                    <TableCell className="text-xs font-medium max-w-[220px]">
                      <div className="flex items-center gap-2">
                        {p.featured && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                        <span className="truncate">{p.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs hidden md:table-cell">
                      <Badge variant="outline" style={{ borderColor: getCategoryColor(p.categoryId), color: getCategoryColor(p.categoryId) }}>
                        {getCategoryName(p.categoryId)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs hidden lg:table-cell">{getAuthorName(p.authorId)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                      {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('sr-RS') : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-right font-medium">{p.views.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className={`text-xs ${cfg?.color}`}>{cfg?.label}</Badge>
                        {statusIdx < statusWorkflow.length - 1 && (
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => advanceStatus(p)} title={postStatusConfig[statusWorkflow[statusIdx + 1]]?.label}>
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}><Edit3 className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDuplicate(p)} title="Duplikuj"><Share2 className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {dialogOpen && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setDialogOpen(false)}><ArrowLeft className="h-4 w-4" /></Button>
              <div><CardTitle>{editingPost ? (t('blog.editPost') || 'Izmeni članak') : (t('blog.newPost') || 'Novi članak')}</CardTitle><CardDescription>{editingPost ? (t('blog.editPostDesc') || 'Izmenite podatke članka') : (t('blog.newPostDesc') || 'Popunite podatke za novi članak')}</CardDescription></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2"><Label>{t('blog.form.title') || 'Naslov'}</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>{t('blog.form.category') || 'Kategorija'}</Label><Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent></Select></div>
                <div className="space-y-2"><Label>{t('blog.form.author') || 'Autor'}</Label><Select value={form.authorId} onValueChange={(v) => setForm({ ...form, authorId: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{mockAuthors.map((a) => (<SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>))}</SelectContent></Select></div>
                <div className="space-y-2"><Label>{t('blog.form.status') || 'Status'}</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as BlogPost['status'] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(postStatusConfig).map(([key, cfg]) => (<SelectItem key={key} value={key}>{cfg.label}</SelectItem>))}</SelectContent></Select></div>
              </div>
              <div className="space-y-2"><Label>{t('blog.form.content') || 'Sadržaj'}</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} placeholder={t('blog.form.contentPlaceholder') || 'Sadržaj članka...'} /></div>
              <div className="space-y-2"><Label>{t('blog.form.tags') || 'Tagovi'}</Label><div className="flex flex-wrap gap-2">{tags.map((tag) => (<Badge key={tag.id} variant={form.tags.includes(tag.id) ? 'default' : 'outline'} className="cursor-pointer text-xs" onClick={() => toggleTag(tag.id)}>{tag.name}</Badge>))}</div></div>
              <div className="flex items-center gap-3"><Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} /><Label className="text-sm">{t('blog.form.featured') || 'Istaknuti članak'}</Label></div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>{t('blog.form.seoTitle') || 'SEO naslov'}</Label><Input value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} /></div>
                <div className="space-y-2"><Label>{t('blog.form.seoDescription') || 'SEO opis'}</Label><Input value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} /></div>
              </div>
              {form.status === 'scheduled' && (<div className="space-y-2"><Label>{t('blog.form.publishDate') || 'Datum objave'}</Label><Input type="datetime-local" value={form.publishedAt} onChange={(e) => setForm({ ...form, publishedAt: e.target.value })} /></div>)}
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('blog.cancel') || 'Otkaži'}</Button>
              <Button onClick={handleSave} disabled={!form.title}><Plus className="h-4 w-4 mr-1" /> {editingPost ? (t('blog.save') || 'Sačuvaj') : (t('blog.create') || 'Kreiraj')}</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ============ TAB 3: KATEGORIJE ============

function KategorijeTab({ categories, setCategories, posts }: {
  categories: BlogCategory[]; setCategories: React.Dispatch<React.SetStateAction<BlogCategory[]>>; posts: BlogPost[]
}) {
  const { t } = useTranslation()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<BlogCategory | null>(null)
  const [form, setForm] = useState({ name: '', slug: '', description: '', color: '#6b7280' })

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', slug: '', description: '', color: '#6b7280' })
    setDialogOpen(true)
  }

  const openEdit = (cat: BlogCategory) => {
    setEditing(cat)
    setForm({ name: cat.name, slug: cat.slug, description: cat.description, color: cat.color })
    setDialogOpen(true)
  }

  const handleSave = () => {
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    if (editing) {
      setCategories((prev) => prev.map((c) => c.id === editing.id ? { ...c, ...form, slug } : c))
    } else {
      setCategories((prev) => [...prev, { id: `cat-${Date.now()}`, ...form, slug, postCount: 0 }])
    }
    setDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> {t('blog.newCategory') || 'Nova kategorija'}</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const postCount = posts.filter((p) => p.categoryId === cat.id).length
          return (
            <Card key={cat.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                    <CardTitle className="text-base">{cat.name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(cat)}><Edit3 className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(cat.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                <CardDescription className="text-xs">/{cat.slug}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{cat.description}</p>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{postCount} {t('blog.posts') || 'članaka'}</span>
                  </div>
                  <div className="flex gap-1">
                    {posts.filter((p) => p.categoryId === cat.id && p.status === 'published').length > 0 && (
                      <Badge variant="outline" className="text-xs text-green-600">
                        {posts.filter((p) => p.categoryId === cat.id && p.status === 'published').length} objavljeno
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">{t('blog.postsBreakdown') || 'Pretplate'}</div>
                  <div className="flex gap-1 flex-wrap">
                    {posts.filter((p) => p.categoryId === cat.id).slice(0, 3).map((p) => (
                      <Badge key={p.id} variant="secondary" className="text-xs">{p.title.substring(0, 20)}...</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">{t('blog.postsPerCategory') || 'Članaka po kategoriji'}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categories.map((c) => ({ name: c.name, count: posts.filter((p) => p.categoryId === c.id).length }))}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {dialogOpen && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setDialogOpen(false)}><ArrowLeft className="h-4 w-4" /></Button>
              <div><CardTitle>{editing ? (t('blog.editCategory') || 'Izmeni kategoriju') : (t('blog.newCategory') || 'Nova kategorija')}</CardTitle></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('blog.form.name') || 'Naziv'}</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })} />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t('blog.form.description') || 'Opis'}</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>{t('blog.form.color') || 'Boja'}</Label>
                <div className="flex items-center gap-3">
                  <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-10 w-10 rounded cursor-pointer border" />
                  <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="flex-1" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('blog.cancel') || 'Otkaži'}</Button>
              <Button onClick={handleSave} disabled={!form.name}>{t('blog.save') || 'Sačuvaj'}</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ============ TAB 4: KOMENTARI ============

function KomentariTab({ comments, setComments, posts }: {
  comments: BlogComment[]; setComments: React.Dispatch<React.SetStateAction<BlogComment[]>>; posts: BlogPost[]
}) {
  const { t } = useTranslation()
  const [statusFilter, setStatusFilter] = useState('all')
  const [postFilter, setPostFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [replyDialog, setReplyDialog] = useState<BlogComment | null>(null)
  const [replyText, setReplyText] = useState('')
  const [selectedComments, setSelectedComments] = useState<string[]>([])

  const filtered = comments.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    if (postFilter !== 'all' && c.postId !== postFilter) return false
    if (dateFilter !== 'all') {
      const now = new Date()
      const commentDate = new Date(c.createdAt)
      const diffDays = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60 * 60 * 24))
      if (dateFilter === '7d' && diffDays > 7) return false
      if (dateFilter === '30d' && diffDays > 30) return false
    }
    return true
  })

  const toggleSelect = (id: string) => {
    setSelectedComments((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  const bulkApprove = () => {
    setComments((prev) => prev.map((c) => selectedComments.includes(c.id) ? { ...c, status: 'approved' as const } : c))
    setSelectedComments([])
  }

  const bulkReject = () => {
    setComments((prev) => prev.map((c) => selectedComments.includes(c.id) ? { ...c, status: 'rejected' as const } : c))
    setSelectedComments([])
  }

  const updateStatus = (id: string, status: BlogComment['status']) => {
    setComments((prev) => prev.map((c) => c.id === id ? { ...c, status } : c))
  }

  const handleReply = () => {
    if (!replyDialog || !replyText.trim()) return
    const newReply: BlogComment = {
      id: `cmt-${Date.now()}`, authorName: 'Admin', postId: replyDialog.postId,
      postTitle: replyDialog.postTitle, content: replyText, status: 'approved',
      createdAt: new Date().toISOString(), parentId: replyDialog.id,
    }
    setComments((prev) => [...prev, newReply])
    setReplyDialog(null)
    setReplyText('')
  }

  const pendingCount = comments.filter((c) => c.status === 'pending').length

  return (
    <div className="space-y-4">
      {pendingCount > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <span className="text-sm text-amber-800 dark:text-amber-200">{pendingCount} {t('blog.pendingComments') || 'komentara čeka odobrenje'}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full lg:w-[150px]"><SelectValue placeholder={t('blog.status') || 'Status'} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('blog.allStatuses') || 'Svi statusi'}</SelectItem>
            {Object.entries(commentStatusConfig).map(([key, cfg]) => (<SelectItem key={key} value={key}>{cfg.label}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={postFilter} onValueChange={setPostFilter}>
          <SelectTrigger className="w-full lg:w-[220px]"><SelectValue placeholder={t('blog.filterPost') || 'Filtriraj po članku'} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('blog.allPosts') || 'Svi članci'}</SelectItem>
            {posts.map((p) => (<SelectItem key={p.id} value={p.id}>{p.title.substring(0, 40)}...</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-full lg:w-[150px]"><SelectValue placeholder={t('blog.date') || 'Datum'} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('blog.allTime') || 'Svo vreme'}</SelectItem>
            <SelectItem value="7d">{t('blog.last7days') || 'Poslednjih 7 dana'}</SelectItem>
            <SelectItem value="30d">{t('blog.last30days') || 'Poslednjih 30 dana'}</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2 ml-auto">
          {selectedComments.length > 0 && (
            <>
              <Button size="sm" variant="outline" className="text-green-600 border-green-300" onClick={bulkApprove}>
                <CheckCircle2 className="h-4 w-4 mr-1" /> {t('blog.approve') || 'Odobri'} ({selectedComments.length})
              </Button>
              <Button size="sm" variant="outline" className="text-red-600 border-red-300" onClick={bulkReject}>
                <AlertCircle className="h-4 w-4 mr-1" /> {t('blog.reject') || 'Odbij'} ({selectedComments.length})
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        {t('blog.showing') || 'Prikazano'} {filtered.length} {t('blog.of') || 'od'} {comments.length} {t('blog.comments') || 'komentara'}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground font-medium">{t('blog.noComments') || 'Nema komentara'}</p>
        </Card>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filtered.map((c) => {
            const cfg = commentStatusConfig[c.status]
            return (
              <Card key={c.id} className="p-4">
                <div className="flex items-start gap-3">
                  <input type="checkbox" checked={selectedComments.includes(c.id)} onChange={() => toggleSelect(c.id)} className="mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-medium">{c.authorName}</span>
                      <span className="text-xs text-muted-foreground">{t('blog.on') || 'na'} </span>
                      <span className="text-xs font-medium text-primary">{c.postTitle}</span>
                      <Badge variant="outline" className={`text-xs ${cfg?.color}`}>{cfg?.label}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{c.content}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 inline mr-0.5" />{new Date(c.createdAt).toLocaleDateString('sr-RS')}
                      </span>
                      {c.parentId && <span className="text-xs text-muted-foreground">{t('blog.reply') || 'Odgovor'}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {c.status !== 'approved' && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" onClick={() => updateStatus(c.id, 'approved')} title="Odobri">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {c.status !== 'rejected' && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" onClick={() => updateStatus(c.id, 'rejected')} title="Odbij">
                        <AlertCircle className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setReplyDialog(c); setReplyText('') }} title={t('blog.reply') || 'Odgovori'}>
                      <MessageSquare className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {replyDialog && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setReplyDialog(null)}><ArrowLeft className="h-4 w-4" /></Button>
              <div><CardTitle>{t('blog.replyTo') || 'Odgovori na'} — {replyDialog?.authorName}</CardTitle></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">{replyDialog?.postTitle}</p>
                <p className="text-sm">{replyDialog?.content}</p>
              </div>
              <div className="space-y-2">
                <Label>{t('blog.form.reply') || 'Vaš odgovor'}</Label>
                <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={4} placeholder={t('blog.form.replyPlaceholder') || 'Napišite odgovor...'} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setReplyDialog(null)}>{t('blog.cancel') || 'Otkaži'}</Button>
              <Button onClick={handleReply} disabled={!replyText.trim()}>{t('blog.sendReply') || 'Pošalji odgovor'}</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ============ TAB 5: TAGOVI ============

function TagoviTab({ tags, setTags, posts }: {
  tags: BlogTag[]; setTags: React.Dispatch<React.SetStateAction<BlogTag[]>>; posts: BlogPost[]
}) {
  const { t } = useTranslation()
  const [viewMode, setViewMode] = useState<'cloud' | 'list'>('cloud')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<BlogTag | null>(null)
  const [form, setForm] = useState({ name: '', slug: '' })
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const filteredPosts = activeTag ? posts.filter((p) => p.tags.includes(activeTag)) : []

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', slug: '' })
    setDialogOpen(true)
  }

  const openEdit = (tag: BlogTag) => {
    setEditing(tag)
    setForm({ name: tag.name, slug: tag.slug })
    setDialogOpen(true)
  }

  const handleSave = () => {
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    if (editing) {
      setTags((prev) => prev.map((t) => t.id === editing.id ? { ...t, ...form, slug } : t))
    } else {
      setTags((prev) => [...prev, { id: `tag-${Date.now()}`, ...form, slug, postCount: 0 }])
    }
    setDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    setTags((prev) => prev.filter((t) => t.id !== id))
    if (activeTag === id) setActiveTag(null)
  }

  const maxPostCount = Math.max(...tags.map((t) => t.postCount), 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant={viewMode === 'cloud' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('cloud')}>
            <Filter className="h-4 w-4 mr-1" /> {t('blog.cloudView') || 'Oblak'}
          </Button>
          <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
            <BarChart3 className="h-4 w-4 mr-1" /> {t('blog.listView') || 'Lista'}
          </Button>
        </div>
        <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> {t('blog.newTag') || 'Novi tag'}</Button>
      </div>

      {viewMode === 'cloud' ? (
        <Card className="p-6">
          <div className="flex flex-wrap gap-3 justify-center">
            {tags.map((tag) => {
              const scale = 0.75 + (tag.postCount / maxPostCount) * 0.75
              return (
                <Badge
                  key={tag.id}
                  variant={activeTag === tag.id ? 'default' : 'outline'}
                  className="cursor-pointer px-4 py-2 text-sm transition-all hover:shadow-md"
                  style={{ fontSize: `${scale}rem` }}
                  onClick={() => setActiveTag(activeTag === tag.id ? null : tag.id)}
                >
                  <Tag className="h-3.5 w-3.5 mr-1" /> {tag.name} <span className="ml-1 opacity-60">({tag.postCount})</span>
                </Badge>
              )
            })}
          </div>
        </Card>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">{t('blog.tagName') || 'Naziv'}</TableHead>
                <TableHead className="text-xs">Slug</TableHead>
                <TableHead className="text-xs text-right">{t('blog.posts') || 'Članaka'}</TableHead>
                <TableHead className="text-xs text-right">{t('blog.actions') || 'Akcije'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags.map((tag) => (
                <TableRow key={tag.id} className={activeTag === tag.id ? 'bg-primary/5' : ''}>
                  <TableCell className="text-xs font-medium cursor-pointer" onClick={() => setActiveTag(activeTag === tag.id ? null : tag.id)}>
                    <div className="flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                      {tag.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">/{tag.slug}</TableCell>
                  <TableCell className="text-xs text-right font-medium">{tag.postCount}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(tag)}><Edit3 className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(tag.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {activeTag && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {t('blog.postsForTag') || 'Članci za tag'}: <Badge variant="default" className="ml-2">{tags.find((t) => t.id === activeTag)?.name}</Badge>
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setActiveTag(null)}>{t('blog.clearFilter') || 'Ukloni filter'}</Button>
            </div>
          </CardHeader>
          <CardContent>
            {filteredPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">{t('blog.noPosts') || 'Nema članaka'}</p>
            ) : (
              <div className="space-y-2">
                {filteredPosts.map((p) => {
                  const cfg = postStatusConfig[p.status]
                  return (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{p.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs ${cfg?.color}`}>{cfg?.label}</Badge>
                        <span className="text-xs text-muted-foreground">{p.views} {t('blog.views') || 'pregleda'}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {dialogOpen && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setDialogOpen(false)}><ArrowLeft className="h-4 w-4" /></Button>
              <div><CardTitle>{editing ? (t('blog.editTag') || 'Izmeni tag') : (t('blog.newTag') || 'Novi tag')}</CardTitle></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('blog.form.name') || 'Naziv'}</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })} />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('blog.cancel') || 'Otkaži'}</Button>
              <Button onClick={handleSave} disabled={!form.name}>{t('blog.save') || 'Sačuvaj'}</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ============ TAB 6: SEO ANALITIKA ============

function SeoAnalitikaTab({ posts, categories }: { posts: BlogPost[]; categories: BlogCategory[] }) {
  const { t } = useTranslation()

  const publishedPosts = posts.filter((p) => p.status === 'published')
  const topPerforming = [...publishedPosts].sort((a, b) => b.views - a.views).slice(0, 6)

  const trafficSources = [
    { name: 'Google', value: 45, color: '#22c55e' },
    { name: 'Društvene mreže', value: 25, color: '#3b82f6' },
    { name: 'Direktan', value: 15, color: '#f59e0b' },
    { name: 'Referal', value: 10, color: '#8b5cf6' },
    { name: 'Email', value: 5, color: '#ef4444' },
  ]

  const keywords = [
    { keyword: 'Next.js tutorial', impressions: 12500, clicks: 3200, ctr: '25.6%', position: 3.2 },
    { keyword: 'React Server Components', impressions: 8900, clicks: 2100, ctr: '23.6%', position: 4.1 },
    { keyword: 'SEO strategija 2025', impressions: 6700, clicks: 1800, ctr: '26.9%', position: 2.8 },
    { keyword: 'UI dizajn trendovi', impressions: 5400, clicks: 1200, ctr: '22.2%', position: 5.5 },
    { keyword: 'TypeScript vodič', impressions: 4200, clicks: 980, ctr: '23.3%', position: 6.1 },
    { keyword: 'Startup Srbija', impressions: 3800, clicks: 890, ctr: '23.4%', position: 4.8 },
  ]

  const authorStats = mockAuthors.map((a) => {
    const authorPosts = posts.filter((p) => p.authorId === a.id)
    const totalViews = authorPosts.reduce((s, p) => s + p.views, 0)
    return {
      name: a.name,
      posts: authorPosts.length,
      views: totalViews,
      avgViews: authorPosts.length > 0 ? Math.round(totalViews / authorPosts.length) : 0,
    }
  }).sort((a, b) => b.views - a.views)

  const readingTimeTrend = generateReadingTimeTrend()

  const heatmapData: { day: string; mon: number; tue: number; wed: number; thu: number; fri: number; sat: number; sun: number }[] = [
    { day: 'W1', mon: 2, tue: 1, wed: 3, thu: 0, fri: 2, sat: 1, sun: 0 },
    { day: 'W2', mon: 1, tue: 2, wed: 1, thu: 3, fri: 1, sat: 0, sun: 1 },
    { day: 'W3', mon: 0, tue: 1, wed: 2, thu: 1, fri: 3, sat: 1, sun: 0 },
    { day: 'W4', mon: 3, tue: 2, wed: 0, thu: 2, fri: 1, sat: 2, sun: 1 },
  ]

  const maxHeatmap = Math.max(...heatmapData.flatMap((d) => [d.mon, d.tue, d.wed, d.thu, d.fri, d.sat, d.sun]), 1)

  const getHeatColor = (val: number) => {
    if (val === 0) return 'bg-muted'
    const intensity = val / maxHeatmap
    if (intensity <= 0.33) return 'bg-green-200 dark:bg-green-900/40'
    if (intensity <= 0.66) return 'bg-green-400 dark:bg-green-700/60'
    return 'bg-green-600 dark:bg-green-500'
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> {t('blog.seo.topPerforming') || 'Najbolji članci po pregledima'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topPerforming.map((p) => ({ name: p.title.substring(0, 25), views: p.views }))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={130} />
                <Tooltip />
                <Bar dataKey="views" fill="#22c55e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" /> {t('blog.seo.trafficSources') || 'Izvori saobraćaja'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={trafficSources} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {trafficSources.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4" /> {t('blog.seo.keywords') || 'Performanse ključnih reči'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">{t('blog.seo.keyword') || 'Ključna reč'}</TableHead>
                  <TableHead className="text-xs text-right">{t('blog.seo.impressions') || 'Impresije'}</TableHead>
                  <TableHead className="text-xs text-right">{t('blog.seo.clicks') || 'Klikovi'}</TableHead>
                  <TableHead className="text-xs text-right">CTR</TableHead>
                  <TableHead className="text-xs text-right">{t('blog.seo.position') || 'Pozicija'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keywords.map((kw, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs font-medium">{kw.keyword}</TableCell>
                    <TableCell className="text-xs text-right">{kw.impressions.toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-right font-medium text-green-600">{kw.clicks.toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-right">{kw.ctr}</TableCell>
                    <TableCell className="text-xs text-right">
                      <Badge variant={kw.position <= 4 ? 'default' : 'secondary'} className="text-xs">#{kw.position}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" /> {t('blog.seo.avgReadingTime') || 'Prosečno vreme čitanja'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={readingTimeTrend}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} unit=" min" />
                <Tooltip />
                <Line type="monotone" dataKey="avgTime" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" /> {t('blog.seo.authorComparison') || 'Poređenje po autorima'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={authorStats}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="views" fill="#3b82f6" name={t('blog.seo.totalViews') || 'Ukupno pregleda'} radius={[4, 4, 0, 0]} />
                <Bar dataKey="posts" fill="#22c55e" name={t('blog.seo.postCount') || 'Broj članaka'} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" /> {t('blog.seo.contentCalendar') || 'Kalendar sadržaja (objave po danu)'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[400px]">
                <div className="grid grid-cols-8 gap-1 mb-1">
                  <div className="text-xs text-muted-foreground text-center font-medium">{t('blog.seo.week') || 'Sedmica'}</div>
                  {['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'].map((d) => (
                    <div key={d} className="text-xs text-muted-foreground text-center">{d}</div>
                  ))}
                </div>
                {heatmapData.map((row) => (
                  <div key={row.day} className="grid grid-cols-8 gap-1 mb-1">
                    <div className="text-xs text-muted-foreground flex items-center justify-center">{row.day}</div>
                    {[row.mon, row.tue, row.wed, row.thu, row.fri, row.sat, row.sun].map((val, i) => (
                      <div key={i} className={`aspect-square rounded-sm flex items-center justify-center text-xs font-medium ${getHeatColor(val)}`}>
                        {val > 0 ? val : ''}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-4 justify-center">
                <span className="text-xs text-muted-foreground">{t('blog.seo.less') || 'Manje'}</span>
                <div className="w-4 h-4 rounded-sm bg-muted" />
                <div className="w-4 h-4 rounded-sm bg-green-200 dark:bg-green-900/40" />
                <div className="w-4 h-4 rounded-sm bg-green-400 dark:bg-green-700/60" />
                <div className="w-4 h-4 rounded-sm bg-green-600 dark:bg-green-500" />
                <span className="text-xs text-muted-foreground">{t('blog.seo.more') || 'Više'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
