import type { Tuition } from './types'

export const INITIAL: Tuition[] = [
  { id: '1', student: 'Luka Petrović', indexNo: '2023/001', program: 'Elektrotehnika', year: 2, semester: 4, amount: 85000, paidAmount: 85000, status: 'paid', dueDate: '2024-03-15', paidDate: '2024-03-10', paymentMethod: 'bank_transfer', receiptNo: 'RAC-2024-0456', installments: 1, currentInstallment: 1, discount: 0, notes: '' },
  { id: '2', student: 'Ana Stanković', indexNo: '2022/015', program: 'Ekonomija', year: 3, semester: 5, amount: 92000, paidAmount: 46000, status: 'partial', dueDate: '2024-04-01', paidDate: '2024-03-28', paymentMethod: 'bank_transfer', receiptNo: 'RAC-2024-0512', installments: 2, currentInstallment: 1, discount: 0, notes: 'Druga rata do 01.07.' },
  { id: '3', student: 'Marko Jovanović', indexNo: '2023/023', program: 'Mašinstvo', year: 1, semester: 2, amount: 78000, paidAmount: 0, status: 'unpaid', dueDate: '2024-06-15', paidDate: '', paymentMethod: 'cash', receiptNo: '', installments: 1, currentInstallment: 0, discount: 0, notes: '' },
  { id: '4', student: 'Jelena Nikolić', indexNo: '2021/008', program: 'Medicina', year: 4, semester: 7, amount: 180000, paidAmount: 180000, status: 'scholarship', dueDate: '2024-03-01', paidDate: '2024-02-25', paymentMethod: 'scholarship', receiptNo: 'RAC-2024-0398', installments: 1, currentInstallment: 1, discount: 100, notes: 'Republička stipendija za studente genijalce' },
  { id: '5', student: 'Nikola Milić', indexNo: '2022/031', program: 'Informatika', year: 3, semester: 5, amount: 95000, paidAmount: 0, status: 'overdue', dueDate: '2024-04-15', paidDate: '', paymentMethod: 'card', receiptNo: '', installments: 1, currentInstallment: 0, discount: 0, notes: 'Podsetnik poslat 20.05. — kontaktirana studentska služba' },
  { id: '6', student: 'Sara Đorđević', indexNo: '2024/002', program: 'Arhitektura', year: 1, semester: 1, amount: 105000, paidAmount: 94500, status: 'paid', dueDate: '2024-09-15', paidDate: '2024-09-01', paymentMethod: 'bank_transfer', receiptNo: 'RAC-2024-0890', installments: 1, currentInstallment: 1, discount: 10, notes: '10% popust za rano upisivanje' },
  { id: '7', student: 'Ivan Savić', indexNo: '2021/042', program: 'Pravo', year: 4, semester: 8, amount: 88000, paidAmount: 0, status: 'exempt', dueDate: '', paidDate: '', paymentMethod: 'exempt', receiptNo: '', installments: 0, currentInstallment: 0, discount: 100, notes: 'Ostvario pravo na besplatne studije — prosečna ocena 9.85' },
  { id: '8', student: 'Maja Stojanović', indexNo: '2023/056', program: 'Psihologija', year: 2, semester: 3, amount: 82000, paidAmount: 27333, status: 'partial', dueDate: '2024-05-01', paidDate: '2024-05-01', paymentMethod: 'card', receiptNo: 'RAC-2024-0634', installments: 3, currentInstallment: 1, discount: 0, notes: 'Rata 2/3 do 01.08., rata 3/3 do 01.11.' },
  { id: '9', student: 'Stefan Ilić', indexNo: '2022/019', program: 'Građevinarstvo', year: 2, semester: 4, amount: 80000, paidAmount: 80000, status: 'paid', dueDate: '2024-03-20', paidDate: '2024-03-18', paymentMethod: 'cash', receiptNo: 'RAC-2024-0478', installments: 1, currentInstallment: 1, discount: 0, notes: '' },
  { id: '10', student: 'Milica Marković', indexNo: '2024/011', program: 'Farmacija', year: 1, semester: 2, amount: 130000, paidAmount: 0, status: 'unpaid', dueDate: '2024-06-20', paidDate: '', paymentMethod: 'bank_transfer', receiptNo: '', installments: 1, currentInstallment: 0, discount: 0, notes: '' },
]

export const STATUSES: Record<string, { color: string; label: string }> = {
  paid: { color: 'bg-emerald-100 text-emerald-800', label: 'Plaćena' },
  partial: { color: 'bg-amber-100 text-amber-800', label: 'Delimično' },
  unpaid: { color: 'bg-gray-100 text-gray-800', label: 'Neplaćena' },
  overdue: { color: 'bg-red-100 text-red-800', label: 'Kasni' },
  scholarship: { color: 'bg-purple-100 text-purple-800', label: 'Stipendija' },
  exempt: { color: 'bg-teal-100 text-teal-800', label: 'Otpust' },
}
