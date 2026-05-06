export const ACTION_ICONS: Record<string, React.ElementType> = {
  create: PlusCircle,
  update: FileEdit,
  delete: Trash,
  login: Activity,
  logout: Activity,
}

export const ACTION_COLORS: Record<string, string> = {
  create: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  update: 'bg-amber-100 text-amber-700 border-amber-200',
  delete: 'bg-red-100 text-red-700 border-red-200',
  login: 'bg-sky-100 text-sky-700 border-sky-200',
  logout: 'bg-slate-100 text-slate-600 border-slate-200',
  read: 'bg-violet-100 text-violet-700 border-violet-200',
  export: 'bg-teal-100 text-teal-700 border-teal-200',
  import: 'bg-indigo-100 text-indigo-700 border-indigo-200',
}

export const ENTITY_LABELS: Record<string, string> = {
  invoice: 'Faktura',
  partner: 'Partner',
  product: 'Proizvod',
  journal_entry: 'Nalog knjiženja',
  account: 'Konto',
  employee: 'Zaposleni',
  payroll: 'Plata',
  project: 'Projekat',
  task: 'Zadatak',
  deal: 'Poslovna prilika',
  contact: 'Kontakt',
  stock_movement: 'Kretanje zaliha',
  purchase_order: 'Narudžbenica',
  delivery_note: 'Otpremnica',
  crm_activity: 'CRM aktivnost',
  user: 'Korisnik',
  role: 'Uloga',
  company: 'Kompanija',
  budget: 'Budžet',
  asset: 'Osnovno sredstvo',
  document: 'Dokument',
  webhook: 'Webhook',
  api_key: 'API ključ',
  settings: 'Podešavanja',
}

export const ACTION_LABELS: Record<string, string> = {
  create: 'Kreiranje',
  update: 'Izmena',
  delete: 'Brisanje',
  read: 'Čitanje',
  login: 'Prijava',
  logout: 'Odjava',
  export: 'Izvoz',
  import: 'Uvoz',
  approve: 'Odobrenje',
  reject: 'Odbijanje',
  close: 'Zatvaranje',
  send: 'Slanje',
  reconcile: 'Usklađivanje',
}

export const activeCompanyId = useAppStore((s) => s.activeCompanyId);

export const pageSize = 50;

export const params = new URLSearchParams();
