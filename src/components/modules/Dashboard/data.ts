export const PIE_COLORS = ['#059669', '#0891b2', '#7c3aed', '#ea580c', '#db2777']

export const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

export const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export const quickActions = [
  { labelKey: 'dashboard.newInvoice', icon: FilePlus2, module: 'fakture' as ModuleType, color: 'text-emerald-700', bg: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200', iconBg: 'bg-emerald-100' },
  { labelKey: 'dashboard.newPartner', icon: UserPlus, module: 'partneri' as ModuleType, color: 'text-violet-700', bg: 'bg-violet-50 hover:bg-violet-100 border-violet-200', iconBg: 'bg-violet-100' },
  { labelKey: 'dashboard.cashEntry', icon: Wallet, module: 'finansije' as ModuleType, color: 'text-amber-700', bg: 'bg-amber-50 hover:bg-amber-100 border-amber-200', iconBg: 'bg-amber-100' },
  { labelKey: 'dashboard.newOrder', icon: ShoppingCart, module: 'nabavka' as ModuleType, color: 'text-cyan-700', bg: 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200', iconBg: 'bg-cyan-100' },
  { labelKey: 'dashboard.newProduct', icon: PackagePlus, module: 'magacin' as ModuleType, color: 'text-rose-700', bg: 'bg-rose-50 hover:bg-rose-100 border-rose-200', iconBg: 'bg-rose-100' },
]

export const { t } = useTranslation();

export const { tc, translateTexts } = useContentTranslation();

export const { setActiveModule } = useAppStore();

export const texts: string[] = []

export const items: ActivityItem[] = []

export const now = new Date();

export const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

export const yesterdayStart = new Date(todayStart.getTime() - 86400000);

export const groups: { label: string; items: ActivityItem[] }[] = [
      { label: t('dashboard.today'), items: [] },
      { label: t('dashboard.yesterday'), items: [] },
      { label: t('dashboard.earlier'), items: [] },
    ]

export const { kpis, recentInvoices, monthlyRevenueChart, expensesByCategory } = data;

export const kpiCards = [
    {
      title: t('dashboard.totalRevenue'),
      value: formatRSD(kpis.totalRevenue),
      change: kpis.revenueGrowth,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      iconBg: 'bg-emerald-100',
    },
    {
      title: t('dashboard.totalExpenses'),
      value: formatRSD(kpis.totalExpenses),
      change: null,
      icon: TrendingDown,
      color: 'text-red-600',
      bg: 'bg-red-50',
      iconBg: 'bg-red-100',
    },
    {
      title: t('dashboard.netProfit'),
      value: formatRSD(kpis.netProfit),
      change: null,
      icon: DollarSign,
      color: kpis.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600',
      bg: kpis.netProfit >= 0 ? 'bg-emerald-50' : 'bg-red-50',
      iconBg: kpis.netProfit >= 0 ? 'bg-emerald-100' : 'bg-red-100',
    },
    {
      title: t('dashboard.unpaidInvoices'),
      value: formatRSD(kpis.unpaidInvoiceAmount),
      subtitle: `${kpis.unpaidInvoiceCount} faktura`,
      change: null,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-100',
    },
    {
      title: t('dashboard.cashBalance'),
      value: formatRSD(kpis.cashBalance),
      change: null,
      icon: Banknote,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      iconBg: 'bg-teal-100',
    },
    {
      title: t('dashboard.totalProducts'),
      value: String(kpis.productCount),
      change: null,
      icon: BoxIcon,
      color: 'text-slate-600',
      bg: 'bg-slate-50',
      iconBg: 'bg-slate-100',
    },
    {
      title: t('dashboard.totalPartners'),
      value: String(kpis.partnerCount),
      change: null,
      icon: Users,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      iconBg: 'bg-violet-100',
    },
  ]

export const pieData = expensesByCategory.map((item) => ({
    name: getStatusLabel(item.category),
    value: item.amount,
  }));

export const overdueAndDueToday = data.overdueCount + data.todayDueInvoices.length;

export const trItem = activity as ActivityItem & { type: string }
