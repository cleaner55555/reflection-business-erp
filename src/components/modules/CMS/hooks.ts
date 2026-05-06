import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export function useCMS() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/cms/content?companyId=${activeCompanyId}&limit=100`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) { setContent(data) } else { setContent(mockContent) }
      } else { setContent(mockContent) }
    } catch { setContent(mockContent) }
    setLoading(false)
  }, [activeCompanyId])

  useEffect(() => { loadData() }, [activeCompanyId, loadData])

  if (loading) return <div className="flex items-center justify-center py-20"><RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" /></div>

  return {
    activeTab,
    allTags,
    catFilter,
    content,
    dialogOpen,
    drafts,
    editing,
    editorOpen,
    filtered,
    folderFilter,
    folders,
    handleCreate,
    handleSave,
    i,
    item,
    k,
    lang,
    loadData,
    media,
    mockAuthors,
    mockCategories,
    mockContentTypes,
    openCreate,
    published,
    recentContent,
    recentlyPublished,
    revisions,
    runSeoAnalysis,
    sc,
    scheduled,
    search,
    selected,
    selectedContent,
    seoPreview,
    setActiveTab,
    setCatFilter,
    setContent,
    setDialogOpen,
    setEditorOpen,
    setFolderFilter,
    setSelected,
    setSelectedContent,
    setStatusFilter,
    setTypeFilter,
    setUploadOpen,
    sitemapItems,
    statusFilter,
    toolbarActions,
    topContent,
    typeFilter,
    typePie,
    types,
    uploadOpen,
  }
}
