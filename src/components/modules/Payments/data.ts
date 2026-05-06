import type { Payment } from './types'

export const INITIAL: Payment[] = [
  { id: '1', invoiceNo: 'Fak-2024-001', client: 'Fabrika "Zvezda"', amount: 185000, currency: 'RSD', date: '2024-06-14', dueDate: '2024-06-28', paidDate: '2024-06-25', method: 'bank_transfer', status: 'paid', reference: 'REF-2024-11111', category: 'invoice', notes: 'Za narudžbu NAR-2024-001 — plaćeno na vreme' },
  { id: '2', invoiceNo: 'Fak-2024-002', client: 'IT Solutions DOO', amount: 285000, currency: 'RSD', date: '2024-06-16', dueDate: '2024-06-30', paidDate: '', method: 'bank_transfer', status: 'pending', reference: 'REF-2024-22222', category: 'invoice', notes: '' },
  { id: '3', invoiceNo: 'Fak-2024-003', client: 'SBB DOO', amount: 45000, currency: 'RSD', date: '2024-06-15', dueDate: '2024-06-29', paidDate: '', method: 'bank_transfer', status: 'pending', reference: 'REF-2024-33333', category: 'supplier', notes: 'Papir — 30 dana rok' },
  { id: '4', invoiceNo: 'PLA-2024-006', client: 'Zaposleni (20)', amount: 1250000, currency: 'RSD', date: '2024-06-01', dueDate: '2024-06-30', paidDate: '2024-06-01', method: 'bank_transfer', status: 'paid', reference: '', category: 'salary', notes: 'Junski plaćeni — 20 zaposlenih' },
  { id: '5', invoiceNo: 'IZN-2024-003', client: 'Dragan Milić', amount: 800, currency: 'EUR', date: '2024-06-01', dueDate: '2024-06-01', paidDate: '2024-06-01', method: 'standing_order', status: 'paid', reference: '', category: 'rent', notes: 'Kirija za jun — stalni nalog' },
  { id: '6', invoiceNo: 'KOM-2024-006', client: 'EPS Distribucija', amount: 38500, currency: 'RSD', date: '2024-06-05', dueDate: '2024-06-20', paidDate: '2024-06-18', method: 'bank_transfer', status: 'paid', reference: 'INV-2024-44444', category: 'utility', notes: 'Struja za jun' },
  { id: '7', invoiceNo: 'Fak-2024-004', client: 'Restoran "Kafana"', amount: 32000, currency: 'RSD', date: '2024-06-15', dueDate: '2024-06-22', paidDate: '', method: 'cash', status: 'overdue', reference: '', category: 'supplier', notes: 'Kasni — 7 dana kasni' },
  { id: '8', invoiceNo: 'Fak-2024-005', client: 'Poslovnica Novi Sad', amount: 145000, currency: 'RSD', date: '2024-06-10', dueDate: '2024-06-24', paidDate: '2024-06-22', method: 'bank_transfer', status: 'paid', reference: 'REF-2024-55555', category: 'invoice', notes: '' },
]

export const STATUSES: Record<string, { color: string; label: string }> = {
  paid: { color: 'bg-emerald-100 text-emerald-800', label: 'Plaćeno' },
  pending: { color: 'bg-amber-100 text-amber-800', label: 'Na čekanju' },
  overdue: { color: 'bg-red-100 text-red-800', label: 'Kasni' },
  partial: { color: 'bg-blue-100 text-blue-800', label: 'Delimično' },
  cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Otkazan' },
}

export const CATEGORIES: Record<string, string> = {
  invoice: 'Faktura', salary: 'Plata', rent: 'Kirija', supplier: 'Dobavljač', utility: 'Komunalije', other: 'Ostalo',
}
