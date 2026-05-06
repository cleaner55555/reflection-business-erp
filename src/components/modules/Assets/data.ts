export const STATUS_LABELS: Record<string, string> = {
  aktivno: 'Aktivno', na_popravci: 'Na popravci', izvan_upotrebe: 'Izvan upotrebe', prodato: 'Prodato', otpisano: 'Otpisano',
}

export const STATUS_COLORS: Record<string, string> = {
  aktivno: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  na_popravci: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  izvan_upotrebe: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  prodato: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  otpisano: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export const CATEGORIES = [
  { value: 'IT oprema', icon: Laptop, color: 'bg-blue-50 text-blue-600' },
  { value: 'Vozila', icon: Car, color: 'bg-emerald-50 text-emerald-600' },
  { value: 'Mašine i oprema', icon: Cpu, color: 'bg-purple-50 text-purple-600' },
  { value: 'Nameštaj', icon: Sofa, color: 'bg-amber-50 text-amber-600' },
  { value: 'Pokućinstva', icon: Building, color: 'bg-teal-50 text-teal-600' },
  { value: 'Alati', icon: Wrench, color: 'bg-red-50 text-red-600' },
  { value: 'Vozni park', icon: Truck, color: 'bg-orange-50 text-orange-600' },
  { value: 'Bezbednost', icon: Shield, color: 'bg-slate-100 text-slate-600' },
  { value: 'Ostalo', icon: Package, color: 'bg-gray-50 text-gray-600' },
]

export const formatCurrency = (val: number) => formatRSD(val);

export const { activeCompanyId } = useAppStore();
