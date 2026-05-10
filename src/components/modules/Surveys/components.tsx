'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  ClipboardCheck, Plus, Search, Eye, Trash2, RefreshCw,
  CheckCircle2, Clock, BarChart3, Star, Users, Share2,
  FileText, ListChecks, ThumbsUp, ThumbsDown, HelpCircle
} from 'lucide-react'

interface Survey {
  id: string
  name: string
  description?: string
  questionCount: number
  responseCount: number
  status: string
  createdAt: string
}

interface Question {
  id: string
  question: string
  type: string
  required: boolean
  options?: string[]
}

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-700' },
  active: { label: 'Aktivna', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Zatvorena', color: 'bg-amber-100 text-amber-700' },
  archived: { label: 'Arhivirana', color: 'bg-gray-200 text-gray-500' },
}

const questionTypeConfig: Record<string, { label: string }> = {
  text: { label: 'Tekst' },
  textarea: { label: 'Dugi tekst' },
  single_choice: { label: 'Jedan odgovor' },
  multiple_choice: { label: 'Više odgovora' },
  rating: { label: 'Ocena (1-5)' },
  nps: { label: 'NPS (0-10)' },
  date: { label: 'Datum' },
  email: { label: 'Email' },
}

export function Ankete() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<Survey | null>(null)

  const emptySurveyForm = { name: '', description: '', status: 'draft' }
  const [surveyForm, setSurveyForm] = useState(emptySurveyForm)

  const emptyQuestionForm = { question: '', type: 'single_choice', required: true, options: [''] }
  const [questionForm, setQuestionForm] = useState(emptyQuestionForm)

  const loadSurveys = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/surveys?companyId=${activeCompanyId}&limit=100`)
      if (res.ok) {
        const data = await res.json()
        setSurveys(data.items || data || [])
      }
    } catch { /* silent */ }
    setLoading(false)
  }, [activeCompanyId])

  useEffect(() => { loadSurveys() }, [activeCompanyId, loadSurveys])

  const totalResponses = surveys.reduce((sum, s) => sum + (s.responseCount || 0), 0)
  const activeSurveys = surveys.filter((s) => s.status === 'active').length

  const filtered = surveys.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleCreateSurvey = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/surveys', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...surveyForm, questionCount: questions.length, responseCount: 0 }),
      })
      if (res.ok) { setDialogOpen(false); setSurveyForm(emptySurveyForm); setQuestions([]); loadSurveys() }
    } catch { /* silent */ }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati anketu?')) return
    try {
      const res = await fetch(`/api/surveys?id=${id}`, { method: 'DELETE' })
      if (res.ok) loadSurveys()
    } catch { /* silent */ }
  }

  const addQuestion = () => {
    setQuestions([...questions, { id: `temp-${Date.now()}`, ...questionForm, options: questionForm.type.includes('choice') ? questionForm.options : undefined }])
    setQuestionForm(emptyQuestionForm)
    setQuestionDialogOpen(false)
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ankete</h1>
          <p className="text-sm text-muted-foreground">Kreiranje anketa, NPS i survey-a</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadSurveys}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Nova anketa</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="surveys"><ClipboardCheck className="h-4 w-4 mr-1" /> Ankete</TabsTrigger>
          <TabsTrigger value="results"><Star className="h-4 w-4 mr-1" /> Rezultati</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Ankete</span><ClipboardCheck className="h-4 w-4 text-muted-foreground" /></div><p className="text-2xl font-bold">{surveys.length}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Aktivne</span><CheckCircle2 className="h-4 w-4 text-green-500" /></div><p className="text-2xl font-bold text-green-600">{activeSurveys}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Odgovori</span><Users className="h-4 w-4 text-primary" /></div><p className="text-2xl font-bold text-primary">{totalResponses}</p></Card>
            <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Pitanja</span><ListChecks className="h-4 w-4 text-amber-500" /></div><p className="text-2xl font-bold text-amber-600">{surveys.reduce((sum, s) => sum + (s.questionCount || 0), 0)}</p></Card>
          </div>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Tipovi pitanja</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(questionTypeConfig).map(([key, cfg]) => (
                  <div key={key} className="p-3 border rounded-lg text-center text-sm">
                    {cfg.label}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="surveys" className="space-y-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži ankete..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          {loading ? (<div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>) : filtered.length === 0 ? (
            <Card className="p-8 text-center"><ClipboardCheck className="h-12 w-12 mx-auto mb-3 text-muted-foreground" /><p className="text-muted-foreground">Nema anketa</p><Button variant="outline" className="mt-3" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Kreiraj anketu</Button></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((s) => {
                const cfg = statusConfig[s.status]
                return (
                  <Card key={s.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{s.name}</CardTitle>
                        <Badge variant="outline" className={`text-xs ${cfg?.color}`}>{cfg?.label}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {s.description && <p className="text-xs text-muted-foreground line-clamp-2">{s.description}</p>}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{s.questionCount} pitanja</span>
                        <span>{s.responseCount} odgovora</span>
                      </div>
                      <div className="flex gap-1 pt-2">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelected(s); setDetailOpen(true) }}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs"><Share2 className="h-3 w-3 mr-1" /> Podeli</Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card className="p-8 text-center">
            <Star className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">Rezultati anketa</p>
            <p className="text-xs text-muted-foreground mt-1">Analiza i statistika odgovora</p>
          </Card>
        </TabsContent>
      </Tabs>


    </div>
  )
}
