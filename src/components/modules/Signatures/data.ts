export const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Na čekanju', color: 'bg-amber-100 text-amber-700' },
  signed: { label: 'Potpisano', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Odbijeno', color: 'bg-red-100 text-red-700' },
  expired: { label: 'Isteklo', color: 'bg-gray-100 text-gray-700' },
}

export const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Nizak', color: 'bg-gray-100 text-gray-700' },
  medium: { label: 'Srednji', color: 'bg-amber-100 text-amber-700' },
  high: { label: 'Visok', color: 'bg-red-100 text-red-700' },
}

export const typeLabels: Record<string, string> = {
  contract: 'Ugovor',
  nda: 'NDA',
  invoice: 'Faktura',
  proposal: 'Predlog',
  policy: 'Pravilnik',
  other: 'Ostalo',
}

export const { activeCompanyId } = useAppStore();
