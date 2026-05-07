'use client'
import React from 'react'
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
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { generateMockTopics, generateMockCategories, generateMockQuestions, generateMockTags, generateMonthlyData, generateMockReplies } from './components'
import { handleCreateTopic, handleDeleteTopic, handleOpenTopicDetail, handleSubmitReply, handleCreateCategory, handleEditCategory, handleOpenQuestion, handleSubmitAnswer, handleAcceptAnswer, handleCreateTag, handleEditTag, formatDate } from './components'

interface ForumContentProps {
  activeTab: any
  setActiveTab: React.Dispatch<React.SetStateAction<any>>
  topics: ForumTopic[]
  setTopics: React.Dispatch<React.SetStateAction<ForumTopic[]>>
  topicSearch: any
  setTopicSearch: React.Dispatch<React.SetStateAction<any>>
  topicCatFilter: any
  setTopicCatFilter: React.Dispatch<React.SetStateAction<any>>
  topicSort: 'newest' | 'popular' | 'most-replies'
  setTopicSort: React.Dispatch<React.SetStateAction<'newest' | 'popular' | 'most-replies'>>
  topicDialogOpen: any
  setTopicDialogOpen: React.Dispatch<React.SetStateAction<any>>
  detailOpen: any
  setDetailOpen: React.Dispatch<React.SetStateAction<any>>
  selectedTopic: ForumTopic | null
  setSelectedTopic: React.Dispatch<React.SetStateAction<ForumTopic | null>>
  topicReplies: ForumReply[]
  setTopicReplies: React.Dispatch<React.SetStateAction<ForumReply[]>>
  replyText: any
  setReplyText: React.Dispatch<React.SetStateAction<any>>
  categories: ForumCategory[]
  setCategories: React.Dispatch<React.SetStateAction<ForumCategory[]>>
  catDialogOpen: any
  setCatDialogOpen: React.Dispatch<React.SetStateAction<any>>
  editingCategory: ForumCategory | null
  setEditingCategory: React.Dispatch<React.SetStateAction<ForumCategory | null>>
  questions: ForumQuestion[]
  setQuestions: React.Dispatch<React.SetStateAction<ForumQuestion[]>>
  qSearch: any
  setQSearch: React.Dispatch<React.SetStateAction<any>>
  qFilter: 'all' | 'open' | 'solved'
  setQFilter: React.Dispatch<React.SetStateAction<'all' | 'open' | 'solved'>>
  selectedQuestion: ForumQuestion | null
  setSelectedQuestion: React.Dispatch<React.SetStateAction<ForumQuestion | null>>
  qDetailOpen: any
  setQDetailOpen: React.Dispatch<React.SetStateAction<any>>
  newAnswerText: any
  setNewAnswerText: React.Dispatch<React.SetStateAction<any>>
  tags: ForumTag[]
  setTags: React.Dispatch<React.SetStateAction<ForumTag[]>>
  tagSearch: any
  setTagSearch: React.Dispatch<React.SetStateAction<any>>
  tagDialogOpen: any
  setTagDialogOpen: React.Dispatch<React.SetStateAction<any>>
  editingTag: ForumTag | null
  setEditingTag: React.Dispatch<React.SetStateAction<ForumTag | null>>
  tagView: 'cloud' | 'list'
  setTagView: React.Dispatch<React.SetStateAction<'cloud' | 'list'>>
  settings: ForumSettings
  setSettings: React.Dispatch<React.SetStateAction<ForumSettings>>
  loading: any
  setLoading: React.Dispatch<React.SetStateAction<any>>
  settingsSaved: any
  setSettingsSaved: React.Dispatch<React.SetStateAction<any>>
  topicForm: any
  setTopicForm: React.Dispatch<React.SetStateAction<any>>
  catForm: any
  setCatForm: React.Dispatch<React.SetStateAction<any>>
  tagForm: any
  setTagForm: React.Dispatch<React.SetStateAction<any>>
  emptyTopicForm: any
  emptyCatForm: any
  emptyTagForm: any
}

export function ForumContent({
  activeTab, setActiveTab, topics, setTopics, topicSearch, setTopicSearch, topicCatFilter, setTopicCatFilter, topicSort, setTopicSort, topicDialogOpen, setTopicDialogOpen, detailOpen, setDetailOpen, selectedTopic, setSelectedTopic, topicReplies, setTopicReplies, replyText, setReplyText, categories, setCategories, catDialogOpen, setCatDialogOpen, editingCategory, setEditingCategory, questions, setQuestions, qSearch, setQSearch, qFilter, setQFilter, selectedQuestion, setSelectedQuestion, qDetailOpen, setQDetailOpen, newAnswerText, setNewAnswerText, tags, setTags, tagSearch, setTagSearch, tagDialogOpen, setTagDialogOpen, editingTag, setEditingTag, tagView, setTagView, settings, setSettings, loading, setLoading, settingsSaved, setSettingsSaved, topicForm, setTopicForm, catForm, setCatForm, tagForm, setTagForm, emptyTopicForm, emptyCatForm, emptyTagForm
}: ForumContentProps) {
const loadData = useCallback(async () => {
  if (!activeCompanyId) return
  setLoading(true)
  const mockTopics = generateMockTopics()
  const mockCats = generateMockCategories()
  const catsWithCount = mockCats.map(cat => ({
    ...cat,
    topicCount: mockTopics.filter(tp => tp.category === cat.key).length,
  }))
  setTopics(mockTopics)
  setCategories(catsWithCount)
  setQuestions(generateMockQuestions())
  setTags(generateMockTags())
  setLoading(false)
}, [activeCompanyId])

useEffect(() => { loadData() }, [activeCompanyId, loadData])

// ─── Computed Values ───────────────────────────────────────────────────

const totalViews = topics.reduce((sum, tp) => sum + (tp.views || 0), 0)
const totalReplies = topics.reduce((sum, tp) => sum + (tp.replyCount || 0), 0)
const totalLikes = topics.reduce((sum, tp) => sum + (tp.likes || 0), 0)
const solvedCount = topics.filter(tp => tp.isSolved).length
const activeUsers = 47
const onlineNow = 8

const monthlyData = generateMonthlyData()

const categoryPieData = categories.map(cat => ({
  name: cat.label,
  value: cat.topicCount,
})).filter(d => d.value > 0)

const topContributors = [
  { name: 'Admin Tim', posts: 54, badge: 'Admin', color: 'bg-orange-100 text-orange-700' },
  { name: 'Stefan Petrović', posts: 38, badge: 'Ekspert', color: 'bg-emerald-100 text-emerald-700' },
  { name: 'Jelena Stanković', posts: 32, badge: 'Aktivan', color: 'bg-violet-100 text-violet-700' },
  { name: 'Dragana Krstić', posts: 27, badge: 'Aktivan', color: 'bg-cyan-100 text-cyan-700' },
  { name: 'Nikola Marković', posts: 21, badge: 'Član', color: 'bg-slate-100 text-slate-700' },
]

const trendingTopics = topics
  .filter(tp => !tp.isPinned)
  .sort((a, b) => (b.likes || 0) - (a.likes || 0))
  .slice(0, 5)

// ─── Filtered Data ─────────────────────────────────────────────────────

const filteredTopics = topics.filter(tp => {
  if (topicSearch && !tp.title.toLowerCase().includes(topicSearch.toLowerCase()) && !tp.content.toLowerCase().includes(topicSearch.toLowerCase())) return false
  if (topicCatFilter !== 'all' && tp.category !== topicCatFilter) return false
  return true
}).sort((a, b) => {
  if (a.isPinned && !b.isPinned) return -1
  if (!a.isPinned && b.isPinned) return 1
  if (topicSort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  if (topicSort === 'popular') return (b.views || 0) - (a.views || 0)
  return (b.replyCount || 0) - (a.replyCount || 0)
})

const filteredQuestions = questions.filter(q => {
  if (qSearch && !q.title.toLowerCase().includes(qSearch.toLowerCase())) return false
  if (qFilter === 'open' && q.hasAccepted) return false
  if (qFilter === 'solved' && !q.hasAccepted) return false
  return true
}).sort((a, b) => b.votes - a.votes)

const filteredTags = tags.filter(tg =>
  !tagSearch || tg.name.toLowerCase().includes(tagSearch.toLowerCase()) || tg.description.toLowerCase().includes(tagSearch.toLowerCase())
).sort((a, b) => b.usageCount - a.usageCount)

// ─── Handlers ──────────────────────────────────────────────────────────

const handleTogglePin = (id: string) => {
  setTopics(prev => prev.map(tp => tp.id === id ? { ...tp, isPinned: !tp.isPinned } : tp))
}

const handleToggleLock = (id: string) => {
  setTopics(prev => prev.map(tp => tp.id === id ? { ...tp, isLocked: !tp.isLocked } : tp))
}

const handleToggleSolve = (id: string) => {
  setTopics(prev => prev.map(tp => tp.id === id ? { ...tp, isSolved: !tp.isSolved } : tp))
}

const handleDeleteCategory = (id: string) => {
  setCategories(prev => prev.filter(c => c.id !== id))
}

const handleVoteQuestion = (qId: string, delta: number) => {
  setQuestions(prev => prev.map(q => q.id === qId ? { ...q, votes: q.votes + delta } : q))
}

const handleDeleteTag = (id: string) => {
  setTags(prev => prev.filter(tg => tg.id !== id))
}

const handleSaveSettings = () => {
  setSettingsSaved(true)
  setTimeout(() => setSettingsSaved(false), 3000)
}

const getCategoryLabel = (key?: string) => categories.find(c => c.key === key)?.label || key || ''
const getCategoryColor = (key?: string) => categories.find(c => c.key === key)?.color || 'bg-gray-100 text-gray-700'

// ─── Render Helpers ────────────────────────────────────────────────────

const renderKpiCard = (label: string, value: number | string, icon: React.ReactNode, color: string) => (
  <Card className="p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <div className={`p-1.5 rounded-lg ${color}`}>{icon}</div>
    </div>
    <p className="text-2xl font-bold tracking-tight">{value}</p>
  </Card>
)

// ─── Main Render ───────────────────────────────────────────────────────

return (
  <TooltipProvider>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('forum.title') || 'Forum'}</h1>
          <p className="text-sm text-muted-foreground">Zajednica za diskusiju, podršku i predloge</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-1.5" /> Osveži
          </Button>
          <Button size="sm" onClick={() => { setTopicForm(emptyTopicForm); setTopicDialogOpen(true) }}>
            <Plus className="h-4 w-4 mr-1.5" /> Nova tema
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            <BarChart3 className="h-4 w-4 mr-1 hidden sm:inline" /> Pregled
          </TabsTrigger>
          <TabsTrigger value="topics" className="text-xs sm:text-sm">
            <MessageSquare className="h-4 w-4 mr-1 hidden sm:inline" /> Teme
          </TabsTrigger>
          <TabsTrigger value="categories" className="text-xs sm:text-sm">
            <FolderOpen className="h-4 w-4 mr-1 hidden sm:inline" /> Kategorije
          </TabsTrigger>
          <TabsTrigger value="questions" className="text-xs sm:text-sm">
            <HelpCircle className="h-4 w-4 mr-1 hidden sm:inline" /> Pitanja
          </TabsTrigger>
          <TabsTrigger value="tags" className="text-xs sm:text-sm">
            <Hash className="h-4 w-4 mr-1 hidden sm:inline" /> Tagovi
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs sm:text-sm">
            <Settings2 className="h-4 w-4 mr-1 hidden sm:inline" /> Podešavanja
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════════════════════════
            TAB 1: PREGLED
            ═══════════════════════════════════════════════════════════════ */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {renderKpiCard('Tema', topics.length, <MessageSquare className="h-4 w-4 text-slate-600" />, 'bg-slate-100')}
            {renderKpiCard('Pregleda', totalViews, <Eye className="h-4 w-4 text-emerald-600" />, 'bg-emerald-100')}
            {renderKpiCard('Odgovora', totalReplies, <TrendingUp className="h-4 w-4 text-amber-600" />, 'bg-amber-100')}
            {renderKpiCard('Lajkova', totalLikes, <Heart className="h-4 w-4 text-rose-600" />, 'bg-rose-100')}
            {renderKpiCard('Rešenih', solvedCount, <CheckCircle2 className="h-4 w-4 text-violet-600" />, 'bg-violet-100')}
            {renderKpiCard('Aktivnih', activeUsers, <UsersRound className="h-4 w-4 text-cyan-600" />, 'bg-cyan-100')}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Monthly Activity Chart */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4" /> Mesečna aktivnost
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <RechartsTooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                      <Line type="monotone" dataKey="teme" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} name="Teme" />
                      <Line type="monotone" dataKey="odgovori" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Odgovori" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Pie Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4" /> Teme po kategorijama
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  {categoryPieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                          {categoryPieData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nema podataka</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {categoryPieData.map((entry, i) => (
                    <div key={entry.name} className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-[10px] text-muted-foreground">{entry.name} ({entry.value})</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Contributors & Trending */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Contributors */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Crown className="h-4 w-4 text-amber-500" /> Top dopisnici
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topContributors.map((user, i) => (
                    <div key={user.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-muted-foreground w-5">{i + 1}.</span>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                          {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.posts} postova</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${user.color}`}>{user.badge}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" /> U trendingu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trendingTopics.map(topic => (
                    <div
                      key={topic.id}
                      className="flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded-lg p-2 -mx-2 transition-colors"
                      onClick={() => handleOpenTopicDetail(topic)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{topic.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">{topic.authorName}</span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground">{formatDate(topic.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <ThumbsUp className="h-3.5 w-3.5 text-rose-400" />
                        <span className="text-xs font-medium">{topic.likes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════
            TAB 2: TEME
            ═══════════════════════════════════════════════════════════════ */}
        <TabsContent value="topics" className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži teme..."
                className="pl-9"
                value={topicSearch}
                onChange={(e) => setTopicSearch(e.target.value)}
              />
            </div>
            <Select value={topicCatFilter} onValueChange={setTopicCatFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <Filter className="h-4 w-4 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Kategorija" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Sve kategorije</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.key}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={topicSort} onValueChange={(v) => setTopicSort(v as typeof topicSort)}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Najnovije</SelectItem>
                <SelectItem value="popular">Najpopularnije</SelectItem>
                <SelectItem value="most-replies">Najviše odgovora</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{filteredTopics.length} tema pronađeno</span>
            {onlineNow > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {onlineNow} korisnika online
              </span>
            )}
          </div>

          {/* Topic List */}
          <div className="space-y-2">
            {filteredTopics.map(topic => {
              const catColor = getCategoryColor(topic.category)
              const catLabel = getCategoryLabel(topic.category)
              return (
                <Card key={topic.id} className="hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => handleOpenTopicDetail(topic)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {topic.isPinned && (
                            <Tooltip>
                              <TooltipTrigger><Pin className="h-3.5 w-3.5 text-amber-500" /></TooltipTrigger>
                              <TooltipContent>Zakačeno</TooltipContent>
                            </Tooltip>
                          )}
                          {topic.isLocked && (
                            <Tooltip>
                              <TooltipTrigger><Lock className="h-3.5 w-3.5 text-muted-foreground" /></TooltipTrigger>
                              <TooltipContent>Zaključano</TooltipContent>
                            </Tooltip>
                          )}
                          {topic.isSolved && (
                            <Tooltip>
                              <TooltipTrigger><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /></TooltipTrigger>
                              <TooltipContent>Rešeno</TooltipContent>
                            </Tooltip>
                          )}
                          <span className="text-sm font-medium">{topic.title}</span>
                          <Badge variant="outline" className={`text-[10px] ${catColor}`}>{catLabel}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{topic.content}</p>
                        {topic.tags && topic.tags.length > 0 && (
                          <div className="flex items-center gap-1 mt-2 flex-wrap">
                            {topic.tags.slice(0, 3).map(tg => (
                              <Badge key={tg} variant="secondary" className="text-[10px] px-1.5 py-0">#{tg}</Badge>
                            ))}
                            {topic.tags.length > 3 && (
                              <span className="text-[10px] text-muted-foreground">+{topic.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary">
                            {topic.authorAvatar}
                          </div>
                          <span className="font-medium">{topic.authorName}</span>
                          <span className="hidden sm:inline">·</span>
                          <span className="hidden sm:flex items-center gap-0.5"><Eye className="h-3 w-3" />{topic.views}</span>
                          <span className="hidden sm:flex items-center gap-0.5"><MessageSquare className="h-3 w-3" />{topic.replyCount}</span>
                          <span className="flex items-center gap-0.5"><ThumbsUp className="h-3 w-3" />{topic.likes}</span>
                          <span className="hidden sm:inline">·</span>
                          <span className="hidden sm:inline">{formatDate(topic.createdAt)}</span>
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            {filteredTopics.length === 0 && (
              <Card className="p-8 text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Nema tema za prikaz</p>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════
            TAB 3: KATEGORIJE
            ═══════════════════════════════════════════════════════════════ */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{categories.length} kategorija</p>
            <Button size="sm" variant="outline" onClick={() => { setEditingCategory(null); setCatForm(emptyCatForm); setCatDialogOpen(true) }}>
              <Plus className="h-4 w-4 mr-1.5" /> Nova kategorija
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map(cat => (
              <Card key={cat.id} className="p-4 hover:bg-muted/50 transition-colors cursor-pointer group relative" onClick={() => { setTopicCatFilter(cat.key); setActiveTab('topics') }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${cat.color}`}>
                      {ICON_MAP[cat.icon] || <MessageSquare className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{cat.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{cat.description}</p>
                      <p className="text-[10px] text-muted-foreground mt-1.5">{cat.topicCount} tema</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleEditCategory(cat)}>
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDeleteCategory(cat.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════
            TAB 4: PITANJA
            ═══════════════════════════════════════════════════════════════ */}
        <TabsContent value="questions" className="space-y-4">
          {/* Q&A Header */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži pitanja..."
                className="pl-9"
                value={qSearch}
                onChange={(e) => setQSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'open', 'solved'] as const).map(f => (
                <Button
                  key={f}
                  variant={qFilter === f ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setQFilter(f)}
                >
                  {f === 'all' ? 'Sva' : f === 'open' ? 'Otvorena' : 'Rešena'}
                </Button>
              ))}
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-3">
            {filteredQuestions.map(q => (
              <Card key={q.id} className="hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => handleOpenQuestion(q)}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Vote Column */}
                    <div className="flex flex-col items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleVoteQuestion(q.id, 1)}>
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <span className="text-lg font-bold">{q.votes}</span>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleVoteQuestion(q.id, -1)}>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">{q.title}</h3>
                        {q.hasAccepted && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{q.content}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {q.tags.map(tg => (
                          <Badge key={tg} variant="outline" className="text-[10px] px-1.5 py-0">#{tg}</Badge>
                        ))}
                        <span className="text-[10px] text-muted-foreground ml-auto">
                          {q.answerCount} odgovora · {formatDate(q.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredQuestions.length === 0 && (
              <Card className="p-8 text-center">
                <HelpCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Nema pitanja za prikaz</p>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════
            TAB 5: TAGOVI
            ═══════════════════════════════════════════════════════════════ */}
        <TabsContent value="tags" className="space-y-4">
          {/* Tags Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži tagove..."
                className="pl-9"
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div className="flex border rounded-md">
                <Button variant={tagView === 'cloud' ? 'default' : 'ghost'} size="sm" className="h-8 px-3" onClick={() => setTagView('cloud')}>
                  Oblak
                </Button>
                <Button variant={tagView === 'list' ? 'default' : 'ghost'} size="sm" className="h-8 px-3" onClick={() => setTagView('list')}>
                  Lista
                </Button>
              </div>
              <Button size="sm" variant="outline" onClick={() => { setEditingTag(null); setTagForm(emptyTagForm); setTagDialogOpen(true) }}>
                <Plus className="h-4 w-4 mr-1.5" /> Novi tag
              </Button>
            </div>
          </div>

          {/* Tag Cloud View */}
          {tagView === 'cloud' ? (
            <Card className="p-6">
              <div className="flex flex-wrap gap-3 justify-center">
                {filteredTags.map(tag => {
                  const sizeClass = tag.usageCount > 20 ? 'text-lg px-5 py-2.5' : tag.usageCount > 10 ? 'text-base px-4 py-2' : 'text-sm px-3 py-1.5'
                  return (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className={`${sizeClass} ${tag.color} cursor-pointer hover:opacity-80 transition-opacity font-medium`}
                      onClick={() => { setTopicSearch(tag.name); setActiveTab('topics') }}
                    >
                      #{tag.name}
                      <span className="ml-1.5 text-xs opacity-60">{tag.usageCount}</span>
                    </Badge>
                  )
                })}
              </div>
            </Card>
          ) : (
            /* Tag List View */
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredTags.map(tag => (
                    <div key={tag.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={`text-xs ${tag.color}`}>#{tag.name}</Badge>
                        <div className="hidden sm:block">
                          <p className="text-xs text-muted-foreground">{tag.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{tag.usageCount} upotreba</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleEditTag(tag)}>
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDeleteTag(tag.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════
            TAB 6: PODEŠAVANJA
            ═══════════════════════════════════════════════════════════════ */}
        <TabsContent value="settings" className="space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Settings2 className="h-4 w-4" /> Opšta podešavanja
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Dozvoli anonimne postove</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Korisnici mogu objavljivati bez naloga</p>
                </div>
                <Switch checked={settings.allowAnonymous} onCheckedChange={(v) => setSettings(s => ({ ...s, allowAnonymous: v }))} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Zahtevaj odobrenje</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Sve teme moraju biti odobrene pre objave</p>
                </div>
                <Switch checked={settings.requireApproval} onCheckedChange={(v) => setSettings(s => ({ ...s, requireApproval: v }))} />
              </div>
              <Separator />
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Max tema po danu po korisniku</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Ograničenje za sprečavanje spama</p>
                </div>
                <div className="flex items-center gap-4">
                  <Slider value={[settings.maxTopicPerDay]} onValueChange={([v]) => setSettings(s => ({ ...s, maxTopicPerDay: v }))} min={1} max={20} step={1} className="flex-1" />
                  <span className="text-sm font-semibold w-6 text-center">{settings.maxTopicPerDay}</span>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Nivo filtera za spam</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Automatsko otkrivanje i blokiranje spama</p>
                </div>
                <Select value={settings.spamFilterLevel} onValueChange={(v) => setSettings(s => ({ ...s, spamFilterLevel: v as ForumSettings['spamFilterLevel'] }))}>
                  <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Nizak</SelectItem>
                    <SelectItem value="medium">Srednji</SelectItem>
                    <SelectItem value="high">Visok</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Max dužina odgovora (karaktera)</Label>
                </div>
                <div className="flex items-center gap-4">
                  <Slider value={[settings.maxReplyLength]} onValueChange={([v]) => setSettings(s => ({ ...s, maxReplyLength: v }))} min={500} max={20000} step={500} className="flex-1" />
                  <span className="text-sm font-semibold w-12 text-center">{settings.maxReplyLength}</span>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Omogući Markdown</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Podrška za Markdown formatiranje teksta</p>
                </div>
                <Switch checked={settings.enableMarkdown} onCheckedChange={(v) => setSettings(s => ({ ...s, enableMarkdown: v }))} />
              </div>
            </CardContent>
          </Card>

          {/* Moderation Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4" /> Moderacija
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Automatsko zaključavanje tema</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Teme se automatski zaključavaju nakon određenog broja dana bez aktivnosti</p>
                </div>
                <div className="flex items-center gap-4">
                  <Slider value={[settings.autoLockDays]} onValueChange={([v]) => setSettings(s => ({ ...s, autoLockDays: v }))} min={7} max={365} step={7} className="flex-1" />
                  <span className="text-sm font-semibold w-12 text-center">{settings.autoLockDays} dana</span>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Omogući reakcije</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Emoji reakcije na teme i odgovore</p>
                </div>
                <Switch checked={settings.enableReactions} onCheckedChange={(v) => setSettings(s => ({ ...s, enableReactions: v }))} />
              </div>
            </CardContent>
          </Card>

          {/* Reputation Config */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Trophy className="h-4 w-4" /> Sistem reputacije
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Omogući glasanje</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Korisnici mogu glasati za teme i odgovore</p>
                </div>
                <Switch checked={settings.enableVoting} onCheckedChange={(v) => setSettings(s => ({ ...s, enableVoting: v }))} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Omogući bedževe</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Badges za postignuća korisnika</p>
                </div>
                <Switch checked={settings.enableBadges} onCheckedChange={(v) => setSettings(s => ({ ...s, enableBadges: v }))} />
              </div>
              <Separator />
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Reputacijski prag za napredne akcije</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Minimum bodova za kreiranje anketi, označavanje odgovora itd.</p>
                </div>
                <div className="flex items-center gap-4">
                  <Slider value={[settings.reputationThreshold]} onValueChange={([v]) => setSettings(s => ({ ...s, reputationThreshold: v }))} min={0} max={100} step={5} className="flex-1" />
                  <span className="text-sm font-semibold w-6 text-center">{settings.reputationThreshold}</span>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <Label className="text-sm font-medium">Nivoi reputacije</Label>
                <div className="space-y-2">
                  {[
                    { name: 'Početnik', min: 0, max: 9, color: 'bg-slate-100' },
                    { name: 'Član', min: 10, max: 49, color: 'bg-emerald-100' },
                    { name: 'Aktivan', min: 50, max: 99, color: 'bg-amber-100' },
                    { name: 'Ekspert', min: 100, max: 499, color: 'bg-violet-100' },
                    { name: 'Majstor', min: 500, max: 9999, color: 'bg-rose-100' },
                  ].map(level => (
                    <div key={level.name} className="flex items-center gap-3">
                      <Badge variant="outline" className={`text-xs w-20 justify-center ${level.color}`}>{level.name}</Badge>
                      <div className="flex-1">
                        <Progress value={Math.min(100, (settings.reputationThreshold - level.min) / Math.max(1, level.max - level.min) * 100)} className="h-2" />
                      </div>
                      <span className="text-xs text-muted-foreground w-16 text-right">{level.min}-{level.max === 9999 ? '∞' : level.max}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex items-center gap-3">
            <Button onClick={handleSaveSettings} disabled={settingsSaved}>
              {settingsSaved ? (
                <><CheckCircle2 className="h-4 w-4 mr-1.5" /> Sačuvano!</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-1.5" /> Sačuvaj podešavanja</>
              )}
            </Button>
            {settingsSaved && <span className="text-xs text-emerald-600">Podešavanja su uspešno sačuvana</span>}
          </div>
        </TabsContent>
      </Tabs>

      {/* ═══════════════════════════════════════════════════════════════
          DIALOG: Create / Edit Topic
          ═══════════════════════════════════════════════════════════════ */}
      <Dialog open={topicDialogOpen} onOpenChange={setTopicDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" /> Nova tema
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Naslov</Label>
              <Input
                placeholder="Unesite naslov teme..."
                value={topicForm.title}
                onChange={(e) => setTopicForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Kategorija</Label>
              <Select value={topicForm.category} onValueChange={(v) => setTopicForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.key}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tagovi</Label>
              <Input
                placeholder="npr. faktura, bug, podrška (odvojeni zarezom)"
                value={topicForm.tags}
                onChange={(e) => setTopicForm(f => ({ ...f, tags: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Sadržaj</Label>
              <Textarea
                placeholder="Opišite svoju temu..."
                value={topicForm.content}
                onChange={(e) => setTopicForm(f => ({ ...f, content: e.target.value }))}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTopicDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleCreateTopic} disabled={!topicForm.title.trim()}>
              <Plus className="h-4 w-4 mr-1.5" /> Kreiraj temu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════
          DIALOG: Topic Detail with Replies
          ═══════════════════════════════════════════════════════════════ */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-base">{selectedTopic?.title}</DialogTitle>
          </DialogHeader>
          {selectedTopic && (
            <ScrollArea className="max-h-[65vh] pr-2">
              <div className="space-y-4 pb-4">
                {/* Topic Meta */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={getCategoryColor(selectedTopic.category)}>
                    {getCategoryLabel(selectedTopic.category)}
                  </Badge>
                  {selectedTopic.isPinned && <Badge variant="outline"><Pin className="h-3 w-3 mr-1" />Zakačeno</Badge>}
                  {selectedTopic.isLocked && <Badge variant="outline"><Lock className="h-3 w-3 mr-1" />Zaključano</Badge>}
                  {selectedTopic.isSolved && <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200"><CheckCircle2 className="h-3 w-3 mr-1" />Rešeno</Badge>}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary">{selectedTopic.authorAvatar}</div>
                    <span className="font-medium">{selectedTopic.authorName}</span>
                  </div>
                  <span className="flex items-center gap-0.5"><Eye className="h-3.5 w-3.5" />{selectedTopic.views}</span>
                  <span className="flex items-center gap-0.5"><MessageSquare className="h-3.5 w-3.5" />{topicReplies.length}</span>
                  <span className="flex items-center gap-0.5"><ThumbsUp className="h-3.5 w-3.5" />{selectedTopic.likes}</span>
                  <span>{formatDate(selectedTopic.createdAt)}</span>
                </div>
                {selectedTopic.tags && selectedTopic.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {selectedTopic.tags.map(tg => (
                      <Badge key={tg} variant="secondary" className="text-[10px] px-1.5 py-0">#{tg}</Badge>
                    ))}
                  </div>
                )}

                <Separator />

                {/* Topic Content */}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedTopic.content}</p>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => handleTogglePin(selectedTopic.id)}>
                    {selectedTopic.isPinned ? <Unlock className="h-3.5 w-3.5 mr-1" /> : <Pin className="h-3.5 w-3.5 mr-1" />}
                    {selectedTopic.isPinned ? 'Otvijini' : 'Zakači'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleToggleLock(selectedTopic.id)}>
                    {selectedTopic.isLocked ? <Unlock className="h-3.5 w-3.5 mr-1" /> : <Lock className="h-3.5 w-3.5 mr-1" />}
                    {selectedTopic.isLocked ? 'Otključaj' : 'Zaključaj'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleToggleSolve(selectedTopic.id)}>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    {selectedTopic.isSolved ? 'Označi kao nerešeno' : 'Označi kao rešeno'}
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteTopic(selectedTopic.id)}>
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Obriši
                  </Button>
                </div>

                <Separator />

                {/* Replies */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Odgovori ({topicReplies.length})
                  </h3>
                  {topicReplies.map(reply => (
                    <div key={reply.id} className={`p-3 rounded-lg border ${reply.isBest ? 'border-emerald-300 bg-emerald-50/50' : ''}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary">
                            {reply.authorName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <span className="text-xs font-medium">{reply.authorName}</span>
                          {reply.isBest && (
                            <Badge variant="outline" className="text-[10px] bg-emerald-100 text-emerald-700 border-emerald-200">
                              <Star className="h-2.5 w-2.5 mr-0.5" /> Najbolji odgovor
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-0.5"><ThumbsUp className="h-3 w-3" />{reply.likes}</span>
                          <span>{formatDate(reply.createdAt)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{reply.content}</p>
                    </div>
                  ))}
                </div>

                {/* Reply Input */}
                {!selectedTopic.isLocked && (
                  <div className="space-y-2">
                    <Label className="text-xs">Vaš odgovor</Label>
                    <Textarea
                      placeholder="Napišite odgovor..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={3}
                    />
                    <div className="flex justify-end">
                      <Button size="sm" onClick={handleSubmitReply} disabled={!replyText.trim()}>
                        <MessageSquare className="h-3.5 w-3.5 mr-1" /> Pošalji odgovor
                      </Button>
                    </div>
                  </div>
                )}

                {selectedTopic.isLocked && (
                  <div className="p-4 border rounded-lg text-center bg-muted/30">
                    <Lock className="h-5 w-5 mx-auto mb-1.5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Ova tema je zaključana. Nije moguće dodavati nove odgovore.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════
          DIALOG: Create / Edit Category
          ═══════════════════════════════════════════════════════════════ */}
      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Izmeni kategoriju' : 'Nova kategorija'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Naziv</Label>
              <Input
                placeholder="Naziv kategorije..."
                value={catForm.label}
                onChange={(e) => setCatForm(f => ({ ...f, label: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Opis</Label>
              <Textarea
                placeholder="Kratak opis kategorije..."
                value={catForm.description}
                onChange={(e) => setCatForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Boja</Label>
              <div className="flex flex-wrap gap-2">
                {TAG_COLORS.map(color => (
                  <Button
                    key={color}
                    variant={catForm.color === color ? 'default' : 'outline'}
                    size="sm"
                    className={`text-[10px] ${catForm.color !== color ? color : ''}`}
                    onClick={() => setCatForm(f => ({ ...f, color }))}
                  >
                    Izaberite
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleCreateCategory} disabled={!catForm.label.trim()}>
              {editingCategory ? 'Sačuvaj izmene' : 'Kreiraj'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════
          DIALOG: Question Detail with Answers
          ═══════════════════════════════════════════════════════════════ */}
      <Dialog open={qDetailOpen} onOpenChange={setQDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              {selectedQuestion?.title}
              {selectedQuestion?.hasAccepted && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            </DialogTitle>
          </DialogHeader>
          {selectedQuestion && (
            <ScrollArea className="max-h-[65vh] pr-2">
              <div className="space-y-4 pb-4">
                {/* Question Meta */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{selectedQuestion.authorName}</span>
                  <span>·</span>
                  <span>Objavljeno {formatDate(selectedQuestion.createdAt)}</span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5"><ThumbsUp className="h-3 w-3" />{selectedQuestion.votes} glasova</span>
                </div>

                {/* Question Content */}
                <p className="text-sm leading-relaxed">{selectedQuestion.content}</p>

                <div className="flex gap-1 flex-wrap">
                  {selectedQuestion.tags.map(tg => (
                    <Badge key={tg} variant="outline" className="text-[10px] px-1.5 py-0">#{tg}</Badge>
                  ))}
                </div>

                <Separator />

                {/* Answers */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">
                    {selectedQuestion.answers?.length || 0} odgovora
                  </h3>
                  {(selectedQuestion.answers || []).map(answer => (
                    <div key={answer.id} className={`p-3 rounded-lg border ${answer.isAccepted ? 'border-emerald-300 bg-emerald-50/50' : ''}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary">
                            {answer.authorName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <span className="text-xs font-medium">{answer.authorName}</span>
                          {answer.isAccepted && (
                            <Badge variant="outline" className="text-[10px] bg-emerald-100 text-emerald-700 border-emerald-200">
                              <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Prihvaćeno
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{formatDate(answer.createdAt)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{answer.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {!answer.isAccepted && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => handleAcceptAnswer(selectedQuestion.id, answer.id)}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Označi kao rešenje
                          </Button>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                          <ThumbsUp className="h-3 w-3" />{answer.votes}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Answer Input */}
                {!selectedQuestion.hasAccepted && (
                  <div className="space-y-2">
                    <Label className="text-xs">Vaš odgovor</Label>
                    <Textarea
                      placeholder="Napišite odgovor..."
                      value={newAnswerText}
                      onChange={(e) => setNewAnswerText(e.target.value)}
                      rows={3}
                    />
                    <div className="flex justify-end">
                      <Button size="sm" onClick={handleSubmitAnswer} disabled={!newAnswerText.trim()}>
                        <MessageSquare className="h-3.5 w-3.5 mr-1" /> Pošalji odgovor
                      </Button>
                    </div>
                  </div>
                )}

                {selectedQuestion.hasAccepted && (
                  <p className="text-xs text-emerald-600 text-center py-2 bg-emerald-50 rounded-lg">
                    <CheckCircle2 className="h-3.5 w-3.5 inline mr-1" />
                    Ovo pitanje ima prihvaćen odgovor
                  </p>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════
          DIALOG: Create / Edit Tag
          ═══════════════════════════════════════════════════════════════ */}
      <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTag ? 'Izmeni tag' : 'Novi tag'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Naziv</Label>
              <Input
                placeholder="Naziv taga..."
                value={tagForm.name}
                onChange={(e) => setTagForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Opis</Label>
              <Textarea
                placeholder="Kratak opis taga..."
                value={tagForm.description}
                onChange={(e) => setTagForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Boja</Label>
              <div className="flex flex-wrap gap-2">
                {TAG_COLORS.map(color => (
                  <Badge
                    key={color}
                    variant={tagForm.color === color ? 'default' : 'outline'}
                    className={`cursor-pointer text-[10px] ${tagForm.color !== color ? color : ''}`}
                    onClick={() => setTagForm(f => ({ ...f, color }))}
                  >
                    Izaberite
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTagDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleCreateTag} disabled={!tagForm.name.trim()}>
              {editingTag ? 'Sačuvaj izmene' : 'Kreiraj'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </TooltipProvider>
)
}


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
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
  UsersRound, Plus, Search, Eye, Trash2, RefreshCw,
  CheckCircle2, Clock, BarChart3, MessageSquare, Tag,
  TrendingUp, ThumbsUp, Star, FileText, Pin, Lock,
  Unlock, CircleDot, HelpCircle, Award, Settings2,
  Shield, Flame, Crown, ChevronDown, ChevronUp,
  AlertTriangle, Edit3, X, Filter, Sparkles, Hash,
  FolderOpen, Zap, Activity, Trophy, Target, Heart
} from 'lucide-react'
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'

// ─── Types ───────────────────────────────────────────────────────────────────
interface ForumTopic {
// ─── Constants & Colors ─────────────────────────────────────────────────────
const CHART_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899']
const ICON_MAP: Record<string, React.ReactNode> = {
// ─── Mock Data Generators ───────────────────────────────────────────────────


// ─── Mock Data Generators ───────────────────────────────────────────────────

function generateMockTopics(): ForumTopic[] {
  return [
    { id: 't1', title: 'Kako podesiti PDV prijavu?', content: 'Ne mogu da nađem opciju za PDV prijavu u modulu Knjigovodstvo. Probao sam sve opcije u meniju ali ne vidim tu funkciju. Da li je to dostupno samo za admin korisnike?', category: 'support', tags: ['pdv', 'knjigovodstvo'], authorName: 'Milan Jovanović', authorAvatar: 'MJ', views: 245, replyCount: 12, likes: 18, isPinned: true, createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
    { id: 't2', title: 'Predlog: Automatski backup podataka', content: 'Predlažem dodavanje automatskog backup-a svih podataka na dnevnom nivou. To bi značajno poboljšalo sigurnost sistema i smanjilo rizik od gubitka podataka.', category: 'feature_request', tags: ['backup', 'predlog'], authorName: 'Jelena Stanković', authorAvatar: 'JS', views: 182, replyCount: 7, likes: 35, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: 't3', title: 'Bug: Faktura ne šalje na email', content: 'Kada pokušam da pošaljem fakturu na email klijenta, dobijem grešku 500. Problem se javlja samo kada faktura ima više od 5 stavki. Testirano na Chrome i Firefox.', category: 'bug_report', tags: ['faktura', 'email', 'bug'], authorName: 'Nikola Marković', authorAvatar: 'NM', views: 328, replyCount: 15, likes: 8, isSolved: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 't4', title: 'Najbolje prakse za inventuru', content: 'Delim se iskustvom sa sprovođenom inventure u maloprodaji. Koristimo barkod skenere i aplikaciju za mobilni uređaj. Cela procedura traje oko 4 sata za 5000 artikala.', category: 'discussion', tags: ['inventura', 'maloprodaja', 'praksa'], authorName: 'Dragana Krstić', authorAvatar: 'DK', views: 456, replyCount: 23, likes: 42, createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: 't5', title: 'Nova verzija sistema 4.0!', content: 'Objavljujemo novu verziju sa 50+ modula, poboljšanim UI i novim funkcionalnostima. Proverite changelog za detalje. Hvala svima koji su učestvovali u beta testiranju!', category: 'announcement', tags: ['update', 'verzija'], authorName: 'Admin Tim', authorAvatar: 'AT', views: 1203, replyCount: 45, likes: 89, isPinned: true, createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
    { id: 't6', title: 'Integracija sa bankama - vodič', content: 'Korak po korak vodič za povezivanje sistema sa bankovnim računima. Podržane banke: Intesa, Raiffeisen, Komercijalna, Eurobank. Konfiguracija traje 10 minuta.', category: 'tutorial', tags: ['banka', 'integracija', 'vodič'], authorName: 'Stefan Petrović', authorAvatar: 'SP', views: 567, replyCount: 18, likes: 56, isSolved: true, createdAt: new Date(Date.now() - 86400000 * 4).toISOString() },
    { id: 't7', title: 'Problem sa izvozom izveštaja u PDF', content: 'Kada izvezem izveštaj o prodaji u PDF formatu, karakteri na ćirilici se ne prikazuju ispravno. Umesto njih se pojavljuju prazni kvadratići.', category: 'bug_report', tags: ['pdf', 'izveštaj', 'bug', 'ćirilica'], authorName: 'Ana Ilić', authorAvatar: 'AI', views: 198, replyCount: 6, likes: 4, createdAt: new Date(Date.now() - 86400000 * 6).toISOString() },
    { id: 't8', title: 'Kako koristiti naprednu pretragu?', content: 'Može li neko objasniti kako funkcioniše napredna pretraga u modulu Partneri? Želim da filtriram partnere po više kriterijuma istovremeno.', category: 'support', tags: ['pretraga', 'partneri'], authorName: 'Marko Nikolić', authorAvatar: 'MN', views: 134, replyCount: 4, likes: 7, createdAt: new Date(Date.now() - 86400000 * 8).toISOString() },
    { id: 't9', title: 'Predlog za poboljšanje dashboard-a', content: 'Trenutni dashboard je koristan ali fali mu mogućnost prilagođavanja widget-a. Bilo bi sjajno da svaki korisnik može da podesi svoj izgled dashboard-a.', category: 'feature_request', tags: ['dashboard', 'predlog', 'ui'], authorName: 'Ivana Đorđević', authorAvatar: 'IĐ', views: 267, replyCount: 11, likes: 28, createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },
    { id: 't10', title: 'Kalendar integracija sa Google Calendar', content: 'Uspešno sam integrisao kalendar modul sa Google Calendar. Evo koraka... Ovo je zaista korisno za timsku koordinaciju i zakazivanje sastanaka.', category: 'tutorial', tags: ['kalendar', 'google', 'integracija'], authorName: 'Dejan Stojanović', authorAvatar: 'DS', views: 389, replyCount: 14, likes: 33, createdAt: new Date(Date.now() - 86400000 * 9).toISOString() },
    { id: 't11', title: 'Diskusija: Monolit vs Mikroservisi', content: 'Sa rastom naše platforme, postavlja se pitanje da li treba da pređemo na mikroservisnu arhitekturu. Koje su vaše iskustvo i preporuke?', category: 'discussion', tags: ['arhitektura', 'mikroservisi', 'diskusija'], authorName: 'Vuk Matić', authorAvatar: 'VM', views: 178, replyCount: 21, likes: 15, isLocked: false, createdAt: new Date(Date.now() - 86400000 * 12).toISOString() },
    { id: 't12', title: 'Novi modul: Vozi park objavljen!', content: 'Zadovoljstvo nam je da najavimo novi modul za upravljanje vozilima. Praćenje kilometraže, troškova održavanja, i zakazivanje servisa - sve na jednom mestu.', category: 'announcement', tags: ['vozila', 'novi-modul'], authorName: 'Admin Tim', authorAvatar: 'AT', views: 445, replyCount: 9, likes: 37, isPinned: false, createdAt: new Date(Date.now() - 86400000 * 15).toISOString() },
    { id: 't13', title: 'Problem sa multi-kompanijskim pristupom', content: 'Imam pristup dve kompanije ali ne mogu da prebacim kontekst bez ponovnog logovanja. Da li neko ima rešenje za ovaj problem?', category: 'support', tags: ['multi-tenant', 'pristup', 'bug'], authorName: 'Saša Popović', authorAvatar: 'SP', views: 89, replyCount: 3, likes: 2, createdAt: new Date(Date.now() - 86400000 * 11).toISOString() },
    { id: 't14', title: 'Automatizacija fakturisanja - iskustva', content: 'Već 6 meseci koristimo automatizovano fakturisanje i rezultati su fantastični. Vreme za obradu faktura je smanjeno za 70%. Evo kako smo to postigli...', category: 'discussion', tags: ['faktura', 'automatizacija', 'iskustvo'], authorName: 'Tanja Radovanović', authorAvatar: 'TR', views: 312, replyCount: 16, likes: 44, createdAt: new Date(Date.now() - 86400000 * 14).toISOString() },
    { id: 't15', title: 'Bug: Duple stavke u narudžbenici', content: 'Kada dodam stavku u narudžbenicu i zatim promenim količinu, stavka se duplira. Ovo se dešava konzistentno u svakom browseru.', category: 'bug_report', tags: ['narudžbenica', 'bug', 'duplikat'], authorName: 'Nenad Jovančević', authorAvatar: 'NJ', views: 156, replyCount: 8, likes: 5, isSolved: true, createdAt: new Date(Date.now() - 86400000 * 13).toISOString() },
  ]
}

function generateMockCategories(): ForumCategory[] {
  return [
    { id: 'c1', key: 'general', label: 'Opšte', description: 'Opšte diskusije o sistemu i radnom okruženju', color: 'bg-slate-100 text-slate-700', icon: 'message', topicCount: 0, sortOrder: 1 },
    { id: 'c2', key: 'support', label: 'Podrška', description: 'Pitanja i problemi oko korišćenja sistema', color: 'bg-emerald-100 text-emerald-700', icon: 'help', topicCount: 0, sortOrder: 2 },
    { id: 'c3', key: 'feature_request', label: 'Predlozi', description: 'Predlozi za nove funkcionalnosti i poboljšanja', color: 'bg-amber-100 text-amber-700', icon: 'zap', topicCount: 0, sortOrder: 3 },
    { id: 'c4', key: 'bug_report', label: 'Bug-ovi', description: 'Prijave grešaka i problema u sistemu', color: 'bg-rose-100 text-rose-700', icon: 'bug', topicCount: 0, sortOrder: 4 },
    { id: 'c5', key: 'discussion', label: 'Diskusija', description: 'Otovrene diskusije i razmena iskustava', color: 'bg-violet-100 text-violet-700', icon: 'star', topicCount: 0, sortOrder: 5 },
    { id: 'c6', key: 'announcement', label: 'Obaveštenja', description: 'Zvanične najave i obaveštenja admin tima', color: 'bg-orange-100 text-orange-700', icon: 'flame', topicCount: 0, sortOrder: 6 },
    { id: 'c7', key: 'tutorial', label: 'Tutorijali', description: 'Vodiči, tutorijali i najbolje prakse', color: 'bg-cyan-100 text-cyan-700', icon: 'tag', topicCount: 0, sortOrder: 7 },
    { id: 'c8', key: 'offtopic', label: 'Van teme', description: 'Sve ostalo - opuštena zona za zajednicu', color: 'bg-pink-100 text-pink-700', icon: 'message', topicCount: 0, sortOrder: 8 },
  ]
}

function generateMockQuestions(): ForumQuestion[] {
  return [
    { id: 'q1', title: 'Kako da kreiram prilagođeni izveštaj?', content: 'Treba mi izveštaj koji prikazuje prodaju po regionima za poslednjih 6 meseci sa poređenjem prethodne godine.', authorName: 'Milan J.', votes: 24, answerCount: 3, hasAccepted: true, tags: ['izveštaj', 'prilagođeno'], createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), answers: [
      { id: 'a1', questionId: 'q1', authorName: 'Stefan P.', content: 'Možete koristiti modul Izveštaji > Prilagođeni izveštaji. Tamo imate opciju da definišete kolone, filtere i grupisanje po potrebi.', votes: 15, isAccepted: true, createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString() },
      { id: 'a2', questionId: 'q1', authorName: 'Jelena S.', content: 'Dodatno, možete zakazati automatsko slanje izveštaja na nedeljnom nivou kroz Podešavanja > Automatizacija.', votes: 8, isAccepted: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
    ] },
    { id: 'q2', title: 'Da li je moguća integracija sa spoljnim ERP sistemom?', content: 'Naša kompanija koristi spoljni ERP sistem i pitamo da li postoji način za sinhronizaciju podataka između njega i ovog sistema.', authorName: 'Jelena S.', votes: 18, answerCount: 2, hasAccepted: false, tags: ['integracija', 'erp', 'spoljni-sistem'], createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), answers: [
      { id: 'a3', questionId: 'q2', authorName: 'Admin Tim', content: 'Trenutno nemamo direktnu integraciju sa spoljnim ERP sistemom, ali podržavamo REST API kroz koji možete implementirati sinhronizaciju. Dokumentacija je dostupna u sekciji Integracije.', votes: 12, isAccepted: false, createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
    ] },
    { id: 'q3', title: 'Koji je limit za broj stavki u fakturi?', content: 'Imamo klijenta sa velikim brojem stavki na jednoj fakturi. Da li postoji tehnički limit i šta se dešava ako ga pređemo?', authorName: 'Nikola M.', votes: 9, answerCount: 1, hasAccepted: true, tags: ['faktura', 'limiti'], createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), answers: [
      { id: 'a4', questionId: 'q3', authorName: 'Dragana K.', content: 'Tehnički limit je 999 stavki po fakturi. U praksi preporučujemo da faktura sa više od 100 stavki bude podeljena radi preglednosti.', votes: 6, isAccepted: true, createdAt: new Date(Date.now() - 86400000 * 0.5).toISOString() },
    ] },
    { id: 'q4', title: 'Kako omogućiti dvofaktorsku autentikaciju?', content: 'Želim da uključim 2FA za sve korisnike u mojoj kompaniji. Gde mogu da podesim ovu opciju?', authorName: 'Ana I.', votes: 31, answerCount: 2, hasAccepted: true, tags: ['sigurnost', '2fa', 'autentikacija'], createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), answers: [
      { id: 'a5', questionId: 'q4', authorName: 'Admin Tim', content: 'Podešavanja > Sigurnost > Dvofaktorska autentikacija. Možete da je namestite kao obaveznu za sve korisnike ili ostavite opcionalnu.', votes: 22, isAccepted: true, createdAt: new Date(Date.now() - 86400000 * 4.5).toISOString() },
    ] },
    { id: 'q5', title: 'Gde se čuvaju logovi sistema?', content: 'Potrebni su mi logovi za audit svrhe. Gde mogu pronaći operativne logove i da li mogu da ih preuzmem?', authorName: 'Dejan S.', votes: 7, answerCount: 1, hasAccepted: false, tags: ['logovi', 'audit', 'sigurnost'], createdAt: new Date(Date.now() - 86400000 * 6).toISOString(), answers: [
      { id: 'a6', questionId: 'q5', authorName: 'Stefan P.', content: 'Logovi su dostupni u Podešavanja > Sistem > Logovi. Možete ih filtrirati po datumu, korisniku i tipu događaja, i izvesti u CSV formatu.', votes: 4, isAccepted: false, createdAt: new Date(Date.now() - 86400000 * 5.5).toISOString() },
    ] },
    { id: 'q6', title: 'Kako da uvozim podatke iz Excela?', content: 'Imam listu od 500 partnera u Excel fajlu. Kako da ih masovno uvezem u sistem?', authorName: 'Marko N.', votes: 14, answerCount: 2, hasAccepted: true, tags: ['import', 'excel', 'partneri'], createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), answers: [
      { id: 'a7', questionId: 'q6', authorName: 'Ivana Đ.', content: 'Koristite Modul > Partneri > Uvoz. Sistem podržava XLSX i CSV formate. Pre uvoza, preuzmite templejt sa ispravnim formatom kolona.', votes: 10, isAccepted: true, createdAt: new Date(Date.now() - 86400000 * 6.5).toISOString() },
    ] },
    { id: 'q7', title: 'Da li sistem podržava višejezičnost?', content: 'Naš tim radi na engleskom i srpskom. Da li postoji opcija za promenu jezika interfejsa?', authorName: 'Vuk M.', votes: 11, answerCount: 1, hasAccepted: true, tags: ['jezik', 'prevod', 'lokalizacija'], createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), answers: [
      { id: 'a8', questionId: 'q7', authorName: 'Admin Tim', content: 'Da, sistem podržava srpski (latinica i ćirilica) i engleski. Jezik možete promeniti u korisničkom profilu ili globalno kroz podešavanja kompanije.', votes: 9, isAccepted: true, createdAt: new Date(Date.now() - 86400000 * 2.5).toISOString() },
    ] },
    { id: 'q8', title: 'Kako resetovati lozinku korisnika kao admin?', content: 'Korisnik je zaboravio lozinku i nema pristup emailu. Kako mogu kao admin da mu resetujem lozinku?', authorName: 'Saša P.', votes: 20, answerCount: 2, hasAccepted: true, tags: ['lozinka', 'admin', 'korisnici'], createdAt: new Date(Date.now() - 86400000 * 8).toISOString(), answers: [
      { id: 'a9', questionId: 'q8', authorName: 'Admin Tim', content: 'Idite na Podešavanja > Korisnici > izaberite korisnika > Akcije > Resetuj lozinku. Možete postaviti privremenu lozinku koju će korisnik morati da promeni pri prvom logovanju.', votes: 16, isAccepted: true, createdAt: new Date(Date.now() - 86400000 * 7.5).toISOString() },
    ] },
    { id: 'q9', title: 'Kako postaviti automatizovana upozorenja?', content: 'Želim da dobijam notifikacije kada zalihe artikala padnu ispod minimuma. Kako da podesim ovu automatizaciju?', authorName: 'Tanja R.', votes: 16, answerCount: 1, hasAccepted: false, tags: ['automatizacija', 'zalihe', 'notifikacije'], createdAt: new Date(Date.now() - 86400000 * 9).toISOString(), answers: [
      { id: 'a10', questionId: 'q9', authorName: 'Nikola M.', content: 'Magacin > Artikli > Automatizacija > Upozorenja na zalihama. Postavite minimalnu količinu i izaberite kanal obaveštenja (email, push, ili oba).', votes: 11, isAccepted: false, createdAt: new Date(Date.now() - 86400000 * 8.5).toISOString() },
    ] },
    { id: 'q10', title: 'Šta je najbolji način za obuku novih zaposlenih?', content: 'Imamo 10 novih zaposlenih koji treba da nauče da koriste sistem. Koje resurse preporučujete?', authorName: 'Nenad J.', votes: 27, answerCount: 2, hasAccepted: true, tags: ['edukacija', 'onboarding', 'resursi'], createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), answers: [
      { id: 'a11', questionId: 'q10', authorName: 'Jelena S.', content: 'Preporučujemo: 1) Video tutorijali u sekciji Edukacija, 2) Sandbox okruženje za vežbanje, 3) Mentorski program sa iskusnim korisnicima. Prosečno vreme za obuku je 2-3 dana.', votes: 19, isAccepted: true, createdAt: new Date(Date.now() - 86400000 * 9.5).toISOString() },
    ] },
  ]
}

function generateMockTags(): ForumTag[] {
  return [
    { id: 'tg1', name: 'faktura', slug: 'faktura', description: 'Sve vezano za fakturisanje i račune', color: TAG_COLORS[0], usageCount: 23, createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
    { id: 'tg2', name: 'pdv', slug: 'pdv', description: 'Porez na dodatu vrednost', color: TAG_COLORS[1], usageCount: 18, createdAt: new Date(Date.now() - 86400000 * 28).toISOString() },
    { id: 'tg3', name: 'knjigovodstvo', slug: 'knjigovodstvo', description: 'Knjigovodstveni modul i funkcionalnosti', color: TAG_COLORS[2], usageCount: 15, createdAt: new Date(Date.now() - 86400000 * 25).toISOString() },
    { id: 'tg4', name: 'bug', slug: 'bug', description: 'Prijave grešaka u sistemu', color: TAG_COLORS[3], usageCount: 34, createdAt: new Date(Date.now() - 86400000 * 27).toISOString() },
    { id: 'tg5', name: 'predlog', slug: 'predlog', description: 'Predlozi za poboljšanja', color: TAG_COLORS[4], usageCount: 12, createdAt: new Date(Date.now() - 86400000 * 22).toISOString() },
    { id: 'tg6', name: 'integracija', slug: 'integracija', description: 'Integracije sa spoljnim servisima', color: TAG_COLORS[5], usageCount: 19, createdAt: new Date(Date.now() - 86400000 * 20).toISOString() },
    { id: 'tg7', name: 'backup', slug: 'backup', description: 'Rezervne kopije podataka', color: TAG_COLORS[6], usageCount: 8, createdAt: new Date(Date.now() - 86400000 * 18).toISOString() },
    { id: 'tg8', name: 'sigurnost', slug: 'sigurnost', description: 'Bezbednost sistema i podataka', color: TAG_COLORS[7], usageCount: 14, createdAt: new Date(Date.now() - 86400000 * 15).toISOString() },
    { id: 'tg9', name: 'automatizacija', slug: 'automatizacija', description: 'Automatski procesi i radni tokovi', color: TAG_COLORS[0], usageCount: 11, createdAt: new Date(Date.now() - 86400000 * 12).toISOString() },
    { id: 'tg10', name: 'email', slug: 'email', description: 'Email komunikacija i notifikacije', color: TAG_COLORS[1], usageCount: 21, createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },
    { id: 'tg11', name: 'partneri', slug: 'partneri', description: 'Upravljanje partnerima i klijentima', color: TAG_COLORS[2], usageCount: 16, createdAt: new Date(Date.now() - 86400000 * 8).toISOString() },
    { id: 'tg12', name: 'magacin', slug: 'magacin', description: 'Magacinski posao i inventura', color: TAG_COLORS[3], usageCount: 13, createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  ]
}

function generateMonthlyData() {
  return [
    { month: 'Jan', teme: 45, odgovori: 128, pregledi: 890 },
    { month: 'Feb', teme: 52, odgovori: 145, pregledi: 1020 },
    { month: 'Mar', teme: 38, odgovori: 112, pregledi: 780 },
    { month: 'Apr', teme: 67, odgovori: 198, pregledi: 1340 },
    { month: 'Maj', teme: 73, odgovori: 210, pregledi: 1560 },
    { month: 'Jun', teme: 59, odgovori: 175, pregledi: 1230 },
    { month: 'Jul', teme: 42, odgovori: 120, pregledi: 890 },
    { month: 'Avg', teme: 31, odgovori: 89, pregledi: 670 },
    { month: 'Sep', teme: 68, odgovori: 195, pregledi: 1420 },
    { month: 'Okt', teme: 81, odgovori: 234, pregledi: 1780 },
    { month: 'Nov', teme: 76, odgovori: 218, pregledi: 1650 },
    { month: 'Dec', teme: 55, odgovori: 156, pregledi: 1100 },
  ]
}

function generateMockReplies(topicId: string): ForumReply[] {
  const baseReplies: Record<string, ForumReply[]> = {
    t1: [
      { id: 'r1', topicId: 't1', authorName: 'Stefan P.', content: 'PDV prijava se nalazi u Knjigovodstvo > Porezi > PDV. Morate imati admin privilegije da biste videli ovaj meni.', likes: 5, createdAt: new Date(Date.now() - 86400000 * 2.5).toISOString() },
      { id: 'r2', topicId: 't1', authorName: 'Dragana K.', content: 'Tačno, to je bilo moje iskustvo. Admin je morao da mi dodeli dodatne permisije. Posle toga sve radi savršeno.', likes: 3, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: 'r3', topicId: 't1', authorName: 'Admin Tim', content: 'Dodali smo detaljan vodič u sekciji Pomoć. Možete ga pronaći pod "PDV prijava - korak po korak".', likes: 8, isBest: true, createdAt: new Date(Date.now() - 86400000 * 1).toISOString() },
    ],
    t3: [
      { id: 'r4', topicId: 't3', authorName: 'Admin Tim', content: 'Identifikovali smo problem. Greška je u PDF generisanju kada faktura ima više od 5 stavki sa specijalnim karakterima. Popravka će biti u sledećem patch-u.', likes: 4, createdAt: new Date(Date.now() - 86400000 * 0.8).toISOString() },
    ],
  }
  return baseReplies[topicId] || [
    { id: `r-${topicId}-1`, topicId, authorName: 'Stefan P.', content: 'Hvala na pitanju! Radićemo na rešenju.', likes: 2, createdAt: new Date(Date.now() - 86400000 * 0.5).toISOString() },
    { id: `r-${topicId}-2`, topicId, authorName: 'Jelena S.', content: 'Imam sličan problem. Javim ako nađem rešenje.', likes: 1, createdAt: new Date(Date.now() - 86400000 * 0.3).toISOString() },
  ]
}


// ─── Handler Functions (extracted from Forum) ─────────────────────────────────
  const handleCreateTopic = async () => {
    if (!topicForm.title.trim()) return
    const newTopic: ForumTopic = {
      id: `t-${Date.now()}`,
      title: topicForm.title,
      content: topicForm.content,
      category: topicForm.category,
      tags: topicForm.tags ? topicForm.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
      authorName: 'Vi',
      authorAvatar: 'VI',
      views: 0,
      replyCount: 0,
      likes: 0,
      createdAt: new Date().toISOString(),
    }
    setTopics(prev => [newTopic, ...prev])
    setTopicDialogOpen(false)
    setTopicForm(emptyTopicForm)
  }

  const handleDeleteTopic = (id: string) => {
    setTopics(prev => prev.filter(tp => tp.id !== id))
    setDetailOpen(false)
    setSelectedTopic(null)
  }

  const handleOpenTopicDetail = (topic: ForumTopic) => {
    setSelectedTopic(topic)
    setTopicReplies(generateMockReplies(topic.id))
    setDetailOpen(true)
  }

  const handleSubmitReply = () => {
    if (!replyText.trim() || !selectedTopic) return
    const newReply: ForumReply = {
      id: `r-${Date.now()}`,
      topicId: selectedTopic.id,
      authorName: 'Vi',
      content: replyText,
      likes: 0,
      createdAt: new Date().toISOString(),
    }
    setTopicReplies(prev => [...prev, newReply])
    setReplyText('')
    setTopics(prev => prev.map(tp => tp.id === selectedTopic.id ? { ...tp, replyCount: (tp.replyCount || 0) + 1 } : tp))
  }

  const handleCreateCategory = () => {
    if (!catForm.label.trim()) return
    const newCat: ForumCategory = {
      id: `c-${Date.now()}`,
      key: catForm.label.toLowerCase().replace(/\s+/g, '_'),
      label: catForm.label,
      description: catForm.description,
      color: catForm.color,
      icon: catForm.icon,
      topicCount: 0,
      sortOrder: categories.length + 1,
    }
    setCategories(prev => [...prev, newCat])
    setCatDialogOpen(false)
    setCatForm(emptyCatForm)
    setEditingCategory(null)
  }

  const handleEditCategory = (cat: ForumCategory) => {
    setEditingCategory(cat)
    setCatForm({ label: cat.label, description: cat.description, color: cat.color, icon: cat.icon })
    setCatDialogOpen(true)
  }

  const handleOpenQuestion = (q: ForumQuestion) => {
    setSelectedQuestion(q)
    setQDetailOpen(true)
    setNewAnswerText('')
  }

  const handleSubmitAnswer = () => {
    if (!newAnswerText.trim() || !selectedQuestion) return
    const newAnswer: ForumAnswer = {
      id: `a-${Date.now()}`,
      questionId: selectedQuestion.id,
      authorName: 'Vi',
      content: newAnswerText,
      votes: 0,
      isAccepted: false,
      createdAt: new Date().toISOString(),
    }
    const updatedQ = {
      ...selectedQuestion,
      answers: [...(selectedQuestion.answers || []), newAnswer],
      answerCount: (selectedQuestion.answerCount || 0) + 1,
    }
    setSelectedQuestion(updatedQ)
    setQuestions(prev => prev.map(q => q.id === selectedQuestion.id ? { ...q, answerCount: q.answerCount + 1, answers: [...(q.answers || []), newAnswer] } : q))
    setNewAnswerText('')
  }

  const handleAcceptAnswer = (qId: string, aId: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== qId) return q
      return {
        ...q,
        hasAccepted: true,
        answers: (q.answers || []).map(a => a.id === aId ? { ...a, isAccepted: true } : { ...a, isAccepted: false }),
      }
    }))
    if (selectedQuestion?.id === qId) {
      setSelectedQuestion(prev => prev ? {
        ...prev,
        hasAccepted: true,
        answers: (prev.answers || []).map(a => a.id === aId ? { ...a, isAccepted: true } : { ...a, isAccepted: false }),
      } : prev)
    }
  }

  const handleCreateTag = () => {
    if (!tagForm.name.trim()) return
    const newTag: ForumTag = {
      id: `tg-${Date.now()}`,
      name: tagForm.name,
      slug: tagForm.name.toLowerCase().replace(/\s+/g, '-'),
      description: tagForm.description,
      color: tagForm.color,
      usageCount: 0,
      createdAt: new Date().toISOString(),
    }
    setTags(prev => [...prev, newTag])
    setTagDialogOpen(false)
    setTagForm(emptyTagForm)
    setEditingTag(null)
  }

  const handleEditTag = (tg: ForumTag) => {
    setEditingTag(tg)
    setTagForm({ name: tg.name, description: tg.description, color: tg.color })
    setTagDialogOpen(true)
  }

  const formatDate = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'Danas'
    if (days === 1) return 'Juče'
    if (days < 7) return `Pre ${days} dana`
    if (days < 30) return `Pre ${Math.floor(days / 7)} ned`
    return new Date(dateStr).toLocaleDateString('sr-RS')
  }


// State variables used by Forum: 
