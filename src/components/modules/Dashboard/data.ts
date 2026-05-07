// Static data for Dashboard module

export const CHART_COLORS = {
  revenue: '#059669',
  expenses: '#dc2626',
  grid: '#e5e7eb',
} as const

export const STATUS_COLORS: Record<string, string> = {
  nacrt: '#6b7280',
  poslata: '#0891b2',
  placena: '#059669',
  otkazana: '#ef4444',
  avansna: '#8b5cf6',
  predracun: '#f59e0b',
}

export const DEAL_STAGE_COLORS: Record<string, string> = {
  lead: '#6366f1',
  kvalifikacija: '#8b5cf6',
  predlog: '#0891b2',
  pregovaranje: '#f59e0b',
  won: '#059669',
  lost: '#ef4444',
}

export const PIE_COLORS = ['#059669', '#0891b2', '#7c3aed', '#ea580c', '#db2777', '#6366f1', '#0d9488', '#ca8a04']

export const KPI_COLORS = {
  emerald: { text: 'text-emerald-600', bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', iconText: 'text-emerald-600' },
  red: { text: 'text-red-600', bg: 'bg-red-50', iconBg: 'bg-red-100', iconText: 'text-red-600' },
  violet: { text: 'text-violet-600', bg: 'bg-violet-50', iconBg: 'bg-violet-100', iconText: 'text-violet-600' },
  amber: { text: 'text-amber-600', bg: 'bg-amber-50', iconBg: 'bg-amber-100', iconText: 'text-amber-600' },
  teal: { text: 'text-teal-600', bg: 'bg-teal-50', iconBg: 'bg-teal-100', iconText: 'text-teal-600' },
  slate: { text: 'text-slate-600', bg: 'bg-slate-50', iconBg: 'bg-slate-100', iconText: 'text-slate-600' },
  sky: { text: 'text-sky-600', bg: 'bg-sky-50', iconBg: 'bg-sky-100', iconText: 'text-sky-600' },
} as const
