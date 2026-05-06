export const STATUS_OPTIONS = [
  {
    value: "aktivan",
    label: "Aktivan",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  {
    value: "zavrsen",
    label: "Završen",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  {
    value: "pauziran",
    label: "Pauziran",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  {
    value: "otkazan",
    label: "Otkazan",
    color: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
] as const;

export const PRIORITY_OPTIONS = [
  {
    value: "nizak",
    label: "Nizak",
    color: "text-slate-500",
    dot: "bg-slate-400",
  },
  {
    value: "srednji",
    label: "Srednji",
    color: "text-amber-600",
    dot: "bg-amber-500",
  },
  {
    value: "visok",
    label: "Visok",
    color: "text-orange-600",
    dot: "bg-orange-500",
  },
  { value: "hitan", label: "Hitan", color: "text-red-600", dot: "bg-red-500" },
] as const;

export const TASK_STATUS_OPTIONS = [
  {
    value: "todo",
    label: "Za uraditi",
    color: "bg-slate-100 text-slate-700 border-slate-200",
    icon: Square,
    colBg: "bg-slate-50",
  },
  {
    value: "u_toku",
    label: "U toku",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Play,
    colBg: "bg-blue-50/50",
  },
  {
    value: "zavrseno",
    label: "Završeno",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
    colBg: "bg-emerald-50/50",
  },
  {
    value: "blokirano",
    label: "Blokirano",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: Pause,
    colBg: "bg-red-50/50",
  },
] as const;

export const PROJECT_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#6366f1",
  "#a855f7",
];
