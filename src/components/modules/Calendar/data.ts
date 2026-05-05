export const COLORS: Record<string, string> = {
  primary: 'bg-primary/15 border-primary/30 text-primary',
  red: 'bg-red-100 border-red-200 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  green: 'bg-emerald-100 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  blue: 'bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  orange: 'bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  purple: 'bg-purple-100 border-purple-200 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  pink: 'bg-pink-100 border-pink-200 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  teal: 'bg-teal-100 border-teal-200 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
}

export const COLOR_DOTS: Record<string, string> = {
  primary: 'bg-primary', red: 'bg-red-500', green: 'bg-emerald-500', blue: 'bg-blue-500',
  orange: 'bg-amber-500', purple: 'bg-purple-500', pink: 'bg-pink-500', teal: 'bg-teal-500',
}

export const MONTHS_SR = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar']

export const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec']

export const DAYS_SR = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned']

export const DAYS_FULL = ['Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota', 'Nedelja']

export const EVENT_TYPES = [
  { value: 'sastanak', label: 'Sastanak', icon: Users },
  { value: 'rok', label: 'Rok / Deadline', icon: Timer },
  { value: 'task', label: 'Zadatak', icon: CheckCircle2 },
  { value: 'podsetnik', label: 'Podsetnik', icon: Bell },
  { value: 'rođendan', label: 'Rođendan', icon: Cake },
  { value: 'putovanje', label: 'Putovanje', icon: Plane },
  { value: 'obuka', label: 'Obuka / Edukacija', icon: GraduationCap },
  { value: 'licni', label: 'Lično', icon: Heart },
  { value: 'ostalo', label: 'Ostalo', icon: Calendar },
]

export const REMINDER_OPTIONS = [
  { value: 'none', label: 'Bez podsetnika' },
  { value: '0', label: 'U trenutku' },
  { value: '5', label: '5 min pre' },
  { value: '15', label: '15 min pre' },
  { value: '30', label: '30 min pre' },
  { value: '60', label: '1 sat pre' },
  { value: '1440', label: '1 dan pre' },
  { value: '10080', label: '1 nedelja pre' },
]

export const RECURRENCE_OPTIONS = [
  { value: 'none', label: 'Bez ponavljanja' },
  { value: 'daily', label: 'Dnevno' },
  { value: 'weekly', label: 'Nedeljno' },
  { value: 'biweekly', label: 'Dvonedeljno' },
  { value: 'monthly', label: 'Mesečno' },
  { value: 'yearly', label: 'Godišnje' },
]

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Nizak', color: 'text-green-500' },
  { value: 'medium', label: 'Srednji', color: 'text-amber-500' },
  { value: 'high', label: 'Visok', color: 'text-orange-500' },
  { value: 'urgent', label: 'Hitno', color: 'text-red-500' },
]

export const formatTime = (dateStr: string) => {
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? '' : d.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })
}

export const formatDateShort = (dateStr: string) => {
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('sr-RS', { day: 'numeric', month: 'short' })
}

export const formatDateFull = (dateStr: string) => {
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('sr-RS', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export const getEventDuration = (start: string, end: string | null): string => {
  if (!end) return ''
  const ms = new Date(end).getTime() - new Date(start).getTime()
  if (ms <= 0) return ''
  const hours = Math.floor(ms / 3600000)
  const mins = Math.floor((ms % 3600000) / 60000)
  if (hours === 0) return `${mins}min`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}min`
}

export const isEventUpcoming = (start: string): boolean => {
  const now = Date.now()
  const startMs = new Date(start).getTime()
  return startMs > now && startMs - now < 24 * 60 * 60 * 1000
}

export const isEventPast = (end: string | null, start: string): boolean => {
  const endMs = end ? new Date(end).getTime() : new Date(start).getTime() + 3600000
  return endMs < Date.now()
}

export const { activeCompanyId } = useAppStore();

export const { t } = useTranslation();

export const emptyForm = { title: '', description: '', startTime: '', endTime: '', allDay: false, color: 'primary', type: 'sastanak', location: '', attendees: '', reminder: '15', recurrence: 'none', priority: 'medium' }

export const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000) }

export const year = currentDate.getFullYear();

export const month = currentDate.getMonth();

export const res = await fetch(`/api/calendar?month=${month + 1}&year=${year}`);

export const q = searchQuery.toLowerCase();

export const today = new Date();

export const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

export const now = Date.now();

export const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

export const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

export const prevWeek = () => { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d) }

export const nextWeek = () => { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d) }

export const goToday = () => setCurrentDate(new Date());

export const firstDay = new Date(year, month, 1);

export const lastDay = new Date(year, month + 1, 0);

export const days: (number | null)[] = []

export const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return filteredEvents.filter(e => e.startTime.startsWith(dateStr))
  }

export const isToday = (day: number) => {
    const today = new Date()
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
  }

export const start = new Date(currentDate);

export const dayOfWeek = start.getDay() - 1;

export const d = new Date(start);

export const getEventsForWeekDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return filteredEvents.filter(e => e.startTime.startsWith(dateStr))
  }

export const openNewEvent = (date?: Date) => {
    setEditingEvent(null)
    const startStr = date ? `${date.toISOString().slice(0, 10)}T09:00` : `${new Date().toISOString().slice(0, 10)}T${new Date().toTimeString().slice(0, 5)}`
    setEventForm({ ...emptyForm, startTime: startStr, endTime: '' })
    setEventDialogOpen(true)
  }

export const openEditEvent = (ev: CalEvent) => {
    setEditingEvent(ev)
    setEventForm({
      title: ev.title || '', description: ev.description || '',
      startTime: ev.startTime?.slice(0, 16) || '', endTime: ev.endTime?.slice(0, 16) || '',
      allDay: ev.allDay || false, color: ev.color || 'primary', type: ev.type || 'sastanak',
      location: ev.location || '', attendees: ev.attendees || '',
      reminder: ev.reminder || '15', recurrence: ev.recurrence || 'none', priority: ev.priority || 'medium',
    })
    setEventDialogOpen(true)
  }

export const handleSubmitEvent = async () => {
    if (!eventForm.title.trim()) { showToast('Naslov je obavezan'); return }
    setSubmitting(true)
    try {
      const body = {
        title: eventForm.title, description: eventForm.description || null,
        startTime: eventForm.startTime, endTime: eventForm.endTime || null,
        allDay: eventForm.allDay, color: eventForm.color, type: eventForm.type,
        location: eventForm.location || null, attendees: eventForm.attendees || null,
        reminder: eventForm.reminder, recurrence: eventForm.recurrence, priority: eventForm.priority,
      }
      const url = editingEvent ? `/api/calendar/${editingEvent.id}` : '/api/calendar'
      const res = await fetch(url, { method: editingEvent ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) { setEventDialogOpen(false); loadEvents(); showToast(editingEvent ? 'Događaj ažuriran' : 'Događaj kreiran') }
    } catch { showToast('Greška') }
    setSubmitting(false)
  }

export const handleDeleteEvent = async () => {
    if (!selectedEvent) return
    try { await fetch(`/api/calendar/${selectedEvent.id}`, { method: 'DELETE' }); setDeleteConfirmOpen(false); setSelectedEvent(null); loadEvents(); showToast('Događaj obrisan') }
    catch { showToast('Greška') }
  }

export const Kpi = ({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color?: string }) => (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${color || 'text-muted-foreground'}`} />
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </Card>
  );

export const total = events.length;

export const today = todayEvents.length;

export const upcoming = events.filter(e => new Date(e.startTime).getTime() > Date.now()).length;

export const meetings = events.filter(e => e.type === 'sastanak').length;

export const deadlines = events.filter(e => e.type === 'rok').length;

export const tasks = events.filter(e => e.type === 'task').length;

export const withReminder = events.filter(e => e.reminder && e.reminder !== 'none').length;

export const recurring = events.filter(e => e.recurrence && e.recurrence !== 'none').length;

export const byType: Record<string, number> = {}

export const byColor: Record<string, number> = {}

export const dayEvents = getEventsForDay(day);

export const isSelected = selectedDay?.getDate() === day && selectedDay?.getMonth() === month && selectedDay?.getFullYear() === year;

export const typeInfo = EVENT_TYPES.find(t => t.value === ev.type);

export const Icon = typeInfo?.icon || Calendar;

export const dayEvents = getEventsForWeekDay(date);

export const isTodayDate = date.toDateString() === new Date().toDateString();

export const typeInfo = EVENT_TYPES.find(t => t.value === ev.type);

export const Icon = typeInfo?.icon || Calendar;

export const past = isEventPast(ev.endTime, ev.startTime);

export const upcoming = isEventUpcoming(ev.startTime);

export const info = EVENT_TYPES.find(t => t.value === type);

export const max = Math.max(...Object.values(stats.byType), 1);

export const TypeIcon = info ? info.icon : Calendar;

export const m = e.startTime?.split('-')?.[1] || '01';

export const max = Object.entries(stats.byType).sort(([, a], [, b]) => b - a)[0]

export const max = Object.entries(stats.byColor).sort(([, a], [, b]) => b - a)[0]
