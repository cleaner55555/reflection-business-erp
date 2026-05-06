export const STAGES = [
  "lead",
  "kvalifikacija",
  "predlog",
  "pregovaranje",
  "won",
  "lost",
] as const;

export const STAGE_LABELS: Record<string, string> = {
  lead: "Lead",
  kvalifikacija: "Kvalifikacija",
  predlog: "Predlog",
  pregovaranje: "Pregovaranje",
  won: "Dobijeno",
  lost: "Izgubljeno",
};

export const STAGE_COLORS: Record<string, string> = {
  lead: "bg-slate-100 border-slate-300",
  kvalifikacija: "bg-blue-50 border-blue-300",
  predlog: "bg-amber-50 border-amber-300",
  pregovaranje: "bg-orange-50 border-orange-300",
  won: "bg-emerald-50 border-emerald-300",
  lost: "bg-red-50 border-red-300",
};

export const STAGE_DOT: Record<string, string> = {
  lead: "bg-slate-400",
  kvalifikacija: "bg-blue-400",
  predlog: "bg-amber-400",
  pregovaranje: "bg-orange-400",
  won: "bg-emerald-500",
  lost: "bg-red-400",
};

export const STAGE_BADGE: Record<string, string> = {
  lead: "bg-slate-100 text-slate-700",
  kvalifikacija: "bg-blue-100 text-blue-700",
  predlog: "bg-amber-100 text-amber-700",
  pregovaranje: "bg-orange-100 text-orange-700",
  won: "bg-emerald-100 text-emerald-700",
  lost: "bg-red-100 text-red-700",
};

export const SOURCE_LABELS: Record<string, string> = {
  manual: "Manuelno",
  web: "Web sajt",
  referral: "Preporuka",
  cold_call: "Hladni poziv",
  email: "Email kampanja",
  social: "Društvene mreže",
  trade_show: "Sajam",
  advertising: "Reklama",
  other: "Ostalo",
};

export const SOURCE_ICONS: Record<string, string> = {
  manual: "✍️",
  web: "🌐",
  referral: "🤝",
  cold_call: "📞",
  email: "✉️",
  social: "📱",
  trade_show: "🎪",
  advertising: "📢",
  other: "❓",
};

export const ACTIVITY_TYPES: Record<string, { icon: string; label: string }> = {
  poziv: { icon: "📞", label: "Poziv" },
  sastanak: { icon: "🤝", label: "Sastanak" },
  email: { icon: "✉️", label: "Email" },
  task: { icon: "✅", label: "Zadatak" },
  napomena: { icon: "📝", label: "Napomena" },
  demo: { icon: "🖥️", label: "Demo" },
  predlog: { icon: "📋", label: "Predlog" },
  follow_up: { icon: "🔄", label: "Follow-up" },
};

export const now = new Date();
now.setHours(0, 0, 0, 0);

export const target = new Date(date);
target.setHours(0, 0, 0, 0);

export const colors = [
  "bg-primary/10 text-primary",
  "bg-emerald-500/10 text-emerald-600",
  "bg-amber-500/10 text-amber-600",
  "bg-rose-500/10 text-rose-600",
  "bg-sky-500/10 text-sky-600",
  "bg-violet-500/10 text-violet-600",
];
