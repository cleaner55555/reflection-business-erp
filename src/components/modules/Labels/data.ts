import type { LabelItem } from './types'

export const INITIAL: LabelItem[] = [
  { id: '1', name: 'Etiketa — Kafa Premium 250g', sku: 'ETK-KAF-001', category: 'product', status: 'active', size: '80x50mm', material: 'Samolepljiva', color: 'Bela', quantity: 5000, costPerUnit: 2.5, printDate: '2024-06-10', notes: 'Logo + sastojci + RSD cena + barkod' },
  { id: '2', name: 'Etiketa — Čaj Zeleni 100g', sku: 'ETK-CAJ-002', category: 'product', status: 'active', size: '60x40mm', material: 'Samolepljiva', color: 'Bela', quantity: 3000, costPerUnit: 1.8, printDate: '2024-06-10', notes: '' },
  { id: '3', name: 'Transportna etiketa — Standard', sku: 'ETK-TRN-001', category: 'shipping', status: 'active', size: '100x60mm', material: 'Standardni papir', color: 'Bela', quantity: 10000, costPerUnit: 1.2, printDate: '2024-06-05', notes: 'Ime primaoca, adresa, barkod' },
  { id: '4', name: 'Promo etiketa — Letnja akcija', sku: 'ETK-PRO-001', category: 'promotion', status: 'active', size: '90x60mm', material: 'Glossy', color: 'Žuta', quantity: 2000, costPerUnit: 3.5, printDate: '2024-06-12', notes: 'Popust 30% — letnja kampanja' },
  { id: '5', name: 'Upozorenje — Čuva se od dece', sku: 'ETK-UPO-001', category: 'warning', status: 'active', size: '100x70mm', material: 'Vinil', color: 'Crveno-bela', quantity: 500, costPerUnit: 5.0, printDate: '2024-05-20', notes: 'Za staklene boce' },
  { id: '6', name: 'Cenovnik — Kafe bar', sku: 'ETK-CEN-001', category: 'price', status: 'active', size: 'A5', material: 'Običan papir', color: 'Bezboj', quantity: 50, costPerUnit: 15, printDate: '2024-06-01', notes: 'Stoni cenovnik — obnovljen mesečno' },
  { id: '7', name: 'QR kod — Jelovnik', sku: 'ETK-QR-001', category: 'qr', status: 'inactive', size: '40x40mm', material: 'Vinil', color: 'Crna', quantity: 20, costPerUnit: 4.0, printDate: '2024-03-15', notes: 'Link ka digitalnom jelovniku — zamijenjen novim dizajnom' },
  { id: '8', name: 'Barkod — Univerzalni EAN-13', sku: 'ETK-BRK-001', category: 'barcode', status: 'active', size: '40x25mm', material: 'Samolepljiva', color: 'Bela', quantity: 8000, costPerUnit: 0.8, printDate: '2024-06-14', notes: 'Za sve proizvode sa barkodom' },
]

export const CATEGORIES: Record<string, string> = { product: 'Proizvod', shipping: 'Transport', promotion: 'Promocija', barcode: 'Barkod', qr: 'QR kod', price: 'Cena', warning: 'Upozorenje', ingredient: 'Sastojci' }

export const STATUSES: Record<string, { color: string; label: string }> = {
  active: { color: 'bg-emerald-100 text-emerald-800', label: 'Aktivna' },
  inactive: { color: 'bg-gray-100 text-gray-800', label: 'Neaktivna' },
}
