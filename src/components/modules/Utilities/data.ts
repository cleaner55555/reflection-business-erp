import type { Utility } from './types'

export const INITIAL: Utility[] = [
  { id: '1', name: 'Struja — Glavna zgrada', provider: 'EPS Distribucija', accountNo: 'EPS-2024-00123', type: 'electricity', status: 'active', monthlyAmount: 35000, lastReading: 45678, lastReadingDate: '2024-06-01', lastBillDate: '2024-06-05', lastBillAmount: 38500, dueDate: '2024-06-20', paidDate: '2024-06-18', location: 'Glavna zgrada — priključak 1', notes: '' },
  { id: '2', name: 'Voda — Glavna zgrada', provider: 'Beogradski vodovod', accountNo: 'BV-2024-04567', type: 'water', status: 'active', monthlyAmount: 8500, lastReading: 1234, lastReadingDate: '2024-06-01', lastBillDate: '2024-06-08', lastBillAmount: 7200, dueDate: '2024-06-25', paidDate: '', location: 'Glavna zgrada — priključak 2', notes: 'Zimski period — manja potrošnja' },
  { id: '3', name: 'Gas — Magacin', provider: 'Srbijagas', accountNo: 'SG-2024-07890', type: 'gas', status: 'overdue', monthlyAmount: 18000, lastReading: 8901, lastReadingDate: '2024-05-01', lastBillDate: '2024-05-28', lastBillAmount: 22000, dueDate: '2024-06-10', paidDate: '', location: 'Magacin B — priključak 1', notes: 'Kasni sa plaćanjem — kažnjeni kamatama' },
  { id: '4', name: 'Internet + TV — Biro', provider: 'SBB', accountNo: 'SBB-2024-11223', type: 'internet', status: 'active', monthlyAmount: 4500, lastReading: 0, lastReadingDate: '', lastBillDate: '2024-06-01', lastBillAmount: 4500, dueDate: '2024-06-15', paidDate: '2024-06-12', location: 'Biro — 3. sprat', notes: '100/10 Mbps + TV paket' },
  { id: '5', name: 'Telefon — Kancelarija', provider: 'mts Business', accountNo: 'MTS-2024-33445', type: 'phone', status: 'active', monthlyAmount: 3200, lastReading: 0, lastReadingDate: '', lastBillDate: '2024-06-01', lastBillAmount: 3200, dueDate: '2024-06-15', paidDate: '2024-06-14', location: 'Kancelarija — 2. sprat', notes: 'Fiksni + 4 mobilna broja' },
  { id: '6', name: 'Grejanje — Depo', provider: 'Beogradske elektrane', accountNo: 'BE-2024-55667', type: 'heating', status: 'disconnected', monthlyAmount: 0, lastReading: 0, lastReadingDate: '2024-04-01', lastBillDate: '2024-04-10', lastBillAmount: 0, dueDate: '', paidDate: '2024-04-08', location: 'Depo — sezonski', notes: 'Sezonski — uključeno novembar-mart' },
  { id: '7', name: 'Komunalni otpad', provider: 'Gradska čistoća', accountNo: 'GC-2024-88901', type: 'waste', status: 'active', monthlyAmount: 5500, lastReading: 0, lastReadingDate: '', lastBillDate: '2024-06-01', lastBillAmount: 5500, dueDate: '2024-06-20', paidDate: '', location: 'Sve lokacije', notes: '5 kontejnera' },
  { id: '8', name: 'Struja — Magacin B', provider: 'EPS Distribucija', accountNo: 'EPS-2024-22334', type: 'electricity', status: 'pending', monthlyAmount: 15000, lastReading: 22100, lastReadingDate: '2024-06-05', lastBillDate: '', lastBillAmount: 0, dueDate: '', paidDate: '', location: 'Magacin B — priključak 1', notes: 'Novi priključak — čeka se EPS aktivanje' },
]

export const TYPES: Record<string, string> = {
  electricity: 'Struja', water: 'Voda', gas: 'Gas', heating: 'Grejanje', internet: 'Internet', phone: 'Telefon', waste: 'Otpad', tv: 'TV',
}

export const STATUSES: Record<string, { color: string; label: string }> = {
  active: { color: 'bg-emerald-100 text-emerald-800', label: 'Aktivan' },
  disconnected: { color: 'bg-gray-100 text-gray-800', label: 'Isključeno' },
  overdue: { color: 'bg-red-100 text-red-800', label: 'Kasni' },
  pending: { color: 'bg-amber-100 text-amber-800', label: 'Na čekanju' },
}
