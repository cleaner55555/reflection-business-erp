'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  GraduationCap, Plus, Pencil, Trash2, ChevronDown, ChevronUp,
  BookOpen, Clock, FileText, Video, HelpCircle, FolderOpen, ListOrdered,
  ArrowLeft,
} from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation, useContentTranslation } from '@/lib/i18n'

interface Lesson {
  id: string
  courseId: string
  title: string
  content?: string
  orderNum: number
  type: string
  createdAt: string
}

interface Course {
  id: string
  title: string
  description?: string
  category?: string
  instructor?: string
  duration: number
  status: string
  createdAt: string
  _count?: { lessons: number }
  lessons?: Lesson[]
}

const STATUS_BADGES: Record<string, string> = {
  aktivno: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  skript: 'bg-amber-50 text-amber-700 border-amber-200',
  arhiviran: 'bg-slate-100 text-slate-500 border-slate-200',
}

const STATUS_LABELS: Record<string, string> = {
  aktivno: 'Aktivno',
  skript: 'Skript',
  arhiviran: 'Arhiviran',
}

const LESSON_TYPE_ICONS: Record<string, React.ReactNode> = {
  tekst: <FileText className="h-3.5 w-3.5" />,
  video: <Video className="h-3.5 w-3.5" />,
  test: <HelpCircle className="h-3.5 w-3.5" />,
  dokument: <FolderOpen className="h-3.5 w-3.5" />,
}

const LESSON_TYPE_LABELS: Record<string, string> = {
  tekst: 'Tekst',
  video: 'Video',
  test: 'Test',
  dokument: 'Dokument',
}

const LESSON_TYPE_COLORS: Record<string, string> = {
  tekst: 'bg-slate-100 text-slate-600',
  video: 'bg-rose-50 text-rose-600',
  test: 'bg-violet-50 text-violet-600',
  dokument: 'bg-cyan-50 text-cyan-600',
}

export function Edukacija() {
  const { t } = useTranslation()
  const { tc, translateTexts } = useContentTranslation()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [courseViewMode, setCourseViewMode] = useState<'list' | 'form'>('list')
  const [lessonViewMode, setLessonViewMode] = useState<'list' | 'form'>('list')
  const [submitting, setSubmitting] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [targetCourseId, setTargetCourseId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('all')

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/courses')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setCourses(data)
    } catch {
      toast.error(t('education.loadCoursesError'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCourses() }, [fetchCourses])

  useEffect(() => {
    if (courses.length > 0) {
      translateTexts(courses.flatMap(c => [c.title, c.description, c.category, c.instructor, ...(c.lessons || []).map(l => l.title)].filter(Boolean)))
    }
  }, [courses])

  const fetchCourseDetails = useCallback(async (courseId: string) => {
    try {
      const res = await fetch(`/api/courses/${courseId}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setCourses(prev => prev.map(c => c.id === courseId ? data : c))
    } catch {
      toast.error(t('education.loadLessonsError'))
    }
  }, [])

  const handleExpand = (courseId: string) => {
    if (expandedId === courseId) {
      setExpandedId(null)
    } else {
      setExpandedId(courseId)
      const course = courses.find(c => c.id === courseId)
      if (course && !course.lessons) {
        fetchCourseDetails(courseId)
      }
    }
  }

  const handleDeleteCourse = async (id: string) => {
    if (!confirm(t('education.confirmDeleteCourse'))) return
    try {
      const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success(t('education.courseDeleted'))
      if (expandedId === id) setExpandedId(null)
      fetchCourses()
    } catch {
      toast.error(t('common.deleteError'))
    }
  }

  const handleDeleteLesson = async (lessonId: string, courseId: string) => {
    if (!confirm(t('education.confirmDeleteLesson'))) return
    try {
      const res = await fetch(`/api/lessons/${lessonId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success(t('education.lessonDeleted'))
      fetchCourseDetails(courseId)
    } catch {
      toast.error(t('common.deleteError'))
    }
  }

  const handleCourseSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      title: fd.get('title') as string,
      description: fd.get('description') as string || null,
      category: fd.get('category') as string || null,
      instructor: fd.get('instructor') as string || null,
      duration: Number(fd.get('duration')) || 0,
      status: fd.get('status') as string || 'aktivno',
    }
    try {
      const url = editingCourse ? `/api/courses/${editingCourse.id}` : '/api/courses'
      const res = await fetch(url, {
        method: editingCourse ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error()
      toast.success(editingCourse ? t('education.courseUpdated') : t('education.courseCreated'))
      setCourseViewMode('list')
      setEditingCourse(null)
      fetchCourses()
    } catch {
      toast.error(t('common.saveError'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleLessonSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!targetCourseId) return
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      courseId: targetCourseId,
      title: fd.get('title') as string,
      content: fd.get('content') as string || null,
      orderNum: Number(fd.get('orderNum')) || 0,
      type: fd.get('type') as string || 'tekst',
    }
    try {
      const url = editingLesson ? `/api/lessons/${editingLesson.id}` : '/api/lessons'
      const res = await fetch(url, {
        method: editingLesson ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error()
      toast.success(editingLesson ? t('education.lessonUpdated') : t('education.lessonCreated'))
      setLessonViewMode('list')
      setEditingLesson(null)
      const courseId = targetCourseId
      setTargetCourseId(null)
      fetchCourseDetails(courseId)
    } catch {
      toast.error(t('common.saveError'))
    } finally {
      setSubmitting(false)
    }
  }

  const openEditCourse = (course: Course) => {
    setEditingCourse(course)
    setCourseViewMode('form')
  }

  const openNewCourse = () => {
    setEditingCourse(null)
    setCourseViewMode('form')
  }

  const openAddLesson = (courseId: string) => {
    setTargetCourseId(courseId)
    setEditingLesson(null)
    setLessonViewMode('form')
  }

  const openEditLesson = (lesson: Lesson, courseId: string) => {
    setTargetCourseId(courseId)
    setEditingLesson(lesson)
    setLessonViewMode('form')
  }

  const handleCancelCourse = () => {
    setCourseViewMode('list')
    setEditingCourse(null)
  }

  const handleCancelLesson = () => {
    setLessonViewMode('list')
    setEditingLesson(null)
    setTargetCourseId(null)
  }

  const filteredCourses = courses.filter(c => {
    if (activeTab === 'active') return c.status === 'aktivno'
    return true
  })

  const totalLessons = courses.reduce((s, c) => s + (c._count?.lessons || 0), 0)
  const totalDuration = courses.reduce((s, c) => s + (c.duration || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <GraduationCap className="h-6 w-6" />
          {t('education.title')}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{t('education.subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center">
              <BookOpen className="h-4.5 w-4.5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('education.totalCourses')}</p>
              <p className="text-lg font-bold">{courses.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-violet-50 flex items-center justify-center">
              <ListOrdered className="h-4.5 w-4.5 text-violet-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('education.totalLessons')}</p>
              <p className="text-lg font-bold">{totalLessons}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock className="h-4.5 w-4.5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('education.totalDuration')}</p>
              <p className="text-lg font-bold">{totalDuration} min</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          {courseViewMode === 'form' ? (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleCancelCourse}><ArrowLeft className="h-4 w-4" /></Button>
              <div><CardTitle>{editingCourse ? t('common.edit') : t('common.new')} {t('education.course')}</CardTitle></div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
                <div>
                  <CardTitle className="text-base font-semibold">{t('education.courses')}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{courses.length} {t('education.coursesCount')}</p>
                </div>
                <Button size="sm" className="gap-2" onClick={openNewCourse}>
                  <Plus className="h-4 w-4" />
                  {t('education.newCourse')}
                </Button>
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">{t('education.allCourses')}</TabsTrigger>
                  <TabsTrigger value="active">{t('education.active')}</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {courseViewMode === 'form' ? (
            <form onSubmit={handleCourseSubmit} key={editingCourse?.id || 'new'} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">{t('education.courseName')} *</Label>
                <Input name="title" defaultValue={editingCourse?.title || ''} required placeholder="npr. Excel napredni" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('common.description')}</Label>
                <Textarea name="description" defaultValue={editingCourse?.description || ''} placeholder={t('education.courseDescriptionPlaceholder')} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">{t('education.category')}</Label>
                  <Select name="category" defaultValue={editingCourse?.category || ''}>
                    <SelectTrigger><SelectValue placeholder={t('education.selectCategory')} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="Menadžment">Menadžment</SelectItem>
                      <SelectItem value="Finansije">Finansije</SelectItem>
                      <SelectItem value="Bezbednost">Bezbednost</SelectItem>
                      <SelectItem value="Jezici">Jezici</SelectItem>
                      <SelectItem value="Komunikacija">Komunikacija</SelectItem>
                      <SelectItem value="Ostalo">Ostalo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">{t('education.instructor')}</Label>
                  <Input name="instructor" defaultValue={editingCourse?.instructor || ''} placeholder={t('education.instructorPlaceholder')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">{t('education.duration')} (min)</Label>
                  <Input name="duration" type="number" min={0} defaultValue={editingCourse?.duration || 0} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">{t('common.status')}</Label>
                  <Select name="status" defaultValue={editingCourse?.status || 'aktivno'}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aktivno">Aktivno</SelectItem>
                      <SelectItem value="skript">Skript</SelectItem>
                      <SelectItem value="arhiviran">Arhiviran</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleCancelCourse} className="flex-1">{t('common.cancel')}</Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? t('common.saving') : t('common.save')}
                </Button>
              </div>
            </form>
          ) : (
            <>
              {/* Course Grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="p-4">
                      <Skeleton className="h-5 w-3/4 mb-3" />
                      <Skeleton className="h-4 w-1/2 mb-2" />
                      <Skeleton className="h-4 w-2/3 mb-4" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : filteredCourses.length === 0 ? (
                <div className="text-center py-12">
                  <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">{t('education.noCourses')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredCourses.map((course) => {
                    const isExpanded = expandedId === course.id
                    return (
                      <div key={course.id} className="space-y-0">
                        <Card
                          className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                            isExpanded ? 'ring-2 ring-primary/20 rounded-b-none' : ''
                          }`}
                          onClick={() => handleExpand(course.id)}
                        >
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm truncate">{tc(course.title)}</h3>
                              {course.instructor && (
                                <p className="text-xs text-muted-foreground mt-0.5">{tc(course.instructor)}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => { e.stopPropagation(); openEditCourse(course) }}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500"
                                onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course.id) }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            {course.category && (
                              <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600 border-slate-200">
                                {tc(course.category)}
                              </Badge>
                            )}
                            <Badge variant="outline" className={`text-[10px] ${STATUS_BADGES[course.status] || ''}`}>
                              {STATUS_LABELS[course.status] || course.status}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {course.duration} min
                            </span>
                            <span className="flex items-center gap-1">
                              <ListOrdered className="h-3 w-3" />
                              {course._count?.lessons || course.lessons?.length || 0} lekcija
                            </span>
                            {course.description && (
                              <span className="truncate max-w-[120px]" title={course.description}>
                                {tc(course.description)}
                              </span>
                            )}
                          </div>
                        </Card>

                        {/* Expanded lessons area */}
                        {isExpanded && (
                          <Card className="rounded-t-none border-t-0 p-4">
                            {lessonViewMode === 'form' ? (
                              <>
                                <div className="flex items-center gap-3 mb-4">
                                  <Button variant="ghost" size="icon" onClick={handleCancelLesson}><ArrowLeft className="h-4 w-4" /></Button>
                                  <h4 className="text-sm font-semibold">{editingLesson ? t('common.edit') : t('common.new')} {t('education.lesson')}</h4>
                                </div>
                                <form onSubmit={handleLessonSubmit} key={editingLesson?.id || targetCourseId || 'new'} className="space-y-4">
                                  <div className="space-y-2">
                                    <Label className="text-xs">{t('education.lessonTitle')} *</Label>
                                    <Input name="title" defaultValue={editingLesson?.title || ''} required placeholder="npr. Uvod u Excel" />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label className="text-xs">{t('common.type')}</Label>
                                      <Select name="type" defaultValue={editingLesson?.type || 'tekst'}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="tekst">Tekst</SelectItem>
                                          <SelectItem value="video">Video</SelectItem>
                                          <SelectItem value="test">Test</SelectItem>
                                          <SelectItem value="dokument">Dokument</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-xs">{t('education.orderNum')}</Label>
                                      <Input name="orderNum" type="number" min={0} defaultValue={editingLesson?.orderNum ?? 0} />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs">{t('education.content')}</Label>
                                    <Textarea name="content" defaultValue={editingLesson?.content || ''} placeholder={t('education.contentPlaceholder')} rows={5} />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button type="button" variant="outline" onClick={handleCancelLesson} className="flex-1">{t('common.cancel')}</Button>
                                    <Button type="submit" className="flex-1" disabled={submitting}>
                                      {submitting ? t('common.saving') : t('common.save')}
                                    </Button>
                                  </div>
                                </form>
                              </>
                            ) : (
                              <>
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-sm font-semibold flex items-center gap-1.5">
                                    <ListOrdered className="h-4 w-4" />
                                    {t('education.lessons')}
                                  </h4>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 gap-1.5 text-xs"
                                    onClick={() => openAddLesson(course.id)}
                                  >
                                    <Plus className="h-3 w-3" />
                                    {t('education.addLesson')}
                                  </Button>
                                </div>

                                {!course.lessons || course.lessons.length === 0 ? (
                                  <div className="text-center py-6">
                                    <BookOpen className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                                    <p className="text-xs text-muted-foreground">{t('education.noLessons')}</p>
                                  </div>
                                ) : (
                                  <div className="space-y-1.5 max-h-72 overflow-y-auto">
                                    {course.lessons.map((lesson) => (
                                      <div
                                        key={lesson.id}
                                        className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-xs hover:bg-accent/50 transition-colors"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <span className="flex items-center justify-center h-5 w-5 rounded bg-muted text-muted-foreground text-[10px] font-medium shrink-0">
                                            {lesson.orderNum + 1}
                                          </span>
                                          <span className="flex items-center gap-1 shrink-0 text-muted-foreground">
                                            {LESSON_TYPE_ICONS[lesson.type] || <FileText className="h-3.5 w-3.5" />}
                                          </span>
                                          <span className="truncate font-medium">{tc(lesson.title)}</span>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ${LESSON_TYPE_COLORS[lesson.type] || ''}`}>
                                            {LESSON_TYPE_LABELS[lesson.type] || lesson.type}
                                          </span>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => openEditLesson(lesson, course.id)}
                                          >
                                            <Pencil className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-red-500"
                                            onClick={() => handleDeleteLesson(lesson.id, course.id)}
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </>
                            )}
                          </Card>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
