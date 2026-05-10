'use client'

import { useState, useMemo, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
} from 'recharts'
import {
  BookMarked,
  Plus,
  Search,
  Eye,
  Trash2,
  Edit3,
  RefreshCw,
  CheckCircle2,
  Clock,
  BarChart3,
  FolderOpen,
  FileText,
  Users,
  Star,
  Tag,
  BookOpen,
  Settings,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  XCircle,
  Check,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react'

// ==================== TYPES ====================

interface Article {
  id: string
  title: string
  categoryId: string
  author: string
  status: 'published' | 'draft' | 'review' | 'archived'
  views: number
  rating: number
  content: string
  tags: string[]
  relatedArticleIds: string[]
  createdAt: string
  updatedAt: string
}

interface Category {
  id: string
  name: string
  parentId: string | null
  icon: string
  description: string
}

interface Review {
  id: string
  articleId: string
  reviewer: string
  rating: number
  comment: string
  date: string
  status: 'pending' | 'approved' | 'rejected'
}

interface SearchQuery {
  query: string
  count: number
  hasResults: boolean
}

interface KbSettings {
  name: string
  description: string
  allowPublicAccess: boolean
  allowRatings: boolean
  allowComments: boolean
  requireApproval: boolean
  defaultCategory: string
  articleTemplate: string
}

interface ArticleForm {
  title: string
  categoryId: string
  author: string
  status: 'published' | 'draft' | 'review' | 'archived'
  content: string
  tags: string
  relatedArticleIds: string[]
}

interface CategoryForm {
  name: string
  parentId: string
  icon: string
  description: string
}

// ==================== MOCK DATA ====================

const MOCK_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'FAQ', parentId: null, icon: '❓', description: 'Често постављана питања' },
  { id: 'cat2', name: 'Упатства', parentId: null, icon: '📖', description: 'Корисничка упатства' },
  { id: 'cat3', name: 'Производи', parentId: null, icon: '📦', description: 'Документација о производима' },
  { id: 'cat4', name: 'Трубе & Интеграције', parentId: null, icon: '🔌', description: 'API и интеграције' },
  { id: 'cat5', name: 'Безбедност', parentId: 'cat4', icon: '🔒', description: 'Безбедносни протоколи' },
  { id: 'cat6', name: 'Вебhooks', parentId: 'cat4', icon: '🔗', description: 'Webhook конфигурације' },
  { id: 'cat7', name: 'Види & Обука', parentId: null, icon: '🎓', description: 'Видео материјали' },
  { id: 'cat8', name: 'Пошаљи пријаве', parentId: null, icon: '🐛', description: 'Пријаве грешака' },
]

const MOCK_ARTICLES: Article[] = [
  { id: 'a1', title: 'Како да креирате нову фактуру', categoryId: 'cat2', author: 'Марија Јовановић', status: 'published', views: 342, rating: 4.5, content: 'Овај чланак објашњава корак по корак процес креирања нове фактуре у систему. Прво, идите на модул Фактуре, кликните на дугме "Нова фактура", попуните обавезна поља...', tags: ['фактура', 'почетници', 'упутство'], relatedArticleIds: ['a2', 'a3'], createdAt: '2024-11-15T10:00:00Z', updatedAt: '2025-01-10T14:30:00Z' },
  { id: 'a2', title: 'Праћење стања залиха', categoryId: 'cat3', author: 'Немања Петровић', status: 'published', views: 256, rating: 4.2, content: 'Сазнајте како ефикасно да пратите стање залиха у магацину. Користите модул Магацин за преглед тренутних залиха, креирање наруџби и управљање покретима robe...', tags: ['залиха', 'магацин'], relatedArticleIds: ['a1'], createdAt: '2024-11-20T08:00:00Z', updatedAt: '2025-01-08T09:15:00Z' },
  { id: 'a3', title: 'Управљање партнерима', categoryId: 'cat2', author: 'Марија Јовановић', status: 'published', views: 189, rating: 4.8, content: 'Упутство за додавање и уређивање партнера у систему. Наводи како да креирате нове купце и добављаче, унесете њихове податке...', tags: ['партнери', 'CRM', 'купац'], relatedArticleIds: ['a1'], createdAt: '2024-11-25T11:00:00Z', updatedAt: '2025-01-05T16:00:00Z' },
  { id: 'a4', title: 'API документација - Основе', categoryId: 'cat4', author: 'Стефан Стојковић', status: 'published', views: 423, rating: 4.6, content: 'Основни концепти API интеграције. Аутентификација, endpoints, rate limiting и најбоље праксе за рад са нашим API-ем...', tags: ['API', 'интеграција', 'developer'], relatedArticleIds: ['a5', 'a6'], createdAt: '2024-10-10T09:00:00Z', updatedAt: '2025-01-12T10:00:00Z' },
  { id: 'a5', title: 'Webhook конфигурација', categoryId: 'cat6', author: 'Стефан Стојковић', status: 'published', views: 156, rating: 4.0, content: 'Како да подесите webhook-ове за прему обавештења у реалном времену. Конфигурација endpoint-а, формат порука...', tags: ['webhook', 'интеграција'], relatedArticleIds: ['a4'], createdAt: '2024-10-15T13:00:00Z', updatedAt: '2024-12-20T11:00:00Z' },
  { id: 'a6', title: 'Безбедносни протоколи', categoryId: 'cat5', author: 'Стефан Стојковић', status: 'published', views: 98, rating: 4.3, content: 'Безбедносне мере и протоколи за заштиту података. Шифровање, аутентификација, OAuth 2.0...', tags: ['безбедност', 'OAuth', 'SSL'], relatedArticleIds: ['a4'], createdAt: '2024-10-20T10:00:00Z', updatedAt: '2024-12-15T08:30:00Z' },
  { id: 'a7', title: 'Често постављана питања о плаћањима', categoryId: 'cat1', author: 'Ана Милановић', status: 'published', views: 567, rating: 3.8, content: 'Одговори на најчешћа питања о начини плаћања, валутама, курсевима и извозу података за финансије...', tags: ['FAQ', 'плаћање', 'финансије'], relatedArticleIds: ['a1'], createdAt: '2024-09-01T08:00:00Z', updatedAt: '2025-01-11T15:00:00Z' },
  { id: 'a8', title: 'Како пријавити грешку', categoryId: 'cat8', author: 'Ана Милановић', status: 'draft', views: 45, rating: 0, content: 'Упутство за пријаву грешака и багова у систему. Користите модул за пријаве или контактирајте техничку подршку...', tags: ['пријава', 'баг', 'подршка'], relatedArticleIds: [], createdAt: '2025-01-05T09:00:00Z', updatedAt: '2025-01-05T09:00:00Z' },
  { id: 'a9', title: 'Водич за почетнике', categoryId: 'cat7', author: 'Марија Јовановић', status: 'published', views: 789, rating: 4.9, content: 'Комплетан водич за нове кориснике. Подешавање налога, основне функционалности, први кораци у систему...', tags: ['почетник', 'водич', 'onboarding'], relatedArticleIds: ['a1', 'a3', 'a7'], createdAt: '2024-08-15T07:00:00Z', updatedAt: '2025-01-13T12:00:00Z' },
  { id: 'a10', title: 'Напредне филтрације и извештаји', categoryId: 'cat2', author: 'Немања Петровић', status: 'review', views: 67, rating: 0, content: 'Како да користите напредне филтере за креирање прилагођених извештаја и аналитика...', tags: ['филтери', 'извештаји', 'аналитика'], relatedArticleIds: ['a2'], createdAt: '2025-01-02T14:00:00Z', updatedAt: '2025-01-10T16:30:00Z' },
  { id: 'a11', title: 'CRM аутоматизације', categoryId: 'cat3', author: 'Немања Петровић', status: 'published', views: 134, rating: 4.1, content: 'Подесите аутоматске радње у CRM моду: аутоматске е-поште, задатке, обавештења...', tags: ['CRM', 'аутоматизација', 'послови'], relatedArticleIds: ['a3'], createdAt: '2024-12-01T10:00:00Z', updatedAt: '2025-01-09T11:00:00Z' },
  { id: 'a12', title: 'Менаџмент корисника', categoryId: 'cat2', author: 'Ана Милановић', status: 'archived', views: 210, rating: 3.5, content: 'Како да управљате корисницима, улогама и дозволама у систему. (Застарели чланак - замењен новим упутством)...', tags: ['корисници', 'улоге', 'дозволе'], relatedArticleIds: [], createdAt: '2024-06-10T08:00:00Z', updatedAt: '2024-11-01T10:00:00Z' },
  { id: 'a13', title: 'Интеграција са рачуноводственим системима', categoryId: 'cat4', author: 'Стефан Стојковић', status: 'published', views: 178, rating: 4.4, content: 'Корак по корак водич за интеграцију са популарним рачуноводственим системима. Синхронизација фактура...', tags: ['интеграција', 'рачуноводство', 'фактуре'], relatedArticleIds: ['a4', 'a1'], createdAt: '2024-11-01T09:00:00Z', updatedAt: '2024-12-28T14:00:00Z' },
  { id: 'a14', title: 'Припрема података за извез', categoryId: 'cat3', author: 'Марија Јовановић', status: 'draft', views: 23, rating: 0, content: 'Како да припремите податке за извез у различитим форматима: CSV, Excel, PDF...', tags: ['извоз', 'подаци', 'CSV'], relatedArticleIds: ['a2'], createdAt: '2025-01-08T11:00:00Z', updatedAt: '2025-01-08T11:00:00Z' },
  { id: 'a15', title: 'Оптимизација перформанси', categoryId: 'cat4', author: 'Стефан Стојковић', status: 'review', views: 56, rating: 0, content: 'Савети за оптимизацију перформанси система. Кеширање, индексирање, оптималне праксе...', tags: ['перформансе', 'оптимизација', 'кеширање'], relatedArticleIds: ['a4'], createdAt: '2025-01-06T15:00:00Z', updatedAt: '2025-01-12T09:00:00Z' },
]

const MOCK_REVIEWS: Review[] = [
  { id: 'r1', articleId: 'a1', reviewer: 'Петар Николић', rating: 5, comment: 'Одлично упутство, све је јасно објашњено!', date: '2025-01-10T14:30:00Z', status: 'approved' },
  { id: 'r2', articleId: 'a1', reviewer: 'Јелена Станковић', rating: 4, comment: 'Врло корисно, фали само пример за понављајуће фактуре.', date: '2025-01-09T10:00:00Z', status: 'approved' },
  { id: 'r3', articleId: 'a2', reviewer: 'Марко Грујић', rating: 5, comment: 'Тачно оно што сам тражио!', date: '2025-01-08T16:00:00Z', status: 'approved' },
  { id: 'r4', articleId: 'a4', reviewer: 'Ивана Танасковић', rating: 4, comment: 'Добра документација, али би требало додати више примера.', date: '2025-01-07T11:00:00Z', status: 'approved' },
  { id: 'r5', articleId: 'a7', reviewer: 'Душан Милисављевић', rating: 3, comment: 'Корисно али премало детаља о валютама.', date: '2025-01-11T09:00:00Z', status: 'pending' },
  { id: 'r6', articleId: 'a9', reviewer: 'Снежана Вујовић', rating: 5, comment: 'Савршен водич за нове кориснике!', date: '2025-01-13T12:00:00Z', status: 'pending' },
  { id: 'r7', articleId: 'a3', reviewer: 'БориславЂорђевић', rating: 5, comment: 'Свепли садржај, врло детаљно.', date: '2025-01-06T14:00:00Z', status: 'approved' },
  { id: 'r8', articleId: 'a11', reviewer: 'Наташа Костић', rating: 4, comment: 'Добро објашњене аутоматизације.', date: '2025-01-10T08:00:00Z', status: 'pending' },
  { id: 'r9', articleId: 'a12', reviewer: 'Милан Савић', rating: 2, comment: 'Чланак је застарео и треба ажурирати.', date: '2024-12-15T10:00:00Z', status: 'rejected' },
  { id: 'r10', articleId: 'a13', reviewer: 'Драгана Јанковић', rating: 4, comment: 'Интеграција ради савршено, добро упутство.', date: '2025-01-09T16:00:00Z', status: 'approved' },
]

const MOCK_SEARCH_QUERIES: SearchQuery[] = [
  { query: 'фактура', count: 145, hasResults: true },
  { query: 'плаћање', count: 98, hasResults: true },
  { query: 'партнер', count: 87, hasResults: true },
  { query: 'API', count: 76, hasResults: true },
  { query: 'залиха', count: 65, hasResults: true },
  { query: 'безбедност', count: 43, hasResults: true },
  { query: 'webhook', count: 34, hasResults: true },
  { query: 'баг репорт', count: 12, hasResults: false },
  { query: 'трофеји', count: 8, hasResults: false },
  { query: 'SEO оптимизација', count: 5, hasResults: false },
]

const MONTHLY_TREND_DATA = [
  { month: 'Avg', articles: 3 },
  { month: 'Sep', articles: 2 },
  { month: 'Okt', articles: 4 },
  { month: 'Nov', articles: 4 },
  { month: 'Dec', articles: 3 },
  { month: 'Jan', articles: 5 },
]

const CHART_COLORS = ['#f97316', '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#6366f1', '#ef4444']

const trendChartConfig: ChartConfig = {
  articles: { label: 'Članci', color: '#f97316' },
}

// ==================== STATUS CONFIG ====================

const ARTICLE_STATUS_MAP: Record<string, { color: string }> = {
  published: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  draft: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
  review: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  archived: { color: 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-500' },
}

const REVIEW_STATUS_MAP: Record<string, { color: string }> = {
  pending: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  approved: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  rejected: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

// ==================== HELPER COMPONENTS ====================

function StarRating({ rating, max = 5, size = 'sm' }: { rating: number; max?: number; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={`${sizeClass} ${i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
        />
      ))}
    </div>
  )
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <span>{text}</span>
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-amber-200 dark:bg-amber-800 rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  )
}

// ==================== EMPTY FORMS ====================

const EMPTY_ARTICLE_FORM: ArticleForm = {
  title: '',
  categoryId: '',
  author: '',
  status: 'draft',
  content: '',
  tags: '',
  relatedArticleIds: [],
}

const EMPTY_CATEGORY_FORM: CategoryForm = {
  name: '',
  parentId: '',
  icon: '📁',
  description: '',
}

const DEFAULT_SETTINGS: KbSettings = {
  name: 'Корпоративна база знања',
  description: 'Централно место за чланке, документацију и дељење знања унутар организације.',
  allowPublicAccess: false,
  allowRatings: true,
  allowComments: true,
  requireApproval: true,
  defaultCategory: 'cat1',
  articleTemplate: '## Увод\n\nОпшти опис теме чланка.\n\n## Садржај\n\nДетаљнији опис и кораци.\n\n## Закључак\n\nРезиме и додатни ресурси.',
}

// ==================== MAIN COMPONENT ====================

export function KnowledgeBase() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()

  // ---- State ----
  const [activeTab, setActiveTab] = useState('overview')
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES)
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS)
  const [settings, setSettings] = useState<KbSettings>(DEFAULT_SETTINGS)

  // Load articles from API
  useEffect(() => {
    if (!activeCompanyId) return
    fetch(`/api/knowledge-base?companyId=${activeCompanyId}&limit=100`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.items?.length > 0) setArticles(data.items)
        else setArticles(MOCK_ARTICLES)
      })
      .catch(() => setArticles(MOCK_ARTICLES))
  }, [activeCompanyId])

  // Article filters
  const [articleSearch, setArticleSearch] = useState('')
  const [articleCatFilter, setArticleCatFilter] = useState('all')
  const [articleStatusFilter, setArticleStatusFilter] = useState('all')
  const [articleAuthorFilter, setArticleAuthorFilter] = useState('all')

  // Article dialog
  const [articleDialogOpen, setArticleDialogOpen] = useState(false)
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null)
  const [articleForm, setArticleForm] = useState<ArticleForm>(EMPTY_ARTICLE_FORM)

  // Article detail dialog
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)

  // Category dialog
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(EMPTY_CATEGORY_FORM)

  // Search tab
  const [searchQuery, setSearchQuery] = useState('')
  const [searchCategoryFilter, setSearchCategoryFilter] = useState('all')
  const [searchDateRange, setSearchDateRange] = useState('all')

  // Reviews
  const [selectedReviewIds, setSelectedReviewIds] = useState<string[]>([])

  // Toast state
  const [toastMessage, setToastMessage] = useState('')

  // ---- Helpers ----
  const getCategoryName = (id: string): string => {
    const cat = categories.find((c) => c.id === id)
    return cat?.name ?? ''
  }

  const getArticleTitle = (id: string): string => {
    const art = articles.find((a) => a.id === id)
    return art?.title ?? ''
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('sr-RS', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  }

  // ---- Computed values ----
  const uniqueAuthors = useMemo(() => {
    const set = new Set(articles.map((a) => a.author))
    return Array.from(set)
  }, [articles])

  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      if (articleSearch && !a.title.toLowerCase().includes(articleSearch.toLowerCase())) return false
      if (articleCatFilter !== 'all' && a.categoryId !== articleCatFilter) return false
      if (articleStatusFilter !== 'all' && a.status !== articleStatusFilter) return false
      if (articleAuthorFilter !== 'all' && a.author !== articleAuthorFilter) return false
      return true
    })
  }, [articles, articleSearch, articleCatFilter, articleStatusFilter, articleAuthorFilter])

  const topViewedArticles = useMemo(() => {
    return [...articles].sort((a, b) => b.views - a.views).slice(0, 5)
  }, [articles])

  const recentContributions = useMemo(() => {
    return [...articles].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5)
  }, [articles])

  const publishedArticles = articles.filter((a) => a.status === 'published')
  const reviewArticles = articles.filter((a) => a.status === 'review')
  const viewsToday = 147
  const avgRating = publishedArticles.length > 0
    ? publishedArticles.reduce((s, a) => s + a.rating, 0) / publishedArticles.length
    : 0

  const categoryDistributionData = useMemo(() => {
    const map: Record<string, number> = {}
    articles.forEach((a) => {
      const name = getCategoryName(a.categoryId) || 'Остало'
      map[name] = (map[name] || 0) + 1
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [articles, categories])

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    let results = articles.filter((a) => {
      const q = searchQuery.toLowerCase()
      const matchesText = a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q) || a.tags.some((tag) => tag.toLowerCase().includes(q))
      if (!matchesText) return false
      if (searchCategoryFilter !== 'all' && a.categoryId !== searchCategoryFilter) return false
      if (searchDateRange !== 'all') {
        const now = Date.now()
        const articleDate = new Date(a.updatedAt).getTime()
        const days = searchDateRange === '7' ? 7 : searchDateRange === '30' ? 30 : 90
        if (now - articleDate > days * 86400000) return false
      }
      return true
    })
    return results
  }, [searchQuery, articles, searchCategoryFilter, searchDateRange])

  const articleReviewMap = useMemo(() => {
    const map: Record<string, { avg: number; count: number }> = {}
    reviews.forEach((r) => {
      if (!map[r.articleId]) map[r.articleId] = { avg: 0, count: 0 }
      map[r.articleId].count++
      map[r.articleId].avg += r.rating
    })
    Object.keys(map).forEach((key) => {
      if (map[key].count > 0) map[key].avg /= map[key].count
    })
    return map
  }, [reviews])

  // ---- Article CRUD ----
  const openCreateArticle = () => {
    setEditingArticleId(null)
    setArticleForm(EMPTY_ARTICLE_FORM)
    setArticleDialogOpen(true)
  }

  const openEditArticle = (article: Article) => {
    setEditingArticleId(article.id)
    setArticleForm({
      title: article.title,
      categoryId: article.categoryId,
      author: article.author,
      status: article.status,
      content: article.content,
      tags: article.tags.join(', '),
      relatedArticleIds: article.relatedArticleIds,
    })
    setArticleDialogOpen(true)
  }

  const handleSaveArticle = () => {
    if (!articleForm.title.trim() || !activeCompanyId) return
    const tagsArr = articleForm.tags.split(',').map((s) => s.trim()).filter(Boolean)
    if (editingArticleId) {
      fetch(`/api/knowledge-base?id=${editingArticleId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...articleForm, tags: JSON.stringify(tagsArr) }),
      }).then(() => {
        setArticles((prev) =>
          prev.map((a) =>
            a.id === editingArticleId
              ? { ...a, ...articleForm, tags: tagsArr, updatedAt: new Date().toISOString() }
              : a
          )
        )
        showToast(t('knowledge.editArticle'))
      })
    } else {
      fetch('/api/knowledge-base', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: activeCompanyId,
          title: articleForm.title,
          categoryId: articleForm.categoryId,
          author: articleForm.author,
          status: articleForm.status,
          content: articleForm.content,
          tags: JSON.stringify(tagsArr),
        }),
      }).then((res) => {
        if (res.ok) return res.json()
      }).then((newArticle) => {
        if (newArticle) setArticles((prev) => [newArticle, ...prev])
        else {
          const fallback: Article = {
            id: `a${Date.now()}`, title: articleForm.title, categoryId: articleForm.categoryId,
            author: articleForm.author, status: articleForm.status, views: 0, rating: 0,
            content: articleForm.content, tags: tagsArr, relatedArticleIds: articleForm.relatedArticleIds,
            createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
          }
          setArticles((prev) => [fallback, ...prev])
        }
        showToast(t('knowledge.createArticle'))
      })
    }
    setArticleDialogOpen(false)
  }

  const handleDeleteArticle = (id: string) => {
    fetch(`/api/knowledge-base?id=${id}`, { method: 'DELETE' }).then(() => {
      setArticles((prev) => prev.filter((a) => a.id !== id))
    })
  }

  // ---- Category CRUD ----
  const openCreateCategory = () => {
    setEditingCategoryId(null)
    setCategoryForm(EMPTY_CATEGORY_FORM)
    setCategoryDialogOpen(true)
  }

  const openEditCategory = (cat: Category) => {
    setEditingCategoryId(cat.id)
    setCategoryForm({
      name: cat.name,
      parentId: cat.parentId ?? '',
      icon: cat.icon,
      description: cat.description,
    })
    setCategoryDialogOpen(true)
  }

  const handleSaveCategory = () => {
    if (!categoryForm.name.trim()) return
    if (editingCategoryId) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategoryId
            ? { ...c, name: categoryForm.name, parentId: categoryForm.parentId || null, icon: categoryForm.icon, description: categoryForm.description }
            : c
        )
      )
    } else {
      const newCat: Category = {
        id: `cat${Date.now()}`,
        name: categoryForm.name,
        parentId: categoryForm.parentId || null,
        icon: categoryForm.icon,
        description: categoryForm.description,
      }
      setCategories((prev) => [...prev, newCat])
    }
    setCategoryDialogOpen(false)
  }

  const handleDeleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  // ---- Reviews actions ----
  const toggleReviewSelection = (id: string) => {
    setSelectedReviewIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    )
  }

  const handleBulkApprove = () => {
    setReviews((prev) =>
      prev.map((r) => (selectedReviewIds.includes(r.id) ? { ...r, status: 'approved' as const } : r))
    )
    setSelectedReviewIds([])
  }

  const handleBulkReject = () => {
    setReviews((prev) =>
      prev.map((r) => (selectedReviewIds.includes(r.id) ? { ...r, status: 'rejected' as const } : r))
    )
    setSelectedReviewIds([])
  }

  // ---- Render ----
  if (!activeCompanyId) return null

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="h-4 w-4" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('knowledge.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('knowledge.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-1" />
            {t('knowledge.refresh')}
          </Button>
          <Button size="sm" onClick={openCreateArticle}>
            <Plus className="h-4 w-4 mr-1" />
            {t('knowledge.newArticle')}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-1 hidden sm:inline" />
            {t('knowledge.tabOverview')}
          </TabsTrigger>
          <TabsTrigger value="articles">
            <BookOpen className="h-4 w-4 mr-1 hidden sm:inline" />
            {t('knowledge.tabArticles')}
          </TabsTrigger>
          <TabsTrigger value="categories">
            <FolderOpen className="h-4 w-4 mr-1 hidden sm:inline" />
            {t('knowledge.tabCategories')}
          </TabsTrigger>
          <TabsTrigger value="search">
            <Search className="h-4 w-4 mr-1 hidden sm:inline" />
            {t('knowledge.tabSearch')}
          </TabsTrigger>
          <TabsTrigger value="reviews">
            <Star className="h-4 w-4 mr-1 hidden sm:inline" />
            {t('knowledge.tabReviews')}
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-1 hidden sm:inline" />
            {t('knowledge.tabSettings')}
          </TabsTrigger>
        </TabsList>

        {/* ==================== TAB 1: OVERVIEW ==================== */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{t('knowledge.kpiTotalArticles')}</span>
                <FileText className="h-4 w-4 text-orange-500" />
              </div>
              <p className="text-2xl font-bold">{articles.length}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{t('knowledge.kpiCategories')}</span>
                <FolderOpen className="h-4 w-4 text-cyan-500" />
              </div>
              <p className="text-2xl font-bold">{categories.length}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{t('knowledge.kpiContributors')}</span>
                <Users className="h-4 w-4 text-violet-500" />
              </div>
              <p className="text-2xl font-bold">{uniqueAuthors.length}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{t('knowledge.kpiViewsToday')}</span>
                <Eye className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-600">{viewsToday}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{t('knowledge.kpiAvgRating')}</span>
                <Star className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-amber-600">{avgRating.toFixed(1)}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{t('knowledge.kpiPendingReview')}</span>
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-amber-600">{reviewArticles.length}</p>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t('knowledge.monthlyTrend')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={trendChartConfig} className="h-[250px] w-full">
                  <LineChart data={MONTHLY_TREND_DATA} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="articles"
                      stroke="var(--color-articles)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t('knowledge.categoryDistribution')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={Object.fromEntries(categoryDistributionData.map((d, i) => [d.name, { label: d.name, color: CHART_COLORS[i % CHART_COLORS.length] }]))}
                  className="h-[250px] w-full"
                >
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                    <Pie
                      data={categoryDistributionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                      strokeWidth={2}
                    >
                      {categoryDistributionData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Viewed + Recent Contributions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{t('knowledge.topViewed')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topViewedArticles.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between py-2 border-b last:border-0 cursor-pointer hover:bg-muted/30 rounded px-2 -mx-2"
                    onClick={() => { setSelectedArticle(a); setDetailDialogOpen(true) }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{getCategoryName(a.categoryId)}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0 ml-2">
                      <Eye className="h-3.5 w-3.5" />
                      {a.views}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{t('knowledge.recentContributions')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentContributions.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between py-2 border-b last:border-0 cursor-pointer hover:bg-muted/30 rounded px-2 -mx-2"
                    onClick={() => { setSelectedArticle(a); setDetailDialogOpen(true) }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.author} · {getCategoryName(a.categoryId)}</p>
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0 ml-2">
                      {formatDate(a.updatedAt)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ==================== TAB 2: ARTICLES ==================== */}
        <TabsContent value="articles" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('knowledge.searchPlaceholder')}
                className="pl-9"
                value={articleSearch}
                onChange={(e) => setArticleSearch(e.target.value)}
              />
            </div>
            <Select value={articleCatFilter} onValueChange={setArticleCatFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder={t('knowledge.filterCategory')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('knowledge.filterCategory')}</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={articleStatusFilter} onValueChange={setArticleStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder={t('knowledge.filterStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('knowledge.filterStatus')}</SelectItem>
                <SelectItem value="published">{t('knowledge.statusPublished')}</SelectItem>
                <SelectItem value="draft">{t('knowledge.statusDraft')}</SelectItem>
                <SelectItem value="review">{t('knowledge.statusReview')}</SelectItem>
                <SelectItem value="archived">{t('knowledge.statusArchived')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={articleAuthorFilter} onValueChange={setArticleAuthorFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder={t('knowledge.filterAuthor')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('knowledge.filterAuthor')}</SelectItem>
                {uniqueAuthors.map((author) => (
                  <SelectItem key={author} value={author}>{author}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Article List */}
          {filteredArticles.length === 0 ? (
            <Card className="p-8 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">{t('knowledge.noArticles')}</p>
              <Button variant="outline" className="mt-3" onClick={openCreateArticle}>
                <Plus className="h-4 w-4 mr-1" />
                {t('knowledge.createArticle')}
              </Button>
            </Card>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredArticles.map((a) => {
                const statusCfg = ARTICLE_STATUS_MAP[a.status]
                return (
                  <Card key={a.id} className="hover:bg-muted/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => { setSelectedArticle(a); setDetailDialogOpen(true) }}
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium truncate">{a.title}</span>
                            <Badge variant="outline" className={`text-xs shrink-0 ${statusCfg?.color ?? ''}`}>
                              {t(`knowledge.status${a.status.charAt(0).toUpperCase() + a.status.slice(1)}`)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                            {a.categoryId && <span>{getCategoryName(a.categoryId)}</span>}
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{a.author}</span>
                            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{a.views}</span>
                            {a.rating > 0 && (
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                {a.rating.toFixed(1)}
                              </span>
                            )}
                            <span>{formatDate(a.updatedAt)}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => { setSelectedArticle(a); setDetailDialogOpen(true) }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => openEditArticle(a)}
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive"
                            onClick={() => handleDeleteArticle(a.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* ==================== TAB 3: CATEGORIES ==================== */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={openCreateCategory}>
              <Plus className="h-4 w-4 mr-1" />
              {t('knowledge.newCategory')}
            </Button>
          </div>

          {categories.length === 0 ? (
            <Card className="p-8 text-center">
              <FolderOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">{t('knowledge.noCategories')}</p>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {categories.map((cat) => {
                    const articleCount = articles.filter((a) => a.categoryId === cat.id).length
                    const parentCat = cat.parentId ? categories.find((c) => c.id === cat.parentId) : null
                    const children = categories.filter((c) => c.parentId === cat.id)
                    return (
                      <div key={cat.id}>
                        <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-lg">{cat.icon}</span>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{cat.name}</p>
                              {parentCat && (
                                <p className="text-xs text-muted-foreground">
                                  {t('knowledge.categoryParent')}: {parentCat.name}
                                </p>
                              )}
                              {cat.description && (
                                <p className="text-xs text-muted-foreground truncate mt-0.5">{cat.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            {children.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {children.length} sub
                              </Badge>
                            )}
                            <Badge variant="outline">{articleCount}</Badge>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => openEditCategory(cat)}
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-destructive"
                              onClick={() => handleDeleteCategory(cat.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ==================== TAB 4: SEARCH ==================== */}
        <TabsContent value="search" className="space-y-6">
          {/* Search bar */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('knowledge.searchInput')}
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={searchCategoryFilter} onValueChange={setSearchCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t('knowledge.filterByCategory')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('knowledge.filterCategory')}</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={searchDateRange} onValueChange={setSearchDateRange}>
                <SelectTrigger className="w-full sm:w-[170px]">
                  <SelectValue placeholder={t('knowledge.dateRange')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('knowledge.allDates')}</SelectItem>
                  <SelectItem value="7">{t('knowledge.last7days')}</SelectItem>
                  <SelectItem value="30">{t('knowledge.last30days')}</SelectItem>
                  <SelectItem value="90">{t('knowledge.last90days')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Search Results */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                {t('knowledge.searchResults')} ({searchResults.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!searchQuery.trim() ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  {t('knowledge.noSearchQuery')}
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  {t('knowledge.noResults')}
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {searchResults.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between py-2 border-b last:border-0 cursor-pointer hover:bg-muted/30 rounded px-2 -mx-2"
                      onClick={() => { setSelectedArticle(a); setDetailDialogOpen(true) }}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">
                          <HighlightedText text={a.title} query={searchQuery} />
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          <HighlightedText
                            text={a.content.slice(0, 120) + '...'}
                            query={searchQuery}
                          />
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">{getCategoryName(a.categoryId)}</Badge>
                          <span>{formatDate(a.updatedAt)}</span>
                          <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{a.views}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Search Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{t('knowledge.popularQueries')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {MOCK_SEARCH_QUERIES.filter((q) => q.hasResults).map((q) => (
                  <div key={q.query} className="flex items-center justify-between py-1.5">
                    <span className="text-sm">{q.query}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-1.5">
                        <div
                          className="bg-primary rounded-full h-1.5"
                          style={{ width: `${Math.min(100, (q.count / 145) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right">{q.count}x</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{t('knowledge.noResultQueries')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {MOCK_SEARCH_QUERIES.filter((q) => !q.hasResults).map((q) => (
                  <div key={q.query} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-red-500">{q.query}</span>
                    <span className="text-xs text-muted-foreground">{q.count} {t('knowledge.times')}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ==================== TAB 5: REVIEWS ==================== */}
        <TabsContent value="reviews" className="space-y-4">
          {/* Bulk Actions */}
          {selectedReviewIds.length > 0 && (
            <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg">
              <span className="text-sm text-muted-foreground">
                {selectedReviewIds.length} {t('common.selected', 'одабрано')}
              </span>
              <Button size="sm" variant="outline" onClick={handleBulkApprove}>
                <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                {t('knowledge.approveSelected')}
              </Button>
              <Button size="sm" variant="outline" onClick={handleBulkReject}>
                <ThumbsDown className="h-3.5 w-3.5 mr-1" />
                {t('knowledge.rejectSelected')}
              </Button>
            </div>
          )}

          {reviews.length === 0 ? (
            <Card className="p-8 text-center">
              <Star className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">{t('knowledge.noReviews')}</p>
            </Card>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {reviews.map((r) => {
                const article = articles.find((a) => a.id === r.articleId)
                const articleTitle = article?.title ?? r.articleId
                const revStatusCfg = REVIEW_STATUS_MAP[r.status]
                const isSelected = selectedReviewIds.includes(r.id)
                return (
                  <Card key={r.id} className={`hover:bg-muted/30 transition-colors ${isSelected ? 'ring-2 ring-primary' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleReviewSelection(r.id)}
                          className="mt-1 h-4 w-4 rounded border-gray-300"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium truncate">{articleTitle}</span>
                            <Badge variant="outline" className={`text-xs shrink-0 ${revStatusCfg?.color ?? ''}`}>
                              {t(`knowledge.status${r.status.charAt(0).toUpperCase() + r.status.slice(1)}`)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {r.reviewer}
                            </span>
                            <StarRating rating={r.rating} />
                            <span>{formatDate(r.date)}</span>
                          </div>
                          {r.comment && (
                            <p className="text-sm text-muted-foreground mt-2">{r.comment}</p>
                          )}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {r.status === 'pending' && (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-green-600"
                                onClick={() => {
                                  setReviews((prev) => prev.map((rev) => rev.id === r.id ? { ...rev, status: 'approved' } : rev))
                                }}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-red-500"
                                onClick={() => {
                                  setReviews((prev) => prev.map((rev) => rev.id === r.id ? { ...rev, status: 'rejected' } : rev))
                                }}
                              >
                                <XCircle className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Average Rating per Article */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{t('knowledge.avgRating')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(articleReviewMap).map(([articleId, data]) => (
                  <div key={articleId} className="flex items-center justify-between py-1.5">
                    <span className="text-sm truncate max-w-[300px]">{getArticleTitle(articleId)}</span>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <StarRating rating={data.avg} />
                      <span className="text-xs text-muted-foreground w-12 text-right">{data.avg.toFixed(1)} ({data.count})</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== TAB 6: SETTINGS ==================== */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('knowledge.tabSettings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>{t('knowledge.settingsName')}</Label>
                  <Input
                    value={settings.name}
                    onChange={(e) => setSettings((s) => ({ ...s, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('knowledge.settingsDefaultCategory')}</Label>
                  <Select
                    value={settings.defaultCategory}
                    onValueChange={(v) => setSettings((s) => ({ ...s, defaultCategory: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('knowledge.settingsDescription')}</Label>
                <Textarea
                  value={settings.description}
                  onChange={(e) => setSettings((s) => ({ ...s, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('knowledge.settingsPublic')}</Label>
                    <p className="text-xs text-muted-foreground">
                      {t('knowledge.settingsPublic')}
                    </p>
                  </div>
                  <Switch
                    checked={settings.allowPublicAccess}
                    onCheckedChange={(v) => setSettings((s) => ({ ...s, allowPublicAccess: v }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('knowledge.settingsRatings')}</Label>
                    <p className="text-xs text-muted-foreground">
                      {t('knowledge.settingsRatings')}
                    </p>
                  </div>
                  <Switch
                    checked={settings.allowRatings}
                    onCheckedChange={(v) => setSettings((s) => ({ ...s, allowRatings: v }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('knowledge.settingsComments')}</Label>
                    <p className="text-xs text-muted-foreground">
                      {t('knowledge.settingsComments')}
                    </p>
                  </div>
                  <Switch
                    checked={settings.allowComments}
                    onCheckedChange={(v) => setSettings((s) => ({ ...s, allowComments: v }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('knowledge.settingsApproval')}</Label>
                    <p className="text-xs text-muted-foreground">
                      {t('knowledge.settingsApproval')}
                    </p>
                  </div>
                  <Switch
                    checked={settings.requireApproval}
                    onCheckedChange={(v) => setSettings((s) => ({ ...s, requireApproval: v }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>{t('knowledge.settingsTemplate')}</Label>
                <Textarea
                  value={settings.articleTemplate}
                  onChange={(e) => setSettings((s) => ({ ...s, articleTemplate: e.target.value }))}
                  rows={6}
                  placeholder={t('knowledge.settingsTemplatePlaceholder')}
                  className="font-mono text-sm"
                />
              </div>

              <Button onClick={() => showToast(t('knowledge.settingsSaved'))}>
                <Check className="h-4 w-4 mr-1" />
                {t('knowledge.save')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ==================== ARTICLE CREATE/EDIT CARD ==================== */}
      {articleDialogOpen && (
        <Card className="border">
          <CardHeader className="flex flex-row items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setArticleDialogOpen(false)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex-1"><CardTitle className="text-base">{editingArticleId ? t('knowledge.editArticle') : t('knowledge.createArticle')}</CardTitle></div>
          </CardHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('knowledge.articleTitle')}</Label>
              <Input
                value={articleForm.title}
                onChange={(e) => setArticleForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t('knowledge.articleCategory')}</Label>
                <Select
                  value={articleForm.categoryId}
                  onValueChange={(v) => setArticleForm((f) => ({ ...f, categoryId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('knowledge.articleCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('knowledge.articleAuthor')}</Label>
                <Input
                  value={articleForm.author}
                  onChange={(e) => setArticleForm((f) => ({ ...f, author: e.target.value }))}
                  placeholder={t('knowledge.articleAuthor')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('knowledge.articleStatus')}</Label>
                <Select
                  value={articleForm.status}
                  onValueChange={(v) => setArticleForm((f) => ({ ...f, status: v as ArticleForm['status'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">{t('knowledge.statusDraft')}</SelectItem>
                    <SelectItem value="review">{t('knowledge.statusReview')}</SelectItem>
                    <SelectItem value="published">{t('knowledge.statusPublished')}</SelectItem>
                    <SelectItem value="archived">{t('knowledge.statusArchived')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('knowledge.articleContent')}</Label>
              <Textarea
                value={articleForm.content}
                onChange={(e) => setArticleForm((f) => ({ ...f, content: e.target.value }))}
                rows={8}
                placeholder={t('knowledge.contentPlaceholder')}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('knowledge.articleTags')}</Label>
                <Input
                  value={articleForm.tags}
                  onChange={(e) => setArticleForm((f) => ({ ...f, tags: e.target.value }))}
                  placeholder={t('knowledge.tagsPlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('knowledge.articleRelated')}</Label>
                <Select
                  value={articleForm.relatedArticleIds[0] ?? 'none'}
                  onValueChange={(v) => setArticleForm((f) => ({
                    ...f,
                    relatedArticleIds: v === 'none' ? [] : [v],
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('knowledge.relatedPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('knowledge.relatedPlaceholder')}</SelectItem>
                    {articles
                      .filter((a) => a.id !== editingArticleId)
                      .map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <Button variant="outline" onClick={() => setArticleDialogOpen(false)}>
              {t('knowledge.cancel')}
            </Button>
            <Button onClick={handleSaveArticle}>
              <Plus className="h-4 w-4 mr-1" />
              {editingArticleId ? t('knowledge.save') : t('knowledge.createArticle')}
            </Button>
          </div>
        </Card>
      )}

      {/* ==================== ARTICLE DETAIL CARD ==================== */}
      {detailDialogOpen && (
        <Card className="border">
          <CardHeader className="flex flex-row items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setDetailDialogOpen(false)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex-1"><CardTitle className="text-base">{selectedArticle?.title}</CardTitle></div>
          </CardHeader>
          {selectedArticle && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className={ARTICLE_STATUS_MAP[selectedArticle.status]?.color ?? ''}
                >
                  {t(`knowledge.status${selectedArticle.status.charAt(0).toUpperCase() + selectedArticle.status.slice(1)}`)}
                </Badge>
                {selectedArticle.categoryId && (
                  <Badge variant="outline">{getCategoryName(selectedArticle.categoryId)}</Badge>
                )}
                {selectedArticle.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    <Tag className="h-2.5 w-2.5 mr-0.5" />
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {selectedArticle.author}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {selectedArticle.views} {t('knowledge.detailViews')}
                </span>
                {selectedArticle.rating > 0 && (
                  <span className="flex items-center gap-1">
                    <StarRating rating={selectedArticle.rating} />
                    <span>{selectedArticle.rating.toFixed(1)}</span>
                  </span>
                )}
                <span>{formatDate(selectedArticle.updatedAt)}</span>
              </div>
              <Separator />
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {selectedArticle.content}
              </div>
              {selectedArticle.relatedArticleIds.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      {t('knowledge.articleRelated')}
                    </p>
                    <div className="space-y-1">
                      {selectedArticle.relatedArticleIds.map((relId) => (
                        <div
                          key={relId}
                          className="text-sm text-primary cursor-pointer hover:underline"
                          onClick={() => {
                            const rel = articles.find((a) => a.id === relId)
                            if (rel) setSelectedArticle(rel)
                          }}
                        >
                          {getArticleTitle(relId)}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </Card>
      )}

      {/* ==================== CATEGORY CREATE/EDIT CARD ==================== */}
      {categoryDialogOpen && (
        <Card className="border">
          <CardHeader className="flex flex-row items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setCategoryDialogOpen(false)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex-1"><CardTitle className="text-base">{editingCategoryId ? t('knowledge.editCategory') : t('knowledge.createCategory')}</CardTitle></div>
          </CardHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('knowledge.categoryName')}</Label>
                <Input
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('knowledge.categoryIcon')}</Label>
                <Input
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm((f) => ({ ...f, icon: e.target.value }))}
                  className="text-center text-lg"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('knowledge.categoryParent')}</Label>
              <Select
                value={categoryForm.parentId}
                onValueChange={(v) => setCategoryForm((f) => ({ ...f, parentId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('knowledge.noParent')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('knowledge.noParent')}</SelectItem>
                  {categories
                    .filter((c) => c.id !== editingCategoryId)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('knowledge.categoryDescription')}</Label>
              <Textarea
                value={categoryForm.description}
                onChange={(e) => setCategoryForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
              {t('knowledge.cancel')}
            </Button>
            <Button onClick={handleSaveCategory}>
              <Plus className="h-4 w-4 mr-1" />
              {t('knowledge.save')}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
