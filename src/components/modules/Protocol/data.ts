export const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  primljen: { label: 'Primljen', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  u_radu: { label: 'U radu', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  završen: { label: 'Završen', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  proslijeđen: { label: 'Proslijeđen', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  odgovoren: { label: 'Odgovoren', className: 'bg-green-50 text-green-700 border-green-200' },
}

export const PRIORITY_CONFIG: Record<string, { label: string; className: string }> = {
  nizak: { label: 'Nizak', className: 'bg-muted text-muted-foreground' },
  srednji: { label: 'Srednji', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  visok: { label: 'Visok', className: 'bg-orange-50 text-orange-600 border-orange-200' },
  hitan: { label: 'Hitan', className: 'bg-red-50 text-red-600 border-red-200' },
}

export const DOC_TYPES: Record<string, string> = {
  pismo: 'Pismo',
  ugovor: 'Ugovor',
  ponuda: 'Ponuda',
  račun: 'Račun',
  rešenje: 'Rešenje',
  ostalo: 'Ostalo',
}

export const EMPTY_FORM: FormData = {
  direction: 'ulaz',
  sender: '',
  recipient: '',
  subject: '',
  description: '',
  documentType: '',
  dueDate: '',
  responsible: '',
  status: 'primljen',
  priority: 'srednji',
  notes: '',
}
