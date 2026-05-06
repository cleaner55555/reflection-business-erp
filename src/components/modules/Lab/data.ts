import type { LabEquipment } from './types'

export const INITIAL: LabEquipment[] = [
  { id: '1', inventoryNo: 'INV-LAB-001', name: 'Mikrometar digitalni', category: 'measurement', manufacturer: 'Mitutoyo', model: '293-340-30', serialNo: 'MT-2022-4456', location: 'B-105 Kabinet 3', status: 'operational', purchaseDate: '2022-03-15', purchasePrice: 85000, lastCalibration: '2024-05-10', nextCalibration: '2024-11-10', responsible: 'Prof. Snežana Đorđević', condition: 'excellent', notes: 'Kalibracija svakih 6 meseci' },
  { id: '2', inventoryNo: 'INV-LAB-002', name: 'Osciloskop digitalni 4-kanalni', category: 'electrical', manufacturer: 'Keysight', model: 'DSOX1104G', serialNo: 'KS-2023-7821', location: 'B-105 Radni sto 1', status: 'operational', purchaseDate: '2023-01-20', purchasePrice: 320000, lastCalibration: '2024-04-15', nextCalibration: '2025-04-15', responsible: 'Nenad Stojanović', condition: 'excellent', notes: '100MHz, 4 kanala' },
  { id: '3', inventoryNo: 'INV-LAB-003', name: 'Spektrofotometar UV-Vis', category: 'optical', manufacturer: 'Shimadzu', model: 'UV-1800', serialNo: 'SH-2021-3312', location: 'B-106 Stol 2', status: 'calibration', purchaseDate: '2021-09-10', purchasePrice: 750000, lastCalibration: '2024-03-01', nextCalibration: '2024-09-01', responsible: 'Prof. Goran Savić', condition: 'good', notes: 'Na kalibraciji — povratak 20.06.' },
  { id: '4', inventoryNo: 'INV-LAB-004', name: 'pH metar digitalni', category: 'chemical', manufacturer: 'Hanna Instruments', model: 'HI-5222', serialNo: 'HI-2022-5567', location: 'B-106 Stol 1', status: 'operational', purchaseDate: '2022-06-05', purchasePrice: 45000, lastCalibration: '2024-06-01', nextCalibration: '2024-07-01', responsible: 'Prof. Goran Savić', condition: 'good', notes: 'Mesečna kalibracija elektrode' },
  { id: '5', inventoryNo: 'INV-LAB-005', name: 'Univerzalna mašina za ispitivanje', category: 'mechanical', manufacturer: 'Instron', model: '3369', serialNo: 'IN-2020-8890', location: 'D-301 Zona A', status: 'maintenance', purchaseDate: '2020-02-15', purchasePrice: 2800000, lastCalibration: '2024-01-20', nextCalibration: '2025-01-20', responsible: 'Miodrag Petrović', condition: 'fair', notes: 'Zamena hidrauličnog ulja — servis u toku' },
  { id: '6', inventoryNo: 'INV-LAB-006', name: 'Mikroskop binokularni', category: 'optical', manufacturer: 'Zeiss', model: 'Stemi 508', serialNo: 'ZS-2021-2234', location: 'B-106 Stol 3', status: 'operational', purchaseDate: '2021-11-20', purchasePrice: 180000, lastCalibration: '2024-05-15', nextCalibration: '2025-05-15', responsible: 'Prof. Snežana Đorđević', condition: 'excellent', notes: 'Povećanje 7x-40x' },
  { id: '7', inventoryNo: 'INV-LAB-007', name: 'Multimer digitalni', category: 'electrical', manufacturer: 'Fluke', model: '87V', serialNo: 'FK-2023-1145', location: 'B-105 Ormar 2', status: 'operational', purchaseDate: '2023-04-10', purchasePrice: 35000, lastCalibration: '2024-06-05', nextCalibration: '2024-12-05', responsible: 'Nenad Stojanović', condition: 'excellent', notes: '' },
  { id: '8', inventoryNo: 'INV-LAB-008', name: 'Centrifuga laboratorijska', category: 'mechanical', manufacturer: 'Eppendorf', model: '5430R', serialNo: 'EP-2022-6678', location: 'B-106 Pult', status: 'out_of_order', purchaseDate: '2022-08-25', purchasePrice: 420000, lastCalibration: '2024-02-10', nextCalibration: '2024-08-10', responsible: 'Prof. Goran Savić', condition: 'poor', notes: 'Kvar na motoru — čeka se rezervni deo' },
  { id: '9', inventoryNo: 'INV-LAB-009', name: 'Termometar infracrveni', category: 'digital', manufacturer: 'Fluke', model: '62 MAX', serialNo: 'FK-2023-9012', location: 'B-105 Ormar 1', status: 'operational', purchaseDate: '2023-05-15', purchasePrice: 22000, lastCalibration: '2024-04-20', nextCalibration: '2025-04-20', responsible: 'Prof. Snežana Đorđević', condition: 'good', notes: '' },
  { id: '10', inventoryNo: 'INV-LAB-010', name: 'Analitička vaga', category: 'measurement', manufacturer: 'Mettler Toledo', model: 'XS205', serialNo: 'MT-2020-3456', location: 'B-106 Stol 4', status: 'stored', purchaseDate: '2020-07-10', purchasePrice: 550000, lastCalibration: '2024-03-15', nextCalibration: '2024-09-15', responsible: 'Prof. Goran Savić', condition: 'good', notes: 'U skladištu do septembra — obnova laboratorije' },
]

export const STATUSES: Record<string, { color: string; label: string }> = {
  operational: { color: 'bg-emerald-100 text-emerald-800', label: 'Operativan' },
  calibration: { color: 'bg-blue-100 text-blue-800', label: 'Kalibracija' },
  maintenance: { color: 'bg-amber-100 text-amber-800', label: 'Održavanje' },
  out_of_order: { color: 'bg-red-100 text-red-800', label: 'Kvar' },
  stored: { color: 'bg-gray-100 text-gray-800', label: 'U skladištu' },
}

export const CATEGORIES: Record<string, { label: string }> = {
  measurement: { label: 'Merni' },
  optical: { label: 'Optički' },
  electrical: { label: 'Električni' },
  chemical: { label: 'Hemijski' },
  mechanical: { label: 'Mehanički' },
  digital: { label: 'Digitalni' },
}

export const CONDITIONS: Record<string, { color: string; label: string }> = {
  excellent: { color: 'bg-emerald-100 text-emerald-800', label: 'Odlično' },
  good: { color: 'bg-blue-100 text-blue-800', label: 'Dobro' },
  fair: { color: 'bg-amber-100 text-amber-800', label: 'Zadovoljavajuće' },
  poor: { color: 'bg-red-100 text-red-800', label: 'Loše' },
}

export function formatPrice(p: number) {
  return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 0 }).format(p)
}
