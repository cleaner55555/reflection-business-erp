export const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-700' },
  open: { label: 'Otvoren', color: 'bg-green-100 text-green-700' },
  paused: { label: 'Pauziran', color: 'bg-amber-100 text-amber-700' },
  closed: { label: 'Zatvoren', color: 'bg-red-100 text-red-700' },
}

export const typeLabels: Record<string, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Ugovor',
  internship: 'Praksa',
  remote: 'Remote',
}

export const { activeCompanyId } = useAppStore();
