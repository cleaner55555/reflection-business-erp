export const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-700' },
  active: { label: 'Aktivna', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Zatvorena', color: 'bg-amber-100 text-amber-700' },
  archived: { label: 'Arhivirana', color: 'bg-gray-200 text-gray-500' },
}

export const questionTypeConfig: Record<string, { label: string }> = {
  text: { label: 'Tekst' },
  textarea: { label: 'Dugi tekst' },
  single_choice: { label: 'Jedan odgovor' },
  multiple_choice: { label: 'Više odgovora' },
  rating: { label: 'Ocena (1-5)' },
  nps: { label: 'NPS (0-10)' },
  date: { label: 'Datum' },
  email: { label: 'Email' },
}

export const { activeCompanyId } = useAppStore();

export const { t } = useTranslation();

export const emptySurveyForm = { name: '', description: '', status: 'draft' }

export const emptyQuestionForm = { question: '', type: 'single_choice', required: true, options: [''] }

export const res = await fetch(`/api/surveys?companyId=${activeCompanyId}&limit=100`);

export const data = await res.json();

export const totalResponses = surveys.reduce((sum, s) => sum + (s.responseCount || 0), 0);

export const activeSurveys = surveys.filter((s) => s.status === 'active').length;

export const filtered = surveys.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  });

export const handleCreateSurvey = async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch('/api/surveys', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, ...surveyForm, questionCount: questions.length, responseCount: 0 }),
      })
      if (res.ok) { setDialogOpen(false); setSurveyForm(emptySurveyForm); setQuestions([]); loadSurveys() }
    } catch { /* silent */ }
  }

export const handleDelete = async (id: string) => {
    if (!confirm('Obrisati anketu?')) return
    try {
      const res = await fetch(`/api/surveys?id=${id}`, { method: 'DELETE' })
      if (res.ok) loadSurveys()
    } catch { /* silent */ }
  }

export const addQuestion = () => {
    setQuestions([...questions, { id: `temp-${Date.now()}`, ...questionForm, options: questionForm.type.includes('choice') ? questionForm.options : undefined }])
    setQuestionForm(emptyQuestionForm)
    setQuestionDialogOpen(false)
  }

export const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

export const cfg = statusConfig[s.status]
