export const VEHICLE_STATUS_BADGES: Record<string, string> = {
  dostupno: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  iznajmljeno: 'bg-amber-50 text-amber-700 border-amber-200',
  na_servisu: 'bg-red-50 text-red-700 border-red-200',
  rezervisano: 'bg-blue-50 text-blue-700 border-blue-200',
  prodato: 'bg-slate-100 text-slate-500 border-slate-200',
}

export const VEHICLE_STATUS_LABELS: Record<string, string> = {
  dostupno: 'Dostupno',
  iznajmljeno: 'Iznajmljeno',
  na_servisu: 'Na servisu',
  rezervisano: 'Rezervisano',
  prodato: 'Prodato',
}

export const RENTAL_STATUS_BADGES: Record<string, string> = {
  rezervacija: 'bg-blue-50 text-blue-700 border-blue-200',
  aktivna: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  zavrsena: 'bg-slate-100 text-slate-600 border-slate-200',
  otkazana: 'bg-red-50 text-red-700 border-red-200',
}

export const RENTAL_STATUS_LABELS: Record<string, string> = {
  rezervacija: 'Rezervacija',
  aktivna: 'Aktivna',
  zavrsena: 'Završena',
  otkazana: 'Otkazana',
}

export const FUEL_TYPE_LABELS: Record<string, string> = {
  dizel: 'Dizel',
  benzin: 'Benzin',
  gas: 'Gas',
  hibrid: 'Hibrid',
  elektricni: 'Električni',
}

export const FUEL_TYPE_BADGES: Record<string, string> = {
  dizel: 'bg-slate-100 text-slate-700 border-slate-200',
  benzin: 'bg-amber-50 text-amber-700 border-amber-200',
  gas: 'bg-blue-50 text-blue-700 border-blue-200',
  hibrid: 'bg-green-50 text-green-700 border-green-200',
  elektricni: 'bg-purple-50 text-purple-700 border-purple-200',
}

export const TRANSMISSION_LABELS: Record<string, string> = {
  automatski: 'Automatski',
  manualni: 'Manuelni',
}
