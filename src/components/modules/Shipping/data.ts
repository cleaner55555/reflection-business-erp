export const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  nacrt: { label: 'Nacrt', color: 'bg-gray-100 text-gray-700', icon: FileText },
  cekanje_preuzimanja: { label: 'Čeka preuzimanje', color: 'bg-amber-100 text-amber-700', icon: Clock },
  preuzeto: { label: 'Preuzeto', color: 'bg-blue-100 text-blue-700', icon: Package },
  u_tranzitu: { label: 'U tranzitu', color: 'bg-sky-100 text-sky-700', icon: Truck },
  isporuceno: { label: 'Isporučeno', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  vraceno: { label: 'Vraćeno', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  otkazano: { label: 'Otkazano', color: 'bg-orange-100 text-orange-700', icon: X },
}

export const carrierTypeLabels: Record<string, string> = {
  domestic: 'Domaći',
  regional: 'Regionalni',
  international: 'Međunarodni',
}

export const formatCurrency = (val: number) => `${val.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD`;

export const { activeCompanyId } = useAppStore();
