// ProcurementManager module – static data, mock data & pure helpers

export const PR_STATUS_CONFIG: Record<
  string,
  { label: string; color: string }
> = {
  draft: {
    label: "Nacrt",
    color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
  },
  submitted: {
    label: "Podnet",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  approved: {
    label: "Odobren",
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  ordered: {
    label: "Naručeno",
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  received: {
    label: "Primljeno",
    color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  },
  rejected: {
    label: "Odbijeno",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  cancelled: {
    label: "Otkazano",
    color: "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  },
};

export const PR_PRIORITY_CONFIG: Record<
  string,
  { label: string; color: string }
> = {
  low: {
    label: "Nizak",
    color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  },
  medium: {
    label: "Srednji",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  high: {
    label: "Visok",
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
  urgent: {
    label: "Hitan",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

export const SUPPLIER_STATUS_CONFIG: Record<
  string,
  { label: string; color: string }
> = {
  active: {
    label: "Aktivan",
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  inactive: {
    label: "Neaktivan",
    color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  },
  blocked: {
    label: "Blokiran",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

// ---- Pure helpers ----

export function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M RSD`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K RSD`;
  return `${amount} RSD`;
}

export function getPerformanceColor(score: number): string {
  if (score >= 90) return "text-green-600";
  if (score >= 75) return "text-amber-600";
  return "text-red-600";
}

export function getPerformanceBg(score: number): string {
  if (score >= 90) return "bg-green-500";
  if (score >= 75) return "bg-amber-500";
  return "bg-red-500";
}
