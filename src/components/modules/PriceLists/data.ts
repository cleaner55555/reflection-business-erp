import type { PriceListItem } from './types'

export const INITIAL: PriceListItem[] = [
  { id: '1', name: 'Cenovnik veleprodaje — Jun 2024', category: 'Opšti', type: 'wholesale', validFrom: '2024-06-01', validUntil: '2024-06-30', items: 245, status: 'active', createdBy: 'Dragan Milić', notes: 'Ažurirano 01.06. — nove cene za transportne troškove' },
  { id: '2', name: 'Cenovnik maloprodaje — Jun 2024', category: 'Opšti', type: 'retail', validFrom: '2024-06-01', validUntil: '2024-06-30', items: 380, status: 'active', createdBy: 'Dragan Milić', notes: '' },
  { id: '3', name: 'Letnji cenovnik — Promo', category: 'Promocije', type: 'special', validFrom: '2024-06-15', validUntil: '2024-08-31', items: 85, status: 'active', createdBy: 'Ana Nikolić', notes: 'Sezonski popusti do 30%' },
  { id: '4', name: 'Cenovnik B2B — Klijenti', category: 'B2B', type: 'wholesale', validFrom: '2024-05-01', validUntil: '2024-12-31', items: 120, status: 'active', createdBy: 'Milan Ristić', notes: 'Individualni za velike kupce' },
  { id: '5', name: 'Cenovnik veleprodaje — Maj 2024', category: 'Opšti', type: 'wholesale', validFrom: '2024-05-01', validUntil: '2024-05-31', items: 240, status: 'archived', createdBy: 'Dragan Milić', notes: 'Zamijenjen junijskim' },
  { id: '6', name: 'Cenovnik — Novo u asortimanu', category: 'Novi proizvodi', type: 'retail', validFrom: '2024-06-10', validUntil: '2024-07-31', items: 32, status: 'draft', createdBy: 'Jelena Kovačević', notes: 'Čeka odobrenje direktora' },
]

export const STATUSES: Record<string, { color: string; label: string }> = {
  active: { color: 'bg-emerald-100 text-emerald-800', label: 'Aktivan' },
  draft: { color: 'bg-amber-100 text-amber-800', label: 'Nacrt' },
  archived: { color: 'bg-gray-100 text-gray-800', label: 'Arhiviran' },
}
