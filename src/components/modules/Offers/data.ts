// Offers module – static data & configuration constants

export const STATUS_CONFIG: Record<
  string,
  { labelKey: string; color: string }
> = {
  draft: {
    labelKey: "offers.statusDraft",
    color: "bg-slate-100 text-slate-700 border-slate-200",
  },
  sent: {
    labelKey: "offers.statusSent",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  confirmed: {
    labelKey: "offers.statusAccepted",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  rejected: {
    labelKey: "offers.statusRejected",
    color: "bg-red-50 text-red-700 border-red-200",
  },
  cancelled: {
    labelKey: "offers.statusCancelled",
    color: "bg-red-50 text-red-700 border-red-200",
  },
};

export const PAYMENT_TERMS_OPTIONS = [
  { value: "cod", label: "offers.paymentCOD" },
  { value: "15days", label: "offers.payment15Days" },
  { value: "30days", label: "offers.payment30Days" },
  { value: "60days", label: "offers.payment60Days" },
  { value: "advance", label: "offers.paymentAdvance" },
];

export const PRICE_LIST_TYPES = [
  { value: "standard", label: "offers.priceListStandard" },
  { value: "wholesale", label: "offers.priceListWholesale" },
  { value: "retail", label: "offers.priceListRetail" },
  { value: "promo", label: "offers.priceListPromo" },
  { value: "custom", label: "offers.priceListCustom" },
];

export const FUNNEL_COLORS = ["#94a3b8", "#f59e0b", "#10b981", "#ef4444"];

export const PIE_COLORS = [
  "#94a3b8",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
];

export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Maj",
  "Jun",
  "Jul",
  "Avg",
  "Sep",
  "Okt",
  "Nov",
  "Dec",
];
