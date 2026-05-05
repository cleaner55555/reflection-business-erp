export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'FAQ', parentId: null, icon: '❓', description: 'Често постављана питања' },
  { id: 'cat2', name: 'Упатства', parentId: null, icon: '📖', description: 'Корисничка упатства' },
  { id: 'cat3', name: 'Производи', parentId: null, icon: '📦', description: 'Документација о производима' },
  { id: 'cat4', name: 'Трубе & Интеграције', parentId: null, icon: '🔌', description: 'API и интеграције' },
  { id: 'cat5', name: 'Безбедност', parentId: 'cat4', icon: '🔒', description: 'Безбедносни протоколи' },
  { id: 'cat6', name: 'Вебhooks', parentId: 'cat4', icon: '🔗', description: 'Webhook конфигурације' },
  { id: 'cat7', name: 'Види & Обука', parentId: null, icon: '🎓', description: 'Видео материјали' },
  { id: 'cat8', name: 'Пошаљи пријаве', parentId: null, icon: '🐛', description: 'Пријаве грешака' },
]

export const MOCK_ARTICLES: Article[] = [
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

export const MOCK_REVIEWS: Review[] = [
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

export const MOCK_SEARCH_QUERIES: SearchQuery[] = [
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

export const MONTHLY_TREND_DATA = [
  { month: 'Avg', articles: 3 },
  { month: 'Sep', articles: 2 },
  { month: 'Okt', articles: 4 },
  { month: 'Nov', articles: 4 },
  { month: 'Dec', articles: 3 },
  { month: 'Jan', articles: 5 },
]

export const CHART_COLORS = ['#f97316', '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#6366f1', '#ef4444']

export const trendChartConfig: ChartConfig = {
  articles: { label: 'Članci', color: '#f97316' },
}

export const ARTICLE_STATUS_MAP: Record<string, { color: string }> = {
  published: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  draft: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
  review: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  archived: { color: 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-500' },
}

export const REVIEW_STATUS_MAP: Record<string, { color: string }> = {
  pending: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  approved: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  rejected: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

export const sizeClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

export const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');

export const parts = text.split(regex);

export const EMPTY_ARTICLE_FORM: ArticleForm = {
  title: '',
  categoryId: '',
  author: '',
  status: 'draft',
  content: '',
  tags: '',
  relatedArticleIds: [],
}

export const EMPTY_CATEGORY_FORM: CategoryForm = {
  name: '',
  parentId: '',
  icon: '📁',
  description: '',
}

export const DEFAULT_SETTINGS: KbSettings = {
  name: 'Корпоративна база знања',
  description: 'Централно место за чланке, документацију и дељење знања унутар организације.',
  allowPublicAccess: false,
  allowRatings: true,
  allowComments: true,
  requireApproval: true,
  defaultCategory: 'cat1',
  articleTemplate: '## Увод\n\nОпшти опис теме чланка.\n\n## Садржај\n\nДетаљнији опис и кораци.\n\n## Закључак\n\nРезиме и додатни ресурси.',
}

export const { activeCompanyId } = useAppStore();

export const { t } = useTranslation();

export const getCategoryName = (id: string): string => {
    const cat = categories.find((c) => c.id === id)
    return cat?.name ?? ''
  }

export const getArticleTitle = (id: string): string => {
    const art = articles.find((a) => a.id === id)
    return art?.title ?? ''
  }

export const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

export const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('sr-RS', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  }

export const set = new Set(articles.map((a) => a.author));

export const publishedArticles = articles.filter((a) => a.status === 'published');

export const reviewArticles = articles.filter((a) => a.status === 'review');

export const viewsToday = 147;

export const avgRating = publishedArticles.length > 0;

export const map: Record<string, number> = {}

export const name = getCategoryName(a.categoryId) || 'Остало';

export const q = searchQuery.toLowerCase();

export const matchesText = a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q) || a.tags.some((tag) => tag.toLowerCase().includes(q));

export const now = Date.now();

export const articleDate = new Date(a.updatedAt).getTime();

export const days = searchDateRange === '7' ? 7 : searchDateRange === '30' ? 30 : 90;

export const map: Record<string, { avg: number; count: number }> = {}

export const openCreateArticle = () => {
    setEditingArticleId(null)
    setArticleForm(EMPTY_ARTICLE_FORM)
    setArticleDialogOpen(true)
  }

export const openEditArticle = (article: Article) => {
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

export const handleSaveArticle = () => {
    if (!articleForm.title.trim()) return
    const tagsArr = articleForm.tags.split(',').map((s) => s.trim()).filter(Boolean)
    if (editingArticleId) {
      setArticles((prev) =>
        prev.map((a) =>
          a.id === editingArticleId
            ? { ...a, ...articleForm, tags: tagsArr, updatedAt: new Date().toISOString() }
            : a
        )
      )
      showToast(t('knowledge.editArticle'))
    } else {
      const newArticle: Article = {
        id: `a${Date.now()}`,
        title: articleForm.title,
        categoryId: articleForm.categoryId,
        author: articleForm.author,
        status: articleForm.status,
        views: 0,
        rating: 0,
        content: articleForm.content,
        tags: tagsArr,
        relatedArticleIds: articleForm.relatedArticleIds,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setArticles((prev) => [newArticle, ...prev])
      showToast(t('knowledge.createArticle'))
    }
    setArticleDialogOpen(false)
  }

export const handleDeleteArticle = (id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id))
  }

export const openCreateCategory = () => {
    setEditingCategoryId(null)
    setCategoryForm(EMPTY_CATEGORY_FORM)
    setCategoryDialogOpen(true)
  }

export const openEditCategory = (cat: Category) => {
    setEditingCategoryId(cat.id)
    setCategoryForm({
      name: cat.name,
      parentId: cat.parentId ?? '',
      icon: cat.icon,
      description: cat.description,
    })
    setCategoryDialogOpen(true)
  }

export const handleSaveCategory = () => {
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

export const handleDeleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

export const toggleReviewSelection = (id: string) => {
    setSelectedReviewIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    )
  }

export const handleBulkApprove = () => {
    setReviews((prev) =>
      prev.map((r) => (selectedReviewIds.includes(r.id) ? { ...r, status: 'approved' as const } : r))
    )
    setSelectedReviewIds([])
  }

export const handleBulkReject = () => {
    setReviews((prev) =>
      prev.map((r) => (selectedReviewIds.includes(r.id) ? { ...r, status: 'rejected' as const } : r))
    )
    setSelectedReviewIds([])
  }

export const statusCfg = ARTICLE_STATUS_MAP[a.status]

export const articleCount = articles.filter((a) => a.categoryId === cat.id).length;

export const parentCat = cat.parentId ? categories.find((c) => c.id === cat.parentId) : null;

export const children = categories.filter((c) => c.parentId === cat.id);

export const article = articles.find((a) => a.id === r.articleId);

export const articleTitle = article?.title ?? r.articleId;

export const revStatusCfg = REVIEW_STATUS_MAP[r.status]

export const isSelected = selectedReviewIds.includes(r.id);

export const rel = articles.find((a) => a.id === relId);
