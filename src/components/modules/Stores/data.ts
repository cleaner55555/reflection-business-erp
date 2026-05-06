import type { StoreItem } from './types'

export const INITIAL: StoreItem[] = [
  { id: '1', name: 'Poslovnica Beograd — Centar', code: 'POS-BG-001', city: 'Beograd', address: 'Knez Mihailova 12', phone: '+381 11 321 4567', email: 'centar@reflection.rs', manager: 'Milan Ristić', type: 'retail', status: 'active', openDate: '2020-03-15', area: 120, employees: 8, monthlyRevenue: 2850000, notes: 'Flagship prodavnica — najveći promet' },
  { id: '2', name: 'Poslovnica Novi Sad', code: 'POS-NS-001', city: 'Novi Sad', address: 'Trg Slobode 7', phone: '+381 21 444 5566', email: 'novisad@reflection.rs', manager: 'Jelena Kovačević', type: 'retail', status: 'active', openDate: '2021-06-01', area: 85, employees: 5, monthlyRevenue: 1450000, notes: '' },
  { id: '3', name: 'Poslovnica Niš', code: 'POS-NI-001', city: 'Niš', address: 'Kopitareva 5', phone: '+381 18 222 3333', email: 'nis@reflection.rs', manager: 'Nenad Stanković', type: 'retail', status: 'active', openDate: '2022-01-10', area: 75, employees: 4, monthlyRevenue: 980000, notes: '' },
  { id: '4', name: 'Magacin Beograd — Surčin', code: 'MAG-BG-001', city: 'Beograd', address: 'Industrijska zona bb', phone: '+381 11 555 6666', email: 'magacin@reflection.rs', manager: 'Ivan Savić', type: 'warehouse', status: 'active', openDate: '2019-09-01', area: 500, employees: 12, monthlyRevenue: 0, notes: 'Centralni magacin — distribucija za sve prodavnice' },
  { id: '5', name: 'Fabrika Beograd — Rakovica', code: 'FAB-BG-001', city: 'Beograd', address: 'Industrijska 45', phone: '+381 11 777 8888', email: 'fabrika@reflection.rs', manager: 'Goran Đorđević', type: 'factory', status: 'active', openDate: '2018-05-20', area: 2000, employees: 45, monthlyRevenue: 0, notes: 'Proizvodnja — 3 linije' },
  { id: '6', name: 'Poslovnica Kragujevac', code: 'POS-KG-001', city: 'Kragujevac', address: 'Kralja Petra I 22', phone: '+381 34 333 4444', email: 'kragujevac@reflection.rs', manager: 'Ana Đurić', type: 'retail', status: 'renovation', openDate: '2023-03-01', area: 60, employees: 3, monthlyRevenue: 0, notes: 'Renoviranje do 01.08.2024 — otvaranje sa novim asortimanom' },
  { id: '7', name: 'Poslovnica Subotica — Zatvorena', code: 'POS-SB-001', city: 'Subotica', address: 'Trg Cara Jovana Nenada 8', phone: '', email: '', manager: '', type: 'retail', status: 'closed', openDate: '2021-09-15', area: 55, employees: 0, monthlyRevenue: 0, notes: 'Zatvorena 31.12.2023 — niska rentabilnost' },
  { id: '8', name: 'Biro Beograd — Stari Grad', code: 'BIR-BG-001', city: 'Beograd', address: 'Čika Ljubina 18', phone: '+381 11 888 9999', email: 'biro@reflection.rs', manager: 'Dragan Milić', type: 'office', status: 'active', openDate: '2018-01-15', area: 200, employees: 25, monthlyRevenue: 0, notes: 'Centrala — administracija, HR, finansije' },
]

export const TYPES: Record<string, string> = {
  retail: 'Prodavnica', warehouse: 'Magacin', office: 'Biro', factory: 'Fabrika',
}

export const STATUSES: Record<string, { color: string; label: string }> = {
  active: { color: 'bg-emerald-100 text-emerald-800', label: 'Aktivna' },
  closed: { color: 'bg-red-100 text-red-800', label: 'Zatvorena' },
  renovation: { color: 'bg-amber-100 text-amber-800', label: 'Renoviranje' },
}
