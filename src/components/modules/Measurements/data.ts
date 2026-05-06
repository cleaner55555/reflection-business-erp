import type { Measurement } from './types'

export const INITIAL: Measurement[] = [
  { id: '1', code: 'MER-2024-001', product: 'Osovina fi-25mm', parameter: 'Prečnik', nominalValue: '25.000', unit: 'mm', measuredValue: '25.003', tolerance: '±0.010', deviation: '+0.003', status: 'ok', instrument: 'Mikrometar Mitutoyo 293', operator: 'Marko Petrović', station: 'QC-01', batch: 'LOT-2024-0156', date: '2024-06-15', notes: 'Unutar tolerancije' },
  { id: '2', code: 'MER-2024-002', product: 'Ležajna kućište HK-42', parameter: 'Unutrašnji prečnik', nominalValue: '42.000', unit: 'mm', measuredValue: '42.012', tolerance: '±0.008', deviation: '+0.012', status: 'fail', instrument: 'Mikrometar Mitutoyo 293', operator: 'Jelena Stanković', station: 'QC-02', batch: 'LOT-2024-0157', date: '2024-06-15', notes: 'Prekoračenje tolerancije — odbijeno' },
  { id: '3', code: 'MER-2024-003', product: 'Cev fi-12×1.5m', parameter: 'Debljina zida', nominalValue: '1.500', unit: 'mm', measuredValue: '1.492', tolerance: '±0.015', deviation: '-0.008', status: 'ok', instrument: 'Debljinomer ultrazvučni', operator: 'Nikola Jovanović', station: 'QC-01', batch: 'LOT-2024-0158', date: '2024-06-14', notes: 'Ispitivanje uzorka 3 od 10' },
  { id: '4', code: 'MER-2024-004', product: 'Flanša DN100 PN16', parameter: 'Ravnomernost površine', nominalValue: '0.050', unit: 'mm', measuredValue: '0.046', tolerance: '±0.010', deviation: '-0.004', status: 'ok', instrument: 'Površinski merač', operator: 'Marko Petrović', station: 'QC-03', batch: 'LOT-2024-0160', date: '2024-06-14', notes: '' },
  { id: '5', code: 'MER-2024-005', product: 'Ventil V-50 PN25', parameter: 'Radni pritisak test', nominalValue: '25.0', unit: 'bar', measuredValue: '24.8', tolerance: '±0.5', deviation: '-0.2', status: 'ok', instrument: 'Manometar digitalni', operator: 'Ana Milić', station: 'QC-04', batch: 'LOT-2024-0161', date: '2024-06-13', notes: 'Test na 5 min pod pritiskom' },
  { id: '6', code: 'MER-2024-006', product: 'Zatvarač Z-80', parameter: 'Hod ventila', nominalValue: '45.0', unit: 'mm', measuredValue: '44.2', tolerance: '±1.0', deviation: '-0.8', status: 'warning', instrument: 'Indikator satnji', operator: 'Nikola Jovanović', station: 'QC-02', batch: 'LOT-2024-0162', date: '2024-06-13', notes: 'Blizu donje granice tolerancije — monitoring' },
  { id: '7', code: 'MER-2024-007', product: 'Elektroda E-7018 fi-3.2', parameter: 'Prečnik jezgra', nominalValue: '3.200', unit: 'mm', measuredValue: '—', tolerance: '±0.050', deviation: '—', status: 'pending', instrument: 'Mikrometar Mitutoyo 293', operator: 'Jelena Stanković', station: 'QC-01', batch: 'LOT-2024-0165', date: '2024-06-12', notes: 'Čeka se isporuka instrumenta iz kalibracije' },
  { id: '8', code: 'MER-2024-008', product: 'Čelična ploča 10×1500×3000', parameter: 'Debljina', nominalValue: '10.000', unit: 'mm', measuredValue: '10.15', tolerance: '±0.200', deviation: '+0.150', status: 'ok', instrument: 'Debljinomer digitalni', operator: 'Marko Petrović', station: 'QC-05', batch: 'LOT-2024-0168', date: '2024-06-12', notes: 'Mereno na 5 tačaka — prosečna vrednost' },
  { id: '9', code: 'MER-2024-009', product: 'Pumpa P-65-2.2', parameter: 'Pritisak na izlazu', nominalValue: '6.5', unit: 'bar', measuredValue: '5.9', tolerance: '±0.3', deviation: '-0.6', status: 'fail', instrument: 'Manometar digitalni', operator: 'Ana Milić', station: 'QC-04', batch: 'LOT-2024-0170', date: '2024-06-11', notes: 'Pritisak ispod minimuma — servisna intervencija' },
  { id: '10', code: 'MER-2024-010', product: 'Rukavac RG-32', parameter: 'Spoljašnji prečnik', nominalValue: '32.00', unit: 'mm', measuredValue: '31.98', tolerance: '±0.05', deviation: '-0.02', status: 'ok', instrument: 'Mikrometar Mitutoyo 293', operator: 'Nikola Jovanović', station: 'QC-01', batch: 'LOT-2024-0172', date: '2024-06-11', notes: '' },
]

export const STATUSES: Record<string, { color: string; label: string }> = {
  ok: { color: 'bg-emerald-100 text-emerald-800', label: 'OK' },
  warning: { color: 'bg-amber-100 text-amber-800', label: 'Upozorenje' },
  fail: { color: 'bg-red-100 text-red-800', label: 'Otkaz' },
  pending: { color: 'bg-gray-100 text-gray-800', label: 'Na čekanju' },
}

export const UNITS = ['mm', 'μm', 'bar', 'MPa', '°C', 'kg', 'g', 'l', 'm', 'cm', 'V', 'A', 'Ω', 'Hz']
export const PARAMETERS = ['Prečnik', 'Debljina', 'Dužina', 'Širina', 'Težina', 'Pritisak', 'Temperatura', 'Brzina', 'Hod', 'Ravnomernost', 'Otvrdnuće', 'Čvrstoća', 'Hrapavost', 'Pravilnost']
