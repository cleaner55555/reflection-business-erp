export const STATUS_BADGES: Record<string, string> = {
  aktivno: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  skript: 'bg-amber-50 text-amber-700 border-amber-200',
  arhiviran: 'bg-slate-100 text-slate-500 border-slate-200',
}

export const STATUS_LABELS: Record<string, string> = {
  aktivno: 'Aktivno',
  skript: 'Skript',
  arhiviran: 'Arhiviran',
}

export const LESSON_TYPE_ICONS: Record<string, React.ReactNode> = {
  tekst: <FileText className="h-3.5 w-3.5" />,
  video: <Video className="h-3.5 w-3.5" />,
  test: <HelpCircle className="h-3.5 w-3.5" />,
  dokument: <FolderOpen className="h-3.5 w-3.5" />,
}

export const LESSON_TYPE_LABELS: Record<string, string> = {
  tekst: 'Tekst',
  video: 'Video',
  test: 'Test',
  dokument: 'Dokument',
}

export const LESSON_TYPE_COLORS: Record<string, string> = {
  tekst: 'bg-slate-100 text-slate-600',
  video: 'bg-rose-50 text-rose-600',
  test: 'bg-violet-50 text-violet-600',
  dokument: 'bg-cyan-50 text-cyan-600',
}

export const { t } = useTranslation();

export const { tc, translateTexts } = useContentTranslation();

export const res = await fetch('/api/courses');

export const data = await res.json();

export const res = await fetch(`/api/courses/${courseId}`);

export const data = await res.json();

export const handleExpand = (courseId: string) => {
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

export const handleDeleteCourse = async (id: string) => {
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

export const handleDeleteLesson = async (lessonId: string, courseId: string) => {
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

export const handleCourseSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

export const handleLessonSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

export const openEditCourse = (course: Course) => {
    setEditingCourse(course)
    setCourseViewMode('form')
  }

export const openNewCourse = () => {
    setEditingCourse(null)
    setCourseViewMode('form')
  }

export const openAddLesson = (courseId: string) => {
    setTargetCourseId(courseId)
    setEditingLesson(null)
    setLessonViewMode('form')
  }

export const openEditLesson = (lesson: Lesson, courseId: string) => {
    setTargetCourseId(courseId)
    setEditingLesson(lesson)
    setLessonViewMode('form')
  }

export const handleCancelCourse = () => {
    setCourseViewMode('list')
    setEditingCourse(null)
  }

export const handleCancelLesson = () => {
    setLessonViewMode('list')
    setEditingLesson(null)
    setTargetCourseId(null)
  }

export const filteredCourses = courses.filter(c => {
    if (activeTab === 'active') return c.status === 'aktivno'
    return true
  });

export const totalLessons = courses.reduce((s, c) => s + (c._count?.lessons || 0), 0);

export const totalDuration = courses.reduce((s, c) => s + (c.duration || 0), 0);

export const isExpanded = expandedId === course.id;
