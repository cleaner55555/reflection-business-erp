export const now = new Date();

export const next = new Date(nextDate);

export const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

export const nextDay = new Date(
  next.getFullYear(),
  next.getMonth(),
  next.getDate(),
);

export const configs: Record<
  string,
  { label: string; color: string; icon: typeof CheckCircle2; dotClass: string }
> = {
  active: {
    label: t("recurring.active"),
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
    dotClass: "bg-emerald-500",
  },
  dueToday: {
    label: t("recurring.dueToday"),
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: AlertTriangle,
    dotClass: "bg-amber-500",
  },
  overdue: {
    label: t("recurring.overdue"),
    color: "bg-red-50 text-red-700 border-red-200",
    icon: AlertTriangle,
    dotClass: "bg-red-500",
  },
  paused: {
    label: t("recurring.paused"),
    color: "bg-slate-50 text-slate-500 border-slate-200",
    icon: Pause,
    dotClass: "bg-slate-400",
  },
};

export const labels: Record<string, string> = {
  weekly: t("recurring.weekly"),
  monthly: t("recurring.monthly"),
  quarterly: t("recurring.quarterly"),
  yearly: t("recurring.yearly"),
};

export const subtotal = item.quantity * item.unitPrice;

export const discount = subtotal * (item.discountPct / 100);

export const base = subtotal - discount;

export const tax = base * (item.taxRate / 100);

export const now = new Date();

export const target = new Date(dateStr);

export const diff = target.getTime() - now.getTime();
