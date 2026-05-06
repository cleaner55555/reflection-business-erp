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
