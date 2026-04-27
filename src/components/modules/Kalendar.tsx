'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, ChevronLeft, ChevronRight, CalendarDays, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from '@/lib/i18n'
import { formatDate } from '@/lib/helpers'

interface CalEvent {
  id: string; title: string; description: string | null; startTime: string; endTime: string | null
  allDay: boolean; color: string; type: string; createdAt: string
}

const COLORS: Record<string, string> = { primary: 'bg-primary/15 border-primary/30 text-primary', red: 'bg-red-100 border-red-200 text-red-700', green: 'bg-emerald-100 border-emerald-200 text-emerald-700', blue: 'bg-blue-100 border-blue-200 text-blue-700', orange: 'bg-amber-100 border-amber-200 text-amber-700', purple: 'bg-purple-100 border-purple-200 text-purple-700' }
const MONTHS = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar']

export function Kalendar() {
  const { t } = useTranslation()
  const [events, setEvents] = useState<CalEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'calendar' | 'form'>('calendar')
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<CalEvent | null>(null)

  const DAYS = [t('common.day_mon'), t('common.day_tue'), t('common.day_wed'), t('common.day_thu'), t('common.day_fri'), t('common.day_sat'), t('common.day_sun')]

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/calendar?month=${month + 1}&year=${year}`)
    setEvents(await res.json())
    setLoading(false)
  }, [month, year])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const handleNew = () => { setEditing(null); setViewMode('form') }
  const handleEdit = (ev: CalEvent) => { setEditing(ev); setViewMode('form') }
  const handleCancel = () => { setViewMode('calendar'); setEditing(null) }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = { title: fd.get('title'), description: fd.get('description'), startTime: fd.get('startTime'), endTime: fd.get('endTime'), allDay: fd.get('allDay') === 'on', color: fd.get('color'), type: fd.get('type') }
    try {
      const url = editing ? `/api/calendar/${editing.id}` : '/api/calendar'
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { toast.error(t('common.error')); return }
      toast.success(editing ? t('common.updated') : t('common.created')); setViewMode('calendar'); setEditing(null); fetchEvents()
    } catch { toast.error(t('common.error')) } finally { setSubmitting(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('calendar.confirmDelete'))) return
    try { await fetch(`/api/calendar/${id}`, { method: 'DELETE' }); toast.success(t('common.deleteSuccess')); fetchEvents() } catch { toast.error(t('common.error')) }
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const goToday = () => setCurrentDate(new Date())

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  let startDay = firstDay.getDay() - 1
  if (startDay < 0) startDay = 6

  const days: (number | null)[] = []
  for (let i = 0; i < startDay; i++) days.push(null)
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(d)

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(e => e.startTime.startsWith(dateStr))
  }

  const isToday = (day: number) => {
    const today = new Date()
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('calendar.title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t('calendar.subtitle')}</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          {viewMode === 'form' ? (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleCancel}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="text-base font-semibold">{editing ? t('common.edit') : t('common.new')} {t('calendar.event')}</CardTitle>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
                <div className="text-center">
                  <h3 className="text-base font-semibold">{MONTHS[month]} {year}</h3>
                </div>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" onClick={goToday}>{t('calendar.today')}</Button>
              </div>
              <Button size="sm" className="gap-2" onClick={handleNew}>
                <Plus className="h-4 w-4" /> {t('calendar.newEvent')}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {viewMode === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
              <div className="space-y-2"><Label className="text-xs">{t('calendar.eventTitle')} *</Label><Input name="title" defaultValue={editing?.title || ''} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="text-xs">{t('common.type')}</Label>
                  <Select name="type" defaultValue={editing?.type || 'sastanak'}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                    <SelectItem value="sastanak">{t('calendar.typeMeeting')}</SelectItem><SelectItem value="rok">{t('calendar.typeDeadline')}</SelectItem><SelectItem value="task">{t('calendar.typeTask')}</SelectItem><SelectItem value="podsetnik">{t('calendar.reminder')}</SelectItem>
                  </SelectContent></Select>
                </div>
                <div className="space-y-2"><Label className="text-xs">{t('calendar.color')}</Label>
                  <Select name="color" defaultValue={editing?.color || 'primary'}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                    <SelectItem value="primary">Plava</SelectItem><SelectItem value="red">Crvena</SelectItem><SelectItem value="green">Zelena</SelectItem><SelectItem value="orange">Narandžasta</SelectItem><SelectItem value="purple">Ljubičasta</SelectItem>
                  </SelectContent></Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="text-xs">{t('calendar.startDate')} *</Label><Input name="startTime" type="datetime-local" defaultValue={editing?.startTime?.slice(0, 16) || ''} required /></div>
                <div className="space-y-2"><Label className="text-xs">{t('calendar.endDate')}</Label><Input name="endTime" type="datetime-local" defaultValue={editing?.endTime?.slice(0, 16) || ''} /></div>
              </div>
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="allDay" defaultChecked={editing?.allDay || false} /> {t('calendar.allDay')}</label>
              <div className="space-y-2"><Label className="text-xs">{t('calendar.eventDescription')}</Label><Input name="description" defaultValue={editing?.description || ''} /></div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>{submitting ? t('common.saving') : t('common.save')}</Button>
                <Button type="button" variant="outline" onClick={handleCancel}>{t('common.cancel')}</Button>
              </div>
            </form>
          ) : loading ? (
            <Skeleton className="h-[500px] w-full" />
          ) : (
            <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
              {DAYS.map(d => <div key={d} className="bg-muted p-2 text-center text-xs font-medium">{d}</div>)}
              {days.map((day, i) => {
                if (day === null) return <div key={`e-${i}`} className="bg-white min-h-[80px] p-1" />
                const dayEvents = getEventsForDay(day)
                return (
                  <div key={day} className={`bg-white min-h-[80px] p-1 ${isToday(day) ? 'ring-2 ring-primary/30' : ''}`}>
                    <span className={`text-xs ${isToday(day) ? 'font-bold text-primary' : 'text-muted-foreground'}`}>{day}</span>
                    <div className="space-y-0.5 mt-0.5">
                      {dayEvents.slice(0, 3).map(ev => (
                        <button key={ev.id} className={`w-full text-left text-[10px] px-1 py-0.5 rounded truncate border ${COLORS[ev.color] || COLORS.primary}`}
                          onClick={() => handleEdit(ev)}
                          onContextMenu={(e) => { e.preventDefault(); handleDelete(ev.id) }}>
                          {ev.allDay ? '🗓 ' : ''}{ev.title}
                        </button>
                      ))}
                      {dayEvents.length > 3 && <p className="text-[10px] text-muted-foreground pl-1">+{dayEvents.length - 3} {t('calendar.more')}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
