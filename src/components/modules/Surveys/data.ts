export const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-700' },
  active: { label: 'Aktivna', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Zatvorena', color: 'bg-amber-100 text-amber-700' },
  archived: { label: 'Arhivirana', color: 'bg-gray-200 text-gray-500' },
}

export const questionTypeConfig: Record<string, { label: string }> = {
  text: { label: 'Tekst' },
  textarea: { label: 'Dugi tekst' },
  single_choice: { label: 'Jedan odgovor' },
  multiple_choice: { label: 'Više odgovora' },
  rating: { label: 'Ocena (1-5)' },
  nps: { label: 'NPS (0-10)' },
  date: { label: 'Datum' },
  email: { label: 'Email' },
}

export const { activeCompanyId } = useAppStore();
