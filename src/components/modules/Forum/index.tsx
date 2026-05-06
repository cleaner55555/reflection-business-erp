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
import {
  UsersRound, Plus, Search, Eye, Trash2, RefreshCw,
  CheckCircle2, Clock, BarChart3, MessageSquare, Tag,
  TrendingUp, ThumbsUp, Star, FileText, Pin, Lock,
  Unlock, CircleDot, HelpCircle, Award, Settings2,
  Shield, Flame, Crown, ChevronDown, ChevronUp,
  AlertTriangle, Edit3, X, Filter, Sparkles, Hash,
  FolderOpen, Zap, Activity, Trophy, Target, Heart
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ForumTopic {
  id: string
  title: string
  content: string
  category?: string
  tags?: string[]
  authorName?: string
  authorAvatar?: string
  views: number
  replyCount: number
  likes: number
  isPinned?: boolean
  isLocked?: boolean
  isSolved?: boolean
  createdAt: string
  updatedAt?: string
}

interface ForumReply {
  id: string
  topicId: string
  authorName: string
  content: string
  likes: number
  isBest?: boolean
  createdAt: string
}

interface ForumCategory {
  id: string
  key: string
  label: string
  description: string
  color: string
  icon: string
  topicCount: number
  sortOrder: number
}

interface ForumQuestion {
  id: string
  title: string
  content: string
  authorName: string
  votes: number
  answerCount: number
  hasAccepted: boolean
  tags: string[]
  createdAt: string
  answers?: ForumAnswer[]
}

interface ForumAnswer {
  id: string
  questionId: string
  authorName: string
  content: string
  votes: number
  isAccepted: boolean
  createdAt: string
}

interface ForumTag {
  id: string
  name: string
  slug: string
  description: string
  color: string
  usageCount: number
  createdAt: string
}

interface ForumSettings {
  allowAnonymous: boolean
  requireApproval: boolean
  maxTopicPerDay: number
  reputationThreshold: number
  enableReactions: boolean
  enableVoting: boolean
  enableBadges: boolean
  autoLockDays: number
  maxReplyLength: number
  enableMarkdown: boolean
  spamFilterLevel: 'low' | 'medium' | 'high'
}

// ─── Constants & Colors ─────────────────────────────────────────────────────

const CHART_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899']

const TAG_COLORS = [
  'bg-slate-100 text-slate-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
  'bg-violet-100 text-violet-700',
  'bg-cyan-100 text-cyan-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
]

const ICON_MAP: Record<string, React.ReactNode> = {
  message: <MessageSquare className="h-5 w-5" />,
  help: <HelpCircle className="h-5 w-5" />,
  bug: <AlertTriangle className="h-5 w-5" />,
  star: <Star className="h-5 w-5" />,
  zap: <Zap className="h-5 w-5" />,
  trophy: <Trophy className="h-5 w-5" />,
  tag: <Tag className="h-5 w-5" />,
  flame: <Flame className="h-5 w-5" />,
}






// ─── Component ───────────────────────────────────────────────────────────────

import { generateMockTopics, generateMockCategories, generateMockQuestions, generateMockTags, generateMonthlyData, generateMockReplies } from './components'

import { handleCreateTopic, handleDeleteTopic, handleOpenTopicDetail, handleSubmitReply, handleCreateCategory, handleEditCategory, handleOpenQuestion, handleSubmitAnswer, handleAcceptAnswer, handleCreateTag, handleEditTag, formatDate } from './components'
import { ForumContent } from './components'

export function Forum() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()

  // ─── Tab State ──────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('overview')

  // ─── Topics State ──────────────────────────────────────────────────────
  const [topics, setTopics] = useState<ForumTopic[]>([])
  const [topicSearch, setTopicSearch] = useState('')
  const [topicCatFilter, setTopicCatFilter] = useState('all')
  const [topicSort, setTopicSort] = useState<'newest' | 'popular' | 'most-replies'>('newest')
  const [topicDialogOpen, setTopicDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null)
  const [topicReplies, setTopicReplies] = useState<ForumReply[]>([])
  const [replyText, setReplyText] = useState('')

  // ─── Categories State ──────────────────────────────────────────────────
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [catDialogOpen, setCatDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ForumCategory | null>(null)

  // ─── Questions State ───────────────────────────────────────────────────
  const [questions, setQuestions] = useState<ForumQuestion[]>([])
  const [qSearch, setQSearch] = useState('')
  const [qFilter, setQFilter] = useState<'all' | 'open' | 'solved'>('all')
  const [selectedQuestion, setSelectedQuestion] = useState<ForumQuestion | null>(null)
  const [qDetailOpen, setQDetailOpen] = useState(false)
  const [newAnswerText, setNewAnswerText] = useState('')

  // ─── Tags State ────────────────────────────────────────────────────────
  const [tags, setTags] = useState<ForumTag[]>([])
  const [tagSearch, setTagSearch] = useState('')
  const [tagDialogOpen, setTagDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<ForumTag | null>(null)
  const [tagView, setTagView] = useState<'cloud' | 'list'>('cloud')

  // ─── Settings State ────────────────────────────────────────────────────
  const [settings, setSettings] = useState<ForumSettings>({
    allowAnonymous: false,
    requireApproval: true,
    maxTopicPerDay: 5,
    reputationThreshold: 10,
    enableReactions: true,
    enableVoting: true,
    enableBadges: true,
    autoLockDays: 90,
    maxReplyLength: 5000,
    enableMarkdown: true,
    spamFilterLevel: 'medium',
  })

  // ─── General State ─────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)

  // ─── Form States ───────────────────────────────────────────────────────
  const emptyTopicForm = { title: '', content: '', category: 'general', tags: '' as string }
  const [topicForm, setTopicForm] = useState(emptyTopicForm)

  const emptyCatForm = { label: '', description: '', color: TAG_COLORS[0], icon: 'message' }
  const [catForm, setCatForm] = useState(emptyCatForm)

  const emptyTagForm = { name: '', description: '', color: TAG_COLORS[0] }
  const [tagForm, setTagForm] = useState(emptyTagForm)

  // ─── Data Loading ──────────────────────────────────────────────────────

  return (
    <ForumContent
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      topics={topics}
      setTopics={setTopics}
      topicSearch={topicSearch}
      setTopicSearch={setTopicSearch}
      topicCatFilter={topicCatFilter}
      setTopicCatFilter={setTopicCatFilter}
      topicSort={topicSort}
      setTopicSort={setTopicSort}
      topicDialogOpen={topicDialogOpen}
      setTopicDialogOpen={setTopicDialogOpen}
      detailOpen={detailOpen}
      setDetailOpen={setDetailOpen}
      selectedTopic={selectedTopic}
      setSelectedTopic={setSelectedTopic}
      topicReplies={topicReplies}
      setTopicReplies={setTopicReplies}
      replyText={replyText}
      setReplyText={setReplyText}
      categories={categories}
      setCategories={setCategories}
      catDialogOpen={catDialogOpen}
      setCatDialogOpen={setCatDialogOpen}
      editingCategory={editingCategory}
      setEditingCategory={setEditingCategory}
      questions={questions}
      setQuestions={setQuestions}
      qSearch={qSearch}
      setQSearch={setQSearch}
      qFilter={qFilter}
      setQFilter={setQFilter}
      selectedQuestion={selectedQuestion}
      setSelectedQuestion={setSelectedQuestion}
      qDetailOpen={qDetailOpen}
      setQDetailOpen={setQDetailOpen}
      newAnswerText={newAnswerText}
      setNewAnswerText={setNewAnswerText}
      tags={tags}
      setTags={setTags}
      tagSearch={tagSearch}
      setTagSearch={setTagSearch}
      tagDialogOpen={tagDialogOpen}
      setTagDialogOpen={setTagDialogOpen}
      editingTag={editingTag}
      setEditingTag={setEditingTag}
      tagView={tagView}
      setTagView={setTagView}
      settings={settings}
      setSettings={setSettings}
      loading={loading}
      setLoading={setLoading}
      settingsSaved={settingsSaved}
      setSettingsSaved={setSettingsSaved}
      topicForm={topicForm}
      setTopicForm={setTopicForm}
      catForm={catForm}
      setCatForm={setCatForm}
      tagForm={tagForm}
      setTagForm={setTagForm}
      emptyTopicForm={emptyTopicForm}
      emptyCatForm={emptyCatForm}
      emptyTagForm={emptyTagForm}
    />
  )
}
