import { format, parseISO } from 'date-fns'
import { sr } from 'date-fns/locale'

export function formatRSD(amount: number): string {
  const formatted = new Intl.NumberFormat('sr-RS', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
  return `${formatted} RSD`
}

export function formatRSDShort(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M RSD`
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K RSD`
  }
  return `${amount.toFixed(0)} RSD`
}

export function formatDate(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
  return format(date, 'dd.MM.yyyy', { locale: sr })
}

export function formatDateTime(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
  return format(date, 'dd.MM.yyyy HH:mm', { locale: sr })
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    nacrt: 'Načrt',
    poslata: 'Poslata',
    placena: 'Plaćena',
    otkazana: 'Otkazana',
    primljena: 'Primljena',
    prijem: 'Priem',
    izdavanje: 'Izdavanje',
    inventura: 'Inventura',
    korekcija: 'Korekcija',
    prihod: 'Prihod',
    rashod: 'Rashod',
    ulaz: 'Ulaz',
    izlaz: 'Izlaz',
    kupac: 'Kupac',
    dobavljac: 'Dobavljač',
    partner: 'Partner',
    promet: 'Promet',
    nabavka: 'Nabavka',
    plata: 'Plata',
    režije: 'Režije',
    ostalo: 'Ostalo',
    gotovina: 'Gotovina',
    racun: 'Račun',
    kartica: 'Kartica',
  }
  return labels[status] || status
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    nacrt: 'bg-slate-100 text-slate-700 border-slate-200',
    poslata: 'bg-amber-50 text-amber-700 border-amber-200',
    placena: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    otkazana: 'bg-red-50 text-red-700 border-red-200',
    primljena: 'bg-blue-50 text-blue-700 border-blue-200',
    prijem: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    izdavanje: 'bg-orange-50 text-orange-700 border-orange-200',
    inventura: 'bg-purple-50 text-purple-700 border-purple-200',
    korekcija: 'bg-sky-50 text-sky-700 border-sky-200',
    prihod: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rashod: 'bg-red-50 text-red-700 border-red-200',
    ulaz: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    izlaz: 'bg-orange-50 text-orange-700 border-orange-200',
  }
  return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200'
}

export function getMonthLabel(month: string): string {
  const date = parseISO(`${month}-01`)
  return format(date, 'MMM yyyy', { locale: sr })
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
