export const ENTITY_ICONS: Record<string, any> = {
  partners: Users,
  products: Package,
  invoices: FileText,
  contacts: Contact,
  categories: FolderTree,
  invoice_items: FileText,
}

export const ENTITY_COLORS: Record<string, string> = {
  partners: 'bg-amber-50 text-amber-700 border-amber-200',
  products: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  invoices: 'bg-blue-50 text-blue-700 border-blue-200',
  contacts: 'bg-purple-50 text-purple-700 border-purple-200',
  categories: 'bg-rose-50 text-rose-700 border-rose-200',
  invoice_items: 'bg-sky-50 text-sky-700 border-sky-200',
}

export const ENTITY_OPTIONS = [
  { value: 'partners', label: 'Partners' },
  { value: 'products', label: 'Products' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'contacts', label: 'Contacts' },
  { value: 'categories', label: 'Categories' },
]
