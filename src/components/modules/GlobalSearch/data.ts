export const RECENT_KEY = 'rb_recent_searches';

export const MAX_RECENT = 5;

export const classes = className || 'h-4 w-4';

export const classes = className || 'h-4 w-4';

export const { t } = useTranslation();

export const { setActiveModule } = useAppStore();

export const stored = localStorage.getItem(RECENT_KEY);

export const updated = [term.trim(), ...prev.filter((s) => s !== term.trim())].slice(0, MAX_RECENT);

export const updated = prev.filter((s) => s !== term);

export const res = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery.trim())}&type=${activeFilter}`
      );

export const data = await res.json();

export const groups: SearchGroup[] = []

export const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }

export const filters = [
    { key: 'all', label: t('common.all') },
    { key: 'partners', label: t('sidebar.partners') },
    { key: 'products', label: t('warehouse.products') },
    { key: 'invoices', label: t('sidebar.invoices') },
    { key: 'contacts', label: t('crm.contacts') },
    { key: 'employees', label: t('sidebar.employees') },
  ]

export const currentIndex = globalIdx++;

export const isSelected = currentIndex === selectedIndex;
