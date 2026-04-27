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
    pripremljena: 'Pripremljena',
    otpremljena: 'Otpremljena',
    stornirana: 'Stornirana',
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
    izlazna: 'Izlazna',
    ulazna: 'Ulazna',
    predracun: 'Predračun',
    faktura_izlazna: 'Faktura izlazna',
    faktura_ulazna: 'Faktura ulazna',
    predracun_label: 'Predračun',
    kasa_ulaz: 'Kasa ulaz',
    kasa_izlaz: 'Kasa izlaz',
    transakcija: 'Transakcija',
    otpremnica: 'Otpremnica',
    lead: 'Lead',
    kvalifikacija: 'Kvalifikacija',
    predlog: 'Predlog',
    pregovaranje: 'Pregovaranje',
    won: 'Dobijeno',
    lost: 'Izgubljeno',
    poziv: 'Poziv',
    sastanak: 'Sastanak',
    email: 'Email',
    task: 'Task',
    napomena: 'Napomena',
    rad: 'Rad',
    bolovanje: 'Bolovanje',
    godisnji: 'Godišnji',
    sluzbeni_put: 'Službeni put',
    odsustvo: 'Odsustvo',
    aktivan: 'Aktivan',
    zavrsen: 'Završen',
    pauziran: 'Pauziran',
    nizak: 'Nizak',
    srednji: 'Srednji',
    visok: 'Visok',
    hitan: 'Hitan',
    todo: 'To-do',
    u_toku: 'U toku',
    blokirano: 'Blokirano',
    aktivno: 'Aktivno',
    na_popravci: 'Na popravci',
    izvan_upotrebe: 'Izvan upotrebe',
    prodato: 'Prodato',
    otpisano: 'Otpisano',
    odobreno: 'Odobreno',
    isplaceno: 'Isplaćeno',
    dostupno: 'Dostupno',
    iznajmljeno: 'Iznajmljeno',
    na_servisu: 'Na servisu',
    rezervisano: 'Rezervisano',
    rezervacija: 'Rezervacija',
    slobodan: 'Slobodan',
    zauzet: 'Zauzet',
    spremno: 'Spremno',
    usluženo: 'Usluženo',
    plaćeno: 'Plaćeno',
    naručeno: 'Naručeno',
    u_pripremi: 'U pripremi',
    restoran: 'Restoran',
    porudzbina: 'Porudžbina',
    dostava: 'Dostava',
    aktivan_sub: 'Aktivan',
    neaktivan: 'Neaktivan',
    otkazan: 'Otkazan',
    zakazana: 'Zakazana',
    u_toku_mail: 'U toku',
    zavrsena_mail: 'Završena',
    promotivno: 'Promotivno',
    transakciono: 'Transakciono',
    obavestenje: 'Obaveštenje',
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
    pripremljena: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    otpremljena: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    stornirana: 'bg-red-50 text-red-700 border-red-200',
    prijem: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    izdavanje: 'bg-orange-50 text-orange-700 border-orange-200',
    inventura: 'bg-purple-50 text-purple-700 border-purple-200',
    korekcija: 'bg-sky-50 text-sky-700 border-sky-200',
    prihod: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rashod: 'bg-red-50 text-red-700 border-red-200',
    ulaz: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    izlaz: 'bg-orange-50 text-orange-700 border-orange-200',
    izlazna: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ulazna: 'bg-blue-50 text-blue-700 border-blue-200',
    predracun: 'bg-violet-50 text-violet-700 border-violet-200',
    faktura_izlazna: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    faktura_ulazna: 'bg-blue-50 text-blue-700 border-blue-200',
    kasa_ulaz: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    kasa_izlaz: 'bg-orange-50 text-orange-700 border-orange-200',
    nabavka: 'bg-orange-50 text-orange-700 border-orange-200',
    otpremnica: 'bg-teal-50 text-teal-700 border-teal-200',
    lead: 'bg-slate-100 text-slate-700 border-slate-200',
    kvalifikacija: 'bg-blue-50 text-blue-700 border-blue-200',
    predlog: 'bg-amber-50 text-amber-700 border-amber-200',
    pregovaranje: 'bg-orange-50 text-orange-700 border-orange-200',
    won: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    lost: 'bg-red-50 text-red-700 border-red-200',
    aktivan: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    zavrsen: 'bg-blue-50 text-blue-700 border-blue-200',
    pauziran: 'bg-amber-50 text-amber-700 border-amber-200',
    otkazan: 'bg-red-50 text-red-700 border-red-200',
    aktivno: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    na_popravci: 'bg-amber-50 text-amber-700 border-amber-200',
    izvan_upotrebe: 'bg-slate-100 text-slate-700 border-slate-200',
    prodato: 'bg-blue-50 text-blue-700 border-blue-200',
    otpisano: 'bg-red-50 text-red-700 border-red-200',
    nizak: 'bg-slate-100 text-slate-500',
    srednji: 'bg-amber-50 text-amber-600',
    visok: 'bg-orange-50 text-orange-600',
    hitan: 'bg-red-50 text-red-600',
    odobreno: 'bg-blue-50 text-blue-700 border-blue-200',
    isplaceno: 'bg-emerald-50 text-emerald-700 border-emerald-200',
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
