export const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Na čekanju', color: 'bg-amber-100 text-amber-700' },
  contacted: { label: 'Kontaktiran', color: 'bg-blue-100 text-blue-700' },
  converted: { label: 'Konvertovan', color: 'bg-green-100 text-green-700' },
  expired: { label: 'Istekao', color: 'bg-gray-100 text-gray-700' },
}

export const sourceLabels: Record<string, string> = {
  email: 'Email',
  phone: 'Telefon',
  social: 'Društvene mreže',
  direct: 'Lično',
  website: 'Veb sajt',
}

export const formatCurrency = (val: number) => `${val.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD`;

export const { activeCompanyId } = useAppStore();
