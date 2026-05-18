// PermissionsEditor module – static data & configuration maps
import { menuGroups } from '@/lib/menuGroupsData'

export const MODULE_LABELS: Record<string, { label: string; icon: string }> = {
  dashboard: { label: "Dashboard", icon: "📊" },
  finansije: { label: "Finansije", icon: "💰" },
  fakture: { label: "Fakture", icon: "📄" },
  magacin: { label: "Magacin", icon: "🏭" },
  partneri: { label: "Partneri", icon: "🤝" },
  nabavka: { label: "Nabavka", icon: "🛒" },
  crm: { label: "CRM", icon: "❤️" },
  kalendar: { label: "Kalendar", icon: "📅" },
  zaposleni: { label: "Zaposleni", icon: "👥" },
  projekti: { label: "Projekti", icon: "📁" },
  sredstva: { label: "Sredstva", icon: "🏗️" },
  dokumenta: { label: "Dokumenta", icon: "📂" },
  knjigovodstvo: { label: "Knjigovodstvo", icon: "📒" },
  protokol: { label: "Protokol", icon: "📬" },
  edukacija: { label: "Edukacija", icon: "🎓" },
  "vozni-park": { label: "Vozni park", icon: "🚗" },
  "kafe-restoran": { label: "Kafe restoran", icon: "☕" },
  "email-marketing": { label: "Email Marketing", icon: "✉️" },
  "rent-a-car": { label: "Rent a car", icon: "🚙" },
  izvestaji: { label: "Izveštaji", icon: "📈" },
  podesavanja: { label: "Podešavanja", icon: "⚙️" },
  integracije: { label: "Integracije", icon: "🔌" },
  "bank-sync": { label: "Bank Sync", icon: "🏦" },
  notifications: { label: "Notifikacije", icon: "🔔" },
  zakoni: { label: "Zakoni", icon: "⚖️" },
};

export const ACTIONS = ["read", "create", "write", "delete"] as const;

export const ACTION_LABELS: Record<string, string> = {
  read: "Čitanje",
  create: "Kreiranje",
  write: "Izmena",
  delete: "Brisanje",
};

const SIDEBAR_GROUP_LABELS: Record<string, string> = {
  'sidebar.group_overview': 'Pregled',
  'sidebar.group_business': 'Poslovanje',
  'sidebar.group_crm': 'CRM & Partneri',
  'sidebar.group_organization': 'Organizacija',
  'sidebar.group_education': 'Edukacija',
  'sidebar.group_healthcare': 'Zdravstvo',
  'sidebar.group_hospitality': 'Ugostiteljstvo',
  'sidebar.group_construction': 'Građevina',
  'sidebar.group_logistics': 'Logistika',
  'sidebar.group_realestate': 'Nekretnine',
  'sidebar.group_production': 'Proizvodnja',
  'sidebar.group_retail': 'Trgovina',
  'sidebar.group_services': 'Servisi',
  'sidebar.group_analytics': 'Analitika',
  'sidebar.group_system': 'Sistem',
}

const SIDEBAR_GROUP_ICONS: Record<string, string> = {
  'sidebar.group_overview': '📊',
  'sidebar.group_business': '💰',
  'sidebar.group_crm': '❤️',
  'sidebar.group_organization': '🏢',
  'sidebar.group_education': '🎓',
  'sidebar.group_healthcare': '🏥',
  'sidebar.group_hospitality': '🍽️',
  'sidebar.group_construction': '🏗️',
  'sidebar.group_logistics': '🚚',
  'sidebar.group_realestate': '🏠',
  'sidebar.group_production': '⚙️',
  'sidebar.group_retail': '🛍️',
  'sidebar.group_services': '🔧',
  'sidebar.group_analytics': '📈',
  'sidebar.group_system': '⚙️',
}

export const MODULE_GROUPS: Array<{
  label: string;
  icon: string;
  modules: string[];
}> = menuGroups.map((group) => ({
  label: SIDEBAR_GROUP_LABELS[group.labelKey] || group.labelKey.replace('sidebar.group_', ''),
  icon: SIDEBAR_GROUP_ICONS[group.labelKey] || '📦',
  modules: group.items.map((item) => item.module),
}))

export const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-700 border-red-200",
  knjigovodac: "bg-sky-100 text-sky-700 border-sky-200",
  prodavac: "bg-emerald-100 text-emerald-700 border-emerald-200",
  magacioner: "bg-amber-100 text-amber-700 border-amber-200",
  hr: "bg-violet-100 text-violet-700 border-violet-200",
  read_only: "bg-slate-100 text-slate-600 border-slate-200",
};

// ---- Pure helpers ----

export function getRoleColor(name: string): string {
  return ROLE_COLORS[name] || "bg-slate-100 text-slate-600 border-slate-200";
}
